// src/lib/growth-os/opportunityScoreEngine.ts
// TalentXcel Search Market Opportunity Score Engine V3
// A "search market" is a career entity + intent cluster (Role × Location × Intent)
// that TalentXcel can own as a distinct organic acquisition channel.

export type SearchIntent = 'JOBS' | 'SALARY' | 'RESUME' | 'CAREER_PATH' | 'SKILLS' | 'COMPANIES' | 'INTERVIEW' | 'COURSES';
export type ExperienceLevel = 'FRESHER' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'ANY';
export type MarketPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'WATCH' | 'IGNORE';

export interface SearchMarket {
  marketId: string;
  role: string;
  location: string;
  country: string;
  intent: SearchIntent;
  experienceLevel: ExperienceLevel;
  weeklyImpressions: number;
  weeklyClicks: number;
  avgPosition: number;
  ctr: number;
  activeJobCount: number;
  hasSalaryData: boolean;
  hasSkillData: boolean;
  impressionGrowthWoW: number;
  weeklyConversions: number;
  opportunityScore: number;
  priorityBand: MarketPriority;
  recommendedAction: string;
  estimatedDailyClickPotential: number;
}

// CTR curve at each position (based on industry averages for job search SERPs)
const CTR_CURVE: Record<number, number> = {
  1: 28.5, 2: 15.7, 3: 11.0, 4: 8.0, 5: 6.3,
  6: 4.8, 7: 3.7, 8: 2.9, 9: 2.3, 10: 1.9,
};

function getCtrAtPosition(pos: number): number {
  if (pos <= 0) return 0;
  if (pos <= 10) return CTR_CURVE[Math.round(pos)] ?? 1.9;
  if (pos <= 20) return 0.5 + (20 - pos) * 0.05;
  return 0.1;
}

export function scoreSearchMarket(
  market: Omit<SearchMarket, 'opportunityScore' | 'priorityBand' | 'recommendedAction' | 'estimatedDailyClickPotential'>
): SearchMarket {
  // 1. Search Demand (0–100): log-normalized impression volume
  const searchDemand = Math.min(100, Math.log10(Math.max(1, market.weeklyImpressions)) / Math.log10(50000) * 100);

  // 2. Position Opportunity (0–100): pages 4–20 are highest leverage
  let positionOpportunity = 0;
  if (market.avgPosition >= 1 && market.avgPosition <= 3) positionOpportunity = 40;
  else if (market.avgPosition >= 4 && market.avgPosition <= 10) positionOpportunity = 100;
  else if (market.avgPosition >= 11 && market.avgPosition <= 20) positionOpportunity = 85;
  else if (market.avgPosition >= 21 && market.avgPosition <= 50) positionOpportunity = 55;
  else positionOpportunity = 25;

  // 3. CTR Gap (0–100): gap between expected CTR and actual
  const expectedCtr = getCtrAtPosition(Math.round(market.avgPosition));
  const ctrGap = expectedCtr > 0
    ? Math.max(0, Math.min(100, ((expectedCtr - market.ctr) / expectedCtr) * 100))
    : 0;

  // 4. Conversion Intent (0–100): conversions signal real business value
  const conversionIntent = market.weeklyConversions > 0
    ? Math.min(100, 50 + market.weeklyConversions * 5)
    : (market.intent === 'JOBS' || market.intent === 'RESUME') ? 70 : 40;

  // 5. Inventory (0–100): real job/data inventory backing the market
  const inventoryScore = Math.min(100,
    market.activeJobCount * 10 +
    (market.hasSalaryData ? 20 : 0) +
    (market.hasSkillData ? 15 : 0)
  );

  // 6. Growth Velocity (0–100): week-over-week momentum
  const growthVelocity = Math.max(0, Math.min(100, 50 + market.impressionGrowthWoW));

  // Weighted composite
  const rawScore =
    searchDemand * 0.25 +
    positionOpportunity * 0.25 +
    ctrGap * 0.20 +
    conversionIntent * 0.15 +
    inventoryScore * 0.10 +
    growthVelocity * 0.05;

  const opportunityScore = Math.min(100, Math.round(rawScore));

  // Priority band
  let priorityBand: MarketPriority;
  if (opportunityScore >= 85) priorityBand = 'P0';
  else if (opportunityScore >= 70) priorityBand = 'P1';
  else if (opportunityScore >= 55) priorityBand = 'P2';
  else if (opportunityScore >= 40) priorityBand = 'P3';
  else if (opportunityScore >= 25) priorityBand = 'WATCH';
  else priorityBand = 'IGNORE';

  // Recommended action
  let recommendedAction = '';
  if (priorityBand === 'P0') recommendedAction = `Immediate: enrich ${market.role} × ${market.location} ${market.intent} page with inventory, salary data, and internal links`;
  else if (priorityBand === 'P1') recommendedAction = `This week: strengthen ${market.role} ${market.intent} coverage for ${market.location} market`;
  else if (priorityBand === 'P2') recommendedAction = `This month: build dedicated ${market.location} ${market.role} landing asset when inventory reaches threshold`;
  else if (priorityBand === 'P3') recommendedAction = `Monitor: add to weekly GSC review queue`;
  else if (priorityBand === 'WATCH') recommendedAction = `Watch: low signal now, flag if impressions grow`;
  else recommendedAction = `Ignore: insufficient demand or competition too strong`;

  // Estimated daily click potential (if moved to position 3)
  const pos3Ctr = getCtrAtPosition(3) / 100;
  const weeklyPotential = market.weeklyImpressions * pos3Ctr;
  const estimatedDailyClickPotential = Math.round(weeklyPotential / 7);

  return { ...market, opportunityScore, priorityBand, recommendedAction, estimatedDailyClickPotential };
}

export function scoreSearchMarketBatch(
  markets: Array<Omit<SearchMarket, 'opportunityScore' | 'priorityBand' | 'recommendedAction' | 'estimatedDailyClickPotential'>>
): SearchMarket[] {
  return markets.map(scoreSearchMarket).sort((a, b) => b.opportunityScore - a.opportunityScore);
}

export function getTopSearchMarkets(markets: SearchMarket[], n: number): SearchMarket[] {
  return [...markets].sort((a, b) => b.opportunityScore - a.opportunityScore).slice(0, n);
}

export interface CountryOpportunityReport {
  country: string;
  totalImpressions: number;
  totalClicks: number;
  avgPosition: number;
  totalMarkets: number;
  highPriorityMarkets: number;
  growthTrend: 'ACCELERATING' | 'STABLE' | 'DECLINING';
  recommendedFocus: string[];
}

export function getCountryOpportunityReport(markets: SearchMarket[]): CountryOpportunityReport[] {
  const byCountry = new Map<string, SearchMarket[]>();
  for (const m of markets) {
    const group = byCountry.get(m.country) ?? [];
    group.push(m);
    byCountry.set(m.country, group);
  }
  const reports: CountryOpportunityReport[] = [];
  for (const [country, countryMarkets] of byCountry.entries()) {
    const totalImpressions = countryMarkets.reduce((a, m) => a + m.weeklyImpressions, 0);
    const totalClicks = countryMarkets.reduce((a, m) => a + m.weeklyClicks, 0);
    const avgPosition = countryMarkets.reduce((a, m) => a + m.avgPosition, 0) / countryMarkets.length;
    const highPriority = countryMarkets.filter(m => m.priorityBand === 'P0' || m.priorityBand === 'P1').length;
    const avgGrowth = countryMarkets.reduce((a, m) => a + m.impressionGrowthWoW, 0) / countryMarkets.length;
    const growthTrend: CountryOpportunityReport['growthTrend'] =
      avgGrowth > 10 ? 'ACCELERATING' : avgGrowth < -10 ? 'DECLINING' : 'STABLE';
    const topRoles = countryMarkets
      .filter(m => m.priorityBand === 'P0' || m.priorityBand === 'P1')
      .sort((a, b) => b.opportunityScore - a.opportunityScore)
      .slice(0, 3)
      .map(m => `${m.role} ${m.intent}`);
    reports.push({
      country, totalImpressions, totalClicks,
      avgPosition: Math.round(avgPosition * 10) / 10,
      totalMarkets: countryMarkets.length,
      highPriorityMarkets: highPriority,
      growthTrend,
      recommendedFocus: topRoles,
    });
  }
  return reports.sort((a, b) => b.totalImpressions - a.totalImpressions);
}
