// Auto-generated disposition map for legacy unmatched historical sitemap slugs (171 total: 28 live 200s, 45 301s, 98 410s)
// Rule: 0 impressions AND 0 inbound internal links => 410 Gone; otherwise 301 to verified 200 target (or keep 200 if live hub).

export const DEAD_410_JOB_SLUGS: ReadonlySet<string> = new Set([
  'customer-service-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india',
  'marketing-manager-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india',
  'customer-service-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
  'senior-devops-architect-acme-corp-bengaluru',
  'marketing-manager-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
  'analyst-trainee-your-company-1',
  'ajo-architect-your-company',
  'featured',
  'consultant',
  'doctor',
  'nurse',
  'pharmacist',
  'physiotherapist',
  'medical-technician',
  'healthcare-administrator',
  'dentist',
  'veterinarian',
  'psychologist',
  'radiologist',
  'mechanical-engineer',
  'civil-engineer',
  'electrical-engineer',
  'chemical-engineer',
  'aerospace-engineer',
  'environmental-engineer',
  'industrial-engineer',
  'petroleum-engineer',
  'nuclear-engineer',
  'investment-banker',
  'financial-planner',
  'portfolio-manager',
  'equity-research-analyst',
  'auditor',
  'tax-consultant',
  'treasury-analyst',
  'work-from-home',
  'hybrid',
  'freelance',
  'part-time',
  'full-time',
  'temporary',
  'permanent',
  'entry-level',
  'experienced',
  'senior-level',
  'mid-level',
  'team-lead',
  'technology',
  'healthcare',
  'education',
  'manufacturing',
  'construction',
  'agriculture',
  'logistics',
  'java',
  'javascript',
  'nodejs',
  'aws',
  'sql',
  'docker',
  'kubernetes',
  'tensorflow',
  'microsoft',
  'amazon',
  'apple',
  'tcs',
  'wipro',
  'accenture',
  'cognizant',
  'deloitte',
  'central-government',
  'state-government',
  'railway',
  'police',
  'defence',
  '0-3-lpa',
  '3-5-lpa',
  '5-10-lpa',
  '10-15-lpa',
  '15-20-lpa',
  '20-30-lpa',
  '30-50-lpa',
  '50-lpa-plus',
  'high-paying',
  'competitive-salary',
  'mnc',
  'unicorn',
  'fortune-500',
  'product-company',
  'service-company',
  'consulting',
  'non-profit',
  'visa-sponsorship',
  'ai-matching',
  'similar',
  'popular',
  'urgent',
  'immediate-joining',
  'mobile-developer',
  'digital-marketer',
  'government',
  'public-sector',
  'ssc',
  'upsc',
  'google',
  'infosys',
]);

export const UNMATCHED_301_JOB_SLUGS: Readonly<Record<string, string>> = {
  'marketing-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india': '/jobs/marketing-manager',
  'content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1': '/jobs/content-writer',
  'b2b-sales-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india': '/jobs',
  'sales-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india': '/jobs',
  'marketing-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1': '/jobs/marketing-manager',
  'b2b-sales-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1': '/jobs',
  'sales-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1': '/jobs',
  'content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india': '/jobs/content-writer',
  'software-developer': '/jobs/software-engineer',
  'search': '/jobs',
  'browse': '/jobs',
  'latest': '/jobs',
  'sales-manager': '/jobs',
  'biomedical-engineer': '/jobs',
  'chartered-accountant': '/jobs',
  'credit-analyst': '/jobs/financial-analyst',
  'kolkata': '/jobs/software-engineer/kolkata',
  'ahmedabad': '/jobs/software-engineer/ahmedabad',
  'gurgaon': '/jobs/software-engineer/gurugram',
  'contract': '/jobs',
  'internship': '/jobs/freshers',
  'fresher': '/jobs/freshers',
  'executive': '/jobs',
  'manager': '/jobs',
  'director': '/jobs',
  'associate': '/jobs',
  'finance': '/jobs/financial-analyst',
  'retail': '/jobs',
  'hospitality': '/jobs',
  'python': '/jobs/python-developer',
  'react': '/jobs/react-developer',
  'banking': '/jobs/banking-associate',
  'startup': '/jobs',
  'international': '/jobs',
  'recommendations': '/jobs',
  'trending': '/jobs',
};

export const KEEP_200_JOB_ROLE_SLUGS: readonly string[] = [
  'data-analyst', 'software-engineer', 'data-scientist', 'product-manager',
  'devops-engineer', 'ui-ux-designer', 'full-stack-developer', 'frontend-developer',
  'backend-developer', 'machine-learning-engineer', 'business-analyst', 'project-manager',
  'marketing-manager', 'hr-manager', 'financial-analyst', 'operations-manager',
  'content-writer', 'risk-analyst',
];

export const KEEP_200_JOB_CITY_SLUGS: readonly string[] = [
  'delhi', 'bangalore', 'pune', 'mumbai', 'hyderabad', 'chennai', 'noida',
];

export const KEEP_200_JOB_NOINDEX_APP_SLUGS: ReadonlySet<string> = new Set([
  'alerts', 'saved', 'applied',
]);

export const KEEP_200_JOB_SLUGS: readonly string[] = [
  ...KEEP_200_JOB_ROLE_SLUGS,
  ...KEEP_200_JOB_CITY_SLUGS,
  'remote',
  ...KEEP_200_JOB_NOINDEX_APP_SLUGS,
];

export const FLAGSHIP_ROUTES: readonly string[] = [
  '/resume/ats-check',
  '/salary/data-scientist',
  '/salary/ui-ux-designer',
  '/locations/varanasi',
  '/talent-score',
  '/career-map',
  '/resume/interview-prep/golang-developer',
];

export type LegacySlugDisposition =
  | { type: '410' }
  | { type: '301'; location: string };

export function resolveLegacyJobSlugDisposition(slug: string): LegacySlugDisposition | null {
  const clean = (slug || '').trim().toLowerCase();
  if (!clean) return null;
  if (DEAD_410_JOB_SLUGS.has(clean)) {
    return { type: '410' };
  }
  const target = UNMATCHED_301_JOB_SLUGS[clean];
  if (target) {
    return { type: '301', location: `https://talentxcel.in${target}` };
  }
  return null;
}
