import { db } from "@workspace/db";
import { authTokens, userBlocks, userReports, users } from "@workspace/db/schema";
import { and, eq } from "drizzle-orm";
import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import {
  deleteFirebaseAuthUser,
  deleteFirebaseUserData,
  verifyFirebaseIdToken,
} from "../lib/firebaseAdmin.js";

const router = Router();

function makeReferralCode(firstName: string): string {
  const base = firstName.slice(0, 4).toUpperCase().padEnd(4, "X");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${base}${rand}`;
}

function sanitizeUser(user: typeof users.$inferSelect) {
  const { ...safe } = user;
  return safe;
}

async function createAppSession(
  email: string,
  preferredFirstName?: string,
) {
  const normalizedEmail = email.trim().toLowerCase();
  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user) {
    const emailName = normalizedEmail.split("@")[0] || "Student";
    const firstName = preferredFirstName?.trim() || emailName;
    [user] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        firstName,
        email: normalizedEmail,
        referralCode: makeReferralCode(firstName),
      })
      .returning();
  }

  const tokenValue = crypto.randomUUID();
  await db.insert(authTokens).values({
    id: crypto.randomUUID(),
    userId: user.id,
    token: tokenValue,
  });

  return { token: tokenValue, user };
}

// POST /api/auth/signin  { email }
router.post("/signin", async (req, res) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email) {
      res.status(400).json({ error: "email is required" });
      return;
    }

    let [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      // Auto-create on first sign-in (demo flow — no password)
      const firstName = email.split("@")[0] ?? "Student";
      const newId = crypto.randomUUID();
      [user] = await db
        .insert(users)
        .values({
          id: newId,
          firstName,
          email,
          referralCode: makeReferralCode(firstName),
        })
        .returning();
    }

    const tokenValue = crypto.randomUUID();
    await db.insert(authTokens).values({
      id: crypto.randomUUID(),
      userId: user.id,
      token: tokenValue,
    });

    res.json({ token: tokenValue, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Sign-in failed" });
  }
});

// POST /api/auth/firebase  { idToken, firstName? }
router.post("/firebase", async (req, res) => {
  try {
    const { idToken, firstName } = req.body as {
      idToken?: string;
      firstName?: string;
    };

    if (!idToken) {
      res.status(400).json({ error: "idToken is required" });
      return;
    }

    let decoded: Awaited<ReturnType<typeof verifyFirebaseIdToken>>;
    try {
      decoded = await verifyFirebaseIdToken(idToken, true);
    } catch {
      res.status(401).json({ error: "Please sign in with Apple again" });
      return;
    }
    if (!decoded.email || decoded.email_verified !== true) {
      res.status(401).json({ error: "Firebase account email is not verified" });
      return;
    }

    const session = await createAppSession(decoded.email, firstName);
    res.json({ token: session.token, user: sanitizeUser(session.user) });
  } catch (error) {
    const message =
      error instanceof Error &&
      error.message.startsWith("FIREBASE_SERVICE_ACCOUNT_JSON")
        ? error.message
        : "Firebase authentication failed";
    res.status(message.includes("not configured") ? 503 : 401).json({ error: message });
  }
});

// POST /api/auth/signup  { firstName, email }
router.post("/signup", async (req, res) => {
  try {
    const { firstName, email } = req.body as {
      firstName?: string;
      email?: string;
    };
    if (!firstName || !email) {
      res.status(400).json({ error: "firstName and email are required" });
      return;
    }

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    if (existing.length) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const [user] = await db
      .insert(users)
      .values({
        id: crypto.randomUUID(),
        firstName,
        email,
        referralCode: makeReferralCode(firstName),
      })
      .returning();

    const tokenValue = crypto.randomUUID();
    await db.insert(authTokens).values({
      id: crypto.randomUUID(),
      userId: user.id,
      token: tokenValue,
    });

    res.status(201).json({ token: tokenValue, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: "Sign-up failed" });
  }
});

// POST /api/auth/signout
router.post("/signout", requireAuth, async (req: AuthRequest, res) => {
  try {
    const authHeader = req.headers.authorization!;
    const token = authHeader.slice(7);
    await db.delete(authTokens).where(eq(authTokens.token, token));
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Sign-out failed" });
  }
});

// DELETE /api/auth/account  { idToken }
router.delete("/account", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { idToken } = req.body as { idToken?: string };
    if (!idToken) {
      res.status(400).json({ error: "A fresh Firebase ID token is required" });
      return;
    }

    let decoded: Awaited<ReturnType<typeof verifyFirebaseIdToken>>;
    try {
      decoded = await verifyFirebaseIdToken(idToken, true);
    } catch {
      res.status(401).json({ error: "Please sign in with Apple again" });
      return;
    }
    const firebaseEmail = decoded.email?.trim().toLowerCase();
    const currentEmail = req.user!.email.trim().toLowerCase();
    const authAgeSeconds = Math.floor(Date.now() / 1000) - decoded.auth_time;
    const provider = decoded.firebase?.sign_in_provider;

    if (
      provider !== "apple.com" ||
      authAgeSeconds < 0 ||
      authAgeSeconds > 5 * 60
    ) {
      res.status(401).json({ error: "A recent Apple sign-in is required" });
      return;
    }

    if (!firebaseEmail || decoded.email_verified !== true) {
      res.status(401).json({ error: "Firebase account email is not verified" });
      return;
    }

    if (firebaseEmail !== currentEmail) {
      res.status(403).json({ error: "Firebase account does not match the current UniLink account" });
      return;
    }

    // Firestore user data is scoped beneath users/{firebaseUid}.
    await deleteFirebaseUserData(decoded.uid);

    // Existing foreign keys cascade through tokens, sessions, chat, preferences,
    // blocks, reports, and other UniLink records tied to this user.
    await db.delete(users).where(eq(users.id, req.user!.id));

    // Delete Firebase Auth last so a partial failure remains recoverable by
    // signing in again and retrying the deletion.
    await deleteFirebaseAuthUser(decoded.uid);

    res.json({ success: true });
  } catch {
    res.status(500).json({
      error:
        "Account deletion could not be completed. Please sign in again and retry.",
    });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, (req: AuthRequest, res) => {
  res.json({ user: sanitizeUser(req.user!) });
});

// PUT /api/auth/profile
router.put("/profile", requireAuth, async (req: AuthRequest, res) => {
  try {
    const allowed = [
      "firstName",
      "profilePicture",
      "bio",
      "interests",
      "year",
      "course",
      "isProfileComplete",
    ] as const;

    const updates: Partial<typeof users.$inferInsert> = {};
    for (const key of allowed) {
      if (key in req.body) {
        (updates as Record<string, unknown>)[key] = req.body[key];
      }
    }

    if (!Object.keys(updates).length) {
      res.status(400).json({ error: "No valid fields to update" });
      return;
    }

    const [updated] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, req.user!.id))
      .returning();

    res.json({ user: sanitizeUser(updated) });
  } catch {
    res.status(500).json({ error: "Profile update failed" });
  }
});

// POST /api/auth/verify  { universityEmail }
router.post("/verify", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { universityEmail } = req.body as { universityEmail?: string };
    if (!universityEmail) {
      res.status(400).json({ error: "universityEmail is required" });
      return;
    }

    const uonDomains = ["nottingham.ac.uk", "student.nottingham.ac.uk"];
    const ntuDomains = ["ntu.ac.uk", "my.ntu.ac.uk"];
    const genericAcademic = /\.ac\.uk$|\.edu$/;

    let universityId = "";
    let university = "";

    if (uonDomains.some((d) => universityEmail.endsWith(d))) {
      universityId = "uon";
      university = "University of Nottingham";
    } else if (ntuDomains.some((d) => universityEmail.endsWith(d))) {
      universityId = "ntu";
      university = "Nottingham Trent University";
    } else if (genericAcademic.test(universityEmail)) {
      const parts = universityEmail.split("@")[1]?.split(".") ?? [];
      universityId = parts[0] ?? "unknown";
      university = universityEmail.split("@")[1] ?? "University";
    } else {
      res.status(400).json({ error: "Not a recognised university email" });
      return;
    }

    const [updated] = await db
      .update(users)
      .set({ universityEmail, universityId, university, isVerified: true })
      .where(eq(users.id, req.user!.id))
      .returning();

    res.json({ user: sanitizeUser(updated) });
  } catch {
    res.status(500).json({ error: "Verification failed" });
  }
});

// POST /api/auth/block  { targetUserId }
router.post("/block", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { targetUserId } = req.body as { targetUserId?: string };
    if (!targetUserId) {
      res.status(400).json({ error: "targetUserId is required" });
      return;
    }
    await db
      .insert(userBlocks)
      .values({ blockerId: req.user!.id, blockedId: targetUserId })
      .onConflictDoNothing();
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Block failed" });
  }
});

// POST /api/auth/report  { targetUserId, reason? }
router.post("/report", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { targetUserId, reason } = req.body as {
      targetUserId?: string;
      reason?: string;
    };
    if (!targetUserId) {
      res.status(400).json({ error: "targetUserId is required" });
      return;
    }
    await db.insert(userReports).values({
      id: crypto.randomUUID(),
      reporterId: req.user!.id,
      reportedId: targetUserId,
      reason: reason ?? null,
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Report failed" });
  }
});

export default router;
