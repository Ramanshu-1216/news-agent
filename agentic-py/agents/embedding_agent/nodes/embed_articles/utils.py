from typing import Optional
import tiktoken
import logging
import uuid
from agents.embedding_agent.state import Article, Category
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


def convert_to_documents(articles: List[Article], category: Category) -> List[Document]:
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
                    "category": category.value,
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


def enhance_chunks(chunks: List[Document], articles: List[Article]) -> List[Document]:
    url_to_article = {article.url: article for article in articles}

    enhanced_chunks = []

    for chunk in chunks:
        try:
            chunk_url = chunk.metadata.get("url")

            if not chunk_url:
                logger.warning(f"Chunk missing URL in metadata, skipping enhancement")
                # Add chunk ID even for skipped chunks
                chunk_id = f"cnk_{uuid.uuid4().hex[:8]}"
                skip_metadata = chunk.metadata.copy()
                skip_metadata["chunk_id"] = chunk_id

                skip_chunk = Document(
                    page_content=chunk.page_content, metadata=skip_metadata
                )
                enhanced_chunks.append(skip_chunk)
                continue

            # Find the corresponding article
            article = url_to_article.get(chunk_url)

            if not article:
                logger.warning(
                    f"No article found for URL: {chunk_url}, skipping enhancement"
                )
                # Add chunk ID even for skipped chunks
                chunk_id = f"cnk_{uuid.uuid4().hex[:8]}"
                skip_metadata = chunk.metadata.copy()
                skip_metadata["chunk_id"] = chunk_id

                skip_chunk = Document(
                    page_content=chunk.page_content, metadata=skip_metadata
                )
                enhanced_chunks.append(skip_chunk)
                continue

            # Create enhanced page content
            enhanced_content_parts = []

            # Add title if available
            if article.title:
                enhanced_content_parts.append(f"Title: {article.title}")

            # Add description if available
            if article.description:
                enhanced_content_parts.append(f"Description: {article.description}")

            # Add separator and original content
            if enhanced_content_parts:
                enhanced_content_parts.append("Content:")
                enhanced_content = (
                    "\n\n".join(enhanced_content_parts) + "\n\n" + chunk.page_content
                )
            else:
                enhanced_content = chunk.page_content

            # Generate unique chunk ID
            chunk_id = f"cnk_{uuid.uuid4().hex[:8]}"

            # Create enhanced chunk with chunk ID in metadata
            enhanced_metadata = chunk.metadata.copy()
            enhanced_metadata["chunk_id"] = chunk_id

            enhanced_chunk = Document(
                page_content=enhanced_content, metadata=enhanced_metadata
            )

            enhanced_chunks.append(enhanced_chunk)

        except Exception as e:
            logger.error(f"Error enhancing chunk: {e}")
            # If enhancement fails, keep the original chunk but add chunk ID
            chunk_id = f"cnk_{uuid.uuid4().hex[:8]}"
            fallback_metadata = chunk.metadata.copy()
            fallback_metadata["chunk_id"] = chunk_id

            fallback_chunk = Document(
                page_content=chunk.page_content, metadata=fallback_metadata
            )
            enhanced_chunks.append(fallback_chunk)

    logger.info(f"Enhanced {len(enhanced_chunks)} chunks with article metadata")
    return enhanced_chunks
