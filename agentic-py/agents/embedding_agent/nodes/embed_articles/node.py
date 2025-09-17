from agents.embedding_agent.state import EmbeddingAgentState
from langchain_text_splitters import RecursiveCharacterTextSplitter
import dotenv
import logging
from agents.embedding_agent.nodes.extract_articles.node import extract_articles
from agents.embedding_agent.nodes.embed_articles.utils import (
    get_token_count,
    convert_to_documents,
    enhance_chunks,
)
from agents.embedding_agent.nodes.embed_articles.config import EmbeddingConfig
from agents.common.vector_store import (
    add_documents_to_vector_store,
    _get_config_from_env,
)


logger = logging.getLogger(__name__)

dotenv.load_dotenv()


def embed_articles(state: EmbeddingAgentState) -> EmbeddingAgentState:
    # Use default embedding config for chunking parameters
    embedding_config = EmbeddingConfig()

    logger.info(f"Processing {len(state.articles)} articles for embedding")

    try:
        # Convert articles to Document objects
        documents = convert_to_documents(state.articles)

        # Split documents into chunks
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=embedding_config.chunk_size,
            chunk_overlap=embedding_config.chunk_overlap,
            length_function=get_token_count,
        )
        chunks = text_splitter.split_documents(documents)

        # Enhance chunks
        enhanced_chunks = enhance_chunks(chunks, state.articles)

        # Add chunks to vector store with category support

        vector_store_config = _get_config_from_env(
            namespace=state.category.value,
        )
        try:
            result = add_documents_to_vector_store(
                enhanced_chunks, config=vector_store_config
            )
            logger.info(
                f"Successfully added {result['successfully_added']} documents to vector store{vector_store_config.namespace}"
            )

            if result["failed_documents"] > 0:
                logger.warning(
                    f"Failed to add {result['failed_documents']} documents to vector store{vector_store_config.namespace}"
                )
        except Exception as e:
            logger.error(f"Failed to add documents to vector store: {e}")
            raise RuntimeError(f"Vector store operation failed: {e}")

        return state

    except Exception as e:
        logger.error(f"Failed to process articles for embedding: {e}")
        raise RuntimeError(f"Article embedding failed: {e}")


# Debug and test the node
if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)

    try:
        state = EmbeddingAgentState(
            rss_feed_url="https://www.bbc.com/news/rss.xml",
            num_articles=1,
        )
        state = extract_articles(state)

        if state.articles:
            state = embed_articles(state)

            print(f"Articles processed and embedded in namespace: {state.category}")
        else:
            print("No articles extracted")

    except Exception as e:
        logger.error(f"Test failed: {e}")
        print(f"Error: {e}")
