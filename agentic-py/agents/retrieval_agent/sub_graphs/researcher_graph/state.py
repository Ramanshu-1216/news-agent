from pydantic import BaseModel
from typing import List, Optional
from agents.embedding_agent.state import Category
from typing import Annotated
import operator
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.run_retrieval.schemas import (
    ProcessedVectorDocument,
)


class ResearcherGraphInputState(BaseModel):
    user_message: str
    formatted_chat_history: str
    category: Optional[Category]


class ResearcherGraphState(ResearcherGraphInputState):
    queries: List[str] = []

    retrieved_documents: Annotated[List[ProcessedVectorDocument], operator.add] = []
    completed_tasks: Annotated[List[str], operator.add] = []
    failed_tasks: Annotated[List[str], operator.add] = []

    final_documents: Optional[List[ProcessedVectorDocument]] = []


class ResearcherGraphOutputState(BaseModel):
    final_documents: List[ProcessedVectorDocument] = []
