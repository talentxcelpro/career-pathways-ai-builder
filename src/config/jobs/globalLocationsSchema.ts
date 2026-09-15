// src/config/jobs/globalLocationsSchema.ts
// Canonical Schema for TalentXcel 100,000+ Global Location Universe
// Provides hierarchical geographic resolution across Country -> Region/State -> Metro -> City -> District

export type LocationType = 'country' | 'state' | 'metro' | 'city' | 'district';

export interface GlobalLocation {
  id: string;
  countryCode: string;       // ISO 3166-1 alpha-2 lowercase (e.g. 'in', 'us', 'gb', 'ae')
  countryName: string;       // Normalized English country name
  stateRegion?: string;      // State, Province, Emirate, Prefecture, or Department
  city: string;              // Primary city or municipality name
  metro?: string;            // Metropolitan statistical area / Urban agglomeration
  district?: string;         // District, Borough, Ward, or Locality
  locality?: string;         // Micro-locality or neighborhood
  latitude?: number;
  longitude?: number;
  timezone?: string;         // IANA timezone identifier (e.g. 'Asia/Kolkata', 'America/New_York')
  currency?: string;         // ISO 4217 currency code (e.g. 'INR', 'USD', 'GBP', 'AED')
  language?: string;         // Primary spoken/business language code
  population?: number;
  slug: string;              // Canonical URL slug (kebab-case)
  parentLocationId?: string; // ID of parent region/metro
  locationType: LocationType;
  active: boolean;           // True if eligible for employer posting
  jobInventory: number;      // Live verified count of active job postings
  lastSyncAt?: string;       // Timestamp of last inventory/sitemap sync
}

export interface CountryMetadata {
  code: string;              // ISO 3166-1 alpha-2 lowercase
  codeAlpha3: string;        // ISO 3166-1 alpha-3 uppercase
  name: string;
  nativeName?: string;
  flagEmoji: string;
  continent: 'Asia' | 'Europe' | 'North America' | 'South America' | 'Africa' | 'Oceania';
  tier: 1 | 2 | 3;           // 1: Primary global tech/commercial hub; 2: Regional growth market; 3: Emerging
  currency: string;
  currencySymbol: string;
  languages: string[];
  defaultTimezone: string;
  callingCode: string;
  totalLocations: number;
  activeJobs: number;
  googleEligibleJobs: number;
  blockedJobs: number;
  indexableDiscoveryPages: number;
  noindexDiscoveryPages: number;
  sitemapShardsCount: number;
}
