import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { requestLogger } from "./middlewares/logger.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import chatRoutes from "./routes/chat.routes";
import sessionRoutes from "./routes/session.routes";
import chatHistoryRoutes from "./routes/chat-history.routes";
import { sessionService } from "./services/session.service";
import { pythonBackendService } from "./services/python-backend.service";

const app: Application = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [
      "http://localhost:3000",
    ],
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
app.use(requestLogger);

// Health check endpoint
app.get("/health", async (req, res) => {
  const pythonBackendHealthy = await pythonBackendService.healthCheck();

  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    activeSessions: sessionService.getActiveSessionCount(),
    pythonBackend: pythonBackendHealthy ? "healthy" : "unhealthy",
  });
});

// Routes
app.use("/api/sessions", sessionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/chat-history", chatHistoryRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "RAG-Powered News Chatbot API",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      health: "/health",
      sessions: "/api/sessions",
      chat: "/api/chat",
      chatHistory: "/api/chat-history",
    },
  });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
