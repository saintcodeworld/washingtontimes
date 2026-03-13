import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft } from "lucide-react";
import { getArticleBySlug, getLatestSidebarArticles } from "@/lib/queries";
import LatestSidebar from "@/components/LatestSidebar";

export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: "Article Not Found" };
  return {
    title: `${article.title} - The Washington Times`,
    description: article.excerpt ?? article.title,
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const [article, sidebarArticles] = await Promise.all([
    getArticleBySlug(slug),
    getLatestSidebarArticles(10),
  ]);

  if (!article) notFound();

  const dateStr = article.published_at
    ? format(new Date(article.published_at), "MMMM d, yyyy 'at' h:mm a")
    : "";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-[13px] text-[#777] hover:text-[#9b0000] transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        {/* Article content */}
        <article>
          {/* Category */}
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#9b0000]">
            {article.category || "News"}
          </span>

          {/* Title */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-[2.6rem] font-bold leading-tight mt-2 mb-4 text-[#1a1a1a]">
            {article.title}
          </h1>

          {/* Excerpt */}
          {article.excerpt && (
            <p className="text-[16px] text-[#555] leading-relaxed mb-4 border-l-3 border-l-[#9b0000] pl-4">
              {article.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-3 text-[13px] mb-6 pb-5 border-b border-[#e5e5e5]">
            <span className="font-semibold text-[#9b0000]">
              {article.author}
            </span>
            {dateStr && (
              <>
                <span className="text-[#ccc]">|</span>
                <time className="text-[#777]">{dateStr}</time>
              </>
            )}
          </div>

          {/* Hero image */}
          {article.hero_image_url && (
            <div className="relative aspect-[16/9] overflow-hidden bg-[#ebebeb] mb-8">
              <Image
                src={article.hero_image_url}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
              />
            </div>
          )}

          {/* Article body */}
          <div
            className="article-body max-w-none"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />

          {/* Source attribution */}
          {article.source_url && (
            <div className="mt-8 pt-5 border-t border-[#e5e5e5]">
              <p className="text-[13px] text-[#777]">
                Originally published at{" "}
                <a
                  href={article.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#9b0000] hover:underline"
                >
                  washingtontimes.com
                </a>
              </p>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-36">
            <LatestSidebar initialArticles={sidebarArticles} />
          </div>
        </div>
      </div>
    </div>
  );
}
