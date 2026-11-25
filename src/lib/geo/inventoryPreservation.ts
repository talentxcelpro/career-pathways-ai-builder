/**
 * src/lib/geo/inventoryPreservation.ts
 * TalentXcel Job Inventory Preservation Layer
 *
 * CORE INVARIANTS:
 * 1. All existing active jobs (`is_active === true`) remain active regardless of `expiry_date`.
 * 2. Expiry dates are a freshness / SEO-eligibility signal ONLY — never an operational deactivation trigger.
 * 3. Job display visibility (`job_visibility`) and SEO indexability (`job_indexability`) are strictly separated.
 * 4. City SEO gate failure (`seo_city_eligibility = false`) NEVER suppresses jobs from user search or discovery.
 * 5. Raw job records (`rawLocation`, `posted_at`, `is_active`) are never mutated or fabricated.
 *
 * @version 1.0.0
 */

export type DateFreshnessClass =
  | 'FRESH_7D'
  | 'FRESH_30D'
  | 'RECENT_60D'
  | 'RECENT_90D'
  | 'OLDER'
  | 'PAST_EXPIRY_DATE';

export interface PreservedJobInput {
  id: string;
  is_active?: boolean | null;
  posted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  expiry_date?: string | null;
  expires_at?: string | null;
  application_deadline?: string | null;
  location?: string | null;
  location_city?: string | null;
  location_state?: string | null;
  is_remote?: boolean | null;
}

export interface PreservedJobClassification {
  jobId: string;
  /** Operational inventory status: true whenever is_active === true. NEVER cleared by expiry_date. */
  inventory_active: boolean;
  /** Whether the job is visible to users in search, city pages, and detail pages. */
  job_visibility: boolean;
  /** Independent date-freshness classification based on genuine dates. */
  date_freshness: DateFreshnessClass;
  /** True when expiry_date / expires_at / application_deadline is in the past. */
  is_past_expiry_date: boolean;
  /** Independent SEO indexability signal for JobPosting rich results / job sitemap. */
  job_indexability: boolean;
  /** Reason for job_indexability decision (transparent auditability). */
  indexability_reason: string;
  /** Genuine publication date (never rewritten). */
  actual_posted_at: string | null;
}

/**
 * Determines whether a job's expiry date is in the past relative to `now`.
 * Purely informational — NEVER triggers deactivation.
 */
export function isExpiryDateInPast(
  job: Pick<PreservedJobInput, 'expiry_date' | 'expires_at' | 'application_deadline'>,
  now: Date = new Date()
): boolean {
  const todayStr = now.toISOString().slice(0, 10);

  if (job.expiry_date) {
    const expStr = String(job.expiry_date).slice(0, 10);
    if (expStr < todayStr) return true;
  }
  if (job.expires_at) {
    const expTime = Date.parse(job.expires_at);
    if (!Number.isNaN(expTime) && expTime < now.getTime()) return true;
  }
  if (job.application_deadline) {
    const dlTime = Date.parse(job.application_deadline);
    if (!Number.isNaN(dlTime) && dlTime < now.getTime()) return true;
  }
  return false;
}

/**
 * Classifies date freshness from genuine publication/expiry timestamps.
 * Never fabricates or rewrites dates.
 */
export function classifyDateFreshness(
  job: Pick<PreservedJobInput, 'posted_at' | 'created_at' | 'expiry_date' | 'expires_at' | 'application_deadline'>,
  now: Date = new Date()
): DateFreshnessClass {
  if (isExpiryDateInPast(job, now)) {
    return 'PAST_EXPIRY_DATE';
  }

  const dateStr = job.posted_at || job.created_at;
  if (!dateStr) return 'OLDER';

  const ts = Date.parse(dateStr);
  if (Number.isNaN(ts)) return 'OLDER';

  const ageDays = (now.getTime() - ts) / 86_400_000;
  if (ageDays <= 7) return 'FRESH_7D';
  if (ageDays <= 30) return 'FRESH_30D';
  if (ageDays <= 60) return 'RECENT_60D';
  if (ageDays <= 90) return 'RECENT_90D';
  return 'OLDER';
}

/**
 * Evaluates a job under the Inventory Preservation Layer.
 * Guarantees:
 * - `is_active === true` ALWAYS yields `inventory_active: true` and `job_visibility: true`.
 * - Past expiry dates only affect `date_freshness` and `job_indexability` (SEO eligibility),
 *   never `inventory_active` or `job_visibility`.
 */
export function classifyPreservedJob(
  job: PreservedJobInput,
  now: Date = new Date()
): PreservedJobClassification {
  const inventoryActive = job.is_active === true;
  const pastExpiry = isExpiryDateInPast(job, now);
  const freshness = classifyDateFreshness(job, now);

  // SEO indexability is independent of operational visibility:
  // Google JobPosting guidelines discourage indexing expired job postings,
  // but the job remains active and visible to TalentXcel users.
  const jobIndexability = inventoryActive && !pastExpiry;
  const indexabilityReason = !inventoryActive
    ? 'job_inactive'
    : pastExpiry
    ? 'past_expiry_date_seo_only_preserved_in_inventory'
    : 'active_and_unexpired';

  return {
    jobId: job.id,
    inventory_active: inventoryActive,
    job_visibility: inventoryActive,
    date_freshness: freshness,
    is_past_expiry_date: pastExpiry,
    job_indexability: jobIndexability,
    indexability_reason: indexabilityReason,
    actual_posted_at: job.posted_at || job.created_at || null,
  };
}

/**
 * Never-deactivate guard: asserts that a job list transformation
 * preserves 100% of `is_active === true` records.
 */
export function verifyInventoryPreserved<T extends { id: string; is_active?: boolean | null }>(
  before: readonly T[],
  after: readonly T[]
): { preserved: boolean; beforeActiveCount: number; afterActiveCount: number; missingIds: string[] } {
  const beforeActive = before.filter((j) => j.is_active === true);
  const afterActiveIds = new Set(after.filter((j) => j.is_active === true).map((j) => j.id));
  const missingIds = beforeActive.filter((j) => !afterActiveIds.has(j.id)).map((j) => j.id);

  return {
    preserved: missingIds.length === 0,
    beforeActiveCount: beforeActive.length,
    afterActiveCount: afterActiveIds.size,
    missingIds,
  };
}
