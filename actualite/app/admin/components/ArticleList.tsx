"use client";

import Link from 'next/link';

import { useMemo, useState } from 'react';

export default function ArticleList({ articles, onDelete, onEdit, onToggleBreaking }: { articles: any[]; onDelete: (s: string) => void; onEdit?: (a: any) => void; onToggleBreaking?: (slug: string) => void }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return articles;
    return articles.filter(a => (a.title || '').toLowerCase().includes(q) || (a.category || '').toLowerCase().includes(q) || (a.slug || '').toLowerCase().includes(q));
  }, [articles, query]);

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">Articles</h3>
        <div className="flex items-center gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Recherche..." className="p-2 rounded border" />
          <button className="text-sm text-gray-600" onClick={() => setQuery('')}>Effacer</button>
        </div>
      </div>
      <div className="space-y-3">
        {filtered.map((a) => (
          <div key={a.slug || a.id} className="p-3 border rounded bg-gray-50 dark:bg-gray-900 border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div>
                <Link href={`/actualite/article/${a.slug}`} className="font-semibold text-blue-600 dark:text-blue-300">{a.title}</Link>
                <div className="text-sm text-gray-500 flex items-center gap-3">
                  <span>{a.category} • {new Date(a.publishedAt || a.date || Date.now()).toLocaleString()}</span>
                  {a.synced ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Synchronisé {a.syncedAt ? `• ${new Date(a.syncedAt).toLocaleString()}` : ''}</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">Non synchronisé</span>
                  )}
                  {typeof a.isBreaking !== 'undefined' && (
                    <span className={`text-xs px-2 py-1 rounded ${a.isBreaking ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{a.isBreaking ? 'BREAKING' : '—'}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button className="text-sm text-gray-700 dark:text-gray-200" onClick={() => onEdit(a)}>Éditer</button>
                )}
                {onToggleBreaking && (
                  <button onClick={() => onToggleBreaking(a.slug)} className={`text-sm px-2 py-1 rounded ${a.isBreaking ? 'bg-red-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>{a.isBreaking ? 'Retirer BREAKING' : 'Marquer BREAKING'}</button>
                )}
                <button className="text-sm text-red-600" onClick={() => {
                  if (!confirm('Supprimer cet article ? Cette action est irréversible.')) return;
                  onDelete(a.slug);
                }}>Supprimer</button>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-sm text-gray-500 p-3">Aucun article trouvé.</div>}
      </div>
    </div>
  );
}
