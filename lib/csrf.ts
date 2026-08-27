import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * Gets the existing CSRF token from httpOnly cookie.
 * (CSRF cookies are provisioned safely in middleware to prevent Server Component cookie mutation errors)
 */
export async function getOrCreateCsrfToken(): Promise<string> {
  const cookieStore = cookies();
  const existing = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  return existing || '';
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
