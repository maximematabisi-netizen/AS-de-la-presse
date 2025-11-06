import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ error: 'no file provided' }, { status: 400 });
    }

    // Vérifier que le fichier est une image
    if (!file.type || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'file must be an image' }, { status: 400 });
    }

    // Générer un nom de fichier unique avec date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const datedFolder = `${yyyy}-${mm}-${dd}`;
    const safeName = file.name.replace(/[^a-zA-Z0-9.-_]/g, '-');
    const fileName = `uploads/${datedFolder}/${Date.now()}-${safeName}`;

    console.log('Uploading file:', fileName, 'Size:', file.size, 'Type:', file.type);

    // Vérifier si Vercel Blob est configuré
    if (!process.env.BLOB_READ_WRITE_TOKEN && process.env.NODE_ENV === 'production') {
      console.error('BLOB_READ_WRITE_TOKEN is not set in production');
      return NextResponse.json({ 
        error: 'Vercel Blob Storage is not configured. Please enable Blob Storage in your Vercel project settings (Settings → Storage → Create Blob).',
        code: 'BLOB_NOT_CONFIGURED',
        help: 'Go to https://vercel.com/dashboard → Your Project → Storage → Create Blob'
      }, { status: 500 });
    }

    // Upload vers Vercel Blob Storage
    let blob;
    try {
      blob = await put(fileName, file, {
        access: 'public',
        contentType: file.type,
      });
      console.log('File uploaded successfully:', blob.url);
    } catch (blobError: any) {
      console.error('Vercel Blob error:', blobError);
      // Si Vercel Blob n'est pas configuré, retourner une erreur explicite
      const errorMessage = blobError?.message || '';
      const errorCode = blobError?.code || '';
      
      if (errorMessage.includes('BLOB_READ_WRITE_TOKEN') || 
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('authentication') ||
          errorCode === 'UNAUTHORIZED' ||
          errorCode === 'AUTH_ERROR' ||
          !process.env.BLOB_READ_WRITE_TOKEN) {
        return NextResponse.json({ 
          error: 'Vercel Blob Storage is not configured. Please enable Blob Storage in your Vercel project settings.',
          code: 'BLOB_NOT_CONFIGURED',
          help: 'Go to https://vercel.com/dashboard → Your Project → Storage → Create Blob',
          details: process.env.NODE_ENV === 'development' ? {
            message: blobError?.message,
            code: blobError?.code,
            hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
          } : undefined
        }, { status: 500 });
      }
      throw blobError;
    }

    return NextResponse.json({ url: blob.url });
  } catch (e: any) {
    console.error('Upload error:', e);
    console.error('Error details:', {
      message: e?.message,
      code: e?.code,
      stack: e?.stack,
    });
    return NextResponse.json({ 
      error: e?.message || 'upload failed',
      code: e?.code,
      details: process.env.NODE_ENV === 'development' ? {
        message: e?.message,
        code: e?.code,
        stack: e?.stack?.split('\n').slice(0, 5).join('\n'),
      } : undefined
    }, { status: 500 });
  }
}
