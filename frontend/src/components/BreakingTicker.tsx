"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { ArticleCard as ArticleCardType } from "@/lib/types";
import { AlertCircle } from "lucide-react";

interface Props {
  initialArticles: ArticleCardType[];
}

export default function BreakingTicker({ initialArticles }: Props) {
  const [articles, setArticles] = useState<ArticleCardType[]>(initialArticles);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const channel = supabase
      .channel("ticker-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "news_articles" },
        (payload) => {
          const newArticle = payload.new as ArticleCardType;
          setArticles((prev) => [newArticle, ...prev.slice(0, 4)]);
          setCurrentIndex(0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    if (articles.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % articles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [articles.length]);

  if (articles.length === 0) return null;

  return (
    <div className="bg-[#1a1a1a] text-white">
      <div className="max-w-7xl mx-auto px-4 flex items-center h-9 overflow-hidden">
        <div className="flex items-center gap-2 mr-4 flex-shrink-0">
          <AlertCircle size={13} className="text-[#cc0000]" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#cc0000]">
            Breaking
          </span>
        </div>
        <div className="relative flex-1 h-full flex items-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Link
                href={`/news/${articles[currentIndex].slug}`}
                className="text-[13px] hover:underline line-clamp-1"
              >
                {articles[currentIndex].title}
              </Link>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
