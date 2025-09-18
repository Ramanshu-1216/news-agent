import Redis from "ioredis";
import logger from "../utils/logger";

class RedisService {
  private redis: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0"),
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.redis.on("connect", () => {
      this.isConnected = true;
      logger.info("Redis connected successfully");
    });

    this.redis.on("ready", () => {
      logger.info("Redis is ready to accept commands");
    });

    this.redis.on("error", (error) => {
      this.isConnected = false;
      logger.error("Redis connection error:", error);
    });

    this.redis.on("close", () => {
      this.isConnected = false;
      logger.warn("Redis connection closed");
    });

    this.redis.on("reconnecting", () => {
      logger.info("Redis reconnecting...");
    });
  }

  async connect(): Promise<void> {
    try {
      await this.redis.connect();
      logger.info("Redis service initialized");
    } catch (error) {
      logger.error("Failed to connect to Redis:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
      this.isConnected = false;
      logger.info("Redis disconnected successfully");
    } catch (error) {
      logger.error("Failed to disconnect from Redis:", error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === "PONG";
    } catch (error) {
      logger.error("Redis health check failed:", error);
      return false;
    }
  }

  // Session caching methods
  async cacheSession(
    sessionId: string,
    sessionData: any,
    ttl: number = 3600
  ): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.redis.setex(key, ttl, JSON.stringify(sessionData));
      logger.debug(`Cached session: ${sessionId}`);
    } catch (error) {
      logger.error("Failed to cache session:", error);
      // Don't throw - caching failures shouldn't break the app
    }
  }

  async getCachedSession(sessionId: string): Promise<any | null> {
    try {
      const key = `session:${sessionId}`;
      const data = await this.redis.get(key);
      if (data) {
        logger.debug(`Cache hit for session: ${sessionId}`);
        return JSON.parse(data);
      }
      logger.debug(`Cache miss for session: ${sessionId}`);
      return null;
    } catch (error) {
      logger.error("Failed to get cached session:", error);
      return null;
    }
  }

  async invalidateSession(sessionId: string): Promise<void> {
    try {
      const key = `session:${sessionId}`;
      await this.redis.del(key);
      logger.debug(`Invalidated session cache: ${sessionId}`);
    } catch (error) {
      logger.error("Failed to invalidate session cache:", error);
    }
  }

  // Chat history caching methods
  async cacheChatHistory(
    sessionId: string,
    messages: any[],
    ttl: number = 1800
  ): Promise<void> {
    try {
      const key = `chat_history:${sessionId}`;
      await this.redis.setex(key, ttl, JSON.stringify(messages));
      logger.debug(`Cached chat history for session: ${sessionId}`);
    } catch (error) {
      logger.error("Failed to cache chat history:", error);
    }
  }

  async getCachedChatHistory(sessionId: string): Promise<any[] | null> {
    try {
      const key = `chat_history:${sessionId}`;
      const data = await this.redis.get(key);
      if (data) {
        logger.debug(`Cache hit for chat history: ${sessionId}`);
        return JSON.parse(data);
      }
      logger.debug(`Cache miss for chat history: ${sessionId}`);
      return null;
    } catch (error) {
      logger.error("Failed to get cached chat history:", error);
      return null;
    }
  }

  async invalidateChatHistory(sessionId: string): Promise<void> {
    try {
      const key = `chat_history:${sessionId}`;
      await this.redis.del(key);
      logger.debug(`Invalidated chat history cache: ${sessionId}`);
    } catch (error) {
      logger.error("Failed to invalidate chat history cache:", error);
    }
  }

  // General cache methods
  async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttl) {
        await this.redis.setex(key, ttl, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
      logger.error("Failed to set cache:", error);
    }
  }

  async get(key: string): Promise<any | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error("Failed to get cache:", error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      logger.error("Failed to delete cache:", error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error("Failed to check cache existence:", error);
      return false;
    }
  }

  // Utility methods
  get isHealthy(): boolean {
    return this.isConnected;
  }

  get client(): Redis {
    return this.redis;
  }
}

// Singleton instance
export const redisService = new RedisService();
export default redisService;
