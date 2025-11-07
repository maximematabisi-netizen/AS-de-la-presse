import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const env = process.env.HOMEPAGE_ARTICLE_LIMIT;
    const defaultLimit = env ? parseInt(env, 10) : 1000;
    const isDefault = !env;
    return NextResponse.json({ limit: isNaN(defaultLimit) ? 1000 : defaultLimit, isDefault });
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
