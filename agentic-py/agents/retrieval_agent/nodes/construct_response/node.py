from agents.retrieval_agent.state import RetrievalAgentState
import logging
from agents.retrieval_agent.utils.utils import (
    get_llm,
    format_chat_history,
    format_retrieved_documents,
)
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.run_retrieval.schemas import (
    ProcessedVectorDocument,
)

from agents.retrieval_agent.nodes.construct_response.prompts import (
    ANALYZE_AND_CONSTRUCT_ANSWER_PROMPT,
)

logger = logging.getLogger(__name__)


def construct_response(state: RetrievalAgentState) -> RetrievalAgentState:
    logger.info("Analyzing and constructing answer")
    try:
        print(f"Analyzing and constructing answer for {state.query}")

        llm = get_llm(model_name="gemini-2.5-flash", temperature=0.5)
        formatted_chat_history = format_chat_history(state.chat_history)

        formatted_retrieved_documents = format_retrieved_documents(
            state.retrieved_documents
        )

        analyze_and_construct_answer_prompt = (
            ANALYZE_AND_CONSTRUCT_ANSWER_PROMPT.format(
                user_message=state.query,
                chat_history=formatted_chat_history,
                retrieved_documents=formatted_retrieved_documents,
            )
        )

        response = llm.invoke(analyze_and_construct_answer_prompt)

        state.answer = response
        state.citations = []

        return state

    except Exception as e:
        logger.error(f"Error in analyzing and constructing answer: {str(e)}")
        return state


if __name__ == "__main__":
    state = RetrievalAgentState(
        query="What is the capital of France?",
        chat_history=[],
        retrieved_documents=[
            ProcessedVectorDocument(
                content="The capital of France is Paris.",
                metadata={
                    "title": "The capital of France",
                    "description": "The capital of France is Paris.",
                    "url": "https://www.google.com",
                    "published_date": "2021-01-01",
                    "date_download": "2021-01-01",
                    "similarity_score": 0.9,
                    "chunk_id": "123",
                    "category": "news",
                    "authors": ["John Doe"],
                },
            )
        ],
        answer="The capital of France is Paris.",
        citations=[],
    )
    print(construct_response(state))
