import { PrismaClient } from "@prisma/client";
import logger from "../utils/logger";

class DatabaseService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "info", "warn"]
          : ["error"],
    });
  }

  async connect(): Promise<void> {
    try {
      await this.prisma.$connect();
      logger.info("Database connected successfully");
    } catch (error) {
      logger.error("Failed to connect to database:", error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect();
      logger.info("Database disconnected successfully");
    } catch (error) {
      logger.error("Failed to disconnect from database:", error);
      throw error;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error("Database health check failed:", error);
      return false;
    }
  }

  get client(): PrismaClient {
    return this.prisma;
  }
}

export const databaseService = new DatabaseService();
export default databaseService;
