export const queryKeys = {
  // Session related queries
  sessions: {
    all: ["sessions"] as const,
    detail: (sessionId: string) => ["sessions", sessionId] as const,
    list: () => ["sessions", "list"] as const,
  },

  // Chat history related queries
  chatHistory: {
    all: ["chatHistory"] as const,
    detail: (sessionId: string) => ["chatHistory", sessionId] as const,
  },

  // Health check
  health: ["health"] as const,
} as const;
