interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitEntry {
  requests: number;
  resetTime: number;
  blocked?: boolean;
  blockExpiry?: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      blockDurationMs: 60000, // 1 minute default block
      ...config
    };
  }

  checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(identifier);

    // Check if currently blocked
    if (entry?.blocked && entry.blockExpiry && now < entry.blockExpiry) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockExpiry
      };
    }

    // Reset window if expired
    if (!entry || now >= entry.resetTime) {
      const newEntry: RateLimitEntry = {
        requests: 1,
        resetTime: now + this.config.windowMs,
        blocked: false
      };
      this.store.set(identifier, newEntry);
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: newEntry.resetTime
      };
    }

    // Increment request count
    entry.requests++;

    // Check if limit exceeded
    if (entry.requests > this.config.maxRequests) {
      entry.blocked = true;
      entry.blockExpiry = now + (this.config.blockDurationMs || 60000);
      this.store.set(identifier, entry);
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.blockExpiry
      };
    }

    this.store.set(identifier, entry);
    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.requests,
      resetTime: entry.resetTime
    };
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime && (!entry.blocked || (entry.blockExpiry && now >= entry.blockExpiry))) {
        this.store.delete(key);
      }
    }
  }
}

// Pre-configured rate limiters for different use cases
export const authRateLimiter = new RateLimiter({
  maxRequests: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  blockDurationMs: 30 * 60 * 1000 // 30 minutes
});

export const apiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 5 * 60 * 1000 // 5 minutes
});

export const aiToolsRateLimiter = new RateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
  blockDurationMs: 10 * 60 * 1000 // 10 minutes
});

// Cleanup function to be called periodically
export const cleanupRateLimiters = () => {
  authRateLimiter.cleanup();
  apiRateLimiter.cleanup();
  aiToolsRateLimiter.cleanup();
};

// Auto cleanup every 5 minutes
setInterval(cleanupRateLimiters, 5 * 60 * 1000);