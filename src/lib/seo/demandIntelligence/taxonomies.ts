// src/lib/seo/demandIntelligence/taxonomies.ts
// Unified Global Job-Title, Skill, 30-Industry, Geographic, and Compliant Platform Vocabularies.
// Extends CANONICAL_20_INDUSTRIES, JOB_ROLES, GLOBAL_COUNTRIES without duplicating existing catalogs.

import { CANONICAL_20_INDUSTRIES } from '../../../config/jobs/industryTaxonomy';
import { JOB_ROLES } from '../../../config/jobs/roles';
import { GLOBAL_COUNTRIES } from '../../../config/jobs/countriesData';
import type { EmploymentTypeTag, SeniorityTag, WorkModeTag } from './types';

export interface RoleTaxonomyEntry {
  slug: string;
  canonicalName: string;
  aliases: string[];
  industrySlug: string;
  coreSkills: string[];
  regionalVariants: string[];
}

export interface IndustryTaxonomyEntry {
  slug: string;
  name: string;
  subcategories: string[];
  keywords: string[];
}

export interface GeoHubEntry {
  slug: string;
  name: string;
  countryCode: string;
  countryName: string;
  regionTier: 'COUNTRY' | 'METRO' | 'CITY' | 'REMOTE';
  aliases: string[];
}

// 1. 30 Major Industries (extends CANONICAL_20_INDUSTRIES with remaining required Phase 4C categories)
const SUPPLEMENTAL_10_INDUSTRIES: IndustryTaxonomyEntry[] = [
  { slug: 'software', name: 'Software', subcategories: ['SaaS', 'Enterprise Software', 'Developer Tools', 'Cloud Platforms'], keywords: ['software', 'saas', 'application development'] },
  { slug: 'banking', name: 'Banking', subcategories: ['Retail Banking', 'Investment Banking', 'Corporate Banking', 'Payments'], keywords: ['banking', 'banker', 'wealth management', 'treasury'] },
  { slug: 'accounting', name: 'Accounting', subcategories: ['Audit', 'Taxation', 'Bookkeeping', 'Chartered Accountancy'], keywords: ['accounting', 'accountant', 'audit', 'tax', 'cpa', 'chartered accountant'] },
  { slug: 'consulting', name: 'Consulting', subcategories: ['Management Consulting', 'Strategy', 'IT Advisory', 'HR Advisory'], keywords: ['consulting', 'consultant', 'advisory', 'strategy'] },
  { slug: 'automotive', name: 'Automotive', subcategories: ['Electric Vehicles', 'Autonomous Driving', 'Auto Components'], keywords: ['automotive', 'vehicle', 'ev', 'automobile'] },
  { slug: 'pharmaceuticals', name: 'Pharmaceuticals', subcategories: ['Clinical Research', 'Regulatory Affairs', 'Pharma R&D'], keywords: ['pharma', 'pharmaceutical', 'clinical trial', 'pharmacovigilance'] },
  { slug: 'biotechnology', name: 'Biotechnology', subcategories: ['Genomics', 'Bioinformatics', 'Bioprocessing'], keywords: ['biotech', 'biotechnology', 'bioinformatics', 'life sciences'] },
  { slug: 'agriculture', name: 'Agriculture', subcategories: ['AgriTech', 'Food Production', 'Agronomy'], keywords: ['agriculture', 'agritech', 'farming', 'agronomy'] },
  { slug: 'nonprofit', name: 'Nonprofit', subcategories: ['NGO', 'Social Impact', 'Public Policy'], keywords: ['nonprofit', 'ngo', 'social sector', 'charity'] },
  { slug: 'travel', name: 'Travel', subcategories: ['Tourism', 'Aviation', 'Hospitality Tech'], keywords: ['travel', 'tourism', 'aviation', 'airline'] },
  { slug: 'cybersecurity', name: 'Cybersecurity', subcategories: ['AppSec', 'SOC Operations', 'Cloud Security', 'GRC'], keywords: ['cybersecurity', 'infosec', 'soc analyst', 'penetration testing'] },
  { slug: 'data-and-ai', name: 'Data and AI', subcategories: ['Machine Learning', 'Generative AI', 'Data Engineering', 'Analytics'], keywords: ['artificial intelligence', 'machine learning', 'data science', 'llm', 'genai'] },
];

export const UNIFIED_30_INDUSTRIES: IndustryTaxonomyEntry[] = (() => {
  const map = new Map<string, IndustryTaxonomyEntry>();
  for (const ind of CANONICAL_20_INDUSTRIES) {
    map.set(ind.slug, {
      slug: ind.slug,
      name: ind.name,
      subcategories: (ind.subindustries || []).map((s) => s.name),
      keywords: [
        ind.name.toLowerCase(),
        ind.slug.replace(/-/g, ' '),
        ...(ind.entityKeywords || []).map((a) => a.toLowerCase()),
      ],
    });
  }
  for (const sup of SUPPLEMENTAL_10_INDUSTRIES) {
    if (!map.has(sup.slug)) {
      map.set(sup.slug, sup);
    }
  }
  return Array.from(map.values());
})();

// 2. Role Taxonomy: merges existing JOB_ROLES with core global occupational archetypes
const SUPPLEMENTAL_ROLES: RoleTaxonomyEntry[] = [
  { slug: 'software-engineer', canonicalName: 'Software Engineer', aliases: ['sde', 'swe', 'software developer', 'developer', 'programmer', 'coder'], industrySlug: 'software', coreSkills: ['python', 'java', 'typescript', 'sql', 'git'], regionalVariants: ['graduate software engineer', 'fresher software developer'] },
  { slug: 'full-stack-developer', canonicalName: 'Full Stack Developer', aliases: ['full stack engineer', 'mern developer', 'mean developer'], industrySlug: 'software', coreSkills: ['react', 'node.js', 'typescript', 'postgresql'], regionalVariants: ['junior full stack developer'] },
  { slug: 'frontend-developer', canonicalName: 'Frontend Developer', aliases: ['front end developer', 'frontend engineer', 'ui developer', 'react developer'], industrySlug: 'software', coreSkills: ['react', 'typescript', 'css', 'nextjs'], regionalVariants: ['fresher frontend developer'] },
  { slug: 'backend-developer', canonicalName: 'Backend Developer', aliases: ['back end developer', 'backend engineer', 'api developer'], industrySlug: 'software', coreSkills: ['node.js', 'python', 'java', 'go', 'sql'], regionalVariants: ['junior backend engineer'] },
  { slug: 'data-analyst', canonicalName: 'Data Analyst', aliases: ['business data analyst', 'bi analyst', 'mis analyst'], industrySlug: 'data-and-ai', coreSkills: ['sql', 'excel', 'power bi', 'tableau', 'python'], regionalVariants: ['fresher data analyst', 'entry level data analyst'] },
  { slug: 'data-scientist', canonicalName: 'Data Scientist', aliases: ['applied scientist', 'ml scientist', 'quantitative analyst'], industrySlug: 'data-and-ai', coreSkills: ['python', 'machine learning', 'statistics', 'sql'], regionalVariants: ['junior data scientist'] },
  { slug: 'ai-engineer', canonicalName: 'AI Engineer', aliases: ['machine learning engineer', 'ml engineer', 'genai engineer', 'llm engineer'], industrySlug: 'data-and-ai', coreSkills: ['python', 'pytorch', 'llm', 'rag', 'mlops'], regionalVariants: ['associate ai engineer'] },
  { slug: 'product-manager', canonicalName: 'Product Manager', aliases: ['apm', 'associate product manager', 'technical product manager'], industrySlug: 'software', coreSkills: ['product strategy', 'sql', 'analytics', 'roadmapping'], regionalVariants: ['associate product manager'] },
  { slug: 'project-manager', canonicalName: 'Project Manager', aliases: ['program manager', 'scrum master', 'delivery manager'], industrySlug: 'consulting', coreSkills: ['agile', 'jira', 'scrum', 'pmp'], regionalVariants: ['assistant project manager'] },
  { slug: 'recruiter', canonicalName: 'Recruiter', aliases: ['talent acquisition', 'talent acquisition specialist', 'technical recruiter', 'hr recruiter', 'hr', 'human resources', 'hr manager', 'hr generalist'], industrySlug: 'human-resources-recruitment', coreSkills: ['sourcing', 'ats', 'interviewing', 'employer branding'], regionalVariants: ['hr recruiter fresher', 'campus recruiter'] },
  { slug: 'accountant', canonicalName: 'Accountant', aliases: ['chartered accountant', 'accounts executive', 'tax accountant', 'audit associate'], industrySlug: 'accounting', coreSkills: ['tally', 'gst', 'ifrs', 'excel', 'audit'], regionalVariants: ['accounts executive fresher', 'graduate accountant'] },
  { slug: 'nurse', canonicalName: 'Nurse', aliases: ['registered nurse', 'staff nurse', 'clinical nurse', 'nursing officer'], industrySlug: 'healthcare', coreSkills: ['patient care', 'clinical nursing', 'icu'], regionalVariants: ['staff nurse fresher', 'bsc nursing jobs'] },
  { slug: 'teacher', canonicalName: 'Teacher', aliases: ['educator', 'lecturer', 'professor', 'tutor', 'faculty'], industrySlug: 'education', coreSkills: ['curriculum design', 'pedagogy', 'classroom management'], regionalVariants: ['prt teacher', 'tgt teacher', 'assistant professor'] },
  { slug: 'marketing-manager', canonicalName: 'Marketing Manager', aliases: ['digital marketing', 'seo specialist', 'growth marketer', 'performance marketer', 'marketing'], industrySlug: 'media', coreSkills: ['seo', 'sem', 'google analytics', 'content marketing'], regionalVariants: ['digital marketing executive', 'seo executive'] },
  { slug: 'sales-executive', canonicalName: 'Sales Executive', aliases: ['business development', 'account executive', 'bdr', 'sdr', 'sales manager', 'sales'], industrySlug: 'retail', coreSkills: ['crm', 'b2b sales', 'negotiation', 'salesforce'], regionalVariants: ['business development executive', 'bdm'] },
  { slug: 'operations-manager', canonicalName: 'Operations Manager', aliases: ['operations executive', 'supply chain manager', 'logistics coordinator'], industrySlug: 'logistics', coreSkills: ['operations', 'supply chain', 'six sigma', 'erp'], regionalVariants: ['operations executive fresher'] },
  { slug: 'cybersecurity-analyst', canonicalName: 'Cybersecurity Analyst', aliases: ['security engineer', 'soc analyst', 'information security', 'cybersecurity'], industrySlug: 'cybersecurity', coreSkills: ['siem', 'network security', 'owasp', 'cloud security'], regionalVariants: ['junior soc analyst'] },
  { slug: 'devops-engineer', canonicalName: 'DevOps Engineer', aliases: ['devops', 'cloud engineer', 'site reliability engineer', 'sre', 'platform engineer'], industrySlug: 'software', coreSkills: ['aws', 'kubernetes', 'docker', 'terraform', 'linux'], regionalVariants: ['cloud support associate'] },
  { slug: 'ui-ux-designer', canonicalName: 'UI UX Designer', aliases: ['designer', 'product designer', 'ux designer', 'ui designer', 'graphic designer'], industrySlug: 'software', coreSkills: ['figma', 'wireframing', 'user research', 'prototyping'], regionalVariants: ['junior ui ux designer'] },
  { slug: 'financial-analyst', canonicalName: 'Financial Analyst', aliases: ['finance analyst', 'investment analyst', 'equity analyst', 'credit analyst'], industrySlug: 'banking', coreSkills: ['financial modeling', 'excel', 'valuation', 'sql'], regionalVariants: ['finance graduate', 'fresher financial analyst'] },
];

const ROLE_CATEGORY_TO_INDUSTRY: Record<string, string> = {
  'Engineering & Tech': 'software',
  'Data & AI': 'data-and-ai',
  'Product & Design': 'software',
  'Marketing & Growth': 'media',
  'Sales & Business': 'retail',
  'Operations & Finance': 'accounting',
};

export const UNIFIED_ROLE_TAXONOMY: RoleTaxonomyEntry[] = (() => {
  const bySlug = new Map<string, RoleTaxonomyEntry>();
  for (const r of JOB_ROLES) {
    bySlug.set(r.slug, {
      slug: r.slug,
      canonicalName: r.title,
      aliases: (r.synonyms || []).map((a) => a.toLowerCase()),
      industrySlug: ROLE_CATEGORY_TO_INDUSTRY[r.category] || 'software',
      coreSkills: r.skills || [],
      regionalVariants: [],
    });
  }
  for (const sup of SUPPLEMENTAL_ROLES) {
    const existing = bySlug.get(sup.slug);
    if (existing) {
      existing.aliases = Array.from(new Set([...existing.aliases, ...sup.aliases]));
      existing.coreSkills = Array.from(new Set([...existing.coreSkills, ...sup.coreSkills]));
      existing.regionalVariants = sup.regionalVariants;
    } else {
      bySlug.set(sup.slug, sup);
    }
  }
  return Array.from(bySlug.values());
})();

// 3. Skill Intelligence Catalog (Skills, Tech, Certifications, Tools, Frameworks, Competencies)
export const GLOBAL_SKILLS_CATALOG: Array<{ slug: string; name: string; category: string; aliases: string[] }> = [
  { slug: 'python', name: 'Python', category: 'programming', aliases: ['python', 'django', 'fastapi', 'flask'] },
  { slug: 'java', name: 'Java', category: 'programming', aliases: ['java', 'spring boot', 'spring', 'j2ee'] },
  { slug: 'javascript', name: 'JavaScript', category: 'programming', aliases: ['javascript', 'js', 'es6'] },
  { slug: 'typescript', name: 'TypeScript', category: 'programming', aliases: ['typescript', 'ts'] },
  { slug: 'react', name: 'React', category: 'framework', aliases: ['react', 'reactjs', 'react.js', 'nextjs', 'next.js'] },
  { slug: 'node-js', name: 'Node.js', category: 'framework', aliases: ['node', 'nodejs', 'node.js', 'express'] },
  { slug: 'sql', name: 'SQL', category: 'data', aliases: ['sql', 'mysql', 'postgresql', 'postgres', 'pl/sql', 'tsql'] },
  { slug: 'aws', name: 'AWS', category: 'cloud', aliases: ['aws', 'amazon web services', 'azure', 'gcp', 'google cloud'] },
  { slug: 'docker', name: 'Docker & Kubernetes', category: 'devops', aliases: ['docker', 'kubernetes', 'k8s', 'terraform', 'ci cd'] },
  { slug: 'cybersecurity', name: 'Cybersecurity', category: 'security', aliases: ['cybersecurity', 'cyber security', 'infosec', 'soc', 'cissp', 'ceh'] },
  { slug: 'artificial-intelligence', name: 'Artificial Intelligence', category: 'ai', aliases: ['ai', 'artificial intelligence', 'genai', 'llm', 'prompt engineering'] },
  { slug: 'machine-learning', name: 'Machine Learning', category: 'ai', aliases: ['machine learning', 'ml', 'deep learning', 'pytorch', 'tensorflow'] },
  { slug: 'data-analytics', name: 'Data Analytics', category: 'analytics', aliases: ['data analytics', 'data analysis', 'power bi', 'tableau', 'excel'] },
  { slug: 'project-management', name: 'Project Management', category: 'management', aliases: ['project management', 'pmp', 'agile', 'scrum', 'jira'] },
  { slug: 'salesforce', name: 'Salesforce & SAP', category: 'enterprise', aliases: ['salesforce', 'sap', 'erp', 'workday', 'crm'] },
  { slug: 'digital-marketing', name: 'Digital Marketing & SEO', category: 'marketing', aliases: ['seo', 'digital marketing', 'performance marketing', 'sem', 'google ads'] },
  { slug: 'figma', name: 'Figma & UI/UX', category: 'design', aliases: ['figma', 'ui ux', 'ux research', 'adobe xd'] },
  { slug: 'finance-accounting', name: 'Financial Modeling & Tally', category: 'finance', aliases: ['tally', 'gst', 'financial modeling', 'ifrs', 'cfa', 'cpa'] },
  { slug: 'ats-optimization', name: 'ATS Resume Optimization', category: 'career-readiness', aliases: ['ats', 'resume', 'cv', 'talent score', 'career passport', 'interview'] },
];

// 4. Global Geographic Normalization Registry (Indian hubs + Global cities + Country codes)
const AMBIGUOUS_2LETTER_COUNTRY_CODES = new Set([
  'in', 'at', 'by', 'to', 'of', 'for', 'on', 'it', 'is', 'id', 'as', 'am', 'an', 'or',
  'no', 'so', 'do', 'me', 'my', 'he', 'we', 'be', 'go', 'us', 'la', 'de', 'et', 'ai', 'hr',
]);

export const GLOBAL_GEO_HUBS: GeoHubEntry[] = (() => {
  const hubs: GeoHubEntry[] = [
    { slug: 'india', name: 'India', countryCode: 'IN', countryName: 'India', regionTier: 'COUNTRY', aliases: ['india', 'bharat', 'ind'] },
    { slug: 'united-states', name: 'United States', countryCode: 'US', countryName: 'United States', regionTier: 'COUNTRY', aliases: ['usa', 'united states', 'america', 'u.s.'] },
    { slug: 'united-kingdom', name: 'United Kingdom', countryCode: 'GB', countryName: 'United Kingdom', regionTier: 'COUNTRY', aliases: ['uk', 'united kingdom', 'britain', 'england'] },
    { slug: 'canada', name: 'Canada', countryCode: 'CA', countryName: 'Canada', regionTier: 'COUNTRY', aliases: ['canada'] },
    { slug: 'australia', name: 'Australia', countryCode: 'AU', countryName: 'Australia', regionTier: 'COUNTRY', aliases: ['australia'] },
    { slug: 'germany', name: 'Germany', countryCode: 'DE', countryName: 'Germany', regionTier: 'COUNTRY', aliases: ['germany', 'deutschland'] },
    { slug: 'united-arab-emirates', name: 'UAE', countryCode: 'AE', countryName: 'United Arab Emirates', regionTier: 'COUNTRY', aliases: ['uae', 'united arab emirates', 'emirates'] },
    { slug: 'singapore', name: 'Singapore', countryCode: 'SG', countryName: 'Singapore', regionTier: 'COUNTRY', aliases: ['singapore'] },
    { slug: 'saudi-arabia', name: 'Saudi Arabia', countryCode: 'SA', countryName: 'Saudi Arabia', regionTier: 'COUNTRY', aliases: ['saudi arabia', 'ksa'] },
    { slug: 'netherlands', name: 'Netherlands', countryCode: 'NL', countryName: 'Netherlands', regionTier: 'COUNTRY', aliases: ['netherlands', 'holland'] },
    { slug: 'france', name: 'France', countryCode: 'FR', countryName: 'France', regionTier: 'COUNTRY', aliases: ['france'] },
    { slug: 'ireland', name: 'Ireland', countryCode: 'IE', countryName: 'Ireland', regionTier: 'COUNTRY', aliases: ['ireland'] },
    { slug: 'bangalore', name: 'Bengaluru', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['bangalore', 'bengaluru', 'blr'] },
    { slug: 'hyderabad', name: 'Hyderabad', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['hyderabad', 'hyd'] },
    { slug: 'pune', name: 'Pune', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['pune'] },
    { slug: 'mumbai', name: 'Mumbai', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['mumbai', 'bombay', 'navi mumbai'] },
    { slug: 'delhi-ncr', name: 'Delhi NCR', countryCode: 'IN', countryName: 'India', regionTier: 'METRO', aliases: ['delhi', 'new delhi', 'delhi ncr', 'ncr'] },
    { slug: 'gurgaon', name: 'Gurugram', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['gurgaon', 'gurugram'] },
    { slug: 'noida', name: 'Noida', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['noida', 'greater noida'] },
    { slug: 'chennai', name: 'Chennai', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['chennai', 'madras'] },
    { slug: 'kolkata', name: 'Kolkata', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['kolkata', 'calcutta'] },
    { slug: 'ahmedabad', name: 'Ahmedabad', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['ahmedabad'] },
    { slug: 'jaipur', name: 'Jaipur', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['jaipur'] },
    { slug: 'kochi', name: 'Kochi', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['kochi', 'cochin'] },
    { slug: 'chandigarh', name: 'Chandigarh', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['chandigarh'] },
    { slug: 'indore', name: 'Indore', countryCode: 'IN', countryName: 'India', regionTier: 'CITY', aliases: ['indore'] },
    { slug: 'dubai', name: 'Dubai', countryCode: 'AE', countryName: 'United Arab Emirates', regionTier: 'CITY', aliases: ['dubai'] },
    { slug: 'abu-dhabi', name: 'Abu Dhabi', countryCode: 'AE', countryName: 'United Arab Emirates', regionTier: 'CITY', aliases: ['abu dhabi'] },
    { slug: 'london', name: 'London', countryCode: 'GB', countryName: 'United Kingdom', regionTier: 'CITY', aliases: ['london'] },
    { slug: 'manchester', name: 'Manchester', countryCode: 'GB', countryName: 'United Kingdom', regionTier: 'CITY', aliases: ['manchester'] },
    { slug: 'new-york', name: 'New York', countryCode: 'US', countryName: 'United States', regionTier: 'CITY', aliases: ['new york', 'nyc'] },
    { slug: 'san-francisco', name: 'San Francisco', countryCode: 'US', countryName: 'United States', regionTier: 'CITY', aliases: ['san francisco', 'bay area'] },
    { slug: 'austin', name: 'Austin', countryCode: 'US', countryName: 'United States', regionTier: 'CITY', aliases: ['austin'] },
    { slug: 'seattle', name: 'Seattle', countryCode: 'US', countryName: 'United States', regionTier: 'CITY', aliases: ['seattle'] },
    { slug: 'toronto', name: 'Toronto', countryCode: 'CA', countryName: 'Canada', regionTier: 'CITY', aliases: ['toronto'] },
    { slug: 'sydney', name: 'Sydney', countryCode: 'AU', countryName: 'Australia', regionTier: 'CITY', aliases: ['sydney'] },
    { slug: 'melbourne', name: 'Melbourne', countryCode: 'AU', countryName: 'Australia', regionTier: 'CITY', aliases: ['melbourne'] },
    { slug: 'berlin', name: 'Berlin', countryCode: 'DE', countryName: 'Germany', regionTier: 'CITY', aliases: ['berlin', 'munich'] },
    { slug: 'remote', name: 'Remote', countryCode: 'GLB', countryName: 'Global', regionTier: 'REMOTE', aliases: ['remote', 'work from home', 'worldwide'] },
  ];

  const existingCountryCodes = new Set(hubs.filter((h) => h.regionTier === 'COUNTRY').map((h) => h.countryCode.toUpperCase()));
  for (const c of GLOBAL_COUNTRIES) {
    const codeUpper = c.code.toUpperCase();
    if (!existingCountryCodes.has(codeUpper)) {
      const generatedSlug = c.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
      const codeLower = c.code.toLowerCase();
      const aliases = [c.name.toLowerCase()];
      if (!AMBIGUOUS_2LETTER_COUNTRY_CODES.has(codeLower)) aliases.push(codeLower);
      if (c.codeAlpha3 && !AMBIGUOUS_2LETTER_COUNTRY_CODES.has(c.codeAlpha3.toLowerCase())) {
        aliases.push(c.codeAlpha3.toLowerCase());
      }
      hubs.push({
        slug: generatedSlug,
        name: c.name,
        countryCode: codeUpper,
        countryName: c.name,
        regionTier: 'COUNTRY',
        aliases,
      });
    }
  }
  return hubs;
})();

// 5. Seniority, Work Mode & Employment Type Modifier Dictionaries
export const SENIORITY_MODIFIERS: Array<{ tag: SeniorityTag; terms: string[] }> = [
  { tag: 'intern', terms: ['intern', 'internship', 'summer intern'] },
  { tag: 'fresher', terms: ['fresher', 'freshers'] },
  { tag: 'graduate', terms: ['graduate', 'grad', 'new grad', 'fresh graduate'] },
  { tag: 'trainee', terms: ['trainee', 'management trainee', 'apprentice'] },
  { tag: 'entry_level', terms: ['entry level', 'entry-level', 'no experience', '0 years experience'] },
  { tag: 'junior', terms: ['junior', 'jr'] },
  { tag: 'associate', terms: ['associate'] },
  { tag: 'senior', terms: ['senior', 'sr', 'experienced'] },
  { tag: 'lead', terms: ['lead', 'team lead', 'tech lead'] },
  { tag: 'principal', terms: ['principal', 'staff engineer', 'architect'] },
  { tag: 'manager', terms: ['manager', 'head of'] },
  { tag: 'director', terms: ['director', 'vp', 'vice president'] },
  { tag: 'executive', terms: ['executive', 'cxo', 'cto', 'ceo', 'cfo'] },
];

export const WORK_MODE_MODIFIERS: Array<{ tag: WorkModeTag; terms: string[] }> = [
  { tag: 'remote', terms: ['remote', 'work from home', 'work remotely', 'telecommute'] },
  { tag: 'hybrid', terms: ['hybrid'] },
  { tag: 'onsite', terms: ['onsite', 'on-site', 'walk in', 'walk-in', 'in office'] },
];

export const EMPLOYMENT_TYPE_MODIFIERS: Array<{ tag: EmploymentTypeTag; terms: string[] }> = [
  { tag: 'internship', terms: ['internship', 'intern'] },
  { tag: 'part_time', terms: ['part time', 'weekend'] },
  { tag: 'contract', terms: ['contract', 'contractor', 'temp'] },
  { tag: 'freelance', terms: ['freelance', 'freelancer', 'gig'] },
  { tag: 'full_time', terms: ['full time', 'permanent', 'regular'] },
];

// 6. Compliant Platform-Inspired Discovery Taxonomies (Phase 5)
// Explicitly marked as compliant taxonomy inspiration — never scraped or proprietary copies.
export interface PlatformInspiredCandidate {
  keyword: string;
  source: string;
  sourceType:
    | 'TAXONOMY_EXPANSION_LINKEDIN_INSPIRED'
    | 'TAXONOMY_EXPANSION_NAUKRI_INSPIRED'
    | 'TAXONOMY_EXPANSION_INDEED_INSPIRED';
  rationale: string;
}

export function generateCompliantDiscoverySeeds(): PlatformInspiredCandidate[] {
  const seeds: PlatformInspiredCandidate[] = [];
  const coreRoles = UNIFIED_ROLE_TAXONOMY.slice(0, 20);
  const indiaHubs = ['bengaluru', 'hyderabad', 'pune', 'mumbai', 'noida', 'gurugram', 'chennai'];
  const globalHubs = ['london', 'dubai', 'new york', 'toronto', 'singapore'];

  // LinkedIn-inspired: professional titles, career transitions, verified credentials, hiring
  for (const r of coreRoles) {
    const roleName = r.canonicalName.toLowerCase();
    seeds.push(
      { keyword: `${roleName} career path`, source: 'linkedin_inspired_taxonomy', sourceType: 'TAXONOMY_EXPANSION_LINKEDIN_INSPIRED', rationale: 'Professional career transition intent -> /career-map & /passport' },
      { keyword: `${roleName} skills assessment`, source: 'linkedin_inspired_taxonomy', sourceType: 'TAXONOMY_EXPANSION_LINKEDIN_INSPIRED', rationale: 'Credential readiness -> /talent-score' },
      { keyword: `hire ${roleName}`, source: 'linkedin_inspired_taxonomy', sourceType: 'TAXONOMY_EXPANSION_LINKEDIN_INSPIRED', rationale: 'Recruiter B2B hiring intent -> /employer' },
      { keyword: `remote ${roleName} jobs`, source: 'linkedin_inspired_taxonomy', sourceType: 'TAXONOMY_EXPANSION_LINKEDIN_INSPIRED', rationale: 'Global remote discovery -> /jobs/remote' }
    );
  }

  // Naukri-inspired: India fresher/experience, city hubs, CTC/salary, ATS/resume, walk-in
  for (const r of coreRoles) {
    const roleName = r.canonicalName.toLowerCase();
    seeds.push(
      { keyword: `${roleName} jobs for freshers`, source: 'naukri_inspired_taxonomy', sourceType: 'TAXONOMY_EXPANSION_NAUKRI_INSPIRED', rationale: 'Indian fresher employment vocabulary' },
      { keyword: `${roleName} salary in india`, source: 'naukri_inspired_taxonomy', sourceType: 'TAXONOMY_EXPANSION_NAUKRI_INSPIRED', rationale: 'Indian CTC benchmark -> /salary' },
      { keyword: `${roleName} resume ats check`, source: 'naukri_inspired_taxonomy', sourceType: 'TAXONOMY_EXPANSION_NAUKRI_INSPIRED', rationale: 'Resume readiness -> /resume/ats-check' },
      { keyword: `${roleName} interview questions india`, source: 'naukri_inspired_taxonomy', sourceType: 'TAXONOMY_EXPANSION_NAUKRI_INSPIRED', rationale: 'Interview preparation intent' }
    );
    for (const hub of indiaHubs.slice(0, 4)) {
      seeds.push({
        keyword: `${roleName} jobs in ${hub}`,
        source: 'naukri_inspired_taxonomy',
        sourceType: 'TAXONOMY_EXPANSION_NAUKRI_INSPIRED',
        rationale: `Indian metro hub demand (${hub})`,
      });
    }
  }

  // Indeed-inspired: work-mode, visa sponsorship, urgent hiring, salary & entry-level phrases
  for (const r of coreRoles.slice(0, 12)) {
    const roleName = r.canonicalName.toLowerCase();
    seeds.push(
      { keyword: `entry level ${roleName} jobs no experience`, source: 'indeed_inspired_taxonomy', sourceType: 'TAXONOMY_EXPANSION_INDEED_INSPIRED', rationale: 'Entry-level job search behavior' },
      { keyword: `${roleName} jobs with visa sponsorship`, source: 'indeed_inspired_taxonomy', sourceType: 'TAXONOMY_EXPANSION_INDEED_INSPIRED', rationale: 'International mobility search intent' },
      { keyword: `part time ${roleName} jobs remote`, source: 'indeed_inspired_taxonomy', sourceType: 'TAXONOMY_EXPANSION_INDEED_INSPIRED', rationale: 'Flexible work-mode search intent' },
      { keyword: `${roleName} work from home jobs`, source: 'indeed_inspired_taxonomy', sourceType: 'TAXONOMY_EXPANSION_INDEED_INSPIRED', rationale: 'Work-from-home job search phrasing' }
    );
    for (const hub of globalHubs.slice(0, 3)) {
      seeds.push({
        keyword: `${roleName} jobs in ${hub}`,
        source: 'indeed_inspired_taxonomy',
        sourceType: 'TAXONOMY_EXPANSION_INDEED_INSPIRED',
        rationale: `Global employment hub (${hub})`,
      });
    }
  }

  // Ecosystem funnel seeds
  const utilitySeeds = [
    'free ats resume checker',
    'check resume ats score online',
    'verified career passport',
    'talent score employability test',
    'ai candidate screening platform',
    'campus placement preparation india',
    'government jobs notification 2026',
  ];
  for (const u of utilitySeeds) {
    seeds.push({
      keyword: u,
      source: 'linkedin_inspired_taxonomy',
      sourceType: 'TAXONOMY_EXPANSION_LINKEDIN_INSPIRED',
      rationale: 'Core TalentXcel product surface search demand',
    });
  }

  return seeds;
}
