'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import mockArticles from '../data/mockArticles';

const BreakingNews = () => {
  const [enabled, setEnabled] = useState(true);
  const [articles, setArticles] = useState<typeof mockArticles>(mockArticles);
  useEffect(() => {
    const v = localStorage.getItem('breakingEnabled');
    if (v !== null) setEnabled(v === '1');
    const handler = () => {
      const nv = localStorage.getItem('breakingEnabled');
      setEnabled(nv !== '0');
    };
    window.addEventListener('storage', handler);
    // load admin-persisted articles if present
    try {
      const raw = localStorage.getItem('admin:articles');
      if (raw) setArticles(JSON.parse(raw));
    } catch (e) {}

    // Also listen for admin:articles:changed in the same tab
    const onAdminChange = (ev: Event) => {
      try {
        const ce = ev as CustomEvent;
        if (ce?.detail) { setArticles(ce.detail as any[]); return; }
      } catch (e) {}
      try {
        const raw = localStorage.getItem('admin:articles');
        if (raw) setArticles(JSON.parse(raw));
      } catch (e) {}
    };
    window.addEventListener('admin:articles:changed', onAdminChange as EventListener);
    return () => window.removeEventListener('storage', handler);
  }, []);

  if (!enabled) return null;

  const breaking = articles.filter((a) => a.isBreaking);
  if (breaking.length === 0) return null;

  return (
    // Breaking banner - no longer sticky, will scroll with the page
    <div className="bg-red-600 text-white overflow-hidden">
      <div className="h-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 animate-marquee whitespace-nowrap overflow-hidden h-10">
            <strong className="mr-4">BREAKING</strong>
            {breaking.map((b) => (
              <div key={b.id} className="mr-8 flex items-center gap-3">
                <Link href={`/actualite/article/${b.slug}`} className="font-semibold underline">
                  {b.title}
                </Link>
                <span className="text-sm text-white/80">{b.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .animate-marquee { animation: marquee 15s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(0%);} 100% { transform: translateX(-50%);} }
      `}</style>
    </div>
  );
};

export default BreakingNews;
