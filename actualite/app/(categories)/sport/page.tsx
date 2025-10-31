import ArticleCard from '../../components/ArticleCard';
import prisma from '../../../../lib/prismaClient';

interface Article {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  slug: string;
}

export default async function SportPage() {
  let sportArticles: Article[] = [];
  try {
    const fromDb = await prisma.article.findMany({
      where: { category: 'Sport', publishedAt: { not: null } },
      orderBy: { createdAt: 'desc' },
    });
    sportArticles = fromDb;
    console.log('Fetched sport articles:', sportArticles);
  } catch (e) {
    console.error('Error fetching sport articles:', e);
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Sport</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sportArticles.map((article: Article) => (
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