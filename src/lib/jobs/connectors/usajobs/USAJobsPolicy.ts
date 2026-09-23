/**
 * USAJOBS Ingestion & Rights Governance Policy
 * Complies with USAJOBS Terms of Service:
 * 1. Data may be retrieved and stored internally for job board search & indexing.
 * 2. Mandatory attribution credit to USAJOBS / U.S. Office of Personnel Management.
 * 3. Applicants MUST be directed to USAJOBS / official agency URL for application.
 * 4. directApply: false always.
 */

export const USAJOBS_SOURCE_ID = 'us-usajobs';
export const USAJOBS_ATTRIBUTION_TEXT = 'Source: USAJOBS — The Federal Government’s Official Jobs Site (U.S. OPM)';
export const USAJOBS_PORTAL_URL = 'https://www.usajobs.gov';

export function isUSAJobsRecentGraduateEligible(lowGrade?: string, whoMayApply?: string): boolean {
  if (whoMayApply?.toLowerCase().includes('student') || whoMayApply?.toLowerCase().includes('graduate')) {
    return true;
  }
  // Federal General Schedule (GS) grades 1 through 7 are typical student / entry-level / recent graduate grades
  if (lowGrade) {
    const gradeNum = parseInt(lowGrade, 10);
    if (!isNaN(gradeNum) && gradeNum >= 1 && gradeNum <= 7) {
      return true;
    }
  }
  return false;
}
