import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL is missing in environment');
      // Return 503 to indicate service unavailable (DB not configured)
      return NextResponse.json({ error: 'DATABASE_URL manquant. Configurez la variable d\'environnement DATABASE_URL sur Vercel ou .env.local en local.' }, { status: 503 });
    }
    // Read the request body once. Logging the body consumed the stream previously,
    // causing subsequent reads to return empty and making server-side saves fail.
    const body = await req.json();
    console.log('Received POST request with body:', body);
    const {
      title,
      slug: rawSlug,
      excerpt,
      content,
      category,
      publishedAt,
      image,
      highlightedQuote,
    } = body;

    // Normalize or generate a safe slug server-side to avoid mismatches
    const slugify = (s: string) => {
      if (!s) return '';
      return s
        .toString()
        .trim()
        .toLowerCase()
        .normalize('NFD') // decompose accents
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace to dashes
        .replace(/-+/g, '-');
    };

    const slug = rawSlug && typeof rawSlug === 'string' && rawSlug.trim() ? slugify(rawSlug) : slugify(title || 'article-' + Date.now());

    if (!title || !slug) {
      console.error('Validation failed: title and slug are required');
      return NextResponse.json({ error: 'title and slug required' }, { status: 400 });
    }

    // If an image URL is provided and looks remote, validate its content-type before accepting
    let imageToStore: string | null = image || null;
    if (image && typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
      try {
        // First try a HEAD request to check content-type
        let res = await fetch(image, { method: 'HEAD' });
        if (!res.ok) {
          // fallback to GET (some servers don't allow HEAD)
          res = await fetch(image, { method: 'GET' });
        }
        const ctype = res.headers.get('content-type') || '';
        if (!ctype.startsWith('image/')) {
          return NextResponse.json({ error: 'remote URL does not point to an image' }, { status: 400 });
        }
        // keep the remote URL as-is (validated). Optionally we could download and store locally.
        imageToStore = image;
      } catch (err) {
        console.error('image validation failed', err);
        return NextResponse.json({ error: 'failed to validate remote image URL' }, { status: 400 });
      }
    }

    console.log('Received highlightedQuote:', body.highlightedQuote);
    const createData: any = {
      title,
      slug,
      excerpt: excerpt || '',
      content: content || '',
      category: category || 'Actualité',
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      image: imageToStore,
      highlightedQuote: body.highlightedQuote || null, // Include highlightedQuote
      authorName: body.authorName || null,
    };
    console.log('Saving article with highlightedQuote:', createData.highlightedQuote);

    // mark as synced since we create it server-side
    createData.synced = true;
    createData.syncedAt = new Date();

    // Use upsert so repeated publishes or retries (from admin auto-resync)
    // do not fail with a unique-constraint error when the slug already exists.
    const created = await prisma.article.upsert({
      where: { slug } as any,
      update: createData,
      create: createData,
    });
    console.log('Article upserted successfully:', created);

    // Revalidate the main actualite listing and the specific article page so
    // published articles appear immediately on the site without waiting for
    // any external cache/window.
    try {
      revalidatePath('/actualite');
      // article page
      if (created.slug) revalidatePath(`/actualite/article/${created.slug}`);
      // category page (slugify category)
      if (created.category) {
        const catSlug = String(created.category || '')
          .toString()
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
        if (catSlug) revalidatePath(`/actualite/${catSlug}`);
      }
    } catch (e) {
      console.warn('Revalidation failed (non-fatal):', e);
    }
    return NextResponse.json(created);
  } catch (e) {
    console.error('Error in POST /api/articles:', e);
    const msg = e instanceof Error ? e.message : String(e);
    // return a helpful message for debugging (non-sensitive)
    return NextResponse.json({ error: msg || 'failed' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('Received GET request with query:', req.nextUrl.searchParams);
    const url = req.nextUrl;
    const slug = url.searchParams.get('slug');
    if (slug) {
      console.log('Fetching article with slug:', slug);
      const article = await prisma.article.findUnique({ where: { slug } });
      if (!article) {
        console.error('Article not found for slug:', slug);
        return NextResponse.json({ error: 'not found' }, { status: 404 });
      }
      console.log('Article retrieved successfully:', article);
      return NextResponse.json(article);
    }
    const all = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    console.log('All articles retrieved successfully:', all);
    return NextResponse.json(all);
  } catch (e) {
    console.error('Error in GET /api/articles:', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const raw = url.searchParams.get('slug') || url.searchParams.get('id');
    if (!raw) return NextResponse.json({ error: 'slug or id is required' }, { status: 400 });

    // normalize and try to find the article first
    const slugify = (s: string) => String(s || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    const decoded = decodeURIComponent(raw as string).replace(/[`"'‘’“”]/g, '').trim();
    const normalized = slugify(decoded);

    // try lookup by slug exact, normalized, or by id
    let article: any = null;
    if (/^[0-9]+$/.test(decoded)) {
      article = await prisma.article.findUnique({ where: { id: Number(decoded) } as any });
    }
    if (!article) article = await prisma.article.findUnique({ where: { slug: decoded } as any });
    if (!article && normalized) article = await prisma.article.findUnique({ where: { slug: normalized } as any });

    if (!article) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }

    try {
      const deleted = await prisma.article.delete({ where: { id: article.id } });

      // Revalidate relevant pages so the deleted article disappears from listings
      try {
        revalidatePath('/actualite');
        if (article.slug) revalidatePath(`/actualite/article/${article.slug}`);
        if (article.category) {
          const catSlug = String(article.category || '')
            .toString()
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-');
          if (catSlug) revalidatePath(`/actualite/${catSlug}`);
        }
      } catch (e) {
        console.warn('Revalidation failed after delete (non-fatal):', e);
      }

      return NextResponse.json({ ok: true, deleted });
    } catch (e) {
      console.error('Error deleting article', article?.id, e);
      return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
    }
  } catch (e) {
    console.error('Error in DELETE /api/articles:', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
