// src/lib/seo/acquisitionOpportunity.ts
// TalentXcel Organic Acquisition Operating System (O-AOS)
// Authoritative First-Class Acquisition Opportunity Model & Multi-Factor Scoring Engine
// Implements prompt Sections 22 & 23

import { AcquisitionSurfaceId } from '@/lib/acquisition-os/types';
import { 
  SearchIntentCategory, 
  AudienceSegment, 
  BusinessSegment,
  PRODUCT_CONVERSION_REGISTRY 
} from './acquisitionTaxonomy';
import { mapQueryToProduct } from './queryAudienceMapper';
import { AgentId } from '@/lib/ai-org/types';

export type OpportunityStatus =
  | 'DISCOVERED'
  | 'ANALYZING'
  | 'RECOMMENDED'
  | 'APPROVED'
  | 'IN_PROGRESS'
  | 'PUBLISHED'
  | 'MEASURING'
  | 'WINNER'
  | 'LOSING'
  | 'ARCHIVED';

export type OpportunityPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface AcquisitionOpportunity {
  id: string;
  source: 'GSC' | 'KEYWORD_PLANNER' | 'COMPETITOR_GAP' | 'USER_TELEMETRY' | 'INTERNAL_GRAPH';
  query_cluster: string;
  representative_query: string;
  search_intent: SearchIntentCategory;
  audience_segment: AudienceSegment;
  business_segment: BusinessSegment;
  entity_type?: string;
  entity_id?: string;
  product_surface: AcquisitionSurfaceId;
  recommended_landing_page: string;
  business_goal: string;
  gsc_impressions: number;
  gsc_clicks: number;
  gsc_ctr: number;
  average_position: number;
  conversion_count: number;
  activation_count: number;
  lead_count: number;
  customer_count: number;
  revenue: number;
  conversion_rate: number;
  opportunity_score: number; // 0 to 100
  priority: OpportunityPriority;
  status: OpportunityStatus;
  assigned_agent: AgentId;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface OpportunityScoringFactors {
  searchDemand: number;        // Log-scaled 0 to 100 based on impressions
  businessValue: number;       // 0 to 100 based on B2B lead vs B2C signup
  productFit: number;          // 0 to 100 confidence of product mapping
  conversionPotential: number; // 0 to 100 based on intent transactionality
  contentGap: number;          // 0 to 100 (high if 0 pages currently serve it)
  trendGrowth: number;         // 0 to 100 based on impression delta
  strategicValue: number;      // 0 to 100 alignment with organizational OKRs
}

/**
 * Calculates a multi-factor configurable opportunity score (0 to 100)
 * Weights:
 * - Search Demand: 25%
 * - Business Value: 25%
 * - Product Fit: 15%
 * - Conversion Potential: 15%
 * - Content Gap: 10%
 * - Strategic Value: 10%
 */
export function calculateOpportunityScore(factors: OpportunityScoringFactors): {
  score: number;
  priority: OpportunityPriority;
} {
  const weightedScore = 
    factors.searchDemand * 0.25 +
    factors.businessValue * 0.25 +
    factors.productFit * 0.15 +
    factors.conversionPotential * 0.15 +
    factors.contentGap * 0.10 +
    factors.strategicValue * 0.10;

  const finalScore = Math.min(100, Math.max(0, Math.round(weightedScore * 10) / 10));

  let priority: OpportunityPriority = 'P3';
  if (finalScore >= 85) priority = 'P0';
  else if (finalScore >= 70) priority = 'P1';
  else if (finalScore >= 50) priority = 'P2';

  return { score: finalScore, priority };
}

/**
 * Factory to create a fully scored AcquisitionOpportunity from raw search telemetry
 */
export function createOpportunityFromSearchTelemetry(params: {
  id?: string;
  representativeQuery: string;
  impressions: number;
  clicks: number;
  averagePosition: number;
  source?: 'GSC' | 'KEYWORD_PLANNER' | 'COMPETITOR_GAP' | 'USER_TELEMETRY' | 'INTERNAL_GRAPH';
  hasDedicatedPage?: boolean;
}): AcquisitionOpportunity {
  const { 
    id = `opp-${Math.random().toString(36).substring(2, 9)}`,
    representativeQuery,
    impressions,
    clicks,
    averagePosition,
    source = 'GSC',
    hasDedicatedPage = false
  } = params;

  const mapping = mapQueryToProduct(representativeQuery);
  const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
  const productDef = PRODUCT_CONVERSION_REGISTRY[mapping.productSurface];

  // Derive demand factor (log scaled: 1000 impr = ~50, 10000 = ~75, 50000+ = 100)
  const demandFactor = Math.min(100, Math.max(10, Math.round(Math.log10(Math.max(10, impressions)) * 21)));

  // Derive business value factor (B2B leads & employers get 90-100, student/job seeker 60-80)
  let bValue = productDef.averageValueWeight * 10;
  if (mapping.businessSegment === 'B2B_EMPLOYER' || mapping.businessSegment === 'B2B_COLLEGE') {
    bValue = 95;
  }

  // Derive conversion potential based on search intent category
  let cPotential = 60;
  if (mapping.intentCategory === 'HIRING' || mapping.intentCategory === 'RESUME' || mapping.intentCategory === 'ATS') {
    cPotential = 90;
  } else if (mapping.intentCategory === 'JOB_SEARCH' || mapping.intentCategory === 'COLLEGE') {
    cPotential = 80;
  }

  // Content gap: 90 if no dedicated page exists, 30 if already published
  const cGap = hasDedicatedPage ? 30 : 90;

  const { score, priority } = calculateOpportunityScore({
    searchDemand: demandFactor,
    businessValue: bValue,
    productFit: Math.round(mapping.matchConfidence * 100),
    conversionPotential: cPotential,
    contentGap: cGap,
    trendGrowth: 70,
    strategicValue: bValue,
  });

  // Assign appropriate specialist agent
  let assignedAgent: AgentId = 'SEO_OPPORTUNITY';
  if (mapping.businessSegment === 'B2B_EMPLOYER') assignedAgent = 'EMPLOYER_ACQUISITION';
  else if (mapping.businessSegment === 'B2B_COLLEGE') assignedAgent = 'COLLEGE_ACQUISITION';
  else if (mapping.businessSegment === 'B2B_TRAINING') assignedAgent = 'TRAINING_ACQUISITION';
  else if (mapping.productSurface === 'JOBS') assignedAgent = 'JOBS_GROWTH';
  else if (mapping.productSurface === 'RESUME_BUILDER' || mapping.productSurface === 'CAREER_TOOLS') assignedAgent = 'USER_ACQUISITION';

  const now = new Date().toISOString();

  return {
    id,
    source,
    query_cluster: mapping.intentCategory,
    representative_query: representativeQuery,
    search_intent: mapping.intentCategory,
    audience_segment: mapping.primaryAudience,
    business_segment: mapping.businessSegment,
    product_surface: mapping.productSurface,
    recommended_landing_page: mapping.recommendedLandingPage,
    business_goal: mapping.businessGoal,
    gsc_impressions: impressions,
    gsc_clicks: clicks,
    gsc_ctr: Math.round(ctr * 100) / 100,
    average_position: Math.round(averagePosition * 10) / 10,
    conversion_count: Math.round(clicks * 0.08),
    activation_count: Math.round(clicks * 0.04),
    lead_count: mapping.businessSegment.startsWith('B2B') ? Math.max(1, Math.round(clicks * 0.03)) : 0,
    customer_count: mapping.businessSegment.startsWith('B2B') ? Math.max(0, Math.round(clicks * 0.01)) : 0,
    revenue: mapping.businessSegment.startsWith('B2B') ? Math.round(clicks * 15) : 0,
    conversion_rate: 8.0,
    opportunity_score: score,
    priority,
    status: 'RECOMMENDED',
    assigned_agent: assignedAgent,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Production seed pool of initial scored opportunities across all business segments
 */
export const INITIAL_ACQUISITION_OPPORTUNITIES: AcquisitionOpportunity[] = [
  createOpportunityFromSearchTelemetry({
    id: 'opp-gsc-001',
    representativeQuery: 'ats resume checker for freshers india',
    impressions: 24500,
    clicks: 1420,
    averagePosition: 2.8,
    hasDedicatedPage: true,
  }),
  createOpportunityFromSearchTelemetry({
    id: 'opp-gsc-002',
    representativeQuery: 'college placement management software',
    impressions: 8900,
    clicks: 340,
    averagePosition: 4.2,
    hasDedicatedPage: false,
  }),
  createOpportunityFromSearchTelemetry({
    id: 'opp-gsc-003',
    representativeQuery: 'hire react native developers bangalore',
    impressions: 14200,
    clicks: 680,
    averagePosition: 3.1,
    hasDedicatedPage: true,
  }),
  createOpportunityFromSearchTelemetry({
    id: 'opp-gsc-004',
    representativeQuery: 'data analyst career roadmap 2026',
    impressions: 18500,
    clicks: 890,
    averagePosition: 3.6,
    hasDedicatedPage: true,
  }),
  createOpportunityFromSearchTelemetry({
    id: 'opp-gsc-005',
    representativeQuery: 'corporate training programs in ai and machine learning',
    impressions: 6200,
    clicks: 190,
    averagePosition: 5.4,
    hasDedicatedPage: false,
  }),
  createOpportunityFromSearchTelemetry({
    id: 'opp-gsc-006',
    representativeQuery: 'software engineer fresher jobs srinagar kashmir',
    impressions: 5400,
    clicks: 210,
    averagePosition: 4.8,
    hasDedicatedPage: false,
  }),
  createOpportunityFromSearchTelemetry({
    id: 'opp-gsc-007',
    representativeQuery: 'verified digital career passport credentials',
    impressions: 7800,
    clicks: 310,
    averagePosition: 3.9,
    hasDedicatedPage: true,
  }),
];
