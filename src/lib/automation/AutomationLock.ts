/**
 * TalentXcel Global Jobs Network — Distributed Automation Lock
 * Ensures distributed-safe synchronization so multiple workers or instances
 * never execute duplicate crawls or conflicting mutations on the same source or entity.
 */

export interface LockOptions {
  ttlSeconds?: number;
  ownerId?: string;
}

export interface LockState {
  lockKey: string;
  ownerId: string;
  acquiredAt: string;
  expiresAt: string;
  isHeld: boolean;
}

export class AutomationLock {
  private static inMemoryLocks: Map<string, { ownerId: string; expiresAt: number }> = new Map();
  private static defaultTTL = 600; // 10 minutes default lease

  /**
   * Acquire a distributed execution lock for a given resource key
   */
  public static async acquire(
    lockKey: string,
    options: LockOptions = {}
  ): Promise<boolean> {
    const ttl = (options.ttlSeconds || this.defaultTTL) * 1000;
    const ownerId = options.ownerId || `worker-${Math.random().toString(36).substring(2, 9)}`;
    const now = Date.now();

    // Check existing lock
    const existing = this.inMemoryLocks.get(lockKey);
    if (existing) {
      if (existing.expiresAt > now) {
        // Lock is still actively held by someone else
        if (existing.ownerId === ownerId) {
          // Re-entrant lock by same owner, extend lease
          existing.expiresAt = now + ttl;
          return true;
        }
        return false;
      }
      // Expired lock: reap it
      this.inMemoryLocks.delete(lockKey);
    }

    // Set lock
    this.inMemoryLocks.set(lockKey, {
      ownerId,
      expiresAt: now + ttl,
    });

    return true;
  }

  /**
   * Release a lock if held by the owner
   */
  public static async release(lockKey: string, ownerId?: string): Promise<boolean> {
    const existing = this.inMemoryLocks.get(lockKey);
    if (!existing) return true;

    if (ownerId && existing.ownerId !== ownerId) {
      // Cannot release lock held by another owner
      return false;
    }

    this.inMemoryLocks.delete(lockKey);
    return true;
  }

  /**
   * Refresh/heartbeat an existing lock lease
   */
  public static async renew(lockKey: string, ownerId: string, ttlSeconds?: number): Promise<boolean> {
    const existing = this.inMemoryLocks.get(lockKey);
    if (!existing || existing.ownerId !== ownerId) {
      return false;
    }

    const ttl = (ttlSeconds || this.defaultTTL) * 1000;
    existing.expiresAt = Date.now() + ttl;
    return true;
  }

  /**
   * Check if a lock is currently active
   */
  public static isLocked(lockKey: string): boolean {
    const existing = this.inMemoryLocks.get(lockKey);
    if (!existing) return false;
    if (existing.expiresAt <= Date.now()) {
      this.inMemoryLocks.delete(lockKey);
      return false;
    }
    return true;
  }

  /**
   * Clear all active locks (for testing or hard reset)
   */
  public static resetAll(): void {
    this.inMemoryLocks.clear();
  }
}
