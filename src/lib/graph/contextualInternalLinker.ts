// src/lib/graph/contextualInternalLinker.ts
// Contextual Internal Linking Engine for TalentXcel Professional Search Graph
// Invariant: Non-doorway, highly relevant contextual links connecting Profiles, Jobs, Skills, Tools, and Network.

export interface ContextualLinkItem {
  label: string;
  urlPath: string;
  category: 'ROLE' | 'JOB' | 'SKILL' | 'COMPANY' | 'TOOL' | 'NETWORK';
  anchorText: string;
}

/**
 * Resolves contextual internal links for a public profile
 */
export function resolveProfileContextualLinks(profile: {
  fullName: string;
  headline?: string;
  skills?: string[];
  locationCity?: string;
}): ContextualLinkItem[] {
  const links: ContextualLinkItem[] = [];

  const headline = (profile.headline || '').toLowerCase();

  // 1. Role / Occupation Hub Link
  if (headline.includes('engineer') || headline.includes('developer')) {
    links.push({
      label: 'Software Engineering Career Hub',
      urlPath: '/jobs/software-engineer',
      category: 'ROLE',
      anchorText: 'Explore Software Engineer Career Pathways',
    });
  } else if (headline.includes('recruiter') || headline.includes('rmg') || headline.includes('hr')) {
    links.push({
      label: 'Recruiter & Talent Acquisition Hub',
      urlPath: '/hire',
      category: 'COMPANY',
      anchorText: 'Post Open Positions on TalentXcel',
    });
  } else if (headline.includes('analyst') || headline.includes('data')) {
    links.push({
      label: 'Data Analyst Jobs & Benchmark',
      urlPath: '/jobs/data-analyst',
      category: 'ROLE',
      anchorText: 'Explore Data Analyst Career Resources',
    });
  }

  // 2. Local City Jobs Link (if location exists)
  if (profile.locationCity) {
    const citySlug = profile.locationCity.toLowerCase().replace(/\s+/g, '-');
    links.push({
      label: `Jobs in ${profile.locationCity}`,
      urlPath: `/jobs/${citySlug}`,
      category: 'JOB',
      anchorText: `Browse Verified Jobs in ${profile.locationCity}`,
    });
  }

  // 3. ATS Resume Scanner Tool Link
  links.push({
    label: 'Free ATS Resume Checker',
    urlPath: '/resume/ats-scanner',
    category: 'TOOL',
    anchorText: 'Scan Your Resume Against ATS Standards',
  });

  // 4. Professional Network Link
  links.push({
    label: 'TalentXcel Professional Network',
    urlPath: '/network',
    category: 'NETWORK',
    anchorText: 'Connect with Verified Industry Peers',
  });

  return links;
}
