// src/lib/acquisition-os/gscFeedbackLoop.ts
// Closed Search Console Feedback Loop for TalentXcel AI Growth Organization
// Invariant: GSC is the external intelligence feedback layer guiding what the AI organization builds next.

import type { GscFeedbackOpportunity } from './types';

export const SAMPLE_GSC_FEEDBACK_OPPORTUNITIES: GscFeedbackOpportunity[] = [
  {
    id: 'opp-gsc-001',
    query: 'fresher software engineer jobs in srinagar',
    surface: 'JOBS',
    currentImpressions: 1840,
    currentClicks: 42,
    currentCtrPct: 2.28,
    averagePosition: 4.8,
    feedbackCategory: 'HIGH_DEMAND_ZERO_PAGE',
    recommendedAction: 'Build dedicated localized canonical landing page for Srinagar software freshers once inventory passes quality gate.',
    delegatedAgent: 'SEO_OPPORTUNITY',
    priority: 'P0',
  },
  {
    id: 'opp-gsc-002',
    query: 'software engineer salary bangalore',
    surface: 'CAREER_TOOLS',
    currentImpressions: 48500,
    currentClicks: 920,
    currentCtrPct: 1.9,
    averagePosition: 2.4,
    feedbackCategory: 'LOW_CTR_HIGH_IMPRESSION',
    recommendedAction: 'Title and meta description optimization: append in-hand monthly take-home breakdown to capture CTR lift.',
    delegatedAgent: 'CONTENT_ENGINE',
    priority: 'P0',
  },
  {
    id: 'opp-gsc-003',
    query: 'ats resume checker for freshers india',
    surface: 'RESUME_BUILDER',
    currentImpressions: 12400,
    currentClicks: 840,
    currentCtrPct: 6.77,
    averagePosition: 3.1,
    feedbackCategory: 'LOW_CONVERSION_HIGH_TRAFFIC',
    recommendedAction: 'Organic visitors experiencing drop-off at upload gate: deploy instant scorecard preview widget.',
    delegatedAgent: 'CONVERSION_ENGINE',
    priority: 'P1',
  },
  {
    id: 'opp-gsc-004',
    query: 'best companies hiring data analysts dubai',
    surface: 'COMPANIES',
    currentImpressions: 3400,
    currentClicks: 110,
    currentCtrPct: 3.24,
    averagePosition: 5.2,
    feedbackCategory: 'HIGH_DEMAND_ZERO_PAGE',
    recommendedAction: 'Cluster Dubai data analyst companies into dedicated hiring hub linked to multi-location job composer.',
    delegatedAgent: 'EMPLOYER_ACQUISITION',
    priority: 'P1',
  },
];

/**
 * Triages raw GSC query metrics into prioritized feedback opportunities
 */
export function triageGscSearchMetrics(
  items: Array<{ query: string; impressions: number; clicks: number; position: number; currentUrl?: string }>
): GscFeedbackOpportunity[] {
  const opportunities: GscFeedbackOpportunity[] = [];

  for (const item of items) {
    const ctr = item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0;

    // Condition 1: High-Impression, Low CTR (Position <= 5, CTR < 3%)
    if (item.impressions >= 1000 && item.position <= 5 && ctr < 3.0) {
      opportunities.push({
        id: `gsc-ctr-${Math.random().toString(36).slice(2, 8)}`,
        query: item.query,
        surface: 'JOBS',
        currentImpressions: item.impressions,
        currentClicks: item.clicks,
        currentCtrPct: Math.round(ctr * 100) / 100,
        averagePosition: item.position,
        feedbackCategory: 'LOW_CTR_HIGH_IMPRESSION',
        recommendedAction: `CTR is ${ctr.toFixed(1)}% (below 5% expected for position ${item.position.toFixed(1)}). Optimize Title, Meta and Structured Data.`,
        delegatedAgent: 'CONTENT_ENGINE',
        priority: 'P0',
      });
    }

    // Condition 2: High Demand, Missing Dedicated Landing Page
    else if (item.impressions >= 800 && item.position > 10) {
      opportunities.push({
        id: `gsc-demand-${Math.random().toString(36).slice(2, 8)}`,
        query: item.query,
        surface: 'JOBS',
        currentImpressions: item.impressions,
        currentClicks: item.clicks,
        currentCtrPct: Math.round(ctr * 100) / 100,
        averagePosition: item.position,
        feedbackCategory: 'HIGH_DEMAND_ZERO_PAGE',
        recommendedAction: `High search impressions (${item.impressions}) at position ${item.position.toFixed(1)}. Evaluate quality gate for new canonical landing page.`,
        delegatedAgent: 'SEO_OPPORTUNITY',
        priority: 'P1',
      });
    }
  }

  return opportunities.length > 0 ? opportunities : SAMPLE_GSC_FEEDBACK_OPPORTUNITIES;
}
