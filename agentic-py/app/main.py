from fastapi import FastAPI
from app.api.routes import articles
from app.services.scheduler_service import (
    start_scheduler,
    stop_scheduler,
    get_scheduler_status,
)
from app.core.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.APP_NAME)

app.include_router(articles.router)


@app.on_event("startup")
async def startup_event():
    """Start the scheduler when the app starts"""
    logger.info("Starting up Agentic API...")
    start_scheduler()


@app.on_event("shutdown")
async def shutdown_event():
    """Stop the scheduler when the app shuts down"""
    logger.info("Shutting down Agentic API...")
    stop_scheduler()


@app.get("/scheduler/status")
async def scheduler_status():
    """Get the status of the scheduler and its jobs"""
    return get_scheduler_status()
