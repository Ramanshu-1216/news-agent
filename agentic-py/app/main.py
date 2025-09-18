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

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(articles.router)
app.include_router(chat.router)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Agentic API...")
    start_scheduler()


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Agentic API...")
    stop_scheduler()


@app.get("/scheduler/status")
async def scheduler_status():
    return get_scheduler_status()


@app.get("/")
def read_root():
    return {"message": "Hello Render!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
