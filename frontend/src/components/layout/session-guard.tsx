"use client";

import React from "react";
import { useSessionContext } from "@/contexts/session-context";
import { CreateSessionForm } from "@/components/session/create-session-form";

interface SessionGuardProps {
  children: React.ReactNode;
}

export function SessionGuard({ children }: SessionGuardProps) {
  const { sessionId, isLoading } = useSessionContext();

  if (isLoading) {
    return (
      <div className="flex flex--center" style={{ minHeight: "100vh" }}>
        <div className="spinner" style={{ width: "2rem", height: "2rem" }} />
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div
        className="flex flex--center"
        style={{ minHeight: "100vh", padding: "var(--spacing-lg)" }}
      >
        <CreateSessionForm />
      </div>
    );
  }

  return <>{children}</>;
}
