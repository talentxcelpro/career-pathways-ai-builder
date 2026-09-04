// src/lib/seo/brandIntelligence/brandDemandIndex.ts
// TalentXcel Brand Demand Index
// Status-aware composite brand health score driven exclusively by real GSC data.
// Zero fabricated metrics — if data is absent, status = INSUFFICIENT_DATA, score = null.

import { BrandSubCategory, classifyBrandQuery } from './brandQueryClassifier';

// ==========================================
// 1. STATUS TYPES (mirrors acquisitionEvidenceLedger pattern)
// ==========================================
export type BrandMetricStatus = 'OBSERVED' | 'ESTIMATED' | 'INSUFFICIENT_DATA';

export interface BrandMetricValue<T = number> {
  value: T | null;
  status: BrandMetricStatus;
  observedAt?: string;
}

// ==========================================
// 2. RAW GSC ROW (passed in from real API)
// ==========================================
export interface GscBrandRow {
  query: string;
  impressions: number;
  clicks: number;
  ctr: number;         // 0–1
  position: number;
  landingPage?: string;
}

// ==========================================
// 3. BRAND SEARCH METRICS (from real GSC data)
// ==========================================
export interface BrandSearchMetrics {
  brandedImpressions: BrandMetricValue;
  brandedClicks: BrandMetricValue;
  brandedCtr: BrandMetricValue<number>;      // 0–1 ratio
  avgBrandedPosition: BrandMetricValue;
  uniqueBrandedQueries: BrandMetricValue;
  brandedLandingPages: BrandMetricValue;
  // Breakdown by sub-category
  bySubCategory: Partial<Record<BrandSubCategory, {
    impressions: number;
    clicks: number;
    queryCount: number;
  }>>;
}

// ==========================================
// 4. BRAND ACQUISITION METRICS (from first-party analytics/supabase)
// ==========================================
export interface BrandAcquisitionMetrics {
  brandedSessions: BrandMetricValue;       // sessions from branded queries
  brandedSignups: BrandMetricValue;
  brandedVerifiedUsers: BrandMetricValue;  // phone-verified
  brandedActivatedUsers: BrandMetricValue; // profile complete + first action
  brandedEmployers: BrandMetricValue;
  brandedJobsPosted: BrandMetricValue;
  brandedCustomers: BrandMetricValue;      // paying customers
}

// ==========================================
// 5. BRAND REVENUE METRICS
// ==========================================
export interface BrandRevenueMetrics {
  observedRevenueInr: BrandMetricValue;
  observedRevenueUsd: BrandMetricValue;
  revenueByProduct: BrandMetricValue<Record<string, number>>;
  revenueByMarket: BrandMetricValue<Record<string, number>>;
}

// ==========================================
// 6. BRAND DEMAND INDEX
// ==========================================
export interface BrandDemandIndex {
  /** Composite 0–100 brand health score. null when data is INSUFFICIENT. */
  score: number | null;
  status: BrandMetricStatus;
  trend: 'UP' | 'DOWN' | 'FLAT' | 'INSUFFICIENT_DATA';
  confidence: number; // 0–1
  observedFrom: string;
  observationPeriod: {
    start: string;
    end: string;
  };

  // Sub-scores (null when not enough data)
  awarenessScore: number | null;     // branded impressions × position quality
  engagementScore: number | null;    // branded CTR vs expected CTR at position
  acquisitionScore: number | null;   // branded signups / branded sessions
  revenueScore: number | null;       // brand-attributed revenue

  search: BrandSearchMetrics;
  acquisition: BrandAcquisitionMetrics;
  revenue: BrandRevenueMetrics;
}

// ==========================================
// 7. COMPUTE BRAND DEMAND INDEX from real GSC rows
// ==========================================

const NULL_SEARCH_METRICS: BrandSearchMetrics = {
  brandedImpressions: { value: null, status: 'INSUFFICIENT_DATA' },
  brandedClicks: { value: null, status: 'INSUFFICIENT_DATA' },
  brandedCtr: { value: null, status: 'INSUFFICIENT_DATA' },
  avgBrandedPosition: { value: null, status: 'INSUFFICIENT_DATA' },
  uniqueBrandedQueries: { value: null, status: 'INSUFFICIENT_DATA' },
  brandedLandingPages: { value: null, status: 'INSUFFICIENT_DATA' },
  bySubCategory: {},
};

const NULL_ACQUISITION_METRICS: BrandAcquisitionMetrics = {
  brandedSessions: { value: null, status: 'INSUFFICIENT_DATA' },
  brandedSignups: { value: null, status: 'INSUFFICIENT_DATA' },
  brandedVerifiedUsers: { value: null, status: 'INSUFFICIENT_DATA' },
  brandedActivatedUsers: { value: null, status: 'INSUFFICIENT_DATA' },
  brandedEmployers: { value: null, status: 'INSUFFICIENT_DATA' },
  brandedJobsPosted: { value: null, status: 'INSUFFICIENT_DATA' },
  brandedCustomers: { value: null, status: 'INSUFFICIENT_DATA' },
};

const NULL_REVENUE_METRICS: BrandRevenueMetrics = {
  observedRevenueInr: { value: null, status: 'INSUFFICIENT_DATA' },
  observedRevenueUsd: { value: null, status: 'INSUFFICIENT_DATA' },
  revenueByProduct: { value: null, status: 'INSUFFICIENT_DATA' },
  revenueByMarket: { value: null, status: 'INSUFFICIENT_DATA' },
};

/**
 * Computes Brand Search Metrics from real GSC rows.
 * Never fabricates data. Returns INSUFFICIENT_DATA status if no branded rows found.
 */
export function computeBrandSearchMetrics(
  gscRows: GscBrandRow[],
  observedAt: string = new Date().toISOString()
): BrandSearchMetrics {
  const brandedRows = gscRows.filter(row => classifyBrandQuery(row.query).isBranded);

  if (brandedRows.length === 0) {
    return NULL_SEARCH_METRICS;
  }

  const totalImpressions = brandedRows.reduce((s, r) => s + r.impressions, 0);
  const totalClicks = brandedRows.reduce((s, r) => s + r.clicks, 0);
  const avgCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const avgPos = brandedRows.reduce((s, r) => s + r.position, 0) / brandedRows.length;
  const uniquePages = new Set(brandedRows.map(r => r.landingPage).filter(Boolean)).size;

  // Sub-category breakdown
  const bySubCategory: BrandSearchMetrics['bySubCategory'] = {};
  for (const row of brandedRows) {
    const cls = classifyBrandQuery(row.query);
    for (const sub of cls.subCategories) {
      if (!bySubCategory[sub]) bySubCategory[sub] = { impressions: 0, clicks: 0, queryCount: 0 };
      bySubCategory[sub]!.impressions += row.impressions;
      bySubCategory[sub]!.clicks += row.clicks;
      bySubCategory[sub]!.queryCount += 1;
    }
  }

  const obs: BrandMetricStatus = 'OBSERVED';
  return {
    brandedImpressions: { value: totalImpressions, status: obs, observedAt },
    brandedClicks: { value: totalClicks, status: obs, observedAt },
    brandedCtr: { value: Math.round(avgCtr * 10000) / 10000, status: obs, observedAt },
    avgBrandedPosition: { value: Math.round(avgPos * 10) / 10, status: obs, observedAt },
    uniqueBrandedQueries: { value: brandedRows.length, status: obs, observedAt },
    brandedLandingPages: { value: uniquePages, status: obs, observedAt },
    bySubCategory,
  };
}

/**
 * Computes the composite TalentXcel Brand Demand Index from real GSC data plus first-party metrics.
 * Rules:
 *  - If branded GSC rows are absent → score = null, status = INSUFFICIENT_DATA
 *  - Never turn missing data into zero
 *  - Acquisition and revenue metrics are injected separately (from Supabase/analytics)
 */
export function computeBrandDemandIndex(params: {
  gscRows: GscBrandRow[];
  periodStart: string;
  periodEnd: string;
  acquisitionMetrics?: Partial<BrandAcquisitionMetrics>;
  revenueMetrics?: Partial<BrandRevenueMetrics>;
  previousIndex?: BrandDemandIndex | null;
}): BrandDemandIndex {
  const { gscRows, periodStart, periodEnd, acquisitionMetrics, revenueMetrics, previousIndex } = params;
  const observedAt = new Date().toISOString();

  const search = computeBrandSearchMetrics(gscRows, observedAt);
  const brandedRows = gscRows.filter(r => classifyBrandQuery(r.query).isBranded);

  // No branded data → return null score with clear INSUFFICIENT_DATA status
  if (brandedRows.length === 0) {
    return {
      score: null,
      status: 'INSUFFICIENT_DATA',
      trend: 'INSUFFICIENT_DATA',
      confidence: 0,
      observedFrom: 'GSC_REAL_DATA',
      observationPeriod: { start: periodStart, end: periodEnd },
      awarenessScore: null,
      engagementScore: null,
      acquisitionScore: null,
      revenueScore: null,
      search,
      acquisition: { ...NULL_ACQUISITION_METRICS, ...acquisitionMetrics },
      revenue: { ...NULL_REVENUE_METRICS, ...revenueMetrics },
    };
  }

  // Awareness sub-score (0–100): impressions × position quality
  // Position 1–5 = full weight, 6–10 = 60%, 11+ = 20%
  const totalImpressions = brandedRows.reduce((s, r) => s + r.impressions, 0);
  const totalClicks = brandedRows.reduce((s, r) => s + r.clicks, 0);
  const avgPos = brandedRows.reduce((s, r) => s + r.position, 0) / brandedRows.length;
  const posWeight = avgPos <= 5 ? 1.0 : avgPos <= 10 ? 0.6 : 0.2;
  const awarenessScore = Math.min(100, Math.round((Math.log10(totalImpressions + 1) / 5) * 100 * posWeight));

  // Engagement sub-score (0–100): CTR vs expected
  // Position 1 expected CTR ~30%, position 5 ~10%, position 10 ~5%
  const expectedCtr = Math.max(0.03, 0.35 / Math.pow(avgPos, 0.9));
  const actualCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const engagementScore = Math.min(100, Math.round((actualCtr / expectedCtr) * 100));

  // Acquisition sub-score — only if first-party data injected
  const acqSignups = acquisitionMetrics?.brandedSignups?.value ?? null;
  const acqSessions = acquisitionMetrics?.brandedSessions?.value ?? null;
  const acquisitionScore = (acqSignups !== null && acqSessions !== null && acqSessions > 0)
    ? Math.min(100, Math.round((acqSignups / acqSessions) * 1000)) // 10% signup rate → score 100
    : null;

  // Revenue sub-score — only if revenue data injected
  const revUsd = revenueMetrics?.observedRevenueUsd?.value ?? null;
  const revenueScore = revUsd !== null ? Math.min(100, Math.round((revUsd / 10000) * 100)) : null;

  // Composite score weights: awareness 40%, engagement 30%, acquisition 20% (or redistribute if null), revenue 10%
  const weights = [
    { score: awarenessScore, weight: 0.40 },
    { score: engagementScore, weight: 0.30 },
    { score: acquisitionScore, weight: 0.20 },
    { score: revenueScore, weight: 0.10 },
  ];
  const validWeights = weights.filter(w => w.score !== null);
  const totalWeight = validWeights.reduce((s, w) => s + w.weight, 0);
  const compositeScore = totalWeight > 0
    ? Math.round(validWeights.reduce((s, w) => s + (w.score! * w.weight), 0) / totalWeight)
    : null;

  // Trend: compare with previous index if available
  let trend: BrandDemandIndex['trend'] = 'INSUFFICIENT_DATA';
  if (compositeScore !== null && previousIndex?.score !== null && previousIndex?.score !== undefined) {
    const delta = compositeScore - previousIndex.score;
    trend = delta > 3 ? 'UP' : delta < -3 ? 'DOWN' : 'FLAT';
  } else if (compositeScore !== null) {
    trend = 'FLAT'; // First measurement, no trend yet
  }

  // Confidence: how much data do we have?
  const dataCompleteness = validWeights.length / weights.length;
  const impressionConfidence = Math.min(1, Math.log10(totalImpressions + 1) / 4);
  const confidence = Math.round(((dataCompleteness * 0.5) + (impressionConfidence * 0.5)) * 100) / 100;

  return {
    score: compositeScore,
    status: 'OBSERVED',
    trend,
    confidence,
    observedFrom: 'GSC_REAL_DATA',
    observationPeriod: { start: periodStart, end: periodEnd },
    awarenessScore,
    engagementScore,
    acquisitionScore,
    revenueScore,
    search,
    acquisition: { ...NULL_ACQUISITION_METRICS, ...acquisitionMetrics },
    revenue: { ...NULL_REVENUE_METRICS, ...revenueMetrics },
  };
}

/**
 * Empty/uninitialized Brand Demand Index for use before any GSC data has been ingested.
 */
export const EMPTY_BRAND_DEMAND_INDEX: BrandDemandIndex = {
  score: null,
  status: 'INSUFFICIENT_DATA',
  trend: 'INSUFFICIENT_DATA',
  confidence: 0,
  observedFrom: 'NO_DATA_YET',
  observationPeriod: { start: '', end: '' },
  awarenessScore: null,
  engagementScore: null,
  acquisitionScore: null,
  revenueScore: null,
  search: NULL_SEARCH_METRICS,
  acquisition: NULL_ACQUISITION_METRICS,
  revenue: NULL_REVENUE_METRICS,
};
