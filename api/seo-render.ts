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

function legacyGenericOkResponse(cleanPath: string): Response {
  const formatTitle = (s: string) => s.split(/[-_]+/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const title = `${formatTitle(cleanPath)} | TalentXcel`;
  const description = `Explore professional opportunities and resources for ${cleanPath} on TalentXcel.`;
  const canonical = `https://talentxcel.in/${cleanPath}`;
  const html = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><link rel="canonical" href="${escapeHtml(canonical)}"></head><body><main><h1>${escapeHtml(title)}</h1><p>${escapeHtml(description)}</p></main></body></html>`;
  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'X-Robots-Tag': 'index, follow',
      'X-Render-Engine': 'TalentXcel-Legacy-CatchAll',
      'X-SEO-Units': getUnitsDiagnosticHeader(),
    },
  });
}

const SUPABASE_REST_URL = 'https://dthlgsnakhoftinssokm.supabase.co/rest/v1';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const CANONICAL_ROLES_SET = new Set([
  'software-engineer', 'full-stack-developer', 'frontend-developer', 'backend-developer',
  'react-developer', 'node-js-developer', 'python-developer', 'java-developer',
  'golang-developer', 'ios-developer', 'android-developer', 'flutter-developer',
  'react-native-developer', 'devops-engineer', 'cloud-architect', 'aws-solutions-architect',
  'azure-cloud-engineer', 'gcp-cloud-architect', 'site-reliability-engineer',
  'database-administrator', 'sql-developer', 'postgresql-dba', 'security-engineer',
  'cybersecurity-analyst', 'qa-automation-engineer', 'sdet-engineer', 'blockchain-developer',
  'smart-contract-developer', 'ai-engineer', 'machine-learning-engineer', 'data-scientist',
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
  'bangalore', 'bengaluru', 'hyderabad', 'pune', 'mumbai', 'delhi-ncr', 'noida', 'gurgaon', 'gurugram',
  'chennai', 'kolkata', 'ahmedabad', 'chandigarh', 'jaipur', 'kochi', 'coimbatore',
  'indore', 'bhubaneswar', 'patna', 'lucknow', 'nagpur', 'surat', 'vadodara',
  'visakhapatnam', 'thiruvananthapuram', 'mysore', 'mangalore', 'kozhikode',
  'vijayawada', 'guntur', 'warangal', 'tirupati', 'nashik', 'aurangabad',
  'solapur', 'kolhapur', 'amravati', 'rajkot', 'bhavnagar', 'jamnagar',
  'dubai', 'london', 'singapore', 'remote', 'india'
]);

const VALID_EXPERIENCE_TIERS = new Set([
  'fresher', 'freshers', 'entry-level', 'junior', 'mid-level', 'senior', 'lead', 'architect', 'executive'
]);

const VALID_COURSE_SUBJECTS = new Set([
  'python', 'react', 'aws', 'machine-learning', 'data-science', 'full-stack',
  'cloud', 'devops', 'cyber-security', 'java', 'ai', 'data-analytics'
]);

const COLLEGE_SLUGS_SET = new Set(collegeSlugsList);

const CORE_STATIC_ROUTES = new Set([
  '', 'reels', 'jobs', 'colleges', 'learning', 'resume', 'passport', 'network',
  'salary', 'salaries', 'directory', 'directory/colleges-a-z', 'directory/salaries-by-role',
  'directory/jobs-by-city', 'rankings', 'blog', 'news', 'about', 'contact', 'faq',
  'terms', 'privacypolicy', 'hire', 'recruiters', 'government-jobs', 'services',
  'companies', 'uae', 'uk', 'usa', 'europe', 'world', 'talent',
  'resume/build', 'resume/ats-check', 'resume/cover-letter', 'resume/interview-prep', 'resume/templates',
  'tools/resume-checker', 'tools/ats-checker', 'tools/salary-analyzer',
  'salary/scenarios', 'salary/negotiation', 'salary/goals', 'salary/skills-gap', 'salary/jobs',
  'colleges/global-programs', 'colleges/scholarships', 'colleges/career-pathway'
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

function notFoundResponse(cleanPath: string): Response {
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
    },
  });
}

async function lookupJobInSupabase(slugOrId: string): Promise<any | null> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    const filter = isUuid ? `id=eq.${encodeURIComponent(slugOrId)}` : `seo_slug=eq.${encodeURIComponent(slugOrId)}`;
    const url = `${SUPABASE_REST_URL}/jobs?select=id,title,company_name,location,description,is_active,seo_slug,posted_at,date_posted,expires_at,employment_type,salary_min,salary_max,salary_currency&${filter}&is_active=eq.true&limit=1`;
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

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const pathParam = url.searchParams.get('path') || url.pathname.replace(/^\/api\/seo-render\/?/, '') || '/';
  const cleanPath = pathParam.replace(/^\//, '').replace(/\/$/, '');

  if (isPrivateRoute(cleanPath)) return privateRouteResponse();

  if (cleanPath.endsWith('.xml') || cleanPath.includes('sitemap') || cleanPath.includes('feed')) {
    return new Response('<?xml version="1.0" encoding="UTF-8"?><error>XML route - not HTML</error>', {
      status: 404,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' },
    });
  }

  const result = await generateDynamicSeoHtml(cleanPath);
  if (!result || result.status === 404) {
    if (DEPLOYMENT_UNITS.SOFT_404_PROTECTION) {
      return notFoundResponse(cleanPath);
    } else {
      return legacyGenericOkResponse(cleanPath);
    }
  }

  return new Response(result.html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      'X-Render-Engine': 'TalentXcel-Edge-SSR-Hydrator',
      'X-Robots-Tag': result.robotsDirective,
      'X-SEO-Units': getUnitsDiagnosticHeader(),
    },
  });
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

interface SeoRenderResult {
  html: string;
  status: 200 | 404;
  robotsDirective: string;
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
  // 2. Reels
  else if (cleanPath === 'reels') {
    title = 'TalentXcel Reels — Global Tech, AI & Career Stories';
    description = 'Watch short-form professional knowledge, engineering architecture breakdowns, and career stories on TalentXcel Reels.';
    canonical = 'https://talentxcel.in/reels';
    h1 = 'TalentXcel Reels — Professional Career Content';
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
        <h2 class="text-2xl font-bold text-white">Professional Career Content &amp; Architectural Breakdowns</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Short-form video content curated for technology and leadership professionals across AI, system design, salary negotiation, and career advancement.</p>
        <div class="pt-2">
          <a href="/reels" class="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs rounded-xl">Watch Reels in App &rarr;</a>
        </div>
      </section>
    `;
    robotsDirective = 'index, follow';
  }
  // 3. Locations (Soft-404 Validation)
  else if (prefix === 'locations' && secondary) {
    if (!CANONICAL_CITIES_SET.has(secondary.toLowerCase())) {
      return null; // Genuine 404 for invalid city entities
    }
    const cityName = formatTitle(secondary);
    title = `Job Listings in ${cityName} (2026 Hiring & Openings) | TalentXcel`;
    description = `Browse current TalentXcel job listings for ${cityName}. Review verified employer requirements, technology stacks, and application deadlines.`;
    canonical = `https://talentxcel.in/locations/${secondary}`;
    h1 = `Job Listings in ${cityName}`;
    bodyContent = `
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <h2 class="text-xl font-bold text-white">Current listings for ${escapeHtml(cityName)}</h2>
        <p class="text-slate-300 text-sm leading-relaxed">Browse job listings for ${escapeHtml(cityName)} on TalentXcel. Review each listing for its current requirements and employer-provided compensation details.</p>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/jobs?location=${escapeHtml(secondary)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Browse ${escapeHtml(cityName)} Jobs &rarr;</a>
        </div>
      </section>
    `;
    robotsDirective = 'noindex, follow';
  }
  // 4. Jobs Root Hub
  else if (cleanPath === 'jobs' || (prefix === 'jobs' && !secondary)) {
    title = 'Technology & Engineering Jobs (2026 Hiring Openings) | TalentXcel';
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
    // 5C: Fresher Jobs Hub
    else if (secondary === 'freshers' || secondary === 'fresher') {
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
    // 5D: jobs/:role-in-:city
    else if (secondary.includes('-in-')) {
      const partsRoleCity = secondary.split('-in-');
      const roleSlug = partsRoleCity[0];
      const citySlug = partsRoleCity.slice(1).join('-in-');
      if (!CANONICAL_ROLES_SET.has(roleSlug) || !CANONICAL_CITIES_SET.has(citySlug)) {
        return null; // Soft 404 guard
      }
      const roleName = formatTitle(roleSlug);
      const cityName = formatTitle(citySlug);
      title = `${roleName} Jobs in ${cityName} (2026 Openings & Hiring) | TalentXcel`;
      description = `Explore verified ${roleName} job vacancies and career opportunities in ${cityName}. Review role requirements, technology stacks, and application deadlines on TalentXcel.`;
      canonical = `https://talentxcel.in/jobs/${secondary}`;
      h1 = `${roleName} Jobs in ${cityName}`;
      bodyContent = `
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <h2 class="text-xl font-bold text-white">${escapeHtml(roleName)} Employment Corridor in ${escapeHtml(cityName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Browse ${escapeHtml(roleName)} listings in ${escapeHtml(cityName)}. Check each listing for current requirements and details supplied by the employer.</p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Role Category</span><span class="font-semibold text-emerald-400">${escapeHtml(roleName)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Location</span><span class="font-semibold text-white">${escapeHtml(cityName)}</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs/${escapeHtml(secondary)}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View ${escapeHtml(roleName)} Openings &rarr;</a>
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
        "description": `${roleName} employment opportunities in ${cityName}`
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
    // 5F: Single job posting lookup
    else {
      const job = await lookupJobInSupabase(secondary);
      if (!job) {
        return null; // Genuine 404 for non-existent job posting (Soft-404 eliminated!)
      }
      const jobTitle = job.title || formatTitle(secondary);
      const company = job.company_name || 'TalentXcel Services';
      const loc = job.location || 'India';
      title = `${jobTitle} at ${company} in ${loc} | TalentXcel Jobs`;
      description = `Apply for ${jobTitle} at ${company} in ${loc}. Verified job opening on TalentXcel.`;
      canonical = `https://talentxcel.in/jobs/${job.seo_slug || job.id}`;
      h1 = `${jobTitle} — ${company}`;
      bodyContent = `
        <article class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div class="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <span class="text-xs font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-2.5 py-1 rounded">Verified Vacancy</span>
              <h2 class="text-xl font-bold text-white mt-2">${escapeHtml(jobTitle)}</h2>
              <p class="text-slate-400 text-sm">${escapeHtml(company)} &middot; ${escapeHtml(loc)}</p>
            </div>
          </div>
          <div class="text-slate-300 text-sm leading-relaxed space-y-4">
            <p>${escapeHtml((job.description || '').substring(0, 500))}...</p>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">View Details &amp; Apply &rarr;</a>
          </div>
        </article>
      `;
      // SEO-006: Emit valid JobPosting schema omitting validThrough if not in data
      jsonLdSchema = {
        "@context": "https://schema.org/",
        "@type": "JobPosting",
        "title": jobTitle,
        "description": job.description || `${jobTitle} at ${company}`,
        "identifier": {
          "@type": "PropertyValue",
          "name": "TalentXcel",
          "value": job.id
        },
        "datePosted": (job.posted_at || job.date_posted || new Date().toISOString()).split('T')[0],
        ...(job.expires_at && !isNaN(new Date(job.expires_at).getTime()) && new Date(job.expires_at) > new Date()
          ? { "validThrough": new Date(job.expires_at).toISOString() }
          : {}),
        "employmentType": job.employment_type?.toUpperCase().replace('-', '_') || 'FULL_TIME',
        "hiringOrganization": {
          "@type": "Organization",
          "name": company,
          "sameAs": "https://talentxcel.in"
        },
        "jobLocation": {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": loc,
            "addressCountry": "IN"
          }
        }
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
      title = `${collegeName} Admissions, Placements, Fees & Cutoffs (2026) | TalentXcel`;
      description = `Browse verified admissions, fee, ranking, and placement information for ${collegeName} on TalentXcel.`;
      canonical = `https://talentxcel.in/colleges/${slug}`;
      h1 = `${collegeName} Institutional Overview`;
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

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
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
  };
}
