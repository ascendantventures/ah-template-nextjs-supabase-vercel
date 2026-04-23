import { updateSession } from '@/lib/supabase/middleware';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes - no auth needed
  const isPublic =
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/auth/') ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/';

  if (isPublic) return NextResponse.next();

  // Protected app routes
  const isProtected =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/portfolio') ||
    pathname.startsWith('/transactions') ||
    pathname.startsWith('/watchlist') ||
    pathname.startsWith('/api/holdings') ||
    pathname.startsWith('/api/transactions') ||
    pathname.startsWith('/api/watchlist') ||
    pathname.startsWith('/api/prices') ||
    pathname.startsWith('/api/coins');

  if (isProtected) {
    return await updateSession(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
