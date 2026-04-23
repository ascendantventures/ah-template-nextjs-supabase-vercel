import { LRUCache } from 'lru-cache';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const cache = new LRUCache<string, RateLimitEntry>({ max: 10_000 });

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param ip - The client IP address (pre-hashed or raw)
 * @param limit - Max requests allowed in the window (default: 5)
 * @param windowMs - Window duration in milliseconds (default: 60s)
 */
export function checkRateLimit(ip: string, limit = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = cache.get(ip);

  if (!entry || now > entry.resetAt) {
    cache.set(ip, { count: 1, resetAt: now + windowMs });
    return true; // allowed — first request in this window
  }

  if (entry.count >= limit) {
    return false; // blocked — too many requests
  }

  entry.count++;
  cache.set(ip, entry); // update count
  return true; // allowed
}
