// src/lib/seo/searchUniverse/intentExpansionEngine.ts
/**
 * TalentXcel Systematic Intent Expansion Engine
 *
 * Expands canonical entities (Roles, Companies, Skills, Colleges, Govt Bodies)
 * across legitimate, orthogonal search intent dimensions while strictly
 * preventing useless Cartesian product bloat.
 */

import { LocationHierarchyNode, GlobalLocationHierarchy } from './globalLocationHierarchy';
import { IntentTypeId, INTENT_TAXONOMY_REGISTRY } from './intentTaxonomyRegistry';

export interface CandidateSearchOpportunity {
  keyword: string;
  normalizedQuery: string;
  intentType: IntentTypeId;
  canonicalEntity: string;
  secondaryEntity?: string;
  locationNode?: LocationHierarchyNode;
  recommendedUrl: string;
  recommendedTemplate: string;
  estimatedMonthlyDemand: number;
}

export class IntentExpansionEngine {
  /**
   * Systematically expands a job role across all legitimate search universes
   */
  static expandRoleEntity(
    roleSlug: string,
    roleTitle: string,
    eligibleLocations: LocationHierarchyNode[]
  ): CandidateSearchOpportunity[] {
    const opportunities: CandidateSearchOpportunity[] = [];
    const roleLower = roleTitle.toLowerCase();

    // 1. Role x Locations x Jobs (Active Vacancies)
    for (const loc of eligibleLocations) {
      opportunities.push({
        keyword: `${roleLower} jobs in ${loc.canonicalName.toLowerCase()}`,
        normalizedQuery: `${roleSlug}-jobs-${loc.slug}`,
        intentType: 'JOBS',
        canonicalEntity: roleSlug,
        locationNode: loc,
        recommendedUrl: `/jobs/${roleSlug}/${loc.slug}`,
        recommendedTemplate: 'JOB_ROLE_CITY_PAGE',
        estimatedMonthlyDemand: loc.adminLevel <= 3 ? 9500 : 3800,
      });

      // Role x Locations x Salary (Compensation Benchmarks)
      opportunities.push({
        keyword: `${roleLower} salary in ${loc.canonicalName.toLowerCase()}`,
        normalizedQuery: `${roleSlug}-salary-${loc.slug}`,
        intentType: 'SALARY',
        canonicalEntity: roleSlug,
        locationNode: loc,
        recommendedUrl: `/salary/${roleSlug}/${loc.slug}`,
        recommendedTemplate: 'SALARY_BENCHMARK_PAGE',
        estimatedMonthlyDemand: loc.adminLevel <= 3 ? 6200 : 2500,
      });
    }

    // 2. High-Intent Career Utilities (Location-Agnostic / Global)
    // ATS Resume Checker
    opportunities.push({
      keyword: `free ats resume score checker for ${roleLower}`,
      normalizedQuery: `${roleSlug}-ats-resume-checker`,
      intentType: 'ATS_CHECKER',
      canonicalEntity: roleSlug,
      recommendedUrl: `/resume/ats-check/${roleSlug}`,
      recommendedTemplate: 'ATS_CHECKER_TOOL',
      estimatedMonthlyDemand: 8500,
    });

    // Resume Templates
    opportunities.push({
      keyword: `${roleLower} resume template download`,
      normalizedQuery: `${roleSlug}-resume-template`,
      intentType: 'TEMPLATE',
      canonicalEntity: roleSlug,
      recommendedUrl: `/resume-templates/${roleSlug}`,
      recommendedTemplate: 'RESUME_ROLE_LEVEL',
      estimatedMonthlyDemand: 7200,
    });

    // Resume Examples
    opportunities.push({
      keyword: `${roleLower} resume bullet points examples`,
      normalizedQuery: `${roleSlug}-resume-examples`,
      intentType: 'EXAMPLE',
      canonicalEntity: roleSlug,
      recommendedUrl: `/resume-examples/${roleSlug}`,
      recommendedTemplate: 'RESUME_ROLE_LEVEL',
      estimatedMonthlyDemand: 4600,
    });

    // Interview Questions & STAR Answers
    opportunities.push({
      keyword: `${roleLower} interview questions and answers 2026`,
      normalizedQuery: `${roleSlug}-interview-questions`,
      intentType: 'INTERVIEWS',
      canonicalEntity: roleSlug,
      recommendedUrl: `/interview-questions/${roleSlug}`,
      recommendedTemplate: 'INTERVIEW_QUESTIONS_PAGE',
      estimatedMonthlyDemand: 5800,
    });

    // Career Roadmap
    opportunities.push({
      keyword: `${roleLower} career path and promotion milestones`,
      normalizedQuery: `${roleSlug}-career-pathway`,
      intentType: 'CAREER_PATHWAY',
      canonicalEntity: roleSlug,
      recommendedUrl: `/career-pathway/${roleSlug}`,
      recommendedTemplate: 'SKILL_INTELLIGENCE_PAGE',
      estimatedMonthlyDemand: 3400,
    });

    // Fresher Jobs
    opportunities.push({
      keyword: `${roleLower} jobs for freshers 2026`,
      normalizedQuery: `${roleSlug}-jobs-freshers`,
      intentType: 'FRESHER',
      canonicalEntity: roleSlug,
      recommendedUrl: `/jobs/${roleSlug}/freshers`,
      recommendedTemplate: 'JOB_ROLE_CITY_PAGE',
      estimatedMonthlyDemand: 11000,
    });

    // Remote Worldwide Jobs
    opportunities.push({
      keyword: `remote ${roleLower} jobs worldwide`,
      normalizedQuery: `${roleSlug}-remote-jobs`,
      intentType: 'REMOTE',
      canonicalEntity: roleSlug,
      recommendedUrl: `/jobs/remote/${roleSlug}`,
      recommendedTemplate: 'JOB_ROLE_CITY_PAGE',
      estimatedMonthlyDemand: 14500,
    });

    // Student Internships
    opportunities.push({
      keyword: `${roleLower} internship summer 2026`,
      normalizedQuery: `${roleSlug}-internship`,
      intentType: 'INTERNSHIP',
      canonicalEntity: roleSlug,
      recommendedUrl: `/internships/${roleSlug}`,
      recommendedTemplate: 'JOB_ROLE_CITY_PAGE',
      estimatedMonthlyDemand: 5200,
    });

    return opportunities;
  }

  /**
   * Systematically expands a corporate employer across verified intent dimensions
   */
  static expandCompanyEntity(
    companySlug: string,
    companyName: string,
    topRoles: Array<{ slug: string; title: string }>
  ): CandidateSearchOpportunity[] {
    const opportunities: CandidateSearchOpportunity[] = [];
    const compLower = companyName.toLowerCase();

    // 1. Company General Careers
    opportunities.push({
      keyword: `${compLower} jobs and careers 2026`,
      normalizedQuery: `${companySlug}-jobs`,
      intentType: 'JOBS',
      canonicalEntity: companySlug,
      recommendedUrl: `/company/${companySlug}/jobs`,
      recommendedTemplate: 'COMPANY_CAREERS_DOSSIER',
      estimatedMonthlyDemand: 12000,
    });

    // 2. Company Salaries
    opportunities.push({
      keyword: `${compLower} salary and compensation bands`,
      normalizedQuery: `${companySlug}-salary`,
      intentType: 'SALARY',
      canonicalEntity: companySlug,
      recommendedUrl: `/company/${companySlug}/salary`,
      recommendedTemplate: 'COMPANY_CAREERS_DOSSIER',
      estimatedMonthlyDemand: 8900,
    });

    // 3. Company Interview Process & Questions
    opportunities.push({
      keyword: `${compLower} interview questions and hiring process`,
      normalizedQuery: `${companySlug}-interview`,
      intentType: 'INTERVIEWS',
      canonicalEntity: companySlug,
      recommendedUrl: `/company/${companySlug}/interview`,
      recommendedTemplate: 'COMPANY_CAREERS_DOSSIER',
      estimatedMonthlyDemand: 9500,
    });

    // 4. Company x Role Combinations
    for (const r of topRoles.slice(0, 5)) {
      opportunities.push({
        keyword: `${compLower} ${r.title.toLowerCase()} salary and job vacancies`,
        normalizedQuery: `${companySlug}-${r.slug}-jobs`,
        intentType: 'JOBS',
        canonicalEntity: companySlug,
        secondaryEntity: r.slug,
        recommendedUrl: `/company/${companySlug}/jobs/${r.slug}`,
        recommendedTemplate: 'COMPANY_ROLE_PAGE',
        estimatedMonthlyDemand: 4500,
      });
    }

    return opportunities;
  }

  /**
   * Systematically expands a higher education institution
   */
  static expandCollegeEntity(collegeSlug: string, collegeName: string): CandidateSearchOpportunity[] {
    const opportunities: CandidateSearchOpportunity[] = [];
    const colLower = collegeName.toLowerCase();

    // Placements
    opportunities.push({
      keyword: `${colLower} placement report 2026 average ctc and packages`,
      normalizedQuery: `${collegeSlug}-placements`,
      intentType: 'PLACEMENTS',
      canonicalEntity: collegeSlug,
      recommendedUrl: `/colleges/${collegeSlug}/placements`,
      recommendedTemplate: 'COLLEGE_DOSSIER_PLACEMENTS',
      estimatedMonthlyDemand: 14000,
    });

    // Admissions
    opportunities.push({
      keyword: `${colLower} admissions cutoff and eligibility criteria`,
      normalizedQuery: `${collegeSlug}-admissions`,
      intentType: 'ADMISSIONS',
      canonicalEntity: collegeSlug,
      recommendedUrl: `/colleges/${collegeSlug}/admissions`,
      recommendedTemplate: 'COLLEGE_DOSSIER_PLACEMENTS',
      estimatedMonthlyDemand: 9200,
    });

    return opportunities;
  }

  /**
   * Systematically expands a government recruitment authority
   */
  static expandGovernmentEntity(govtSlug: string, govtName: string): CandidateSearchOpportunity[] {
    const opportunities: CandidateSearchOpportunity[] = [];
    const govtLower = govtName.toLowerCase();

    opportunities.push({
      keyword: `${govtLower} recruitment 2026 notification and vacancies`,
      normalizedQuery: `${govtSlug}-recruitment-notification`,
      intentType: 'GOVT_JOBS',
      canonicalEntity: govtSlug,
      recommendedUrl: `/government-jobs/india/${govtSlug}`,
      recommendedTemplate: 'GOVERNMENT_JOB_PAGE',
      estimatedMonthlyDemand: 35000,
    });

    opportunities.push({
      keyword: `${govtLower} exam syllabus and eligibility criteria`,
      normalizedQuery: `${govtSlug}-syllabus-eligibility`,
      intentType: 'GOVT_JOBS',
      canonicalEntity: govtSlug,
      recommendedUrl: `/government-jobs/india/${govtSlug}/syllabus`,
      recommendedTemplate: 'GOVERNMENT_JOB_PAGE',
      estimatedMonthlyDemand: 18000,
    });

    return opportunities;
  }
}
