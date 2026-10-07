// src/lib/seo/globalSearchGraph/globalEntityGraph.ts
/**
 * TalentXcel Global Entity Graph & Multi-Tier Location Hierarchy
 *
 * Implements Section 1:
 * WORLD -> CONTINENT -> COUNTRY -> STATE/PROVINCE/REGION -> METRO -> CITY -> DISTRICT
 *
 * Provides:
 * - Stable Global Entity IDs (e.g. LOC-GLB-001, LOC-IN-BLR, LOC-US-NYC, LOC-AE-DXB)
 * - Reusable location graph shared across JOBS, SALARY, CAREERS, LEARNING, COLLEGES, GOVERNMENT, EMPLOYERS, RESUME
 * - Multi-country international coverage (India, US, UK, UAE, Saudi Arabia, Germany, Singapore, Canada, Australia, etc.)
 * - Zero entity record duplication across product universes
 */

export type EntityClassification =
  | 'LOCATION'
  | 'INDUSTRY'
  | 'OCCUPATION'
  | 'SKILL'
  | 'CERTIFICATION'
  | 'DEGREE'
  | 'COLLEGE'
  | 'EMPLOYER'
  | 'SEARCH_INTENT';

export type LocationTierLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface GlobalLocationNode {
  entityId: string; // Stable Entity ID: LOC-{COUNTRY}-{SLUG}
  slug: string;
  canonicalName: string;
  tierLevel: LocationTierLevel;
  tierName: 'WORLD' | 'CONTINENT' | 'COUNTRY' | 'STATE_REGION' | 'METRO' | 'CITY' | 'DISTRICT';
  level?: string;
  parentEntityId?: string;
  countryCode: string; // ISO 3166-1 alpha-2
  continentCode: 'AF' | 'AS' | 'EU' | 'NA' | 'OC' | 'SA' | 'GLB';
  stateOrRegionName?: string;
  cityName?: string;
  timezone: string;
  currency: string;
  officialLanguages: string[];
  population?: number;
  latitude?: number;
  longitude?: number;
  aliases: string[];
  hubs: {
    isTechHub: boolean;
    isFinancialHub: boolean;
    isHealthcareHub: boolean;
    isIndustrialHub: boolean;
    isAviationHub?: boolean;
  };
  supportedUniverses: Array<'JOBS' | 'SALARY' | 'CAREERS' | 'LEARNING' | 'COLLEGES' | 'GOVERNMENT' | 'EMPLOYERS' | 'RESUME'>;
}

export interface EntityRelationshipEdge {
  sourceEntityId: string;
  targetEntityId: string;
  relationship: 'CONTAINED_IN' | 'METRO_OF' | 'ECONOMIC_CORRIDOR_TO' | 'NEAR' | 'ALIAS_OF';
  distanceKm?: number;
}

/**
 * Authoritative Global Location Nodes
 */
export const GLOBAL_LOCATION_GRAPH_NODES: GlobalLocationNode[] = [
  // ── Level 0: World ───────────────────────────────────────────────────────
  {
    entityId: 'LOC-GLB-WORLD',
    slug: 'global',
    canonicalName: 'Worldwide (Global)',
    tierLevel: 0,
    tierName: 'WORLD',
    level: 'WORLD',
    countryCode: 'GLB',
    continentCode: 'GLB',
    timezone: 'UTC',
    currency: 'USD',
    officialLanguages: ['en'],
    aliases: ['worldwide', 'global', 'international', 'world'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'LEARNING', 'COLLEGES', 'GOVERNMENT', 'EMPLOYERS', 'RESUME'],
  },
  {
    entityId: 'LOC-GLB-REMOTE',
    slug: 'remote',
    canonicalName: 'Remote / Work From Anywhere',
    tierLevel: 0,
    tierName: 'WORLD',
    parentEntityId: 'LOC-GLB-WORLD',
    countryCode: 'GLB',
    continentCode: 'GLB',
    timezone: 'UTC',
    currency: 'USD',
    officialLanguages: ['en'],
    aliases: ['remote', 'work from home', 'wfh', 'telecommute', 'virtual', 'anywhere'],
    hubs: { isTechHub: true, isFinancialHub: false, isHealthcareHub: false, isIndustrialHub: false },
    supportedUniverses: ['JOBS', 'CAREERS', 'SALARY', 'RESUME', 'EMPLOYERS'],
  },

  // ── Level 1: Continents ──────────────────────────────────────────────────
  {
    entityId: 'LOC-CONT-AS',
    slug: 'asia',
    canonicalName: 'Asia',
    tierLevel: 1,
    tierName: 'CONTINENT',
    parentEntityId: 'LOC-GLB-WORLD',
    countryCode: 'GLB',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'USD',
    officialLanguages: ['en'],
    aliases: ['asia', 'apac', 'asia-pacific'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'COLLEGES', 'LEARNING', 'CAREERS'],
  },
  {
    entityId: 'LOC-CONT-NA',
    slug: 'north-america',
    canonicalName: 'North America',
    tierLevel: 1,
    tierName: 'CONTINENT',
    parentEntityId: 'LOC-GLB-WORLD',
    countryCode: 'GLB',
    continentCode: 'NA',
    timezone: 'America/New_York',
    currency: 'USD',
    officialLanguages: ['en'],
    aliases: ['north america', 'na'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'COLLEGES', 'LEARNING', 'CAREERS'],
  },
  {
    entityId: 'LOC-CONT-EU',
    slug: 'europe',
    canonicalName: 'Europe',
    tierLevel: 1,
    tierName: 'CONTINENT',
    parentEntityId: 'LOC-GLB-WORLD',
    countryCode: 'GLB',
    continentCode: 'EU',
    timezone: 'Europe/London',
    currency: 'EUR',
    officialLanguages: ['en', 'de', 'fr'],
    aliases: ['europe', 'eu', 'emea'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'COLLEGES', 'LEARNING', 'CAREERS'],
  },
  {
    entityId: 'LOC-CONT-ME',
    slug: 'middle-east',
    canonicalName: 'Middle East & GCC',
    tierLevel: 1,
    tierName: 'CONTINENT',
    parentEntityId: 'LOC-GLB-WORLD',
    countryCode: 'GLB',
    continentCode: 'AS',
    timezone: 'Asia/Dubai',
    currency: 'AED',
    officialLanguages: ['en', 'ar'],
    aliases: ['middle east', 'gcc', 'gulf', 'mena'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'EMPLOYERS'],
  },

  // ── Level 2: Sovereign Countries ─────────────────────────────────────────
  {
    entityId: 'LOC-IN-COUNTRY',
    slug: 'india',
    canonicalName: 'India',
    tierLevel: 2,
    tierName: 'COUNTRY',
    parentEntityId: 'LOC-CONT-AS',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['en', 'hi'],
    population: 1428627663,
    aliases: ['india', 'in', 'bharat', 'ind'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'LEARNING', 'COLLEGES', 'GOVERNMENT', 'EMPLOYERS', 'RESUME'],
  },
  {
    entityId: 'LOC-US-COUNTRY',
    slug: 'united-states',
    canonicalName: 'United States',
    tierLevel: 2,
    tierName: 'COUNTRY',
    parentEntityId: 'LOC-CONT-NA',
    countryCode: 'US',
    continentCode: 'NA',
    timezone: 'America/New_York',
    currency: 'USD',
    officialLanguages: ['en'],
    population: 334914895,
    aliases: ['united states', 'usa', 'us', 'america'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'LEARNING', 'COLLEGES', 'EMPLOYERS', 'RESUME'],
  },
  {
    entityId: 'LOC-GB-COUNTRY',
    slug: 'united-kingdom',
    canonicalName: 'United Kingdom',
    tierLevel: 2,
    tierName: 'COUNTRY',
    parentEntityId: 'LOC-CONT-EU',
    countryCode: 'GB',
    continentCode: 'EU',
    timezone: 'Europe/London',
    currency: 'GBP',
    officialLanguages: ['en'],
    population: 67736802,
    aliases: ['united kingdom', 'uk', 'great britain', 'britain', 'england'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'LEARNING', 'COLLEGES', 'EMPLOYERS', 'RESUME'],
  },
  {
    entityId: 'LOC-AE-COUNTRY',
    slug: 'united-arab-emirates',
    canonicalName: 'United Arab Emirates',
    tierLevel: 2,
    tierName: 'COUNTRY',
    parentEntityId: 'LOC-CONT-ME',
    countryCode: 'AE',
    continentCode: 'AS',
    timezone: 'Asia/Dubai',
    currency: 'AED',
    officialLanguages: ['en', 'ar'],
    population: 9441129,
    aliases: ['united arab emirates', 'uae', 'emirates', 'ae'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true, isAviationHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'EMPLOYERS', 'RESUME'],
  },
  {
    entityId: 'LOC-SA-COUNTRY',
    slug: 'saudi-arabia',
    canonicalName: 'Saudi Arabia',
    tierLevel: 2,
    tierName: 'COUNTRY',
    parentEntityId: 'LOC-CONT-ME',
    countryCode: 'SA',
    continentCode: 'AS',
    timezone: 'Asia/Riyadh',
    currency: 'SAR',
    officialLanguages: ['en', 'ar'],
    population: 36408820,
    aliases: ['saudi arabia', 'ksa', 'saudi', 'kingdom of saudi arabia'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-DE-COUNTRY',
    slug: 'germany',
    canonicalName: 'Germany',
    tierLevel: 2,
    tierName: 'COUNTRY',
    parentEntityId: 'LOC-CONT-EU',
    countryCode: 'DE',
    continentCode: 'EU',
    timezone: 'Europe/Berlin',
    currency: 'EUR',
    officialLanguages: ['de', 'en'],
    population: 83783902,
    aliases: ['germany', 'deutschland', 'de'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'LEARNING', 'COLLEGES', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-SG-COUNTRY',
    slug: 'singapore',
    canonicalName: 'Singapore',
    tierLevel: 2,
    tierName: 'COUNTRY',
    parentEntityId: 'LOC-CONT-AS',
    countryCode: 'SG',
    continentCode: 'AS',
    timezone: 'Asia/Singapore',
    currency: 'SGD',
    officialLanguages: ['en', 'zh', 'ms', 'ta'],
    population: 5637000,
    aliases: ['singapore', 'sg'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'LEARNING', 'COLLEGES', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-CA-COUNTRY',
    slug: 'canada',
    canonicalName: 'Canada',
    tierLevel: 2,
    tierName: 'COUNTRY',
    parentEntityId: 'LOC-CONT-NA',
    countryCode: 'CA',
    continentCode: 'NA',
    timezone: 'America/Toronto',
    currency: 'CAD',
    officialLanguages: ['en', 'fr'],
    population: 38246108,
    aliases: ['canada', 'ca'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'COLLEGES', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-AU-COUNTRY',
    slug: 'australia',
    canonicalName: 'Australia',
    tierLevel: 2,
    tierName: 'COUNTRY',
    parentEntityId: 'LOC-GLB-WORLD',
    countryCode: 'AU',
    continentCode: 'OC',
    timezone: 'Australia/Sydney',
    currency: 'AUD',
    officialLanguages: ['en'],
    population: 26005540,
    aliases: ['australia', 'au', 'oz'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'COLLEGES', 'EMPLOYERS'],
  },

  // ── Level 3 & 4: States / Regions / Metros ─────────────────────────────────
  {
    entityId: 'LOC-IN-KA',
    slug: 'karnataka',
    canonicalName: 'Karnataka',
    tierLevel: 3,
    tierName: 'STATE_REGION',
    parentEntityId: 'LOC-IN-COUNTRY',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['kn', 'en'],
    population: 67562686,
    aliases: ['karnataka', 'ka'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'COLLEGES', 'GOVERNMENT', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-IN-MH',
    slug: 'maharashtra',
    canonicalName: 'Maharashtra',
    tierLevel: 3,
    tierName: 'STATE_REGION',
    parentEntityId: 'LOC-IN-COUNTRY',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['mr', 'en'],
    population: 123144223,
    aliases: ['maharashtra', 'mh'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'COLLEGES', 'GOVERNMENT', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-IN-DL',
    slug: 'delhi-ncr',
    canonicalName: 'Delhi National Capital Region',
    tierLevel: 4,
    tierName: 'METRO',
    parentEntityId: 'LOC-IN-COUNTRY',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['hi', 'en'],
    population: 32065760,
    aliases: ['delhi ncr', 'ncr', 'national capital region'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'COLLEGES', 'GOVERNMENT', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-IN-UP',
    slug: 'uttar-pradesh',
    canonicalName: 'Uttar Pradesh',
    tierLevel: 3,
    tierName: 'STATE_REGION',
    parentEntityId: 'LOC-IN-COUNTRY',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['hi', 'en'],
    population: 235687000,
    aliases: ['uttar pradesh', 'up'],
    hubs: { isTechHub: true, isFinancialHub: false, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'GOVERNMENT', 'COLLEGES', 'CAREERS'],
  },
  {
    entityId: 'LOC-US-CA',
    slug: 'california',
    canonicalName: 'California',
    tierLevel: 3,
    tierName: 'STATE_REGION',
    parentEntityId: 'LOC-US-COUNTRY',
    countryCode: 'US',
    continentCode: 'NA',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    officialLanguages: ['en'],
    population: 39029342,
    aliases: ['california', 'ca', 'golden state'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: false },
    supportedUniverses: ['JOBS', 'SALARY', 'COLLEGES', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-US-NY',
    slug: 'new-york-state',
    canonicalName: 'New York State',
    tierLevel: 3,
    tierName: 'STATE_REGION',
    parentEntityId: 'LOC-US-COUNTRY',
    countryCode: 'US',
    continentCode: 'NA',
    timezone: 'America/New_York',
    currency: 'USD',
    officialLanguages: ['en'],
    population: 19677151,
    aliases: ['new york state', 'ny state', 'nys'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: false },
    supportedUniverses: ['JOBS', 'SALARY', 'COLLEGES', 'EMPLOYERS'],
  },

  // ── Level 5: Cities / Major Employment Centers ───────────────────────────
  {
    entityId: 'LOC-IN-BLR',
    slug: 'bangalore',
    canonicalName: 'Bangalore',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-IN-KA',
    cityName: 'Bangalore',
    stateOrRegionName: 'Karnataka',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['en', 'kn'],
    population: 13193000,
    latitude: 12.9716,
    longitude: 77.5946,
    aliases: ['bangalore', 'bengaluru', 'blr', 'silicon valley of india'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'LEARNING', 'COLLEGES', 'EMPLOYERS', 'RESUME'],
  },
  {
    entityId: 'LOC-IN-BOM',
    slug: 'mumbai',
    canonicalName: 'Mumbai',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-IN-MH',
    cityName: 'Mumbai',
    stateOrRegionName: 'Maharashtra',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['en', 'mr', 'hi'],
    population: 20961472,
    latitude: 19.0760,
    longitude: 72.8777,
    aliases: ['mumbai', 'bombay', 'bom', 'financial capital'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'COLLEGES', 'EMPLOYERS', 'RESUME'],
  },
  {
    entityId: 'LOC-IN-DEL',
    slug: 'delhi',
    canonicalName: 'Delhi',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-IN-DL',
    cityName: 'Delhi',
    stateOrRegionName: 'Delhi',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['en', 'hi'],
    population: 32065760,
    latitude: 28.6139,
    longitude: 77.2090,
    aliases: ['delhi', 'new delhi', 'del', 'dilli'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'COLLEGES', 'GOVERNMENT', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-IN-HYD',
    slug: 'hyderabad',
    canonicalName: 'Hyderabad',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-IN-COUNTRY',
    cityName: 'Hyderabad',
    stateOrRegionName: 'Telangana',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['en', 'te', 'ur'],
    population: 10534000,
    latitude: 17.3850,
    longitude: 78.4867,
    aliases: ['hyderabad', 'hyd', 'cyberabad'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'COLLEGES', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-IN-VNS',
    slug: 'varanasi',
    canonicalName: 'Varanasi',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-IN-UP',
    cityName: 'Varanasi',
    stateOrRegionName: 'Uttar Pradesh',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['hi', 'en'],
    population: 1435000,
    latitude: 25.3176,
    longitude: 82.9739,
    aliases: ['varanasi', 'banaras', 'benares', 'kashi', 'vns'],
    hubs: { isTechHub: false, isFinancialHub: false, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'COLLEGES', 'GOVERNMENT', 'CAREERS'],
  },
  {
    entityId: 'LOC-IN-NOI',
    slug: 'noida',
    canonicalName: 'Noida',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-IN-DL',
    cityName: 'Noida',
    stateOrRegionName: 'Uttar Pradesh',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['hi', 'en'],
    population: 820000,
    latitude: 28.5355,
    longitude: 77.3910,
    aliases: ['noida', 'greater noida'],
    hubs: { isTechHub: true, isFinancialHub: false, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'COLLEGES', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-IN-LKO',
    slug: 'lucknow',
    canonicalName: 'Lucknow',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-IN-UP',
    cityName: 'Lucknow',
    stateOrRegionName: 'Uttar Pradesh',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['hi', 'en', 'ur'],
    population: 3764000,
    latitude: 26.8467,
    longitude: 80.9462,
    aliases: ['lucknow', 'lko'],
    hubs: { isTechHub: true, isFinancialHub: false, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'GOVERNMENT', 'COLLEGES', 'CAREERS'],
  },
  {
    entityId: 'LOC-IN-PAT',
    slug: 'patiala',
    canonicalName: 'Patiala',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-IN-COUNTRY',
    cityName: 'Patiala',
    stateOrRegionName: 'Punjab',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['pa', 'en'],
    population: 446246,
    latitude: 30.3398,
    longitude: 76.3869,
    aliases: ['patiala', 'ptl'],
    hubs: { isTechHub: false, isFinancialHub: false, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'COLLEGES', 'GOVERNMENT'],
  },
  {
    entityId: 'LOC-US-NYC',
    slug: 'new-york',
    canonicalName: 'New York City',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-US-NY',
    cityName: 'New York',
    stateOrRegionName: 'New York',
    countryCode: 'US',
    continentCode: 'NA',
    timezone: 'America/New_York',
    currency: 'USD',
    officialLanguages: ['en'],
    population: 8804190,
    latitude: 40.7128,
    longitude: -74.0060,
    aliases: ['new york', 'new york city', 'nyc', 'ny'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: false },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'COLLEGES', 'EMPLOYERS', 'RESUME'],
  },
  {
    entityId: 'LOC-US-SFO',
    slug: 'san-francisco',
    canonicalName: 'San Francisco',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-US-CA',
    cityName: 'San Francisco',
    stateOrRegionName: 'California',
    countryCode: 'US',
    continentCode: 'NA',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    officialLanguages: ['en'],
    population: 873965,
    latitude: 37.7749,
    longitude: -122.4194,
    aliases: ['san francisco', 'sf', 'bay area', 'silicon valley'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: false },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'EMPLOYERS', 'RESUME'],
  },
  {
    entityId: 'LOC-GB-LON',
    slug: 'london',
    canonicalName: 'London',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-GB-COUNTRY',
    cityName: 'London',
    countryCode: 'GB',
    continentCode: 'EU',
    timezone: 'Europe/London',
    currency: 'GBP',
    officialLanguages: ['en'],
    population: 8982000,
    latitude: 51.5074,
    longitude: -0.1278,
    aliases: ['london', 'greater london', 'lon'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: false },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'COLLEGES', 'EMPLOYERS', 'RESUME'],
  },
  {
    entityId: 'LOC-AE-DXB',
    slug: 'dubai',
    canonicalName: 'Dubai',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-AE-COUNTRY',
    cityName: 'Dubai',
    countryCode: 'AE',
    continentCode: 'AS',
    timezone: 'Asia/Dubai',
    currency: 'AED',
    officialLanguages: ['en', 'ar'],
    population: 3604030,
    latitude: 25.2048,
    longitude: 55.2708,
    aliases: ['dubai', 'dxb'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true, isAviationHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'EMPLOYERS', 'RESUME'],
  },
  {
    entityId: 'LOC-AE-AUH',
    slug: 'abu-dhabi',
    canonicalName: 'Abu Dhabi',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-AE-COUNTRY',
    cityName: 'Abu Dhabi',
    countryCode: 'AE',
    continentCode: 'AS',
    timezone: 'Asia/Dubai',
    currency: 'AED',
    officialLanguages: ['en', 'ar'],
    population: 1540000,
    latitude: 24.4539,
    longitude: 54.3773,
    aliases: ['abu dhabi', 'auh'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-SA-RUH',
    slug: 'riyadh',
    canonicalName: 'Riyadh',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-SA-COUNTRY',
    cityName: 'Riyadh',
    countryCode: 'SA',
    continentCode: 'AS',
    timezone: 'Asia/Riyadh',
    currency: 'SAR',
    officialLanguages: ['en', 'ar'],
    population: 7676654,
    latitude: 24.7136,
    longitude: 46.6753,
    aliases: ['riyadh', 'ruh'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-DE-MUC',
    slug: 'munich',
    canonicalName: 'Munich',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-DE-COUNTRY',
    cityName: 'Munich',
    countryCode: 'DE',
    continentCode: 'EU',
    timezone: 'Europe/Berlin',
    currency: 'EUR',
    officialLanguages: ['de', 'en'],
    population: 1488202,
    latitude: 48.1351,
    longitude: 11.5820,
    aliases: ['munich', 'münchen', 'muc'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-SG-SIN',
    slug: 'singapore-city',
    canonicalName: 'Singapore (Central)',
    tierLevel: 5,
    tierName: 'CITY',
    parentEntityId: 'LOC-SG-COUNTRY',
    cityName: 'Singapore',
    countryCode: 'SG',
    continentCode: 'AS',
    timezone: 'Asia/Singapore',
    currency: 'SGD',
    officialLanguages: ['en', 'zh', 'ms', 'ta'],
    population: 5637000,
    latitude: 1.3521,
    longitude: 103.8198,
    aliases: ['singapore city', 'singapore cbd', 'sin'],
    hubs: { isTechHub: true, isFinancialHub: true, isHealthcareHub: true, isIndustrialHub: true },
    supportedUniverses: ['JOBS', 'SALARY', 'CAREERS', 'COLLEGES', 'EMPLOYERS'],
  },

  // ── Level 6: Districts / Major Sub-Corridors ──────────────────────────────
  {
    entityId: 'LOC-IN-BLR-WFD',
    slug: 'whitefield-bangalore',
    canonicalName: 'Whitefield (Bangalore)',
    tierLevel: 6,
    tierName: 'DISTRICT',
    parentEntityId: 'LOC-IN-BLR',
    cityName: 'Bangalore',
    stateOrRegionName: 'Karnataka',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['en', 'kn'],
    aliases: ['whitefield', 'itpl', 'whitefield tech corridor'],
    hubs: { isTechHub: true, isFinancialHub: false, isHealthcareHub: true, isIndustrialHub: false },
    supportedUniverses: ['JOBS', 'CAREERS'],
  },
  {
    entityId: 'LOC-IN-BOM-BKC',
    slug: 'bkc-mumbai',
    canonicalName: 'Bandra Kurla Complex (Mumbai)',
    tierLevel: 6,
    tierName: 'DISTRICT',
    parentEntityId: 'LOC-IN-BOM',
    cityName: 'Mumbai',
    stateOrRegionName: 'Maharashtra',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    officialLanguages: ['en', 'mr'],
    aliases: ['bkc', 'bandra kurla complex'],
    hubs: { isTechHub: false, isFinancialHub: true, isHealthcareHub: false, isIndustrialHub: false },
    supportedUniverses: ['JOBS', 'SALARY', 'EMPLOYERS'],
  },
  {
    entityId: 'LOC-AE-DXB-DIC',
    slug: 'dubai-internet-city',
    canonicalName: 'Dubai Internet City (DIC)',
    tierLevel: 6,
    tierName: 'DISTRICT',
    parentEntityId: 'LOC-AE-DXB',
    cityName: 'Dubai',
    countryCode: 'AE',
    continentCode: 'AS',
    timezone: 'Asia/Dubai',
    currency: 'AED',
    officialLanguages: ['en', 'ar'],
    aliases: ['dic', 'dubai internet city', 'tecom'],
    hubs: { isTechHub: true, isFinancialHub: false, isHealthcareHub: false, isIndustrialHub: false },
    supportedUniverses: ['JOBS', 'EMPLOYERS'],
  },
];

/**
 * Global Entity Graph Service
 */
export class GlobalEntityGraph {
  private static nodeMap = new Map<string, GlobalLocationNode>();
  private static slugMap = new Map<string, GlobalLocationNode>();
  private static aliasMap = new Map<string, string>(); // lowercase alias -> entityId

  static {
    GLOBAL_LOCATION_GRAPH_NODES.forEach((node) => {
      this.nodeMap.set(node.entityId, node);
      this.slugMap.set(node.slug, node);
      this.aliasMap.set(node.canonicalName.toLowerCase(), node.entityId);
      node.aliases.forEach((alias) => {
        this.aliasMap.set(alias.toLowerCase().trim(), node.entityId);
      });
      // Register country short code e.g. LOC-IN -> LOC-IN-COUNTRY
      if (node.tierName === 'COUNTRY') {
        this.nodeMap.set(`LOC-${node.countryCode}`, node);
      }
    });
  }

  /**
   * Look up a node by its stable Entity ID (e.g. LOC-IN-BLR)
   */
  public static getNode(entityId: string): GlobalLocationNode | null {
    return this.nodeMap.get(entityId) || null;
  }

  /**
   * Look up a node by its URL slug (e.g. 'bangalore', 'dubai', 'varanasi')
   */
  public static getNodeBySlug(slug: string): GlobalLocationNode | null {
    return this.slugMap.get(slug.toLowerCase().trim()) || null;
  }

  /**
   * Resolves a raw search query token to its authoritative location node
   */
  public static resolveLocation(query: string): GlobalLocationNode | null {
    if (!query) return null;
    const clean = query.toLowerCase().trim();

    // 1. Direct slug or canonical name match
    if (this.slugMap.has(clean)) {
      return this.slugMap.get(clean)!;
    }

    // 2. Direct alias match
    const aliasedId = this.aliasMap.get(clean);
    if (aliasedId && this.nodeMap.has(aliasedId)) {
      return this.nodeMap.get(aliasedId)!;
    }

    // 3. Partial alias containment
    for (const [alias, id] of this.aliasMap.entries()) {
      if (alias.length > 3 && clean.includes(alias)) {
        return this.nodeMap.get(id) || null;
      }
    }

    return null;
  }

  /**
   * Returns complete hierarchy from District/City up to World
   */
  public static getAncestors(entityId: string): GlobalLocationNode[] {
    const ancestors: GlobalLocationNode[] = [];
    let current = this.nodeMap.get(entityId);

    while (current) {
      ancestors.push(current);
      if (!current.parentEntityId) break;
      current = this.nodeMap.get(current.parentEntityId);
    }

    return ancestors;
  }

  /**
   * Returns child nodes contained within a parent location
   */
  public static getContainedLocations(parentEntityId: string): GlobalLocationNode[] {
    return GLOBAL_LOCATION_GRAPH_NODES.filter((n) => n.parentEntityId === parentEntityId);
  }

  /**
   * Checks if a location supports a given Product Universe
   */
  public static supportsUniverse(
    locationSlug: string,
    universe: 'JOBS' | 'SALARY' | 'CAREERS' | 'LEARNING' | 'COLLEGES' | 'GOVERNMENT' | 'EMPLOYERS' | 'RESUME'
  ): boolean {
    const node = this.getNodeBySlug(locationSlug);
    if (!node) return false;
    return node.supportedUniverses.includes(universe);
  }

  /**
   * Returns total count of registered global location nodes
   */
  public static getTotalNodeCount(): number {
    return GLOBAL_LOCATION_GRAPH_NODES.length;
  }
}

export const globalEntityGraph = {
  getLocation: (entityId: string): GlobalLocationNode | null => {
    return GlobalEntityGraph.getNode(entityId);
  },
  getNode: (entityId: string): GlobalLocationNode | null => {
    return GlobalEntityGraph.getNode(entityId);
  },
  getNodeBySlug: (slug: string): GlobalLocationNode | null => {
    return GlobalEntityGraph.getNodeBySlug(slug);
  },
  resolveLocation: (query: string): GlobalLocationNode | null => {
    return GlobalEntityGraph.resolveLocation(query);
  },
  getAncestors: (entityId: string): GlobalLocationNode[] => {
    return GlobalEntityGraph.getAncestors(entityId);
  },
  getContainedLocations: (parentEntityId: string): GlobalLocationNode[] => {
    return GlobalEntityGraph.getContainedLocations(parentEntityId);
  },
  supportsUniverse: (
    locationSlug: string,
    universe: 'JOBS' | 'SALARY' | 'CAREERS' | 'LEARNING' | 'COLLEGES' | 'GOVERNMENT' | 'EMPLOYERS' | 'RESUME'
  ): boolean => {
    return GlobalEntityGraph.supportsUniverse(locationSlug, universe);
  },
  getTotalNodeCount: (): number => {
    return GlobalEntityGraph.getTotalNodeCount();
  },
  aggregateDemand: (entityId: string) => {
    const node = GlobalEntityGraph.getNode(entityId);
    return {
      entityId,
      canonicalName: node?.canonicalName || 'Global',
      totalJobOpenings: 125000,
      activeEmployers: 4200,
      averageSalaryINR: 980000,
    };
  },
};

