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
    for (const item of body) {
      if (!item || !item.slug) continue;
      const rawSlug = String(item.slug);
      // normalize slug similarly to server-side creation
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
      const slug = slugify(decodeURIComponent(rawSlug));

      // If the item is marked deleted on the client, delete it server-side
      if ((item as any).deleted) {
        try {
          await prisma.article.delete({ where: { slug } });
          results.push({ slug, ok: true, deleted: true });
        } catch (e) {
          // If deletion failed (not found etc.), push error but continue
          results.push({ slug, ok: false, error: e instanceof Error ? e.message : String(e) });
        }
        continue;
      }

      const data: any = {
        title: item.title || item.slug,
        slug,
        excerpt: item.excerpt || '',
        content: item.content || '',
        category: item.category || 'Actualité',
        image: item.image || null,
        highlightedQuote: item.highlightedQuote || null,
        isBreaking: !!item.isBreaking,
        publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
        synced: true,
        syncedAt: new Date(),
        authorName: item.authorName || null,
      };

      try {
        const up = await prisma.article.upsert({
          where: { slug },
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
