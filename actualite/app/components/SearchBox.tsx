"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBox({ placeholder = 'Rechercher...', autoFocus = false }: { placeholder?: string; autoFocus?: boolean }) {
  const [q, setQ] = useState('');
  const router = useRouter();

  const submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const term = q.trim();
    if (!term) return;
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <form onSubmit={submit} className="flex items-center">
      <input
        autoFocus={autoFocus}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        className="px-3 py-1 rounded-l-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded-r-md text-sm">Rechercher</button>
    </form>
  );
}
