import { Session, SessionInfo, ChatMessage } from "../../models";
import { databaseService } from "./database.service";
import logger from "../utils/logger";

export class SessionService {
  async createSession(): Promise<Session> {
    try {
      const session = await databaseService.client.session.create({
        data: {
          messageCount: 0,
        },
        include: {
          messages: true,
        },
      });

      logger.info(`Created new session: ${session.id}`);
      return {
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        messages: session.messages.map(this.mapPrismaMessageToModel),
      };
    } catch (error) {
      logger.error("Error creating session:", error);
      throw new Error("Failed to create session");
    }
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    try {
      const session = await databaseService.client.session.findUnique({
        where: { id: sessionId },
        include: {
          messages: {
            orderBy: { timestamp: "asc" },
          },
        },
      });

      if (!session) return undefined;

      return {
        id: session.id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        messages: session.messages.map(this.mapPrismaMessageToModel),
      };
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

  async addMessage(sessionId: string, message: ChatMessage): Promise<boolean> {
    try {
      await databaseService.client.$transaction(async (prisma: any) => {
        // Add the message
        await prisma.chatMessage.create({
          data: {
            id: message.id,
            sessionId: sessionId,
            role: message.role.toUpperCase() as any,
            content: message.content,
            timestamp: message.timestamp,
            category: message.category || "other",
            citations: message.citations
              ? JSON.stringify(message.citations)
              : null,
            metadata: message.metadata
              ? JSON.stringify(message.metadata)
              : null,
          },
        });

        // Update session message count and last activity
        await prisma.session.update({
          where: { id: sessionId },
          data: {
            messageCount: { increment: 1 },
            lastActivity: new Date(),
          },
        });
      });

      logger.info(`Added message to session: ${sessionId}`);
      return true;
    } catch (error) {
      logger.error("Error adding message to session:", error);
      throw new Error("Failed to add message to session");
    }
  }

  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const messages = await databaseService.client.chatMessage.findMany({
        where: { sessionId },
        orderBy: { timestamp: "asc" },
      });

      return messages.map(this.mapPrismaMessageToModel);
    } catch (error) {
      logger.error("Error getting chat history:", error);
      throw new Error("Failed to get chat history");
    }
  }

  async clearSession(sessionId: string): Promise<boolean> {
    try {
      const result = await databaseService.client.$transaction(
        async (prisma: any) => {
          // Delete all messages in the session
          await prisma.chatMessage.deleteMany({
            where: { sessionId },
          });

          // Reset message count and update last activity
          const session = await prisma.session.update({
            where: { id: sessionId },
            data: {
              messageCount: 0,
              lastActivity: new Date(),
            },
          });

          return session;
        }
      );

      if (result) {
        logger.info(`Cleared session: ${sessionId}`);
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

  private mapPrismaMessageToModel(prismaMessage: any): ChatMessage {
    return {
      id: prismaMessage.id,
      role: prismaMessage.role.toLowerCase(),
      content: prismaMessage.content,
      timestamp: prismaMessage.timestamp,
      category: prismaMessage.category || undefined,
      citations: prismaMessage.citations
        ? JSON.parse(prismaMessage.citations)
        : undefined,
      metadata: prismaMessage.metadata
        ? JSON.parse(prismaMessage.metadata)
        : undefined,
    };
  }
}

export const sessionService = new SessionService();
