"use client";

import { useEffect, useState } from 'react';

export default function VideosManager() {
  const [videos, setVideos] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/videos', { cache: 'no-store' });
        if (r.ok) {
          const videoIds = await r.json();
          setVideos(videoIds || []);
        }
      } catch (e) {
        console.error('Failed to load videos:', e);
      }
    })();
  }, []);

  const add = async () => {
    const id = input.trim();
    if (!id) return;
    setLoading(true);
    try {
      const r = await fetch('/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: id }),
      });
      if (r.ok) {
        setVideos(prev => [id, ...prev]);
        setInput('');
      } else {
        const error = await r.json();
        alert(error.error || 'Erreur lors de l\'ajout de la vidéo');
      }
    } catch (e) {
      console.error('Failed to add video:', e);
      alert('Erreur lors de l\'ajout de la vidéo');
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/videos?videoId=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (r.ok) {
        setVideos(prev => prev.filter(v => v !== id));
      } else {
        const error = await r.json();
        alert(error.error || 'Erreur lors de la suppression de la vidéo');
      }
    } catch (e) {
      console.error('Failed to remove video:', e);
      alert('Erreur lors de la suppression de la vidéo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Vidéos (IDs YouTube)</h3>
      <p className="text-sm text-gray-500 mb-2">Collez l'ID d'une vidéo YouTube (ex: dQw4w9WgXcQ)</p>
      <div className="flex gap-2 mb-4">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          onKeyPress={(e) => e.key === 'Enter' && !loading && add()}
          className="flex-1 p-2 rounded" 
          placeholder="ID YouTube ou URL"
          disabled={loading}
        />
        <button 
          onClick={add} 
          disabled={loading}
          className="bg-blue-600 text-white px-3 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '...' : 'Ajouter'}
        </button>
      </div>
      <div className="space-y-2">
        {videos.length === 0 ? (
          <div className="text-sm text-gray-500 p-2">Aucune vidéo pour le moment.</div>
        ) : (
          videos.map(v => (
            <div key={v} className="flex items-center justify-between p-2 border rounded">
              <div className="text-sm">{v}</div>
              <button 
                onClick={() => remove(v)} 
                disabled={loading}
                className="text-red-600 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Supprimer
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
