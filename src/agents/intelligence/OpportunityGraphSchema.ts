// src/agents/intelligence/OpportunityGraphSchema.ts
// Relational Schema & Provenance Models for TalentXcel Opportunity Graph
// Complete multi-dataset models for Companies, Jobs, Colleges, Startups, Signals, and Outreach.

export interface ProvenanceMetadata {
  source: string;
  source_url: string;
  source_type: 'mca_registry' | 'public_career_page' | 'aicte_ugc_portal' | 'startup_registry' | 'funding_bulletin' | 'internal_enrichment';
  discovered_at: string;
  last_verified_at: string;
  confidence: number; // 0.0 - 1.0
  license_permission_basis: 'PERMITTED_PUBLIC_DATA' | 'OFFICIAL_REGISTRY' | 'CONSENT_BASED_OPT_IN';
  dedup_hash: string;
}

export interface GraphCompanyEntity {
  id: string;
  legal_name: string;
  brand_name: string;
  cin_llpin?: string;
  domain: string;
  industry: string;
  headquarters: string;
  incorporation_year?: number;
  status: 'ACTIVE' | 'DORMANT' | 'ACQUIRED';
  company_size: 'SEED' | 'EARLY' | 'GROWTH' | 'ENTERPRISE';
  careers_url: string;
  active_job_count: number;
  hiring_velocity_pct: number; // e.g. +150% change in 30 days
  funding_total_usd?: number;
  provenance: ProvenanceMetadata;
}

export interface GraphJobEntity {
  id: string;
  company_domain: string;
  company_name: string;
  title: string;
  department: string;
  location: string;
  tech_stack: string[];
  posted_date: string;
  source_job_url: string;
  is_active: boolean;
  provenance: ProvenanceMetadata;
}

export interface GraphCollegeEntity {
  id: string;
  institution_name: string;
  university_affiliation: string;
  aicte_id?: string;
  ugc_id?: string;
  nirf_rank?: number;
  state: string;
  city: string;
  website: string;
  student_volume_approx: number;
  placement_officer_name?: string;
  placement_email?: string;
  tpo_contact_role?: string;
  provenance: ProvenanceMetadata;
}

export interface GraphStartupEntity {
  id: string;
  startup_name: string;
  domain: string;
  product_category: string;
  claim1_eligible_category: 'AI Products' | 'Developer Tools' | 'Fintech' | 'EdTech' | 'Enterprise SaaS';
  launch_date: string;
  funding_stage: 'BOOTSTRAPPED' | 'PRE_SEED' | 'SEED' | 'SERIES_A' | 'GROWTH';
  founders: string[];
  product_url: string;
  provenance: ProvenanceMetadata;
}

export interface GraphSignalEntity {
  id: string;
  target_domain: string;
  target_name: string;
  signal_category: 'HIRING' | 'FUNDING' | 'EXPANSION' | 'COLLEGE_TPO' | 'STARTUP_LAUNCH';
  signal_description: string;
  signal_strength: number; // 0 - 100
  observed_at: string;
  evidence_url: string;
  provenance: ProvenanceMetadata;
}

export interface GraphOpportunityEntity {
  id: string;
  company_domain: string;
  company_name: string;
  opportunity_category: 'employer' | 'claim1' | 'college';
  intent_score: number; // 0 - 100
  active_vacancies_count: number;
  candidate_matches_count: number;
  estimated_deal_value_inr: number;
  verified_contact_email: string;
  contact_role: string;
  assigned_agent: string;
  assigned_mailbox: string;
  verification_status: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'SUPPRESSED';
  outreach_status: 'DISCOVERED' | 'QUALIFIED' | 'ELIGIBLE_FOR_OUTREACH' | 'QUEUED' | 'SENT' | 'REPLIED' | 'INTERESTED' | 'MEETING_PENDING' | 'CONVERTED';
  provider_message_id?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface GraphDatasetBreakdown {
  totalRecordsCount: number;
  companiesCount: number;
  jobsCount: number;
  collegesCount: number;
  startupsCount: number;
  hiringSignalsCount: number;
  fundingSignalsCount: number;
  expansionSignalsCount: number;
  verifiedCount: number;
  needsVerificationCount: number;
  suppressedCount: number;
  outreachEligibleCount: number;
  lastIngestedAt: string;
}
