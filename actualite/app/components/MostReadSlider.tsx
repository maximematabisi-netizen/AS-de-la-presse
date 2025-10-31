'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Article {
  id: number;
  title: string;
  excerpt?: string;
  image?: string;
  slug: string;
  views?: number;
}

const MostReadSlider = () => {
  const [index, setIndex] = useState(0);
  const [items, setItems] = useState<Article[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const r = await fetch('/api/articles');
        if (!r.ok) return;
        const data = await r.json();
        if (!mounted) return;
        const sorted = (data || []).sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 5);
        setItems(sorted);
      } catch (e) {
        // ignore
      }
    };
    load();
    // refresh every 30s to keep most-read up to date
    const id = setInterval(load, 30000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const id = setInterval(() => setIndex(i => (i + 1) % items.length), 3500);
    return () => clearInterval(id);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h3 className="text-xl font-bold mb-4">Les plus lus</h3>
      <div className="relative overflow-hidden rounded-lg">
        {items.map((it, i) => (
          <Link key={it.id} href={`/actualite/article/${it.slug}`} className={`transition-all duration-500 ${i===index ? 'opacity-100 translate-x-0' : 'opacity-0 absolute inset-0 translate-x-6'}`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 bg-white shadow">
              <div className="md:col-span-1 relative h-36 md:h-24 rounded overflow-hidden">
                <img src={it.image} alt={it.title} className="object-cover w-full h-full" />
              </div>
              <div className="md:col-span-2">
                <h4 className="font-semibold text-lg">{it.title}</h4>
                <p className="text-sm text-gray-600">{it.excerpt}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MostReadSlider;
