/**
 * TalentXcel Global Jobs Network — Country Source Discovery
 * Jurisdictional directory scanner for official public sector portals by country.
 */

import { GOVERNMENT_COUNTRIES } from '@/config/jobs/governmentCountries';

export interface CountrySourceSeed {
  countryCode: string;
  primaryGovDomain: string;
  candidateUrls: string[];
}

export class CountrySourceDiscovery {
  public static getSeeds(): CountrySourceSeed[] {
    return GOVERNMENT_COUNTRIES.map((c) => ({
      countryCode: c.country_code,
      primaryGovDomain: c.national_portal_url,
      candidateUrls: [
        c.national_portal_url,
        `${c.national_portal_url}/careers`,
        `${c.national_portal_url}/jobs`,
        `${c.national_portal_url}/recruitment`,
      ],
    }));
  }
}
