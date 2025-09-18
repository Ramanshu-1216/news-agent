"use client";

import React, { useState } from "react";
import { useCreateSession, useValidateSession } from "@/hooks/use-session";
import { useSessionContext } from "@/contexts/session-context";
import "./create-session-form.scss";

type SessionMode = "new" | "existing";

export function CreateSessionForm() {
  const { setSessionId } = useSessionContext();
  const [mode, setMode] = useState<SessionMode>("new");
  const [sessionIdInput, setSessionIdInput] = useState("");
  const [inputError, setInputError] = useState("");

  const createSessionMutation = useCreateSession();
  const validateSessionMutation = useValidateSession();

  const handleCreateSession = async () => {
    try {
      const result = await createSessionMutation.mutateAsync();
      setSessionId(result.sessionId);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionIdInput.trim()) {
      setInputError("Please enter a session ID");
      return;
    }

    // Basic UUID validation
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionIdInput.trim())) {
      setInputError("Please enter a valid session ID");
      return;
    }

    try {
      setInputError("");
      const session = await validateSessionMutation.mutateAsync(
        sessionIdInput.trim()
      );
      if (session) {
        setSessionId(sessionIdInput.trim());
      }
    } catch (error) {
      setInputError("Session not found. Please check the session ID.");
      console.error("Failed to validate session:", error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSessionIdInput(e.target.value);
    if (inputError) {
      setInputError("");
    }
  };

  const isNewMode = mode === "new";
  const isLoading =
    createSessionMutation.isPending || validateSessionMutation.isPending;
  const hasError =
    createSessionMutation.isError ||
    validateSessionMutation.isError ||
    inputError;

  return (
    <div className="create-session-form">
      <h1 className="create-session-form__title">Welcome to News Chatbot</h1>
      <p className="create-session-form__subtitle">
        Start a new conversation or join an existing session
      </p>

      <div className="create-session-form__tabs">
        <button
          className={`create-session-form__tab ${
            isNewMode ? "create-session-form__tab--active" : ""
          }`}
          onClick={() => setMode("new")}
        >
          <span>New Chat</span>
        </button>
        <button
          className={`create-session-form__tab ${
            !isNewMode ? "create-session-form__tab--active" : ""
          }`}
          onClick={() => setMode("existing")}
        >
          <span>Join Session</span>
        </button>
      </div>

      <div className="create-session-form__form">
        {isNewMode ? (
          <>
            <p className="create-session-form__description">
              Create a new session to start a fresh conversation
            </p>
            <button
              className="btn btn--primary btn--lg create-session-form__button"
              onClick={handleCreateSession}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="create-session-form__loading">
                  <div className="spinner" />
                  Creating Session...
                </div>
              ) : (
                "Start New Chat"
              )}
            </button>
          </>
        ) : (
          <>
            <div className="create-session-form__input-group">
              <label className="create-session-form__label">Session ID</label>
              <div className="create-session-form__input-wrapper">
                <input
                  type="text"
                  className={`create-session-form__input ${
                    inputError ? "create-session-form__input--error" : ""
                  }`}
                  placeholder="Enter session ID (e.g., 123e4567-e89b-12d3-a456-426614174000)"
                  value={sessionIdInput}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                {sessionIdInput && (
                  <button
                    className="create-session-form__copy-button"
                    onClick={() => copyToClipboard(sessionIdInput)}
                    title="Copy to clipboard"
                  >
                    📋
                  </button>
                )}
              </div>
            </div>

            <button
              className="btn btn--primary btn--lg create-session-form__button"
              onClick={handleJoinSession}
              disabled={isLoading || !sessionIdInput.trim()}
            >
              {isLoading ? (
                <div className="create-session-form__loading">
                  <div className="spinner" />
                  Validating Session...
                </div>
              ) : (
                "Join Session"
              )}
            </button>
          </>
        )}

        {hasError && (
          <div className="alert alert--error create-session-form__error">
            {inputError ||
              (createSessionMutation.isError &&
                "Failed to create session. Please try again.") ||
              (validateSessionMutation.isError &&
                "Failed to validate session. Please try again.")}
          </div>
        )}
      </div>
    </div>
  );
}
