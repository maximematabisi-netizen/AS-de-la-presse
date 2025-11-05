import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prismaClient';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const all = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    const out = all.map(a => ({ id: a.id, slug: a.slug, title: a.title, publishedAt: a.publishedAt, synced: (a as any).synced ?? true }));
    return NextResponse.json(out);
  } catch (e: any) {
    console.error('Error in debug GET /api/debug/articles', e);
    const err = {
      name: e?.name,
      code: e?.code,
      message: e?.message,
      meta: e?.meta,
    };
    return NextResponse.json({ error: 'failed', details: err }, { status: 500 });
  }
}
