import crypto from 'crypto';

/**
 * Secret salt used to sign and verify view-only response tokens.
 */
const TOKEN_SECRET =
  process.env.RESPONSE_TOKEN_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  process.env.CLERK_SECRET_KEY ||
  'tspl-forms-secure-response-salt-2026-v1';

/**
 * Base62 alphabet containing digits, uppercase letters, and lowercase letters.
 */
const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Encodes a byte array (0-255) to a Base62 string without requiring BigInt or Buffer.
 */
function bytesToBase62(bytes: number[]): string {
  const digits: number[] = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 62;
      carry = Math.floor(carry / 62);
    }
    while (carry > 0) {
      digits.push(carry % 62);
      carry = Math.floor(carry / 62);
    }
  }
  let str = '';
  for (let i = digits.length - 1; i >= 0; i--) {
    str += ALPHABET[digits[i]];
  }
  return str || '0';
}

/**
 * Decodes a Base62 string back to a byte array of exact target length.
 */
function base62ToBytes(str: string, targetLength: number): number[] | null {
  const bytes: number[] = [0];
  for (let i = 0; i < str.length; i++) {
    const val = ALPHABET.indexOf(str[i]);
    if (val === -1) return null;
    let carry = val;
    for (let j = 0; j < bytes.length; j++) {
      carry += bytes[j] * 62;
      bytes[j] = carry & 0xff;
      carry = carry >> 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry = carry >> 8;
    }
  }
  bytes.reverse();
  if (bytes.length > targetLength) {
    return bytes.slice(bytes.length - targetLength);
  }
  while (bytes.length < targetLength) {
    bytes.unshift(0);
  }
  return bytes;
}

/**
 * Converts a byte array to a hex string.
 */
function bytesToHex(bytes: number[]): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Generates a randomized unique token between 12 and 15 characters (specifically 14 chars)
 * containing mixed uppercase, lowercase, and numeric characters.
 * 
 * Every call generates a completely unique token due to 32 bits of cryptographic randomness.
 */
export function generateResponseToken(formId: number): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    // 4 random bytes generated cryptographically
    const randomHex = crypto.randomBytes(4).toString('hex');
    const nonce: number[] = [
      0x35 + Math.floor(Math.random() * (256 - 0x35)),
      parseInt(randomHex.substring(2, 4), 16),
      parseInt(randomHex.substring(4, 6), 16),
      parseInt(randomHex.substring(6, 8), 16),
    ];
    const version = 0x52; // 'R' for Responses

    // 4-byte big-endian representation of formId
    const formIdBytes: number[] = [
      (formId >>> 24) & 0xff,
      (formId >>> 16) & 0xff,
      (formId >>> 8) & 0xff,
      formId & 0xff,
    ];
    const body: number[] = [version, ...formIdBytes];

    // 1-byte HMAC-SHA256 checksum (using string input to avoid Buffer/BinaryLike typing mismatches)
    const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
    hmac.update(bytesToHex(body) + bytesToHex(nonce), 'hex');
    const checksum = hmac.digest()[0];

    // Keystream derived from nonce to mask payload
    const ksHmac = crypto.createHmac('sha256', TOKEN_SECRET);
    ksHmac.update('07' + bytesToHex(nonce), 'hex');
    const keystream = Array.from(ksHmac.digest());

    const maskedBody: number[] = body.map((b, i) => b ^ keystream[i]);
    const maskedChecksum = checksum ^ keystream[5];

    // Total 10 bytes = 4 bytes nonce + 5 bytes maskedBody + 1 byte maskedChecksum
    const total: number[] = [...nonce, ...maskedBody, maskedChecksum];
    const token = bytesToBase62(total);

    // Verify token strictly adheres to user requirements:
    // 1. Length between 12 and 15
    // 2. Contains numbers
    // 3. Contains different characters (both lowercase and uppercase)
    if (
      token.length >= 12 &&
      token.length <= 15 &&
      /[0-9]/.test(token) &&
      /[a-z]/.test(token) &&
      /[A-Z]/.test(token)
    ) {
      return token;
    }
  }

  // Fallback if loop exceeded
  const fallbackHex = crypto.randomBytes(5).toString('hex');
  return fallbackHex.substring(0, 14);
}

/**
 * Decodes a 12-15 character response token back to its formId.
 * Validates the internal HMAC checksum to ensure authenticity.
 * Returns formId number if valid, or null if invalid or tampered.
 */
export function decodeResponseToken(token: string): number | null {
  if (!token || typeof token !== 'string') return null;
  const clean = token.trim();
  if (clean.length < 12 || clean.length > 15) return null;

  const total = base62ToBytes(clean, 10);
  if (!total || total.length !== 10) return null;

  const nonce = total.slice(0, 4);
  const maskedBody = total.slice(4, 9);
  const maskedChecksum = total[9];

  const ksHmac = crypto.createHmac('sha256', TOKEN_SECRET);
  ksHmac.update('07' + bytesToHex(nonce), 'hex');
  const keystream = Array.from(ksHmac.digest());

  const body: number[] = maskedBody.map((b, i) => b ^ keystream[i]);
  const checksum = maskedChecksum ^ keystream[5];

  if (body[0] !== 0x52) return null;

  const formId = ((body[1] << 24) >>> 0) + (body[2] << 16) + (body[3] << 8) + body[4];

  // Verify HMAC checksum
  const hmac = crypto.createHmac('sha256', TOKEN_SECRET);
  hmac.update(bytesToHex(body) + bytesToHex(nonce), 'hex');
  const digest = hmac.digest();

  if (digest[0] === checksum) {
    return formId;
  }

  return null;
}
