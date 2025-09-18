import { ChatMessage } from "../../models";
import { databaseService } from "./database.service";
import { redisService } from "./redis.service";
import logger from "../utils/logger";

export class ChatHistoryService {
  async getChatHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      // Try cache first
      const cachedHistory = await redisService.getCachedChatHistory(sessionId);
      if (cachedHistory) {
        return cachedHistory;
      }

      // Fallback to database
      const messages = await databaseService.client.chatMessage.findMany({
        where: { sessionId },
        orderBy: { timestamp: "asc" },
      });

      const chatHistory = messages.map(this.mapPrismaMessageToModel);

      // Cache the chat history
      await redisService.cacheChatHistory(sessionId, chatHistory, 1800); // 30 minutes TTL

      return chatHistory;
    } catch (error) {
      logger.error("Error getting chat history:", error);
      throw new Error("Failed to get chat history");
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

      // Update cache with new message instead of invalidating
      await this.updateCacheWithNewMessage(sessionId, message);

      logger.info(`Added message to session: ${sessionId}`);
      return true;
    } catch (error) {
      logger.error("Error adding message to session:", error);
      throw new Error("Failed to add message to session");
    }
  }

  async clearChatHistory(sessionId: string): Promise<boolean> {
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
        // Invalidate cache after clearing session
        await redisService.invalidateSession(sessionId);
        await redisService.invalidateChatHistory(sessionId);

        logger.info(`Cleared chat history for session: ${sessionId}`);
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Error clearing chat history:", error);
      throw new Error("Failed to clear chat history");
    }
  }

  async getMessageCount(sessionId: string): Promise<number> {
    try {
      const count = await databaseService.client.chatMessage.count({
        where: { sessionId },
      });
      return count;
    } catch (error) {
      logger.error("Error getting message count:", error);
      throw new Error("Failed to get message count");
    }
  }

  async getMessagesByRole(
    sessionId: string,
    role: string
  ): Promise<ChatMessage[]> {
    try {
      const messages = await databaseService.client.chatMessage.findMany({
        where: {
          sessionId,
          role: role.toUpperCase() as any,
        },
        orderBy: { timestamp: "asc" },
      });

      return messages.map(this.mapPrismaMessageToModel);
    } catch (error) {
      logger.error("Error getting messages by role:", error);
      throw new Error("Failed to get messages by role");
    }
  }

  async getRecentMessages(
    sessionId: string,
    limit: number = 10
  ): Promise<ChatMessage[]> {
    try {
      const messages = await databaseService.client.chatMessage.findMany({
        where: { sessionId },
        orderBy: { timestamp: "desc" },
        take: limit,
      });

      return messages.map(this.mapPrismaMessageToModel).reverse();
    } catch (error) {
      logger.error("Error getting recent messages:", error);
      throw new Error("Failed to get recent messages");
    }
  }

  private async updateCacheWithNewMessage(
    sessionId: string,
    newMessage: ChatMessage
  ): Promise<void> {
    try {
      // Get current cached history
      const cachedHistory = await redisService.getCachedChatHistory(sessionId);

      if (cachedHistory) {
        // Update existing cache by appending new message
        const updatedHistory = [...cachedHistory, newMessage];
        await redisService.cacheChatHistory(sessionId, updatedHistory, 1800); // 30 minutes TTL
        logger.debug(
          `Updated cache with new message for session: ${sessionId}`
        );
      } else {
        // If no cache exists, invalidate to force fresh load on next request
        await redisService.invalidateChatHistory(sessionId);
        logger.debug(
          `No cache found, invalidated for fresh load: ${sessionId}`
        );
      }

      // Also update the session cache with new lastActivity
      await this.updateSessionCacheWithNewActivity(sessionId);
    } catch (error) {
      logger.error("Error updating cache with new message:", error);
      // Fallback to invalidation if cache update fails
      await redisService.invalidateChatHistory(sessionId);
      await redisService.invalidateSession(sessionId);
    }
  }

  private async updateSessionCacheWithNewActivity(
    sessionId: string
  ): Promise<void> {
    try {
      // Get current cached session
      const cachedSession = await redisService.getCachedSession(sessionId);

      if (cachedSession) {
        // Update session with new lastActivity
        const updatedSession = {
          ...cachedSession,
          lastActivity: new Date(),
        };
        await redisService.cacheSession(sessionId, updatedSession, 3600); // 1 hour TTL
        logger.debug(
          `Updated session cache with new lastActivity for session: ${sessionId}`
        );
      } else {
        // If no session cache exists, invalidate to force fresh load
        await redisService.invalidateSession(sessionId);
        logger.debug(
          `No session cache found, invalidated for fresh load: ${sessionId}`
        );
      }
    } catch (error) {
      logger.error("Error updating session cache with new activity:", error);
      // Fallback to invalidation if cache update fails
      await redisService.invalidateSession(sessionId);
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

export const chatHistoryService = new ChatHistoryService();
