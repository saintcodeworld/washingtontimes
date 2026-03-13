-- ============================================
-- Washington Times Clone - Supabase Schema
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- News articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    author TEXT NOT NULL DEFAULT 'Staff',
    published_at TIMESTAMPTZ,
    hero_image_url TEXT,
    excerpt TEXT,
    body TEXT NOT NULL,
    source_url TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL DEFAULT 'News',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_news_articles_slug ON news_articles (slug);
CREATE INDEX IF NOT EXISTS idx_news_articles_source_url ON news_articles (source_url);
CREATE INDEX IF NOT EXISTS idx_news_articles_category ON news_articles (category);
CREATE INDEX IF NOT EXISTS idx_news_articles_created_at ON news_articles (created_at DESC);

-- Auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_news_articles_updated_at
    BEFORE UPDATE ON news_articles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for the frontend anon key)
CREATE POLICY "Allow public read access"
    ON news_articles
    FOR SELECT
    USING (true);

-- Allow service role full access (for the scraper)
CREATE POLICY "Allow service role insert"
    ON news_articles
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow service role update"
    ON news_articles
    FOR UPDATE
    USING (true)
    WITH CHECK (true);

-- ============================================
-- Realtime
-- ============================================

-- Enable realtime for the news_articles table
-- Run this in the Supabase Dashboard SQL Editor:
-- ALTER PUBLICATION supabase_realtime ADD TABLE news_articles;

-- ============================================
-- Optional: Full-text search
-- ============================================

-- Add a tsvector column for full-text search
ALTER TABLE news_articles ADD COLUMN IF NOT EXISTS fts tsvector
    GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(excerpt, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(body, '')), 'C')
    ) STORED;

CREATE INDEX IF NOT EXISTS idx_news_articles_fts ON news_articles USING GIN (fts);
