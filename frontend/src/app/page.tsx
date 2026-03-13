import { getLatestArticles, getLatestSidebarArticles } from "@/lib/queries";
import ArticleGrid from "@/components/ArticleGrid";
import LatestSidebar from "@/components/LatestSidebar";
import BreakingTicker from "@/components/BreakingTicker";
import { ArticleCard } from "@/lib/types";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  let articles: ArticleCard[] = [];
  let sidebarArticles: ArticleCard[] = [];
  
  try {
    [articles, sidebarArticles] = await Promise.all([
      getLatestArticles(10),
      getLatestSidebarArticles(10),
    ]);
  } catch (error) {
    console.error("Failed to fetch articles:", error);
  }

  const tickerArticles = articles.slice(0, 5);

  return (
    <>
      <BreakingTicker initialArticles={tickerArticles} />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          {/* Main column — articles with image left, text right */}
          <div>
            <ArticleGrid articles={articles} title="Top Stories" />
          </div>

          {/* Right sidebar — MOST POPULAR */}
          <div className="hidden lg:block">
            <div className="sticky top-36">
              <LatestSidebar initialArticles={sidebarArticles} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
