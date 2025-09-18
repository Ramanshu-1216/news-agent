const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public statusText: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new ApiError(
      errorText || `HTTP ${response.status}`,
      response.status,
      response.statusText
    );
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Health check
  health: () =>
    fetch(`${API_BASE_URL}/health`).then(
      handleResponse<{ status: string; timestamp: string }>
    ),

  // Session management
  sessions: {
    create: (): Promise<{
      sessionId: string;
      message: string;
      createdAt: string;
    }> =>
      fetch(`${API_BASE_URL}/api/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }).then(
        handleResponse<{
          sessionId: string;
          message: string;
          createdAt: string;
        }>
      ),

    get: (
      sessionId: string
    ): Promise<{
      id: string;
      createdAt: string;
      lastActivity: string;
      messageCount: number;
    }> =>
      fetch(`${API_BASE_URL}/api/sessions/${sessionId}`).then(
        handleResponse<{
          id: string;
          createdAt: string;
          lastActivity: string;
          messageCount: number;
        }>
      ),

    getAll: (): Promise<
      {
        id: string;
        createdAt: string;
        lastActivity: string;
        messageCount: number;
      }[]
    > =>
      fetch(`${API_BASE_URL}/api/sessions`).then(
        handleResponse<
          {
            id: string;
            createdAt: string;
            lastActivity: string;
            messageCount: number;
          }[]
        >
      ),

    clear: (sessionId: string): Promise<{ success: boolean }> =>
      fetch(`${API_BASE_URL}/api/sessions/${sessionId}`, {
        method: "DELETE",
      }).then(handleResponse<{ success: boolean }>),
  },

  // Chat history
  chatHistory: {
    get: (sessionId: string) =>
      fetch(`${API_BASE_URL}/api/chat-history/${sessionId}`).then(
        handleResponse<{
          sessionId: string;
          messages: Array<{
            id: string;
            role: string;
            content: string;
            timestamp: string;
            category?: string;
            citations?: unknown[];
            metadata?: unknown;
          }>;
          totalMessages: number;
        }>
      ),
  },

  // Chat
  chat: {
    send: (data: { sessionId: string; message: string; category?: string }) =>
      fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then(handleResponse),

    stream: (data: { sessionId: string; message: string; category?: string }) =>
      fetch(`${API_BASE_URL}/api/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
  },
};
