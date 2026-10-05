// src/lib/seo/searchUniverse/globalLocationResolver.ts
/**
 * TalentXcel Global Location Hierarchy & Canonical Entity Resolver
 *
 * Models the world as a first-class global entity graph:
 * WORLD -> CONTINENT -> COUNTRY -> REGION/STATE/PROVINCE -> METRO/CITY -> DISTRICT
 * + Work Modes: REMOTE, HYBRID, WORK_FROM_HOME, VISA_SPONSORSHIP, RELOCATION.
 *
 * Features:
 * - Deterministic Alias Resolution: Resolves colloquial names (e.g., 'blr', 'bengaluru', 'bombay', 'nyc', 'sf')
 *   to canonical location entities.
 * - Multi-Country Coverage: India, UAE & GCC, United Kingdom, United States, Canada, Australia, Singapore, Germany, etc.
 * - Currency, Language & Employment Market Metadata.
 */

export type LocationType =
  | 'WORLD'
  | 'CONTINENT'
  | 'COUNTRY'
  | 'STATE'
  | 'PROVINCE'
  | 'REGION'
  | 'METRO'
  | 'CITY'
  | 'DISTRICT'
  | 'REMOTE_REGION';

export interface GlobalLocationNode {
  id: string;
  canonicalName: string;
  slug: string;
  type: LocationType;
  parentId?: string;
  countryCode: string; // ISO 3166-1 alpha-2 ('IN', 'AE', 'GB', 'US', 'SG', 'CA', 'AU', 'DE')
  regionCode?: string; // e.g. 'KA', 'MH', 'CA', 'NY', 'ENG', 'DXB'
  currency: string;    // 'INR', 'AED', 'GBP', 'USD', 'SGD', 'CAD', 'AUD', 'EUR'
  primaryLanguage: string;
  timezone: string;
  isTechHub: boolean;
  population?: number;
  latitude?: number;
  longitude?: number;
}

export interface LocationAliasMapping {
  alias: string;
  canonicalLocationId: string;
  locale?: string;
}

// Global Canonical Locations Catalog
export const GLOBAL_LOCATION_CATALOG: GlobalLocationNode[] = [
  // --- WORLD & CONTINENTS ---
  {
    id: 'loc_world',
    canonicalName: 'Worldwide',
    slug: 'worldwide',
    type: 'WORLD',
    countryCode: 'GL',
    currency: 'USD',
    primaryLanguage: 'en',
    timezone: 'UTC',
    isTechHub: false,
  },
  {
    id: 'loc_remote_global',
    canonicalName: 'Remote Worldwide',
    slug: 'remote',
    type: 'REMOTE_REGION',
    countryCode: 'GL',
    currency: 'USD',
    primaryLanguage: 'en',
    timezone: 'UTC',
    isTechHub: true,
  },

  // --- 1. INDIA (IN) ---
  {
    id: 'loc_country_in',
    canonicalName: 'India',
    slug: 'india',
    type: 'COUNTRY',
    countryCode: 'IN',
    currency: 'INR',
    primaryLanguage: 'en',
    timezone: 'Asia/Kolkata',
    isTechHub: true,
    population: 1420000000,
  },
  {
    id: 'loc_city_bangalore',
    canonicalName: 'Bangalore',
    slug: 'bangalore',
    type: 'CITY',
    parentId: 'loc_country_in',
    countryCode: 'IN',
    regionCode: 'KA',
    currency: 'INR',
    primaryLanguage: 'en',
    timezone: 'Asia/Kolkata',
    isTechHub: true,
    population: 13200000,
  },
  {
    id: 'loc_city_delhi_ncr',
    canonicalName: 'Delhi NCR',
    slug: 'delhi-ncr',
    type: 'METRO',
    parentId: 'loc_country_in',
    countryCode: 'IN',
    regionCode: 'DL',
    currency: 'INR',
    primaryLanguage: 'en',
    timezone: 'Asia/Kolkata',
    isTechHub: true,
    population: 32000000,
  },
  {
    id: 'loc_city_noida',
    canonicalName: 'Noida',
    slug: 'noida',
    type: 'CITY',
    parentId: 'loc_city_delhi_ncr',
    countryCode: 'IN',
    regionCode: 'UP',
    currency: 'INR',
    primaryLanguage: 'en',
    timezone: 'Asia/Kolkata',
    isTechHub: true,
  },
  {
    id: 'loc_city_gurgaon',
    canonicalName: 'Gurgaon',
    slug: 'gurgaon',
    type: 'CITY',
    parentId: 'loc_city_delhi_ncr',
    countryCode: 'IN',
    regionCode: 'HR',
    currency: 'INR',
    primaryLanguage: 'en',
    timezone: 'Asia/Kolkata',
    isTechHub: true,
  },
  {
    id: 'loc_city_mumbai',
    canonicalName: 'Mumbai',
    slug: 'mumbai',
    type: 'CITY',
    parentId: 'loc_country_in',
    countryCode: 'IN',
    regionCode: 'MH',
    currency: 'INR',
    primaryLanguage: 'en',
    timezone: 'Asia/Kolkata',
    isTechHub: true,
    population: 21000000,
  },
  {
    id: 'loc_city_pune',
    canonicalName: 'Pune',
    slug: 'pune',
    type: 'CITY',
    parentId: 'loc_country_in',
    countryCode: 'IN',
    regionCode: 'MH',
    currency: 'INR',
    primaryLanguage: 'en',
    timezone: 'Asia/Kolkata',
    isTechHub: true,
    population: 7200000,
  },
  {
    id: 'loc_city_hyderabad',
    canonicalName: 'Hyderabad',
    slug: 'hyderabad',
    type: 'CITY',
    parentId: 'loc_country_in',
    countryCode: 'IN',
    regionCode: 'TS',
    currency: 'INR',
    primaryLanguage: 'en',
    timezone: 'Asia/Kolkata',
    isTechHub: true,
    population: 10500000,
  },
  {
    id: 'loc_city_chennai',
    canonicalName: 'Chennai',
    slug: 'chennai',
    type: 'CITY',
    parentId: 'loc_country_in',
    countryCode: 'IN',
    regionCode: 'TN',
    currency: 'INR',
    primaryLanguage: 'en',
    timezone: 'Asia/Kolkata',
    isTechHub: true,
    population: 11500000,
  },

  // --- 2. UNITED ARAB EMIRATES & GCC (AE, SA, QA) ---
  {
    id: 'loc_country_ae',
    canonicalName: 'United Arab Emirates',
    slug: 'uae',
    type: 'COUNTRY',
    countryCode: 'AE',
    currency: 'AED',
    primaryLanguage: 'en',
    timezone: 'Asia/Dubai',
    isTechHub: true,
    population: 9900000,
  },
  {
    id: 'loc_city_dubai',
    canonicalName: 'Dubai',
    slug: 'dubai',
    type: 'CITY',
    parentId: 'loc_country_ae',
    countryCode: 'AE',
    regionCode: 'DXB',
    currency: 'AED',
    primaryLanguage: 'en',
    timezone: 'Asia/Dubai',
    isTechHub: true,
    population: 3600000,
  },
  {
    id: 'loc_city_abu_dhabi',
    canonicalName: 'Abu Dhabi',
    slug: 'abu-dhabi',
    type: 'CITY',
    parentId: 'loc_country_ae',
    countryCode: 'AE',
    regionCode: 'AUH',
    currency: 'AED',
    primaryLanguage: 'en',
    timezone: 'Asia/Dubai',
    isTechHub: true,
    population: 1500000,
  },
  {
    id: 'loc_country_sa',
    canonicalName: 'Saudi Arabia',
    slug: 'saudi-arabia',
    type: 'COUNTRY',
    countryCode: 'SA',
    currency: 'SAR',
    primaryLanguage: 'ar',
    timezone: 'Asia/Riyadh',
    isTechHub: true,
  },
  {
    id: 'loc_city_riyadh',
    canonicalName: 'Riyadh',
    slug: 'riyadh',
    type: 'CITY',
    parentId: 'loc_country_sa',
    countryCode: 'SA',
    regionCode: 'RUH',
    currency: 'SAR',
    primaryLanguage: 'ar',
    timezone: 'Asia/Riyadh',
    isTechHub: true,
  },

  // --- 3. UNITED KINGDOM (GB) ---
  {
    id: 'loc_country_gb',
    canonicalName: 'United Kingdom',
    slug: 'uk',
    type: 'COUNTRY',
    countryCode: 'GB',
    currency: 'GBP',
    primaryLanguage: 'en',
    timezone: 'Europe/London',
    isTechHub: true,
    population: 67000000,
  },
  {
    id: 'loc_city_london',
    canonicalName: 'London',
    slug: 'london',
    type: 'CITY',
    parentId: 'loc_country_gb',
    countryCode: 'GB',
    regionCode: 'ENG',
    currency: 'GBP',
    primaryLanguage: 'en',
    timezone: 'Europe/London',
    isTechHub: true,
    population: 9000000,
  },
  {
    id: 'loc_city_manchester',
    canonicalName: 'Manchester',
    slug: 'manchester',
    type: 'CITY',
    parentId: 'loc_country_gb',
    countryCode: 'GB',
    regionCode: 'ENG',
    currency: 'GBP',
    primaryLanguage: 'en',
    timezone: 'Europe/London',
    isTechHub: true,
  },

  // --- 4. UNITED STATES (US) ---
  {
    id: 'loc_country_us',
    canonicalName: 'United States',
    slug: 'usa',
    type: 'COUNTRY',
    countryCode: 'US',
    currency: 'USD',
    primaryLanguage: 'en',
    timezone: 'America/New_York',
    isTechHub: true,
    population: 335000000,
  },
  {
    id: 'loc_city_nyc',
    canonicalName: 'New York City',
    slug: 'new-york',
    type: 'CITY',
    parentId: 'loc_country_us',
    countryCode: 'US',
    regionCode: 'NY',
    currency: 'USD',
    primaryLanguage: 'en',
    timezone: 'America/New_York',
    isTechHub: true,
    population: 8800000,
  },
  {
    id: 'loc_city_sf',
    canonicalName: 'San Francisco',
    slug: 'san-francisco',
    type: 'CITY',
    parentId: 'loc_country_us',
    countryCode: 'US',
    regionCode: 'CA',
    currency: 'USD',
    primaryLanguage: 'en',
    timezone: 'America/Los_Angeles',
    isTechHub: true,
    population: 870000,
  },
  {
    id: 'loc_city_seattle',
    canonicalName: 'Seattle',
    slug: 'seattle',
    type: 'CITY',
    parentId: 'loc_country_us',
    countryCode: 'US',
    regionCode: 'WA',
    currency: 'USD',
    primaryLanguage: 'en',
    timezone: 'America/Los_Angeles',
    isTechHub: true,
    population: 750000,
  },
  {
    id: 'loc_city_austin',
    canonicalName: 'Austin',
    slug: 'austin',
    type: 'CITY',
    parentId: 'loc_country_us',
    countryCode: 'US',
    regionCode: 'TX',
    currency: 'USD',
    primaryLanguage: 'en',
    timezone: 'America/Chicago',
    isTechHub: true,
  },

  // --- 5. SINGAPORE, CANADA, AUSTRALIA & EUROPE ---
  {
    id: 'loc_country_sg',
    canonicalName: 'Singapore',
    slug: 'singapore',
    type: 'COUNTRY',
    countryCode: 'SG',
    currency: 'SGD',
    primaryLanguage: 'en',
    timezone: 'Asia/Singapore',
    isTechHub: true,
    population: 5900000,
  },
  {
    id: 'loc_country_ca',
    canonicalName: 'Canada',
    slug: 'canada',
    type: 'COUNTRY',
    countryCode: 'CA',
    currency: 'CAD',
    primaryLanguage: 'en',
    timezone: 'America/Toronto',
    isTechHub: true,
  },
  {
    id: 'loc_city_toronto',
    canonicalName: 'Toronto',
    slug: 'toronto',
    type: 'CITY',
    parentId: 'loc_country_ca',
    countryCode: 'CA',
    regionCode: 'ON',
    currency: 'CAD',
    primaryLanguage: 'en',
    timezone: 'America/Toronto',
    isTechHub: true,
  },
  {
    id: 'loc_country_au',
    canonicalName: 'Australia',
    slug: 'australia',
    type: 'COUNTRY',
    countryCode: 'AU',
    currency: 'AUD',
    primaryLanguage: 'en',
    timezone: 'Australia/Sydney',
    isTechHub: true,
  },
  {
    id: 'loc_city_sydney',
    canonicalName: 'Sydney',
    slug: 'sydney',
    type: 'CITY',
    parentId: 'loc_country_au',
    countryCode: 'AU',
    regionCode: 'NSW',
    currency: 'AUD',
    primaryLanguage: 'en',
    timezone: 'Australia/Sydney',
    isTechHub: true,
  },
  {
    id: 'loc_country_de',
    canonicalName: 'Germany',
    slug: 'germany',
    type: 'COUNTRY',
    countryCode: 'DE',
    currency: 'EUR',
    primaryLanguage: 'de',
    timezone: 'Europe/Berlin',
    isTechHub: true,
  },
  {
    id: 'loc_city_berlin',
    canonicalName: 'Berlin',
    slug: 'berlin',
    type: 'CITY',
    parentId: 'loc_country_de',
    countryCode: 'DE',
    regionCode: 'BER',
    currency: 'EUR',
    primaryLanguage: 'de',
    timezone: 'Europe/Berlin',
    isTechHub: true,
  },
];

// Colloquial & Regional Alias Mappings
export const GLOBAL_LOCATION_ALIASES: LocationAliasMapping[] = [
  // Bangalore
  { alias: 'bengaluru', canonicalLocationId: 'loc_city_bangalore' },
  { alias: 'blr', canonicalLocationId: 'loc_city_bangalore' },
  { alias: 'banglore', canonicalLocationId: 'loc_city_bangalore' },

  // Mumbai
  { alias: 'bombay', canonicalLocationId: 'loc_city_mumbai' },
  { alias: 'bom', canonicalLocationId: 'loc_city_mumbai' },

  // Delhi NCR
  { alias: 'delhi', canonicalLocationId: 'loc_city_delhi_ncr' },
  { alias: 'new delhi', canonicalLocationId: 'loc_city_delhi_ncr' },
  { alias: 'ncr', canonicalLocationId: 'loc_city_delhi_ncr' },

  // Gurgaon
  { alias: 'gurugram', canonicalLocationId: 'loc_city_gurgaon' },
  { alias: 'ggn', canonicalLocationId: 'loc_city_gurgaon' },

  // Chennai
  { alias: 'madras', canonicalLocationId: 'loc_city_chennai' },
  { alias: 'maa', canonicalLocationId: 'loc_city_chennai' },

  // UAE
  { alias: 'united arab emirates', canonicalLocationId: 'loc_country_ae' },
  { alias: 'emirates', canonicalLocationId: 'loc_country_ae' },
  { alias: 'dxb', canonicalLocationId: 'loc_city_dubai' },
  { alias: 'auh', canonicalLocationId: 'loc_city_abu_dhabi' },

  // UK
  { alias: 'united kingdom', canonicalLocationId: 'loc_country_gb' },
  { alias: 'britain', canonicalLocationId: 'loc_country_gb' },
  { alias: 'great britain', canonicalLocationId: 'loc_country_gb' },
  { alias: 'england', canonicalLocationId: 'loc_country_gb' },
  { alias: 'lon', canonicalLocationId: 'loc_city_london' },

  // USA
  { alias: 'united states', canonicalLocationId: 'loc_country_us' },
  { alias: 'united states of america', canonicalLocationId: 'loc_country_us' },
  { alias: 'us', canonicalLocationId: 'loc_country_us' },
  { alias: 'america', canonicalLocationId: 'loc_country_us' },
  { alias: 'nyc', canonicalLocationId: 'loc_city_nyc' },
  { alias: 'new york', canonicalLocationId: 'loc_city_nyc' },
  { alias: 'sf', canonicalLocationId: 'loc_city_sf' },
  { alias: 'san fran', canonicalLocationId: 'loc_city_sf' },
  { alias: 'bay area', canonicalLocationId: 'loc_city_sf' },
  { alias: 'silicon valley', canonicalLocationId: 'loc_city_sf' },

  // Remote
  { alias: 'work from home', canonicalLocationId: 'loc_remote_global' },
  { alias: 'wfh', canonicalLocationId: 'loc_remote_global' },
  { alias: 'remote jobs', canonicalLocationId: 'loc_remote_global' },
  { alias: 'telecommute', canonicalLocationId: 'loc_remote_global' },
];

export class GlobalLocationResolver {
  private static locationMap: Map<string, GlobalLocationNode> = new Map();
  private static aliasMap: Map<string, string> = new Map();

  static {
    GLOBAL_LOCATION_CATALOG.forEach((loc) => {
      this.locationMap.set(loc.id, loc);
      this.aliasMap.set(loc.canonicalName.toLowerCase(), loc.id);
      this.aliasMap.set(loc.slug.toLowerCase(), loc.id);
    });

    GLOBAL_LOCATION_ALIASES.forEach((a) => {
      this.aliasMap.set(a.alias.toLowerCase(), a.canonicalLocationId);
    });
  }

  /**
   * Resolves a query string, slug, or alias into its authoritative canonical location node.
   */
  public static resolve(queryOrAlias: string): GlobalLocationNode | undefined {
    if (!queryOrAlias) return undefined;
    const clean = queryOrAlias.trim().toLowerCase().replace(/-/g, ' ');
    const locId = this.aliasMap.get(clean) || this.aliasMap.get(queryOrAlias.trim().toLowerCase());
    if (locId) {
      return this.locationMap.get(locId);
    }
    return undefined;
  }

  /**
   * Extracts any recognized location from a search query.
   * E.g. "software engineer jobs in bangalore" -> returns Bangalore node.
   */
  public static extractFromQuery(query: string): { location?: GlobalLocationNode; cleanQuery: string } {
    const qLower = query.toLowerCase();
    // Sort aliases by length descending so longer phrases match first (e.g. "new york city" before "new york")
    const sortedAliases = Array.from(this.aliasMap.keys()).sort((a, b) => b.length - a.length);

    for (const alias of sortedAliases) {
      const regex = new RegExp(`\\b${alias}\\b`, 'i');
      if (regex.test(qLower)) {
        const locId = this.aliasMap.get(alias)!;
        const loc = this.locationMap.get(locId);
        const cleanQuery = qLower.replace(regex, '').replace(/\b(in|at|for|near)\b/g, '').trim().replace(/\s+/g, ' ');
        return { location: loc, cleanQuery };
      }
    }
    return { cleanQuery: query };
  }

  public static getAllLocations(): GlobalLocationNode[] {
    return GLOBAL_LOCATION_CATALOG;
  }
}
