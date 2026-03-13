export interface Article {
  id: string;
  title: string;
  slug: string;
  author: string;
  published_at: string;
  hero_image_url: string | null;
  excerpt: string | null;
  body: string;
  source_url: string;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface ArticleCard {
  id: string;
  title: string;
  slug: string;
  author: string;
  published_at: string;
  hero_image_url: string | null;
  excerpt: string | null;
  category: string;
}

export type NavCategory = {
  name: string;
  href: string;
};
