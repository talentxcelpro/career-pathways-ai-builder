/**
 * USAJOBS Normalizer
 * Transforms USAJOBS API Item into canonical GlobalJob entity.
 */

import { USAJobsItem } from './USAJobsTypes';
import { GlobalJob } from '@/types/jobs/globalJob';
import { mapUSAJobsSalary, mapUSAJobsWorkplace } from './USAJobsMapper';
import { USAJOBS_SOURCE_ID, USAJOBS_ATTRIBUTION_TEXT, isUSAJobsRecentGraduateEligible } from './USAJobsPolicy';

export function normalizeUSAJobsItem(item: USAJobsItem): GlobalJob {
  const desc = item.MatchedObjectDescriptor;
  const primaryLoc = desc.PositionLocation?.[0];
  const userDetails = desc.UserArea?.Details;

  const lowGrade = userDetails?.LowGrade;
  const isGraduate = isUSAJobsRecentGraduateEligible(lowGrade, userDetails?.WhoMayApply?.Name);

  const { workplaceType, remoteScope } = mapUSAJobsWorkplace(item);
  const salary = mapUSAJobsSalary(item);

  const fullDescription = desc.PositionFormattedDescription?.map((d) => `${d.Label}\n${d.LabelDescription}`).join('\n\n') ||
    userDetails?.JobSummary ||
    desc.QualificationSummary ||
    'Official vacancy notice via USAJOBS.';

  const summary = userDetails?.JobSummary || desc.QualificationSummary?.slice(0, 300) || desc.PositionTitle;

  const externalJobId = item.MatchedObjectId || desc.PositionID;
  const applyUrl = desc.ApplyURI?.[0] || desc.PositionURI;

  return {
    id: `usajobs-${externalJobId}`,
    slug: `federal-${desc.PositionTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${externalJobId}`,
    provenance: {
      source_id: USAJOBS_SOURCE_ID,
      source_name: 'USAJOBS — Official Federal Job Portal (U.S. OPM)',
      source_url: desc.PositionURI,
      external_job_id: externalJobId,
      ingestion_timestamp: new Date().toISOString(),
      last_verified_at: new Date().toISOString(),
      original_posted_at: desc.PublicationStartDate,
      attribution_required: true,
      attribution_text: USAJOBS_ATTRIBUTION_TEXT,
      attribution_url: desc.PositionURI,
    },
    employer: {
      id: `us-dept-${desc.DepartmentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      legal_name: desc.DepartmentName,
      display_name: desc.OrganizationName || desc.DepartmentName,
      website: 'https://www.usa.gov',
      country_code: 'US',
      organization_type: 'GOVERNMENT',
      verification_status: 'GOVERNMENT_VERIFIED',
      careers_url: desc.PositionURI,
    },
    title: desc.PositionTitle,
    summary,
    description: fullDescription,
    industry_id: 'government-psu',
    occupation_id: desc.JobCategory?.[0]?.Code || 'federal-civil-service',
    skills: [
      desc.JobCategory?.[0]?.Name,
      desc.SubAgency,
      'Federal Government',
      'Public Administration',
    ].filter(Boolean) as string[],
    experience_level: isGraduate ? 'ENTRY_LEVEL' : 'MID_LEVEL',
    minimum_experience_months: isGraduate ? 0 : 24,
    accepts_freshers: isGraduate,
    requires_experience: !isGraduate,
    fresher_assessment: {
      is_fresher_eligible: isGraduate,
      confidence: isGraduate ? 0.92 : 0.4,
      reasons: isGraduate
        ? ['GS grade 1-7 or recent graduate hiring path designated by federal agency.']
        : ['Standard federal grade requiring demonstrated specialized experience.'],
      graduate_eligible: isGraduate,
    },
    country_code: 'US',
    country_name: 'United States',
    region_name: primaryLoc?.CountrySubDivisionCode,
    city: primaryLoc?.CityName || primaryLoc?.LocationName?.split(',')?.[0]?.trim(),
    latitude: primaryLoc?.Latitude,
    longitude: primaryLoc?.Longitude,
    workplace_type: workplaceType,
    remote_scope: remoteScope,
    salary,
    employment_type: desc.PositionOfferingType?.[0]?.Code === '15317' ? 'FULL_TIME' : 'FULL_TIME',
    application_method: 'OFFICIAL_GOVERNMENT',
    application_url: applyUrl,
    is_government: true,
    government_level: 'FEDERAL',
    advt_number: desc.PositionID,
    posted_at: desc.PublicationStartDate,
    valid_through: desc.ApplicationCloseDate,
    status: 'PUBLISHED',
    quality_score: 95,
    is_google_eligible: true,
    schema_validation_passed: true,
  };
}
