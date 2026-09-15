// src/lib/autonomous-os/adaptiveGovernor.ts
// GSC Indexation Feedback & Adaptive Publishing Governor
// Controls daily publishing velocity based on real Google crawl & indexation absorption signals

export interface GSCFeedbackMetrics {
  indexedPages: number;
  crawledNotIndexed: number;
  discoveredNotIndexed: number;
  organicImpressions: number;
  organicClicks: number;
  averageCtr: number;
  jobPostingValidCount: number;
  jobPostingInvalidCount: number;
}

export type GovernorState = 'EXPAND_CAUTIOUS' | 'MAINTAIN' | 'THROTTLE_DOWN' | 'PAUSE_AFFECTED_POD';

export interface DailyPublishingQuota {
  cycleState: GovernorState;
  jobsTarget: number;
  collegesTarget: number;
  articlesTarget: number;
  reason: string;
  governorScore: number;
}

export function evaluateAdaptivePublishingQuota(metrics: GSCFeedbackMetrics): DailyPublishingQuota {
  // Baseline Phase A conservative limits
  const baseJobs = 6;
  const baseColleges = 15;
  const baseArticles = 2;

  // 1. Critical Schema / Error Check
  if (metrics.jobPostingInvalidCount > 5) {
    return {
      cycleState: 'PAUSE_AFFECTED_POD',
      jobsTarget: 0, // Pause jobs until schema validation clears
      collegesTarget: baseColleges,
      articlesTarget: baseArticles,
      reason: `Critical schema warnings detected in GSC (${metrics.jobPostingInvalidCount} invalid jobs). Jobs pod temporarily halted for validation.`,
      governorScore: 30
    };
  }

  // 2. Compute Crawl Debt Ratio: (Crawled-Not-Indexed + Discovered-Not-Indexed) / Indexed
  const totalDiscoveredUnindexed = metrics.crawledNotIndexed + metrics.discoveredNotIndexed;
  const crawlDebtRatio = metrics.indexedPages > 0 ? (totalDiscoveredUnindexed / metrics.indexedPages) : 10;

  // 3. Evaluate Governor State based on indexation absorption signals
  if (crawlDebtRatio > 15) {
    // High unindexed debt -> Throttle down and focus on quality / existing indexation
    return {
      cycleState: 'THROTTLE_DOWN',
      jobsTarget: Math.max(3, Math.round(baseJobs * 0.7)),
      collegesTarget: Math.max(5, Math.round(baseColleges * 0.5)),
      articlesTarget: baseArticles, // Articles continue to provide high-quality substantive depth
      reason: `Crawl debt ratio is elevated (${crawlDebtRatio.toFixed(1)}x unindexed inventory). Throttling college volume to prioritize Googlebot absorption of existing pages.`,
      governorScore: 55
    };
  }

  if (metrics.organicImpressions > 5000 && metrics.indexedPages > 3000 && crawlDebtRatio < 8) {
    // Positive Google absorption -> Cautiously expand toward Phase B
    return {
      cycleState: 'EXPAND_CAUTIOUS',
      jobsTarget: 7,
      collegesTarget: 25,
      articlesTarget: 3,
      reason: `Healthy Google indexation velocity and rising impressions. Cautiously scaling college ingestion toward Phase B quota.`,
      governorScore: 88
    };
  }

  // Default: Maintain Phase A baseline
  return {
    cycleState: 'MAINTAIN',
    jobsTarget: baseJobs,
    collegesTarget: baseColleges,
    articlesTarget: baseArticles,
    reason: `Steady state operating in Phase A. Publishing 5–7 verified jobs, 10–20 accredited colleges, and 2–3 substantive articles.`,
    governorScore: 75
  };
}
