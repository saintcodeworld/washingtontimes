import asyncio
import logging
from datetime import datetime
from contextlib import asynccontextmanager

from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware

from scraper import run_scraper, run_scraper_loop
from models import ScrapeStatus
from config import SCRAPE_INTERVAL_MINUTES

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

scraper_task: asyncio.Task | None = None
last_run_stats: dict | None = None
is_running: bool = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    global scraper_task
    logger.info("Starting background scraper loop...")
    scraper_task = asyncio.create_task(_background_loop())
    yield
    if scraper_task:
        scraper_task.cancel()
        logger.info("Scraper loop stopped.")


app = FastAPI(
    title="Washington Times Scraper API",
    description="Scraping engine for Washington Times articles",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def _background_loop():
    """Background loop that runs the scraper at configured intervals."""
    global last_run_stats, is_running
    while True:
        try:
            is_running = True
            stats = await run_scraper()
            last_run_stats = {**stats, "timestamp": datetime.utcnow().isoformat()}
            is_running = False
        except Exception as e:
            logger.error(f"Background scraper error: {e}")
            is_running = False

        await asyncio.sleep(SCRAPE_INTERVAL_MINUTES * 60)


@app.get("/")
async def root():
    return {
        "service": "Washington Times Scraper",
        "status": "running",
        "scrape_interval_minutes": SCRAPE_INTERVAL_MINUTES,
    }


@app.get("/status", response_model=ScrapeStatus)
async def get_status():
    if is_running:
        return ScrapeStatus(
            status="running",
            message="Scraper is currently running...",
            timestamp=datetime.utcnow().isoformat(),
        )

    if last_run_stats:
        return ScrapeStatus(
            status="idle",
            message="Last run completed successfully",
            articles_found=last_run_stats.get("articles_found", 0),
            articles_saved=last_run_stats.get("articles_saved", 0),
            timestamp=last_run_stats.get("timestamp", ""),
        )

    return ScrapeStatus(
        status="idle",
        message="No scraper runs completed yet",
        timestamp=datetime.utcnow().isoformat(),
    )


@app.post("/scrape", response_model=ScrapeStatus)
async def trigger_scrape(background_tasks: BackgroundTasks):
    """Manually trigger a scrape run."""
    global is_running

    if is_running:
        return ScrapeStatus(
            status="running",
            message="Scraper is already running. Please wait.",
            timestamp=datetime.utcnow().isoformat(),
        )

    async def _run():
        global last_run_stats, is_running
        is_running = True
        try:
            stats = await run_scraper()
            last_run_stats = {**stats, "timestamp": datetime.utcnow().isoformat()}
        finally:
            is_running = False

    background_tasks.add_task(_run)

    return ScrapeStatus(
        status="started",
        message="Scrape triggered. Check /status for results.",
        timestamp=datetime.utcnow().isoformat(),
    )


@app.get("/health")
async def health():
    return {"healthy": True, "timestamp": datetime.utcnow().isoformat()}
