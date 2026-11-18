// src/config/jobs/matrixResolver.ts
// Dual Route Resolver for India and International Programmatic Matrix Pages
// India: /jobs/{role}/{experience}/{city}
// International: /jobs/{role}/{experience}/{country}/{city}

import { JobLocationConfig, getLocationBySlug, JOB_LOCATIONS } from './locations';
import { JobRoleConfig, getRoleBySlug, JOB_ROLES } from './roles';
import { JobExperienceConfig, getExperienceBySlug, JOB_EXPERIENCES } from './experiences';

export interface ResolvedMatrixContext {
  role: JobRoleConfig;
  experience: JobExperienceConfig;
  location: JobLocationConfig;
  canonicalUrl: string;
  isInternational: boolean;
  pageTitle: string;
  pageDescription: string;
}

export function resolveMatrixParams(
  roleSlug: string,
  experienceSlug: string,
  citySlug: string,
  countrySlug?: string
): ResolvedMatrixContext | null {
  const role = getRoleBySlug(roleSlug);
  const experience = getExperienceBySlug(experienceSlug);
  
  if (!role || !experience) {
    return null;
  }

  // Resolve location
  let location: JobLocationConfig | undefined;

  if (countrySlug) {
    // International lookup with strict country disambiguation
    const cleanCountry = countrySlug.toLowerCase().trim();
    const cleanCity = citySlug.toLowerCase().trim();

    // Defect DEF-001 / DEF-002: Dual-City Collision Prevention
    // If countrySlug is actually a known city (e.g. /bangalore/nagpur), reject immediately
    const isCityInCountrySlot = JOB_LOCATIONS.some(
      l => l.slug === cleanCountry || l.cityName.toLowerCase() === cleanCountry
    );
    if (isCityInCountrySlot) {
      return null;
    }

    // Validate that country parameter matches an authorized ISO country code or country name
    const isValidCountry = JOB_LOCATIONS.some(
      l => l.countryCode.toLowerCase() === cleanCountry || 
           l.countryName.toLowerCase().replace(/\s+/g, '-') === cleanCountry
    );
    if (!isValidCountry) {
      return null;
    }

    // City must strictly belong to the specified country - no blind fallbacks
    location = JOB_LOCATIONS.find(
      l => (l.slug === cleanCity || l.cityName.toLowerCase() === cleanCity) &&
           (l.countryCode.toLowerCase() === cleanCountry || l.countryName.toLowerCase().replace(/\s+/g, '-') === cleanCountry)
    );

    if (!location) {
      return null;
    }
  } else {
    location = getLocationBySlug(citySlug);
  }

  if (!role || !experience || !location) {
    return null;
  }

  const isInternational = location.countryCode !== 'IN';
  
  const canonicalUrl = isInternational
    ? `https://talentxcel.in/jobs/${role.slug}/${experience.slug}/${location.countryCode.toLowerCase()}/${location.slug}`
    : `https://talentxcel.in/jobs/${role.slug}/${experience.slug}/${location.slug}`;

  const pageTitle = `${role.title} Jobs for ${experience.label} in ${location.cityName}${location.stateName ? `, ${location.stateName}` : ''} | TalentXcel`;
  const pageDescription = `Explore active ${role.title} job openings for ${experience.label} in ${location.cityName}. Verified employer listings, direct applications, salary benchmarks, and free ATS resume scanner.`;

  return {
    role,
    experience,
    location,
    canonicalUrl,
    isInternational,
    pageTitle,
    pageDescription,
  };
}
