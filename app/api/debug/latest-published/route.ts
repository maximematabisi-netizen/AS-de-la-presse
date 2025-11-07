import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prismaClient';

export async function GET() {
  try {
    const latest = await prisma.article.findFirst({
      where: { publishedAt: { not: null } },
      orderBy: { publishedAt: 'desc' },
      select: { publishedAt: true },
    });
    return NextResponse.json({ latestPublishedAt: latest?.publishedAt ? new Date(latest.publishedAt).toISOString() : null });
  } catch (e) {
    console.error('Error in GET /api/debug/latest-published', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
