import { Session, SessionInfo } from "../../models";
import { databaseService } from "./database.service";
import { redisService } from "./redis.service";
import logger from "../utils/logger";

export class SessionService {
  async createSession(): Promise<Session> {
    try {
      const session = await databaseService.client.session.create({
        data: {
          messageCount: 0,
        },
      });

      logger.info(`Created new session: ${session.id}`);
      return {
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        messages: [],
      };
    } catch (error) {
      logger.error("Error creating session:", error);
      throw new Error("Failed to create session");
    }
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    try {
      // Try cache first
      const cachedSession = await redisService.getCachedSession(sessionId);
      if (cachedSession) {
        return cachedSession;
      }

      // Fallback to database
      const session = await databaseService.client.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) return undefined;

      const sessionData = {
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        messages: [],
      };

      // Cache the session
      await redisService.cacheSession(sessionId, sessionData, 3600); // 1 hour TTL

      return sessionData;
    } catch (error) {
      logger.error("Error getting session:", error);
      throw new Error("Failed to get session");
    }
  }

  async getSessionInfo(sessionId: string): Promise<SessionInfo | undefined> {
    try {
      const session = await databaseService.client.session.findUnique({
        where: { id: sessionId },
        select: {
          id: true,
          createdAt: true,
          lastActivity: true,
          messageCount: true,
        },
      });

      if (!session) return undefined;

      return {
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        messageCount: session.messageCount,
      };
    } catch (error) {
      logger.error("Error getting session info:", error);
      throw new Error("Failed to get session info");
    }
  }

  async getAllSessions(): Promise<SessionInfo[]> {
    try {
      const sessions = await databaseService.client.session.findMany({
        select: {
          id: true,
          createdAt: true,
          lastActivity: true,
          messageCount: true,
        },
        orderBy: { lastActivity: "desc" },
      });

      return sessions.map((session: any) => ({
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        messageCount: session.messageCount,
      }));
    } catch (error) {
      logger.error("Error getting all sessions:", error);
      throw new Error("Failed to get sessions");
    }
  }

  async clearSession(sessionId: string): Promise<boolean> {
    try {
      // Update session metadata only
      const session = await databaseService.client.session.update({
        where: { id: sessionId },
        data: {
          messageCount: 0,
          lastActivity: new Date(),
        },
      });

      if (session) {
        // Invalidate session cache only (chat history will be cleared separately)
        await redisService.invalidateSession(sessionId);

        logger.info(`Cleared session metadata: ${sessionId}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Error clearing session:", error);
      throw new Error("Failed to clear session");
    }
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const session = await databaseService.client.session.delete({
        where: { id: sessionId },
      });

      if (session) {
        logger.info(`Deleted session: ${sessionId}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Error deleting session:", error);
      throw new Error("Failed to delete session");
    }
  }

  async getActiveSessionCount(): Promise<number> {
    try {
      const count = await databaseService.client.session.count();
      return count;
    } catch (error) {
      logger.error("Error getting active session count:", error);
      throw new Error("Failed to get active session count");
    }
  }
}

export const sessionService = new SessionService();
