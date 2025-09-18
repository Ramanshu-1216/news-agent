from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import articles, chat
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

# Add CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(articles.router)
app.include_router(chat.router)


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
