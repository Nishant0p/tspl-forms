import { NextRequest, NextResponse } from 'next/server';
import { authenticateCredentials } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrEmpId, password } = body || {};

    if (!emailOrEmpId || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter your email or Employee ID and password.' },
        { status: 400 }
      );
    }

    const authResult = await authenticateCredentials(emailOrEmpId, password);

    if (!authResult.success || !authResult.sessionData) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Invalid credentials' },
        { status: authResult.status || 401 }
      );
    }

    const sessionData = JSON.stringify(authResult.sessionData);
    const res = NextResponse.json({ success: true });

    res.cookies.set('session_user', sessionData, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: false, // Allows cookie over both HTTP and HTTPS (e.g. internal server IP or non-SSL domains)
    });

    return res;
  } catch (err: any) {
    console.error('[login API] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'An unexpected login error occurred.' },
      { status: 500 }
    );
  }
}

