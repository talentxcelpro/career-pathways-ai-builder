// src/agents/intelligence/types.ts
// Production Type Definitions for TalentXcel External Intelligence Layer & Opportunity Graph

export type ExternalSourceType =
  | 'public_career_page'
  | 'licensed_job_feed'
  | 'public_business_registry'
  | 'funding_announcement'
  | 'ai_startup_directory'
  | 'university_placement_bulletin'
  | 'internal_scraped_inventory';

export type ExternalSignalType =
  | 'NEW_VACANCY'
  | 'HIRING_ACCELERATION'
  | 'NEW_AI_STARTUP'
  | 'EXPANSION_SIGNAL'
  | 'FUNDING_SIGNAL'
  | 'COLLEGE_PLACEMENT_SIGNAL'
  | 'RECRUITER_ACTIVITY';

export interface ExternalSignal {
  id: string;
  source: ExternalSourceType;
  sourceUrl?: string;
  signalType: ExternalSignalType;
  companyName: string;
  companyDomain: string;
  location?: string;
  roleTitles: string[];
  techSkills: string[];
  vacanciesCount: number;
  fundingAmountUSD?: number;
  confidenceScore: number; // 0.0 - 1.0
  intentScore: number; // 0 - 100
  dedupHash: string;
  observedAt: string;
  status: 'DISCOVERED' | 'NORMALIZED' | 'PROMOTED_TO_OPPORTUNITY' | 'SUPPRESSED';
}

export interface ExternalCompanyEntity {
  id: string;
  name: string;
  domain: string;
  industry: string;
  locations: string[];
  totalActiveVacancies: number;
  techStack: string[];
  fundingStage?: string;
  hiringIntentScore: number; // 0 - 100
  candidateMatchesCount: number;
  verifiedContactEmail?: string;
  lastObservedAt: string;
  firstDiscoveredAt: string;
}

export interface OpportunityNode {
  id: string;
  companyDomain: string;
  companyName: string;
  targetDepartment: 'employer' | 'claim1' | 'colleges' | 'candidates';
  signalsCount: number;
  topSignalType: ExternalSignalType;
  intentScore: number;
  matchableCandidatesCount: number;
  estimatedDealValueINR: number;
  assignedMailbox: string;
  assignedAgent: string;
  stage: 'OPPORTUNITY_IDENTIFIED' | 'QUALIFIED' | 'OUTREACH_APPROVED' | 'CONTACTED' | 'INTERESTED' | 'CONVERTED';
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityGraphStats {
  totalExternalSignalsObserved: number;
  uniqueCompaniesResolved: number;
  highIntentEmployersCount: number;
  activeOpportunityNodes: number;
  candidateMatchConnections: number;
}
