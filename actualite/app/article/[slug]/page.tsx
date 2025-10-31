import prisma from '../../../../lib/prismaClient';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import ViewsIncrementer from './ViewsIncrementer.client';

type Article = {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  category?: string | null;
  image?: string | null;
  authorName?: string | null;
  authorAvatar?: string | null;
  tags?: string[] | null;
  views?: number | null;
  shares?: number | null;
  publishedAt?: Date | null;
  highlightedQuote?: string | null;
};

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  // fetch article server-side for reliable rendering
  let article: Article | null = null;
  try {
    article = await prisma.article.findUnique({ where: { slug } as any });
    if (!article) {
      // fallback: case-insensitive search
      const candidates = await prisma.article.findMany();
      const lower = String(slug).toLowerCase();
      const found = candidates.find((a: any) => (a.slug || '').toLowerCase() === lower);
      if (found) article = found as any;
    }
  } catch (e) {
    // ignore DB errors
    // console.error handled server-side
  }

  if (!article) {
    // Instead of an opaque 404, show available slugs to help debug why the article isn't found
    let available: { id: number; slug: string; title: string }[] = [];
    try {
      const rows: any[] = await prisma.article.findMany({ select: { id: true, slug: true, title: true }, orderBy: { createdAt: 'desc' } });
      available = rows;
    } catch (e) {
      // ignore
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-3xl mx-auto p-8 bg-white rounded shadow">
          <h1 className="text-2xl font-bold mb-4">Article non trouvé</h1>
          <p className="mb-4">Aucun article trouvé pour le slug <strong>{slug}</strong>.</p>
          <p className="mb-4">Slugs disponibles en base (les valeurs ci-dessous proviennent du serveur) :</p>
          <ul className="list-disc pl-6 mb-4 text-sm text-gray-700">
            {available.length === 0 ? <li>(Aucun article en base)</li> : available.map(a => (
              <li key={a.id}><strong>{a.slug}</strong> — {a.title}</li>
            ))}
          </ul>
          <div className="flex gap-3">
            <a href="/actualite/admin" className="px-4 py-2 bg-blue-600 text-white rounded">Aller à l'admin</a>
            <a href="/actualite/api/debug/articles" className="px-4 py-2 border rounded">Voir endpoint debug</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[60vh] min-h-[300px] bg-gray-900">
        {article.image && (
          <Image src={article.image} alt={article.title} fill className="object-cover opacity-60" sizes="100vw" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent" />
        <div className="absolute bottom-0 w-full py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-white">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mb-4`}>{article.category}</span>
            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">{article.title}</h1>
            <p className="text-lg text-blue-100">{article.excerpt}</p>
          </div>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          {article.highlightedQuote && (
            <blockquote className="border-l-4 border-blue-600 pl-4 italic text-gray-700 my-6">{article.highlightedQuote}</blockquote>
          )}
          <div className="text-gray-800 space-y-6">
            {(article.content || '').split('\n').map((p, i) => p.trim() ? <p key={i}>{p.trim()}</p> : null)}
          </div>
        </div>
      </article>
      {/* increment views client-side */}
      <ViewsIncrementer slug={article.slug} />
    </div>
  );
}