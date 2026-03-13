from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ScrapedArticle(BaseModel):
    title: str
    slug: str
    author: str
    published_at: Optional[str] = None
    hero_image_url: Optional[str] = None
    excerpt: Optional[str] = None
    body: str
    source_url: str
    category: str = "News"


class ArticleRecord(ScrapedArticle):
    id: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ScrapeStatus(BaseModel):
    status: str
    message: str
    articles_found: int = 0
    articles_saved: int = 0
    timestamp: str = datetime.utcnow().isoformat()
