import { normalizeSlug } from './canonicalUrls.js';

export const COMPANY_HUB_INDEX_THRESHOLD = 10;

/**
 * Maps canonical company hub slugs to case-insensitive company_name prefixes/substrings
 * in `public.jobs_live`.
 */
export const COMPANY_HUB_ALIAS_PATTERNS: Record<string, string[]> = {
  'ntpc': ['ntpc'],
  'tata-steel': ['tata steel'],
  'hal': ['hal ', 'hindustan aeronautics'],
  'jindal-steel': ['jindal steel'],
  'jindal-steel-power': ['jindal steel'],
  'l-and-t': ['l&t', 'larsen'],
  'bhel': ['bhel', 'bharat heavy electricals'],
  'hdfc-bank': ['hdfc bank'],
  'south-indian-bank': ['south indian bank'],
  'zomato': ['zomato'],
  'bharat-coking-coal-limited': ['bharat coking coal'],
  'tata-power': ['tata power'],
  'raymond': ['raymond'],
  'karnataka-bank': ['karnataka bank'],
  'steel-authority-of-india': ['sail', 'steel authority of india'],
  'bajaj-auto': ['bajaj auto'],
  'hcl-technologies': ['hcl tech', 'hcl technologies'],
  'ibs-software': ['ibs software'],
  'talentxcel': ['talentxcel'],
  'talentxcel-services': ['talentxcel services'],
  'chatr-chat': ['chatr'],
  'savantis-solutions': ['savantis'],
};

export function toCompanyHubSlug(companyNameOrSlug: string): string {
  return normalizeSlug(companyNameOrSlug) || 'talentxcel';
}

export function matchesCompanyHubAlias(hubSlug: string, companyName: string | null | undefined): boolean {
  if (!companyName) return false;
  const slug = hubSlug.toLowerCase().trim();
  const normalizedComp = companyName.toLowerCase().trim();
  const patterns = COMPANY_HUB_ALIAS_PATTERNS[slug];
  if (patterns && patterns.length > 0) {
    return patterns.some(p => normalizedComp.startsWith(p) || normalizedComp.includes(p));
  }
  return toCompanyHubSlug(companyName) === slug;
}

export function countLiveJobsForCompanyHub(
  hubSlug: string,
  liveJobs: Array<{ company_name?: string | null }>
): number {
  let count = 0;
  for (const job of liveJobs) {
    if (matchesCompanyHubAlias(hubSlug, job.company_name)) {
      count++;
    }
  }
  return count;
}
