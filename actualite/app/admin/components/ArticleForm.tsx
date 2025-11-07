"use client";

import { useState } from 'react';

export default function ArticleForm({ onSave, initial, onCancel }: { onSave: (a: any) => void; initial?: any; onCancel?: () => void }) {
  const [title, setTitle] = useState(initial?.title || '');
  const [slug, setSlug] = useState(initial?.slug || '');
  const [excerpt, setExcerpt] = useState(initial?.excerpt || '');
  const [content, setContent] = useState(initial?.content || '');
  const [category, setCategory] = useState(initial?.category || 'Actualité');
  const [isBreaking, setIsBreaking] = useState<boolean>(initial?.isBreaking || false);
  const [publishAt, setPublishAt] = useState(initial?.publishedAt || '');
  const [authorName, setAuthorName] = useState(initial?.authorName || '');
  const [imageUrl, setImageUrl] = useState(initial?.image || '');
  const [imagePreview, setImagePreview] = useState<string | null>(initial?.image || null);

  const onFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      setImagePreview(String(r.result));
      setImageUrl('');
    };
    r.readAsDataURL(f);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert('Titre requis');
    // Generate a safe slug from title if slug is empty
    const slugify = (s: string) => {
      if (!s) return '';
      return s
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    };
    const finalSlug = slug && slug.trim() ? slug.trim() : slugify(title);
    let image = imagePreview || imageUrl || '';

    // If we have a data URL (uploaded file), try to POST it to server upload endpoint
    try {
      if (image && image.startsWith('data:')) {
        // convert dataURL to blob
        const res = await fetch(image);
        const blob = await res.blob();
        const fd = new FormData();
        fd.append('file', new File([blob], `${slug}-image.png`, { type: blob.type }));
        const r = await fetch('/api/upload', { method: 'POST', body: fd });
        if (r.ok) {
          const j = await r.json();
          image = j.url || image;
        }
      }
    } catch (e) {
      // ignore upload failure and keep local data URL
      console.warn('upload failed', e);
    }

  onSave({ id: initial?.id, title, slug: finalSlug, excerpt, content, category, isBreaking, publishedAt: publishAt || new Date().toISOString(), image, authorName: authorName || null });
    if (!initial) {
      setTitle(''); setSlug(''); setExcerpt(''); setContent(''); setPublishAt(''); setImageUrl(''); setImagePreview(null);
      setIsBreaking(false);
    }
  };

  return (
    <form onSubmit={save} className="bg-white dark:bg-gray-800 p-4 rounded shadow">
      <h3 className="font-semibold mb-3">{initial ? 'Éditer l\'article' : 'Créer un article'}</h3>
      <label className="block text-sm">Titre</label>
      <input className="w-full mb-2 p-2 rounded" value={title} onChange={(e) => setTitle(e.target.value)} />
      <label className="block text-sm">Slug</label>
      <input className="w-full mb-2 p-2 rounded" value={slug} onChange={(e) => setSlug(e.target.value)} />
      <label className="block text-sm">Extrait</label>
      <textarea className="w-full mb-2 p-2 rounded" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
      <label className="block text-sm">Contenu (markdown/simple text)</label>
      <textarea className="w-full mb-2 p-2 rounded h-36" value={content} onChange={(e) => setContent(e.target.value)} />
      <label className="block text-sm">Catégorie</label>
      <input className="w-full mb-2 p-2 rounded" value={category} onChange={(e) => setCategory(e.target.value)} />

  <label className="block text-sm">Nom du publieur</label>
  <input className="w-full mb-2 p-2 rounded" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Nom de la personne qui publie (optionnel)" />

      <div className="mb-3">
        <label className="inline-flex items-center gap-2">
          <input type="checkbox" checked={isBreaking} onChange={(e) => setIsBreaking(e.target.checked)} />
          <span className="text-sm">Marquer comme BREAKING</span>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-sm">Image (uploader depuis l'appareil)</label>
          <input
            type="file"
            accept="image/*"
            className="w-full mt-1"
            onChange={(e) => onFile(e.target.files ? e.target.files[0] : undefined)}
          />
        </div>
        <div>
          <label className="block text-sm">Ou URL de l'image</label>
          <input className="w-full mb-1 p-2 rounded" value={imageUrl} onChange={(e) => { setImageUrl(e.target.value); setImagePreview(null); }} placeholder="https://..." />
        </div>
      </div>

      {imagePreview ? (
        <div className="mb-3">
          <label className="block text-sm">Aperçu</label>
          <img src={imagePreview} alt="preview" className="w-full h-40 object-cover rounded" />
        </div>
      ) : imageUrl ? (
        <div className="mb-3">
          <label className="block text-sm">Aperçu (depuis URL)</label>
          <img src={imageUrl} alt="preview" className="w-full h-40 object-cover rounded" />
        </div>
      ) : null}

      <label className="block text-sm">Planifier (date/heure)</label>
      <input type="datetime-local" className="w-full mb-3 p-2 rounded" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} />
      

      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 text-white py-2 rounded">{initial ? 'Mettre à jour' : 'Enregistrer'}</button>
        {initial && (
          <button type="button" onClick={onCancel} className="bg-gray-200 dark:bg-gray-700 py-2 px-3 rounded">Annuler</button>
        )}
      </div>
    </form>
  );
}
