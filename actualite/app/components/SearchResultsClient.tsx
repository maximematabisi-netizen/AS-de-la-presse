"use client";

import { useEffect, useMemo, useState } from 'react';
import mockArticles from '../data/mockArticles';
import Link from 'next/link';

export default function SearchResultsClient({ q }: { q: string }) {
  const [adminArticles, setAdminArticles] = useState<any[] | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin:articles');
      if (raw) setAdminArticles(JSON.parse(raw));
      else setAdminArticles([]);
    } catch (e) {
      setAdminArticles([]);
    }
  }, []);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];

    const base = mockArticles.slice();
    const admin = adminArticles || [];

    // Use a map to deduplicate by slug, prefer admin article if present
    const map = new Map<string, any>();
    for (const a of base) map.set(a.slug, a);
    for (const a of admin) map.set(a.slug, a);

    const all = Array.from(map.values());

    return all.filter(a => {
      const title = (a.title || '').toLowerCase();
      const excerpt = (a.excerpt || '').toLowerCase();
      const content = (a.content || '').toLowerCase();
      const author = ((a.author && (a.author.name || '')) || '').toLowerCase();
      const slug = (a.slug || '').toLowerCase();
      const category = (a.category || '').toLowerCase();
      const tags = (a.tags || []).map((t: string) => (t || '').toLowerCase());

      return title.includes(term)
        || excerpt.includes(term)
        || content.includes(term)
        || author.includes(term)
        || slug.includes(term)
        || category.includes(term)
        || tags.some((t: string) => t.includes(term));
    });
  }, [q, adminArticles]);

  if (!q) return null;

  return (
    <div className="space-y-4">
      {results.length === 0 ? (
        <div className="text-gray-600">Aucun résultat trouvé.</div>
      ) : results.map(r => (
        <article key={r.slug || r.id} className="p-4 border rounded">
          <h2 className="font-semibold text-lg"><Link href={`/actualite/article/${r.slug}`} className="text-blue-600">{r.title}</Link></h2>
          <p className="text-sm text-gray-600">{r.excerpt}</p>
          <div className="text-xs text-gray-500 mt-2">{r.category} • {new Date(r.publishedAt || r.date).toLocaleString()}</div>
        </article>
      ))}
    </div>
  );
}
