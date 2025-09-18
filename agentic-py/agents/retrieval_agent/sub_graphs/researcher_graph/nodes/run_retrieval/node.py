from agents.retrieval_agent.sub_graphs.researcher_graph.state import (
    ResearcherGraphState,
)
import logging
from agents.common.vector_store import get_vector_store
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.run_retrieval.utils import (
    process_chunk_document,
)
from agents.common.vector_store import VectorStoreConfig

logger = logging.getLogger(__name__)

INDEX_NAME = "voosh-foods"
EMBEDDING_DIMENSION = 1024
EMBEDDING_MODEL_NAME = "jina-embeddings-v3"
MAX_RESULTS_PER_QUERY = 5


def run_retrieval(state: dict) -> ResearcherGraphState:
    try:
        query = state["query"]
        category = state["category"]

        logger.info(f"Retrieving chunks for query: {query[:100]}...")

        vector_store_config = VectorStoreConfig(
            index_name=INDEX_NAME,
            dimension=EMBEDDING_DIMENSION,
            embedding_model=EMBEDDING_MODEL_NAME,
        )

        vector_store = get_vector_store(vector_store_config)

        documents = vector_store.similarity_search_with_score(
            query=query, k=MAX_RESULTS_PER_QUERY
        )

        processed_documents = []

        for doc, score in documents:
            processed_doc = process_chunk_document(doc, score)
            if processed_doc:
                processed_documents.append(processed_doc)

        logger.info(f"Retrieved {len(processed_documents)} chunk documents")

        return {"retrieved_documents": processed_documents}

    except Exception as e:
        logger.error(f"Error retrieving chunk documents: {str(e)}")
        return {"retrieved_documents": []}
