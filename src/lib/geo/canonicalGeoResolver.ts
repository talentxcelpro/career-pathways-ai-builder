/**
 * src/lib/geo/canonicalGeoResolver.ts
 * TalentXcel Deterministic Canonical Location Resolution Engine
 *
 * SOLVES:
 * 1. Substring false positives (e.g. `ILIKE '%patna%'` matching `Visakhapatnam`).
 * 2. Alias undercounting (e.g. `Bengaluru` vs `bangalore`, `Chhatrapati Sambhajinagar` vs `aurangabad`).
 * 3. Multi-city location strings (`"Bengaluru, Mumbai"`) — resolves all genuine cities without double-counting within the same city.
 * 4. Remote / National (`Remote`, `India`, `PAN India`, `Hybrid`) — never misclassified as a specific city.
 * 5. State/Country corruption (`Bengaluru → Maharashtra`, `Gurugram → Karnataka`) — returns authoritative state & country without mutating raw job records.
 *
 * @version 1.0.0
 */

import { CITY_REGISTRY_ALL, type CityRecord } from './cityRegistry';
import { INDIAN_100_EMPLOYMENT_CENTRES } from '../../config/jobs/indianLocationsTaxonomy';

export type LocationType =
  | 'CITY'
  | 'REMOTE'
  | 'NATIONAL'
  | 'HYBRID'
  | 'INTERNATIONAL'
  | 'UNKNOWN';

export type ResolutionConfidence =
  | 'EXACT'
  | 'ALIAS'
  | 'TOKEN'
  | 'MULTI_CITY'
  | 'NON_CITY'
  | 'UNRESOLVED';

export type ResolutionMethod =
  | 'CANONICAL_SLUG'
  | 'CANONICAL_NAME'
  | 'EXPLICIT_ALIAS'
  | 'WORD_BOUNDARY_TOKEN'
  | 'NON_CITY_CLASSIFIER'
  | 'INTERNATIONAL_CITY'
  | 'NONE';

export interface ResolvedCityMatch {
  canonicalCity: string;
  canonicalSlug: string;
  canonicalState: string;
  countryCode: string;
  confidence: ResolutionConfidence;
  method: ResolutionMethod;
}

export interface LocationResolutionResult {
  rawLocation: string;
  locationType: LocationType;
  primary: ResolvedCityMatch | null;
  /** All genuine cities resolved from a multi-city string (deduplicated by canonicalSlug). */
  allCities: ResolvedCityMatch[];
  isMultiCity: boolean;
  confidence: ResolutionConfidence;
  method: ResolutionMethod;
}

interface CanonicalEntry {
  slug: string;
  canonicalName: string;
  stateName: string;
  countryCode: string;
  aliases: string[];
}

const REMOTE_TERMS = new Set([
  'remote',
  'remote - india',
  'india - remote',
  'remote, india',
  'remote, in',
  'work from home',
  'wfh',
  'anywhere',
]);

const NATIONAL_TERMS = new Set([
  'india',
  'pan india',
  'pan-india',
  'all india',
  'across india',
]);

const HYBRID_TERMS = new Set(['hybrid']);

// Authoritative international cities observed in inventory (never mapped to Indian cities)
const INTERNATIONAL_CITIES: Record<string, { name: string; state: string; country: string }> = {
  dubai: { name: 'Dubai', state: 'Dubai', country: 'AE' },
  'abu dhabi': { name: 'Abu Dhabi', state: 'Abu Dhabi', country: 'AE' },
  sharjah: { name: 'Sharjah', state: 'Sharjah', country: 'AE' },
  riyadh: { name: 'Riyadh', state: 'Riyadh Province', country: 'SA' },
  doha: { name: 'Doha', state: 'Ad Dawhah', country: 'QA' },
  muscat: { name: 'Muscat', state: 'Muscat Governorate', country: 'OM' },
  austin: { name: 'Austin', state: 'Texas', country: 'US' },
  'new york': { name: 'New York', state: 'New York', country: 'US' },
  seattle: { name: 'Seattle', state: 'Washington', country: 'US' },
  'san francisco': { name: 'San Francisco', state: 'California', country: 'US' },
  'san mateo': { name: 'San Mateo', state: 'California', country: 'US' },
  london: { name: 'London', state: 'England', country: 'GB' },
  dublin: { name: 'Dublin', state: 'Leinster', country: 'IE' },
  munich: { name: 'Munich', state: 'Bavaria', country: 'DE' },
  berlin: { name: 'Berlin', state: 'Berlin', country: 'DE' },
  amsterdam: { name: 'Amsterdam', state: 'North Holland', country: 'NL' },
  singapore: { name: 'Singapore', state: 'Singapore', country: 'SG' },
  sydney: { name: 'Sydney', state: 'New South Wales', country: 'AU' },
  toronto: { name: 'Toronto', state: 'Ontario', country: 'CA' },
  nairobi: { name: 'Nairobi', state: 'Nairobi County', country: 'KE' },
  lagos: { name: 'Lagos', state: 'Lagos State', country: 'NG' },
  'cape town': { name: 'Cape Town', state: 'Western Cape', country: 'ZA' },
  johannesburg: { name: 'Johannesburg', state: 'Gauteng', country: 'ZA' },
  kigali: { name: 'Kigali', state: 'Kigali Province', country: 'RW' },
  cairo: { name: 'Cairo', state: 'Cairo Governorate', country: 'EG' },
};

// Authoritative regional aliases (supplements cityRegistry + indianLocationsTaxonomy)
const EXTRA_ALIAS_TO_SLUG: Record<string, string> = {
  bengaluru: 'bangalore',
  bangalore: 'bangalore',
  gurgaon: 'gurugram',
  gurugram: 'gurugram',
  'new delhi': 'delhi',
  'delhi ncr': 'delhi',
  ncr: 'delhi',
  'chhatrapati sambhajinagar': 'aurangabad',
  'hubballi-dharwad': 'hubballi',
  hubli: 'hubballi',
  dharwad: 'hubballi',
  trivandrum: 'thiruvananthapuram',
  cochin: 'kochi',
  ernakulam: 'kochi',
  mysore: 'mysuru',
  baroda: 'vadodara',
  vizag: 'visakhapatnam',
  bombay: 'mumbai',
  madras: 'chennai',
  calcutta: 'kolkata',
  poona: 'pune',
  mangalore: 'mangaluru',
  belgaum: 'belagavi',
  pondicherry: 'puducherry',
  trichy: 'tiruchirappalli',
  calicut: 'kozhikode',
  secunderabad: 'hyderabad',
};

// Build unified canonical index once
const CANONICAL_BY_SLUG = new Map<string, CanonicalEntry>();
const EXACT_NAME_TO_SLUG = new Map<string, string>();
const ALIAS_TO_SLUG = new Map<string, string>();

function registerEntry(entry: CanonicalEntry): void {
  if (!CANONICAL_BY_SLUG.has(entry.slug)) {
    CANONICAL_BY_SLUG.set(entry.slug, entry);
  }
  EXACT_NAME_TO_SLUG.set(normalizeText(entry.canonicalName), entry.slug);
  EXACT_NAME_TO_SLUG.set(normalizeText(entry.slug.replace(/-/g, ' ')), entry.slug);
  for (const alias of entry.aliases) {
    const norm = normalizeText(alias);
    if (norm && !EXACT_NAME_TO_SLUG.has(norm) && !ALIAS_TO_SLUG.has(norm)) {
      ALIAS_TO_SLUG.set(norm, entry.slug);
    }
  }
}

export function normalizeText(input: string): string {
  return input
    .normalize('NFKC')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. Register Wave 1 from cityRegistry.ts
for (const c of CITY_REGISTRY_ALL) {
  registerEntry({
    slug: c.slug,
    canonicalName: c.canonicalName,
    stateName: c.stateName,
    countryCode: c.countryCode,
    aliases: c.aliases,
  });
}

// 2. Register remaining Indian employment centres from indianLocationsTaxonomy.ts
for (const c of INDIAN_100_EMPLOYMENT_CENTRES) {
  const normSlug = EXTRA_ALIAS_TO_SLUG[normalizeText(c.slug)] || c.slug;
  if (normSlug === 'remote' || normSlug === 'pan-india') continue;
  if (!CANONICAL_BY_SLUG.has(normSlug)) {
    registerEntry({
      slug: normSlug,
      canonicalName: c.name,
      stateName: c.state,
      countryCode: 'IN',
      aliases: [...c.aliases],
    });
  } else {
    // Merge aliases onto existing canonical entry
    const existing = CANONICAL_BY_SLUG.get(normSlug)!;
    for (const a of c.aliases) {
      const norm = normalizeText(a);
      if (norm && !EXACT_NAME_TO_SLUG.has(norm) && !ALIAS_TO_SLUG.has(norm)) {
        ALIAS_TO_SLUG.set(norm, normSlug);
      }
    }
  }
}

// 3. Apply explicit alias overrides
for (const [alias, slug] of Object.entries(EXTRA_ALIAS_TO_SLUG)) {
  if (CANONICAL_BY_SLUG.has(slug)) {
    ALIAS_TO_SLUG.set(normalizeText(alias), slug);
  }
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Word-boundary match check — NEVER matches `patna` inside `Visakhapatnam`.
 */
function hasWordBoundaryMatch(haystack: string, needle: string): boolean {
  if (!needle) return false;
  const pattern = new RegExp(`(?:^|[^a-z0-9])${escapeRegex(needle)}(?:$|[^a-z0-9])`, 'i');
  return pattern.test(haystack);
}

function resolveSingleToken(token: string): ResolvedCityMatch | null {
  const norm = normalizeText(token);
  if (!norm) return null;

  const slugAttempt = norm.replace(/\s+/g, '-');
  if (CANONICAL_BY_SLUG.has(slugAttempt)) {
    const e = CANONICAL_BY_SLUG.get(slugAttempt)!;
    return {
      canonicalCity: e.canonicalName,
      canonicalSlug: e.slug,
      canonicalState: e.stateName,
      countryCode: e.countryCode,
      confidence: 'EXACT',
      method: 'CANONICAL_SLUG',
    };
  }

  if (EXACT_NAME_TO_SLUG.has(norm)) {
    const e = CANONICAL_BY_SLUG.get(EXACT_NAME_TO_SLUG.get(norm)!)!;
    return {
      canonicalCity: e.canonicalName,
      canonicalSlug: e.slug,
      canonicalState: e.stateName,
      countryCode: e.countryCode,
      confidence: 'EXACT',
      method: 'CANONICAL_NAME',
    };
  }

  if (ALIAS_TO_SLUG.has(norm)) {
    const e = CANONICAL_BY_SLUG.get(ALIAS_TO_SLUG.get(norm)!)!;
    return {
      canonicalCity: e.canonicalName,
      canonicalSlug: e.slug,
      canonicalState: e.stateName,
      countryCode: e.countryCode,
      confidence: 'ALIAS',
      method: 'EXPLICIT_ALIAS',
    };
  }

  return null;
}

/**
 * Deterministically resolves a raw location string (and optional location_city)
 * into canonical city/cities, authoritative state & country, and locationType.
 * Never mutates the input; preserves rawLocation.
 */
export function resolveCanonicalLocation(
  rawLocation: string | null | undefined,
  rawCity?: string | null
): LocationResolutionResult {
  const raw = (rawCity && rawCity.trim()) || (rawLocation && rawLocation.trim()) || '';
  const fullRaw = (rawLocation && rawLocation.trim()) || raw;
  const norm = normalizeText(raw);
  const normFull = normalizeText(fullRaw);

  if (!norm) {
    return {
      rawLocation: fullRaw,
      locationType: 'UNKNOWN',
      primary: null,
      allCities: [],
      isMultiCity: false,
      confidence: 'UNRESOLVED',
      method: 'NONE',
    };
  }

  // 1. Check Remote / National / Hybrid first (never classify as a city)
  if (REMOTE_TERMS.has(norm) || (normFull.startsWith('remote') && !normFull.includes(','))) {
    return {
      rawLocation: fullRaw,
      locationType: 'REMOTE',
      primary: null,
      allCities: [],
      isMultiCity: false,
      confidence: 'NON_CITY',
      method: 'NON_CITY_CLASSIFIER',
    };
  }

  if (NATIONAL_TERMS.has(norm)) {
    return {
      rawLocation: fullRaw,
      locationType: 'NATIONAL',
      primary: null,
      allCities: [],
      isMultiCity: false,
      confidence: 'NON_CITY',
      method: 'NON_CITY_CLASSIFIER',
    };
  }

  if (HYBRID_TERMS.has(norm)) {
    return {
      rawLocation: fullRaw,
      locationType: 'HYBRID',
      primary: null,
      allCities: [],
      isMultiCity: false,
      confidence: 'NON_CITY',
      method: 'NON_CITY_CLASSIFIER',
    };
  }

  // 2. Direct single-token resolution on rawCity or rawLocation
  const direct = resolveSingleToken(raw);
  if (direct) {
    return {
      rawLocation: fullRaw,
      locationType: 'CITY',
      primary: direct,
      allCities: [direct],
      isMultiCity: false,
      confidence: direct.confidence,
      method: direct.method,
    };
  }

  // 3. International city check
  if (INTERNATIONAL_CITIES[norm]) {
    const intl = INTERNATIONAL_CITIES[norm];
    const match: ResolvedCityMatch = {
      canonicalCity: intl.name,
      canonicalSlug: norm.replace(/\s+/g, '-'),
      canonicalState: intl.state,
      countryCode: intl.country,
      confidence: 'EXACT',
      method: 'INTERNATIONAL_CITY',
    };
    return {
      rawLocation: fullRaw,
      locationType: 'INTERNATIONAL',
      primary: match,
      allCities: [match],
      isMultiCity: false,
      confidence: 'EXACT',
      method: 'INTERNATIONAL_CITY',
    };
  }

  // 4. Multi-city or "City, State, Country" parsing (split by comma, slash, pipe, semicolon)
  const segments = normFull
    .split(/[,/|;]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  const resolvedMap = new Map<string, ResolvedCityMatch>();
  for (const seg of segments) {
    if (REMOTE_TERMS.has(seg) || NATIONAL_TERMS.has(seg) || HYBRID_TERMS.has(seg)) continue;
    const m = resolveSingleToken(seg);
    if (m && !resolvedMap.has(m.canonicalSlug)) {
      resolvedMap.set(m.canonicalSlug, m);
    }
  }

  // 5. Fallback: word-boundary scan for canonical names & explicit aliases (e.g. "Navi Mumbai" vs "Mumbai")
  if (resolvedMap.size === 0) {
    // Check longer names first so "Navi Mumbai" matches before "Mumbai"
    const candidates = Array.from(EXACT_NAME_TO_SLUG.entries()).sort(
      (a, b) => b[0].length - a[0].length
    );
    for (const [name, slug] of candidates) {
      if (hasWordBoundaryMatch(normFull, name) && !resolvedMap.has(slug)) {
        const e = CANONICAL_BY_SLUG.get(slug)!;
        resolvedMap.set(slug, {
          canonicalCity: e.canonicalName,
          canonicalSlug: e.slug,
          canonicalState: e.stateName,
          countryCode: e.countryCode,
          confidence: 'TOKEN',
          method: 'WORD_BOUNDARY_TOKEN',
        });
      }
    }
  }

  if (resolvedMap.size > 0) {
    const allCities = Array.from(resolvedMap.values());
    const isMultiCity = allCities.length > 1;
    return {
      rawLocation: fullRaw,
      locationType: 'CITY',
      primary: allCities[0],
      allCities,
      isMultiCity,
      confidence: isMultiCity ? 'MULTI_CITY' : allCities[0].confidence,
      method: allCities[0].method,
    };
  }

  return {
    rawLocation: fullRaw,
    locationType: 'UNKNOWN',
    primary: null,
    allCities: [],
    isMultiCity: false,
    confidence: 'UNRESOLVED',
    method: 'NONE',
  };
}

/**
 * Aggregates jobs by canonical city slug using job-ID deduplication.
 * Prevents double-counting within the same city and prevents substring leaks.
 */
export function aggregateJobsByCanonicalCity<
  T extends { id: string; is_active?: boolean | null; location?: string | null; location_city?: string | null }
>(jobs: readonly T[]): Map<string, T[]> {
  const byCity = new Map<string, Map<string, T>>();

  for (const job of jobs) {
    if (job.is_active !== true) continue;
    const res = resolveCanonicalLocation(job.location, job.location_city);
    if (res.locationType !== 'CITY') continue;

    for (const city of res.allCities) {
      if (!byCity.has(city.canonicalSlug)) {
        byCity.set(city.canonicalSlug, new Map());
      }
      // Job-ID deduplication within each city
      byCity.get(city.canonicalSlug)!.set(job.id, job);
    }
  }

  const result = new Map<string, T[]>();
  for (const [slug, jobMap] of byCity.entries()) {
    result.set(slug, Array.from(jobMap.values()));
  }
  return result;
}
