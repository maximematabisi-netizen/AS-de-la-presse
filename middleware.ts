import { NextResponse } from 'next/server';

// Minimal pass-through middleware for production to avoid edge-runtime failures.
// Keep this middleware extremely small: do not import node modules or Prisma here.
export function middleware(request: Request) {
	// No-op: allow the request to continue to the app
	return NextResponse.next();
}

// Apply to all routes by default. Adjust `matcher` if you need to restrict.
export const config = {
	matcher: '/:path*',
};
