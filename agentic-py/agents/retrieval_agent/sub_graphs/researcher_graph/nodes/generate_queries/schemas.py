from pydantic import BaseModel, Field
from typing import List


class RetrievalQueriesOutputType(BaseModel):
    chunk_queries: List[str] = Field(
        description="Exactly 3 diverse queries optimized for retrieving from vector db",
        min_length=3,
        max_length=3,
    )
