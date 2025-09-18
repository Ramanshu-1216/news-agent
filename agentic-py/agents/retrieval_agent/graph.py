import asyncio
from langgraph.graph import StateGraph, START, END
from agents.retrieval_agent.state import RetrievalAgentState, InputState, OutputState
from typing import Literal
from agents.embedding_agent.state import Category

from agents.retrieval_agent.nodes.general_conversation.node import general_conversation
from agents.retrieval_agent.nodes.ask_more_info.node import ask_more_info
from agents.retrieval_agent.nodes.conduct_research.node import conduct_research
from agents.retrieval_agent.nodes.construct_response.node import construct_response
from agents.retrieval_agent.nodes.analyze_and_route_query.node import (
    analyze_and_route_query,
)


def route_query(
    state: RetrievalAgentState,
) -> Literal["general_conversation", "ask_more_info", "conduct_research"]:
    match state.routing_decision:
        case "general_conversation":
            return "general_conversation"
        case "ask_more_info":
            return "ask_more_info"
        case "conduct_research":
            return "conduct_research"
        case _:
            return "conduct_research"


def create_graph() -> StateGraph:
    graph = StateGraph(
        state_schema=RetrievalAgentState,
        input_schema=InputState,
        output_schema=OutputState,
    )
    graph.add_node("analyze_and_route_query", analyze_and_route_query)
    graph.add_node("general_conversation", general_conversation)
    graph.add_node("ask_more_info", ask_more_info)
    graph.add_node("conduct_research", conduct_research)
    graph.add_node("construct_response", construct_response)

    graph.add_edge(START, "analyze_and_route_query")
    graph.add_conditional_edges("analyze_and_route_query", route_query)
    graph.add_edge("conduct_research", "construct_response")
    graph.add_edge("general_conversation", END)
    graph.add_edge("ask_more_info", END)
    graph.add_edge("construct_response", END)

    return graph


def compile_graph():
    graph = create_graph()
    return graph.compile()


def run_graph(state: InputState):
    graph = compile_graph()
    return graph.invoke(state)


async def run_async_graph(state: InputState):
    graph = compile_graph()
    return await graph.ainvoke(state)


async def test_graph():
    state = InputState(
        query="What is the capital of France?",
        chat_history=[],
        category=Category.OTHER,
    )
    result = await run_async_graph(state)
    print(result)
    return result


if __name__ == "__main__":
    asyncio.run(test_graph())
