"use client";

import { ArticleCard as ArticleCardType } from "@/lib/types";
import ArticleCard from "./ArticleCard";

interface Props {
  articles: ArticleCardType[];
  title?: string;
}

export default function ArticleGrid({ articles, title }: Props) {
  if (articles.length === 0) {
    return (
      <div className="py-16 text-center">
        <h2 className="font-serif text-2xl font-bold text-[#1a1a1a] mb-2">
          No Articles Found
        </h2>
        <p className="text-[14px] text-[#777]">
          Articles will appear here once the scraper starts running.
        </p>
        <p className="text-[13px] text-[#999] mt-1">
          Check your Supabase dashboard to verify the connection.
        </p>
      </div>
    );
  }

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div>
      {title && (
        <h2 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a] pb-2 mb-4 border-b-2 border-[#9b0000]">
          {title}
        </h2>
      )}

      {/* Lead / featured article */}
      <ArticleCard article={featured} variant="featured" index={0} />

      {/* Remaining articles separated by thin lines */}
      {rest.length > 0 && (
        <div className="mt-2">
          {rest.map((article, i) => (
            <div key={article.id}>
              <hr className="article-separator" />
              <ArticleCard article={article} variant="default" index={i + 1} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
