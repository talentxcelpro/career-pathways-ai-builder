// supabase/functions/_shared/rateLimiter.ts
// In-memory sliding-window rate limiter for Supabase Edge Functions

interface RateLimitRecord {
  timestamps: number[];
}

const clientRequestStore = new Map<string, RateLimitRecord>();

const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function purgeStale(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  const threshold = now - windowMs;
  for (const [key, record] of clientRequestStore.entries()) {
    record.timestamps = record.timestamps.filter(ts => ts > threshold);
    if (record.timestamps.length === 0) {
      clientRequestStore.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
}

export function checkRateLimit(
  clientId: string,
  maxRequests: number = 20,
  windowMs: number = 60 * 1000
): RateLimitResult {
  purgeStale(windowMs);
  const now = Date.now();
  const threshold = now - windowMs;

  let record = clientRequestStore.get(clientId);
  if (!record) {
    record = { timestamps: [] };
    clientRequestStore.set(clientId, record);
  }

  // Filter timestamps within current window
  record.timestamps = record.timestamps.filter(ts => ts > threshold);

  if (record.timestamps.length >= maxRequests) {
    const oldestTimestamp = record.timestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      resetSeconds,
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetSeconds: Math.ceil(windowMs / 1000),
  };
}

export function getClientIdentifier(req: Request): string {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(-16);
  }
  return 'anonymous_client';
}
