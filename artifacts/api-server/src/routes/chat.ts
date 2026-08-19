import { db } from "@workspace/db";
import { chatMessages, sessionParticipants } from "@workspace/db/schema";
import { and, asc, eq } from "drizzle-orm";
import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";

const router = Router();

async function assertParticipant(sessionId: string, userId: string) {
  const [row] = await db
    .select({ sessionId: sessionParticipants.sessionId })
    .from(sessionParticipants)
    .where(
      and(
        eq(sessionParticipants.sessionId, sessionId),
        eq(sessionParticipants.userId, userId),
      ),
    )
    .limit(1);
  return !!row;
}

// GET /api/chat/:sessionId
router.get("/:sessionId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const sessionId = req.params.sessionId as string;
    const isMember = await assertParticipant(sessionId, req.user!.id);
    if (!isMember) {
      res.status(403).json({ error: "Not a participant of this session" });
      return;
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.timestamp));

    res.json({
      messages: messages.map((m: typeof chatMessages.$inferSelect) => ({
        id: m.id,
        text: m.text,
        fromSelf: m.senderId === req.user!.id,
        senderId: m.senderId,
        timestamp: m.timestamp.getTime(),
        status: m.status,
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST /api/chat/:sessionId  { text }
router.post("/:sessionId", requireAuth, async (req: AuthRequest, res) => {
  try {
    const sessionId = req.params.sessionId as string;
    const { text } = req.body as { text?: string };

    if (!text?.trim()) {
      res.status(400).json({ error: "text is required" });
      return;
    }

    const isMember = await assertParticipant(sessionId, req.user!.id);
    if (!isMember) {
      res.status(403).json({ error: "Not a participant of this session" });
      return;
    }

    const [msg] = await db
      .insert(chatMessages)
      .values({
        id: crypto.randomUUID(),
        sessionId,
        senderId: req.user!.id,
        text: text.trim(),
        status: "delivered",
      })
      .returning();

    res.status(201).json({
      message: {
        id: msg.id,
        text: msg.text,
        fromSelf: true,
        senderId: msg.senderId,
        timestamp: msg.timestamp.getTime(),
        status: msg.status,
      },
    });
  } catch {
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
