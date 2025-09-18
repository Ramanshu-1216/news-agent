import axios, { AxiosResponse } from "axios";
import logger from "../utils/logger";

export interface ChatRequest {
  query: string;
  chat_history: Array<{ role: string; content: string }>;
  category?: string;
}

export interface ChatResponse {
  response: string;
  citations: Array<{
    url: string;
    source: string;
    authors: string[];
    published_date: string;
    article_id: string;
  }>;
}

export interface StreamEvent {
  event: string;
  data: any;
}

export class PythonBackendService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PYTHON_BACKEND_URL || "http://localhost:8000";
    logger.info(`Python backend service initialized with URL: ${this.baseUrl}`);
  }

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      logger.info(
        `Sending chat request to Python backend: ${request.query.substring(
          0,
          50
        )}...`
      );
      logger.info(`Request payload:`, JSON.stringify(request, null, 2));

      const response: AxiosResponse<ChatResponse> = await axios.post(
        `${this.baseUrl}/chat/query`,
        request,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000, // 30 seconds timeout
        }
      );

      logger.info(`Received response from Python backend`);
      return response.data;
    } catch (error) {
      logger.error("Error calling Python backend:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          throw new Error(
            "Python backend is not available. Please ensure it's running on port 8000."
          );
        }
        if (error.response) {
          logger.error(`Python backend response error:`, error.response.data);
        }
        throw new Error(`Python backend error: ${error.message}`);
      }

      throw new Error("Unknown error occurred while calling Python backend");
    }
  }

  async streamChatMessage(
    request: ChatRequest,
    onChunk: (chunk: string) => void,
    onComplete: (response: string, citations: any[]) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      logger.info(
        `Starting stream chat request to Python backend: ${request.query.substring(
          0,
          50
        )}...`
      );
      logger.info(`Stream request payload:`, JSON.stringify(request, null, 2));

      const response = await axios.post(
        `${this.baseUrl}/chat/stream`,
        request,
        {
          responseType: "stream",
          timeout: 120000,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      let fullResponse = "";
      let citations: any[] = [];
      let hasReceivedData = false;

      // Set up a timeout to prevent hanging connections
      const streamTimeout = setTimeout(() => {
        if (!hasReceivedData) {
          logger.error("Stream timeout - no data received from Python backend");
          onError("Stream timeout - no response from AI backend");
        }
      }, 30000); // 30 seconds timeout

      response.data.on("data", (chunk: Buffer) => {
        hasReceivedData = true;
        clearTimeout(streamTimeout);
        const lines = chunk.toString().split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data: StreamEvent = JSON.parse(line.substring(6));

              if (data.event === "response_chunk") {
                const chunkText = data.data.chunk;
                fullResponse += chunkText;
                onChunk(chunkText);
              } else if (data.event === "complete") {
                fullResponse = data.data.response;
                citations = data.data.citations || [];
                onComplete(fullResponse, citations);
              } else if (data.event === "error") {
                onError(data.data.error || "Unknown streaming error");
              }
            } catch (e) {
              logger.error("Error parsing SSE data:", e);
            }
          }
        }
      });

      response.data.on("end", () => {
        clearTimeout(streamTimeout);
        logger.info("Stream ended successfully");
      });

      response.data.on("error", (error: Error) => {
        clearTimeout(streamTimeout);
        logger.error("Stream error:", error);
        onError(error.message);
      });
    } catch (error) {
      logger.error("Error starting stream to Python backend:", error);

      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNREFUSED") {
          onError(
            "Python backend is not available. Please ensure it's running on port 8000."
          );
        } else {
          onError(`Python backend error: ${error.message}`);
        }
      } else {
        onError(
          "Unknown error occurred while starting stream to Python backend"
        );
      }
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`, {
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      logger.error("Python backend health check failed:", error);
      return false;
    }
  }
}

// Singleton instance
export const pythonBackendService = new PythonBackendService();
