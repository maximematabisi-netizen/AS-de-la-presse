import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SUBSCRIBERS_FILE = path.join(process.cwd(), 'data', 'newsletter_subscribers.json');

function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 });
    ensureDataDir();
    let list: string[] = [];
    if (fs.existsSync(SUBSCRIBERS_FILE)) {
      try { list = JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, 'utf-8')); } catch (e) { list = []; }
    }
    if (!list.includes(email)) {
      list.push(email);
      fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2));
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: 'invalid' }, { status: 500 });
  }
}
