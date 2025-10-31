import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const all = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    // Return minimal fields to inspect slugs and publish status
    const out = all.map(a => ({ id: a.id, slug: a.slug, title: a.title, publishedAt: a.publishedAt, synced: (a as any).synced ?? true }));
    return NextResponse.json(out);
  } catch (e) {
    console.error('Error in debug GET /api/debug/articles', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
