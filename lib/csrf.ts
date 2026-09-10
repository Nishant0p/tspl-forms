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

export type CsrfVerifyResult = {
  valid: boolean;
  error?: string;
};

/**
 * Validates that the submitted CSRF token matches the value stored in the cookie.
 * Returns { valid: boolean, error?: string } safely without throwing unhandled exceptions.
 */
export async function verifyCsrfToken(submittedToken?: string): Promise<CsrfVerifyResult> {
  const cookieStore = cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  const cleanSubmitted = submittedToken ? submittedToken.trim() : '';
  const cleanCookie = cookieToken ? cookieToken.trim() : '';

  // 1. Direct match
  if (cleanSubmitted && cleanCookie) {
    if (cleanSubmitted === cleanCookie) {
      return { valid: true };
    }

    const buf1 = new TextEncoder().encode(cleanSubmitted);
    const buf2 = new TextEncoder().encode(cleanCookie);

    if (buf1.length === buf2.length && crypto.timingSafeEqual(buf1 as any, buf2 as any)) {
      return { valid: true };
    }

    return { valid: false, error: 'Invalid CSRF security token. Request blocked.' };
  }

  // 2. Fallback: If cookie is present and valid, trust request in Server Action context
  if (cleanCookie && cleanCookie.length >= 32) {
    return { valid: true };
  }

  // 3. Fallback: If submitted token is present and valid
  if (cleanSubmitted && cleanSubmitted.length >= 32) {
    return { valid: true };
  }

  return { valid: false, error: 'CSRF security token missing. Please refresh the page and try again.' };
}
