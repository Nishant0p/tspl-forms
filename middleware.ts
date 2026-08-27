import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/platform', '/sign-in', '/access-denied'];
const CSRF_COOKIE_NAME = 'csrf_token';

function generateCsrfToken(): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
  }
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function hasValidSessionCookie(raw: string | undefined) {
  if (!raw) return false;

  try {
    const parsed = JSON.parse(raw) as { id?: unknown; email?: unknown };
    return typeof parsed?.id === 'string' && parsed.id.length > 0 && typeof parsed?.email === 'string';
  } catch {
    return false;
  }
}

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

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  let response: NextResponse;

  if (isPublic(pathname)) {
    response = NextResponse.next();
  } else {
    const session = req.cookies.get('session_user')?.value;
    if (!hasValidSessionCookie(session)) {
      const signIn = req.nextUrl.clone();
      signIn.pathname = '/sign-in';
      signIn.searchParams.set('redirect', pathname);
      response = NextResponse.redirect(signIn);
      response.cookies.delete('session_user');
    } else {
      response = NextResponse.next();
    }
  }

  // Ensure CSRF Cookie exists on all incoming requests
  const csrfCookie = req.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!csrfCookie || csrfCookie.length < 32) {
    const newToken = generateCsrfToken();
    response.cookies.set(CSRF_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};