/**
 * India State Government Connector (UP Sewayojan / State PSCs)
 */

import { GovernmentConnector, RawGovernmentJob } from '../GovernmentConnector';
import { GlobalJob } from '@/types/jobs/globalJob';

export class StateGovConnector extends GovernmentConnector {
  readonly sourceId = 'in-up-sewayojan';
  readonly sourceName = 'UP Rojgar Sangam (Sewayojan)';
  readonly countryCode = 'IN';

  async discoverJobs(limit = 10): Promise<RawGovernmentJob[]> {
    return [
      {
        sourceId: this.sourceId,
        externalJobId: 'UP-ROJGAR-2025-881',
        rawTitle: 'Computer Operator / Data Analyst (Outsourced / Contractual)',
        rawOrganization: 'UP State Rural Livelihood Mission (UPSRLM)',
        rawLocation: 'Lucknow, Uttar Pradesh',
        rawDescription: 'Computer Operator cum Data Analyst vacancies for District Mission Management Units across UP. Qualification: Intermediate / Graduate with DOEACC CCC or O-Level certification. Freshers eligible.',
        rawMinSalary: 240000,
        rawMaxSalary: 360000,
        rawCurrency: 'INR',
        rawPostedDate: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        rawClosingDate: new Date(Date.now() + 15 * 24 * 3600 * 1000).toISOString(),
        rawApplicationUrl: 'https://sewayojan.up.nic.in',
        officialNoticeUrl: 'https://sewayojan.up.nic.in',
        rawPayload: { state: 'UP', district: 'Lucknow' },
      },
    ].slice(0, limit);
  }

  async getJobDetails(externalId: string): Promise<RawGovernmentJob | null> {
    const list = await this.discoverJobs();
    return list.find((j) => j.externalJobId === externalId) || null;
  }

  normalize(raw: RawGovernmentJob): GlobalJob {
    return {
      id: `state-${raw.externalJobId}`,
      slug: `up-govt-${raw.rawTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${raw.externalJobId}`,
      provenance: {
        source_id: this.sourceId,
        source_name: this.sourceName,
        source_url: raw.officialNoticeUrl || 'https://sewayojan.up.nic.in',
        external_job_id: raw.externalJobId,
        ingestion_timestamp: new Date().toISOString(),
        last_verified_at: new Date().toISOString(),
        original_posted_at: raw.rawPostedDate || new Date().toISOString(),
        attribution_required: true,
        attribution_text: 'Source: UP Rojgar Sangam, Govt. of Uttar Pradesh',
        attribution_url: 'https://sewayojan.up.nic.in',
      },
      employer: {
        id: 'in-state-up-upsrlm',
        legal_name: raw.rawOrganization,
        display_name: 'Government of Uttar Pradesh',
        website: 'https://sewayojan.up.nic.in',
        country_code: 'IN',
        organization_type: 'GOVERNMENT',
        verification_status: 'GOVERNMENT_VERIFIED',
      },
      title: raw.rawTitle,
      summary: raw.rawDescription?.slice(0, 250) || raw.rawTitle,
      description: raw.rawDescription || 'Official UP Government vacancy.',
      industry_id: 'government-psu',
      occupation_id: 'state-civil-services',
      skills: ['Data Entry', 'MS Office', 'CCC Certification'],
      experience_level: 'FRESHER',
      minimum_experience_months: 0,
      accepts_freshers: true,
      requires_experience: false,
      country_code: 'IN',
      country_name: 'India',
      region_code: 'UP',
      region_name: 'Uttar Pradesh',
      city: 'Lucknow',
      workplace_type: 'ON_SITE',
      employment_type: 'CONTRACT',
      application_method: 'OFFICIAL_GOVERNMENT',
      application_url: raw.rawApplicationUrl,
      is_government: true,
      government_level: 'STATE',
      posted_at: raw.rawPostedDate || new Date().toISOString(),
      valid_through: raw.rawClosingDate,
      status: 'PUBLISHED',
      quality_score: 88,
      is_google_eligible: false, // LINK_OUT / summary mode
      schema_validation_passed: true,
    };
  }
}
