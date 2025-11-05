import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// Edge-compatible JWT verification using `jose`.
// Uses HS256 with a shared secret. In production prefer RS256 or an introspection endpoint.
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-placeholder'

async function isAuthenticated(req: NextRequest) {
  const cookie = req.cookies.get('session')?.value
  if (!cookie) return false
  try {
    const encoder = new TextEncoder()
    const secretKey = encoder.encode(JWT_SECRET)
    const { payload } = await jwtVerify(cookie, secretKey)
    // Require role 'admin'
    if (payload && (payload as any).role === 'admin') return true
    return false
  } catch (err) {
    return false
  }
}

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const ok = await isAuthenticated(req)
    if (!ok) {
      const loginUrl = new URL('/admin/login', req.url)
      loginUrl.searchParams.set('next', req.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
