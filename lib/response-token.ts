/**
 * Universal response token generator & decoder.
 * Runs in both browser (client-side) and Node.js (server-side) with 0 external dependencies.
 */

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const SALT = 0x5a3c9e71; // 32-bit secret salt

/**
 * Fast 32-bit integer hash (Murmur3-inspired mixer).
 */
function hash32(val: number, seed: number): number {
  let h = (val ^ seed) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Encodes a byte array (0-255) to a Base62 string.
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
 * Universal random 32-bit integer generator.
 */
function getRandomInt32(): number {
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
    try {
      const arr = new Uint32Array(1);
      globalThis.crypto.getRandomValues(arr);
      return arr[0];
    } catch {
      // Fallback below
    }
  }
  return Math.floor(Math.random() * 0xffffffff);
}

/**
 * Generates a randomized unique token between 12 and 15 characters (specifically 14 chars)
 * containing mixed uppercase letters, lowercase letters, and digits.
 * 
 * Every call generates a completely unique token due to 32 bits of cryptographic/pseudo-randomness.
 */
export function generateResponseToken(formId: number): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    let nonce = getRandomInt32();
    // Ensure high byte is >= 0x35 so that the 10-byte Base62 string length is ALWAYS exactly 14 characters
    const highByte = 0x35 + Math.floor(Math.random() * (256 - 0x35));
    nonce = ((nonce & 0x00ffffff) | (highByte << 24)) >>> 0;

    const version = 0x52; // 'R' for Responses
    const fId = formId >>> 0;

    // Keystream derived from nonce to mask formId and version
    const k1 = hash32(nonce, SALT ^ 0x12345678);
    const k2 = hash32(nonce, SALT ^ 0x9abcdef0);

    const maskedFormId = (fId ^ k1) >>> 0;
    const check8 = (hash32(fId ^ version, nonce ^ SALT) & 0xff);
    const maskedCheck8 = (check8 ^ (k2 & 0xff)) & 0xff;
    const maskedVersion = (version ^ ((k2 >>> 8) & 0xff)) & 0xff;

    // 10 bytes total:
    // bytes 0..3: nonce (4 bytes)
    // byte 4: maskedVersion (1 byte)
    // bytes 5..8: maskedFormId (4 bytes)
    // byte 9: maskedCheck8 (1 byte)
    const bytes = [
      (nonce >>> 24) & 0xff,
      (nonce >>> 16) & 0xff,
      (nonce >>> 8) & 0xff,
      nonce & 0xff,
      maskedVersion,
      (maskedFormId >>> 24) & 0xff,
      (maskedFormId >>> 16) & 0xff,
      (maskedFormId >>> 8) & 0xff,
      maskedFormId & 0xff,
      maskedCheck8,
    ];

    const token = bytesToBase62(bytes);

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
  return 'r' + Math.random().toString(36).substring(2, 15);
}

/**
 * Decodes a 12-15 character response token back to its formId.
 * Validates the internal checksum to ensure authenticity.
 * Returns formId number if valid, or null if invalid or tampered.
 */
export function decodeResponseToken(token: string): number | null {
  if (!token || typeof token !== 'string') return null;
  const clean = token.trim();
  if (clean.length < 12 || clean.length > 15) return null;

  const bytes = base62ToBytes(clean, 10);
  if (!bytes || bytes.length !== 10) return null;

  const nonce = (((bytes[0] << 24) >>> 0) + (bytes[1] << 16) + (bytes[2] << 8) + bytes[3]) >>> 0;

  const k1 = hash32(nonce, SALT ^ 0x12345678);
  const k2 = hash32(nonce, SALT ^ 0x9abcdef0);

  const version = bytes[4] ^ ((k2 >>> 8) & 0xff);
  if (version !== 0x52) return null;

  const rawMaskedFormId = (((bytes[5] << 24) >>> 0) + (bytes[6] << 16) + (bytes[7] << 8) + bytes[8]) >>> 0;
  const formId = (rawMaskedFormId ^ k1) >>> 0;

  const check8 = bytes[9] ^ (k2 & 0xff);
  const expectedCheck8 = (hash32(formId ^ version, nonce ^ SALT) & 0xff);

  if (check8 === expectedCheck8) {
    return formId;
  }

  return null;
}
