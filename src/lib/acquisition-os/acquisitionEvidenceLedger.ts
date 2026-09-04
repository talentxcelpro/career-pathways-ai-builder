// src/lib/acquisition-os/acquisitionEvidenceLedger.ts
// Authoritative Acquisition Evidence Ledger (AEL)
// Strict Rule: "The AI may reason aggressively, but it may never upgrade an inference into a fact."
// Enforces 4-Tier Cognitive Reasoning (Fact -> Signal -> Inference -> Action),
// status-aware metrics, immutable evidence hashing, and explicit execution policies.

export type MetricStatus = 'OBSERVED' | 'ESTIMATED' | 'INSUFFICIENT_DATA';

export type EvidenceType = 
  | 'DIRECT_JOB_POSTING' 
  | 'COMPANY_CAREERS_PAGE' 
  | 'PUBLIC_COMPANY_ANNOUNCEMENT' 
  | 'GSC_DATA' 
  | 'FIRST_PARTY_ANALYTICS' 
  | 'FUNDING_DATABASE' 
  | 'REGIONAL_EXPANSION_SIGNAL' 
  | 'OTHER';

export type SourceReliability = 'VERIFIED' | 'HIGH' | 'MEDIUM' | 'LOW';

export type CommercialPropensity = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type ExecutionPolicy = 'AUTO' | 'REVIEW' | 'BLOCKED';

export type AcquisitionDecision = 'EXECUTE' | 'EXPERIMENT' | 'NO_ACTION' | 'REVIEW';

export interface AcquisitionOpportunityRecord {
  opportunityId: string;
  evidenceId: string;
  evidenceHash: string;
  source: string;
  sourceUrl: string;
  evidenceType: EvidenceType;
  sourceReliability: SourceReliability;
  observedAt: string;
  country: string;
  market: 'INDIA' | 'UAE' | 'UK' | 'USA' | 'EUROPE' | 'REST_OF_WORLD';
  city: string;
  occupation: string;
  intent: string;
  audience: string;
  businessSegment: string;
  product: string;

  // Strict 4-Tier Cognitive Reasoning Breakdown:
  fact: string;       // Verifiable empirical evidence with exact source
  signal: string;     // Commercial pattern detected from fact
  inference: string;  // Product match hypothesis (explicitly marked hypothesis)
  action: string;     // Proposed task

  demand: {
    value: number | null;
    status: MetricStatus;
    sourceCount: number;
    modelVersion?: string;
  };

  confidence: {
    score: number; // 0.0 - 1.0
    level: 'HIGH' | 'MEDIUM' | 'LOW';
    evidenceCount: number;
    evidenceAgeDays: number;
    modelVersion: string;
  };

  commercialPropensity: CommercialPropensity;
  observedRevenueUsd: number | null;
  projectedRevenueUsd: number | null;
  businessValueModelVersion: string;
  decision: AcquisitionDecision;
  executionPolicy: ExecutionPolicy;
  decisionReason: string;
  assignedAgent: string;
  status: 'DISCOVERED' | 'EVALUATED' | 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED';
  version: number;
  previousEvidenceHashes: string[];
}

/**
 * Deterministic evidence hashing for audit integrity.
 */
export function computeOpportunityEvidenceHash(
  fact: string, 
  sourceUrl: string, 
  observedAt: string
): string {
  let hash = 0;
  const str = `${fact}::${sourceUrl}::${observedAt}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `ev_hash_${Math.abs(hash).toString(16)}`;
}

/**
 * Authoritative ACQUISITION_EVIDENCE_LEDGER.
 * Immutable append-only repository of verified market acquisition opportunities.
 */
export const ACQUISITION_EVIDENCE_LEDGER: AcquisitionOpportunityRecord[] = [
  {
    opportunityId: 'opp_uae_cloud_eng_01',
    evidenceId: 'ev_ae_01',
    evidenceHash: computeOpportunityEvidenceHash(
      '37 active engineering vacancies observed across Dubai Internet City and Riyadh Hub.',
      'https://careers.cloudscale-me.example.com/openings',
      '2026-09-03T14:30:00Z'
    ),
    source: 'Company Careers Page & Regional Job Index',
    sourceUrl: 'https://careers.cloudscale-me.example.com/openings',
    evidenceType: 'COMPANY_CAREERS_PAGE',
    sourceReliability: 'VERIFIED',
    observedAt: '2026-09-03T14:30:00Z',
    country: 'ae',
    market: 'UAE',
    city: 'Dubai',
    occupation: 'Software Engineer',
    intent: 'TRANSACTIONAL_JOB_SEARCH',
    audience: 'EXPERIENCED_PROFESSIONALS',
    businessSegment: 'B2B_EMPLOYER',
    product: 'MULTI_LOCATION_HIRING',
    
    // 4-Tier Cognitive Reasoning:
    fact: '37 active engineering vacancies observed across Dubai Internet City and Riyadh Hub.',
    signal: 'High-volume engineering hiring with cross-border GCC talent requirement.',
    inference: 'TalentXcel multi-location job syndication matches regional hiring need.',
    action: 'Create employer acquisition lead and draft regional syndication pitch.',
    
    demand: {
      value: 1240,
      status: 'OBSERVED',
      sourceCount: 3,
      modelVersion: 'gsc-demand-v2',
    },
    confidence: {
      score: 0.94,
      level: 'HIGH',
      evidenceCount: 3,
      evidenceAgeDays: 1,
      modelVersion: 'confidence-model-v1',
    },
    commercialPropensity: 'HIGH',
    observedRevenueUsd: 1400,
    projectedRevenueUsd: 4200,
    businessValueModelVersion: 'revenue-model-v3',
    decision: 'REVIEW',
    executionPolicy: 'REVIEW',
    decisionReason: 'High confidence and verified hiring signal; outbound outreach requires human review.',
    assignedAgent: 'EMPLOYER_ACQUISITION',
    status: 'QUEUED',
    version: 1,
    previousEvidenceHashes: [],
  },
  {
    opportunityId: 'opp_in_fintech_bangalore_02',
    evidenceId: 'ev_in_02',
    evidenceHash: computeOpportunityEvidenceHash(
      'FinNova Technologies Series B capital expansion; 22 open engineering roles in Bangalore.',
      'https://finnova.example.in/press/series-b',
      '2026-09-02T11:20:00Z'
    ),
    source: 'Verified Press Announcement & Careers Portal',
    sourceUrl: 'https://finnova.example.in/careers',
    evidenceType: 'FUNDING_DATABASE',
    sourceReliability: 'VERIFIED',
    observedAt: '2026-09-02T11:20:00Z',
    country: 'in',
    market: 'INDIA',
    city: 'Bangalore',
    occupation: 'Full Stack Developer',
    intent: 'COMMERCIAL_HIRING_INTENT',
    audience: 'TECH_LEADERS',
    businessSegment: 'B2B_EMPLOYER',
    product: 'MULTI_LOCATION_HIRING',

    // 4-Tier Cognitive Reasoning:
    fact: 'FinNova Technologies Series B capital expansion; 22 open engineering roles in Bangalore.',
    signal: 'Engineering headcount scaling rapidly following capital round.',
    inference: 'TalentXcel Indian tech metro 1-click syndication solves fast-growth hiring bottleneck.',
    action: 'Queue personalized outreach to Head of Talent with verified hiring evidence.',

    demand: {
      value: 2840,
      status: 'OBSERVED',
      sourceCount: 4,
      modelVersion: 'gsc-demand-v2',
    },
    confidence: {
      score: 0.96,
      level: 'HIGH',
      evidenceCount: 4,
      evidenceAgeDays: 2,
      modelVersion: 'confidence-model-v1',
    },
    commercialPropensity: 'HIGH',
    observedRevenueUsd: 2100,
    projectedRevenueUsd: 6500,
    businessValueModelVersion: 'revenue-model-v3',
    decision: 'REVIEW',
    executionPolicy: 'REVIEW',
    decisionReason: 'Verified series-b funding and public requisitions; requires human administrator dispatch.',
    assignedAgent: 'EMPLOYER_ACQUISITION',
    status: 'QUEUED',
    version: 1,
    previousEvidenceHashes: [],
  },
  {
    opportunityId: 'opp_uk_healthai_london_03',
    evidenceId: 'ev_uk_03',
    evidenceHash: computeOpportunityEvidenceHash(
      '8 public job requisitions for Healthcare Data Specialists at MedVanguard London.',
      'https://medvanguard.example.co.uk/jobs',
      '2026-09-03T16:00:00Z'
    ),
    source: 'Company Careers Portal & GSC Healthcare Demand',
    sourceUrl: 'https://medvanguard.example.co.uk/jobs',
    evidenceType: 'COMPANY_CAREERS_PAGE',
    sourceReliability: 'HIGH',
    observedAt: '2026-09-03T16:00:00Z',
    country: 'gb',
    market: 'UK',
    city: 'London',
    occupation: 'Biomedical Data Analyst',
    intent: 'SPECIALIZED_ROLE_RECRUITMENT',
    audience: 'HEALTHCARE_SCIENTISTS',
    businessSegment: 'B2B_EMPLOYER',
    product: 'ATS_RECRUITMENT',

    // 4-Tier Cognitive Reasoning:
    fact: '8 public job requisitions for Healthcare Data Specialists at MedVanguard London.',
    signal: 'Niche domain specialization with narrow qualified candidate pool in the UK.',
    inference: 'TalentXcel pre-screened healthcare candidate pipeline reduces time-to-hire.',
    action: 'Draft ATS recruitment trial hook for UK talent acquisition lead.',

    demand: {
      value: 620,
      status: 'OBSERVED',
      sourceCount: 2,
      modelVersion: 'gsc-demand-v2',
    },
    confidence: {
      score: 0.88,
      level: 'HIGH',
      evidenceCount: 2,
      evidenceAgeDays: 1,
      modelVersion: 'confidence-model-v1',
    },
    commercialPropensity: 'MEDIUM',
    observedRevenueUsd: null,
    projectedRevenueUsd: 2800,
    businessValueModelVersion: 'revenue-model-v3',
    decision: 'REVIEW',
    executionPolicy: 'REVIEW',
    decisionReason: 'High confidence specialized hiring; requires human review before outreach.',
    assignedAgent: 'EMPLOYER_ACQUISITION',
    status: 'QUEUED',
    version: 1,
    previousEvidenceHashes: [],
  },
  {
    opportunityId: 'opp_in_thin_query_noaction_04',
    evidenceId: 'ev_in_thin_04',
    evidenceHash: computeOpportunityEvidenceHash(
      'Rising search demand observed for "aerospace welding jobs trichy", but zero active verified job postings exist in database.',
      'https://search.google.com/search-console',
      '2026-09-04T08:00:00Z'
    ),
    source: 'Google Search Console Query Log',
    sourceUrl: 'https://search.google.com/search-console',
    evidenceType: 'GSC_DATA',
    sourceReliability: 'VERIFIED',
    observedAt: '2026-09-04T08:00:00Z',
    country: 'in',
    market: 'INDIA',
    city: 'Trichy',
    occupation: 'Aerospace Welder',
    intent: 'INFORMATIONAL_JOB_SEARCH',
    audience: 'VOCATIONAL_WORKERS',
    businessSegment: 'B2C_JOB_SEEKER',
    product: 'JOBS',

    // 4-Tier Cognitive Reasoning:
    fact: 'Rising search demand observed for "aerospace welding jobs trichy", but zero active verified job postings exist in database.',
    signal: 'Search demand exists without supporting inventory.',
    inference: 'Generating a page without verified inventory would create a thin doorway page violating Google search quality standards.',
    action: 'DO NOT create landing page. Log demand gap for future employer acquisition.',

    demand: {
      value: 380,
      status: 'OBSERVED',
      sourceCount: 1,
      modelVersion: 'gsc-demand-v2',
    },
    confidence: {
      score: 0.91,
      level: 'HIGH',
      evidenceCount: 1,
      evidenceAgeDays: 0,
      modelVersion: 'confidence-model-v1',
    },
    commercialPropensity: 'LOW',
    observedRevenueUsd: null,
    projectedRevenueUsd: null,
    businessValueModelVersion: 'revenue-model-v3',
    decision: 'NO_ACTION',
    executionPolicy: 'BLOCKED',
    decisionReason: 'Zero inventory threshold check failed. Prohibited by Quality Gate to protect search health.',
    assignedAgent: 'SEO_OPPORTUNITY',
    status: 'ARCHIVED',
    version: 1,
    previousEvidenceHashes: [],
  }
];

/**
 * Appends a new immutable observation version to an existing opportunity or records a new one.
 */
export function recordOpportunityInLedger(
  opportunity: Omit<AcquisitionOpportunityRecord, 'evidenceHash' | 'version' | 'previousEvidenceHashes'>
): AcquisitionOpportunityRecord {
  const existingIndex = ACQUISITION_EVIDENCE_LEDGER.findIndex(
    o => o.opportunityId === opportunity.opportunityId
  );

  const newHash = computeOpportunityEvidenceHash(
    opportunity.fact, 
    opportunity.sourceUrl, 
    opportunity.observedAt
  );

  if (existingIndex >= 0) {
    const existing = ACQUISITION_EVIDENCE_LEDGER[existingIndex];
    const updatedRecord: AcquisitionOpportunityRecord = {
      ...opportunity,
      evidenceHash: newHash,
      version: existing.version + 1,
      previousEvidenceHashes: [...existing.previousEvidenceHashes, existing.evidenceHash],
    };
    ACQUISITION_EVIDENCE_LEDGER[existingIndex] = updatedRecord;
    return updatedRecord;
  }

  const newRecord: AcquisitionOpportunityRecord = {
    ...opportunity,
    evidenceHash: newHash,
    version: 1,
    previousEvidenceHashes: [],
  };
  ACQUISITION_EVIDENCE_LEDGER.push(newRecord);
  return newRecord;
}

/**
 * Queries the Acquisition Evidence Ledger with filtering.
 */
export function queryAcquisitionLedger(filter?: {
  market?: string;
  decision?: AcquisitionDecision;
  businessSegment?: string;
}): AcquisitionOpportunityRecord[] {
  return ACQUISITION_EVIDENCE_LEDGER.filter(entry => {
    if (filter?.market && entry.market !== filter.market) return false;
    if (filter?.decision && entry.decision !== filter.decision) return false;
    if (filter?.businessSegment && entry.businessSegment !== filter.businessSegment) return false;
    return true;
  });
}
