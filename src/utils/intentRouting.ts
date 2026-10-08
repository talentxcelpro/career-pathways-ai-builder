// Intent-based Post-Auth Routing Engine for TalentXcel
// Directs users to the appropriate value-generating cockpit based on user intent and role.
// Eliminates the dead-end dropoff caused by hardcoded /network redirects.

import { isAllowedAuthHostname, getCurrentUniverse, UNIVERSE_ROOT_PATHS } from '@/config/domainArchitecture';

export type UserIntent = 'resume' | 'ats' | 'jobs' | 'hire' | 'recruiter' | 'career' | 'learning' | 'default';

const STORAGE_INTENT_KEY = 'txc_post_auth_intent';
const STORAGE_REDIRECT_KEY = 'txc_post_auth_redirect';

/**
 * Persist user intent & return URL in both localStorage and sessionStorage
 * to survive OAuth redirects, page refreshes, and email verification links.
 */
export const recordUserIntent = (intent?: string | null, returnUrl?: string | null) => {
  if (typeof window === 'undefined') return;
  try {
    if (intent) {
      localStorage.setItem(STORAGE_INTENT_KEY, intent);
      sessionStorage.setItem(STORAGE_INTENT_KEY, intent);
    }
    if (returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('/auth')) {
      localStorage.setItem(STORAGE_REDIRECT_KEY, returnUrl);
      sessionStorage.setItem(STORAGE_REDIRECT_KEY, returnUrl);
    }
  } catch {
    // Storage access safety
  }
};

/**
 * Retrieve any stored intent and redirect path
 */
export const getStoredUserIntent = (): { intent: string | null; returnUrl: string | null } => {
  if (typeof window === 'undefined') return { intent: null, returnUrl: null };
  try {
    const intent = localStorage.getItem(STORAGE_INTENT_KEY) || sessionStorage.getItem(STORAGE_INTENT_KEY);
    const returnUrl = localStorage.getItem(STORAGE_REDIRECT_KEY) || sessionStorage.getItem(STORAGE_REDIRECT_KEY);
    return { intent, returnUrl };
  } catch {
    return { intent: null, returnUrl: null };
  }
};

/**
 * Clear stored intent after successful routing
 */
export const clearStoredUserIntent = () => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_INTENT_KEY);
    sessionStorage.removeItem(STORAGE_INTENT_KEY);
    localStorage.removeItem(STORAGE_REDIRECT_KEY);
    sessionStorage.removeItem(STORAGE_REDIRECT_KEY);
  } catch {}
};

/**
 * Validates a redirect URL to prevent open-redirects and auth loops.
 * Supports:
 * - Relative internal paths starting with / (e.g. /jobs, /career-dashboard)
 * - Absolute URLs on approved TalentXcel domains (e.g. https://jobs.talentxcel.in/jobs/software-engineer)
 * Blocks:
 * - Untrusted external domains (open-redirect protection)
 * - Protocol-relative URLs (//evil.com)
 * - Auth loops (/auth, /login, /register)
 */
export const isValidInternalPath = (path?: string | null): boolean => {
  if (!path) return false;
  const decoded = decodeURIComponent(path).trim();
  if (!decoded) return false;

  // Handle absolute URLs
  if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
    try {
      const url = new URL(decoded);
      if (!isAllowedAuthHostname(url.hostname)) return false;
      const pathname = url.pathname.toLowerCase();
      if (pathname.startsWith('/auth') || pathname.startsWith('/login') || pathname.startsWith('/register')) return false;
      return true;
    } catch {
      return false;
    }
  }

  // Handle relative internal paths
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return false;
  const lower = decoded.toLowerCase();
  if (lower.startsWith('/auth') || lower.startsWith('/login') || lower.startsWith('/register')) return false;
  return true;
};

export interface ResolveDestinationOptions {
  searchParams?: URLSearchParams | null;
  role?: string | null;
  userMetadata?: Record<string, any> | null;
}

/**
 * Intelligently resolves the destination URL after login or signup.
 * Priorities:
 * 1. Explicit returnUrl / redirect parameter in URL query
 * 2. URL flow / intent parameter (e.g. ?flow=ats_scanner -> /resume/ats-check)
 * 3. Stored intent / returnUrl from pre-auth interactions
 * 4. Subdomain context
 * 5. Role-based fallback:
 *    - Employer / Recruiter -> /dashboard?view=role
 *    - Candidate -> /career-dashboard (value cockpit, NOT empty /network)
 */
export const resolvePostAuthDestination = (options?: ResolveDestinationOptions): string => {
  const searchParams = options?.searchParams || (typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null);
  
  // 1. Direct query param redirect / returnUrl / returnTo (for central SSO)
  const queryRedirect = searchParams?.get('redirect') || searchParams?.get('returnUrl') || searchParams?.get('returnTo');
  if (isValidInternalPath(queryRedirect) && queryRedirect !== '/network') {
    clearStoredUserIntent();
    return decodeURIComponent(queryRedirect!);
  }

  // 2. Query param intent / flow
  const rawIntent = (searchParams?.get('intent') || searchParams?.get('flow') || searchParams?.get('source') || '').toLowerCase();
  if (rawIntent) {
    if (rawIntent.includes('ats') || rawIntent.includes('resume')) {
      clearStoredUserIntent();
      return '/resume/ats-check';
    }
    if (rawIntent.includes('job')) {
      clearStoredUserIntent();
      return '/jobs';
    }
    if (rawIntent.includes('hire') || rawIntent.includes('recruiter') || rawIntent.includes('employer')) {
      clearStoredUserIntent();
      return '/dashboard?view=role';
    }
    if (rawIntent.includes('career') || rawIntent.includes('roadmap')) {
      clearStoredUserIntent();
      return '/career-map';
    }
    if (rawIntent.includes('learn') || rawIntent.includes('skill')) {
      clearStoredUserIntent();
      return '/learning';
    }
  }

  // 3. Stored intent from pre-auth interaction (e.g. resume scanner)
  const stored = getStoredUserIntent();
  if (isValidInternalPath(stored.returnUrl) && stored.returnUrl !== '/network') {
    clearStoredUserIntent();
    return stored.returnUrl!;
  }

  if (stored.intent) {
    const normStored = stored.intent.toLowerCase();
    clearStoredUserIntent();
    if (normStored.includes('ats') || normStored.includes('resume')) return '/resume/ats-check';
    if (normStored.includes('job')) return '/jobs';
    if (normStored.includes('hire') || normStored.includes('recruiter') || normStored.includes('employer')) return '/dashboard?view=role';
    if (normStored.includes('career')) return '/career-map';
    if (normStored.includes('learn')) return '/learning';
  }

  // 4. Subdomain check from localStorage
  try {
    const subdomainRedirect = localStorage.getItem('subdomain_redirect');
    if (isValidInternalPath(subdomainRedirect) && subdomainRedirect !== '/network') {
      localStorage.removeItem('subdomain_redirect');
      return subdomainRedirect!;
    }
  } catch {}

  // 5. User role determination
  const role = (
    options?.role || 
    options?.userMetadata?.role || 
    options?.userMetadata?.user_type || 
    searchParams?.get('role') || 
    (typeof localStorage !== 'undefined' ? localStorage.getItem('txc_active_workspace') : null) ||
    ''
  ).toLowerCase();

  if (role === 'employer' || role === 'recruiter') {
    return '/dashboard?view=role';
  }

  // 6. Active Universe Context (preserves originating product surface)
  if (typeof window !== 'undefined') {
    const universe = getCurrentUniverse();
    if (universe !== 'CORE') {
      if (universe === 'EMPLOYERS') {
        return '/dashboard?view=role';
      }
      return UNIVERSE_ROOT_PATHS[universe] || '/career-dashboard';
    }
  }

  // 7. Default destination for candidate accounts on CORE domain:
  return '/career-dashboard';
};
