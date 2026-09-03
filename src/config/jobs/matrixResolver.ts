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
  
  // Resolve location
  let location: JobLocationConfig | undefined;

  if (countrySlug) {
    // International lookup with country disambiguation
    const cleanCountry = countrySlug.toLowerCase().trim();
    const cleanCity = citySlug.toLowerCase().trim();
    location = JOB_LOCATIONS.find(
      l => (l.slug === cleanCity || l.cityName.toLowerCase() === cleanCity) &&
           (l.countryCode.toLowerCase() === cleanCountry || l.countryName.toLowerCase().replace(/\s+/g, '-') === cleanCountry)
    );
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
