import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, imageUrl } = body || {};
    if (!imageUrl) return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });
    const created = await prisma.galleryItem.create({ data: { title: title || null, imageUrl } });
    return NextResponse.json(created);
  } catch (e: any) {
    console.error('Gallery POST failed:', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const id = Number(url.searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
    const deleted = await prisma.galleryItem.delete({ where: { id } });
    return NextResponse.json(deleted);
  } catch (e: any) {
    console.error('Gallery DELETE failed:', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}



