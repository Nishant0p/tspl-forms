import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redisClient?: Redis;
};

function createRedisClient(): Redis | null {
  const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

  try {
    const client = new Redis(redisUrl, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 2000,
      retryStrategy(times) {
        if (times > 3) {
          // Stop retrying after 3 attempts in quick succession
          return null;
        }
        return Math.min(times * 200, 1000);
      },
    });

    // Suppress unhandled error events if Redis server is down or unreachable
    client.on('error', (err) => {
      // Non-fatal warning; application gracefully falls back to PostgreSQL
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[Redis] Connection warning (falling back to DB):', err.message);
      }
    });

    return client;
  } catch (err) {
    console.warn('[Redis] Failed to initialize Redis client:', err);
    return null;
  }
}

export const redis = globalForRedis.redisClient ?? createRedisClient();

if (process.env.NODE_ENV !== 'production' && redis) {
  globalForRedis.redisClient = redis;
}

async function ensureConnected(): Promise<boolean> {
  if (!redis) return false;
  if (redis.status === 'ready') return true;
  if (redis.status === 'connecting' || redis.status === 'connect') {
    return false;
  }
  try {
    await redis.connect();
    return true;
  } catch {
    return false;
  }
}

/**
 * LPUSH: Synchronize new submission(s) to the head of the Redis list.
 * Fast O(1) response caching for real-time response streams.
 */
export async function redisLpush(key: string, ...values: string[]): Promise<boolean> {
  if (!redis || values.length === 0) return false;
  try {
    const connected = await ensureConnected();
    if (!connected) return false;
    await redis.lpush(key, ...values);
    return true;
  } catch {
    return false;
  }
}

/**
 * RPUSH: Append submission(s) to the tail of the Redis list.
 */
export async function redisRpush(key: string, ...values: string[]): Promise<boolean> {
  if (!redis || values.length === 0) return false;
  try {
    const connected = await ensureConnected();
    if (!connected) return false;
    await redis.rpush(key, ...values);
    return true;
  } catch {
    return false;
  }
}

/**
 * LRANGE: Read a page/chunk of responses from Redis list.
 */
export async function redisLrange(key: string, start: number, stop: number): Promise<string[]> {
  if (!redis) return [];
  try {
    const connected = await ensureConnected();
    if (!connected) return [];
    return await redis.lrange(key, start, stop);
  } catch {
    return [];
  }
}

/**
 * INCR: Increment submission or visit counter in Redis.
 */
export async function redisIncr(key: string): Promise<number | null> {
  if (!redis) return null;
  try {
    const connected = await ensureConnected();
    if (!connected) return null;
    return await redis.incr(key);
  } catch {
    return null;
  }
}

/**
 * GET: Retrieve cached string (e.g. form schema or metadata).
 */
export async function redisGet(key: string): Promise<string | null> {
  if (!redis) return null;
  try {
    const connected = await ensureConnected();
    if (!connected) return null;
    return await redis.get(key);
  } catch {
    return null;
  }
}

/**
 * SET: Cache a key with optional TTL in seconds.
 */
export async function redisSet(
  key: string,
  value: string,
  ttlSeconds?: number
): Promise<boolean> {
  if (!redis) return false;
  try {
    const connected = await ensureConnected();
    if (!connected) return false;
    if (ttlSeconds && ttlSeconds > 0) {
      await redis.set(key, value, 'EX', ttlSeconds);
    } else {
      await redis.set(key, value);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * DEL: Invalidate cache for one or more keys.
 */
export async function redisDel(...keys: string[]): Promise<boolean> {
  if (!redis || keys.length === 0) return false;
  try {
    const connected = await ensureConnected();
    if (!connected) return false;
    await redis.del(...keys);
    return true;
  } catch {
    return false;
  }
}
