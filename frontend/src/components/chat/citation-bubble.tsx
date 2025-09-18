"use client";

import React, { useState } from "react";
import { CitationData } from "@/utils/citation-parser";
import "./citation-bubble.scss";

interface CitationBubbleProps {
  number: number;
  citation: CitationData;
}

export function CitationBubble({ number, citation }: CitationBubbleProps) {
  const [showPopup, setShowPopup] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (citation.url && citation.url !== "#") {
      window.open(citation.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="citation-bubble-container">
      <span
        className="citation-bubble"
        onMouseEnter={() => setShowPopup(true)}
        onMouseLeave={() => setShowPopup(false)}
        onClick={handleClick}
        title={citation.title || citation.source || `Citation ${number}`}
      >
        [{number}]
      </span>

      {showPopup && (
        <div className="citation-popup">
          <div className="citation-popup__content">
            <h4 className="citation-popup__title">
              {citation.title || citation.source || `Source ${number}`}
            </h4>

            {citation.authors && citation.authors.length > 0 && (
              <div className="citation-popup__authors">
                <span className="citation-popup__label">By:</span>
                <span className="citation-popup__author-list">
                  {citation.authors
                    .filter((author) => author !== citation.source)
                    .join(", ")}
                </span>
              </div>
            )}

            {citation.published_date && (
              <div className="citation-popup__date">
                <span className="citation-popup__label">Published:</span>
                <span className="citation-popup__date-value">
                  {new Date(citation.published_date).toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
                </span>
              </div>
            )}

            {citation.source && (
              <div className="citation-popup__source">
                <span className="citation-popup__label">Source:</span>
                <span className="citation-popup__source-value">
                  {citation.source}
                </span>
              </div>
            )}

            {citation.snippet && (
              <div className="citation-popup__snippet">
                <span className="citation-popup__label">Summary:</span>
                <p className="citation-popup__snippet-text">
                  {citation.snippet}
                </p>
              </div>
            )}

            {citation.url && citation.url !== "#" && (
              <div className="citation-popup__url">
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="citation-popup__link"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Full Article →
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
