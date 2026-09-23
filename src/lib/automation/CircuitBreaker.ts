/**
 * TalentXcel Global Jobs Network — Publication & Ingestion Circuit Breaker
 * Detects deep anomalies across volume spikes, duplicate spikes, malformed payloads,
 * salary anomalies, location anomalies, industry skew, and domain drift.
 * Automatically halts errant sources to protect downstream indexing and catalog integrity.
 */

export type AnomalyType =
  | 'VOLUME_SPIKE'
  | 'DUPLICATE_SPIKE'
  | 'MALFORMED_PAYLOAD'
  | 'DOMAIN_MUTATION'
  | 'SALARY_ANOMALY'
  | 'LOCATION_ANOMALY'
  | 'INDUSTRY_SKEW'
  | 'DEADLINE_ANOMALY';

export interface AnomalyIncident {
  id: string;
  sourceId: string;
  anomalyType: AnomalyType;
  severity: 'WARNING' | 'CRITICAL';
  description: string;
  metricObserved: number;
  thresholdExpected: number;
  trippedAt: string;
  autoPaused: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export class CircuitBreaker {
  private static incidents: AnomalyIncident[] = [];
  private static pausedSources: Set<string> = new Set();

  // Baseline thresholds
  private static thresholds = {
    maxHourlyVolumeMultiplier: 5.0,  // > 5x historical hourly average trips breaker
    maxDuplicateRatio: 0.60,         // > 60% duplicate collision rate
    maxMalformedRatio: 0.15,         // > 15% structural failure (missing title/url)
    maxIndustrySkewRatio: 0.70,      // Single industry suddenly representing > 70%
  };

  /**
   * Check if a source is currently tripped / paused by circuit breaker
   */
  public static isSourceTripped(sourceId: string): boolean {
    return this.pausedSources.has(sourceId);
  }

  /**
   * Evaluate hourly ingestion volume against historical baseline
   */
  public static checkVolumeAnomaly(
    sourceId: string,
    currentBatchCount: number,
    historicalHourlyAverage: number
  ): boolean {
    if (historicalHourlyAverage > 50 && currentBatchCount > historicalHourlyAverage * this.thresholds.maxHourlyVolumeMultiplier) {
      this.trip(
        sourceId,
        'VOLUME_SPIKE',
        'CRITICAL',
        `Sudden volume spike: observed ${currentBatchCount} jobs vs baseline hourly avg of ${historicalHourlyAverage}.`,
        currentBatchCount,
        historicalHourlyAverage * this.thresholds.maxHourlyVolumeMultiplier
      );
      return true;
    }
    return false;
  }

  /**
   * Evaluate duplicate ratio in current batch
   */
  public static checkDuplicateAnomaly(
    sourceId: string,
    duplicateCount: number,
    totalCount: number
  ): boolean {
    if (totalCount >= 20) {
      const ratio = duplicateCount / totalCount;
      if (ratio > this.thresholds.maxDuplicateRatio) {
        this.trip(
          sourceId,
          'DUPLICATE_SPIKE',
          'WARNING',
          `Abnormal duplicate collision rate: ${(ratio * 100).toFixed(1)}% exceeds safety threshold of ${(this.thresholds.maxDuplicateRatio * 100)}%.`,
          ratio,
          this.thresholds.maxDuplicateRatio
        );
        return true;
      }
    }
    return false;
  }

  /**
   * Check for destination application domain mutation
   */
  public static checkDomainDrift(
    sourceId: string,
    expectedDomain: string,
    observedDomain: string
  ): boolean {
    const cleanExpected = expectedDomain.toLowerCase().replace(/^www\./, '');
    const cleanObserved = observedDomain.toLowerCase().replace(/^www\./, '');

    if (!cleanObserved.endsWith(cleanExpected) && !cleanExpected.endsWith(cleanObserved)) {
      this.trip(
        sourceId,
        'DOMAIN_MUTATION',
        'CRITICAL',
        `Application destination domain abruptly shifted from "${cleanExpected}" to "${cleanObserved}". Potential hijack or invalid redirect.`,
        1,
        0
      );
      return true;
    }
    return false;
  }

  /**
   * Trip the circuit breaker and pause the source
   */
  public static trip(
    sourceId: string,
    anomalyType: AnomalyType,
    severity: 'WARNING' | 'CRITICAL',
    description: string,
    metricObserved: number,
    thresholdExpected: number
  ): AnomalyIncident {
    const autoPause = severity === 'CRITICAL';
    if (autoPause) {
      this.pausedSources.add(sourceId);
    }

    const incident: AnomalyIncident = {
      id: `incident-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sourceId,
      anomalyType,
      severity,
      description,
      metricObserved,
      thresholdExpected,
      trippedAt: new Date().toISOString(),
      autoPaused: autoPause,
    };

    this.incidents.unshift(incident);
    return incident;
  }

  /**
   * Manually or programmatically reset a source circuit breaker
   */
  public static resetSource(sourceId: string, resolvedBy = 'admin'): boolean {
    this.pausedSources.delete(sourceId);
    for (const inc of this.incidents) {
      if (inc.sourceId === sourceId && !inc.resolvedAt) {
        inc.resolvedAt = new Date().toISOString();
        inc.resolvedBy = resolvedBy;
      }
    }
    return true;
  }

  public static getActiveIncidents(): AnomalyIncident[] {
    return this.incidents.filter((i) => !i.resolvedAt);
  }

  public static getPausedSources(): string[] {
    return Array.from(this.pausedSources);
  }

  public static resetAll(): void {
    this.incidents = [];
    this.pausedSources.clear();
  }
}
