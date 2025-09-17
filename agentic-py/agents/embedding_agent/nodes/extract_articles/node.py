from agents.embedding_agent.state import EmbeddingAgentState, Article
from newsplease import NewsPlease
import feedparser
from typing import Optional, List, TypedDict
from datetime import datetime


class NewsPleaseArticle(TypedDict):
    authors: Optional[List[str]]
    date_download: Optional[datetime]
    date_modify: Optional[datetime]
    date_publish: Optional[datetime]
    description: Optional[str]
    filename: Optional[str]
    image_url: Optional[str]
    language: Optional[str]
    localpath: Optional[str]
    source_domain: Optional[str]
    maintext: Optional[str]
    title: Optional[str]
    title_page: Optional[str]
    title_rss: Optional[str]
    url: Optional[str]


def extract_articles(state: EmbeddingAgentState):
    print("Extracting articles...")
    rss_feed_url = state.rss_feed_url
    num_articles = state.num_articles

    feed = feedparser.parse(rss_feed_url)

    urls = []
    for entry in feed.entries:
        urls.append(entry.link)

    articles = []
    for url in urls[:num_articles]:
        article: NewsPleaseArticle = NewsPlease.from_url(url)
        articles.append(
            Article(
                title=article.title,
                description=article.description,
                content=article.maintext,
                published_date=article.date_publish,
                url=article.url,
                source=article.source_domain,
                metadata={
                    "authors": article.authors,
                    "date_download": article.date_download,
                    "date_modify": article.date_modify,
                    "filename": article.filename,
                    "image_url": article.image_url,
                    "language": article.language,
                    "localpath": article.localpath,
                    "title_page": article.title_page,
                    "title_rss": article.title_rss,
                },
            )
        )

    print(f"Extracted {len(articles)} articles")
    state.articles = articles
    return state


if __name__ == "__main__":
    state = EmbeddingAgentState(
        rss_feed_url="https://www.bbc.com/news/rss.xml", num_articles=50
    )
    state = extract_articles(state)
