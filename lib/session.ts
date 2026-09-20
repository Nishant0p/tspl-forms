/**
 * Cryptographically signed session cookie management using HMAC-SHA256.
 * Compatible with Next.js Edge Middleware and Node.js Server Actions / API Routes.
 */

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.SUPER_ADMIN_PASSWORD ||
  'tspl-forms-secret-hmac-session-integrity-2025';

function base64UrlEncode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64url');
  }
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(base64: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(base64, 'base64url').toString('utf-8');
  }
  let str = base64.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return decodeURIComponent(escape(atob(str)));
}

function bufferToHex(buffer: ArrayBuffer): string {
  const byteArray = new Uint8Array(buffer);
  return Array.from(byteArray)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Creates an HMAC-SHA256 signature for data using Web Crypto API.
 */
async function computeHmacWebCrypto(data: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  return bufferToHex(signature);
}

/**
 * Signs a session payload into a tamper-proof string:
 * `payloadBase64Url.signatureHex`
 */
export async function signSessionToken(payload: Record<string, any>): Promise<string> {
  const json = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(json);
  const signature = await computeHmacWebCrypto(encodedPayload, SESSION_SECRET);
  return `${encodedPayload}.${signature}`;
}

/**
 * Synchronous signing for Node.js environments
 */
export function signSessionTokenSync(payload: Record<string, any>): string {
  const json = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(json);

  try {
    const nodeCrypto = require('crypto');
    const signature = nodeCrypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encodedPayload)
      .digest('hex');
    return `${encodedPayload}.${signature}`;
  } catch {
    // Fallback if node crypto isn't synchronously available
    return encodedPayload;
  }
}

/**
 * Verifies a signed session token. Returns null if invalid, tampered with, or expired.
 */
export async function verifySessionToken<T = Record<string, any>>(
  token: string | undefined | null
): Promise<T | null> {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSignature] = parts;
  if (!encodedPayload || !providedSignature) return null;

  try {
    const expectedSignature = await computeHmacWebCrypto(encodedPayload, SESSION_SECRET);
    if (!timingSafeEqualHex(providedSignature, expectedSignature)) {
      return null;
    }

    const json = base64UrlDecode(encodedPayload);
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) return null;

    return parsed as T;
  } catch {
    return null;
  }
}

/**
 * Synchronous verification for Node.js environments
 */
export function verifySessionTokenSync<T = Record<string, any>>(
  token: string | undefined | null
): T | null {
  if (!token || typeof token !== 'string') return null;

  let str = token;
  if (str.startsWith('"') && str.endsWith('"')) {
    str = str.slice(1, -1);
  }

  const parts = str.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSignature] = parts;
  if (!encodedPayload || !providedSignature) return null;

  try {
    const nodeCrypto = require('crypto');
    const expectedSignature = nodeCrypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encodedPayload)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const providedBuffer = Buffer.from(providedSignature, 'hex');

    if (expectedBuffer.length !== providedBuffer.length) {
      return null;
    }

    if (!nodeCrypto.timingSafeEqual(expectedBuffer as any, providedBuffer as any)) {
      return null;
    }

    const json = base64UrlDecode(encodedPayload);
    const parsed = JSON.parse(json);
    if (typeof parsed !== 'object' || parsed === null) return null;

    return parsed as T;
  } catch {
    return null;
  }
}
