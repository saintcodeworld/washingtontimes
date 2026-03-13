# Washington Times Clone

A pixel-perfect clone of the Washington Times layout with a real-time scraping engine that populates the site with live articles.

## Architecture

```
washington/
├── frontend/          # Next.js 16 + TypeScript + Tailwind CSS + Framer Motion
├── scraper/           # Python + Playwright + FastAPI
└── supabase/          # Database schema & migrations
```

## Tech Stack

| Layer       | Technology                                    |
| ----------- | --------------------------------------------- |
| Frontend    | Next.js (App Router), Tailwind CSS v4, Framer Motion |
| Backend/API | Python, FastAPI, Playwright                   |
| Database    | Supabase (PostgreSQL) with Realtime           |
| Scraping    | Playwright (headless Chromium)                |

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Enable Realtime for the `articles` table:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE articles;
   ```
4. Copy your **Project URL**, **Anon Key**, and **Service Role Key** from Settings > API

### 2. Frontend (Next.js)

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local with your Supabase URL and Anon Key
npm install
npm run dev
```

The frontend runs at `http://localhost:3000`.

### 3. Scraper (Python)

```bash
cd scraper
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium
cp .env.example .env
# Edit .env with your Supabase URL and Service Role Key
```

**Run the scraper as a standalone loop:**

```bash
python scraper.py
```

**Or run the FastAPI server (includes auto-scraping loop + API):**

```bash
uvicorn api:app --reload --port 8000
```

The API runs at `http://localhost:8000`.

#### Scraper API Endpoints

| Method | Endpoint   | Description                        |
| ------ | ---------- | ---------------------------------- |
| GET    | `/`        | Service info                       |
| GET    | `/status`  | Current scraper status & last stats |
| POST   | `/scrape`  | Manually trigger a scrape run      |
| GET    | `/health`  | Health check                       |

## Features

### Frontend
- **Multi-column grid layout** mirroring washingtontimes.com
- **Sticky navigation bar** with category links and search
- **Breaking news ticker** with auto-rotation and Realtime updates
- **Latest News sidebar** with live push notifications via Supabase Realtime
- **Dynamic article pages** at `/news/[slug]`
- **Category pages** at `/category/[name]`
- **Search functionality** at `/search?q=query`
- **ISR (Incremental Static Regeneration)** with 60-second revalidation
- **Framer Motion animations** on cards, ticker, and sidebar
- **Fully responsive** for mobile and desktop

### Scraper
- **Playwright headless browser** to render JS-heavy pages and bypass basic bot detection
- **Smart selectors**: extracts title, author, date, hero image, excerpt, and full article body
- **Deduplication**: checks `source_url` before saving to prevent duplicates
- **Configurable cron interval** (default: every 15 minutes)
- **FastAPI dashboard** for monitoring and manual triggers

## Environment Variables

### Frontend (`frontend/.env.local`)
| Variable                        | Description               |
| ------------------------------- | ------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key    |

### Scraper (`scraper/.env`)
| Variable                   | Description                          |
| -------------------------- | ------------------------------------ |
| `SUPABASE_URL`             | Supabase project URL                 |
| `SUPABASE_SERVICE_ROLE_KEY`| Supabase service role key            |
| `SCRAPE_INTERVAL_MINUTES`  | Minutes between scraper runs (def: 15) |
| `TARGET_URL`               | Target site URL                      |
| `MAX_ARTICLES_PER_RUN`     | Max articles to scrape per run (def: 20) |
| `HEADLESS`                 | Run browser headless (def: true)     |
