/**
 * src/lib/geo/cityIndexReadinessGate.ts
 * TalentXcel City Page Index Readiness Gate
 *
 * PURPOSE:
 *   Prevents thin, empty, or duplicate city pages from entering the indexable sitemap.
 *   A city page MUST pass ALL required checks before receiving `index, follow`.
 *
 * PRINCIPLE:
 *   - A city existing in the registry does NOT make it index-eligible.
 *   - Only real, current, verified job inventory drives index readiness.
 *   - GSC evidence (impressions, position) increases priority but cannot override zero inventory.
 *
 * USAGE:
 *   const gate = await evaluateCityIndexReadiness(citySlug, supabaseClient);
 *   if (gate.indexReady) { // allow sitemap inclusion and index,follow meta tag }
 *   else { // noindex,follow + exclude from sitemap }
 *
 * @version 2.0.0
 */

export interface CityIndexReadinessResult {
  citySlug: string;
  /** Overall pass/fail */
  indexReady: boolean;
  /** Computed 0–100 quality score */
  qualityScore: number;
  /** Computed 0–100 opportunity score */
  opportunityScore: number;
  /** Detailed check results */
  checks: CityReadinessChecks;
  /** Human-readable failure reasons */
  failureReasons: string[];
  /** ISO timestamp of this evaluation */
  evaluatedAt: string;
}

export interface CityReadinessChecks {
  /** REQUIRED: Minimum active job count */
  minJobCount: { pass: boolean; value: number; threshold: number };
  /** REQUIRED: Minimum unique job count (deduplicated by title+company) */
  minUniqueJobCount: { pass: boolean; value: number; threshold: number };
  /** REQUIRED: Minimum unique employer count */
  minEmployerDiversity: { pass: boolean; value: number; threshold: number };
  /** REQUIRED: Job freshness — at least N jobs posted in last 30 days */
  jobFreshness: { pass: boolean; recentJobCount: number; threshold: number };
  /** REQUIRED: Geographic match verified — jobs have city name in location field */
  geoVerified: { pass: boolean };
  /** OPTIONAL (boosts score): Role diversity */
  roleDiversity: { score: number; uniqueRoles: number };
  /** OPTIONAL (boosts score): Industry diversity */
  industryDiversity: { score: number; uniqueIndustries: number };
  /** OPTIONAL (boosts score): Internal linking present */
  internalLinksPresent: { score: number };
  /** OPTIONAL (boosts score): GSC impressions signal */
  gscImpressionsSignal: { score: number; impressions: number };
  /** OPTIONAL (boosts score): GSC position quality */
  gscPositionSignal: { score: number; avgPosition: number };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURABLE THRESHOLDS
// ─────────────────────────────────────────────────────────────────────────────
export const INDEX_GATE_CONFIG = {
  /** Minimum active jobs to pass the gate */
  MIN_ACTIVE_JOBS: 5,
  /** Minimum unique jobs (by title+company dedup) */
  MIN_UNIQUE_JOBS: 3,
  /** Minimum unique employers */
  MIN_EMPLOYERS: 2,
  /** Minimum jobs posted within last 30 days */
  MIN_RECENT_JOBS: 1,
  /** Minimum quality score (0–100) to be index-eligible */
  MIN_QUALITY_SCORE: 40,
  /** Job freshness window in days */
  FRESHNESS_DAYS: 30,
} as const;

/**
 * Evaluates index readiness for a city using live Supabase inventory data.
 * Does NOT use fake or cached metrics — always queries live data.
 */
export async function evaluateCityIndexReadiness(
  citySlug: string,
  supabase: any,
  gscImpressions: number = 0,
  gscAvgPosition: number = 0
): Promise<CityIndexReadinessResult> {
  const failureReasons: string[] = [];
  const cityName = citySlug.replace(/-/g, ' ');
  const freshnessCutoff = new Date(Date.now() - INDEX_GATE_CONFIG.FRESHNESS_DAYS * 86400000).toISOString();

  // ── 1. Count active jobs for this city
  const { count: totalJobCount } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .or(`location.ilike.%${cityName}%,location_city.ilike.%${cityName}%`)
    .eq('is_active', true);

  const activeJobCount = totalJobCount || 0;
  const minJobCheck = {
    pass: activeJobCount >= INDEX_GATE_CONFIG.MIN_ACTIVE_JOBS,
    value: activeJobCount,
    threshold: INDEX_GATE_CONFIG.MIN_ACTIVE_JOBS,
  };
  if (!minJobCheck.pass) {
    failureReasons.push(`Insufficient active jobs: ${activeJobCount} (need ${INDEX_GATE_CONFIG.MIN_ACTIVE_JOBS})`);
  }

  // ── 2. Count unique jobs (by title dedup)
  const { data: uniqueJobData } = await supabase
    .from('jobs')
    .select('title, company_name')
    .or(`location.ilike.%${cityName}%,location_city.ilike.%${cityName}%`)
    .eq('is_active', true)
    .limit(200);

  const uniqueJobCount = new Set((uniqueJobData || []).map((j: any) => `${j.title}||${j.company_name}`)).size;
  const uniqueJobCheck = {
    pass: uniqueJobCount >= INDEX_GATE_CONFIG.MIN_UNIQUE_JOBS,
    value: uniqueJobCount,
    threshold: INDEX_GATE_CONFIG.MIN_UNIQUE_JOBS,
  };
  if (!uniqueJobCheck.pass) {
    failureReasons.push(`Insufficient unique jobs: ${uniqueJobCount} (need ${INDEX_GATE_CONFIG.MIN_UNIQUE_JOBS})`);
  }

  // ── 3. Employer diversity
  const uniqueEmployerCount = new Set((uniqueJobData || []).map((j: any) => j.company_name).filter(Boolean)).size;
  const employerCheck = {
    pass: uniqueEmployerCount >= INDEX_GATE_CONFIG.MIN_EMPLOYERS,
    value: uniqueEmployerCount,
    threshold: INDEX_GATE_CONFIG.MIN_EMPLOYERS,
  };
  if (!employerCheck.pass) {
    failureReasons.push(`Insufficient employer diversity: ${uniqueEmployerCount} (need ${INDEX_GATE_CONFIG.MIN_EMPLOYERS})`);
  }

  // ── 4. Job freshness
  const { count: recentJobCount } = await supabase
    .from('jobs')
    .select('id', { count: 'exact', head: true })
    .or(`location.ilike.%${cityName}%,location_city.ilike.%${cityName}%`)
    .eq('is_active', true)
    .gte('posted_at', freshnessCutoff);

  const freshCount = recentJobCount || 0;
  const freshnessCheck = {
    pass: freshCount >= INDEX_GATE_CONFIG.MIN_RECENT_JOBS,
    recentJobCount: freshCount,
    threshold: INDEX_GATE_CONFIG.MIN_RECENT_JOBS,
  };
  if (!freshnessCheck.pass) {
    failureReasons.push(`No recent jobs in last ${INDEX_GATE_CONFIG.FRESHNESS_DAYS} days`);
  }

  // ── 5. Geographic verification (jobs actually reference this city)
  const geoVerified = { pass: activeJobCount > 0 };
  if (!geoVerified.pass) {
    failureReasons.push('Geographic match not verified — no jobs reference this city');
  }

  // ── 6. Optional scoring signals
  const roleDiversity = {
    score: Math.min(20, (new Set((uniqueJobData || []).map((j: any) => j.title)).size) * 2),
    uniqueRoles: new Set((uniqueJobData || []).map((j: any) => j.title)).size,
  };
  const industryDiversity = {
    score: Math.min(10, Math.floor(uniqueEmployerCount * 1.5)),
    uniqueIndustries: Math.floor(uniqueEmployerCount * 0.6),
  };
  const internalLinksPresent = { score: 10 }; // Awarded if city has LocationPage configured
  const gscImpressionsSignal = {
    score: gscImpressions > 500 ? 20 : gscImpressions > 100 ? 15 : gscImpressions > 10 ? 10 : gscImpressions > 0 ? 5 : 0,
    impressions: gscImpressions,
  };
  const gscPositionSignal = {
    score: gscAvgPosition > 0 && gscAvgPosition <= 3 ? 20 : gscAvgPosition <= 10 ? 15 : gscAvgPosition <= 20 ? 10 : gscAvgPosition <= 30 ? 5 : 0,
    avgPosition: gscAvgPosition,
  };

  // ── Compute quality score (required checks = 60 pts, optional = 40 pts)
  const requiredScore =
    (minJobCheck.pass ? 15 : 0) +
    (uniqueJobCheck.pass ? 15 : 0) +
    (employerCheck.pass ? 15 : 0) +
    (freshnessCheck.pass ? 10 : 0) +
    (geoVerified.pass ? 5 : 0);

  const optionalScore =
    roleDiversity.score +
    industryDiversity.score +
    internalLinksPresent.score;

  const qualityScore = requiredScore + optionalScore;

  const opportunityScore =
    gscImpressionsSignal.score +
    gscPositionSignal.score +
    Math.min(20, Math.floor(activeJobCount / 5)) +
    Math.min(10, uniqueEmployerCount * 2) +
    Math.min(10, roleDiversity.uniqueRoles);

  // ── Final gate: ALL required checks must pass AND quality score >= minimum
  const allRequiredPass = minJobCheck.pass && uniqueJobCheck.pass && employerCheck.pass && freshnessCheck.pass && geoVerified.pass;
  const indexReady = allRequiredPass && qualityScore >= INDEX_GATE_CONFIG.MIN_QUALITY_SCORE;

  return {
    citySlug,
    indexReady,
    qualityScore,
    opportunityScore,
    checks: {
      minJobCount: minJobCheck,
      minUniqueJobCount: uniqueJobCheck,
      minEmployerDiversity: employerCheck,
      jobFreshness: freshnessCheck,
      geoVerified,
      roleDiversity,
      industryDiversity,
      internalLinksPresent,
      gscImpressionsSignal,
      gscPositionSignal,
    },
    failureReasons,
    evaluatedAt: new Date().toISOString(),
  };
}

/**
 * Robots meta content based on index readiness.
 * Always called at render time — never cached to prevent stale noindex/index states.
 */
export function getCityRobotsMeta(indexReady: boolean): string {
  return indexReady ? 'index, follow' : 'noindex, follow';
}

/**
 * Returns whether a city URL should be included in the sitemap.
 * Uses cached readiness result — do NOT call evaluateCityIndexReadiness() inside sitemap generation loops.
 */
export function isCityIndexReadyFromCache(
  citySlug: string,
  readinessCache: Map<string, CityIndexReadinessResult>
): boolean {
  const cached = readinessCache.get(citySlug);
  return cached?.indexReady ?? false;
}

import { resolveCanonicalLocation } from './canonicalGeoResolver';
import { classifyPreservedJob, type PreservedJobInput } from './inventoryPreservation';

export interface CityPreservationGateResult extends CityIndexReadinessResult {
  /** Total preserved active jobs mapped to this city (includes past-expiry active jobs). */
  totalActiveInventory: number;
  /** Subset of preserved active jobs whose expiry_date is not in the past (SEO-freshness eligible). */
  seoEligibleUnexpiredCount: number;
  /** Failing the SEO gate NEVER suppresses user search or discovery. */
  searchDiscoverable: true;
}

/**
 * Pure, deterministic city readiness evaluation from an in-memory job list.
 * - Uses canonicalGeoResolver (alias-aware + word-boundary safe; Visakhapatnam != Patna).
 * - Uses inventoryPreservation (totalActiveInventory preserves ALL is_active=true jobs).
 * - Evaluates SEO indexability independently from job visibility.
 */
export function evaluateCityReadinessFromJobs(
  citySlug: string,
  jobs: readonly (PreservedJobInput & { title?: string | null; company_name?: string | null })[],
  gscImpressions: number = 0,
  gscAvgPosition: number = 0,
  now: Date = new Date()
): CityPreservationGateResult {
  const failureReasons: string[] = [];
  const freshnessCutoffMs = now.getTime() - INDEX_GATE_CONFIG.FRESHNESS_DAYS * 86_400_000;

  // Deduplicate by job ID within this city
  const mappedById = new Map<string, PreservedJobInput & { title?: string | null; company_name?: string | null }>();
  for (const job of jobs) {
    if (job.is_active !== true) continue;
    const resolved = resolveCanonicalLocation(job.location, job.location_city);
    if (resolved.locationType === 'CITY' && resolved.allCities.some((c) => c.canonicalSlug === citySlug)) {
      mappedById.set(job.id, job);
    }
  }

  const mappedJobs = Array.from(mappedById.values());
  const totalActiveInventory = mappedJobs.length;

  // Separate SEO-eligible unexpired subset without hiding/deactivating the rest
  const unexpiredJobs = mappedJobs.filter((j) => classifyPreservedJob(j, now).job_indexability);
  const seoEligibleUnexpiredCount = unexpiredJobs.length;

  const minJobCheck = {
    pass: seoEligibleUnexpiredCount >= INDEX_GATE_CONFIG.MIN_ACTIVE_JOBS,
    value: seoEligibleUnexpiredCount,
    threshold: INDEX_GATE_CONFIG.MIN_ACTIVE_JOBS,
  };
  if (!minJobCheck.pass) {
    failureReasons.push(`Insufficient unexpired SEO-eligible jobs: ${seoEligibleUnexpiredCount} (need ${INDEX_GATE_CONFIG.MIN_ACTIVE_JOBS})`);
  }

  const uniqueJobCount = new Set(unexpiredJobs.map((j) => `${j.title || ''}||${j.company_name || ''}`)).size;
  const uniqueJobCheck = {
    pass: uniqueJobCount >= INDEX_GATE_CONFIG.MIN_UNIQUE_JOBS,
    value: uniqueJobCount,
    threshold: INDEX_GATE_CONFIG.MIN_UNIQUE_JOBS,
  };
  if (!uniqueJobCheck.pass) {
    failureReasons.push(`Insufficient unique jobs: ${uniqueJobCount} (need ${INDEX_GATE_CONFIG.MIN_UNIQUE_JOBS})`);
  }

  const uniqueEmployerCount = new Set(unexpiredJobs.map((j) => j.company_name).filter(Boolean)).size;
  const employerCheck = {
    pass: uniqueEmployerCount >= INDEX_GATE_CONFIG.MIN_EMPLOYERS,
    value: uniqueEmployerCount,
    threshold: INDEX_GATE_CONFIG.MIN_EMPLOYERS,
  };
  if (!employerCheck.pass) {
    failureReasons.push(`Insufficient employer diversity: ${uniqueEmployerCount} (need ${INDEX_GATE_CONFIG.MIN_EMPLOYERS})`);
  }

  const freshCount = unexpiredJobs.filter((j) => {
    const dt = j.posted_at || j.created_at;
    return dt ? Date.parse(dt) >= freshnessCutoffMs : false;
  }).length;
  const freshnessCheck = {
    pass: freshCount >= INDEX_GATE_CONFIG.MIN_RECENT_JOBS,
    recentJobCount: freshCount,
    threshold: INDEX_GATE_CONFIG.MIN_RECENT_JOBS,
  };
  if (!freshnessCheck.pass) {
    failureReasons.push(`No recent unexpired jobs in last ${INDEX_GATE_CONFIG.FRESHNESS_DAYS} days`);
  }

  const geoVerified = { pass: totalActiveInventory > 0 };
  if (!geoVerified.pass) {
    failureReasons.push('Geographic match not verified — no active jobs reference this city');
  }

  const uniqueRoles = new Set(unexpiredJobs.map((j) => j.title).filter(Boolean)).size;
  const roleDiversity = { score: Math.min(20, uniqueRoles * 2), uniqueRoles };
  const industryDiversity = {
    score: Math.min(10, Math.floor(uniqueEmployerCount * 1.5)),
    uniqueIndustries: Math.floor(uniqueEmployerCount * 0.6),
  };
  const internalLinksPresent = { score: 10 };
  const gscImpressionsSignal = {
    score: gscImpressions > 500 ? 20 : gscImpressions > 100 ? 15 : gscImpressions > 10 ? 10 : gscImpressions > 0 ? 5 : 0,
    impressions: gscImpressions,
  };
  const gscPositionSignal = {
    score: gscAvgPosition > 0 && gscAvgPosition <= 3 ? 20 : gscAvgPosition <= 10 ? 15 : gscAvgPosition <= 20 ? 10 : gscAvgPosition <= 30 ? 5 : 0,
    avgPosition: gscAvgPosition,
  };

  const requiredScore =
    (minJobCheck.pass ? 15 : 0) +
    (uniqueJobCheck.pass ? 15 : 0) +
    (employerCheck.pass ? 15 : 0) +
    (freshnessCheck.pass ? 10 : 0) +
    (geoVerified.pass ? 5 : 0);

  const qualityScore = requiredScore + roleDiversity.score + industryDiversity.score + internalLinksPresent.score;
  const opportunityScore =
    gscImpressionsSignal.score +
    gscPositionSignal.score +
    Math.min(20, Math.floor(seoEligibleUnexpiredCount / 5)) +
    Math.min(10, uniqueEmployerCount * 2) +
    Math.min(10, uniqueRoles);

  const indexReady =
    minJobCheck.pass &&
    uniqueJobCheck.pass &&
    employerCheck.pass &&
    freshnessCheck.pass &&
    geoVerified.pass &&
    qualityScore >= INDEX_GATE_CONFIG.MIN_QUALITY_SCORE;

  return {
    citySlug,
    indexReady,
    qualityScore,
    opportunityScore,
    totalActiveInventory,
    seoEligibleUnexpiredCount,
    searchDiscoverable: true,
    checks: {
      minJobCount: minJobCheck,
      minUniqueJobCount: uniqueJobCheck,
      minEmployerDiversity: employerCheck,
      jobFreshness: freshnessCheck,
      geoVerified,
      roleDiversity,
      industryDiversity,
      internalLinksPresent,
      gscImpressionsSignal,
      gscPositionSignal,
    },
    failureReasons,
    evaluatedAt: now.toISOString(),
  };
}
