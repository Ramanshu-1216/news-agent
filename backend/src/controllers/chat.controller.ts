import { Request, Response } from "express";
import { chatService } from "../services/chat.service";
import logger from "../utils/logger";

export class ChatController {
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, message, category = "other" } = req.body;

      if (!sessionId || !message) {
        res.status(400).json({
          error: "sessionId and message are required",
        });
        return;
      }

      const response = await chatService.sendMessage({
        sessionId,
        message,
        category,
      });

      res.json(response);
    } catch (error) {
      logger.error("Error sending message:", error);

      if (error instanceof Error && error.message === "Session not found") {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      res.status(500).json({
        error: "Failed to send message",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async streamMessage(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, message, category = "other" } = req.body;

      if (!sessionId || !message) {
        res.status(400).json({
          error: "sessionId and message are required",
        });
        return;
      }

      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      });

      req.on("close", () => {
        logger.info("Client disconnected from stream");
      });

      res.write(
        `data: ${JSON.stringify({
          event: "connected",
          data: { message: "Stream connected" },
        })}\n\n`
      );

      // Set up keep-alive mechanism
      const keepAliveInterval = setInterval(() => {
        if (!res.destroyed) {
          res.write(
            `data: ${JSON.stringify({
              event: "ping",
              data: { timestamp: Date.now() },
            })}\n\n`
          );
        } else {
          clearInterval(keepAliveInterval);
        }
      }, 30000);

      await chatService.streamMessage(
        { sessionId, message, category },
        (chunk: string) => {
          // Forward chunk to client
          res.write(
            `data: ${JSON.stringify({
              event: "chunk",
              data: { chunk },
            })}\n\n`
          );
        },
        (response: string, citations: any[]) => {
          clearInterval(keepAliveInterval);

          res.write(
            `data: ${JSON.stringify({
              event: "complete",
              data: {
                response,
                citations,
              },
            })}\n\n`
          );
          // Close connection after completion
          res.end();
        },
        (error: string) => {
          // Clear keep-alive interval
          clearInterval(keepAliveInterval);

          res.write(
            `data: ${JSON.stringify({
              event: "error",
              data: { error },
            })}\n\n`
          );
          // Close connection on error
          res.end();
        }
      );
    } catch (error) {
      logger.error("Error streaming message:", error);
      res.write(
        `data: ${JSON.stringify({
          event: "error",
          data: { error: "Failed to start streaming" },
        })}\n\n`
      );
      res.end();
    }
  }
}

export const chatController = new ChatController();
