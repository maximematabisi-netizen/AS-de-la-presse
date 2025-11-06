"use client";

import { useEffect, useRef, useState } from 'react';

export default function VideosSection() {
  const [videos, setVideos] = useState<string[]>([]);
  const [meta, setMeta] = useState<Record<string, { title?: string; thumbnail?: string; _notFound?: boolean }>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin:videos');
      if (raw) setVideos(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const extractId = (input: string | null | undefined) => {
    if (!input) return null;
    try {
      const u = new URL(input);
      if (u.hostname.includes('youtu.be')) return u.pathname.replace(/^\//, '');
      if (u.hostname.includes('youtube.com')) return u.searchParams.get('v') || null;
    } catch (e) {}
    const m = String(input).match(/([A-Za-z0-9_-]{11})/);
    return m ? m[1] : input;
  };

  useEffect(() => {
    if (!videos || videos.length === 0) return;
    videos.forEach(async (raw) => {
      const id = extractId(raw);
      if (!id) return;
      if (meta[id]) return;
      try {
        const res = await fetch(`/api/youtube?videoId=${encodeURIComponent(id)}`);
        if (!res.ok) {
          setMeta((m) => ({ ...m, [id]: { _notFound: true } }));
          return;
        }
        const payload = await res.json();
        setMeta((m) => ({ ...m, [id]: { title: payload.title, thumbnail: payload.thumbnail } }));
      } catch (err) {
        setMeta((m) => ({ ...m, [id]: { _notFound: true } }));
      }
    });
  }, [videos]);

  const scrollerRef = useRef<HTMLDivElement | null>(null);

  const scrollByWidth = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.9; // scroll almost one viewport
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  return (
    <section className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-lg sm:text-xl font-semibold">Vidéos</h3>
          <div className="flex gap-2">
            <button
              aria-label="Précédent"
              onClick={() => scrollByWidth('left')}
              className="p-2 sm:p-2.5 bg-white rounded shadow hover:bg-gray-50 text-lg sm:text-xl"
            >
              ‹
            </button>
            <button
              aria-label="Suivant"
              onClick={() => scrollByWidth('right')}
              className="p-2 sm:p-2.5 bg-white rounded shadow hover:bg-gray-50 text-lg sm:text-xl"
            >
              ›
            </button>
          </div>
        </div>

        <div ref={scrollerRef} className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth">
          {videos.map((raw) => {
            const id = extractId(raw);
            if (!id) return null;
            const m = meta[id];
            const thumb = m?.thumbnail || `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
            return (
              <a
                key={id}
                href={`https://www.youtube.com/watch?v=${id}`}
                target="_blank"
                rel="noreferrer"
                className="min-w-[240px] sm:min-w-[280px] md:min-w-[320px] flex-shrink-0 bg-black/5 overflow-hidden rounded shadow-sm relative hover:shadow-md transition-shadow"
                aria-label={m?.title || `Video ${id}`}
              >
                {m?._notFound ? (
                  <div className="p-4 sm:p-6 text-center text-xs sm:text-sm text-gray-700">Cette vidéo n'est plus disponible.</div>
                ) : (
                  <>
                    <img
                      src={thumb}
                      alt={m?.title || `Video ${id}`}
                      className="w-full h-36 sm:h-44 md:h-48 object-cover"
                      onError={(e) => {
                        const img = e.currentTarget as HTMLImageElement;
                        if (!img.dataset.fallback) {
                          img.dataset.fallback = '1';
                          img.src = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
                        } else {
                          img.src = '/images/video-placeholder.png';
                        }
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="bg-black/40 rounded-full p-2 sm:p-3">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3">
                      <div className="text-xs sm:text-sm font-medium line-clamp-2">{m?.title || 'Vidéo'}</div>
                    </div>
                  </>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
