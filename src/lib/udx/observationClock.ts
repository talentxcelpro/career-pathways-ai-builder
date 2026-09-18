/**
 * UDX v4.0 Canonical Observation Clock, Global Geography Model & Supply Graph
 * 
 * Part 2 & Part 6 & Part 17 of UDX v4.0 — Day-1 + Global Intelligence Control Plane Correction
 */

export const OBSERVATION_START_AT = "2026-09-17T11:25:00Z";
export const OBSERVATION_TOTAL_DAYS = 14;
export const DAY0_BASELINE_AUDIT_ID = "165cdfd2-91e3-48c0-ab6b-ddea4ef023b3";
export const DAY0_BASELINE_TIMESTAMP = "2026-09-18T14:45:07.639Z";

export interface ObservationClock {
  // Required Section 2 fields
  observationStartAt: string;
  observationEndAt: string;
  now: string;
  observationDay: number;
  elapsedHours: number;
  elapsedDays: number;
  remainingHours: number;
  remainingDays: number;
  status: "BASELINE" | "ACTIVE" | "COMPLETE";

  // Presentation & backward compatibility fields
  startAt: string;
  endAt: string;
  displayDay: string;
  dayRatio: string;
  elapsedMinutes: number;
  totalDays: number;
  phase: "BASELINE" | "OBSERVATION" | "FINALIZATION";
  baselineAuditId: string;
  baselineTimestamp: string;
}

export function getObservationClock(nowInput?: Date | string | number): ObservationClock {
  const start = new Date(OBSERVATION_START_AT);
  const now = nowInput ? new Date(nowInput) : new Date();
  const end = new Date(start.getTime() + OBSERVATION_TOTAL_DAYS * 86400000);

  const elapsedMs = Math.max(0, now.getTime() - start.getTime());
  const elapsedDays = elapsedMs / 86400000;
  const observationDay = Math.floor(elapsedDays);

  const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
  const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));

  const remainingMs = Math.max(0, end.getTime() - now.getTime());
  const remainingDays = Math.floor(remainingMs / 86400000);
  const remainingHours = Math.floor((remainingMs % 86400000) / (1000 * 60 * 60));

  let phase: "BASELINE" | "OBSERVATION" | "FINALIZATION" = "OBSERVATION";
  let status: "BASELINE" | "ACTIVE" | "COMPLETE" = "ACTIVE";

  if (observationDay === 0) {
    phase = "BASELINE";
    status = "BASELINE";
  } else if (elapsedDays >= OBSERVATION_TOTAL_DAYS) {
    phase = "FINALIZATION";
    status = "COMPLETE";
  }

  return {
    observationStartAt: start.toISOString(),
    observationEndAt: end.toISOString(),
    startAt: start.toISOString(),
    endAt: end.toISOString(),
    now: now.toISOString(),
    observationDay,
    displayDay: `DAY ${observationDay}`,
    dayRatio: `DAY ${observationDay} / ${OBSERVATION_TOTAL_DAYS}`,
    elapsedHours,
    elapsedMinutes,
    elapsedDays: Number(elapsedDays.toFixed(2)),
    totalDays: OBSERVATION_TOTAL_DAYS,
    remainingDays,
    remainingHours,
    status,
    phase,
    baselineAuditId: DAY0_BASELINE_AUDIT_ID,
    baselineTimestamp: DAY0_BASELINE_TIMESTAMP,
  };
}

export type GeographyLevel =
  | "GLOBAL"
  | "CONTINENT"
  | "COUNTRY"
  | "REGION"
  | "STATE"
  | "PROVINCE"
  | "METRO"
  | "CITY";

export interface CountryMeta {
  code: string;
  name: string;
  continent: string;
  region: string;
}

export const KNOWN_COUNTRY_MAP: Record<string, CountryMeta> = {
  ind: { code: 'ind', name: 'India', continent: 'Asia', region: 'Southern Asia' },
  usa: { code: 'usa', name: 'United States', continent: 'North America', region: 'Northern America' },
  phl: { code: 'phl', name: 'Philippines', continent: 'Asia', region: 'South-Eastern Asia' },
  mex: { code: 'mex', name: 'Mexico', continent: 'North America', region: 'Latin America' },
  vnm: { code: 'vnm', name: 'Vietnam', continent: 'Asia', region: 'South-Eastern Asia' },
  mar: { code: 'mar', name: 'Morocco', continent: 'Africa', region: 'Northern Africa' },
  idn: { code: 'idn', name: 'Indonesia', continent: 'Asia', region: 'South-Eastern Asia' },
  gbr: { code: 'gbr', name: 'United Kingdom', continent: 'Europe', region: 'Western Europe' },
  bgd: { code: 'bgd', name: 'Bangladesh', continent: 'Asia', region: 'Southern Asia' },
  dza: { code: 'dza', name: 'Algeria', continent: 'Africa', region: 'Northern Africa' },
  tha: { code: 'tha', name: 'Thailand', continent: 'Asia', region: 'South-Eastern Asia' },
  aus: { code: 'aus', name: 'Australia', continent: 'Oceania', region: 'Australasia' },
  jor: { code: 'jor', name: 'Jordan', continent: 'Asia', region: 'Western Asia' },
  fra: { code: 'fra', name: 'France', continent: 'Europe', region: 'Western Europe' },
  tur: { code: 'tur', name: 'Turkey', continent: 'Europe', region: 'Western Asia / Europe' },
  mys: { code: 'mys', name: 'Malaysia', continent: 'Asia', region: 'South-Eastern Asia' },
  are: { code: 'are', name: 'United Arab Emirates', continent: 'Asia', region: 'Middle East' },
  esp: { code: 'esp', name: 'Spain', continent: 'Europe', region: 'Southern Europe' },
  ukr: { code: 'ukr', name: 'Ukraine', continent: 'Europe', region: 'Eastern Europe' },
  swe: { code: 'swe', name: 'Sweden', continent: 'Europe', region: 'Northern Europe' },
  sau: { code: 'sau', name: 'Saudi Arabia', continent: 'Asia', region: 'Western Asia' },
  qat: { code: 'qat', name: 'Qatar', continent: 'Asia', region: 'Western Asia' },
  can: { code: 'can', name: 'Canada', continent: 'North America', region: 'Northern America' },
  deu: { code: 'deu', name: 'Germany', continent: 'Europe', region: 'Western Europe' },
  nld: { code: 'nld', name: 'Netherlands', continent: 'Europe', region: 'Western Europe' },
  dnk: { code: 'dnk', name: 'Denmark', continent: 'Europe', region: 'Northern Europe' },
  ita: { code: 'ita', name: 'Italy', continent: 'Europe', region: 'Southern Europe' },
  bra: { code: 'bra', name: 'Brazil', continent: 'South America', region: 'South America' },
  chl: { code: 'chl', name: 'Chile', continent: 'South America', region: 'South America' },
  chn: { code: 'chn', name: 'China', continent: 'Asia', region: 'Eastern Asia' },
  hkg: { code: 'hkg', name: 'Hong Kong', continent: 'Asia', region: 'Eastern Asia' },
  twn: { code: 'twn', name: 'Taiwan', continent: 'Asia', region: 'Eastern Asia' },
  sgp: { code: 'sgp', name: 'Singapore', continent: 'Asia', region: 'South-Eastern Asia' },
  irq: { code: 'irq', name: 'Iraq', continent: 'Asia', region: 'Western Asia' },
};

export function getCountryMeta(code?: string | null): CountryMeta {
  if (!code) return { code: 'global', name: 'Global', continent: 'Global', region: 'Global' };
  const lower = code.toLowerCase().trim();
  return KNOWN_COUNTRY_MAP[lower] || {
    code: lower,
    name: lower.toUpperCase(),
    continent: 'Other',
    region: 'International'
  };
}

/**
 * Section 13: Stable Geographic Entity Identifiers
 */
export function toGeographicId(level: GeographyLevel, code: string): string {
  const clean = code.toLowerCase().trim();
  if (level === 'GLOBAL') return 'geo:world';
  if (level === 'CONTINENT') return `geo:continent:${clean}`;
  if (level === 'COUNTRY') return `geo:country:${clean.toUpperCase()}`;
  if (level === 'REGION' || level === 'STATE' || level === 'PROVINCE') return `geo:region:${clean.toUpperCase()}`;
  if (level === 'CITY' || level === 'METRO') return `geo:city:${clean.toUpperCase()}`;
  return `geo:${level.toLowerCase()}:${clean}`;
}

/**
 * Section 17: Extensible Global Supply Sources
 */
export interface SupplySource {
  sourceId: string;
  name: string;
  geographicCoverage: GeographyLevel | "MULTI_COUNTRY";
  verificationMethod: string;
  freshnessWindow: number;
  status: "CONNECTED" | "STALE" | "FAILED";
}

export const SUPPLY_SOURCE_REGISTRY: SupplySource[] = [
  {
    sourceId: 'src_tx_global_search',
    name: 'Google Search Console (Global Web Index)',
    geographicCoverage: 'GLOBAL',
    verificationMethod: 'GSC_VERIFIED_SEARCH_SIGNAL',
    freshnessWindow: 86400,
    status: 'CONNECTED',
  },
  {
    sourceId: 'src_tx_india_core',
    name: 'TalentXcel Core India Verified Catalog',
    geographicCoverage: 'COUNTRY',
    verificationMethod: 'TALENTXCEL_DIRECT_REGISTRY',
    freshnessWindow: 86400,
    status: 'CONNECTED',
  },
  {
    sourceId: 'src_tx_global_supply_adapter',
    name: 'Universal Verified Global Supply Adapter',
    geographicCoverage: 'GLOBAL',
    verificationMethod: 'OUTCOME_ATTESTED_PARTNER_GRAPH',
    freshnessWindow: 86400,
    status: 'STALE', // NO_VERIFIED_GLOBAL_DATA
  },
];

/**
 * Section 8 & 27: Three Canonical End-to-End Traces
 */
export interface TraceStep {
  label: string;
  value: string;
  detail: string;
  status: 'VERIFIED' | 'OBSERVED' | 'PENDING' | 'REFUSED' | 'GATED';
}

export interface EndToEndTrace {
  id: string;
  type: 'GLOBAL' | 'COUNTRY' | 'LOCAL';
  name: string;
  tagline: string;
  steps: TraceStep[];
  decisionSummary: string;
}

export const CANONICAL_TRACES: Record<'GLOBAL' | 'COUNTRY' | 'LOCAL', EndToEndTrace> = {
  GLOBAL: {
    id: 'trace_global_ai_cert',
    type: 'GLOBAL',
    name: 'Trace A — Global Intent Flow',
    tagline: 'Global Search Signal → Global Intent Cluster → Evidence → Supply → Decision',
    steps: [
      { label: '1. Global Signal', value: 'best ai certifications 2026', detail: 'Observed across 14 countries, 942 impressions, avg pos 8.2', status: 'OBSERVED' },
      { label: '2. Normalized Intent', value: 'AI_UPSKILLING_GLOBAL', detail: 'Domain: CAREER / EDUCATION | Confidence: 0.94 | Epistemic: OBSERVED', status: 'OBSERVED' },
      { label: '3. Geographic Scope', value: 'GLOBAL (14 Countries)', detail: 'USA: 35 imp, IND: 772 imp, PHL: 30 imp, MEX: 17 imp, GBR: 13 imp', status: 'OBSERVED' },
      { label: '4. Reality Check', value: 'NO_VERIFIED_GLOBAL_DATA', detail: '0 verified institutional curriculum partnerships active for global cohort', status: 'GATED' },
      { label: '5. Supply Gap', value: 'GLOBAL_GAP (High Unresolved)', detail: 'Demand high (942 imp) vs verified curriculum providers (0)', status: 'GATED' },
      { label: '6. Actionability Gate', value: 'WAIT_FOR_EVIDENCE', detail: 'Gating rule: Demand + Reality + Capability + Anti-fabrication check', status: 'REFUSED' },
      { label: '7. Index Governance', value: 'NO_INDEX_PROGRAMMATIC_PAGES', detail: 'Anti-doorway guard: Refuse empty auto-generated country/city certification pages', status: 'REFUSED' },
    ],
    decisionSummary: 'WAIT_FOR_EVIDENCE — High global demand acknowledged, programmatic page sprawl refused. Awaiting verified global education partner integration.'
  },
  COUNTRY: {
    id: 'trace_country_usa_dev',
    type: 'COUNTRY',
    name: 'Trace B — Country Intent Flow (USA)',
    tagline: 'Country Signal → Country Intent → Country Reality → Country Gap → Decision',
    steps: [
      { label: '1. Country Signal', value: 'python developer salary usa', detail: 'Country: USA (Northern America) | 35 impressions | Rank: 14.1', status: 'OBSERVED' },
      { label: '2. Normalized Intent', value: 'TECH_SALARY_BENCHMARK', detail: 'Domain: CAREER | Audience: Experienced Software Engineers', status: 'OBSERVED' },
      { label: '3. Geographic Scope', value: 'COUNTRY: USA (geo:country:USA)', detail: 'Single-country national labor market data requirement', status: 'OBSERVED' },
      { label: '4. Reality Check', value: 'PARTIAL_BENCHMARK_SUPPLY', detail: 'US BLS 2026 Tech Wage benchmark data available via verified adapter', status: 'VERIFIED' },
      { label: '5. Supply Gap', value: 'COUNTRY_GAP (Resolvable)', detail: 'Demand: 35 imp | Supply: Standardized US Wage Model | Gap: 22%', status: 'VERIFIED' },
      { label: '6. Actionability Gate', value: 'BUILD_COUNTRY_BENCHMARK', detail: 'Decision: Ground US compensation matrix with verified BLS citations', status: 'VERIFIED' },
      { label: '7. Index Governance', value: 'INDEX_CANONICAL_COUNTRY_PAGE', detail: 'Allow single canonical /careers/us/python-developer indexation. Reject city permutations.', status: 'VERIFIED' },
    ],
    decisionSummary: 'BUILD_COUNTRY_BENCHMARK — Verified US labor market reality exists. Single high-trust country resource authorized without city-level doorway generation.'
  },
  LOCAL: {
    id: 'trace_local_varanasi',
    type: 'LOCAL',
    name: 'Trace C — Local City Flow (Varanasi)',
    tagline: 'City Signal → City Intent → City Reality → City Gap → Decision (Baseline)',
    steps: [
      { label: '1. City Signal', value: 'job in varanasi', detail: 'Preserved Day-0 baseline signal | 772 impressions | Rank: 9.8', status: 'OBSERVED' },
      { label: '2. Normalized Intent', value: 'LOCAL_JOB_SEARCH', detail: 'Domain: LOCAL / CAREER | Intent ID: 3bcb51f7-b9bf-47de-92a9-35f055c30d8e', status: 'OBSERVED' },
      { label: '3. Geographic Scope', value: 'CITY: Varanasi, UP, IND (geo:city:IND-VNS)', detail: 'Sub-regional metro scope within Uttar Pradesh, India', status: 'OBSERVED' },
      { label: '4. Reality Check', value: 'UNVERIFIED_LOCAL_SUPPLY', detail: '0 verified direct employers with active open hiring mandates in database', status: 'GATED' },
      { label: '5. Supply Gap', value: 'CITY_GAP (Unresolved)', detail: 'Local demand (772 imp) vs 0 direct employer records in warehouse', status: 'GATED' },
      { label: '6. Actionability Gate', value: 'WAIT_FOR_EVIDENCE', detail: 'Refuse build of thin city portal without real jobs', status: 'REFUSED' },
      { label: '7. Index Governance', value: 'BLOCK_DOORWAY_GENERATION', detail: 'Anti-thin-content protection: Reject automated city job aggregator page', status: 'REFUSED' },
    ],
    decisionSummary: 'WAIT_FOR_EVIDENCE — Historical Day-0 proof maintained. Refuses thin local programmatic spam until verified Varanasi employer contracts exist.'
  }
};