// src/lib/seo/demandIntelligence/autonomousGrowth.ts
// Phase 4 Autonomous Organic Growth Execution & Recovery Domain Engine:
// - 10-State Governed Action Lifecycle + Tier A / Tier B / Tier C Safe Execution Guards
// - Consolidated, Deduplicated Execution Queue with Conflict Suppression
// - 3-Candidate Evidence-Based CTR Metadata Generator
// - 7-State Cannibalization Intelligence Classifier

import { computeKeywordFingerprint } from './normalizer';

export type Phase4GovernanceState =
  | 'RECOMMENDATION'
  | 'EVIDENCE_REVIEW'
  | 'APPROVED'
  | 'EXECUTED'
  | 'VERIFIED'
  | 'MONITORING'
  | 'REJECTED'
  | 'DEFERRED'
  | 'REVERTED'
  | 'NEEDS_REVIEW';

export type ExecutionTier = 'TIER_A_AUTO' | 'TIER_B_APPROVAL' | 'TIER_C_RESTRICTED';

export type ApprovalStatus = 'AUTO_TIER_A' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'DEFERRED';

export interface GrowthExecutionQueueItem {
  actionId: string;
  url: string;
  queryOrCluster: string;
  actionCategory:
    | 'CTR_RECOVERY'
    | 'STRIKE_ZONE_ATTACK'
    | 'CANNIBALIZATION_RESOLUTION'
    | 'COMPETITOR_GAP'
    | 'INTERNAL_LINKING'
    | 'CONTENT_BRIEF'
    | 'GA4_CONVERSION_RECOVERY'
    | 'TECHNICAL_SEO'
    | 'ANALYTICS_REFRESH';
  executionTier: ExecutionTier;
  recommendation: string;
  supportingEvidence: Record<string, unknown>;
  gscMetrics: Record<string, unknown>;
  ga4Metrics: Record<string, unknown>;
  expectedImpact: string;
  confidenceScore: number;
  priorityScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  actionStatus: Phase4GovernanceState;
  approvalStatus: ApprovalStatus;
  ownerSystem: string;
  proposedChanges: Record<string, unknown>;
  beforeStateSnapshot: Record<string, unknown>;
  afterStateSnapshot: Record<string, unknown>;
  verificationWindow: '7d' | '28d' | '90d';
  rollbackInstructions: string;
}

const PHASE4_TRANSITIONS: Record<Phase4GovernanceState, Phase4GovernanceState[]> = {
  RECOMMENDATION: ['EVIDENCE_REVIEW', 'APPROVED', 'REJECTED', 'DEFERRED', 'NEEDS_REVIEW'],
  EVIDENCE_REVIEW: ['APPROVED', 'REJECTED', 'DEFERRED', 'NEEDS_REVIEW'],
  APPROVED: ['EXECUTED', 'DEFERRED', 'REVERTED'],
  EXECUTED: ['VERIFIED', 'MONITORING', 'REVERTED'],
  VERIFIED: ['MONITORING', 'REVERTED'],
  MONITORING: ['VERIFIED', 'REVERTED', 'NEEDS_REVIEW'],
  NEEDS_REVIEW: ['EVIDENCE_REVIEW', 'APPROVED', 'REJECTED', 'DEFERRED'],
  DEFERRED: ['EVIDENCE_REVIEW', 'RECOMMENDATION'],
  REJECTED: [],
  REVERTED: [],
};

export function transitionPhase4Action(
  item: GrowthExecutionQueueItem,
  nextState: Phase4GovernanceState,
  meta: { actor?: string; validationPassed?: boolean; afterSnapshot?: Record<string, unknown> } = {}
): GrowthExecutionQueueItem {
  const allowed = PHASE4_TRANSITIONS[item.actionStatus];
  if (!allowed.includes(nextState)) {
    throw new Error(`Invalid Phase 4 transition ${item.actionStatus} -> ${nextState} for ${item.actionId}`);
  }

  if (nextState === 'EXECUTED') {
    if (item.executionTier !== 'TIER_A_AUTO' && item.approvalStatus !== 'APPROVED' && !meta.actor) {
      throw new Error(`Tier ${item.executionTier} action ${item.actionId} cannot execute without explicit approval.`);
    }
    if (meta.validationPassed === false) {
      throw new Error(`Action ${item.actionId} failed validation checks before execution.`);
    }
  }

  const nextApproval: ApprovalStatus =
    nextState === 'APPROVED'
      ? 'APPROVED'
      : nextState === 'REJECTED'
        ? 'REJECTED'
        : nextState === 'DEFERRED'
          ? 'DEFERRED'
          : item.approvalStatus;

  return {
    ...item,
    actionStatus: nextState,
    approvalStatus: nextApproval,
    afterStateSnapshot: meta.afterSnapshot ? meta.afterSnapshot : item.afterStateSnapshot,
  };
}

/**
 * Deduplicates queue items by (url, actionCategory) keeping highest priorityScore,
 * and suppresses conflicting expansion actions on URLs flagged as CONSOLIDATION_CANDIDATE or INDEXATION_ISSUE.
 */
export function consolidateExecutionQueue(items: GrowthExecutionQueueItem[]): {
  consolidated: GrowthExecutionQueueItem[];
  suppressedCount: number;
} {
  const sorted = [...items].sort((a, b) => b.priorityScore - a.priorityScore);
  const byUrlCategory = new Map<string, GrowthExecutionQueueItem>();
  let suppressedCount = 0;

  // Identify URLs under consolidation or indexation block
  const blockedExpansionUrls = new Set<string>();
  for (const item of sorted) {
    if (
      item.actionCategory === 'CANNIBALIZATION_RESOLUTION' &&
      String(item.proposedChanges?.classification || '') === 'CONSOLIDATION_CANDIDATE' &&
      item.url !== String(item.proposedChanges?.dominantUrl || '')
    ) {
      blockedExpansionUrls.add(item.url);
    }
    if (
      item.actionCategory === 'TECHNICAL_SEO' &&
      String(item.proposedChanges?.issueCategory || '') === 'INDEXATION_ISSUE'
    ) {
      blockedExpansionUrls.add(item.url);
    }
  }

  for (const item of sorted) {
    if (
      blockedExpansionUrls.has(item.url) &&
      (item.actionCategory === 'CONTENT_BRIEF' || item.actionCategory === 'INTERNAL_LINKING')
    ) {
      suppressedCount += 1;
      continue;
    }
    const dedupKey = `${item.url}|${item.actionCategory}`;
    if (byUrlCategory.has(dedupKey)) {
      suppressedCount += 1;
      continue;
    }
    byUrlCategory.set(dedupKey, item);
  }

  return {
    consolidated: Array.from(byUrlCategory.values()).sort((a, b) => b.priorityScore - a.priorityScore),
    suppressedCount,
  };
}

export interface CtrMetadataCandidatePair {
  variant: 'DATA_INVENTORY' | 'INTENT_BENCHMARK' | 'ACTION_UTILITY';
  title: string;
  description: string;
  selectionScore: number;
  rationale: string;
}

function toTitleCase(input: string): string {
  return input.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Generates 3 natural, non-stuffed, evidence-grounded title/description candidate pairs
 * for high-priority CTR recovery pages and selects the strongest recommendation.
 */
export function generateCtrMetadataCandidates(params: {
  primaryQuery: string;
  pageIntent: string;
  realInventoryCount: number;
  isBranded?: boolean;
}): {
  candidates: CtrMetadataCandidatePair[];
  selected: CtrMetadataCandidatePair;
} {
  const q = params.primaryQuery.trim();
  const capQ = toTitleCase(q);
  const hasInv = params.realInventoryCount > 0;
  const invLabel = hasInv ? `${params.realInventoryCount} Verified Openings` : 'Verified Live Listings';

  let candidates: CtrMetadataCandidatePair[];

  if (params.isBranded) {
    candidates = [
      {
        variant: 'ACTION_UTILITY',
        title: 'TalentXcel — Verified Jobs, ATS Resume Check & Career Passport',
        description:
          'Explore active verified jobs, run an instant ATS resume check, earn your TalentScore, and share a verified Career Passport on TalentXcel.',
        selectionScore: 95,
        rationale: 'Matches branded navigation intent with core TalentXcel product surfaces.',
      },
      {
        variant: 'DATA_INVENTORY',
        title: `TalentXcel — ${hasInv ? `${params.realInventoryCount} Active Jobs` : 'Verified Jobs'} & Skill Hiring Platform`,
        description:
          'Discover verified employer openings, salary benchmarks, and skills-first hiring workflows across India and global markets on TalentXcel.',
        selectionScore: 88,
        rationale: 'Highlights verified inventory breadth for branded discovery.',
      },
      {
        variant: 'INTENT_BENCHMARK',
        title: 'TalentXcel Career OS — Jobs, Salary Insights & ATS Diagnostics',
        description:
          'Compare verified role salaries, test resume ATS readiness, and apply directly to active openings on TalentXcel.',
        selectionScore: 84,
        rationale: 'Balances jobs and career intelligence utilities.',
      },
    ];
  } else if (params.pageIntent === 'salary_benchmark') {
    candidates = [
      {
        variant: 'INTENT_BENCHMARK',
        title: `${capQ} — 2026 Payscale, Bands & Skills | TalentXcel`,
        description: `Explore verified ${q} ranges from entry-level to senior roles, key skills impacting pay, and ${hasInv ? `${params.realInventoryCount} active openings` : 'live market demand'} on TalentXcel.`,
        selectionScore: 94,
        rationale: 'Directly answers compensation range intent while surfacing verified openings.',
      },
      {
        variant: 'DATA_INVENTORY',
        title: `${capQ}: Entry to Senior Compensation Guide | TalentXcel`,
        description: `Compare ${q} benchmarks across cities and experience levels, plus check your resume ATS match against active hiring criteria.`,
        selectionScore: 87,
        rationale: 'Emphasizes experience-level segmentation and ATS readiness.',
      },
      {
        variant: 'ACTION_UTILITY',
        title: `${capQ} & Career Readiness Benchmark | TalentXcel`,
        description: `Review ${q} market bands, required technical skills, and Career Passport benchmarks for your next role on TalentXcel.`,
        selectionScore: 81,
        rationale: 'Connects salary research to Career Passport utility.',
      },
    ];
  } else {
    candidates = [
      {
        variant: 'DATA_INVENTORY',
        title: `${capQ} — ${invLabel} | TalentXcel`,
        description: `Browse ${q} on TalentXcel${hasInv ? ` with ${params.realInventoryCount} verified active openings` : ''}. Compare required skills, salary bands, and check your ATS resume match.`,
        selectionScore: hasInv ? 93 : 85,
        rationale: hasInv
          ? 'Grounds snippet in real verified active opening count.'
          : 'Clean descriptive snippet without fabricated counts.',
      },
      {
        variant: 'ACTION_UTILITY',
        title: `${capQ} — Apply & Check ATS Match | TalentXcel`,
        description: `Discover ${q}, review role requirements, and test your resume ATS compatibility before applying on TalentXcel.`,
        selectionScore: hasInv ? 86 : 90,
        rationale: 'Pairs search intent with instant ATS diagnostic differentiation.',
      },
      {
        variant: 'INTENT_BENCHMARK',
        title: `${capQ}: Roles, Skills & Pay Insights | TalentXcel`,
        description: `Explore ${q} opportunities, top hiring skills, and verified compensation insights on TalentXcel.`,
        selectionScore: 83,
        rationale: 'Broad informational + transactional coverage.',
      },
    ];
  }

  candidates.sort((a, b) => b.selectionScore - a.selectionScore);
  return { candidates, selected: candidates[0] };
}

export type CannibalizationClassification =
  | 'TRUE_CANNIBALIZATION'
  | 'INTENT_OVERLAP'
  | 'LEGITIMATE_MULTIPLE_RANKING'
  | 'PAGE_DIFFERENTIATION_REQUIRED'
  | 'CONSOLIDATION_CANDIDATE'
  | 'NO_ACTION'
  | 'NEEDS_REVIEW';

export interface CannibalizationUrlEvidence {
  pageUrl: string;
  pageType: string;
  searchIntent: string;
  impressions: number;
  clicks: number;
  avgPosition: number;
  inventoryCount: number;
}

export interface CannibalizationClassificationResult {
  queryKey: string;
  rawQuery: string;
  dominantUrl: string;
  classification: CannibalizationClassification;
  impressionsTotal: number;
  clicksTotal: number;
  recommendation: string;
}

/**
 * Classifies multi-URL GSC query clusters conservatively without auto-deleting or auto-redirecting pages.
 */
export function classifyCannibalizationCluster(
  rawQuery: string,
  urls: CannibalizationUrlEvidence[]
): CannibalizationClassificationResult {
  const queryKey = `cann-${computeKeywordFingerprint(rawQuery.toLowerCase().trim()).slice(0, 14)}`;
  const sorted = [...urls].sort(
    (a, b) =>
      b.clicks - a.clicks ||
      b.impressions - a.impressions ||
      a.avgPosition - b.avgPosition ||
      b.inventoryCount - a.inventoryCount
  );
  const impressionsTotal = sorted.reduce((s, u) => s + u.impressions, 0);
  const clicksTotal = sorted.reduce((s, u) => s + u.clicks, 0);
  const dominant = sorted[0];

  if (sorted.length <= 1 || impressionsTotal < 15) {
    return {
      queryKey,
      rawQuery,
      dominantUrl: dominant?.pageUrl || '',
      classification: 'NO_ACTION',
      impressionsTotal,
      clicksTotal,
      recommendation: 'Insufficient multi-URL competition or impression volume; monitor without structural changes.',
    };
  }

  const secondary = sorted[1];
  const uniquePageTypes = new Set(sorted.map((u) => u.pageType));
  const dominantShare = impressionsTotal > 0 ? dominant.impressions / impressionsTotal : 1;

  // Phase 5 Precision Rule 1: Same-path subdomain canonical aliases (e.g. jobs.talentxcel.in/jobs/X vs talentxcel.in/jobs/X)
  const extractPathOnly = (u: string) => {
    try {
      return new URL(u).pathname.replace(/\/+$/, '') || '/';
    } catch {
      return u;
    }
  };
  const uniquePaths = new Set(sorted.map((u) => extractPathOnly(u.pageUrl)));
  if (uniquePaths.size === 1) {
    const apexDominant = sorted.find((u) => u.pageUrl.startsWith('https://talentxcel.in/'))?.pageUrl || dominant.pageUrl;
    return {
      queryKey,
      rawQuery,
      dominantUrl: apexDominant,
      classification: 'NO_ACTION',
      impressionsTotal,
      clicksTotal,
      recommendation: `Same canonical path across subdomain alias (${extractPathOnly(apexDominant)}); handled by HTTP 308 apex canonicalization.`,
    };
  }

  // Phase 5 Precision Rule 2: Distinct individual job postings ranking for an employer career query
  const lowerQ = rawQuery.toLowerCase();
  const allJobsLanding = sorted.every((u) => u.pageType === 'jobs-landing' && extractPathOnly(u.pageUrl).startsWith('/jobs/'));
  const looksLikeEmployerQuery = /\b(career|careers|hiring|recruitment)\b/.test(lowerQ);
  if (allJobsLanding && looksLikeEmployerQuery && uniquePaths.size >= 2) {
    return {
      queryKey,
      rawQuery,
      dominantUrl: dominant.pageUrl,
      classification: 'LEGITIMATE_MULTIPLE_RANKING',
      impressionsTotal,
      clicksTotal,
      recommendation: `Distinct job postings rank for employer query "${rawQuery}"; keep individual jobs and link up to the canonical employer hub.`,
    };
  }

  // Legitimate multi-surface coexistence (e.g., /salary/x + /jobs/x or /network/x)
  if (uniquePageTypes.size >= 2 && dominantShare >= 0.65 && dominant.clicks >= secondary.clicks) {
    return {
      queryKey,
      rawQuery,
      dominantUrl: dominant.pageUrl,
      classification: 'LEGITIMATE_MULTIPLE_RANKING',
      impressionsTotal,
      clicksTotal,
      recommendation: `Distinct page types (${Array.from(uniquePageTypes).join(', ')}) coexist productively; keep both and cross-link clearly.`,
    };
  }

  // Same page type competing closely with split clicks/impressions
  if (dominant.pageType === secondary.pageType && secondary.impressions >= dominant.impressions * 0.35) {
    const isZeroInvSecondary = secondary.inventoryCount === 0 && dominant.inventoryCount > 0;
    return {
      queryKey,
      rawQuery,
      dominantUrl: dominant.pageUrl,
      classification: isZeroInvSecondary ? 'CONSOLIDATION_CANDIDATE' : 'TRUE_CANNIBALIZATION',
      impressionsTotal,
      clicksTotal,
      recommendation: isZeroInvSecondary
        ? `Secondary URL (${secondary.pageUrl}) has 0 inventory while competing with ${dominant.pageUrl}; review for governed consolidation/canonicalization.`
        : `Two ${dominant.pageType} URLs split impressions (${dominant.impressions} vs ${secondary.impressions}); differentiate H1/title focus or consolidate under ${dominant.pageUrl} via governed review.`,
    };
  }

  if (uniquePageTypes.size >= 2 && secondary.impressions >= dominant.impressions * 0.25) {
    return {
      queryKey,
      rawQuery,
      dominantUrl: dominant.pageUrl,
      classification: 'INTENT_OVERLAP',
      impressionsTotal,
      clicksTotal,
      recommendation: `Different page types (${dominant.pageType} vs ${secondary.pageType}) overlap on "${rawQuery}"; sharpen intent-specific headings and internal anchor text.`,
    };
  }

  if (dominant.avgPosition > 10 && secondary.impressions >= 10) {
    return {
      queryKey,
      rawQuery,
      dominantUrl: dominant.pageUrl,
      classification: 'PAGE_DIFFERENTIATION_REQUIRED',
      impressionsTotal,
      clicksTotal,
      recommendation: `Differentiate metadata & target query focus between ${dominant.pageUrl} and ${secondary.pageUrl} to consolidate page-1 relevance.`,
    };
  }

  return {
    queryKey,
    rawQuery,
    dominantUrl: dominant.pageUrl,
    classification: 'NEEDS_REVIEW',
    impressionsTotal,
    clicksTotal,
    recommendation: `Review multi-URL impression split (${sorted.length} URLs, ${impressionsTotal} total imp) before taking governed action.`,
  };
}

export type PriorityTier = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export type BatchGroupId =
  | 'BATCH_1_CRITICAL_AND_CTR'
  | 'BATCH_2_RANKING_AND_INVENTORY'
  | 'BATCH_3_CANNIBALIZATION_AND_CANONICAL';

export interface PrioritizedQueueItem {
  item: GrowthExecutionQueueItem;
  priorityTier: PriorityTier;
  batchGroup: BatchGroupId;
  compositePriority: number;
  rationale: string;
}

/**
 * Evidence-based P0-P4 priority model.
 * Strictly prevents low-confidence recommendations from being promoted to P0/P1.
 */
export function assignExecutionPriorityTier(item: GrowthExecutionQueueItem): PrioritizedQueueItem {
  const imp = Number(item.gscMetrics?.impressions ?? item.gscMetrics?.impressionsTotal ?? 0);
  const clk = Number(item.gscMetrics?.clicks ?? item.gscMetrics?.clicksTotal ?? 0);
  const pos = Number(item.gscMetrics?.avgPosition ?? 50);
  const conf = item.confidenceScore;

  let priorityTier: PriorityTier = 'P3';
  let rationale = 'Long-term optimization backlog.';

  if (
    item.actionCategory === 'TECHNICAL_SEO' &&
    item.priorityScore >= 85 &&
    conf >= 0.8
  ) {
    priorityTier = 'P0';
    rationale = 'Critical production SEO/rendering/404 defect backed by high confidence.';
  } else if (
    conf >= 0.78 &&
    ((item.actionCategory === 'CTR_RECOVERY' && imp >= 100 && pos <= 15) ||
      (item.actionCategory === 'STRIKE_ZONE_ATTACK' && imp >= 100 && pos <= 10.5) ||
      (item.actionCategory === 'INTERNAL_LINKING' && imp >= 100))
  ) {
    priorityTier = 'P1';
    rationale = `High-confidence (${(conf * 100).toFixed(0)}%) recovery with ${imp} impressions at pos ${pos.toFixed(1)}.`;
  } else if (conf >= 0.65 && (imp >= 25 || clk >= 2 || item.executionTier === 'TIER_A_AUTO')) {
    priorityTier = 'P2';
    rationale = `Meaningful growth opportunity (${imp} imp, conf ${(conf * 100).toFixed(0)}%).`;
  } else if (conf < 0.65 || imp < 15) {
    priorityTier = 'P4';
    rationale = 'Low-confidence or insufficient impression sample; research/monitoring only.';
  }

  let batchGroup: BatchGroupId = 'BATCH_2_RANKING_AND_INVENTORY';
  if (
    priorityTier === 'P0' ||
    item.actionCategory === 'CTR_RECOVERY' ||
    item.actionCategory === 'INTERNAL_LINKING' ||
    item.actionCategory === 'TECHNICAL_SEO'
  ) {
    batchGroup = 'BATCH_1_CRITICAL_AND_CTR';
  } else if (
    item.actionCategory === 'CANNIBALIZATION_RESOLUTION' ||
    item.executionTier === 'TIER_C_RESTRICTED'
  ) {
    batchGroup = 'BATCH_3_CANNIBALIZATION_AND_CANONICAL';
  }

  const tierWeight: Record<PriorityTier, number> = { P0: 500, P1: 400, P2: 300, P3: 200, P4: 100 };
  const compositePriority = Math.round((tierWeight[priorityTier] + item.priorityScore * conf) * 100) / 100;

  return {
    item,
    priorityTier,
    batchGroup,
    compositePriority,
    rationale,
  };
}

export function planExecutionBatches(items: GrowthExecutionQueueItem[]): {
  prioritized: PrioritizedQueueItem[];
  tierCounts: Record<PriorityTier, number>;
  batches: Record<BatchGroupId, PrioritizedQueueItem[]>;
} {
  const prioritized = items.map(assignExecutionPriorityTier).sort((a, b) => b.compositePriority - a.compositePriority);
  const tierCounts: Record<PriorityTier, number> = { P0: 0, P1: 0, P2: 0, P3: 0, P4: 0 };
  const batches: Record<BatchGroupId, PrioritizedQueueItem[]> = {
    BATCH_1_CRITICAL_AND_CTR: [],
    BATCH_2_RANKING_AND_INVENTORY: [],
    BATCH_3_CANNIBALIZATION_AND_CANONICAL: [],
  };
  for (const p of prioritized) {
    tierCounts[p.priorityTier] += 1;
    batches[p.batchGroup].push(p);
  }
  return { prioritized, tierCounts, batches };
}
