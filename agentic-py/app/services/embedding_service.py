import asyncio
from agents.embedding_agent.graph import run_async_graph
from app.models.articles import ArticleEmbedRequest
from agents.embedding_agent.state import InputState
from typing import List
from fastapi import BackgroundTasks
import logging


logger = logging.getLogger(__name__)


async def _process_embedding_task(states: List[InputState]):
    """Background task to process embeddings"""
    try:
        results = await asyncio.gather(
            *[run_async_graph(req) for req in states], return_exceptions=True
        )
        return results

    except Exception as e:
        logger.error(f"Error processing embedding task: {e}")
        return []


async def embed_articles(
    request: ArticleEmbedRequest, background_tasks: BackgroundTasks = None
):
    states = [
        InputState(
            rss_feed_url=req.url, num_articles=req.num_articles, category=req.category
        )
        for req in request.articles
    ]

    if request.run_in_background and background_tasks:
        background_tasks.add_task(_process_embedding_task, states)

        return {
            "status": "running",
            "message": "Task started in background",
        }
    else:
        results = await _process_embedding_task(states)
        return results
