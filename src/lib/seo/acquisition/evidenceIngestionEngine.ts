/**
 * Phase 14 Continuous Search Demand Evidence Ingestion Engine
 * Normalizes queries, generates deterministic hashes, and assigns population classifications.
 */

import { 
  DemandEvidenceRecord, 
  EvidencePopulation, 
  ProductSurface14, 
  SearchIntentTier,
  ProvenanceLog,
  CompetitorSource
} from './types';
import { RawDemandObservation } from './evidenceSourceAdapter';
import { MULTI_PRODUCT_SURFACE_GRAPHS } from './multiProductGraphMaster';

/**
 * Deterministic Hash Generator for Evidence IDs
 */
export function generateDeterministicEvidenceId(normalizedQuery: string, country: string, language: string): string {
  const input = `${normalizedQuery.trim().toLowerCase()}|${country.trim().toUpperCase()}|${language.trim().toLowerCase()}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  const unsigned = (hash >>> 0).toString(16).padStart(8, '0');
  return `txc_ev_${unsigned}`;
}

/**
 * Query Normalization Pipeline
 */
export function normalizeSearchQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, ' ')  // Replace special characters with space
    .replace(/\s+/g, ' ')        // Collapse multiple whitespace
    .trim();
}

/**
 * Entity & Intent Surface Resolver
 */
export function resolveQuerySurfaceAndIntent(normalizedQuery: string): { surface: ProductSurface14; intent: SearchIntentTier; entities: string[] } {
  const q = normalizedQuery.toLowerCase();

  // 1. Resume / ATS
  if (q.includes('resume') || q.includes('cv') || q.includes('ats') || q.includes('cover letter')) {
    return {
      surface: 'RESUME_ATS',
      intent: 'COMMERCIAL_TOOL',
      entities: ['Resume Builder', 'ATS Optimizer']
    };
  }

  // 2. Colleges & NIRF
  if (q.includes('college') || q.includes('university') || q.includes('iit') || q.includes('iim') || q.includes('nirf') || q.includes('scholarship') || q.includes('degree')) {
    return {
      surface: 'COLLEGES',
      intent: 'EDUCATIONAL_SEARCH',
      entities: ['Colleges', 'Global Programs']
    };
  }

  // 3. Learning & Certifications
  if (q.includes('course') || q.includes('learn') || q.includes('certification') || q.includes('training') || q.includes('tutorial')) {
    return {
      surface: 'LEARNING_COURSES',
      intent: 'EDUCATIONAL_COURSE',
      entities: ['Course', 'Skill Upgrades']
    };
  }

  // 4. Roles & Roadmaps
  if (q.includes('roadmap') || q.includes('salary progression') || q.includes('role guide') || q.includes('responsibilities of')) {
    return {
      surface: 'ROLE_GUIDES',
      intent: 'INFORMATIONAL_ROLE',
      entities: ['Role Guide', 'Salary Benchmarks']
    };
  }

  // 5. CareerMap Pathways
  if (q.includes('career path') || q.includes('career map') || q.includes('transition to') || q.includes('promotion path')) {
    return {
      surface: 'CAREER_MAP',
      intent: 'DECISIONAL_PATHWAY',
      entities: ['Career Pathway', 'Career Transitions']
    };
  }

  // 6. Professional Network & Posts
  if (q.includes('post') || q.includes('leadership') || q.includes('network') || q.includes('founder') || q.includes('connection')) {
    return {
      surface: 'PROFESSIONAL_NETWORK',
      intent: 'INFORMATIONAL_SOCIAL',
      entities: ['Network Feed', 'Executive Thought Leadership']
    };
  }

  // 7. Rankings & Leaderboards
  if (q.includes('ranking') || q.includes('leaderboard') || q.includes('top product') || q.includes('claim 1') || q.includes('best companies')) {
    return {
      surface: 'BIDDER_RANKINGS',
      intent: 'NAV_COMMERCIAL',
      entities: ['Claim #1 Leaderboard', 'Industry Rankings']
    };
  }

  // 8. Companies
  if (q.includes('company') || q.includes('salaries at') || q.includes('working at') || q.includes('interview at')) {
    return {
      surface: 'COMPANIES',
      intent: 'NAV_ORGANIZATIONAL',
      entities: ['Company Hub', 'Employer Insights']
    };
  }

  // 9. Skills
  if (q.includes('skill') || q.includes('python') || q.includes('react') || q.includes('kubernetes') || q.includes('sql') || q.includes('aws')) {
    // If it's a specific developer/engineer job with skill, route to JOBS
    if (q.includes('job') || q.includes('developer') || q.includes('engineer') || q.includes('hiring') || q.includes('vacancy')) {
      return {
        surface: 'JOBS',
        intent: 'TRANSACTIONAL_JOB',
        entities: ['Job Vacancies', 'Direct Applications']
      };
    }
    return {
      surface: 'SKILLS',
      intent: 'INFORMATIONAL_SKILL',
      entities: ['Skill Directory', 'Capability Matrix']
    };
  }

  // 10. Jobs & Career Opportunities (High Intent)
  if (
    q.includes('job') || 
    q.includes('hiring') || 
    q.includes('vacancy') || 
    q.includes('developer') || 
    q.includes('engineer') || 
    q.includes('specialist') ||
    q.includes('manager') ||
    q.includes('intern')
  ) {
    return {
      surface: 'JOBS',
      intent: 'TRANSACTIONAL_JOB',
      entities: ['Job Vacancies', 'Direct Applications']
    };
  }

  // 11. Geographic Tech Hubs
  if (q.includes('bangalore') || q.includes('noida') || q.includes('hyderabad') || q.includes('mumbai') || q.includes('pune') || q.includes('gurgaon') || q.includes('delhi') || q.includes('remote')) {
    return {
      surface: 'LOCATIONS',
      intent: 'GEOGRAPHIC_DISCOVERY',
      entities: ['Location Portal', 'Metro Tech Hub']
    };
  }

  // 12. Career Passport & Credentials
  if (q.includes('passport') || q.includes('verified credential') || q.includes('identity') || q.includes('badge')) {
    return {
      surface: 'CAREER_PASSPORT',
      intent: 'COMMERCIAL_IDENTITY',
      entities: ['Career Passport', 'Digital Verification']
    };
  }

  // 13. MO1 Business OS
  if (q.includes('business os') || q.includes('autonomous recruitment') || q.includes('enterprise hiring platform')) {
    return {
      surface: 'MO1_BUSINESS_OS',
      intent: 'COMMERCIAL_ENTERPRISE',
      entities: ['MO1 Business OS', 'Autonomous Intelligence']
    };
  }

  // 14. Career Tools & Services
  if (q.includes('calculator') || q.includes('service') || q.includes('recruitment services') || q.includes('tool')) {
    return {
      surface: 'CAREER_TOOLS',
      intent: 'COMMERCIAL_TOOL',
      entities: ['Career Tools', 'Executive Services']
    };
  }

  // Default fallback: Jobs
  return {
    surface: 'JOBS',
    intent: 'TRANSACTIONAL_JOB',
    entities: ['Job Vacancies', 'Direct Applications']
  };
}

/**
 * Ingest Raw Observation into Evidenced Record
 */
export function ingestDemandObservation(
  observation: RawDemandObservation, 
  inventoryCount = 12, 
  hasSubstantiveData = true
): DemandEvidenceRecord {
  const normalized = normalizeSearchQuery(observation.query);
  const country = observation.country || 'IN';
  const language = observation.language || 'en';
  const evidenceId = generateDeterministicEvidenceId(normalized, country, language);
  const { surface, intent, entities } = resolveQuerySurfaceAndIntent(normalized);

  // Population Classification
  let population: EvidencePopulation = 'C_THEORETICAL_CANDIDATE';
  if (observation.source === 'GOOGLE_SEARCH_CONSOLE' && (observation.gscImpressions || 0) > 0) {
    population = 'A_OBSERVED_GSC';
  } else if (
    (typeof observation.searchVolume === 'number' && observation.searchVolume > 0) ||
    (typeof observation.serpObservedPosition === 'number' && observation.serpObservedPosition > 0)
  ) {
    population = 'B_EVIDENCED_DEMAND';
  }

  // Provenance Logging
  const provenance: ProvenanceLog = {
    source_name: observation.source,
    source_type: observation.source === 'GOOGLE_SEARCH_CONSOLE' ? 'API' : 'SERP_SCRAPER',
    source_status: observation.sourceStatus,
    country,
    language,
    captured_at: observation.capturedAt || new Date().toISOString(),
    confidence_score: observation.confidenceScore || 0.90
  };

  // Safe slug generation
  const slug = normalized.replace(/\s+/g, '-');
  const baseRoute = MULTI_PRODUCT_SURFACE_GRAPHS[surface]?.base_route || '/jobs';
  const canonicalUrl = `https://talentxcel.in${baseRoute}/${slug}`;

  // Opportunity & Priority Scoring
  const volumeWeight = typeof observation.searchVolume === 'number' ? Math.min(observation.searchVolume / 300, 35) : 10;
  const cpcWeight = typeof observation.cpcInr === 'number' ? Math.min(observation.cpcInr / 4, 25) : 5;
  const gscImpressionWeight = Math.min((observation.gscImpressions || 0) / 100, 20);
  const competitorGapBonus = (typeof observation.serpObservedPosition === 'number' && observation.serpObservedPosition <= 10) ? 20 : 5;
  const verifiedDemandBase = (typeof observation.searchVolume === 'number' && observation.searchVolume >= 1000) ? 15 : 0;

  const opportunityScore = Math.min(100, Math.round(volumeWeight + cpcWeight + gscImpressionWeight + competitorGapBonus + verifiedDemandBase));

  let priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4' | 'P5' = 'P3';
  if (opportunityScore >= 80) priority = 'P0';
  else if (opportunityScore >= 65) priority = 'P1';
  else if (opportunityScore >= 50) priority = 'P2';
  else if (opportunityScore >= 35) priority = 'P3';
  else if (opportunityScore >= 20) priority = 'P4';
  else priority = 'P5';

  return {
    evidence_id: evidenceId,
    query: observation.query,
    normalized_query: normalized,
    surface,
    intent,
    entities,
    country,
    language,
    provenance,
    evidence_population: population,
    search_volume: observation.searchVolume ?? 'UNKNOWN',
    volume_source: typeof observation.searchVolume === 'number' ? observation.source : 'UNKNOWN',
    volume_period: '2026-M08',
    cpc_usd: observation.cpcUsd ?? 'UNKNOWN',
    cpc_inr: observation.cpcInr ?? 'UNKNOWN',
    cpc_source: typeof observation.cpcInr === 'number' ? observation.source : 'UNKNOWN',
    demand_trend: observation.demandTrend || 'UNKNOWN',
    competitor_name: observation.competitorDomain,
    serp_observed_position: observation.serpObservedPosition ?? 'NOT_RANKING',
    serp_source: observation.serpObservedPosition ? observation.source : undefined,
    serp_captured_at: observation.serpObservedPosition ? provenance.captured_at : undefined,
    talentxcel_url: canonicalUrl,
    gsc_average_position: observation.gscAveragePosition ?? 'NO_IMPRESSIONS',
    talentxcel_gsc_impressions: observation.gscImpressions || 0,
    talentxcel_gsc_clicks: observation.gscClicks || 0,
    talentxcel_ctr: observation.gscCtr || 0,
    inventory_count: inventoryCount,
    has_substantive_data: hasSubstantiveData,
    doorway_risk_score: inventoryCount < 3 ? 85 : 0,
    opportunity_score: opportunityScore,
    priority,
    decision: 'OPTIMIZE_EXISTING', // Evaluated further by decisionRouter
    canonical_url: canonicalUrl,
    canonical_reason: `Evidenced demand in ${surface} product graph`
  };
}
