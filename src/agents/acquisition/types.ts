// src/agents/acquisition/types.ts
// Multi-Universe External Data Acquisition Type Definitions
// 6 Core Universes: Companies, Jobs, Colleges, Institutional Contacts (TPOs), Recruiter Ecosystem, Candidates

export type DataUniverseCategory =
  | 'company'
  | 'job'
  | 'college'
  | 'institutional_contact'
  | 'recruiter_contact'
  | 'staffing_company'
  | 'candidate';

export interface RawAcquisitionRecord {
  id: string;
  universe: DataUniverseCategory;
  source: string;
  source_url: string;
  source_type: 'ats_api' | 'mca_registry' | 'aishe_aicte' | 'recruiter_directory' | 'staffing_registry' | 'first_party_consent';
  discovered_at: string;
  raw_payload: Record<string, any>;
  dedup_hash: string;
}

export interface NormalizedCompany {
  id: string;
  legal_name: string;
  brand_name: string;
  domain: string;
  cin_llpin?: string;
  industry: string;
  headquarters: string;
  company_size: 'SEED' | 'EARLY' | 'GROWTH' | 'ENTERPRISE';
  careers_url: string;
  ats_provider?: 'greenhouse' | 'lever' | 'ashby' | 'workable' | 'smartrecruiters' | 'workday' | 'direct';
  active_jobs_count: number;
  hiring_velocity_pct: number;
  source_provenance: string;
  source_url: string;
}

export interface NormalizedJob {
  id: string;
  company_domain: string;
  company_name: string;
  title: string;
  department: string;
  location: string;
  tech_stack: string[];
  seniority_level: 'JUNIOR' | 'MID' | 'SENIOR' | 'STAFF_LEAD' | 'EXECUTIVE';
  posted_date: string;
  source_url: string;
  ats_source: string;
  is_active: boolean;
}

export interface NormalizedCollege {
  id: string;
  institution_name: string;
  university_affiliation: string;
  aishe_code?: string;
  aicte_id?: string;
  ugc_id?: string;
  nirf_rank?: number;
  state: string;
  city: string;
  website: string;
  student_volume_approx: number;
  placement_cell_url?: string;
  tpo_officer_name?: string;
  tpo_email?: string;
  tpo_contact_role?: string;
  source_provenance: string;
}

export interface NormalizedRecruiterContact {
  id: string;
  company_domain: string;
  company_name: string;
  contact_name: string;
  contact_role: 'HR Manager' | 'Talent Acquisition Lead' | 'Technical Recruiter' | 'Head of People' | 'Hiring Manager';
  business_email: string;
  linkedin_url?: string;
  verification_status: 'VERIFIED' | 'NEEDS_VERIFICATION' | 'SUPPRESSED';
  contact_basis: 'COMPANY_PUBLISHED_CHANNEL' | 'PUBLIC_RECRUITER_DIRECTORY' | 'PERMITTED_B2B_FEED';
  source_url: string;
}

export interface NormalizedStaffingCompany {
  id: string;
  company_name: string;
  domain: string;
  headquarters: string;
  specialization: 'Tech Staffing' | 'Executive Search' | 'IT Staff Augmentation' | 'RPO' | 'General Recruitment';
  hiring_volume_rating: 'HIGH' | 'MEDIUM' | 'EMERGING';
  public_contact_email: string;
  website: string;
  active_client_domains: string[];
  source_url: string;
}

export interface AcquisitionEngineMetrics {
  totalCompaniesIngested: number;
  totalJobsIngested: number;
  totalCollegesIngested: number;
  totalTpoContactsIngested: number;
  totalRecruitersIngested: number;
  totalStaffingCompaniesIngested: number;
  activeOpportunityNodes: number;
  lastRunTimestamp: string;
}
