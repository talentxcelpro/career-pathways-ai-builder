/**
 * Single source of truth for TalentXcel SEO.
 *
 * Primary indexable domain: https://talentxcel.in
 * talentxcel.net is a secondary/alias domain and must never be canonical.
 */

import { INDUSTRY_HUBS, LOCATION_HUBS, RESOURCE_HUBS } from './publicIA';

export const PRODUCTION_ORIGIN = 'https://talentxcel.in';

export const SECONDARY_ORIGINS = ['https://talentxcel.net', 'https://www.talentxcel.net'];

export const SITE_NAME = 'TalentXcel';

export const DEFAULT_TITLE = 'TalentXcel — AI Career Platform for Jobs, Skills & Hiring';

export const DEFAULT_DESCRIPTION =
  'Careers, Designed — Not Discovered. Search verified jobs, build an ATS-ready resume, prepare for interviews and grow your skills on TalentXcel.';

export const DEFAULT_OG_IMAGE = `${PRODUCTION_ORIGIN}/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png`;

/** Path prefixes that must never be indexed (private, auth, admin, app-internal). */
export const NOINDEX_PREFIXES = [
  '/auth',
  '/admin',
  '/dashboard',
  '/onboarding',
  '/employer',
  '/profile/edit',
  '/profile/settings',
  '/my-applications',
  '/network/messages',
  '/network/notifications',
  '/network/settings',
  '/learning/my-courses',
  '/learning/my-progress',
  '/diagnostics',
  '/debug',
  '/testing',
  '/launch',
  '/mobile-',
  '/realtime-demo',
  '/mobile-demo',
  '/access-control-test',
];

/**
 * Public, indexable routes that exist in the router and render real content.
 * Keep this list in sync with src/navigation/* — it drives public/sitemap.xml.
 */
export interface IndexableRoute {
  path: string;
  changefreq?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority?: string;
}

export const INDEXABLE_ROUTES: IndexableRoute[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/jobs', changefreq: 'daily', priority: '0.9' },
  { path: '/companies', changefreq: 'weekly', priority: '0.8' },
  { path: '/learning', changefreq: 'weekly', priority: '0.8' },
  { path: '/tools', changefreq: 'weekly', priority: '0.8' },
  { path: '/public-tools', changefreq: 'weekly', priority: '0.7' },
  { path: '/public/resume-builder', changefreq: 'weekly', priority: '0.8' },
  { path: '/public/jobs', changefreq: 'daily', priority: '0.7' },
  { path: '/public/companies', changefreq: 'weekly', priority: '0.6' },
  { path: '/public/interview-prep', changefreq: 'weekly', priority: '0.7' },
  { path: '/public/market-insights', changefreq: 'weekly', priority: '0.6' },
  { path: '/public/job-matcher', changefreq: 'weekly', priority: '0.7' },
  { path: '/resume-templates', changefreq: 'monthly', priority: '0.6' },
  { path: '/platform', changefreq: 'monthly', priority: '0.6' },
  { path: '/news', changefreq: 'weekly', priority: '0.6' },
  { path: '/blog', changefreq: 'weekly', priority: '0.6' },
  { path: '/about', changefreq: 'monthly', priority: '0.5' },
  { path: '/careers', changefreq: 'monthly', priority: '0.5' },
  { path: '/contact', changefreq: 'yearly', priority: '0.4' },
  { path: '/help', changefreq: 'monthly', priority: '0.4' },
  { path: '/security', changefreq: 'yearly', priority: '0.3' },
  { path: '/terms', changefreq: 'yearly', priority: '0.3' },
  { path: '/privacypolicy', changefreq: 'yearly', priority: '0.3' },
  { path: '/return-refund-policy', changefreq: 'yearly', priority: '0.3' },
  { path: '/company-info', changefreq: 'monthly', priority: '0.5' },

  // Candidate services
  { path: '/resume-builder', changefreq: 'weekly', priority: '0.9' },
  { path: '/ai-career-coach', changefreq: 'weekly', priority: '0.8' },
  { path: '/job-matching', changefreq: 'weekly', priority: '0.8' },
  { path: '/reverse-job-search', changefreq: 'weekly', priority: '0.8' },
  { path: '/career-coaching', changefreq: 'monthly', priority: '0.7' },

  // Employer services
  { path: '/employers', changefreq: 'weekly', priority: '0.9' },
  { path: '/staffing', changefreq: 'monthly', priority: '0.8' },
  { path: '/recruitment', changefreq: 'monthly', priority: '0.8' },
  { path: '/rpo', changefreq: 'monthly', priority: '0.8' },
  { path: '/staff-augmentation', changefreq: 'monthly', priority: '0.8' },

  // Hubs
  { path: '/industries', changefreq: 'weekly', priority: '0.8' },
  ...INDUSTRY_HUBS.map((hub) => ({
    path: `/industries/${hub.slug}`,
    changefreq: 'weekly' as const,
    priority: '0.7',
  })),
  { path: '/locations', changefreq: 'weekly', priority: '0.8' },
  ...LOCATION_HUBS.map((hub) => ({
    path: `/locations/${hub.slug}`,
    changefreq: 'daily' as const,
    priority: '0.7',
  })),
  { path: '/resources', changefreq: 'weekly', priority: '0.7' },
  ...RESOURCE_HUBS.map((hub) => ({
    path: `/resources/${hub.slug}`,
    changefreq: 'monthly' as const,
    priority: '0.6',
  })),
];

/** True when a path should carry noindex. */
export const isNoindexPath = (pathname: string): boolean =>
  NOINDEX_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix));

/** Absolute production URL for an app path or absolute URL. */
export const absoluteUrl = (pathOrUrl = '/'): string => {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${PRODUCTION_ORIGIN}${pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`}`;
};

/**
 * Canonical URL for a path: always the primary domain, no query string,
 * no hash, no trailing slash (except the homepage).
 */
export const canonicalFor = (pathOrUrl?: string): string => {
  let pathname = '/';
  try {
    const url = new URL(pathOrUrl || '/', PRODUCTION_ORIGIN);
    pathname = url.pathname;
  } catch {
    pathname = '/';
  }
  if (pathname.length > 1) pathname = pathname.replace(/\/+$/, '');
  return `${PRODUCTION_ORIGIN}${pathname || '/'}`;
};
