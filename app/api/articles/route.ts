import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
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

    // Vérifier si l'article existe déjà (par slug)
    const existing = await prisma.article.findUnique({ where: { slug } });
    
    const createData: any = {
      title,
      slug,
      excerpt: excerpt || '',
      content: content || '',
      category: category || 'Actualité',
      publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      image: imageToStore,
      synced: true,
      syncedAt: new Date(),
    };

    // Utiliser upsert pour créer ou mettre à jour l'article
    const created = await prisma.article.upsert({
      where: { slug },
      update: createData,
      create: createData,
    });
    
    console.log('Article created/updated successfully:', {
      id: created.id,
      slug: created.slug,
      title: created.title,
      publishedAt: created.publishedAt,
    });

    // Envoyer les notifications aux abonnés si l'article est publié
    // Import dynamique pour éviter les erreurs si le module email a un problème
    if (created.publishedAt) {
      // Envoyer les emails en arrière-plan (ne pas bloquer la réponse)
      import('@/lib/email')
        .then(({ sendNewsletterNotification }) => {
          return sendNewsletterNotification({
            title: created.title,
            excerpt: created.excerpt,
            category: created.category,
            image: created.image,
            slug: created.slug,
          });
        })
        .catch((error) => {
          // Log l'erreur mais ne pas faire échouer la création d'article
          console.error('[email] Failed to send newsletter notification:', error);
        });
    }

    return NextResponse.json(created);
  } catch (e: any) {
    console.error('Error in POST /api/articles:', e);
    console.error('Error details:', {
      message: e?.message,
      code: e?.code,
      name: e?.name,
      stack: e?.stack,
    });
    return NextResponse.json({ 
      error: e?.message || 'failed',
      details: process.env.NODE_ENV === 'development' ? {
        message: e?.message,
        code: e?.code,
        name: e?.name,
      } : undefined
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log('Received GET request with query:', req.nextUrl.searchParams);
    const url = req.nextUrl;
    const slug = url.searchParams.get('slug');
    if (slug) {
      console.log('Looking up article for slug:', slug);
      // try exact match first
      let article: any = null;
      try {
        article = await prisma.article.findUnique({ where: { slug } as any });
      } catch (e) {
        console.error('findUnique error', e);
      }

      if (!article) {
        // fallback: try case-insensitive match by fetching candidates and matching in JS
        try {
          const candidates = await prisma.article.findMany();
          const lower = slug.toLowerCase();
          article = candidates.find((a: any) => (a.slug || '').toLowerCase() === lower);
          if (article) console.log('Found article by case-insensitive match for slug:', slug);
        } catch (e) {
          console.error('Fallback search failed', e);
        }
      }

      if (!article) {
        console.error('Article not found for slug after fallbacks:', slug);
        return NextResponse.json({ error: 'not found' }, { status: 404 });
      }
      console.log('Article retrieved successfully:', { id: article.id, slug: article.slug, title: article.title });
      return NextResponse.json(article);
    }
    try {
      // Récupérer TOUS les articles, triés par date de publication puis création
      const all = await prisma.article.findMany({ 
        orderBy: [
          { publishedAt: 'desc' },
          { createdAt: 'desc' },
        ],
      });
      console.log('All articles retrieved successfully:', all.length, 'articles');
      return NextResponse.json(all);
    } catch (e: any) {
      // Graceful fallback if tables are not yet migrated
      const msg = String(e?.message || e || '');
      if (msg.includes('does not exist') || msg.includes('relation') || msg.includes('table')) {
        console.warn('Articles table not found yet, returning empty list');
        return NextResponse.json([]);
      }
      throw e;
    }
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

    const deleted = await prisma.article.delete({ where: { slug } as any });
    return NextResponse.json(deleted);
  } catch (e) {
    console.error('Error in DELETE /api/articles:', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
