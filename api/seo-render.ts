
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
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/data-analyst-dubai-uae',
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
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/software-engineer-abu-dhabi-uae',
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
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/cloud-engineer-riyadh-saudi-arabia',
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
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/data-analyst-remote-usa',
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
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/software-engineer-remote-us',
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
 * - Explicit 'true' is required to activate a deployment unit.
 * - Explicit 'false' disables it.
 * - Unset (undefined or empty) disables it.
 * - Zero alternate activation paths.
 * - Independent controllability guaranteed via dynamic getters.
 */
export const DEPLOYMENT_UNITS = {
  // Unit 1: Soft 404 Protection & Strict Entity Validation (SEO-002) - FAIL-CLOSED
  get SOFT_404_PROTECTION(): boolean {
    return typeof process !== 'undefined' && Boolean(process.env?.SEO_DEPLOY_SOFT_404)
      ? process.env.SEO_DEPLOY_SOFT_404.trim().toLowerCase() === 'true'
      : false;
  },

  // Unit 2: Salary Independent Canonical Canary (SEO-004 & SEO-001) - FAIL-CLOSED
  get SALARY_CANARY_CANONICAL(): boolean {
    return typeof process !== 'undefined' && Boolean(process.env?.SEO_DEPLOY_SALARY_CANARY)
      ? process.env.SEO_DEPLOY_SALARY_CANARY.trim().toLowerCase() === 'true'
      : false;
  },

  // Unit 3: CTR Metadata Optimization (SEO-007) - FAIL-CLOSED
  get CTR_METADATA_OPTIMIZATION(): boolean {
    return typeof process !== 'undefined' && Boolean(process.env?.SEO_DEPLOY_CTR_OPTIMIZATION)
      ? process.env.SEO_DEPLOY_CTR_OPTIMIZATION.trim().toLowerCase() === 'true'
      : false;
  },
};

export function resolveCanaryCanonical(cleanPath: string, targetUniverse: string): string {
  if (DEPLOYMENT_UNITS.SALARY_CANARY_CANONICAL && targetUniverse === 'SALARY') {
    return `https://salary.talentxcel.in${cleanPath ? '/' + cleanPath : ''}`;
  }
  return `https://talentxcel.in${cleanPath ? '/' + cleanPath : ''}`;
}

export function resolveSeoMeta(
  entityType: string,
  entityName: string,
  extra: Record<string, string> = {}
): { title: string; description: string } {
  if (DEPLOYMENT_UNITS.CTR_METADATA_OPTIMIZATION) {
    switch (entityType) {
      case 'salary-root':
        return {
          title: 'Technology Salary Guides & Compensation Benchmarks (2026) | TalentXcel',
          description: 'Explore verified technology salary guides, compensation curves, and employer-provided compensation details on TalentXcel Salary Intelligence.'
        };
      case 'salary-role':
        return {
          title: `${entityName} Salary Guide in ${extra.city || 'India'} (2026 Benchmark) | TalentXcel`,
          description: `Explore verified compensation benchmarks, salary curves, and market ranges for ${entityName} in ${extra.city || 'India'} on TalentXcel Salary Intelligence.`
        };
      case 'college':
        return {
          title: `${entityName} Placements, Cutoffs & Ranking 2026 | TalentXcel`,
          description: `Verified placement statistics, entrance examination cutoffs, degrees, and academic infrastructure overview for ${entityName}.`
        };
      case 'job':
        return {
          title: `${extra.title} at ${extra.company} (${extra.location}) | TalentXcel`,
          description: `Apply for ${extra.title} at ${extra.company} in ${extra.location}. Verified employment terms and fast direct application on TalentXcel.`
        };
      case 'location':
        return {
          title: `Job Listings in ${entityName} (2026 Hiring & Openings) | TalentXcel`,
          description: `Browse current TalentXcel job listings for ${entityName}. Review verified employer requirements, technology stacks, and application deadlines.`
        };
      default:
        return {
          title: `${entityName} | TalentXcel`,
          description: `Explore ${entityName} on TalentXcel — Global Professional Talent Network.`
        };
    }
  } else {
    // Legacy generic fallback
    return {
      title: `${entityName} | TalentXcel`,
      description: `Explore career opportunities, professional network insights, and industry information for ${entityName} on TalentXcel.`
    };
  }
}

function legacyGenericOkResponse(cleanPath: string, isDebug: boolean = false): Response {
  const formatTitle = (s: string) => s.split(/[-_]+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const title = `${formatTitle(cleanPath)} | TalentXcel`;
  const description = `Explore professional opportunities and resources for ${cleanPath} on TalentXcel.`;
  const canonical = `https://talentxcel.in/${cleanPath}`;
  const ogImage = resolveOgImageForRoute(cleanPath);
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${escapeHtml(canonical)}"><meta property="og:site_name" content="TalentXcel"><meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:type" content="website"><meta property="og:image" content="${ogImage}"><meta property="og:image:secure_url" content="${ogImage}"><meta property="og:image:type" content="image/png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="${escapeHtml(title)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:site" content="@talentxcel"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${ogImage}"><meta name="twitter:image:alt" content="${escapeHtml(title)}"></head><body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></main></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'index, follow',
      'X-Render-Engine': 'TalentXcel-Legacy-CatchAll',
      ...(isDebug ? { 'X-SEO-Units': getUnitsDiagnosticHeader() } : {}),
    },
  });
}

const SUPABASE_REST_URL = 'https://dthlgsnakhoftinssokm.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

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
  '', 'reels', 'jobs', 'colleges', 'learning', 'resume', 'passport', 'network',
  'salary', 'salaries', 'directory', 'directory/colleges-a-z', 'directory/salaries-by-role',
  'directory/jobs-by-city', 'rankings', 'blog', 'news', 'about', 'contact', 'faq',
  'terms', 'privacypolicy', 'hire', 'recruiters', 'staffing', 'recruitment', 'rpo', 'careers', 'government-jobs', 'services',
  'companies', 'uae', 'uk', 'usa', 'europe', 'world', 'talent',
  'resume/build', 'resume/ats-check', 'resume/cover-letter', 'resume/interview-prep', 'resume/templates',
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
  '/resume/edit', '/resume/build', '/resume-builder', '/resume/builder', '/resume/portfolio', '/resume/upload',
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

function notFoundResponse(cleanPath: string, isDebug: boolean = false): Response {
  const title = 'Page Not Found (404) | TalentXcel';
  const description = 'The requested resource does not exist on TalentXcel. Explore active jobs, colleges, career pathways, and salary intelligence.';
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
          <h1 class="text-4xl md:text-5xl font-black text-white tracking-tight">Entity or Page Not Found</h1>
          <p class="text-slate-400 text-sm md:text-base max-w-lg mx-auto">
            The resource at <code class="text-red-400 font-mono bg-slate-900 px-2 py-0.5 rounded">/${escapeHtml(cleanPath)}</code> does not exist on TalentXcel or has been retired.
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

  return new Response(html, {
    status: 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600',
      'X-Robots-Tag': 'noindex, nofollow',
      'X-Render-Engine': 'TalentXcel-Edge-404-Guard',
      ...(isDebug ? { 'X-SEO-Units': getUnitsDiagnosticHeader() } : {}),
    },
  });
}

async function lookupJobInSupabase(slugOrId: string): Promise<any | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const filter = isUuid ? `id=eq.${encodeURIComponent(slugOrId)}` : `seo_slug=eq.${encodeURIComponent(slugOrId)}`;
    const url = `${SUPABASE_REST_URL}/jobs?select=id,title,company_name,location,description,is_active,seo_slug,posted_at,date_posted,created_at,expires_at,employment_type,salary_min,salary_max,salary_currency,is_remote,external_url&${filter}&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
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
      filter = `or=(username.ilike.${encodeURIComponent(cleaned)},custom_url_slug.ilike.${encodeURIComponent(cleaned)},slug.ilike.${encodeURIComponent(cleaned)})`;
    }
    const url = `${SUPABASE_REST_URL}/profiles?select=id,full_name,headline,title,location,profile_picture_url,profile_photo_url,username,skills,about&${filter}&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    return null;
  } catch {
    return null;
  }
}

async function lookupPostInSupabase(postId: string): Promise<{ post: any; author: any | null } | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(postId);
    if (!isUuid) return null;
    const url = `${SUPABASE_REST_URL}/posts?select=id,content,headline,media_urls,featured_image_url,created_at,author_id,user_id&id=eq.${encodeURIComponent(postId)}&limit=1`;
    const res = await fetch(url, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
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
  const pathParam = url.searchParams.get('path') || url.pathname.replace(/^\/api\/seo-render\/?/, '') || '/';
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

  const result = await generateDynamicSeoHtml(cleanPath);
  if (!result || result.status === 404) {
    if (DEPLOYMENT_UNITS.SOFT_404_PROTECTION) {
      return notFoundResponse(cleanPath, isDebug);
    } else {
      return legacyGenericOkResponse(cleanPath, isDebug);
    }
  }

  return new Response(result.html, {
    status: result.status || 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': result.cacheControl || 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      'X-Render-Engine': 'TalentXcel-Edge-SSR-Hydrator',
      'X-Robots-Tag': result.robotsDirective,
      ...(isDebug ? { 'X-SEO-Units': getUnitsDiagnosticHeader() } : {}),
    },
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
}

async function generateDynamicSeoHtml(cleanPath: string): Promise<SeoRenderResult | null> {
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

  // 1. Root Homepage
  if (!cleanPath || cleanPath === '') {
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
    canonical = 'https://talentxcel.in/network?tab=refer-and-earn';
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
      // Graceful fallback for social crawlers: 200 OK preview with noindex so Facebook/LinkedIn never show a 404
      title = 'Verified Career Passport | TalentXcel';
      description = 'Explore verified skills, career achievements, and portable digital credentials on TalentXcel.';
      canonical = `https://talentxcel.in/passport/public/${encodeURIComponent(identifier)}`;
      h1 = 'TalentXcel Verified Career Passport';
      ogType = 'profile';
      ogImage = 'https://talentxcel.in/assets/og/talentxcel-og-passport.png';
      robotsDirective = 'noindex, follow';

      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6 text-center max-w-3xl mx-auto">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            TalentXcel Verified Credentials
          </span>
          <h2 class="text-2xl md:text-3xl font-black text-white">Digital Career Passport</h2>
          <p class="text-slate-300 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
            Portable, verified skills, compensation benchmarks, and career milestones powered by TalentXcel.
          </p>
          <div class="pt-4 flex flex-wrap gap-3 justify-center">
            <a href="/passport" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition">Explore Career Passport &rarr;</a>
            <a href="/signup" class="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">Create Your Passport Free</a>
          </div>
        </section>
      `;
    }
  }
  // 1E. Public Profiles & Candidates (/profile/:slug, /profile/public/:slug, /candidate/:id)
  else if (
    cleanPath.startsWith('profile/') ||
    cleanPath.startsWith('candidate/') ||
    cleanPath.startsWith('candidates/')
  ) {
    const rawIdentifier = cleanPath.replace(/^(profile\/public|profile|candidate|candidates)\//, '');
    const identifier = decodeURIComponent(rawIdentifier).trim();
    const profile = await lookupProfileInSupabase(identifier);

    if (profile) {
      const fullName = profile.full_name || 'TalentXcel Professional';
      const headline = profile.headline || profile.title || 'Professional Profile on TalentXcel';
      const location = profile.location ? ` in ${profile.location}` : '';
      const avatar = profile.profile_photo_url || profile.profile_picture_url || 'https://talentxcel.in/assets/og/talentxcel-og-passport.png';
      
      title = `${fullName} — Professional Profile | TalentXcel`;
      description = `Connect with ${fullName}${location} on TalentXcel. ${headline}`;
      canonical = `https://talentxcel.in/profile/${encodeURIComponent(identifier)}`;
      h1 = `${fullName} — Professional Profile`;
      ogType = 'profile';
      ogImage = avatar;
      robotsDirective = 'index, follow';

      bodyContent = `
        <article class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 space-y-6 max-w-4xl mx-auto shadow-2xl">
          <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-800 pb-6">
            <img src="${escapeHtml(avatar)}" alt="${escapeHtml(fullName)}" class="w-20 h-20 rounded-full object-cover border-2 border-blue-500 shadow-lg bg-slate-800" />
            <div class="text-center sm:text-left space-y-1 flex-1">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                TalentXcel Member
              </span>
              <h2 class="text-2xl font-black text-white">${escapeHtml(fullName)}</h2>
              <p class="text-slate-300 text-sm">${escapeHtml(headline)}</p>
              ${profile.location ? `<p class="text-xs text-slate-400">📍 ${escapeHtml(profile.location)}</p>` : ''}
            </div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/passport/public/${encodeURIComponent(identifier)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition">View Career Passport &rarr;</a>
            <a href="/network" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">Network Feed</a>
          </div>
        </article>
      `;

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
      title = 'Professional Profile | TalentXcel';
      description = 'Connect with verified professionals and leadership talent on TalentXcel.';
      canonical = `https://talentxcel.in/profile/${encodeURIComponent(identifier)}`;
      h1 = 'TalentXcel Professional Profile';
      ogType = 'profile';
      ogImage = 'https://talentxcel.in/assets/og/talentxcel-og-passport.png';
      robotsDirective = 'noindex, follow';

      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-4 text-center max-w-3xl mx-auto">
          <h2 class="text-2xl font-black text-white">Professional Profile</h2>
          <p class="text-slate-300 text-sm">Explore verified talent and connect with professionals across global industries.</p>
          <div class="pt-4">
            <a href="/network" class="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition">Explore Professional Network &rarr;</a>
          </div>
        </section>
      `;
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

  // 2. Reels
  else if (cleanPath === 'reels') {
    title = 'TalentXcel Reels — Global Tech, AI & Career Stories';
    description = 'Watch short-form professional knowledge, engineering architecture breakdowns, and career stories on TalentXcel Reels.';
    canonical = 'https://talentxcel.in/reels';
    h1 = 'TalentXcel Reels — Professional Career Content';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
        <h2 class="text-2xl font-bold text-white">Professional Career Content &amp; Architectural Breakdowns</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Short-form video content curated for professionals and leaders across all industries, career growth, negotiation, and professional advancement.</p>
        <div class="pt-2">
          <a href="/reels" class="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl">Watch Reels in App &rarr;</a>
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
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                Verified Local Hiring &bull; ${escapeHtml(cityName)}, India
              </span>
              <h2 class="text-2xl font-bold text-white mt-2">Verified Job Vacancies in ${escapeHtml(cityName)}</h2>
            </div>
            <span class="px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 font-mono font-bold text-xs rounded-full">
              ${count} Live Openings
            </span>
          </div>
          <p class="text-slate-300 text-sm leading-relaxed">Explore verified technology, engineering, finance, and corporate openings in ${escapeHtml(cityName)}. Direct candidate application with zero agency intermediaries.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs?location=${escapeHtml(citySlug)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition">Browse ${escapeHtml(cityName)} Jobs &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">Free ATS Resume Scan &rarr;</a>
          </div>
          <!-- RelatedHubsMesh Component Links for Crawler Discovery -->
          <nav class="mt-8 pt-6 border-t border-slate-800/80" aria-label="Related Career Hubs">
            <h3 class="text-sm font-bold text-white uppercase tracking-wider mb-3">Explore Related Career Hubs</h3>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <a href="/locations/noida" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Jobs in Noida</a>
              <a href="/locations/bangalore" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Jobs in Bangalore</a>
              <a href="/locations/mumbai" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Jobs in Mumbai</a>
              <a href="/locations/pune" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Jobs in Pune</a>
              <a href="/company/ntpc" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">NTPC Careers</a>
              <a href="/company/hdfc-bank" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">HDFC Bank Careers</a>
              <a href="/jobs/graduate-engineer-trainee" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Graduate Engineer Trainee</a>
              <a href="/jobs/associate-data-analyst" class="p-2.5 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 block text-slate-300 hover:text-white transition">Associate Data Analyst</a>
            </div>
          </nav>
        </section>
      `;
    } else {
      // Under-threshold location (e.g. Patiala with 0 jobs) -> noindex, follow guardrail
      title = `Jobs in ${cityName} | TalentXcel`.slice(0, 60);
      description = `Explore career opportunities and remote positions available for candidates in ${cityName} on TalentXcel.`;
      canonical = `https://talentxcel.in/locations/${citySlug}`;
      h1 = `Jobs in ${cityName}`;
      robotsDirective = 'noindex, follow';
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Current Listings for ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">No direct local openings are currently active in ${escapeHtml(cityName)}. Explore verified remote jobs and opportunities in nearby tech hubs.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition">Explore All Active Jobs &rarr;</a>
          </div>
        </section>
      `;
    }
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
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">Current ${escapeHtml(roleName)} listings in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Browse ${escapeHtml(roleName)} listings in ${escapeHtml(cityName)}. Check each listing for current requirements and details supplied by the employer.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs?role=${encodeURIComponent(roleSlug)}&amp;location=${encodeURIComponent(citySlug)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Browse ${escapeHtml(roleName)} Jobs &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Scan ATS Resume &rarr;</a>
          </div>
        </section>
      `;
    }
    // 5D: jobs/:role-in-:city (Pattern 1)
    else if (secondary.includes('-in-')) {
      const partsRoleCity = secondary.split('-in-');
      const roleSlug = partsRoleCity[0];
      const citySlug = partsRoleCity.slice(1).join('-in-');
      if (!CANONICAL_ROLES_SET.has(roleSlug) || !CANONICAL_CITIES_SET.has(citySlug)) {
        return null; // Soft 404 guard
      }
      const roleName = formatTitle(roleSlug);
      const cityName = formatTitle(citySlug);
      // Title strictly <= 60 characters
      title = `${roleName} in ${cityName} Jobs | TalentXcel`.slice(0, 60);
      description = `Explore verified ${roleName} job vacancies and career opportunities in ${cityName}. Review role requirements, technology stacks, and application deadlines on TalentXcel.`;
      canonical = `https://talentxcel.in/jobs/${secondary}`;
      h1 = `${roleName} Jobs in ${cityName}`;
      // Combinatorial eligibility guard: gated by >= 5 unexpired jobs
      robotsDirective = 'noindex, follow'; // Defaults to noindex unless indexed in seo_hub_state

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
            <a href="/locations/${encodeURIComponent(citySlug)}" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">All Jobs in ${escapeHtml(cityName)} &rarr;</a>
          </div>
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
      jsonLdSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${roleName} Jobs in ${cityName}`,
        "url": canonical
      };
    }
    // 5E: Canonical role hub (e.g. /jobs/software-engineer)
    else if (CANONICAL_ROLES_SET.has(secondary)) {
      const jobTitle = formatTitle(secondary);
      title = `${jobTitle} Jobs & Career Opportunities (2026 Hiring) | TalentXcel`;
      description = `Explore ${jobTitle} opportunities on TalentXcel. Review verified listings for role requirements, skill benchmarks, and application details.`;
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

      // Check if job is closed or expired
      const isPastExpiry = job.expires_at && !isNaN(new Date(job.expires_at).getTime()) && new Date(job.expires_at) < new Date();
      const isInactive = job.is_active === false || isPastExpiry;

      if (isInactive) {
        // Phase A Soft Expiry: HTTP 200, noindex, follow, stripped JSON-LD, 1-hour s-maxage
        return {
          status: 200,
          robotsDirective: 'noindex, follow',
          cacheControl: 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
          html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Job Vacancy Closed | TalentXcel</title>
  <meta name="robots" content="noindex, follow">
  <script src="https://cdn.tailwindcss.com" defer></script>
</head>
<body class="bg-slate-950 text-slate-100 p-8 font-sans antialiased min-h-screen flex items-center justify-center">
  <div class="max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center space-y-4">
    <span class="inline-block px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold rounded-full">Position Closed</span>
    <h1 class="text-2xl font-bold text-white">This Job Opening is Closed</h1>
    <p class="text-slate-400 text-sm">The vacancy you are looking for has expired or been filled. Explore active jobs on TalentXcel.</p>
    <a href="https://talentxcel.in/jobs" class="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition">Explore Active Jobs &rarr;</a>
  </div>
</body>
</html>`
        };
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
      } else {
        const compactCompany = company.replace(/ Limited| Pvt Ltd| Ltd/gi, '').trim();
        const baseTitle = `${jobTitle} at ${compactCompany} (${cityLoc}) | TalentXcel`;
        title = baseTitle.length <= 60 ? baseTitle : `${jobTitle} at ${compactCompany} | TalentXcel`.slice(0, 60);
      }
      description = `Apply for ${jobTitle} at ${company} in ${loc}.${salaryDisplay ? ' Annual CTC: ' + salaryDisplay + '.' : ''} Verified vacancy with direct application on TalentXcel.`;
      canonical = `https://talentxcel.in/jobs/${job.seo_slug || job.id}`;
      h1 = `${jobTitle} — ${company}`;

      const fullHtmlDesc = formatJobDescriptionHtml(job.description || `${jobTitle} at ${company}`);

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
          <div class="pt-4 flex flex-wrap gap-3 border-t border-slate-800">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg transition">Apply on TalentXcel &rarr;</a>
            <a href="/company/${encodeURIComponent(company.toLowerCase().replace(/\s+/g, '-'))}" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition">More from ${escapeHtml(company)} &rarr;</a>
          </div>
        </article>
      `;

      const resolvedDatePosted = (job.posted_at || job.date_posted || job.created_at || '2026-10-01').split('T')[0];
      const hasExternalUrl = !!(job.external_url && job.external_url.trim().length > 0);
      const isDirectApply = !hasExternalUrl;

      // Google-compliant JobPosting JSON-LD
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
          "sameAs": "https://talentxcel.in",
          "logo": "https://talentxcel.in/assets/og/talentxcel-og-default.png"
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
      bodyContent = `<section class="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h2 class="text-xl font-bold text-white">${escapeHtml(subTitle)}</h2></section>`;
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
      bodyContent = `<section class="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} Specializations</h2></section>`;
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
      bodyContent = `<section class="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h2 class="text-xl font-bold text-white">${escapeHtml(salaryToolNames[cleanPath])}</h2></section>`;
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
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} compensation in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Review current verified job listings for compensation details supplied by employers.</p>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Browse Live ${escapeHtml(roleName)} Jobs &rarr;</a>
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl">Free ATS Resume Scan &rarr;</a>
          </div>
        </section>
      `;
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
  // 12. Core Static Pages & Known Hubs
  else if (CORE_STATIC_ROUTES.has(cleanPath)) {
    const h1Title = formatTitle(cleanPath || 'TalentXcel Platform');
    title = `${h1Title} | TalentXcel`;
    description = `Explore ${h1Title} on TalentXcel — The Global Professional Talent Network.`;
    canonical = `https://talentxcel.in/${cleanPath}`;
    h1 = h1Title;
    bodyContent = `<section class="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h2 class="text-xl font-bold text-white">${escapeHtml(h1Title)}</h2></section>`;
  }
  // 13. Default: Fallback -> Return null (Triggers Genuine 404!)
  else {
    return null; // Soft 404 eliminated!
  }

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
  };
}
