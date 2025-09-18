"use client";

import React from "react";
import { useSessionContext } from "@/contexts/session-context";
import { useChatContext } from "@/contexts/chat-context";
import { useClearSession } from "@/hooks/use-session";
import "./main-layout.scss";
import "../dashboard/dashboard.scss";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sessionId, session, setSessionId } = useSessionContext();
  const { clearMessages } = useChatContext();
  const clearSessionMutation = useClearSession();

  const handleClearSession = async () => {
    if (sessionId) {
      try {
        await clearSessionMutation.mutateAsync(sessionId);
        // Clear chat messages from context
        clearMessages();
        // Clear session from localStorage and context
        setSessionId(null);
      } catch (error) {
        console.error("Failed to clear session:", error);
      }
    }
  };

  const copySessionId = async () => {
    if (sessionId) {
      try {
        await navigator.clipboard.writeText(sessionId);
        // You could add a toast notification here
      } catch (error) {
        console.error("Failed to copy session ID:", error);
      }
    }
  };

  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div className="container">
          <div className="header__container">
            <div className="header__logo">News Chatbot</div>

            <div className="header__actions">
              {session && (
                <div className="header__session-info">
                  <span>Session: {sessionId?.slice(0, 8)}...</span>
                  <span>•</span>
                  <span>{session.messageCount} messages</span>
                </div>
              )}

              {sessionId && (
                <button
                  className="btn btn--secondary btn--sm"
                  onClick={copySessionId}
                  title="Copy Session ID"
                >
                  📋 Copy ID
                </button>
              )}

              <button
                className="btn btn--secondary btn--sm"
                onClick={handleClearSession}
                disabled={clearSessionMutation.isPending}
              >
                {clearSessionMutation.isPending ? (
                  <div className="spinner" />
                ) : (
                  "Clear Session"
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="main-layout__content">
        <div className="container">{children}</div>
      </main>
    </div>
  );
}
