import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  // Check for Better Auth session cookie and legacy fallbacks
  const token = 
    request.cookies.get('better-auth.session_token')?.value || 
    request.cookies.get('__Secure-better-auth.session_token')?.value ||
    request.cookies.get('aurahq_auth')?.value || 
    request.cookies.get('admin_access_token')?.value;

  const role = request.cookies.get('user_role')?.value;
  const url = request.nextUrl.clone();

  // Redirect legacy /admin routes to /aurahq/admin
  if (url.pathname === '/admin' || url.pathname.startsWith('/admin/')) {
    url.pathname = url.pathname.replace('/admin', '/aurahq/admin');
    return NextResponse.redirect(url);
  }

  // Redirect legacy /dashboard routes to /aurahq/sales
  if (url.pathname === '/dashboard' || url.pathname.startsWith('/dashboard/')) {
    url.pathname = url.pathname.replace('/dashboard', '/aurahq/sales');
    return NextResponse.redirect(url);
  }

  // Protect all AuraHQ routes
  if (url.pathname.startsWith('/aurahq')) {
    if (!token) {
      url.pathname = '/login';
      url.searchParams.set('from', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Role barrier on /aurahq/admin: Sales Reps are blocked before loading bundle
    if (url.pathname.startsWith('/aurahq/admin') && role && role !== 'admin') {
      url.pathname = '/aurahq/sales';
      return NextResponse.redirect(url);
    }

    // Root /aurahq redirects to designated workspace
    if (url.pathname === '/aurahq' || url.pathname === '/aurahq/') {
      url.pathname = role === 'admin' ? '/aurahq/admin' : '/aurahq/sales';
      return NextResponse.redirect(url);
    }
  }

  // Handling /login
  if (url.pathname === '/login') {
    if (url.searchParams.get('logout') === 'true') {
      const response = NextResponse.next();
      const authCookies = [
        'better-auth.session_token',
        '__Secure-better-auth.session_token',
        'aurahq_auth',
        'admin_access_token',
        'user_role',
      ];
      authCookies.forEach((cookieName) => {
        response.cookies.delete(cookieName);
      });
      return response;
    }

    if (token) {
      url.pathname = role === 'admin' ? '/aurahq/admin' : '/aurahq/sales';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/aurahq/:path*', '/admin/:path*', '/dashboard/:path*', '/login'],
};
