from agents.retrieval_agent.state import RetrievalAgentState
import logging
from agents.retrieval_agent.utils.utils import get_llm, format_chat_history
from agents.retrieval_agent.nodes.ask_more_info.prompts import ASK_FOR_MORE_INFO_PROMPT

logger = logging.getLogger(__name__)


def ask_more_info(state: RetrievalAgentState) -> RetrievalAgentState:
    logger.info("Asking for more info")
    try:
        llm = get_llm(model_name="gemini-1.5-flash", temperature=0.5)
        formatted_chat_history = format_chat_history(state.chat_history)

        ask_for_more_info_prompt = ASK_FOR_MORE_INFO_PROMPT.format(
            user_message=state.query,
            chat_history=formatted_chat_history,
            routing_reasoning=state.routing_reasoning,
        )

        response = llm.invoke(ask_for_more_info_prompt)

        state.answer = response
        state.citations = []

        return state

    except Exception as e:
        logger.error(f"Error in asking for more info: {str(e)}")
        return state
