// src/lib/seo/demandIntelligence/destinationMapper.ts
// Maps classified search queries to TalentXcel canonical routes using domainArchitecture policy
// and corrects non-canonical paths such as legacy /career/ CSV suggestions.

import { formatCanonicalUrl } from '../../../config/domainArchitecture';
import { slugifySegment } from './normalizer';
import type {
  EmploymentTypeTag,
  SearchIntentType,
  SeniorityTag,
  SeoOpportunityType,
  WorkModeTag,
} from './types';

export interface DestinationMappingInput {
  searchIntent: SearchIntentType;
  opportunityType: SeoOpportunityType;
  jobRoleSlug: string | null;
  skillSlug: string | null;
  industrySlug: string | null;
  countryCode: string;
  citySlug: string | null;
  seniority: SeniorityTag;
  employmentType: EmploymentTypeTag;
  workMode: WorkModeTag;
}

export interface DestinationMappingOutput {
  recommendedDestination: string;
  recommendedCanonicalUrl: string;
  surfaceName: string;
}

const COUNTRY_ROUTE_SLUG: Record<string, string> = {
  IN: 'india',
  US: 'usa',
  GB: 'uk',
  CA: 'canada',
  AU: 'australia',
  DE: 'germany',
  AE: 'uae',
  SG: 'singapore',
  SA: 'saudi-arabia',
  NL: 'netherlands',
  FR: 'france',
  IE: 'ireland',
  GLB: 'remote',
};

/**
 * Resolves the authoritative relative route and full canonical URL for any search intent + entity set.
 * Enforces apex domain consolidation (`https://talentxcel.in`) and `https://salary.talentxcel.in` canary.
 */
export function resolveCanonicalDestination(input: DestinationMappingInput): DestinationMappingOutput {
  const {
    searchIntent,
    opportunityType,
    jobRoleSlug,
    skillSlug,
    industrySlug,
    countryCode,
    citySlug,
    seniority,
    workMode,
  } = input;

  const geoSlug = citySlug || COUNTRY_ROUTE_SLUG[countryCode] || (workMode === 'remote' ? 'remote' : 'india');
  let routePath = '/jobs';
  let surfaceName = 'JOBS';

  switch (searchIntent) {
    case 'resume_ats':
      routePath = '/resume/ats-check';
      surfaceName = 'ATS_CHECK';
      break;
    case 'assessment_score':
      routePath = '/talent-score';
      surfaceName = 'TALENT_SCORE';
      break;
    case 'career_passport':
      routePath = '/passport';
      surfaceName = 'CAREER_PASSPORT';
      break;
    case 'recruiter_b2b':
      routePath = '/employer';
      surfaceName = 'RECRUITER_OS';
      break;
    case 'college_placement':
      routePath = '/colleges';
      surfaceName = 'COLLEGES';
      break;
    case 'government_jobs':
      routePath = countryCode === 'IN' ? '/government-jobs' : `/jobs/government/${slugifySegment(geoSlug)}`;
      surfaceName = 'GOVERNMENT_JOBS';
      break;
    case 'community_network':
      routePath = skillSlug ? `/network/skills/${skillSlug}` : `/network/locations/${slugifySegment(geoSlug)}`;
      surfaceName = 'NETWORK';
      break;
    case 'salary_benchmark':
      if (jobRoleSlug && citySlug) {
        routePath = `/salary/${jobRoleSlug}/${citySlug}`;
      } else if (jobRoleSlug) {
        routePath = `/salary/${jobRoleSlug}`;
      } else {
        routePath = '/salary';
      }
      surfaceName = 'SALARY';
      break;
    case 'interview_prep':
      routePath = jobRoleSlug ? `/interview/${jobRoleSlug}` : '/interview-questions';
      surfaceName = 'INTERVIEW';
      break;
    case 'career_roadmap':
      routePath = jobRoleSlug ? `/career-map/${jobRoleSlug}` : industrySlug ? `/industries/${industrySlug}` : '/career-insights';
      surfaceName = 'CAREER_MAP';
      break;
    case 'skill_learning':
      routePath = opportunityType === 'skill-job' && skillSlug
        ? `/jobs/skill/${skillSlug}`
        : skillSlug
          ? `/learning/${skillSlug}`
          : '/learning';
      surfaceName = opportunityType === 'skill-job' ? 'JOBS' : 'LEARNING';
      break;
    case 'company_research':
      routePath = '/companies';
      surfaceName = 'EMPLOYERS';
      break;
    case 'remote_work':
      routePath = jobRoleSlug ? `/jobs/${jobRoleSlug}/remote` : '/jobs/remote';
      surfaceName = 'JOBS';
      break;
    case 'internship':
      routePath = jobRoleSlug ? `/jobs/${jobRoleSlug}/internship/${geoSlug}` : `/jobs/internship/${geoSlug}`;
      surfaceName = 'JOBS';
      break;
    case 'fresher_entry':
      if (jobRoleSlug) {
        routePath = `/jobs/${jobRoleSlug}/fresher/${geoSlug}`;
      } else {
        routePath = '/jobs/fresher';
      }
      surfaceName = 'JOBS';
      break;
    case 'visa_international':
      routePath = jobRoleSlug ? `/jobs/${jobRoleSlug}/${geoSlug}` : `/jobs/location/${geoSlug}`;
      surfaceName = 'JOBS';
      break;
    case 'job_search':
    default:
      if (jobRoleSlug && citySlug) {
        routePath = `/jobs/${jobRoleSlug}/${citySlug}`;
      } else if (jobRoleSlug && seniority === 'senior') {
        routePath = `/jobs/${jobRoleSlug}/senior/${geoSlug}`;
      } else if (jobRoleSlug) {
        routePath = `/jobs/${jobRoleSlug}/${geoSlug}`;
      } else if (skillSlug) {
        routePath = `/jobs/skill/${skillSlug}`;
      } else if (industrySlug) {
        routePath = `/jobs/industry/${industrySlug}`;
      } else if (citySlug || countryCode !== 'GLB') {
        routePath = `/jobs/location/${geoSlug}`;
      } else {
        routePath = '/jobs';
      }
      surfaceName = 'JOBS';
      break;
  }

  return {
    recommendedDestination: routePath,
    recommendedCanonicalUrl: formatCanonicalUrl(routePath),
    surfaceName,
  };
}
