import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .normalize('NFD') // split accents
    .replace(/\p{Diacritic}/gu, '') // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function POST(req: Request) {
  try {
    const all = await prisma.article.findMany({ orderBy: { id: 'asc' } });
    const seen = new Map<string, number>();
    const changes: Array<{ id: number; old: string; next: string }> = [];

    for (const a of all) {
      const base = slugify(a.title || a.slug || String(a.id));
      let candidate = base;
      let i = 1;
      while (true) {
        const existing = await prisma.article.findUnique({ where: { slug: candidate } as any });
        if (!existing || existing.id === a.id) break;
        candidate = `${base}-${i++}`;
      }
      if (candidate !== a.slug) {
        await prisma.article.update({ where: { id: a.id }, data: { slug: candidate } as any });
        changes.push({ id: a.id, old: a.slug, next: candidate });
      }
    }

    const updated = await prisma.article.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ ok: true, changes, all: updated });
  } catch (e) {
    console.error('Error normalizing slugs', e);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
