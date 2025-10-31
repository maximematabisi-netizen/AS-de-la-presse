import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'no file' }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // save under dated subfolder: /public/uploads/YYYY-MM-DD/
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datedFolder = `${yyyy}-${mm}-${dd}`;
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', datedFolder);
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const safeName = file.name.replace(/[^a-zA-Z0-9.-_]/g, '-');
    const fileName = `${Date.now()}-${safeName}`;
    const outPath = path.join(uploadsDir, fileName);
    fs.writeFileSync(outPath, buffer);

    const url = `/uploads/${datedFolder}/${fileName}`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'upload failed' }, { status: 500 });
  }
}
