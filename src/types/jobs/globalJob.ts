/**
 * TalentXcel Global Job Graph — Universal Job Schema
 * Unifies Private Employer, Government, Public-Sector, and Partner Vacancies
 * into one canonical schema with strict provenance and source-rights tracking.
 */

export type JobSourceType =
  | 'EMPLOYER'         // Direct employer posting on TalentXcel
  | 'GOVERNMENT'       // Official federal, central, or state government portal
  | 'PUBLIC_SECTOR'    // PSU, national laboratory, public hospital, university
  | 'PARTNER'          // Licensed job board, ATS integration, or API feed
  | 'AGGREGATOR';      // Authorized job aggregation feed

export type EmployerType =
  | 'PRIVATE'          // Private corporation, startup, SME
  | 'GOVERNMENT'       // Ministry, department, government commission, municipal body
  | 'PSU'              // Public Sector Undertaking, state-owned enterprise
  | 'PUBLIC_INSTITUTION' // University, hospital, research body, defence forces
  | 'NON_PROFIT';      // NGO, multilateral agency, foundation

export type WorkplaceType =
  | 'ON_SITE'
  | 'HYBRID'
  | 'REMOTE';

export type RemoteScope =
  | 'LOCAL'            // Within commuting distance of city/locality
  | 'COUNTRY'          // Anywhere within the specified country
  | 'REGION'           // Multi-country region (e.g. APAC, EMEA, North America)
  | 'GLOBAL';          // Anywhere in the world with internet

export type ApplicationMethod =
  | 'TALENTXCEL'       // Native 1-Click Apply on TalentXcel (eligible for directApply: true)
  | 'EXTERNAL'         // Corporate ATS (Workday, Greenhouse, Lever, etc.)
  | 'OFFICIAL_GOVERNMENT' // Official portal (UPSC, USAJOBS, SSC, State PSC, etc.)
  | 'PARTNER';         // Partner board application destination

export type GlobalJobStatus =
  | 'DRAFT'            // Created but not published
  | 'PENDING_REVIEW'   // Awaiting verification or rights compliance check
  | 'VERIFIED'         // Passed quality and provenance validation
  | 'PUBLISHED'        // Live on TalentXcel Discovery
  | 'PAUSED'           // Temporarily hidden by employer or administrator
  | 'DEADLINE_PASSED'  // Application deadline has elapsed; awaiting official confirmation
  | 'EXPIRED'          // Verified closed/withdrawn/expired; no longer indexable
  | 'REMOVED';         // Withdrawn by official notice or policy violation

export type SalaryPeriod = 'HOUR' | 'MONTH' | 'YEAR';

export interface GlobalJobSalary {
  currency: string;                 // ISO 4217 uppercase, e.g. "INR", "USD"
  minimum?: number;
  maximum?: number;
  period: SalaryPeriod;
  original_display?: string;        // e.g. "₹8,00,000 - ₹12,00,000/yr" or "GS-13 $112,015 - $145,617"
  normalized_annual_inr?: number;   // Computed annual equivalent in INR for uniform filtering
  normalized_annual_usd?: number;   // Computed annual equivalent in USD for global sorting
  is_estimate?: boolean;            // True if salary is modeled/estimated rather than disclosed
}

export interface OrganizationEntity {
  id: string;                       // UUID or slug
  legal_name: string;               // e.g. "Union Public Service Commission" or "Google LLC"
  display_name: string;             // e.g. "UPSC" or "Google"
  website: string;
  logo_url?: string;
  country_code: string;             // ISO 3166-1 alpha-2 uppercase
  headquarters_city?: string;
  organization_type: EmployerType;
  verification_status:
    | 'UNVERIFIED'
    | 'DOMAIN_VERIFIED'
    | 'BUSINESS_VERIFIED'
    | 'GOVERNMENT_VERIFIED'
    | 'PARTNER_VERIFIED';
  careers_url?: string;
}

export interface JobProvenance {
  source_id: string;                // e.g. "usajobs", "employment-news", "direct"
  source_name: string;              // e.g. "USAJOBS — Official Federal Job Portal"
  source_url: string;               // Official web page / vacancy notice URL
  external_job_id: string;          // Source-specific announcement or requisition number
  ingestion_timestamp: string;      // ISO 8601
  last_verified_at: string;         // ISO 8601
  original_posted_at: string;       // ISO 8601
  official_notification_pdf_url?: string; // Direct link to gazette/official PDF where available
  attribution_required: boolean;
  attribution_text?: string;
  attribution_url?: string;
}

export interface CorrigendumUpdate {
  id: string;
  detected_at: string;              // ISO 8601
  update_type:
    | 'DEADLINE_EXTENSION'
    | 'ELIGIBILITY_CHANGE'
    | 'VACANCY_COUNT_CHANGE'
    | 'EXAM_DATE_CHANGE'
    | 'SYLLABUS_UPDATE'
    | 'APPLICATION_URL_CHANGE'
    | 'WITHDRAWAL'
    | 'CANCELLATION';
  description: string;
  old_value?: string;
  new_value?: string;
  official_notice_url?: string;
}

export interface FresherAssessment {
  is_fresher_eligible: boolean;
  confidence: number;               // 0.0 to 1.0
  reasons: string[];
  student_eligible?: boolean;
  graduate_eligible?: boolean;
  batch_years?: number[];           // e.g. [2024, 2025, 2026]
}

export interface GlobalJob {
  // Canonical identifiers
  id: string;                       // TalentXcel canonical UUID
  slug: string;                     // URL-friendly unique slug

  // Provenance & Source Metadata
  provenance: JobProvenance;

  // Organization
  employer: OrganizationEntity;

  // Core Content
  title: string;
  summary: string;
  description: string;              // Full description (plain text or semantic HTML)

  // Taxonomy & Classification
  industry_id: string;              // Maps to INDUSTRY_FAMILIES
  occupation_id: string;            // Standardized occupation code (ONET / ISCO)
  skills: string[];                 // Normalized skill names

  // Experience Requirements
  experience_level: string;         // e.g. 'ENTRY_LEVEL', 'FRESHER', 'MID_LEVEL', 'SENIOR'
  minimum_experience_months: number; // 0 for strict freshers
  maximum_experience_months?: number;
  accepts_freshers: boolean;
  requires_experience: boolean;
  fresher_assessment?: FresherAssessment;

  // Geographic Location
  country_code: string;             // ISO 3166-1 alpha-2, e.g. 'IN', 'US'
  country_name: string;
  region_code?: string;             // State/Province code, e.g. 'UP', 'CA'
  region_name?: string;             // State name, e.g. 'Uttar Pradesh', 'California'
  city?: string;                    // City name, e.g. 'Noida', 'Austin'
  locality?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;

  // Workplace & Remote
  workplace_type: WorkplaceType;
  remote_scope?: RemoteScope;
  remote_countries?: string[];
  required_timezone?: string;

  // Compensation
  salary?: GlobalJobSalary;

  // Employment Type
  employment_type: string;          // Maps to EMPLOYMENT_TYPES

  // Application Routing & Invariants
  application_method: ApplicationMethod;
  application_url: string;          // Final destination URL

  // Government & Sector-Specific Fields
  is_government: boolean;
  government_level?: 'FEDERAL' | 'STATE' | 'REGIONAL' | 'MUNICIPAL' | 'PUBLIC_SECTOR';
  advt_number?: string;             // Official advertisement / notification number
  vacancy_count?: number;           // Number of open posts
  corrigendum_history?: CorrigendumUpdate[];

  // Lifecycle & Dates
  posted_at: string;                // ISO 8601
  valid_through?: string;           // ISO 8601
  status: GlobalJobStatus;

  // Quality & Google Eligibility
  quality_score: number;            // 0 - 100 internal score
  is_google_eligible: boolean;      // Calculated by policy engine
  schema_validation_passed: boolean;
}
