import re
from typing import List
from agents.retrieval_agent.sub_graphs.researcher_graph.nodes.run_retrieval.schemas import (
    ProcessedVectorDocument,
)


def extract_article_ids(text: str):
    pattern = r"\[\[(art_[a-zA-Z0-9]+)\]\]"
    article_ids = re.findall(pattern, text)
    unique_article_ids = list(set(article_ids))
    return unique_article_ids


def format_retrieved_documents(
    retrieved_documents: List[ProcessedVectorDocument],
) -> str:
    formatted_documents = []
    for doc in retrieved_documents:
        formatted_documents.append(
            f"Article ID: {doc['metadata']['article_id']}\n"
            f"Title: {doc['metadata']['title']}\n"
            f"Description: {doc['metadata']['description']}\n"
            f"Content: {doc['content'].split('__Content__:')[1]}\n"
            f"Source: {doc['metadata']['source']}\n"
            f"Published Date: {doc['metadata']['published_date']}\n"
            f"Authors: {doc['metadata']['authors']}\n"
        )

    return f"\n{"-" * 10}\n".join(formatted_documents)
