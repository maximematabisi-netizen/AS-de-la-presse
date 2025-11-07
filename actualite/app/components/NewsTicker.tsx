'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import mockArticles from '../data/mockArticles';

const NewsTicker = () => {
  const [running, setRunning] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    let animationId: number;
    let start: number | null = null;
    const speed = 40; // px per second

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const elapsed = timestamp - start;
      if (!running) {
        start = timestamp - elapsed; // pause timing
        animationId = requestAnimationFrame(step);
        return;
      }
      el.scrollLeft = (elapsed / 1000) * speed;
      // loop
      if (el.scrollLeft > el.scrollWidth / 2) {
        el.scrollLeft = 0;
        start = timestamp;
      }
      animationId = requestAnimationFrame(step);
    };

    animationId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationId);
  }, [running]);

  const [articles, setArticles] = useState<any[]>([]);

  // load published articles from the API (preferred) and keep admin local updates as a fallback
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await fetch('/api/articles');
        if (!res.ok) throw new Error('failed to fetch');
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
          return;
        }
      } catch (e) {
        // ignore fetch errors and fallback to admin localStorage below
      }

      // fallback: hydrate from admin localStorage on client if API not available or empty
      try {
        const raw = localStorage.getItem('admin:articles');
        if (raw) setArticles(JSON.parse(raw));
      } catch (e) {}
    };
    load();

    // listen for admin-driven updates in the same tab
    const handler = (ev: Event) => {
      try {
        const ce = ev as CustomEvent;
        if (ce?.detail) {
          setArticles(ce.detail as any[]);
          return;
        }
      } catch (e) {}
      try {
        const raw = localStorage.getItem('admin:articles');
        if (raw) setArticles(JSON.parse(raw));
      } catch (e) {}
    };
    window.addEventListener('admin:articles:changed', handler as EventListener);
    return () => { window.removeEventListener('admin:articles:changed', handler as EventListener); mounted = false; };
  }, []);

  const items = articles.map((a) => ({
    title: a.title,
    category: a.category,
    slug: a.slug,
    publishedAt: a.publishedAt || a.date,
  }));

  // duplicate items for seamless loop
  const loopItems = [...items, ...items];

  return (
    <div className="bg-blue-600 text-white overflow-hidden">
      <div
        ref={containerRef}
        onMouseEnter={() => setRunning(false)}
        onMouseLeave={() => setRunning(true)}
        className="whitespace-nowrap flex gap-10 px-4 py-2 overflow-x-hidden"
        aria-live="polite"
      >
        {loopItems.map((it, idx) => (
          <div key={idx} className="inline-flex items-center gap-4">
            <span className="px-2 py-0.5 bg-white/20 rounded text-xs font-semibold">{it.category}</span>
            <Link href={`/actualite/article/${it.slug}`} className="font-medium hover:underline">
              {it.title}
            </Link>
            <time suppressHydrationWarning={true} className="text-xs text-white/80">{new Date(it.publishedAt).toLocaleTimeString()}</time>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsTicker;
