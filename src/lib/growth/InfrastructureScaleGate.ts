import { InfrastructureHealthReport, InfrastructureThresholds, InfrastructureScaleMetrics } from './types';

/**
 * Infrastructure Scale Gate & Traffic Throttle Engine
 * =========================================================================
 * Protects production availability before and during planetary acquisition spikes.
 * Evaluates 8 critical infrastructure metrics:
 *  1. API p95 latency (<800ms)
 *  2. DB Query latency (<150ms)
 *  3. DB connection pool pressure (<80%)
 *  4. Edge / CDN cache hit rate (>70%)
 *  5. HTTP error rate (<1.0%)
 *  6. Application API error rate (<0.5%)
 *  7. Storage resume-upload error rate (<1.0%)
 *  8. Signup & Provisioning latency (<1200ms)
 * 
 * Enforces automatic ACQUISITION_THROTTLE when safe thresholds are breached:
 *  - 0 breaches: HEALTHY
 *  - 1 breach: DEGRADED
 *  - >=2 breaches: THROTTLED
 */
export class InfrastructureScaleGate {
  private static defaultThresholds: InfrastructureThresholds = {
    p95LatencyMsThreshold: 800,
    dbLatencyMsThreshold: 150,
    dbConnectionPressureThreshold: 80,
    cacheHitRateThreshold: 70,
    httpErrorRateThreshold: 1.0,
    applicationApiErrorRateThreshold: 0.5,
    storageUploadErrorRateThreshold: 1.0,
    signupLatencyMsThreshold: 1200
  };

  /**
   * Evaluates current infrastructure telemetry against safe scale thresholds.
   */
  public static evaluateHealth(
    metrics?: Partial<InfrastructureScaleMetrics>,
    customThresholds?: Partial<InfrastructureThresholds>
  ): InfrastructureHealthReport {
    const thresholds: InfrastructureThresholds = { ...this.defaultThresholds, ...customThresholds };

    const errorRate = (metrics as any)?.errorRatePercent ?? metrics?.httpErrorRatePercent ?? 0.05;

    const evaluatedMetrics: InfrastructureScaleMetrics = {
      p95LatencyMs: metrics?.p95LatencyMs ?? 240, // baseline ~240ms
      dbLatencyMs: metrics?.dbLatencyMs ?? 42,   // baseline ~42ms
      dbConnectionPressurePercent: metrics?.dbConnectionPressurePercent ?? 28, // baseline ~28%
      cacheHitRatePercent: metrics?.cacheHitRatePercent ?? 88, // baseline ~88%
      httpErrorRatePercent: errorRate,
      applicationApiErrorRatePercent: metrics?.applicationApiErrorRatePercent ?? 0.02, // baseline ~0.02%
      storageUploadErrorRatePercent: metrics?.storageUploadErrorRatePercent ?? 0.08, // baseline ~0.08%
      signupLatencyMs: metrics?.signupLatencyMs ?? 310 // baseline ~310ms
    };

    const breaches: string[] = [];
    if (evaluatedMetrics.p95LatencyMs > thresholds.p95LatencyMsThreshold) {
      breaches.push(`p95 latency (${evaluatedMetrics.p95LatencyMs}ms) exceeds safe limit (${thresholds.p95LatencyMsThreshold}ms)`);
    }
    if (evaluatedMetrics.dbLatencyMs > thresholds.dbLatencyMsThreshold) {
      breaches.push(`DB latency (${evaluatedMetrics.dbLatencyMs}ms) exceeds safe limit (${thresholds.dbLatencyMsThreshold}ms)`);
    }
    if (evaluatedMetrics.dbConnectionPressurePercent > thresholds.dbConnectionPressureThreshold) {
      breaches.push(`DB connection pressure (${evaluatedMetrics.dbConnectionPressurePercent}%) exceeds safe limit (${thresholds.dbConnectionPressureThreshold}%)`);
    }
    if (evaluatedMetrics.cacheHitRatePercent < thresholds.cacheHitRateThreshold) {
      breaches.push(`Cache hit rate (${evaluatedMetrics.cacheHitRatePercent}%) is below minimum threshold (${thresholds.cacheHitRateThreshold}%)`);
    }
    if (evaluatedMetrics.httpErrorRatePercent > thresholds.httpErrorRateThreshold) {
      breaches.push(`Error rate (${evaluatedMetrics.httpErrorRatePercent}%) exceeds maximum tolerance (${thresholds.httpErrorRateThreshold}%)`);
    }
    if (evaluatedMetrics.applicationApiErrorRatePercent > thresholds.applicationApiErrorRateThreshold) {
      breaches.push(`Application API error rate (${evaluatedMetrics.applicationApiErrorRatePercent}%) exceeds tolerance (${thresholds.applicationApiErrorRateThreshold}%)`);
    }
    if (evaluatedMetrics.storageUploadErrorRatePercent > thresholds.storageUploadErrorRateThreshold) {
      breaches.push(`Storage upload error rate (${evaluatedMetrics.storageUploadErrorRatePercent}%) exceeds tolerance (${thresholds.storageUploadErrorRateThreshold}%)`);
    }
    if (evaluatedMetrics.signupLatencyMs > thresholds.signupLatencyMsThreshold) {
      breaches.push(`Signup latency (${evaluatedMetrics.signupLatencyMs}ms) exceeds tolerance (${thresholds.signupLatencyMsThreshold}ms)`);
    }

    const shouldThrottle = breaches.length > 0;
    const isDegraded = breaches.length === 1;
    const state = breaches.length >= 2 ? 'THROTTLED' : (isDegraded ? 'DEGRADED' : 'HEALTHY');

    return {
      state,
      metrics: evaluatedMetrics,
      thresholds,
      breaches,
      activeThrottle: shouldThrottle,
      throttleReason: breaches.length > 0 ? breaches.join('; ') : null,
      lastCheckedAt: new Date().toISOString(),
      // Legacy compatibility properties
      p95LatencyMs: evaluatedMetrics.p95LatencyMs,
      dbConnectionPressurePercent: evaluatedMetrics.dbConnectionPressurePercent,
      cacheHitRatePercent: evaluatedMetrics.cacheHitRatePercent,
      errorRatePercent: evaluatedMetrics.httpErrorRatePercent
    };
  }

  public static getThresholds(): InfrastructureThresholds {
    return this.defaultThresholds;
  }
}

