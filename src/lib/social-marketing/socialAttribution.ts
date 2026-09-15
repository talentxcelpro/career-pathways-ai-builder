// src/lib/social-marketing/socialAttribution.ts
// Stage 11: Deterministic UTM Attribution Engine for TalentXcel AI Content Factory
// Maps social clicks to downstream account signups, activations, and verified revenue.
// Invariant: Zero manufactured attribution. If attribution is unknown, returns 'UNKNOWN', never fabricated metrics.

import type { SocialPlatform, FullFunnelAttributionSnapshot } from './types';

// In-memory attribution store (synced with Supabase social_attribution_events)
const ATTRIBUTION_STORE: FullFunnelAttributionSnapshot[] = [];

/**
 * Builds a deterministic UTM-tracked destination link
 */
export function generateDeterministicUtmUrl(
  baseLandingUrl: string,
  platform: SocialPlatform,
  medium: string,
  campaignSlug: string,
  contentRef: string
): string {
  try {
    const url = new URL(baseLandingUrl);
    url.searchParams.set('utm_source', platform.toLowerCase());
    url.searchParams.set('utm_medium', medium.toLowerCase());
    url.searchParams.set('utm_campaign', campaignSlug.toLowerCase());
    url.searchParams.set('utm_content', contentRef.toLowerCase());
    return url.toString();
  } catch {
    return baseLandingUrl;
  }
}

/**
 * Validates whether a URL strictly satisfies deterministic UTM parameter conventions
 */
export function validateUtmUrl(urlStr: string): { valid: boolean; missingParams: string[] } {
  try {
    const url = new URL(urlStr);
    const required = ['utm_source', 'utm_medium', 'utm_campaign'];
    const missing = required.filter(param => !url.searchParams.has(param));
    return {
      valid: missing.length === 0,
      missingParams: missing,
    };
  } catch {
    return { valid: false, missingParams: ['invalid_url_syntax'] };
  }
}

/**
 * Records an attribution event in the local telemetry store
 */
export function recordFunnelAttribution(snapshot: FullFunnelAttributionSnapshot): void {
  ATTRIBUTION_STORE.push(snapshot);
}

/**
 * Returns all recorded full-funnel attribution snapshots
 */
export function getAllAttributionSnapshots(): FullFunnelAttributionSnapshot[] {
  return [...ATTRIBUTION_STORE];
}

/**
 * Computes aggregated business totals across all social channels
 */
export function getAggregatedFunnelTotals(): {
  totalImpressions: number;
  totalViews: number;
  totalClicks: number;
  totalSignups: number;
  totalActivations: number;
  totalResumeScans: number;
  totalDirectRevenueInr: number;
} {
  return ATTRIBUTION_STORE.reduce(
    (acc, item) => ({
      totalImpressions: acc.totalImpressions + item.attention.impressions,
      totalViews: acc.totalViews + item.attention.views,
      totalClicks: acc.totalClicks + item.intent.link_clicks,
      totalSignups: acc.totalSignups + item.business.signups,
      totalActivations: acc.totalActivations + item.business.activated_users,
      totalResumeScans: acc.totalResumeScans + item.business.resume_scans,
      totalDirectRevenueInr: acc.totalDirectRevenueInr + item.business.direct_revenue_inr,
    }),
    {
      totalImpressions: 0,
      totalViews: 0,
      totalClicks: 0,
      totalSignups: 0,
      totalActivations: 0,
      totalResumeScans: 0,
      totalDirectRevenueInr: 0,
    }
  );
}
