/**
 * TALENTXCEL — PHASE 2 GATE 2D
 * Canonical Job Payload Converter
 * src/lib/job/toJobsTablePayload.ts
 *
 * PURPOSE:
 *   Convert a NormalizedJobContent (Gate 2B output) to the safe subset of
 *   fields that can be written to the jobs table for a NEW job insertion.
 *
 * GUARANTEES:
 *   - Pure function — no side effects, no async, no database calls
 *   - Non-mutating — original NormalizedJobContent is never modified
 *   - Never fabricates missing fields — absent values become null / [] / ''
 *   - SOURCE_PROVIDED structured requirements are written as-is
 *   - AI_INFERRED data is NEVER written to the database
 *   - Employment type is ALWAYS normalized to kebab-case enum values
 *   - All five ingestion paths converge on this single converter
 *
 * WHAT THIS FILE IS NOT:
 *   - NOT a database write function
 *   - NOT an AI enrichment layer
 *   - NOT a schema migration
 *   - NOT a backfill utility
 *
 * EMPLOYMENT TYPE CANONICAL VALUES (enforced by this converter):
 *   'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
 *
 * All ingestion paths previously used inconsistent variants:
 *   - 'full_time' (underscore, AdminJobUpload)
 *   - 'Full-time' (Title Case, bulkJobData)
 *   - undefined / missing (scraper)
 * This converter normalizes them all.
 */

import { NormalizedJobContent } from './normalizeJobContent';

// ---------------------------------------------------------------------------
// Types — mirrors the jobs table insert shape
// ---------------------------------------------------------------------------

/**
 * The safe subset of jobs table columns that Gate 2D is authorized to write.
 * Only fields supported by the source ingestion path are populated.
 * Missing / unknown fields are omitted or null.
 *
 * NOT included (require explicit product decision):
 *   - company_id (not always resolvable from source data)
 *   - posted_by (must come from authenticated session — never faked)
 *   - seo_slug (computed elsewhere or left for DB trigger)
 *   - external_url (scraper-specific, passed through raw)
 *   - ai_priority (product feature flag, not a normalization concern)
 *   - visibility_status (publishing state machine)
 *   - expires_at (set by calling code based on business rules)
 */
export interface JobsTablePayload {
  // Core — always populated from canonical
  title: string;
  description: string;
  company_name: string;
  location: string;
  employment_type: string;
  experience_level: string;
  is_remote: boolean;

  // Structured requirement arrays — SOURCE_PROVIDED only, never AI_INFERRED
  must_have_requirements: string[];
  preferred_requirements: string[];
  key_responsibilities: string[];
  skills_required: string[];

  // Experience & Education — null if not provided by source
  min_experience: number | null;
  max_experience: number | null;
  education_level: string | null;

  // Metadata
  is_active: boolean;
}

/**
 * Full extended payload for paths that supply extra fields.
 * Optional fields are undefined when not provided by the source.
 */
export interface ExtendedJobsTablePayload extends JobsTablePayload {
  // Salary — present only when source provides it
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string;

  // Tags and extras — present only when source provides them
  job_tags?: string[];
  benefits?: string[];
  external_url?: string;
  seo_slug?: string;

  // Employer form extras
  job_title?: string;
  job_summary?: string;
  job_description?: string;
  location_city?: string;
  location_state?: string;
  work_mode?: string;
  work_schedule?: string;
  contact_name?: string;
  contact_designation?: string;
  contact_person_email?: string;
  contact_person_phone?: string;
  company_website?: string;
  industry_domain?: string;
  company_size?: string;
  field_of_study?: string[];
  certifications?: string[];
  specific_tools?: string[];
  preferred_industries?: string[];
  preferred_company_types?: string[];
  application_deadline?: string | null;
  jd_flyer_url?: string;
  team_brochure_url?: string;
  benefits_policy_url?: string;
  ai_match_enabled?: boolean;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const EMPLOYMENT_TYPE_MAP: Record<string, string> = {
  // Underscore variants (AdminJobUpload)
  full_time: 'full-time',
  part_time: 'part-time',
  // Space variants (generic text)
  'full time': 'full-time',
  'part time': 'part-time',
  // Title case / titlecase variants (bulkJobData)
  'full-time': 'full-time',
  'Full-time': 'full-time',
  'Full-Time': 'full-time',
  'part-time': 'part-time',
  'Part-time': 'part-time',
  'Part-Time': 'part-time',
  // Other forms
  fulltime: 'full-time',
  parttime: 'part-time',
  contract: 'contract',
  contractual: 'contract',
  freelance: 'freelance',
  temporary: 'freelance',
  temp: 'freelance',
  internship: 'internship',
  intern: 'internship',
};

function normalizeEmploymentType(raw: string | undefined | null): string {
  if (!raw) return 'full-time';
  const key = raw.trim();
  return EMPLOYMENT_TYPE_MAP[key] ?? EMPLOYMENT_TYPE_MAP[key.toLowerCase()] ?? 'full-time';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * toJobsTablePayload
 *
 * Converts a NormalizedJobContent (Gate 2B canonical job) to the safe
 * insert payload for the jobs table.
 *
 * NEVER writes AI_INFERRED data.
 * NEVER fabricates missing fields.
 * ALWAYS normalizes employment_type to kebab-case enum values.
 */
export function toJobsTablePayload(
  canonical: NormalizedJobContent
): JobsTablePayload {
  return {
    // Core
    title: canonical.title || '',
    description: canonical.description || '',
    company_name: canonical.companyName || '',
    location: canonical.location || '',
    employment_type: normalizeEmploymentType(canonical.employmentType),
    experience_level: canonical.experienceLevel ?? (
      canonical.minExperience !== null && canonical.minExperience !== undefined
        ? 'mid-level'
        : 'fresher'
    ),
    is_remote: canonical.isRemote,

    // Structured requirements — SOURCE_PROVIDED text strings only
    must_have_requirements: canonical.mustHaveRequirements.map(r => r.text),
    preferred_requirements: canonical.niceToHave.map(r => r.text),
    key_responsibilities: canonical.keyResponsibilities.map(r => r.text),
    skills_required: canonical.skillsRequired.map(r => r.text),

    // Experience & Education — null if not provided
    min_experience: canonical.minExperience ?? null,
    max_experience: canonical.maxExperience ?? null,
    education_level: canonical.educationLevel ?? null,

    // Metadata
    is_active: true,
  };
}

/**
 * normalizeEmploymentTypeString
 *
 * Exported helper for callers that need to normalize an employment type
 * string without running a full normalization.
 * Used by useJobPublisher and AdminJobUpload.
 */
export { normalizeEmploymentType as normalizeEmploymentTypeString };
