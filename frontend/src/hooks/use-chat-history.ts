"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { ChatMessage } from "./use-chat-stream";

export interface ChatHistoryResponse {
  sessionId: string;
  messages: ChatMessage[];
  totalMessages: number;
}

export function useChatHistory(sessionId: string | null) {
  return useQuery<ChatHistoryResponse, Error>({
    queryKey: queryKeys.chatHistory.detail(sessionId || ""),
    queryFn: async () => {
      const response = await api.chatHistory.get(sessionId!);
      return {
        sessionId: response.sessionId,
        messages: response.messages.map((msg) => ({
          id: msg.id,
          role: msg.role as "user" | "assistant" | "system",
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          category: msg.category,
          citations: msg.citations,
          metadata: msg.metadata,
        })),
        totalMessages: response.totalMessages,
      };
    },
    enabled: !!sessionId,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
