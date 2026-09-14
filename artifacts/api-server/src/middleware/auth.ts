import { db } from "@workspace/db";
import { authTokens, users } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import type { NextFunction, Request, Response } from "express";

export interface AuthRequest extends Request {
  user?: typeof users.$inferSelect;
}

export async function requireAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  const [row] = await db
    .select({ user: users, tokenId: authTokens.id })
    .from(authTokens)
    .innerJoin(users, eq(authTokens.userId, users.id))
    .where(eq(authTokens.token, token))
    .limit(1);

  if (!row) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  if (row.user.moderationStatus !== "active") {
    await db.delete(authTokens).where(eq(authTokens.userId, row.user.id));
    res.status(403).json({ error: "This account has been removed by UniLink moderation" });
    return;
  }

  // Touch lastUsedAt asynchronously — don't block the request
  db.update(authTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(authTokens.id, row.tokenId))
    .catch(() => {});

  req.user = row.user;
  next();
}
