"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { ChatMessage } from "@/hooks/use-chat-stream";
import { useChatStream } from "@/hooks/use-chat-stream";
import { useSessionContext } from "./session-context";
import { useChatHistory } from "@/hooks/use-chat-history";

interface ChatContextType {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingMessage: string;
  sendMessage: (message: string, category?: string) => Promise<void>;
  clearMessages: () => void;
  error: string | null;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export function ChatProvider({ children }: ChatProviderProps) {
  const { sessionId } = useSessionContext();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { streamMessage, isStreaming } = useChatStream();
  const { data: chatHistory, refetch } = useChatHistory(sessionId);

  // Load chat history when session changes
  React.useEffect(() => {
    if (chatHistory?.messages) {
      setMessages(chatHistory.messages);
    } else {
      setMessages([]);
    }
  }, [chatHistory]);

  const sendMessage = useCallback(
    async (message: string, category: string = "other") => {
      if (!sessionId || isStreaming) return;

      setError(null);
      setStreamingMessage("");

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Stream the assistant response
      await streamMessage(
        sessionId,
        message,
        (chunk: string) => {
          setStreamingMessage((prev) => prev + chunk);
        },
        (response: string, citations: unknown[]) => {
          // Add the complete assistant message
          const assistantMessage: ChatMessage = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: response,
            timestamp: new Date(),
            citations,
          };

          // Clear streaming message first, then add the final message
          setStreamingMessage("");

          // Use requestAnimationFrame to ensure the streaming message is cleared before adding the final message
          requestAnimationFrame(() => {
            setMessages((prev) => [...prev, assistantMessage]);
          });

          // Refetch chat history to ensure consistency
          refetch();
        },
        (error: string) => {
          setError(error);
          setStreamingMessage("");

          // Add error message
          const errorMessage: ChatMessage = {
            id: `error-${Date.now()}`,
            role: "system",
            content: `Error: ${error}`,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, errorMessage]);
        },
        category
      );
    },
    [sessionId, isStreaming, streamMessage, refetch]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingMessage("");
    setError(null);
  }, []);

  const value: ChatContextType = {
    messages,
    isStreaming,
    streamingMessage,
    sendMessage,
    clearMessages,
    error,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
}
