"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import mockArticles from '../data/mockArticles';

type FeaturedHeroProps = { articles?: any[] };

const FeaturedHero = ({ articles: articlesProp }: FeaturedHeroProps) => {
  const [articles, setArticles] = useState<any[]>(articlesProp && articlesProp.length > 0
    ? articlesProp
    : (process.env.NODE_ENV === 'production' ? [] : mockArticles));
  useEffect(() => {
    if (articlesProp && articlesProp.length > 0) {
      setArticles(articlesProp);
      return;
    }
    if (process.env.NODE_ENV === 'production') {
      (async () => {
        try {
          const r = await fetch('/api/articles');
          if (r.ok) {
            const data = await r.json();
            if (Array.isArray(data)) setArticles(data);
          }
        } catch (e) {}
      })();
    }
  }, [articlesProp]);

  const featured = (articles.find((a) => a.isFeatured) || articles[0]);
  if (!featured) return null;

  return (
    <section className="relative bg-gradient-to-r from-blue-700 to-blue-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
              {featured.category}
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight">{featured.title}</h2>
            <p className="text-lg text-white/90">{featured.excerpt}</p>
            <Link
              href={`/actualite/article/${featured.slug}`}
              className="inline-block bg-white text-blue-800 px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            >
              Lire l'article
            </Link>
          </div>
          <div className="relative h-80 rounded-xl overflow-hidden shadow-xl">
            <img src={featured.image} alt={featured.title} className="object-cover w-full h-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedHero;
