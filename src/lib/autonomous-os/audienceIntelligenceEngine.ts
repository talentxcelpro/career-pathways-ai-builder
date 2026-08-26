// src/lib/autonomous-os/audienceIntelligenceEngine.ts

export interface AudienceCohort {
  cohortId: string;
  name: string;
  primaryIntent: string;
  topSurface: string;
  highestYieldChannel: string;
  avgConversionRatePct: number;
}

export const AUDIENCE_COHORTS: AudienceCohort[] = [
  {
    cohortId: 'cohort_freshers_placement',
    name: '2026 Batch Engineering & MBA Graduates',
    primaryIntent: 'Campus Placement ATS Resume Screening & Fresher Roles',
    topSurface: 'RESUME_ATS',
    highestYieldChannel: 'PRODUCT_LED_UTILITY',
    avgConversionRatePct: 28.5
  },
  {
    cohortId: 'cohort_experienced_devs',
    name: 'Mid-Senior Software Engineers (2-6 Yrs)',
    primaryIntent: 'Salary Percentile Intelligence & Direct Tech Hiring',
    topSurface: 'SALARY_INTELLIGENCE',
    highestYieldChannel: 'AI_DISCOVERY_GEO',
    avgConversionRatePct: 18.2
  },
  {
    cohortId: 'cohort_recruiters',
    name: 'Startup Founders & Talent Acquisition Leads',
    primaryIntent: 'Fast-Track Verified Candidate Sourcing',
    topSurface: 'CAREER_PASSPORT',
    highestYieldChannel: 'PUBLIC_UGC_OBJECTS',
    avgConversionRatePct: 15.4
  }
];
