from agents.retrieval_agent.state import RetrievalAgentState
import logging
from agents.retrieval_agent.utils.utils import format_chat_history
from agents.retrieval_agent.sub_graphs.researcher_graph.state import (
    ResearcherGraphInputState,
)
from agents.retrieval_agent.sub_graphs.researcher_graph.graph import (
    compile_researcher_graph,
)
from agents.embedding_agent.state import Category
from pprint import pprint

logger = logging.getLogger(__name__)


researcher_graph = compile_researcher_graph()


def conduct_research(state: RetrievalAgentState) -> RetrievalAgentState:
    logger.info("Conducting research")

    try:
        formatted_chat_history = format_chat_history(state.chat_history)

        researcher_graph_input_state: ResearcherGraphInputState = (
            ResearcherGraphInputState(
                user_message=state.query,
                formatted_chat_history=formatted_chat_history,
                category=state.category,
            )
        )

        researcher_graph_output = researcher_graph.invoke(researcher_graph_input_state)

        state.retrieved_documents = researcher_graph_output["final_documents"]

        pprint([doc["metadata"] for doc in state.retrieved_documents])

        return state

    except Exception as e:
        logger.error(f"Error in conducting research: {str(e)}")
        return state


if __name__ == "__main__":
    state = RetrievalAgentState(
        chat_history=[],
        query="Julia Chuñil is one of 146 land defenders who were killed or went missing last year, a third of them from Indigenous communities",
        retrieved_documents=[],
        answer="The capital of India is New Delhi.",
        citations=[],
        routing_decision="general_conversation",
        routing_reasoning="General conversation",
        category=Category.OTHER,
    )
    conduct_research(state)
    print(state.retrieved_documents)
