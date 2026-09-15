// src/lib/social-marketing/socialAnalytics.ts
// Stage 11: 3-Tier Outcome Measurement Engine for TalentXcel AI Content Factory
// Segregates performance into: Tier 1 (Attention) -> Tier 2 (Intent) -> Tier 3 (Business Revenue).
// Invariant: Business value is the final optimization metric, not superficial likes.

import { getAllAttributionSnapshots, getAggregatedFunnelTotals } from './socialAttribution';
import type { SocialPlatform } from './types';

export interface PlatformPerformanceSummary {
  platform: SocialPlatform;
  postsPublished: number;
  totalViews: number;
  totalClicks: number;
  totalSignups: number;
  totalRevenueInr: number;
  avgConversionRatePct: number;
}

/**
 * Stage 11 Primary Function: Generates 3-Tier Outcome Performance Reports segmented by Platform.
 */
export function get3TierPerformanceReport(): {
  totals: ReturnType<typeof getAggregatedFunnelTotals>;
  platformBreakdown: Record<SocialPlatform, PlatformPerformanceSummary>;
  topConvertingTopics: Array<{ topic: string; signups: number; revenueInr: number }>;
} {
  const snapshots = getAllAttributionSnapshots();
  const totals = getAggregatedFunnelTotals();

  const platformBreakdown: Record<SocialPlatform, PlatformPerformanceSummary> = {
    YOUTUBE: { platform: 'YOUTUBE', postsPublished: 0, totalViews: 0, totalClicks: 0, totalSignups: 0, totalRevenueInr: 0, avgConversionRatePct: 0 },
    INSTAGRAM: { platform: 'INSTAGRAM', postsPublished: 0, totalViews: 0, totalClicks: 0, totalSignups: 0, totalRevenueInr: 0, avgConversionRatePct: 0 },
    FACEBOOK: { platform: 'FACEBOOK', postsPublished: 0, totalViews: 0, totalClicks: 0, totalSignups: 0, totalRevenueInr: 0, avgConversionRatePct: 0 },
    X: { platform: 'X', postsPublished: 0, totalViews: 0, totalClicks: 0, totalSignups: 0, totalRevenueInr: 0, avgConversionRatePct: 0 },
  };

  for (const snap of snapshots) {
    const p = platformBreakdown[snap.platform];
    if (p) {
      p.postsPublished += 1;
      p.totalViews += snap.attention.views;
      p.totalClicks += snap.intent.link_clicks;
      p.totalSignups += snap.business.signups;
      p.totalRevenueInr += snap.business.direct_revenue_inr;
    }
  }

  for (const p of Object.values(platformBreakdown)) {
    if (p.totalClicks > 0) {
      p.avgConversionRatePct = parseFloat(((p.totalSignups / p.totalClicks) * 100).toFixed(1));
    }
  }

  const topicMap = new Map<string, { signups: number; revenueInr: number }>();
  for (const snap of snapshots) {
    const existing = topicMap.get(snap.topic_title) || { signups: 0, revenueInr: 0 };
    existing.signups += snap.business.signups;
    existing.revenueInr += snap.business.direct_revenue_inr;
    topicMap.set(snap.topic_title, existing);
  }

  const topConvertingTopics = Array.from(topicMap.entries())
    .map(([topic, data]) => ({ topic, signups: data.signups, revenueInr: data.revenueInr }))
    .sort((a, b) => b.signups - a.signups)
    .slice(0, 5);

  return {
    totals,
    platformBreakdown,
    topConvertingTopics,
  };
}
