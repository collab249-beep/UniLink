import { db } from "@workspace/db";
import { adminSessions } from "@workspace/db/schema";
import { and, eq, gt } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export interface AdminRequest extends Request {
  adminEmail?: string;
}

export async function requireAdmin(
  req: AdminRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Administrator authentication required" });
    return;
  }

  const token = authHeader.slice(7);
  const [session] = await db
    .select()
    .from(adminSessions)
    .where(
      and(
        eq(adminSessions.token, token),
        gt(adminSessions.createdAt, new Date(Date.now() - 8 * 60 * 60 * 1000)),
      ),
    )
    .limit(1);

  if (!session) {
    res.status(401).json({ error: "Invalid administrator session" });
    return;
  }

  db.update(adminSessions)
    .set({ lastUsedAt: new Date() })
    .where(eq(adminSessions.id, session.id))
    .catch(() => {});

  req.adminEmail = session.email;
  next();
}