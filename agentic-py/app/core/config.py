from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Agentic API"
    DEBUG: bool = True
    PINECONE_API_KEY: str
    PINECONE_INDEX: str
    JINA_API_KEY: str
    GOOGLE_API_KEY: str

    # Security settings
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:8001",
        "https://backend-mc9s.onrender.com",
    ]

    # Scheduler settings
    ENABLE_SCHEDULER: bool = True
    EMBEDDING_CRON_HOURS: int = 12  # Run every 12 hours

    class Config:
        env_file = ".env"
        extra = "ignore"  # Ignore extra fields in environment variables


settings = Settings()
