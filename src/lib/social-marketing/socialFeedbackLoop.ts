// src/lib/social-marketing/socialFeedbackLoop.ts
// TalentXcel Multi-Platform Social Performance Feedback Loop
// Normalizes platform analytics into rates, evaluates against benchmark targets,
// and enforces statistical confidence gates (500+ views) before declaring WINNING_TOPIC or WINNING_HOOK.

import { SOCIAL_SEARCH_INTELLIGENCE_CONFIG } from './social-search-intelligence.config';
import type {
  SocialPlatform,
  HookArchetype,
  SocialPlatformVideoMetrics,
  SocialVideoPerformanceRecord,
} from './types';

/**
 * Normalizes an observed rate against a benchmark target into a 0 - 100 score.
 */
function normalizeRate(actualRate: number, targetRate: number): number {
  if (targetRate <= 0) return 0;
  const ratio = (actualRate / targetRate) * 100;
  return Math.max(0, Math.min(100, Math.round(ratio)));
}

/**
 * Computes the normalized YouTube Shorts performance score (0 - 100).
 */
export function computeYouTubeScore(metrics: Partial<SocialPlatformVideoMetrics>): number {
  const views = Math.max(metrics.views || 0, 1);
  const weights = SOCIAL_SEARCH_INTELLIGENCE_CONFIG.platformMetricWeights.YOUTUBE;
  const targets = SOCIAL_SEARCH_INTELLIGENCE_CONFIG.platformBenchmarks.YOUTUBE;

  // Percentage metrics
  const viewedScore = normalizeRate(metrics.viewed_vs_swiped_pct || 50, targets.viewedVsSwipedTargetPct);
  const retentionScore = normalizeRate(metrics.retention_rate_pct || 50, targets.retentionTargetPct);

  // Rate metrics (counts divided by views)
  const rewatchRate = metrics.rewatch_rate_pct !== undefined
    ? metrics.rewatch_rate_pct / 100
    : 0.05;
  const rewatchScore = normalizeRate(rewatchRate, targets.rewatchRateTarget);

  const shareRate = (metrics.shares || 0) / views;
  const shareScore = normalizeRate(shareRate, targets.shareRateTarget);

  const subRate = (metrics.subscribers_or_followers || 0) / views;
  const subScore = normalizeRate(subRate, targets.subRateTarget);

  const total =
    viewedScore * weights.viewedVsSwiped +
    retentionScore * weights.retentionRate +
    rewatchScore * weights.rewatchRate +
    shareScore * weights.shareRate +
    subScore * weights.subscriberRate;

  return Math.max(0, Math.min(100, Math.round(total)));
}

/**
 * Computes the normalized Instagram Reels performance score (0 - 100).
 */
export function computeInstagramScore(metrics: Partial<SocialPlatformVideoMetrics>): number {
  const views = Math.max(metrics.views || 0, 1);
  const weights = SOCIAL_SEARCH_INTELLIGENCE_CONFIG.platformMetricWeights.INSTAGRAM;
  const targets = SOCIAL_SEARCH_INTELLIGENCE_CONFIG.platformBenchmarks.INSTAGRAM;

  const completionScore = normalizeRate(metrics.completion_rate_pct || 40, targets.completionTargetPct);
  const saveRate = (metrics.saves || 0) / views;
  const saveScore = normalizeRate(saveRate, targets.saveRateTarget);

  const shareRate = (metrics.shares || 0) / views;
  const shareScore = normalizeRate(shareRate, targets.shareRateTarget);

  const commentRate = (metrics.comments || 0) / views;
  const commentScore = normalizeRate(commentRate, targets.commentRateTarget);

  const visitRate = (metrics.profile_visits || 0) / views;
  const visitScore = normalizeRate(visitRate, targets.profileVisitRateTarget);

  const total =
    completionScore * weights.completionRate +
    saveScore * weights.saveRate +
    shareScore * weights.shareRate +
    commentScore * weights.commentRate +
    visitScore * weights.profileVisitRate;

  return Math.max(0, Math.min(100, Math.round(total)));
}

/**
 * Computes the normalized Facebook Reels performance score (0 - 100).
 */
export function computeFacebookScore(metrics: Partial<SocialPlatformVideoMetrics>): number {
  const views = Math.max(metrics.views || 0, 1);
  const weights = SOCIAL_SEARCH_INTELLIGENCE_CONFIG.platformMetricWeights.FACEBOOK;
  const targets = SOCIAL_SEARCH_INTELLIGENCE_CONFIG.platformBenchmarks.FACEBOOK;

  const retentionScore = normalizeRate(metrics.retention_rate_pct || 40, targets.retentionTargetPct);
  const shareRate = (metrics.shares || 0) / views;
  const shareScore = normalizeRate(shareRate, targets.shareRateTarget);

  const commentRate = (metrics.comments || 0) / views;
  const commentScore = normalizeRate(commentRate, targets.commentRateTarget);

  const reactionRate = (metrics.likes || 0) / views;
  const reactionScore = normalizeRate(reactionRate, targets.reactionRateTarget);

  const total =
    retentionScore * weights.watchRetention +
    shareScore * weights.shareRate +
    commentScore * weights.commentRate +
    reactionScore * weights.reactionRate;

  return Math.max(0, Math.min(100, Math.round(total)));
}

/**
 * Computes the normalized X Video performance score (0 - 100).
 */
export function computeXScore(metrics: Partial<SocialPlatformVideoMetrics>): number {
  const views = Math.max(metrics.views || 0, 1);
  const weights = SOCIAL_SEARCH_INTELLIGENCE_CONFIG.platformMetricWeights.X;
  const targets = SOCIAL_SEARCH_INTELLIGENCE_CONFIG.platformBenchmarks.X;

  const completionScore = normalizeRate(metrics.completion_rate_pct || 35, targets.completionTargetPct);
  const repostRate = (metrics.reposts || 0) / views;
  const repostScore = normalizeRate(repostRate, targets.repostQuoteRateTarget);

  const replyRate = (metrics.comments || 0) / views;
  const replyScore = normalizeRate(replyRate, targets.replyRateTarget);

  const likeRate = (metrics.likes || 0) / views;
  const likeScore = normalizeRate(likeRate, targets.likeRateTarget);

  const followRate = (metrics.subscribers_or_followers || 0) / views;
  const followScore = normalizeRate(followRate, targets.followRateTarget);

  const total =
    completionScore * weights.completionRate +
    repostScore * weights.repostQuoteRate +
    replyScore * weights.replyRate +
    likeScore * weights.likeRate +
    followScore * weights.followProfileRate;

  return Math.max(0, Math.min(100, Math.round(total)));
}

/**
 * Computes platform score by routing to the platform-specific rate calculation.
 */
export function computePlatformScore(platform: SocialPlatform, metrics: Partial<SocialPlatformVideoMetrics>): number {
  switch (platform) {
    case 'YOUTUBE':
      return computeYouTubeScore(metrics);
    case 'INSTAGRAM':
      return computeInstagramScore(metrics);
    case 'FACEBOOK':
      return computeFacebookScore(metrics);
    case 'X':
      return computeXScore(metrics);
    default:
      return 50;
  }
}

/**
 * Evaluates a complete cross-platform performance record.
 * Calculates normalized platform scores, cross-platform weighted score,
 * and applies statistical confidence gates (500+ views) for winner designation.
 */
export function evaluatePerformanceRecord(
  opportunityId: string,
  topicId: string,
  canonicalTitle: string,
  hookArchetype: HookArchetype,
  rawMetrics: Record<SocialPlatform, Omit<SocialPlatformVideoMetrics, 'platform' | 'normalized_platform_score'>>,
  publishedAt = new Date().toISOString()
): SocialVideoPerformanceRecord {
  const cfg = SOCIAL_SEARCH_INTELLIGENCE_CONFIG;
  const platformWeights = cfg.platformWeights;
  const gates = cfg.winnerGates;

  const populatedMetrics: Record<SocialPlatform, SocialPlatformVideoMetrics> = {} as any;
  let totalViews = 0;

  for (const p of ['YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'X'] as SocialPlatform[]) {
    const raw = rawMetrics[p] || { views: 0, likes: 0, comments: 0, shares: 0 };
    const normScore = computePlatformScore(p, raw);
    totalViews += raw.views || 0;

    populatedMetrics[p] = {
      ...raw,
      platform: p,
      normalized_platform_score: normScore,
    };
  }

  // Cross-platform score calculation
  const crossPlatformScore = Math.round(
    populatedMetrics.YOUTUBE.normalized_platform_score * platformWeights.YOUTUBE +
    populatedMetrics.INSTAGRAM.normalized_platform_score * platformWeights.INSTAGRAM +
    populatedMetrics.FACEBOOK.normalized_platform_score * platformWeights.FACEBOOK +
    populatedMetrics.X.normalized_platform_score * platformWeights.X
  );

  // Winner gates & statistical confidence check
  const hasSampleConfidence = totalViews >= gates.minViewsForWinnerStatus;
  const meetsTopicScore = crossPlatformScore >= gates.winningTopicScoreMin;
  const meetsHookScore =
    populatedMetrics.YOUTUBE.normalized_platform_score >= gates.winningHookScoreMin ||
    populatedMetrics.INSTAGRAM.normalized_platform_score >= gates.winningHookScoreMin ||
    crossPlatformScore >= gates.winningHookScoreMin;

  let status: SocialVideoPerformanceRecord['status'] = 'TESTING';
  let isWinningTopic = false;
  let isWinningHook = false;

  if (meetsTopicScore) {
    if (hasSampleConfidence) {
      status = 'WINNING_TOPIC';
      isWinningTopic = true;
    } else {
      // High score but under 500 views: Promising, needs more statistical confidence
      status = 'PROMISING';
      isWinningTopic = false;
    }
  } else if (crossPlatformScore < 45 && hasSampleConfidence) {
    status = 'UNDERPERFORMING';
  }

  if (meetsHookScore && hasSampleConfidence) {
    isWinningHook = true;
  }

  return {
    opportunity_id: opportunityId,
    topic_id: topicId,
    canonical_title: canonicalTitle,
    hook_archetype_used: hookArchetype,
    published_at: publishedAt,
    total_views: totalViews,
    platform_metrics: populatedMetrics,
    cross_platform_score: crossPlatformScore,
    status,
    is_winning_topic: isWinningTopic,
    is_winning_hook: isWinningHook,
  };
}

export interface HookPerformanceAggregate {
  archetype: HookArchetype;
  samplesCount: number;
  averageScore: number;
  winningCount: number;
  winRatePct: number;
  bestPlatform: SocialPlatform;
}

/**
 * Aggregates performance by hook archetype across a set of evaluated performance records.
 */
export function aggregateHookPerformance(
  records: SocialVideoPerformanceRecord[]
): Record<HookArchetype, HookPerformanceAggregate> {
  const archetypes: HookArchetype[] = ['CURIOSITY', 'CONTRARIAN', 'DATA_REVELATION', 'PROBLEM_SOLUTION'];
  const result: Record<HookArchetype, HookPerformanceAggregate> = {} as any;

  for (const arch of archetypes) {
    const matching = records.filter(r => r.hook_archetype_used === arch);
    const count = matching.length;

    if (count === 0) {
      result[arch] = {
        archetype: arch,
        samplesCount: 0,
        averageScore: 0,
        winningCount: 0,
        winRatePct: 0,
        bestPlatform: 'YOUTUBE',
      };
      continue;
    }

    const totalScore = matching.reduce((acc, r) => acc + r.cross_platform_score, 0);
    const winningCount = matching.filter(r => r.is_winning_hook || r.is_winning_topic).length;

    // Determine highest scoring platform on average for this archetype
    const platformScores: Record<SocialPlatform, number> = { YOUTUBE: 0, INSTAGRAM: 0, FACEBOOK: 0, X: 0 };
    for (const r of matching) {
      for (const p of ['YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'X'] as SocialPlatform[]) {
        platformScores[p] += r.platform_metrics[p].normalized_platform_score;
      }
    }

    let bestPlatform: SocialPlatform = 'YOUTUBE';
    let maxPlatformAvg = -1;
    for (const p of ['YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'X'] as SocialPlatform[]) {
      const avg = platformScores[p] / count;
      if (avg > maxPlatformAvg) {
        maxPlatformAvg = avg;
        bestPlatform = p;
      }
    }

    result[arch] = {
      archetype: arch,
      samplesCount: count,
      averageScore: Math.round(totalScore / count),
      winningCount,
      winRatePct: Math.round((winningCount / count) * 100),
      bestPlatform,
    };
  }

  return result;
}
