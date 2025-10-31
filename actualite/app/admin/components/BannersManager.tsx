"use client";

import { useEffect, useState } from 'react';

const DEFAULT = {
  top: { enabled: false, content: '' },
  bottom: { enabled: false, content: '' },
  sidebar: { enabled: false, content: '' },
  between: { enabled: false, content: '' },
};

export default function BannersManager() {
  const [banners, setBanners] = useState(() => {
    try {
      const raw = localStorage.getItem('admin:banners');
      return raw ? JSON.parse(raw) : DEFAULT;
    } catch (e) { return DEFAULT; }
  });

  useEffect(() => {
    try { localStorage.setItem('admin:banners', JSON.stringify(banners)); } catch (e) {}
  }, [banners]);

  const setField = (key: string, field: string, value: any) => {
    setBanners((prev: any) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Gestion des bannières</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.keys(banners).map((k) => (
          <div key={k} className="p-3 border rounded">
            <div className="flex items-center justify-between mb-2">
              <strong>{k}</strong>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={banners[k].enabled} onChange={(e) => setField(k, 'enabled', e.target.checked)} />
                <span className="text-sm">Activer</span>
              </label>
            </div>
            <textarea value={banners[k].content} onChange={(e) => setField(k, 'content', e.target.value)} className="w-full p-2 rounded h-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
