import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-placeholder';

export async function GET(req: NextRequest) {
  try {
    const cookie = req.cookies.get('session')?.value;
    
    if (!cookie) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const encoder = new TextEncoder();
    const secretKey = encoder.encode(JWT_SECRET);
    const { payload } = await jwtVerify(cookie, secretKey);

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: (payload as any).userId,
        username: (payload as any).username,
        role: (payload as any).role,
      },
    });
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

