// src/lib/geography/resolver.ts
import { 
  GeographicCountry, 
  GeographicDivision, 
  GeographicCity, 
  ResolvedGeographicLocation,
  GeographicHierarchyResult 
} from './types';
import { GLOBAL_COUNTRIES, GLOBAL_DIVISIONS, GLOBAL_CITIES } from './registry';

// Index Maps for O(1) lookups
const countryBySlugMap = new Map<string, GeographicCountry>();
const countryByIdMap = new Map<string, GeographicCountry>();
const divisionBySlugAndCountryMap = new Map<string, GeographicDivision>();
const divisionByIdMap = new Map<string, GeographicDivision>();
const cityBySlugMap = new Map<string, GeographicCity[]>();
const cityByIdMap = new Map<string, GeographicCity>();

// Initialize indices
GLOBAL_COUNTRIES.forEach(c => {
  countryBySlugMap.set(c.slug.toLowerCase(), c);
  countryByIdMap.set(c.id.toUpperCase(), c);
});

GLOBAL_DIVISIONS.forEach(d => {
  divisionByIdMap.set(d.id.toUpperCase(), d);
  divisionBySlugAndCountryMap.set(`${d.countryId.toUpperCase()}:${d.slug.toLowerCase()}`, d);
  // Also index aliases
  if (d.aliases) {
    d.aliases.forEach(alias => {
      divisionBySlugAndCountryMap.set(`${d.countryId.toUpperCase()}:${alias.toLowerCase().trim()}`, d);
    });
  }
});

GLOBAL_CITIES.forEach(city => {
  cityByIdMap.set(city.id.toLowerCase(), city);
  const existing = cityBySlugMap.get(city.slug.toLowerCase()) || [];
  existing.push(city);
  cityBySlugMap.set(city.slug.toLowerCase(), existing);

  // Also map aliases to this slug
  city.aliases.forEach(alias => {
    const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (cleanAlias && cleanAlias !== city.slug.toLowerCase()) {
      const aliasList = cityBySlugMap.get(cleanAlias) || [];
      aliasList.push(city);
      cityBySlugMap.set(cleanAlias, aliasList);
    }
  });
});

export function getCountryBySlug(slug: string): GeographicCountry | null {
  if (!slug) return null;
  return countryBySlugMap.get(slug.toLowerCase().trim()) || null;
}

export function getCountryById(id: string): GeographicCountry | null {
  if (!id) return null;
  return countryByIdMap.get(id.toUpperCase().trim()) || null;
}

export function getDivisionBySlug(countryId: string, slug: string): GeographicDivision | null {
  if (!countryId || !slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  return divisionBySlugAndCountryMap.get(`${countryId.toUpperCase()}:${cleanSlug}`) || null;
}

export function getCityBySlug(slug: string, countryId?: string, divisionId?: string): GeographicCity | null {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();
  const matches = cityBySlugMap.get(cleanSlug);
  if (!matches || matches.length === 0) return null;

  if (divisionId) {
    const match = matches.find(c => c.divisionId?.toUpperCase() === divisionId.toUpperCase());
    if (match) return match;
  }

  if (countryId) {
    const match = matches.find(c => c.countryId.toUpperCase() === countryId.toUpperCase());
    if (match) return match;
  }

  return matches[0];
}

export function getDivisionsForCountry(countryId: string): GeographicDivision[] {
  return GLOBAL_DIVISIONS.filter(d => d.countryId.toUpperCase() === countryId.toUpperCase());
}

export function getCitiesForDivision(divisionId: string): GeographicCity[] {
  return GLOBAL_CITIES.filter(c => c.divisionId?.toUpperCase() === divisionId.toUpperCase());
}

export function getCitiesForCountry(countryId: string): GeographicCity[] {
  return GLOBAL_CITIES.filter(c => c.countryId.toUpperCase() === countryId.toUpperCase());
}

/**
 * Resolves a hierarchy given URL path segments:
 * E.g.
 * - (india)
 * - (india, uttar-pradesh)
 * - (india, uttar-pradesh, noida)
 * - (united-kingdom, london) -> resolves country GB, city london, auto-determines division England
 * - (singapore) -> city-state
 */
export function resolveHierarchyFromParams(
  countryParam?: string,
  secondParam?: string,
  thirdParam?: string
): GeographicHierarchyResult {
  if (!countryParam) {
    return { country: null, division: null, city: null };
  }

  const country = getCountryBySlug(countryParam);
  if (!country) {
    return { country: null, division: null, city: null };
  }

  // 1-segment: Country only (e.g. /network/india)
  if (!secondParam) {
    return { country, division: null, city: null };
  }

  // 3-segment: /network/:country/:division/:city (e.g. /network/india/uttar-pradesh/noida)
  if (thirdParam) {
    const division = getDivisionBySlug(country.id, secondParam);
    const city = getCityBySlug(thirdParam, country.id, division?.id);
    return { country, division, city };
  }

  // 2-segment: Could be /network/:country/:division OR /network/:country/:city
  // Check if secondParam is a division first
  const divisionMatch = getDivisionBySlug(country.id, secondParam);
  if (divisionMatch) {
    return { country, division: divisionMatch, city: null };
  }

  // Otherwise check if secondParam is a direct city (e.g. /network/united-kingdom/london or /network/india/mumbai)
  const cityMatch = getCityBySlug(secondParam, country.id);
  if (cityMatch) {
    const parentDivision = cityMatch.divisionId ? divisionByIdMap.get(cityMatch.divisionId.toUpperCase()) || null : null;
    return { country, division: parentDivision, city: cityMatch };
  }

  return { country, division: null, city: null };
}

/**
 * Computes canonical URL path for a given geographic entity:
 * - Country: /network/india
 * - Division: /network/india/uttar-pradesh
 * - City with Division: /network/india/uttar-pradesh/noida
 * - City in City-State / Direct Region: /network/united-kingdom/london or /network/singapore/singapore
 */
export function buildCanonicalGeographicUrl(
  country: GeographicCountry,
  division?: GeographicDivision | null,
  city?: GeographicCity | null
): string {
  if (city) {
    if (country.isDirectCityState || !division) {
      return `/network/${country.slug}/${city.slug}`;
    }
    return `/network/${country.slug}/${division.slug}/${city.slug}`;
  }

  if (division) {
    return `/network/${country.slug}/${division.slug}`;
  }

  return `/network/${country.slug}`;
}

/**
 * Normalizes an arbitrary user location string into a canonical geographic record.
 * Handles:
 * "Bengaluru, Karnataka, India" -> Bengaluru
 * "San Francisco, CA" -> San Francisco
 * "Noida" -> Noida
 * "London, UK" -> London
 * "Remote" -> Global Remote
 */
export function resolveLocation(rawLocation?: string | null): ResolvedGeographicLocation | null {
  if (!rawLocation || typeof rawLocation !== 'string') return null;

  const trimmed = rawLocation.trim();
  if (!trimmed) return null;

  const lower = trimmed.toLowerCase();

  // 1. Remote / Global match
  if (lower.includes('remote') || lower.includes('anywhere') || lower.includes('worldwide') || lower.includes('wfh')) {
    const remoteCountry = getCountryById('GLOBAL')!;
    const remoteCity = GLOBAL_CITIES.find(c => c.id === 'global-remote-worldwide');
    return {
      country: remoteCountry,
      city: remoteCity,
      canonicalPath: '/network',
      displayName: 'Global Remote',
      level: 'city'
    };
  }

  // 2. Tokenize by comma, slash, dash
  const tokens = trimmed.split(/[,/\\-]/).map(t => t.trim().toLowerCase()).filter(Boolean);

  // Check cities first
  for (const token of tokens) {
    const slugified = token.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    let matchedCities = cityBySlugMap.get(slugified);

    if (!matchedCities || matchedCities.length === 0) {
      // Check if token contains a known city name or alias
      for (const city of GLOBAL_CITIES) {
        const cityLower = city.name.toLowerCase();
        const tokenWords = token.split(/[^a-z0-9]+/);
        if (tokenWords.includes(cityLower) || city.aliases.some(a => token.includes(a.toLowerCase()))) {
          matchedCities = [city];
          break;
        }
      }
    }

    if (matchedCities && matchedCities.length > 0) {
      // Pick best matching city based on other tokens
      let bestCity = matchedCities[0];
      if (matchedCities.length > 1) {
        for (const c of matchedCities) {
          const cCountry = countryByIdMap.get(c.countryId);
          const cDiv = c.divisionId ? divisionByIdMap.get(c.divisionId) : null;
          if (tokens.some(t => t === cCountry?.name.toLowerCase() || t === cCountry?.slug || t === cDiv?.name.toLowerCase() || t === cDiv?.slug)) {
            bestCity = c;
            break;
          }
        }
      }

      const country = countryByIdMap.get(bestCity.countryId)!;
      const division = bestCity.divisionId ? divisionByIdMap.get(bestCity.divisionId) : undefined;
      const canonicalPath = buildCanonicalGeographicUrl(country, division, bestCity);
      const displayName = division 
        ? `${bestCity.name}, ${division.name}, ${country.name}`
        : `${bestCity.name}, ${country.name}`;

      return {
        country,
        division,
        city: bestCity,
        canonicalPath,
        displayName,
        level: 'city'
      };
    }
  }

  // Check divisions
  for (const token of tokens) {
    const slugified = token.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    for (const div of GLOBAL_DIVISIONS) {
      if (div.slug === slugified || div.name.toLowerCase() === token || div.aliases?.includes(token)) {
        const country = countryByIdMap.get(div.countryId)!;
        return {
          country,
          division: div,
          canonicalPath: buildCanonicalGeographicUrl(country, div),
          displayName: `${div.name}, ${country.name}`,
          level: 'division'
        };
      }
    }
  }

  // Check countries
  for (const token of tokens) {
    const slugified = token.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    const country = countryBySlugMap.get(slugified);
    if (country) {
      return {
        country,
        canonicalPath: buildCanonicalGeographicUrl(country),
        displayName: country.name,
        level: 'country'
      };
    }
    // Check country codes
    const byId = countryByIdMap.get(token.toUpperCase());
    if (byId) {
      return {
        country: byId,
        canonicalPath: buildCanonicalGeographicUrl(byId),
        displayName: byId.name,
        level: 'country'
      };
    }
  }

  return null;
}

/**
 * Autocomplete / Location search across all countries, divisions, and cities.
 */
export function searchLocations(query: string, limit: number = 8): ResolvedGeographicLocation[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();
  const results: ResolvedGeographicLocation[] = [];
  const seenPaths = new Set<string>();

  // 1. Search cities
  for (const city of GLOBAL_CITIES) {
    const country = countryByIdMap.get(city.countryId)!;
    const division = city.divisionId ? divisionByIdMap.get(city.divisionId) : undefined;
    const matchesCity = city.name.toLowerCase().includes(q) || city.slug.includes(q) || city.aliases.some(a => a.toLowerCase().includes(q));
    const matchesMetro = city.metroArea?.toLowerCase().includes(q);

    if (matchesCity || matchesMetro) {
      const canonicalPath = buildCanonicalGeographicUrl(country, division, city);
      if (!seenPaths.has(canonicalPath)) {
        seenPaths.add(canonicalPath);
        results.push({
          country,
          division,
          city,
          canonicalPath,
          displayName: division ? `${city.name}, ${division.name}, ${country.name}` : `${city.name}, ${country.name}`,
          level: 'city'
        });
        if (results.length >= limit) return results;
      }
    }
  }

  // 2. Search divisions
  for (const div of GLOBAL_DIVISIONS) {
    const country = countryByIdMap.get(div.countryId)!;
    if (div.name.toLowerCase().includes(q) || div.slug.includes(q) || div.aliases?.some(a => a.toLowerCase().includes(q))) {
      const canonicalPath = buildCanonicalGeographicUrl(country, div);
      if (!seenPaths.has(canonicalPath)) {
        seenPaths.add(canonicalPath);
        results.push({
          country,
          division: div,
          canonicalPath,
          displayName: `${div.name}, ${country.name}`,
          level: 'division'
        });
        if (results.length >= limit) return results;
      }
    }
  }

  // 3. Search countries
  for (const country of GLOBAL_COUNTRIES) {
    if (country.name.toLowerCase().includes(q) || country.slug.includes(q)) {
      const canonicalPath = buildCanonicalGeographicUrl(country);
      if (!seenPaths.has(canonicalPath)) {
        seenPaths.add(canonicalPath);
        results.push({
          country,
          canonicalPath,
          displayName: country.name,
          level: 'country'
        });
        if (results.length >= limit) return results;
      }
    }
  }

  return results;
}
