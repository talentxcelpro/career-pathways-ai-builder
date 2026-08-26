// src/lib/seo/rankingOpportunityEngineV2.ts
// Ranking Opportunity Engine v2: Multi-factor scoring with CTR gap, freshness, conversion intent,
// cannibalization detection, and internal authority. Extends Phase 11 opportunity scorer.

export interface RankingOpportunityV2 {
  query: string;
  canonical_url: string;
  surface: string;
  gsc_average_position: number | null;      // From GSC API — NOT live SERP rank
  serp_observed_position: number | null;    // From external SERP crawl — NOT GSC average
  gsc_impressions: number;
  gsc_clicks: number;
  gsc_ctr: number;
  search_volume: number | null;             // null if unverified
  intent: string;
  days_since_update: number;
  cannibalization_flag: boolean;
  cannibalization_url: string | null;
  inventory_count: number;
  competitor_position: number | null;
  ctr_gap_score: number;
  freshness_score: number;
  conversion_intent_bonus: number;
  internal_authority_score: number;
  composite_opportunity_score: number;
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  decision: 'OPTIMIZE_EXISTING' | 'CREATE_CANONICAL' | 'CONSOLIDATE_PARENT' | 'EXCLUDE_DOORWAY' | 'MONITOR';
  decision_reason: string;
  recommended_actions: string[];
  expected_outcome: string;
}

// Expected CTR benchmarks by position (Source: Sistrix/AWR industry averages for India SERPs)
export const CTR_BENCHMARK: Record<number, number> = {
  1: 28, 2: 15, 3: 11, 4: 8, 5: 7,
  6: 5, 7: 4, 8: 3, 9: 2.5, 10: 2,
};

export function computeCtrGapScore(actualCtr: number, position: number): number {
  const roundedPos = Math.min(10, Math.max(1, Math.round(position)));
  const expected = CTR_BENCHMARK[roundedPos] ?? 1.5;
  const gap = ((actualCtr - expected) / expected) * 50 + 50;
  return Math.min(100, Math.max(0, Math.round(gap)));
}

export function computeFreshnessScore(daysSinceUpdate: number): number {
  return Math.round(100 * Math.exp(-daysSinceUpdate / 180));
}

export function computeConversionIntentBonus(intent: string): number {
  const i = intent.toLowerCase();
  if (i.includes('transactional_job') || i.includes('job-search') || i.includes('job_search')) return 25;
  if (i.includes('transactional_tool') || i.includes('ats') || i.includes('calculator')) return 20;
  if (i.includes('commercial_b2b') || i.includes('commercial_service')) return 18;
  if (i.includes('commercial')) return 15;
  if (i.includes('career_guidance') || i.includes('career-guidance')) return 10;
  if (i.includes('education') || i.includes('informational')) return 5;
  return 8;
}

function assignPriority(score: number): RankingOpportunityV2['priority'] {
  if (score >= 80) return 'P0';
  if (score >= 65) return 'P1';
  if (score >= 50) return 'P2';
  if (score >= 35) return 'P3';
  if (score >= 20) return 'P4';
  return 'P5';
}

export function scoreOpportunityV2(data: {
  query: string;
  canonical_url: string;
  surface: string;
  gsc_average_position: number | null;
  serp_observed_position: number | null;
  gsc_impressions: number;
  gsc_clicks: number;
  gsc_ctr: number;
  search_volume: number | null;
  intent: string;
  days_since_update: number;
  cannibalization_flag: boolean;
  cannibalization_url?: string | null;
  inventory_count: number;
  competitor_position: number | null;
  internal_authority_score: number;
}): RankingOpportunityV2 {
  // Anti-doorway: reject parameter URLs and thin tail
  if (/[?&]|page=|\bpage\d/i.test(data.query) || data.query.split(' ').length > 8) {
    return {
      ...data,
      cannibalization_url: data.cannibalization_url ?? null,
      ctr_gap_score: 0,
      freshness_score: 0,
      conversion_intent_bonus: 0,
      composite_opportunity_score: 0,
      priority: 'P5',
      decision: 'EXCLUDE_DOORWAY',
      decision_reason: 'Query contains URL parameters or exceeds 8 words; doorway risk score 95',
      recommended_actions: ['Consolidate into parent hub canonical URL'],
      expected_outcome: 'No indexing; reduce crawl waste',
    };
  }

  // Consolidate thin inventory
  if (data.inventory_count < 3) {
    return {
      ...data,
      cannibalization_url: data.cannibalization_url ?? null,
      ctr_gap_score: 0,
      freshness_score: computeFreshnessScore(data.days_since_update),
      conversion_intent_bonus: 0,
      composite_opportunity_score: 15,
      priority: 'P5',
      decision: 'CONSOLIDATE_PARENT',
      decision_reason: `Inventory count ${data.inventory_count} < 3; insufficient substantive data for standalone page`,
      recommended_actions: ['Merge content into parent hub', 'Add noindex until inventory grows to 10+'],
      expected_outcome: 'Prevent thin-page indexation; consolidate link equity',
    };
  }

  const pos = data.gsc_average_position ?? 50;
  const ctrGap = computeCtrGapScore(data.gsc_ctr, pos);
  const freshness = computeFreshnessScore(data.days_since_update);
  const convBonus = computeConversionIntentBonus(data.intent);
  const impressionWeight = Math.min(20, data.gsc_impressions / 10);

  const composite = Math.min(100, Math.round(
    ctrGap * 0.25 +
    freshness * 0.15 +
    convBonus * 0.20 +
    data.internal_authority_score * 0.20 +
    impressionWeight +
    (data.cannibalization_flag ? -15 : 0) +
    (data.competitor_position !== null && data.competitor_position <= 3 ? -10 : 5)
  ));

  const priority = assignPriority(composite);

  let decision: RankingOpportunityV2['decision'];
  let reason: string;
  let actions: string[];
  let outcome: string;

  if (pos <= 20 && data.gsc_impressions > 50) {
    decision = 'OPTIMIZE_EXISTING';
    reason = `Page ranks at GSC avg pos ${pos.toFixed(1)} with ${data.gsc_impressions} impressions; optimization can push to page 1`;
    actions = ['Improve title CTR hook', 'Add FAQ/HowTo schema', 'Strengthen internal links from hub pages'];
    outcome = `Target position ${Math.max(1, Math.round(pos) - 3)}, CTR +${Math.round(ctrGap * 0.1)}%`;
  } else if (data.search_volume !== null && data.search_volume > 500 && data.gsc_impressions === 0) {
    decision = 'CREATE_CANONICAL';
    reason = 'Evidenced demand with no current GSC visibility; quality gate passed; unique canonical candidate';
    actions = ['Create new pre-rendered canonical page', 'Submit to sitemap', 'Link from parent hub'];
    outcome = 'Target indexation within 60 days; initial position 20-40';
  } else if (pos > 50 || data.gsc_impressions < 10) {
    decision = 'MONITOR';
    reason = 'Below threshold for immediate action; recheck in 30 days';
    actions = ['Add to monitoring queue', 'Revisit when impressions > 50 or position < 30'];
    outcome = 'Monitor GSC for 30-day trend';
  } else {
    decision = 'OPTIMIZE_EXISTING';
    reason = 'Moderate visibility; optimization recommended';
    actions = ['Internal link refresh', 'Content freshness update'];
    outcome = 'Incremental position improvement';
  }

  return {
    ...data,
    cannibalization_url: data.cannibalization_url ?? null,
    ctr_gap_score: ctrGap,
    freshness_score: freshness,
    conversion_intent_bonus: convBonus,
    composite_opportunity_score: composite,
    priority,
    decision,
    decision_reason: reason,
    recommended_actions: actions,
    expected_outcome: outcome,
  };
}

export const SAMPLE_OPPORTUNITY_QUEUE: RankingOpportunityV2[] = [
  scoreOpportunityV2({
    query: 'content writer jobs noida',
    canonical_url: 'https://talentxcel.in/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    surface: 'JOBS',
    gsc_average_position: 6.4,
    serp_observed_position: null,
    gsc_impressions: 180,
    gsc_clicks: 14,
    gsc_ctr: 7.8,
    search_volume: 8500,
    intent: 'TRANSACTIONAL_JOB',
    days_since_update: 12,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 24,
    competitor_position: 2,
    internal_authority_score: 72,
  }),
  scoreOpportunityV2({
    query: 'marketing executive jobs noida',
    canonical_url: 'https://talentxcel.in/jobs/marketing-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    surface: 'JOBS',
    gsc_average_position: 7.2,
    serp_observed_position: null,
    gsc_impressions: 160,
    gsc_clicks: 12,
    gsc_ctr: 7.5,
    search_volume: 12000,
    intent: 'TRANSACTIONAL_JOB',
    days_since_update: 15,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 18,
    competitor_position: 1,
    internal_authority_score: 68,
  }),
  scoreOpportunityV2({
    query: 'ai recruitment platform india',
    canonical_url: 'https://talentxcel.in/mo1',
    surface: 'MO1_BUSINESS_OS',
    gsc_average_position: 8.8,
    serp_observed_position: null,
    gsc_impressions: 140,
    gsc_clicks: 11,
    gsc_ctr: 7.9,
    search_volume: 9200,
    intent: 'COMMERCIAL_B2B',
    days_since_update: 20,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 50,
    competitor_position: 2,
    internal_authority_score: 60,
  }),
  scoreOpportunityV2({
    query: 'ats resume builder for software engineers',
    canonical_url: 'https://talentxcel.in/resume',
    surface: 'RESUME_ATS',
    gsc_average_position: 11.2,
    serp_observed_position: null,
    gsc_impressions: 120,
    gsc_clicks: 6,
    gsc_ctr: 5.0,
    search_volume: 15000,
    intent: 'TRANSACTIONAL_TOOL',
    days_since_update: 8,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 100,
    competitor_position: 3,
    internal_authority_score: 82,
  }),
  scoreOpportunityV2({
    query: 'top engineering colleges india placement',
    canonical_url: 'https://talentxcel.in/colleges',
    surface: 'COLLEGES',
    gsc_average_position: 14.5,
    serp_observed_position: null,
    gsc_impressions: 95,
    gsc_clicks: 4,
    gsc_ctr: 4.2,
    search_volume: 85000,
    intent: 'INFORMATIONAL_EDUCATION',
    days_since_update: 30,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 200,
    competitor_position: 3,
    internal_authority_score: 78,
  }),
  scoreOpportunityV2({
    query: 'how to become a data scientist india',
    canonical_url: 'https://talentxcel.in/roles/data-scientist',
    surface: 'ROLE_GUIDES',
    gsc_average_position: 18.2,
    serp_observed_position: null,
    gsc_impressions: 75,
    gsc_clicks: 3,
    gsc_ctr: 4.0,
    search_volume: 32000,
    intent: 'CAREER_GUIDANCE',
    days_since_update: 45,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 30,
    competitor_position: 4,
    internal_authority_score: 55,
  }),
  scoreOpportunityV2({
    query: 'software engineer jobs bangalore',
    canonical_url: 'https://talentxcel.in/jobs/software-engineer/bangalore',
    surface: 'JOBS',
    gsc_average_position: 47.0,
    serp_observed_position: null,
    gsc_impressions: 120,
    gsc_clicks: 8,
    gsc_ctr: 6.7,
    search_volume: 45000,
    intent: 'TRANSACTIONAL_JOB',
    days_since_update: 5,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 15,
    competitor_position: 1,
    internal_authority_score: 45,
  }),
  scoreOpportunityV2({
    query: 'professional networking platform india',
    canonical_url: 'https://talentxcel.in/network',
    surface: 'PROFESSIONAL_NETWORK',
    gsc_average_position: 22.5,
    serp_observed_position: null,
    gsc_impressions: 55,
    gsc_clicks: 2,
    gsc_ctr: 3.6,
    search_volume: 18000,
    intent: 'COMMERCIAL_B2B',
    days_since_update: 60,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 500,
    competitor_position: 1,
    internal_authority_score: 70,
  }),
  scoreOpportunityV2({
    query: 'salary calculator india 2026',
    canonical_url: 'https://talentxcel.in/tools/salary-calculator',
    surface: 'CAREER_TOOLS',
    gsc_average_position: 35.0,
    serp_observed_position: null,
    gsc_impressions: 40,
    gsc_clicks: 1,
    gsc_ctr: 2.5,
    search_volume: 120000,
    intent: 'TRANSACTIONAL_TOOL',
    days_since_update: 90,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 10,
    competitor_position: 2,
    internal_authority_score: 15,
  }),
  scoreOpportunityV2({
    query: 'career transition developer product manager india',
    canonical_url: 'https://talentxcel.in/career-map',
    surface: 'CAREER_MAP',
    gsc_average_position: 28.0,
    serp_observed_position: null,
    gsc_impressions: 30,
    gsc_clicks: 1,
    gsc_ctr: 3.3,
    search_volume: 12000,
    intent: 'CAREER_GUIDANCE',
    days_since_update: 25,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 20,
    competitor_position: null,
    internal_authority_score: 62,
  }),
  scoreOpportunityV2({
    query: 'digital marketing course india certification',
    canonical_url: 'https://talentxcel.in/learning/digital-marketing',
    surface: 'LEARNING_COURSES',
    gsc_average_position: 19.5,
    serp_observed_position: null,
    gsc_impressions: 48,
    gsc_clicks: 2,
    gsc_ctr: 4.2,
    search_volume: 48000,
    intent: 'TRANSACTIONAL_TOOL',
    days_since_update: 55,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 8,
    competitor_position: 1,
    internal_authority_score: 38,
  }),
  // Doorway exclusion example
  scoreOpportunityV2({
    query: 'jobs noida uttar pradesh india 2026 latest freshers experienced openings hiring',
    canonical_url: 'https://talentxcel.in/jobs?page=3&location=noida&exp=freshers',
    surface: 'JOBS',
    gsc_average_position: null,
    serp_observed_position: null,
    gsc_impressions: 0,
    gsc_clicks: 0,
    gsc_ctr: 0,
    search_volume: null,
    intent: 'TRANSACTIONAL_JOB',
    days_since_update: 0,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 50,
    competitor_position: null,
    internal_authority_score: 0,
  }),
  // Consolidate parent example
  scoreOpportunityV2({
    query: 'obscure niche certification course online india',
    canonical_url: 'https://talentxcel.in/learning/niche-certification',
    surface: 'LEARNING_COURSES',
    gsc_average_position: null,
    serp_observed_position: null,
    gsc_impressions: 0,
    gsc_clicks: 0,
    gsc_ctr: 0,
    search_volume: null,
    intent: 'INFORMATIONAL_EDUCATION',
    days_since_update: 120,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 1,
    competitor_position: null,
    internal_authority_score: 5,
  }),
  scoreOpportunityV2({
    query: 'internship bangalore 2026 engineering students',
    canonical_url: 'https://talentxcel.in/jobs/internships',
    surface: 'JOBS',
    gsc_average_position: null,
    serp_observed_position: null,
    gsc_impressions: 0,
    gsc_clicks: 0,
    gsc_ctr: 0,
    search_volume: 35000,
    intent: 'TRANSACTIONAL_JOB',
    days_since_update: 3,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 45,
    competitor_position: 4,
    internal_authority_score: 40,
  }),
  scoreOpportunityV2({
    query: 'ai products leaderboard india rankings',
    canonical_url: 'https://talentxcel.in/rankings',
    surface: 'BIDDER_RANKINGS',
    gsc_average_position: null,
    serp_observed_position: null,
    gsc_impressions: 0,
    gsc_clicks: 0,
    gsc_ctr: 0,
    search_volume: 7800,
    intent: 'INFORMATIONAL_EDUCATION',
    days_since_update: 1,
    cannibalization_flag: false,
    cannibalization_url: null,
    inventory_count: 30,
    competitor_position: null,
    internal_authority_score: 55,
  }),
];
