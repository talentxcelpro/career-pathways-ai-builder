/**
 * TalentXcel Global Jobs Network — Job Publication Governor
 * Single canonical decision gate before any government vacancy enters the Global Job Graph.
 *
 * Decision Chain:
 *   SOURCE VERIFIED
 *         ↓
 *   RIGHTS ALLOW
 *         ↓
 *   JOB VALID
 *         ↓
 *   NOT DUPLICATE
 *         ↓
 *   QUALITY THRESHOLD
 *         ↓
 *   APPLICATION VALID
 *         ↓
 *   NOT EXPIRED
 *         ↓
 *   PUBLICATION GOVERNOR
 *         ↓
 *   PUBLISH / REVIEW / LINK-OUT / REJECT
 */

import { GlobalJob } from '@/types/jobs/globalJob';
import { validateGlobalJob } from './globalJobValidator';
import { resolveSourcePolicy } from './governmentSourcePolicy';
import { computeJobQualityScore } from './qualityEngine';
import { evaluateJobExpiry } from './governmentJobExpiry';
import { CircuitBreaker } from '../automation/CircuitBreaker';
import { AutomationKillSwitch } from '../automation/AutomationKillSwitch';
import { evaluateGovernmentJobPostingEligibility } from '../seo/governmentJobPostingPolicy';

export type GovernorAction = 'PUBLISH' | 'REVIEW' | 'LINK_OUT' | 'REJECT';
export type ReviewPriority = 'P0' | 'P1' | 'P2' | 'P3' | 'P4';

export interface GovernorEvaluation {
  jobId: string;
  action: GovernorAction;
  isGoogleEligible: boolean;
  canDirectApply: boolean;
  qualityScore: number;
  sourceConfidenceScore: number;
  reasons: string[];
  reviewPriority?: ReviewPriority;
  decidedAt: string;
}

export class JobPublicationGovernor {
  /**
   * Evaluate a vacancy through the full publication governor decision chain
   */
  public static evaluate(job: GlobalJob): GovernorEvaluation {
    const reasons: string[] = [];
    const sourceId = job.provenance?.source_id || 'unknown';

    // 1. Operational Kill Switch & Circuit Breaker Check
    if (!AutomationKillSwitch.isPublishingAllowed(sourceId)) {
      return {
        jobId: job.id,
        action: 'REVIEW',
        isGoogleEligible: false,
        canDirectApply: false,
        qualityScore: job.quality_score || 0,
        sourceConfidenceScore: 0,
        reasons: ['Publishing currently paused by administrative kill switch.'],
        reviewPriority: 'P1',
        decidedAt: new Date().toISOString(),
      };
    }

    if (CircuitBreaker.isSourceTripped(sourceId)) {
      return {
        jobId: job.id,
        action: 'REVIEW',
        isGoogleEligible: false,
        canDirectApply: false,
        qualityScore: job.quality_score || 0,
        sourceConfidenceScore: 0,
        reasons: [`Source ${sourceId} tripped by safety circuit breaker. Ingestion and publishing halted.`],
        reviewPriority: 'P1',
        decidedAt: new Date().toISOString(),
      };
    }

    // 2. Source Rights & Redistribution Policy
    const policy = resolveSourcePolicy(sourceId);
    if (policy.policy === 'DO_NOT_INGEST') {
      return {
        jobId: job.id,
        action: 'REJECT',
        isGoogleEligible: false,
        canDirectApply: false,
        qualityScore: 0,
        sourceConfidenceScore: 0,
        reasons: ['Source redistribution policy explicitly prohibits ingestion or reproduction.'],
        reviewPriority: 'P0',
        decidedAt: new Date().toISOString(),
      };
    }

    if (policy.policy === 'LINK_OUT') {
      return {
        jobId: job.id,
        action: 'LINK_OUT',
        isGoogleEligible: false, // Per Google Jobs guidelines, link-out title-only pages do NOT receive JobPosting schema
        canDirectApply: false,
        qualityScore: 60,
        sourceConfidenceScore: 80,
        reasons: ['Source policy mandates Mode C LINK_OUT only. Display headline and redirect to official portal.'],
        decidedAt: new Date().toISOString(),
      };
    }

    // 3. Schema & Invariant Validation (17-point check)
    const validation = validateGlobalJob(job);
    if (!validation.isValid) {
      return {
        jobId: job.id,
        action: 'REVIEW',
        isGoogleEligible: false,
        canDirectApply: false,
        qualityScore: job.quality_score || 0,
        sourceConfidenceScore: 50,
        reasons: [`Validation errors: ${validation.errors.join('; ')}`],
        reviewPriority: 'P4',
        decidedAt: new Date().toISOString(),
      };
    }

    // 4. Expiry & Deadline Check
    const expiry = evaluateJobExpiry(job);
    if (expiry.isExpired) {
      return {
        jobId: job.id,
        action: 'REJECT',
        isGoogleEligible: false,
        canDirectApply: false,
        qualityScore: 0,
        sourceConfidenceScore: 50,
        reasons: [`Vacancy is expired: ${expiry.reason}`],
        decidedAt: new Date().toISOString(),
      };
    }

    // 5. Application Destination URL Validity
    if (!job.application_url || !job.application_url.startsWith('https://')) {
      return {
        jobId: job.id,
        action: 'REVIEW',
        isGoogleEligible: false,
        canDirectApply: false,
        qualityScore: job.quality_score || 0,
        sourceConfidenceScore: 40,
        reasons: ['Missing or insecure official application URL.'],
        reviewPriority: 'P3',
        decidedAt: new Date().toISOString(),
      };
    }

    // 6. Quality Score & Official Source Confidence Audit
    const qualityAudit = computeJobQualityScore(job);
    if (qualityAudit.decision === 'REJECT') {
      return {
        jobId: job.id,
        action: 'REJECT',
        isGoogleEligible: false,
        canDirectApply: false,
        qualityScore: qualityAudit.totalScore,
        sourceConfidenceScore: qualityAudit.sourceConfidenceScore,
        reasons: [`Quality score (${qualityAudit.totalScore}) or source confidence (${qualityAudit.sourceConfidenceScore}) below minimum viable threshold.`],
        reviewPriority: 'P4',
        decidedAt: new Date().toISOString(),
      };
    }

    if (qualityAudit.decision === 'REVIEW') {
      return {
        jobId: job.id,
        action: 'REVIEW',
        isGoogleEligible: false,
        canDirectApply: false,
        qualityScore: qualityAudit.totalScore,
        sourceConfidenceScore: qualityAudit.sourceConfidenceScore,
        reasons: [`Quality score (${qualityAudit.totalScore}) is in review zone [50 - ${qualityAudit.sourceThreshold - 1}].`],
        reviewPriority: 'P3',
        decidedAt: new Date().toISOString(),
      };
    }

    // 7. Google Jobs Eligibility & directApply Check
    const schemaEligible = evaluateGovernmentJobPostingEligibility(job, true);
    // Hard invariant: directApply is true ONLY for native TalentXcel application flow
    const canDirectApply = job.application_method === 'TALENTXCEL';

    reasons.push('Passed all publication governor criteria: verified source, compliant rights, valid schema, active deadline, and high quality score.');

    return {
      jobId: job.id,
      action: 'PUBLISH',
      isGoogleEligible: schemaEligible.isEligible,
      canDirectApply,
      qualityScore: qualityAudit.totalScore,
      sourceConfidenceScore: qualityAudit.sourceConfidenceScore,
      reasons,
      decidedAt: new Date().toISOString(),
    };
  }
}
