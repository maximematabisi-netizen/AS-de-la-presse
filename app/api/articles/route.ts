import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Read the request body once. Logging the body consumed the stream previously,
    // causing subsequent reads to return empty and making server-side saves fail.
    const body = await req.json();
    console.log('Received POST request with body:', body);
    const {
      title,
      slug,
      excerpt,
      content,
      category,
      publishedAt,
      image,
      highlightedQuote,
    } = body;

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
    };
    console.log('Saving article with highlightedQuote:', createData.highlightedQuote);

    // mark as synced since we create it server-side
    createData.synced = true;
    createData.syncedAt = new Date();

    const created = await prisma.article.create({ data: createData });
    console.log('Article created successfully:', created);
    return NextResponse.json(created);
  } catch (e) {
    console.error('Error in POST /api/articles:', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
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
    const slug = url.searchParams.get('slug');
    if (!slug) {
      return NextResponse.json({ error: 'slug is required' }, { status: 400 });
    }

    const deleted = await prisma.article.delete({ where: { slug } });
    return NextResponse.json(deleted);
  } catch (e) {
    console.error('Error in DELETE /api/articles:', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
