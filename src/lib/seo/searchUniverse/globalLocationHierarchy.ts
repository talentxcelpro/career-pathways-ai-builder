// src/lib/seo/searchUniverse/globalLocationHierarchy.ts
/**
 * TalentXcel Global Location Hierarchy & Relationship Graph Engine
 *
 * Models the complete multi-tier world geography:
 * World (0) -> Continent (1) -> Country (2) -> State/Province (3) -> Metro (4) -> City (5) -> District/Corridor (6)
 *
 * Includes:
 * - Deterministic edge navigation (CITY_OF, METRO_OF, STATE_OF, WITHIN, NEAR, ALTERNATIVE_NAME)
 * - Complete administrative metadata: Lat/Long, Timezone, Currency, Language Codes, Population
 * - Multi-regional hubs: India, US, UK, Canada, UAE/GCC, Germany/EU, Singapore, Australia, etc.
 */

export type LocationAdminLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type LocationRelationshipType =
  | 'COUNTRY_OF'
  | 'STATE_OF'
  | 'CITY_OF'
  | 'METRO_OF'
  | 'NEAR'
  | 'WITHIN'
  | 'ALTERNATIVE_NAME';

export interface LocationHierarchyNode {
  id: string; // unique slug
  canonicalName: string;
  slug: string;
  type: 'WORLD' | 'CONTINENT' | 'COUNTRY' | 'STATE' | 'METRO' | 'CITY' | 'DISTRICT' | 'SPECIAL';
  adminLevel: LocationAdminLevel;
  parentSlug?: string;
  countryCode: string; // ISO 3166-1 alpha-2
  continentCode: string; // AF, AS, EU, NA, OC, SA
  regionCode?: string; // ISO 3166-2 sub-national code
  latitude?: number;
  longitude?: number;
  timezone: string;
  currency: string;
  languageCodes: string[];
  population?: number;
  countryName: string;
  stateName?: string;
  cityName?: string;
  metroSlug?: string;
  aliases: string[];
  isTechHub: boolean;
}

export interface LocationEdgeNode {
  sourceSlug: string;
  targetSlug: string;
  relationship: LocationRelationshipType;
  distanceKm?: number;
  description?: string;
}

// Global Core Geographic Hierarchy Dataset
export const COMPREHENSIVE_GLOBAL_LOCATIONS: LocationHierarchyNode[] = [
  // --- 0. Special Global Virtual Entities ---
  {
    id: 'worldwide',
    canonicalName: 'Worldwide (Remote)',
    slug: 'remote',
    type: 'SPECIAL',
    adminLevel: 0,
    countryCode: 'GLOBAL',
    continentCode: 'GLOBAL',
    timezone: 'UTC',
    currency: 'USD',
    languageCodes: ['en'],
    countryName: 'Global',
    aliases: ['remote', 'wfh', 'work from anywhere', 'telecommute', 'remote-worldwide', 'global-remote'],
    isTechHub: true,
  },

  // --- 1. Sovereign Countries (Level 2) ---
  {
    id: 'india',
    canonicalName: 'India',
    slug: 'india',
    type: 'COUNTRY',
    adminLevel: 2,
    countryCode: 'IN',
    continentCode: 'AS',
    latitude: 20.5937,
    longitude: 78.9629,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['en', 'hi'],
    population: 1428627663,
    countryName: 'India',
    aliases: ['in', 'bharat', 'ind'],
    isTechHub: true,
  },
  {
    id: 'united-states',
    canonicalName: 'United States',
    slug: 'united-states',
    type: 'COUNTRY',
    adminLevel: 2,
    countryCode: 'US',
    continentCode: 'NA',
    latitude: 37.0902,
    longitude: -95.7129,
    timezone: 'America/New_York',
    currency: 'USD',
    languageCodes: ['en'],
    population: 339996563,
    countryName: 'United States',
    aliases: ['usa', 'us', 'america', 'united states of america'],
    isTechHub: true,
  },
  {
    id: 'united-arab-emirates',
    canonicalName: 'United Arab Emirates',
    slug: 'united-arab-emirates',
    type: 'COUNTRY',
    adminLevel: 2,
    countryCode: 'AE',
    continentCode: 'AS',
    latitude: 23.4241,
    longitude: 53.8478,
    timezone: 'Asia/Dubai',
    currency: 'AED',
    languageCodes: ['en', 'ar'],
    population: 9441129,
    countryName: 'United Arab Emirates',
    aliases: ['uae', 'emirates'],
    isTechHub: true,
  },
  {
    id: 'united-kingdom',
    canonicalName: 'United Kingdom',
    slug: 'united-kingdom',
    type: 'COUNTRY',
    adminLevel: 2,
    countryCode: 'GB',
    continentCode: 'EU',
    latitude: 55.3781,
    longitude: -3.436,
    timezone: 'Europe/London',
    currency: 'GBP',
    languageCodes: ['en'],
    population: 67736802,
    countryName: 'United Kingdom',
    aliases: ['uk', 'britain', 'great britain'],
    isTechHub: true,
  },
  {
    id: 'germany',
    canonicalName: 'Germany',
    slug: 'germany',
    type: 'COUNTRY',
    adminLevel: 2,
    countryCode: 'DE',
    continentCode: 'EU',
    latitude: 51.1657,
    longitude: 10.4515,
    timezone: 'Europe/Berlin',
    currency: 'EUR',
    languageCodes: ['de', 'en'],
    population: 83200000,
    countryName: 'Germany',
    aliases: ['deutschland', 'de'],
    isTechHub: true,
  },
  {
    id: 'canada',
    canonicalName: 'Canada',
    slug: 'canada',
    type: 'COUNTRY',
    adminLevel: 2,
    countryCode: 'CA',
    continentCode: 'NA',
    latitude: 56.1304,
    longitude: -106.3468,
    timezone: 'America/Toronto',
    currency: 'CAD',
    languageCodes: ['en', 'fr'],
    population: 38250000,
    countryName: 'Canada',
    aliases: ['ca'],
    isTechHub: true,
  },
  {
    id: 'singapore',
    canonicalName: 'Singapore',
    slug: 'singapore',
    type: 'COUNTRY',
    adminLevel: 2,
    countryCode: 'SG',
    continentCode: 'AS',
    latitude: 1.3521,
    longitude: 103.8198,
    timezone: 'Asia/Singapore',
    currency: 'SGD',
    languageCodes: ['en', 'zh', 'ms', 'ta'],
    population: 5637000,
    countryName: 'Singapore',
    aliases: ['sg', 'lion city'],
    isTechHub: true,
  },
  {
    id: 'australia',
    canonicalName: 'Australia',
    slug: 'australia',
    type: 'COUNTRY',
    adminLevel: 2,
    countryCode: 'AU',
    continentCode: 'OC',
    latitude: -25.2744,
    longitude: 133.7751,
    timezone: 'Australia/Sydney',
    currency: 'AUD',
    languageCodes: ['en'],
    population: 25690000,
    countryName: 'Australia',
    aliases: ['au', 'oz'],
    isTechHub: true,
  },

  // --- 2. States / Regions (Level 3) ---
  {
    id: 'karnataka',
    canonicalName: 'Karnataka',
    slug: 'karnataka',
    type: 'STATE',
    adminLevel: 3,
    parentSlug: 'india',
    countryCode: 'IN',
    continentCode: 'AS',
    regionCode: 'IN-KA',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['kn', 'en'],
    population: 61130704,
    countryName: 'India',
    stateName: 'Karnataka',
    aliases: ['ka'],
    isTechHub: true,
  },
  {
    id: 'maharashtra',
    canonicalName: 'Maharashtra',
    slug: 'maharashtra',
    type: 'STATE',
    adminLevel: 3,
    parentSlug: 'india',
    countryCode: 'IN',
    continentCode: 'AS',
    regionCode: 'IN-MH',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['mr', 'en', 'hi'],
    population: 112374333,
    countryName: 'India',
    stateName: 'Maharashtra',
    aliases: ['mh'],
    isTechHub: true,
  },
  {
    id: 'telangana',
    canonicalName: 'Telangana',
    slug: 'telangana',
    type: 'STATE',
    adminLevel: 3,
    parentSlug: 'india',
    countryCode: 'IN',
    continentCode: 'AS',
    regionCode: 'IN-TG',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['te', 'en'],
    population: 35193978,
    countryName: 'India',
    stateName: 'Telangana',
    aliases: ['tg', 'ts'],
    isTechHub: true,
  },
  {
    id: 'tamil-nadu',
    canonicalName: 'Tamil Nadu',
    slug: 'tamil-nadu',
    type: 'STATE',
    adminLevel: 3,
    parentSlug: 'india',
    countryCode: 'IN',
    continentCode: 'AS',
    regionCode: 'IN-TN',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['ta', 'en'],
    population: 72147030,
    countryName: 'India',
    stateName: 'Tamil Nadu',
    aliases: ['tn'],
    isTechHub: true,
  },
  {
    id: 'delhi-ncr-state',
    canonicalName: 'National Capital Region',
    slug: 'ncr-region',
    type: 'STATE',
    adminLevel: 3,
    parentSlug: 'india',
    countryCode: 'IN',
    continentCode: 'AS',
    regionCode: 'IN-DL',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['hi', 'en'],
    population: 46000000,
    countryName: 'India',
    stateName: 'Delhi NCR',
    aliases: ['ncr'],
    isTechHub: true,
  },
  {
    id: 'california',
    canonicalName: 'California',
    slug: 'california',
    type: 'STATE',
    adminLevel: 3,
    parentSlug: 'united-states',
    countryCode: 'US',
    continentCode: 'NA',
    regionCode: 'US-CA',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    languageCodes: ['en'],
    population: 39000000,
    countryName: 'United States',
    stateName: 'California',
    aliases: ['ca', 'cali'],
    isTechHub: true,
  },
  {
    id: 'new-york-state',
    canonicalName: 'New York State',
    slug: 'new-york-state',
    type: 'STATE',
    adminLevel: 3,
    parentSlug: 'united-states',
    countryCode: 'US',
    continentCode: 'NA',
    regionCode: 'US-NY',
    timezone: 'America/New_York',
    currency: 'USD',
    languageCodes: ['en'],
    population: 19500000,
    countryName: 'United States',
    stateName: 'New York',
    aliases: ['ny-state', 'nys'],
    isTechHub: true,
  },

  // --- 3. Metros & Clusters (Level 4) ---
  {
    id: 'delhi-ncr',
    canonicalName: 'Delhi NCR',
    slug: 'delhi-ncr',
    type: 'METRO',
    adminLevel: 4,
    parentSlug: 'ncr-region',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['en', 'hi'],
    population: 32000000,
    countryName: 'India',
    stateName: 'Delhi',
    aliases: ['delhi-ncr', 'ncr', 'national capital region', 'delhi capital'],
    isTechHub: true,
  },
  {
    id: 'bay-area',
    canonicalName: 'San Francisco Bay Area',
    slug: 'san-francisco-bay-area',
    type: 'METRO',
    adminLevel: 4,
    parentSlug: 'california',
    countryCode: 'US',
    continentCode: 'NA',
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    languageCodes: ['en'],
    population: 7750000,
    countryName: 'United States',
    stateName: 'California',
    aliases: ['bay area', 'sf bay area', 'silicon valley'],
    isTechHub: true,
  },
  {
    id: 'new-york-metro',
    canonicalName: 'New York Metropolitan Area',
    slug: 'new-york-metro',
    type: 'METRO',
    adminLevel: 4,
    parentSlug: 'new-york-state',
    countryCode: 'US',
    continentCode: 'NA',
    timezone: 'America/New_York',
    currency: 'USD',
    languageCodes: ['en'],
    population: 20140000,
    countryName: 'United States',
    stateName: 'New York',
    aliases: ['tri-state', 'greater new york'],
    isTechHub: true,
  },
  {
    id: 'greater-london',
    canonicalName: 'Greater London',
    slug: 'greater-london',
    type: 'METRO',
    adminLevel: 4,
    parentSlug: 'united-kingdom',
    countryCode: 'GB',
    continentCode: 'EU',
    timezone: 'Europe/London',
    currency: 'GBP',
    languageCodes: ['en'],
    population: 9000000,
    countryName: 'United Kingdom',
    aliases: ['london metro'],
    isTechHub: true,
  },

  // --- 4. Primary Cities (Level 5) ---
  {
    id: 'bangalore',
    canonicalName: 'Bangalore',
    slug: 'bangalore',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'karnataka',
    countryCode: 'IN',
    continentCode: 'AS',
    latitude: 12.9716,
    longitude: 77.5946,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['en', 'kn'],
    population: 13193000,
    countryName: 'India',
    stateName: 'Karnataka',
    cityName: 'Bangalore',
    aliases: ['bengaluru', 'blr', 'banglore', 'silicon valley of india'],
    isTechHub: true,
  },
  {
    id: 'mumbai',
    canonicalName: 'Mumbai',
    slug: 'mumbai',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'maharashtra',
    countryCode: 'IN',
    continentCode: 'AS',
    latitude: 19.076,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['en', 'mr', 'hi'],
    population: 20961000,
    countryName: 'India',
    stateName: 'Maharashtra',
    cityName: 'Mumbai',
    aliases: ['bombay', 'bom', 'navi mumbai'],
    isTechHub: true,
  },
  {
    id: 'hyderabad',
    canonicalName: 'Hyderabad',
    slug: 'hyderabad',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'telangana',
    countryCode: 'IN',
    continentCode: 'AS',
    latitude: 17.385,
    longitude: 78.4867,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['en', 'te'],
    population: 10534000,
    countryName: 'India',
    stateName: 'Telangana',
    cityName: 'Hyderabad',
    aliases: ['hyd', 'cyberabad', 'secunderabad'],
    isTechHub: true,
  },
  {
    id: 'pune',
    canonicalName: 'Pune',
    slug: 'pune',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'maharashtra',
    countryCode: 'IN',
    continentCode: 'AS',
    latitude: 18.5204,
    longitude: 73.8567,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['en', 'mr'],
    population: 6987000,
    countryName: 'India',
    stateName: 'Maharashtra',
    cityName: 'Pune',
    aliases: ['poona', 'pnq'],
    isTechHub: true,
  },
  {
    id: 'chennai',
    canonicalName: 'Chennai',
    slug: 'chennai',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'tamil-nadu',
    countryCode: 'IN',
    continentCode: 'AS',
    latitude: 13.0827,
    longitude: 80.2707,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['en', 'ta'],
    population: 11503000,
    countryName: 'India',
    stateName: 'Tamil Nadu',
    cityName: 'Chennai',
    aliases: ['madras', 'maa'],
    isTechHub: true,
  },
  {
    id: 'gurgaon',
    canonicalName: 'Gurgaon',
    slug: 'gurgaon',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'ncr-region',
    metroSlug: 'delhi-ncr',
    countryCode: 'IN',
    continentCode: 'AS',
    latitude: 28.4595,
    longitude: 77.0266,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['en', 'hi'],
    population: 1153000,
    countryName: 'India',
    stateName: 'Haryana',
    cityName: 'Gurgaon',
    aliases: ['gurugram', 'ggn', 'cyber city'],
    isTechHub: true,
  },
  {
    id: 'noida',
    canonicalName: 'Noida',
    slug: 'noida',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'ncr-region',
    metroSlug: 'delhi-ncr',
    countryCode: 'IN',
    continentCode: 'AS',
    latitude: 28.5355,
    longitude: 77.391,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['en', 'hi'],
    population: 637000,
    countryName: 'India',
    stateName: 'Uttar Pradesh',
    cityName: 'Noida',
    aliases: ['greater noida'],
    isTechHub: true,
  },
  {
    id: 'new-delhi',
    canonicalName: 'Delhi',
    slug: 'delhi',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'ncr-region',
    metroSlug: 'delhi-ncr',
    countryCode: 'IN',
    continentCode: 'AS',
    latitude: 28.6139,
    longitude: 77.209,
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['en', 'hi'],
    population: 16787941,
    countryName: 'India',
    stateName: 'Delhi',
    cityName: 'Delhi',
    aliases: ['new delhi', 'del', 'dilli'],
    isTechHub: true,
  },
  {
    id: 'dubai-city',
    canonicalName: 'Dubai',
    slug: 'dubai',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'united-arab-emirates',
    countryCode: 'AE',
    continentCode: 'AS',
    latitude: 25.2048,
    longitude: 55.2708,
    timezone: 'Asia/Dubai',
    currency: 'AED',
    languageCodes: ['en', 'ar'],
    population: 3490000,
    countryName: 'United Arab Emirates',
    stateName: 'Dubai',
    cityName: 'Dubai',
    aliases: ['dxb', 'dubai city', 'uae-dubai'],
    isTechHub: true,
  },
  {
    id: 'abu-dhabi',
    canonicalName: 'Abu Dhabi',
    slug: 'abu-dhabi',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'united-arab-emirates',
    countryCode: 'AE',
    continentCode: 'AS',
    latitude: 24.4539,
    longitude: 54.3773,
    timezone: 'Asia/Dubai',
    currency: 'AED',
    languageCodes: ['en', 'ar'],
    population: 1540000,
    countryName: 'United Arab Emirates',
    stateName: 'Abu Dhabi',
    cityName: 'Abu Dhabi',
    aliases: ['auh'],
    isTechHub: true,
  },
  {
    id: 'london-city',
    canonicalName: 'London',
    slug: 'london',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'united-kingdom',
    metroSlug: 'greater-london',
    countryCode: 'GB',
    continentCode: 'EU',
    latitude: 51.5074,
    longitude: -0.1278,
    timezone: 'Europe/London',
    currency: 'GBP',
    languageCodes: ['en'],
    population: 8982000,
    countryName: 'United Kingdom',
    cityName: 'London',
    aliases: ['lon', 'central london'],
    isTechHub: true,
  },
  {
    id: 'new-york-city',
    canonicalName: 'New York City',
    slug: 'new-york',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'new-york-state',
    metroSlug: 'new-york-metro',
    countryCode: 'US',
    continentCode: 'NA',
    latitude: 40.7128,
    longitude: -74.006,
    timezone: 'America/New_York',
    currency: 'USD',
    languageCodes: ['en'],
    population: 8336817,
    countryName: 'United States',
    stateName: 'New York',
    cityName: 'New York City',
    aliases: ['nyc', 'new york city', 'ny', 'manhattan'],
    isTechHub: true,
  },
  {
    id: 'san-francisco',
    canonicalName: 'San Francisco',
    slug: 'san-francisco',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'california',
    metroSlug: 'san-francisco-bay-area',
    countryCode: 'US',
    continentCode: 'NA',
    latitude: 37.7749,
    longitude: -122.4194,
    timezone: 'America/Los_Angeles',
    currency: 'USD',
    languageCodes: ['en'],
    population: 808437,
    countryName: 'United States',
    stateName: 'California',
    cityName: 'San Francisco',
    aliases: ['sf', 'san fran', 'frisco'],
    isTechHub: true,
  },
  {
    id: 'berlin',
    canonicalName: 'Berlin',
    slug: 'berlin',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'germany',
    countryCode: 'DE',
    continentCode: 'EU',
    latitude: 52.52,
    longitude: 13.405,
    timezone: 'Europe/Berlin',
    currency: 'EUR',
    languageCodes: ['de', 'en'],
    population: 3645000,
    countryName: 'Germany',
    cityName: 'Berlin',
    aliases: ['ber'],
    isTechHub: true,
  },
  {
    id: 'toronto',
    canonicalName: 'Toronto',
    slug: 'toronto',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'canada',
    countryCode: 'CA',
    continentCode: 'NA',
    latitude: 43.6532,
    longitude: -79.3832,
    timezone: 'America/Toronto',
    currency: 'CAD',
    languageCodes: ['en'],
    population: 2794356,
    countryName: 'Canada',
    stateName: 'Ontario',
    cityName: 'Toronto',
    aliases: ['gta', 'greater toronto'],
    isTechHub: true,
  },
  {
    id: 'sydney',
    canonicalName: 'Sydney',
    slug: 'sydney',
    type: 'CITY',
    adminLevel: 5,
    parentSlug: 'australia',
    countryCode: 'AU',
    continentCode: 'OC',
    latitude: -33.8688,
    longitude: 151.2093,
    timezone: 'Australia/Sydney',
    currency: 'AUD',
    languageCodes: ['en'],
    population: 5312000,
    countryName: 'Australia',
    stateName: 'New South Wales',
    cityName: 'Sydney',
    aliases: ['syd'],
    isTechHub: true,
  },

  // --- 5. High-Impact Technology Districts (Level 6) ---
  {
    id: 'whitefield',
    canonicalName: 'Whitefield',
    slug: 'whitefield-bangalore',
    type: 'DISTRICT',
    adminLevel: 6,
    parentSlug: 'bangalore',
    countryCode: 'IN',
    continentCode: 'AS',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    languageCodes: ['en', 'kn'],
    countryName: 'India',
    stateName: 'Karnataka',
    cityName: 'Bangalore',
    aliases: ['whitefield', 'itpl'],
    isTechHub: true,
  },
  {
    id: 'manhattan',
    canonicalName: 'Manhattan',
    slug: 'manhattan-nyc',
    type: 'DISTRICT',
    adminLevel: 6,
    parentSlug: 'new-york',
    countryCode: 'US',
    continentCode: 'NA',
    timezone: 'America/New_York',
    currency: 'USD',
    languageCodes: ['en'],
    countryName: 'United States',
    stateName: 'New York',
    cityName: 'New York City',
    aliases: ['manhattan', 'midtown', 'wall street', 'downtown nyc'],
    isTechHub: true,
  },
  {
    id: 'silicon-roundabout',
    canonicalName: 'Shoreditch Tech City',
    slug: 'shoreditch-london',
    type: 'DISTRICT',
    adminLevel: 6,
    parentSlug: 'london',
    countryCode: 'GB',
    continentCode: 'EU',
    timezone: 'Europe/London',
    currency: 'GBP',
    languageCodes: ['en'],
    countryName: 'United Kingdom',
    cityName: 'London',
    aliases: ['silicon roundabout', 'tech city london', 'shoreditch'],
    isTechHub: true,
  },
];

// Explicit Geographic Relationships (location_edges)
export const COMPREHENSIVE_LOCATION_EDGES: LocationEdgeNode[] = [
  // India Hierarchy
  { sourceSlug: 'karnataka', targetSlug: 'india', relationship: 'STATE_OF' },
  { sourceSlug: 'maharashtra', targetSlug: 'india', relationship: 'STATE_OF' },
  { sourceSlug: 'telangana', targetSlug: 'india', relationship: 'STATE_OF' },
  { sourceSlug: 'tamil-nadu', targetSlug: 'india', relationship: 'STATE_OF' },
  { sourceSlug: 'ncr-region', targetSlug: 'india', relationship: 'STATE_OF' },

  { sourceSlug: 'bangalore', targetSlug: 'karnataka', relationship: 'CITY_OF' },
  { sourceSlug: 'mumbai', targetSlug: 'maharashtra', relationship: 'CITY_OF' },
  { sourceSlug: 'pune', targetSlug: 'maharashtra', relationship: 'CITY_OF' },
  { sourceSlug: 'hyderabad', targetSlug: 'telangana', relationship: 'CITY_OF' },
  { sourceSlug: 'chennai', targetSlug: 'tamil-nadu', relationship: 'CITY_OF' },

  // Delhi NCR Agglomeration (WITHIN / METRO_OF)
  { sourceSlug: 'delhi', targetSlug: 'delhi-ncr', relationship: 'WITHIN' },
  { sourceSlug: 'gurgaon', targetSlug: 'delhi-ncr', relationship: 'WITHIN' },
  { sourceSlug: 'noida', targetSlug: 'delhi-ncr', relationship: 'WITHIN' },
  { sourceSlug: 'gurgaon', targetSlug: 'delhi', relationship: 'NEAR', distanceKm: 28 },
  { sourceSlug: 'noida', targetSlug: 'delhi', relationship: 'NEAR', distanceKm: 22 },

  // USA Hierarchy & New York Network
  { sourceSlug: 'california', targetSlug: 'united-states', relationship: 'STATE_OF' },
  { sourceSlug: 'new-york-state', targetSlug: 'united-states', relationship: 'STATE_OF' },
  { sourceSlug: 'san-francisco', targetSlug: 'california', relationship: 'CITY_OF' },
  { sourceSlug: 'san-francisco', targetSlug: 'san-francisco-bay-area', relationship: 'METRO_OF' },
  { sourceSlug: 'new-york', targetSlug: 'new-york-state', relationship: 'CITY_OF' },
  { sourceSlug: 'new-york', targetSlug: 'new-york-metro', relationship: 'METRO_OF' },
  { sourceSlug: 'manhattan-nyc', targetSlug: 'new-york', relationship: 'WITHIN' },

  // UK Hierarchy
  { sourceSlug: 'london', targetSlug: 'united-kingdom', relationship: 'CITY_OF' },
  { sourceSlug: 'london', targetSlug: 'greater-london', relationship: 'METRO_OF' },
  { sourceSlug: 'shoreditch-london', targetSlug: 'london', relationship: 'WITHIN' },

  // UAE Hierarchy
  { sourceSlug: 'dubai', targetSlug: 'united-arab-emirates', relationship: 'CITY_OF' },
  { sourceSlug: 'abu-dhabi', targetSlug: 'united-arab-emirates', relationship: 'CITY_OF' },
  { sourceSlug: 'dubai', targetSlug: 'abu-dhabi', relationship: 'NEAR', distanceKm: 130 },
];

export class GlobalLocationHierarchy {
  private static catalogMap = new Map<string, LocationHierarchyNode>();
  private static aliasMap = new Map<string, string>(); // alias.toLowerCase() -> canonical slug

  static {
    COMPREHENSIVE_GLOBAL_LOCATIONS.forEach(loc => {
      this.catalogMap.set(loc.slug, loc);
      this.catalogMap.set(loc.canonicalName.toLowerCase(), loc);
      loc.aliases.forEach(a => this.aliasMap.set(a.toLowerCase().trim(), loc.slug));
    });
  }

  /**
   * Resolve any raw query token (e.g. 'blr', 'nyc', 'dxb', 'manhattan', 'gurgaon') to canonical location node
   */
  static resolveLocation(query: string): LocationHierarchyNode | null {
    if (!query) return null;
    const clean = query.toLowerCase().trim();

    // 1. Direct slug or canonical name match
    if (this.catalogMap.has(clean)) {
      return this.catalogMap.get(clean)!;
    }

    // 2. Alias resolution
    const aliasedSlug = this.aliasMap.get(clean);
    if (aliasedSlug && this.catalogMap.has(aliasedSlug)) {
      return this.catalogMap.get(aliasedSlug)!;
    }

    // 3. Partial / Token containment (only for longer phrases > 3 chars to avoid false substring matches)
    for (const [alias, slug] of this.aliasMap.entries()) {
      if (clean === alias || (alias.length > 3 && clean.includes(alias))) {
        return this.catalogMap.get(slug) || null;
      }
    }

    return null;
  }

  /**
   * Returns complete ancestor hierarchy: District -> City -> Metro -> State -> Country -> World
   */
  static getAncestorHierarchy(locationSlug: string): LocationHierarchyNode[] {
    const hierarchy: LocationHierarchyNode[] = [];
    let current = this.catalogMap.get(locationSlug);

    while (current) {
      hierarchy.push(current);
      if (!current.parentSlug) break;
      current = this.catalogMap.get(current.parentSlug);
    }

    return hierarchy;
  }

  /**
   * Get all child cities/districts within an administrative parent or metro
   */
  static getContainedEntities(parentOrMetroSlug: string): LocationHierarchyNode[] {
    return COMPREHENSIVE_GLOBAL_LOCATIONS.filter(
      l => l.parentSlug === parentOrMetroSlug || l.metroSlug === parentOrMetroSlug
    );
  }

  /**
   * Get geographic neighbors / nearby economic clusters
   */
  static getNearbyLocations(locationSlug: string): LocationHierarchyNode[] {
    const nearbySlugs = COMPREHENSIVE_LOCATION_EDGES
      .filter(e => (e.sourceSlug === locationSlug || e.targetSlug === locationSlug) && e.relationship === 'NEAR')
      .map(e => (e.sourceSlug === locationSlug ? e.targetSlug : e.sourceSlug));

    return nearbySlugs
      .map(s => this.catalogMap.get(s))
      .filter((l): l is LocationHierarchyNode => Boolean(l));
  }
}
