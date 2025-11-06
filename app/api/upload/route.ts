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

    // Vérifier la taille du fichier (limite Vercel: 4.5MB pour les fonctions serverless)
    const maxSize = 4.5 * 1024 * 1024; // 4.5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File size exceeds limit of ${maxSize / 1024 / 1024}MB`,
        code: 'FILE_TOO_LARGE'
      }, { status: 400 });
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
    console.log('BLOB_READ_WRITE_TOKEN present:', !!process.env.BLOB_READ_WRITE_TOKEN);
    console.log('NODE_ENV:', process.env.NODE_ENV);

    // Vérifier si Vercel Blob est configuré
    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN;
    if (!hasToken) {
      console.error('BLOB_READ_WRITE_TOKEN is not set');
      return NextResponse.json({ 
        error: 'Vercel Blob Storage is not configured. Please enable Blob Storage in your Vercel project settings.',
        code: 'BLOB_NOT_CONFIGURED',
        help: 'Go to https://vercel.com/dashboard → Your Project → Storage → Create Blob, then redeploy your project.',
        details: {
          hasToken: false,
          nodeEnv: process.env.NODE_ENV
        }
      }, { status: 500 });
    }

    // Upload vers Vercel Blob Storage
    let blob;
    try {
      console.log('Attempting to upload to Vercel Blob...');
      blob = await put(fileName, file, {
        access: 'public',
        contentType: file.type,
      });
      console.log('File uploaded successfully:', blob.url);
      return NextResponse.json({ url: blob.url });
    } catch (blobError: any) {
      console.error('Vercel Blob error:', blobError);
      console.error('Error type:', typeof blobError);
      console.error('Error message:', blobError?.message);
      console.error('Error code:', blobError?.code);
      console.error('Error stack:', blobError?.stack);
      
      // Si Vercel Blob n'est pas configuré, retourner une erreur explicite
      const errorMessage = String(blobError?.message || '');
      const errorCode = String(blobError?.code || '');
      const errorString = JSON.stringify(blobError);
      
      if (errorMessage.includes('BLOB_READ_WRITE_TOKEN') || 
          errorMessage.includes('Unauthorized') ||
          errorMessage.includes('authentication') ||
          errorMessage.includes('401') ||
          errorMessage.includes('403') ||
          errorCode === 'UNAUTHORIZED' ||
          errorCode === 'AUTH_ERROR' ||
          errorString.includes('token') ||
          !hasToken) {
        return NextResponse.json({ 
          error: 'Vercel Blob Storage authentication failed. Please verify that Blob Storage is properly configured and redeploy your project.',
          code: 'BLOB_AUTH_ERROR',
          help: '1. Go to https://vercel.com/dashboard → Your Project → Storage → Verify Blob exists\n2. Go to Settings → Environment Variables → Verify BLOB_READ_WRITE_TOKEN exists\n3. Redeploy your project',
          details: {
            hasToken,
            errorMessage: errorMessage.substring(0, 200),
            errorCode,
            nodeEnv: process.env.NODE_ENV
          }
        }, { status: 500 });
      }
      
      // Autres erreurs
      return NextResponse.json({ 
        error: 'Failed to upload file to Vercel Blob Storage',
        code: 'BLOB_UPLOAD_ERROR',
        details: {
          message: errorMessage.substring(0, 200),
          code: errorCode,
          hasToken
        }
      }, { status: 500 });
    }
  } catch (e: any) {
    console.error('Upload error:', e);
    console.error('Error details:', {
      message: e?.message,
      code: e?.code,
      name: e?.name,
      stack: e?.stack,
    });
    return NextResponse.json({ 
      error: e?.message || 'upload failed',
      code: e?.code || 'UNKNOWN_ERROR',
      details: {
        message: e?.message?.substring(0, 200),
        code: e?.code,
        name: e?.name,
        hasToken: !!process.env.BLOB_READ_WRITE_TOKEN
      }
    }, { status: 500 });
  }
}
