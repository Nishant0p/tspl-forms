import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = ['/', '/platform', '/sign-in', '/sign-up', '/access-denied'];

function isPublic(pathname: string) {
  return (
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/')) ||
    pathname.startsWith('/submit/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    /\.[^/]+$/.test(pathname) // static files
  );
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return NextResponse.next();

  const session = req.cookies.get('session_user')?.value;
  if (!session) {
    const signIn = req.nextUrl.clone();
    signIn.pathname = '/sign-in';
    signIn.searchParams.set('redirect', pathname);
    return NextResponse.redirect(signIn);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};