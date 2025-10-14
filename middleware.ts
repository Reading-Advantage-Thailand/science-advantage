import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the session token from cookies
  const sessionToken = request.cookies.get('session_token')?.value;
  const hasSession = !!sessionToken;

  // Protected routes that require authentication
  const protectedRoutes = ['/student', '/teacher', '/admin', '/system'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // If accessing protected route without session, redirect to login
  if (isProtectedRoute && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If accessing login with session, redirect to dashboard
  // The dashboard page will handle role-based redirect
  if (hasSession && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  runtime: 'nodejs',
  matcher: ['/student/:path*', '/teacher/:path*', '/admin/:path*', '/system/:path*', '/dashboard', '/login'],
};
