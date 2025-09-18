import { Router } from "express";
import { chatController } from "../controllers/chat.controller";

const router: Router = Router();

// Chat routes
router.post("/", chatController.sendMessage.bind(chatController));
router.post("/stream", chatController.streamMessage.bind(chatController));

export default router;
