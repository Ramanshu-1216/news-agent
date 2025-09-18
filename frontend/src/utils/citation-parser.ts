export interface CitationData {
  id?: string;
  article_id?: string;
  title?: string;
  url?: string;
  snippet?: string;
  source?: string;
  authors?: string[];
  published_date?: string;
}

export interface ParsedMessage {
  content: string;
  citations: CitationData[];
}

export function parseMessageWithCitations(
  message: string,
  citations: CitationData[] = []
): ParsedMessage {
  // Create a map of article IDs to citation data
  const citationMap = new Map<string, CitationData>();
  citations.forEach((citation) => {
    const articleId = citation.article_id || citation.id;
    if (articleId) {
      citationMap.set(articleId, citation);
    }
  });

  // Find all citation IDs in the message (complete art_xxxxx format)
  const citationRegex = /\[\[(art_[a-f0-9]+)\]\]/g;
  const foundCitations = new Set<string>();
  let match;

  while ((match = citationRegex.exec(message)) !== null) {
    foundCitations.add(match[1]); // This is the complete art_xxxxx ID
  }

  // Create ordered list of unique citations
  const orderedCitations = Array.from(foundCitations).map((articleId) => {
    const citation = citationMap.get(articleId);
    return (
      citation || {
        article_id: articleId,
        title: `Article ${articleId}`,
        url: "#",
      }
    );
  });

  // Replace citation IDs with numbered references
  let processedContent = message;
  let citationIndex = 1;

  orderedCitations.forEach((citation) => {
    const articleId = citation.article_id || citation.id;
    if (articleId) {
      const citationRegex = new RegExp(`\\[\\[${articleId}\\]\\]`, "g");
      processedContent = processedContent.replace(
        citationRegex,
        `[${citationIndex}]`
      );
      citationIndex++;
    }
  });

  return {
    content: processedContent,
    citations: orderedCitations,
  };
}
