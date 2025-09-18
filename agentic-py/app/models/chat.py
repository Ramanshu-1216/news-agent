from pydantic import BaseModel, Field
from typing import List, Optional
from langchain_core.messages import ChatMessage
from agents.embedding_agent.state import Category


class ChatMessage(BaseModel):
    role: str = Field(description="The role of the message sender (user/assistant)")
    content: str = Field(description="The content of the message")


class ChatRequest(BaseModel):
    query: str = Field(description="The user's query", min_length=1)
    chat_history: List[ChatMessage] = Field(
        description="Previous chat messages for context", default=[]
    )
    category: Optional[Category] = Field(
        description="The category of the query", default=Category.OTHER
    )


class StreamEvent(BaseModel):
    event: str = Field(description="The type of event")
    data: dict = Field(description="The event data")
