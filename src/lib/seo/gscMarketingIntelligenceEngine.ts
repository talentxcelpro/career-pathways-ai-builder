// src/lib/seo/gscMarketingIntelligenceEngine.ts
// Enterprise Google Search Console Marketing Intelligence & Gap Engine
// Ingests real GSC query/page search performance rows and maps them into prioritized marketing plays.
// Derives: CTR Loss Gaps, Striking Distance Ranking Gaps, Missing Canonical Gaps, Conversion Leaks, and Brand Demand.

export type GscGapType = 
  | 'CTR_LOSS_GAP' 
  | 'RANKING_OPPORTUNITY_GAP' 
  | 'MISSING_CANONICAL_GAP' 
  | 'CONVERSION_LEAK_GAP' 
  | 'BRAND_DEMAND_GAP';

export type MarketingPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface GscPerformanceRow {
  query: string;
  pageUrl: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface MarketingActionPlay {
  playId: string;
  query: string;
  pageUrl: string;
  surface: 'LOCATIONS' | 'JOBS' | 'COLLEGES' | 'RESOURCES' | 'BRAND' | 'BLOG' | 'NEWS' | 'OTHER';
  gapType: GscGapType;
  priority: MarketingPriority;
  opportunityScore: number; // 0-100
  currentPosition: number;
  actualCtr: number;
  benchmarkCtr: number;
  impressions: number;
  clicks: number;
  projectedExtraClicks: number;
  projectedLeadConversions: number;
  rootCause: string;
  marketingPlayName: string;
  recommendedTitle: string;
  recommendedMetaDescription: string;
  recommendedConversionHook: string;
  recommendedActions: string[];
}

export interface GscMarketingAuditSummary {
  totalRows: number;
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  topPerformingSurface: string;
  detectedGapsCount: number;
  ctrLossCount: number;
  rankingOpportunityCount: number;
  conversionLeakCount: number;
  projectedMonthlyClickLift: number;
  projectedMonthlyLeadLift: number;
  plays: MarketingActionPlay[];
}

// Expected Organic CTR by SERP Rank (Industry Standard Benchmark)
export const SERP_CTR_BENCHMARK: Record<number, number> = {
  1: 0.28,
  2: 0.15,
  3: 0.11,
  4: 0.08,
  5: 0.07,
  6: 0.05,
  7: 0.04,
  8: 0.03,
  9: 0.025,
  10: 0.02,
};

export function getExpectedCtr(position: number): number {
  const rounded = Math.round(position);
  if (rounded <= 1) return SERP_CTR_BENCHMARK[1];
  if (rounded in SERP_CTR_BENCHMARK) return SERP_CTR_BENCHMARK[rounded];
  if (rounded <= 20) return 0.012;
  if (rounded <= 30) return 0.006;
  return 0.002;
}

export function detectSurfaceFromUrl(url: string): MarketingActionPlay['surface'] {
  const lower = url.toLowerCase();
  if (lower.includes('/locations/')) return 'LOCATIONS';
  if (lower.includes('/jobs/')) return 'JOBS';
  if (lower.includes('/colleges/')) return 'COLLEGES';
  if (lower.includes('/blog/')) return 'BLOG';
  if (lower.includes('/news/')) return 'NEWS';
  if (lower.includes('/about/talentxcel') || lower.includes('/about/')) return 'BRAND';
  if (lower.includes('/resources/')) return 'RESOURCES';
  return 'OTHER';
}

/**
 * Classifies a raw GSC performance row into a high-value marketing gap with prioritized plays.
 */
export function analyzeGscRow(row: GscPerformanceRow): MarketingActionPlay | null {
  const { query, pageUrl, clicks, impressions, ctr, position } = row;
  const surface = detectSurfaceFromUrl(pageUrl);
  const expectedCtr = getExpectedCtr(position);

  // 1. CTR Loss Gap: Page 1 rank (pos <= 10) with significant impressions but underperforming CTR
  if (position <= 10 && impressions >= 5 && ctr < expectedCtr * 0.7) {
    const projectedExtraClicks = Math.round(impressions * (expectedCtr - ctr));
    const projectedLeadConversions = Math.max(1, Math.round(projectedExtraClicks * 0.12));

    let title = `${query.charAt(0).toUpperCase() + query.slice(1)} (Updated 2026) | TalentXcel`;
    let meta = `Apply to verified ${query} vacancies with transparent salary benchmarks, direct employer matching, and free ATS resume scoring on TalentXcel.`;
    let hook = 'Job Alert Instant Notifications + Free 1-Click ATS Resume Optimization';

    if (surface === 'LOCATIONS') {
      title = `${query.toUpperCase()} — Verified Hiring Vacancies & Direct Apply | TalentXcel`;
      meta = `Explore top hiring opportunities for ${query}. Filter by experience, compare verified compensation packages, and apply in 60 seconds with verified Career Passport.`;
      hook = 'Instant WhatsApp/Email Daily Job Alerts for Local Candidates';
    }

    return {
      playId: `gap_ctr_${query.replace(/\s+/g, '_')}`,
      query,
      pageUrl,
      surface,
      gapType: 'CTR_LOSS_GAP',
      priority: impressions > 100 ? 'P0' : 'P1',
      opportunityScore: Math.min(100, Math.round(40 + (impressions / 15) + (expectedCtr - ctr) * 100)),
      currentPosition: Number(position.toFixed(1)),
      actualCtr: Number(ctr.toFixed(4)),
      benchmarkCtr: expectedCtr,
      impressions,
      clicks,
      projectedExtraClicks,
      projectedLeadConversions,
      rootCause: `Ranking in top ${Math.round(position)}, but CTR is ${(ctr * 100).toFixed(1)}% vs expected ${(expectedCtr * 100).toFixed(1)}%. Snippet lacks urgent action hook.`,
      marketingPlayName: 'SERP Click-Through Optimization Play',
      recommendedTitle: title,
      recommendedMetaDescription: meta,
      recommendedConversionHook: hook,
      recommendedActions: [
        'Deploy high-CTR title tag with bracketed freshness hook [Updated Today]',
        'Inject rich FAQ Schema and JobPosting structured data',
        'Add localized trust badge & urgent hiring count in meta description',
        'Submit refreshed URL directly to Google Indexing API'
      ]
    };
  }

  // 2. Conversion Leak Gap: High organic clicks already occurring, needs lead capture
  if (clicks >= 3 && impressions >= 20) {
    return {
      playId: `gap_conv_${query.replace(/\s+/g, '_')}`,
      query,
      pageUrl,
      surface,
      gapType: 'CONVERSION_LEAK_GAP',
      priority: 'P0',
      opportunityScore: 92,
      currentPosition: Number(position.toFixed(1)),
      actualCtr: Number(ctr.toFixed(4)),
      benchmarkCtr: expectedCtr,
      impressions,
      clicks,
      projectedExtraClicks: Math.round(clicks * 0.35),
      projectedLeadConversions: Math.round(clicks * 0.25),
      rootCause: `Capturing steady traffic (${clicks} clicks, ${impressions} impressions), but lacks sticky applicant lead capture or user registration magnet.`,
      marketingPlayName: 'High-Intent Visitor Lead Capture Play',
      recommendedTitle: `${query.charAt(0).toUpperCase() + query.slice(1)} — Apply Online Today | TalentXcel`,
      recommendedMetaDescription: `Looking for ${query}? Join TalentXcel to unlock verified jobs, instant hiring manager referrals, and AI Career Passport scoring.`,
      recommendedConversionHook: 'Sticky Floating Job Notification Bar + Free Resume Score Magnet',
      recommendedActions: [
        'Embed 1-click email/mobile subscription modal for new job postings in this category',
        'Display "Top Matching Companies Actively Hiring" social proof ticker',
        'Offer free instant ATS scorecard for visitors who upload their resume'
      ]
    };
  }

  // 3. Striking Distance Ranking Opportunity: Position 11 to 35 with emerging impressions
  if (position > 10 && position <= 35 && impressions >= 5) {
    const projectedExtraClicks = Math.max(2, Math.round(impressions * 0.12));
    const projectedLeadConversions = Math.max(1, Math.round(projectedExtraClicks * 0.10));

    return {
      playId: `gap_rank_${query.replace(/\s+/g, '_')}`,
      query,
      pageUrl,
      surface,
      gapType: 'RANKING_OPPORTUNITY_GAP',
      priority: 'P1',
      opportunityScore: Math.min(90, Math.round(50 + impressions * 1.5 - position)),
      currentPosition: Number(position.toFixed(1)),
      actualCtr: Number(ctr.toFixed(4)),
      benchmarkCtr: expectedCtr,
      impressions,
      clicks,
      projectedExtraClicks,
      projectedLeadConversions,
      rootCause: `Close to page 1 (Position ${position.toFixed(1)}). Search demand exists (${impressions} impressions). Needs internal authority boost.`,
      marketingPlayName: 'Striking Distance Page-1 Velocity Play',
      recommendedTitle: `${query.charAt(0).toUpperCase() + query.slice(1)}: Complete 2026 Guide & Listings | TalentXcel`,
      recommendedMetaDescription: `Discover verified opportunities and data for ${query}. In-depth analysis, direct employer openings, and career insights on TalentXcel.`,
      recommendedConversionHook: 'Download Full Salary & Competency Benchmark PDF',
      recommendedActions: [
        'Add contextual internal links from high-authority hubs (/news, /blog, and homepage)',
        'Expand topical depth with H2/H3 sub-headers addressing search query variations',
        'Inject breadcrumb structured data and entity schema markup'
      ]
    };
  }

  // 4. Missing Canonical / Routing Gap: Queries hitting legacy /resources/
  if (pageUrl.includes('/resources/') && impressions >= 3) {
    return {
      playId: `gap_canon_${query.replace(/\s+/g, '_')}`,
      query,
      pageUrl,
      surface: 'RESOURCES',
      gapType: 'MISSING_CANONICAL_GAP',
      priority: 'P2',
      opportunityScore: 78,
      currentPosition: Number(position.toFixed(1)),
      actualCtr: Number(ctr.toFixed(4)),
      benchmarkCtr: expectedCtr,
      impressions,
      clicks,
      projectedExtraClicks: Math.max(1, Math.round(impressions * 0.08)),
      projectedLeadConversions: 1,
      rootCause: `Query is indexing on legacy resource URL (${pageUrl}). Consolidate authority with canonical Career Blog or News guide.`,
      marketingPlayName: 'Canonical Consolidation & Authority Lift Play',
      recommendedTitle: `${query.charAt(0).toUpperCase() + query.slice(1)} Guide | TalentXcel Career Hub`,
      recommendedMetaDescription: `Master ${query} with actionable advice, real-world templates, and verified career guidance from TalentXcel.`,
      recommendedConversionHook: 'Explore 26+ In-Depth Career Guides on /blog',
      recommendedActions: [
        'Deploy 301 redirect or canonical link to corresponding /blog or /news article',
        'Update XML sitemaps to reflect the high-authority canonical route'
      ]
    };
  }

  return null;
}

/**
 * Analyzes a full array of GSC query/page rows and produces an aggregated Marketing Audit.
 */
export function analyzeFullGscDataset(rows: GscPerformanceRow[]): GscMarketingAuditSummary {
  let totalClicks = 0;
  let totalImpressions = 0;
  const surfaceClicks: Record<string, number> = {};
  const plays: MarketingActionPlay[] = [];

  rows.forEach(r => {
    totalClicks += r.clicks;
    totalImpressions += r.impressions;
    const s = detectSurfaceFromUrl(r.pageUrl);
    surfaceClicks[s] = (surfaceClicks[s] || 0) + r.clicks;

    const play = analyzeGscRow(r);
    if (play) {
      plays.push(play);
    }
  });

  // Sort plays by Opportunity Score descending
  plays.sort((a, b) => b.opportunityScore - a.opportunityScore);

  let topPerformingSurface = 'LOCATIONS';
  let maxClicks = 0;
  Object.entries(surfaceClicks).forEach(([surf, c]) => {
    if (c > maxClicks) {
      maxClicks = c;
      topPerformingSurface = surf;
    }
  });

  const ctrLossCount = plays.filter(p => p.gapType === 'CTR_LOSS_GAP').length;
  const rankingOpportunityCount = plays.filter(p => p.gapType === 'RANKING_OPPORTUNITY_GAP').length;
  const conversionLeakCount = plays.filter(p => p.gapType === 'CONVERSION_LEAK_GAP').length;

  const projectedMonthlyClickLift = plays.reduce((acc, p) => acc + p.projectedExtraClicks, 0);
  const projectedMonthlyLeadLift = plays.reduce((acc, p) => acc + p.projectedLeadConversions, 0);

  return {
    totalRows: rows.length,
    totalClicks,
    totalImpressions,
    averageCtr: totalImpressions > 0 ? Number((totalClicks / totalImpressions * 100).toFixed(2)) : 0,
    topPerformingSurface,
    detectedGapsCount: plays.length,
    ctrLossCount,
    rankingOpportunityCount,
    conversionLeakCount,
    projectedMonthlyClickLift,
    projectedMonthlyLeadLift,
    plays
  };
}
