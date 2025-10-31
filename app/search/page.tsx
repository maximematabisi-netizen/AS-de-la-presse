import React from 'react';
import Link from 'next/link';
import SearchResultsClient from '../../actualite/app/components/SearchResultsClient';

type Props = {
  searchParams?: { q?: string };
};

export default function SearchPage({ searchParams }: Props) {
  const rawQ = (searchParams?.q || '').trim();
  const q = rawQ.toLowerCase();

  // Server-side baseline results using mockArticles (fast), client will enhance with admin:articles
  const serverResults = q ? [] : [];

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-4">Résultats de recherche pour « {rawQ} »</h1>
      {rawQ === '' ? (
        <p className="text-gray-600">Entrez un terme de recherche dans la barre ci-dessus.</p>
      ) : (
        <>
          {/* Client component will merge mockArticles + admin:articles and render results */}
          <SearchResultsClient q={rawQ} />
        </>
      )}
    </div>
  );
}
