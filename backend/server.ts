import app from "./src/app";
import { databaseService } from "./src/services/database.service";
import dotenv from "dotenv";
import logger from "./src/utils/logger";

dotenv.config();

const PORT = process.env.PORT || 8001;

async function startServer() {
  try {
    await databaseService.connect();

    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  logger.info("Received SIGINT, shutting down gracefully...");
  await databaseService.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM, shutting down gracefully...");
  await databaseService.disconnect();
  process.exit(0);
});

startServer();
