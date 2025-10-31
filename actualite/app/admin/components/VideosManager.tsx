"use client";

import { useEffect, useState } from 'react';

export default function VideosManager() {
  const [videos, setVideos] = useState<string[]>(() => {
    try { const raw = localStorage.getItem('admin:videos'); return raw ? JSON.parse(raw) : []; } catch (e) { return []; }
  });
  const [input, setInput] = useState('');

  useEffect(() => { try { localStorage.setItem('admin:videos', JSON.stringify(videos)); } catch (e) {} }, [videos]);

  const add = () => {
    const id = input.trim();
    if (!id) return;
    setVideos(prev => [id, ...prev]);
    setInput('');
  };

  const remove = (id: string) => setVideos(prev => prev.filter(v => v !== id));

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Vidéos (IDs YouTube)</h3>
      <p className="text-sm text-gray-500 mb-2">Collez l'ID d'une vidéo YouTube (ex: dQw4w9WgXcQ)</p>
      <div className="flex gap-2 mb-4">
        <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 p-2 rounded" />
        <button onClick={add} className="bg-blue-600 text-white px-3 py-2 rounded">Ajouter</button>
      </div>
      <div className="space-y-2">
        {videos.map(v => (
          <div key={v} className="flex items-center justify-between p-2 border rounded">
            <div className="text-sm">{v}</div>
            <button onClick={() => remove(v)} className="text-red-600 text-sm">Supprimer</button>
          </div>
        ))}
      </div>
    </div>
  );
}
