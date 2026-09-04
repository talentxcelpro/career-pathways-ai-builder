// src/lib/acquisition-os/types.ts
// Authoritative Type System for TalentXcel Global Acquisition OS (12 Product Surfaces)
// Extended with Brand Marketing dimensions (demandType, brandSubCategory)

export type AcquisitionSurfaceId =
  | 'JOBS'              // 1. Role x Experience x City x Company
  | 'EMPLOYER'          // 2. Multi-location hiring & employer acquisition
  | 'COMPANIES'         // 3. Company profiles & hiring hubs
  | 'RANKINGS'          // 4. Claim #1 bidder rankings & industry boards
  | 'RESUME_BUILDER'    // 5. Resume templates, builder & ATS scanner
  | 'CAREER_TOOLS'      // 6. Salary calculators, interview prep, career tools
  | 'SERVICES'          // 7. Executive resume writing & career coaching
  | 'LEARNING'          // 8. Skill courses, certifications & upskilling
  | 'COLLEGES'          // 9. Verified degree programs & scholarships
  | 'CAREER_MAP'        // 10. Visual progression pathways & roadmaps
  | 'CAREER_PASSPORT'   // 11. Living professional identity & credentials
  | 'NETWORK';          // 12. Professional networking, connections & peers

export const ALL_12_ACQUISITION_SURFACES: AcquisitionSurfaceId[] = [
  'JOBS',
  'EMPLOYER',
  'COMPANIES',
  'RANKINGS',
  'RESUME_BUILDER',
  'CAREER_TOOLS',
  'SERVICES',
  'LEARNING',
  'COLLEGES',
  'CAREER_MAP',
  'CAREER_PASSPORT',
  'NETWORK',
];

export interface AcquisitionSurfaceMeta {
  id: AcquisitionSurfaceId;
  name: string;
  baseUrl: string;
  primaryIntent: 'TRANSACTIONAL' | 'COMMERCIAL' | 'INFORMATIONAL' | 'NAVIGATIONAL';
  targetAudience: 'JOB_SEEKERS' | 'EMPLOYERS' | 'STUDENTS' | 'PROFESSIONALS';
  crossModuleNextSteps: AcquisitionSurfaceId[];
}

export interface CrossModuleJourneyStep {
  stepIndex: number;
  surfaceId: AcquisitionSurfaceId;
  title: string;
  urlPath: string;
  callToAction: string;
  conversionValue: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAXIMAL';
}

export interface GscFeedbackOpportunity {
  id: string;
  query: string;
  surface: AcquisitionSurfaceId;
  currentImpressions: number;
  currentClicks: number;
  currentCtrPct: number;
  averagePosition: number;
  feedbackCategory: 
    | 'HIGH_DEMAND_ZERO_PAGE' 
    | 'LOW_CTR_HIGH_IMPRESSION' 
    | 'LOW_CONVERSION_HIGH_TRAFFIC'
    | 'BRAND_AWARENESS_GAP'     // Brand query has high impressions but no dedicated brand landing response
    | 'BRAND_CTR_LOSS';         // Brand query in top 5 but CTR below expected for brand queries
  recommendedAction: string;
  delegatedAgent: string;
  priority: 'P0' | 'P1' | 'P2';

  // Brand Marketing dimensions — null for non-branded queries
  demandType?: 'GENERIC' | 'BRANDED';
  brandSubCategory?: string | null;  // BrandSubCategory string (avoids circular import)
  geoSignal?: string | null;
  productSignal?: string | null;
  competitorMentioned?: string | null;
}

/**
 * Demand type dimension for the unified Acquisition Intelligence model.
 * GENERIC = user searches for something, finds TalentXcel.
 * BRANDED = user searches for TalentXcel specifically.
 */
export type DemandType = 'GENERIC' | 'BRANDED';

/**
 * Result of processing a single branded GSC row through the brand classifier + triage logic.
 * All metrics here come from real GSC rows — never fabricated.
 */
export interface BrandedQueryTriage {
  query: string;
  brandSubCategory: string;          // BrandSubCategory string
  subCategories: string[];
  geoSignal: string | null;
  productSignal: string | null;
  competitorMentioned: string | null;
  recommendedLandingPage: string;
  impressions: number;
  clicks: number;
  ctrPct: number;
  averagePosition: number;
  feedbackCategory: 'BRAND_AWARENESS_GAP' | 'BRAND_CTR_LOSS' | 'BRAND_HEALTHY';
  recommendedAction: string;
  priority: 'P0' | 'P1' | 'P2' | 'INFO';
}

