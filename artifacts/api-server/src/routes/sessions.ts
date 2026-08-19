import { db } from "@workspace/db";
import {
  meetupSessions,
  sessionParticipants,
  users,
} from "@workspace/db/schema";
import { and, eq, gt, isNull } from "drizzle-orm";
import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

// Campus → location mappings (mirrors mobile constants)
const CAMPUS_SPOTS: Record<string, Record<string, string>> = {
  uon: {
    study: "Portland Building Library",
    coffee: "Lakeside Arts Café",
    lunch: "The Dine at Portland",
    football: "University Park Sports Centre",
    gym: "David Ross Sports Village",
    gaming: "Computer Science Building",
    night_out: "Rock City",
    society: "Portland Building",
  },
  ntu: {
    study: "Boots Library",
    coffee: "The Pavilion Café",
    lunch: "The Hub",
    football: "Clifton Campus Sports Hall",
    gym: "NTU Sport",
    gaming: "Newton Building",
    night_out: "Stealth",
    society: "Newton Building",
  },
};

function getLocation(campusId: string, activity: string): string {
  return (
    CAMPUS_SPOTS[campusId]?.[activity] ??
    CAMPUS_SPOTS["uon"]?.[activity] ??
    "Campus Central"
  );
}

async function getActiveSession(userId: string) {
  const now = new Date();

  // Find sessions where the user is a participant and not expired/ended
  const rows = await db
    .select({
      session: meetupSessions,
      participant: sessionParticipants,
    })
    .from(sessionParticipants)
    .innerJoin(meetupSessions, eq(sessionParticipants.sessionId, meetupSessions.id))
    .where(
      and(
        eq(sessionParticipants.userId, userId),
        isNull(meetupSessions.endTime),
        gt(meetupSessions.expiresAt, now),
      ),
    )
    .limit(1);

  if (!rows.length) return null;

  const { session } = rows[0];

  // Load all participants
  const participants = await db
    .select({
      id: users.id,
      firstName: users.firstName,
      university: users.university,
      profilePicture: users.profilePicture,
      attendanceConfirmed: sessionParticipants.attendanceConfirmed,
    })
    .from(sessionParticipants)
    .innerJoin(users, eq(sessionParticipants.userId, users.id))
    .where(eq(sessionParticipants.sessionId, session.id));

  return {
    id: session.id,
    activity: session.activity,
    campus: session.campus,
    location: session.location,
    startTime: session.startTime.getTime(),
    meetDeadline: session.meetDeadline.getTime(),
    expiresAt: session.expiresAt.getTime(),
    attendanceConfirmed: rows[0].participant.attendanceConfirmed,
    participants,
  };
}

// GET /api/sessions/active
router.get("/active", requireAuth, async (req: AuthRequest, res) => {
  try {
    const session = await getActiveSession(req.user!.id);
    res.json({ session });
  } catch {
    res.status(500).json({ error: "Failed to fetch active session" });
  }
});

// POST /api/sessions  { activity, campusId }
router.post("/", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { activity, campusId } = req.body as {
      activity?: string;
      campusId?: string;
    };
    if (!activity || !campusId) {
      res.status(400).json({ error: "activity and campusId are required" });
      return;
    }

    // End any existing session for this user first
    const existing = await getActiveSession(req.user!.id);
    if (existing) {
      await db
        .update(meetupSessions)
        .set({ endTime: new Date() })
        .where(eq(meetupSessions.id, existing.id));
    }

    const now = new Date();
    const sessionId = crypto.randomUUID();
    const location = getLocation(campusId, activity);

    const [session] = await db
      .insert(meetupSessions)
      .values({
        id: sessionId,
        activity,
        campus: campusId,
        location,
        startTime: now,
        meetDeadline: new Date(now.getTime() + 30 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      })
      .returning();

    await db.insert(sessionParticipants).values({
      sessionId,
      userId: req.user!.id,
    });

    const result = await getActiveSession(req.user!.id);
    res.status(201).json({ session: result });
  } catch {
    res.status(500).json({ error: "Failed to create session" });
  }
});

// DELETE /api/sessions/active
router.delete("/active", requireAuth, async (req: AuthRequest, res) => {
  try {
    const session = await getActiveSession(req.user!.id);
    if (!session) {
      res.json({ success: true });
      return;
    }

    await db
      .update(meetupSessions)
      .set({ endTime: new Date() })
      .where(eq(meetupSessions.id, session.id));

    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to leave session" });
  }
});

// POST /api/sessions/active/confirm
router.post("/active/confirm", requireAuth, async (req: AuthRequest, res) => {
  try {
    const session = await getActiveSession(req.user!.id);
    if (!session) {
      res.status(404).json({ error: "No active session" });
      return;
    }

    await db
      .update(sessionParticipants)
      .set({ attendanceConfirmed: true })
      .where(
        and(
          eq(sessionParticipants.sessionId, session.id),
          eq(sessionParticipants.userId, req.user!.id),
        ),
      );

    const updated = await getActiveSession(req.user!.id);
    res.json({ session: updated });
  } catch {
    res.status(500).json({ error: "Failed to confirm attendance" });
  }
});

// GET /api/sessions/history
router.get("/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const rows = await db
      .select({
        session: meetupSessions,
        confirmed: sessionParticipants.attendanceConfirmed,
      })
      .from(sessionParticipants)
      .innerJoin(meetupSessions, eq(sessionParticipants.sessionId, meetupSessions.id))
      .where(
        and(
          eq(sessionParticipants.userId, req.user!.id),
          // ended sessions only
          gt(meetupSessions.endTime, new Date(0)),
        ),
      )
      .orderBy(meetupSessions.endTime);

    const history = await Promise.all(
      rows.slice(-50).map(async ({ session, confirmed }: { session: typeof meetupSessions.$inferSelect; confirmed: boolean }) => {
        const participants = await db
          .select({
            id: users.id,
            firstName: users.firstName,
            university: users.university,
            profilePicture: users.profilePicture,
          })
          .from(sessionParticipants)
          .innerJoin(users, eq(sessionParticipants.userId, users.id))
          .where(eq(sessionParticipants.sessionId, session.id));

        return {
          id: session.id,
          activity: session.activity,
          campus: session.campus,
          location: session.location,
          startTime: session.startTime.getTime(),
          endTime: session.endTime?.getTime() ?? Date.now(),
          attendanceConfirmed: confirmed,
          participants,
        };
      }),
    );

    res.json({ history });
  } catch {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

export default router;
