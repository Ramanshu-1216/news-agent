from typing import Literal
from langchain_google_genai import ChatGoogleGenerativeAI
from typing import List
from langchain_core.messages import ChatMessage
import dotenv
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.run_retrieval.schemas import (
    ProcessedVectorDocument,
)

dotenv.load_dotenv()


def get_llm(
    model_name: Literal[
        "gemini-1.5-flash",
        "gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "gemini-2.5-flash",
    ] = "gemini-1.5-flash",
    temperature: float = 0.0,
    max_tokens: int | None = None,
):
    # Build kwargs for Gemini models
    kwargs: dict = {
        "model": model_name,
        "temperature": float(temperature),
    }

    if max_tokens is not None:
        kwargs["max_tokens"] = max_tokens

    return ChatGoogleGenerativeAI(**kwargs)


def format_chat_history(chat_history: List[ChatMessage], n: int = 5) -> str:
    return (
        "\n\n".join([f"{msg.role}: {msg.content}" for msg in chat_history[:n]])
        if chat_history
        else "No previous conversation"
    )


def format_retrieved_documents(
    retrieved_documents: List[ProcessedVectorDocument],
) -> str:
    formatted_documents = []
    for doc in retrieved_documents:
        formatted_documents.append(
            f"Article ID: {doc['metadata']['article_id']}\n"
            f"Title: {doc['metadata']['title']}\n"
            f"Description: {doc['metadata']['description']}\n"
            f"Content: {doc['content'].split('__Content__:')[1]}"
        )

    return f"\n{"-" * 10}n".join(formatted_documents)
