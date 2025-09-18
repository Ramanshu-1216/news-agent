import { ChatMessage } from "./chat-message.model";

export interface Session {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  messages: ChatMessage[];
}

export interface SessionInfo {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  messageCount: number;
}
