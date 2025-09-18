import { Router } from "express";
import { chatHistoryController } from "../controllers/chat-history.controller";
import { validateParams } from "../middlewares/validation.middleware";
import { sessionIdSchema } from "../validators/session.validator";

const router: Router = Router();

router.get(
  "/:sessionId",
  validateParams(sessionIdSchema),
  chatHistoryController.getChatHistory.bind(chatHistoryController)
);

export default router;
