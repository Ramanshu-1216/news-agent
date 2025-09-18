from typing import TypedDict, List


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
    article_id: str
    source: str


class ProcessedVectorDocument(TypedDict):
    content: str
    metadata: VectorDocumentMetadata
