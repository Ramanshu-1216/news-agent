from agents.retrieval_agent.sub_graphs.researcher_graph.state import (
    ResearcherGraphState,
)
from agents.retrieval_agent.utils.utils import get_llm
import logging
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.generate_queries.schemas import (
    RetrievalQueriesOutputType,
)
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.generate_queries.prompts import (
    GENERATE_DIVERSE_QUERIES_PROMPT,
)

logger = logging.getLogger(__name__)


def generate_queries(state: ResearcherGraphState) -> ResearcherGraphState:
    logger.info("Generating queries")
    try:
        llm = get_llm(model_name="gemini-2.5-flash-lite", temperature=0.7)
        structured_llm = llm.with_structured_output(RetrievalQueriesOutputType)

        prompt = GENERATE_DIVERSE_QUERIES_PROMPT.format(
            user_message=state.user_message,
            chat_history=state.formatted_chat_history,
            category=state.category,
        )

        logger.info("User query: " + state.user_message)

        queries_result: RetrievalQueriesOutputType = structured_llm.invoke(prompt)
        queries = queries_result.chunk_queries[:3]

        state.queries = queries

        return state

    except Exception as e:
        logger.error(f"Error in generating queries: {str(e)}")
        return state
