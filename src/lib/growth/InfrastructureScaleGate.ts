import { InfrastructureHealthReport, InfrastructureThresholds } from './types';

/**
 * Infrastructure Scale Gate & Traffic Throttle Engine
 * =========================================================================
 * Protects production availability before and during planetary acquisition spikes.
 * Monitors:
 *  - CDN / edge cache hit rate
 *  - API p95 latency
 *  - Database connection pool pressure
 *  - Sustained error rate
 * 
 * Enforces automatic ACQUISITION_THROTTLE when safe thresholds are breached.
 */
export class InfrastructureScaleGate {
  private static defaultThresholds: InfrastructureThresholds = {
    p95LatencyMsThreshold: 800,
    dbConnectionPressureThreshold: 80,
    cacheHitRateThreshold: 70,
    errorRateThreshold: 1.0
  };

  /**
   * Evaluates current infrastructure telemetry against safe scale thresholds.
   */
  public static evaluateHealth(
    metrics?: Partial<{
      p95LatencyMs: number;
      dbConnectionPressurePercent: number;
      cacheHitRatePercent: number;
      errorRatePercent: number;
    }>,
    customThresholds?: Partial<InfrastructureThresholds>
  ): InfrastructureHealthReport {
    const thresholds = { ...this.defaultThresholds, ...customThresholds };

    const p95Latency = metrics?.p95LatencyMs ?? 240; // healthy baseline ~240ms
    const dbPressure = metrics?.dbConnectionPressurePercent ?? 28; // healthy baseline ~28%
    const cacheHitRate = metrics?.cacheHitRatePercent ?? 88; // healthy baseline ~88%
    const errorRate = metrics?.errorRatePercent ?? 0.05; // healthy baseline ~0.05%

    const breaches: string[] = [];
    if (p95Latency > thresholds.p95LatencyMsThreshold) {
      breaches.push(`p95 latency (${p95Latency}ms) exceeds safe limit (${thresholds.p95LatencyMsThreshold}ms)`);
    }
    if (dbPressure > thresholds.dbConnectionPressureThreshold) {
      breaches.push(`DB connection pressure (${dbPressure}%) exceeds safe limit (${thresholds.dbConnectionPressureThreshold}%)`);
    }
    if (cacheHitRate < thresholds.cacheHitRateThreshold) {
      breaches.push(`Cache hit rate (${cacheHitRate}%) is below minimum threshold (${thresholds.cacheHitRateThreshold}%)`);
    }
    if (errorRate > thresholds.errorRateThreshold) {
      breaches.push(`Error rate (${errorRate}%) exceeds maximum tolerance (${thresholds.errorRateThreshold}%)`);
    }

    const shouldThrottle = breaches.length > 0;
    const state = breaches.length >= 2 ? 'THROTTLED' : (breaches.length === 1 ? 'DEGRADED' : 'HEALTHY');

    return {
      state,
      p95LatencyMs: p95Latency,
      dbConnectionPressurePercent: dbPressure,
      cacheHitRatePercent: cacheHitRate,
      errorRatePercent: errorRate,
      activeThrottle: shouldThrottle,
      throttleReason: shouldThrottle ? breaches.join('; ') : null,
      lastCheckedAt: new Date().toISOString()
    };
  }

  public static getThresholds(): InfrastructureThresholds {
    return this.defaultThresholds;
  }
}
