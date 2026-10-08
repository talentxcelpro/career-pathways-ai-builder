/**
 * TalentXcel Multi-Domain Routing & Canonical SEO Architecture
 *
 * Centralized Single Source of Truth for the 10 production domains/subdomains:
 * 1. talentxcel.in / www.talentxcel.in -> CORE Career Ecosystem
 * 2. jobs.talentxcel.in               -> Jobs Search Universe
 * 3. learning.talentxcel.in           -> Learning Intelligence
 * 4. passport.talentxcel.in           -> Career Passport
 * 5. government.talentxcel.in         -> Government Jobs Intelligence
 * 6. employers.talentxcel.in          -> Recruiter OS & Employers
 * 7. colleges.talentxcel.in           -> Education & College Intelligence
 * 8. careers.talentxcel.in            -> Career Intelligence & Pathways
 * 9. salary.talentxcel.in             -> Salary Intelligence
 * 10. resume.talentxcel.in            -> Resume & ATS Intelligence
 *
 * STRICT GOVERNANCE:
 * - Single codebase & single data graph (No duplicated apps or DB tables)
 * - Zero UI / visual changes
 * - Zero breaking changes to existing talentxcel.in URLs
 * - Deterministic, non-looping canonical SEO resolution
 */

export type ProductUniverse =
  | 'CORE'
  | 'JOBS'
  | 'LEARNING'
  | 'PASSPORT'
  | 'GOVERNMENT'
  | 'EMPLOYERS'
  | 'COLLEGES'
  | 'CAREERS'
  | 'SALARY'
  | 'RESUME';

export const DOMAIN_TO_UNIVERSE: Record<string, ProductUniverse> = {
  'talentxcel.in': 'CORE',
  'www.talentxcel.in': 'CORE',
  'jobs.talentxcel.in': 'JOBS',
  'learning.talentxcel.in': 'LEARNING',
  'passport.talentxcel.in': 'PASSPORT',
  'government.talentxcel.in': 'GOVERNMENT',
  'employers.talentxcel.in': 'EMPLOYERS',
  'employer.talentxcel.in': 'EMPLOYERS',
  'colleges.talentxcel.in': 'COLLEGES',
  'careers.talentxcel.in': 'CAREERS',
  'salary.talentxcel.in': 'SALARY',
  'resume.talentxcel.in': 'RESUME',
};

export const UNIVERSE_PRIMARY_DOMAIN: Record<ProductUniverse, string> = {
  CORE: 'https://talentxcel.in',
  JOBS: 'https://jobs.talentxcel.in',
  LEARNING: 'https://learning.talentxcel.in',
  PASSPORT: 'https://passport.talentxcel.in',
  GOVERNMENT: 'https://government.talentxcel.in',
  EMPLOYERS: 'https://employers.talentxcel.in',
  COLLEGES: 'https://colleges.talentxcel.in',
  CAREERS: 'https://careers.talentxcel.in',
  SALARY: 'https://salary.talentxcel.in',
  RESUME: 'https://resume.talentxcel.in',
};

export const UNIVERSE_ROOT_PATHS: Record<ProductUniverse, string> = {
  CORE: '/',
  JOBS: '/jobs',
  LEARNING: '/learning',
  PASSPORT: '/passport',
  GOVERNMENT: '/government-jobs',
  EMPLOYERS: '/recruiters',
  COLLEGES: '/colleges',
  CAREERS: '/career-map',
  SALARY: '/salary',
  RESUME: '/resume',
};

/**
 * All allowed production hostnames for TalentXcel authentication and cross-subdomain sessions.
 */
export const AUTH_ALLOWED_HOSTNAMES: readonly string[] = [
  'talentxcel.in',
  'www.talentxcel.in',
  'jobs.talentxcel.in',
  'learning.talentxcel.in',
  'passport.talentxcel.in',
  'government.talentxcel.in',
  'employers.talentxcel.in',
  'employer.talentxcel.in',
  'colleges.talentxcel.in',
  'careers.talentxcel.in',
  'salary.talentxcel.in',
  'resume.talentxcel.in',
] as const;

/**
 * Exact Authorized JavaScript Origins for Google OAuth Web Client registration.
 * Google Cloud Console explicitly forbids wildcard patterns (e.g. *.talentxcel.in).
 * Each origin must be registered as scheme + domain (no trailing slash, no path).
 */
export const GOOGLE_OAUTH_AUTHORIZED_JAVASCRIPT_ORIGINS: readonly string[] = [
  'https://talentxcel.in',
  'https://www.talentxcel.in',
  'https://jobs.talentxcel.in',
  'https://learning.talentxcel.in',
  'https://passport.talentxcel.in',
  'https://government.talentxcel.in',
  'https://employers.talentxcel.in',
  'https://employer.talentxcel.in',
  'https://colleges.talentxcel.in',
  'https://careers.talentxcel.in',
  'https://salary.talentxcel.in',
  'https://resume.talentxcel.in',
] as const;

/**
 * Exact Authorized Redirect URIs for Google OAuth Client & Supabase URL Configuration.
 */
export const GOOGLE_OAUTH_AUTHORIZED_REDIRECT_URIS: readonly string[] = [
  // Primary Supabase OAuth callback (required for Supabase signInWithOAuth)
  'https://dthlgsnakhoftinssokm.supabase.co/auth/v1/callback',
  // Domain auth callbacks
  'https://talentxcel.in/auth/callback',
  'https://www.talentxcel.in/auth/callback',
  'https://jobs.talentxcel.in/auth/callback',
  'https://learning.talentxcel.in/auth/callback',
  'https://passport.talentxcel.in/auth/callback',
  'https://government.talentxcel.in/auth/callback',
  'https://employers.talentxcel.in/auth/callback',
  'https://employer.talentxcel.in/auth/callback',
  'https://colleges.talentxcel.in/auth/callback',
  'https://careers.talentxcel.in/auth/callback',
  'https://salary.talentxcel.in/auth/callback',
  'https://resume.talentxcel.in/auth/callback',
] as const;

/**
 * Normalizes host strings by stripping ports (e.g. "localhost:8080" -> "localhost")
 * and lowercasing.
 */
export function normalizeHostname(rawHostname?: string): string {
  if (!rawHostname) return '';
  return rawHostname.split(':')[0].trim().toLowerCase();
}

/**
 * Checks whether a given hostname is an allowed TalentXcel authentication host.
 * Supports production domains, subdomains, local development (localhost, 127.0.0.1),
 * and preview domains (lovableproject.com, vercel.app).
 */
export function isAllowedAuthHostname(hostname?: string): boolean {
  if (!hostname) return false;
  const clean = normalizeHostname(hostname);
  if (AUTH_ALLOWED_HOSTNAMES.includes(clean)) return true;
  if (clean === 'localhost' || clean === '127.0.0.1') return true;
  if (clean.endsWith('.talentxcel.in')) return true;
  if (clean.includes('lovableproject.com') || clean.includes('vercel.app')) return true;
  return false;
}

/**
 * Checks whether a given origin or absolute URL is an allowed TalentXcel auth origin.
 */
export function isAllowedAuthOrigin(origin?: string): boolean {
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return isAllowedAuthHostname(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Resolves the cookie domain for cross-subdomain authentication persistence.
 * Returns '.talentxcel.in' on production domains, or undefined on localhost/previews.
 */
export function getCrossSubdomainCookieDomain(hostname?: string): string | undefined {
  const host = normalizeHostname(hostname || (typeof window !== 'undefined' ? window.location.hostname : ''));
  if (host === 'talentxcel.in' || host.endsWith('.talentxcel.in')) {
    return '.talentxcel.in';
  }
  return undefined;
}

/**
 * Resolves the active Product Universe from the current hostname, query parameters,
 * or environment.
 *
 * Supports:
 * - Production domain aliases (e.g. jobs.talentxcel.in)
 * - Development subdomains (e.g. jobs.localhost)
 * - Preview query overrides (e.g. ?__universe=jobs or ?__domain=jobs.talentxcel.in)
 * - Staging / Vercel preview URLs (e.g. jobs-preview.vercel.app)
 */
export function getCurrentUniverse(
  customHostname?: string,
  customSearch?: string | URLSearchParams
): ProductUniverse {
  // 1. Query override takes priority (essential for preview deployments & automated testing)
  let searchStr = '';
  if (typeof customSearch === 'string') {
    searchStr = customSearch;
  } else if (customSearch instanceof URLSearchParams) {
    searchStr = customSearch.toString();
  } else if (typeof window !== 'undefined') {
    searchStr = window.location.search;
  }

  if (searchStr) {
    const params = new URLSearchParams(searchStr);
    const domainParam = params.get('__domain');
    if (domainParam) {
      const clean = normalizeHostname(domainParam);
      if (DOMAIN_TO_UNIVERSE[clean]) {
        return DOMAIN_TO_UNIVERSE[clean];
      }
    }
    const universeParam = params.get('__universe');
    if (universeParam) {
      const normalizedUni = universeParam.toUpperCase() as ProductUniverse;
      if (UNIVERSE_PRIMARY_DOMAIN[normalizedUni]) {
        return normalizedUni;
      }
    }
  }

  // 2. Resolve hostname
  let host = normalizeHostname(customHostname);
  if (!host && typeof window !== 'undefined') {
    host = normalizeHostname(window.location.hostname);
  }

  if (!host) {
    return 'CORE';
  }

  // 3. Exact production domain lookup
  if (DOMAIN_TO_UNIVERSE[host]) {
    return DOMAIN_TO_UNIVERSE[host];
  }

  // 4. Subdomain prefix matching (for local dev like jobs.localhost or PR branch URLs like jobs-xxx.vercel.app)
  if (host.startsWith('jobs.') || host.startsWith('jobs-')) return 'JOBS';
  if (host.startsWith('learning.') || host.startsWith('learning-')) return 'LEARNING';
  if (host.startsWith('passport.') || host.startsWith('passport-')) return 'PASSPORT';
  if (host.startsWith('government.') || host.startsWith('government-')) return 'GOVERNMENT';
  if (host.startsWith('employers.') || host.startsWith('employer.') || host.startsWith('employers-')) return 'EMPLOYERS';
  if (host.startsWith('colleges.') || host.startsWith('colleges-')) return 'COLLEGES';
  if (host.startsWith('careers.') || host.startsWith('careers-')) return 'CAREERS';
  if (host.startsWith('salary.') || host.startsWith('salary-')) return 'SALARY';
  if (host.startsWith('resume.') || host.startsWith('resume-')) return 'RESUME';

  return 'CORE';
}

/**
 * Returns the authoritative Product Universe that owns a given path for canonical SEO.
 */
export function getAuthoritativeUniverseForRoute(pathname: string): ProductUniverse {
  const clean = (pathname || '/').toLowerCase().trim();

  // Jobs Search Universe
  if (
    clean === '/jobs' ||
    clean.startsWith('/jobs/') ||
    clean === '/job' ||
    clean.startsWith('/job/') ||
    clean === '/locations' ||
    clean.startsWith('/locations/') ||
    clean === '/roles' ||
    clean.startsWith('/roles/') ||
    clean === '/industries' ||
    clean.startsWith('/industries/')
  ) {
    return 'JOBS';
  }

  // Learning Intelligence
  if (
    clean === '/learning' ||
    clean.startsWith('/learning/') ||
    clean === '/courses' ||
    clean.startsWith('/courses/') ||
    clean === '/course' ||
    clean.startsWith('/course/')
  ) {
    return 'LEARNING';
  }

  // Career Passport
  if (
    clean === '/passport' ||
    clean.startsWith('/passport/') ||
    clean.startsWith('/public-passport')
  ) {
    return 'PASSPORT';
  }

  // Government Jobs
  if (
    clean === '/government-jobs' ||
    clean.startsWith('/government-jobs/')
  ) {
    return 'GOVERNMENT';
  }

  // Employers & Recruiter OS
  if (
    clean === '/employer' ||
    clean.startsWith('/employer/') ||
    clean === '/employers' ||
    clean.startsWith('/employers/') ||
    clean === '/recruiters' ||
    clean.startsWith('/recruiters/') ||
    clean === '/companies' ||
    clean.startsWith('/companies/') ||
    clean === '/company' ||
    clean.startsWith('/company/') ||
    clean === '/hire'
  ) {
    return 'EMPLOYERS';
  }

  // Education & College Intelligence
  if (
    clean === '/colleges' ||
    clean.startsWith('/colleges/')
  ) {
    return 'COLLEGES';
  }

  // Career Intelligence & Pathways
  if (
    clean === '/career-map' ||
    clean.startsWith('/career-map/') ||
    clean === '/ai-career-hub' ||
    clean === '/career-intelligence' ||
    clean === '/career-platform' ||
    clean === '/career-dashboard' ||
    clean === '/roadmap' ||
    clean === '/skills-assessment' ||
    clean === '/career-goals'
  ) {
    return 'CAREERS';
  }

  // Salary Intelligence
  if (
    clean === '/salary' ||
    clean.startsWith('/salary/') ||
    clean === '/tools/salary-analyzer'
  ) {
    return 'SALARY';
  }

  // Resume & ATS Intelligence
  if (
    clean === '/resume' ||
    clean.startsWith('/resume/') ||
    clean === '/resume-builder' ||
    clean === '/resume-templates' ||
    clean === '/tools/resume-checker' ||
    clean === '/tools/ats-checker' ||
    clean === '/tools/resume-builder' ||
    clean === '/tools/resume-optimizer' ||
    clean === '/tools/resume-tailor'
  ) {
    return 'RESUME';
  }

  // Core Career Ecosystem (Home, Network, Communities, Messages, Rankings, News, Blog, Company Profiles, Public Profiles)
  return 'CORE';
}

/**
 * Returns the authoritative origin for any route (e.g. "https://jobs.talentxcel.in")
 */
export function getCanonicalDomainForRoute(pathname: string): string {
  const universe = getAuthoritativeUniverseForRoute(pathname);
  return UNIVERSE_PRIMARY_DOMAIN[universe];
}

/**
 * Deterministic Canonical URL Formatter:
 * - Strips query parameters and hashes.
 * - Resolves the authoritative domain for the route.
 * - Removes trailing slash (except root '/').
 * - Eliminates duplicate cross-domain indexing and canonical loops.
 */
export function formatCanonicalUrl(pathOrUrl?: string, currentHostname?: string): string {
  let pathname = '/';

  if (!pathOrUrl) {
    pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  } else if (/^https?:\/\//i.test(pathOrUrl)) {
    try {
      const parsed = new URL(pathOrUrl);
      pathname = parsed.pathname;
    } catch {
      pathname = '/';
    }
  } else {
    pathname = pathOrUrl.split('?')[0].split('#')[0] || '/';
  }

  // Ensure leading slash
  if (!pathname.startsWith('/')) {
    pathname = `/${pathname}`;
  }

  // Remove trailing slashes (except root '/')
  if (pathname.length > 1) {
    pathname = pathname.replace(/\/+$/, '');
  }

  // Determine current universe if on a subdomain
  const activeUniverse = getCurrentUniverse(currentHostname);
  const targetUniverse = getAuthoritativeUniverseForRoute(pathname);

  // If visitor is currently on a subdomain and requesting root '/', canonical is that subdomain's root
  if (activeUniverse !== 'CORE' && pathname === '/') {
    return `${UNIVERSE_PRIMARY_DOMAIN[activeUniverse]}/`;
  }

  // Normal authoritative mapping
  const authoritativeDomain = UNIVERSE_PRIMARY_DOMAIN[targetUniverse];
  return `${authoritativeDomain}${pathname === '/' ? '/' : pathname}`;
}

/**
 * Employer Domain Canonical Rule:
 * employers.talentxcel.in is the SOLE authoritative employer SEO domain.
 * employer.talentxcel.in is treated as a legacy non-competing alias.
 */
export function isLegacyEmployerAlias(hostname?: string): boolean {
  if (!hostname) return false;
  const clean = normalizeHostname(hostname);
  return clean === 'employer.talentxcel.in';
}

export function getAuthoritativeEmployerDomain(): string {
  return UNIVERSE_PRIMARY_DOMAIN.EMPLOYERS; // https://employers.talentxcel.in
}
