"use client";

import { useEffect } from 'react';

export default function ViewsIncrementer({ slug }: { slug: string }) {
  useEffect(() => {
    (async () => {
      try {
        await fetch('/api/articles/views', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });
      } catch (e) {
        // ignore network errors
      }
    })();
  }, [slug]);

  return null;
}
