import { supabase } from "./supabase";
import { Article, ArticleCard } from "./types";
import { ARTICLES_PER_PAGE } from "./constants";

const TABLE = "news_articles";
const CARD_SELECT =
  "id, title, slug, author, published_at, hero_image_url, excerpt, category";

export async function getLatestArticles(
  limit: number = ARTICLES_PER_PAGE
): Promise<ArticleCard[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(CARD_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Data fetch error:", error);
    return [];
  }
  return data ?? [];
}

export async function getArticleBySlug(
  slug: string
): Promise<Article | null> {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Data fetch error:", error);
    return null;
  }
  return data;
}

export async function getArticlesByCategory(
  category: string,
  limit: number = ARTICLES_PER_PAGE
): Promise<ArticleCard[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(CARD_SELECT)
    .ilike("category", category)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Data fetch error:", error);
    return [];
  }
  return data ?? [];
}

export async function getLatestSidebarArticles(
  limit: number = 10
): Promise<ArticleCard[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(CARD_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Data fetch error:", error);
    return [];
  }
  return data ?? [];
}

export async function searchArticles(
  query: string,
  limit: number = ARTICLES_PER_PAGE
): Promise<ArticleCard[]> {
  const { data, error } = await supabase
    .from(TABLE)
    .select(CARD_SELECT)
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%`)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Data fetch error:", error);
    return [];
  }
  return data ?? [];
}
