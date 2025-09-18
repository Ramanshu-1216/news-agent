from typing import TypedDict, List
from agents.embedding_agent.state import Category


class VectorDocumentMetadata(TypedDict):
    authors: List[str]
    description: str
    title: str
    url: str
    published_date: str
    date_download: str
    similarity_score: float
    chunk_id: str
    category: str


class ProcessedVectorDocument(TypedDict):
    content: str
    metadata: VectorDocumentMetadata
