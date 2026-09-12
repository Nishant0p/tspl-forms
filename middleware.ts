import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/platform', '/sign-in', '/access-denied'];

function parseSessionCookie(raw: string | undefined): any | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }
}

function hasValidSessionCookie(raw: string | undefined): boolean {
  const parsed = parseSessionCookie(raw);
  if (!parsed) return false;

  const hasId =
    (typeof parsed.id === 'string' && parsed.id.trim().length > 0) ||
    typeof parsed.id === 'number' ||
    (typeof parsed.employeeId === 'string' && parsed.employeeId.trim().length > 0) ||
    typeof parsed.employeeId === 'number';

  const hasEmail = typeof parsed.email === 'string' && parsed.email.trim().length > 0;
  const hasRole = typeof parsed.role === 'string' && parsed.role.trim().length > 0;

  return Boolean(hasId || hasEmail || hasRole);
}

function isPublic(pathname: string) {
  return (
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/')) ||
    pathname.startsWith('/submit/') ||
    pathname.startsWith('/form/') ||
    pathname === '/responses' ||
    pathname.startsWith('/responses/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    /\.[^/]+$/.test(pathname) // static files
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = req.cookies.get('session_user')?.value;
  const isAuthenticated = hasValidSessionCookie(session);

  // If authenticated user visits /sign-in, redirect straight to /dashboard
  if (pathname === '/sign-in' && isAuthenticated) {
    const dashboard = req.nextUrl.clone();
    dashboard.pathname = '/dashboard';
    dashboard.search = '';
    return NextResponse.redirect(dashboard);
  }

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  // Protected route check
  if (!isAuthenticated) {
    const signIn = req.nextUrl.clone();
    signIn.pathname = '/sign-in';
    if (pathname !== '/sign-in' && pathname !== '/access-denied') {
      signIn.searchParams.set('redirect', pathname);
    }
    const response = NextResponse.redirect(signIn);
    response.cookies.delete('session_user');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};