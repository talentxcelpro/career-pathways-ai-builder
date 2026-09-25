/**
 * TalentXcel Platform Metrics — Single Source of Truth
 * 
 * Prevents metric drift across Landing Pages, Auth, SEO Meta, OpenGraph,
 * Social Conversion CTAs, and Recruiter OS.
 */

export interface PlatformMetrics {
  /** Total searchable talent profiles & network professionals */
  totalProfessionalsDisplay: string;
  totalProfessionalsRaw: number;
  
  /** Number of verified Career Passports with audited TalentScores */
  verifiedPassportsDisplay: string;
  
  /** Active hiring teams, recruiters and enterprise organizations */
  hiringTeamsDisplay: string;
  activeCompaniesDisplay: string;
  
  /** Active verified career opportunities in warehouse */
  activeJobsDisplay: string;
  
  /** Indian and global colleges & institutions in career pathways */
  collegesCatalogedDisplay: string;
  
  /** Match success benchmark based on verified skills */
  matchSuccessRateDisplay: string;
  
  /** Concurrent active network members */
  onlineActiveMembersDisplay: string;
}

export const PLATFORM_METRICS: PlatformMetrics = {
  totalProfessionalsDisplay: '12,000+',
  totalProfessionalsRaw: 12450,
  verifiedPassportsDisplay: '8,500+',
  hiringTeamsDisplay: '500+',
  activeCompaniesDisplay: '500+',
  activeJobsDisplay: '15,000+',
  collegesCatalogedDisplay: '10,250+',
  matchSuccessRateDisplay: '95%',
  onlineActiveMembersDisplay: '3,400+',
};

export default PLATFORM_METRICS;
