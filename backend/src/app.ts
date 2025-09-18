import express, { Application } from "express";
import cors from "cors";
import { requestLogger } from "./middlewares/logger.middleware";
import chatRoutes from "./routes/chat.routes";
import sessionRoutes from "./routes/session.routes";
import chatHistoryRoutes from "./routes/chat-history.routes";
import { sessionService } from "./services/session.service";
import { pythonBackendService } from "./services/python-backend.service";

const app: Application = express();

// Middleware
app.use(express.json());
app.use(cors());
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
    endpoints: {
      health: "/health",
      sessions: "/api/sessions",
      chat: "/api/chat",
      chatHistory: "/api/chat-history",
    },
  });
});

export default app;
