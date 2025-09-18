from agents.retrieval_agent.state import RetrievalAgentState
import logging
from agents.retrieval_agent.utils.utils import get_llm, format_chat_history
from agents.retrieval_agent.nodes.analyze_and_route_query.schemas import (
    RoutingDecisionOutputType,
)
from agents.retrieval_agent.nodes.analyze_and_route_query.prompts import (
    ANALYZE_AND_ROUTE_QUERY_PROMPT,
)
from langchain_core.messages import ChatMessage

logger = logging.getLogger(__name__)


def analyze_and_route_query(state: RetrievalAgentState) -> RetrievalAgentState:
    logger.info("Analyzing and routing query")
    try:
        llm = get_llm(model_name="gemini-1.5-flash")
        structured_llm = llm.with_structured_output(RoutingDecisionOutputType)

        formatted_chat_history = format_chat_history(state.chat_history)

        routing_prompt = ANALYZE_AND_ROUTE_QUERY_PROMPT.format(
            user_message=state.query, chat_history=formatted_chat_history
        )

        routing_response = structured_llm.invoke(routing_prompt)

        state.routing_decision = routing_response.routing_decision
        state.routing_reasoning = routing_response.routing_reasoning

        return state

    except Exception as e:
        logger.error(f"Error in query analysis and routing: {str(e)}")
        return state


if __name__ == "__main__":
    state = RetrievalAgentState(
        query="What is the capital of France?",
        chat_history=[
            ChatMessage(role="user", content="What is the capital of France?")
        ],
        category="news",
        routing_decision="general_conversation",
        routing_reasoning="General conversation",
        retrieved_documents=[],
        answer="The capital of France is Paris.",
        citations=[],
    )
    print(analyze_and_route_query(state))
