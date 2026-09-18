/**
 * UDX v4.0 Canonical Observation Clock & Global Geography Model
 * 
 * Part 2 & Part 6 of UDX v4.0 — Day-1 + Global Intelligence Control Plane Correction
 */

export const OBSERVATION_START_AT = "2026-09-17T11:25:00Z";
export const OBSERVATION_TOTAL_DAYS = 14;
export const DAY0_BASELINE_AUDIT_ID = "165cdfd2-91e3-48c0-ab6b-ddea4ef023b3";

export interface ObservationClock {
  startAt: string;
  endAt: string;
  now: string;
  observationDay: number;
  displayDay: string;
  dayRatio: string;
  elapsedHours: number;
  elapsedMinutes: number;
  elapsedDays: number;
  totalDays: number;
  remainingDays: number;
  remainingHours: number;
  phase: "BASELINE" | "OBSERVATION" | "FINALIZATION";
  baselineAuditId: string;
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
  if (observationDay === 0) phase = "BASELINE";
  if (elapsedDays >= OBSERVATION_TOTAL_DAYS) phase = "FINALIZATION";

  return {
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
    phase,
    baselineAuditId: DAY0_BASELINE_AUDIT_ID
  };
}

export type GeographyLevel =
  | "GLOBAL"
  | "CONTINENT"
  | "REGION"
  | "COUNTRY"
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