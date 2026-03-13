import os
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

SCRAPE_INTERVAL_MINUTES: int = int(os.getenv("SCRAPE_INTERVAL_MINUTES", "15"))
TARGET_URL: str = os.getenv("TARGET_URL", "https://www.washingtontimes.com")
MAX_ARTICLES_PER_RUN: int = int(os.getenv("MAX_ARTICLES_PER_RUN", "20"))
HEADLESS: bool = os.getenv("HEADLESS", "true").lower() == "true"
