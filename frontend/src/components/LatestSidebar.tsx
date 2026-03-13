"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArticleCard as ArticleCardType } from "@/lib/types";
import ArticleCard from "./ArticleCard";
import { motion, AnimatePresence } from "framer-motion";
import { Bell } from "lucide-react";

interface Props {
  initialArticles: ArticleCardType[];
}

export default function LatestSidebar({ initialArticles }: Props) {
  const [articles, setArticles] = useState<ArticleCardType[]>(initialArticles);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    const channel = supabase
      .channel("news-articles-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "news_articles" },
        (payload) => {
          const newArticle = payload.new as ArticleCardType;
          setArticles((prev) => [newArticle, ...prev.slice(0, 9)]);
          setNewCount((prev) => prev + 1);
          setTimeout(() => setNewCount((prev) => Math.max(0, prev - 1)), 5000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <aside className="bg-[#f4f4f4] border-t-[3px] border-t-[#9b0000]">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-[13px] font-bold uppercase tracking-[0.1em] text-[#1a1a1a]">
          Most Popular
        </h3>
        <AnimatePresence>
          {newCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-1 px-2 py-0.5 bg-[#9b0000] text-white text-[10px] font-bold rounded-full"
            >
              <Bell size={10} />
              {newCount} new
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Article list */}
      <div className="px-4 pb-4">
        {articles.map((article, i) => (
          <ArticleCard
            key={article.id}
            article={article}
            variant="sidebar"
            index={i}
          />
        ))}
      </div>

      {articles.length === 0 && (
        <div className="px-4 pb-6 text-center">
          <p className="text-[13px] text-[#999]">
            No articles yet. The scraper will populate this feed.
          </p>
        </div>
      )}
    </aside>
  );
}
