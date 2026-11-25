/**
 * src/lib/geo/globalDiscoveryEngine.ts
 * TalentXcel Global Multi-Dimensional Job Discovery Engine
 *
 * PURPOSE:
 * - Makes 100% of active jobs (4,470+) discoverable across Industry, Role, Location,
 *   Fresher, Internship, Remote, and National dimensions.
 * - Expands across 20 verified live industries from public.jobs.
 * - Evaluates selective Role × Industry × Location combinations with strict anti-thin-page gating.
 * - Prioritizes combinations using real GSC demand signals from cityRegistry.ts.
 * - Generates Job-to-Hub internal links (City, Industry, Role/Segment, Employer) without UI redesign.
 * - Keeps SEO indexability strictly independent of active job preservation.
 *
 * @version 1.0.0
 */

import { CITY_REGISTRY_ALL, resolveCity } from './cityRegistry';
import { resolveCanonicalLocation } from './canonicalGeoResolver';
import { classifyPreservedJob, type PreservedJobInput } from './inventoryPreservation';

export interface DiscoveryIndustryDef {
  slug: string;
  name: string;
  dbValues: readonly string[];
  keywords: readonly string[];
}

/**
 * 20 verified industries grounded in live public.jobs.industry_domain / industry / category.
 */
export const DISCOVERY_INDUSTRIES: readonly DiscoveryIndustryDef[] = [
  {
    slug: 'information-technology',
    name: 'Information Technology',
    dbValues: ['Information Technology', 'Technology'],
    keywords: ['software', 'developer', 'engineer', 'cloud', 'data', 'devops', 'ai', 'it'],
  },
  {
    slug: 'sales-business-development',
    name: 'Sales & Business Development',
    dbValues: ['Sales & Business Development'],
    keywords: ['sales', 'business development', 'account executive', 'bdm'],
  },
  {
    slug: 'marketing-advertising',
    name: 'Marketing & Advertising',
    dbValues: ['Marketing & Advertising'],
    keywords: ['marketing', 'seo', 'growth', 'brand', 'content', 'advertising'],
  },
  {
    slug: 'banking-financial-services',
    name: 'Banking & Financial Services',
    dbValues: ['Banking & Financial Services', 'Financial Services'],
    keywords: ['banking', 'finance', 'fintech', 'credit', 'wealth', 'treasury'],
  },
  {
    slug: 'construction-real-estate',
    name: 'Construction & Real Estate',
    dbValues: ['Construction & Real Estate', 'Real Estate'],
    keywords: ['construction', 'civil', 'real estate', 'architect', 'site engineer'],
  },
  {
    slug: 'manufacturing-industrial',
    name: 'Manufacturing & Industrial',
    dbValues: ['Manufacturing & Industrial', 'Manufacturing'],
    keywords: ['manufacturing', 'production', 'plant', 'mechanical', 'quality'],
  },
  {
    slug: 'human-resources-recruitment',
    name: 'Human Resources & Recruitment',
    dbValues: ['Human Resources & Recruitment'],
    keywords: ['hr', 'human resources', 'talent acquisition', 'recruiter', 'people ops'],
  },
  {
    slug: 'automobile-automotive',
    name: 'Automobile & Automotive',
    dbValues: ['Automobile & Automotive', 'Automotive'],
    keywords: ['automotive', 'automobile', 'ev', 'vehicle', 'mechanical'],
  },
  {
    slug: 'government-public-sector',
    name: 'Government & Public Sector',
    dbValues: ['Government & Public Sector'],
    keywords: ['government', 'psu', 'public sector', 'sarkari', 'ministry'],
  },
  {
    slug: 'retail-e-commerce',
    name: 'Retail & E-commerce',
    dbValues: ['Retail & E-commerce', 'E-commerce', 'Retail'],
    keywords: ['retail', 'ecommerce', 'e-commerce', 'merchandising', 'store'],
  },
  {
    slug: 'accounting-finance',
    name: 'Accounting & Finance',
    dbValues: ['Accounting & Finance'],
    keywords: ['accounting', 'chartered accountant', 'audit', 'tax', 'gst', 'tally'],
  },
  {
    slug: 'pharmaceuticals-biotechnology',
    name: 'Pharmaceuticals & Biotechnology',
    dbValues: ['Pharmaceuticals & Biotechnology'],
    keywords: ['pharma', 'biotech', 'clinical', 'regulatory', 'life sciences'],
  },
  {
    slug: 'legal-compliance',
    name: 'Legal & Compliance',
    dbValues: ['Legal & Compliance'],
    keywords: ['legal', 'lawyer', 'counsel', 'compliance', 'regulatory'],
  },
  {
    slug: 'education-edtech',
    name: 'Education & EdTech',
    dbValues: ['Education & EdTech', 'Education'],
    keywords: ['education', 'edtech', 'teaching', 'faculty', 'academic'],
  },
  {
    slug: 'logistics-supply-chain',
    name: 'Logistics & Supply Chain',
    dbValues: ['Logistics & Supply Chain'],
    keywords: ['logistics', 'supply chain', 'warehouse', 'procurement', 'fleet'],
  },
  {
    slug: 'bpo-call-centres',
    name: 'BPO & Call Centres',
    dbValues: ['BPO & Call Centres'],
    keywords: ['bpo', 'customer support', 'voice process', 'call centre'],
  },
  {
    slug: 'insurance',
    name: 'Insurance',
    dbValues: ['Insurance'],
    keywords: ['insurance', 'underwriting', 'claims', 'actuarial'],
  },
  {
    slug: 'hospitality-tourism',
    name: 'Hospitality & Tourism',
    dbValues: ['Hospitality & Tourism'],
    keywords: ['hospitality', 'hotel', 'tourism', 'travel'],
  },
  {
    slug: 'media-entertainment',
    name: 'Media & Entertainment',
    dbValues: ['Media & Entertainment'],
    keywords: ['media', 'entertainment', 'journalism', 'video', 'production'],
  },
  {
    slug: 'healthcare-hospitals',
    name: 'Healthcare & Hospitals',
    dbValues: ['Healthcare & Hospitals', 'Healthcare'],
    keywords: ['healthcare', 'hospital', 'medical', 'nursing', 'doctor'],
  },
];

export interface DiscoverySegmentDef {
  slug: 'freshers' | 'internships' | 'remote' | 'national';
  label: string;
  url: string;
  description: string;
}

export const DISCOVERY_SEGMENTS: readonly DiscoverySegmentDef[] = [
  {
    slug: 'freshers',
    label: 'Fresher & Entry-Level Jobs',
    url: '/jobs?experience=fresher',
    description: 'Verified entry-level, graduate trainee, and fresher openings across India and remote.',
  },
  {
    slug: 'internships',
    label: 'Internships & Paid Apprenticeships',
    url: '/jobs?employment_type=internship',
    description: 'Active internships and apprenticeship programs across tech, business, and operations.',
  },
  {
    slug: 'remote',
    label: 'Remote & Work-From-Home Jobs',
    url: '/jobs?work_mode=remote',
    description: 'Verified remote and work-from-home roles across India and global teams.',
  },
  {
    slug: 'national',
    label: 'Pan-India & Multi-City Jobs',
    url: '/jobs?location=India',
    description: 'National and Pan-India openings not restricted to a single city hub.',
  },
];

export interface MultiDimJobRecord extends PreservedJobInput {
  title?: string | null;
  company_name?: string | null;
  industry_domain?: string | null;
  industry?: string | null;
  category?: string | null;
  employment_type?: string | null;
  experience_level?: string | null;
  is_fresher_eligible?: boolean | null;
  is_internship?: boolean | null;
}

export interface MultiDimClusterResult {
  key: string;
  roleSlug: string | null;
  industrySlug: string;
  locationSlug: string;
  canonicalUrl: string;
  /** All preserved active jobs matching this combination (includes past-expiry). */
  totalActiveInventory: number;
  /** Unexpired subset evaluated for SEO indexation. */
  seoEligibleUnexpiredCount: number;
  uniqueJobCount: number;
  employerCount: number;
  recent30dCount: number;
  /** GSC impressions of the city hub (0 if remote/national/untracked). */
  gscImpressions: number;
  /** Composite demand priority score for selective expansion. */
  priorityScore: number;
  /** True only if combination meets strict anti-thin-page thresholds. */
  indexReady: boolean;
  /** Always true when totalActiveInventory > 0 — users can always discover via search. */
  userDiscoverable: boolean;
  failureReasons: string[];
}

export interface JobDiscoveryLink {
  label: string;
  href: string;
  hubType: 'CITY' | 'INDUSTRY' | 'SEGMENT' | 'EMPLOYER' | 'COMBO';
}

export const CLUSTER_SEO_THRESHOLDS = {
  MIN_UNEXPIRED_JOBS: 5,
  MIN_UNIQUE_JOBS: 3,
  MIN_EMPLOYERS: 2,
  MIN_RECENT_30D: 1,
} as const;

export function slugifyTerm(input: string): string {
  return input
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Resolves a raw industry string (from industry_domain, industry, or category)
 * to one of the 20 canonical DISCOVERY_INDUSTRIES.
 */
export function resolveIndustry(rawIndustry: string | null | undefined): DiscoveryIndustryDef | null {
  if (!rawIndustry || !rawIndustry.trim()) return null;
  const norm = rawIndustry.trim().toLowerCase();
  const normSlug = slugifyTerm(norm);

  for (const ind of DISCOVERY_INDUSTRIES) {
    if (ind.slug === normSlug || ind.name.toLowerCase() === norm) return ind;
    if (ind.dbValues.some((v) => v.toLowerCase() === norm)) return ind;
  }
  // Fallback keyword match
  for (const ind of DISCOVERY_INDUSTRIES) {
    if (ind.keywords.some((k) => norm.includes(k))) return ind;
  }
  return null;
}

export function isFresherJob(job: MultiDimJobRecord): boolean {
  if (job.is_fresher_eligible === true) return true;
  const exp = (job.experience_level || '').toLowerCase();
  const title = (job.title || '').toLowerCase();
  return exp.includes('fresher') || exp.includes('entry') || title.includes('fresher') || title.includes('trainee');
}

export function isInternshipJob(job: MultiDimJobRecord): boolean {
  if (job.is_internship === true) return true;
  const emp = (job.employment_type || '').toLowerCase();
  const title = (job.title || '').toLowerCase();
  return emp.includes('intern') || title.includes('intern');
}

/**
 * Evaluates selective Role × Industry × Location combinations from live jobs.
 * Prevents thin-page indexation while preserving 100% user discoverability.
 */
export function evaluateSelectiveClusters(
  jobs: readonly MultiDimJobRecord[],
  options?: { includeRoleDimension?: boolean; now?: Date }
): MultiDimClusterResult[] {
  const now = options?.now ?? new Date();
  const cutoffMs = now.getTime() - 30 * 86_400_000;
  const includeRole = options?.includeRoleDimension ?? false;

  const gscMap = new Map<string, number>();
  for (const c of CITY_REGISTRY_ALL) {
    gscMap.set(c.slug, c.gsc.impressions);
  }

  const buckets = new Map<
    string,
    {
      roleSlug: string | null;
      industrySlug: string;
      locationSlug: string;
      jobs: Map<string, MultiDimJobRecord>;
    }
  >();

  for (const job of jobs) {
    if (job.is_active !== true) continue;

    const ind = resolveIndustry(job.industry_domain || job.industry || job.category);
    if (!ind) continue;

    const locRes = resolveCanonicalLocation(job.location, job.location_city);
    const locSlugs: string[] =
      locRes.locationType === 'REMOTE'
        ? ['remote']
        : locRes.locationType === 'NATIONAL'
        ? ['india']
        : locRes.locationType === 'CITY' || locRes.locationType === 'INTERNATIONAL'
        ? locRes.allCities.map((c) => c.canonicalSlug)
        : [];

    if (locSlugs.length === 0) continue;

    const roleSlug = includeRole && job.title ? slugifyTerm(job.title).slice(0, 60) : null;

    for (const locSlug of locSlugs) {
      const key = roleSlug ? `${roleSlug}::${ind.slug}::${locSlug}` : `${ind.slug}::${locSlug}`;
      if (!buckets.has(key)) {
        buckets.set(key, {
          roleSlug,
          industrySlug: ind.slug,
          locationSlug: locSlug,
          jobs: new Map(),
        });
      }
      buckets.get(key)!.jobs.set(job.id, job);
    }
  }

  const results: MultiDimClusterResult[] = [];
  for (const [key, bucket] of buckets.entries()) {
    const allJobs = Array.from(bucket.jobs.values());
    const unexpired = allJobs.filter((j) => classifyPreservedJob(j, now).job_indexability);
    const uniqueCount = new Set(unexpired.map((j) => `${(j.title || '').toLowerCase()}||${(j.company_name || '').toLowerCase()}`)).size;
    const employerCount = new Set(unexpired.map((j) => (j.company_name || '').trim().toLowerCase()).filter(Boolean)).size;
    const recent30dCount = unexpired.filter((j) => {
      const dt = j.posted_at || j.created_at;
      return dt ? Date.parse(dt) >= cutoffMs : false;
    }).length;

    const failureReasons: string[] = [];
    if (unexpired.length < CLUSTER_SEO_THRESHOLDS.MIN_UNEXPIRED_JOBS) {
      failureReasons.push(`unexpired=${unexpired.length}<${CLUSTER_SEO_THRESHOLDS.MIN_UNEXPIRED_JOBS}`);
    }
    if (uniqueCount < CLUSTER_SEO_THRESHOLDS.MIN_UNIQUE_JOBS) {
      failureReasons.push(`unique=${uniqueCount}<${CLUSTER_SEO_THRESHOLDS.MIN_UNIQUE_JOBS}`);
    }
    if (employerCount < CLUSTER_SEO_THRESHOLDS.MIN_EMPLOYERS) {
      failureReasons.push(`employers=${employerCount}<${CLUSTER_SEO_THRESHOLDS.MIN_EMPLOYERS}`);
    }
    if (recent30dCount < CLUSTER_SEO_THRESHOLDS.MIN_RECENT_30D) {
      failureReasons.push(`recent30d=${recent30dCount}<${CLUSTER_SEO_THRESHOLDS.MIN_RECENT_30D}`);
    }

    const gscImpressions = gscMap.get(bucket.locationSlug) ?? 0;
    const gscBoost = gscImpressions > 500 ? 25 : gscImpressions > 100 ? 15 : gscImpressions > 0 ? 5 : 0;
    const priorityScore = Math.min(100, unexpired.length + employerCount * 3 + gscBoost);

    const canonicalUrl = bucket.roleSlug
      ? `/jobs/${bucket.roleSlug}/${bucket.industrySlug}/${bucket.locationSlug}`
      : `/industries/${bucket.industrySlug}?location=${bucket.locationSlug}`;

    results.push({
      key,
      roleSlug: bucket.roleSlug,
      industrySlug: bucket.industrySlug,
      locationSlug: bucket.locationSlug,
      canonicalUrl,
      totalActiveInventory: allJobs.length,
      seoEligibleUnexpiredCount: unexpired.length,
      uniqueJobCount: uniqueCount,
      employerCount,
      recent30dCount,
      gscImpressions,
      priorityScore,
      indexReady: failureReasons.length === 0,
      userDiscoverable: allJobs.length > 0,
      failureReasons,
    });
  }

  return results.sort((a, b) => b.priorityScore - a.priorityScore || b.totalActiveInventory - a.totalActiveInventory);
}

/**
 * Generates verified internal links from a single job to Industry, Role/Segment,
 * Location, and Employer hubs without altering UI components.
 */
export function buildJobDiscoveryLinks(job: MultiDimJobRecord): JobDiscoveryLink[] {
  const links: JobDiscoveryLink[] = [];
  const locRes = resolveCanonicalLocation(job.location, job.location_city);

  // 1. Location Hub link (City, Remote, or National)
  if (locRes.locationType === 'REMOTE') {
    links.push({ label: 'Remote Jobs', href: '/jobs?work_mode=remote', hubType: 'SEGMENT' });
  } else if (locRes.locationType === 'NATIONAL') {
    links.push({ label: 'Pan-India Jobs', href: '/jobs?location=India', hubType: 'SEGMENT' });
  } else if (locRes.primary) {
    const cityRec = resolveCity(locRes.primary.canonicalSlug);
    const cityName = cityRec?.canonicalName || locRes.primary.canonicalCity;
    links.push({
      label: `Jobs in ${cityName}`,
      href: `/locations/${locRes.primary.canonicalSlug}`,
      hubType: 'CITY',
    });
  }

  // 2. Industry Hub link (App.tsx route: /industries/:industry)
  const ind = resolveIndustry(job.industry_domain || job.industry || job.category);
  if (ind) {
    links.push({
      label: `${ind.name} Jobs`,
      href: `/industries/${ind.slug}`,
      hubType: 'INDUSTRY',
    });
  }

  // 3. Fresher / Internship Segment links
  if (isFresherJob(job)) {
    links.push({ label: 'Fresher Jobs', href: '/jobs?experience=fresher', hubType: 'SEGMENT' });
  }
  if (isInternshipJob(job)) {
    links.push({ label: 'Internships', href: '/jobs?employment_type=internship', hubType: 'SEGMENT' });
  }

  // 4. Employer Hub link (App.tsx route: /company/:slug)
  if (job.company_name && job.company_name.trim()) {
    links.push({
      label: `${job.company_name.trim()} Careers`,
      href: `/company/${slugifyTerm(job.company_name)}`,
      hubType: 'EMPLOYER',
    });
  }

  return links;
}

export interface RoleFamilyDef {
  slug: string;
  name: string;
  patterns: readonly RegExp[];
}

/**
 * 15 canonical role families consolidating fragmented job titles across 4,470+ active jobs.
 */
export const CONSOLIDATED_ROLE_FAMILIES: readonly RoleFamilyDef[] = [
  { slug: 'software-engineer', name: 'Software Engineer', patterns: [/\b(software|backend|frontend|full[\s-]?stack|web|react|node|java|python|golang|c\+\+|mobile|android|ios)\s*(engineer|developer|architect|programmer)\b/i, /\bsde\b/i] },
  { slug: 'data-analyst-scientist', name: 'Data Analyst & Scientist', patterns: [/\b(data|business|analytics|bi)\s*(analyst|scientist|engineer)\b/i, /\bmachine learning\b/i, /\bai\s*(engineer|researcher|architect)\b/i] },
  { slug: 'devops-cloud-engineer', name: 'DevOps & Cloud Engineer', patterns: [/\b(devops|sre|site reliability|cloud|platform|infrastructure|kubernetes)\s*(engineer|architect|specialist)\b/i] },
  { slug: 'qa-automation-engineer', name: 'QA & Automation Engineer', patterns: [/\b(qa|quality assurance|test|sdet|automation)\s*(engineer|analyst|lead)\b/i] },
  { slug: 'cybersecurity-engineer', name: 'Cybersecurity Engineer', patterns: [/\b(security|cybersecurity|infosec|soc|iam)\s*(engineer|analyst|architect)\b/i] },
  { slug: 'product-project-manager', name: 'Product & Project Manager', patterns: [/\b(product|project|program|scrum|delivery)\s*(manager|owner|lead|master)\b/i] },
  { slug: 'sales-business-development', name: 'Sales & Business Development', patterns: [/\b(sales|business development|account|bdm|bde|revenue)\s*(executive|manager|representative|associate|lead|director)\b/i] },
  { slug: 'digital-marketing-growth', name: 'Digital Marketing & Growth', patterns: [/\b(marketing|seo|sem|growth|brand|content|social media)\s*(manager|specialist|executive|lead|analyst)\b/i] },
  { slug: 'hr-talent-acquisition', name: 'HR & Talent Acquisition', patterns: [/\b(hr|human resources|talent acquisition|recruiter|people)\s*(manager|executive|partner|specialist|lead)?\b/i] },
  { slug: 'finance-accounting', name: 'Finance & Accounting', patterns: [/\b(finance|financial|accounting|accountant|audit|tax|ca|banking)\s*(manager|analyst|executive|associate|officer)?\b/i] },
  { slug: 'graduate-engineer-trainee', name: 'Graduate & Management Trainee', patterns: [/\b(graduate|management|get|trainee|apprentice)\b/i] },
  { slug: 'legal-compliance', name: 'Legal & Compliance', patterns: [/\b(legal|counsel|lawyer|compliance|regulatory)\b/i] },
  { slug: 'operations-supply-chain', name: 'Operations & Supply Chain', patterns: [/\b(operations|supply chain|logistics|procurement|warehouse)\s*(manager|executive|analyst|specialist)?\b/i] },
  { slug: 'customer-support-bpo', name: 'Customer Support & BPO', patterns: [/\b(customer|support|service|bpo|client)\s*(executive|specialist|representative|associate|manager)\b/i] },
  { slug: 'ui-ux-designer', name: 'UI/UX & Product Designer', patterns: [/\b(ui|ux|product|graphic|visual)\s*(designer|researcher)\b/i] },
];

export function classifyRoleFamily(title: string | null | undefined): { slug: string; name: string } | null {
  if (!title) return null;
  for (const rf of CONSOLIDATED_ROLE_FAMILIES) {
    if (rf.patterns.some((p) => p.test(title))) {
      return { slug: rf.slug, name: rf.name };
    }
  }
  return null;
}

export interface CrawlPriorityInput {
  gscImpressions: number;
  gscClicks: number;
  gscAvgPosition: number;
  unexpiredJobs: number;
  employers: number;
  recent30d: number;
  qualityScore: number;
  indexReady: boolean;
}

/**
 * Deterministic Crawl Priority Score (0–100) grounded in GSC demand,
 * unexpired inventory, employer diversity, freshness, and page quality.
 * Non-index-ready hubs always receive 0 crawl priority.
 */
export function computeCrawlPriorityScore(input: CrawlPriorityInput): number {
  if (!input.indexReady || input.unexpiredJobs < CLUSTER_SEO_THRESHOLDS.MIN_UNEXPIRED_JOBS) {
    return 0;
  }
  const gscScore =
    (input.gscImpressions >= 500 ? 25 : input.gscImpressions >= 100 ? 18 : input.gscImpressions > 0 ? 10 : 0) +
    (input.gscClicks >= 10 ? 10 : input.gscClicks > 0 ? 5 : 0) +
    (input.gscAvgPosition > 0 && input.gscAvgPosition <= 10 ? 10 : input.gscAvgPosition <= 25 ? 5 : 0);

  const inventoryScore = Math.min(25, Math.floor(input.unexpiredJobs / 4) + Math.min(10, input.employers * 2));
  const freshnessScore = input.recent30d >= 10 ? 15 : input.recent30d >= 3 ? 10 : 5;
  const qualityBonus = Math.min(15, Math.round((input.qualityScore / 100) * 15));

  return Math.min(100, gscScore + inventoryScore + freshnessScore + qualityBonus);
}
