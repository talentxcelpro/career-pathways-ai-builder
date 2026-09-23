/**
 * TalentXcel Global Experience Level Registry
 * 8-tier system: FRESHER through 8_PLUS_YEARS.
 * Includes isFresherEligible() helper and Schema.org mapping.
 */

export type ExperienceLevelCode =
  | 'FRESHER' | 'ENTRY_LEVEL' | '0_1_YEARS' | '1_2_YEARS'
  | '2_3_YEARS' | '3_5_YEARS' | '5_8_YEARS' | '8_PLUS_YEARS';

export interface ExperienceLevelConfig {
  code: ExperienceLevelCode;
  label: string;
  shortLabel: string;
  minYears: number;
  maxYears: number | null;
  /** Schema.org OccupationalExperienceRequirements monthsOfExperience. null = omit (Fresher) */
  schemaMonthsOfExperience: number | null;
  isFresherTier: boolean;
  badgeColor: 'emerald' | 'green' | 'blue' | 'indigo' | 'violet' | 'orange' | 'red' | 'gray';
  description: string;
  dbAliases: string[];
}

export const EXPERIENCE_LEVELS: readonly ExperienceLevelConfig[] = [
  {
    code: 'FRESHER', label: 'Fresher / No Experience', shortLabel: 'Fresher',
    minYears: 0, maxYears: 0, schemaMonthsOfExperience: null, isFresherTier: true,
    badgeColor: 'emerald', description: 'Recently graduated or no prior work experience required',
    dbAliases: ['fresher', 'fresh', 'freshers', 'no experience', '0 years'],
  },
  {
    code: 'ENTRY_LEVEL', label: 'Entry Level (0–1 yr)', shortLabel: 'Entry Level',
    minYears: 0, maxYears: 1, schemaMonthsOfExperience: 0, isFresherTier: true,
    badgeColor: 'green', description: 'Entry-level positions open to freshers and up to 1 year experience',
    dbAliases: ['entry level', 'entry-level', 'junior', '0-1 years', '0 to 1 year'],
  },
  {
    code: '0_1_YEARS', label: '0–1 Year', shortLabel: '0–1 yr',
    minYears: 0, maxYears: 1, schemaMonthsOfExperience: 0, isFresherTier: true,
    badgeColor: 'green', description: 'Up to 1 year of experience — ideal for recent graduates',
    dbAliases: ['0-1', '0 - 1', 'less than 1 year'],
  },
  {
    code: '1_2_YEARS', label: '1–2 Years', shortLabel: '1–2 yrs',
    minYears: 1, maxYears: 2, schemaMonthsOfExperience: 12, isFresherTier: false,
    badgeColor: 'blue', description: '1 to 2 years of relevant work experience',
    dbAliases: ['1-2', '1 to 2', '1 year'],
  },
  {
    code: '2_3_YEARS', label: '2–3 Years', shortLabel: '2–3 yrs',
    minYears: 2, maxYears: 3, schemaMonthsOfExperience: 24, isFresherTier: false,
    badgeColor: 'indigo', description: '2 to 3 years of relevant work experience',
    dbAliases: ['2-3', '2 to 3', '2 years'],
  },
  {
    code: '3_5_YEARS', label: '3–5 Years', shortLabel: '3–5 yrs',
    minYears: 3, maxYears: 5, schemaMonthsOfExperience: 36, isFresherTier: false,
    badgeColor: 'violet', description: '3 to 5 years of experience — mid-level roles',
    dbAliases: ['3-5', '3 to 5', 'mid-level', 'mid level', '3 years', '5 years', 'intermediate'],
  },
  {
    code: '5_8_YEARS', label: '5–8 Years', shortLabel: '5–8 yrs',
    minYears: 5, maxYears: 8, schemaMonthsOfExperience: 60, isFresherTier: false,
    badgeColor: 'orange', description: '5 to 8 years of experience — senior-level roles',
    dbAliases: ['5-8', '5 to 8', 'senior', 'senior-level', 'senior level', '5+ years', '5 years'],
  },
  {
    code: '8_PLUS_YEARS', label: '8+ Years', shortLabel: '8+ yrs',
    minYears: 8, maxYears: null, schemaMonthsOfExperience: 96, isFresherTier: false,
    badgeColor: 'red', description: 'Over 8 years — leadership, architect, and executive roles',
    dbAliases: ['8+', '8 to 10', '10+', 'executive', 'lead', 'director', 'vp', 'head'],
  },
] as const;

export const EXPERIENCE_LEVEL_MAP: Readonly<Record<ExperienceLevelCode, ExperienceLevelConfig>> =
  Object.fromEntries(EXPERIENCE_LEVELS.map((e) => [e.code, e])) as Record<ExperienceLevelCode, ExperienceLevelConfig>;

export const FRESHER_ELIGIBLE_CODES: ExperienceLevelCode[] = EXPERIENCE_LEVELS
  .filter((e) => e.isFresherTier)
  .map((e) => e.code);

export function resolveExperienceLevel(raw?: string | null): ExperienceLevelConfig | null {
  if (!raw) return null;
  const normalized = raw.toLowerCase().trim();
  const byCode = EXPERIENCE_LEVEL_MAP[raw as ExperienceLevelCode];
  if (byCode) return byCode;
  for (const level of EXPERIENCE_LEVELS) {
    if (level.dbAliases.some((alias) => normalized === alias || normalized.startsWith(alias))) {
      return level;
    }
  }
  return null;
}

export function isFresherEligible(job: {
  experience_level?: string | null;
  experience_required?: string | null;
  years_of_experience?: string | number | null;
  is_fresher_eligible?: boolean | null;
}): boolean {
  if (job.is_fresher_eligible === true) return true;
  if (job.is_fresher_eligible === false) return false;
  const fields = [job.experience_level, job.experience_required, job.years_of_experience?.toString()];
  for (const field of fields) {
    const resolved = resolveExperienceLevel(field);
    if (resolved?.isFresherTier) return true;
  }
  return false;
}

export function buildExperienceRequirements(
  code: ExperienceLevelCode,
): { '@type': string; monthsOfExperience: number } | null {
  const cfg = EXPERIENCE_LEVEL_MAP[code];
  if (!cfg || cfg.schemaMonthsOfExperience === null) return null;
  return { '@type': 'OccupationalExperienceRequirements', monthsOfExperience: cfg.schemaMonthsOfExperience };
}
