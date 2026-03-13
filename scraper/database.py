from supabase import create_client, Client
from config import SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
from models import ScrapedArticle
from typing import Optional
import logging

logger = logging.getLogger(__name__)

_client: Optional[Client] = None


def get_client() -> Client:
    global _client
    if _client is None:
        if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env"
            )
        _client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return _client


def article_exists(source_url: str) -> bool:
    """Check if an article with this source URL already exists (deduplication)."""
    try:
        client = get_client()
        result = (
            client.table("news_articles")
            .select("id")
            .eq("source_url", source_url)
            .limit(1)
            .execute()
        )
        return len(result.data) > 0
    except Exception as e:
        logger.error(f"Error checking article existence: {e}")
        return False


def save_article(article: ScrapedArticle) -> bool:
    """Save a scraped article to Supabase. Returns True if saved successfully."""
    try:
        if article_exists(article.source_url):
            logger.info(f"Skipping duplicate: {article.title}")
            return False

        client = get_client()
        data = article.model_dump()
        client.table("news_articles").insert(data).execute()
        logger.info(f"Saved article: {article.title}")
        return True
    except Exception as e:
        logger.error(f"Error saving article '{article.title}': {e}")
        return False


def get_all_source_urls() -> set[str]:
    """Fetch all existing source URLs for batch deduplication."""
    try:
        client = get_client()
        result = client.table("news_articles").select("source_url").execute()
        return {row["source_url"] for row in result.data}
    except Exception as e:
        logger.error(f"Error fetching source URLs: {e}")
        return set()
