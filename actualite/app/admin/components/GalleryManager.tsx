"use client";
import { useEffect, useState } from 'react';

type Item = { id: number; title?: string | null; imageUrl: string };

export default function GalleryManager() {
  const [items, setItems] = useState<Item[]>([]);
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<'idle'|'saving'|'loading'>('loading');

  const load = async () => {
    setLoading('loading');
    try {
      const r = await fetch('/api/gallery');
      if (r.ok) setItems(await r.json());
    } finally { setLoading('idle'); }
  };

  useEffect(() => { load(); }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading('saving');
    let url = imageUrl;
    try {
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        const r = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!r.ok) {
          const t = await r.text();
          alert('Echec upload: ' + t);
          setLoading('idle');
          return;
        }
        const j = await r.json();
        url = j.url || url;
      }
      if (!url) { alert("Fournissez une image"); setLoading('idle'); return; }
      const res = await fetch('/api/gallery', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, imageUrl: url }) });
      if (!res.ok) {
        const t = await res.text();
        alert('Echec enregistrement galerie: ' + t + '\nAvez-vous appliqué la migration Prisma pour GalleryItem ?');
        setLoading('idle');
        return;
      }
      setTitle(''); setImageUrl(''); setFile(null);
      await load();
    } finally { setLoading('idle'); }
  };

  const onDelete = async (id: number) => {
    if (!confirm('Supprimer cette photo ?')) return;
    const r = await fetch(`/api/gallery?id=${id}`, { method: 'DELETE' });
    if (r.ok) setItems(prev => prev.filter(it => it.id !== id));
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h3 className="font-semibold mb-3">Galerie des agents</h3>
      <form onSubmit={onSave} className="mb-4 space-y-2">
        <input className="w-full p-2 rounded" placeholder="Titre (optionnel)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <input className="w-full p-2 rounded" placeholder="URL de l'image (optionnel si upload)" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button className="px-3 py-2 bg-blue-600 text-white rounded" disabled={loading!=='idle'}>Ajouter</button>
      </form>

      {loading==='loading' ? <div>Chargement…</div> : null}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {items.map(it => (
          <div key={it.id} className="bg-gray-50 dark:bg-gray-700 rounded overflow-hidden">
            <div className="h-32 overflow-hidden"><img src={it.imageUrl} alt={it.title || 'Photo'} className="w-full h-full object-cover" /></div>
            <div className="p-2 flex items-center justify-between">
              <div className="text-sm truncate">{it.title || 'Sans titre'}</div>
              <button onClick={() => onDelete(it.id)} className="text-red-600 text-sm">Supprimer</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}



