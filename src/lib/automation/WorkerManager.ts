/**
 * TalentXcel Global Jobs Network — Worker Manager
 * Manages worker concurrency limits, domain-level rate limiting, and execution leases.
 */

export interface SourceRateLimit {
  sourceId: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  concurrencyLimit: number;
  activeRequests: number;
  windowMinuteStart: number;
  windowMinuteCount: number;
  windowHourStart: number;
  windowHourCount: number;
}

export class WorkerManager {
  private static limits: Map<string, SourceRateLimit> = new Map();
  private static defaultRpm = 60;
  private static defaultRph = 1000;
  private static defaultConcurrency = 4;

  /**
   * Configure rate limits for a government source
   */
  public static setSourceLimits(
    sourceId: string,
    rpm = 60,
    rph = 1000,
    concurrency = 4
  ): void {
    this.limits.set(sourceId, {
      sourceId,
      requestsPerMinute: rpm,
      requestsPerHour: rph,
      concurrencyLimit: concurrency,
      activeRequests: 0,
      windowMinuteStart: Date.now(),
      windowMinuteCount: 0,
      windowHourStart: Date.now(),
      windowHourCount: 0,
    });
  }

  /**
   * Check if a request to a source can proceed without violating rate limits
   */
  public static canDispatch(sourceId: string): boolean {
    const limit = this.getOrInitLimit(sourceId);
    const now = Date.now();

    // Check concurrency
    if (limit.activeRequests >= limit.concurrencyLimit) {
      return false;
    }

    // Check minute window
    if (now - limit.windowMinuteStart >= 60000) {
      limit.windowMinuteStart = now;
      limit.windowMinuteCount = 0;
    }
    if (limit.windowMinuteCount >= limit.requestsPerMinute) {
      return false;
    }

    // Check hour window
    if (now - limit.windowHourStart >= 3600000) {
      limit.windowHourStart = now;
      limit.windowHourCount = 0;
    }
    if (limit.windowHourCount >= limit.requestsPerHour) {
      return false;
    }

    return true;
  }

  /**
   * Acquire a request slot for a source
   */
  public static acquireSlot(sourceId: string): boolean {
    if (!this.canDispatch(sourceId)) return false;
    const limit = this.getOrInitLimit(sourceId);
    limit.activeRequests += 1;
    limit.windowMinuteCount += 1;
    limit.windowHourCount += 1;
    return true;
  }

  /**
   * Release a request slot when work completes
   */
  public static releaseSlot(sourceId: string): void {
    const limit = this.limits.get(sourceId);
    if (limit && limit.activeRequests > 0) {
      limit.activeRequests -= 1;
    }
  }

  private static getOrInitLimit(sourceId: string): SourceRateLimit {
    if (!this.limits.has(sourceId)) {
      this.setSourceLimits(
        sourceId,
        this.defaultRpm,
        this.defaultRph,
        this.defaultConcurrency
      );
    }
    return this.limits.get(sourceId)!;
  }

  public static resetAll(): void {
    this.limits.clear();
  }
}
