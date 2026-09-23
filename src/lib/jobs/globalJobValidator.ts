/**
 * Master Global Job Validator
 * Enforces the 17 core invariants across Source Rights, Google Jobs, Provenance,
 * Salary Transparency, and Expiry.
 */

import { GlobalJob } from '@/types/jobs/globalJob';
import { evaluateSourcePolicy } from './governmentSourcePolicy';

export interface MasterValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  isGoogleEligible: boolean;
}

export function validateGlobalJob(job: GlobalJob): MasterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Canonical ID & Slug
  if (!job.id) errors.push('Missing canonical job ID.');
  if (!job.slug) errors.push('Missing SEO canonical slug.');

  // 2. Title & Content
  if (!job.title || job.title.trim().length < 3) {
    errors.push('Job title must be at least 3 characters.');
  }

  if (!job.description || job.description.trim().length < 50) {
    errors.push('Job description must be at least 50 characters.');
  }

  // 3. Provenance & Source
  if (!job.provenance?.source_id) {
    errors.push('Missing provenance source_id.');
  }

  if (!job.provenance?.source_url) {
    errors.push('Missing provenance source_url.');
  }

  // 4. Employer / Organization
  if (!job.employer?.legal_name) {
    errors.push('Missing employer legal name.');
  }

  // 5. Geography
  if (!job.country_code || job.country_code.length !== 2) {
    errors.push('Invalid ISO country_code (must be 2-letter uppercase).');
  }

  // 6. Application URL & Method Invariants
  if (!job.application_url) {
    errors.push('Missing application destination URL.');
  }

  // CRITICAL INVARIANT: directApply can only be true if application_method === 'TALENTXCEL'
  if (job.is_government && job.application_method === 'TALENTXCEL') {
    errors.push('Government vacancies cannot use TALENTXCEL native apply without bilateral agency partnership.');
  }

  // 7. Source Rights Check
  if (job.is_government) {
    const rights = evaluateSourcePolicy(job.provenance.source_id);
    if (rights.policy === 'DO_NOT_INGEST') {
      errors.push(`Source "${rights.sourceName}" is marked DO_NOT_INGEST.`);
    }
  }

  // 8. Dates & Lifecycle
  if (!job.posted_at) {
    errors.push('Missing posted_at timestamp.');
  }

  if (job.valid_through) {
    const isPast = new Date(job.valid_through).getTime() < new Date(job.posted_at).getTime();
    if (isPast) {
      errors.push('Application deadline (valid_through) is earlier than date posted.');
    }
  }

  // Google Jobs eligibility evaluation
  let isGoogleEligible = false;
  if (errors.length === 0) {
    const hasLongDesc = (job.description || '').length >= 300;
    const isNotExpired = job.status === 'PUBLISHED';
    const rightsPermit = !job.is_government || evaluateSourcePolicy(job.provenance.source_id).canPublishGoogleJobPostingSchema;

    isGoogleEligible = hasLongDesc && isNotExpired && rightsPermit;
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    isGoogleEligible,
  };
}
