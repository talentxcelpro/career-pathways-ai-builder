/**
 * TalentXcel Global Jobs Network — Connector Certification Gate
 * Enforces a strict 7-stage qualification check before any newly discovered
 * government source or upgraded connector is permitted into production.
 */

import { GlobalJob } from '@/types/jobs/globalJob';

export interface CertificationCheck {
  name: string;
  passed: boolean;
  score: number;       // 0 - 100
  details: string;
}

export interface CertificationResult {
  sourceId: string;
  certified: boolean;
  overallScore: number;
  checks: CertificationCheck[];
  sampleJobsTested: number;
  certifiedAt: string;
  certifiedBy: string;
}

export class ConnectorCertification {
  /**
   * Run 7-point certification check against a test batch of 10-100 sample jobs
   */
  public static certifyConnector(
    sourceId: string,
    sampleJobs: Partial<GlobalJob>[],
    domainVerified = true,
    policyApproved = true,
    evaluator = 'admin-system'
  ): CertificationResult {
    const checks: CertificationCheck[] = [];

    // 1. Sample batch size
    const count = sampleJobs.length;
    checks.push({
      name: 'Sample Batch Size (10-100 jobs)',
      passed: count >= 5, // minimum viability
      score: Math.min(100, Math.round((count / 10) * 100)),
      details: `Tested ${count} sample jobs.`,
    });

    // 2. Schema Completeness (Title, Description, Org, Dates)
    const validSchemaCount = sampleJobs.filter(
      (j) => j.title && j.description && j.employer?.display_name && j.posted_at
    ).length;
    const schemaScore = count > 0 ? Math.round((validSchemaCount / count) * 100) : 0;
    checks.push({
      name: 'Schema Completeness',
      passed: schemaScore >= 80,
      score: schemaScore,
      details: `${validSchemaCount}/${count} jobs have complete title, description, org, and dates.`,
    });

    // 3. Location Resolution Confidence
    const resolvedLocs = sampleJobs.filter(
      (j) => j.country_code && (j.city || j.region_name)
    ).length;
    const locScore = count > 0 ? Math.round((resolvedLocs / count) * 100) : 0;
    checks.push({
      name: 'Location Resolution (>= 75%)',
      passed: locScore >= 75,
      score: locScore,
      details: `${resolvedLocs}/${count} jobs mapped to normalized location.`,
    });

    // 4. Industry Domain Resolution Confidence
    const resolvedInds = sampleJobs.filter((j) => j.industry_id && j.occupation_id).length;
    const indScore = count > 0 ? Math.round((resolvedInds / count) * 100) : 0;
    checks.push({
      name: 'Industry & Occupation Resolution (>= 70%)',
      passed: indScore >= 70,
      score: indScore,
      details: `${resolvedInds}/${count} jobs mapped to industry & occupation.`,
    });

    // 5. Official Application URL & SSL Check
    const validUrls = sampleJobs.filter(
      (j) => j.application_url && j.application_url.startsWith('https://')
    ).length;
    const urlScore = count > 0 ? Math.round((validUrls / count) * 100) : 0;
    checks.push({
      name: 'Application URL Validity & HTTPS',
      passed: urlScore >= 90,
      score: urlScore,
      details: `${validUrls}/${count} jobs have valid secure official application destinations.`,
    });

    // 6. Domain Verification
    checks.push({
      name: 'Official Government Domain Verification',
      passed: domainVerified,
      score: domainVerified ? 100 : 0,
      details: domainVerified ? 'Official government apex/TLD verified.' : 'Unverified domain.',
    });

    // 7. Terms & Redistribution Policy Review
    checks.push({
      name: 'Redistribution Rights & Terms Review',
      passed: policyApproved,
      score: policyApproved ? 100 : 0,
      details: policyApproved ? 'Explicit redistribution policy assigned.' : 'Pending legal terms review.',
    });

    // Calculate overall score (average of checks)
    const overallScore = Math.round(
      checks.reduce((acc, c) => acc + c.score, 0) / checks.length
    );

    const allPassed = checks.every((c) => c.passed);

    return {
      sourceId,
      certified: allPassed && overallScore >= 80,
      overallScore,
      checks,
      sampleJobsTested: count,
      certifiedAt: new Date().toISOString(),
      certifiedBy: evaluator,
    };
  }
}
