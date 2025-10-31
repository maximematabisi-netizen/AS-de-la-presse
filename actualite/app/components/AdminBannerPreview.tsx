"use client";

import { useEffect, useState } from 'react';

export default function AdminBannerPreview({ position }: { position: string }) {
  const [cfg, setCfg] = useState<any>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('admin:banners');
      if (!raw) return;
      const obj = JSON.parse(raw);
      setCfg(obj?.[position]);
    } catch (e) {}
  }, [position]);
  if (!cfg || !cfg.enabled) return <div className="p-2 text-sm text-gray-500">Aucune bannière active.</div>;
  return <div className="p-3 border rounded bg-yellow-50 dark:bg-yellow-900/20" dangerouslySetInnerHTML={{ __html: cfg.content }} />;
}
