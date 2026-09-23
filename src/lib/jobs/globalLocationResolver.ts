/**
 * TalentXcel Global Jobs Network — Hierarchical Location Resolver
 * Maps colloquial, historical, and multi-lingual variants to canonical locations.
 * Computes location_confidence (1.00 city -> 0.60 country-only) to strictly
 * prevent thin city pages when only country is known.
 */

import { GlobalLocationEntity } from '@/config/jobs/globalLocationsSchema';

export interface LocationResolutionResult {
  countryCode: string;
  countryName: string;
  regionCode?: string;
  regionName?: string;
  city?: string;
  district?: string;
  locationConfidence: number; // 1.00 (City) -> 0.90 (District) -> 0.75 (Region) -> 0.60 (Country)
  canonicalSlug?: string;
  isCityLevelVerified: boolean;
}

export class GlobalLocationResolver {
  // Alias mapping dictionary
  private static aliasMap: Record<string, { city: string; region: string; regionCode: string; countryCode: string; countryName: string }> = {
    'bombay': { city: 'Mumbai', region: 'Maharashtra', regionCode: 'MH', countryCode: 'IN', countryName: 'India' },
    'mumbai': { city: 'Mumbai', region: 'Maharashtra', regionCode: 'MH', countryCode: 'IN', countryName: 'India' },
    'bangalore': { city: 'Bengaluru', region: 'Karnataka', regionCode: 'KA', countryCode: 'IN', countryName: 'India' },
    'bengaluru': { city: 'Bengaluru', region: 'Karnataka', regionCode: 'KA', countryCode: 'IN', countryName: 'India' },
    'calcutta': { city: 'Kolkata', region: 'West Bengal', regionCode: 'WB', countryCode: 'IN', countryName: 'India' },
    'kolkata': { city: 'Kolkata', region: 'West Bengal', regionCode: 'WB', countryCode: 'IN', countryName: 'India' },
    'madras': { city: 'Chennai', region: 'Tamil Nadu', regionCode: 'TN', countryCode: 'IN', countryName: 'India' },
    'chennai': { city: 'Chennai', region: 'Tamil Nadu', regionCode: 'TN', countryCode: 'IN', countryName: 'India' },
    'delhi': { city: 'New Delhi', region: 'Delhi', regionCode: 'DL', countryCode: 'IN', countryName: 'India' },
    'new delhi': { city: 'New Delhi', region: 'Delhi', regionCode: 'DL', countryCode: 'IN', countryName: 'India' },
    'ncr': { city: 'New Delhi', region: 'Delhi', regionCode: 'DL', countryCode: 'IN', countryName: 'India' },
    'noida': { city: 'Noida', region: 'Uttar Pradesh', regionCode: 'UP', countryCode: 'IN', countryName: 'India' },
    'lucknow': { city: 'Lucknow', region: 'Uttar Pradesh', regionCode: 'UP', countryCode: 'IN', countryName: 'India' },
    'hyderabad': { city: 'Hyderabad', region: 'Telangana', regionCode: 'TS', countryCode: 'IN', countryName: 'India' },
    'pune': { city: 'Pune', region: 'Maharashtra', regionCode: 'MH', countryCode: 'IN', countryName: 'India' },
    'washington': { city: 'Washington', region: 'District of Columbia', regionCode: 'DC', countryCode: 'US', countryName: 'United States' },
    'washington dc': { city: 'Washington', region: 'District of Columbia', regionCode: 'DC', countryCode: 'US', countryName: 'United States' },
    'nyc': { city: 'New York', region: 'New York', regionCode: 'NY', countryCode: 'US', countryName: 'United States' },
    'new york': { city: 'New York', region: 'New York', regionCode: 'NY', countryCode: 'US', countryName: 'United States' },
    'austin': { city: 'Austin', region: 'Texas', regionCode: 'TX', countryCode: 'US', countryName: 'United States' },
    'london': { city: 'London', region: 'Greater London', regionCode: 'ENG', countryCode: 'GB', countryName: 'United Kingdom' },
  };

  /**
   * Resolve location string into normalized entity with confidence score
   */
  public static resolve(rawLocation: string, defaultCountry = 'IN'): LocationResolutionResult {
    const raw = (rawLocation || '').toLowerCase().trim();

    if (!raw || raw === 'remote' || raw === 'all india' || raw === 'nationwide') {
      return {
        countryCode: defaultCountry,
        countryName: defaultCountry === 'US' ? 'United States' : 'India',
        locationConfidence: 0.60, // Country level only
        isCityLevelVerified: false,
      };
    }

    // Check alias mapping
    for (const [alias, data] of Object.entries(this.aliasMap)) {
      if (raw.includes(alias)) {
        return {
          countryCode: data.countryCode,
          countryName: data.countryName,
          regionCode: data.regionCode,
          regionName: data.region,
          city: data.city,
          locationConfidence: 1.00, // Exact City
          canonicalSlug: `${data.city.toLowerCase()}-${data.region.toLowerCase()}-${data.countryCode.toLowerCase()}`,
          isCityLevelVerified: true,
        };
      }
    }

    // State / Region detection
    if (raw.includes('uttar pradesh') || raw.includes('up')) {
      return {
        countryCode: 'IN',
        countryName: 'India',
        regionCode: 'UP',
        regionName: 'Uttar Pradesh',
        locationConfidence: 0.75, // Region level
        isCityLevelVerified: false,
      };
    }

    // Fallback: Country level
    return {
      countryCode: defaultCountry,
      countryName: defaultCountry === 'US' ? 'United States' : 'India',
      locationConfidence: 0.60,
      isCityLevelVerified: false,
    };
  }
}
