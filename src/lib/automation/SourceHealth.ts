/**
 * TalentXcel Global Jobs Network — Source Health Engine
 * Calculates composite 0–100% health score per source based on:
 * - Connectivity & Availability (25%)
 * - Freshness SLA Adherence (25%)
 * - Schema Validation Pass Rate (20%)
 * - Duplicate & Noise Ratio (15%)
 * - Response Latency (15%)
 */

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'FAILED';

export interface SourceHealthReport {
  sourceId: string;
  healthScore: number;
  status: HealthStatus;
  metrics: {
    availabilityScore: number;
    freshnessScore: number;
    validationPassRate: number;
    duplicateScore: number;
    latencyScore: number;
  };
  lastEvaluatedAt: string;
}

export class SourceHealth {
  private static reports: Map<string, SourceHealthReport> = new Map();

  /**
   * Calculate 0–100 score and classify health
   */
  public static evaluate(
    sourceId: string,
    params: {
      uptimePercentage: number;          // 0 - 100
      hoursSinceLastSync: number;        // e.g. 2h, 18h, 30h
      validationPassRate: number;        // 0.0 - 1.0
      duplicateRatio: number;            // 0.0 - 1.0 (lower is better)
      latencyMs: number;                 // e.g. 450ms
    }
  ): SourceHealthReport {
    // 1. Availability (25 pts max)
    const availabilityScore = Math.round((params.uptimePercentage / 100) * 25);

    // 2. Freshness SLA (25 pts max, linear penalty beyond 24h)
    let freshnessScore = 25;
    if (params.hoursSinceLastSync > 24) {
      freshnessScore = Math.max(0, 25 - Math.round((params.hoursSinceLastSync - 24) * 2));
    }

    // 3. Validation pass rate (20 pts max)
    const validationScore = Math.round(params.validationPassRate * 20);

    // 4. Duplicate score (15 pts max, penalty if duplicates > 30%)
    let duplicateScore = 15;
    if (params.duplicateRatio > 0.3) {
      duplicateScore = Math.max(0, 15 - Math.round((params.duplicateRatio - 0.3) * 30));
    }

    // 5. Latency score (15 pts max, ideal < 1000ms)
    let latencyScore = 15;
    if (params.latencyMs > 1000) {
      latencyScore = Math.max(0, 15 - Math.round((params.latencyMs - 1000) / 200));
    }

    const total = availabilityScore + freshnessScore + validationScore + duplicateScore + latencyScore;

    let status: HealthStatus = 'HEALTHY';
    if (total < 40) status = 'FAILED';
    else if (total < 60) status = 'CRITICAL';
    else if (total < 85) status = 'DEGRADED';

    const report: SourceHealthReport = {
      sourceId,
      healthScore: total,
      status,
      metrics: {
        availabilityScore,
        freshnessScore,
        validationPassRate: Math.round(params.validationPassRate * 100),
        duplicateScore,
        latencyScore,
      },
      lastEvaluatedAt: new Date().toISOString(),
    };

    this.reports.set(sourceId, report);
    return report;
  }

  public static getReport(sourceId: string): SourceHealthReport | undefined {
    return this.reports.get(sourceId);
  }

  public static getAllReports(): SourceHealthReport[] {
    return Array.from(this.reports.values());
  }

  public static resetAll(): void {
    this.reports.clear();
  }
}
