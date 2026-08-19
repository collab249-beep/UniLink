import { db } from "@workspace/db";
import { notificationPrefs } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

const DEFAULTS = {
  groupActivity: true,
  eventReminders: true,
  freeExpiry: true,
  nearbyStudents: false,
};

// GET /api/notifications/prefs
router.get("/prefs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [prefs] = await db
      .select()
      .from(notificationPrefs)
      .where(eq(notificationPrefs.userId, req.user!.id))
      .limit(1);

    res.json({ prefs: prefs ?? { ...DEFAULTS, userId: req.user!.id } });
  } catch {
    res.status(500).json({ error: "Failed to fetch preferences" });
  }
});

// PUT /api/notifications/prefs
router.put("/prefs", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { groupActivity, eventReminders, freeExpiry, nearbyStudents } =
      req.body as Partial<typeof DEFAULTS>;

    const updates: Partial<typeof notificationPrefs.$inferInsert> = {};
    if (groupActivity !== undefined) updates.groupActivity = groupActivity;
    if (eventReminders !== undefined) updates.eventReminders = eventReminders;
    if (freeExpiry !== undefined) updates.freeExpiry = freeExpiry;
    if (nearbyStudents !== undefined) updates.nearbyStudents = nearbyStudents;

    const [prefs] = await db
      .insert(notificationPrefs)
      .values({ userId: req.user!.id, ...DEFAULTS, ...updates })
      .onConflictDoUpdate({
        target: notificationPrefs.userId,
        set: { ...updates, updatedAt: new Date() },
      })
      .returning();

    res.json({ prefs });
  } catch {
    res.status(500).json({ error: "Failed to update preferences" });
  }
});

export default router;
