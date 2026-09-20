import { cookies } from 'next/headers';
import crypto from 'crypto';

const CSRF_COOKIE_NAME = 'csrf_token';

/**
 * Gets the existing CSRF token from httpOnly cookie.
 * (CSRF cookies are provisioned safely in middleware to prevent Server Component cookie mutation errors)
 */
export async function getOrCreateCsrfToken(): Promise<string> {
  try {
    const cookieStore: any = await Promise.resolve(cookies());
    const existing = typeof cookieStore?.get === 'function' ? cookieStore.get(CSRF_COOKIE_NAME)?.value : '';
    return existing || '';
  } catch {
    return '';
  }
}

export type CsrfVerifyResult = {
  valid: boolean;
  error?: string;
};

export async function verifyCsrfToken(submittedToken?: string): Promise<CsrfVerifyResult> {
  try {
    const cookieStore: any = await Promise.resolve(cookies());
    const cookieToken = typeof cookieStore?.get === 'function' ? cookieStore.get(CSRF_COOKIE_NAME)?.value : '';

    if (!cookieToken || !submittedToken) {
      return { valid: false, error: 'CSRF token is missing or expired.' };
    }

    const cookieBuf = Buffer.from(cookieToken);
    const submittedBuf = Buffer.from(submittedToken);

    if (cookieBuf.length !== submittedBuf.length) {
      return { valid: false, error: 'Invalid CSRF token.' };
    }

    const matches = crypto.timingSafeEqual(cookieBuf as any, submittedBuf as any);
    return {
      valid: matches,
      error: matches ? undefined : 'CSRF token verification failed.',
    };
  } catch (err: any) {
    return { valid: false, error: err?.message || 'CSRF validation error.' };
  }
}
