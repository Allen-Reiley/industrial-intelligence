import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  // Check for Better Auth session cookie and legacy fallbacks
  const token = 
    request.cookies.get('better-auth.session_token')?.value || 
    request.cookies.get('__Secure-better-auth.session_token')?.value ||
    request.cookies.get('aurahq_auth')?.value || 
    request.cookies.get('admin_access_token')?.value;

  const url = request.nextUrl.clone();

  // Redirect legacy /admin routes to /aurahq/admin
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
    url.pathname = url.pathname.replace('/admin', '/aurahq/admin');
    return NextResponse.redirect(url);
  }

  // Redirect legacy /dashboard routes to /aurahq/dashboard
  if (url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/')) {
    url.pathname = url.pathname.replace('/dashboard', '/aurahq/dashboard');
    return NextResponse.redirect(url);
  }

  // Protect all AuraHQ routes (/aurahq/admin, /aurahq/sales, /aurahq/dashboard)
  if (url.pathname.startsWith('/aurahq')) {
    if (!token) {
      url.pathname = '/login';
      url.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users visiting /login directly to the AuraHQ workspace
  if (url.pathname === '/login') {
    if (token) {
      url.pathname = '/aurahq/sales';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/aurahq/:path*', '/admin/:path*', '/dashboard/:path*', '/login'],
};
