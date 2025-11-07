import prisma from '../../../../lib/prismaClient';
// Use a plain <img> for article header images to avoid Next/Image remote domain restrictions
import Link from 'next/link';
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
    // Normalize helpers: use same slugify used elsewhere so matching is consistent
    const slugify = (s: string) => {
      return String(s || '')
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    };

    const rawParam = String(params.slug || '');
    const decodedParam = decodeURIComponent(rawParam).replace(/[`"'‘’“”]/g, '').trim();
    const normalizedParam = slugify(decodedParam);

    // Try exact match first (covers already-correct slugs)
    article = await prisma.article.findUnique({ where: { slug: decodedParam } as any });
    // Try normalized slug match (covers spaces/accents vs hyphenated slugs)
    if (!article && normalizedParam) {
      article = await prisma.article.findUnique({ where: { slug: normalizedParam } as any });
    }
    // If not found yet, try scanning server-side records and compare normalized forms
    if (!article) {
      const candidates = await prisma.article.findMany({ select: { id: true, slug: true, title: true, content: true, category: true, image: true, excerpt: true, publishedAt: true, createdAt: true, highlightedQuote: true, views: true, shares: true } });
      const lower = String(decodedParam).toLowerCase();
      // Try exact case-insensitive match on stored slug
      let found = candidates.find((a: any) => (a.slug || '').toLowerCase() === lower);
      if (!found && normalizedParam) {
        // Try normalized comparison between stored slug/title and incoming
        found = candidates.find((a: any) => {
          const stored = String(a.slug || '');
          const normStored = slugify(stored);
          const normTitle = slugify(String(a.title || ''));
          return normStored === normalizedParam || normTitle === normalizedParam;
        });
      }
      if (found) article = found as any;
    }
  } catch (e) {
    // ignore DB errors
    // console.error handled server-side
  }

  if (!article) {
    // Attempt to recover from malformed slugs that contain extra text or formatting
    // e.g. someone pasted: "Voici un slug approprié : `kwango-...`" into the URL.
    try {
      const raw = String(slug || '');
      // decode and strip surrounding punctuation/backticks
      const decoded = decodeURIComponent(raw).replace(/["'‘’“”`]/g, '').trim();
      // If there's a backtick-enclosed token originally, try to extract it from the decoded value
      const bt = decoded.match(/`([a-z0-9-]+)`/i);
      let candidate = bt ? bt[1] : null;
      if (!candidate) {
        // otherwise try to find the last token that looks like a slug
        const tokens = decoded.split(/\s+/).reverse();
        for (const t of tokens) {
          if (/^[a-z0-9-]{6,}$/.test(t)) {
            candidate = t.toLowerCase();
            break;
          }
        }
      }
      // If still no candidate, handle patterns like "Voici un slug approprié : kwango-..."
      if (!candidate) {
        const colon = decoded.split(':').pop()?.trim();
        if (colon) {
          const maybeToken = colon.split(/\s+/).find(tok => /^[a-z0-9-]{6,}$/.test(tok));
          if (maybeToken) candidate = maybeToken.toLowerCase();
        }
      }
      if (candidate) {
        const maybe = await prisma.article.findUnique({ where: { slug: candidate } as any });
        if (maybe) article = maybe as any;
      }
    } catch (e) {
      // ignore
    }
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
            <a href="/actualite" className="px-4 py-2 bg-blue-600 text-white rounded">Retour à l’accueil</a>
          </div>
        </div>
      </div>
    );
  }

  // Fetch related articles in the same category (excluding current)
  let related: any[] = [];
  try {
    if (article?.category) {
      related = await prisma.article.findMany({
        where: { category: article.category as any, slug: { not: article.slug } as any },
        orderBy: { createdAt: 'desc' },
        take: 6,
      });
    }
  } catch (e) {
    // ignore
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[60vh] min-h-[300px] bg-gray-900">
        {article.image && (
          // plain img ensures any remote URL (Vercel Blob, external hosts) renders without Next's image domain whitelist
          <img src={article.image} alt={article.title} className="object-cover w-full h-full opacity-60" />
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
          <div className="text-gray-800 space-y-6">
            {(article.content || '').split('\n').map((raw, i) => {
              const line = raw.trim();
              if (!line) return null;

              // Support quoted segments anywhere in the line: "...", “...”, « ... »
              const patterns: [RegExp, (m: RegExpMatchArray) => string][] = [
                [/"([^\"]+)"/, (m) => m[1]],
                [/“([^”]+)”/, (m) => m[1]],
                [/«\s*([^»]+)\s*»/, (m) => m[1]],
              ];

              // Try to find the first quoted segment in the line
              let matchText: string | null = null;
              let before = '';
              let after = '';
              for (const [re, extractor] of patterns) {
                const m = line.match(re);
                if (m) {
                  matchText = extractor(m);
                  before = line.slice(0, m.index || 0).trim();
                  after = line.slice((m.index || 0) + m[0].length).trim();
                  break;
                }
              }

              if (matchText) {
                return (
                  <div key={`seg-${i}`} className="space-y-4">
                    {before ? <p>{before}</p> : null}
                    <blockquote className="border-l-4 border-blue-600 pl-4 italic text-blue-800 my-4 flex items-start">
                      <span className="mr-2 text-blue-600" aria-hidden="true">❝</span>
                      <span>{matchText}</span>
                    </blockquote>
                    {after ? <p>{after}</p> : null}
                  </div>
                );
              }

              return <p key={`p-${i}`}>{line}</p>;
            })}
          </div>
        </div>
      </article>
      {related && related.length > 0 && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Dans la même catégorie</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {related.map((r) => (
              <Link key={r.id} href={`/actualite/article/${r.slug}`} className="group">
                <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4">
                  {r.image ? (
                    <div className="h-40 w-full overflow-hidden rounded-md mb-3">
                      <img src={r.image} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                  ) : null}
                  <div className="text-sm text-blue-600 mb-1">{r.category}</div>
                  <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{r.title}</h3>
                  {r.excerpt ? <p className="text-sm text-gray-600 mt-1 line-clamp-2">{r.excerpt}</p> : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
      {/* increment views client-side */}
      <ViewsIncrementer slug={article.slug} />
    </div>
  );
}