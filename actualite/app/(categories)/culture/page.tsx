import ArticleCard from '../../components/ArticleCard';
import prisma from '../../../../lib/prismaClient';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CulturePage() {
  let cultureArticles: any[] = [];
  try {
    const fromDb = await prisma.article.findMany({
      where: { category: 'Culture', publishedAt: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    cultureArticles = (fromDb || []).map((a: any) => ({
      id: a.id,
      title: a.title || a.slug,
      excerpt: a.excerpt || '',
      category: a.category || 'Culture',
      date: (a.publishedAt || a.createdAt) ? new Date(a.publishedAt || a.createdAt).toLocaleDateString('fr-FR') : '',
      image: a.image || '/placeholder.png',
      slug: a.slug,
    }));
  } catch (e) {}

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Culture</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cultureArticles.map((article) => (
            <ArticleCard
              key={article.id}
              title={article.title}
              excerpt={article.excerpt}
              category={article.category}
              date={article.date}
              image={article.image}
              slug={article.slug}
            />
          ))}
        </div>
      </div>
    </div>
  );
}