// src/lib/ai-leads/types.ts
// Authoritative B2B AI Lead Discovery & Acquisition Data Contracts

export type LeadSourceType = 
  | 'PUBLIC_JOB_SIGNAL' 
  | 'GSC_DEMAND' 
  | 'REGIONAL_EXPANSION' 
  | 'CAREER_PAGE_POSTING'
  | 'FUNDING_MILESTONE';

export type LeadIntentLevel = 'URGENT' | 'HIGH' | 'MEDIUM' | 'EXPLORATORY';

export type RecommendedProduct = 
  | 'MULTI_LOCATION_HIRING' 
  | 'ATS_RECRUITMENT' 
  | 'VERIFIED_EMPLOYER_PROFILE' 
  | 'CAMPUS_POOL'
  | 'EXECUTIVE_SEARCH';

export type LeadStatus = 
  | 'DISCOVERED' 
  | 'QUALIFIED' 
  | 'PENDING_APPROVAL' 
  | 'OUTREACH_APPROVED' 
  | 'SIGNUP_CONVERTED' 
  | 'DISMISSED';

export interface HiringSignalEvidence {
  sourceType: LeadSourceType;
  sourceUrl: string;
  observedAt: string;
  evidence: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface EmployerLead {
  leadId: string;
  companyName: string;
  website: string;
  countryCode: 'in' | 'ae' | 'gb' | 'us' | 'eu' | 'world';
  targetCity: string;
  hiringSignal: string;
  sourceEvidence: HiringSignalEvidence[];
  openRolesCount: number;
  targetRoles: string[];
  qualificationScore: number; // 0-100 weighted index
  intentLevel: LeadIntentLevel;
  recommendedProduct: RecommendedProduct;
  personalizedPitch: string;
  status: LeadStatus;
  discoveredAt: string;
}

export interface LeadQualificationBreakdown {
  leadId: string;
  hiringVelocityScore: number; // 0-30
  multiCityFootprintScore: number; // 0-25
  roleUrgencyScore: number; // 0-25
  productRelevanceScore: number; // 0-20
  totalScore: number; // 0-100
}
