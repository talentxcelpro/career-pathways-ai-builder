// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — Global Education Intelligence Layer Types
// Scalable data models for multi-evidence ledger, source registry,
// autonomous discovery, and honest 4-tier course access pricing.
// ─────────────────────────────────────────────────────────────────────────────

export type AccessType =
  | 'FULLY_FUNDED'              // ₹0 tuition + ₹0 mandatory costs, funding covers student
  | 'TUITION_FREE'              // ₹0 tuition; admin/semester/exam fees may apply
  | 'SCHOLARSHIP_MAKES_IT_FREE' // Normal tuition, but 100% scholarship available
  | 'FREE_TO_LEARN_PAID_CREDENTIAL'; // Content is free, degree/cert requires payment

export type CourseAccessType =
  | 'FREE_TO_LEARN'            // 🟢 Learning access genuinely costs ₹0
  | 'FREE_WITH_LIMITATIONS'    // 🔵 Some content/free audit, but restrictions apply (e.g. labs/quizzes)
  | 'PAID_CREDENTIAL'          // 🟡 Learning may be free, credential costs money
  | 'PAID';                    // 🔴 Requires payment for access

export type CredentialType =
  | 'degree'
  | 'diploma'
  | 'professional_certificate'
  | 'course_certificate'
  | 'none';

export type ProgramLevel =
  | 'school'
  | 'diploma'
  | 'bachelor'
  | 'master'
  | 'phd'
  | 'postdoc'
  | 'certificate'
  | 'short_course';

export type VerificationStatus =
  | 'VERIFIED'
  | 'PENDING'
  | 'NEEDS_REVIEW'
  | 'UNVERIFIED'
  | 'FLAGGED';

// Agent freshness tracking
export type FreshnessStatus =
  | 'VERIFIED_TODAY'       // 🟢 last_verified_at within 24h
  | 'VERIFIED_7D'          // 🔵 verified within 7 days
  | 'VERIFICATION_DUE'     // 🟡 next_check_at is past
  | 'CHANGED_REVIEWING'    // 🔴 change detected, under review
  | 'NEEDS_REVIEW'         // Confidence too low to auto-publish
  | 'PENDING';             // Not yet verified

export type CheckPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export type ScholarshipCoverage =
  | 'FULL'      // 100% — tuition + living + travel
  | 'TUITION'   // Covers tuition only
  | 'PARTIAL'   // Partial — student pays some
  | 'LIVING'    // Living/stipend only
  | 'TRAVEL';   // Travel only

export type EducationBudget =
  | 'ZERO'       // ₹0
  | 'UNDER_50K'  // Under ₹50,000
  | 'UNDER_2L'   // ₹50K – ₹2 Lakh
  | 'FLEXIBLE';  // No budget constraint

export type CurrentLevel =
  | '10th'
  | '12th'
  | 'bachelor'
  | 'master'
  | 'working';

export type SourceType =
  | 'national_portal'
  | 'ministry'
  | 'university_domain'
  | 'scholarship_body'
  | 'accreditation_body'
  | 'aggregator';

export type EvidenceType =
  | 'tuition'
  | 'funding'
  | 'eligibility'
  | 'deadline'
  | 'accreditation'
  | 'credential';

// ─────────────────────────────────────────────────────────────────────────────
// AUTHORITATIVE SOURCE REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export interface EducationSourceRegistry {
  id: string;
  name: string;
  country: string;
  source_type: SourceType;
  base_url: string;
  official_domain: string;
  priority: number; // 1 (highest) to 5
  crawl_frequency_hours: number;
  last_crawled_at?: string;
  next_crawl_at?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-EVIDENCE LEDGER
// ─────────────────────────────────────────────────────────────────────────────
export interface EducationEvidence {
  id: string;
  entity_type: 'program' | 'scholarship' | 'institution' | 'course';
  entity_id: string;
  source_url: string;
  source_domain: string;
  source_type: SourceType;
  evidence_type: EvidenceType;
  evidence_text: string; // Raw quote / extracted excerpt snippet
  content_hash?: string;
  captured_at: string;
  verified_at?: string;
  verification_status: VerificationStatus;
  confidence_score: number; // 0 - 100
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTITUTION
// ─────────────────────────────────────────────────────────────────────────────
export interface EducationInstitution {
  id: string;
  name: string;
  country: string;
  city?: string;
  type: 'public' | 'private' | 'online' | 'government';
  ranking_qs?: number;
  ranking_the?: number;
  official_website_url: string;
  logo_url?: string;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL PROGRAM
// Agent-updatable. Every field can be refreshed by a data agent.
// ─────────────────────────────────────────────────────────────────────────────
export interface GlobalProgram {
  id: string;

  // Institution
  institution_name: string;
  institution_country: string;
  institution_type: 'public' | 'private' | 'online' | 'government';
  institution_logo_url?: string;
  institution_ranking_qs?: number;
  institution_ranking_the?: number;

  // Program details
  program_title: string;
  field: string;
  discipline?: string;
  level: ProgramLevel;
  credential: string;
  credential_type?: CredentialType;
  academic_credits_awarded?: boolean;
  duration_months: number;
  language: string;
  mode: 'on_campus' | 'online' | 'hybrid';

  // Access & cost — all four fields REQUIRED before going live
  access_type: AccessType;
  tuition_cost_usd: number;
  other_mandatory_costs_usd: number;
  currency_note?: string;

  // Funding
  scholarship_available: boolean;
  scholarship_name?: string;
  scholarship_coverage?: ScholarshipCoverage;
  scholarship_amount_usd?: number;
  scholarship_url?: string;
  potential_zero_cost: boolean;

  // Eligibility
  eligible_nationalities?: string[];
  min_gpa?: number;
  required_exams?: string[];
  min_language_score?: string;

  // Application
  application_deadline?: string;
  intake_months?: string[];
  application_fee_usd?: number;

  // Verification & Evidence
  official_url: string;
  source_evidence?: string;
  tuition_evidence?: string;
  funding_evidence?: string;
  evidence_items?: EducationEvidence[];
  verification_status: VerificationStatus;
  confidence_score?: number;
  is_published?: boolean;
  last_verified_at?: string;
  next_verification_due?: string;
  verified_by?: string;

  // Career graph links
  career_relevance?: string[];
  skills?: string[];
  industry_id?: string;

  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// LEARNING OPPORTUNITIES / FOUNDATION COURSES (Non-Degree)
// ─────────────────────────────────────────────────────────────────────────────
export interface EducationCourse {
  id: string;
  title: string;
  provider: string;
  platform?: string;
  field: string;
  course_access_type: CourseAccessType;
  academic_credits_awarded: boolean; // explicitly false for non-credit courses
  credential_type: CredentialType;
  estimated_hours?: number;
  url: string;
  skills: string[];
  verification_status: VerificationStatus;
  evidence_text?: string;
  created_at?: string;
  updated_at?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL SCHOLARSHIP
// ─────────────────────────────────────────────────────────────────────────────
export interface GlobalScholarship {
  id: string;

  title: string;
  provider: string;
  provider_country: string;
  provider_logo_url?: string;

  description?: string;
  amount_usd?: number;
  coverage: ScholarshipCoverage;
  coverage_detail?: string;

  eligible_levels: ProgramLevel[];
  eligible_nationalities?: string[];
  eligible_fields?: string[];
  eligible_countries?: string[];

  deadline?: string;
  renewable: boolean;
  duration_months?: number;

  can_make_tuition_zero: boolean;

  official_url: string;
  verification_status: VerificationStatus;
  confidence_score?: number;
  last_verified_at?: string;
  source_evidence?: string;
  evidence_items?: EducationEvidence[];

  created_at: string;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// EDUCATION PATHWAY
// ─────────────────────────────────────────────────────────────────────────────
export interface PathwayInput {
  goal: string;
  current_level: CurrentLevel;
  budget: EducationBudget;
  nationality?: string;
  preferred_countries?: string[];
  preferred_language?: string;
}

export interface PathwayStepItem {
  type: 'course' | 'program' | 'scholarship' | 'exam' | 'action' | 'resource';
  title: string;
  provider?: string;
  url?: string;
  cost?: string;
  access_type?: AccessType;
  course_access_type?: CourseAccessType;
  credential_type?: CredentialType;
  academic_credits_awarded?: boolean;
  is_free: boolean;
  evidence_snippet?: string;
  notes?: string;
}

export interface PathwayStep {
  step_number: number;
  title: string;
  description: string;
  icon: string;
  items: PathwayStepItem[];
  estimated_duration?: string;
  cost_estimate?: string;
}

export interface EducationPathway {
  id?: string;
  user_id?: string;
  input: PathwayInput;
  goal_resolved: string;
  skills_required: string[];
  steps: PathwayStep[];
  matched_programs: GlobalProgram[];
  matched_scholarships: GlobalScholarship[];
  total_estimated_cost: string;
  honest_caveat?: string;
  generated_at: string;
  expires_at?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// FILTER TYPES
// ─────────────────────────────────────────────────────────────────────────────
export interface GlobalProgramFilters {
  search?: string;
  country?: string;
  level?: ProgramLevel;
  field?: string;
  access_type?: AccessType;
  scholarship_available?: boolean;
  potential_zero_cost?: boolean;
  language?: string;
}

export interface ScholarshipFilters {
  search?: string;
  provider_country?: string;
  level?: ProgramLevel;
  coverage?: ScholarshipCoverage;
  can_make_tuition_zero?: boolean;
  eligible_nationality?: string;
}
