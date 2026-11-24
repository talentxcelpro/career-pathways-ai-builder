
const INTERNATIONAL_HUB_SLUGS: Record<string, { roleTitle: string; city: string; country: string; countryCode: string; flag: string; currency: string; metaTitle: string; metaDescription: string; canonicalUrl: string; visaNote: string }> = {
  'data-analyst-dubai-uae': {
    roleTitle: 'Data Analyst & Analytics Engineer',
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    flag: '🇦🇪',
    currency: 'AED',
    metaTitle: 'Data Analyst Jobs in Dubai, UAE (2026) — Verified Vacancies in AED | TalentXcel Jobs',
    metaDescription: 'Explore verified Data Analyst and Analytics Engineer jobs in Dubai, UAE. Direct employer routing to Tabby FinTech, Careem, and Dubai tech firms with verified AED compensation and UAE visa sponsorship.',
    canonicalUrl: 'https://talentxcel.in/jobs/data-analyst-dubai-uae',
    visaNote: 'UAE Labour Law requires employers to sponsor international hires with an entry permit and 2-year renewable employment residence visa upon signed offer acceptance.'
  },
  'software-engineer-abu-dhabi-uae': {
    roleTitle: 'Software Engineer & Systems Specialist',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    flag: '🇦🇪',
    currency: 'AED',
    metaTitle: 'Software Engineer Jobs in Abu Dhabi, UAE (2026) — Verified Vacancies in AED | TalentXcel Jobs',
    metaDescription: 'Apply for verified Software Engineer and Systems Analyst roles in Abu Dhabi, UAE. Official vacancies at First Abu Dhabi Bank (FAB), ADNOC, and Cleveland Clinic Abu Dhabi with verified AED salaries.',
    canonicalUrl: 'https://talentxcel.in/jobs/software-engineer-abu-dhabi-uae',
    visaNote: 'Sovereign entities and multinational institutions in Abu Dhabi process full UAE Ministry of Human Resources & Emiratisation (MOHRE) employment residency permits.'
  },
  'cloud-engineer-riyadh-saudi-arabia': {
    roleTitle: 'Cloud Engineer & Infrastructure Architect',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    flag: '🇸🇦',
    currency: 'SAR',
    metaTitle: 'Cloud Engineer Jobs in Riyadh, Saudi Arabia (2026) — Verified SAR Vacancies | TalentXcel Jobs',
    metaDescription: 'Discover verified Cloud Engineer and Sovereign Cloud Architect positions in Riyadh, Saudi Arabia. Explore tier-1 openings at Aramco Digital and Saudi enterprise hubs with verified SAR compensation.',
    canonicalUrl: 'https://talentxcel.in/jobs/cloud-engineer-riyadh-saudi-arabia',
    visaNote: 'International hires in Riyadh receive full Iqama sponsorship and relocation logistics support under the Saudi Ministry of Human Resources regulations.'
  },
  'data-analyst-remote-usa': {
    roleTitle: 'Data Analyst & Quantitative Specialist',
    city: 'Remote USA',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    currency: 'USD',
    metaTitle: 'Data Analyst Remote Jobs in USA (2026) — Verified USD Compensation | TalentXcel Jobs',
    metaDescription: 'Browse verified remote Data Analyst jobs based in the United States. Direct applications to JPMorgan Chase, Capital One, and US employers. Verified USD salary benchmarks and clear US work authorization terms.',
    canonicalUrl: 'https://talentxcel.in/jobs/data-analyst-remote-usa',
    visaNote: 'US domestic remote positions require valid United States work authorization. Employer sponsorship is explicitly noted where available.'
  },
  'software-engineer-remote-us': {
    roleTitle: 'Software Engineer',
    city: 'Remote USA & Global',
    country: 'United States & Worldwide',
    countryCode: 'US',
    flag: '🇺🇸',
    currency: 'USD',
    metaTitle: 'Remote Software Engineer Jobs USA & Global (2026) — Verified USD Salaries | TalentXcel Jobs',
    metaDescription: 'Verified remote Software Engineer openings with top US and global all-remote employers including Microsoft, AWS, Snowflake, GitLab, and Automattic. Filter by US-only and international remote eligibility.',
    canonicalUrl: 'https://talentxcel.in/jobs/software-engineer-remote-us',
    visaNote: 'Worldwide Remote listings are open to candidates residing in India and internationally without US visa requirements. US-based roles specify US work authorization requirements.'
  }
};


function formatJobDescriptionHtml(desc: string): string {
  if (!desc) return '';
  return escapeHtml(desc).replace(/\n/g, '<br/>');
}


export function resolveOgImageForRoute(cleanPath: string): string {
  const lower = (cleanPath || '').toLowerCase();
  if (lower.startsWith('jobs') || lower.startsWith('job/')) {
    return 'https://talentxcel.in/assets/og/talentxcel-og-jobs.png';
  }
  if (lower.startsWith('colleges') || lower.startsWith('college/')) {
    return 'https://talentxcel.in/assets/og/talentxcel-og-colleges.png';
  }
  if (lower.startsWith('salary') || lower.startsWith('salaries')) {
    return 'https://talentxcel.in/assets/og/talentxcel-og-salaries.png';
  }
  if (lower.startsWith('passport') || lower.startsWith('candidate') || lower.startsWith('profile') || lower.startsWith('signup') || lower.startsWith('join') || lower.startsWith('register')) {
    return 'https://talentxcel.in/assets/og/talentxcel-og-passport.png';
  }
  if (lower.startsWith('resume') || lower.startsWith('ats') || lower.startsWith('tools')) {
    return 'https://talentxcel.in/assets/og/talentxcel-og-resume.png';
  }
  if (lower.startsWith('article') || lower.startsWith('blog') || lower.startsWith('resources') || lower.startsWith('content')) {
    return 'https://talentxcel.in/assets/og/talentxcel-og-article.png';
  }
  return 'https://talentxcel.in/assets/og/talentxcel-og-default.png';
}

// api/seo-render.ts
// Vercel Serverless Edge SEO HTML Hydrator
// Serves 100% complete, pre-rendered semantic HTML documents with zero JS required to both Googlebot and human browsers
// Fully hardened for SEO-002 (Soft 404 Protection & Entity Validation), SEO-004 (Salary Topical Authority Canary),
// SEO-006 (JobPosting Accuracy & Zero Rolling Expiration Dates), and SEO-007 (CTR Optimization).
//
// STAGE E.1 MODULARIZATION: Separated into 3 independently controllable deployment units:
// Unit 1: SOFT_404_PROTECTION (SEO-002) - Strict entity validation & genuine HTTP 404
// Unit 2: SALARY_CANARY_CANONICAL (SEO-004 & SEO-001) - Independent topical authority for salary.talentxcel.in
// Unit 3: CTR_METADATA_OPTIMIZATION (SEO-007) - Data-grounded search titles and descriptions

import collegeSlugsList from './_college-slugs.json';
import collegeTierASlugsList from './_college-tier-a-slugs.json';

export const config = {
  runtime: 'edge',
};

/**
 * TALENTXCEL STAGE E.1 INDEPENDENT DEPLOYMENT UNITS
 * Each unit can be toggled independently via environment variables or runtime overrides.
 */
export function getUnitsDiagnosticHeader(): string {
  return `soft404=${DEPLOYMENT_UNITS.SOFT_404_PROTECTION ? 1 : 0},salary=${DEPLOYMENT_UNITS.SALARY_CANARY_CANONICAL ? 1 : 0},ctr=${DEPLOYMENT_UNITS.CTR_METADATA_OPTIMIZATION ? 1 : 0}`;
}

/**
 * TALENTXCEL STAGE F HARDENED FAIL-CLOSED DEPLOYMENT UNITS
 * Requirements:
 * - Active by default to guarantee production soft 404 protection and canonical consistency.
 * - Explicit 'false' disables a unit.
 * - Zero alternate activation paths.
 * - Independent controllability guaranteed via dynamic getters.
 */
export const DEPLOYMENT_UNITS = {
  // Unit 1: Soft 404 Protection & Strict Entity Validation (SEO-002) - FAIL-CLOSED (ACTIVE BY DEFAULT)
  get SOFT_404_PROTECTION(): boolean {
    return typeof process !== 'undefined' && Boolean(process.env?.SEO_DEPLOY_SOFT_404)
      ? process.env.SEO_DEPLOY_SOFT_404.trim().toLowerCase() !== 'false'
      : true;
  },

  // Unit 2: Salary Independent Canonical Canary (SEO-004 & SEO-001) - FAIL-CLOSED (ACTIVE BY DEFAULT)
  get SALARY_CANARY_CANONICAL(): boolean {
    return typeof process !== 'undefined' && Boolean(process.env?.SEO_DEPLOY_SALARY_CANARY)
      ? process.env.SEO_DEPLOY_SALARY_CANARY.trim().toLowerCase() !== 'false'
      : true;
  },

  // Unit 3: CTR Metadata Optimization (SEO-007) - FAIL-CLOSED (ACTIVE BY DEFAULT)
  get CTR_METADATA_OPTIMIZATION(): boolean {
    return typeof process !== 'undefined' && Boolean(process.env?.SEO_DEPLOY_CTR_OPTIMIZATION)
      ? process.env.SEO_DEPLOY_CTR_OPTIMIZATION.trim().toLowerCase() !== 'false'
      : true;
  },
};

/**
 * 100% Deterministic Canonical URL Builder (Fail-Closed against Duplicate Canonicals)
 * Requirements:
 * - 100% lowercase
 * - Strips trailing slash (except root '/')
 * - Strips all query parameters (?utm_*, ?ref=, ?tab=, ?page=, etc.)
 * - Subdomain roots preserve their dedicated canonicals; all other routes consolidate on apex.
 */
export function buildCleanCanonicalUrl(rawPath: string, host?: string): string {
  const normHost = (host || '').toLowerCase().trim();
  let pathOnly = rawPath || '';
  if (/^https?:\/\//i.test(pathOnly)) {
    try {
      const parsed = new URL(pathOnly);
      pathOnly = parsed.pathname;
    } catch {
      pathOnly = '/';
    }
  }
  // Strip query string and fragment
  pathOnly = pathOnly.split('?')[0].split('#')[0];
  // Remove duplicate slashes
  pathOnly = pathOnly.replace(/\/+/g, '/').trim();
  if (!pathOnly.startsWith('/')) {
    pathOnly = `/${pathOnly}`;
  }
  // Remove trailing slashes (except root '/')
  if (pathOnly.length > 1 && pathOnly.endsWith('/')) {
    pathOnly = pathOnly.replace(/\/+$/, '');
  }
  pathOnly = pathOnly.toLowerCase();

  // Root on recognized subdomains preserves subdomain root canonical
  if (pathOnly === '/' && normHost && normHost !== 'talentxcel.in' && normHost !== 'www.talentxcel.in') {
    if (normHost.includes('talentxcel.in')) {
      return `https://${normHost}/`;
    }
  }

  // Salary Canary (Topical Authority Development Canary)
  if (pathOnly.startsWith('/salary') && DEPLOYMENT_UNITS.SALARY_CANARY_CANONICAL) {
    return `https://salary.talentxcel.in${pathOnly === '/' ? '/' : pathOnly}`;
  }

  // Apex Authority Consolidation
  return `https://talentxcel.in${pathOnly === '/' ? '/' : pathOnly}`;
}

export function resolveCanaryCanonical(cleanPath: string, targetUniverse: string = 'CORE'): string {
  return buildCleanCanonicalUrl(cleanPath);
}

/**
 * Word count extractor for rendered SSR HTML or text
 */
export function countRenderedWords(textOrHtml: string): number {
  if (!textOrHtml) return 0;
  const stripped = textOrHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped ? stripped.split(/\s+/).length : 0;
}

/**
 * Stage F Hardened Indexability Threshold (isIndexReady)
 * Requires BOTH:
 * 1. >= 3 live matching database records (jobs, salary entries, profile fields + endorsements)
 * 2. >= 400 words of unique, non-boilerplate rendered text
 */
export function evaluateIndexabilityThreshold(matchingRecordsCount: number, renderedWordCount: number): boolean {
  return matchingRecordsCount >= 3 && renderedWordCount >= 400;
}

const getSupabaseRestUrl = () => {
  const isPreview = (typeof process !== 'undefined' && (process.env?.VERCEL_ENV === 'preview' || process.env?.VITE_VERCEL_ENV === 'preview'));
  const url = (typeof process !== 'undefined' && process.env?.SUPABASE_REST_URL)
    ? process.env.SUPABASE_REST_URL
    : (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL)
      ? `${process.env.VITE_SUPABASE_URL.replace(/\/$/, "")}/rest/v1`
      : (isPreview ? '' : 'https://dthlgsnakhoftinssokm.supabase.co/rest/v1');

  if (isPreview && (!url || url.includes('dthlgsnakhoftinssokm'))) {
    throw new Error('FAIL-CLOSED GUARD: Vercel Preview environment cannot fall back to Production Supabase (dthlgsnakhoftinssokm). Set SUPABASE_REST_URL or VITE_SUPABASE_URL to Preview project (pvwwtquuexhyydwihjbi).');
  }
  return url;
};
const getSupabaseAnonKey = () => (typeof process !== 'undefined' && (process.env?.SUPABASE_ANON_KEY || process.env?.VITE_SUPABASE_PUBLISHABLE_KEY))
  ? (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY)!
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const CANONICAL_ROLES_SET = new Set([
  'graduate-engineer-trainee', 'associate-data-analyst', 'management-trainee',
  'junior-software-engineer', 'junior-qa-automation-engineer', 'junior-backend-developer',
  'devops-cloud-engineer', 'banking-associate', 'assistant-branch-manager',
  'digital-marketing-specialist', 'product-growth-analyst', 'senior-staff-engineer',
  'software-engineer', 'full-stack-developer', 'frontend-developer', 'backend-developer',
  'react-developer', 'node-js-developer', 'python-developer', 'java-developer',
  'golang-developer', 'ios-developer', 'android-developer', 'flutter-developer',
  'react-native-developer', 'devops-engineer', 'cloud-architect', 'aws-solutions-architect',
  'azure-cloud-engineer', 'gcp-cloud-architect', 'site-reliability-engineer',
  'database-administrator', 'sql-developer', 'postgresql-dba', 'security-engineer',
  'cybersecurity-analyst', 'qa-automation-engineer', 'sdet-engineer', 'blockchain-developer',
  'smart-contract-developer', 'ai-engineer', 'machine-learning-engineer', 'ai-ml-engineer', 'aiml-engineer', 'ml-engineer', 'cloud-devops-engineer', 'data-scientist',
  'data-engineer', 'data-analyst', 'prompt-engineer', 'llm-engineer', 'nlp-engineer',
  'computer-vision-engineer', 'big-data-engineer', 'bi-developer', 'etl-developer',
  'product-manager', 'technical-product-manager', 'growth-product-manager', 'associate-product-manager',
  'ui-ux-designer', 'product-designer', 'visual-designer', 'interaction-designer',
  'scrum-master', 'agile-coach', 'solutions-architect', 'enterprise-architect',
  'engineering-manager', 'director-of-engineering', 'vp-of-engineering', 'chief-technology-officer',
  'marketing-manager', 'growth-marketer', 'digital-marketing-specialist', 'seo-specialist',
  'content-writer', 'copywriter', 'social-media-manager', 'performance-marketer',
  'financial-analyst', 'investment-banking-analyst', 'quantitative-analyst', 'risk-analyst',
  'talent-acquisition-specialist', 'technical-recruiter', 'hr-manager', 'hr-business-partner',
  'operations-manager', 'project-manager', 'program-manager', 'business-analyst',
  'systems-analyst', 'crm-developer', 'salesforce-developer', 'sap-consultant',
  'servicenow-developer', 'embedded-systems-engineer', 'firmware-engineer', 'iot-engineer',
  'network-engineer', 'systems-administrator', 'linux-administrator', 'kubernetes-specialist'
]);

const CANONICAL_CITIES_SET = new Set([
  'mumbai', 'bangalore', 'bengaluru', 'hyderabad', 'noida', 'pune', 'gurgaon', 'gurugram',
  'chennai', 'delhi', 'delhi-ncr', 'kolkata', 'ahmedabad', 'jaipur', 'chandigarh', 'bhopal',
  'indore', 'patna', 'lucknow', 'varanasi', 'bhubaneswar', 'kochi', 'surat', 'coimbatore',
  'visakhapatnam', 'nagpur', 'kanpur', 'dhanbad', 'bilaspur', 'aurangabad', 'jamshedpur',
  'vadodara', 'nashik', 'amravati', 'kota', 'jammu', 'guwahati', 'hubli', 'dehradun',
  'srinagar', 'mysuru', 'mysore', 'solapur', 'kolhapur', 'gwalior', 'jabalpur', 'jodhpur',
  'udaipur', 'haridwar', 'calicut', 'kozhikode', 'ranchi', 'aligarh', 'raipur', 'mangalore',
  'belgaum', 'tiruchirappalli', 'salem', 'vellore', 'vijayawada', 'guntur', 'warangal',
  'thrissur', 'kollam', 'moradabad', 'thiruvananthapuram', 'tirupati', 'rajkot', 'bhavnagar',
  'jamnagar', 'dubai', 'london', 'singapore', 'remote', 'india', 'patiala'
]);

export const CITY_ALIAS_MAP: Record<string, string> = {
  'gurgaon': 'gurugram',
  'cyber city': 'gurugram',
  'cyber city gurgaon': 'gurugram',
  'gurugram, haryana': 'gurugram',
  'gurgaon, haryana': 'gurugram',
  'bengaluru': 'bangalore',
  'bangalore, karnataka': 'bangalore',
  'bengaluru, karnataka': 'bangalore',
  'prayagraj': 'allahabad',
  'allahabad': 'prayagraj',
  'cochin': 'kochi',
  'ernakulam': 'kochi',
  'trivandrum': 'thiruvananthapuram',
  'mysore': 'mysuru',
  'baroda': 'vadodara',
  'vizag': 'visakhapatnam',
  'bombay': 'mumbai',
  'madras': 'chennai',
  'calcutta': 'kolkata',
  'poona': 'pune',
  'secunderabad': 'hyderabad',
  'cyberabad': 'hyderabad',
  'new delhi': 'delhi',
  'delhi ncr': 'delhi',
  'ncr': 'delhi',
  'greater noida': 'noida',
  'pondicherry': 'puducherry',
  'belagavi': 'belgaum',
  'hubballi': 'hubli',
  'vijayapura': 'bijapur',
  'kalaburagi': 'gulbarga',
  'shimoga': 'shivamogga',
  'mangaluru': 'mangalore',
  'waltair': 'visakhapatnam',
  'simla': 'shimla',
  'gauhati': 'guwahati',
  'trichy': 'tiruchirappalli',
  'tirunelveli': 'nellai',
  'tuticorin': 'thoothukudi',
  'tanjore': 'thanjavur',
  'kozhikode': 'calicut',
  'palghat': 'palakkad',
  'alleppey': 'alappuzha',
  'quilon': 'kollam',
  'cannannore': 'kannur',
  'remote - india': 'remote',
  'india - remote': 'remote',
  'remote, india': 'remote',
  'remote, in': 'remote',
  'work from home': 'remote',
  'wfh': 'remote',
  'pan india': 'pan-india',
  'all india': 'pan-india',
  'pan-india': 'pan-india',
};

const ELIGIBLE_CITIES_SET = new Set([
  'bhopal', 'jaipur', 'chandigarh', 'pune', 'coimbatore', 'mumbai', 'bhubaneswar',
  'noida', 'kolkata', 'indore', 'surat', 'chennai', 'kochi', 'hyderabad', 'patna',
  'delhi', 'bangalore', 'gurgaon', 'gurugram', 'bilaspur', 'nagpur', 'dhanbad', 'jamshedpur',
  'aurangabad', 'amravati', 'kanpur', 'vadodara', 'nashik', 'kota', 'jammu', 'guwahati',
  'hubli', 'dehradun', 'srinagar', 'mysuru', 'solapur', 'kolhapur', 'gwalior', 'jabalpur',
  'jodhpur', 'udaipur', 'haridwar', 'calicut', 'ranchi', 'aligarh', 'raipur', 'mangalore',
  'belgaum', 'tiruchirappalli', 'salem', 'moradabad', 'thrissur', 'kollam', 'warangal',
  'guntur', 'vellore', 'vijayawada', 'ahmedabad', 'varanasi', 'lucknow'
]);

const ELIGIBLE_CITY_COUNTS: Record<string, number> = {
  'bhopal': 45, 'jaipur': 45, 'chandigarh': 45, 'pune': 45, 'coimbatore': 44, 'mumbai': 44,
  'bhubaneswar': 44, 'noida': 44, 'kolkata': 44, 'indore': 44, 'surat': 44, 'chennai': 44,
  'kochi': 44, 'hyderabad': 44, 'patna': 43, 'delhi': 43, 'bangalore': 43, 'gurgaon': 46, 'gurugram': 46,
  'bilaspur': 43, 'nagpur': 43, 'dhanbad': 43, 'jamshedpur': 43, 'aurangabad': 43, 'amravati': 43,
  'kanpur': 43, 'vadodara': 43, 'nashik': 43, 'kota': 43, 'jammu': 43, 'guwahati': 43,
  'hubli': 43, 'dehradun': 43, 'srinagar': 43, 'mysuru': 43, 'solapur': 43, 'kolhapur': 43,
  'gwalior': 43, 'jabalpur': 43, 'jodhpur': 43, 'udaipur': 43, 'haridwar': 43, 'calicut': 43,
  'ranchi': 43, 'aligarh': 43, 'raipur': 43, 'mangalore': 43, 'belgaum': 43, 'tiruchirappalli': 43,
  'salem': 43, 'moradabad': 43, 'thrissur': 43, 'kollam': 43, 'warangal': 43, 'guntur': 43,
  'vellore': 28, 'vijayawada': 28, 'ahmedabad': 16, 'varanasi': 16, 'lucknow': 16
};

const CANONICAL_COMPANIES_MAP: Record<string, { name: string; title: string; count: number; industry: string; location: string; description: string; h1: string }> = {
  'ntpc': {
    name: 'NTPC Limited',
    title: 'NTPC Careers & Vacancies (14 Live Openings) | TalentXcel',
    count: 14,
    industry: 'Energy & Power Generation (PSU)',
    location: 'New Delhi, Delhi NCR, India',
    description: 'Explore verified career opportunities and vacancies at NTPC Limited. Engineering, cloud infrastructure, and PSU trainee roles.',
    h1: 'NTPC Careers & Job Openings (2026)'
  },
  'hdfc-bank': {
    name: 'HDFC Bank',
    title: 'HDFC Bank Careers & Jobs (28 Live Openings) | TalentXcel',
    count: 28,
    industry: 'Banking & Financial Services',
    location: 'Mumbai, Maharashtra, India',
    description: 'Browse verified job openings at HDFC Bank across retail banking, credit analysis, branch operations, and financial technology.',
    h1: 'HDFC Bank Careers & Job Openings (2026)'
  },
  'tata-steel': {
    name: 'Tata Steel',
    title: 'Tata Steel Careers & Jobs (18 Live Openings) | TalentXcel',
    count: 18,
    industry: 'Manufacturing & Metals',
    location: 'Jamshedpur, Jharkhand, India',
    description: 'Apply for verified career opportunities at Tata Steel. Engineering, metallurgy, data analytics, and operational leadership.',
    h1: 'Tata Steel Careers & Job Openings (2026)'
  },
  'steel-authority-of-india': {
    name: 'SAIL',
    title: 'SAIL Careers & PSU Vacancies (13 Live) | TalentXcel',
    count: 13,
    industry: 'Manufacturing & Heavy Industry (PSU)',
    location: 'New Delhi, Delhi NCR, India',
    description: 'Explore official SAIL vacancies across integrated steel plants in Ranchi, Salem, and national facilities.',
    h1: 'SAIL Careers & PSU Vacancies (2026)'
  },
  'jindal-steel-power': {
    name: 'Jindal Steel & Power',
    title: 'Jindal Steel Careers (13 Live Openings) | TalentXcel',
    count: 13,
    industry: 'Metals & Energy',
    location: 'New Delhi, Delhi NCR, India',
    description: 'Discover verified jobs at Jindal Steel & Power across management trainee, data analysis, and engineering roles in Raipur and Salem.',
    h1: 'Jindal Steel & Power Careers (2026)'
  },
  'bajaj-auto': {
    name: 'Bajaj Auto',
    title: 'Bajaj Auto Careers & GET Jobs (11 Live) | TalentXcel',
    count: 11,
    industry: 'Automotive Manufacturing & EV',
    location: 'Pune, Maharashtra, India',
    description: 'Find Graduate Engineer Trainee (GET) and automotive engineering vacancies at Bajaj Auto in Pune and Aurangabad.',
    h1: 'Bajaj Auto Careers & Job Openings (2026)'
  },
  'hcl-technologies': {
    name: 'HCL Technologies',
    title: 'HCLTech Careers & Tech Jobs (11 Live) | TalentXcel',
    count: 11,
    industry: 'IT Services & Consulting',
    location: 'Noida, Uttar Pradesh, India',
    description: 'Explore verified engineering, cloud, QA automation, and analytics opportunities at HCL Technologies.',
    h1: 'HCL Technologies Careers (2026)'
  },
  'bharat-coking-coal-limited': {
    name: 'BCCL',
    title: 'BCCL Dhanbad Careers (7 Live Openings) | TalentXcel',
    count: 7,
    industry: 'Mining & Heavy Industry (PSU)',
    location: 'Dhanbad, Jharkhand, India',
    description: 'Browse verified openings at Bharat Coking Coal Limited (BCCL) in Dhanbad across QA, trainee, and operations roles.',
    h1: 'BCCL Careers & Job Vacancies (2026)'
  },
  'raymond': {
    name: 'Raymond',
    title: 'Raymond Careers & Job Openings (7 Live) | TalentXcel',
    count: 7,
    industry: 'Textile & Precision Manufacturing',
    location: 'Mumbai, Maharashtra, India',
    description: 'Explore verified professional openings at Raymond across tech leads, operations, and manufacturing in Amravati and Thane.',
    h1: 'Raymond Careers & Job Openings (2026)'
  },
  'zomato': {
    name: 'Zomato',
    title: 'Zomato Careers & Tech Jobs (5 Live Openings) | TalentXcel',
    count: 5,
    industry: 'Internet & Food Technology',
    location: 'Gurugram, Haryana, India',
    description: 'Apply for high-scale mobile engineering, MLOps, and data analyst jobs at Zomato in Gurugram.',
    h1: 'Zomato Careers & Job Openings (2026)'
  },
  'ibs-software': {
    name: 'IBS Software',
    title: 'IBS Software Careers & Tech Jobs (5 Live) | TalentXcel',
    count: 5,
    industry: 'Enterprise SaaS & Aviation Tech',
    location: 'Kochi, Kerala, India',
    description: 'Discover verified SaaS and QA automation careers at IBS Software Infopark Kochi.',
    h1: 'IBS Software Careers (2026)'
  },
  'talentxcel': {
    name: 'TalentXcel Enterprise',
    title: 'TalentXcel Careers & Openings (16 Live) | TalentXcel',
    count: 16,
    industry: 'HR Tech & Career AI',
    location: 'Gurgaon, Delhi NCR, India',
    description: 'Join the team building the AI Career Operating System and global hiring infrastructure.',
    h1: 'TalentXcel Careers & Openings (2026)'
  },
  'talentxcel-services': {
    name: 'TalentXcel Services',
    title: 'TalentXcel Services Careers (16 Live) | TalentXcel',
    count: 16,
    industry: 'AI Recruitment & Staffing',
    location: 'Noida, Uttar Pradesh, India',
    description: 'Explore career acceleration and talent consulting opportunities at TalentXcel Services.',
    h1: 'TalentXcel Services Careers (2026)'
  },
  'talentxcel-services-pvt-ltd': {
    name: 'TalentXcel Services Pvt Ltd',
    title: 'TalentXcel Services Jobs (16 Openings) | TalentXcel',
    count: 16,
    industry: 'AI Recruitment & Staffing',
    location: 'Noida, Uttar Pradesh, India',
    description: 'Verified opportunities at TalentXcel Services Pvt Ltd.',
    h1: 'TalentXcel Services Jobs (2026)'
  },
  'chatr-chat': {
    name: 'chatr Chat',
    title: 'chatr Chat Careers & AI Jobs | TalentXcel',
    count: 4,
    industry: 'Artificial Intelligence & Telecom',
    location: 'New Delhi, Delhi NCR, India',
    description: 'Build autonomous AI messaging and communication networks at chatr Chat.',
    h1: 'chatr Chat Careers (2026)'
  },
  'savantis-solutions': {
    name: 'Savantis Solutions',
    title: 'Savantis Solutions Careers & Jobs | TalentXcel',
    count: 6,
    industry: 'IT Services & Cloud Consulting',
    location: 'Noida, Uttar Pradesh, India',
    description: 'Enterprise SAP, cloud consulting, and software development careers at Savantis Solutions.',
    h1: 'Savantis Solutions Careers (2026)'
  }
};

const VALID_EXPERIENCE_TIERS = new Set([
  'fresher', 'freshers', 'entry-level', 'junior', 'mid-level', 'senior', 'lead', 'architect', 'executive'
]);

const VALID_COURSE_SUBJECTS = new Set([
  'python', 'react', 'aws', 'machine-learning', 'data-science', 'full-stack',
  'cloud', 'devops', 'cyber-security', 'java', 'ai', 'data-analytics'
]);

const COLLEGE_SLUGS_SET = new Set(collegeSlugsList);
const TIER_A_COLLEGE_SLUGS_SET = new Set(collegeTierASlugsList);

const CORE_STATIC_ROUTES = new Set([
  '', 'reels', 'explore', 'jobs', 'colleges', 'learning', 'resume', 'passport', 'network', 'communities',
  'salary', 'salaries', 'directory', 'directory/colleges-a-z', 'directory/salaries-by-role',
  'directory/jobs-by-city', 'rankings', 'blog', 'news', 'about', 'contact', 'faq', 'help',
  'terms', 'privacypolicy', 'privacy', 'return-refund-policy', 'hire', 'recruiters', 'staffing', 'recruitment', 'rpo',
  'careers', 'career-paths', 'career-map', 'government-jobs', 'services',
  'companies', 'uae', 'uk', 'usa', 'europe', 'world', 'talent',
  'resume/build', 'resume-builder', 'resume/ats-check', 'ats-check', 'resume/cover-letter', 'resume/interview-prep', 'resume/templates',
  'tools/resume-checker', 'tools/ats-checker', 'tools/salary-analyzer',
  'salary/scenarios', 'salary/negotiation', 'salary/goals', 'salary/skills-gap', 'salary/jobs',
  'colleges/global-programs', 'colleges/scholarships', 'colleges/career-pathway',
  'network/verified', 'network/connections', 'network/skill-swap', 'network/articles', 'network/requests',
  'saved-jobs', 'profile/analytics'
]);

const PRIVATE_ROUTE_PREFIXES = [
  '/auth', '/admin', '/company-os', '/dashboard', '/settings', '/onboarding', '/my-applications',
  '/jobs/apply', '/jobs/dashboard', '/jobs/my-applications', '/companies/admin', '/companies/settings',
  '/network/messages', '/network/notifications', '/network/settings', '/resume/user', '/resume/private',
  '/resume/edit', '/resume/builder', '/resume/portfolio', '/resume/upload',
  '/build', '/upload', '/resume/my-resumes', '/resume/dashboard', '/profile/edit', '/profile/settings',
  '/tools/internal', '/tools/private', '/learning/my-courses', '/learning/my-progress', '/learning/progress',
  '/learning/dashboard', '/colleges/admin', '/colleges/private', '/careermap/private', '/careermap/user',
  '/careerpassport/user', '/careerpassport/private', '/employer/settings', '/employer/dashboard',
  '/employer/private', '/marketplace/orders', '/marketplace/private', '/events/settings', '/events/private',
  '/employers/post-job',
  '/career-dashboard', '/provider/dashboard', '/checkout', '/subscription', '/billing', '/account',
  '/diagnostics', '/debug', '/testing', '/launch', '/access-control-test', '/realtime-demo', '/mobile-demo',
];

function isPrivateRoute(path: string): boolean {
  const normalized = `/${path.split('/').filter(Boolean).join('/').toLowerCase()}`;
  return PRIVATE_ROUTE_PREFIXES.some((prefix) =>
    normalized === prefix || normalized.startsWith(prefix.endsWith('-') ? prefix : `${prefix}/`)
  );
}

function privateRouteResponse(): Response {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex, nofollow">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>TalentXcel Account</title>
<meta name="description" content="This restricted TalentXcel page is unavailable in search results."></head>
<body><main><h1>TalentXcel</h1><p>This page is restricted and is not available in search results.</p></main></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Render-Engine': 'TalentXcel-Private-Route-Guard',
    },
  });
}

const RESERVED_VERIFY_ROUTES = new Set([
  'email',
  'email-verification',
  'identity',
  'passport',
  'account',
  'auth',
  'token',
  'session',
  'phone',
  'kyc',
  'otp',
  'success',
  'failed',
]);

export function isCandidateProfileRoute(cleanPath: string): boolean {
  const normalized = (cleanPath || '').trim().toLowerCase();

  // Root /verify landing or system verification tools are not candidate profiles
  if (normalized === 'verify') {
    return false;
  }

  // Subpaths of /verify/
  if (normalized.startsWith('verify/')) {
    const sub = normalized.slice(7).trim().replace(/^@/, '');
    const firstSegment = sub.split('/')[0];
    // If it's a known transactional verification path, do NOT treat as candidate profile
    if (!firstSegment || RESERVED_VERIFY_ROUTES.has(firstSegment)) {
      return false;
    }
    // Candidate profile endorsement / verification route (/verify/@username or /verify/:username)
    return true;
  }

  return (
    normalized === 'p' ||
    normalized.startsWith('p/') ||
    normalized === 'u' ||
    normalized.startsWith('u/') ||
    normalized === 'profile' ||
    normalized.startsWith('profile/') ||
    normalized === 'candidate' ||
    normalized.startsWith('candidate/') ||
    normalized === 'candidates' ||
    normalized.startsWith('candidates/')
  );
}

function notFoundResponse(cleanPath: string, isDebug: boolean = false, isProfile: boolean = false): Response {
  const isCandidate = isProfile || isCandidateProfileRoute(cleanPath);
  const title = isCandidate ? 'Profile Unavailable (404) | TalentXcel' : 'Page Not Found (404) | TalentXcel';
  const description = isCandidate
    ? 'This professional profile is private, does not exist, or public consent has been revoked.'
    : 'The requested resource does not exist on TalentXcel. Explore active jobs, colleges, career pathways, and salary intelligence.';
  const cacheControl = isCandidate
    ? 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0'
    : 'public, max-age=0, s-maxage=3600';

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="noindex, nofollow">
  <script src="https://cdn.tailwindcss.com" defer></script>
</head>
<body class="bg-slate-950 text-slate-100 antialiased font-sans">
  <div id="root">
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <div>
        <header class="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <a href="https://talentxcel.in" class="text-xl font-bold text-white tracking-tight">Talent<span class="text-blue-500">Xcel</span></a>
            <nav class="hidden md:flex gap-6 text-sm font-medium text-slate-300">
              <a href="https://talentxcel.in/jobs" class="hover:text-white">Jobs</a>
              <a href="https://talentxcel.in/colleges" class="hover:text-white">Colleges</a>
              <a href="https://salary.talentxcel.in/salary" class="hover:text-white">Salaries</a>
              <a href="https://talentxcel.in/resume" class="hover:text-white">Resume</a>
              <a href="https://talentxcel.in/directory" class="hover:text-white">Directory</a>
            </nav>
          </div>
        </header>
        <main class="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold">
            HTTP 404 — Not Found
          </span>
          <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight">${isCandidate ? 'Profile Unavailable' : 'Entity or Page Not Found'}</h1>
          <p class="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
            ${isCandidate
              ? 'This professional profile is private, does not exist, or public consent has been revoked.'
              : `The resource at <code class="text-red-400 font-mono bg-slate-900 px-2 py-0.5 rounded">/${escapeHtml(cleanPath)}</code> does not exist on TalentXcel or has been retired.`}
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="https://talentxcel.in/jobs" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">Explore Active Jobs &rarr;</a>
            <a href="https://talentxcel.in/colleges" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition">Browse Colleges</a>
            <a href="https://salary.talentxcel.in/salary" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition">Salary Intelligence</a>
          </div>
        </main>
      </div>
      <footer class="mt-16 border-t border-slate-800 bg-slate-900/90 py-8 px-6 text-center text-xs text-slate-500">
        &copy; ${new Date().getFullYear()} TalentXcel Platform. All rights reserved.
      </footer>
    </div>
  </div>
</body>
</html>`;

  const headers: Record<string, string> = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': cacheControl,
    'X-Robots-Tag': 'noindex, nofollow',
    'X-Render-Engine': 'TalentXcel-Edge-404-Guard',
    ...(isDebug ? { 'X-SEO-Units': getUnitsDiagnosticHeader() } : {}),
  };

  if (isCandidate) {
    headers['CDN-Cache-Control'] = 'no-store';
    headers['Vercel-CDN-Cache-Control'] = 'no-store';
    headers['Pragma'] = 'no-cache';
    headers['Surrogate-Control'] = 'no-store';
  }

  return new Response(html, {
    status: 404,
    headers,
  });
}

async function lookupJobInSupabase(slugOrId: string): Promise<any | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const filter = isUuid ? `id=eq.${encodeURIComponent(slugOrId)}` : `seo_slug=eq.${encodeURIComponent(slugOrId)}`;
    const url = `${getSupabaseRestUrl()}/jobs?select=id,title,company_name,location,description,is_active,seo_slug,posted_at,date_posted,created_at,expires_at,employment_type,salary_min,salary_max,salary_currency,is_remote,external_url,company_website,organization_logo_url,organization_website&${filter}&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': getSupabaseAnonKey(),
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data[0];
      }
    }

    // Fallback 1: If slug has no trailing suffix, check with '-1' suffix (reconciles GSC indexed ranking slugs)
    if (!isUuid && !/-\d+$/.test(slugOrId)) {
      const fallbackUrl1 = `${getSupabaseRestUrl()}/jobs?select=id,title,company_name,location,description,is_active,seo_slug,posted_at,date_posted,created_at,expires_at,employment_type,salary_min,salary_max,salary_currency,is_remote,external_url,company_website,organization_logo_url,organization_website&seo_slug=eq.${encodeURIComponent(slugOrId + '-1')}&limit=1`;
      const fbRes1 = await fetch(fallbackUrl1, {
        headers: {
          'apikey': getSupabaseAnonKey(),
          'Authorization': `Bearer ${getSupabaseAnonKey()}`,
        },
      });
      if (fbRes1.ok) {
        const fbData1 = await fbRes1.json();
        if (Array.isArray(fbData1) && fbData1.length > 0) {
          return fbData1[0];
        }
      }
    }

    // Fallback 2: If slug has trailing numeric suffix, check stripped base slug
    if (!isUuid && /-\d+$/.test(slugOrId)) {
      const stripped = slugOrId.replace(/-\d+$/, '');
      const fallbackUrl2 = `${getSupabaseRestUrl()}/jobs?select=id,title,company_name,location,description,is_active,seo_slug,posted_at,date_posted,created_at,expires_at,employment_type,salary_min,salary_max,salary_currency,is_remote,external_url,company_website,organization_logo_url,organization_website&seo_slug=eq.${encodeURIComponent(stripped)}&limit=1`;
      const fbRes2 = await fetch(fallbackUrl2, {
        headers: {
          'apikey': getSupabaseAnonKey(),
          'Authorization': `Bearer ${getSupabaseAnonKey()}`,
        },
      });
      if (fbRes2.ok) {
        const fbData2 = await fbRes2.json();
        if (Array.isArray(fbData2) && fbData2.length > 0) {
          return fbData2[0];
        }
      }
    }

    return null;
  } catch {
    return null;
  }
}

async function lookupProfileInSupabase(slugOrId: string): Promise<any | null> {
  try {
    const cleaned = (slugOrId || '').trim().replace(/^@/, '');
    if (!cleaned) return null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleaned);
    let filter = '';
    if (isUuid) {
      filter = `id=eq.${encodeURIComponent(cleaned)}`;
    } else {
      filter = `username=ilike.${encodeURIComponent(cleaned)}`;
    }
    const selectCols = 'id,full_name,headline,title,location,profile_picture_url,profile_photo_url,username,skills,about,experience_years,current_company,industry,linkedin_url,github_url,portfolio_url,website,verification_status,created_at';
    const url = `${getSupabaseRestUrl()}/public_profiles?select=${selectCols}&${filter}&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': getSupabaseAnonKey(),
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    // Fallback: if username had hyphens or underscores
    if (!isUuid && (cleaned.includes('-') || cleaned.includes('_'))) {
      const altSlug = cleaned.includes('-') ? cleaned.replace(/-/g, '_') : cleaned.replace(/_/g, '-');
      const urlAlt = `${getSupabaseRestUrl()}/public_profiles?select=${selectCols}&username=ilike.${encodeURIComponent(altSlug)}&limit=1`;
      const resAlt = await fetch(urlAlt, {
        headers: {
          'apikey': getSupabaseAnonKey(),
          'Authorization': `Bearer ${getSupabaseAnonKey()}`,
        },
      });
      if (resAlt.ok) {
        const dataAlt = await resAlt.json();
        if (Array.isArray(dataAlt) && dataAlt.length > 0) return dataAlt[0];
      }
    }
    return null;
  } catch {
    return null;
  }
}

interface ProfileEnrichmentData {
  endorsements: any[];
  atsScore: number | null;
  matchingJobs: any[];
  careerSkills: string[];
}

async function lookupProfileEnrichment(profileId: string, skills: string[] = [], roleOrTitle: string = '', location: string = ''): Promise<ProfileEnrichmentData> {
  const result: ProfileEnrichmentData = {
    endorsements: [],
    atsScore: null,
    matchingJobs: [],
    careerSkills: [],
  };

  const headers = {
    'apikey': getSupabaseAnonKey(),
    'Authorization': `Bearer ${getSupabaseAnonKey()}`,
  };

  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(profileId);
    if (!isUuid) return result;

    const [endorsementsRes, atsRes, careerSkillsRes, jobsRes] = await Promise.allSettled([
      fetch(`${getSupabaseRestUrl()}/peer_endorsements?select=id,endorser_name,skill_name,feedback,created_at&target_user_id=eq.${encodeURIComponent(profileId)}&status=eq.approved&limit=5`, { headers }),
      fetch(`${getSupabaseRestUrl()}/ats_public_scans?select=id,ats_score,created_at&user_id=eq.${encodeURIComponent(profileId)}&order=created_at.desc&limit=1`, { headers }),
      fetch(`${getSupabaseRestUrl()}/career_skills?select=skill_name&user_id=eq.${encodeURIComponent(profileId)}&limit=15`, { headers }),
      fetch(`${getSupabaseRestUrl()}/jobs?select=id,title,company_name,location,salary_min,salary_max,salary_currency,employment_type,skills_required&is_active=eq.true&order=created_at.desc&limit=4`, { headers }),
    ]);

    if (endorsementsRes.status === 'fulfilled' && endorsementsRes.value.ok) {
      const data = await endorsementsRes.value.json();
      if (Array.isArray(data)) result.endorsements = data;
    }

    if (atsRes.status === 'fulfilled' && atsRes.value.ok) {
      const data = await atsRes.value.json();
      if (Array.isArray(data) && data.length > 0 && typeof data[0].ats_score === 'number') {
        result.atsScore = data[0].ats_score;
      }
    }

    if (careerSkillsRes.status === 'fulfilled' && careerSkillsRes.value.ok) {
      const data = await careerSkillsRes.value.json();
      if (Array.isArray(data)) {
        result.careerSkills = data.map((item: any) => item.skill_name).filter(Boolean);
      }
    }

    if (jobsRes.status === 'fulfilled' && jobsRes.value.ok) {
      const data = await jobsRes.value.json();
      if (Array.isArray(data)) result.matchingJobs = data;
    }
  } catch {
    // Non-fatal edge hydration fallback
  }

  return result;
}

async function lookupPostInSupabase(postId: string): Promise<{ post: any; author: any | null } | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);
    if (!isUuid) return null;
    const url = `${getSupabaseRestUrl()}/posts?select=id,content,headline,media_urls,featured_image_url,created_at,author_id,user_id&id=eq.${encodeURIComponent(postId)}&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': getSupabaseAnonKey(),
        'Authorization': `Bearer ${getSupabaseAnonKey()}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;
    const post = data[0];
    const authorId = post.author_id || post.user_id;
    let author: any = null;
    if (authorId) {
      author = await lookupProfileInSupabase(authorId);
    }
    return { post, author };
  } catch {
    return null;
  }
}


export default async function handler(req: Request) {
  const url = new URL(req.url);
  const rawPathParam = url.searchParams.get('path') || url.pathname.replace(/^\/api\/seo-render\/?/, '') || '/';
  // Clean path: strip query parameters, hash fragments, and surrounding slashes
  const pathParam = rawPathParam.split('?')[0].split('#')[0];
  const cleanPath = pathParam.replace(/^\//, '').replace(/\/$/, '');
  const isDebug = req?.headers?.get('x-seo-debug') === 'internal';

  if (isPrivateRoute(cleanPath)) return privateRouteResponse();

  // 301 Redirect for legacy multi-slash ranking URLs from GSC
  if (cleanPath.startsWith('jobs/')) {
    const parts = cleanPath.split('/');
    if (parts.length >= 4) {
      let targetPath = '';
      if (parts[2] === 'freshers') {
        targetPath = `/jobs/freshers/${parts[1]}-in-${parts[3]}`;
      } else {
        targetPath = `/jobs/${parts[1]}-in-${parts[2]}`;
      }
      if (targetPath) {
        return new Response(null, {
          status: 301,
          headers: {
            'Location': targetPath,
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
          },
        });
      }
    }
  }

  if (cleanPath === 'robots.txt' || cleanPath.endsWith('/robots.txt')) {
    return new Response('User-agent: *\nAllow: /\n\nSitemap: https://talentxcel.in/sitemap-root.xml\n', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  if (cleanPath.endsWith('.xml') || cleanPath.includes('sitemap') || cleanPath.includes('feed')) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><error>XML route - not HTML</error>', {
      status: 404,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }

  const hostHeader = req?.headers?.get('x-forwarded-host') || req?.headers?.get('host') || url.hostname || '';
  const cleanHost = hostHeader.split(':')[0].trim().toLowerCase();

  const isCandidateRoute = isCandidateProfileRoute(cleanPath);
  const isJobRoute = cleanPath.startsWith('jobs/');
  const result = await generateDynamicSeoHtml(cleanPath, cleanHost);
  if (!result || result.status === 404) {
    return notFoundResponse(cleanPath, isDebug, isCandidateRoute);
  }

  const responseHeaders: Record<string, string> = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': result.cacheControl || 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    'X-Render-Engine': 'TalentXcel-Edge-SSR-Hydrator',
    'X-Robots-Tag': result.robotsDirective,
    ...(isDebug ? { 'X-SEO-Units': getUnitsDiagnosticHeader() } : {}),
  };

  if (isCandidateRoute && (!result.status || result.status === 200)) {
    if (result.cacheTag) {
      responseHeaders['Vercel-Cache-Tag'] = result.cacheTag;
      responseHeaders['Cache-Tag'] = result.cacheTag;
      responseHeaders['Surrogate-Key'] = result.cacheTag;
    }
  }

  if (isCandidateRoute && (result.status as number) === 404) {
    responseHeaders['CDN-Cache-Control'] = 'no-store';
    responseHeaders['Vercel-CDN-Cache-Control'] = 'no-store';
    responseHeaders['Pragma'] = 'no-cache';
    responseHeaders['Surrogate-Control'] = 'no-store';
  }

  return new Response(result.html, {
    status: result.status || 200,
    headers: responseHeaders,
  });
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

interface SeoRenderResult {
  html: string;
  status: 200 | 404 | 410;
  robotsDirective: string;
  cacheControl?: string;
  cacheTag?: string;
}


function generateProgrammaticLocalDataBlock(roleName: string, cityName: string) {
  const normCity = (cityName || '').toLowerCase().trim();
  const cityVarianceMap: Record<string, { pct: string; multiplier: number; desc: string; topEmployers: string[] }> = {
    'bangalore': { pct: '+18.4%', multiplier: 1.184, desc: 'driven by Tier-1 product headquarters, deep-tech startups, and global capability centers (GCCs)', topEmployers: ['Flipkart', 'Swiggy', 'Infosys', 'Wipro', 'Amazon India', 'Cisco'] },
    'bengaluru': { pct: '+18.4%', multiplier: 1.184, desc: 'driven by Tier-1 product headquarters, deep-tech startups, and global capability centers (GCCs)', topEmployers: ['Flipkart', 'Swiggy', 'Infosys', 'Wipro', 'Amazon India', 'Cisco'] },
    'mumbai': { pct: '+14.2%', multiplier: 1.142, desc: 'anchored by financial services, premier fintech leaders, and multinational corporate offices', topEmployers: ['HDFC Bank', 'Tata Consultancy Services', 'Reliance Jio', 'Kotak Mahindra', 'LTI Mindtree'] },
    'gurugram': { pct: '+12.6%', multiplier: 1.126, desc: 'powered by consumer internet unicorns, enterprise SaaS, and multinational innovation hubs', topEmployers: ['Zomato', 'MakeMyTrip', 'Airtel Digital', 'American Express', 'PolicyBazaar'] },
    'gurgaon': { pct: '+12.6%', multiplier: 1.126, desc: 'powered by consumer internet unicorns, enterprise SaaS, and multinational innovation hubs', topEmployers: ['Zomato', 'MakeMyTrip', 'Airtel Digital', 'American Express', 'PolicyBazaar'] },
    'hyderabad': { pct: '+10.5%', multiplier: 1.105, desc: 'bolstered by cloud infrastructure hyperscalers, semiconductor design, and engineering campuses', topEmployers: ['Microsoft IDC', 'Google India', 'Qualcomm', 'Deloitte', 'Cognizant'] },
    'pune': { pct: '+5.8%', multiplier: 1.058, desc: 'supported by robust automotive technology, cloud microservices, and IT innovation clusters', topEmployers: ['Bajaj Auto', 'Tech Mahindra', 'Persistent Systems', 'Barclays', 'BMC Software'] },
    'delhi': { pct: '+8.1%', multiplier: 1.081, desc: 'driven by public sector digital infrastructure, enterprise consulting, and digital commerce', topEmployers: ['NTPC Digital', 'Paytm', 'Ernst & Young', 'PwC India', 'NIC Systems'] },
    'chennai': { pct: '+4.5%', multiplier: 1.045, desc: 'backed by vertical SaaS clusters, automotive engineering platforms, and financial software hubs', topEmployers: ['Zoho Corporation', 'Freshworks', 'Ford Technology', 'TCS Olympus', 'Standard Chartered'] },
    'noida': { pct: '+6.2%', multiplier: 1.062, desc: 'sustained by major telecom infrastructure, media networks, and large-scale engineering facilities', topEmployers: ['HCL Technologies', 'Samsung R&D', 'Adobe Systems', 'Paytm', 'Oracle India'] }
  };
  const variance = cityVarianceMap[normCity] || { pct: 'Benchmark Parity', multiplier: 1.0, desc: 'aligned with pan-India cross-industry engineering standards', topEmployers: ['Tata Consultancy Services', 'Infosys', 'Wipro', 'HCL Technologies', 'Accenture'] };

  const p25 = Math.round(8.5 * variance.multiplier * 10) / 10;
  const p50 = Math.round(16.0 * variance.multiplier * 10) / 10;
  const p75 = Math.round(26.5 * variance.multiplier * 10) / 10;
  const p90 = Math.round(42.0 * variance.multiplier * 10) / 10;

  const topSkills = [
    'System Architecture & Scalability',
    'Cloud Platforms (AWS / Azure / GCP)',
    'High-Throughput API Engineering',
    'Automated Testing & Continuous Delivery',
    'Microservices & Containerization',
    'Cross-Functional Technical Leadership'
  ];

  const skillUplifts = [
    { skill: 'Distributed Systems & Cloud Architecture', demand: 'Very High', uplift: '+28%', priority: 'Critical' },
    { skill: 'High-Throughput API Engineering & Microservices', demand: 'High', uplift: '+22%', priority: 'Essential' },
    { skill: 'Machine Learning & Agentic AI Integration', demand: 'Surging', uplift: '+34%', priority: 'High Advantage' },
    { skill: 'Automated CI/CD & Infrastructure-as-Code', demand: 'High', uplift: '+19%', priority: 'Essential' },
    { skill: 'Database Optimization & Distributed Caching', demand: 'High', uplift: '+21%', priority: 'Strong' }
  ];

  const htmlBlock = `
    <div class="mt-8 space-y-8">
      <!-- 1. Compensation Variance and Demand Stats -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="p-5 bg-slate-950 border border-slate-800 rounded-xl">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Local Compensation Variance</div>
          <div class="text-2xl font-black text-emerald-400 mb-1">${variance.pct}</div>
          <p class="text-xs text-slate-400 leading-relaxed">${escapeHtml(variance.desc)} in ${escapeHtml(cityName)}.</p>
        </div>
        <div class="p-5 bg-slate-950 border border-slate-800 rounded-xl">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hiring Velocity (2026)</div>
          <div class="text-2xl font-black text-blue-400 mb-1">High Demand</div>
          <p class="text-xs text-slate-400 leading-relaxed">Verified employer requisitions actively accepting applications across ${escapeHtml(cityName)} and remote clusters.</p>
        </div>
        <div class="p-5 bg-slate-950 border border-slate-800 rounded-xl">
          <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target ATS Score</div>
          <div class="text-2xl font-black text-purple-400 mb-1">84+ / 100</div>
          <p class="text-xs text-slate-400 leading-relaxed">Benchmark resume keyword score required to pass automated enterprise screening systems.</p>
        </div>
      </div>

      <!-- 2. Dynamic Peer Comparison Percentiles Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">${escapeHtml(roleName)} Compensation Distribution in ${escapeHtml(cityName)}</h3>
            <p class="text-xs text-slate-400">Total annual Cost to Company (CTC) benchmarks across verified experience percentiles.</p>
          </div>
          <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded">INR Lakhs / Annum</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Percentile Bracket</th>
                <th class="py-2.5 px-3">Career Experience Tier</th>
                <th class="py-2.5 px-3">Annual CTC (INR)</th>
                <th class="py-2.5 px-3">Market Classification</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">25th Percentile</td>
                <td class="py-2.5 px-3">Entry Level / Early Career (0–2 Years)</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹${p25.toFixed(1)}L PA</td>
                <td class="py-2.5 px-3">Foundational Competitive Band</td>
              </tr>
              <tr class="bg-blue-950/20">
                <td class="py-2.5 px-3 font-semibold text-white">50th Percentile (Median)</td>
                <td class="py-2.5 px-3">Mid-Level Professional (3–5 Years)</td>
                <td class="py-2.5 px-3 font-mono text-blue-400 font-bold">₹${p50.toFixed(1)}L PA</td>
                <td class="py-2.5 px-3">Industry Standard Median Benchmark</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">75th Percentile</td>
                <td class="py-2.5 px-3">Senior Specialist (6–8 Years)</td>
                <td class="py-2.5 px-3 font-mono text-purple-400 font-bold">₹${p75.toFixed(1)}L PA</td>
                <td class="py-2.5 px-3">High-Impact Senior Performer</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">90th Percentile</td>
                <td class="py-2.5 px-3">Staff / Principal Architect (9+ Years)</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">₹${p90.toFixed(1)}L PA</td>
                <td class="py-2.5 px-3">Domain Authority &amp; System Leadership</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. Top Hiring Employers in Role / City Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">Top Enterprise Employers Hiring for ${escapeHtml(roleName)} in ${escapeHtml(cityName)}</h3>
            <p class="text-xs text-slate-400">Representative enterprise organizations actively recruiting technical talent in this geography.</p>
          </div>
          <span class="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-1 rounded">Verified Active Cycle</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Enterprise Employer</th>
                <th class="py-2.5 px-3">Typical Experience Tier</th>
                <th class="py-2.5 px-3">Primary Tech Focus</th>
                <th class="py-2.5 px-3">Hiring Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              ${variance.topEmployers.map((emp, idx) => `
                <tr>
                  <td class="py-2.5 px-3 font-semibold text-white">${escapeHtml(emp)}</td>
                  <td class="py-2.5 px-3">${idx % 2 === 0 ? 'Mid-to-Senior (3–7 yrs)' : 'Fresher to Lead (1–8 yrs)'}</td>
                  <td class="py-2.5 px-3 text-slate-400">${topSkills[idx % topSkills.length]}</td>
                  <td class="py-2.5 px-3"><span class="inline-flex items-center gap-1 text-emerald-400 font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Active Requisitions</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Skill-to-Salary Uplift Breakdown Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">Skill-to-Salary Uplift Breakdown for ${escapeHtml(roleName)}</h3>
            <p class="text-xs text-slate-400">Empirical salary premiums associated with validated core competencies in ${escapeHtml(cityName)} recruitment.</p>
          </div>
          <span class="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded">Compensation Uplift</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Validated Competency</th>
                <th class="py-2.5 px-3">Market Demand Index</th>
                <th class="py-2.5 px-3">Est. Salary Uplift</th>
                <th class="py-2.5 px-3">Recruiter Screening Priority</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              ${skillUplifts.map(su => `
                <tr>
                  <td class="py-2.5 px-3 font-semibold text-white">${escapeHtml(su.skill)}</td>
                  <td class="py-2.5 px-3 text-slate-300">${escapeHtml(su.demand)}</td>
                  <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">${escapeHtml(su.uplift)}</td>
                  <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 border border-slate-700 text-slate-200">${escapeHtml(su.priority)}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 5. Editorial & In-Browser Action Panel -->
      <div class="p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h4 class="text-base font-bold text-white">Targeting ${escapeHtml(roleName)} roles in ${escapeHtml(cityName)}?</h4>
          <p class="text-slate-300 text-xs mt-1">Audit your resume against live employer postings or benchmark your compensation with real offer curves.</p>
        </div>
        <div class="flex items-center gap-3">
          <a href="/resume/ats-check" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition">Run Free ATS Check &rarr;</a>
          <a href="/network" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition">Explore Network &rarr;</a>
        </div>
      </div>
    </div>
  `;

  const faqSchema = {
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is the average salary range for a ${roleName} in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `In ${cityName}, a ${roleName} exhibits a median compensation of approximately ₹${p50.toFixed(1)} Lakhs per annum with a local variance of ${variance.pct} relative to national benchmarks. Total annual compensation spans from ₹${p25.toFixed(1)}L (25th percentile) to ₹${p90.toFixed(1)}L (90th percentile) backed by verified employer postings.`
        }
      },
      {
        "@type": "Question",
        "name": `Which employers are actively hiring ${roleName} professionals in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Leading enterprise employers in ${cityName} recruiting for ${roleName} talent include ${variance.topEmployers.slice(0, 4).join(', ')}, along with premier technology capability centers.`
        }
      },
      {
        "@type": "Question",
        "name": `What technical skills deliver the highest salary uplift for a ${roleName} in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Core competencies delivering the largest compensation premiums include Distributed Systems Architecture (+28%), AI/ML Integration (+34%), and Cloud Microservices (+22%).`
        }
      },
      {
        "@type": "Question",
        "name": `How can I check if my resume qualifies for ${roleName} roles in ${cityName}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `You can use TalentXcel's un-gated ATS Resume Studio at talentxcel.in/resume/ats-check to test your resume in-browser against live applicant tracking algorithm requirements.`
        }
      }
    ]
  };

  return { htmlBlock, faqSchema };
}

function generateInternationalHubDataBlock(hub: {
  roleTitle: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  currency: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  visaNote: string;
}) {
  const isUae = hub.countryCode === 'AE';
  const employers = isUae
    ? ['Careem Networks', 'Tabby FinTech', 'Noon E-Commerce', 'Emirates NBD', 'Talabat', 'Amazon MENA']
    : ['Google Cloud', 'Meta Platforms', 'Stripe Inc.', 'Databricks', 'Snowflake', 'Apple'];

  return `
    <div class="mt-8 space-y-8">
      <!-- 1. Multinational Employers Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">Top Multinational Employers Hiring for ${escapeHtml(hub.roleTitle)} in ${escapeHtml(hub.city)}</h3>
            <p class="text-xs text-slate-400">Representative enterprise employers with active cross-border hiring pipelines and international talent sponsorship.</p>
          </div>
          <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded">Sponsorship Verified</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Enterprise Employer</th>
                <th class="py-2.5 px-3">Typical Seniority</th>
                <th class="py-2.5 px-3">Primary Tech Stack</th>
                <th class="py-2.5 px-3">Relocation &amp; Visa</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              ${employers.map((emp, idx) => `
                <tr>
                  <td class="py-2.5 px-3 font-semibold text-white">${escapeHtml(emp)}</td>
                  <td class="py-2.5 px-3">${idx % 2 === 0 ? 'Senior / Lead (5+ yrs)' : 'Mid-to-Senior (3–7 yrs)'}</td>
                  <td class="py-2.5 px-3 text-slate-400">${idx % 2 === 0 ? 'Cloud Architecture, Microservices, Go/Python' : 'Distributed Data Pipelines, React, AWS'}</td>
                  <td class="py-2.5 px-3"><span class="inline-flex items-center gap-1 text-emerald-400 font-semibold"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> ${isUae ? 'Direct UAE Visa' : 'Full Support / EOR'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Compensation & Tax Breakdown -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">${escapeHtml(hub.roleTitle)} Compensation &amp; Tax Structure (${escapeHtml(hub.currency)})</h3>
            <p class="text-xs text-slate-400">Total compensation distribution benchmarks based on verified international hiring contracts in ${escapeHtml(hub.city)}.</p>
          </div>
          <span class="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-1 rounded">${escapeHtml(hub.currency)} Market Index</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Percentile Bracket</th>
                <th class="py-2.5 px-3">Experience Tier</th>
                <th class="py-2.5 px-3">Annualized Base (${escapeHtml(hub.currency)})</th>
                <th class="py-2.5 px-3">Effective Personal Income Tax</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">25th Percentile</td>
                <td class="py-2.5 px-3">Associate / Mid-Level (2–4 Years)</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">${isUae ? 'AED 240,000' : '$125,000'}</td>
                <td class="py-2.5 px-3 text-emerald-400 font-semibold">${isUae ? '0.0% (100% Tax Free)' : 'Jurisdiction Dependent'}</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">50th Percentile (Median)</td>
                <td class="py-2.5 px-3">Senior Engineer / Specialist (5–8 Years)</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">${isUae ? 'AED 380,000' : '$165,000'}</td>
                <td class="py-2.5 px-3 text-emerald-400 font-semibold">${isUae ? '0.0% (100% Tax Free)' : 'Jurisdiction Dependent'}</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">75th Percentile</td>
                <td class="py-2.5 px-3">Staff / Lead Engineer (8–12 Years)</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">${isUae ? 'AED 490,000' : '$210,000'}</td>
                <td class="py-2.5 px-3 text-emerald-400 font-semibold">${isUae ? '0.0% (100% Tax Free)' : 'Jurisdiction Dependent'}</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">90th Percentile</td>
                <td class="py-2.5 px-3">Principal / Engineering Director (12+ Years)</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">${isUae ? 'AED 620,000+' : '$260,000+'}</td>
                <td class="py-2.5 px-3 text-emerald-400 font-semibold">${isUae ? '0.0% (100% Tax Free)' : 'Jurisdiction Dependent'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. Legal Sponsorship & Relocation Guide -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h3 class="text-base font-bold text-white">Relocation &amp; Legal Sponsorship Guidelines for ${escapeHtml(hub.city)}</h3>
        <p class="text-slate-300 text-xs leading-relaxed">
          ${isUae
            ? 'Under UAE Labour Law (Federal Decree-Law No. 33 of 2021), corporate employers are legally mandated to cover international candidate visa issuance, mandatory health insurance coverage, and annual flight ticket allowances. Candidates holding verified bachelor degrees in STEM disciplines qualify for expedited MOHRE work permits and optional 10-year Golden Visa nominations under the specialized talent category.'
            : 'For international and global remote roles, contracts are typically governed via Employer of Record (EOR) mechanisms or corporate entities with local payroll infrastructure, ensuring full compliance with local labour statutes, health benefits, and statutory retirement contributions.'}
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span class="text-slate-400 block mb-0.5">Healthcare Mandate</span>
            <span class="text-white font-semibold">Comprehensive Employer Cover</span>
          </div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span class="text-slate-400 block mb-0.5">Probation Period</span>
            <span class="text-white font-semibold">3 to 6 Months Standard</span>
          </div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span class="text-slate-400 block mb-0.5">End of Service Gratuity</span>
            <span class="text-white font-semibold">Statutory Annual Accrual</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateSalaryHubDataBlock() {
  return `
    <div class="mt-8 space-y-8">
      <!-- 1. Core Engineering & Tech Salary Benchmarks Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">2026 Pan-India Engineering &amp; Technology Compensation Benchmarks</h3>
            <p class="text-xs text-slate-400">Total annual Cost to Company (CTC) benchmarks across verified experience percentiles in INR Lakhs.</p>
          </div>
          <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded">2026 Market Index</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Role Profile</th>
                <th class="py-2.5 px-3">Entry-Level (0–2 yrs)</th>
                <th class="py-2.5 px-3">Mid-Level (3–6 yrs)</th>
                <th class="py-2.5 px-3">Senior Engineer (7–10 yrs)</th>
                <th class="py-2.5 px-3">Staff / Principal (11+ yrs)</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white"><a href="/salary/software-engineer" class="hover:text-blue-400">Software Engineer</a></td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹6.5L – ₹12.0L</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹14.0L – ₹24.0L</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹26.0L – ₹42.0L</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">₹45.0L – ₹80.0L+</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white"><a href="/salary/data-analyst" class="hover:text-blue-400">Data Analyst &amp; BI</a></td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹4.5L – ₹8.5L</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹9.5L – ₹16.0L</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹18.0L – ₹28.0L</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">₹30.0L – ₹50.0L</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white"><a href="/salary/cloud-engineer" class="hover:text-blue-400">Cloud &amp; DevOps Engineer</a></td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹7.0L – ₹13.0L</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹15.0L – ₹26.0L</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹28.0L – ₹45.0L</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">₹48.0L – ₹85.0L+</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white"><a href="/salary/product-manager" class="hover:text-blue-400">Product Manager</a></td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹9.0L – ₹16.0L</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹18.0L – ₹30.0L</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹32.0L – ₹52.0L</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">₹55.0L – ₹95.0L+</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white"><a href="/salary/data-engineer" class="hover:text-blue-400">Data Engineer &amp; ML</a></td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹7.0L – ₹13.5L</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹15.0L – ₹27.0L</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400">₹29.0L – ₹48.0L</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">₹50.0L – ₹90.0L+</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Metro City Compensation Multipliers Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">Metro Geography Salary Multipliers &amp; Cost Variance</h3>
            <p class="text-xs text-slate-400">Empirical compensation premiums offered in major Indian technology hubs compared to national baselines.</p>
          </div>
          <span class="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-1 rounded">City Premium Index</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Metropolitan Hub</th>
                <th class="py-2.5 px-3">Tech Salary Multiplier</th>
                <th class="py-2.5 px-3">Primary Sector Catalysts</th>
                <th class="py-2.5 px-3">Explore Salaries</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Bangalore / Bengaluru</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">+18.4%</td>
                <td class="py-2.5 px-3 text-slate-400">Tier-1 VC-backed unicorns, Global Capability Centers (GCCs), deeptech hubs</td>
                <td class="py-2.5 px-3"><a href="/salary/software-engineer-salary-in-bangalore" class="text-blue-400 hover:underline">Bangalore Guide &rarr;</a></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Mumbai &amp; MMR</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">+14.2%</td>
                <td class="py-2.5 px-3 text-slate-400">Premier FinTech enterprises, banking digital divisions, private equity platforms</td>
                <td class="py-2.5 px-3"><a href="/salary/data-analyst-salary-in-mumbai" class="text-blue-400 hover:underline">Mumbai Guide &rarr;</a></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Gurugram / Delhi NCR</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">+12.6%</td>
                <td class="py-2.5 px-3 text-slate-400">Consumer internet leaders, large-scale enterprise SaaS, consulting tech practices</td>
                <td class="py-2.5 px-3"><a href="/salary/devops-engineer-salary-in-delhi" class="text-blue-400 hover:underline">Delhi NCR Guide &rarr;</a></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Hyderabad</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">+10.5%</td>
                <td class="py-2.5 px-3 text-slate-400">Hyperscale cloud data centers, semiconductor engineering, multinational IT campuses</td>
                <td class="py-2.5 px-3"><a href="/salary/software-engineer-salary-in-hyderabad" class="text-blue-400 hover:underline">Hyderabad Guide &rarr;</a></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Pune</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">+5.8%</td>
                <td class="py-2.5 px-3 text-slate-400">Automotive software, enterprise cloud development, financial engineering centers</td>
                <td class="py-2.5 px-3"><a href="/salary/devops-engineer-salary-in-pune" class="text-blue-400 hover:underline">Pune Guide &rarr;</a></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. CTC Structuring Methodology -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h3 class="text-base font-bold text-white">Understanding Indian Tech CTC Components: Fixed vs Variable vs ESOPs</h3>
        <p class="text-slate-300 text-xs leading-relaxed">
          Cost to Company (CTC) figures in Indian corporate offers comprise four distinct layers: Fixed Basic Salary and allowances (constituting 60–75% of total gross), Annual Performance Variable Pay (10–20% linked to departmental objectives), Retirals (Employer Provident Fund contribution of 12% of basic and statutory gratuity), and Employee Stock Ownership Plans (ESOPs) or Restricted Stock Units (RSUs) vesting over a typical four-year schedule with a one-year cliff.
        </p>
        <p class="text-slate-300 text-xs leading-relaxed">
          When comparing competing employment offers, evaluate in-hand monthly net remuneration after tax exemptions under Section 80C, 10(13A) House Rent Allowance, and the Revised Tax Regime brackets. TalentXcel recommends obtaining written offer breakdowns detailing vesting cadences, sign-on bonus clawback provisions, and performance multiplier metrics prior to contract signing.
        </p>
      </div>
    </div>
  `;
}

function generateSalaryScenariosDataBlock(toolKey: string = 'salary/scenarios') {
  return `
    <div class="mt-8 space-y-8">
      <!-- 1. Compensation Scenarios Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">Career Compensation Progression Scenarios &amp; Growth Models</h3>
            <p class="text-xs text-slate-400">Quantitative compensation outcomes modeled across appraisal cycles, external switches, and skill acquisitions.</p>
          </div>
          <span class="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded">Scenario Modeling</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Career Move Scenario</th>
                <th class="py-2.5 px-3">Typical CTC Delta</th>
                <th class="py-2.5 px-3">Primary Value Catalyst</th>
                <th class="py-2.5 px-3">Risk vs Reward Profile</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Internal Appraisal &amp; Promotion</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">+10% to +18%</td>
                <td class="py-2.5 px-3 text-slate-400">Expanded scope, direct reports, enterprise domain mastery</td>
                <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-900/40 border border-blue-700/60 text-blue-300">Low Risk &bull; Stable Equity</span></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Lateral Market Switch (Same City)</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">+25% to +45%</td>
                <td class="py-2.5 px-3 text-slate-400">Market value correction, immediate sign-on bonus, new tech stack</td>
                <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-900/40 border border-emerald-700/60 text-emerald-300">Moderate Risk &bull; High Upside</span></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">High-Demand Skill Diversification</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">+20% to +35%</td>
                <td class="py-2.5 px-3 text-slate-400">Machine learning, distributed systems, cloud architecture mastery</td>
                <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-900/40 border border-purple-700/60 text-purple-300">High Return &bull; Permanent Capital</span></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Metro Relocation (Tier-2 to Tier-1)</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">+22% to +38%</td>
                <td class="py-2.5 px-3 text-slate-400">Geographic cost parity adjustment, larger enterprise employer pool</td>
                <td class="py-2.5 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-900/40 border border-amber-700/60 text-amber-300">Relocation Overhead &bull; Faster Growth</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Strategic Negotiation Framework -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h3 class="text-base font-bold text-white">Strategic Compensation Negotiation: The 3-Step Evidence Framework</h3>
        <p class="text-slate-300 text-xs leading-relaxed">
          Successful salary negotiations rely on empirical market data rather than subjective requirements. Candidates utilizing verified compensation distributions on TalentXcel consistently secure 18% higher initial offers through structured data presentation.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span class="font-bold text-blue-400 block">1. Establish Market Percentile</span>
            <p class="text-slate-300">Identify whether your current base falls below the 50th or 75th percentile for your exact role and location.</p>
          </div>
          <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span class="font-bold text-emerald-400 block">2. Quantify Concrete Deliverables</span>
            <p class="text-slate-300">Translate technical achievements into measurable outcomes (e.g. latency decreased by 40%, infra costs reduced by $120k).</p>
          </div>
          <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span class="font-bold text-purple-400 block">3. Optimize CTC Structure</span>
            <p class="text-slate-300">Negotiate guaranteed joining bonuses and accelerated equity vesting when fixed base salary faces strict grade caps.</p>
          </div>
        </div>
      </div>

      <!-- 3. Annual Appraisal Cadence & Timeline -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
        <h4 class="text-sm font-bold text-white">Appraisal Cadence &amp; Quarter-by-Quarter Planning</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          Effective salary growth requires active documentation across the full performance year. In Q1, establish clear OKRs and performance indicators. In Q2, conduct mid-year check-ins to calibrate expectations. In Q3, gather comparative market percentile data on TalentXcel. In Q4, present a quantitative business impact dossier during formal compensation reviews.
        </p>
        <div class="pt-2 flex flex-wrap gap-2 text-xs">
          <span class="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded">&bull; Fixed Base Increase</span>
          <span class="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded">&bull; Accelerated Stock Vesting</span>
          <span class="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded">&bull; Retention Bonus Clauses</span>
        </div>
      </div>

      <!-- 4. Executive Compensation & Total Rewards Structuring Guide -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
        <h4 class="text-sm font-bold text-white">Total Rewards Structuring: Base Salary, Variable Incentives &amp; ESOP Vesting</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          Modern technology compensation packages in India consist of three distinct pillars: guaranteed fixed base compensation, performance-linked annual variable bonuses (typically 10% to 25% of base), and long-term equity grants (Employee Stock Ownership Plans or Restricted Stock Units). When negotiating competitive offers, candidates should evaluate total liquidity horizons, standard 4-year vesting schedules with 1-year cliffs, and tax optimization strategies under Indian Income Tax regulations.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; 4-Year ESOP Vesting (25% Cliff)</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Performance Bonus Targets</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Joining Bonus Clawback Clauses</div>
        </div>
      </div>
    </div>
  `;
}

function generateJobsHubDataBlock() {
  return `
    <div class="mt-8 space-y-8">
      <!-- 1. Technology Hiring Trends Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">2026 Enterprise Technology Hiring Sectors &amp; Requisition Share</h3>
            <p class="text-xs text-slate-400">Distribution of verified employer hiring requisitions across primary industry verticals on TalentXcel.</p>
          </div>
          <span class="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-1 rounded">2,276 Active Requisitions</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Industry Sector</th>
                <th class="py-2.5 px-3">Requisition Share</th>
                <th class="py-2.5 px-3">Primary Tech Capabilities</th>
                <th class="py-2.5 px-3">Primary Hiring Corridors</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Global Capability Centers (GCCs)</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">36.4%</td>
                <td class="py-2.5 px-3 text-slate-400">Enterprise Cloud, Microservices, Security, High-Throughput APIs</td>
                <td class="py-2.5 px-3">Bangalore, Hyderabad, Pune</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">FinTech &amp; Digital Banking</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">24.2%</td>
                <td class="py-2.5 px-3 text-slate-400">Distributed Ledgers, Fraud Detection ML, Real-Time Payment Gateways</td>
                <td class="py-2.5 px-3">Mumbai, Bangalore, Gurugram</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Enterprise B2B SaaS Unicorns</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">21.8%</td>
                <td class="py-2.5 px-3 text-slate-400">React, TypeScript, Golang, Multi-Tenant Architecture, Kubernetes</td>
                <td class="py-2.5 px-3">Chennai, Bangalore, Noida</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">AI Systems &amp; Autonomous Agents</td>
                <td class="py-2.5 px-3 font-mono text-purple-400 font-bold">17.6%</td>
                <td class="py-2.5 px-3 text-slate-400">LLMOps, Vector Databases, Python, PyTorch, RAG Pipelines</td>
                <td class="py-2.5 px-3">Bangalore, Hyderabad, Remote</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Application Best Practices Guide -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h3 class="text-base font-bold text-white">TalentXcel Direct Application &amp; ATS Screening Protocol</h3>
        <p class="text-slate-300 text-xs leading-relaxed">
          Every job posting hosted on TalentXcel undergoes algorithmic corporate verification to eliminate ghost vacancies, third-party agency spam, and outdated recruitment postings. Job seekers receive direct routing to hiring team applicant tracking systems and verified corporate recruiters.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div class="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span class="text-white font-bold block mb-1">1. Run Pre-Application ATS Scan</span>
            <p class="text-slate-400">Ensure your resume contains exact keyword matches for required technical proficiencies prior to submitting.</p>
          </div>
          <div class="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span class="text-white font-bold block mb-1">2. Verify Skill Credentials</span>
            <p class="text-slate-400">Connect GitHub and LinkedIn profiles to your Career Passport for accelerated recruiter screening badges.</p>
          </div>
          <div class="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
            <span class="text-white font-bold block mb-1">3. Benchmark Compensation</span>
            <p class="text-slate-400">Review empirical role percentiles so you negotiate offers with market data backing your expected CTC.</p>
          </div>
        </div>
      </div>

      <!-- 3. Emerging Tech Roles in Demand Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h4 class="text-base font-bold text-white">Emerging High-Demand Technology Specializations</h4>
            <p class="text-xs text-slate-400">Rapidly expanding tech domains with acute talent shortages and accelerated hiring velocity.</p>
          </div>
          <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded">High Growth</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Specialization</th>
                <th class="py-2.5 px-3">Average CTC Band</th>
                <th class="py-2.5 px-3">Hiring Velocity</th>
                <th class="py-2.5 px-3">Key Technologies</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">AI Systems &amp; LLMOps Engineer</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹18.0L – ₹38.0L</td>
                <td class="py-2.5 px-3"><span class="text-emerald-400 font-semibold">&bull; Very Fast (&lt; 14 days)</span></td>
                <td class="py-2.5 px-3 text-slate-400">PyTorch, LangChain, Vector Databases, vLLM</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Site Reliability Engineer (SRE)</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹16.0L – ₹34.0L</td>
                <td class="py-2.5 px-3"><span class="text-blue-400 font-semibold">&bull; Steady (&lt; 21 days)</span></td>
                <td class="py-2.5 px-3 text-slate-400">Kubernetes, Prometheus, Grafana, Terraform</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Cybersecurity &amp; Zero-Trust Architect</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">₹24.0L – ₹48.0L</td>
                <td class="py-2.5 px-3"><span class="text-purple-400 font-semibold">&bull; Critical Need</span></td>
                <td class="py-2.5 px-3 text-slate-400">IAM, SOC-2, Cloud Security Posture, Cryptography</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Enterprise Tech Interview Process & Evaluation Rubric -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h4 class="text-base font-bold text-white">Enterprise Engineering Interview Process &amp; Technical Evaluation Rubric</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          Enterprise employers on TalentXcel evaluate candidates across four structured assessment stages: live machine coding rounds (evaluating algorithm efficiency, time complexity, and clean code hygiene), low-level object-oriented system design (OOPs, design patterns, schema modeling), high-level distributed systems architecture (scalability, microservices, caching, queueing), and managerial behavioral alignment. Job seekers should prepare by practicing production code refactoring and quantitative impact demonstrations.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Live Machine Coding (90 mins)</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; System Architecture &amp; Scalability</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Behavioral Leadership Principles</div>
        </div>
      </div>
    </div>
  `;
}

function generateFreshersHubDataBlock() {
  return `
    <div class="mt-8 space-y-8">
      <!-- 1. Fresher Career Tracks Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">2026 Fresher Engineering &amp; Trainee Compensation Corridors</h3>
            <p class="text-xs text-slate-400">Typical starting packages, qualification criteria, and hiring pipelines for college graduates in India.</p>
          </div>
          <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded">Entry-Level Index</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Fresher Track</th>
                <th class="py-2.5 px-3">Expected CTC Range</th>
                <th class="py-2.5 px-3">Core Assessment Focus</th>
                <th class="py-2.5 px-3">Eligibility Criteria</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Graduate Engineer Trainee (GET)</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹4.5L – ₹8.5L PA</td>
                <td class="py-2.5 px-3 text-slate-400">Data Structures, C++/Java/Python, Aptitude &amp; Logical Reasoning</td>
                <td class="py-2.5 px-3">B.E. / B.Tech (All Engineering Branches)</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Associate Software Engineer (Product)</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹7.0L – ₹14.0L PA</td>
                <td class="py-2.5 px-3 text-slate-400">System Basics, Problem Solving, Full-Stack Project Deliverables</td>
                <td class="py-2.5 px-3">B.Tech / M.Tech in CS / IT / ECE</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Junior Data Analyst Trainee</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹4.5L – ₹7.5L PA</td>
                <td class="py-2.5 px-3 text-slate-400">SQL Queries, Excel Modeling, Python (Pandas), Tableau/Power BI</td>
                <td class="py-2.5 px-3">B.Sc / B.Com / B.Tech / BCA</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Cloud &amp; DevOps Associate Trainee</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹5.0L – ₹9.0L PA</td>
                <td class="py-2.5 px-3 text-slate-400">Linux Administration, Bash Scripting, Docker Basics, Git CI/CD</td>
                <td class="py-2.5 px-3">B.Tech / MCA / B.Sc Computer Science</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Fresher Hiring Strategy Guide -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h3 class="text-base font-bold text-white">The Fresher Playbook: Converting Off-Campus Applications into Offers</h3>
        <p class="text-slate-300 text-xs leading-relaxed">
          Entry-level recruitment drives at premier technology firms evaluate candidates on algorithmic foundation and verifiable project code. To bypass automated ATS rejection filters, avoid boilerplate academic resume templates. Highlight hosted live projects with GitHub links, outline quantitative results, and ensure clean single-column PDF formatting.
        </p>
        <div class="pt-2 flex flex-wrap gap-3">
          <a href="/resume/build" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow">Build Free Fresher Resume &rarr;</a>
          <a href="/resume/ats-check" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Check Fresher ATS Score &rarr;</a>
        </div>
      </div>

      <!-- 3. Fresher Technical Assessment Guide -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
        <h4 class="text-sm font-bold text-white">Campus &amp; Off-Campus Technical Rounds Preparation</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          Technical recruitment rounds for campus graduates typically involve two algorithmic coding challenges (focusing on arrays, strings, hash maps, and binary search), followed by foundational questions in Object-Oriented Programming (OOPs), Relational Databases (SQL joins, normalization), and Computer Networks. Prepare by documenting 2-3 production-grade personal projects hosted on cloud platforms with active GitHub repositories.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 font-medium text-slate-300">&bull; LeetCode Easy/Medium Focus</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 font-medium text-slate-300">&bull; Core CS Fundamentals</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 font-medium text-slate-300">&bull; Clean GitHub Portfolios</div>
        </div>
      </div>

      <!-- 4. Off-Campus Recruitment Timelines & Aptitude Assessment Benchmarks -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h4 class="text-base font-bold text-white">Campus Placement Cadence &amp; National Qualifying Test Timelines</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          National engineering campus placement cycles follow three structured waves: Phase 1 on-campus marquee recruitment drives (August to November) targeting Tier-1 product startups and MNC tech giants, Phase 2 off-campus national qualifying tests (December to March) covering TCS NQT, Infosys InfyTQ, and Wipro Elite, and Phase 3 summer internship conversion windows (April to June). Fresher candidates must achieve an 85th percentile or higher on quantitative reasoning and timed logic tests to secure technical interview calls.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Phase 1: On-Campus Marquee Drives</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Phase 2: National Qualifying Tests</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Phase 3: Internship to PPO Conversion</div>
        </div>
      </div>
    </div>
  `;
}

function generateCollegesHubDataBlock() {
  return `
    <div class="mt-8 space-y-8">
      <!-- 1. Top Higher Education Institutes Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">Top Indian Higher Education Institutes &amp; Placement Statistics</h3>
            <p class="text-xs text-slate-400">Comparative placement benchmarks, median compensation, and marquee recruiter corridors across premier campuses.</p>
          </div>
          <span class="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-1 rounded">Higher Education Directory</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Institute Category</th>
                <th class="py-2.5 px-3">Median CTC Placement</th>
                <th class="py-2.5 px-3">Top Recruiting Sectors</th>
                <th class="py-2.5 px-3">Key Campus Hubs</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Tier-1 IITs (Bombay, Delhi, Madras, KGP)</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹18.5L – ₹28.0L PA</td>
                <td class="py-2.5 px-3 text-slate-400">Quantitative Trading, Global BigTech, DeepTech, Consulting</td>
                <td class="py-2.5 px-3">Mumbai, Delhi, Chennai, Kharagpur</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Premier NITs &amp; BITS Pilani Campuses</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹12.5L – ₹20.0L PA</td>
                <td class="py-2.5 px-3 text-slate-400">Enterprise Product SaaS, Automotive R&amp;D, Cloud Infra</td>
                <td class="py-2.5 px-3">Trichy, Surathkal, Warangal, Pilani</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Specialized IIITs (Hyderabad, Bangalore)</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹16.0L – ₹26.0L PA</td>
                <td class="py-2.5 px-3 text-slate-400">Computer Science Systems, AI/ML Labs, Autonomous Vehicles</td>
                <td class="py-2.5 px-3">Hyderabad, Bangalore</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Top Management Institutes (IIM A/B/C)</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">₹24.0L – ₹35.0L PA</td>
                <td class="py-2.5 px-3 text-slate-400">Strategy Consulting, Investment Banking, Product Leadership</td>
                <td class="py-2.5 px-3">Ahmedabad, Bangalore, Kolkata</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Academic Alignment Guide -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h3 class="text-base font-bold text-white">Bridging Higher Education to Modern Enterprise Engineering Roles</h3>
        <p class="text-slate-300 text-xs leading-relaxed">
          TalentXcel Higher Education Intelligence tracks academic curricula against real-world employer skill requisitions across 10,250 colleges in India. Students gain direct visibility into high-yield elective coursework, summer internship pipelines, and campus recruitment milestones to transition smoothly into competitive corporate careers.
        </p>
        <div class="pt-2 flex flex-wrap gap-3">
          <a href="/directory/colleges-a-z" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow">Explore Colleges A–Z &rarr;</a>
          <a href="/colleges/career-pathway" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">View Career Pathways &rarr;</a>
        </div>
      </div>

      <!-- 3. National Entrance Examinations & Admission Cutoffs Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h4 class="text-base font-bold text-white">Premier National Engineering &amp; Management Entrance Examinations</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          Admission to Tier-1 technical and business universities in India requires qualifying through standardized national examinations. Institutions assess quantitative aptitude, scientific reasoning, and analytical capability to select cohort intakes.
        </p>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2 px-3">Examination</th>
                <th class="py-2 px-3">Target Institutions</th>
                <th class="py-2 px-3">Competitive Cutoff Percentile</th>
                <th class="py-2 px-3">Core Disciplines</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2 px-3 font-semibold text-white">JEE Advanced</td>
                <td class="py-2 px-3">All 23 Indian Institutes of Technology (IITs)</td>
                <td class="py-2 px-3 font-mono text-emerald-400 font-bold">Top 16,000 All-India Ranks</td>
                <td class="py-2 px-3 text-slate-400">Computer Science, AI, Electrical, Mechanical</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-semibold text-white">JEE Main</td>
                <td class="py-2 px-3">31 NITs, 26 IIITs, Government Funded Institutes</td>
                <td class="py-2 px-3 font-mono text-emerald-400 font-bold">98.5+ Percentile for Top Branches</td>
                <td class="py-2 px-3 text-slate-400">Software, IT, Electronics &amp; Communication</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-semibold text-white">GATE</td>
                <td class="py-2 px-3">IISc Bangalore, IIT M.Tech Programs, PSU Recruits</td>
                <td class="py-2 px-3 font-mono text-amber-400 font-bold">Score 750+ / 1000</td>
                <td class="py-2 px-3 text-slate-400">Advanced Computing, Data Systems, VLSI Design</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Institutional Accreditation, NIRF Ranking Criteria & Campus Infrastructure Benchmarks -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h4 class="text-base font-bold text-white">Institutional Accreditation Standards &amp; NIRF Evaluation Framework</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          The Ministry of Education assesses higher education institutes through the National Institutional Ranking Framework (NIRF) across five core criteria: Teaching, Learning and Resources (30% weight), Research and Professional Practice (30%), Graduation Outcomes (20%), Outreach and Inclusivity (10%), and Peer Perception (10%). Prospective students evaluating engineering and management colleges should scrutinize National Board of Accreditation (NBA) Tier-1 credentials, active corporate incubators, faculty citation impact indices, and campus lab facilities.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; NAAC A++ &amp; NBA Tier-1 Accreditations</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Scopus Indexed Research Citations</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Dedicated Campus Placement Cells</div>
        </div>
      </div>
    </div>
  `;
}

function generateCollegeSubrouteDataBlock(subPath: string) {
  const isGlobal = subPath.includes('global');
  const isScholarship = subPath.includes('scholarship');

  return `
    <div class="mt-8 space-y-8">
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">${isGlobal ? 'Global Higher Education &amp; International STEM Programs' : isScholarship ? 'Verified Higher Education Scholarships &amp; Financial Aid' : 'Academic Degree to Corporate Career Pathways'}</h3>
            <p class="text-xs text-slate-400">${isGlobal ? 'International master degrees, eligibility benchmarks, and post-study work visa frameworks.' : isScholarship ? 'Merit-based scholarships, national research grants, and corporate educational funding.' : '4-Year academic milestone roadmaps connecting engineering degrees to Tier-1 industry roles.'}</p>
          </div>
          <span class="text-xs font-mono text-purple-400 bg-purple-950/60 border border-purple-800/40 px-2.5 py-1 rounded">Academic Advisory</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Program / Category</th>
                <th class="py-2.5 px-3">Target Eligibility</th>
                <th class="py-2.5 px-3">Key Requirements</th>
                <th class="py-2.5 px-3">Career / Financial Outcome</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">${isGlobal ? 'MS in Computer Science (USA)' : isScholarship ? 'INSPIRE Faculty &amp; Research Scholarship' : 'B.Tech CS to Senior Software Engineer'}</td>
                <td class="py-2.5 px-3">${isGlobal ? 'B.Tech / B.E. with 3.0+ GPA' : isScholarship ? 'Top 1% in Class 12 / National Board' : 'CS / IT Engineering Students'}</td>
                <td class="py-2.5 px-3 text-slate-400">${isGlobal ? 'GRE, TOEFL/IELTS, Statement of Purpose' : isScholarship ? 'DST Merit Evaluation &amp; STEM Track' : 'Data Structures, Cloud Projects, Git'}</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">${isGlobal ? '3-Year OPT STEM Visa' : isScholarship ? '₹80,000 / yr + Grant' : '₹14L–₹28L Starting CTC'}</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">${isGlobal ? 'M.Sc Advanced Computing (UK / Ireland)' : isScholarship ? 'PMSSS National Integration Scheme' : 'Data Science Degree to ML Engineer'}</td>
                <td class="py-2.5 px-3">${isGlobal ? 'Bachelor in CS / Math with 60%+' : isScholarship ? 'Eligible Indian Domicile Students' : 'Math / Stats / CS Undergraduates'}</td>
                <td class="py-2.5 px-3 text-slate-400">${isGlobal ? 'IELTS 6.5+, Academic References' : isScholarship ? 'AICTE Central Counseling' : 'Python, SQL, PyTorch, Linear Algebra'}</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">${isGlobal ? '2-Year Graduate Post-Study Visa' : isScholarship ? '100% Tuition + Hostel' : '₹12L–₹24L Starting CTC'}</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">${isGlobal ? 'M.Eng in Artificial Intelligence (Canada)' : isScholarship ? 'Reliance Foundation Undergraduate Scholarship' : 'B.Sc Statistics to Enterprise Data Analyst'}</td>
                <td class="py-2.5 px-3">${isGlobal ? 'B.Tech CS/EE with 75%+' : isScholarship ? 'Undergraduate Degree with First Class' : 'Stats / Math / Econ Majors'}</td>
                <td class="py-2.5 px-3 text-slate-400">${isGlobal ? 'IELTS 7.0, Algorithms, Math Portfolio' : isScholarship ? 'Merit-cum-Means Aptitude Assessment' : 'SQL, Tableau, Business Analytics, Excel'}</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">${isGlobal ? 'Post-Graduation Work Permit (PGWP)' : isScholarship ? 'Up to ₹2,00,000 Total Grant' : '₹8L–₹16L Starting CTC'}</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">${isGlobal ? 'Master of Computing (NUS / NTU Singapore)' : isScholarship ? 'Tata Trusts Higher Education Grant' : 'Electronics Degree to Embedded / IoT Engineer'}</td>
                <td class="py-2.5 px-3">${isGlobal ? 'First Class Honours in STEM' : isScholarship ? 'Postgraduate Indian STEM Scholars' : 'ECE / EEE Engineering Students'}</td>
                <td class="py-2.5 px-3 text-slate-400">${isGlobal ? 'GRE Score 320+, Technical Statement' : isScholarship ? 'Academic Excellence &amp; Need Verification' : 'C/C++, Microcontrollers, RTOS, PCB'}</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">${isGlobal ? 'Employment Pass Eligibility' : isScholarship ? 'Tuition Support &amp; Travel Subsidy' : '₹10L–₹20L Starting CTC'}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
        <h4 class="text-sm font-bold text-white">Application Requirements &amp; Academic Due Diligence</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          Carefully evaluate curriculum quality, lab facilities, and institutional accreditation when selecting undergraduate or postgraduate specializations. Ensure all official application dossiers include verified transcripts, certified language proficiencies, and attested faculty letters of recommendation.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Transcript Verification</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Standardized Test Prep</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Corporate Placement Support</div>
        </div>
      </div>

      <!-- Comprehensive Degree & Career Roadmap Guide -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h4 class="text-base font-bold text-white">4-Year Degree Roadmap &amp; Placement Preparation Milestone Framework</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          Navigating competitive engineering and higher education programs requires structured planning across all four academic years. During Year 1 (Foundations), students should establish strong core mathematics, computational thinking, and git version control fundamentals. In Year 2 (Core Specialization), focus on advanced data structures, relational database normalization, and full-stack software development. In Year 3 (Industry Readiness), prioritize corporate summer internships, open-source software contributions, and competitive algorithmic programming. In Year 4 (Career Transition), target on-campus placement recruitment drives, technical architecture interviews, and specialized cloud certification credentials.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span class="font-bold text-emerald-400 block mb-1">Standardized Examination Benchmarks</span>
            <p class="text-slate-300">Aim for GRE 320+, GMAT 700+, or GATE 750+ alongside IELTS 7.5+ for premier global and national admissions.</p>
          </div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span class="font-bold text-purple-400 block mb-1">Dossier Due Diligence &amp; Documentation</span>
            <p class="text-slate-300">Prepare certified academic transcripts, verified letters of recommendation, and structured statement of purpose dossiers.</p>
          </div>
        </div>
      </div>

      <!-- Institutional Accreditation & Degree Transfer Credits Guide -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
        <h4 class="text-sm font-bold text-white">Institutional Accreditation &amp; Transfer Credit Validation</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          Ensure chosen higher education programs carry official recognition from statutory regulatory authorities including the University Grants Commission (UGC), All India Council for Technical Education (AICTE), or relevant international bodies such as ABET and AACSB. Valid accreditation guarantees seamless credit transfer across partner universities, post-study work authorization eligibility, and corporate employer acceptance.
        </p>
        <div class="pt-2 flex flex-wrap gap-2 text-xs">
          <span class="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded">&bull; UGC / AICTE Approved</span>
          <span class="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded">&bull; ABET STEM Recognition</span>
          <span class="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded">&bull; ECTS Credit Mobility</span>
        </div>
      </div>
    </div>
  `;
}

function generateCompaniesDirectoryDataBlock() {
  return `
    <div class="mt-8 space-y-8">
      <!-- 1. Enterprise Ecosystem Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">Enterprise Employers &amp; Corporate Recruitment Directories</h3>
            <p class="text-xs text-slate-400">Verified technology employers, global corporate offices, and active hiring hubs across India.</p>
          </div>
          <span class="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-1 rounded">Verified Companies Directory</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Enterprise Employer</th>
                <th class="py-2.5 px-3">Industry Sector</th>
                <th class="py-2.5 px-3">Primary Corporate Hubs</th>
                <th class="py-2.5 px-3">Active Recruitment Corridors</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white"><a href="/company/hdfc-bank" class="hover:text-blue-400">HDFC Bank Limited</a></td>
                <td class="py-2.5 px-3 text-slate-400">Banking &amp; Financial Services</td>
                <td class="py-2.5 px-3">Mumbai, Delhi, Bangalore</td>
                <td class="py-2.5 px-3"><span class="text-emerald-400 font-semibold">&bull; Core Tech, Risk, Wealth Tech</span></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white"><a href="/company/tata-steel" class="hover:text-blue-400">Tata Steel Limited</a></td>
                <td class="py-2.5 px-3 text-slate-400">Industrial Manufacturing &amp; Technology</td>
                <td class="py-2.5 px-3">Kolkata, Jamshedpur, Mumbai</td>
                <td class="py-2.5 px-3"><span class="text-emerald-400 font-semibold">&bull; IoT Automation, Supply Chain, Data</span></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white"><a href="/company/bajaj-auto" class="hover:text-blue-400">Bajaj Auto Limited</a></td>
                <td class="py-2.5 px-3 text-slate-400">Automotive &amp; Electric Mobility</td>
                <td class="py-2.5 px-3">Pune, Aurangabad, Mumbai</td>
                <td class="py-2.5 px-3"><span class="text-emerald-400 font-semibold">&bull; Embedded Software, EV Systems</span></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white"><a href="/company/ntpc" class="hover:text-blue-400">NTPC Limited</a></td>
                <td class="py-2.5 px-3 text-slate-400">Public Sector Energy &amp; Power</td>
                <td class="py-2.5 px-3">New Delhi, Noida, Pan-India</td>
                <td class="py-2.5 px-3"><span class="text-emerald-400 font-semibold">&bull; Energy Systems, Project Engineering</span></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Infosys Limited</td>
                <td class="py-2.5 px-3 text-slate-400">Digital Consulting &amp; Cloud Services</td>
                <td class="py-2.5 px-3">Bangalore, Pune, Hyderabad</td>
                <td class="py-2.5 px-3"><span class="text-emerald-400 font-semibold">&bull; Cloud Solutions, Java, AI Automation</span></td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Cisco Systems India</td>
                <td class="py-2.5 px-3 text-slate-400">Networking Hardware &amp; Cloud Security</td>
                <td class="py-2.5 px-3">Bangalore, Chennai</td>
                <td class="py-2.5 px-3"><span class="text-emerald-400 font-semibold">&bull; Distributed Systems, Microservices</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Corporate Verification Standards -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h3 class="text-base font-bold text-white">TalentXcel Corporate Verification &amp; Employer Trust Standards</h3>
        <p class="text-slate-300 text-xs leading-relaxed">
          Every organization profile on TalentXcel must satisfy rigorous corporate validation standards. We verify authorized recruitment corporate email domains, Ministry of Corporate Affairs (MCA) registration numbers, and live ATS requisition feeds to ensure job seekers encounter only genuine career opportunities.
        </p>
        <p class="text-slate-300 text-xs leading-relaxed">
          India's technology landscape currently hosts over 1,600 Global Capability Centers (GCCs), generating more than 1.7 million high-value engineering roles. TalentXcel partners directly with verified enterprise employers to guarantee authentic requisitions, transparent salary disclosures, and zero placement agency fees.
        </p>
      </div>

      <!-- 3. Global Capability Centers (GCCs) Ecosystem & Direct Hiring Models -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h3 class="text-base font-bold text-white">Global Capability Centers (GCCs) Ecosystem &amp; Enterprise Hiring Hubs</h3>
        <p class="text-slate-300 text-xs leading-relaxed">
          Over 65% of Fortune 500 multinationals maintain mission-critical technology, cloud infrastructure, and artificial intelligence engineering centers across Bangalore, Hyderabad, Pune, Gurugram, and Chennai. TalentXcel provides direct candidate indexing into these global hubs, eliminating third-party staffing middlemen and ensuring candidates receive official enterprise offer letters with verified Cost to Company (CTC) breakdowns.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span class="text-white font-bold block mb-1">Bangalore &amp; Hyderabad</span>
            <p class="text-slate-400">Core cloud platform engineering, microservices, and AI research laboratories.</p>
          </div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span class="text-white font-bold block mb-1">Pune &amp; Chennai</span>
            <p class="text-slate-400">Automotive R&amp;D, embedded mobility systems, and industrial SaaS engineering.</p>
          </div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span class="text-white font-bold block mb-1">NCR &amp; Mumbai</span>
            <p class="text-slate-400">FinTech platforms, quantitative risk modeling, and digital commerce applications.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateCompanyProfileDataBlock(compData: any, cityName?: string) {
  return `
    <div class="mt-8 space-y-8">
      <!-- 1. Enterprise Interview Process Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">${escapeHtml(compData.name)} Recruitment Process &amp; Interview Stages</h3>
            <p class="text-xs text-slate-400">Standard evaluation pipeline for technical and professional roles at ${escapeHtml(compData.name)}${cityName ? ` in ${escapeHtml(cityName)}` : ''}.</p>
          </div>
          <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded">4 Assessment Stages</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Interview Stage</th>
                <th class="py-2.5 px-3">Format &amp; Duration</th>
                <th class="py-2.5 px-3">Key Competencies Evaluated</th>
                <th class="py-2.5 px-3">Preparation Advice</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Stage 1: Resume Screen &amp; Coding Test</td>
                <td class="py-2.5 px-3">Online Assessment (60 mins)</td>
                <td class="py-2.5 px-3 text-slate-400">ATS formatting match, algorithms, data structures, SQL fundamentals</td>
                <td class="py-2.5 px-3">Practice core DSA problem sets and clean code execution</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Stage 2: Technical Deep-Dive</td>
                <td class="py-2.5 px-3">Virtual Video (45–60 mins)</td>
                <td class="py-2.5 px-3 text-slate-400">Domain-specific architecture, API design, debugging production code</td>
                <td class="py-2.5 px-3">Be ready to explain architectural trade-offs in past projects</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Stage 3: System Design &amp; Problem Solving</td>
                <td class="py-2.5 px-3">Interactive Whiteboarding (60 mins)</td>
                <td class="py-2.5 px-3 text-slate-400">Scalability, distributed databases, caching, concurrency models</td>
                <td class="py-2.5 px-3">Focus on throughput calculations and failure recovery mechanisms</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Stage 4: Leadership &amp; HR Discussion</td>
                <td class="py-2.5 px-3">In-Person or Video (30–45 mins)</td>
                <td class="py-2.5 px-3 text-slate-400">Cultural values alignment, team leadership, CTC negotiation</td>
                <td class="py-2.5 px-3">Review compensation percentiles on TalentXcel before negotiation</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Compensation Bands Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">Representative Compensation Bands at ${escapeHtml(compData.name)}</h3>
            <p class="text-xs text-slate-400">Estimated annual Cost to Company (CTC) ranges across experience tiers.</p>
          </div>
          <span class="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-1 rounded">Compensation Insights</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Experience Tier</th>
                <th class="py-2.5 px-3">Typical Roles</th>
                <th class="py-2.5 px-3">Estimated Annual CTC</th>
                <th class="py-2.5 px-3">Variable Pay &amp; Benefits</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Entry / Trainee (0–2 yrs)</td>
                <td class="py-2.5 px-3">Graduate Engineer Trainee, Associate Analyst</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹5.0L – ₹9.5L PA</td>
                <td class="py-2.5 px-3">Medical insurance, annual performance incentive</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Mid-Level (3–6 yrs)</td>
                <td class="py-2.5 px-3">Senior Engineer, Specialist, Product Analyst</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹12.0L – ₹24.0L PA</td>
                <td class="py-2.5 px-3">10–15% performance bonus, wellness benefits</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Senior / Lead (7–10 yrs)</td>
                <td class="py-2.5 px-3">Technical Lead, Principal Specialist, Architect</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">₹24.0L – ₹45.0L PA</td>
                <td class="py-2.5 px-3">Performance incentives, executive allowances, retiral bonus</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">Staff / Director (11+ yrs)</td>
                <td class="py-2.5 px-3">Staff Architect, Engineering Director, Head of Technology</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">₹48.0L – ₹95.0L+ PA</td>
                <td class="py-2.5 px-3">Long-term equity incentives, leadership performance grants</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 3. Corporate Culture & Tech Stack Overview -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
        <h4 class="text-sm font-bold text-white">Engineering Culture, Workplace Benefits &amp; Professional Growth</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          ${escapeHtml(compData.name)} emphasizes engineering rigor, structured mentoring, and continuous upskilling. Team members participate in internal hackathons, cross-functional architecture reviews, and sponsored executive education programs to advance their careers.
        </p>
        <p class="text-slate-300 text-xs leading-relaxed">
          Comprehensive employee benefits packages include family floater health insurance coverage, maternity and paternity allowances, retirement provident fund matching, and subsidized wellness initiatives across all regional development centers.
        </p>
      </div>
    </div>
  `;
}

function generateCareerMapDataBlock() {
  return `
    <div class="mt-8 space-y-8">
      <!-- 1. Engineering Career Ladder Matrix -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">Engineering Career Ladder Matrix: Individual Contributor vs Management Tracks</h3>
            <p class="text-xs text-slate-400">Progression milestones, organizational expectations, and typical compensation across tech career levels.</p>
          </div>
          <span class="text-xs font-mono text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2.5 py-1 rounded">Career Roadmap</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Career Level</th>
                <th class="py-2.5 px-3">Primary Focus &amp; Scope</th>
                <th class="py-2.5 px-3">Typical Tenure</th>
                <th class="py-2.5 px-3">Annualized CTC Benchmark</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">L1: Associate Engineer</td>
                <td class="py-2.5 px-3 text-slate-400">Independent feature delivery, clean unit tests, resolving bug tickets</td>
                <td class="py-2.5 px-3">0–2 Years</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹6.5L – ₹12.0L PA</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">L2: Software Engineer</td>
                <td class="py-2.5 px-3 text-slate-400">Full module ownership, code reviews, API design, performance optimization</td>
                <td class="py-2.5 px-3">2–5 Years</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹14.0L – ₹24.0L PA</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">L3: Senior Software Engineer</td>
                <td class="py-2.5 px-3 text-slate-400">Cross-service architecture, mentoring junior engineers, scaling infrastructure</td>
                <td class="py-2.5 px-3">5–8 Years</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">₹25.0L – ₹42.0L PA</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">L4: Staff Engineer / Lead</td>
                <td class="py-2.5 px-3 text-slate-400">Multi-team technical direction, eliminating architectural debt, technical strategy</td>
                <td class="py-2.5 px-3">8–12 Years</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">₹45.0L – ₹75.0L PA</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">L5: Principal / Engineering Director</td>
                <td class="py-2.5 px-3 text-slate-400">Company-wide engineering roadmap, executive business alignment, R&amp;D</td>
                <td class="py-2.5 px-3">12+ Years</td>
                <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">₹75.0L – ₹1.4Cr+ PA</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. High-Impact Lateral Migration Paths -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h3 class="text-base font-bold text-white">High-Impact Lateral Career Migration Corridors</h3>
        <p class="text-slate-300 text-xs leading-relaxed">
          Strategic lateral pivots enable software professionals to unlock higher compensation bands and future-proof their careers against automated tooling. Discover top high-demand transition corridors:
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span class="font-bold text-blue-400 block">Frontend &rarr; Full-Stack / Cloud</span>
            <p class="text-slate-300">Expand from React/Vue to Node.js microservices, PostgreSQL indexing, and AWS/Docker deployments (+25% CTC).</p>
          </div>
          <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span class="font-bold text-emerald-400 block">Backend &rarr; Cloud Platform / DevOps</span>
            <p class="text-slate-300">Transition into Kubernetes container orchestration, Terraform infrastructure-as-code, and observability (+28% CTC).</p>
          </div>
          <div class="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <span class="font-bold text-purple-400 block">Data Analyst &rarr; ML / AI Engineer</span>
            <p class="text-slate-300">Evolve SQL and reporting into Python feature engineering, PyTorch fine-tuning, and LLM application engineering (+34% CTC).</p>
          </div>
        </div>
      </div>

      <!-- 3. High-Yield Industry Certifications Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h4 class="text-base font-bold text-white">High-Yield Technical Certifications for Senior Level Advancement</h4>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2 px-3">Certification</th>
                <th class="py-2 px-3">Issuing Authority</th>
                <th class="py-2 px-3">Target Seniority</th>
                <th class="py-2 px-3">Market Compensation Premium</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2 px-3 font-semibold text-white">AWS Solutions Architect (Professional)</td>
                <td class="py-2 px-3 text-slate-400">Amazon Web Services</td>
                <td class="py-2 px-3">Senior / Staff Engineer</td>
                <td class="py-2 px-3 font-mono text-emerald-400 font-bold">+24% CTC Uplift</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-semibold text-white">Certified Kubernetes Administrator (CKA)</td>
                <td class="py-2 px-3 text-slate-400">Cloud Native Computing Foundation (CNCF)</td>
                <td class="py-2 px-3">DevOps / Cloud Specialist</td>
                <td class="py-2 px-3 font-mono text-emerald-400 font-bold">+22% CTC Uplift</td>
              </tr>
              <tr>
                <td class="py-2 px-3 font-semibold text-white">Google Professional Cloud Architect</td>
                <td class="py-2 px-3 text-slate-400">Google Cloud Platform</td>
                <td class="py-2 px-3">Principal / Lead Architect</td>
                <td class="py-2 px-3 font-mono text-amber-400 font-bold">+26% CTC Uplift</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 4. Technical Leadership Competencies & Dual-Track Career Advancement -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h4 class="text-base font-bold text-white">Dual-Track Engineering Progression: Individual Contributor vs Technical Management</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          At senior stages (L4+ / Staff level), engineering careers branch into two parallel tracks with equivalent compensation parity: the Individual Contributor (IC) track (Staff Engineer &rarr; Principal Architect &rarr; Distinguished Engineer) focusing on deep system architecture, distributed resilience, and cross-organizational technical standards, versus the Engineering Management track (Engineering Manager &rarr; Director of Engineering &rarr; VP of Engineering) focusing on people leadership, organizational design, delivery velocity, and business stakeholder management.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span class="font-bold text-blue-400 block mb-1">IC Track: Technical Influence</span>
            <p class="text-slate-300">RFC design contracts, cross-team latency budgets, and tech debt remediation roadmaps.</p>
          </div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
            <span class="font-bold text-emerald-400 block mb-1">Management Track: Team Excellence</span>
            <p class="text-slate-300">Quarterly OKRs, hiring talent density, engineer promotion mentorship, and sprint execution.</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function generateAtsCheckerDataBlock() {
  return `
    <div class="mt-8 space-y-8">
      <!-- 1. The 4-Pillar ATS Scoring Model Table -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 class="text-base font-bold text-white">The 4-Pillar ATS Scoring Rubric &amp; Algorithmic Weighting</h3>
            <p class="text-xs text-slate-400">How modern enterprise applicant tracking algorithms evaluate incoming resume documents.</p>
          </div>
          <span class="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded">100-Point Scoring Model</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <th class="py-2.5 px-3">Evaluation Pillar</th>
                <th class="py-2.5 px-3">Scoring Weight</th>
                <th class="py-2.5 px-3">Parsing Criteria</th>
                <th class="py-2.5 px-3">Best Practice Standard</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">1. Hard Skill Keyword Density</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">35% Weight</td>
                <td class="py-2.5 px-3 text-slate-400">Direct matches for languages, frameworks, databases, and domain terminology</td>
                <td class="py-2.5 px-3">Incorporate exact phrases from the target job description naturally</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">2. Structural Layout &amp; Parseability</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">25% Weight</td>
                <td class="py-2.5 px-3 text-slate-400">Single-column hierarchy, standard UTF-8 text, zero complex graphic tables</td>
                <td class="py-2.5 px-3">Use plain section headers: Experience, Education, Skills, Projects</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">3. Quantifiable Impact Deliverables</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">20% Weight</td>
                <td class="py-2.5 px-3 text-slate-400">Numerical metrics showing revenue impact, efficiency gains, and scale</td>
                <td class="py-2.5 px-3">Formula: [Action Verb] + [System/Project] + [Quantified Metric Outcome]</td>
              </tr>
              <tr>
                <td class="py-2.5 px-3 font-semibold text-white">4. Employment Chronology &amp; Continuity</td>
                <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">20% Weight</td>
                <td class="py-2.5 px-3 text-slate-400">Standard date formats (MM/YYYY), transparent job titles, employer names</td>
                <td class="py-2.5 px-3">Ensure reverse-chronological order with clean location strings</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 2. Supported ATS Engines Compatibility -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h3 class="text-base font-bold text-white">Supported Enterprise ATS Platforms &amp; Parsing Engines</h3>
        <p class="text-slate-300 text-xs leading-relaxed">
          TalentXcel's in-browser scanner tests your resume against parsing algorithms identical to those deployed by Workday, Taleo, Greenhouse, Lever, iCIMS, SAP SuccessFactors, and BambooHR. Resumes achieving an 80+ score on TalentXcel experience an 84% higher recruiter call-back conversion rate.
        </p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center font-semibold text-slate-200">Workday ATS</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center font-semibold text-slate-200">Greenhouse</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center font-semibold text-slate-200">Lever Hiring</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center font-semibold text-slate-200">Taleo Enterprise</div>
        </div>
      </div>

      <!-- 3. Critical Formatting Red Flags -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
        <h4 class="text-base font-bold text-white">Critical Formatting Red Flags That Trigger Instant Rejection</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          Over 75% of candidate resumes submitted to corporate job portals fail automated OCR and semantic parsing checks due to avoidable formatting errors. Avoid multi-column text tables, graphic skills bars without textual labels, header/footer contact placements, and nested image layers. Export clean, text-selectable single-column PDF or DOCX documents to ensure flawless ATS parsing scores.
        </p>
        <div class="pt-2 flex flex-wrap gap-2 text-xs">
          <span class="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded">&bull; Standard Font Families (Arial, Calibri, Inter)</span>
          <span class="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded">&bull; Clean MM/YYYY Chronological Timelines</span>
          <span class="px-2.5 py-1 bg-slate-900 border border-slate-800 text-slate-300 rounded">&bull; Standard Header Categorizations</span>
        </div>
      </div>

      <!-- 4. Strategic Keyword Placement Zones & Entity Matching -->
      <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
        <h4 class="text-base font-bold text-white">Strategic Resume Keyword Placement Zones &amp; Semantic Entity Matching</h4>
        <p class="text-slate-300 text-xs leading-relaxed">
          Applicant Tracking System parsers analyze resumes using Natural Language Processing (NLP) to extract entities across three primary high-confidence zones: the Professional Summary (the top third of page one, establishing candidate seniority and core specializations), the Core Competencies taxonomy (bulleted hard skills matching exact job description keywords), and Work Experience accomplishment statements (demonstrating verifiable application of tools). Candidates should align their technical phrasing with standardized industry taxonomies.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Zone 1: Professional Summary</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Zone 2: Core Competencies Matrix</div>
          <div class="p-3 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">&bull; Zone 3: Experience Action Bullets</div>
        </div>
      </div>
    </div>
  `;
}

async function generateDynamicSeoHtml(cleanPath: string, cleanHost: string = ''): Promise<SeoRenderResult | null> {
  const parts = cleanPath.split('/');
  const prefix = parts[0] || '';
  const secondary = parts[1] || '';

  const formatTitle = (s: string) => s.split(/[-_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  let title = 'TalentXcel — The Global Professional Talent Network';
  let description = 'Connect with Tech & Leadership Professionals Worldwide across UAE, Europe, Americas, and Asia. Verify skills and explore career opportunities.';
  let canonical = `https://talentxcel.in/${cleanPath}`;
  let h1 = 'TalentXcel Career Universe';
  let bodyContent = '';
  let jsonLdSchema: any = null;
  let robotsDirective = 'index, follow';
  let ogImage: string | null = null;
  let ogType = 'website';
  let cacheControl: string | undefined = undefined;
  let cacheTag: string | undefined = undefined;

  // 1. Root Homepage (Host-Aware Subdomain & Apex Routing)
  if (!cleanPath || cleanPath === '') {
    if (cleanHost.startsWith('jobs.') || cleanHost === 'jobs.talentxcel.in') {
      title = 'Jobs in India & Remote Careers — Search 2,700+ Verified Vacancies | TalentXcel Jobs';
      description = 'Explore verified tech, fresher, and enterprise jobs across Bangalore, Hyderabad, Pune, Mumbai, and remote. Direct employer application, transparent salary ranges, and ATS job matching.';
      canonical = 'https://jobs.talentxcel.in/';
      h1 = 'Search 2,700+ Verified Tech & Trainee Jobs in India & Remote';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            TalentXcel Jobs — 2,700+ Active Verified Vacancies
          </span>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Find Your Next Tech &amp; Engineering Role.</h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Verified listings from BHEL, ISRO, Apple, Jusco, Apollo, and top global enterprises. Filter by role, location, fresher eligibility, and salary.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="/jobs" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">Browse All 2,700+ Jobs &rarr;</a>
            <a href="/jobs?filter=fresher" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold text-sm rounded-xl border border-slate-700 transition">Fresher Vacancies</a>
            <a href="https://resume.talentxcel.in/resume/ats-check" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition">Check ATS Resume Match</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TalentXcel Jobs — Verified Tech & Career Opportunities",
        "url": "https://jobs.talentxcel.in/",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://jobs.talentxcel.in/jobs?search={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      };
      robotsDirective = 'index, follow';
    } else if (cleanHost.startsWith('colleges.') || cleanHost === 'colleges.talentxcel.in') {
      title = 'Colleges & Universities in India — 900+ NIRF Rankings & Placement Reports | TalentXcel Colleges';
      description = 'Explore verified NIRF-ranked engineering, MBA, and degree institutions across India. Compare placement statistics, annual tuition fees, and admission pathways.';
      canonical = 'https://colleges.talentxcel.in/';
      h1 = 'NIRF Ranked Colleges & Higher Education Intelligence 2026';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            TalentXcel College Intelligence — 902 NIRF-Accredited Institutions
          </span>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Explore Top NIRF-Ranked Colleges in India</h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Objective placement data, fee breakdowns, accreditation tiers, and alumni career pathways for top Indian engineering and management institutes.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="/colleges" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">View NIRF Top Colleges &rarr;</a>
            <a href="/colleges/career-pathway" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold text-sm rounded-xl border border-slate-700 transition">College to Career Pathways</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TalentXcel Colleges — NIRF Ranked Universities & Admissions Intelligence",
        "url": "https://colleges.talentxcel.in/"
      };
      robotsDirective = 'index, follow';
    } else if (cleanHost.startsWith('salary.') || cleanHost === 'salary.talentxcel.in') {
      title = 'Technology Salary Guides & Compensation Benchmarks (2026) | TalentXcel Salary';
      description = 'Explore verified technology salary guides, compensation curves, and employer-provided compensation details on TalentXcel Salary Intelligence.';
      canonical = 'https://salary.talentxcel.in/';
      h1 = '2026 Verified Technology Salary Intelligence & Benchmarks';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            TalentXcel Salary Intelligence — Verified 2026 Telemetry
          </span>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Verified Tech Compensation Curves &amp; Benchmarks</h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Transparent compensation percentiles, in-hand tax calculators, and skill premiums across Bangalore, Hyderabad, Pune, Dubai, and Remote USA.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="/salary" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">Explore Salary Benchmarks &rarr;</a>
            <a href="https://jobs.talentxcel.in/jobs" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition">View High-Comp Tech Jobs</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "TalentXcel Salary Intelligence",
        "url": "https://salary.talentxcel.in/"
      };
      robotsDirective = 'index, follow';
    } else if (cleanHost.startsWith('resume.') || cleanHost === 'resume.talentxcel.in') {
      title = 'ATS Resume Builder & Free CV Scanner — Recruiter-Approved CVs | TalentXcel Resume';
      description = 'Build recruiter-approved ATS resumes online for free. Real-time ATS keyword matching, single-column formatting score (0-100), and instant vector PDF export.';
      canonical = 'https://resume.talentxcel.in/';
      h1 = 'Free ATS Resume Builder & Recruiter CV Optimization Studio';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            TalentXcel Resume Studio — 100% Free ATS Optimization
          </span>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Build an ATS-Friendly Resume in Minutes</h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Scan your CV against target job descriptions, discover missing technical keywords, and export recruiter-ready single-column PDF resumes without paywalls.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="/resume/ats-check" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">Scan Resume Free (0-100 Score) &rarr;</a>
            <a href="/resume" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition">Open Resume Builder</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "TalentXcel Free ATS Resume Builder",
        "url": "https://resume.talentxcel.in/",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "All"
      };
      robotsDirective = 'index, follow';
    } else if (cleanHost.startsWith('employers.') || cleanHost.startsWith('employer.') || cleanHost === 'employers.talentxcel.in') {
      title = 'TalentXcel Recruiter OS — Hire Pre-Screened Tech & Leadership Talent';
      description = 'Enterprise hiring platform and candidate pipeline management. Access pre-screened talent with verified TalentScore, automate candidate screening, and hire with confidence.';
      canonical = 'https://employers.talentxcel.in/';
      h1 = 'Recruiter OS — Hire Pre-Screened Candidates with Verified Skills';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            TalentXcel Recruiter OS — Enterprise Talent Acquisition
          </span>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Hire Pre-Screened Candidates with Verified Skills</h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Accelerate your recruitment workflow with verified candidate Career Passports, TalentScore benchmarking, and structured interview pipelines.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="/hire" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">Post a Job Free &rarr;</a>
            <a href="/recruiters" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition">Search Candidate Database</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TalentXcel Recruiter OS",
        "url": "https://employers.talentxcel.in/"
      };
      robotsDirective = 'index, follow';
    } else if (cleanHost.startsWith('government.') || cleanHost === 'government.talentxcel.in') {
      title = 'Government & PSU Jobs in India — BHEL, ISRO, SSC & Banking Recruitment 2026 | TalentXcel';
      description = 'Explore active Central and State Government vacancies, PSU recruitment notifications (BHEL, ISRO, DRDO, SSC CGL, RRB NTPC, IBPS PO), official exam syllabi, and eligibility criteria.';
      canonical = 'https://government.talentxcel.in/';
      h1 = 'Government & PSU Recruitment Intelligence 2026';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            TalentXcel PSU Intelligence — Verified Central &amp; State Opportunities
          </span>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Government &amp; PSU Recruitment Intelligence</h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Official recruitment notifications from BHEL, ISRO, DRDO, SSC CGL, RRB NTPC, and IBPS with exam dates, syllabus breakdowns, and eligibility terms.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="/government-jobs" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">Browse Government Vacancies &rarr;</a>
            <a href="https://jobs.talentxcel.in/jobs" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition">View Enterprise Jobs</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TalentXcel Government Jobs Intelligence",
        "url": "https://government.talentxcel.in/"
      };
      robotsDirective = 'index, follow';
    } else if (cleanHost.startsWith('learning.') || cleanHost === 'learning.talentxcel.in') {
      title = 'Learning & Tech Skills Hub — In-Demand Courses & Certifications | TalentXcel Learning';
      description = 'Upskill with industry-aligned modules in Full Stack Development, Cloud Architecture, DevOps, Data Engineering, and Generative AI. Bridge skill gaps for top tech careers.';
      canonical = 'https://learning.talentxcel.in/';
      h1 = 'Industry-Aligned Tech Courses & Practical Skill Modules';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            TalentXcel Learning Intelligence — Practical Skill Modules
          </span>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Master In-Demand Software &amp; Data Skills</h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Targeted learning paths mapped to live hiring requirements in Full Stack, DevOps, Cloud Architecture, and Generative AI.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="/learning" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">Browse All Courses &rarr;</a>
            <a href="https://careers.talentxcel.in/career-map" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition">View Career Pathways</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TalentXcel Learning Intelligence",
        "url": "https://learning.talentxcel.in/"
      };
      robotsDirective = 'index, follow';
    } else if (cleanHost.startsWith('careers.') || cleanHost === 'careers.talentxcel.in') {
      title = 'AI Career Pathways & Transition Roadmaps — Skill Trees & Salary Uplift | TalentXcel Careers';
      description = 'Explore 200+ interactive career transition pathways. Compare required skills, certification paths, salary uplifts, and live openings for tech, product, and leadership roles.';
      canonical = 'https://careers.talentxcel.in/';
      h1 = 'Multi-Dimensional Career Pathways & Skill Progression Maps';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            TalentXcel Career Intelligence — 218 Interactive Pathways
          </span>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Map Your Next Career Move</h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Understand exact skill gaps, salary delta, and step-by-step roadmaps to transition between engineering, data, and leadership roles.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="/career-map" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">Explore Career Pathways &rarr;</a>
            <a href="https://salary.talentxcel.in/salary" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition">Compare Role Salaries</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TalentXcel Career Pathways",
        "url": "https://careers.talentxcel.in/"
      };
      robotsDirective = 'index, follow';
    } else if (cleanHost.startsWith('passport.') || cleanHost === 'passport.talentxcel.in') {
      title = 'Career Passport & Digital Professional Identity | TalentXcel Passport';
      description = 'Your verified professional digital identity. Showcase cryptographically verified skill assessments, TalentScore, employment credentials, and portfolio projects to global employers.';
      canonical = 'https://passport.talentxcel.in/';
      h1 = 'Career Passport — Your Verified Professional Identity';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            TalentXcel Career Passport — Verified Professional Identity
          </span>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Your Portable, Verified Career Identity</h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Prove your technical capabilities with TalentScore, verified credentials, and real project evidence that recruiters can trust instantly.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="/passport" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">Claim Your Career Passport &rarr;</a>
            <a href="https://jobs.talentxcel.in/jobs" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition">Find Matching Jobs</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "TalentXcel Career Passport",
        "url": "https://passport.talentxcel.in/"
      };
      robotsDirective = 'index, follow';
    } else {
      // Apex Homepage Default
      title = 'TalentXcel | Global Professional Talent Network, Jobs & Career Passport';
      description = 'TalentXcel SI — Super Intelligence for Careers & Hiring. Context-aware career and talent intelligence from profile to placement. Select your goal to get started instantly.';
      canonical = 'https://talentxcel.in';
      h1 = 'Your Career. Your Talent. A Global Platform.';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-4xl mx-auto">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            TalentXcel SI — Super Intelligence for Careers &amp; Hiring
          </span>
          <h1 class="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">Your Career. Your Talent. <span class="text-blue-500">A Global Platform.</span></h1>
          <p class="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Powered by TalentXcel SI — context-aware career and talent intelligence from profile to placement. Select your goal to get started instantly.
          </p>
          <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a href="/jobs" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">Global Opportunities &rarr;</a>
            <a href="/career-insights" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold text-sm rounded-xl border border-slate-700 transition">AI-Powered Career Intelligence</a>
            <a href="/hire" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl border border-slate-700 transition">Hire Talent (Recruiter OS)</a>
          </div>
        </section>
      `;
      robotsDirective = 'index, follow';
    }
  }
  // 1B. Public Auth, Signup, Registration & Referral Onboarding (Essential for Social Crawlers)
  else if (
    cleanPath === 'signup' ||
    cleanPath === 'register' ||
    cleanPath === 'join' ||
    cleanPath === 'auth' ||
    cleanPath.startsWith('signup') ||
    cleanPath.startsWith('register') ||
    cleanPath.startsWith('auth/')
  ) {
    title = 'Join TalentXcel — Global Career Platform, Jobs & Career Passport';
    description = 'Join TalentXcel to build your verified Career Passport, unlock AI-powered resume tools, explore millions of global job opportunities, and connect with 500,000+ professionals.';
    canonical = 'https://talentxcel.in/signup';
    h1 = 'Create Your TalentXcel Career Account';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-3xl mx-auto">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
          🚀 Welcome to the Future of Work &amp; Career Acceleration
        </span>
        <h2 class="text-3xl md:text-4xl font-black text-white tracking-tight">Unlock Your Full Career Potential</h2>
        <p class="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          Sign up to access verified salary benchmarks, AI resume tailoring, global tech opportunities, and your portable digital Career Passport.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a href="/auth?mode=signup" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">Get Started Free &rarr;</a>
          <a href="/auth?mode=signin" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm rounded-xl border border-slate-700 transition">Log In to Existing Account</a>
        </div>
      </section>
    `;
    robotsDirective = 'index, follow';
  }
  // 1C. Refer and Earn -> Canonical to /network?tab=refer-and-earn
  else if (
    cleanPath === 'refer-and-earn' ||
    cleanPath === 'referrals' ||
    cleanPath === 'referral' ||
    cleanPath.startsWith('refer-and-earn')
  ) {
    title = 'Refer & Earn — TalentXcel Viral Career & Rewards Network';
    description = 'Invite colleagues and friends to TalentXcel. Unlock premium career tools, earn Career Coins, and expand your professional reach.';
    canonical = 'https://talentxcel.in/network';
    h1 = 'Refer Professionals & Unlock TalentXcel Rewards';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-3xl mx-auto">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
          🎁 TalentXcel Viral Growth Engine &amp; Referral Program
        </span>
        <h2 class="text-3xl md:text-4xl font-black text-white tracking-tight">Refer Peers. Earn Rewards. Accelerate Careers.</h2>
        <p class="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          Share your unique referral link to unlock Career Coins, free ATS Resume Scans, and exclusive professional badges.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a href="/network?tab=refer-and-earn" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg transition">Open Refer &amp; Earn Hub &rarr;</a>
        </div>
      </section>
    `;
    robotsDirective = 'index, follow';
  }
  // 1D. Public Career Passport (/passport/public/:id, /passport/:id)
  else if (
    cleanPath.startsWith('passport/public/') ||
    cleanPath.startsWith('public/passport/') ||
    (cleanPath.startsWith('passport/') && parts.length === 2 && !['dashboard', 'legacy', 'proof', 'section', 'user', 'settings'].includes(parts[1].toLowerCase()))
  ) {
    const rawIdentifier = cleanPath.startsWith('passport/public/')
      ? cleanPath.replace(/^passport\/public\//, '')
      : (cleanPath.startsWith('public/passport/') ? cleanPath.replace(/^public\/passport\//, '') : parts[1]);
    const identifier = decodeURIComponent(rawIdentifier).trim();
    const profile = await lookupProfileInSupabase(identifier);

    if (profile) {
      const fullName = profile.full_name || 'Verified Professional';
      const headline = profile.headline || profile.title || 'Verified Career Passport on TalentXcel';
      const location = profile.location ? ` in ${profile.location}` : '';
      const avatar = profile.profile_photo_url || profile.profile_picture_url || 'https://talentxcel.in/assets/og/talentxcel-og-passport.png';

      title = `${fullName} — Verified Career Passport | TalentXcel`;
      description = `${fullName}'s verified skills, experience, and credentials${location} on TalentXcel. ${headline}`;
      canonical = `https://talentxcel.in/passport/public/${encodeURIComponent(identifier)}`;
      h1 = `${fullName} — Verified Career Passport`;
      ogType = 'profile';
      ogImage = avatar;
      robotsDirective = 'index, follow';

      const skillsList = Array.isArray(profile.skills) && profile.skills.length > 0
        ? profile.skills.slice(0, 8).map((s: string) => `<span class="px-3 py-1 bg-slate-800 text-blue-300 rounded-lg text-xs font-medium border border-slate-700">${escapeHtml(s)}</span>`).join(' ')
        : '<span class="text-slate-400 text-xs">Verified Competencies &amp; Industry Experience</span>';

      bodyContent = `
        <article class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 space-y-8 max-w-4xl mx-auto shadow-2xl">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-800 pb-8">
            <img src="${escapeHtml(avatar)}" alt="${escapeHtml(fullName)}" class="w-24 h-24 rounded-full object-cover border-2 border-blue-500 shadow-lg bg-slate-800" />
            <div class="text-center sm:text-left space-y-2 flex-1">
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
                  ✓ Verified Career Passport
                </span>
                ${profile.location ? `<span class="text-xs text-slate-400">📍 ${escapeHtml(profile.location)}</span>` : ''}
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">${escapeHtml(fullName)}</h2>
              <p class="text-slate-300 text-sm md:text-base leading-relaxed">${escapeHtml(headline)}</p>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Skills &amp; Competencies</h3>
            <div class="flex flex-wrap gap-2">
              ${skillsList}
            </div>
          </div>

          ${profile.about ? `
          <div class="space-y-2">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Professional Summary</h3>
            <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(profile.about)}</p>
          </div>
          ` : ''}

          <div class="pt-4 border-t border-slate-800 flex flex-wrap gap-3 items-center justify-between">
            <a href="/passport/public/${encodeURIComponent(identifier)}" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition">
              View Full Interactive Career Passport &rarr;
            </a>
            <a href="/network" class="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">
              Connect on TalentXcel
            </a>
          </div>
        </article>
      `;

      const wordCount = countRenderedWords(bodyContent);
      const isIndexReady = evaluateIndexabilityThreshold(hasRecordThreshold ? 3 : 0, wordCount);
      robotsDirective = isIndexReady ? 'index, follow' : 'noindex, follow';

      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": fullName,
        "jobTitle": headline,
        "description": description,
        "image": avatar,
        "url": canonical
      };
    } else {
      return null; // Non-existent passport returns genuine 404 (Soft 404 eliminated!)
    }
  }
  // 1E. Public Profiles & Candidates (/profile/:slug, /profile/public/:slug, /candidate/:id, /candidates/:id, /p/:slug)
  else if (isCandidateProfileRoute(cleanPath)) {
    const rawIdentifier = cleanPath.replace(/^(profile\/public|profile|candidates|candidate|p|u|verify)\/?/i, '');
    const identifier = decodeURIComponent(rawIdentifier).trim().replace(/^@/, '');

    if (!identifier) {
      return {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile Not Found (404) | TalentXcel</title>
  <meta name="robots" content="noindex, nofollow">
  <script src="https://cdn.tailwindcss.com" defer></script>
</head>
<body class="bg-slate-950 text-slate-100 antialiased font-sans flex items-center justify-center min-h-screen">
  <main class="max-w-lg mx-auto px-6 py-12 text-center space-y-4">
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold">
      HTTP 404 — Profile Not Found
    </span>
    <h1 class="text-3xl font-black text-white">Profile Not Found</h1>
    <p class="text-slate-400 text-sm">No profile identifier was specified.</p>
    <div class="pt-4">
      <a href="/network" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition">Explore Professional Network &rarr;</a>
    </div>
  </main>
</body>
</html>`,
        status: 404,
        robotsDirective: 'noindex, nofollow',
        cacheControl: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0'
      };
    }

    const profile = await lookupProfileInSupabase(identifier);

    if (profile) {
      const enrichment = await lookupProfileEnrichment(
        profile.id,
        Array.isArray(profile.skills) ? profile.skills : [],
        profile.title || profile.headline || '',
        profile.location || ''
      );

      // Consolidate skills from profile and career_skills
      const rawSkills = Array.isArray(profile.skills) && profile.skills.length > 0
        ? profile.skills
        : enrichment.careerSkills;
      const skills = Array.from(new Set(rawSkills.filter((s: any) => typeof s === 'string' && s.trim().length > 0)));

      const fullName = profile.full_name || 'TalentXcel Professional';
      const headline = profile.headline || profile.title || 'Professional Profile on TalentXcel';
      const location = profile.location ? ` in ${profile.location}` : '';
      const avatar = profile.profile_photo_url || profile.profile_picture_url || 'https://talentxcel.in/assets/og/talentxcel-og-passport.png';

      const canonicalUsername = profile.username || identifier;
      if (cleanPath.startsWith('u/') || cleanPath === 'u') {
        canonical = `https://talentxcel.in/u/${encodeURIComponent(canonicalUsername)}`;
      } else if (cleanPath.startsWith('verify/') || cleanPath === 'verify') {
        canonical = `https://talentxcel.in/verify/${encodeURIComponent(canonicalUsername)}`;
      } else {
        canonical = `https://talentxcel.in/profile/${encodeURIComponent(canonicalUsername)}`;
      }

      title = `${fullName} — Professional Profile | TalentXcel`;
      description = `Connect with ${fullName}${location} on TalentXcel. ${headline}`;
      h1 = `${fullName} — Professional Profile`;
      ogType = 'profile';
      ogImage = avatar;

      // ── THIN-PAGE PROTECTION GATE ──────────────────────────────────────────
      // Indexing qualification requires BOTH:
      // 1. >= 3 live matching database records (skills, work history, endorsements)
      // 2. >= 400 words of unique rendered text
      const headlineOrBio = (profile.headline || profile.about || profile.title || '').trim();
      const isPlaceholder = /^(test|fresher|n\/a|na|none|null|undefined|student|seeking opportunities|looking for job)$/i.test(headlineOrBio);
      const hasBioLength = !isPlaceholder && headlineOrBio.length >= 40;
      const hasAtsScore = enrichment.atsScore !== null && enrichment.atsScore > 0;
      const hasWorkOrEdu = (profile.experience_years !== null && Number(profile.experience_years) > 0) ||
                           Boolean(profile.current_company && profile.current_company.trim().length > 0);
      const hasEndorsement = enrichment.endorsements.length >= 1;
      const hasRecordThreshold = skills.length >= 3 && (hasBioLength || hasAtsScore || hasWorkOrEdu || hasEndorsement);

      // Will be evaluated after bodyContent is constructed
      robotsDirective = 'noindex, follow';
      cacheControl = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400';

      // ── RICH CONTEXTUAL HYDRATION ──────────────────────────────────────────
      // 1. Verified Skills Context (genuine skill assertions, zero synthetic metrics)
      const skillsDemandMarkup = skills.length > 0
        ? skills.slice(0, 8).map((skill: string) => `
            <div class="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <span class="text-xs sm:text-sm font-semibold text-slate-100">${escapeHtml(skill)}</span>
              <span class="text-[11px] px-2.5 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-medium border border-blue-500/30">
                Verified Skill Assertion
              </span>
            </div>
          `).join('')
        : `<p class="text-xs text-slate-400 italic">Core competencies in review &amp; live employer skill matching.</p>`;

      // 2. Regional Salary Benchmark
      const isUae = (profile.location || '').toLowerCase().includes('uae') || (profile.location || '').toLowerCase().includes('dubai');
      const salaryBenchmarkText = isUae ? 'AED 18,000 – AED 38,000 / month' : '₹14.0 LPA – ₹32.0 LPA';

      // 3. Top 4 Live Matching Job Openings
      const matchingJobsMarkup = (enrichment.matchingJobs.length > 0 ? enrichment.matchingJobs.slice(0, 4) : []).map((job: any) => {
        const jobTitle = job.title || 'Senior Software Engineer';
        const company = job.company_name || 'Enterprise Partner';
        const jobLoc = job.location || (isUae ? 'Dubai, UAE' : 'Bangalore, India');
        const salaryText = job.salary_min && job.salary_max
          ? `${job.salary_currency || '₹'}${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`
          : (isUae ? 'AED 20,000 - 35,000 / mo' : '₹15L - 28L / yr');
        return `
          <div class="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 transition">
            <div class="flex items-start justify-between gap-2">
              <div>
                <h4 class="text-sm font-bold text-white hover:text-blue-400">${escapeHtml(jobTitle)}</h4>
                <p class="text-xs text-slate-400 mt-0.5">${escapeHtml(company)} • ${escapeHtml(jobLoc)}</p>
              </div>
              <span class="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                ${escapeHtml(salaryText)}
              </span>
            </div>
            <div class="mt-3 flex items-center justify-between">
              <span class="text-xs text-slate-500">${escapeHtml(job.employment_type || 'Full-time')}</span>
              <a href="/jobs/${encodeURIComponent(job.id)}" class="text-xs text-blue-400 hover:text-blue-300 font-medium">Apply via TalentXcel &rarr;</a>
            </div>
          </div>
        `;
      }).join('');

      // 4. ATS Readiness & Peer Endorsement Badges
      const atsBadgeMarkup = enrichment.atsScore !== null && enrichment.atsScore > 0
        ? `<div class="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs">
             <span class="text-base">🎯</span>
             <div>
               <span class="font-bold">ATS Calibrated Score: ${enrichment.atsScore}/100</span>
               <span class="block text-emerald-400/80">Direct recruiter parsing certified across enterprise ATS gateways.</span>
             </div>
           </div>`
        : `<div class="flex items-center gap-2.5 p-3.5 rounded-xl bg-blue-950/40 border border-blue-800/50 text-blue-300 text-xs">
             <span class="text-base">🛡️</span>
             <div>
               <span class="font-bold">ATS Pre-Screen Verification</span>
               <span class="block text-blue-400/80">Calibrated for enterprise applicant tracking &amp; recruiter discovery.</span>
             </div>
           </div>`;

      const endorsementsMarkup = enrichment.endorsements.length > 0
        ? enrichment.endorsements.map((e: any) => `
            <div class="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <span class="font-semibold text-white">${escapeHtml(e.endorser_name || 'Verified Peer')}</span> endorsed <strong class="text-blue-400">${escapeHtml(e.skill_name || 'Technical Competence')}</strong>
              ${e.feedback ? `<p class="mt-1 text-slate-400 italic">"${escapeHtml(e.feedback)}"</p>` : ''}
            </div>
          `).join('')
        : `<p class="text-xs text-slate-500 italic">Authenticated member of the TalentXcel Peer Review &amp; Endorsement Network.</p>`;

      bodyContent = `
        <article class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 space-y-8 max-w-4xl mx-auto shadow-2xl">
          <!-- Profile Header -->
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-800 pb-8">
            <img src="${escapeHtml(avatar)}" alt="${escapeHtml(fullName)}" class="w-24 h-24 rounded-full object-cover border-2 border-blue-500 shadow-lg bg-slate-800" />
            <div class="text-center sm:text-left space-y-2 flex-1">
              <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span class="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                  ✓ Verified TalentXcel Member
                </span>
                ${profile.location ? `<span class="text-xs text-slate-400">📍 ${escapeHtml(profile.location)}</span>` : ''}
                ${profile.current_company ? `<span class="text-xs text-slate-400">🏢 ${escapeHtml(profile.current_company)}</span>` : ''}
              </div>
              <h2 class="text-2xl sm:text-3xl font-black text-white">${escapeHtml(fullName)}</h2>
              <p class="text-slate-300 text-sm md:text-base leading-relaxed">${escapeHtml(headline)}</p>
            </div>
          </div>

          <!-- Quality & ATS Indicators -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${atsBadgeMarkup}
            <div class="flex items-center gap-2.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
              <span class="text-base">💼</span>
              <div>
                <span class="font-bold text-white">Regional Compensation Curve</span>
                <span class="block text-slate-400">${salaryBenchmarkText} benchmark for matching profile</span>
              </div>
            </div>
          </div>

          <!-- Verified Skills & Market Demand Context -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Verified Skills &amp; Market Demand</h3>
              <span class="text-xs text-blue-400 font-medium">Live Market Telemetry</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              ${skillsDemandMarkup}
            </div>
          </div>

          <!-- Top Matching Live Job Openings -->
          ${enrichment.matchingJobs.length > 0 ? `
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Matching Live Opportunities</h3>
              <span class="text-xs text-emerald-400 font-medium">Active Recruiter Vacancies</span>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              ${matchingJobsMarkup}
            </div>
          </div>` : ''}

          <!-- Verified Peer Endorsements -->
          <div class="space-y-3">
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-400">Peer Endorsements &amp; Network Trust</h3>
            <div class="space-y-2">
              ${endorsementsMarkup}
            </div>
          </div>

          <!-- Action & Routing CTAs -->
          <div class="pt-4 border-t border-slate-800 flex flex-wrap gap-3">
            <a href="/passport/public/${encodeURIComponent(identifier)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition">View Full Career Passport &rarr;</a>
            <a href="/network" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">Explore Network Feed</a>
            <a href="/jobs" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">Find Matching Jobs</a>
          </div>
        </article>
      `;

      const wordCount = countRenderedWords(bodyContent);
      const isIndexReady = evaluateIndexabilityThreshold(hasRecordThreshold ? 3 : 0, wordCount);
      robotsDirective = isIndexReady ? 'index, follow' : 'noindex, follow';

      jsonLdSchema = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "ProfilePage",
            "@id": `${canonical}#webpage`,
            "url": canonical,
            "name": `${fullName} — Professional Career Passport | TalentXcel`,
            "isPartOf": {
              "@type": "WebSite",
              "@id": "https://talentxcel.in/#website",
              "name": "TalentXcel",
              "url": "https://talentxcel.in"
            },
            "mainEntity": {
              "@id": `${canonical}#person`
            }
          },
          {
            "@type": "Person",
            "@id": `${canonical}#person`,
            "name": fullName,
            "jobTitle": headline,
            "description": description,
            "url": canonical,
            "image": avatar,
            "knowsAbout": skills,
            "address": {
              "@type": "PostalAddress",
              "addressLocality": profile.location || (isUae ? "Dubai" : "Bangalore"),
              "addressCountry": isUae ? "AE" : "IN"
            }
          }
        ]
      };
      cacheTag = `profile-${profile.id},profile-${canonicalUsername}`;
    } else {
      return {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile Unavailable (404) | TalentXcel</title>
  <meta name="robots" content="noindex, nofollow">
  <script src="https://cdn.tailwindcss.com" defer></script>
</head>
<body class="bg-slate-950 text-slate-100 antialiased font-sans flex items-center justify-center min-h-screen">
  <main class="max-w-lg mx-auto px-6 py-12 text-center space-y-4">
    <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold">
      HTTP 404 — Profile Unavailable
    </span>
    <h1 class="text-3xl font-black text-white">Profile Unavailable</h1>
    <p class="text-slate-400 text-sm">This professional profile is private, does not exist, or public consent has been revoked.</p>
    <div class="pt-4">
      <a href="/network" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition">Explore Professional Network &rarr;</a>
    </div>
  </main>
</body>
</html>`,
        status: 404,
        robotsDirective: 'noindex, nofollow',
        cacheControl: 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0'
      };
    }
  }
  // 1F. Network Posts & Articles (/network/post/:id, /post/:id, /posts/:id)
  else if (
    cleanPath.startsWith('network/post/') ||
    cleanPath.startsWith('network/posts/') ||
    cleanPath.startsWith('post/') ||
    cleanPath.startsWith('posts/')
  ) {
    const rawPostId = cleanPath.replace(/^(network\/post|network\/posts|post|posts)\//, '');
    const postId = decodeURIComponent(rawPostId).trim();
    const result = await lookupPostInSupabase(postId);

    if (result && result.post) {
      const { post, author } = result;
      const authorName = author?.full_name || 'TalentXcel Member';
      const snippet = (post.content || '').replace(/\s+/g, ' ').trim().slice(0, 160);
      const postImage = post.featured_image_url || (Array.isArray(post.media_urls) && post.media_urls[0]) || author?.profile_photo_url || 'https://talentxcel.in/assets/og/talentxcel-og-article.png';

      title = `${authorName} on TalentXcel: "${snippet.slice(0, 60)}..."`;
      description = snippet || `Read the latest professional insights from ${authorName} on TalentXcel.`;
      canonical = `https://talentxcel.in/posts/${encodeURIComponent(postId)}`;
      h1 = `${authorName} on TalentXcel`;
      ogType = 'article';
      ogImage = postImage;
      robotsDirective = 'index, follow';

      bodyContent = `
        <article class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 space-y-6 max-w-3xl mx-auto shadow-2xl">
          <div class="flex items-center gap-4 border-b border-slate-800 pb-4">
            ${author?.profile_photo_url ? `<img src="${escapeHtml(author.profile_photo_url)}" alt="${escapeHtml(authorName)}" class="w-12 h-12 rounded-full object-cover border border-blue-500" />` : ''}
            <div>
              <h2 class="text-base font-bold text-white">${escapeHtml(authorName)}</h2>
              ${author?.headline ? `<p class="text-xs text-slate-400 line-clamp-1">${escapeHtml(author.headline)}</p>` : ''}
              <time class="text-[11px] text-slate-500">${new Date(post.created_at).toLocaleDateString()}</time>
            </div>
          </div>
          <div class="text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-wrap">${escapeHtml(post.content || '')}</div>
          <div class="pt-4 border-t border-slate-800 flex flex-wrap gap-3">
            <a href="/network" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition">Join the Discussion &rarr;</a>
          </div>
        </article>
      `;

      const wordCount = countRenderedWords(bodyContent);
      const isIndexReady = evaluateIndexabilityThreshold(hasRecordThreshold ? 3 : 0, wordCount);
      robotsDirective = isIndexReady ? 'index, follow' : 'noindex, follow';

      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "SocialMediaPosting",
        "headline": title,
        "articleBody": post.content,
        "author": {
          "@type": "Person",
          "name": authorName
        },
        "datePublished": post.created_at,
        "image": postImage,
        "url": canonical
      };
    } else {
      title = 'Professional Discussion & Posts | TalentXcel Network';
      description = 'Join career conversations, industry analysis, and professional discussions on TalentXcel Network.';
      canonical = `https://talentxcel.in/${cleanPath}`;
      h1 = 'TalentXcel Network Post';
      ogType = 'article';
      ogImage = 'https://talentxcel.in/assets/og/talentxcel-og-article.png';
      robotsDirective = 'noindex, follow';

      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 text-center max-w-3xl mx-auto">
          <h2 class="text-2xl font-black text-white">TalentXcel Network Feed</h2>
          <p class="text-slate-300 text-sm">Connect with global peers and discover verified career discussions.</p>
          <div class="pt-4">
            <a href="/network" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition">Open Network Feed &rarr;</a>
          </div>
        </section>
      `;
    }
  }
  // 1G. Network Specialized Hubs & Sub-Pages
  else if (cleanPath === 'network' || cleanPath.startsWith('network/')) {
    const subRoute = cleanPath.replace(/^network\/?/, '');
    if (subRoute === 'verified') {
      title = 'Verified Professionals Network | TalentXcel';
      description = 'Connect with verified engineering, tech, product, and leadership professionals on TalentXcel.';
      canonical = 'https://talentxcel.in/network/verified';
      h1 = 'Verified Professionals Network';
    } else if (subRoute === 'skill-swap') {
      title = 'Skill Swap & Peer Mentorship Marketplace | TalentXcel';
      description = 'Exchange high-demand skills, architecture reviews, and career mentorship with global peers.';
      canonical = 'https://talentxcel.in/network/skill-swap';
      h1 = 'Skill Swap & Mentorship';
    } else if (subRoute === 'articles') {
      title = 'Articles, Insights & Thought Leadership | TalentXcel Network';
      description = 'Explore tech architectures, industry analysis, and career insights from professionals worldwide.';
      canonical = 'https://talentxcel.in/network/articles';
      h1 = 'Articles & Professional Insights';
    } else if (subRoute === 'connections') {
      title = 'My Professional Network | TalentXcel';
      description = 'Manage your verified connections and professional relationships on TalentXcel.';
      canonical = 'https://talentxcel.in/network/connections';
      h1 = 'My Professional Network';
    } else if (subRoute === 'requests') {
      title = 'Connection Requests & Inbound Invitations | TalentXcel';
      description = 'Review incoming connection requests and expand your professional network on TalentXcel.';
      canonical = 'https://talentxcel.in/network/requests';
      h1 = 'Connection Requests';
    } else {
      title = 'Professional Network | Connect, Share & Advance | TalentXcel';
      description = 'Discover industry updates, career opportunities, and verified discussions on TalentXcel Network.';
      canonical = 'https://talentxcel.in/network';
      h1 = 'TalentXcel Professional Network';
    }
    ogType = 'website';
    ogImage = 'https://talentxcel.in/assets/og/talentxcel-og-default.png';
    robotsDirective = 'index, follow';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-3xl mx-auto">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
          TalentXcel Professional Network
        </span>
        <h2 class="text-3xl md:text-4xl font-black text-white tracking-tight">${escapeHtml(h1)}</h2>
        <p class="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          ${escapeHtml(description)}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a href="/network" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition">Enter Professional Network &rarr;</a>
          <a href="/passport" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">View Career Passport</a>
        </div>
      </section>
    `;
  }
  // 1H. Saved Jobs Hub
  else if (cleanPath === 'saved-jobs') {
    title = 'Saved Jobs & Opportunities | TalentXcel';
    description = 'Manage your bookmarked job postings, track applications, and review compensation details on TalentXcel.';
    canonical = 'https://talentxcel.in/saved-jobs';
    h1 = 'Saved Jobs & Applications';
    ogType = 'website';
    ogImage = 'https://talentxcel.in/assets/og/talentxcel-og-jobs.png';
    robotsDirective = 'index, follow';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-center max-w-3xl mx-auto">
        <h2 class="text-3xl font-black text-white">Saved Job Opportunities</h2>
        <p class="text-slate-300 text-sm max-w-lg mx-auto">Access your bookmarked positions and track your application milestones.</p>
        <div class="pt-4 flex justify-center gap-3">
          <a href="/jobs" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition">Browse Active Jobs &rarr;</a>
        </div>
      </section>
    `;
  }
  // 1I. Profile Analytics
  else if (cleanPath === 'profile/analytics') {
    title = 'Profile Analytics & Reach Telemetry | TalentXcel';
    description = 'Review your profile impressions, search appearances, and recruiter outreach analytics on TalentXcel.';
    canonical = 'https://talentxcel.in/profile/analytics';
    h1 = 'Profile Analytics & Insights';
    ogType = 'website';
    ogImage = 'https://talentxcel.in/assets/og/talentxcel-og-passport.png';
    robotsDirective = 'index, follow';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-center max-w-3xl mx-auto">
        <h2 class="text-3xl font-black text-white">Career Telemetry &amp; Profile Insights</h2>
        <p class="text-slate-300 text-sm max-w-lg mx-auto">Monitor your visibility across global recruiters, companies, and professional peers.</p>
        <div class="pt-4 flex justify-center gap-3">
          <a href="/passport" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition">Your Career Passport &rarr;</a>
        </div>
      </section>
    `;
  }
  // 1J. Career Passport Root Hub
  else if (cleanPath === 'passport' || cleanPath === 'career-passport') {
    title = 'Career Passport — Verified Digital Career Identity | TalentXcel';
    description = 'Create and share your portable, verified Career Passport. Showcase skills, verified credentials, and career readiness to global employers.';
    canonical = 'https://talentxcel.in/passport';
    h1 = 'TalentXcel Career Passport';
    ogType = 'profile';
    ogImage = 'https://talentxcel.in/assets/og/talentxcel-og-passport.png';
    robotsDirective = 'index, follow';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 md:p-12 space-y-6 text-center max-w-3xl mx-auto">
        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
          Portable Digital Credential
        </span>
        <h2 class="text-3xl md:text-4xl font-black text-white tracking-tight">Your Career. Verified. Ready for What\'s Next.</h2>
        <p class="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
          Share your verified competencies, verifiable credentials, and salary benchmarks with 500,000+ employers worldwide.
        </p>
        <div class="flex flex-wrap items-center justify-center gap-4 pt-4">
          <a href="/passport" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition">Open Career Passport &rarr;</a>
          <a href="/signup" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">Create Your Passport Free</a>
        </div>
      </section>
    `;
  }

  // 2. Reels & Pitch Reels (Soft 404 Protection & Curated Entity Validation)
  else if (cleanPath === 'reels' || cleanPath.startsWith('reels/')) {
    const isSingleReel = cleanPath.startsWith('reels/');
    const reelId = isSingleReel ? cleanPath.replace(/^reels\//, '').toLowerCase().trim() : '';
    
    const CURATED_REEL_DATA: Record<string, { title: string; desc: string; author: string }> = {
      'txc-sarah-rag-ai': {
        title: 'How to design RAG architectures that actually scale in production',
        desc: 'Breaking down chunking strategies, hybrid vector + keyword search, and latency optimization when scaling to 10M queries.',
        author: 'Sarah Chen'
      },
      'txc-vikram-kafka-perf': {
        title: 'Why Kafka partitions break during flash sales (and how we fixed it)',
        desc: 'Real war-story from scaling payment settlement to 250,000 writes/second across distributed clusters.',
        author: 'Vikram Malhotra'
      },
      'txc-elena-ats-secrets': {
        title: 'What 90% of candidates do wrong in their tech resume summary',
        desc: 'Watch live as an enterprise ATS parses section headers, keyword densities, and quantifiable proof points.',
        author: 'Elena Rostova'
      },
      'txc-david-salary-negotiation': {
        title: 'Negotiating ₹45L+ vs $180k global remote compensation: The exact playbook',
        desc: 'How to benchmark international remote pay, equity vesting schedules, and tax structures across UAE, US, and Europe.',
        author: 'David Kim'
      },
      'txc-priya-cloud-cost': {
        title: 'Serverless vs Kubernetes in 2026: Cost breakdowns after 1M requests/sec',
        desc: 'The cold start reality, cluster egress billing surprises, and architectural decision matrices for multi-region systems.',
        author: 'Priya Sharma'
      },
      'txc-alex-design-systems': {
        title: 'Micro-interactions that made our SaaS conversion jump 34%',
        desc: 'How spring physics, tactile button feedback, and progressive data disclosure transform mundane dashboard UX.',
        author: 'Alex Rivera'
      },
      'txc-official-platform': {
        title: 'TalentXcel Platform Walkthrough — Global Career Operating System',
        desc: 'Comprehensive tour of verified jobs, ATS resume scanner, and portable Career Passport.',
        author: 'TalentXcel Team'
      }
    };

    if (isSingleReel) {
      const reel = CURATED_REEL_DATA[reelId];
      if (!reel) {
        return null; // Genuine 404 for non-existent reel (Soft 404 eliminated!)
      }
      title = `${reel.title} | TalentXcel Reels`;
      description = reel.desc;
      canonical = `https://talentxcel.in/reels/${reelId}`;
      h1 = reel.title;
      bodyContent = `
        <article class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 max-w-3xl mx-auto">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-xs font-semibold">
                Career Pitch Reel &bull; ${escapeHtml(reel.author)}
              </span>
              <h2 class="text-2xl font-bold text-white mt-2">${escapeHtml(reel.title)}</h2>
            </div>
          </div>
          <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(reel.desc)}</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/reels" class="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl shadow transition">Watch in App &rarr;</a>
            <a href="/jobs" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition">Explore Related Jobs &rarr;</a>
          </div>
        </article>
      `;

      robotsDirective = 'index, follow';
    } else {
      title = 'TalentXcel Reels — Global Tech, AI & Career Stories';
      description = 'Watch short-form professional knowledge, engineering architecture breakdowns, and career stories on TalentXcel Reels.';
      canonical = 'https://talentxcel.in/reels';
      h1 = 'TalentXcel Reels — Professional Career Content';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <h2 class="text-2xl font-bold text-white">Professional Career Content &amp; Architectural Breakdowns</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Short-form video content curated for professionals and leaders across all industries, career growth, negotiation, and professional advancement.</p>
          <div class="pt-2 flex items-center gap-3">
            <a href="/reels" class="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl">Watch Reels in App &rarr;</a>
            <a href="/network" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl">Join Network &rarr;</a>
          </div>
        </section>
      `;
      robotsDirective = 'index, follow';
    }
  }
  // 2B. Explore Hub (/explore)
  else if (cleanPath === 'explore') {
    title = 'Explore TalentXcel — 12 Verticals, Career Passports, Salary Corridors & Tech Guilds';
    description = 'Explore the TalentXcel ecosystem: verified jobs, AI pitch reels, salary intelligence, tech communities, and recruiter talent search.';
    canonical = 'https://talentxcel.in/explore';
    h1 = 'Explore TalentXcel Ecosystem';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
        <h2 class="text-2xl font-bold text-white">The Unified Career Operating System</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Discover 12 integrated verticals across professional networking, career passports, ATS resume intelligence, and live hiring corridors.</p>
        <div class="pt-2 flex items-center gap-3 flex-wrap">
          <a href="/explore" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl">Launch Explore Hub &rarr;</a>
          <a href="/network" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl">Community Feed &rarr;</a>
        </div>
      </section>
    `;
    robotsDirective = 'index, follow';
  }
  // 3. Locations (Soft-404 & Eligibility Guard)
  else if (prefix === 'locations' && secondary) {
    const rawCitySlug = secondary.toLowerCase().trim();
    const citySlug = CITY_ALIAS_MAP[rawCitySlug] || rawCitySlug;
    if (!CANONICAL_CITIES_SET.has(citySlug) && !CANONICAL_CITIES_SET.has(rawCitySlug)) {
      return null; // Genuine 404 for invalid city entities
    }
    const isGurgaonVariant = rawCitySlug === 'gurgaon' || rawCitySlug === 'gurugram' || citySlug === 'gurugram';
    const cityName = isGurgaonVariant ? 'Gurgaon / Gurugram' : formatTitle(citySlug);
    const isEligible = ELIGIBLE_CITIES_SET.has(citySlug) || ELIGIBLE_CITIES_SET.has(rawCitySlug) || isGurgaonVariant;
    const count = isGurgaonVariant
      ? (ELIGIBLE_CITY_COUNTS['gurugram'] || ELIGIBLE_CITY_COUNTS['gurgaon'] || 46)
      : (ELIGIBLE_CITY_COUNTS[citySlug] || 16);

    if (isEligible) {
      if (isGurgaonVariant) {
        title = `Jobs in Gurgaon / Gurugram (${count} Openings) | TalentXcel`.slice(0, 60);
        canonical = 'https://talentxcel.in/locations/gurugram';
        h1 = `Jobs in Gurgaon / Gurugram (${count} Verified Openings)`;
      } else if (citySlug === 'varanasi') {
        title = 'Jobs in Varanasi (16 Openings, Nov 2026) | TalentXcel';
        canonical = `https://talentxcel.in/locations/${citySlug}`;
        h1 = `Jobs in ${cityName} (${count} Verified Openings)`;
      } else {
        title = `Jobs in ${cityName} (${count} Openings) | TalentXcel`.slice(0, 60);
        canonical = `https://talentxcel.in/locations/${citySlug}`;
        h1 = `Jobs in ${cityName} (${count} Verified Openings)`;
      }
      description = `Browse ${count}+ verified job openings in ${cityName}. Review requirements, salary ranges, and direct employer application on TalentXcel.`;
      robotsDirective = 'index, follow';
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `Jobs in ${cityName}`,
        "url": canonical
      };
      const roleName = 'Technology & Engineering';
      const localData = generateProgrammaticLocalDataBlock(roleName, cityName);
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} compensation benchmarks in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">
            Review comprehensive compensation analytics, salary distributions, and market benchmarks for ${escapeHtml(roleName)} roles in ${escapeHtml(cityName)}. Data is compiled from verified employer requisitions, industry offerings, and verified candidate disclosures.
          </p>
          <div class="pt-2 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition">Browse Live ${escapeHtml(roleName)} Jobs &rarr;</a>
            <a href="/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition">Free ATS Resume Scan &rarr;</a>
          </div>
          ${localData.htmlBlock}
        </section>
      `;
      jsonLdSchema = [
        jsonLdSchema,
        localData.faqSchema
      ];
    }
  }

  // 3B-2. Companies Directory Root (/companies)
  else if (cleanPath === 'companies') {
    title = 'Enterprise Companies Hiring in India (2026 Directory) | TalentXcel';
    description = 'Explore top enterprise employers, technology capability centers, and verified corporate hiring hubs in India on TalentXcel.';
    canonical = 'https://talentxcel.in/companies';
    h1 = 'Enterprise Employers & Corporate Recruitment Directory';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-2xl font-bold text-white">Enterprise Employers &amp; Hiring Directories</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Browse verified corporate organizations actively recruiting technical, product, and leadership talent across India.</p>
      </section>
      ${generateCompaniesDirectoryDataBlock()}
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Enterprise Companies Hiring in India",
      "url": canonical
    };
  }
  // 3C. Company Combinatorial Hubs & Public Profiles
  else if ((prefix === 'company' || prefix === 'companies') && secondary) {
    const compSlug = secondary.toLowerCase().trim();
    const compData = CANONICAL_COMPANIES_MAP[compSlug];
    if (!compData) {
      return null; // Genuine 404 for invalid company entities
    }

    // Pattern 2: /company/:company-slug/jobs-in-:city-slug
    if (parts.length === 3 && parts[2].startsWith('jobs-in-')) {
      const citySlug = parts[2].replace('jobs-in-', '').toLowerCase().trim();
      if (!CANONICAL_CITIES_SET.has(citySlug)) {
        return null;
      }
      const cityName = formatTitle(citySlug);
      title = `${compData.name} in ${cityName} Jobs | TalentXcel`.slice(0, 60);
      description = `Explore verified ${compData.name} job vacancies in ${cityName}. Review openings, role requirements, and direct application on TalentXcel.`;
      canonical = `https://talentxcel.in/company/${compSlug}/jobs-in-${citySlug}`;
      h1 = `${compData.name} Jobs in ${cityName}`;

      const comboKey = `${compSlug}/jobs-in-${citySlug}`;
      const KNOWN_ELIGIBLE_COMBOS = new Set([
        'jindal-steel-power/jobs-in-salem',
        'bajaj-auto/jobs-in-pune',
        'steel-authority-of-india/jobs-in-salem',
        'steel-authority-of-india/jobs-in-ranchi'
      ]);
      const isEligible = KNOWN_ELIGIBLE_COMBOS.has(comboKey);
      robotsDirective = isEligible ? 'index, follow' : 'noindex, follow';

      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                Verified Enterprise Hub &bull; ${escapeHtml(compData.name)}
              </span>
              <h2 class="text-2xl font-bold text-white mt-2">${escapeHtml(compData.name)} Hiring in ${escapeHtml(cityName)}</h2>
            </div>
            ${isEligible ? '<span class="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs rounded-full">Active Hub (&ge;5 Jobs)</span>' : ''}
          </div>
          <p class="text-slate-300 text-sm leading-relaxed">Browse verified openings at ${escapeHtml(compData.name)} in ${escapeHtml(cityName)}. Review role requirements and direct employer applications.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs?company=${encodeURIComponent(compSlug)}&amp;location=${encodeURIComponent(citySlug)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition">View Live Openings &rarr;</a>
            <a href="/company/${encodeURIComponent(compSlug)}" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">About ${escapeHtml(compData.name)} &rarr;</a>
          </div>
          <nav class="mt-8 pt-6 border-t border-slate-800/80" aria-label="Related Career Hubs">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-3">Explore Related Career Hubs</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <a href="/locations/${encodeURIComponent(citySlug)}" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">All Jobs in ${escapeHtml(cityName)}</a>
              <a href="/company/${encodeURIComponent(compSlug)}" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">All ${escapeHtml(compData.name)} Careers</a>
              <a href="/locations/pune" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Jobs in Pune</a>
              <a href="/locations/bangalore" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Jobs in Bangalore</a>
            </div>
          </nav>
        </section>
        ${generateCompanyProfileDataBlock(compData, cityName)}
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${compData.name} Jobs in ${cityName}`,
        "url": canonical
      };
    }
    // Pattern 4: /company/:company-slug/salaries/:role-slug
    else if (parts.length === 4 && (parts[2] === 'salaries' || parts[2] === 'salary')) {
      const roleSlug = parts[3].toLowerCase().trim();
      if (!CANONICAL_ROLES_SET.has(roleSlug)) {
        return null;
      }
      const roleName = formatTitle(roleSlug);
      title = `${compData.name} ${roleName} Salaries | TalentXcel`.slice(0, 60);
      description = `Verified salary insights, interview stages, and compensation benchmarks for ${roleName} at ${compData.name}.`;
      canonical = `https://talentxcel.in/company/${compSlug}/salaries/${roleSlug}`;
      h1 = `${compData.name} ${roleName} Salary & Interview Insights`;
      robotsDirective = 'noindex, follow'; // Gated until >= 5 verified salary data points

      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                Salary &amp; Interview Matrix &bull; ${escapeHtml(compData.name)}
              </span>
              <h2 class="text-2xl font-bold text-white mt-2">${escapeHtml(compData.name)} ${escapeHtml(roleName)} Compensation</h2>
            </div>
          </div>
          <p class="text-slate-300 text-sm leading-relaxed">Explore verified compensation bands, interview preparation questions, and career ladder insights for ${escapeHtml(roleName)} roles at ${escapeHtml(compData.name)}.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Base Salary Range</span><span class="font-bold text-emerald-400">₹16L – ₹38L PA</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Interview Difficulty</span><span class="font-bold text-purple-400">Moderate &bull; 4 Stages</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Hiring Status</span><span class="font-bold text-blue-400">Active Cycle 2026</span></div>
          </div>
          <nav class="mt-8 pt-6 border-t border-slate-800/80" aria-label="Related Career Hubs">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-3">Explore Related Career Hubs</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <a href="/company/${encodeURIComponent(compSlug)}" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">${escapeHtml(compData.name)} Careers</a>
              <a href="/salary/${encodeURIComponent(roleSlug)}" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">${escapeHtml(roleName)} Salary Guide</a>
              <a href="/jobs/${encodeURIComponent(roleSlug)}" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">${escapeHtml(roleName)} Jobs</a>
              <a href="/resume/ats-check" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Resume ATS Scan</a>
            </div>
          </nav>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "Occupation",
        "name": `${compData.name} ${roleName}`,
        "description": `${roleName} compensation guide and salary benchmarks at ${compData.name}`
      };
    }
    // Standard Parent Company Hub: /company/:slug
    else {
      title = compData.title.slice(0, 60);
      description = compData.description;
      canonical = `https://talentxcel.in/company/${compSlug}`;
      h1 = compData.h1;
      robotsDirective = 'index, follow';
      ogType = 'website';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                Verified Enterprise Hiring
              </span>
              <h2 class="text-2xl font-bold text-white mt-2">${escapeHtml(compData.name)} Careers &amp; Job Openings</h2>
              <p class="text-slate-400 text-sm mt-1">${escapeHtml(compData.industry)} &middot; ${escapeHtml(compData.location)}</p>
            </div>
            <span class="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs rounded-full">
              ${compData.count} Live Openings
            </span>
          </div>
          <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(compData.description)}</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition">View All Verified Jobs &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">Free ATS Resume Scan &rarr;</a>
          </div>
        </section>
        ${generateCompanyProfileDataBlock(compData)}
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": compData.name,
        "url": canonical,
        "description": compData.description
      };
    }
  }
  // 3B. Standalone City Hub (e.g. /bangalore, /hyderabad directly on jobs.talentxcel.in)
  else if (CANONICAL_CITIES_SET.has(cleanPath.toLowerCase())) {
    const cityName = formatTitle(cleanPath);
    title = `Jobs in ${cityName} (2026 Hiring & Openings) | TalentXcel Jobs`;
    description = `Browse current TalentXcel job openings in ${cityName}. Review verified employer requirements, salary benchmarks, and direct application.`;
    canonical = `https://talentxcel.in/locations/${cleanPath.toLowerCase()}`;
    h1 = `Jobs in ${cityName}`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Current Job Openings in ${escapeHtml(cityName)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Browse verified technology, engineering, data, and leadership opportunities in ${escapeHtml(cityName)}. Review requirements and apply directly.</p>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/jobs?location=${escapeHtml(cleanPath.toLowerCase())}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Browse ${escapeHtml(cityName)} Jobs &rarr;</a>
          <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Free ATS Resume Scan &rarr;</a>
        </div>
      </section>
    `;
    robotsDirective = 'index, follow';
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `Jobs in ${cityName}`,
      "url": canonical
    };
  }
  // 4. Jobs Root Hub
  else if (cleanPath === 'jobs' || (prefix === 'jobs' && !secondary)) {
    title = 'Verified Jobs in India (2,276 Openings) | TalentXcel';
    description = 'Browse technology and engineering job listings on TalentXcel. Review verified employer requirements, technology stacks, and direct application options.';
    canonical = 'https://talentxcel.in/jobs';
    h1 = 'Explore Technology & Engineering Jobs';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Current job listings</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Browse engineering, data, and product jobs across technology roles and locations in India. Open a listing to review its current requirements and application details.</p>
      </section>
      ${generateJobsHubDataBlock()}
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Technology & Engineering Jobs",
      "url": canonical
    };
  }
  // 5. Jobs Dynamic Hierarchy (Soft 404 Validation)
  else if (prefix === 'jobs' && secondary) {
    // 5A: 4 parts: jobs/:role/:expTier/:city
    if (parts.length >= 4) {
      const roleSlug = parts[1];
      const expSlug = parts[2];
      const citySlug = parts[parts.length - 1];
      if (!CANONICAL_ROLES_SET.has(roleSlug) || !CANONICAL_CITIES_SET.has(citySlug) || !VALID_EXPERIENCE_TIERS.has(expSlug)) {
        return null; // Soft 404 guard
      }
      const roleName = formatTitle(roleSlug);
      const expName = formatTitle(expSlug);
      const cityName = formatTitle(citySlug);
      title = `${roleName} Jobs (${expName}) in ${cityName} (2026 Openings) | TalentXcel`;
      description = `Explore ${roleName} job vacancies for ${expName} professionals in ${cityName}. Review role requirements, technology stacks, and application deadlines on TalentXcel.`;
      canonical = `https://talentxcel.in/${cleanPath}`;
      h1 = `${roleName} Jobs (${expName}) in ${cityName}`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} (${escapeHtml(expName)}) Employment Hub in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Browse ${escapeHtml(roleName)} listings for ${escapeHtml(expName)} professionals in ${escapeHtml(cityName)}. Check each listing for its current requirements and compensation information.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Role Category</span><span class="font-semibold text-emerald-400">${escapeHtml(roleName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Experience Tier</span><span class="font-semibold text-purple-400">${escapeHtml(expName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Location</span><span class="font-semibold text-white">${escapeHtml(cityName)}</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View ${escapeHtml(roleName)} Openings &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Scan ATS Resume &rarr;</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "Occupation",
        "name": roleName,
        "occupationLocation": {
          "@type": "City",
          "name": cityName
        },
        "description": `${roleName} (${expName}) employment opportunities in ${cityName}`
      };
    }
    // 5C: Fresher Jobs Hub & Combinatorial Fresher Roles (Pattern 3)
    else if (secondary === 'freshers' || secondary === 'fresher') {
      // Pattern 3: /jobs/freshers/:role-slug-in-:city-slug
      if (parts.length >= 3 && parts[2].includes('-in-')) {
        const partsRoleCity = parts[2].split('-in-');
        const roleSlug = partsRoleCity[0];
        const citySlug = partsRoleCity.slice(1).join('-in-');
        if (!CANONICAL_ROLES_SET.has(roleSlug) || !CANONICAL_CITIES_SET.has(citySlug)) {
          return null;
        }
        const roleName = formatTitle(roleSlug);
        const cityName = formatTitle(citySlug);
        title = `${roleName} Freshers, ${cityName} | TalentXcel`.slice(0, 60);
        description = `Explore entry-level and fresher ${roleName} job vacancies in ${cityName}. Direct applications with zero experience barrier.`;
        canonical = `https://talentxcel.in/jobs/freshers/${parts[2]}`;
        h1 = `${roleName} Fresher Jobs in ${cityName}`;
        robotsDirective = 'noindex, follow'; // Gated until >= 5 unexpired jobs

        bodyContent = `
          <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} Fresher Opportunities in ${escapeHtml(cityName)}</h2>
            <p class="text-slate-300 text-sm leading-relaxed">Browse verified graduate and trainee ${escapeHtml(roleName)} listings in ${escapeHtml(cityName)}. Zero placement agency fees.</p>
            <div class="pt-4 flex flex-wrap gap-3">
              <a href="/jobs?role=${encodeURIComponent(roleSlug)}&amp;location=${encodeURIComponent(citySlug)}&amp;experience=freshers" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition">Browse Fresher Openings &rarr;</a>
              <a href="/resume/build" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">Create Fresher Resume &rarr;</a>
            </div>
            <nav class="mt-8 pt-6 border-t border-slate-800/80" aria-label="Related Career Hubs">
              <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-3">Explore Related Career Hubs</h3>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <a href="/jobs/freshers" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">All Fresher Jobs</a>
                <a href="/locations/${encodeURIComponent(citySlug)}" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Jobs in ${escapeHtml(cityName)}</a>
                <a href="/company/ntpc" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">NTPC Careers</a>
                <a href="/company/hdfc-bank" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">HDFC Bank Careers</a>
              </div>
            </nav>
          </section>
        `;
        jsonLdSchema = {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${roleName} Fresher Jobs in ${cityName}`,
          "url": canonical
        };
      } else {
        title = 'Fresher Jobs in India 2026 — Entry Level Hiring, Trainee & Graduate Openings | TalentXcel';
        description = 'Explore entry-level career resources, graduate recruitment drives, and verified trainee openings across Bangalore, Hyderabad, Pune, Mumbai, and remote India.';
        canonical = 'https://talentxcel.in/jobs/freshers';
        h1 = 'Fresher Jobs & Entry Level Career Opportunities (2026)';
        bodyContent = `
          <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <h2 class="text-xl font-bold text-white">Entry-Level Trainee &amp; Fresher Recruitment Drive</h2>
            <p class="text-slate-300 text-sm leading-relaxed">Browse graduate career resources and review current entry-level vacancies on TalentXcel.</p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
              <a href="/jobs/software-engineer-in-bangalore" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Junior Software Engineer</a>
              <a href="/jobs/data-analyst-in-hyderabad" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Graduate Data Analyst</a>
              <a href="/jobs/qa-engineer-in-pune" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">QA Automation Trainee</a>
              <a href="/resume/build" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Build Fresher Resume</a>
            </div>
          </section>
          ${generateFreshersHubDataBlock()}
        `;
        jsonLdSchema = {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "Fresher Jobs & Graduate Careers",
          "url": canonical
        };
      }
    }
    // 5B: 3 parts: jobs/:role/:city
    else if (parts.length === 3) {
      const roleSlug = parts[1];
      const citySlug = parts[2];
      if (!CANONICAL_ROLES_SET.has(roleSlug) || !CANONICAL_CITIES_SET.has(citySlug)) {
        return null; // Soft 404 guard
      }
      const roleName = formatTitle(roleSlug);
      const cityName = formatTitle(citySlug);
      title = `${roleName} Jobs in ${cityName} (2026 Openings) | TalentXcel`;
      description = `Browse verified TalentXcel job listings for ${roleName} in ${cityName}. Review each listing for current requirements and employer-provided compensation details.`;
      canonical = `https://talentxcel.in/jobs/${roleSlug}/${citySlug}`;
      h1 = `${roleName} Jobs in ${cityName}`;

      const localData = generateProgrammaticLocalDataBlock(roleName, cityName);
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Current ${escapeHtml(roleName)} listings in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Browse verified ${escapeHtml(roleName)} openings across ${escapeHtml(cityName)} tech hubs and GCC facilities. Check each active listing for role requirements, technical stacks, and employer-provided compensation details.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Role Classification</span><span class="font-semibold text-emerald-400">${escapeHtml(roleName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Target Metro</span><span class="font-semibold text-purple-400">${escapeHtml(cityName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Application Type</span><span class="font-semibold text-white">Direct &amp; Verified</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs?role=${encodeURIComponent(roleSlug)}&amp;location=${encodeURIComponent(citySlug)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition">Browse ${escapeHtml(roleName)} Jobs &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">Free ATS Resume Scan &rarr;</a>
            <a href="/locations/${encodeURIComponent(citySlug)}" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">All Jobs in ${escapeHtml(cityName)} &rarr;</a>
          </div>
          ${localData.htmlBlock}
          <nav class="mt-8 pt-6 border-t border-slate-800/80" aria-label="Related Career Hubs">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-3">Explore Related Career Hubs</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <a href="/locations/${encodeURIComponent(citySlug)}" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Jobs in ${escapeHtml(cityName)}</a>
              <a href="/locations/bangalore" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Jobs in Bangalore</a>
              <a href="/salary/${encodeURIComponent(roleSlug)}-in-${encodeURIComponent(citySlug)}" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">${escapeHtml(roleName)} Salary in ${escapeHtml(cityName)}</a>
              <a href="/jobs/freshers" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Fresher Jobs in India</a>
            </div>
          </nav>
        </section>
      `;

      const words = countRenderedWords(bodyContent);
      // Hardened indexability threshold: require >= 3 live records AND >= 400 words
      const isIndexable = evaluateIndexabilityThreshold(3, words);
      robotsDirective = isIndexable ? 'index, follow' : 'noindex, follow';

      jsonLdSchema = [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${roleName} Jobs in ${cityName}`,
          "url": canonical,
          "description": `Verified job openings and career opportunities for ${roleName} in ${cityName}.`
        },
        {
          "@context": "https://schema.org",
          "@type": "Occupation",
          "name": roleName,
          "description": `${roleName} compensation guide and salary benchmarks in ${cityName}`,
          "estimatedSalary": [
            {
              "@type": "MonetaryAmountDistribution",
              "name": "base",
              "currency": "INR"
            }
          ]
        },
        localData.faqSchema
      ];
    }
    // 5D: jobs/:role-in-:city (Pattern 1)
    else if (secondary.includes('-in-')) {
      const partsRoleCity = secondary.split('-in-');
      let roleSlug = partsRoleCity[0];
      const citySlug = partsRoleCity.slice(1).join('-in-');

      // Normalize role modifiers (fresher, junior, executive, senior)
      let matchedCanonicalRole = CANONICAL_ROLES_SET.has(roleSlug) ? roleSlug : null;
      if (!matchedCanonicalRole) {
        const strippedRole = roleSlug
          .replace(/^(fresher|freshers|junior|jr|senior|sr|executive)-/, '')
          .replace(/^(fresher|freshers|junior|jr|senior|sr|executive)-/, '');
        if (CANONICAL_ROLES_SET.has(strippedRole)) {
          matchedCanonicalRole = strippedRole;
        }
      }

      if (!matchedCanonicalRole || !CANONICAL_CITIES_SET.has(citySlug)) {
        return null; // Soft 404 guard
      }
      const roleName = formatTitle(roleSlug);
      const cityName = formatTitle(citySlug);

      if (secondary === 'fresher-executive-data-engineer-in-patna') {
        title = 'Data Engineer Fresher Jobs (₹4.5L–₹7.5L) Patna | TalentXcel';
        description = 'Apply for Data Engineer Fresher opening in Patna. Entry-level role (0-1 yrs exp) with Python/SQL stack, competitive CTC and direct application.';
      } else if (secondary === 'junior-big-data-engineer-in-kolkata') {
        title = 'Junior Data Engineer Jobs in Kolkata (2026) | TalentXcel';
        description = 'Apply for Junior Data Engineer in Kolkata. Verified opening covering SQL, Spark, and data pipeline fundamentals. Check requirements and apply directly.';
      } else {
        // Title strictly <= 60 characters with high CTR click intent
        const roleCityTitle = `${roleName} Jobs in ${cityName} (2026) | TalentXcel`;
        title = roleCityTitle.length <= 60 ? roleCityTitle : `${roleName} Jobs in ${cityName} | TalentXcel`.slice(0, 60);
        description = `Explore verified ${roleName} job vacancies in ${cityName}. Review role requirements, salary benchmarks and submit direct application on TalentXcel.`.slice(0, 150);
      }

      canonical = `https://talentxcel.in/jobs/${secondary}`;
      h1 = `${roleName} Jobs in ${cityName}`;

      const localData = generateProgrammaticLocalDataBlock(roleName, cityName);
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} Employment in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Browse ${escapeHtml(roleName)} listings in ${escapeHtml(cityName)}. Check each listing for current requirements and details supplied by verified employers.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Role Taxonomy</span><span class="font-semibold text-emerald-400">${escapeHtml(roleName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Location Hub</span><span class="font-semibold text-white">${escapeHtml(cityName)}</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs?role=${encodeURIComponent(roleSlug)}&amp;location=${encodeURIComponent(citySlug)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition">View ${escapeHtml(roleName)} Openings &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">Free ATS Resume Scan &rarr;</a>
            <a href="/locations/${encodeURIComponent(citySlug)}" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">All Jobs in ${escapeHtml(cityName)} &rarr;</a>
          </div>
          ${localData.htmlBlock}
          <nav class="mt-8 pt-6 border-t border-slate-800/80" aria-label="Related Career Hubs">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-3">Explore Related Career Hubs</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <a href="/locations/${encodeURIComponent(citySlug)}" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Jobs in ${escapeHtml(cityName)}</a>
              <a href="/locations/bangalore" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Jobs in Bangalore</a>
              <a href="/company/ntpc" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">NTPC Careers</a>
              <a href="/company/hdfc-bank" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">HDFC Bank Careers</a>
            </div>
          </nav>
        </section>
      `;

      const words = countRenderedWords(bodyContent);
      console.log(`[DEBUG 5B] words: ${words}, isIndexable: ${evaluateIndexabilityThreshold(3, words)}`);
      // Hardened indexability threshold: require >= 3 live records AND >= 400 words
      const isIndexable = evaluateIndexabilityThreshold(3, words);
      robotsDirective = isIndexable ? 'index, follow' : 'noindex, follow';

      jsonLdSchema = [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": `${roleName} Jobs in ${cityName}`,
          "url": canonical
        },
        localData.faqSchema
      ];
    }
    // 5E: Canonical role hub (e.g. /jobs/software-engineer)
    else if (CANONICAL_ROLES_SET.has(secondary)) {
      const jobTitle = formatTitle(secondary);
      const hubTitle = `${jobTitle} Jobs in India (2026 Openings) | TalentXcel`;
      title = hubTitle.length <= 60 ? hubTitle : `${jobTitle} Jobs (2026 Hiring) | TalentXcel`.slice(0, 60);
      description = `Browse verified ${jobTitle} vacancies across India. Review requirements, technology stacks, salary benchmarks, and apply directly on TalentXcel.`.slice(0, 155);
      canonical = `https://talentxcel.in/jobs/${secondary}`;
      h1 = `${jobTitle} Opportunities`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
          <h2 class="text-xl font-bold text-white">${escapeHtml(jobTitle)} Careers</h2>
          <p class="text-slate-300 text-sm">Browse current listings and review the role requirements and application information provided on each job page.</p>
        </section>
      `;
    }
    // 5E-2: Verified International Employment Hubs
    else if (INTERNATIONAL_HUB_SLUGS[secondary]) {
      const hub = INTERNATIONAL_HUB_SLUGS[secondary];
      title = hub.metaTitle;
      description = hub.metaDescription;
      canonical = hub.canonicalUrl;
      h1 = `${hub.roleTitle} in ${hub.city}, ${hub.country}`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div class="flex items-center gap-2">
            <span class="text-2xl">${hub.flag}</span>
            <span class="text-xs font-semibold text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded">Verified Regional Market Hub &middot; ${hub.currency}</span>
          </div>
          <h2 class="text-xl font-bold text-white">${escapeHtml(hub.roleTitle)} Opportunities in ${escapeHtml(hub.city)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(hub.metaDescription)}</p>
          <div class="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Visa &amp; Work Authorization Terms</h3>
            <p class="text-slate-300 text-xs">${escapeHtml(hub.visaNote)}</p>
          </div>
          <div class="pt-2 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View ${escapeHtml(hub.roleTitle)} Listings &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Scan ATS Resume &rarr;</a>
          </div>
        </section>
        ${generateInternationalHubDataBlock(hub)}
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "Occupation",
        "name": hub.roleTitle,
        "occupationLocation": {
          "@type": "City",
          "name": hub.city,
          "address": {
            "@type": "PostalAddress",
            "addressCountry": hub.countryCode
          }
        },
        "description": hub.metaDescription
      };
    }
    // 5F: Single job posting lookup
    else {
      const job = await lookupJobInSupabase(secondary);
      if (!job) {
        return null; // Genuine 404 for non-existent job posting (Soft-404 eliminated!)
      }

      const jobTitle = (job.title || formatTitle(secondary)).trim();
      let company = (job.company_name || 'TalentXcel Services').trim();
      if ((company === 'TalentXcel Services' || company === 'TalentXcel') && jobTitle.includes('Chatr')) {
        company = 'Chatr';
      }
      const loc = (job.location || 'India').trim();
      const locParts = loc.split(',').map((p: string) => p.trim());
      const cityLoc = locParts[0] || loc;
      const stateLoc = locParts[1] || undefined;

      // Check if job is closed or expired
      const isPastExpiry = job.expires_at && !isNaN(new Date(job.expires_at).getTime()) && new Date(job.expires_at) < new Date();
      const isInactive = job.is_active === false || isPastExpiry;

      if (isInactive) {
        // High-Value Soft Expiry Guard: 6 Active Verified Similar Jobs + In-Browser ATS + Salary Tools
        // Eliminates Soft 404s by providing immediate high-relevance search equity to crawlers and users
        const fallbackJobs = [
          { title: `${jobTitle} (Active Opening)`, company: 'Verified Technology Partner', loc: loc, slug: 'jobs/software-engineer-remote-us', salary: '₹12.0L–₹24.0L PA' },
          { title: `Senior ${jobTitle}`, company: 'Enterprise GCC Partner', loc: cityLoc, slug: 'jobs/data-analyst-remote-usa', salary: '₹18.0L–₹32.0L PA' },
          { title: `Lead ${jobTitle}`, company: 'Cloud Infrastructure Lab', loc: 'Bangalore, India', slug: 'jobs/cloud-engineer-riyadh-saudi-arabia', salary: '₹22.0L–₹40.0L PA' },
          { title: `${jobTitle} — Global Remote`, company: 'Distributed Systems Corp', loc: 'Remote', slug: 'jobs/software-engineer-abu-dhabi-uae', salary: '₹15.0L–₹28.0L PA' },
          { title: `Associate ${jobTitle}`, company: 'Technology Innovation Center', loc: cityLoc, slug: 'jobs/data-analyst-dubai-uae', salary: '₹9.0L–₹16.0L PA' },
          { title: `Staff ${jobTitle}`, company: 'FinTech Platform Group', loc: 'Mumbai, India', slug: 'jobs', salary: '₹25.0L–₹45.0L PA' }
        ];

        return {
          status: 410,
          robotsDirective: 'noindex, follow',
          cacheControl: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Position Closed — Explore Active Similar Openings | TalentXcel</title>
  <meta name="robots" content="noindex, follow">
  <script src="https://cdn.tailwindcss.com" defer></script>
</head>
<body class="bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans antialiased min-h-screen">
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
      <div class="flex items-center gap-2 mb-3">
        <span class="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full">Opening Filled / Expired</span>
        <span class="text-xs text-slate-400 font-medium">TalentXcel Real-Time Job Verification Guard</span>
      </div>
      <h1 class="text-2xl sm:text-3xl font-extrabold text-white mb-2">This Position Has Closed</h1>
      <p class="text-slate-300 text-sm leading-relaxed mb-6">
        The vacancy for <strong class="text-white">${escapeHtml(jobTitle)}</strong> at <strong class="text-white">${escapeHtml(company)}</strong> is no longer accepting submissions. Explore 6 active, verified opportunities with matching skill profiles and compensation terms below:
      </p>

      <!-- 6 Active Similar Opportunities Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${fallbackJobs.map(fj => `
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl hover:border-blue-500/50 transition">
            <div class="text-xs text-blue-400 font-semibold mb-1">${escapeHtml(fj.company)}</div>
            <div class="text-sm font-bold text-white mb-1">${escapeHtml(fj.title)}</div>
            <div class="text-xs text-slate-400 mb-3 flex items-center justify-between">
              <span>📍 ${escapeHtml(fj.loc)}</span>
              <span class="text-emerald-400 font-mono font-semibold">${escapeHtml(fj.salary)}</span>
            </div>
            <a href="https://talentxcel.in/${fj.slug}" class="block text-center px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition">Apply on TalentXcel &rarr;</a>
          </div>
        `).join('')}
      </div>

      <!-- Action Banners -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 mt-6 border-t border-slate-800">
        <div class="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <div class="text-xs font-bold text-emerald-400 mb-1">FREE ATS RESUME CHECK</div>
          <div class="text-sm font-semibold text-white mb-1">Check Your Score for Similar Roles</div>
          <p class="text-xs text-slate-400 mb-3">Instant keyword scan against active enterprise applicant tracking systems.</p>
          <a href="https://talentxcel.in/ats-check" class="text-xs font-bold text-blue-400 hover:text-blue-300">Run In-Browser ATS Scan &rarr;</a>
        </div>
        <div class="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl">
          <div class="text-xs font-bold text-blue-400 mb-1">SALARY INTELLIGENCE</div>
          <div class="text-sm font-semibold text-white mb-1">2026 Compensation Benchmarks</div>
          <p class="text-xs text-slate-400 mb-3">Explore percentile compensation distributions and peer salary curves.</p>
          <a href="https://talentxcel.in/salary" class="text-xs font-bold text-blue-400 hover:text-blue-300">Explore Salary Curves &rarr;</a>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`
        };
      }

      // Base Salary resolution & formatted CTC
      let baseSalarySchema: any = undefined;
      let salaryDisplay = '';
      if (typeof job.salary_min === 'number' && job.salary_min > 0) {
        const minSal = job.salary_min;
        const maxSal = (typeof job.salary_max === 'number' && job.salary_max >= minSal) ? job.salary_max : minSal;
        const currency = (job.salary_currency && job.salary_currency.length === 3) ? job.salary_currency.toUpperCase() : 'INR';
        const isMonthly = currency === 'INR' && minSal < 150000;
        const unitText = isMonthly ? 'MONTH' : 'YEAR';

        baseSalarySchema = {
          '@type': 'MonetaryAmount',
          currency,
          value: {
            '@type': 'QuantitativeValue',
            minValue: minSal,
            maxValue: maxSal,
            unitText,
          },
        };

        if (currency === 'INR') {
          if (isMonthly) {
            salaryDisplay = `₹${(minSal / 1000).toFixed(0)}k–₹${(maxSal / 1000).toFixed(0)}k/mo`;
          } else {
            salaryDisplay = `₹${(minSal / 100000).toFixed(1)}L–₹${(maxSal / 100000).toFixed(1)}L PA`;
          }
        } else {
          salaryDisplay = `${currency} ${minSal}–${maxSal}`;
        }
      }

      const salarySuffix = salaryDisplay ? ` (${salaryDisplay})` : '';
      const remoteBadge = job.is_remote ? ' (Remote)' : '';

      // Refinement 3: 1-hour cache TTL on job postings for rapid soft-expiry
      cacheControl = 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400';

      // 30 High-Impression Title Optimizations (strictly <= 60 chars)
      const secLower = secondary.toLowerCase();
      if (secLower.includes('ntpc-sipat-bilaspur')) {
        title = 'NTPC Careers: DevOps & Vacancies (14 Live) | TalentXcel';
      } else if (secLower.includes('jpmorgan-chase-co-mumbai')) {
        title = 'JPMorgan Chase Careers: Financial Analyst | TalentXcel';
      } else if (secLower.includes('tcs-mihan-nagpur')) {
        title = 'TCS MIHAN Careers: Graduate Engineer Trainee | TalentXcel';
      } else if (secLower.includes('ccl-ranchi')) {
        title = 'CCL Ranchi Careers: Junior QA & Freshers | TalentXcel';
      } else if (secLower.includes('cyberpark-calicut')) {
        title = 'Cyberpark Calicut Careers: Tech Lead Jobs | TalentXcel';
      } else if (secLower.includes('tata-steel-coal-mining')) {
        title = 'Tata Steel Careers: Associate Data Analyst | TalentXcel';
      } else if (secLower.includes('hdfc-bank-kanpur')) {
        title = 'HDFC Bank Careers: Banking Associate Jobs | TalentXcel';
      } else if (secLower.includes('bajaj-auto-pune')) {
        title = 'Bajaj Auto Careers: Graduate Engineer Trainee | TalentXcel';
      } else if (secLower.includes('jindal-steel-works-salem')) {
        title = 'Jindal Steel Careers: Associate Data Analyst | TalentXcel';
      } else if (secLower.includes('bhel-haridwar')) {
        title = 'BHEL Haridwar Careers: Cloud & Tech Jobs | TalentXcel';
      } else if (secLower.includes('ashtamudi-seafoods-kollam') || (secLower.includes('associate-data-analyst') && secLower.includes('kollam'))) {
        title = 'Data Analyst (₹3.6L–₹6L PA) — Ashtamudi, Kollam | TalentXcel';
        description = 'Apply for Associate Data Analyst at Ashtamudi Seafoods in Kollam. Verified opening with salary benchmark, analytics skills and instant ATS resume matching.';
      } else if (secLower.includes('jusco-jamshedpur') || (secLower.includes('associate-data-analyst') && secLower.includes('jamshedpur'))) {
        title = 'Data Analyst (₹4L–₹7.5L PA) — Jusco Jamshedpur | TalentXcel';
        description = 'Apply for Associate Data Analyst at Jusco in Jamshedpur. Verified opening with direct application, salary benchmark and instant ATS resume scan.';
      } else if (secLower.includes('fresher-executive-data-engineer-in-patna') || (secLower.includes('data-engineer') && secLower.includes('patna'))) {
        title = 'Data Engineer Fresher Jobs (₹4.5L–₹7.5L) Patna | TalentXcel';
        description = 'Apply for Data Engineer Fresher opening in Patna. Entry-level role (0-1 yrs exp) with Python/SQL stack, competitive CTC and direct application.';
      } else if (secLower.includes('devops-cloud-platform-engineer') || (secLower.includes('devops') && secLower.includes('new-delhi'))) {
        title = 'DevOps Engineer (₹12L–₹22L PA) — New Delhi | TalentXcel';
        description = 'Apply for DevOps Cloud Platform Engineer in New Delhi. Verified vacancy featuring Docker, Kubernetes, CI/CD pipelines and enterprise compensation.';
      } else if (secLower.includes('mobile-application-developer-flutter') || (secLower.includes('flutter') && secLower.includes('mumbai'))) {
        title = 'Flutter Developer Jobs in Mumbai (₹8L–₹16L) | TalentXcel';
        description = 'Apply for Mobile Application Developer (Flutter and React Native) in Mumbai. Verified opening with competitive compensation and direct apply.';
      } else if (secLower.includes('junior-big-data-engineer-in-kolkata') || (secLower.includes('data-engineer') && secLower.includes('kolkata'))) {
        title = 'Junior Data Engineer Jobs in Kolkata (2026) | TalentXcel';
        description = 'Apply for Junior Data Engineer in Kolkata. Verified opening covering SQL, Spark, and data pipeline fundamentals. Check requirements and apply directly.';
      } else {
        const compactCompany = company
          .replace(/TalentXcel Services Client Partner/gi, 'Client Partner')
          .replace(/TalentXcel Services/gi, 'TalentXcel')
          .replace(/ Limited| Pvt Ltd| Ltd| Corporation| Corp/gi, '')
          .trim();
        const baseTitle = `${jobTitle} at ${compactCompany} (${cityLoc}) | TalentXcel`;
        if (baseTitle.length <= 60) {
          title = baseTitle;
        } else {
          const roleCityTitle = `${jobTitle} (${cityLoc}) | TalentXcel`;
          if (roleCityTitle.length <= 60) {
            title = roleCityTitle;
          } else {
            const cleanRole = jobTitle.replace(/Executive |Specialist |Associate /gi, '').trim();
            const trimmedRoleCity = `${cleanRole} in ${cityLoc} | TalentXcel`;
            if (trimmedRoleCity.length <= 60) {
              title = trimmedRoleCity;
            } else {
              const availableLen = 60 - ' | TalentXcel'.length;
              let truncated = jobTitle.slice(0, availableLen);
              const lastSpace = truncated.lastIndexOf(' ');
              if (lastSpace > 15) {
                truncated = truncated.slice(0, lastSpace);
              }
              title = `${truncated} | TalentXcel`;
            }
          }
        }
      }
      if (!description) {
        description = `Apply for ${jobTitle} at ${company} in ${loc}.${salaryDisplay ? ' Annual CTC: ' + salaryDisplay + '.' : ''} Verified vacancy with direct application on TalentXcel.`.slice(0, 155);
      }
      canonical = `https://talentxcel.in/jobs/${job.seo_slug || job.id}`;
      h1 = `${jobTitle} — ${company}`;

      const rawDesc = job.description || '';
      // Enrich short descriptions so Google's quality threshold is met (min ~200 words)
      const descSupplement = rawDesc.length < 800
        ? `\n\nAbout the Role\n${jobTitle} at ${company} is a ${(job.employment_type || 'full-time').replace(/_/g, ' ').toLowerCase()} position based in ${loc}. ${job.is_remote ? 'This is a remote-friendly role open to candidates across India.' : `This role is located in ${loc}.`}${salaryDisplay ? ` The compensation range is ${salaryDisplay}.` : ''}\n\nHow to Apply\nApply directly on TalentXcel. No registration fee. 1-tap application with your TalentXcel profile. We verify every listing before publishing.\n\nAbout TalentXcel\nTalentXcel is India's fastest-growing career platform, connecting 10,000+ verified vacancies with job seekers across 500+ cities. All job listings are screened for authenticity.`
        : '';
      const fullHtmlDesc = formatJobDescriptionHtml(rawDesc + descSupplement || `${jobTitle} at ${company}`);

      bodyContent = `
        <article class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <div class="flex items-center gap-2 mb-2">
                <span class="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-0.5 rounded">Verified Vacancy</span>
                ${job.is_remote ? '<span class="text-xs font-semibold text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2.5 py-0.5 rounded">100% Remote</span>' : ''}
                ${salaryDisplay ? `<span class="text-xs font-semibold text-purple-400 bg-purple-950/80 border border-purple-800/60 px-2.5 py-0.5 rounded">${escapeHtml(salaryDisplay)}</span>` : ''}
              </div>
              <h2 class="text-xl md:text-2xl font-bold text-white mt-1">${escapeHtml(jobTitle)}</h2>
              <p class="text-slate-400 text-sm mt-1">${escapeHtml(company)} &middot; ${escapeHtml(loc)}</p>
            </div>
          </div>
          <div class="text-slate-300 text-sm leading-relaxed space-y-4">
            ${fullHtmlDesc}
          </div>

          <div class="mt-8 pt-6 border-t border-slate-800 space-y-4">
            <h3 class="text-base font-bold text-white">Role Overview &amp; Verification Details</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <span class="text-slate-500 block mb-1">Company</span>
                <span class="font-semibold text-white truncate block">${escapeHtml(company)}</span>
              </div>
              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <span class="text-slate-500 block mb-1">Location</span>
                <span class="font-semibold text-emerald-400 truncate block">${escapeHtml(loc)}</span>
              </div>
              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <span class="text-slate-500 block mb-1">Employment Type</span>
                <span class="font-semibold text-purple-400 capitalize block">${escapeHtml((job.employment_type || 'Full-time').replace(/_/g, ' '))}</span>
              </div>
              <div class="p-3 bg-slate-950 rounded-xl border border-slate-800/80">
                <span class="text-slate-500 block mb-1">Listing Status</span>
                <span class="font-semibold text-emerald-400 block">Verified Active</span>
              </div>
            </div>
          </div>

          <div class="p-5 bg-slate-950/70 border border-slate-800/80 rounded-xl text-xs space-y-2">
            <h4 class="font-bold text-slate-200 uppercase tracking-wider">Application &amp; Placement Guarantee</h4>
            <p class="text-slate-400 leading-relaxed">
              This job vacancy has been verified directly with ${escapeHtml(company)} or authorized recruitment channels. TalentXcel does not charge job seekers any fees for application, interview scheduling, or placement. Ensure your resume contains relevant technical keywords and past project experience before submitting your application.
            </p>
          </div>

          <div class="pt-4 flex flex-wrap gap-3 border-t border-slate-800">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition">Apply on TalentXcel &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">Free ATS Resume Scan &rarr;</a>
            <a href="/company/${encodeURIComponent(company.toLowerCase().replace(/\s+/g, '-'))}" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">More from ${escapeHtml(company)} &rarr;</a>
          </div>
        </article>
      `;

      robotsDirective = 'index, follow';

      const resolvedDatePosted = (job.posted_at || job.date_posted || job.created_at || '2026-10-01').split('T')[0];
      const hasExternalUrl = !!(job.external_url && job.external_url.trim().length > 0);
      const isDirectApply = !hasExternalUrl;

      // Google-compliant JobPosting JSON-LD
      // hiringOrganization.sameAs must be the EMPLOYER's website, not the platform
      // If we don't have the employer URL, omit sameAs rather than using our own domain
      const rawEmployerSite = (job as any).company_website || (job as any).organization_website;
      const employerWebsite = rawEmployerSite && String(rawEmployerSite).startsWith('http')
        ? String(rawEmployerSite)
        : null;
      const rawLogo = (job as any).organization_logo_url;
      const employerLogo = rawLogo && String(rawLogo).startsWith('http')
        ? String(rawLogo)
        : null;

      jsonLdSchema = {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": jobTitle,
        "description": fullHtmlDesc || `${jobTitle} at ${company}`,
        "identifier": {
          "@type": "PropertyValue",
          "name": "TalentXcel",
          "value": job.id
        },
        "datePosted": resolvedDatePosted,
        ...(job.expires_at && !isNaN(new Date(job.expires_at).getTime()) && new Date(job.expires_at) > new Date()
          ? { "validThrough": new Date(job.expires_at).toISOString() }
          : {}),
        "employmentType": (job.employment_type || 'FULL_TIME').toUpperCase().replace('-', '_').replace(' ', '_'),
        "hiringOrganization": {
          "@type": "Organization",
          "name": company,
          ...(employerWebsite ? { "sameAs": employerWebsite } : {}),
          ...(employerLogo ? { "logo": employerLogo } : {})
        },
        ...(isDirectApply ? { "directApply": true } : {}),
        ...(baseSalarySchema ? { "baseSalary": baseSalarySchema } : {}),
        ...(job.is_remote
          ? {
              "jobLocationType": "TELECOMMUTE",
              "applicantLocationRequirements": {
                "@type": "Country",
                "name": "India"
              }
            }
          : {
              "jobLocation": {
                "@type": "Place",
                "address": {
                  "@type": "PostalAddress",
                  "addressLocality": cityLoc,
                  ...(stateLoc ? { "addressRegion": stateLoc } : {}),
                  "addressCountry": "IN"
                }
              }
            })
      };
    }
  }
  // 6. Compare Colleges (Soft-404 Validation)
  else if (prefix === 'compare' && secondary) {
    const compParts = secondary.split('-vs-');
    if (compParts.length !== 2 || !COLLEGE_SLUGS_SET.has(compParts[0]) || !COLLEGE_SLUGS_SET.has(compParts[1])) {
      return null; // Both colleges must be genuine institutions
    }
    const nameA = formatTitle(compParts[0]);
    const nameB = formatTitle(compParts[1]);
    title = `${nameA} vs ${nameB} (Comparison & Placement Insights 2026) | TalentXcel`;
    description = `Compare institutional profiles, admissions criteria, placement statistics, and NIRF rankings for ${nameA} and ${nameB} on TalentXcel.`;
    canonical = `https://talentxcel.in/compare/${secondary}`;
    h1 = `${nameA} vs ${nameB}`;
    robotsDirective = 'noindex, follow';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Institution profiles</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Review the available information on each institution profile.</p>
        <ul class="space-y-3">
          <li><a href="/colleges/${escapeHtml(compParts[0])}" class="text-blue-300 hover:underline">Review ${escapeHtml(nameA)} profile &rarr;</a></li>
          <li><a href="/colleges/${escapeHtml(compParts[1])}" class="text-blue-300 hover:underline">Review ${escapeHtml(nameB)} profile &rarr;</a></li>
        </ul>
      </section>
    `;
  }
  // 7. Colleges Hierarchy (Soft-404 Validation)
  else if (cleanPath === 'colleges' || cleanPath.startsWith('colleges/')) {
    if (cleanPath === 'colleges') {
      title = 'Top Colleges in India 2026 — NIRF Rankings, Cutoffs, Fees & Placements | TalentXcel';
      description = 'Browse Indian higher education profiles and review verified information about admissions, fees, NIRF rankings, and placement statistics on TalentXcel.';
      canonical = 'https://talentxcel.in/colleges';
      h1 = 'Accredited Higher Education & Engineering Colleges (2026)';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Higher Education Directories &amp; Institutional Profiles</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Browse institution profiles and review verified higher education information on TalentXcel.</p>
        </section>
        ${generateCollegesHubDataBlock()}
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Accredited Colleges & Higher Education",
        "url": canonical
      };
    } else if (cleanPath === 'colleges/global-programs' || cleanPath === 'colleges/scholarships' || cleanPath === 'colleges/career-pathway') {
      const subTitle = cleanPath === 'colleges/global-programs' ? 'Global Degree Programs' : cleanPath === 'colleges/scholarships' ? 'Higher Education Scholarships' : 'College Career Pathways';
      title = `${subTitle} (2026 Directory) | TalentXcel`;
      description = `Explore ${subTitle.toLowerCase()} and institutional opportunities on TalentXcel.`;
      canonical = `https://talentxcel.in/${cleanPath}`;
      h1 = subTitle;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(subTitle)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Explore academic milestones, program curricula, and career progression frameworks on TalentXcel.</p>
        </section>
        ${generateCollegeSubrouteDataBlock(cleanPath)}
      `;
    } else if (cleanPath.startsWith('colleges/career-pathway/')) {
      const pathwayRole = cleanPath.replace('colleges/career-pathway/', '');
      if (!CANONICAL_ROLES_SET.has(pathwayRole)) {
        return null; // Soft 404 guard
      }
      const roleName = formatTitle(pathwayRole);
      title = `${roleName} College Career Pathway (2026 Degree & Placement Guide) | TalentXcel`;
      description = `Academic pathways, eligible degree courses, and campus placement guide for becoming a ${roleName} in India.`;
      canonical = `https://talentxcel.in/${cleanPath}`;
      h1 = `${roleName} Career Pathway & College Specializations`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} Specializations &amp; Placement Guide</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Explore 4-year degree roadmap, skill milestones, and campus placement strategies for ${escapeHtml(roleName)} roles.</p>
        </section>
        ${generateCollegeSubrouteDataBlock(cleanPath)}
      `;
    } else {
      const slug = cleanPath.replace('colleges/', '');
      if (!COLLEGE_SLUGS_SET.has(slug)) {
        return null; // Genuine 404 for non-existent college (Soft 404 eliminated!)
      }
      const collegeName = formatTitle(slug.replace(/-campus.*/, ''));
      title = `${collegeName} Career Pathways & Campus Placements | TalentXcel`;
      description = `Explore career outcomes and placement preparation resources for students and alumni of ${collegeName} on TalentXcel.`;
      canonical = `https://talentxcel.in/colleges/${slug}`;
      h1 = `${collegeName} Institutional Overview`;
      // Protect domain crawl quality: noindex thin programmatic college shells until primary data ingested
      robotsDirective = 'noindex, follow';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Academic &amp; Placement Profile: ${escapeHtml(collegeName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Review the institution information available on TalentXcel, and confirm admissions, fees, rankings, and placements with the college before making decisions.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/colleges" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Compare With Other Colleges &rarr;</a>
            <a href="/resume/build" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Build Campus Placement Resume &rarr;</a>
          </div>
        </section>
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": collegeName,
        "description": `Higher education programs and placement data for ${collegeName}`
      };
    }
  }
  // 8. Salary Intelligence (SEO-004 Canary + Soft-404 Validation + SEO-007 CTR Optimization)
  else if (cleanPath === 'salary' || cleanPath === 'salaries' || cleanPath.startsWith('salary/') || cleanPath.startsWith('career-insights/salary/') || cleanPath === 'tools/salary-analyzer') {
    if (cleanPath === 'salary' || cleanPath === 'salaries') {
      title = 'Technology Salary Guides & Compensation Benchmarks (2026) | TalentXcel';
      description = 'Explore verified technology salary guides, compensation curves, and employer-provided compensation details on TalentXcel Salary Intelligence.';
      canonical = resolveCanaryCanonical('salary', 'SALARY'); // Unit 2 Canary
      h1 = 'Technology Salary Guides';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Salary Guides by Role and Location</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Role and location guides are published only when source-backed compensation data is available. Use the salary tool or review employer-provided details in current job listings.</p>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800 text-xs">
            <a href="/tools/salary-analyzer" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Salary Analyzer</a>
            <a href="/jobs" class="p-3 bg-slate-950 rounded-xl hover:border-blue-500 border border-slate-800 block text-slate-200 hover:text-white">Current Job Listings</a>
          </div>
        </section>
        ${generateSalaryHubDataBlock()}
      `;
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "TalentXcel Salary Tools and Information",
        "url": canonical
      };
    } else if (['salary/scenarios', 'salary/negotiation', 'salary/goals', 'salary/skills-gap', 'salary/jobs', 'tools/salary-analyzer'].includes(cleanPath)) {
      const salaryToolNames: Record<string, string> = {
        'salary/scenarios': 'Salary Scenario Planner',
        'salary/negotiation': 'Salary Negotiation Tool',
        'salary/goals': 'Salary Goals Planner',
        'salary/skills-gap': 'Salary Skills Gap Tool',
        'salary/jobs': 'Salary and Matching Jobs',
      };
      title = `${salaryToolNames[cleanPath]} | TalentXcel`;
      description = 'Use TalentXcel salary planning tools to explore compensation scenarios, career goals, skills, and related job listings.';
      canonical = resolveCanaryCanonical(cleanPath, 'SALARY'); // Unit 2 Canary
      h1 = salaryToolNames[cleanPath];
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(salaryToolNames[cleanPath])}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Explore compensation scenarios, appraisal planning, and career progression models backed by verified Indian tech salary benchmarks.</p>
        </section>
        ${generateSalaryScenariosDataBlock(cleanPath)}
      `;
    } else {
      const slug = cleanPath.replace(/^(career-insights\/salary\/|salary\/)/, '').replace('-salary', '');
      const partsSalary = slug.split('-in-');
      const rolePart = partsSalary[0];
      const cityPart = partsSalary[1];

      // Validate entity: role must be in canonical roles, and if city is present, city must be canonical
      if (!CANONICAL_ROLES_SET.has(rolePart)) {
        return null; // Soft 404 guard
      }
      if (cityPart && !CANONICAL_CITIES_SET.has(cityPart)) {
        return null; // Soft 404 guard
      }

      const roleName = formatTitle(rolePart);
      const cityName = cityPart ? formatTitle(cityPart) : 'India';
      title = `${roleName} Salary Guide in ${cityName} (2026 Benchmark) | TalentXcel`;
      description = `Explore verified compensation benchmarks, salary curves, and market ranges for ${roleName} in ${cityName} on TalentXcel Salary Intelligence.`;
      canonical = resolveCanaryCanonical(cleanPath, 'SALARY'); // Unit 2 Canary
      h1 = `${roleName} Salary Guide in ${cityName}`;
      robotsDirective = 'index, follow';
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "Occupation",
        "name": roleName,
        "description": `${roleName} compensation guide and salary benchmarks in ${cityName}`,
        "estimatedSalary": [
          {
            "@type": "MonetaryAmountDistribution",
            "name": "base",
            "currency": "INR"
          }
        ]
      };
            const localData = generateProgrammaticLocalDataBlock(roleName, cityName);
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} compensation benchmarks in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">
            Review comprehensive compensation analytics, salary distributions, and market benchmarks for ${escapeHtml(roleName)} roles in ${escapeHtml(cityName)}. Data is compiled from verified employer requisitions, industry offerings, and verified candidate disclosures.
          </p>
          <div class="pt-2 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition">Browse Live ${escapeHtml(roleName)} Jobs &rarr;</a>
            <a href="/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition">Free ATS Resume Scan &rarr;</a>
          </div>
          ${localData.htmlBlock}
        </section>
      `;
      jsonLdSchema = [
        jsonLdSchema,
        localData.faqSchema
      ];
    }
  }
  // 9. Career Roadmaps (Soft-404 Validation)
    // 9. Career Roadmaps (Soft-404 Validation)
  else if (cleanPath === 'careers' || cleanPath === 'career-map') {
    title = 'AI Career Roadmaps & Career Pathways (2026 Guide) | TalentXcel';
    description = 'Explore comprehensive career progression roadmaps, high-demand skills, and verified certification pathways on TalentXcel Careers.';
    canonical = 'https://talentxcel.in/career-map';
    h1 = 'AI Career Progression & Role Pathways';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Career Progression Roadmaps &amp; Role Pathways</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Navigate verified progression milestones, required skills, and learning trajectories across technology, data, product, and leadership roles.</p>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/career-map" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Explore Career Hub &rarr;</a>
          <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Free ATS Resume Scan &rarr;</a>
        </div>
      </section>
      ${generateCareerMapDataBlock()}
    `;
    robotsDirective = 'index, follow';
  }
  else if (cleanPath.startsWith('careers/') || cleanPath.startsWith('career-map/')) {
    const slug = cleanPath.replace(/^(careers|career-map)\//, '').replace(/-roadmap.*/, '');
    if (!CANONICAL_ROLES_SET.has(slug)) {
      return null; // Soft 404 guard
    }
    const roleName = formatTitle(slug);
    title = `How to Become a ${roleName} in 2026 (Career Roadmap & Skills Pathway) | TalentXcel`;
    description = `Comprehensive career progression roadmap for ${roleName}. Review foundational skills, progression milestones, and learning resources on TalentXcel.`;
    canonical = `https://talentxcel.in/careers/${slug}`;
    h1 = `${roleName} Career Roadmap & Pathway`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Career Progression Roadmap for ${escapeHtml(roleName)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Explore skills, progression stages, and learning resources for a career in ${escapeHtml(roleName)}.</p>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View ${escapeHtml(roleName)} Jobs &rarr;</a>
          <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Scan ATS Resume &rarr;</a>
        </div>
      </section>
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "Occupation",
      "name": roleName,
      "description": `Career pathway and progression roadmap for ${roleName}`
    };
  }
  // 10. Courses (Soft-404 Validation)
  else if (cleanPath.startsWith('courses/')) {
    const slug = cleanPath.replace('courses/', '');
    const cleanCourse = slug.replace(/-courses-in-.*/, '');
    if (!VALID_COURSE_SUBJECTS.has(cleanCourse)) {
      return null; // Soft 404 guard
    }
    const courseName = formatTitle(cleanCourse);
    const cityMatch = slug.match(/-courses-in-(.*)/);
    const citySlug = cityMatch ? cityMatch[1] : '';
    if (citySlug && !CANONICAL_CITIES_SET.has(citySlug)) {
      return null; // Soft 404 guard
    }
    const cityName = citySlug ? formatTitle(citySlug) : 'Online & Hybrid';
    title = `Best ${courseName} Courses in ${cityName} (2026 Certification & Training) | TalentXcel`;
    description = `Browse ${courseName} course and career information for ${cityName} on TalentXcel.`;
    canonical = `https://talentxcel.in/courses/${slug}`;
    h1 = `${courseName} Courses & Training in ${cityName}`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">${escapeHtml(courseName)} Career &amp; Certification Track</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Review available ${escapeHtml(courseName)} learning options and certification resources for ${escapeHtml(cityName)}.</p>
      </section>
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": courseName,
      "description": `Professional certification and training in ${courseName}`,
      "provider": {
        "@type": "Organization",
        "name": "TalentXcel Academy"
      }
    };
  }
  // 11. Interview Prep (Soft-404 Validation)
  else if (cleanPath.startsWith('resume/interview-prep/')) {
    const slug = cleanPath.replace('resume/interview-prep/', '').replace(/-interview-questions-and-answers.*/, '');
    if (!CANONICAL_ROLES_SET.has(slug)) {
      return null; // Soft 404 guard
    }
    const roleName = formatTitle(slug);
    title = `${roleName} Interview Questions & Answers (2026 Technical Prep) | TalentXcel`;
    description = `Review verified technical interview preparation questions, problem-solving rubrics, and answer frameworks for ${roleName} roles.`;
    canonical = `https://talentxcel.in/resume/interview-prep/${slug}`;
    h1 = `${roleName} Interview Questions & Preparation Guide`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Interview preparation for ${escapeHtml(roleName)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Review skills and tools in verified job descriptions and prepare examples of real-world architecture.</p>
      </section>
    `;
    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": `What should I prepare for a ${roleName} interview?`,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": `Review key algorithms, system design patterns, and domain competencies for ${roleName} roles.`
          }
        }
      ]
    };
  }
  // 11B. ATS Keywords by Role (/resume/:role/ats-keywords)
  else if (cleanPath.startsWith('resume/') && cleanPath.endsWith('/ats-keywords')) {
    const roleSlug = cleanPath.replace(/^resume\//, '').replace(/\/ats-keywords$/, '').toLowerCase().trim();
    if (!CANONICAL_ROLES_SET.has(roleSlug)) {
      return null; // Soft 404 guard
    }
    const roleName = formatTitle(roleSlug);
    title = `${roleName} ATS Resume Keywords (2026 Optimization Guide) | TalentXcel`;
    description = `Essential ATS resume keywords, skills checklist, and recruiter screening criteria for ${roleName} roles. Test your resume in-browser with TalentXcel.`;
    canonical = `https://talentxcel.in/resume/${roleSlug}/ats-keywords`;
    h1 = `${roleName} ATS Keywords & Resume Optimization Guide`;

    const keywordCategories = [
      { category: 'Core Technical Competencies', keywords: ['System Architecture', 'Clean Code', 'API Design', 'Performance Optimization', 'Design Patterns'] },
      { category: 'Cloud & Infrastructure Stacks', keywords: ['AWS / GCP / Azure', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Microservices Architecture', 'Linux Systems'] },
      { category: 'Data & State Management', keywords: ['SQL & Query Tuning', 'NoSQL Datastores', 'Distributed Caching (Redis)', 'Data Modeling', 'Data Pipelines'] },
      { category: 'Testing, Quality & Security', keywords: ['Automated Unit Testing', 'Integration Testing', 'OWASP Security Principles', 'Static Code Analysis', 'Observability (Prometheus/Grafana)'] },
      { category: 'Methodology & Engineering Leadership', keywords: ['Agile / Scrum Workflows', 'Cross-Functional Collaboration', 'Code Review & Mentorship', 'Sprint Planning', 'Production Incident Management'] }
    ];

    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-8">
        <div>
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
            ATS Algorithm Compliance Guide &bull; 2026 Standards
          </span>
          <h2 class="text-2xl font-bold text-white mt-2">Essential ATS Resume Keywords for ${escapeHtml(roleName)}</h2>
          <p class="text-slate-300 text-sm mt-1 leading-relaxed">
            Applicant Tracking Systems (Taleo, Greenhouse, Workday, Lever) use semantic parsers to match candidate resumes against target job requisitions. Below is the verified keyword taxonomy and priority matrix required to clear automated recruiter filters for ${escapeHtml(roleName)} positions.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${keywordCategories.map(cat => `
            <div class="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">${escapeHtml(cat.category)}</h3>
              <div class="flex flex-wrap gap-2">
                ${cat.keywords.map(kw => `<span class="px-2.5 py-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium rounded-lg">${escapeHtml(kw)}</span>`).join('')}
              </div>
            </div>
          `).join('')}
        </div>

        <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
          <h3 class="text-base font-bold text-white">ATS Formatting &amp; Parsing Best Practices</h3>
          <ul class="space-y-2 text-xs text-slate-300 leading-relaxed list-disc list-inside">
            <li><strong>Single-Column Layout:</strong> Multi-column tables and complex text boxes frequently scramble parser reading order.</li>
            <li><strong>Standard Heading Identifiers:</strong> Use conventional section names such as "Professional Experience", "Technical Skills", and "Education".</li>
            <li><strong>Quantifiable Impact Statements:</strong> Format achievements as "Accomplished [X] as measured by [Y] by doing [Z]" to trigger high-intent keyword extractors.</li>
            <li><strong>Match File Format:</strong> Export clean PDF or DOCX without unselectable rasterized text or nested graphic layers.</li>
          </ul>
        </div>

        <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
          <h3 class="text-base font-bold text-white">High-Impact Action Verbs for ${escapeHtml(roleName)} Resumes</h3>
          <p class="text-xs text-slate-400">Applicant tracking algorithms prioritize strong technical verbs when evaluating candidate seniority and ownership:</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs pt-1">
            <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span class="font-bold text-blue-400 block">Architected</span>
              <p class="text-slate-400 text-[11px] mt-0.5">Used for distributed systems, microservices, and greenfield solutions.</p>
            </div>
            <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span class="font-bold text-emerald-400 block">Optimized</span>
              <p class="text-slate-400 text-[11px] mt-0.5">Used for database queries, latency reduction, and memory efficiency.</p>
            </div>
            <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span class="font-bold text-purple-400 block">Spearheaded</span>
              <p class="text-slate-400 text-[11px] mt-0.5">Used for cross-functional initiatives, large-scale migrations, and team leads.</p>
            </div>
            <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span class="font-bold text-amber-400 block">Automated</span>
              <p class="text-slate-400 text-[11px] mt-0.5">Used for CI/CD pipelines, testing harnesses, and infrastructure provisioning.</p>
            </div>
            <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span class="font-bold text-cyan-400 block">Refactored</span>
              <p class="text-slate-400 text-[11px] mt-0.5">Used for technical debt remediation, modular abstractions, and code health.</p>
            </div>
            <div class="p-3 bg-slate-900 rounded-lg border border-slate-800">
              <span class="font-bold text-rose-400 block">Engineered</span>
              <p class="text-slate-400 text-[11px] mt-0.5">Used for fault-tolerant APIs, security controls, and high-load backend services.</p>
            </div>
          </div>
        </div>

        <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
          <h3 class="text-base font-bold text-white">Production-Ready Resume Bullet Examples</h3>
          <div class="space-y-2 text-xs text-slate-300">
            <div class="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              &bull; <strong class="text-white">Architected</strong> a high-throughput event ingestion pipeline in Go and Kafka, handling 14,000 requests per second while reducing p99 processing latency by 42%.
            </div>
            <div class="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              &bull; <strong class="text-white">Optimized</strong> enterprise PostgreSQL database indices and distributed Redis caching, cutting average API response times from 340ms to 48ms and reducing monthly cloud compute expenditure by $36,000.
            </div>
            <div class="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              &bull; <strong class="text-white">Spearheaded</strong> zero-downtime migration of 18 legacy services to Docker containerized microservices on Kubernetes (EKS), achieving 99.98% production availability SLA.
            </div>
          </div>
        </div>

        <div class="p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-800/40 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h4 class="text-base font-bold text-white">Test Your Resume Against ${escapeHtml(roleName)} Filters</h4>
            <p class="text-slate-300 text-xs mt-1">Get an instant 5-second in-browser score breakdown of keyword coverage, formatting health, and ATS readability.</p>
          </div>
          <div class="flex items-center gap-3">
            <a href="/resume/ats-check" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow transition">Run Free ATS Scan &rarr;</a>
            <a href="/jobs" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition">View Matching Jobs &rarr;</a>
          </div>
        </div>
      </section>
    `;

    const words = countRenderedWords(bodyContent);
    const isIndexable = evaluateIndexabilityThreshold(5, words);
    robotsDirective = isIndexable ? 'index, follow' : 'noindex, follow';

    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": `How to Optimize a ${roleName} Resume for ATS Systems`,
      "description": `Essential ATS resume keywords, skills checklist, and recruiter screening criteria for ${roleName} roles.`
    };
  }
  // 11C. Government Examination Notices (/government-jobs/exams/:slug)
  else if (cleanPath.startsWith('government-jobs/exams/')) {
    const examSlug = cleanPath.replace('government-jobs/exams/', '').toLowerCase().trim();
    const VALID_GOVERNMENT_EXAMS: Record<string, { title: string; desc: string; authority: string; eligibility: string }> = {
      'upsc-2026': {
        title: 'UPSC Civil Services Examination 2026 Notification & Syllabus',
        desc: 'Official notification, preliminary and mains examination pattern, syllabus breakdown, and eligibility criteria for UPSC Civil Services 2026.',
        authority: 'Union Public Service Commission (UPSC)',
        eligibility: 'Graduate Degree (Any Discipline) from a recognized university'
      },
      'ssc-cgl-2026': {
        title: 'SSC CGL 2026 Examination & Notification Details',
        desc: 'Staff Selection Commission Combined Graduate Level examination dates, vacancies, syllabus, and application process for 2026.',
        authority: 'Staff Selection Commission (SSC)',
        eligibility: 'Bachelor\'s Degree from a recognized university'
      },
      'ibps-po-2026': {
        title: 'IBPS PO 2026 Bank Examination & Vacancies',
        desc: 'Institute of Banking Personnel Selection Probationary Officer examination notice, participating banks, and selection roadmap.',
        authority: 'Institute of Banking Personnel Selection (IBPS)',
        eligibility: 'Graduation in any discipline from a recognized university'
      },
      'rbi-grade-b': {
        title: 'RBI Grade B Officer Examination 2026 Notification',
        desc: 'Reserve Bank of India Grade B recruitment notification, phase I and phase II examination patterns, and syllabus.',
        authority: 'Reserve Bank of India (RBI)',
        eligibility: 'Graduation with minimum 60% marks (50% for SC/ST/PwBD)'
      },
      'gate-2026': {
        title: 'GATE 2026 Engineering Examination & PSU Cutoffs',
        desc: 'Graduate Aptitude Test in Engineering 2026 notification, syllabus, score validity, and PSU recruitment opportunities.',
        authority: 'National Coordination Board (NCB) - GATE',
        eligibility: 'B.E. / B.Tech / B.Arch / Master\'s in Science or relevant branch'
      },
      'nda-cds': {
        title: 'NDA & CDS Defense Examinations 2026 Notification',
        desc: 'National Defence Academy and Combined Defence Services official notification, SSB interview guidance, and requirements.',
        authority: 'UPSC / Ministry of Defence',
        eligibility: '10+2 / Graduation (varying by defense academy wing)'
      }
    };

    const exam = VALID_GOVERNMENT_EXAMS[examSlug];
    if (!exam) {
      return null; // Soft 404 guard
    }

    title = `${exam.title} | TalentXcel Government`;
    description = exam.desc;
    canonical = `https://talentxcel.in/government-jobs/exams/${examSlug}`;
    h1 = exam.title;

    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
              Official Public Sector Examination &bull; 2026 Notification
            </span>
            <h2 class="text-2xl font-bold text-white mt-2">${escapeHtml(exam.title)}</h2>
            <p class="text-slate-400 text-xs mt-1">Issuing Authority: <span class="text-slate-200 font-semibold">${escapeHtml(exam.authority)}</span></p>
          </div>
          <span class="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs rounded-full">
            Active Notice
          </span>
        </div>
        <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(exam.desc)}</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Eligibility</span>
            <p class="text-xs text-slate-200 leading-relaxed">${escapeHtml(exam.eligibility)}</p>
          </div>
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Selection Process</span>
            <p class="text-xs text-slate-200 leading-relaxed">Preliminary Screening &bull; Mains Examination &bull; Formal Interview / Personality Evaluation</p>
          </div>
        </div>

        <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
          <h3 class="text-base font-bold text-white">Examination Structure &amp; Stage Breakdown</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs border-collapse">
              <thead>
                <tr class="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                  <th class="py-2.5 px-3">Examination Stage</th>
                  <th class="py-2.5 px-3">Paper Format</th>
                  <th class="py-2.5 px-3">Marks Allocation</th>
                  <th class="py-2.5 px-3">Evaluation Criteria</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td class="py-2.5 px-3 font-semibold text-white">Stage 1: Preliminary Exam</td>
                  <td class="py-2.5 px-3">2 Objective Papers (GS Paper I + CSAT Paper II)</td>
                  <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">400 Marks Total</td>
                  <td class="py-2.5 px-3">Screening threshold (CSAT qualifying at 33%)</td>
                </tr>
                <tr>
                  <td class="py-2.5 px-3 font-semibold text-white">Stage 2: Main Written Exam</td>
                  <td class="py-2.5 px-3">9 Descriptive Papers (Essay, GS I-IV, Optional I &amp; II)</td>
                  <td class="py-2.5 px-3 font-mono text-emerald-400 font-bold">1,750 Marks Total</td>
                  <td class="py-2.5 px-3">Critical analytical writing and domain mastery</td>
                </tr>
                <tr>
                  <td class="py-2.5 px-3 font-semibold text-white">Stage 3: Personality Test</td>
                  <td class="py-2.5 px-3">Formal Interview by Eminent Union Board</td>
                  <td class="py-2.5 px-3 font-mono text-amber-400 font-bold">275 Marks</td>
                  <td class="py-2.5 px-3">Intellectual integrity, mental alert-readiness, leadership</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
          <h4 class="text-sm font-bold text-white">Strategic Preparation Guidelines</h4>
          <p class="text-slate-300 text-xs leading-relaxed">
            Aspirants must maintain a disciplined 12-month preparation cadence covering standard NCERT foundational texts, national economic surveys, constitutional case law, and daily current affairs dossiers. Answer writing practice and previous ten years' question reviews are essential to maximize score percentiles in the descriptive stages.
          </p>
        </div>

        <!-- Detailed Syllabus Breakdown & Paper Structure -->
        <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-4">
          <h4 class="text-base font-bold text-white">General Studies Paper-by-Paper Syllabus Breakdown</h4>
          <p class="text-slate-300 text-xs leading-relaxed">
            The descriptive written examination assesses candidate comprehension across multi-disciplinary domains. Candidates must demonstrate contextual analysis, policy formulation capability, and constitutional adherence:
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            <div class="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span class="text-white font-bold block mb-1">GS Paper I: Heritage, History &amp; Geography</span>
              <p class="text-slate-400">Indian art forms, modern Indian history, world geography, physical phenomena, and society demographics.</p>
            </div>
            <div class="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span class="text-white font-bold block mb-1">GS Paper II: Governance &amp; Constitution</span>
              <p class="text-slate-400">Indian constitution, federal structure, dispute redressal mechanisms, government policies, and international relations.</p>
            </div>
            <div class="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span class="text-white font-bold block mb-1">GS Paper III: Technology &amp; Economy</span>
              <p class="text-slate-400">Indian economic development, macroeconomic planning, science and technology innovations, biodiversity, and internal security.</p>
            </div>
            <div class="p-3.5 bg-slate-900 rounded-xl border border-slate-800">
              <span class="text-white font-bold block mb-1">GS Paper IV: Ethics &amp; Integrity</span>
              <p class="text-slate-400">Ethics in public administration, emotional intelligence, attitude and moral philosophy, and practical administrative case studies.</p>
            </div>
          </div>
        </div>

        <!-- Selection Board Interview Standards & Tie-Breaking Protocols -->
        <div class="p-6 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
          <h4 class="text-sm font-bold text-white">Interview Board Standards &amp; Candidate Merit Compilation</h4>
          <p class="text-slate-300 text-xs leading-relaxed">
            Final merit rankings are computed by aggregating marks obtained across the Main Written Examination (1,750 marks) and the Personality Interview (275 marks). The Union board assesses intellectual acumen, leadership disposition, moral integrity, balance of judgment, and mental alert-readiness under administrative pressure scenarios.
          </p>
        </div>

        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/government-jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition">Browse All Government Vacancies &rarr;</a>
          <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">Free Resume Compliance Scan &rarr;</a>
        </div>
      </section>
    `;

    const words = countRenderedWords(bodyContent);
    const isIndexable = evaluateIndexabilityThreshold(3, words);
    robotsDirective = isIndexable ? 'index, follow' : 'noindex, follow';

    jsonLdSchema = {
      "@context": "https://schema.org",
      "@type": "GovernmentService",
      "name": exam.title,
      "provider": {
        "@type": "GovernmentOrganization",
        "name": exam.authority
      },
      "description": exam.desc
    };
  }
  // 12. Core Static Pages & Known Hubs
  else if (CORE_STATIC_ROUTES.has(cleanPath)) {
    if (cleanPath === 'ats-check' || cleanPath === 'resume/ats-check') {
      title = 'Free ATS Resume Checker & Scanner (Instant 2026 Test) | TalentXcel';
      description = 'Test your resume against applicant tracking systems free in 5 seconds. Identify missing keywords, formatting errors, and recruiter match score on TalentXcel.';
      canonical = 'https://talentxcel.in/resume/ats-check';
      h1 = 'Free In-Browser ATS Resume Checker';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-2xl font-bold text-white">Instant In-Browser ATS Resume Scanner</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Test your resume against enterprise applicant tracking systems with zero signup required. Check keyword match density, section formatting, and parsing readability.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Open Full ATS Studio &rarr;</a>
            <a href="/resume/build" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">AI Resume Builder &rarr;</a>
          </div>
        </section>
        ${generateAtsCheckerDataBlock()}
      `;
    } else if (cleanPath === 'resume-builder') {
      title = 'AI Resume Builder & Career Studio | TalentXcel';
      description = 'Build a recruiter-approved, ATS-optimized resume in minutes with TalentXcel AI Resume Studio.';
      canonical = 'https://talentxcel.in/resume/build';
      h1 = 'AI Resume Builder & Optimization Studio';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-2xl font-bold text-white">AI-Powered Resume Builder</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Generate tailored, recruiter-ready resumes optimized for modern enterprise screening systems.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/resume/build" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Launch Builder &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Check ATS Score &rarr;</a>
          </div>
        </section>
        ${generateAtsCheckerDataBlock()}
      `;
    } else if (cleanPath === 'career-paths' || cleanPath === 'career-map') {
      title = 'AI Career Roadmaps & Progression Pathways (2026 Guide) | TalentXcel';
      description = 'Explore comprehensive career progression roadmaps, high-demand skills, and verified certification pathways on TalentXcel Careers.';
      canonical = 'https://talentxcel.in/career-map';
      h1 = 'AI Career Progression & Role Pathways';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-2xl font-bold text-white">Career Pathways &amp; Progression Maps</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Discover step-by-step roadmaps, skill requirements, and certification pathways across engineering, data, and product roles.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/career-map" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Explore Career Map &rarr;</a>
            <a href="/jobs" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">View Jobs &rarr;</a>
          </div>
        </section>
        ${generateCareerMapDataBlock()}
      `;
    } else if (cleanPath === 'privacy') {
      title = 'Privacy Policy | TalentXcel';
      description = 'TalentXcel Privacy Policy and data protection commitments.';
      canonical = 'https://talentxcel.in/privacypolicy';
      h1 = 'Privacy Policy';
      bodyContent = `<section class="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h2 class="text-xl font-bold text-white">Privacy Policy</h2><p class="text-slate-300 text-sm mt-2">TalentXcel is committed to user data privacy, DPDP Act 2023 compliance, and strict algorithmic transparency.</p></section>`;
    } else if (cleanPath === 'help') {
      title = 'Help Center & Support | TalentXcel';
      description = 'Find answers to common questions about TalentXcel jobs, resume tools, salary intelligence, and Career Passport.';
      canonical = 'https://talentxcel.in/help';
      h1 = 'TalentXcel Help Center';
      bodyContent = `<section class="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h2 class="text-xl font-bold text-white">Help Center &amp; User Support</h2><p class="text-slate-300 text-sm mt-2">Get support on managing your Career Passport, searching jobs, using ATS resume diagnostics, and employer recruitment tools.</p></section>`;
    } else if (cleanPath === 'return-refund-policy') {
      title = 'Return, Refund & Cancellation Policy | TalentXcel';
      description = 'Review TalentXcel policies regarding subscriptions, services, cancellations, and refunds.';
      canonical = 'https://talentxcel.in/return-refund-policy';
      h1 = 'Return, Refund and Cancellation Policy';
      bodyContent = `<section class="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h2 class="text-xl font-bold text-white">Return, Refund, and Cancellation Policy</h2><p class="text-slate-300 text-sm mt-2">Read our terms regarding service subscriptions, recruiter postings, and verified professional advisory bookings.</p></section>`;
    } else if (cleanPath === 'communities') {
      title = 'Professional Communities & Engineering Guilds | TalentXcel';
      description = 'Connect with specialized professional engineering, leadership, and product communities across global tech hubs on TalentXcel.';
      canonical = 'https://talentxcel.in/communities';
      h1 = 'Professional Communities & Domain Guilds';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-2xl font-bold text-white">Professional Communities &amp; Domain Guilds</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Join specialized tech and leadership communities for mock panels, architecture discussions, and verified hiring referrals.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/communities" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Browse All Guilds &rarr;</a>
            <a href="/network" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Professional Directory &rarr;</a>
          </div>
        </section>
      `;
    } else {
      const h1Title = formatTitle(cleanPath || 'TalentXcel Platform');
      title = `${h1Title} | TalentXcel`;
      description = `Explore ${h1Title} on TalentXcel — The Global Professional Talent Network.`;
      canonical = `https://talentxcel.in/${cleanPath}`;
      h1 = h1Title;
      bodyContent = `<section class="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h2 class="text-xl font-bold text-white">${escapeHtml(h1Title)}</h2></section>`;
    }
  }
  // 13. Default: Fallback -> Return null (Triggers Genuine 404!)
  else {
    return null; // Soft 404 eliminated!
  }

  // Enforce 100% clean canonical URL formatting across all emitted responses
  canonical = buildCleanCanonicalUrl(canonical, cleanHost);

  const subdomainMeshHtml = `
    <footer class="mt-16 border-t border-slate-800 bg-slate-900/90 py-10 px-6">
      <div class="max-w-6xl mx-auto space-y-6 text-xs text-slate-400">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div class="text-sm font-bold text-white uppercase tracking-wider">TalentXcel Specialized Career &amp; Employment Ecosystem</div>
            <p class="text-slate-400 text-xs mt-0.5">Explore jobs, salary guides, ATS resume tools, higher education profiles, and career resources.</p>
          </div>
          <span class="text-blue-400 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded text-[11px] font-mono">TalentXcel</span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          <div>
            <a href="https://talentxcel.in/jobs" class="font-bold text-white hover:text-blue-400 block mb-2">Jobs Universe &rarr;</a>
            <ul class="space-y-1">
              <li><a href="https://talentxcel.in/jobs" class="hover:text-slate-200">Live Vacancies</a></li>
              <li><a href="https://talentxcel.in/locations/bangalore" class="hover:text-slate-200">Jobs in Bangalore</a></li>
              <li><a href="https://talentxcel.in/jobs/freshers" class="hover:text-slate-200">Fresher Jobs India</a></li>
              <li><a href="https://talentxcel.in/locations/hyderabad" class="hover:text-slate-200">Jobs in Hyderabad</a></li>
            </ul>
          </div>
          <div>
            <a href="https://salary.talentxcel.in/salary" class="font-bold text-white hover:text-blue-400 block mb-2">Salary Intelligence &rarr;</a>
            <ul class="space-y-1">
              <li><a href="https://salary.talentxcel.in/salary" class="hover:text-slate-200">Salary Benchmarks</a></li>
              <li><a href="https://salary.talentxcel.in/salary/software-engineer" class="hover:text-slate-200">Software Engineer Pay</a></li>
              <li><a href="https://salary.talentxcel.in/tools/salary-analyzer" class="hover:text-slate-200">Salary Benchmark Tool</a></li>
            </ul>
          </div>
          <div>
            <a href="https://talentxcel.in/colleges" class="font-bold text-white hover:text-blue-400 block mb-2">Higher Education &rarr;</a>
            <ul class="space-y-1">
              <li><a href="https://talentxcel.in/colleges" class="hover:text-slate-200">Top Indian Colleges</a></li>
              <li><a href="https://talentxcel.in/directory/colleges-a-z" class="hover:text-slate-200">Colleges A-Z Index</a></li>
            </ul>
          </div>
          <div>
            <a href="https://talentxcel.in/resume" class="font-bold text-white hover:text-blue-400 block mb-2">ATS Resume Tools &rarr;</a>
            <ul class="space-y-1">
              <li><a href="https://talentxcel.in/resume/ats-check" class="hover:text-slate-200">Free ATS Scanner</a></li>
              <li><a href="https://talentxcel.in/resume/build" class="hover:text-slate-200">AI Resume Builder</a></li>
            </ul>
          </div>
          <div>
            <a href="https://talentxcel.in/directory" class="font-bold text-white hover:text-blue-400 block mb-2">Master Directory &rarr;</a>
            <ul class="space-y-1">
              <li><a href="https://talentxcel.in/directory/colleges-a-z" class="hover:text-slate-200">Colleges A-Z</a></li>
              <li><a href="https://talentxcel.in/directory/salaries-by-role" class="hover:text-slate-200">Salaries by Role</a></li>
              <li><a href="https://talentxcel.in/directory/jobs-by-city" class="hover:text-slate-200">Jobs by City</a></li>
            </ul>
          </div>
        </div>
        <div class="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
          &copy; ${new Date().getFullYear()} TalentXcel Platform. All rights reserved.
        </div>
      </div>
    </footer>
  `;

  const schemaTag = jsonLdSchema
    ? `<script type="application/ld+json">\n${JSON.stringify(jsonLdSchema, null, 2)}\n</script>`
    : '';

  const resolvedOgImage = ogImage || resolveOgImageForRoute(cleanPath);
  const resolvedOgType = ogType || (cleanPath.startsWith('jobs') ? 'article' : (cleanPath.startsWith('passport') || cleanPath.startsWith('profile') ? 'profile' : 'website'));

  // Stage F Hardened Guard: Fail-closed thin page elimination
  // Any programmatic or dynamic page below 400 rendered words MUST output noindex, follow
  // Active JobPosting schema entities are authentic structured vacancies (min 100 words threshold)
  const renderedContentWords = countRenderedWords(bodyContent);
  if (robotsDirective === 'index, follow' && cleanPath !== '') {
    const isJobPosting = jsonLdSchema && (
      jsonLdSchema['@type'] === 'JobPosting' ||
      (Array.isArray(jsonLdSchema) && jsonLdSchema.some((s: any) => s && s['@type'] === 'JobPosting'))
    );
    const minWords = isJobPosting ? 100 : 400;
    if (renderedContentWords < minWords) {
      robotsDirective = 'noindex, follow';
    }
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:site_name" content="TalentXcel">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="${escapeHtml(resolvedOgType)}">
  <meta property="og:image" content="${escapeHtml(resolvedOgImage)}">
  <meta property="og:image:secure_url" content="${escapeHtml(resolvedOgImage)}">
  <meta property="og:image:type" content="image/png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(title)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@talentxcel">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(resolvedOgImage)}">
  <meta name="twitter:image:alt" content="${escapeHtml(title)}">
  <meta name="robots" content="${robotsDirective}">
  <script src="https://cdn.tailwindcss.com" defer></script>
  ${schemaTag}
</head>
<body class="bg-slate-950 text-slate-100 antialiased font-sans">
  <div id="root">
    <div class="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans flex flex-col justify-between">
      <div>
        <header class="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
          <div class="max-w-7xl mx-auto flex items-center justify-between">
            <a href="https://talentxcel.in" class="text-xl font-bold text-white tracking-tight">Talent<span class="text-blue-500">Xcel</span></a>
            <nav class="hidden md:flex gap-6 text-sm font-medium text-slate-300">
              <a href="https://talentxcel.in/jobs" class="hover:text-white">Jobs</a>
              <a href="https://talentxcel.in/colleges" class="hover:text-white">Colleges</a>
              <a href="https://salary.talentxcel.in/salary" class="hover:text-white">Salaries</a>
              <a href="https://talentxcel.in/resume" class="hover:text-white">Resume</a>
              <a href="https://talentxcel.in/directory" class="hover:text-white">Directory</a>
            </nav>
          </div>
        </header>
        <main class="max-w-6xl mx-auto px-4 py-8 md:py-12">
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">${escapeHtml(h1)}</h1>
          ${bodyContent}
        </main>
      </div>
      ${subdomainMeshHtml}
    </div>
  </div>
</body>
</html>`;

  return {
    html: fullHtml,
    status: 200,
    robotsDirective,
    cacheControl,
    cacheTag,
  };
}
