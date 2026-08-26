// src/lib/autonomous-os/budgetAllocationEngine.ts

export interface ZeroBudgetAllocation {
  channel: string;
  recommendedEffortSharePct: number;
  expectedUserYieldPerDay: number;
  rationale: string;
}

export const ZERO_BUDGET_ALLOCATION: ZeroBudgetAllocation[] = [
  { channel: 'PRODUCT_LED_UTILITY (ATS & Salary Tools)', recommendedEffortSharePct: 40, expectedUserYieldPerDay: 14000, rationale: 'Highest observed conversion rate (23.8%) and viral shareability.' },
  { channel: 'EXTERNAL_COMMUNITY (College TPOs & B2B2C)', recommendedEffortSharePct: 30, expectedUserYieldPerDay: 12000, rationale: 'Aggregator multiplier: 1 MoU = 2,500 students in 1 day at $0 CAC.' },
  { channel: 'REFERRAL_VIRAL (Incentivized Asset Unlocks)', recommendedEffortSharePct: 15, expectedUserYieldPerDay: 4500, rationale: 'Incentivized K-factor (K = 1.05) compounds user acquisition.' },
  { channel: 'SEARCH_ORGANIC & AI DISCOVERY (GEO)', recommendedEffortSharePct: 15, expectedUserYieldPerDay: 2833, rationale: 'Compounds long-term durable organic authority without ongoing effort.' }
];
