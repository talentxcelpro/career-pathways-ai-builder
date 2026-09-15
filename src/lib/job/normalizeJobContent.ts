/**
 * TALENTXCEL — PHASE 2 GATE 2B
 * Canonical Job Normalization Layer
 *
 * PURPOSE:
 *   Map all known job ingestion shapes to one canonical NormalizedJobContent
 *   at runtime.
 *
 * GUARANTEES:
 *   - Pure function — no side effects
 *   - Deterministic — same input always produces same output
 *   - Non-mutating — original input object is never modified
 *   - Safe for null / undefined / malformed input
 *   - Does NOT write to database or update any jobs table rows
 *   - Does NOT perform LLM or AI inference (Gate 2B rule)
 *   - Does NOT fabricate missing requirements or experience numbers
 *   - Preserves source provenance metadata for every requirement
 *
 * KNOWN VARIANTS HANDLED:
 *   1. Bulk CSV shape          : { title, company_name, description, skills_required, ... }
 *   2. Automated scraper shape : { title, company, location, description, job_type, ... }
 *   3. Admin upload shape      : { title, company_name, skills_required[], job_tags, ... }
 *   4. Employer form shape     : { job_title, company_name, location, description, ... }
 *   5. Jobs table record shape : { id, title, must_have_requirements, min_experience, ... }
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RequirementCategory = 'MUST_HAVE' | 'PREFERRED' | 'SKILL' | 'RESPONSIBILITY';
export type ProvenanceSource = 'SOURCE_PROVIDED' | 'AI_INFERRED' | 'UNKNOWN';
export type ProvenanceConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface NormalizedJobRequirement {
  text: string;
  category: RequirementCategory;
  source: ProvenanceSource;
  confidence: ProvenanceConfidence;
}

export interface NormalizedJobContent {
  id: string;
  title: string;
  companyName: string;
  location: string;
  description: string;

  // Structured Requirement Arrays
  mustHaveRequirements: NormalizedJobRequirement[];
  niceToHave: NormalizedJobRequirement[];
  skillsRequired: NormalizedJobRequirement[];
  keyResponsibilities: NormalizedJobRequirement[];

  // Experience & Education
  minExperience: number | null;
  maxExperience: number | null;
  experienceLevel?: string;
  educationLevel: string | null;

  // Employment & Work Style
  employmentType: string;
  isRemote: boolean;
}

export type JobNormalizationStatus =
  | 'OK'
  | 'OK_WITH_WARNINGS'
  | 'UNSUPPORTED_VARIANT'
  | 'MANUAL_REVIEW_REQUIRED';

export interface JobNormalizationWarning {
  field: string;
  message: string;
}

export interface JobNormalizationResult {
  status: JobNormalizationStatus;
  variantDetected: string;
  normalized: NormalizedJobContent;
  warnings: JobNormalizationWarning[];
  uninterpretableFields: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers — pure & side-effect free
// ---------------------------------------------------------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  return '';
}

/**
 * Safely parse integers from numbers or numeric strings (e.g. 3, "3", "3 years" -> 3).
 * Returns null if invalid or missing.
 */
function safeNumber(value: unknown): number | null {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const match = trimmed.match(/^(\d+)/);
    if (match) {
      const parsed = parseInt(match[1], 10);
      if (!isNaN(parsed)) return parsed;
    }
  }
  return null;
}

/**
 * Split comma, semicolon, or pipe delimited strings into trimmed array items.
 */
function parseDelimitedString(val: string): string[] {
  return val
    .split(/[,;|]/)
    .map(s => s.trim())
    .filter(Boolean);
}

/**
 * Parse requirements array or delimited string into NormalizedJobRequirement[].
 * Deduplicates items by case-insensitive text while preserving original casing.
 */
function normalizeRequirementList(
  rawList: unknown,
  category: RequirementCategory,
  warnings: JobNormalizationWarning[],
  fieldLabel: string
): NormalizedJobRequirement[] {
  let stringItems: string[] = [];

  if (Array.isArray(rawList)) {
    rawList.forEach((item, idx) => {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed) stringItems.push(trimmed);
      } else if (isPlainObject(item)) {
        const text = safeString(item.text || item.name || item.title).trim();
        if (text) stringItems.push(text);
      } else {
        warnings.push({
          field: `${fieldLabel}[${idx}]`,
          message: `Skipped non-string item of type "${typeof item}"`,
        });
      }
    });
  } else if (typeof rawList === 'string') {
    stringItems = parseDelimitedString(rawList);
  } else if (rawList !== undefined && rawList !== null) {
    warnings.push({
      field: fieldLabel,
      message: `Expected array or delimited string, got "${typeof rawList}" — set to empty`,
    });
  }

  // Deduplicate items case-insensitively
  const seen = new Set<string>();
  const deduplicated: NormalizedJobRequirement[] = [];

  for (const text of stringItems) {
    const lower = text.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      deduplicated.push({
        text,
        category,
        source: 'SOURCE_PROVIDED',
        confidence: 'HIGH',
      });
    }
  }

  return deduplicated;
}

/**
 * Coalesce title from all known variations.
 */
function coalesceTitle(raw: Record<string, unknown>): string {
  if (typeof raw.title === 'string' && raw.title.trim()) return raw.title.trim();
  if (typeof raw.job_title === 'string' && raw.job_title.trim()) return raw.job_title.trim();
  return '';
}

/**
 * Coalesce company name from all known variations.
 */
function coalesceCompany(raw: Record<string, unknown>): string {
  if (typeof raw.company_name === 'string' && raw.company_name.trim()) return raw.company_name.trim();
  if (typeof raw.company === 'string' && raw.company.trim()) return raw.company.trim();
  return '';
}

/**
 * Normalize employment type.
 */
function normalizeEmploymentType(raw: Record<string, unknown>): string {
  const val = raw.employment_type || raw.employmentType || raw.job_type || raw.jobType;
  if (typeof val === 'string' && val.trim()) {
    const normalized = val.trim().toLowerCase().replace(/_/g, '-');
    return normalized;
  }
  return 'full-time';
}

/**
 * Normalize remote status.
 */
function normalizeIsRemote(raw: Record<string, unknown>): boolean {
  if (typeof raw.is_remote === 'boolean') return raw.is_remote;
  if (typeof raw.isRemote === 'boolean') return raw.isRemote;
  const location = safeString(raw.location).toLowerCase();
  if (location.includes('remote')) return true;
  return false;
}

/**
 * Detect which ingestion variant the raw input matches.
 */
function detectJobVariant(raw: Record<string, unknown>): string {
  if (raw.id && (raw.must_have_requirements !== undefined || raw.skills_required !== undefined)) {
    return 'V5_JOBS_TABLE_RECORD';
  }
  if (raw.posted_by || raw.company_id) {
    return 'V3_ADMIN_UPLOAD';
  }
  if (raw.batchName || raw.source) {
    return 'V1_BULK_CSV';
  }
  if (raw.url || raw.external_url) {
    return 'V2_SCRAPER';
  }
  if (raw.job_title || raw.company_name || raw.company) {
    return 'V4_EMPLOYER_FORM';
  }
  return 'UNKNOWN';
}


// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * normalizeJobContent
 *
 * Pure, deterministic, non-mutating runtime job normalizer.
 * Maps any job input shape into NormalizedJobContent.
 *
 * NEVER throws. NEVER writes to database. NEVER invokes LLM/AI.
 */
export function normalizeJobContent(rawJob: unknown): JobNormalizationResult {
  const warnings: JobNormalizationWarning[] = [];
  const uninterpretableFields: string[] = [];

  // Guard: null / undefined
  if (rawJob === null || rawJob === undefined) {
    return {
      status: 'UNSUPPORTED_VARIANT',
      variantDetected: 'NULL_INPUT',
      normalized: buildEmptyJob(),
      warnings: [{ field: 'root', message: 'Input is null or undefined — returning empty canonical shape' }],
      uninterpretableFields: [],
    };
  }

  // Guard: non-object
  if (!isPlainObject(rawJob)) {
    return {
      status: 'MANUAL_REVIEW_REQUIRED',
      variantDetected: `NON_OBJECT_${typeof rawJob}`,
      normalized: buildEmptyJob(),
      warnings: [{ field: 'root', message: `Input is type "${typeof rawJob}" — expected object. Returning empty canonical shape.` }],
      uninterpretableFields: ['root'],
    };
  }

  const variantDetected = detectJobVariant(rawJob);

  // 1. Title & Company Coalescence
  const title = coalesceTitle(rawJob);
  if (!title) {
    warnings.push({ field: 'title', message: 'Neither "title" nor "job_title" found — title is empty string' });
  }

  const companyName = coalesceCompany(rawJob);
  if (!companyName) {
    warnings.push({ field: 'companyName', message: 'Neither "company_name" nor "company" found — companyName is empty string' });
  }

  // 2. Location & Description
  const location = safeString(rawJob.location).trim();
  const description = safeString(rawJob.description).trim();
  if (!description) {
    warnings.push({ field: 'description', message: 'Description is empty string' });
  }

  // 3. Requirement Arrays (Structured & Delimited)
  const skillsRequired = normalizeRequirementList(
    rawJob.skills_required || rawJob.skillsRequired || rawJob.required_skills || rawJob.skills_keywords || rawJob.skills,
    'SKILL',
    warnings,
    'skillsRequired'
  );

  const mustHaveRequirements = normalizeRequirementList(
    rawJob.must_have_requirements || rawJob.mustHaveRequirements || rawJob.must_have,
    'MUST_HAVE',
    warnings,
    'mustHaveRequirements'
  );

  const niceToHave = normalizeRequirementList(
    rawJob.nice_to_have || rawJob.niceToHave || rawJob.preferred_requirements || rawJob.preferred,
    'PREFERRED',
    warnings,
    'niceToHave'
  );

  const keyResponsibilities = normalizeRequirementList(
    rawJob.key_responsibilities || rawJob.keyResponsibilities || rawJob.responsibilities,
    'RESPONSIBILITY',
    warnings,
    'keyResponsibilities'
  );

  // 4. Experience Normalization
  const minExpRaw = rawJob.min_experience ?? rawJob.minExperience;
  const maxExpRaw = rawJob.max_experience ?? rawJob.maxExperience;

  const minExperience = safeNumber(minExpRaw);
  const maxExperience = safeNumber(maxExpRaw);

  if (minExpRaw !== undefined && minExpRaw !== null && minExperience === null) {
    warnings.push({ field: 'minExperience', message: `min_experience "${minExpRaw}" could not be parsed as number` });
    uninterpretableFields.push('min_experience');
  }
  if (maxExpRaw !== undefined && maxExpRaw !== null && maxExperience === null) {
    warnings.push({ field: 'maxExperience', message: `max_experience "${maxExpRaw}" could not be parsed as number` });
    uninterpretableFields.push('max_experience');
  }

  const experienceLevel = typeof rawJob.experience_level === 'string'
    ? rawJob.experience_level
    : typeof rawJob.experienceLevel === 'string'
    ? rawJob.experienceLevel
    : undefined;

  // 5. Education Normalization
  const eduRaw = rawJob.education_level ?? rawJob.educationLevel ?? rawJob.education_requirements ?? rawJob.education;
  const educationLevel = typeof eduRaw === 'string' && eduRaw.trim() ? eduRaw.trim() : null;


  // 6. Employment Type & Remote Status
  const employmentType = normalizeEmploymentType(rawJob);
  const isRemote = normalizeIsRemote(rawJob);

  const normalized: NormalizedJobContent = {
    id: safeString(rawJob.id),
    title,
    companyName,
    location,
    description,
    mustHaveRequirements,
    niceToHave,
    skillsRequired,
    keyResponsibilities,
    minExperience,
    maxExperience,
    educationLevel,
    employmentType,
    isRemote,
  };

  if (experienceLevel) {
    normalized.experienceLevel = experienceLevel;
  }

  const status: JobNormalizationStatus =
    variantDetected === 'UNKNOWN'
      ? 'MANUAL_REVIEW_REQUIRED'
      : warnings.length > 0
      ? 'OK_WITH_WARNINGS'
      : 'OK';

  return {
    status,
    variantDetected,
    normalized,
    warnings,
    uninterpretableFields,
  };
}

/**
 * Returns an empty NormalizedJobContent shape.
 */
function buildEmptyJob(): NormalizedJobContent {
  return {
    id: '',
    title: '',
    companyName: '',
    location: '',
    description: '',
    mustHaveRequirements: [],
    niceToHave: [],
    skillsRequired: [],
    keyResponsibilities: [],
    minExperience: null,
    maxExperience: null,
    educationLevel: null,
    employmentType: 'full-time',
    isRemote: false,
  };
}
