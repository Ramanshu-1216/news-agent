from pydantic import BaseModel
from agents.embedding_agent.state import Category
from typing import List


class ArticleBody(BaseModel):
    url: str
    num_articles: int = 10
    category: Category = Category.OTHER


class ArticleEmbedRequest(BaseModel):
    articles: List[ArticleBody]
    run_in_background: bool = False
