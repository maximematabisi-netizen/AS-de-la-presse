 'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import ReadLaterButton from './ReadLaterButton';

interface ArticleCardProps {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  image: string;
  slug: string;
  isLive?: boolean;
  publishedAt?: string;
  views?: number;
  shares?: number;
}

const CategoryColors: { [key: string]: string } = {
  'Politique': 'bg-red-100 text-red-600',
  'Économie': 'bg-green-100 text-green-600',
  'Sport': 'bg-blue-100 text-blue-600',
  'Culture': 'bg-purple-100 text-purple-600',
  'Société': 'bg-orange-100 text-orange-600',
  'Femme': 'bg-pink-100 text-pink-600',
  'Sécurité': 'bg-yellow-100 text-yellow-600',
};

const ArticleCard = ({ title, excerpt, category, date, image, slug, isLive, publishedAt, views, shares }: ArticleCardProps) => {
  const categoryColor = CategoryColors[category] || 'bg-gray-100 text-gray-600';
  const [minutesAgo, setMinutesAgo] = useState<string | null>(null);
  const [imgSrc, setImgSrc] = useState(image || '/images/video-placeholder.png');

  useEffect(() => {
    if (!publishedAt) return;
    const update = () => {
      const diff = Math.max(0, Math.floor((Date.now() - new Date(publishedAt).getTime()) / 60000));
      setMinutesAgo(diff === 0 ? "À l'instant" : `${diff} min`);
    };
    update();
    const id = setInterval(update, 60 * 1000);
    return () => clearInterval(id);
  }, [publishedAt]);

  useEffect(() => {
    setImgSrc(image || '/images/video-placeholder.png');
  }, [image]);

  const handleImageError = () => {
    setImgSrc('/images/video-placeholder.png');
  };

  return (
    <Link href={`/actualite/article/${slug}`}>
      <article className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg group h-full flex flex-col">
        <div className="relative h-56 overflow-hidden">
          <img
            src={imgSrc}
            alt={title}
            onError={handleImageError}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          {isLive && (
            <span className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold">LIVE</span>
          )}
        </div>
        <div className="p-5 flex flex-col flex-grow">
          <div className="flex items-center justify-between mb-3">
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${categoryColor}`}>
              {category}
            </span>
            <div className="flex items-center gap-3">
              {minutesAgo && <span className="text-sm text-gray-500 font-medium">{minutesAgo}</span>}
              <time className="text-sm text-gray-500 font-medium">{date}</time>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">
            {excerpt}
          </p>
          <div className="flex items-center justify-between text-blue-600 text-sm font-medium group-hover:text-blue-700">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A2 2 0 0122 9.618v4.764a2 2 0 01-2.447 1.894L15 14M4 6h11v12H4z"/></svg>
                <span className="text-gray-600 text-sm">{views ?? 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M15 8a3 3 0 11-6 0 3 3 0 016 0z"/><path fillRule="evenodd" d="M2 13.5A6.5 6.5 0 0117 13.5V15H2v-1.5z" clipRule="evenodd"/></svg>
                <span className="text-gray-600 text-sm">{shares ?? 0}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ReadLaterButton slug={slug} />
              <div className="flex items-center">
                <span>Lire l'article</span>
                <svg
                  className="w-4 h-4 ml-1 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
};

export default ArticleCard;