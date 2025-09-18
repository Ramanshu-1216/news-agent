"use client";

import React from "react";
import { useSessionContext } from "@/contexts/session-context";
import { ChatInterface } from "@/components/chat/chat-interface";

export function Dashboard() {
  const { session } = useSessionContext();
  const hasMessages = session && session.messageCount > 0;

  // If there are messages, show chat interface
  if (hasMessages) {
    return (
      <div className="dashboard dashboard--chat">
        <div className="container">
          <div className="chat-container">
            <div className="chat-messages">
              {/* TODO: Add chat messages here */}
              <div className="chat-placeholder">
                <p
                  style={{
                    color: "rgba(255, 255, 255, 0.6)",
                    textAlign: "center",
                  }}
                >
                  Chat messages will appear here...
                </p>
              </div>
            </div>
          </div>
        </div>
        <ChatInterface />
      </div>
    );
  }

  // If no messages, show greeting and features
  return (
    <div className="dashboard dashboard--greeting">
      <div className="container">
        <div className="greeting-container">
          <div className="greeting-content">
            <h1
              className="text--4xl text--bold text--center mb-4"
              style={{ color: "var(--color-text-inverse)" }}
            >
              Welcome to News Chatbot
            </h1>
            <p
              className="text--xl text--center mb-8"
              style={{ color: "rgba(255, 255, 255, 0.8)" }}
            >
              Your AI-powered assistant for news articles and information
            </p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3 className="feature-title">AI-Powered</h3>
              <p className="feature-description">
                Advanced AI technology for intelligent responses
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📰</div>
              <h3 className="feature-title">News Focused</h3>
              <p className="feature-description">
                Specialized in news articles and current events
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3 className="feature-title">Real-time Chat</h3>
              <p className="feature-description">
                Interactive conversation with streaming responses
              </p>
            </div>
          </div>
        </div>
      </div>
      <ChatInterface />
    </div>
  );
}
