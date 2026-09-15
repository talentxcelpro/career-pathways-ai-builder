// src/services/jobs/atsFeedIngestionService.ts
// ATS & External XML/JSON Feed Ingestion Contract for TalentXcel Global 100K Job Network
// Ingests feeds from Greenhouse, Workday, Lever, and custom employer feeds
// Normalizes locations, checks Google eligibility, and dispatches to indexing queues

import { validateJobPosting, type RawJobData } from '@/lib/seo/jobPostingValidator';
import { resolveGlobalLocation } from '@/config/jobs/locationResolver';
import { enqueueJobForIndexing } from '@/services/seo/googleIndexingApi';
import { getPublicJobUrl } from '@/lib/seo/canonicalUrls';

export interface AtsRawJobItem {
  externalId: string;
  title: string;
  company: string;
  locationRaw: string;
  description: string;
  applicationUrl?: string;
  applicationEmail?: string;
  postedAt?: string;
  employmentType?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
}

export interface AtsIngestionBatchResult {
  totalIngested: number;
  validEligibleCount: number;
  blockedCount: number;
  queuedForIndexingCount: number;
  errors: Array<{ externalId: string; reason: string }>;
}

/**
 * Normalizes raw ATS location string into canonical global location attributes
 */
export function normalizeAtsLocation(locationRaw: string) {
  if (!locationRaw) {
    return { countryCode: 'in', countryName: 'India', cityName: 'Remote', state: '' };
  }

  const parts = locationRaw.split(',').map((p) => p.trim());
  const primaryCity = parts[0] || 'Remote';
  const regionOrCountry = parts[1] || 'India';

  const resolved = resolveGlobalLocation(undefined, primaryCity.toLowerCase().replace(/\s+/g, '-'));

  return {
    countryCode: resolved?.countryCode || 'in',
    countryName: resolved?.countryName || 'India',
    cityName: resolved?.cityName || primaryCity,
    state: resolved?.stateOrRegion || regionOrCountry,
  };
}

/**
 * Validates and transforms a batch of raw ATS jobs into Google-compliant TalentXcel postings
 */
export async function ingestAtsFeedBatch(
  items: AtsRawJobItem[],
  employerId: string = 'feed-ingestion'
): Promise<AtsIngestionBatchResult> {
  const result: AtsIngestionBatchResult = {
    totalIngested: items.length,
    validEligibleCount: 0,
    blockedCount: 0,
    queuedForIndexingCount: 0,
    errors: [],
  };

  for (const raw of items) {
    const loc = normalizeAtsLocation(raw.locationRaw);
    const candidateJob: RawJobData = {
      id: raw.externalId,
      title: raw.title,
      description: raw.description,
      company_name: raw.company,
      location: `${loc.cityName}, ${loc.state || loc.countryName}`,
      location_city: loc.cityName,
      location_state: loc.state,
      employment_type: raw.employmentType || 'Full-time',
      posted_at: raw.postedAt,
      external_url: raw.applicationUrl,
      application_email: raw.applicationEmail,
      is_active: true,
      status: 'active',
    };

    // 1. Google Eligibility Gate
    const validation = validateJobPosting(candidateJob);
    if (!validation.isGoogleEligible) {
      result.blockedCount++;
      result.errors.push({
        externalId: raw.externalId,
        reason: validation.rejectionReasons.join('; '),
      });
      continue;
    }

    result.validEligibleCount++;

    // 2. Queue for Google Indexing API
    const canonicalUrl = getPublicJobUrl(raw.externalId);
    await enqueueJobForIndexing(canonicalUrl, raw.externalId, 'URL_UPDATED', 'NORMAL');
    result.queuedForIndexingCount++;
  }

  return result;
}
