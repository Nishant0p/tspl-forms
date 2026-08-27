import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * Gets the existing CSRF token from httpOnly cookie or generates a new one.
 */
export async function getOrCreateCsrfToken(): Promise<string> {
  const cookieStore = cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (existing && existing.length >= 32) {
    return existing;
  }

  const newToken = crypto.randomBytes(32).toString('hex');

  cookieStore.set(CSRF_COOKIE_NAME, newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return newToken;
}

/**
 * Validates that the submitted CSRF token matches the value stored in the httpOnly cookie.
 */
export async function verifyCsrfToken(submittedToken?: string) {
  const cookieStore = cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  if (!submittedToken || !cookieToken) {
    throw new Error('CSRF security token missing. Please refresh the page and try again.');
  }

  const buf1 = new Uint8Array(Buffer.from(submittedToken));
  const buf2 = new Uint8Array(Buffer.from(cookieToken));

  if (buf1.length !== buf2.length || !crypto.timingSafeEqual(buf1, buf2)) {
    throw new Error('Invalid CSRF security token. Request blocked.');
  }
}
