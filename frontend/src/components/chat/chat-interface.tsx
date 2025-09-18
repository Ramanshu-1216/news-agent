"use client";

import React, { useState } from "react";
import { useChatContext } from "@/contexts/chat-context";
import "./chat-interface.scss";

export function ChatInterface() {
  const { sendMessage, isStreaming } = useChatContext();
  const [message, setMessage] = useState("");

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isStreaming) return;

    const messageToSend = message.trim();
    setMessage("");

    try {
      await sendMessage(messageToSend);
    } catch (error) {
      console.error("Failed to send message:", error);
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
                  disabled={isStreaming}
                />
                <button
                  type="submit"
                  disabled={!message.trim() || isStreaming}
                  className="chat-interface__send-button"
                  title={isStreaming ? "Sending..." : "Send message"}
                >
                  {isStreaming ? (
                    <div className="spinner" />
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
