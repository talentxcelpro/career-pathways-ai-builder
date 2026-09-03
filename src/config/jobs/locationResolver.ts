// src/config/jobs/locationResolver.ts
// Unified Location Resolver for TalentXcel Global 100K Job Network
// Seamlessly resolves India and International slugs, checks live inventory thresholds, and provides geographic metadata

import { INDIAN_CITIES, GLOBAL_HUBS, type CityConfig } from './locations';
import { getCountryByCode, GLOBAL_COUNTRIES, type CountryMetadata } from './countriesData';

export interface ResolvedGlobalLocation {
  countryCode: string;
  countryName: string;
  countryMetadata?: CountryMetadata;
  cityName: string;
  citySlug: string;
  stateOrRegion: string;
  tier: number;
  isIndia: boolean;
  canonicalPathPrefix: string;
}

// Fast hash map of Indian city slugs
const INDIA_SLUG_MAP: Map<string, CityConfig> = new Map();
INDIAN_CITIES.forEach((c) => INDIA_SLUG_MAP.set(c.slug.toLowerCase(), c));

// Fast hash map of Global hub slugs
const GLOBAL_HUB_MAP: Map<string, CityConfig> = new Map();
GLOBAL_HUBS.forEach((c) => GLOBAL_HUB_MAP.set(`${c.country.toLowerCase()}/${c.slug.toLowerCase()}`, c));

/**
 * Resolves any incoming country + city slug pair or standalone India city slug
 */
export function resolveGlobalLocation(
  countryParam?: string,
  cityParam?: string
): ResolvedGlobalLocation | null {
  // Case A: Country is provided (e.g. /jobs/.../gb/london or /jobs/.../ae/dubai or /jobs/.../in/bangalore)
  if (countryParam && cityParam) {
    const cCode = countryParam.toLowerCase();
    const citySlug = cityParam.toLowerCase();
    const countryMeta = getCountryByCode(cCode);

    if (cCode === 'in' || cCode === 'india') {
      const city = INDIA_SLUG_MAP.get(citySlug);
      return {
        countryCode: 'in',
        countryName: 'India',
        countryMetadata: countryMeta,
        cityName: city?.name || formatCitySlugToName(citySlug),
        citySlug,
        stateOrRegion: city?.state || 'India',
        tier: city?.tier || 2,
        isIndia: true,
        canonicalPathPrefix: `/jobs`, // India uses short canonical /jobs/:role/:exp/:city
      };
    }

    // International location
    const hubKey = `${cCode}/${citySlug}`;
    const hub = GLOBAL_HUB_MAP.get(hubKey);

    return {
      countryCode: cCode,
      countryName: countryMeta?.name || cCode.toUpperCase(),
      countryMetadata: countryMeta,
      cityName: hub?.name || formatCitySlugToName(citySlug),
      citySlug,
      stateOrRegion: hub?.state || countryMeta?.name || '',
      tier: hub?.tier || countryMeta?.tier || 2,
      isIndia: false,
      canonicalPathPrefix: `/jobs`,
    };
  }

  // Case B: Standalone city provided (defaults to India per canonical architecture)
  if (cityParam && !countryParam) {
    const citySlug = cityParam.toLowerCase();
    const city = INDIA_SLUG_MAP.get(citySlug);

    if (city) {
      return {
        countryCode: 'in',
        countryName: 'India',
        countryMetadata: getCountryByCode('in'),
        cityName: city.name,
        citySlug,
        stateOrRegion: city.state,
        tier: city.tier,
        isIndia: true,
        canonicalPathPrefix: `/jobs`,
      };
    }

    // Check if it matches a global hub
    const matchedGlobal = GLOBAL_HUBS.find((h) => h.slug.toLowerCase() === citySlug);
    if (matchedGlobal) {
      const cCode = matchedGlobal.country.toLowerCase();
      return {
        countryCode: cCode,
        countryName: getCountryByCode(cCode)?.name || cCode.toUpperCase(),
        countryMetadata: getCountryByCode(cCode),
        cityName: matchedGlobal.name,
        citySlug,
        stateOrRegion: matchedGlobal.state,
        tier: matchedGlobal.tier,
        isIndia: false,
        canonicalPathPrefix: `/jobs`,
      };
    }

    return {
      countryCode: 'in',
      countryName: 'India',
      countryMetadata: getCountryByCode('in'),
      cityName: formatCitySlugToName(citySlug),
      citySlug,
      stateOrRegion: 'India',
      tier: 2,
      isIndia: true,
      canonicalPathPrefix: `/jobs`,
    };
  }

  return null;
}

function formatCitySlugToName(slug: string): string {
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
