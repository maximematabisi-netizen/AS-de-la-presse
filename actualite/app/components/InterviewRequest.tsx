"use client";

import { useState } from 'react';

export default function InterviewRequest({ slug, title }: { slug: string; title?: string }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState(title || '');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle'|'loading'|'success'|'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/interviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, title, name, email, phone, message, createdAt: new Date().toISOString() })
      });
      if (!res.ok) throw new Error('Network');
      setStatus('success');
      setName(''); setEmail(''); setPhone(''); setMessage('');
    } catch (e) {
      setStatus('error');
    }
  };

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Espace Interview</h2>
      <p className="text-gray-600 mb-4">Vous souhaitez proposer ou demander une interview pour cet article ? Remplissez le formulaire ci-dessous.</p>

      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <input aria-label="Votre nom" className="px-4 py-2 border rounded" placeholder="Votre nom" required value={name} onChange={e=>setName(e.target.value)} />
        <input aria-label="Email" className="px-4 py-2 border rounded" placeholder="Email" type="email" required value={email} onChange={e=>setEmail(e.target.value)} />
        <input aria-label="Téléphone (optionnel)" className="px-4 py-2 border rounded" placeholder="Téléphone (optionnel)" value={phone} onChange={e=>setPhone(e.target.value)} />
        <input aria-label="Sujet" className="px-4 py-2 border rounded" placeholder="RDC : Le gouvernement lance un nouveau programme de développement" value={subject} onChange={e=>setSubject(e.target.value)} />
        <textarea className="col-span-1 md:col-span-2 px-4 py-3 border rounded" placeholder="Votre message / proposition" required value={message} onChange={e=>setMessage(e.target.value)} />

        <div className="col-span-1 md:col-span-2 flex items-center gap-4">
          <button type="submit" disabled={status==='loading'} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60">
            {status === 'loading' ? 'Envoi...' : 'Envoyer la demande'}
          </button>
          {status === 'success' && <span className="text-green-600">Demande envoyée. Nous reviendrons vers vous.</span>}
          {status === 'error' && <span className="text-red-600">Erreur lors de l'envoi. Réessayez plus tard.</span>}
        </div>
      </form>
    </div>
  );
}
