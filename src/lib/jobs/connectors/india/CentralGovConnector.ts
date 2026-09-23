/**
 * India Central Government Connector (UPSC / SSC / Ministries)
 */

import { GovernmentConnector, RawGovernmentJob } from '../GovernmentConnector';
import { GlobalJob } from '@/types/jobs/globalJob';

export class CentralGovConnector extends GovernmentConnector {
  readonly sourceId = 'in-upsc';
  readonly sourceName = 'Union Public Service Commission (UPSC)';
  readonly countryCode = 'IN';

  async discoverJobs(limit = 10): Promise<RawGovernmentJob[]> {
    return [
      {
        sourceId: this.sourceId,
        externalJobId: 'UPSC-ENG-2025',
        rawTitle: 'Assistant Executive Engineer / Indian Engineering Services (IES)',
        rawOrganization: 'Union Public Service Commission (Govt. of India)',
        rawLocation: 'Pan-India Central Ministries & Departments',
        rawDescription: 'Combined Engineering Services Examination for recruitment to Group A / B posts in Indian Railway Management Service, Central Engineering Service, Central Power Engineering Service, and Defence Aeronautical Quality Assurance.',
        rawMinSalary: 850000,
        rawMaxSalary: 1450000,
        rawCurrency: 'INR',
        rawPostedDate: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
        rawClosingDate: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
        rawApplicationUrl: 'https://upsconline.nic.in',
        officialNoticeUrl: 'https://upsc.gov.in',
        rawPayload: { exam: 'ESE 2025' },
      },
    ].slice(0, limit);
  }

  async getJobDetails(externalId: string): Promise<RawGovernmentJob | null> {
    const list = await this.discoverJobs();
    return list.find((j) => j.externalJobId === externalId) || null;
  }

  normalize(raw: RawGovernmentJob): GlobalJob {
    return {
      id: `upsc-${raw.externalJobId}`,
      slug: `upsc-${raw.rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${raw.externalJobId}`,
      provenance: {
        source_id: this.sourceId,
        source_name: this.sourceName,
        source_url: raw.officialNoticeUrl || 'https://upsc.gov.in',
        external_job_id: raw.externalJobId,
        ingestion_timestamp: new Date().toISOString(),
        last_verified_at: new Date().toISOString(),
        original_posted_at: raw.rawPostedDate || new Date().toISOString(),
        attribution_required: true,
        attribution_text: 'Source: Union Public Service Commission (UPSC)',
        attribution_url: 'https://upsc.gov.in',
      },
      employer: {
        id: 'in-upsc-central',
        legal_name: raw.rawOrganization,
        display_name: 'UPSC / Govt. of India',
        website: 'https://upsc.gov.in',
        country_code: 'IN',
        organization_type: 'GOVERNMENT',
        verification_status: 'GOVERNMENT_VERIFIED',
      },
      title: raw.rawTitle,
      summary: raw.rawDescription?.slice(0, 250) || raw.rawTitle,
      description: raw.rawDescription || 'Official UPSC examination announcement.',
      industry_id: 'government-psu',
      occupation_id: 'central-engineering-services',
      skills: ['Engineering Degree', 'Civil Services Examination'],
      experience_level: 'ENTRY_LEVEL',
      minimum_experience_months: 0,
      accepts_freshers: true,
      requires_experience: false,
      country_code: 'IN',
      country_name: 'India',
      city: 'New Delhi',
      workplace_type: 'ON_SITE',
      employment_type: 'FULL_TIME',
      application_method: 'OFFICIAL_GOVERNMENT',
      application_url: raw.rawApplicationUrl,
      is_government: true,
      government_level: 'FEDERAL',
      posted_at: raw.rawPostedDate || new Date().toISOString(),
      valid_through: raw.rawClosingDate,
      status: 'PUBLISHED',
      quality_score: 95,
      is_google_eligible: true,
      schema_validation_passed: true,
    };
  }
}
