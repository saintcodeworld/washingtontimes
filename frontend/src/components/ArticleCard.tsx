"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ArticleCard as ArticleCardType } from "@/lib/types";

interface Props {
  article: ArticleCardType;
  variant?: "default" | "featured" | "sidebar";
  index?: number;
}

export default function ArticleCard({
  article,
  variant = "default",
  index = 0,
}: Props) {
  const dateStr = article.published_at
    ? format(new Date(article.published_at), "MMMM d, yyyy")
    : "";

  // ===== FEATURED: Large hero image left, title/excerpt right =====
  if (variant === "featured") {
    return (
      <motion.article
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
      >
        <Link href={`/news/${article.slug}`} className="group block">
          <div className="flex flex-col md:flex-row gap-5">
            {/* Hero image */}
            <div className="relative w-full md:w-[55%] aspect-[16/10] md:aspect-auto md:min-h-[220px] overflow-hidden bg-[#ebebeb] flex-shrink-0">
              {article.hero_image_url ? (
                <Image
                  src={article.hero_image_url}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:opacity-90 transition-opacity duration-300"
                  sizes="(max-width: 768px) 100vw, 55vw"
                />
              ) : (
                <div className="w-full h-full bg-[#ddd] flex items-center justify-center">
                  <span className="text-[#999] text-sm">No Image</span>
                </div>
              )}
            </div>
            {/* Text content */}
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="font-serif text-xl md:text-2xl font-bold leading-snug text-[#1a1a1a] group-hover:text-[#9b0000] transition-colors">
                {article.title}
              </h2>
              <p className="mt-1.5 text-[13px] text-[#9b0000] font-semibold">
                {article.author}
              </p>
              {article.excerpt && (
                <p className="mt-2 text-[14px] text-[#555] leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
              )}
              {dateStr && (
                <time className="mt-2 text-[12px] text-[#999]">{dateStr}</time>
              )}
            </div>
          </div>
        </Link>
      </motion.article>
    );
  }

  // ===== SIDEBAR: Numbered list item for "Most Popular" =====
  if (variant === "sidebar") {
    return (
      <motion.article
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.25, delay: index * 0.04 }}
        className="group"
      >
        <Link
          href={`/news/${article.slug}`}
          className="flex items-start gap-3 py-3 border-b border-[#e5e5e5] hover:bg-[#f9f9f9] transition-colors"
        >
          <span className="text-2xl font-bold text-[#ccc] leading-none mt-0.5 flex-shrink-0 w-7 text-right">
            {index + 1}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="font-serif text-[14px] font-bold leading-snug text-[#1a1a1a] group-hover:text-[#9b0000] transition-colors line-clamp-2">
              {article.title}
            </h4>
            <p className="mt-0.5 text-[11px] text-[#9b0000] font-semibold">
              {article.author}
            </p>
          </div>
        </Link>
      </motion.article>
    );
  }

  // ===== DEFAULT: Image left, text right — standard article row =====
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
      className="group"
    >
      <Link href={`/news/${article.slug}`} className="flex gap-4 py-4">
        {/* Thumbnail on left */}
        <div className="relative w-[180px] md:w-[220px] aspect-[16/11] overflow-hidden bg-[#ebebeb] flex-shrink-0">
          {article.hero_image_url ? (
            <Image
              src={article.hero_image_url}
              alt={article.title}
              fill
              className="object-cover group-hover:opacity-90 transition-opacity duration-300"
              sizes="220px"
            />
          ) : (
            <div className="w-full h-full bg-[#ddd] flex items-center justify-center">
              <span className="text-[#999] text-xs">No Image</span>
            </div>
          )}
        </div>
        {/* Text on right */}
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <h3 className="font-serif text-[16px] md:text-[18px] font-bold leading-snug text-[#1a1a1a] group-hover:text-[#9b0000] transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="mt-1 text-[13px] text-[#9b0000] font-semibold">
            {article.author}
          </p>
          {article.excerpt && (
            <p className="mt-1.5 text-[13px] text-[#666] leading-relaxed line-clamp-2 hidden md:block">
              {article.excerpt}
            </p>
          )}
          {dateStr && (
            <time className="mt-1.5 text-[11px] text-[#999]">{dateStr}</time>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
