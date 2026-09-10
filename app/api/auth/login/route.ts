import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSuperAdminIdpConfig, getHardcodedAdminSession } from '@/lib/auth';

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

    const idpConfig = getSuperAdminIdpConfig();
    const inputClean = String(emailOrEmpId).trim().toLowerCase();

    // 1. Check Super Admin credentials
    const isSuperAdminMatch =
      (inputClean === idpConfig.email ||
        inputClean === idpConfig.idp.toLowerCase() ||
        inputClean === 'nishant@brandboosters.marketing' ||
        inputClean === 'tspl000' ||
        inputClean === 'emp000') &&
      (password === idpConfig.password || password === 'Nishant@Atharva');

    if (isSuperAdminMatch) {
      const adminSession = getHardcodedAdminSession();
      if (adminSession) {
        // Non-blocking background sync to database
        (async () => {
          try {
            await (prisma as any).employee.upsert({
              where: { employeeId: adminSession.employeeId },
              create: {
                clerkUserId: adminSession.clerkUserId,
                employeeId: adminSession.employeeId,
                firstName: adminSession.firstName,
                lastName: adminSession.lastName,
                email: adminSession.email,
                password: 'Nishant@Atharva',
                role: 'SUPER_ADMIN',
                status: 'ACTIVE',
              },
              update: {
                role: 'SUPER_ADMIN',
                status: 'ACTIVE',
                email: adminSession.email,
                password: 'Nishant@Atharva',
              },
            });
          } catch (e) {
            console.warn('[login API] Super admin background upsert warning:', e);
          }
        })();

        const sessionData = JSON.stringify({
          id: adminSession.employeeId,
          employeeId: adminSession.employeeId,
          firstName: adminSession.firstName,
          lastName: adminSession.lastName,
          email: adminSession.email,
          role: adminSession.role,
          status: adminSession.status,
          imageUrl: adminSession.imageUrl,
        });

        const res = NextResponse.json({ success: true });
        res.cookies.set('session_user', sessionData, {
          httpOnly: true,
          path: '/',
          maxAge: 60 * 60 * 24 * 7, // 7 days
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        });
        return res;
      }
    }

    // 2. Lookup in database by email or employeeId with a 5-second timeout safeguard
    const db = prisma as any;
    let employee: any = null;

    try {
      const dbQuery = db.employee.findFirst({
        where: {
          OR: [
            { email: inputClean },
            { employeeId: String(emailOrEmpId).trim() },
          ],
        },
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('DATABASE_TIMEOUT')), 5000)
      );

      employee = await Promise.race([dbQuery, timeoutPromise]);
    } catch (dbErr: any) {
      console.error('[login API] DB lookup error:', dbErr);
      if (dbErr?.message === 'DATABASE_TIMEOUT') {
        return NextResponse.json(
          { success: false, error: 'Database response timed out. Please verify PostgreSQL service.' },
          { status: 504 }
        );
      }
      return NextResponse.json(
        { success: false, error: 'Database service is temporarily unavailable. Please try again.' },
        { status: 503 }
      );
    }

    if (!employee) {
      return NextResponse.json(
        { success: false, error: 'Invalid email/Employee ID or password' },
        { status: 401 }
      );
    }

    if (employee.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Your account is inactive or suspended' },
        { status: 403 }
      );
    }

    if (employee.password && employee.password !== password) {
      return NextResponse.json(
        { success: false, error: 'Invalid email/Employee ID or password' },
        { status: 401 }
      );
    }

    const sessionData = JSON.stringify({
      id: employee.clerkUserId || employee.employeeId,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      role: employee.role,
      status: employee.status,
      imageUrl: employee.imageUrl,
    });

    const res = NextResponse.json({ success: true });
    res.cookies.set('session_user', sessionData, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
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
