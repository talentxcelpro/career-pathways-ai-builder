// src/lib/acquisition-os/types.ts
// Authoritative Type System for TalentXcel Global Acquisition OS (12 Product Surfaces)

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
  feedbackCategory: 'HIGH_DEMAND_ZERO_PAGE' | 'LOW_CTR_HIGH_IMPRESSION' | 'LOW_CONVERSION_HIGH_TRAFFIC';
  recommendedAction: string;
  delegatedAgent: string;
  priority: 'P0' | 'P1' | 'P2';
}
