export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  category?: string;
  citations?: any[];
  metadata?: any;
}

export interface ChatMessageInput {
  role: "user" | "assistant" | "system";
  content: string;
  category?: string;
  citations?: any[];
  metadata?: any;
}
