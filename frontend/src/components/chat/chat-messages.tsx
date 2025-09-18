"use client";

import React, { useEffect, useRef } from "react";
import { ChatMessage } from "@/hooks/use-chat-stream";
import { MessageContent } from "./message-content";
import { CitationData } from "@/utils/citation-parser";
import "./chat-messages.scss";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isStreaming?: boolean;
  streamingMessage?: string;
}

export function ChatMessages({
  messages,
  isStreaming = false,
  streamingMessage = "",
}: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(timestamp);
  };

  return (
    <div className="chat-messages">
      <div className="chat-messages__container">
        {messages.length === 0 && !isStreaming ? (
          <div className="chat-messages__empty">
            <div className="chat-messages__empty-icon">💬</div>
            <h3>Start a conversation</h3>
            <p>Ask me anything about news articles and current events!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-message chat-message--${message.role}`}
              >
                <div className="chat-message__content">
                  <div className="chat-message__text">
                    <MessageContent
                      content={message.content}
                      citations={message.citations as CitationData[]}
                    />
                  </div>
                  {message.citations && message.citations.length > 0 && (
                    <div className="chat-message__citations">
                      <h4>Sources:</h4>
                      <div className="chat-message__sources-list">
                        {message.citations.map((citation, index) => {
                          const citationObj = citation as {
                            article_id?: string;
                            id?: string;
                            url?: string;
                            title?: string;
                            source?: string;
                          };
                          const displayTitle =
                            citationObj.title ||
                            citationObj.source ||
                            (citationObj.url
                              ? new URL(citationObj.url).hostname
                              : `Source ${index + 1}`);
                          return (
                            <a
                              key={index}
                              href={citationObj.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="chat-message__citation-link"
                            >
                              {displayTitle}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
                <div className="chat-message__timestamp">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            ))}

            {isStreaming && (
              <div className="chat-message chat-message--assistant chat-message--streaming">
                <div className="chat-message__content">
                  <div className="chat-message__text">
                    <MessageContent content={streamingMessage} citations={[]} />
                    <span className="chat-message__cursor">|</span>
                  </div>
                </div>
                <div className="chat-message__timestamp">
                  {formatTimestamp(new Date())}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </div>
  );
}
