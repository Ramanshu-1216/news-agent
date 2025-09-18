"use client";

import React, { useState } from "react";
import { useSessionContext } from "@/contexts/session-context";
import "./chat-interface.scss";

export function ChatInterface() {
  const { sessionId } = useSessionContext();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isLoading) return;

    setIsLoading(true);
    try {
      // TODO: Implement chat message sending
      console.log("Sending message:", message);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-interface">
      <div className="container">
        <div className="chat-interface__container">
          <div className="chat-interface__input-container">
            <form onSubmit={handleSendMessage} className="chat-interface__form">
              <div className="chat-interface__input-wrapper">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask me anything about news articles..."
                  className="chat-interface__input"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isLoading}
                  className="chat-interface__send-button"
                >
                  {isLoading ? <div className="spinner" /> : <span>Send</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
