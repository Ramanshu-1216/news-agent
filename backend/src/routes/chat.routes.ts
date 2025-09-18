import { Router } from "express";
import { chatController } from "../controllers/chat.controller";
import { validateBody } from "../middlewares/validation.middleware";
import {
  sendMessageSchema,
  streamMessageSchema,
} from "../validators/chat.validator";

const router: Router = Router();

// Chat routes with validation
router.post(
  "/",
  validateBody(sendMessageSchema),
  chatController.sendMessage.bind(chatController)
);
router.post(
  "/stream",
  validateBody(streamMessageSchema),
  chatController.streamMessage.bind(chatController)
);

export default router;
