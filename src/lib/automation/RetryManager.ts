/**
 * TalentXcel Global Jobs Network — Self-Healing Retry Manager
 * Coordinates exponential backoff retry schedules for transient failures
 * and escalates persistent errors to degraded status and dead-letter queues.
 */

export interface RetryRecord {
  sourceId: string;
  attemptNumber: number;
  lastError: string;
  firstFailedAt: string;
  lastAttemptedAt: string;
  nextRetryAt: string;
  status: 'PENDING' | 'EXHAUSTED' | 'RESOLVED';
}

export class RetryManager {
  private static retries: Map<string, RetryRecord> = new Map();

  // Retry schedule: 5m -> 30m -> 2h
  private static delaysMinutes = [5, 30, 120];

  /**
   * Record a failure and schedule next retry
   */
  public static recordFailure(sourceId: string, error: string): RetryRecord {
    const existing = this.retries.get(sourceId);
    const now = new Date();

    if (!existing) {
      const record: RetryRecord = {
        sourceId,
        attemptNumber: 1,
        lastError: error,
        firstFailedAt: now.toISOString(),
        lastAttemptedAt: now.toISOString(),
        nextRetryAt: new Date(now.getTime() + this.delaysMinutes[0] * 60 * 1000).toISOString(),
        status: 'PENDING',
      };
      this.retries.set(sourceId, record);
      return record;
    }

    existing.attemptNumber += 1;
    existing.lastError = error;
    existing.lastAttemptedAt = now.toISOString();

    if (existing.attemptNumber <= this.delaysMinutes.length) {
      const delay = this.delaysMinutes[existing.attemptNumber - 1];
      existing.nextRetryAt = new Date(now.getTime() + delay * 60 * 1000).toISOString();
      existing.status = 'PENDING';
    } else {
      // Exhausted retries: mark degraded
      existing.status = 'EXHAUSTED';
    }

    return existing;
  }

  /**
   * Check if a source is due for retry execution
   */
  public static isDueForRetry(sourceId: string, currentTime = new Date()): boolean {
    const record = this.retries.get(sourceId);
    if (!record || record.status !== 'PENDING') return false;
    return new Date(record.nextRetryAt).getTime() <= currentTime.getTime();
  }

  /**
   * Mark retry record as resolved upon successful sync
   */
  public static recordSuccess(sourceId: string): void {
    const record = this.retries.get(sourceId);
    if (record) {
      record.status = 'RESOLVED';
      this.retries.delete(sourceId);
    }
  }

  public static getActiveRetries(): RetryRecord[] {
    return Array.from(this.retries.values()).filter((r) => r.status === 'PENDING');
  }

  public static getExhaustedRetries(): RetryRecord[] {
    return Array.from(this.retries.values()).filter((r) => r.status === 'EXHAUSTED');
  }

  public static resetAll(): void {
    this.retries.clear();
  }
}
