// ─────────────────────────────────────────────────────────────────────────────
// TalentXcel — Global Education Intelligence Layer Types
// Reusable from Day 1. Future /education route can import all types from here.
// ─────────────────────────────────────────────────────────────────────────────

export type AccessType =
  | 'FULLY_FUNDED'              // ₹0 tuition + ₹0 mandatory costs, funding covers student
  | 'TUITION_FREE'              // ₹0 tuition; admin/semester/exam fees may apply
  | 'SCHOLARSHIP_MAKES_IT_FREE' // Normal tuition, but 100% scholarship available
  | 'FREE_TO_LEARN_PAID_CREDENTIAL'; // Content is free, degree/cert requires payment

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
  | 'UNVERIFIED';

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

  // Verification
  official_url: string;
  source_evidence?: string;
  verification_status: VerificationStatus;
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
  last_verified_at?: string;
  source_evidence?: string;

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
  is_free: boolean;
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
