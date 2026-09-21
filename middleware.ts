import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/session';

const PUBLIC_ROUTES = ['/', '/platform', '/sign-in', '/access-denied'];

function isPublic(pathname: string) {
  return (
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/')) ||
    pathname.startsWith('/submit/') ||
    pathname.startsWith('/form/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    /\.[^/]+$/.test(pathname) // static files
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('session_user')?.value;

  // Normalize host & origin headers to prevent trailing-dot mismatch in Next.js Server Actions CSRF check
  const requestHeaders = new Headers(req.headers);
  let headersModified = false;

  const origin = req.headers.get('origin');
  if (origin) {
    try {
      const url = new URL(origin);
      if (url.hostname.endsWith('.')) {
        url.hostname = url.hostname.replace(/\.+$/, '');
        requestHeaders.set('origin', url.origin);
        headersModified = true;
      }
    } catch {
      if (origin.includes('.tsplgroup.in.')) {
        requestHeaders.set('origin', origin.replace(/\.tsplgroup\.in\./g, '.tsplgroup.in'));
        headersModified = true;
      }
    }
  }

  const referer = req.headers.get('referer');
  if (referer) {
    try {
      const url = new URL(referer);
      if (url.hostname.endsWith('.')) {
        url.hostname = url.hostname.replace(/\.+$/, '');
        requestHeaders.set('referer', url.toString());
        headersModified = true;
      }
    } catch {
      if (referer.includes('.tsplgroup.in.')) {
        requestHeaders.set('referer', referer.replace(/\.tsplgroup\.in\./g, '.tsplgroup.in'));
        headersModified = true;
      }
    }
  }

  const xForwardedHost = req.headers.get('x-forwarded-host');
  if (xForwardedHost && xForwardedHost.includes('.')) {
    const cleaned = xForwardedHost.replace(/\.+(:|\/|$)/, '$1');
    if (cleaned !== xForwardedHost) {
      requestHeaders.set('x-forwarded-host', cleaned);
      headersModified = true;
    }
  }

  const host = req.headers.get('host');
  if (host && host.includes('.')) {
    const cleaned = host.replace(/\.+(:|\/|$)/, '$1');
    if (cleaned !== host) {
      requestHeaders.set('host', cleaned);
      headersModified = true;
    }
  }

  let isAuthenticated = false;
  if (session) {
    const verified = await verifySessionToken<Record<string, any>>(session);
    isAuthenticated = Boolean(
      verified &&
        ((typeof verified.id === 'string' && verified.id.trim().length > 0) ||
          typeof verified.id === 'number' ||
          (typeof verified.employeeId === 'string' && verified.employeeId.trim().length > 0) ||
          typeof verified.employeeId === 'number' ||
          (typeof verified.email === 'string' && verified.email.trim().length > 0))
    );
  }

  if (isPublic(pathname)) {
    return NextResponse.next(headersModified ? { request: { headers: requestHeaders } } : undefined);
  }

  // Protected route check
  if (!isAuthenticated) {
    const signIn = req.nextUrl.clone();
    signIn.pathname = '/sign-in';
    if (pathname !== '/sign-in' && pathname !== '/access-denied') {
      signIn.searchParams.set('redirect', pathname);
    }
    const response = NextResponse.redirect(signIn);
    response.cookies.set('session_user', '', { path: '/', maxAge: 0 });
    return response;
  }

  return NextResponse.next(headersModified ? { request: { headers: requestHeaders } } : undefined);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};