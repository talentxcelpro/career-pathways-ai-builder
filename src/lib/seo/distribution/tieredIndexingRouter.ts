// src/lib/seo/distribution/tieredIndexingRouter.ts
// Tiered Indexing & Crawl Budget Protection Engine (Inspired by programmatic-seo-engine & santifer-irepair)
// Prevents thin-page index bloat by enforcing explicit indexing tiers across all 14 surfaces

export type IndexingTier = 'TIER_1_INDEX_IMMEDIATE' | 'TIER_2_INDEX_STANDARD' | 'TIER_3_NOINDEX_UTILITY';

export interface TierEvaluationInput {
  url: string;
  surface: string;
  inventoryCount: number;
  hasVerifiedSearchDemand: boolean;
  hasCalculatedUtility: boolean;
  isParameterTail: boolean;
  profileCompletionPct?: number;
}

export interface TierEvaluationResult {
  tier: IndexingTier;
  robotsDirective: string;
  sitemapEligible: boolean;
  sitemapPriority: number; // 0.0 to 1.0
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  decisionReason: string;
}

export function evaluateIndexingTier(input: TierEvaluationInput): TierEvaluationResult {
  // Rule 1: Parameter spam and doorway tails are strictly Tier 3 (noindex)
  if (input.isParameterTail || input.url.includes('?page=') || input.url.includes('&sort=')) {
    return {
      tier: 'TIER_3_NOINDEX_UTILITY',
      robotsDirective: 'noindex, follow',
      sitemapEligible: false,
      sitemapPriority: 0.0,
      changeFrequency: 'never',
      decisionReason: 'Parameter URL or thin tail collapsed to protect crawl budget'
    };
  }

  // Rule 2: Incomplete UGC profiles (< 50% completion) are kept private/noindex
  if (input.profileCompletionPct !== undefined && input.profileCompletionPct < 50) {
    return {
      tier: 'TIER_3_NOINDEX_UTILITY',
      robotsDirective: 'noindex, nofollow',
      sitemapEligible: false,
      sitemapPriority: 0.0,
      changeFrequency: 'never',
      decisionReason: 'Incomplete user profile (<50% completion) restricted from search indexation'
    };
  }

  // Rule 3: Thin inventory (< 3 items) without calculated utility is consolidated
  if (input.inventoryCount < 3 && !input.hasCalculatedUtility) {
    return {
      tier: 'TIER_3_NOINDEX_UTILITY',
      robotsDirective: 'noindex, follow',
      sitemapEligible: false,
      sitemapPriority: 0.2,
      changeFrequency: 'monthly',
      decisionReason: 'Sub-threshold inventory (<3 items); consolidated into parent surface hub'
    };
  }

  // Rule 4: High verified demand OR substantive inventory (>10) qualifies for Tier 1 (Immediate Indexation)
  if (input.hasVerifiedSearchDemand || input.inventoryCount >= 10 || (input.hasCalculatedUtility && input.inventoryCount >= 3)) {
    return {
      tier: 'TIER_1_INDEX_IMMEDIATE',
      robotsDirective: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
      sitemapEligible: true,
      sitemapPriority: 0.9,
      changeFrequency: 'daily',
      decisionReason: 'High search demand / rich inventory; approved for Tier 1 immediate indexation'
    };
  }

  // Rule 5: Standard canonical assets qualify for Tier 2
  return {
    tier: 'TIER_2_INDEX_STANDARD',
    robotsDirective: 'index, follow',
    sitemapEligible: true,
    sitemapPriority: 0.7,
    changeFrequency: 'weekly',
    decisionReason: 'Standard canonical asset with sufficient substantive data'
  };
}
