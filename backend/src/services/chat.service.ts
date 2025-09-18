import { v4 as uuidv4 } from "uuid";
import { ChatMessage } from "../../models";
import { sessionService } from "./session.service";
import { pythonBackendService } from "./python-backend.service";
import logger from "../utils/logger";

export interface SendMessageRequest {
  sessionId: string;
  message: string;
  category?: string;
}

export interface SendMessageResponse {
  sessionId: string;
  response: string;
  citations: any[];
  messageId: string;
  timestamp: Date;
}

export class ChatService {
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const { sessionId, message, category = "other" } = request;

    // Validate session exists
    const session = sessionService.getSession(sessionId);
    if (!session) {
      throw new Error("Session not found");
    }

    // Add user message to session
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    sessionService.addMessage(sessionId, userMessage);

    // Prepare chat history for Python backend
    const chatHistory = this.formatChatHistoryForBackend(sessionId);

    // Call Python backend
    const response = await pythonBackendService.sendChatMessage({
      query: message,
      chat_history: chatHistory,
      category,
    });

    // Add assistant response to session
    const assistantMessage: ChatMessage = {
      id: uuidv4(),
      role: "assistant",
      content: response.response,
      timestamp: new Date(),
    };

    sessionService.addMessage(sessionId, assistantMessage);

    return {
      sessionId,
      response: response.response,
      citations: response.citations || [],
      messageId: assistantMessage.id,
      timestamp: assistantMessage.timestamp,
    };
  }

  async streamMessage(
    request: SendMessageRequest,
    onChunk: (chunk: string) => void,
    onComplete: (response: string, citations: any[]) => void,
    onError: (error: string) => void
  ): Promise<void> {
    const { sessionId, message, category = "other" } = request;

    // Validate session exists
    const session = sessionService.getSession(sessionId);
    if (!session) {
      onError("Session not found");
      return;
    }

    // Add user message to session
    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    sessionService.addMessage(sessionId, userMessage);

    // Prepare chat history for Python backend
    const chatHistory = this.formatChatHistoryForBackend(sessionId);

    let fullResponse = "";
    let citations: any[] = [];

    // Stream from Python backend
    await pythonBackendService.streamChatMessage(
      {
        query: message,
        chat_history: chatHistory,
        category,
      },
      (chunk: string) => {
        onChunk(chunk);
      },
      (response: string, responseCitations: any[]) => {
        fullResponse = response;
        citations = responseCitations;

        // Add assistant response to session
        const assistantMessage: ChatMessage = {
          id: uuidv4(),
          role: "assistant",
          content: fullResponse,
          timestamp: new Date(),
        };

        sessionService.addMessage(sessionId, assistantMessage);
        onComplete(fullResponse, citations);
      },
      (error: string) => {
        onError(error);
      }
    );
  }

  private formatChatHistoryForBackend(
    sessionId: string
  ): Array<{ role: string; content: string }> {
    const session = sessionService.getSession(sessionId);
    if (!session) return [];

    const formattedHistory = session.messages
      .filter((msg) => msg.role === "user" || msg.role === "assistant")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    logger.info(
      `Formatted chat history for session ${sessionId}:`,
      JSON.stringify(formattedHistory, null, 2)
    );
    return formattedHistory;
  }
}

export const chatService = new ChatService();
