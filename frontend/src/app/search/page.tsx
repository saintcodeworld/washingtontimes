import { searchArticles, getLatestSidebarArticles } from "@/lib/queries";
import ArticleGrid from "@/components/ArticleGrid";
import LatestSidebar from "@/components/LatestSidebar";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: Props) {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q} - The Washington Times` : "Search - The Washington Times",
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  const [articles, sidebarArticles] = await Promise.all([
    query ? searchArticles(query, 20) : Promise.resolve([]),
    getLatestSidebarArticles(10),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div>
          {query ? (
            <ArticleGrid
              articles={articles}
              title={`Search results for "${query}"`}
            />
          ) : (
            <div className="text-center py-16">
              <h2 className="font-serif text-2xl font-bold mb-2 text-[#1a1a1a]">Search Articles</h2>
              <p className="text-[14px] text-[#777]">Use the search bar above to find articles.</p>
            </div>
          )}
        </div>
        <div className="hidden lg:block">
          <div className="sticky top-36">
            <LatestSidebar initialArticles={sidebarArticles} />
          </div>
        </div>
      </div>
    </div>
  );
}
