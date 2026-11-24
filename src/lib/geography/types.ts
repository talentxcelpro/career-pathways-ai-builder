// src/lib/geography/types.ts
/**
 * Global Geography Registry Type Definitions
 * Supports countries, states, provinces, territories, emirates, regions,
 * cities, metropolitan areas, aliases, and country-specific administrative structures.
 */

export type AdministrativeDivisionType = 
  | 'state' 
  | 'province' 
  | 'region' 
  | 'emirate' 
  | 'territory' 
  | 'prefecture' 
  | 'unitary' 
  | 'city-state';

export interface GeographicCountry {
  id: string;               // ISO 3166-1 alpha-2 (e.g. 'IN', 'US', 'GB', 'AE', 'CA', 'SG', 'DE', 'AU')
  name: string;             // Official English Name (e.g. 'India', 'United States')
  slug: string;             // Canonical URL slug (e.g. 'india', 'united-states')
  demonym: string;          // e.g. 'Indian', 'American', 'British'
  continent: string;        // 'Asia', 'North America', 'Europe', 'Oceania', etc.
  flag: string;             // Emoji flag (e.g. '🇮🇳', '🇺🇸')
  adminDivisionType: AdministrativeDivisionType;
  isDirectCityState?: boolean; // When true, state layer is unitary/omitted (e.g. Singapore, UAE/Dubai primary)
  metaTitleTemplate?: string;
  metaDescTemplate?: string;
}

export interface GeographicDivision {
  id: string;               // ISO 3166-2 or standardized ID (e.g. 'IN-UP', 'US-CA', 'CA-ON')
  countryId: string;        // References GeographicCountry.id
  name: string;             // Official Division Name (e.g. 'Uttar Pradesh', 'California', 'Ontario')
  slug: string;             // Canonical URL slug (e.g. 'uttar-pradesh', 'california', 'ontario')
  code: string;             // Short code (e.g. 'UP', 'CA', 'ON')
  type: AdministrativeDivisionType;
  aliases?: string[];       // Searchable aliases (e.g. ['U.P.', 'UP State'])
}

export interface GeographicCity {
  id: string;               // Standardized ID (e.g. 'in-up-noida', 'us-ca-san-francisco')
  countryId: string;        // References GeographicCountry.id
  divisionId?: string;      // References GeographicDivision.id (optional for city-states / unitary)
  name: string;             // Canonical City Name (e.g. 'Noida', 'San Francisco', 'Bengaluru')
  slug: string;             // Canonical URL slug (e.g. 'noida', 'san-francisco', 'bengaluru')
  metroArea?: string;       // Metropolitan Area (e.g. 'Delhi NCR', 'San Francisco Bay Area')
  aliases: string[];        // Searchable aliases (e.g. ['bangalore', 'bengalooru', 'blr'])
  tier: 1 | 2 | 3;          // Economic / Talent tier
  isTechHub?: boolean;      // Whether known as major tech/startup ecosystem
  approxCoordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ResolvedGeographicLocation {
  country: GeographicCountry;
  division?: GeographicDivision;
  city?: GeographicCity;
  canonicalPath: string;    // e.g. '/network/india/uttar-pradesh/noida' or '/network/united-kingdom/london'
  displayName: string;      // e.g. 'Noida, Uttar Pradesh, India' or 'London, United Kingdom'
  level: 'country' | 'division' | 'city';
}

export interface GeographicHierarchyResult {
  country: GeographicCountry | null;
  division: GeographicDivision | null;
  city: GeographicCity | null;
  isAmbiguous?: boolean;
  suggestions?: ResolvedGeographicLocation[];
}
