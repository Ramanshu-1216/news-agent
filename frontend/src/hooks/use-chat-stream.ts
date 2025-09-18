"use client";

import { useState, useCallback } from "react";
import { api } from "@/lib/api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  citations?: unknown[];
  metadata?: unknown;
}

export interface StreamEvent {
  event: "connected" | "chunk" | "complete" | "error" | "ping";
  data: {
    message?: string;
    chunk?: string;
    response?: string;
    citations?: unknown[];
    error?: string;
    timestamp?: number;
  };
}

export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamMessage = useCallback(
    async (
      sessionId: string,
      message: string,
      onChunk: (chunk: string) => void,
      onComplete: (response: string, citations: unknown[]) => void,
      onError: (error: string) => void,
      category: string = "other"
    ) => {
      if (isStreaming) {
        onError("Another message is already being processed");
        return;
      }

      setIsStreaming(true);
      setError(null);

      try {
        const response = await api.chat.stream({
          sessionId,
          message,
          category,
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("No response body reader available");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const eventData: StreamEvent = JSON.parse(line.substring(6));

                switch (eventData.event) {
                  case "connected":
                    console.log("Stream connected:", eventData.data.message);
                    break;

                  case "chunk":
                    if (eventData.data.chunk) {
                      onChunk(eventData.data.chunk);
                    }
                    break;

                  case "complete":
                    if (eventData.data.response) {
                      onComplete(
                        eventData.data.response,
                        eventData.data.citations || []
                      );
                    }
                    break;

                  case "error":
                    if (eventData.data.error) {
                      onError(eventData.data.error);
                    }
                    break;

                  case "ping":
                    // Keep-alive ping, ignore
                    break;

                  default:
                    console.warn("Unknown stream event:", eventData.event);
                }
              } catch (parseError) {
                console.error("Error parsing SSE data:", parseError);
              }
            }
          }
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        setError(errorMessage);
        onError(errorMessage);
      } finally {
        setIsStreaming(false);
      }
    },
    [isStreaming]
  );

  return {
    streamMessage,
    isStreaming,
    error,
  };
}
