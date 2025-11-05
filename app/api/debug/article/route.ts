import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prismaClient';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const slug = req.nextUrl.searchParams.get('slug');
    if (!slug) return NextResponse.json({ error: 'slug required' }, { status: 400 });
    const article = await prisma.article.findUnique({ where: { slug } as any });
    if (!article) return NextResponse.json({ error: 'not found' }, { status: 404 });
    return NextResponse.json(article);
  } catch (e: any) {
    console.error('Error in debug GET /api/debug/article', e);
    const err = { name: e?.name, code: e?.code, message: e?.message, meta: e?.meta };
    return NextResponse.json({ error: 'failed', details: err }, { status: 500 });
  }
}
