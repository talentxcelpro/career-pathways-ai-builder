/**
 * TalentXcel Global Jobs Network — 10,000–20,000 Global Locations Schema
 * Database-backed normalized location model avoiding programmatic SEO explosions.
 */

export type LocationTier = 'TIER_1' | 'TIER_2' | 'TIER_3' | 'GLOBAL_HUB';

export interface GlobalLocationEntity {
  location_id: string;             // UUID or canonical slug
  country_code: string;            // ISO 3166-1 alpha-2, e.g. 'IN', 'US'
  country_name: string;
  region_code?: string;            // State/province ISO code, e.g. 'UP', 'CA'
  region_name?: string;            // e.g. 'Uttar Pradesh', 'California'
  district?: string;               // Administrative district/county
  city: string;                    // Normalized canonical city name
  locality?: string;
  postal_codes: string[];
  latitude?: number;
  longitude?: number;
  timezone: string;                // e.g. 'Asia/Kolkata', 'America/New_York'
  currency: string;                // ISO 4217, e.g. 'INR', 'USD'
  languages: string[];
  tier: LocationTier;
  population_band?: string;        // e.g. '10M+', '1M-5M'
  employment_market: string;       // e.g. 'National Capital Region', 'Silicon Valley'
  aliases: string[];               // Historical, colloquial, or abbreviations
  canonical_slug: string;          // e.g. 'mumbai-maharashtra-india'
  active: boolean;
}
