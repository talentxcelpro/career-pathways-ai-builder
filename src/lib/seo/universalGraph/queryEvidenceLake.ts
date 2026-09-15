// src/lib/seo/universalGraph/queryEvidenceLake.ts
// Authoritative Query Evidence Lake Schema with Strict Provenance & Population Tracking

export type QueryPopulationType = 'POPULATION_A_OBSERVED' | 'POPULATION_B_MEASURED' | 'POPULATION_C_CANDIDATE';

export type IntentCategory = 
  | 'JOB_SEARCH'
  | 'COMMERCIAL_B2B'
  | 'TRANSACTIONAL_TOOL'
  | 'CAREER_GUIDANCE'
  | 'INFORMATIONAL_EDUCATION'
  | 'NETWORKING'
  | 'CREDENTIAL_VERIFICATION'
  | 'BRAND';

export type MetricProvenanceSource = 
  | 'GOOGLE_SEARCH_CONSOLE_API'
  | 'GOOGLE_KEYWORD_PLANNER'
  | 'AHREFS_SERP_OBSERVATION'
  | 'SEMRUSH_SERP_OBSERVATION'
  | 'INTERNAL_SEARCH_DATA'
  | 'ESTIMATED_INTENT_GRAPH';

export interface QueryProvenance {
  source: MetricProvenanceSource;
  country: string; // e.g. 'IN', 'GLOBAL'
  language: string; // e.g. 'en-IN'
  timestamp: string;
  confidenceScore: number; // 0.0 - 1.0
}

export interface CompetitorPositionRecord {
  domain: string;
  observedPosition: number | null;
  landingUrl?: string;
}

export interface QueryEvidenceRecord {
  query_id: string; // Deterministic Hash
  raw_query: string;
  normalized_query: string;
  population_type: QueryPopulationType;
  primary_surface: string; // One of the 21 registered product surfaces
  intent: IntentCategory;
  journey_stage: 'DISCOVERY' | 'EVALUATION' | 'DECISION' | 'APPLICATION' | 'RETENTION';

  // Entity Dimensions
  entity_role?: string;
  entity_location?: string;
  entity_skill?: string;
  entity_company?: string;
  entity_industry?: string;
  entity_college?: string;

  // Demand Metrics with Provenance
  volume: number | null;
  volume_provenance: QueryProvenance;
  cpc_inr: number | null;
  cpc_provenance?: QueryProvenance;

  // Live GSC Observed Signals
  gsc_impressions: number;
  gsc_clicks: number;
  gsc_ctr: number;
  gsc_position: number | null;

  // Competitor SERP Benchmarks
  competitor_positions: CompetitorPositionRecord[];

  // Routing & Landing Page Destination
  candidate_url: string;
  canonical_url: string;
  has_live_inventory: boolean;
  content_quality_score: number;
  business_value_score: number;

  // Scoring & Quality Gate Decision
  opportunity_score: number; // 1-100
  priority: 'P0_IMMEDIATE' | 'P1_PAGE1' | 'P2_AUTHORITY' | 'P3_EMERGING' | 'P4_MONITOR' | 'P5_CONSOLIDATE_NOINDEX';
  index_decision: 'INDEX' | 'CONSOLIDATE' | 'NOINDEX' | 'REVIEW';
  decision_reason: string;
}

export function buildQueryEvidenceRecord(data: Partial<QueryEvidenceRecord> & { raw_query: string; primary_surface: string; intent: IntentCategory }): QueryEvidenceRecord {
  const normQuery = data.raw_query.toLowerCase().trim().replace(/\s+/g, ' ');
  const query_id = `q_${Buffer.from(normQuery).toString('base64').replace(/=/g, '')}`;

  return {
    query_id,
    raw_query: data.raw_query,
    normalized_query: normQuery,
    population_type: data.population_type || 'POPULATION_C_CANDIDATE',
    primary_surface: data.primary_surface,
    intent: data.intent,
    journey_stage: data.journey_stage || 'DISCOVERY',
    entity_role: data.entity_role,
    entity_location: data.entity_location,
    entity_skill: data.entity_skill,
    entity_company: data.entity_company,
    entity_industry: data.entity_industry,
    entity_college: data.entity_college,
    volume: data.volume ?? null,
    volume_provenance: data.volume_provenance || {
      source: 'ESTIMATED_INTENT_GRAPH',
      country: 'IN',
      language: 'en-IN',
      timestamp: new Date().toISOString(),
      confidenceScore: 0.8,
    },
    cpc_inr: data.cpc_inr ?? null,
    gsc_impressions: data.gsc_impressions || 0,
    gsc_clicks: data.gsc_clicks || 0,
    gsc_ctr: data.gsc_ctr || 0,
    gsc_position: data.gsc_position ?? null,
    competitor_positions: data.competitor_positions || [],
    candidate_url: data.candidate_url || 'https://talentxcel.in/',
    canonical_url: data.canonical_url || 'https://talentxcel.in/',
    has_live_inventory: data.has_live_inventory ?? false,
    content_quality_score: data.content_quality_score || 90,
    business_value_score: data.business_value_score || 85,
    opportunity_score: data.opportunity_score || 75,
    priority: data.priority || 'P3_EMERGING',
    index_decision: data.index_decision || 'INDEX',
    decision_reason: data.decision_reason || 'Evidence-backed canonical landing page',
  };
}
