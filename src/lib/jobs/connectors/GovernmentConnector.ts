/**
 * TalentXcel Government Connector Base Architecture
 * Common contract for all government and public sector vacancy connectors.
 */

import { GlobalJob } from '@/types/jobs/globalJob';
import { evaluateSourcePolicy, SourceRightsDecision } from '@/lib/jobs/governmentSourcePolicy';

export interface RawGovernmentJob {
  sourceId: string;
  externalJobId: string;
  rawTitle: string;
  rawOrganization: string;
  rawLocation?: string;
  rawDescription?: string;
  rawSalary?: string;
  rawMinSalary?: number;
  rawMaxSalary?: number;
  rawCurrency?: string;
  rawPostedDate?: string;
  rawClosingDate?: string;
  rawApplicationUrl: string;
  rawPayload: Record<string, any>;
  officialNoticeUrl?: string;
}

export interface ConnectorVerificationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  qualityScore: number;
}

export abstract class GovernmentConnector {
  abstract readonly sourceId: string;
  abstract readonly sourceName: string;
  abstract readonly countryCode: string;

  /**
   * Fetches latest vacancy notices from the source portal or API
   */
  abstract discoverJobs(limit?: number): Promise<RawGovernmentJob[]>;

  /**
   * Fetches full announcement text and eligibility rules for a specific external ID
   */
  abstract getJobDetails(externalId: string): Promise<RawGovernmentJob | null>;

  /**
   * Normalizes raw external job into the canonical GlobalJob schema
   */
  abstract normalize(raw: RawGovernmentJob): GlobalJob;

  /**
   * Resolves the rights and redistribution rules for this connector
   */
  getSourcePolicy(): SourceRightsDecision {
    return evaluateSourcePolicy(this.sourceId);
  }

  /**
   * Verifies that the normalized job satisfies all invariants
   */
  verifyJob(job: GlobalJob): ConnectorVerificationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 100;

    if (!job.title || job.title.trim().length < 3) {
      errors.push('Job title is required and must be at least 3 characters.');
      score -= 30;
    }

    if (!job.employer?.legal_name) {
      errors.push('Employer or Government Ministry name is missing.');
      score -= 25;
    }

    if (!job.provenance.source_url) {
      errors.push('Official notice URL is required.');
      score -= 20;
    }

    if (!job.application_url) {
      errors.push('Application URL is required.');
      score -= 20;
    }

    if (!job.posted_at) {
      errors.push('Date posted is required.');
      score -= 15;
    }

    if (!job.description || job.description.length < 100) {
      warnings.push('Job description is sparse (< 100 chars).');
      score -= 15;
    }

    if (!job.salary) {
      warnings.push('No salary disclosed by agency.');
      score -= 5;
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings,
      qualityScore: Math.max(0, score),
    };
  }
}
