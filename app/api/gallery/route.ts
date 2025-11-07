import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prismaClient';

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json(items);
  } catch (e: any) {
    console.error('Gallery GET failed:', e);
    return NextResponse.json({ error: e?.message || 'failed', details: process.env.NODE_ENV === 'development' ? e?.stack : undefined }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, imageUrl } = body || {};
    console.log('Gallery POST request:', { title, imageUrl: imageUrl?.substring(0, 50) + '...' });
    
    if (!imageUrl) {
      console.error('Gallery POST: imageUrl is required');
      return NextResponse.json({ error: 'imageUrl required' }, { status: 400 });
    }
    
    const created = await prisma.galleryItem.create({ 
      data: { 
        title: title || null, 
        imageUrl 
      } 
    });
    
    console.log('Gallery item created successfully:', created.id);
    return NextResponse.json(created);
  } catch (e: any) {
    console.error('Gallery POST failed:', e);
    console.error('Error details:', {
      message: e?.message,
      code: e?.code,
      meta: e?.meta,
      stack: e?.stack,
    });
    return NextResponse.json({ 
      error: e?.message || 'failed',
      details: process.env.NODE_ENV === 'development' ? {
        message: e?.message,
        code: e?.code,
        meta: e?.meta,
      } : undefined
    }, { status: 500 });
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



