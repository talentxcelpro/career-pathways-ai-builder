// src/services/email/emailRateLimiter.ts
/**
 * Token Bucket & Sliding Window Rate Limiter for Amazon SES
 * Enforces safe sending rate (default: 8-10 emails/sec, quota: 14 emails/sec)
 * Prevents SES 429 throttling and protects account standing.
 */

export class EmailRateLimiter {
  private maxRatePerSecond: number;
  private tokens: number;
  private lastRefillTimestamp: number;
  private queue: Array<() => void> = [];
  private isProcessingQueue: boolean = false;

  constructor(maxRatePerSecond: number = 8) {
    // Read from env if present, else default to safe 8/sec
    const envRate = typeof process !== 'undefined' && process.env?.EMAIL_SEND_RATE_PER_SECOND
      ? parseInt(process.env.EMAIL_SEND_RATE_PER_SECOND, 10)
      : undefined;

    this.maxRatePerSecond = envRate && envRate > 0 && envRate <= 12 ? envRate : maxRatePerSecond;
    this.tokens = this.maxRatePerSecond;
    this.lastRefillTimestamp = Date.now();
  }

  /**
   * Current configured max sending rate per second
   */
  getRateLimit(): number {
    return this.maxRatePerSecond;
  }

  /**
   * Dynamically adjust rate limit (e.g., after observing SES health)
   */
  setRateLimit(rate: number) {
    if (rate > 0 && rate <= 14) {
      this.maxRatePerSecond = rate;
      this.tokens = Math.min(this.tokens, rate);
    }
  }

  /**
   * Refills tokens based on elapsed time
   */
  private refill() {
    const now = Date.now();
    const elapsedSeconds = (now - this.lastRefillTimestamp) / 1000;
    if (elapsedSeconds > 0) {
      const addedTokens = elapsedSeconds * this.maxRatePerSecond;
      this.tokens = Math.min(this.maxRatePerSecond, this.tokens + addedTokens);
      this.lastRefillTimestamp = now;
    }
  }

  /**
   * Acquires a sending permit. If rate limit is reached, returns a promise that
   * resolves when a permit becomes available without dropping the request.
   */
  async acquirePermit(): Promise<void> {
    this.refill();

    if (this.tokens >= 1) {
      this.tokens -= 1;
      return Promise.resolve();
    }

    // Wait for next token
    return new Promise((resolve) => {
      this.queue.push(resolve);
      this.scheduleQueueDrain();
    });
  }

  private scheduleQueueDrain() {
    if (this.isProcessingQueue || this.queue.length === 0) return;
    this.isProcessingQueue = true;

    const intervalMs = Math.ceil(1000 / this.maxRatePerSecond);

    const timer = setInterval(() => {
      this.refill();

      while (this.tokens >= 1 && this.queue.length > 0) {
        this.tokens -= 1;
        const next = this.queue.shift();
        if (next) next();
      }

      if (this.queue.length === 0) {
        clearInterval(timer);
        this.isProcessingQueue = false;
      }
    }, intervalMs);
  }

  /**
   * Returns current queue depth waiting for rate limiter permit
   */
  getWaitingCount(): number {
    return this.queue.length;
  }
}

export const emailRateLimiter = new EmailRateLimiter(8);
