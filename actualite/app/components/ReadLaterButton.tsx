"use client";

import { useEffect, useState } from 'react';

export default function ReadLaterButton({ slug }: { slug: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('readLater') || '[]';
      const arr = JSON.parse(raw) as string[];
      setSaved(arr.includes(slug));
    } catch (e) {}
  }, [slug]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      const raw = localStorage.getItem('readLater') || '[]';
      const arr = JSON.parse(raw) as string[];
      if (arr.includes(slug)) {
        const next = arr.filter((s) => s !== slug);
        localStorage.setItem('readLater', JSON.stringify(next));
        setSaved(false);
      } else {
        const next = [slug, ...arr];
        localStorage.setItem('readLater', JSON.stringify(next));
        setSaved(true);
      }
    } catch (e) {}
  };

  return (
    <button onClick={toggle} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition" title={saved ? 'Retiré de Lire plus tard' : 'Ajouter à Lire plus tard'}>
      {saved ? '✓ Lu plus tard' : 'Lire plus tard'}
    </button>
  );
}
