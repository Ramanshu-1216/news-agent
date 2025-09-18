from langgraph.graph import StateGraph, START, END
from agents.retrieval_agent.sub_graphs.researcher_graph.state import (
    ResearcherGraphState,
    ResearcherGraphInputState,
    ResearcherGraphOutputState,
)
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.generate_queries.node import (
    generate_queries,
)
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.run_retrieval.node import (
    run_retrieval,
)
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.filter_chunks.node import (
    filter_chunks,
)
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.run_retrieval.utils import (
    parallel_retriever_router,
)


def create_graph() -> StateGraph:
    graph = StateGraph(
        state_schema=ResearcherGraphState,
        input_schema=ResearcherGraphInputState,
        output_schema=ResearcherGraphOutputState,
    )

    graph.add_node("generate_queries", generate_queries)
    graph.add_node("run_retrieval", run_retrieval)
    graph.add_node("filter_chunks", filter_chunks)

    graph.add_edge(START, "generate_queries")
    graph.add_conditional_edges("generate_queries", parallel_retriever_router)
    graph.add_edge("run_retrieval", "filter_chunks")
    graph.add_edge("filter_chunks", END)
    return graph


def compile_researcher_graph():
    graph = create_graph()
    return graph.compile()
