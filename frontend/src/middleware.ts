import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_access_token')?.value;
  const url = request.nextUrl.clone();

  // Protect admin routes
  if (url.pathname.startsWith('/admin')) {
    if (!token) {
      url.pathname = '/login';
      // Store the requested path to redirect back after successful login
      url.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from the login page
  if (url.pathname === '/login') {
    if (token) {
      url.pathname = '/admin';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};
