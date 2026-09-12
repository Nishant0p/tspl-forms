import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/platform', '/sign-in', '/access-denied'];

function parseSessionCookie(raw: string | undefined): any | null {
  if (!raw) return null;
  let str = raw;
  if (typeof str === 'string' && str.startsWith('"') && str.endsWith('"')) {
    str = str.slice(1, -1);
  }
  try {
    const val = JSON.parse(str);
    if (typeof val === 'object' && val !== null) return val;
    str = val;
  } catch {}
  try {
    const decoded = decodeURIComponent(str);
    const val = JSON.parse(decoded);
    if (typeof val === 'object' && val !== null) return val;
  } catch {}
  try {
    const decoded = decodeURIComponent(decodeURIComponent(str));
    const val = JSON.parse(decoded);
    if (typeof val === 'object' && val !== null) return val;
  } catch {}
  return null;
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
    response.cookies.set('session_user', '', { path: '/', maxAge: 0 });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};