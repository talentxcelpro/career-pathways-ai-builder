// src/lib/seo/demandDataLake/zeroImpressionEngine.ts
// Zero-Impression URL Diagnostic & Remediation Engine

export interface ZeroImpressionUrl {
  url: string;
  category: 'COLLEGES' | 'RESOURCES' | 'PUBLIC_POSTS' | 'JOBS' | 'ROLES' | 'LOCATIONS';
  isIndexed: boolean;
  contentByteLength: number;
  internalInboundLinks: number;
  crawlDepth: number;
  hasSchema: boolean;
  competitorDemandPresent: boolean;
}

export interface ZeroImpressionDiagnosis extends ZeroImpressionUrl {
  action: 'ACTION_A_KEEP_STRENGTHEN' | 'ACTION_B_MERGE_CONSOLIDATE' | 'ACTION_C_EXPAND_CONTENT' | 'ACTION_D_RELINK_GRAPH' | 'ACTION_E_NOINDEX_PRUNE';
  rationale: string;
  executionPlan: string;
}

export function diagnoseZeroImpressionUrl(item: ZeroImpressionUrl): ZeroImpressionDiagnosis {
  // 1. High quality with real search demand but low internal links -> Re-link (Action D)
  if (item.internalInboundLinks < 3 && item.contentByteLength > 5000) {
    return {
      ...item,
      action: 'ACTION_D_RELINK_GRAPH',
      rationale: 'Substantive content exists but page suffers from weak graph reachability (low inbound links).',
      executionPlan: 'Inject contextual inbound links from relevant parent topic hub and related entities.',
    };
  }

  // 2. High demand area but thin content -> Expand (Action C)
  if (item.contentByteLength < 3000 && item.competitorDemandPresent) {
    return {
      ...item,
      action: 'ACTION_C_EXPAND_CONTENT',
      rationale: 'Search demand exists in SERPs but page content is currently too thin to earn ranking.',
      executionPlan: 'Enrich page with forensic data tables, salary ranges, and structured FAQ schema.',
    };
  }

  // 3. Substantive content and established links awaiting SERP rollout -> Keep & Strengthen (Action A)
  if (item.contentByteLength >= 5000 && item.internalInboundLinks >= 3) {
    return {
      ...item,
      action: 'ACTION_A_KEEP_STRENGTHEN',
      rationale: 'Well-structured, index-worthy asset actively awaiting Google SERP impressions.',
      executionPlan: 'Maintain current canonical URL, ensure freshness via sitemap lastmod, and monitor next GSC cycle.',
    };
  }

  // 4. Low demand and duplicate intent -> Merge (Action B)
  if (!item.competitorDemandPresent && item.contentByteLength < 2500) {
    return {
      ...item,
      action: 'ACTION_B_MERGE_CONSOLIDATE',
      rationale: 'Near-duplicate intent with existing authoritative parent page.',
      executionPlan: 'Set canonical header pointing to primary parent hub and consolidate content.',
    };
  }

  // Default: Prune / Noindex
  return {
    ...item,
    action: 'ACTION_E_NOINDEX_PRUNE',
    rationale: 'Ephemeral or low-value parameter permutation with zero organic search demand.',
    executionPlan: 'Apply noindex meta tag and exclude from XML sitemap.',
  };
}
