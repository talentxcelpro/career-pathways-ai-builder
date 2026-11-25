/**
 * src/lib/geo/cityGSCTelemetry.ts
 * TalentXcel City GSC Performance Tracking System
 *
 * PURPOSE:
 *   Tracks city-level GSC metrics, inventory health, and identifies opportunities.
 *   Powers the city performance dashboard and automated alerting.
 *
 * DATA SOURCES:
 *   - GSC API (via gsc-service-account.json credentials)
 *   - Supabase jobs table (live inventory)
 *   - cityIndexReadinessGate evaluation results
 *
 * OPPORTUNITY SIGNALS:
 *   - HIGH_IMPRESSION_LOW_CTR: impressions > 500, CTR < 2% → title/meta optimization needed
 *   - POSITION_5_TO_20: avg position 5–20 → content improvement opportunity
 *   - INCREASING_IMPRESSIONS: 30-day trend shows ≥ 20% impression growth
 *   - DECLINING_CLICKS: clicks declining despite stable/growing impressions
 *   - QUERY_PAGE_MISMATCH: queries driving impressions don't match page content
 *   - INVENTORY_GROWTH: active job count increased significantly this month
 *   - ZERO_IMPRESSIONS: city in registry but no GSC signal → not yet indexed or needs promotion
 *   - THIN_PAGE_RISK: indexReady=false but city has /locations/ URL → deindex candidate
 *
 * @version 2.0.0
 */

export type OpportunityType =
  | 'HIGH_IMPRESSION_LOW_CTR'
  | 'POSITION_5_TO_20'
  | 'INCREASING_IMPRESSIONS'
  | 'DECLINING_CLICKS'
  | 'QUERY_PAGE_MISMATCH'
  | 'INVENTORY_GROWTH'
  | 'ZERO_IMPRESSIONS'
  | 'THIN_PAGE_RISK'
  | 'FAST_RISING'
  | 'FEATURED_SNIPPET_CANDIDATE';

export interface CityGSCTelemetryRecord {
  citySlug: string;
  canonicalUrl: string;
  /** GSC period for this snapshot (e.g. "2026-08-25 to 2026-11-25") */
  period: string;
  /** Raw impressions from GSC API */
  impressions: number;
  /** Raw clicks from GSC API */
  clicks: number;
  /** CTR as decimal (0.0 to 1.0) */
  ctr: number;
  /** Average position */
  avgPosition: number;
  /** Number of queries driving impressions to this city URL */
  drivingQueryCount: number;
  /** Top queries (up to 10) for this city URL */
  topQueries: Array<{ query: string; impressions: number; clicks: number; position: number }>;
  /** Current index status from GSC Indexing API */
  indexStatus: 'INDEXED' | 'NOT_INDEXED' | 'EXCLUDED' | 'UNKNOWN';
  /** Active job count from Supabase at snapshot time */
  activeJobCount: number;
  /** Unique employer count at snapshot time */
  employerCount: number;
  /** Whether the city passed the IndexReadinessGate at snapshot time */
  indexReady: boolean;
  /** Computed quality score (0–100) at snapshot time */
  qualityScore: number;
  /** Opportunity signals detected */
  opportunities: OpportunityType[];
  /** ISO timestamp of this telemetry record */
  capturedAt: string;
}

export interface CityOpportunityAlert {
  citySlug: string;
  canonicalUrl: string;
  opportunityType: OpportunityType;
  /** Human-readable description */
  description: string;
  /** Recommended action */
  action: string;
  /** Priority: HIGH | MEDIUM | LOW */
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  /** Supporting data */
  evidence: Record<string, number | string>;
}

/**
 * Detect opportunity signals from a telemetry record.
 * Returns actionable alerts sorted by priority.
 */
export function detectCityOpportunities(record: CityGSCTelemetryRecord): CityOpportunityAlert[] {
  const alerts: CityOpportunityAlert[] = [];

  // HIGH_IMPRESSION_LOW_CTR
  if (record.impressions >= 500 && record.ctr < 0.02) {
    alerts.push({
      citySlug: record.citySlug,
      canonicalUrl: record.canonicalUrl,
      opportunityType: 'HIGH_IMPRESSION_LOW_CTR',
      description: `${record.citySlug}: ${record.impressions} impressions but only ${(record.ctr * 100).toFixed(2)}% CTR`,
      action: 'Optimize title tag and meta description to improve click-through. Add structured data for job listing rich results.',
      priority: 'HIGH',
      evidence: { impressions: record.impressions, ctr: record.ctr, avgPosition: record.avgPosition },
    });
  }

  // POSITION_5_TO_20 — golden opportunity range
  if (record.avgPosition >= 5 && record.avgPosition <= 20 && record.impressions >= 50) {
    alerts.push({
      citySlug: record.citySlug,
      canonicalUrl: record.canonicalUrl,
      opportunityType: 'POSITION_5_TO_20',
      description: `${record.citySlug}: Ranking at position ${record.avgPosition.toFixed(1)} — push to top 5`,
      action: 'Improve content depth, add FAQ schema, increase internal links from hub pages, improve E-E-A-T signals.',
      priority: 'HIGH',
      evidence: { avgPosition: record.avgPosition, impressions: record.impressions, clicks: record.clicks },
    });
  }

  // THIN_PAGE_RISK — indexed but no inventory
  if (!record.indexReady && record.indexStatus === 'INDEXED') {
    alerts.push({
      citySlug: record.citySlug,
      canonicalUrl: record.canonicalUrl,
      opportunityType: 'THIN_PAGE_RISK',
      description: `${record.citySlug}: Page is indexed but fails index readiness gate`,
      action: 'Add noindex meta tag and remove from sitemap until inventory reaches gate threshold. Do not deindex without first checking if it drives clicks.',
      priority: record.clicks > 0 ? 'MEDIUM' : 'HIGH',
      evidence: { indexReady: 0, qualityScore: record.qualityScore, activeJobCount: record.activeJobCount },
    });
  }

  // ZERO_IMPRESSIONS — no GSC signal
  if (record.impressions === 0 && record.activeJobCount >= 10) {
    alerts.push({
      citySlug: record.citySlug,
      canonicalUrl: record.canonicalUrl,
      opportunityType: 'ZERO_IMPRESSIONS',
      description: `${record.citySlug}: Has ${record.activeJobCount} active jobs but zero GSC impressions`,
      action: 'Submit URL for indexing via GSC. Add city URL to sitemap. Build internal links from hub pages.',
      priority: 'MEDIUM',
      evidence: { impressions: 0, activeJobCount: record.activeJobCount },
    });
  }

  // FEATURED_SNIPPET_CANDIDATE — position 1–3 high impressions
  if (record.avgPosition <= 3 && record.impressions >= 200 && record.ctr >= 0.03) {
    alerts.push({
      citySlug: record.citySlug,
      canonicalUrl: record.canonicalUrl,
      opportunityType: 'FEATURED_SNIPPET_CANDIDATE',
      description: `${record.citySlug}: Ranking at position ${record.avgPosition.toFixed(1)} with ${(record.ctr * 100).toFixed(1)}% CTR — optimize for featured snippet`,
      action: 'Add a concise definition answer box, FAQ schema, and "how many jobs in [city]" structured content block.',
      priority: 'MEDIUM',
      evidence: { avgPosition: record.avgPosition, impressions: record.impressions, ctr: record.ctr },
    });
  }

  return alerts.sort((a, b) => {
    const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return order[a.priority] - order[b.priority];
  });
}

/**
 * Build a telemetry snapshot from GSC data and inventory counts.
 * Called by the GSC sync job — NOT by page renderers.
 */
export function buildCityTelemetryRecord(params: {
  citySlug: string;
  baseUrl: string;
  gscRow: { impressions: number; clicks: number; ctr: number; avgPosition: number };
  topQueries: Array<{ query: string; impressions: number; clicks: number; position: number }>;
  indexStatus: 'INDEXED' | 'NOT_INDEXED' | 'EXCLUDED' | 'UNKNOWN';
  activeJobCount: number;
  employerCount: number;
  indexReady: boolean;
  qualityScore: number;
  period: string;
}): CityGSCTelemetryRecord {
  const record: CityGSCTelemetryRecord = {
    citySlug: params.citySlug,
    canonicalUrl: `${params.baseUrl}/locations/${params.citySlug}`,
    period: params.period,
    impressions: params.gscRow.impressions,
    clicks: params.gscRow.clicks,
    ctr: params.gscRow.ctr,
    avgPosition: params.gscRow.avgPosition,
    drivingQueryCount: params.topQueries.length,
    topQueries: params.topQueries.slice(0, 10),
    indexStatus: params.indexStatus,
    activeJobCount: params.activeJobCount,
    employerCount: params.employerCount,
    indexReady: params.indexReady,
    qualityScore: params.qualityScore,
    opportunities: [],
    capturedAt: new Date().toISOString(),
  };

  record.opportunities = detectCityOpportunities(record).map((a) => a.opportunityType);
  return record;
}
