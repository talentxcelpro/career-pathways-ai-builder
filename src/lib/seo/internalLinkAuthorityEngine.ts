// src/lib/seo/internalLinkAuthorityEngine.ts
// Internal Link Authority Engine: Computes per-page authority scores and identifies link gap opportunities
// Used by the Ranking Opportunity Engine and CI gate to prevent orphan page creation

export interface PageLinkAuthority {
  canonical_url: string;
  surface: string;
  inbound_internal_links: number;
  outbound_internal_links: number;
  crawl_depth: number;
  orphan_risk: boolean;
  hub_type: 'ROOT_HUB' | 'CATEGORY_HUB' | 'LEAF_ENTITY' | 'ISOLATED';
  topical_cluster: string;
  link_gap_opportunities: string[];
  authority_score: number;
  recommended_linking_sources: string[];
}

export function computeAuthorityScore(inbound: number, crawlDepth: number, orphan: boolean): number {
  const raw = inbound * 3 + (10 - crawlDepth) * 5 - (orphan ? 30 : 0);
  return Math.min(100, Math.max(0, Math.round(raw)));
}

export function detectOrphanRisk(inboundLinks: number): boolean {
  return inboundLinks < 2;
}

export function classifyHubType(url: string, inbound: number): PageLinkAuthority['hub_type'] {
  const pathSegments = url.replace('https://talentxcel.in', '').split('/').filter(Boolean);
  if (inbound < 2) return 'ISOLATED';
  if (pathSegments.length <= 1 && inbound > 20) return 'ROOT_HUB';
  if (pathSegments.length <= 2 && inbound > 5) return 'CATEGORY_HUB';
  return 'LEAF_ENTITY';
}

export function findLinkGapOpportunities(
  page: PageLinkAuthority,
  allPages: PageLinkAuthority[]
): string[] {
  return allPages
    .filter(p =>
      p.canonical_url !== page.canonical_url &&
      p.authority_score > 70 &&
      !p.recommended_linking_sources.includes(page.canonical_url)
    )
    .map(p => p.canonical_url)
    .slice(0, 5);
}

export const SAMPLE_PAGE_AUTHORITY_MAP: PageLinkAuthority[] = [
  {
    canonical_url: 'https://talentxcel.in/jobs',
    surface: 'JOBS',
    inbound_internal_links: 52,
    outbound_internal_links: 148,
    crawl_depth: 1,
    orphan_risk: false,
    hub_type: 'ROOT_HUB',
    topical_cluster: 'career-opportunities',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(52, 1, false),
    recommended_linking_sources: [],
  },
  {
    canonical_url: 'https://talentxcel.in/resume',
    surface: 'RESUME_ATS',
    inbound_internal_links: 38,
    outbound_internal_links: 24,
    crawl_depth: 1,
    orphan_risk: false,
    hub_type: 'ROOT_HUB',
    topical_cluster: 'resume-ats',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(38, 1, false),
    recommended_linking_sources: [],
  },
  {
    canonical_url: 'https://talentxcel.in/network',
    surface: 'PROFESSIONAL_NETWORK',
    inbound_internal_links: 29,
    outbound_internal_links: 56,
    crawl_depth: 1,
    orphan_risk: false,
    hub_type: 'ROOT_HUB',
    topical_cluster: 'professional-networking',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(29, 1, false),
    recommended_linking_sources: [],
  },
  {
    canonical_url: 'https://talentxcel.in/colleges',
    surface: 'COLLEGES',
    inbound_internal_links: 24,
    outbound_internal_links: 82,
    crawl_depth: 1,
    orphan_risk: false,
    hub_type: 'ROOT_HUB',
    topical_cluster: 'higher-education',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(24, 1, false),
    recommended_linking_sources: [],
  },
  {
    canonical_url: 'https://talentxcel.in/rankings',
    surface: 'BIDDER_RANKINGS',
    inbound_internal_links: 18,
    outbound_internal_links: 34,
    crawl_depth: 1,
    orphan_risk: false,
    hub_type: 'ROOT_HUB',
    topical_cluster: 'product-rankings',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(18, 1, false),
    recommended_linking_sources: [],
  },
  {
    canonical_url: 'https://talentxcel.in/career-map',
    surface: 'CAREER_MAP',
    inbound_internal_links: 14,
    outbound_internal_links: 28,
    crawl_depth: 1,
    orphan_risk: false,
    hub_type: 'ROOT_HUB',
    topical_cluster: 'career-planning',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(14, 1, false),
    recommended_linking_sources: [],
  },
  {
    canonical_url: 'https://talentxcel.in/tools',
    surface: 'CAREER_TOOLS',
    inbound_internal_links: 11,
    outbound_internal_links: 18,
    crawl_depth: 1,
    orphan_risk: false,
    hub_type: 'ROOT_HUB',
    topical_cluster: 'career-tools',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(11, 1, false),
    recommended_linking_sources: [],
  },
  {
    canonical_url: 'https://talentxcel.in/jobs/software-engineer',
    surface: 'JOBS',
    inbound_internal_links: 12,
    outbound_internal_links: 38,
    crawl_depth: 2,
    orphan_risk: false,
    hub_type: 'CATEGORY_HUB',
    topical_cluster: 'software-engineering-jobs',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(12, 2, false),
    recommended_linking_sources: ['https://talentxcel.in/jobs', 'https://talentxcel.in/skills/python'],
  },
  {
    canonical_url: 'https://talentxcel.in/jobs/data-analyst',
    surface: 'JOBS',
    inbound_internal_links: 8,
    outbound_internal_links: 24,
    crawl_depth: 2,
    orphan_risk: false,
    hub_type: 'CATEGORY_HUB',
    topical_cluster: 'data-jobs',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(8, 2, false),
    recommended_linking_sources: ['https://talentxcel.in/jobs', 'https://talentxcel.in/roles/data-analyst'],
  },
  {
    canonical_url: 'https://talentxcel.in/colleges/bangalore',
    surface: 'COLLEGES',
    inbound_internal_links: 6,
    outbound_internal_links: 42,
    crawl_depth: 2,
    orphan_risk: false,
    hub_type: 'CATEGORY_HUB',
    topical_cluster: 'bangalore-education',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(6, 2, false),
    recommended_linking_sources: ['https://talentxcel.in/colleges', 'https://talentxcel.in/jobs/bangalore'],
  },
  {
    canonical_url: 'https://talentxcel.in/jobs/software-engineer/bangalore',
    surface: 'JOBS',
    inbound_internal_links: 4,
    outbound_internal_links: 12,
    crawl_depth: 3,
    orphan_risk: false,
    hub_type: 'LEAF_ENTITY',
    topical_cluster: 'software-engineering-bangalore',
    link_gap_opportunities: ['https://talentxcel.in/skills/python', 'https://talentxcel.in/roles/software-engineer'],
    authority_score: computeAuthorityScore(4, 3, false),
    recommended_linking_sources: ['https://talentxcel.in/jobs/software-engineer', 'https://talentxcel.in/jobs/bangalore'],
  },
  {
    canonical_url: 'https://talentxcel.in/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    surface: 'JOBS',
    inbound_internal_links: 3,
    outbound_internal_links: 8,
    crawl_depth: 3,
    orphan_risk: false,
    hub_type: 'LEAF_ENTITY',
    topical_cluster: 'content-writer-jobs',
    link_gap_opportunities: ['https://talentxcel.in/jobs', 'https://talentxcel.in/jobs/content-writer'],
    authority_score: computeAuthorityScore(3, 3, false),
    recommended_linking_sources: ['https://talentxcel.in/jobs/content-writer', 'https://talentxcel.in/jobs/noida'],
  },
  {
    canonical_url: 'https://talentxcel.in/roles/software-engineer',
    surface: 'ROLE_GUIDES',
    inbound_internal_links: 7,
    outbound_internal_links: 18,
    crawl_depth: 2,
    orphan_risk: false,
    hub_type: 'CATEGORY_HUB',
    topical_cluster: 'software-engineering-careers',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(7, 2, false),
    recommended_linking_sources: ['https://talentxcel.in/jobs/software-engineer', 'https://talentxcel.in/skills/python'],
  },
  {
    canonical_url: 'https://talentxcel.in/roles/data-scientist',
    surface: 'ROLE_GUIDES',
    inbound_internal_links: 5,
    outbound_internal_links: 14,
    crawl_depth: 2,
    orphan_risk: false,
    hub_type: 'CATEGORY_HUB',
    topical_cluster: 'data-science-careers',
    link_gap_opportunities: ['https://talentxcel.in/learning/data-science'],
    authority_score: computeAuthorityScore(5, 2, false),
    recommended_linking_sources: ['https://talentxcel.in/jobs/data-scientist', 'https://talentxcel.in/skills/python'],
  },
  {
    canonical_url: 'https://talentxcel.in/skills/python',
    surface: 'SKILLS',
    inbound_internal_links: 9,
    outbound_internal_links: 16,
    crawl_depth: 2,
    orphan_risk: false,
    hub_type: 'CATEGORY_HUB',
    topical_cluster: 'programming-skills',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(9, 2, false),
    recommended_linking_sources: ['https://talentxcel.in/roles/data-scientist', 'https://talentxcel.in/learning/python'],
  },
  {
    canonical_url: 'https://talentxcel.in/passport',
    surface: 'CAREER_PASSPORT',
    inbound_internal_links: 8,
    outbound_internal_links: 12,
    crawl_depth: 1,
    orphan_risk: false,
    hub_type: 'ROOT_HUB',
    topical_cluster: 'career-credentials',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(8, 1, false),
    recommended_linking_sources: [],
  },
  {
    canonical_url: 'https://talentxcel.in/mo1',
    surface: 'MO1_BUSINESS_OS',
    inbound_internal_links: 6,
    outbound_internal_links: 14,
    crawl_depth: 1,
    orphan_risk: false,
    hub_type: 'ROOT_HUB',
    topical_cluster: 'ai-recruitment-b2b',
    link_gap_opportunities: [],
    authority_score: computeAuthorityScore(6, 1, false),
    recommended_linking_sources: [],
  },
  {
    canonical_url: 'https://talentxcel.in/tools/salary-calculator',
    surface: 'CAREER_TOOLS',
    inbound_internal_links: 1,
    outbound_internal_links: 4,
    crawl_depth: 2,
    orphan_risk: true,
    hub_type: 'ISOLATED',
    topical_cluster: 'career-tools',
    link_gap_opportunities: ['https://talentxcel.in/tools', 'https://talentxcel.in/roles/software-engineer', 'https://talentxcel.in/jobs'],
    authority_score: computeAuthorityScore(1, 2, true),
    recommended_linking_sources: ['https://talentxcel.in/tools', 'https://talentxcel.in/jobs/software-engineer'],
  },
  {
    canonical_url: 'https://talentxcel.in/learning/digital-marketing',
    surface: 'LEARNING_COURSES',
    inbound_internal_links: 2,
    outbound_internal_links: 8,
    crawl_depth: 2,
    orphan_risk: false,
    hub_type: 'LEAF_ENTITY',
    topical_cluster: 'marketing-education',
    link_gap_opportunities: ['https://talentxcel.in/jobs/digital-marketing-executive'],
    authority_score: computeAuthorityScore(2, 2, false),
    recommended_linking_sources: ['https://talentxcel.in/colleges', 'https://talentxcel.in/roles/digital-marketing-manager'],
  },
  {
    canonical_url: 'https://talentxcel.in/companies/infosys',
    surface: 'COMPANIES',
    inbound_internal_links: 1,
    outbound_internal_links: 6,
    crawl_depth: 2,
    orphan_risk: true,
    hub_type: 'ISOLATED',
    topical_cluster: 'it-companies-india',
    link_gap_opportunities: ['https://talentxcel.in/jobs', 'https://talentxcel.in/roles/software-engineer'],
    authority_score: computeAuthorityScore(1, 2, true),
    recommended_linking_sources: ['https://talentxcel.in/jobs/infosys', 'https://talentxcel.in/colleges/nit'],
  },
];
