import asyncio
import re
import logging
from urllib.parse import urljoin
from typing import Optional
from playwright.async_api import async_playwright, Page, Browser
from bs4 import BeautifulSoup
from models import ScrapedArticle
from database import save_article, get_all_source_urls
from config import TARGET_URL, MAX_ARTICLES_PER_RUN, HEADLESS

logger = logging.getLogger(__name__)


def slugify(text: str) -> str:
    """Generate a URL-safe slug from text."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"-+", "-", text)
    return text[:200]


async def get_browser() -> Browser:
    """Launch a Playwright browser instance."""
    pw = await async_playwright().start()
    browser = await pw.chromium.launch(
        headless=HEADLESS,
        args=[
            "--disable-blink-features=AutomationControlled",
            "--no-sandbox",
            "--disable-dev-shm-usage",
        ],
    )
    return browser


async def extract_article_links(page: Page) -> list[dict]:
    """Extract article links from the homepage."""
    await page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=60000)
    await page.wait_for_timeout(3000)

    html = await page.content()
    soup = BeautifulSoup(html, "html.parser")

    links = []
    seen_urls = set()

    # Strategy 1: Target article containers with class 'article-item'
    for item in soup.find_all("div", class_=re.compile(r"article-item", re.I)):
        a_tag = item.find("a", href=True)
        if not a_tag:
            continue
        href = a_tag["href"]
        full_url = urljoin(TARGET_URL, href)
        if full_url in seen_urls:
            continue
        seen_urls.add(full_url)

        headline = item.find("h2", class_=re.compile(r"headline", re.I))
        title_text = headline.get_text(strip=True) if headline else a_tag.get_text(strip=True)
        if not title_text or len(title_text) < 10:
            continue

        links.append({"url": full_url, "title": title_text})
        if len(links) >= MAX_ARTICLES_PER_RUN:
            break

    # Strategy 2: Fallback — find all links matching /news/YYYY/ pattern
    if len(links) < 5:
        for a_tag in soup.find_all("a", href=True):
            href = a_tag["href"]
            full_url = urljoin(TARGET_URL, href)

            if not re.search(r"/news/\d{4}/", full_url):
                continue
            if full_url in seen_urls:
                continue
            seen_urls.add(full_url)

            title_text = a_tag.get_text(strip=True)
            if not title_text or len(title_text) < 15:
                continue

            links.append({"url": full_url, "title": title_text})
            if len(links) >= MAX_ARTICLES_PER_RUN:
                break

    logger.info(f"Found {len(links)} article links on homepage")
    return links


def extract_category_from_url(url: str) -> str:
    """Extract category from article URL path."""
    match = re.search(r"washingtontimes\.com/news/\d{4}/\w+/\d+/(\w+)/", url)
    if match:
        cat = match.group(1).replace("-", " ").title()
        return cat
    return "News"


async def scrape_article(page: Page, url: str) -> Optional[ScrapedArticle]:
    """Scrape a single article page for full content."""
    try:
        await page.goto(url, wait_until="domcontentloaded", timeout=60000)
        await page.wait_for_timeout(2000)

        html = await page.content()
        soup = BeautifulSoup(html, "html.parser")

        # --- Title ---
        # Try h1.headline first (WT-specific), then generic h1
        title_el = soup.find("h1", class_=re.compile(r"headline", re.I))
        if not title_el:
            title_el = soup.find("h1")
        if not title_el:
            logger.warning(f"No title found for {url}")
            return None
        title = title_el.get_text(strip=True)

        # --- Author ---
        author = "Washington Times Staff"
        # Try WT-specific selectors
        author_el = soup.find("span", class_=re.compile(r"byline|author", re.I))
        if not author_el:
            author_el = soup.find("a", href=re.compile(r"/staff/|/author/"))
        if not author_el:
            # Try meta tag
            meta_author = soup.find("meta", attrs={"name": "author"})
            if meta_author and meta_author.get("content"):
                author = meta_author["content"]
        if author_el:
            author = author_el.get_text(strip=True)

        # --- Date ---
        published_at = None
        time_el = soup.find("time")
        if time_el:
            published_at = time_el.get("datetime") or time_el.get_text(strip=True)
        if not published_at:
            meta_date = soup.find("meta", property="article:published_time")
            if meta_date and meta_date.get("content"):
                published_at = meta_date["content"]

        # --- Hero Image ---
        hero_image_url = None
        # Try og:image first (most reliable)
        og_img = soup.find("meta", property="og:image")
        if og_img and og_img.get("content"):
            hero_image_url = og_img["content"]
        else:
            # Try img.article-img (WT-specific)
            img_el = soup.find("img", class_=re.compile(r"article-img", re.I))
            if not img_el:
                article_container = soup.find("article") or soup.find(
                    "section", class_=re.compile(r"page-content", re.I)
                ) or soup.find(
                    "div", class_=re.compile(r"article|story", re.I)
                )
                if article_container:
                    img_el = article_container.find("img")
            if img_el and img_el.get("src"):
                hero_image_url = urljoin(url, img_el["src"])

        # --- Excerpt ---
        excerpt = None
        og_desc = soup.find("meta", property="og:description")
        if og_desc and og_desc.get("content"):
            excerpt = og_desc["content"]
        elif soup.find("meta", attrs={"name": "description"}):
            excerpt = soup.find("meta", attrs={"name": "description"}).get("content")

        # --- Article Body ---
        body_html = ""
        # WT-specific selectors first, then generic fallbacks
        body_selectors = [
            ("div", {"class": re.compile(r"article-text", re.I)}),
            ("section", {"class": re.compile(r"page-content", re.I)}),
            ("div", {"class": re.compile(r"article-body|story-body|entry-content", re.I)}),
            ("article", {}),
        ]

        body_container = None
        for tag, attrs in body_selectors:
            body_container = soup.find(tag, attrs)
            if body_container:
                break

        if body_container:
            paragraphs = body_container.find_all("p")
            if paragraphs:
                body_parts = []
                for p in paragraphs:
                    text = p.get_text(strip=True)
                    if text and len(text) > 20:
                        body_parts.append(f"<p>{text}</p>")
                body_html = "\n".join(body_parts)

        if not body_html:
            # Fallback: get all <p> tags from the page
            all_p = soup.find_all("p")
            body_parts = []
            for p in all_p:
                text = p.get_text(strip=True)
                if text and len(text) > 50:
                    body_parts.append(f"<p>{text}</p>")
            body_html = "\n".join(body_parts[:30])

        if not body_html or len(body_html) < 100:
            logger.warning(f"Insufficient body content for {url}")
            return None

        # --- Category ---
        category = extract_category_from_url(url)

        slug = slugify(title)

        return ScrapedArticle(
            title=title,
            slug=slug,
            author=author,
            published_at=published_at,
            hero_image_url=hero_image_url,
            excerpt=excerpt,
            body=body_html,
            source_url=url,
            category=category,
        )

    except Exception as e:
        logger.error(f"Error scraping article {url}: {e}")
        return None


async def run_scraper() -> dict:
    """Main scraper function. Returns stats about the run."""
    logger.info("Starting scraper run...")

    # Pre-fetch existing URLs for batch deduplication
    existing_urls = get_all_source_urls()
    logger.info(f"Found {len(existing_urls)} existing articles in database")

    browser = await get_browser()
    context = await browser.new_context(
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        viewport={"width": 1920, "height": 1080},
    )
    page = await context.new_page()

    stats = {"articles_found": 0, "articles_saved": 0, "errors": 0}

    try:
        # Step 1: Get article links from homepage
        article_links = await extract_article_links(page)
        stats["articles_found"] = len(article_links)

        # Step 2: Filter out already-scraped articles
        new_links = [
            link for link in article_links if link["url"] not in existing_urls
        ]
        logger.info(
            f"{len(new_links)} new articles to scrape (skipped {len(article_links) - len(new_links)} duplicates)"
        )

        # Step 3: Scrape each new article
        for i, link in enumerate(new_links):
            logger.info(
                f"Scraping [{i + 1}/{len(new_links)}]: {link['title'][:60]}..."
            )
            article = await scrape_article(page, link["url"])

            if article:
                saved = save_article(article)
                if saved:
                    stats["articles_saved"] += 1
            else:
                stats["errors"] += 1

            # Be polite: wait between requests
            await asyncio.sleep(2)

    except Exception as e:
        logger.error(f"Scraper run failed: {e}")
    finally:
        await context.close()
        await browser.close()

    logger.info(
        f"Scraper run complete: {stats['articles_found']} found, "
        f"{stats['articles_saved']} saved, {stats['errors']} errors"
    )
    return stats


async def run_scraper_loop():
    """Run the scraper in a continuous loop with configurable interval."""
    from config import SCRAPE_INTERVAL_MINUTES

    logger.info(
        f"Starting scraper loop (interval: {SCRAPE_INTERVAL_MINUTES} minutes)"
    )

    while True:
        try:
            await run_scraper()
        except Exception as e:
            logger.error(f"Scraper loop error: {e}")

        wait_seconds = SCRAPE_INTERVAL_MINUTES * 60
        logger.info(f"Next run in {SCRAPE_INTERVAL_MINUTES} minutes...")
        await asyncio.sleep(wait_seconds)


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    )
    asyncio.run(run_scraper_loop())
