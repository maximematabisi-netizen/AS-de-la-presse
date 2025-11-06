"use client";
import { useEffect, useState } from 'react';

type GalleryItem = { id: number; title?: string | null; imageUrl: string };

export default function AgentsGallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/gallery', { cache: 'no-store' });
        if (r.ok) setItems(await r.json());
      } catch {}
    })();
  }, []);

  // Duplicate list to create seamless marquee effect when there are items
  const loop = [...items, ...items];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Notre équipe</h2>
        {items.length === 0 ? (
          <div className="text-gray-600 text-sm">Aucune photo pour le moment. Ajoutez-en via l’onglet Galerie du panneau admin.</div>
        ) : (
          <div className="overflow-hidden">
            <div className="flex gap-6 animate-marquee will-change-transform">
              {loop.map((it, idx) => (
                <div key={`${it.id}-${idx}`} className="flex-shrink-0 w-40 h-40 rounded-xl overflow-hidden shadow bg-white">
                  <img src={it.imageUrl} alt={it.title || 'Agent'} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}


