from pinecone import Pinecone
from langchain_community.embeddings import JinaEmbeddings
from langchain_pinecone import PineconeVectorStore
import os
import logging
from typing import Optional, Dict, Any
from dataclasses import dataclass
from langchain_core.vectorstores import VectorStore
import time

logger = logging.getLogger(__name__)


@dataclass
class VectorStoreConfig:
    index_name: str
    dimension: int = 1024  # jina-embeddings-v3 dimension
    metric: str = "cosine"
    embedding_model: str = "jina-embeddings-v3"
    max_retries: int = 3
    retry_delay: float = 1.0
    namespace: Optional[str] = None  # Pinecone namespace for organizing documents


# Global cache for vector store instances
_vector_store_cache: Dict[str, VectorStore] = {}
_pinecone_client: Optional[Pinecone] = None


def _generate_cache_key(index_name: str, namespace: Optional[str] = None) -> str:
    if namespace:
        return f"{index_name}:{namespace}"
    return f"{index_name}:default"


def _get_config_from_env(namespace: Optional[str] = None) -> VectorStoreConfig:
    index_name = os.getenv("PINECONE_INDEX")
    if not index_name:
        raise ValueError("PINECONE_INDEX environment variable is required")

    return VectorStoreConfig(index_name=index_name, namespace=namespace)


def _get_pinecone_client() -> Pinecone:
    global _pinecone_client
    if _pinecone_client is None:
        try:
            api_key = os.getenv("PINECONE_API_KEY")
            if not api_key:
                raise ValueError("PINECONE_API_KEY environment variable is required")

            _pinecone_client = Pinecone(api_key=api_key)
            logger.debug("Pinecone client initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Pinecone client: {e}")
            raise RuntimeError(f"Pinecone client initialization failed: {e}")
    return _pinecone_client


def _wait_for_index_ready(
    pc: Pinecone, index_name: str, max_wait_time: int = 300
) -> bool:
    start_time = time.time()
    while time.time() - start_time < max_wait_time:
        try:
            index_stats = pc.describe_index(index_name)
            if index_stats.status.get("ready", False):
                logger.info(f"Index {index_name} is ready")
                return True
            logger.info(f"Waiting for index {index_name} to be ready...")
            time.sleep(5)
        except Exception as e:
            logger.warning(f"Error checking index status: {e}")
            time.sleep(5)

    logger.error(f"Timeout waiting for index {index_name} to be ready")
    return False


def _setup_pinecone_index(config: VectorStoreConfig) -> Any:
    try:
        pc = _get_pinecone_client()

        # Check if index exists
        if not pc.has_index(config.index_name):
            logger.info(f"Creating Pinecone index: {config.index_name}")
            pc.create_index(
                name=config.index_name,
                dimension=config.dimension,
                metric=config.metric,
            )
            logger.info(f"Created Pinecone index: {config.index_name}")

            # Wait for index to be ready
            if not _wait_for_index_ready(pc, config.index_name):
                raise RuntimeError(f"Index {config.index_name} failed to become ready")
        else:
            logger.info(f"Using existing Pinecone index: {config.index_name}")

        index = pc.Index(config.index_name)
        return index

    except Exception as e:
        logger.error(f"Failed to setup Pinecone index: {e}")
        raise RuntimeError(f"Pinecone index setup failed: {e}")


def _create_embedding_model(model_name: str) -> JinaEmbeddings:
    try:
        embedding = JinaEmbeddings(model_name=model_name)
        logger.debug(f"Embedding model {model_name} initialized successfully")
        return embedding
    except Exception as e:
        logger.error(f"Failed to initialize embedding model {model_name}: {e}")
        raise RuntimeError(f"Embedding model initialization failed: {e}")


def get_vector_store(config: Optional[VectorStoreConfig] = None) -> VectorStore:
    global _vector_store_cache

    try:
        # Create config from environment if not provided
        if config is None:
            config = _get_config_from_env()

        # Generate cache key based on index name and namespace
        cache_key = _generate_cache_key(config.index_name, config.namespace)

        # Use cached instance if available
        if cache_key in _vector_store_cache:
            logger.debug(f"Returning cached vector store instance for key: {cache_key}")
            return _vector_store_cache[cache_key]

        logger.info(
            f"Initializing vector store with index: {config.index_name}, namespace: {config.namespace}"
        )

        # Setup Pinecone index
        index = _setup_pinecone_index(config)

        # Create embedding model
        embedding = _create_embedding_model(config.embedding_model)

        # Create vector store with namespace support
        vector_store = PineconeVectorStore(
            index=index, embedding=embedding, namespace=config.namespace
        )

        # Cache the instance with namespace-aware key
        _vector_store_cache[cache_key] = vector_store
        logger.debug(f"Cached vector store instance with key: {cache_key}")

        logger.info("Vector store initialized successfully")
        return vector_store

    except Exception as e:
        logger.error(f"Failed to create vector store: {e}")
        raise RuntimeError(f"Vector store creation failed: {e}")


def add_documents_to_vector_store(
    documents: list,
    config: Optional[VectorStoreConfig] = None,
    batch_size: int = 100,
) -> Dict[str, Any]:
    if not documents:
        raise ValueError("Documents list cannot be empty")

    try:
        # Use config namespace
        namespace = config.namespace if config else None

        # Create config with namespace if not provided
        if config is None:
            config = _get_config_from_env(namespace)

        vector_store = get_vector_store(config)

        namespace_info = f" in namespace '{namespace}'" if namespace else ""
        logger.info(
            f"Adding {len(documents)} documents to vector store{namespace_info}"
        )

        # Process documents in batches
        total_added = 0
        failed_docs = []

        for i in range(0, len(documents), batch_size):
            batch = documents[i : i + batch_size]
            try:
                vector_store.add_documents(batch)
                total_added += len(batch)
                logger.info(
                    f"Added batch {i//batch_size + 1}: {len(batch)} documents{namespace_info}"
                )
            except Exception as e:
                logger.error(f"Failed to add batch {i//batch_size + 1}: {e}")
                failed_docs.extend(batch)

        result = {
            "total_documents": len(documents),
            "successfully_added": total_added,
            "failed_documents": len(failed_docs),
            "success_rate": total_added / len(documents) if documents else 0,
            "namespace": namespace,
            "index_name": config.index_name,
        }

        logger.info(f"Document addition completed: {result}")
        return result

    except Exception as e:
        logger.error(f"Failed to add documents to vector store: {e}")
        raise RuntimeError(f"Document addition failed: {e}")


def clear_vector_store_cache(cache_key: Optional[str] = None):
    global _vector_store_cache, _pinecone_client

    if cache_key:
        if cache_key in _vector_store_cache:
            del _vector_store_cache[cache_key]
            logger.info(f"Cleared vector store cache for key: {cache_key}")
        else:
            logger.warning(f"Cache key not found: {cache_key}")
    else:
        cache_count = len(_vector_store_cache)
        _vector_store_cache.clear()
        _pinecone_client = None
        logger.info(f"Cleared all vector store cache entries ({cache_count} entries)")
