"use client";

import { useEffect, useState } from 'react';

type BannerConfig = {
  enabled: boolean;
  content: string;
};

export default function BannerDisplay({ position }: { position: 'top' | 'bottom' | 'sidebar' | 'between' }) {
  const [banner, setBanner] = useState<BannerConfig | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin:banners');
      if (!raw) return;
      const obj = JSON.parse(raw);
      const cfg = obj?.[position];
      if (cfg && cfg.enabled) setBanner(cfg);
    } catch (e) {}
  }, [position]);

  if (!banner) return null;

  return (
    <div className={`w-full px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-200 border-b border-yellow-200 dark:border-yellow-800`} dangerouslySetInnerHTML={{ __html: banner.content }} />
  );
}
