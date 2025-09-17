import asyncio
from langgraph.graph import START, END, StateGraph
from agents.embedding_agent.state import (
    EmbeddingAgentState,
    InputState,
    OutputState,
    Category,
)
from agents.embedding_agent.nodes.extract_articles.node import extract_articles
from agents.embedding_agent.nodes.embed_articles.node import embed_articles


def create_graph():
    graph = StateGraph(
        state_schema=EmbeddingAgentState,
        input_schema=InputState,
        output_schema=OutputState,
    )

    graph.add_node("extract_articles", extract_articles)
    graph.add_node("embed_articles", embed_articles)

    graph.add_edge(START, "extract_articles")
    graph.add_edge("extract_articles", "embed_articles")
    graph.add_edge("embed_articles", END)

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
    result = await run_async_graph(
        state=InputState(
            rss_feed_url="https://www.theguardian.com/world/rss",
            num_articles=10,
            category=Category.NEWS,
        )
    )
    print(result)
    return result


if __name__ == "__main__":
    asyncio.run(test_graph())
