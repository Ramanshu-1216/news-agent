from pydantic import BaseModel
from typing import List, Optional
from langchain_core.messages import ChatMessage
from agents.embedding_agent.state import Category
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.run_retrieval.schemas import (
    ProcessedVectorDocument,
)


class Citation(BaseModel):
    url: str
    source: str


class InputState(BaseModel):
    query: str = ""
    chat_history: List[ChatMessage]
    category: Optional[Category] = "other"


class OutputState(BaseModel):
    answer: str = ""
    citations: List[Citation]


class RetrievalAgentState(InputState, OutputState):
    routing_decision: str = ""
    routing_reasoning: str = ""
    retrieved_documents: List[ProcessedVectorDocument] = []
