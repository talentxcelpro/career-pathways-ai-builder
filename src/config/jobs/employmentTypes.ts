/**
 * TalentXcel Employment Type Registry
 * Maps internal codes to labels and Google Schema.org employmentType values.
 */

export type EmploymentTypeCode =
  | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY'
  | 'INTERNSHIP' | 'APPRENTICESHIP' | 'VOLUNTEER' | 'FREELANCE'
  | 'GIG' | 'SEASONAL';

export interface EmploymentTypeConfig {
  code: EmploymentTypeCode;
  label: string;
  shortLabel: string;
  schemaValues: string[];
  description: string;
  fresherEligible: boolean;
  badgeColor: 'blue' | 'green' | 'orange' | 'purple' | 'gray' | 'teal';
}

export const EMPLOYMENT_TYPES: readonly EmploymentTypeConfig[] = [
  { code: 'FULL_TIME', label: 'Full-Time', shortLabel: 'Full-Time', schemaValues: ['FULL_TIME'], description: 'Standard full-time employment, typically 40+ hrs/week', fresherEligible: true, badgeColor: 'blue' },
  { code: 'PART_TIME', label: 'Part-Time', shortLabel: 'Part-Time', schemaValues: ['PART_TIME'], description: 'Part-time employment, fewer than 30 hrs/week', fresherEligible: true, badgeColor: 'green' },
  { code: 'CONTRACT', label: 'Contract / Contractual', shortLabel: 'Contract', schemaValues: ['CONTRACTOR'], description: 'Fixed-term or project-based contract engagement', fresherEligible: true, badgeColor: 'orange' },
  { code: 'TEMPORARY', label: 'Temporary', shortLabel: 'Temp', schemaValues: ['TEMPORARY'], description: 'Short-term role with a defined end date', fresherEligible: true, badgeColor: 'gray' },
  { code: 'INTERNSHIP', label: 'Internship', shortLabel: 'Intern', schemaValues: ['INTERN'], description: 'Structured internship programme, paid or stipend-based', fresherEligible: true, badgeColor: 'purple' },
  { code: 'APPRENTICESHIP', label: 'Apprenticeship', shortLabel: 'Apprentice', schemaValues: ['INTERN'], description: 'Apprenticeship or vocational training programme', fresherEligible: true, badgeColor: 'teal' },
  { code: 'VOLUNTEER', label: 'Volunteer', shortLabel: 'Volunteer', schemaValues: ['VOLUNTEER'], description: 'Unpaid volunteer opportunity', fresherEligible: true, badgeColor: 'green' },
  { code: 'FREELANCE', label: 'Freelance', shortLabel: 'Freelance', schemaValues: ['CONTRACTOR', 'PART_TIME'], description: 'Independent freelance or consulting engagement', fresherEligible: false, badgeColor: 'orange' },
  { code: 'GIG', label: 'Gig / On-demand', shortLabel: 'Gig', schemaValues: ['TEMPORARY', 'CONTRACTOR'], description: 'Short gig or on-demand work opportunity', fresherEligible: true, badgeColor: 'gray' },
  { code: 'SEASONAL', label: 'Seasonal', shortLabel: 'Seasonal', schemaValues: ['TEMPORARY'], description: 'Employment tied to a specific season or period', fresherEligible: true, badgeColor: 'orange' },
] as const;

export const EMPLOYMENT_TYPE_MAP: Readonly<Record<EmploymentTypeCode, EmploymentTypeConfig>> =
  Object.fromEntries(EMPLOYMENT_TYPES.map((t) => [t.code, t])) as Record<EmploymentTypeCode, EmploymentTypeConfig>;

export function getSchemaEmploymentType(code: string): string[] {
  const cfg = EMPLOYMENT_TYPE_MAP[code as EmploymentTypeCode];
  return cfg?.schemaValues ?? ['FULL_TIME'];
}

// Workplace types
export type WorkplaceTypeCode = 'ON_SITE' | 'HYBRID' | 'REMOTE';

export interface WorkplaceTypeConfig {
  code: WorkplaceTypeCode;
  label: string;
  icon: string;
  description: string;
}

export const WORKPLACE_TYPES: readonly WorkplaceTypeConfig[] = [
  { code: 'ON_SITE', label: 'On-Site / In-Office', icon: '🏢', description: 'Work performed at employer physical location' },
  { code: 'HYBRID', label: 'Hybrid', icon: '🔄', description: 'Mix of on-site and remote work' },
  { code: 'REMOTE', label: 'Remote / Work from Home', icon: '🏠', description: 'Fully remote — work from anywhere within scope' },
] as const;

// Remote scope
export type RemoteScopeCode = 'LOCAL' | 'REGION' | 'COUNTRY' | 'GLOBAL';

export interface RemoteScopeConfig {
  code: RemoteScopeCode;
  label: string;
  schemaType: string;
  description: string;
}

export const REMOTE_SCOPES: readonly RemoteScopeConfig[] = [
  { code: 'LOCAL', label: 'City / Local Area', schemaType: 'City', description: 'Must be in a specific city or local area' },
  { code: 'REGION', label: 'State / Province', schemaType: 'AdministrativeArea', description: 'Must be in a specific state or region' },
  { code: 'COUNTRY', label: 'Country-wide', schemaType: 'Country', description: 'Open to candidates anywhere within the country' },
  { code: 'GLOBAL', label: 'Global / Worldwide', schemaType: 'Country', description: 'Open to candidates from any country worldwide' },
] as const;

export const REMOTE_SCOPE_MAP: Readonly<Record<RemoteScopeCode, RemoteScopeConfig>> =
  Object.fromEntries(REMOTE_SCOPES.map((s) => [s.code, s])) as Record<RemoteScopeCode, RemoteScopeConfig>;

export function isRemoteJob(workplaceType?: string): boolean {
  return workplaceType === 'REMOTE' || workplaceType === 'HYBRID';
}
