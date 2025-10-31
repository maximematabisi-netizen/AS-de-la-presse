import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    let videoId = url.searchParams.get('videoId');
    if (!videoId) return NextResponse.json({ error: 'videoId is required' }, { status: 400 });

    // Normalize: accept raw id or full YouTube URL
    try {
      // If videoId contains a full URL, extract the v= param or youtu.be path
      const maybeUrl = new URL(videoId);
      if (maybeUrl.hostname.includes('youtu.be')) {
        videoId = maybeUrl.pathname.replace(/^\//, '');
      } else if (maybeUrl.hostname.includes('youtube.com')) {
        const v = maybeUrl.searchParams.get('v');
        if (v) videoId = v;
      }
    } catch (e) {
      // not a full URL, fall back to regex extraction below
    }

    // fallback: try to find 11-char YouTube id in the string
    const regex = /([A-Za-z0-9_-]{11})/;
    const m = String(videoId).match(regex);
    if (m) videoId = m[1];

    // Use YouTube oEmbed to get title/thumbnail without API key
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'Video not found or oEmbed failed' }, { status: 404 });
    }
    const payload = await res.json();

    // oEmbed returns thumbnail_url; return it directly
    return NextResponse.json({
      title: payload.title,
      author_name: payload.author_name,
      thumbnail: payload.thumbnail_url,
    });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
