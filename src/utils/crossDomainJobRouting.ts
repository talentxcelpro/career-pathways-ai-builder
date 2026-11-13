/**
 * TalentXcel Cross-Domain Job Detail Routing Architecture
 *
 * Establishes https://talentxcel.in/jobs/{job-slug} as the canonical individual job detail URL.
 * Ensures seamless navigation from jobs.talentxcel.in (and local jobs.localhost) to the apex domain.
 */

import { generateJobSlug } from './seoUrls';

export interface JobEntityLike {
  id?: string;
  seo_slug?: string;
  slug?: string;
  title?: string;
  location?: string;
  experience_level?: string;
  [key: string]: any;
}

/**
 * Resolves the deterministic, SEO-friendly job slug or ID from a job record.
 */
export function resolveJobSlug(jobOrSlug: JobEntityLike | string | null | undefined): string {
  if (!jobOrSlug) return '';

  if (typeof jobOrSlug === 'string') {
    const trimmed = jobOrSlug.trim();
    // Strip leading /jobs/ or /job/ if already present
    return trimmed.replace(/^\/?(jobs|job)\//, '');
  }

  // 1. Existing database seo_slug
  if (jobOrSlug.seo_slug && typeof jobOrSlug.seo_slug === 'string' && jobOrSlug.seo_slug.trim()) {
    return jobOrSlug.seo_slug.trim();
  }

  // 2. Generic slug property
  if (jobOrSlug.slug && typeof jobOrSlug.slug === 'string' && jobOrSlug.slug.trim()) {
    return jobOrSlug.slug.trim();
  }

  // 3. Synthesize SEO slug from title + location + id
  if (jobOrSlug.title) {
    return generateJobSlug(
      jobOrSlug.title,
      jobOrSlug.location,
      jobOrSlug.id,
      jobOrSlug.experience_level
    );
  }

  // 4. Fallback to job id
  return jobOrSlug.id ? String(jobOrSlug.id) : '';
}

/**
 * Returns the canonical relative path on the apex domain (/jobs/{slug}).
 */
export function getCanonicalJobPath(jobOrSlug: JobEntityLike | string | null | undefined): string {
  const slug = resolveJobSlug(jobOrSlug);
  return slug ? `/jobs/${slug}` : '/jobs';
}

/**
 * Returns the absolute canonical URL for an individual job:
 * - Production: https://talentxcel.in/jobs/{slug}
 * - Localhost dev: http://localhost:{port}/jobs/{slug}
 */
export function getCanonicalJobUrl(jobOrSlug: JobEntityLike | string | null | undefined): string {
  const path = getCanonicalJobPath(jobOrSlug);

  if (typeof window === 'undefined') {
    return `https://talentxcel.in${path}`;
  }

  const hostname = window.location.hostname.toLowerCase();
  const isLocal = hostname === 'localhost' || hostname.endsWith('.localhost') || hostname === '127.0.0.1';

  if (isLocal) {
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${window.location.protocol}//localhost${port}${path}`;
  }

  return `https://talentxcel.in${path}`;
}

/**
 * Determines whether the current window is running on a jobs subdomain
 * (e.g. jobs.talentxcel.in or jobs.localhost:8080).
 */
export function isJobSubdomain(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host.startsWith('jobs.') || host.startsWith('jobs-');
}

/**
 * Centralized, safe cross-domain job navigation handler.
 * - If on jobs subdomain: routes to the canonical apex job detail page.
 * - If already on apex/core domain: uses React Router client navigation for instant SPA speed.
 * - Supports opening in new tab when requested.
 */
export function navigateToJobDetail(
  jobOrSlug: JobEntityLike | string | null | undefined,
  navigateFn?: (path: string) => void,
  options?: { newTab?: boolean }
): void {
  const slug = resolveJobSlug(jobOrSlug);
  if (!slug) {
    if (navigateFn) navigateFn('/jobs');
    else if (typeof window !== 'undefined') window.location.href = '/jobs';
    return;
  }

  const canonicalUrl = getCanonicalJobUrl(jobOrSlug);
  const canonicalPath = getCanonicalJobPath(jobOrSlug);

  if (options?.newTab) {
    if (typeof window !== 'undefined') {
      window.open(canonicalUrl, '_blank', 'noopener,noreferrer');
    }
    return;
  }

  // Cross-domain navigation: If currently on jobs subdomain, switch to apex domain
  if (isJobSubdomain()) {
    if (typeof window !== 'undefined') {
      window.location.href = canonicalUrl;
    }
    return;
  }

  // Same domain (apex / localhost root): use fast client-side router
  if (navigateFn) {
    navigateFn(canonicalPath);
  } else if (typeof window !== 'undefined') {
    window.location.href = canonicalUrl;
  }
}
