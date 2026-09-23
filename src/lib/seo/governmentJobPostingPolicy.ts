/**
 * Government JobPosting SEO Policy Gatekeeper
 * Strictly controls Schema.org JobPosting injection for government and public sector vacancies.
 *
 * Invariants Enforced:
 * 1. Schema.org JobPosting is injected ONLY on single-job pages, NEVER on discovery/list pages.
 * 2. Only vacancies with FULL_REPUBLISH or ATTRIBUTED_REPUBLISH may emit Schema markup.
 * 3. directApply is ALWAYS omitted/false because candidates must apply on the official government portal.
 * 4. Job must have complete description, valid datePosted, and not be expired.
 */

import { evaluateSourcePolicy, SourceRightsDecision } from '@/lib/jobs/governmentSourcePolicy';
import { GlobalJob } from '@/types/jobs/globalJob';

export interface GovernmentSchemaEligibilityResult {
  isEligible: boolean;
  reasons: string[];
  rightsDecision: SourceRightsDecision;
  schemaDirectApply: false; // Invariant: government jobs never claim directApply: true
}

export function evaluateGovernmentJobPostingEligibility(
  job: GlobalJob,
  isSingleJobPage = true
): GovernmentSchemaEligibilityResult {
  const reasons: string[] = [];
  const rights = evaluateSourcePolicy(job.provenance.source_id);

  // 1. Single Job Page Invariant
  if (!isSingleJobPage) {
    return {
      isEligible: false,
      reasons: ['JobPosting structured data is strictly prohibited on listing or search pages.'],
      rightsDecision: rights,
      schemaDirectApply: false,
    };
  }

  // 2. Legal / Contractual Redistribution Rights Gate
  if (!rights.canPublishGoogleJobPostingSchema) {
    reasons.push(
      `Source policy for "${rights.sourceName}" (${rights.policy}) does not authorize Google Schema.org syndication.`
    );
  }

  // 3. Status and Lifecycle Check
  if (job.status === 'EXPIRED' || job.status === 'DEADLINE_PASSED' || job.status === 'REMOVED') {
    reasons.push(`Job status is ${job.status}; expired government vacancies must not be indexed.`);
  }

  // 4. Data Completeness Check (Google Search Console Requirements)
  if (!job.title || job.title.trim().length < 5) {
    reasons.push('Missing or invalid job title.');
  }

  if (!job.description || job.description.trim().length < 150) {
    reasons.push('Job description is too brief (< 150 characters) for Schema.org eligibility.');
  }

  if (!job.employer?.legal_name && !job.employer?.display_name) {
    reasons.push('Missing hiring government organization or ministry name.');
  }

  if (!job.country_code) {
    reasons.push('Missing country code.');
  }

  if (!job.posted_at) {
    reasons.push('Missing valid posted_at date.');
  }

  if (!job.application_url) {
    reasons.push('Missing official application or vacancy notification URL.');
  }

  const isEligible = reasons.length === 0;

  return {
    isEligible,
    reasons,
    rightsDecision: rights,
    schemaDirectApply: false,
  };
}
