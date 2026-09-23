/**
 * TalentXcel Location Search Engine
 * Fast in-memory search over the 1,194-location corpus from JOB_LOCATIONS.
 * Builds a normalized index on first use (lazy initialization).
 */

import { JOB_LOCATIONS } from './locations';

export interface LocationSearchResult {
  slug: string;
  cityName: string;
  stateName?: string;
  countryCode: string;
  canonical: string;
  displayLabel: string;
  flag: string;
  tier: number;
  score: number;
  matchedOn: string;
}

// Country flag map
const COUNTRY_FLAGS: Record<string, string> = {
  IN: '🇮🇳', US: '🇺🇸', GB: '🇬🇧', AU: '🇦🇺', CA: '🇨🇦', SG: '🇸🇬',
  DE: '🇩🇪', FR: '🇫🇷', JP: '🇯🇵', AE: '🇦🇪', NZ: '🇳🇿', ZA: '🇿🇦',
  NG: '🇳🇬', KE: '🇰🇪', EG: '🇪🇬', MY: '🇲🇾', TH: '🇹🇭', ID: '🇮🇩',
  PH: '🇵🇭', PK: '🇵🇰', BD: '🇧🇩', LK: '🇱🇰', NP: '🇳🇵', SA: '🇸🇦',
  QA: '🇶🇦', KW: '🇰🇼', BH: '🇧🇭', OM: '🇴🇲', BR: '🇧🇷', MX: '🇲🇽',
  SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰', CH: '🇨🇭', PL: '🇵🇱', KR: '🇰🇷',
  HK: '🇭🇰', TW: '🇹🇼', VN: '🇻🇳', NL: '🇳🇱', IE: '🇮🇪', IT: '🇮🇹',
  ES: '🇪🇸', PT: '🇵🇹', GH: '🇬🇭',
};

function getFlag(countryCode: string): string {
  return COUNTRY_FLAGS[countryCode?.toUpperCase()] ?? '🌍';
}

function buildCanonical(loc: typeof JOB_LOCATIONS[0]): string {
  const parts: string[] = [];
  if (loc.cityName) parts.push(loc.cityName);
  if (loc.stateName) parts.push(loc.stateName);
  const country = loc.countryCode === 'IN' ? 'India' : loc.countryCode;
  if (country) parts.push(country);
  return parts.join(', ');
}

function buildDisplayLabel(loc: typeof JOB_LOCATIONS[0]): string {
  if (loc.stateName) return `${loc.cityName}, ${loc.stateName}`;
  return `${loc.cityName}, ${loc.countryCode}`;
}

interface IndexEntry {
  location: typeof JOB_LOCATIONS[0];
  canonical: string;
  displayLabel: string;
  flag: string;
  tokens: string[];
}

let _index: IndexEntry[] | null = null;

function buildIndex(): IndexEntry[] {
  return JOB_LOCATIONS.map((loc): IndexEntry => {
    const canonical = buildCanonical(loc);
    const displayLabel = buildDisplayLabel(loc);
    const flag = getFlag(loc.countryCode);
    const tokens: string[] = [];
    const addToken = (s?: string | null) => { if (s) tokens.push(s.toLowerCase().trim()); };
    addToken(loc.cityName);
    addToken(loc.stateName);
    addToken(loc.countryCode);
    addToken(loc.slug);
    if (Array.isArray((loc as Record<string,unknown>).aliases)) {
      for (const alias of (loc as Record<string,unknown[]>).aliases as string[]) addToken(alias);
    }
    return { location: loc, canonical, displayLabel, flag, tokens };
  });
}

function getIndex(): IndexEntry[] {
  if (!_index) _index = buildIndex();
  return _index;
}

export function searchLocations(query: string, limit = 10): LocationSearchResult[] {
  const q = query.toLowerCase().trim();
  if (!q || q.length < 1) return [];
  const index = getIndex();
  const results: LocationSearchResult[] = [];
  for (const entry of index) {
    if (!(entry.location as Record<string,unknown>).active) continue;
    let bestScore = 0;
    let matchedOn = '';
    for (const token of entry.tokens) {
      let score = 0;
      if (token === q) score = 100;
      else if (token.startsWith(q)) score = 80 + (q.length / token.length) * 20;
      else if (token.includes(q)) score = 40 + (q.length / token.length) * 20;
      if (score > 0 && token === entry.location.cityName?.toLowerCase()) score += 15;
      if (score > bestScore) { bestScore = score; matchedOn = token; }
    }
    if (bestScore > 0) {
      const tier = (entry.location as Record<string,number>).tier ?? 3;
      const tierBoost = tier === 1 ? 10 : tier === 2 ? 5 : 0;
      const countryBoost = entry.location.countryCode === 'IN' ? 5 : 0;
      results.push({
        slug: entry.location.slug,
        cityName: entry.location.cityName,
        stateName: entry.location.stateName,
        countryCode: entry.location.countryCode,
        canonical: entry.canonical,
        displayLabel: entry.displayLabel,
        flag: entry.flag,
        tier,
        score: bestScore + tierBoost + countryBoost,
        matchedOn,
      });
    }
  }
  results.sort((a, b) => b.score !== a.score ? b.score - a.score : a.cityName.localeCompare(b.cityName));
  return results.slice(0, limit);
}

export function getLocationBySlug(slug: string): LocationSearchResult | null {
  const entry = getIndex().find((e) => e.location.slug === slug);
  if (!entry) return null;
  const tier = (entry.location as Record<string,number>).tier ?? 3;
  return { slug: entry.location.slug, cityName: entry.location.cityName, stateName: entry.location.stateName, countryCode: entry.location.countryCode, canonical: entry.canonical, displayLabel: entry.displayLabel, flag: entry.flag, tier, score: 100, matchedOn: 'slug' };
}

export function getLocationByCity(cityName: string): LocationSearchResult | null {
  const q = cityName.toLowerCase().trim();
  const entry = getIndex().find((e) => e.location.cityName?.toLowerCase() === q);
  if (!entry) return null;
  const tier = (entry.location as Record<string,number>).tier ?? 3;
  return { slug: entry.location.slug, cityName: entry.location.cityName, stateName: entry.location.stateName, countryCode: entry.location.countryCode, canonical: entry.canonical, displayLabel: entry.displayLabel, flag: entry.flag, tier, score: 100, matchedOn: 'cityName' };
}

export function getTopLocationsByCountry(countryCode: string, limit = 20): LocationSearchResult[] {
  const code = countryCode.toUpperCase();
  return getIndex()
    .filter((e) => e.location.countryCode === code && (e.location as Record<string,unknown>).active)
    .sort((a, b) => ((a.location as Record<string,number>).tier ?? 3) - ((b.location as Record<string,number>).tier ?? 3))
    .slice(0, limit)
    .map((entry) => {
      const tier = (entry.location as Record<string,number>).tier ?? 3;
      return { slug: entry.location.slug, cityName: entry.location.cityName, stateName: entry.location.stateName, countryCode: entry.location.countryCode, canonical: entry.canonical, displayLabel: entry.displayLabel, flag: entry.flag, tier, score: 100, matchedOn: 'country' };
    });
}

export function resetLocationIndex(): void {
  _index = null;
}
