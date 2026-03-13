import { getArticlesByCategory, getLatestSidebarArticles } from "@/lib/queries";
import ArticleGrid from "@/components/ArticleGrid";
import LatestSidebar from "@/components/LatestSidebar";

export const revalidate = 0;

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const label = category.charAt(0).toUpperCase() + category.slice(1);
  return {
    title: `${label} - The Washington Times`,
    description: `Latest ${label} news and articles from The Washington Times.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const label = category.charAt(0).toUpperCase() + category.slice(1);

  const [articles, sidebarArticles] = await Promise.all([
    getArticlesByCategory(category, 20),
    getLatestSidebarArticles(10),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
        <div>
          <ArticleGrid articles={articles} title={label} />
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
