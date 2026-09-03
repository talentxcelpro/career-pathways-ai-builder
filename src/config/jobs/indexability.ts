// src/config/jobs/indexability.ts
// Anti-Doorway Multi-Stage Indexability & Quality Engine for TalentXcel Jobs Matrix
// Protects crawl budget and search reputation from thin, low-inventory pages

import { JobLocationConfig } from './locations';
import { JobRoleConfig } from './roles';
import { JobExperienceConfig } from './experiences';

export interface IndexabilityDecision {
  shouldIndex: boolean;
  robotsDirective: 'index, follow' | 'noindex, follow';
  eligibleForSitemap: boolean;
  reason: string;
}

/**
 * Determines whether a specific matrix page (/jobs/:role/:experience/:city)
 * should receive an `index, follow` directive and be submitted into the XML sitemap.
 *
 * Rules:
 * 1. If live jobs === 0:
 *    -> noindex, follow (Excluded from sitemap)
 * 2. If live jobs >= 1:
 *    -> Evaluates Quality Gate (Location Tier <= 2 OR Anchor City OR High Inventory >= 3)
 *    -> If passes: index, follow + included in sitemap
 *    -> If fails (thin single-job edge case in Tier 4): noindex, follow (Excluded from sitemap)
 */
export function evaluateMatrixIndexability(
  role: JobRoleConfig,
  experience: JobExperienceConfig,
  location: JobLocationConfig,
  liveJobCount: number
): IndexabilityDecision {
  // Gate 1: Zero Live Inventory Rule
  if (liveJobCount <= 0) {
    return {
      shouldIndex: false,
      robotsDirective: 'noindex, follow',
      eligibleForSitemap: false,
      reason: 'Zero live jobs in database; noindex prevents thin doorway penalization.',
    };
  }

  // Gate 2: High Live Inventory Rule (>= 3 verified jobs always indexable)
  if (liveJobCount >= 3) {
    return {
      shouldIndex: true,
      robotsDirective: 'index, follow',
      eligibleForSitemap: true,
      reason: `Substantial live inventory (${liveJobCount} active jobs); high-value candidate destination.`,
    };
  }

  // Gate 3: Quality Threshold for Low Inventory (1-2 jobs)
  // Only index if it is a major employment center (Tier 1 or Tier 2) with established authority
  if (location.tier <= 2 && location.seoEligible) {
    return {
      shouldIndex: true,
      robotsDirective: 'index, follow',
      eligibleForSitemap: true,
      reason: `Strategic Tier ${location.tier} hub (${location.cityName}) with active hiring inventory (${liveJobCount} jobs).`,
    };
  }

  // Fallback for Tier 3/4 with only 1 job: render useful UX but keep noindex to protect crawl budget
  return {
    shouldIndex: false,
    robotsDirective: 'noindex, follow',
    eligibleForSitemap: false,
    reason: `Low inventory (${liveJobCount} job) in Tier ${location.tier} center; noindex applied to maintain domain quality.`,
  };
}
