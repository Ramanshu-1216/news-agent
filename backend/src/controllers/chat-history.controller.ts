import { Request, Response } from "express";
import { sessionService } from "../services/session.service";
import logger from "../utils/logger";

export class ChatHistoryController {
  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const messages = sessionService.getChatHistory(sessionId);

      if (messages.length === 0 && !sessionService.getSession(sessionId)) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      res.json({
        sessionId,
        messages,
        totalMessages: messages.length,
      });
    } catch (error) {
      logger.error("Error getting chat history:", error);
      res.status(500).json({
        error: "Failed to get chat history",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const chatHistoryController = new ChatHistoryController();
