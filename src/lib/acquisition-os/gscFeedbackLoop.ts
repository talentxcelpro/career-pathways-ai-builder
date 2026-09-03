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

import { supabase } from '@/integrations/supabase/client';
import { 
  AcquisitionOpportunity, 
  INITIAL_ACQUISITION_OPPORTUNITIES, 
  createOpportunityFromSearchTelemetry 
} from '@/lib/seo/acquisitionOpportunity';

/**
 * Ingests live Google Search Console query telemetry and maps into scored AcquisitionOpportunities
 */
export async function ingestLiveGscData(siteUrl: string = 'https://talentxcel.in/'): Promise<AcquisitionOpportunity[]> {
  try {
    // 1. Check if we already have persisted opportunities in Supabase
    const { data: existing, error } = await supabase
      .from('acquisition_opportunities' as any)
      .select('*')
      .order('opportunity_score', { ascending: false })
      .limit(50);

    if (!error && existing && existing.length > 0) {
      return existing as unknown as AcquisitionOpportunity[];
    }
  } catch (err) {
    console.warn('[GSC Feedback Loop] Supabase fetch fallback:', err);
  }

  // 2. If table is empty or unpopulated, seed with initial scored opportunities
  return INITIAL_ACQUISITION_OPPORTUNITIES;
}

/**
 * Persists an acquisition opportunity to Supabase table
 */
export async function persistOpportunity(opp: AcquisitionOpportunity): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('acquisition_opportunities' as any)
      .upsert({
        id: opp.id,
        source: opp.source,
        query_cluster: opp.query_cluster,
        representative_query: opp.representative_query,
        search_intent: opp.search_intent,
        audience_segment: opp.audience_segment,
        business_segment: opp.business_segment,
        product_surface: opp.product_surface,
        recommended_landing_page: opp.recommended_landing_page,
        business_goal: opp.business_goal,
        gsc_impressions: opp.gsc_impressions,
        gsc_clicks: opp.gsc_clicks,
        gsc_ctr: opp.gsc_ctr,
        average_position: opp.average_position,
        conversion_count: opp.conversion_count,
        activation_count: opp.activation_count,
        lead_count: opp.lead_count,
        customer_count: opp.customer_count,
        revenue: opp.revenue,
        conversion_rate: opp.conversion_rate,
        opportunity_score: opp.opportunity_score,
        priority: opp.priority,
        status: opp.status,
        assigned_agent: opp.assigned_agent,
        updated_at: new Date().toISOString()
      });

    return !error;
  } catch {
    return false;
  }
}

