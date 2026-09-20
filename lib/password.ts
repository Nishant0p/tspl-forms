import crypto from 'crypto';

const SALT_BYTES = 16;
const KEY_LENGTH = 64;

/**
 * Hashes a plain password using Node's native scrypt with a cryptographically secure random salt.
 * Result format: `scrypt$<salt_hex>$<derived_key_hex>`
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
    crypto.scrypt(plainPassword, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`scrypt$${salt}$${derivedKey.toString('hex')}`);
    });
  });
}

/** Synchronous version of hashPassword */
export function hashPasswordSync(plainPassword: string): string {
  const salt = crypto.randomBytes(SALT_BYTES).toString('hex');
  const derivedKey = crypto.scryptSync(plainPassword, salt, KEY_LENGTH);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plain password against a stored scrypt hash using timing-safe comparison.
 */
export async function verifyPassword(plainPassword: string, storedHash: string): Promise<boolean> {
  if (!storedHash || !plainPassword) return false;

  if (!storedHash.startsWith('scrypt$')) {
    return false;
  }

  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;

  const [, saltHex, hashHex] = parts;

  return new Promise((resolve) => {
    crypto.scrypt(plainPassword, saltHex, KEY_LENGTH, (err, derivedKey) => {
      if (err) return resolve(false);

      const expectedBuffer = Buffer.from(hashHex, 'hex');
      if (derivedKey.length !== expectedBuffer.length) {
        return resolve(false);
      }

      try {
        const matches = crypto.timingSafeEqual(derivedKey as any, expectedBuffer as any);
        resolve(matches);
      } catch {
        resolve(false);
      }
    });
  });
}

/** Synchronous version of verifyPassword */
export function verifyPasswordSync(plainPassword: string, storedHash: string): boolean {
  if (!storedHash || !plainPassword) return false;
  if (!storedHash.startsWith('scrypt$')) return false;

  const parts = storedHash.split('$');
  if (parts.length !== 3) return false;

  const [, saltHex, hashHex] = parts;

  try {
    const derivedKey = crypto.scryptSync(plainPassword, saltHex, KEY_LENGTH);
    const expectedBuffer = Buffer.from(hashHex, 'hex');

    if (derivedKey.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(derivedKey as any, expectedBuffer as any);
  } catch {
    return false;
  }
}

/** Checks whether a stored string is already in scrypt hashed format */
export function isPasswordHashed(stored: string | null | undefined): boolean {
  return typeof stored === 'string' && stored.startsWith('scrypt$');
}
