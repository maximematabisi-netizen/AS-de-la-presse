import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prismaClient';

export async function POST(req: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'DATABASE_URL manquant. Configurez .env.local puis relancez le serveur.',
        hint: 'Ajoutez DATABASE_URL=postgresql://user:pass@host:port/db et exécutez `npx prisma generate && npx prisma migrate dev`'
      }, { status: 400 });
    }

    const body = await req.json();
    if (!Array.isArray(body)) return NextResponse.json({ error: 'expected array' }, { status: 400 });

    const results: any[] = [];
    // helper slugify - keep consistent with server creation
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

    for (const item of body) {
      if (!item) continue;

      // Generate or normalize a slug. If missing, derive from title or fallback to a timestamped slug
      const rawSlug = item.slug ? String(item.slug) : null;
      const base = rawSlug ? decodeURIComponent(rawSlug) : (item.title ? String(item.title) : `untitled-${Date.now()}`);
      const slug = slugify(base || `untitled-${Date.now()}`);

      // If the item is marked deleted on the client, try to remove it server-side
      if (item.deleted) {
        try {
          // prefer id if present
          if (item.id) {
            const idNum = typeof item.id === 'string' ? Number(item.id) : item.id;
            const found = await prisma.article.findUnique({ where: { id: idNum } as any });
            if (found) {
              await prisma.article.delete({ where: { id: found.id } });
              results.push({ slug, ok: true, deleted: true });
              continue;
            }
          }

          // otherwise try delete by slug
          const foundBySlug = await prisma.article.findUnique({ where: { slug } as any });
          if (foundBySlug) {
            await prisma.article.delete({ where: { id: foundBySlug.id } });
            results.push({ slug, ok: true, deleted: true });
          } else {
            results.push({ slug, ok: false, error: 'not found' });
          }
        } catch (e) {
          results.push({ slug, ok: false, error: e instanceof Error ? e.message : String(e) });
        }
        continue;
      }

      // Prepare data to upsert. Be careful with publishedAt parsing.
      let publishedAt: Date | null = null;
      if (item.publishedAt) {
        const d = new Date(item.publishedAt);
        if (!isNaN(d.getTime())) publishedAt = d;
      } else if (item.published === true) {
        // support boolean 'published' flag
        publishedAt = new Date();
      }

      const data: any = {
        title: item.title || (item.slug ? String(item.slug) : 'Untitled'),
        slug,
        excerpt: item.excerpt || '',
        content: item.content || '',
        category: item.category || 'Actualité',
        image: item.image || null,
        highlightedQuote: item.highlightedQuote || null,
        isBreaking: !!item.isBreaking,
        publishedAt: publishedAt,
        synced: true,
        syncedAt: new Date(),
        authorName: item.authorName || null,
      };

      try {
        // Use upsert by slug; if slug collides unexpectedly this will update the existing entry
        const up = await prisma.article.upsert({
          where: { slug } as any,
          update: data,
          create: data,
        });
        results.push({ slug, ok: true, id: up.id });
      } catch (e) {
        console.error('resync upsert failed for', slug, e);
        results.push({ slug, ok: false, error: e instanceof Error ? e.message : String(e) });
      }
    }

    // return the results and current server list
    const all = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ results, all });
  } catch (e) {
    console.error('Error in POST /api/debug/resync-articles', e);
    return NextResponse.json({ error: e instanceof Error ? e.message : 'failed' }, { status: 500 });
  }
}
