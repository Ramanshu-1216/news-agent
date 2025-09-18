"use client";

import React, { createContext, useContext } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useSession } from "@/hooks/use-session";

interface SessionContextType {
  sessionId: string | null;
  setSessionId: (sessionId: string | null) => void;
  session:
    | {
        id: string;
        createdAt: string;
        lastActivity: string;
        messageCount: number;
      }
    | undefined;
  isLoading: boolean;
  error: Error | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useLocalStorage<string | null>(
    "sessionId",
    null
  );
  const { data: session, isLoading, error } = useSession(sessionId);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        setSessionId,
        session,
        isLoading,
        error,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSessionContext() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSessionContext must be used within a SessionProvider");
  }
  return context;
}
