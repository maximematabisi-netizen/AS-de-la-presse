import { NextResponse } from 'next/server';
import mockArticles from '../../../actualite/app/data/mockArticles';

export async function POST(req: Request) {
  // mock sending daily summary: pick top 5 by views
  try {
    const top = mockArticles.slice().sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0,5);
    // In a real implementation we'd queue email sending via SendGrid/SMTP here.
    return NextResponse.json({ ok: true, top });
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
