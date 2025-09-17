from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class Category(Enum):
    NEWS = "news"
    TECH = "tech"
    BUSINESS = "business"
    SCIENCE = "science"
    ENTERTAINMENT = "entertainment"
    SPORTS = "sports"
    POLITICS = "politics"
    ECONOMY = "economy"
    EDUCATION = "education"
    HEALTH = "health"
    TECHNOLOGY = "technology"
    OTHER = "other"


class InputState(BaseModel):
    rss_feed_url: str = Field(
        description="The URL of the RSS feed to extract articles from", min_length=1
    )
    num_articles: int = Field(
        description="The number of articles to extract",
        default=10,
        min_value=1,
        max_value=100,
    )
    category: Category = Field(
        description="The category of the articles", default=Category.OTHER
    )


class OutputState(BaseModel):
    pass


class Article(BaseModel):
    title: str = Field(description="The title of the article", min_length=1)
    description: Optional[str] = Field(
        description="The description of the article", min_length=1
    )
    content: str = Field(description="The content of the article", min_length=1)
    published_date: Optional[datetime] = Field(
        description="The published date of the article"
    )
    url: str = Field(description="The URL of the article", min_length=1)
    source: Optional[str] = Field(
        description="The source of the article", default="other"
    )
    metadata: Optional[dict] = Field(
        description="The metadata of the article", default={}
    )


class EmbeddingAgentState(InputState, OutputState):
    articles: List[Article] = Field(description="The articles to embed", default=[])
