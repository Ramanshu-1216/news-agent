"use client";

import React from "react";
import { CitationBubble } from "./citation-bubble";
import {
  parseMessageWithCitations,
  CitationData,
} from "@/utils/citation-parser";

interface MessageContentProps {
  content: string;
  citations?: CitationData[];
}

export function MessageContent({
  content,
  citations = [],
}: MessageContentProps) {
  const { content: processedContent, citations: orderedCitations } =
    parseMessageWithCitations(content, citations);

  // Split content by citation references and render them
  const parts = processedContent.split(/(\[\d+\])/g);

  return (
    <span>
      {parts.map((part, index) => {
        // Check if this part is a citation reference like [1], [2], etc.
        const citationMatch = part.match(/^\[(\d+)\]$/);

        if (citationMatch) {
          const citationNumber = parseInt(citationMatch[1], 10);
          const citation = orderedCitations[citationNumber - 1];

          if (citation) {
            return (
              <CitationBubble
                key={index}
                number={citationNumber}
                citation={citation}
              />
            );
          }
        }

        // Regular text content
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
