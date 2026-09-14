import { db } from "@workspace/db";
import {
  adminSessions,
  authTokens,
  chatMessages,
  liveActivity,
  notificationPrefs,
  sessionParticipants,
  userBlocks,
  userReports,
  users,
} from "@workspace/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { Router } from "express";
import {
  requireAdmin,
  type AdminRequest,
} from "../middleware/adminAuth.js";
import {
  deleteFirebaseAuthUser,
  deleteFirebaseUserData,
  ensureFirebaseAuthUser,
  verifyFirebaseIdToken,
} from "../lib/firebaseAdmin.js";

const router = Router();
const ADMIN_EMAILS = new Set(["hello@unilink.network"]);

router.post("/bootstrap", async (req, res) => {
  const email =
    typeof req.body?.email === "string"
      ? req.body.email.trim().toLowerCase()
      : "";
  if (!ADMIN_EMAILS.has(email)) {
    res.status(403).json({ error: "This account is not a UniLink administrator" });
    return;
  }

  try {
    await ensureFirebaseAuthUser(email);
    res.json({ success: true });
  } catch {
    res.status(503).json({ error: "Administrator account setup is unavailable" });
  }
});

router.post("/session", async (req, res) => {
  const { idToken } = req.body as { idToken?: string };
  if (!idToken) {
    res.status(400).json({ error: "Firebase ID token is required" });
    return;
  }

  try {
    const decoded = await verifyFirebaseIdToken(idToken, true);
    const email = decoded.email?.trim().toLowerCase();
    if (
      !email ||
      decoded.email_verified !== true ||
      !ADMIN_EMAILS.has(email)
    ) {
      res.status(403).json({ error: "This account is not a UniLink administrator" });
      return;
    }

    const token = crypto.randomUUID();
    await db.insert(adminSessions).values({
      id: crypto.randomUUID(),
      email,
      token,
    });
    res.json({ token, admin: { email } });
  } catch {
    res.status(401).json({ error: "Administrator sign-in failed" });
  }
});

router.get("/summary", requireAdmin, async (_req, res) => {
  const [counts] = await db
    .select({
      pendingReports: sql<number>`count(*) filter (where ${userReports.status} = 'pending')::int`,
      reportsToday: sql<number>`count(*) filter (where ${userReports.createdAt} >= current_date)::int`,
      actionedReports: sql<number>`count(*) filter (where ${userReports.status} = 'actioned')::int`,
    })
    .from(userReports);
  const [removed] = await db
    .select({
      removedUsers: sql<number>`count(*) filter (where ${users.moderationStatus} = 'removed')::int`,
    })
    .from(users);

  res.json({ ...counts, ...removed });
});

router.get("/reports", requireAdmin, async (req, res) => {
  const status = typeof req.query.status === "string" ? req.query.status : null;
  const allowed = ["pending", "reviewed", "dismissed", "actioned"];
  if (status && !allowed.includes(status)) {
    res.status(400).json({ error: "Invalid report status" });
    return;
  }

  const result = await db.execute(sql`
    SELECT
      r.id, r.category, r.reason AS details, r.status,
      r.admin_note AS "adminNote", r.created_at AS "createdAt",
      r.reviewed_at AS "reviewedAt", r.reviewed_by AS "reviewedBy",
      json_build_object(
        'id', reporter.id, 'firstName', reporter.first_name,
        'email', reporter.email, 'university', reporter.university,
        'profilePicture', reporter.profile_picture,
        'moderationStatus', reporter.moderation_status
      ) AS reporter,
      json_build_object(
        'id', reported.id, 'firstName', reported.first_name,
        'email', reported.email, 'university', reported.university,
        'profilePicture', reported.profile_picture,
        'moderationStatus', reported.moderation_status
      ) AS reported
    FROM user_reports r
    JOIN users reporter ON reporter.id = r.reporter_id
    JOIN users reported ON reported.id = r.reported_id
    WHERE (${status}::text IS NULL OR r.status = ${status})
    ORDER BY CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END, r.created_at DESC
  `);

  res.json(result.rows);
});

router.patch("/reports/:reportId", requireAdmin, async (req: AdminRequest, res) => {
  const reportId = String(req.params.reportId);
  const { status, adminNote } = req.body as {
    status?: string;
    adminNote?: string;
  };
  if (!status || !["reviewed", "dismissed", "actioned"].includes(status)) {
    res.status(400).json({ error: "A valid resolution status is required" });
    return;
  }

  const [updated] = await db
    .update(userReports)
    .set({
      status,
      adminNote: adminNote?.trim() || null,
      reviewedAt: new Date(),
      reviewedBy: req.adminEmail!,
    })
    .where(eq(userReports.id, reportId))
    .returning();
  if (!updated) {
    res.status(404).json({ error: "Report not found" });
    return;
  }

  const result = await db.execute(sql`
    SELECT
      r.id, r.category, r.reason AS details, r.status,
      r.admin_note AS "adminNote", r.created_at AS "createdAt",
      r.reviewed_at AS "reviewedAt", r.reviewed_by AS "reviewedBy",
      json_build_object('id', reporter.id, 'firstName', reporter.first_name, 'email', reporter.email, 'university', reporter.university, 'profilePicture', reporter.profile_picture, 'moderationStatus', reporter.moderation_status) AS reporter,
      json_build_object('id', reported.id, 'firstName', reported.first_name, 'email', reported.email, 'university', reported.university, 'profilePicture', reported.profile_picture, 'moderationStatus', reported.moderation_status) AS reported
    FROM user_reports r
    JOIN users reporter ON reporter.id = r.reporter_id
    JOIN users reported ON reported.id = r.reported_id
    WHERE r.id = ${updated.id}
  `);
  res.json(result.rows[0]);
});

router.post("/users/:userId/remove", requireAdmin, async (req: AdminRequest, res) => {
  const userId = String(req.params.userId);
  const reason = typeof req.body.reason === "string" ? req.body.reason.trim() : "";
  const reportId = typeof req.body.reportId === "string" ? req.body.reportId : null;
  if (reason.length < 3) {
    res.status(400).json({ error: "A removal reason is required" });
    return;
  }

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  if (ADMIN_EMAILS.has(user.email.toLowerCase())) {
    res.status(403).json({ error: "Administrator accounts cannot be removed here" });
    return;
  }

  if (user.firebaseUid) {
    await deleteFirebaseUserData(user.firebaseUid);
    await deleteFirebaseAuthUser(user.firebaseUid);
  }

  await db.transaction(async (tx) => {
    await tx.delete(authTokens).where(eq(authTokens.userId, user.id));
    await tx.delete(liveActivity).where(eq(liveActivity.userId, user.id));
    await tx.delete(sessionParticipants).where(eq(sessionParticipants.userId, user.id));
    await tx.delete(chatMessages).where(eq(chatMessages.senderId, user.id));
    await tx.delete(notificationPrefs).where(eq(notificationPrefs.userId, user.id));
    await tx
      .delete(userBlocks)
      .where(
        sql`${userBlocks.blockerId} = ${user.id} OR ${userBlocks.blockedId} = ${user.id}`,
      );
    await tx
      .update(users)
      .set({
        firstName: "Removed User",
        universityEmail: null,
        universityId: null,
        university: null,
        profilePicture: null,
        bio: null,
        interests: [],
        year: null,
        course: null,
        moderationStatus: "removed",
        moderationReason: reason,
        moderatedAt: new Date(),
        moderatedBy: req.adminEmail!,
      })
      .where(eq(users.id, user.id));
    if (reportId) {
      await tx
        .update(userReports)
        .set({
          status: "actioned",
          adminNote: reason,
          reviewedAt: new Date(),
          reviewedBy: req.adminEmail!,
        })
        .where(
          and(
            eq(userReports.id, reportId),
            eq(userReports.reportedId, user.id),
          ),
        );
    }
  });

  res.json({ success: true, userId: user.id });
});

export default router;