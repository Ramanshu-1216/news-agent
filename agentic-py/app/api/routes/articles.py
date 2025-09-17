from fastapi import APIRouter, BackgroundTasks
from app.services.embedding_service import embed_articles
from app.models.articles import ArticleEmbedRequest

router = APIRouter(prefix="/articles", tags=["articles"])


@router.post("/embed")
async def embed(request: ArticleEmbedRequest, background_tasks: BackgroundTasks):
    return await embed_articles(request, background_tasks)
