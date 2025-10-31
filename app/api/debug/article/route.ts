import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
    const article = await prisma.article.findUnique({ where: { slug } as any });
    if (!article) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(article);
  } catch (e) {
    console.error('Error in debug GET /api/debug/article', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
