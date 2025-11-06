import ArticleCard from './components/ArticleCard';
import mockArticles from './data/mockArticles';
import Link from 'next/link';
import NewsTicker from './components/NewsTicker';
import VideosSection from './components/VideosSection';
import FeaturedHero from './components/FeaturedHero';
import AgentsGallery from './components/AgentsGallery';
import MostReadSlider from './components/MostReadSlider';
import prisma from '../../lib/prismaClient';

export const revalidate = 0; // Force le rechargement à chaque requête

export default async function Home() {
  // Charger la BD; en production ne JAMAIS retomber sur les mocks
  let articles: any[] = [];
  try {
    // Filtrer directement dans Prisma pour ne récupérer que les articles publiés
    // Trier par date de publication (plus récent en premier), puis par date de création
    const fromDb = await prisma.article.findMany({
      where: { publishedAt: { not: null } },
      orderBy: [
        { publishedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    
    if (fromDb && fromDb.length > 0) {
      // Mapper les articles de la BD au format attendu par ArticleCard
      articles = fromDb.map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        category: article.category || 'Actualité',
        date: article.publishedAt 
          ? new Date(article.publishedAt).toLocaleDateString('fr-FR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })
          : article.createdAt 
            ? new Date(article.createdAt).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })
            : '',
        image: article.image || '/images/video-placeholder.png',
        publishedAt: article.publishedAt,
        createdAt: article.createdAt,
      }));
    }
  } catch (e) {
    console.error('Error fetching articles from database:', e);
  }
  // En dev hors prod, permettre le fallback mock pour travailler sans BD
  if (process.env.NODE_ENV !== 'production' && (!articles || articles.length === 0)) {
    articles = mockArticles as any[];
  }

  console.log('All articles:', articles.length, 'articles found');

  // Filtrer les articles à la une (les 3 premiers articles)
  const featuredArticles = articles.slice(0, 3);
  console.log('Featured articles:', featuredArticles);

  // TOUS les articles restants pour la section dernières actualités (pas de limite)
  const latestArticles = articles.slice(3);
  console.log('Latest articles:', latestArticles.length, 'articles');

  return (
    <main className="min-h-screen bg-white">
  {/* LogoBar moved to root layout so it's visible site-wide */}
      {/* News ticker */}
      <NewsTicker />

  {/* Featured hero, alimenté par la BD */}
  <FeaturedHero articles={featuredArticles} />

  {/* Most read slider */}
  <MostReadSlider />

      {/* Section Hero - Article Principal */}
      <section className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <span className="inline-block bg-blue-500 px-3 py-1 rounded-full text-sm font-semibold">
                À la une
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                {featuredArticles[0]?.title}
              </h1>
              <p className="text-lg text-blue-100">
                {featuredArticles[0]?.excerpt}
              </p>
              <Link 
                href={`/actualite/article/${featuredArticles[0]?.slug}`}
                className="inline-block bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Lire l'article
              </Link>
            </div>
            <div className="relative h-[400px] rounded-xl overflow-hidden shadow-xl">
              <img 
                src={featuredArticles[0]?.image} 
                alt={featuredArticles[0]?.title}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Articles à la une */}
        <section className="mb-16">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Articles à la une</h2>
            <div className="flex gap-4">
              <Link 
                href="/actualite/politique"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Voir plus
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredArticles.slice(1).map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                excerpt={article.excerpt}
                category={article.category}
                date={article.date}
                image={article.image}
                slug={article.slug}
                publishedAt={article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined}
                views={0}
                shares={0}
              />
            ))}
          </div>
        </section>

        {/* Dernières actualités avec filtres par catégorie */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Dernières actualités</h2>
            <div className="flex flex-wrap gap-3">
              {/* Use Next Link for client-side navigation to avoid 404s */}
              <Link href="/actualite" className="px-4 py-2 rounded-full bg-blue-600 text-white font-medium">Tout</Link>
              <Link href="/actualite/politique" className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">Politique</Link>
              <Link href="/actualite/economie" className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">Économie</Link>
              <Link href="/actualite/sport" className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200">Sport</Link>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestArticles.map((article) => (
              <ArticleCard
                key={article.id}
                title={article.title}
                excerpt={article.excerpt}
                category={article.category}
                date={article.date}
                image={article.image}
                slug={article.slug}
                publishedAt={article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined}
                views={0}
                shares={0}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Agents gallery */}
      <AgentsGallery />
      {/* Videos section (YouTube) */}
      <VideosSection />
    </main>
  );
}