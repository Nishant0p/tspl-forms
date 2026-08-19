import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function HEAD() {
  const session = cookies().get('session_user')?.value;
  if (session) {
    return new NextResponse(null, { status: 200 });
  }
  return new NextResponse(null, { status: 401 });
}
