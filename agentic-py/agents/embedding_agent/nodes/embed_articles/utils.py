from typing import Optional
import tiktoken
import logging
from agents.embedding_agent.state import Article
from langchain_core.documents import Document
from typing import List
from datetime import datetime


logger = logging.getLogger(__name__)


# Global tokenizer cache
_TOKENIZER: Optional[tiktoken.Encoding] = None


def get_tokenizer() -> tiktoken.Encoding:
    global _TOKENIZER
    if _TOKENIZER is None:
        try:
            _TOKENIZER = tiktoken.get_encoding("cl100k_base")
            logger.debug("Tokenizer initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize tokenizer: {e}")
            raise RuntimeError(f"Tokenizer initialization failed: {e}")
    return _TOKENIZER


def get_token_count(text: str) -> int:
    if not text or not isinstance(text, str):
        return 0

    try:
        tokenizer = get_tokenizer()
        tokens = tokenizer.encode(text)
        return len(tokens)
    except Exception as e:
        logger.error(f"Tokenization failed for text of length {len(text)}: {e}")
        # Fallback to character count / 4 (rough approximation)
        fallback_count = len(text) // 4
        logger.warning(f"Using fallback token count: {fallback_count}")
        return fallback_count


def convert_to_documents(articles: List[Article]) -> List[Document]:
    documents = []
    for i, article in enumerate(articles):
        try:
            if not article.content or not article.title:
                logger.warning(f"Skipping article {i}: missing content or title")
                continue

            document = Document(
                page_content=article.content,
                metadata={
                    **sanitize_metadata(
                        {**article.metadata, "published_date": article.published_date}
                    ),
                    "title": article.title,
                    "description": article.description,
                    "url": article.url,
                    "source": article.source,
                },
            )
            documents.append(document)
        except Exception as e:
            logger.error(f"Failed to convert article {i} to document: {e}")
            continue

    logger.info(f"Successfully converted {len(documents)} articles to documents")
    return documents


def sanitize_metadata(metadata: dict) -> dict:
    clean = {}
    for k, v in metadata.items():
        if isinstance(v, datetime):
            clean[k] = v.isoformat()  # Convert datetime to str
        elif v is None:
            continue  # optional: drop None values
        else:
            clean[k] = v
    return clean
