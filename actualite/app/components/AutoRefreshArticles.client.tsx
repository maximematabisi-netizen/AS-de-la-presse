'use client';

import { useEffect, useRef } from 'react';

export default function AutoRefreshArticles({ initialPublishedAt }: { initialPublishedAt?: string | null }) {
  const initialRef = useRef<string | null>(initialPublishedAt || null);
  useEffect(() => {
    let mounted = true;
    const checkNow = async () => {
      try {
        const res = await fetch('/api/articles', { cache: 'no-store' });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) return;
        const first = data[0];
        const firstPub = first?.publishedAt ? new Date(first.publishedAt).toISOString() : null;
        // if initial is missing (no articles before) and now we have one, reload
        if (!initialRef.current && firstPub) {
          if (mounted) window.location.reload();
          return;
        }
        // if new publishedAt is different and is newer than initial, reload
        if (initialRef.current && firstPub && firstPub !== initialRef.current) {
          try {
            const init = new Date(initialRef.current);
            const nowFirst = new Date(firstPub);
            if (nowFirst.getTime() > init.getTime()) {
              if (mounted) window.location.reload();
            }
          } catch (e) {
            if (mounted) window.location.reload();
          }
        }
      } catch (e) {
        // ignore
      }
    };

    // poll every 6s
    const id = setInterval(checkNow, 6000);
    // also check once immediately
    checkNow();

    // listen to admin local event to refresh immediately
    const handler = (ev: Event) => {
      // reload to pick up server-side rendering changes
      window.location.reload();
    };
    window.addEventListener('admin:articles:changed', handler as EventListener);

    return () => {
      mounted = false;
      clearInterval(id);
      window.removeEventListener('admin:articles:changed', handler as EventListener);
    };
  }, []);

  return null;
}
