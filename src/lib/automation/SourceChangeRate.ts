/**
 * TalentXcel Global Jobs Network — Source Change-Rate Intelligence
 * Measures real-world turnover (jobs added/day, updated/day, expired/day)
 * and dynamically tunes poll intervals while strictly enforcing the 24-hour SLA.
 */

export interface SourceVelocityMetrics {
  sourceId: string;
  jobsAdded24h: number;
  jobsUpdated24h: number;
  jobsExpired24h: number;
  totalDailyTurnover: number;
  computedIntervalHours: number;
  lastCalculatedAt: string;
}

export class SourceChangeRate {
  private static metrics: Map<string, SourceVelocityMetrics> = new Map();
  private static MAX_SLA_HOURS = 24; // Hard ceiling: no active source exceeds 24h

  /**
   * Record a sync delta to update velocity metrics
   */
  public static recordSyncDelta(
    sourceId: string,
    added: number,
    updated: number,
    expired: number
  ): SourceVelocityMetrics {
    const existing = this.metrics.get(sourceId) || {
      sourceId,
      jobsAdded24h: 0,
      jobsUpdated24h: 0,
      jobsExpired24h: 0,
      totalDailyTurnover: 0,
      computedIntervalHours: 24,
      lastCalculatedAt: new Date().toISOString(),
    };

    // Initialize or rolling exponential average
    if (existing.totalDailyTurnover === 0) {
      existing.jobsAdded24h = added;
      existing.jobsUpdated24h = updated;
      existing.jobsExpired24h = expired;
    } else {
      existing.jobsAdded24h = Math.round(existing.jobsAdded24h * 0.6 + added * 0.4);
      existing.jobsUpdated24h = Math.round(existing.jobsUpdated24h * 0.6 + updated * 0.4);
      existing.jobsExpired24h = Math.round(existing.jobsExpired24h * 0.6 + expired * 0.4);
    }
    existing.totalDailyTurnover = existing.jobsAdded24h + existing.jobsUpdated24h + existing.jobsExpired24h;

    // Compute dynamic interval based on daily turnover
    if (existing.totalDailyTurnover >= 10000) {
      existing.computedIntervalHours = 2; // High-volume national portal (e.g. USAJOBS, Employment News)
    } else if (existing.totalDailyTurnover >= 1000) {
      existing.computedIntervalHours = 6; // Major state commission / central ministry
    } else if (existing.totalDailyTurnover >= 100) {
      existing.computedIntervalHours = 12; // State agency / PSU
    } else {
      existing.computedIntervalHours = 24; // Municipal / specialized board
    }

    // Enforce 24-hour SLA ceiling
    existing.computedIntervalHours = Math.min(existing.computedIntervalHours, this.MAX_SLA_HOURS);
    existing.lastCalculatedAt = new Date().toISOString();

    this.metrics.set(sourceId, existing);
    return existing;
  }

  /**
   * Get recommended poll interval in hours for a source
   */
  public static getRecommendedInterval(sourceId: string, defaultFrequencyHours = 24): number {
    const record = this.metrics.get(sourceId);
    if (!record) return Math.min(defaultFrequencyHours, this.MAX_SLA_HOURS);
    return record.computedIntervalHours;
  }

  public static getMetrics(sourceId: string): SourceVelocityMetrics | undefined {
    return this.metrics.get(sourceId);
  }

  public static getAllMetrics(): SourceVelocityMetrics[] {
    return Array.from(this.metrics.values());
  }

  public static resetAll(): void {
    this.metrics.clear();
  }
}
