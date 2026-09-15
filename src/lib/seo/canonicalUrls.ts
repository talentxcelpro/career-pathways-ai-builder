// src/lib/seo/canonicalUrls.ts
// Centralized Deterministic Canonical URL Builder for TalentXcel
// Enforces standard lowercase, no trailing slash (except root), and clean slug format.

export const BASE_PRODUCTION_ORIGIN = 'https://talentxcel.in';

export function normalizeSlug(raw: string): string {
  if (!raw) return '';
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Returns canonical URL for a public profile (e.g. /@username or /profile/username) */
export function getPublicProfileUrl(usernameOrSlug: string): string {
  const clean = (usernameOrSlug || '').replace(/^@/, '').trim().toLowerCase();
  if (!clean) return `${BASE_PRODUCTION_ORIGIN}/network`;
  return `${BASE_PRODUCTION_ORIGIN}/@${clean}`;
}

/** Returns canonical URL for a public company page */
export function getPublicCompanyUrl(companySlugOrName: string): string {
  const slug = normalizeSlug(companySlugOrName) || 'talentxcel';
  return `${BASE_PRODUCTION_ORIGIN}/company/${slug}`;
}

/** Returns canonical URL for a public individual post */
export function getPublicPostUrl(postIdOrSlug: string): string {
  if (!postIdOrSlug) return `${BASE_PRODUCTION_ORIGIN}/network`;
  return `${BASE_PRODUCTION_ORIGIN}/post/${postIdOrSlug.trim()}`;
}

/** Returns canonical URL for a public job */
export function getPublicJobUrl(seoSlugOrId: string): string {
  if (!seoSlugOrId) return `${BASE_PRODUCTION_ORIGIN}/jobs`;
  return `${BASE_PRODUCTION_ORIGIN}/jobs/${seoSlugOrId.trim()}`;
}

/** Returns canonical URL for a public topic hub */
export function getPublicTopicUrl(topicSlug: string): string {
  const slug = normalizeSlug(topicSlug) || 'artificial-intelligence';
  return `${BASE_PRODUCTION_ORIGIN}/topics/${slug}`;
}

/** Returns canonical URL for a strategic service landing page */
export function getPublicServiceUrl(serviceSlug: string): string {
  const slug = normalizeSlug(serviceSlug) || 'ai-recruitment';
  return `${BASE_PRODUCTION_ORIGIN}/services/${slug}`;
}

/** Returns canonical URL for a public educational guide/resource */
export function getPublicResourceUrl(resourceSlug: string): string {
  const slug = normalizeSlug(resourceSlug);
  return `${BASE_PRODUCTION_ORIGIN}/resources/${slug}`;
}

/** Returns canonical URL for a public Indian institution / college */
export function getPublicCollegeUrl(institutionSlugOrId: string): string {
  const slug = (institutionSlugOrId || '').trim();
  return `${BASE_PRODUCTION_ORIGIN}/colleges/${slug}`;
}
