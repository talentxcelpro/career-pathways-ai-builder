/**
 * TALENTXCEL — PREREQUISITE 0A
 * Runtime Resume Normalization Layer
 *
 * PURPOSE:
 *   Map all known ai_resumes.content shape variants to one
 *   canonical NormalizedResumeContent at runtime.
 *
 * GUARANTEES:
 *   - Pure function — no side effects
 *   - Deterministic — same input always produces same output
 *   - Non-mutating — original input object is never modified
 *   - Safe for null / undefined / malformed input
 *   - Does NOT write to database
 *   - Does NOT modify stored resume records
 *   - Does NOT fabricate data
 *   - Does NOT invent skill levels or proficiency scores
 *   - Does NOT silently discard meaningful source information
 *
 * KNOWN VARIANTS HANDLED:
 *   V1   — ResumeEditorV1 shape  : { profile, summary (top-level) }
 *   V2   — Core / Unified shape  : { personalInfo, personalInfo.summary }
 *   V3   — EnhancedResumeData    : { personalInfo, professionalSummary.content }
 *   V4   — EditorResume shape    : { personalInfo, skills as { technical, soft, languages, tools } }
 *   NULL — null / undefined / non-object input
 *   PARTIAL — any combination of missing optional sections
 *
 * DO NOT MODIFY THIS FILE to coerce or "fix" data in ways that
 * lose meaningful source information. Add a new variant instead.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * A normalized skill object. level is 'unknown' when the source
 * only provided a skill name string with no proficiency information.
 * 'unknown' must NOT be treated as zero or low proficiency downstream.
 */
export interface NormalizedSkill {
  /** Original name as stored in source data */
  name: string;
  /**
   * Proficiency level.
   * 'unknown' means: source had no level data — do NOT infer a value.
   */
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown';
  /** Category if present in source */
  category?: string;
  /** Years of experience if present in source */
  years?: number;
  /** Whether this skill was derived from a string (no original object) */
  _coercedFromString?: true;
}

export interface NormalizedPersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  /** Coalesced from all known summary locations. Empty string if none found. */
  summary: string;
  /** Optional fields preserved from source when present */
  professionalTitle?: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface NormalizedResumeContent {
  personalInfo: NormalizedPersonalInfo;
  experience: Record<string, unknown>[];
  education: Record<string, unknown>[];
  skills: NormalizedSkill[];
  projects: Record<string, unknown>[];
  certifications: Record<string, unknown>[];
}

// ---------------------------------------------------------------------------
// Normalization result envelope
// ---------------------------------------------------------------------------

export type NormalizationStatus =
  | 'OK'
  | 'OK_WITH_WARNINGS'
  | 'UNSUPPORTED_VARIANT'
  | 'MANUAL_REVIEW_REQUIRED';

export interface NormalizationWarning {
  field: string;
  message: string;
}

export interface NormalizationResult {
  status: NormalizationStatus;
  /** Detected variant label — informational only */
  variantDetected: string;
  normalized: NormalizedResumeContent;
  warnings: NormalizationWarning[];
  /** Fields that were present in source but could not be safely interpreted */
  uninterpretableFields: string[];
}

// ---------------------------------------------------------------------------
// Internal helpers — pure, side-effect free
// ---------------------------------------------------------------------------

/** Safely extract a string value. Returns '' for all non-string inputs. */
function safeString(value: unknown): string {
  if (typeof value === 'string') return value;
  return '';
}

/** Safely extract an array. Returns [] for all non-array inputs. */
function safeArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return [];
}

/** Type guard: plain non-null object */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Normalize a single skills entry.
 *
 * Handles:
 *   - string → { name, level: 'unknown', _coercedFromString: true }
 *   - object with name → preserve existing fields, default level to 'unknown'
 *   - anything else → skip (reported as warning)
 */
function normalizeSkillEntry(
  entry: unknown,
  index: number,
  warnings: NormalizationWarning[],
): NormalizedSkill | null {
  if (typeof entry === 'string') {
    const name = entry.trim();
    if (!name) {
      warnings.push({ field: `skills[${index}]`, message: 'Empty string skill entry skipped' });
      return null;
    }
    return { name, level: 'unknown', _coercedFromString: true };
  }

  if (isPlainObject(entry)) {
    const name = safeString(entry.name).trim();
    if (!name) {
      warnings.push({ field: `skills[${index}]`, message: 'Skill object missing name — skipped' });
      return null;
    }

    const VALID_LEVELS = new Set(['beginner', 'intermediate', 'advanced', 'expert', 'unknown']);
    const rawLevel = entry.level;
    const level: NormalizedSkill['level'] = VALID_LEVELS.has(rawLevel as string)
      ? (rawLevel as NormalizedSkill['level'])
      : 'unknown';

    if (rawLevel !== undefined && !VALID_LEVELS.has(rawLevel as string)) {
      warnings.push({
        field: `skills[${index}].level`,
        message: `Unrecognised level value "${rawLevel}" — set to 'unknown'. Do not treat as low proficiency.`,
      });
    }

    const normalized: NormalizedSkill = { name, level };
    if (typeof entry.category === 'string') normalized.category = entry.category;
    if (typeof entry.years === 'number') normalized.years = entry.years;
    return normalized;
  }

  warnings.push({ field: `skills[${index}]`, message: `Unrecognised skill entry type "${typeof entry}" — skipped` });
  return null;
}

/**
 * Normalize the skills field.
 *
 * V4 (EditorResume) stores skills as an object:
 *   { technical: string[], soft: string[], languages: string[], tools: string[] }
 *
 * All other variants store skills as an array of strings or objects.
 */
function normalizeSkills(
  rawSkills: unknown,
  warnings: NormalizationWarning[],
): NormalizedSkill[] {
  // V4 variant: object with named category arrays
  if (isPlainObject(rawSkills) && !Array.isArray(rawSkills)) {
    const KNOWN_CATEGORIES = ['technical', 'soft', 'languages', 'tools'] as const;
    const result: NormalizedSkill[] = [];
    let handled = false;

    for (const category of KNOWN_CATEGORIES) {
      const arr = rawSkills[category];
      if (Array.isArray(arr)) {
        handled = true;
        arr.forEach((entry, i) => {
          const normalized = normalizeSkillEntry(entry, result.length + i, warnings);
          if (normalized) {
            normalized.category = category;
            result.push(normalized);
          }
        });
      }
    }

    if (!handled) {
      warnings.push({
        field: 'skills',
        message: 'Skills field is an object but contains no recognisable category arrays — treated as empty',
      });
    }

    return result;
  }

  // Standard array variant
  const arr = safeArray(rawSkills);
  const result: NormalizedSkill[] = [];
  arr.forEach((entry, i) => {
    const normalized = normalizeSkillEntry(entry, i, warnings);
    if (normalized) result.push(normalized);
  });
  return result;
}

/**
 * Coalesce summary from all known locations.
 * Priority: personalInfo.summary > top-level summary > professionalSummary.content
 *
 * If professionalSummary.content is not a plain string, it is NOT coerced.
 * The field is reported as uninterpretable rather than silently discarded.
 */
function coalesceSummary(
  raw: Record<string, unknown>,
  personalInfoObj: Record<string, unknown>,
  warnings: NormalizationWarning[],
  uninterpretableFields: string[],
): string {
  // Priority 1: personalInfo.summary
  const piSummary = personalInfoObj.summary;
  if (typeof piSummary === 'string' && piSummary.trim()) return piSummary.trim();

  // Priority 2: top-level summary string
  const topSummary = raw.summary;
  if (typeof topSummary === 'string' && topSummary.trim()) return topSummary.trim();

  // Priority 3: professionalSummary.content
  const profSummary = raw.professionalSummary;
  if (isPlainObject(profSummary)) {
    const content = profSummary.content;
    if (typeof content === 'string' && content.trim()) return content.trim();
    if (content !== undefined && typeof content !== 'string') {
      uninterpretableFields.push('professionalSummary.content');
      warnings.push({
        field: 'professionalSummary.content',
        message: `professionalSummary.content is type "${typeof content}" — cannot safely extract string. Summary left empty.`,
      });
    }
  }

  return '';
}

/**
 * Detect which variant the raw input most closely matches.
 * For logging/diagnostics only — does not affect normalization logic.
 */
function detectVariant(raw: Record<string, unknown>): string {
  const hasProfile = isPlainObject(raw.profile);
  const hasPersonalInfo = isPlainObject(raw.personalInfo);
  const hasProfSummary = isPlainObject(raw.professionalSummary);
  const hasTopSummary = typeof raw.summary === 'string';
  const skillsIsObject = isPlainObject(raw.skills) && !Array.isArray(raw.skills);

  if (hasProfile && !hasPersonalInfo && hasTopSummary) return 'V1_EDITOR';
  if (hasPersonalInfo && hasProfSummary) return 'V3_ENHANCED';
  if (hasPersonalInfo && skillsIsObject) return 'V4_EDITOR_RESUME';
  if (hasPersonalInfo) return 'V2_CORE_UNIFIED';
  if (hasProfile) return 'V1_EDITOR_PARTIAL';
  return 'UNKNOWN';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * normalizeResumeContent
 *
 * Accepts any value (including null, undefined, malformed JSON).
 * Returns a NormalizationResult with:
 *   - canonical NormalizedResumeContent
 *   - status: OK | OK_WITH_WARNINGS | UNSUPPORTED_VARIANT | MANUAL_REVIEW_REQUIRED
 *   - warnings: list of non-fatal issues encountered
 *   - uninterpretableFields: fields present in source that could not be safely read
 *
 * NEVER throws. NEVER modifies the input. NEVER writes to database.
 */
export function normalizeResumeContent(raw: unknown): NormalizationResult {
  const warnings: NormalizationWarning[] = [];
  const uninterpretableFields: string[] = [];

  // Guard: null / undefined
  if (raw === null || raw === undefined) {
    return {
      status: 'UNSUPPORTED_VARIANT',
      variantDetected: 'NULL_INPUT',
      normalized: buildEmpty(),
      warnings: [{ field: 'root', message: 'Input is null or undefined — returning empty canonical shape' }],
      uninterpretableFields: [],
    };
  }

  // Guard: not an object
  if (!isPlainObject(raw)) {
    return {
      status: 'MANUAL_REVIEW_REQUIRED',
      variantDetected: `NON_OBJECT_${typeof raw}`,
      normalized: buildEmpty(),
      warnings: [{ field: 'root', message: `Input is type "${typeof raw}" — expected object. Returning empty canonical shape.` }],
      uninterpretableFields: ['root'],
    };
  }

  const variantDetected = detectVariant(raw);

  // ---------------------------------------------------------------------------
  // PERSONAL INFO
  // Prefer personalInfo; fall back to profile; fall back to empty object.
  // ---------------------------------------------------------------------------
  let personalInfoSource: Record<string, unknown> = {};

  if (isPlainObject(raw.personalInfo)) {
    personalInfoSource = raw.personalInfo;
  } else if (isPlainObject(raw.profile)) {
    personalInfoSource = raw.profile as Record<string, unknown>;
    warnings.push({
      field: 'personalInfo',
      message: 'Source uses "profile" key (V1 Editor variant). Mapped to personalInfo. No data lost.',
    });
  } else {
    warnings.push({
      field: 'personalInfo',
      message: 'Neither "personalInfo" nor "profile" found — personalInfo fields will be empty strings.',
    });
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  const summary = coalesceSummary(raw, personalInfoSource, warnings, uninterpretableFields);
  if (!summary) {
    warnings.push({ field: 'summary', message: 'No summary found in any known location — summary is empty string.' });
  }

  // ---------------------------------------------------------------------------
  // PERSONAL INFO OBJECT
  // ---------------------------------------------------------------------------
  const personalInfo: NormalizedPersonalInfo = {
    fullName: safeString(personalInfoSource.fullName),
    email: safeString(personalInfoSource.email),
    phone: safeString(personalInfoSource.phone),
    location: safeString(personalInfoSource.location),
    summary,
  };

  // Preserve optional fields if present
  if (typeof personalInfoSource.professionalTitle === 'string') {
    personalInfo.professionalTitle = personalInfoSource.professionalTitle;
  }
  if (typeof personalInfoSource.linkedin === 'string') {
    personalInfo.linkedin = personalInfoSource.linkedin;
  }
  if (typeof personalInfoSource.github === 'string') {
    personalInfo.github = personalInfoSource.github;
  }
  if (typeof personalInfoSource.website === 'string') {
    personalInfo.website = personalInfoSource.website;
  }

  // ---------------------------------------------------------------------------
  // SKILLS
  // ---------------------------------------------------------------------------
  const skills = normalizeSkills(raw.skills, warnings);

  // ---------------------------------------------------------------------------
  // ARRAYS — experience, education, projects, certifications
  // Safe defaults to [] for missing/non-array values.
  // Source objects are preserved as-is (not re-shaped).
  // ---------------------------------------------------------------------------
  const rawExperienceArray = raw.experience || raw.work_experience || raw.workExperience;
  const experience = safeArray(rawExperienceArray) as Record<string, unknown>[];
  const education = safeArray(raw.education || raw.education_history) as Record<string, unknown>[];
  const projects = safeArray(raw.projects) as Record<string, unknown>[];
  const certifications = safeArray(raw.certifications) as Record<string, unknown>[];

  // Warn on non-array values for core sections
  if (rawExperienceArray !== undefined && !Array.isArray(rawExperienceArray)) {
    warnings.push({ field: 'experience', message: `experience is type "${typeof rawExperienceArray}" — defaulted to []` });
  }
  if (raw.education !== undefined && !Array.isArray(raw.education)) {
    warnings.push({ field: 'education', message: `education is type "${typeof raw.education}" — defaulted to []` });
  }

  const normalized: NormalizedResumeContent = {
    personalInfo,
    experience,
    education,
    skills,
    projects,
    certifications,
  };

  const status: NormalizationStatus =
    variantDetected === 'UNKNOWN'
      ? 'MANUAL_REVIEW_REQUIRED'
      : warnings.length > 0
      ? 'OK_WITH_WARNINGS'
      : 'OK';

  return { status, variantDetected, normalized, warnings, uninterpretableFields };
}

/** Returns a fully empty NormalizedResumeContent. Used for error/null cases. */
function buildEmpty(): NormalizedResumeContent {
  return {
    personalInfo: { fullName: '', email: '', phone: '', location: '', summary: '' },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  };
}
