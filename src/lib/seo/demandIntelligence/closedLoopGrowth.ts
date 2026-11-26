// src/lib/seo/demandIntelligence/closedLoopGrowth.ts
// Phase 3 GSC Closed-Loop Organic Growth Domain Engine:
// - Position-cohort CTR Recovery recommendations (reusing CTR concepts from ctrExperimentTracker without duplicating it)
// - Position 4-10 & 11-20 Attack Prioritizer
// - Closed-Loop Page Performance Feedback Classifier (10 explicit lifecycle classifications)
// - Strict Action Governance state machine (RECOMMENDATION -> APPROVED -> EXECUTED -> VERIFIED / REVERTED)

import { computeKeywordFingerprint } from './normalizer';

export type GovernanceLifecycleState =
  | 'RECOMMENDATION'
  | 'APPROVED'
  | 'EXECUTED'
  | 'VERIFIED'
  | 'REVERTED';

export type PerformanceFeedbackClass =
  | 'GAINING_VISIBILITY'
  | 'GAINING_CLICKS'
  | 'CTR_IMPROVEMENT'
  | 'RANKING_IMPROVEMENT'
  | 'STAGNANT'
  | 'DECLINING'
  | 'INSUFFICIENT_DATA'
  | 'INDEXATION_ISSUE'
  | 'INVENTORY_STALE'
  | 'CONTENT_REVIEW_REQUIRED';

export interface PositionCohortBenchmark {
  bandLabel: 'POS_1_3' | 'POS_4_6' | 'POS_7_10' | 'POS_11_20' | 'POS_21_PLUS';
  cohortMedianCtr: number;
  cohortSampleSize: number;
}

export interface CtrCohortStatsMap {
  POS_1_3: PositionCohortBenchmark;
  POS_4_6: PositionCohortBenchmark;
  POS_7_10: PositionCohortBenchmark;
  POS_11_20: PositionCohortBenchmark;
  POS_21_PLUS: PositionCohortBenchmark;
}

export interface CtrRecoveryCandidateInput {
  pageUrl: string;
  primaryQuery: string;
  queryEvidence: Array<{ query: string; impressions: number; clicks: number; ctr: number; position: number }>;
  pageIntent: string;
  impressions: number;
  clicks: number;
  avgPosition: number;
  actualCtr: number;
  existingTitle: string | null;
  existingDescription: string | null;
  realInventoryCount: number;
  isBrandedQuery?: boolean;
}

export interface CtrRecoveryRecommendation {
  recommendationKey: string;
  pageUrl: string;
  primaryQuery: string;
  queryEvidence: Array<{ query: string; impressions: number; clicks: number; ctr: number; position: number }>;
  pageIntent: string;
  avgPosition: number;
  impressions: number;
  clicks: number;
  actualCtr: number;
  cohortExpectedCtr: number;
  existingTitle: string | null;
  suggestedTitle: string;
  existingDescription: string | null;
  suggestedDescription: string;
  rationale: string;
  riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH';
  priorityScore: number;
  governanceState: GovernanceLifecycleState;
}

export function getPositionBand(pos: number): PositionCohortBenchmark['bandLabel'] {
  if (pos <= 3.5) return 'POS_1_3';
  if (pos <= 6.5) return 'POS_4_6';
  if (pos <= 10.5) return 'POS_7_10';
  if (pos <= 20.5) return 'POS_11_20';
  return 'POS_21_PLUS';
}

/**
 * Computes empirical position-cohort CTR baselines from TalentXcel's own GSC telemetry
 * with safe minimum floors when sample size is small (zero universal blind assumptions).
 */
export function buildEmpiricalCtrCohorts(
  rows: Array<{ position: number; impressions: number; clicks: number }>
): CtrCohortStatsMap {
  const buckets: Record<PositionCohortBenchmark['bandLabel'], { imp: number; clk: number; n: number }> = {
    POS_1_3: { imp: 0, clk: 0, n: 0 },
    POS_4_6: { imp: 0, clk: 0, n: 0 },
    POS_7_10: { imp: 0, clk: 0, n: 0 },
    POS_11_20: { imp: 0, clk: 0, n: 0 },
    POS_21_PLUS: { imp: 0, clk: 0, n: 0 },
  };

  for (const r of rows) {
    if (r.impressions <= 0) continue;
    const band = getPositionBand(r.position);
    buckets[band].imp += r.impressions;
    buckets[band].clk += r.clicks;
    buckets[band].n += 1;
  }

  const floorCtr: Record<PositionCohortBenchmark['bandLabel'], number> = {
    POS_1_3: 0.12,
    POS_4_6: 0.045,
    POS_7_10: 0.022,
    POS_11_20: 0.009,
    POS_21_PLUS: 0.003,
  };

  const compute = (band: PositionCohortBenchmark['bandLabel']): PositionCohortBenchmark => {
    const b = buckets[band];
    const empirical = b.imp >= 100 ? b.clk / b.imp : 0;
    return {
      bandLabel: band,
      cohortMedianCtr: Math.max(floorCtr[band], Math.round(empirical * 1000000) / 1000000),
      cohortSampleSize: b.n,
    };
  };

  return {
    POS_1_3: compute('POS_1_3'),
    POS_4_6: compute('POS_4_6'),
    POS_7_10: compute('POS_7_10'),
    POS_11_20: compute('POS_11_20'),
    POS_21_PLUS: compute('POS_21_PLUS'),
  };
}

function titleCase(s: string): string {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function evaluateCtrRecovery(
  input: CtrRecoveryCandidateInput,
  cohorts: CtrCohortStatsMap
): CtrRecoveryRecommendation | null {
  if (input.impressions < 15 || input.avgPosition > 22) return null;

  const band = getPositionBand(input.avgPosition);
  const cohortCtr = cohorts[band].cohortMedianCtr;
  // Intent adjustment: informational salary/interview queries naturally draw slightly lower CTR than transactional direct brand/job queries
  const intentMultiplier =
    input.isBrandedQuery ? 1.5 : input.pageIntent === 'salary_benchmark' || input.pageIntent === 'interview_prep' ? 0.85 : 1.0;
  const targetCtr = Math.min(0.45, Math.round(cohortCtr * intentMultiplier * 1000000) / 1000000);

  if (input.actualCtr >= targetCtr * 0.75) return null;

  const capQuery = titleCase(input.primaryQuery);
  const invPhrase = input.realInventoryCount > 0 ? `${input.realInventoryCount} Verified Openings` : 'Verified Live Benchmarks';

  let suggestedTitle = `${capQuery} | ${invPhrase} | TalentXcel`;
  let suggestedDescription = `Explore ${input.primaryQuery} on TalentXcel. Compare verified listings, salary bands, required skills, and check your resume ATS match score instantly.`;

  if (input.pageIntent === 'salary_benchmark') {
    suggestedTitle = `${capQuery} (2026 Payscale & Ranges) | TalentXcel`;
    suggestedDescription = `Check verified ${input.primaryQuery} compensation ranges, entry-level to senior pay bands, top skills impacting salary, and live job openings on TalentXcel.`;
  } else if (input.pageIntent === 'interview_prep') {
    suggestedTitle = `${capQuery} & Sample Answers (2026 Guide) | TalentXcel`;
    suggestedDescription = `Prepare with structured ${input.primaryQuery}, technical & behavioral evaluation rubrics, and instant ATS resume diagnostics on TalentXcel.`;
  } else if (input.pageIntent === 'resume_ats' || input.pageIntent === 'assessment_score') {
    suggestedTitle = `${capQuery} — Instant Online Check | TalentXcel`;
    suggestedDescription = `Run a fast ${input.primaryQuery} on TalentXcel. Identify keyword gaps, formatting issues, and benchmark readiness against active hiring criteria.`;
  } else if (input.isBrandedQuery) {
    suggestedTitle = `TalentXcel — Verified Jobs, ATS Resume Check, TalentScore & Career Passport`;
    suggestedDescription = `Official TalentXcel platform: explore active verified jobs, test your resume ATS match score, earn TalentScore, and build your Career Passport.`;
  }

  if (suggestedTitle.length > 68) {
    suggestedTitle = `${suggestedTitle.slice(0, 65).trim()}...`;
  }

  const gapRatio = targetCtr > 0 ? Math.max(0, (targetCtr - input.actualCtr) / targetCtr) : 0.5;
  const priorityScore = Math.min(
    99,
    Math.round((Math.log10(input.impressions + 1) * 22 + gapRatio * 35 + (25 - Math.min(24, input.avgPosition)) * 0.9) * 100) / 100
  );

  const riskAssessment: 'LOW' | 'MEDIUM' | 'HIGH' =
    input.clicks >= 20 && input.avgPosition <= 3 ? 'MEDIUM' : 'LOW';

  const hash = computeKeywordFingerprint(`ctr|${input.pageUrl}|${input.primaryQuery}`).slice(0, 14);
  return {
    recommendationKey: `ctr-${hash}`,
    pageUrl: input.pageUrl,
    primaryQuery: input.primaryQuery,
    queryEvidence: input.queryEvidence.slice(0, 5),
    pageIntent: input.pageIntent,
    avgPosition: Math.round(input.avgPosition * 100) / 100,
    impressions: input.impressions,
    clicks: input.clicks,
    actualCtr: Math.round(input.actualCtr * 1000000) / 1000000,
    cohortExpectedCtr: targetCtr,
    existingTitle: input.existingTitle,
    suggestedTitle,
    existingDescription: input.existingDescription,
    suggestedDescription,
    rationale: `Observed CTR ${(input.actualCtr * 100).toFixed(2)}% across ${input.impressions} impressions at avg pos ${input.avgPosition.toFixed(1)} trails ${band} cohort expectation ${(targetCtr * 100).toFixed(2)}%.`,
    riskAssessment,
    priorityScore,
    governanceState: 'RECOMMENDATION',
  };
}

export interface PageWindowComparisonInput {
  pageUrl: string;
  impressions7d: number;
  clicks7d: number;
  ctr7d: number;
  pos7d: number | null;
  impressions28d: number;
  clicks28d: number;
  ctr28d: number;
  pos28d: number | null;
  impressions90d: number;
  clicks90d: number;
  ctr90d: number;
  pos90d: number | null;
  qualificationStatus: string | null;
  realInventoryCount: number;
  isJobAggregationPage: boolean;
}

export interface PagePerformanceFeedbackResult {
  pageUrl: string;
  classification: PerformanceFeedbackClass;
  deltaImpressions: number;
  deltaClicks: number;
  deltaCtr: number;
  deltaPosition: number;
  evaluationNote: string;
}

/**
 * Classifies closed-loop page performance conservatively using bounded 7d / 28d / 90d windows.
 * Never draws trend conclusions from insufficient impression counts.
 */
export function classifyPageFeedback(input: PageWindowComparisonInput): PagePerformanceFeedbackResult {
  // Pace-normalized comparison: annualized/monthly 7d pace (* 4) vs 28d total, and 28d pace (* 3) vs 90d
  const pace28From7 = input.impressions7d * 4;
  const baselinePrior21 = Math.max(0, input.impressions28d - input.impressions7d);
  const pacePrior28 = baselinePrior21 * (28 / 21);

  const deltaImpressions = Math.round(pace28From7 - pacePrior28);
  const deltaClicks = Math.round(input.clicks7d * 4 - Math.max(0, input.clicks28d - input.clicks7d) * (28 / 21));
  const deltaCtr = Math.round((input.ctr7d - input.ctr28d) * 1000000) / 1000000;
  const deltaPosition =
    input.pos7d !== null && input.pos28d !== null ? Math.round((input.pos28d - input.pos7d) * 100) / 100 : 0; // positive = rank improved toward #1

  if (input.qualificationStatus && ['REJECTED_THIN', 'ARCHIVED', 'NOINDEX_MONITOR'].includes(input.qualificationStatus)) {
    return {
      pageUrl: input.pageUrl,
      classification: 'INDEXATION_ISSUE',
      deltaImpressions,
      deltaClicks,
      deltaCtr,
      deltaPosition,
      evaluationNote: `Governed at ${input.qualificationStatus} (inventory=${input.realInventoryCount}); excluded from active sitemaps until inventory/quality gate passes.`,
    };
  }

  if (input.isJobAggregationPage && input.realInventoryCount <= 0) {
    return {
      pageUrl: input.pageUrl,
      classification: 'INVENTORY_STALE',
      deltaImpressions,
      deltaClicks,
      deltaCtr,
      deltaPosition,
      evaluationNote: 'Job landing surface currently has 0 active non-expired openings; hold or downgrade per SEOPageGovernor.',
    };
  }

  if (input.impressions28d < 20 && input.impressions90d < 40) {
    return {
      pageUrl: input.pageUrl,
      classification: 'INSUFFICIENT_DATA',
      deltaImpressions,
      deltaClicks,
      deltaCtr,
      deltaPosition,
      evaluationNote: `Only ${input.impressions28d} (28d) / ${input.impressions90d} (90d) impressions observed; minimum sample not reached for causal inference.`,
    };
  }

  if (input.impressions28d >= 100 && input.clicks28d === 0 && (input.pos28d ?? 50) <= 15) {
    return {
      pageUrl: input.pageUrl,
      classification: 'CONTENT_REVIEW_REQUIRED',
      deltaImpressions,
      deltaClicks,
      deltaCtr,
      deltaPosition,
      evaluationNote: `Receiving ${input.impressions28d} impressions near pos ${input.pos28d?.toFixed(1) ?? 'N/A'} with 0 clicks; inspect SERP snippet & intent alignment.`,
    };
  }

  if (input.clicks7d >= 3 && deltaClicks > 0 && input.clicks7d * 4 > input.clicks28d * 1.15) {
    return {
      pageUrl: input.pageUrl,
      classification: 'GAINING_CLICKS',
      deltaImpressions,
      deltaClicks,
      deltaCtr,
      deltaPosition,
      evaluationNote: `7d click pace (+${deltaClicks}/mo normalized) exceeds trailing 28d average.`,
    };
  }

  if (deltaCtr >= 0.008 && input.clicks7d >= 2) {
    return {
      pageUrl: input.pageUrl,
      classification: 'CTR_IMPROVEMENT',
      deltaImpressions,
      deltaClicks,
      deltaCtr,
      deltaPosition,
      evaluationNote: `7d CTR (${(input.ctr7d * 100).toFixed(2)}%) improved over 28d baseline (${(input.ctr28d * 100).toFixed(2)}%).`,
    };
  }

  if (deltaPosition >= 1.5 && input.impressions7d >= 15) {
    return {
      pageUrl: input.pageUrl,
      classification: 'RANKING_IMPROVEMENT',
      deltaImpressions,
      deltaClicks,
      deltaCtr,
      deltaPosition,
      evaluationNote: `Average position improved by +${deltaPosition.toFixed(1)} spots (7d vs 28d).`,
    };
  }

  if (pace28From7 >= pacePrior28 * 1.2 && input.impressions7d >= 15) {
    return {
      pageUrl: input.pageUrl,
      classification: 'GAINING_VISIBILITY',
      deltaImpressions,
      deltaClicks,
      deltaCtr,
      deltaPosition,
      evaluationNote: `7d impression pace (${pace28From7}/mo) outpaces prior baseline (${Math.round(pacePrior28)}/mo).`,
    };
  }

  if (pace28From7 < pacePrior28 * 0.7 && input.impressions28d >= 40) {
    return {
      pageUrl: input.pageUrl,
      classification: 'DECLINING',
      deltaImpressions,
      deltaClicks,
      deltaCtr,
      deltaPosition,
      evaluationNote: `7d impression pace (${pace28From7}/mo) trails prior baseline (${Math.round(pacePrior28)}/mo); audit seasonality vs ranking drop.`,
    };
  }

  return {
    pageUrl: input.pageUrl,
    classification: 'STAGNANT',
    deltaImpressions,
    deltaClicks,
    deltaCtr,
    deltaPosition,
    evaluationNote: `Impressions (${input.impressions28d} 28d) and CTR (${(input.ctr28d * 100).toFixed(2)}%) remain steady within normal variance.`,
  };
}

export interface ActionGovernanceRecord {
  actionId: string;
  actionType: string;
  targetUrl: string;
  state: GovernanceLifecycleState;
  payload: Record<string, unknown>;
  validationChecks: Record<string, boolean>;
  rollbackPayload: Record<string, unknown>;
  approvedBy?: string | null;
  executedAt?: string | null;
  verifiedAt?: string | null;
  revertedAt?: string | null;
  auditNotes?: string;
}

const VALID_TRANSITIONS: Record<GovernanceLifecycleState, GovernanceLifecycleState[]> = {
  RECOMMENDATION: ['APPROVED', 'REVERTED'],
  APPROVED: ['EXECUTED', 'REVERTED'],
  EXECUTED: ['VERIFIED', 'REVERTED'],
  VERIFIED: ['REVERTED'],
  REVERTED: [],
};

export function transitionActionGovernance(
  record: ActionGovernanceRecord,
  nextState: GovernanceLifecycleState,
  meta: { actor?: string; note?: string } = {}
): ActionGovernanceRecord {
  const allowed = VALID_TRANSITIONS[record.state];
  if (!allowed.includes(nextState)) {
    throw new Error(`Invalid governance transition from ${record.state} to ${nextState} for ${record.actionId}`);
  }
  const now = new Date().toISOString();
  if (nextState === 'EXECUTED') {
    const allChecksOk = Object.keys(record.validationChecks).length > 0 && Object.values(record.validationChecks).every(Boolean);
    if (!allChecksOk) {
      throw new Error(`Cannot execute ${record.actionId}: validationChecks not passing.`);
    }
    if (!record.approvedBy && !meta.actor) {
      throw new Error(`Cannot execute ${record.actionId}: explicit approval required.`);
    }
  }
  return {
    ...record,
    state: nextState,
    approvedBy: nextState === 'APPROVED' ? meta.actor || 'SYSTEM_POLICY_GATE' : record.approvedBy,
    executedAt: nextState === 'EXECUTED' ? now : record.executedAt,
    verifiedAt: nextState === 'VERIFIED' ? now : record.verifiedAt,
    revertedAt: nextState === 'REVERTED' ? now : record.revertedAt,
    auditNotes: meta.note || record.auditNotes,
  };
}
