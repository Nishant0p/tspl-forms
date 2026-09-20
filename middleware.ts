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