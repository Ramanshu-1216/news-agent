import asyncio
from langgraph.graph import StateGraph, START, END
from agents.retrieval_agent.state import RetrievalAgentState, InputState, OutputState
from typing import Literal
from agents.embedding_agent.state import Category
import time
import logging

from agents.retrieval_agent.nodes.general_conversation.node import general_conversation
from agents.retrieval_agent.nodes.ask_more_info.node import ask_more_info
from agents.retrieval_agent.nodes.conduct_research.node import conduct_research
from agents.retrieval_agent.nodes.construct_response.node import construct_response
from agents.retrieval_agent.nodes.analyze_and_route_query.node import (
    analyze_and_route_query,
)

STREAMING_NODES = [
    "general_conversation",
    "ask_more_info",
    "construct_response",
]

logger = logging.getLogger(__name__)


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


graph = compile_graph()


def run_graph(state: InputState):
    return graph.invoke(state)


async def run_async_graph(state: InputState):
    return await graph.ainvoke(state)


async def stream_graph(state: InputState):
    try:
        yield {
            "event": "start",
            "data": {
                "message": "Starting retrieval agent graph...",
                "timestamp": time.time(),
            },
        }

        events = graph.astream_events(state, version="v2")
        step_count = 0
        citations = []
        full_response = ""

        async for event in events:
            step_count += 1
            kind = event["event"]
            metadata = event["metadata"]

            if not metadata:
                continue

            langgraph_node = event["metadata"]["langgraph_node"]
            if langgraph_node in STREAMING_NODES:
                if kind == "on_chat_model_stream":
                    content = event["data"]["chunk"].content
                    if content:
                        yield {
                            "event": "response_chunk",
                            "data": {
                                "chunk": content,
                                "timestamp": time.time(),
                            },
                        }
                elif kind == "on_chat_model_end":
                    complete_response = event["data"]["output"].content
                    full_response = complete_response
                    yield {
                        "event": "response_complete",
                        "data": {
                            "response": complete_response,
                            "timestamp": time.time(),
                        },
                    }

            if event["data"] and "output" in event["data"]:
                if event["data"]["output"]:
                    output = event["data"]["output"]

                    if hasattr(output, "citations") and output.citations:
                        for citation in output.citations:
                            citations.append(
                                {
                                    "url": citation.url,
                                    "source": citation.source,
                                    "authors": citation.authors,
                                    "published_date": citation.published_date,
                                    "article_id": citation.article_id,
                                }
                            )

        yield {
            "event": "complete",
            "data": {
                "message": "Retrieval agent graph completed",
                "timestamp": time.time(),
                "response": full_response,
                "citations": citations,
            },
        }

    except Exception as e:
        logger.error(f"Error in streaming retrieval agent graph: {str(e)}")
        yield {
            "event": "error",
            "data": {
                "error": str(e),
                "message": "An error occurred during processing",
                "timestamp": time.time(),
            },
        }


async def test_graph():
    state = InputState(
        query="High court judge issues arrest warrant, saying a suspect has been charged in relation to 2012 death of 21-year-old",
        chat_history=[],
        category=Category.OTHER,
    )
    result = await run_async_graph(state)
    print(result)
    return result


async def test_stream_graph():
    state = InputState(
        query="High court judge issues arrest warrant, saying a suspect has been charged in relation to 2012 death of 21-year-old",
        chat_history=[],
        category=Category.OTHER,
    )
    async for event in stream_graph(state):
        print(event)


if __name__ == "__main__":
    asyncio.run(test_stream_graph())
