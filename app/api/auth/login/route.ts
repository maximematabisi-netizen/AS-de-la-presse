import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import prisma from '@/lib/prismaClient';
import * as bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-placeholder';

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }

    console.log('Login attempt for username:', username);
    console.log('Prisma client available:', !!prisma);
    console.log('Prisma user model available:', !!prisma?.user);

    // Trouver l'utilisateur
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          email: true,
          password: true, // S'assurer que le password est inclus
          role: true,
        },
      });
      console.log('User query result:', user ? 'Found' : 'Not found');
      console.log('User data:', user ? { id: user.id, username: user.username, hasPassword: !!user.password } : null);
    } catch (dbError: any) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError?.message || 'Unknown error'}`);
    }

    if (!user) {
      console.log('User not found:', username);
      return NextResponse.json(
        { error: 'Nom d\'utilisateur ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    console.log('User found, checking password...');
    
    if (!user.password) {
      console.error('User password is missing!');
      return NextResponse.json(
        { error: 'Erreur: mot de passe non trouvé pour cet utilisateur' },
        { status: 500 }
      );
    }
    
    console.log('Password hash length:', user.password?.length);

    // Vérifier le mot de passe
    let isValid = false;
    try {
      isValid = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', isValid);
    } catch (bcryptError: any) {
      console.error('Bcrypt error:', bcryptError);
      throw new Error(`Password verification error: ${bcryptError?.message || 'Unknown error'}`);
    }
    if (!isValid) {
      console.log('Invalid password for user:', username);
      return NextResponse.json(
        { error: 'Nom d\'utilisateur ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    console.log('Password valid, creating session...');

    // Créer le token JWT
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(JWT_SECRET);
    const token = await new SignJWT({
      userId: user.id,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(secretKey);

    // Créer la réponse avec le cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 heures
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json(
      { 
        error: 'Erreur lors de la connexion',
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { status: 500 }
    );
  }
}

