import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const slug = body?.slug;
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
    try {
      const updated = await prisma.article.update({ where: { slug } as any, data: { views: { increment: 1 } } as any });
      return NextResponse.json({ ok: true, views: updated.views });
    } catch (e) {
      // fallback: try case-insensitive match
      const all = await prisma.article.findMany();
      const found = all.find((a: any) => (a.slug || '').toLowerCase() === String(slug).toLowerCase());
      if (!found) return NextResponse.json({ error: 'not found' }, { status: 404 });
      const updated = await prisma.article.update({ where: { id: found.id }, data: { views: { increment: 1 } } as any });
      return NextResponse.json({ ok: true, views: updated.views });
    }
  } catch (e) {
    console.error('Error incrementing views', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
