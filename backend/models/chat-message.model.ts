export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface ChatMessageInput {
  role: "user" | "assistant";
  content: string;
}
