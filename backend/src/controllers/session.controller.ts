import { Request, Response } from "express";
import { sessionService } from "../services/session.service";
import logger from "../utils/logger";

export class SessionController {
  async createSession(req: Request, res: Response): Promise<void> {
    try {
      const session = await sessionService.createSession();

      res.status(201).json({
        sessionId: session.id,
        message: "Session created successfully",
        createdAt: session.createdAt,
      });
    } catch (error) {
      logger.error("Error creating session:", error);
      res.status(500).json({
        error: "Failed to create session",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const sessionInfo = await sessionService.getSessionInfo(sessionId);

      if (!sessionInfo) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      res.json(sessionInfo);
    } catch (error) {
      logger.error("Error getting session:", error);
      res.status(500).json({
        error: "Failed to get session",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getAllSessions(req: Request, res: Response): Promise<void> {
    try {
      const sessions = await sessionService.getAllSessions();

      res.json({
        totalSessions: sessions.length,
        sessions,
      });
    } catch (error) {
      logger.error("Error getting all sessions:", error);
      res.status(500).json({
        error: "Failed to get sessions",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async clearSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const success = await sessionService.clearSession(sessionId);

      if (!success) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      res.json({
        message: "Session cleared successfully",
        sessionId,
        clearedAt: new Date(),
      });
    } catch (error) {
      logger.error("Error clearing session:", error);
      res.status(500).json({
        error: "Failed to clear session",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}

export const sessionController = new SessionController();
