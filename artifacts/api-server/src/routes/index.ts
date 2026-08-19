import { Router } from "express";
import authRouter from "./auth.js";
import chatRouter from "./chat.js";
import healthRouter from "./health.js";
import liveRouter from "./live.js";
import notificationsRouter from "./notifications.js";
import sessionsRouter from "./sessions.js";

const router = Router();

router.use("/healthz", healthRouter);
router.use("/auth", authRouter);
router.use("/live", liveRouter);
router.use("/sessions", sessionsRouter);
router.use("/chat", chatRouter);
router.use("/notifications", notificationsRouter);

export default router;
