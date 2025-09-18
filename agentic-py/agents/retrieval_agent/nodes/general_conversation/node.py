from agents.retrieval_agent.state import RetrievalAgentState
from agents.retrieval_agent.utils.utils import get_llm, format_chat_history
from agents.retrieval_agent.nodes.general_conversation.prompts import (
    GENERAL_CONVERSATION_PROMPT,
)
import logging

logger = logging.getLogger(__name__)


def general_conversation(state: RetrievalAgentState) -> RetrievalAgentState:
    logger.info("Responding to general conversation")
    try:
        llm = get_llm(model_name="gemini-1.5-flash", temperature=1)

        formatted_chat_history = format_chat_history(state.chat_history)

        general_conversation_prompt = GENERAL_CONVERSATION_PROMPT.format(
            user_message=state.query,
            chat_history=formatted_chat_history,
            routing_reasoning=state.routing_reasoning,
        )

        response = llm.invoke(general_conversation_prompt)

        state.answer = response
        state.citations = []

        return state
    except Exception as e:
        logger.error(f"Error in responding to general conversation: {str(e)}")
        return state
