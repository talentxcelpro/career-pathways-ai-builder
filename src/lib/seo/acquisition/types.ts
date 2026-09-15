/**
 * Phase 14: Continuous Search Demand Evidence & Multi-Product Acquisition Engine Types
 * Strict Provenance, 3-Population Separation, 14-Surface Graph Architecture
 */

export type ProductSurface14 = 
  | 'JOBS'
  | 'PROFESSIONAL_NETWORK'
  | 'RESUME_ATS'
  | 'CAREER_PASSPORT'
  | 'MO1_BUSINESS_OS'
  | 'BIDDER_RANKINGS'
  | 'COMPANIES'
  | 'ROLE_GUIDES'
  | 'LOCATIONS'
  | 'SKILLS'
  | 'COLLEGES'
  | 'LEARNING_COURSES'
  | 'CAREER_MAP'
  | 'CAREER_TOOLS';

export type EvidencePopulation = 
  | 'A_OBSERVED_GSC'            // Real GSC search impressions & clicks from Googlebot / live users
  | 'B_EVIDENCED_DEMAND'        // Verified external third-party demand, CPC, competitor SERP ranking
  | 'C_THEORETICAL_CANDIDATE';  // Combinatorial permutation from the entity graph

export type EvidenceSourceStatus = 
  | 'CONNECTED'
  | 'UNAVAILABLE'
  | 'SIMULATED_TEST';

export type CompetitorSource = 
  | 'GOOGLE_SEARCH_CONSOLE'
  | 'GOOGLE_KEYWORD_PLANNER'
  | 'APNA'
  | 'NAUKRI'
  | 'INDEED'
  | 'AMBITION_BOX'
  | 'SHIKSHA'
  | 'LINKEDIN'
  | 'INTERNAL_GRAPH';

export type SearchIntentTier = 
  | 'TRANSACTIONAL_JOB'
  | 'COMMERCIAL_TOOL'
  | 'COMMERCIAL_SERVICE'
  | 'COMMERCIAL_IDENTITY'
  | 'COMMERCIAL_ENTERPRISE'
  | 'INFORMATIONAL_ROLE'
  | 'INFORMATIONAL_SKILL'
  | 'INFORMATIONAL_SOCIAL'
  | 'EDUCATIONAL_SEARCH'
  | 'EDUCATIONAL_COURSE'
  | 'DECISIONAL_PATHWAY'
  | 'NAV_ORGANIZATIONAL'
  | 'NAV_COMMERCIAL'
  | 'GEOGRAPHIC_DISCOVERY';

export type AcquisitionDecision = 
  | 'OPTIMIZE_EXISTING'   // Canonical page already published in the 12,592 inventory; optimize metadata & internal links
  | 'CREATE_CANONICAL'    // Genuinely unique intent + verified inventory depth >= 3 + passes anti-doorway gate
  | 'CONSOLIDATE_PARENT'  // Tail variation or low inventory; collapse to parent canonical hub
  | 'EXCLUDE_DOORWAY';    // Thin duplicate, spam keyword variation, or zero inventory

export type OpportunityPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5';

export interface ProvenanceLog {
  source_name: CompetitorSource | string;
  source_type: 'API' | 'EXPORT' | 'SERP_SCRAPER' | 'INTERNAL_GRAPH';
  source_status: EvidenceSourceStatus;
  country: string; // ISO 3166-1 alpha-2 (e.g. "IN", "US", "AE")
  language: string; // ISO 639-1 (e.g. "en", "hi")
  captured_at: string; // ISO 8601 Timestamp
  confidence_score: number; // 0.00 to 1.00
  sample_size?: number;
}

export interface DemandEvidenceRecord {
  // Query Identification
  evidence_id: string; // Deterministic SHA-256 hash (normalized_query + country + language)
  query: string;
  normalized_query: string;
  surface: ProductSurface14;
  intent: SearchIntentTier;
  entities: string[];
  country: string;
  language: string;

  // Provenance & Evidence Verification
  provenance: ProvenanceLog;
  evidence_population: EvidencePopulation;

  // Search Volume & Commercial Demand
  search_volume: number | 'UNKNOWN';
  volume_source: CompetitorSource | 'UNKNOWN';
  volume_period: string; // e.g. "2026-M08" or "UNKNOWN"
  cpc_usd: number | 'UNKNOWN';
  cpc_inr: number | 'UNKNOWN';
  cpc_source: CompetitorSource | 'UNKNOWN';
  demand_trend: 'GROWING' | 'STABLE' | 'SEASONAL' | 'DECLINING' | 'UNKNOWN';

  // Live SERP Benchmarking (External Competitor Rank)
  competitor_name?: string;
  serp_observed_position?: number | 'NOT_RANKING';
  serp_source?: CompetitorSource;
  serp_captured_at?: string;

  // GSC Metrics (Historical Internal Performance)
  talentxcel_url: string;
  gsc_average_position: number | 'NO_IMPRESSIONS'; // STRICTLY SEPARATE FROM LIVE SERP
  talentxcel_gsc_impressions: number;
  talentxcel_gsc_clicks: number;
  talentxcel_ctr: number;

  // Scoring & Quality Gate
  inventory_count: number;
  has_substantive_data: boolean;
  doorway_risk_score: number; // 0 (Zero risk) to 100 (Extreme doorway risk)
  opportunity_score: number; // 0 to 100
  priority: OpportunityPriority;

  // Routing Decision
  decision: AcquisitionDecision;
  canonical_url: string;
  canonical_reason: string;
}

export interface SurfaceGraphDefinition {
  surface: ProductSurface14;
  surface_name: string;
  base_route: string;
  access_tier: 'PUBLIC_INDEXABLE' | 'CLASS_A_CANONICAL';
  primary_intents: SearchIntentTier[];
  theoretical_permutations: number;
  normalized_intent_clusters: number;
  evidenced_demand_opportunities: number;
  published_documents: number;
  competitor_benchmarks: CompetitorSource[];
}
