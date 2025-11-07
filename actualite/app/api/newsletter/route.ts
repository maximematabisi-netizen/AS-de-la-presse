import { NextResponse } from 'next/server';
import prisma from '@/lib/prismaClient';

// Validation simple de l'email
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: Request) {
  try {
    const data = await request.json().catch(() => ({}));
    const email = (data?.email || '').toString().trim().toLowerCase();
    
    // Validation de l'email
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }
    
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Format d\'email invalide' }, { status: 400 });
    }

    // Sauvegarder dans la base de données Prisma
    try {
      // Utiliser upsert pour éviter les doublons (email est unique dans le schéma)
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        update: {}, // Si l'email existe déjà, on ne fait rien
        create: { email },
      });
      
      console.log('[newsletter] subscription saved:', email);
      return NextResponse.json({ ok: true, message: 'Inscription réussie' });
    } catch (dbError: any) {
      console.error('[newsletter] database error:', dbError);
      
      // Si l'email existe déjà (contrainte unique), retourner succès (idempotent)
      if (dbError?.code === 'P2002' || dbError?.meta?.target?.includes('email')) {
        console.log('[newsletter] email already exists:', email);
        return NextResponse.json({ ok: true, duplicate: true, message: 'Vous êtes déjà inscrit' });
      }
      
      // Autres erreurs de base de données
      return NextResponse.json({ 
        error: 'Erreur lors de l\'inscription à la newsletter',
        details: process.env.NODE_ENV === 'development' ? dbError?.message : undefined
      }, { status: 500 });
    }
  } catch (err: any) {
    console.error('[newsletter] error:', err);
    return NextResponse.json({ 
      error: 'Erreur lors de l\'inscription à la newsletter',
      details: process.env.NODE_ENV === 'development' ? err?.message : undefined
    }, { status: 500 });
  }
}
