import { Router } from "express";
import { sessionController } from "../controllers/session.controller";
import { validateParams } from "../middlewares/validation.middleware";
import { sessionIdSchema } from "../validators/session.validator";

const router: Router = Router();

router.post("/", sessionController.createSession.bind(sessionController));
router.get(
  "/:sessionId",
  validateParams(sessionIdSchema),
  sessionController.getSession.bind(sessionController)
);
router.get("/", sessionController.getAllSessions.bind(sessionController));
router.delete(
  "/:sessionId",
  validateParams(sessionIdSchema),
  sessionController.clearSession.bind(sessionController)
);

export default router;
