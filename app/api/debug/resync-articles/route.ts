import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!Array.isArray(body)) return NextResponse.json({ error: 'expected array' }, { status: 400 });

    const results: any[] = [];
    for (const item of body) {
      if (!item || !item.slug) continue;
      const slug = String(item.slug);
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
        results.push({ slug, ok: false, error: String(e) });
      }
    }

    // return the results and current server list
    const all = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ results, all });
  } catch (e) {
    console.error('Error in POST /api/debug/resync-articles', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
