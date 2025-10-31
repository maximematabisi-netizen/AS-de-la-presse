import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const DATA_PATH = path.join(process.cwd(), 'data', 'interview_requests.json');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    let existing: any[] = [];
    try {
      const raw = await fs.readFile(DATA_PATH, 'utf-8');
      existing = JSON.parse(raw || '[]');
    } catch (e) {
      // file may not exist yet
      existing = [];
    }
    existing.push(body);
    // ensure data directory exists
    await fs.mkdir(path.dirname(DATA_PATH), { recursive: true });
    await fs.writeFile(DATA_PATH, JSON.stringify(existing, null, 2), 'utf-8');
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    console.error('Failed to save interview request', err);
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}
