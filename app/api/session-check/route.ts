import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function HEAD() {
  try {
    const cookieStore: any = await Promise.resolve(cookies());
    const session = typeof cookieStore?.get === 'function' ? cookieStore.get('session_user')?.value : null;
    if (session) {
      return new NextResponse(null, { status: 200 });
    }
  } catch {}
  return new NextResponse(null, { status: 401 });
}
