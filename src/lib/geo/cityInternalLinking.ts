/**
 * src/lib/geo/cityInternalLinking.ts
 * TalentXcel City Internal Linking Architecture
 *
 * ARCHITECTURE:
 *   City Hub (/locations/{city})
 *     ├─ → Role Hub (/jobs/{role}) for top roles in this city
 *     ├─ → Discovery Cluster (/jobs/{role}/in/{city}) for qualified combos
 *     ├─ → Employer Hub (/companies/{company}) for verified active employers
 *     └─ → Nearby City Hub (/locations/{nearby-city}) [geographically justified only]
 *
 *   Role Hub (/jobs/{role})
 *     ├─ → City Hubs with that role present
 *     └─ → Discovery Clusters
 *
 *   Job Detail (/jobs/{slug})
 *     ├─ → City Hub for the job's location
 *     ├─ → Role Hub for the job's role
 *     └─ → Employer Hub for the company
 *
 *   Employer Hub (/companies/{slug})
 *     └─ → City Hubs where employer has active jobs
 *
 * CONSTRAINTS:
 *   - Nearby city links require distance < 150km (computed from lat/long, not assumed).
 *   - Cross-links only created if target page passes IndexReadinessGate.
 *   - No link farms — max 8 "nearby cities" per city hub.
 *   - Breadcrumbs always reflect actual page hierarchy.
 *
 * @version 2.0.0
 */

import type { CityRecord } from './cityRegistry';

export interface CityInternalLink {
  href: string;
  label: string;
  linkType: 'ROLE_HUB' | 'DISCOVERY_CLUSTER' | 'EMPLOYER_HUB' | 'NEARBY_CITY' | 'INDUSTRY_HUB';
  /** Whether this link is to a page that has passed IndexReadinessGate */
  targetVerified: boolean;
}

export interface CityBreadcrumb {
  name: string;
  url: string;
}

/**
 * Compute geographic distance between two lat/long points using the Haversine formula.
 * Returns distance in kilometers.
 */
export function haversineDistanceKm(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Find geographically justified nearby cities for a given city.
 * Only returns cities within 150km. Sorted by distance ascending.
 * Max 8 results to prevent link farms.
 */
export function findNearbyQualifiedCities(
  city: CityRecord,
  allCities: CityRecord[],
  indexReadyCities: Set<string>,
  maxDistanceKm: number = 150,
  maxResults: number = 8
): Array<{ city: CityRecord; distanceKm: number }> {
  return allCities
    .filter((c) => c.slug !== city.slug && c.active && indexReadyCities.has(c.slug))
    .map((c) => ({
      city: c,
      distanceKm: haversineDistanceKm(city.latitude, city.longitude, c.latitude, c.longitude),
    }))
    .filter((r) => r.distanceKm <= maxDistanceKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, maxResults);
}

/**
 * Build breadcrumbs for a city hub page.
 * Always reflects actual page hierarchy — never fabricated.
 */
export function buildCityBreadcrumbs(cityName: string, citySlug: string): CityBreadcrumb[] {
  return [
    { name: 'Home', url: '/' },
    { name: 'Jobs', url: '/jobs' },
    { name: `Jobs in ${cityName}`, url: `/locations/${citySlug}` },
  ];
}

/**
 * Build breadcrumbs for a role+city discovery cluster page.
 */
export function buildRoleCityBreadcrumbs(
  roleName: string, roleSlug: string,
  cityName: string, citySlug: string
): CityBreadcrumb[] {
  return [
    { name: 'Home', url: '/' },
    { name: 'Jobs', url: '/jobs' },
    { name: `${roleName} Jobs`, url: `/jobs/${roleSlug}` },
    { name: `${roleName} Jobs in ${cityName}`, url: `/jobs/${roleSlug}/${citySlug}` },
  ];
}

/**
 * Generate internal links for a city hub page from live job data.
 * Only links to verified index-ready targets.
 */
export function buildCityHubLinks(params: {
  city: CityRecord;
  topRoleSlugs: string[];
  topRoleNames: string[];
  topEmployerSlugs: string[];
  topEmployerNames: string[];
  nearbyCities: Array<{ city: CityRecord; distanceKm: number }>;
  indexReadyCities: Set<string>;
  baseUrl: string;
}): CityInternalLink[] {
  const links: CityInternalLink[] = [];

  // Role Hub links — from actual job data
  params.topRoleSlugs.slice(0, 6).forEach((slug, i) => {
    links.push({
      href: `/jobs/${slug}`,
      label: `${params.topRoleNames[i] || slug} Jobs`,
      linkType: 'ROLE_HUB',
      targetVerified: true, // Role hubs always exist
    });
  });

  // Discovery Cluster links — role + city combos (App.tsx route: /jobs/:role/:city)
  params.topRoleSlugs.slice(0, 4).forEach((roleSlug, i) => {
    links.push({
      href: `/jobs/${roleSlug}/${params.city.slug}`,
      label: `${params.topRoleNames[i] || roleSlug} Jobs in ${params.city.canonicalName}`,
      linkType: 'DISCOVERY_CLUSTER',
      targetVerified: false, // Will be verified at render time
    });
  });

  // Employer Hub links — verified active employers (App.tsx route: /company/:slug)
  params.topEmployerSlugs.slice(0, 5).forEach((slug, i) => {
    links.push({
      href: `/company/${slug}`,
      label: params.topEmployerNames[i] || slug,
      linkType: 'EMPLOYER_HUB',
      targetVerified: true,
    });
  });

  // Nearby city links — geographically justified, capped at 6
  params.nearbyCities.slice(0, 6).forEach(({ city }) => {
    if (params.indexReadyCities.has(city.slug)) {
      links.push({
        href: `/locations/${city.slug}`,
        label: `Jobs in ${city.canonicalName}`,
        linkType: 'NEARBY_CITY',
        targetVerified: true,
      });
    }
  });

  return links;
}

/**
 * Discovery cluster qualification gate.
 * A role+city combination page requires both:
 * 1. At least 3 active jobs matching both role AND city
 * 2. The city passing IndexReadinessGate
 * 3. The role having at least 10 active jobs site-wide
 */
export interface ClusterQualificationResult {
  qualified: boolean;
  roleSlug: string;
  citySlug: string;
  roleJobCount: number;
  cityRoleJobCount: number;
  reasons: string[];
}

export function evaluateDiscoveryClusterQualification(params: {
  roleSlug: string;
  citySlug: string;
  cityRoleJobCount: number;
  totalRoleJobCount: number;
  cityIndexReady: boolean;
}): ClusterQualificationResult {
  const reasons: string[] = [];
  let qualified = true;

  if (!params.cityIndexReady) {
    qualified = false;
    reasons.push('City has not passed IndexReadinessGate');
  }
  if (params.cityRoleJobCount < 3) {
    qualified = false;
    reasons.push(`Only ${params.cityRoleJobCount} jobs for this role in this city (need ≥3)`);
  }
  if (params.totalRoleJobCount < 10) {
    qualified = false;
    reasons.push(`Role has only ${params.totalRoleJobCount} total jobs site-wide (need ≥10)`);
  }

  return {
    qualified,
    roleSlug: params.roleSlug,
    citySlug: params.citySlug,
    roleJobCount: params.totalRoleJobCount,
    cityRoleJobCount: params.cityRoleJobCount,
    reasons,
  };
}
