import { Router } from "express";
import { sessionController } from "../controllers/session.controller";

const router: Router = Router();

// Session management routes
router.post("/", sessionController.createSession.bind(sessionController));
router.get("/:sessionId", sessionController.getSession.bind(sessionController));
router.get("/", sessionController.getAllSessions.bind(sessionController));
router.delete(
  "/:sessionId",
  sessionController.clearSession.bind(sessionController)
);

export default router;
