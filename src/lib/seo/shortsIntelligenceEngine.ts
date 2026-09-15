// src/lib/seo/shortsIntelligenceEngine.ts
// TalentXcel Shorts Intelligence Engine (Backwards Compatibility Wrapper)
// Re-exports all functionality from socialVideoIntelligenceEngine to maintain seamless compatibility.

export * from './socialVideoIntelligenceEngine';

import {
  processGscOpportunitiesForSocial,
  createSocialVideoOpportunity,
  loadEvidenceLakeQueries,
  BENCHMARK_CAREER_QUERIES,
  type ProcessGscOptions,
} from './socialVideoIntelligenceEngine';
import type { SocialVideoOpportunity, GscTelemetry } from '../social-marketing/types';

/**
 * Backwards-compatible alias for running Shorts intelligence specifically.
 */
export function runShortsIntelligence(
  queries?: GscTelemetry[],
  options?: ProcessGscOptions
): SocialVideoOpportunity[] {
  const inputQueries = queries && queries.length > 0 ? queries : loadEvidenceLakeQueries();
  return processGscOpportunitiesForSocial(inputQueries, options);
}

/**
 * Backwards-compatible alias for generating opportunities.
 */
export const generateShortsOpportunitiesFromGsc = runShortsIntelligence;
