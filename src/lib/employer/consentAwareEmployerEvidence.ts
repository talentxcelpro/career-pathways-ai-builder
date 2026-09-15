/**
 * TALENTXCEL — PHASE 4 GATE 4B
 * Consent-Aware Employer Evidence Signal Engine
 * src/lib/employer/consentAwareEmployerEvidence.ts
 *
 * PURPOSE:
 *   Calculates read-only, non-persistent employer-safe candidate evidence signals
 *   when candidate consent is explicitly AUTHORIZED.
 *
 * ABSOLUTE PRIVACY GUARANTEES:
 *   1. Candidate consent is MANDATORY (Default: NOT_AUTHORIZED). If consent is missing/revoked,
 *      0 evidence signals are exposed to employers.
 *   2. EXPOSES ONLY high-level verified badges (e.g., "Verified React Professional").
 *   3. NEVER exposes raw assessment scores (94%), test attempt counts, proctoring metrics,
 *      decay timers, or private explanations.
 *   4. Zero changes to Phase 1 ATS score (0.0% score inflation).
 *   5. Zero changes to recruiter ranking / sorting (0 ranking changes).
 *   6. Zero database mutations or table schema changes (100% Runtime-Only).
 *   7. Fairness / Anti-bias: Evaluates ONLY job-relevant professional evidence (0 usage of protected attributes).
 */

export type CandidateConsentState = 'AUTHORIZED' | 'NOT_AUTHORIZED' | 'UNKNOWN';

export interface EmployerEvidenceConsentContext {
  userId: string;
  consentState?: CandidateConsentState; // Default: 'NOT_AUTHORIZED'
  assessmentAttempts?: Array<{
    id?: string;
    user_id?: string;
    assessment_id?: string;
    skill_name?: string;
    score?: number;
    passed?: boolean;
    attempt_number?: number;
    time_taken_minutes?: number;
    completed_at?: string;
  }>;
  skillCertifications?: Array<{
    id?: string;
    user_id?: string;
    skill_name?: string;
    certification_level?: string;
    score?: number;
    is_verified?: boolean;
    expires_at?: string | null;
    issued_at?: string;
  }>;
}

export interface EmployerSafeSignal {
  signal: string;
  source: string;
  authorizationStatus: CandidateConsentState;
  verificationStatus: 'VERIFIED' | 'UNVERIFIED' | 'EXPIRED';
  explanation: string;
  category: 'CERTIFICATION' | 'ASSESSMENT' | 'ATS_SCORE';
}

export interface EmployerCandidateEvidenceSummary {
  candidateId: string;
  atsScore: number;
  authorizationStatus: CandidateConsentState;
  evidenceAvailability: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  authorizedSignals: EmployerSafeSignal[];
  rejectedPrivateTelemetryCount: number;
}

/**
 * calculateEmployerSafeEvidence
 *
 * Calculates candidate evidence signals for employer review.
 * Enforces consent gates, verification checks, and privacy redaction.
 */
export function calculateEmployerSafeEvidence(
  candidateId: string,
  baseATSScore: number,
  context: EmployerEvidenceConsentContext
): EmployerCandidateEvidenceSummary {
  const consent = context.consentState || 'NOT_AUTHORIZED';

  // DEFAULT CONSENT GATE: If NOT_AUTHORIZED or UNKNOWN, return ZERO evidence signals
  if (consent !== 'AUTHORIZED') {
    return {
      candidateId,
      atsScore: baseATSScore, // Preserved Phase 1 score
      authorizationStatus: consent,
      evidenceAvailability: 'NONE',
      authorizedSignals: [],
      rejectedPrivateTelemetryCount: (context.assessmentAttempts?.length || 0) + (context.skillCertifications?.length || 0),
    };
  }

  const authorizedSignals: EmployerSafeSignal[] = [];
  let rejectedTelemetryCount = 0;
  const now = new Date();

  // 1. Process Platform Certifications (High Trust)
  if (context.skillCertifications) {
    for (const cert of context.skillCertifications) {
      const skillName = cert.skill_name || 'Skill';
      const level = cert.certification_level || 'Professional';

      // Verify certificate status & expiration
      const isExpired = cert.expires_at ? new Date(cert.expires_at) <= now : false;
      const isVerified = Boolean(cert.is_verified);

      if (isVerified && !isExpired) {
        authorizedSignals.push({
          signal: `Verified ${skillName} ${level}`,
          source: 'TalentXcel Platform Certification',
          authorizationStatus: 'AUTHORIZED',
          verificationStatus: 'VERIFIED',
          explanation: `Candidate has authorized sharing a verified ${level}-level platform certification in ${skillName}.`,
          category: 'CERTIFICATION',
        });
      } else {
        // Unverified or expired certs are rejected
        rejectedTelemetryCount++;
      }
    }
  }

  // 2. Process Passed Assessment Attempts (High Trust Badge, Redacted Telemetry)
  if (context.assessmentAttempts) {
    for (const att of context.assessmentAttempts) {
      const skillName = att.skill_name || 'Skill';

      if (att.passed) {
        // Emits HIGH-LEVEL BADGE ONLY. Raw score, attempt count, duration are STRICTLY REDACTED!
        authorizedSignals.push({
          signal: `${skillName} Assessment — Verified`,
          source: 'TalentXcel Skill Assessment',
          authorizationStatus: 'AUTHORIZED',
          verificationStatus: 'VERIFIED',
          explanation: `Candidate has authorized sharing verified completion of the ${skillName} assessment.`,
          category: 'ASSESSMENT',
        });
      }

      // Raw score, attempt count, time taken are always counted as redacted telemetry
      rejectedTelemetryCount += 3; // (score, attempt_number, time_taken)
    }
  }

  // Determine high-level availability category based on valid authorized signals
  let availability: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';
  if (authorizedSignals.length >= 2) {
    availability = 'HIGH';
  } else if (authorizedSignals.length === 1) {
    availability = 'MEDIUM';
  } else {
    availability = 'NONE';
  }

  return {
    candidateId,
    atsScore: baseATSScore, // 0.0% ATS score manipulation
    authorizationStatus: 'AUTHORIZED',
    evidenceAvailability: availability,
    authorizedSignals,
    rejectedPrivateTelemetryCount: rejectedTelemetryCount,
  };
}
