import { Router } from "express";
import { chatHistoryController } from "../controllers/chat-history.controller";

const router: Router = Router();

// Chat history routes
router.get(
  "/:sessionId",
  chatHistoryController.getChatHistory.bind(chatHistoryController)
);

export default router;
