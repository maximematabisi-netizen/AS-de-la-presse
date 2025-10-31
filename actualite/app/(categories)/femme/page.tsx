import ArticleCard from '../../components/ArticleCard';
import mockArticles from '../../data/mockArticles';

export default function FemmePage() {
  const femmeArticles = mockArticles.filter(article => article.category === 'Femme');

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Femme</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {femmeArticles.map((article) => (
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