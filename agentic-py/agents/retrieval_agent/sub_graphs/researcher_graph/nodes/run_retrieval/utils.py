from agents.retrieval_agent.sub_graphs.researcher_graph.state import (
    ResearcherGraphState,
)
from langgraph.types import Send
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.run_retrieval.schemas import (
    VectorDocumentMetadata,
    ProcessedVectorDocument,
)
from langchain_core.documents import Document
import logging

logger = logging.getLogger(__name__)


def parallel_retriever_router(state: ResearcherGraphState):
    print("Parallel retrieval")
    try:
        return [
            Send(
                "run_retrieval",
                {
                    "query": query,
                    "category": state.category,
                },
            )
            for query in state.queries
        ]

    except Exception as e:
        logger.error(f"Error in parallel retrieval: {str(e)}")
        state.retrieved_documents = []
        return state


def process_chunk_document(doc: Document, score: float) -> ProcessedVectorDocument:
    logger.info(f"Processing chunk document: {doc.metadata}")
    try:
        metadata = VectorDocumentMetadata(
            authors=doc.metadata["authors"],
            description=doc.metadata["description"],
            title=doc.metadata["title"],
            url=doc.metadata["url"],
            published_date=doc.metadata["published_date"],
            date_download=doc.metadata["date_download"],
            similarity_score=score,
            chunk_id=doc.metadata["chunk_id"],
            category=doc.metadata["category"],
            article_id=doc.metadata["article_id"],
        )

        return ProcessedVectorDocument(
            content=doc.page_content,
            metadata=metadata,
        )
    except Exception as e:
        logger.error(f"Error processing chunk document: {str(e)}")
        raise e
