import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prismaClient';

export async function GET() {
  try {
    const videos = await prisma.video.findMany({ orderBy: { createdAt: 'desc' } });
    // Return just the videoId strings for compatibility
    return NextResponse.json(videos.map(v => v.videoId));
  } catch (e: any) {
    console.error('Videos GET failed:', e);
    return NextResponse.json({ 
      error: e?.message || 'failed', 
      details: process.env.NODE_ENV === 'development' ? e?.stack : undefined 
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { videoId } = body || {};
    console.log('Videos POST request:', { videoId });
    
    if (!videoId || !videoId.trim()) {
      console.error('Videos POST: videoId is required');
      return NextResponse.json({ error: 'videoId required' }, { status: 400 });
    }
    
    const created = await prisma.video.create({ 
      data: { 
        videoId: videoId.trim()
      } 
    });
    
    console.log('Video created successfully:', created.id);
    return NextResponse.json(created);
  } catch (e: any) {
    console.error('Videos POST failed:', e);
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
    const videoId = url.searchParams.get('videoId');
    if (!videoId) return NextResponse.json({ error: 'videoId required' }, { status: 400 });
    
    const deleted = await prisma.video.deleteMany({ 
      where: { videoId } 
    });
    
    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, deleted: deleted.count });
  } catch (e: any) {
    console.error('Videos DELETE failed:', e);
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}

