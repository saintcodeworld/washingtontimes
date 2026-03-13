import { NavCategory } from "./types";

export const SITE_NAME = "The Washington Times";
export const SITE_TAGLINE = "America's Newspaper";

export const NAV_CATEGORIES: NavCategory[] = [
  { name: "NEWS", href: "/category/news" },
  { name: "POLICY", href: "/category/policy" },
  { name: "COMMENTARY", href: "/category/commentary" },
  { name: "POLITICS", href: "/category/politics" },
  { name: "SPORTS", href: "/category/sports" },
  { name: "CULTURE", href: "/category/culture" },
  { name: "SECURITY", href: "/category/security" },
  { name: "WORLD", href: "/category/world" },
];

export const TRENDING_TOPICS: string[] = [
  "Trump Administration",
  "Congress",
  "Supreme Court",
  "Border Security",
  "Economy",
  "Ukraine",
  "China",
  "2026 Elections",
];

export const ARTICLES_PER_PAGE = 20;
