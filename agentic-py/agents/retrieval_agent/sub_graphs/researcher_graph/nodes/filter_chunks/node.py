from agents.retrieval_agent.sub_graphs.researcher_graph.state import (
    ResearcherGraphState,
)
from typing import List
import heapq
import logging
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.run_retrieval.schemas import (
    ProcessedVectorDocument,
)


THRESHOLD_SCORE = 0.5
MAX_CHUNKS_TO_RETURN = 5

logger = logging.getLogger(__name__)


def filter_chunks(state: ResearcherGraphState) -> ResearcherGraphState:
    print("Filtering chunks")

    try:
        chunks = state.retrieved_documents
        unique_chunks = {}
        for chunk in chunks:
            chunk_id = chunk["metadata"]["chunk_id"]
            if not chunk_id:
                continue

            current_score = chunk["metadata"]["similarity_score"]
            if (
                chunk_id not in unique_chunks
                or current_score
                > unique_chunks[chunk_id]["metadata"]["similarity_score"]
            ):
                unique_chunks[chunk_id] = chunk

        final_documents: List[ProcessedVectorDocument] = [
            c
            for c in heapq.nlargest(
                MAX_CHUNKS_TO_RETURN,
                unique_chunks.values(),
                key=lambda x: x["metadata"]["similarity_score"],
            )
            if c["metadata"]["similarity_score"] > THRESHOLD_SCORE
        ]

        print(f"Filtered {len(final_documents)} chunks")

        state.final_documents = final_documents

        return state

    except Exception as e:
        logger.error(f"Error in filtering chunks: {str(e)}")
        state.final_documents = []
        return state
