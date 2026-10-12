/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import proxy from './proxy';

describe('proxy.ts Middleware Routing & RBAC Tests', () => {
  const createRequest = (url: string, cookies: Record<string, string> = {}) => {
    const req = new NextRequest(new URL(url, 'http://localhost:3000'));
    for (const [key, val] of Object.entries(cookies)) {
      req.cookies.set(key, val);
    }
    return req;
  };

  it('redirects unauthenticated user accessing /aurahq/admin to /login', () => {
    const req = createRequest('http://localhost:3000/aurahq/admin');
    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?from=%2Faurahq%2Fadmin');
  });

  it('redirects unauthenticated user accessing /aurahq/sales to /login', () => {
    const req = createRequest('http://localhost:3000/aurahq/sales');
    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/login?from=%2Faurahq%2Fsales');
  });

  it('blocks authenticated Sales Rep from accessing /aurahq/admin and redirects to /aurahq/sales', () => {
    const req = createRequest('http://localhost:3000/aurahq/admin', {
      'better-auth.session_token': 'valid_token_123',
      'user_role': 'sales'
    });
    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/aurahq/sales');
  });

  it('allows authenticated Admin to access /aurahq/admin', () => {
    const req = createRequest('http://localhost:3000/aurahq/admin', {
      'better-auth.session_token': 'valid_token_123',
      'user_role': 'admin'
    });
    const res = proxy(req);
    expect(res.status).toBe(200); // NextResponse.next()
  });

  it('redirects authenticated Admin on /login to /aurahq/admin', () => {
    const req = createRequest('http://localhost:3000/login', {
      'better-auth.session_token': 'valid_token_123',
      'user_role': 'admin'
    });
    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/aurahq/admin');
  });

  it('redirects authenticated Sales Rep on /login to /aurahq/sales', () => {
    const req = createRequest('http://localhost:3000/login', {
      'better-auth.session_token': 'valid_token_123',
      'user_role': 'sales'
    });
    const res = proxy(req);
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/aurahq/sales');
  });

  it('redirects root /aurahq to /aurahq/admin for Admin and /aurahq/sales for Sales Rep', () => {
    const adminReq = createRequest('http://localhost:3000/aurahq', {
      'better-auth.session_token': 'valid_token_123',
      'user_role': 'admin'
    });
    expect(proxy(adminReq).headers.get('location')).toBe('http://localhost:3000/aurahq/admin');

    const salesReq = createRequest('http://localhost:3000/aurahq', {
      'better-auth.session_token': 'valid_token_123',
      'user_role': 'sales'
    });
    expect(proxy(salesReq).headers.get('location')).toBe('http://localhost:3000/aurahq/sales');
  });

  it('allows access to /login when logout=true even if auth cookies are still present', () => {
    const req = createRequest('http://localhost:3000/login?logout=true', {
      'better-auth.session_token': 'valid_token_123',
      'user_role': 'sales',
    });
    const res = proxy(req);
    expect(res.status).toBe(200); // Does NOT redirect to /aurahq/sales
  });

  it('redirects legacy /admin and /dashboard routes to modern aurahq equivalents', () => {
    const adminReq = createRequest('http://localhost:3000/admin');
    expect(proxy(adminReq).headers.get('location')).toBe('http://localhost:3000/aurahq/admin');

    const dashReq = createRequest('http://localhost:3000/dashboard');
    expect(proxy(dashReq).headers.get('location')).toBe('http://localhost:3000/aurahq/sales');
  });
});
