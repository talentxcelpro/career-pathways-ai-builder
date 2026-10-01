// src/lib/growth-os/gscSignalClassifier.ts
// TalentXcel GSC Signal Intelligence Classifier
// Classifies every GSC query/page signal into one of 10 actionable categories.
// Source of truth: live Google Search Console API data only.

export type GscSignalCategory =
  | 'WIN'
  | 'STRIKING_DISTANCE'
  | 'HIGH_IMPRESSION_LOW_CTR'
  | 'RISING_QUERY'
  | 'NEW_QUERY'
  | 'CONTENT_GAP'
  | 'DECAY'
  | 'CANNIBALIZATION'
  | 'NO_VALUE_URL'
  | 'CONVERSION_WINNER';

export interface GscRawSignal {
  query: string;
  page: string;
  impressions: number;
  clicks: number;
  ctr: number;            // as percentage e.g. 2.5 = 2.5%
  position: number;
  country?: string;
  device?: string;
  searchAppearance?: string;
  periodStart: string;    // ISO date
  periodEnd: string;
  priorImpressions?: number;
  priorClicks?: number;
  isNewThisWeek?: boolean;
  conversionEvents?: number;
}

export interface ClassifiedGscSignal extends GscRawSignal {
  primaryCategory: GscSignalCategory;
  secondaryCategories: GscSignalCategory[];
  classificationReason: string;
  opportunityScore: number;
  recommendedAction: string;
  priority: 'P0' | 'P1' | 'P2' | 'P3' | 'MONITOR' | 'KILL';
  affectedSurface: 'JOBS' | 'RESUME' | 'SALARY' | 'LEARNING' | 'COLLEGES' | 'COMPANIES' | 'CAREER_INTELLIGENCE' | 'GENERAL';
}

export interface CannibalizationGroup {
  queryIntent: string;
  competingUrls: string[];
  totalImpressions: number;
  totalClicks: number;
  recommendedCanonical: string;
}

export interface SignalDashboardSummary {
  totalQueries: number;
  byCategory: Record<GscSignalCategory, number>;
  topOpportunities: ClassifiedGscSignal[];
  topDecaying: ClassifiedGscSignal[];
  cannibalizationGroups: CannibalizationGroup[];
  newQueriesThisWeek: ClassifiedGscSignal[];
  conversionWinners: ClassifiedGscSignal[];
  totalImpressions: number;
  totalClicks: number;
  blendedCtr: number;
  avgPosition: number;
}

function detectAffectedSurface(query: string): ClassifiedGscSignal['affectedSurface'] {
  const q = query.toLowerCase();
  if (/resume|\bcv\b|ats|curriculum vitae/.test(q)) return 'RESUME';
  if (/salary|pay|compensation|ctc|lpa|package/.test(q)) return 'SALARY';
  if (/job|hiring|vacancy|opening|fresher|work|career opportunity/.test(q)) return 'JOBS';
  if (/course|learn|certification|training|\bskill\b/.test(q)) return 'LEARNING';
  if (/college|university|campus|placement/.test(q)) return 'COLLEGES';
  if (/company|companies|employer|organization|organisation/.test(q)) return 'COMPANIES';
  if (/career path|roadmap|progression|how to become/.test(q)) return 'CAREER_INTELLIGENCE';
  return 'GENERAL';
}

function computeOpportunityScore(signal: GscRawSignal, primary: GscSignalCategory): number {
  // searchDemand: normalize impressions 0–100 (log scale, capped at 10000)
  const demandRaw = Math.min(100, Math.log10(Math.max(1, signal.impressions)) / Math.log10(10000) * 100);
  // positionLeverage: highest for 4–20
  let posLeverage = 0;
  if (signal.position >= 1 && signal.position <= 3) posLeverage = 40;
  else if (signal.position >= 4 && signal.position <= 10) posLeverage = 100;
  else if (signal.position >= 11 && signal.position <= 20) posLeverage = 85;
  else if (signal.position >= 21 && signal.position <= 50) posLeverage = 50;
  else posLeverage = 20;
  // ctrGap: expected CTR at position vs actual
  const expectedCtr = signal.position <= 3 ? 15 : signal.position <= 10 ? 5 : signal.position <= 20 ? 2 : 0.5;
  const ctrGap = Math.max(0, Math.min(100, ((expectedCtr - signal.ctr) / expectedCtr) * 100));
  // conversionIntent: J signals get 100, others get 50
  const conversionIntent = (signal.conversionEvents ?? 0) > 0 ? 100 : 50;
  // velocityBonus: rising queries get up to 20 bonus
  const impressionDelta = signal.priorImpressions != null && signal.priorImpressions > 0
    ? ((signal.impressions - signal.priorImpressions) / signal.priorImpressions) * 100
    : 0;
  const velocityBonus = Math.max(0, Math.min(20, impressionDelta));

  const raw = demandRaw * 0.25 + posLeverage * 0.25 + ctrGap * 0.20 + conversionIntent * 0.15 + 50 * 0.10 + velocityBonus * 0.05;
  return Math.min(100, Math.round(raw));
}

export function classifyGscSignal(signal: GscRawSignal): ClassifiedGscSignal {
  const secondaryCategories: GscSignalCategory[] = [];
  let primaryCategory: GscSignalCategory = 'GENERAL' as GscSignalCategory; // will be overwritten
  let classificationReason = '';

  const impressionDeltaPct = signal.priorImpressions != null && signal.priorImpressions > 0
    ? ((signal.impressions - signal.priorImpressions) / signal.priorImpressions) * 100
    : 0;

  // Priority order matters — most specific/valuable first
  if ((signal.conversionEvents ?? 0) > 0) {
    primaryCategory = 'CONVERSION_WINNER';
    classificationReason = `Produced ${signal.conversionEvents} conversion event(s). High business value.`;
  } else if (signal.position <= 3 && signal.clicks > 0) {
    primaryCategory = 'WIN';
    classificationReason = `Ranking position ${signal.position.toFixed(1)} with ${signal.clicks} clicks. Defend and protect.`;
  } else if (signal.isNewThisWeek) {
    primaryCategory = 'NEW_QUERY';
    classificationReason = 'Query appeared in GSC this week for the first time.';
  } else if (impressionDeltaPct < -25 && (signal.priorImpressions ?? 0) > 50) {
    primaryCategory = 'DECAY';
    classificationReason = `Impressions dropped ${impressionDeltaPct.toFixed(1)}% week-over-week. Requires diagnosis.`;
  } else if (impressionDeltaPct > 20 && signal.impressions >= 50) {
    primaryCategory = 'RISING_QUERY';
    classificationReason = `Impressions growing ${impressionDeltaPct.toFixed(1)}% week-over-week. Capture momentum.`;
  } else if (signal.impressions >= 100 && signal.clicks === 0) {
    primaryCategory = 'CONTENT_GAP';
    classificationReason = `${signal.impressions} impressions but zero clicks. No satisfying page exists.`;
  } else if (signal.impressions >= 200 && signal.ctr < 2.0) {
    primaryCategory = 'HIGH_IMPRESSION_LOW_CTR';
    classificationReason = `${signal.impressions} impressions at ${signal.ctr.toFixed(2)}% CTR. Title/meta engineering opportunity.`;
  } else if (signal.position >= 4 && signal.position <= 20 && signal.impressions >= 50) {
    primaryCategory = 'STRIKING_DISTANCE';
    classificationReason = `Position ${signal.position.toFixed(1)} with ${signal.impressions} impressions. One enrichment cycle away from page 1.`;
  } else if (signal.impressions < 10 && signal.clicks === 0) {
    primaryCategory = 'NO_VALUE_URL';
    classificationReason = `Only ${signal.impressions} impressions and zero clicks. Audit for noindex or removal.`;
  } else {
    primaryCategory = 'STRIKING_DISTANCE'; // fallback
    classificationReason = 'General search signal. Monitor for trend development.';
  }

  // Secondary categories
  if (primaryCategory !== 'WIN' && signal.position <= 3 && signal.clicks > 0) secondaryCategories.push('WIN');
  if (primaryCategory !== 'HIGH_IMPRESSION_LOW_CTR' && signal.impressions >= 200 && signal.ctr < 2) secondaryCategories.push('HIGH_IMPRESSION_LOW_CTR');
  if (primaryCategory !== 'CONTENT_GAP' && signal.impressions >= 100 && signal.clicks === 0) secondaryCategories.push('CONTENT_GAP');

  const affectedSurface = detectAffectedSurface(signal.query);
  const opportunityScore = computeOpportunityScore(signal, primaryCategory);

  const ACTION_MAP: Record<GscSignalCategory, string> = {
    WIN: 'Defend: strengthen internal links from related hubs, monitor for CTR regression',
    STRIKING_DISTANCE: 'Enrich page: add salary data, structured data, strengthen internal authority links',
    HIGH_IMPRESSION_LOW_CTR: 'CTR engineering: rewrite title/meta, align search intent, add price/location/freshness signal',
    RISING_QUERY: 'Capture momentum: optimize existing page or create dedicated landing asset with inventory validation',
    NEW_QUERY: 'Evaluate intent: if commercial, create targeted landing asset only after inventory validation',
    CONTENT_GAP: 'Build missing asset: create page with real inventory; quality threshold must be met first',
    DECAY: 'Diagnose: check page freshness, crawl status, canonical, competitor SERP changes',
    CANNIBALIZATION: 'Consolidate: identify strongest URL, 301 others or strengthen canonical. Never leave duplicates competing',
    NO_VALUE_URL: 'Audit for removal: validate if noindex or 410 is appropriate. Do not keep thin pages indexed',
    CONVERSION_WINNER: 'Scale winner: strengthen URL, add inventory, improve CTA, expand internal linking',
  };

  const PRIORITY_MAP: Record<GscSignalCategory, ClassifiedGscSignal['priority']> = {
    CONVERSION_WINNER: 'P0',
    HIGH_IMPRESSION_LOW_CTR: 'P0',
    CONTENT_GAP: 'P0',
    STRIKING_DISTANCE: 'P1',
    RISING_QUERY: 'P1',
    WIN: 'P1',
    DECAY: 'P1',
    NEW_QUERY: 'P2',
    CANNIBALIZATION: 'P2',
    NO_VALUE_URL: 'KILL',
  };

  return {
    ...signal,
    primaryCategory,
    secondaryCategories,
    classificationReason,
    opportunityScore,
    recommendedAction: ACTION_MAP[primaryCategory],
    priority: PRIORITY_MAP[primaryCategory],
    affectedSurface,
  };
}

export function classifyGscSignalBatch(signals: GscRawSignal[]): ClassifiedGscSignal[] {
  // Detect cannibalization: same query mapped to 2+ different pages
  const queryPageMap = new Map<string, string[]>();
  for (const s of signals) {
    const pages = queryPageMap.get(s.query) ?? [];
    if (!pages.includes(s.page)) pages.push(s.page);
    queryPageMap.set(s.query, pages);
  }
  const cannibalized = new Set<string>();
  for (const [query, pages] of queryPageMap.entries()) {
    if (pages.length > 1) cannibalized.add(query);
  }

  const classified = signals.map(s => {
    const result = classifyGscSignal(s);
    if (cannibalized.has(s.query) && result.primaryCategory !== 'CANNIBALIZATION') {
      result.secondaryCategories.push('CANNIBALIZATION');
    }
    return result;
  });

  return classified.sort((a, b) => b.opportunityScore - a.opportunityScore);
}

export function buildSignalDashboardSummary(classified: ClassifiedGscSignal[]): SignalDashboardSummary {
  const byCategory = {
    WIN: 0, STRIKING_DISTANCE: 0, HIGH_IMPRESSION_LOW_CTR: 0, RISING_QUERY: 0,
    NEW_QUERY: 0, CONTENT_GAP: 0, DECAY: 0, CANNIBALIZATION: 0, NO_VALUE_URL: 0, CONVERSION_WINNER: 0,
  } as Record<GscSignalCategory, number>;

  const queryIntentMap = new Map<string, string[]>();
  let totalImpressions = 0, totalClicks = 0, positionSum = 0;

  for (const s of classified) {
    byCategory[s.primaryCategory]++;
    totalImpressions += s.impressions;
    totalClicks += s.clicks;
    positionSum += s.position;
    const pages = queryIntentMap.get(s.query) ?? [];
    if (!pages.includes(s.page)) pages.push(s.page);
    queryIntentMap.set(s.query, pages);
  }

  const cannibalizationGroups: CannibalizationGroup[] = [];
  for (const [query, pages] of queryIntentMap.entries()) {
    if (pages.length > 1) {
      const matching = classified.filter(s => s.query === query);
      const totalImp = matching.reduce((a, s) => a + s.impressions, 0);
      const totalClk = matching.reduce((a, s) => a + s.clicks, 0);
      // Recommended canonical: the page with most clicks
      const best = matching.sort((a, b) => b.clicks - a.clicks)[0];
      cannibalizationGroups.push({
        queryIntent: query, competingUrls: pages,
        totalImpressions: totalImp, totalClicks: totalClk,
        recommendedCanonical: best.page,
      });
    }
  }

  return {
    totalQueries: classified.length,
    byCategory,
    topOpportunities: classified.filter(s => s.priority === 'P0' || s.priority === 'P1').slice(0, 10),
    topDecaying: classified.filter(s => s.primaryCategory === 'DECAY').slice(0, 10),
    cannibalizationGroups: cannibalizationGroups.slice(0, 20),
    newQueriesThisWeek: classified.filter(s => s.primaryCategory === 'NEW_QUERY').slice(0, 20),
    conversionWinners: classified.filter(s => s.primaryCategory === 'CONVERSION_WINNER'),
    totalImpressions,
    totalClicks,
    blendedCtr: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
    avgPosition: classified.length > 0 ? positionSum / classified.length : 0,
  };
}
