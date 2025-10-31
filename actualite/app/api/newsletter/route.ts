import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const data = await request.json().catch(() => null);
    const email = (data?.email || '').toString().trim().toLowerCase();
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid email' }, { status: 400 });
    }

    const base = process.cwd();
    const dataDir = path.join(base, 'actualite', 'data');
    const filePath = path.join(dataDir, 'newsletter_signups.json');

    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Read existing file or start with empty array
    let arr: Array<any> = [];
    try {
      const raw = await fs.readFile(filePath, 'utf8');
      arr = JSON.parse(raw);
      if (!Array.isArray(arr)) arr = [];
    } catch (e) {
      // ignore, we'll create the file
    }

    // Deduplicate (case-insensitive)
    const exists = arr.some((x) => String(x.email).toLowerCase() === email);
    if (exists) {
      // Try to persist to Prisma (idempotent attempt) but still return success
      try {
        const { default: prisma } = await import('../../../../lib/prismaClient');
        if (prisma?.newsletterSubscriber) {
          await prisma.newsletterSubscriber.upsert({
            where: { email },
            update: {},
            create: { email },
          });
        }
      } catch (e) {
        // ignore persistence errors for idempotent case
      }
      return NextResponse.json({ ok: true, duplicate: true });
    }

    // Append the new signup with metadata
    const entry = { email, createdAt: new Date().toISOString() };
    arr.push(entry);

    await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');

    // eslint-disable-next-line no-console
    console.log('[newsletter] signup saved:', entry);

    // Attempt to persist to Prisma if available (best-effort)
    try {
      const { default: prisma } = await import('../../../../lib/prismaClient');
      if (prisma?.newsletterSubscriber) {
        await prisma.newsletterSubscriber.create({ data: { email } });
        // eslint-disable-next-line no-console
        console.log('[newsletter] saved to prisma:', email);
      }
    } catch (e) {
  // If Prisma not available or model not migrated yet, ignore - file persistence remains.
  // eslint-disable-next-line no-console
  console.warn('[newsletter] prisma persistence skipped or failed', (e as any)?.message || e);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[newsletter] error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
