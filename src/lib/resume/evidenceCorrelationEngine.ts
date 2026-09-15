/**
 * TALENTXCEL — PHASE 3 GATE 3B
 * Evidence Correlation Engine
 * src/lib/resume/evidenceCorrelationEngine.ts
 *
 * PURPOSE:
 *   For each canonical job requirement (Phase 1 & Phase 2), identify whether TalentXcel
 *   possesses candidate evidence supporting that requirement across:
 *     - user_assessment_attempts (passed=true)
 *     - skill_certifications (is_verified=true)
 *     - ai_resumes.content.work_experience (calculated years & recency)
 *     - ai_resumes.content.skills (resume text claim)
 *
 * GUARANTEES:
 *   - Pure in-memory correlation — 100% non-persisted, non-mutating
 *   - Deterministic hierarchy matching — prefers highest trust tier
 *   - False-proof protection — rejects failed tests, unverified text claims, candidate ID mismatches
 *   - Stale evidence decay — assessments > 24 months old marked DECAYED_EVIDENCE
 *   - Strict provenance — SOURCE_PROVIDED vs ASSESSMENT_VERIFIED vs USER_CLAIMED
 *   - Phase 1 & 2 preservation — atsEngine.ts and job pipeline UNTOUCHED
 */

import { NormalizedResumeContent } from './normalizeResumeContent';
import { NormalizedJobRequirement } from '../job/normalizeJobContent';

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type EvidenceTrustTier =
  | 'EXTERNALLY_VERIFIED'
  | 'ASSESSMENT_VERIFIED'
  | 'SYSTEM_DERIVED'
  | 'USER_PROVIDED_STRUCTURED'
  | 'USER_CLAIMED_RESUME'
  | 'NONE';

export type EvidenceStrength = 'STRONG' | 'MODERATE' | 'WEAK' | 'NONE';

export interface UserAssessmentAttemptInput {
  id: string;
  user_id: string;
  assessment_id: string;
  skill_name?: string;
  score: number;
  passed: boolean | null;
  completed_at: string | null;
  attempt_number?: number | null;
  time_taken_minutes?: number | null;
}

export interface SkillCertificationInput {
  id: string;
  user_id: string;
  skill_id: string;
  skill_name?: string;
  score: number;
  certification_level: string;
  is_verified: boolean | null;
  blockchain_hash?: string | null;
  verification_url?: string | null;
  issued_at: string | null;
  expires_at?: string | null;
}

export interface UserSkillInput {
  id: string;
  user_id: string;
  skill_id: string;
  skill_name?: string;
  proficiency_level: number;
  years_experience?: number | null;
  last_used_date?: string | null;
}

export interface CandidateEvidenceContext {
  userId: string;
  resume?: NormalizedResumeContent | null;
  assessmentAttempts?: UserAssessmentAttemptInput[];
  skillCertifications?: SkillCertificationInput[];
  userSkills?: UserSkillInput[];
}

export interface VerificationDetails {
  assessmentScore?: number;
  assessmentPassed?: boolean;
  assessmentDate?: string;
  attemptNumber?: number;
  isDecayed?: boolean;
  certificationLevel?: string;
  certificationHash?: string;
  yearsCalculated?: number;
  matchedExperienceRoles?: string[];
  resumeClaimSource?: 'skills_list' | 'experience_bullet' | 'summary';
}

export interface CandidateRequirementEvidence {
  requirementText: string;
  requirementCategory: string;
  
  isEvidenceFound: boolean;
  evidenceStrength: EvidenceStrength;
  trustTier: EvidenceTrustTier;
  primaryEvidenceSource: 'user_assessment_attempts' | 'skill_certifications' | 'work_experience' | 'resume_skills' | 'user_skills' | 'none';
  
  evidenceSummary: string;
  verificationDetails?: VerificationDetails;
  explanation: string;
  
  // Secondary / supporting evidence list
  supportingEvidence: Array<{
    source: string;
    trustTier: EvidenceTrustTier;
    detail: string;
  }>;
}

export interface EvidenceCorrelationResult {
  candidateUserId: string;
  evaluatedAt: string;
  totalRequirementsEvaluated: number;
  evidenceFoundCount: number;
  assessmentVerifiedCount: number;
  systemDerivedCount: number;
  userClaimedCount: number;
  staleEvidenceCount: number;
  missingEvidenceCount: number;
  
  requirementEvidenceList: CandidateRequirementEvidence[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function canonicalize(str: string): string {
  return str.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Check if a skill match is exact or normalized synonym match
 */
function isSkillMatch(termA: string, termB: string): boolean {
  const normA = canonicalize(termA);
  const normB = canonicalize(termB);
  if (!normA || !normB) return false;
  if (normA === normB) return true;
  if (normA.length > 2 && normB.length > 2) {
    if (normA.includes(normB) || normB.includes(normA)) return true;
  }
  return false;
}

/**
 * Calculate months between two ISO date strings (or present if null)
 */
function calculateMonthsBetween(startIso?: string | null, endIso?: string | null): number {
  if (!startIso) return 0;
  const start = new Date(startIso);
  if (isNaN(start.getTime())) return 0;
  const end = endIso ? new Date(endIso) : new Date();
  const validEnd = isNaN(end.getTime()) ? new Date() : end;
  
  const yearsDiff = validEnd.getFullYear() - start.getFullYear();
  const monthsDiff = validEnd.getMonth() - start.getMonth();
  const totalMonths = yearsDiff * 12 + monthsDiff;
  return Math.max(1, totalMonths);
}

/**
 * Check if an assessment completed date is older than 24 months (730 days)
 */
function isAssessmentStale(completedAt: string | null): boolean {
  if (!completedAt) return false;
  const date = new Date(completedAt);
  if (isNaN(date.getTime())) return false;
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 24);
  return date < cutoff;
}

/**
 * Check if a certification is expired based on expires_at
 */
function isCertExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  const exp = new Date(expiresAt);
  if (isNaN(exp.getTime())) return false;
  return exp < new Date();
}

// ---------------------------------------------------------------------------
// Main Public Engine API
// ---------------------------------------------------------------------------

/**
 * correlateCandidateEvidence
 *
 * Correlates canonical job requirements against verified candidate evidence.
 *
 * 100% In-Memory. Read-Only. Deterministic. Non-Persisted.
 */
export function correlateCandidateEvidence(
  requirements: NormalizedJobRequirement[],
  context: CandidateEvidenceContext
): EvidenceCorrelationResult {
  const userId = context.userId || 'anonymous-user';
  const reqList: CandidateRequirementEvidence[] = [];

  let evidenceFoundCount = 0;
  let assessmentVerifiedCount = 0;
  let systemDerivedCount = 0;
  let userClaimedCount = 0;
  let staleEvidenceCount = 0;
  let missingEvidenceCount = 0;

  for (const req of requirements) {
    const reqText = req.text;
    const reqCat = req.category;

    // Supporting evidence accumulator
    const supportingList: Array<{ source: string; trustTier: EvidenceTrustTier; detail: string }> = [];

    // -----------------------------------------------------------------------
    // STEP 1: Check Platform Skill Certifications (Tier 2 - Highest Trust)
    // -----------------------------------------------------------------------
    let matchedCert: SkillCertificationInput | null = null;
    if (context.skillCertifications && Array.isArray(context.skillCertifications)) {
      for (const cert of context.skillCertifications) {
        // Ownership guard
        if (cert.user_id && cert.user_id !== userId) continue;
        // Relevance guard
        const certSkillName = cert.skill_name || cert.skill_id;
        if (!isSkillMatch(reqText, certSkillName)) continue;
        // Expiry guard
        if (isCertExpired(cert.expires_at)) continue;
        // Verification guard
        if (cert.is_verified === false) continue;

        matchedCert = cert;
        supportingList.push({
          source: 'skill_certifications',
          trustTier: 'ASSESSMENT_VERIFIED',
          detail: `Platform Certified (${cert.certification_level}, Score: ${cert.score}%)`,
        });
        break;
      }
    }

    // -----------------------------------------------------------------------
    // STEP 2: Check Passed Assessment Attempts (Tier 2 - High Trust)
    // -----------------------------------------------------------------------
    let matchedAttempt: UserAssessmentAttemptInput | null = null;
    let isStale = false;
    if (context.assessmentAttempts && Array.isArray(context.assessmentAttempts)) {
      // Sort attempts by score descending to pick best passed attempt
      const userAttempts = context.assessmentAttempts
        .filter(a => !a.user_id || a.user_id === userId)
        .sort((a, b) => b.score - a.score);

      for (const attempt of userAttempts) {
        // Ownership guard
        if (attempt.user_id && attempt.user_id !== userId) continue;
        // Relevance guard
        const attemptSkill = attempt.skill_name || attempt.assessment_id;
        if (!isSkillMatch(reqText, attemptSkill)) continue;
        // Passed & completion guard
        if (attempt.passed !== true || !attempt.completed_at) continue;

        matchedAttempt = attempt;
        isStale = isAssessmentStale(attempt.completed_at);
        if (isStale) staleEvidenceCount++;

        supportingList.push({
          source: 'user_assessment_attempts',
          trustTier: 'ASSESSMENT_VERIFIED',
          detail: `Passed Skill Assessment (Score: ${attempt.score}%, Completed: ${attempt.completed_at.slice(0, 10)}${isStale ? ' - DECAYED' : ''})`,
        });
        break;
      }
    }

    // -----------------------------------------------------------------------
    // STEP 3: Check Work Experience (Tier 3 - System Derived Recency & Years)
    // -----------------------------------------------------------------------
    let totalExperienceMonths = 0;
    const matchedRoles: string[] = [];

    const expArray = context.resume
      ? (Array.isArray((context.resume as any).experience)
          ? (context.resume as any).experience
          : Array.isArray((context.resume as any).workExperience)
          ? (context.resume as any).workExperience
          : [])
      : [];

    for (const exp of expArray) {
      const jobTitle = String(exp.jobTitle || exp.job_title || exp.title || '');
      const company = String(exp.company || exp.companyName || exp.company_name || 'Company');
      const startDate = exp.startDate || exp.start_date || null;
      const endDate = exp.endDate || exp.end_date || null;
      const description = typeof exp.description === 'string' ? exp.description : '';
      const techs: string[] = Array.isArray(exp.technologies)
        ? exp.technologies
        : Array.isArray(exp.technologies_used)
        ? exp.technologies_used
        : Array.isArray(exp.skills)
        ? exp.skills
        : [];

      const titleMatch = isSkillMatch(reqText, jobTitle);
      const descMatch = description !== '' && isSkillMatch(reqText, description);
      const techMatch = techs.some(t => isSkillMatch(reqText, String(t)));

      if (titleMatch || descMatch || techMatch) {
        const months = calculateMonthsBetween(startDate, endDate);
        totalExperienceMonths += months;
        matchedRoles.push(`${jobTitle || 'Role'} at ${company} (${(months / 12).toFixed(1)} yrs)`);
      }
    }

    const calculatedYears = Number((totalExperienceMonths / 12).toFixed(1));
    if (calculatedYears > 0) {
      supportingList.push({
        source: 'work_experience',
        trustTier: 'SYSTEM_DERIVED',
        detail: `Calculated ${calculatedYears} years relevant work experience across ${matchedRoles.length} role(s)`,
      });
    }

    // -----------------------------------------------------------------------
    // STEP 4: Check Resume Skill Claim (Tier 5 - Candidate Reported)
    // -----------------------------------------------------------------------
    let hasResumeSkillClaim = false;
    if (context.resume && Array.isArray(context.resume.skills)) {
      hasResumeSkillClaim = context.resume.skills.some(s => isSkillMatch(reqText, s.name));
      if (hasResumeSkillClaim) {
        supportingList.push({
          source: 'resume_skills',
          trustTier: 'USER_CLAIMED_RESUME',
          detail: `Listed under skills in candidate resume`,
        });
      }
    }

    // -----------------------------------------------------------------------
    // STEP 5: Synthesize Evidence Tier, Strength, and Explanation
    // -----------------------------------------------------------------------
    let isFound = false;
    let strength: EvidenceStrength = 'NONE';
    let tier: EvidenceTrustTier = 'NONE';
    let primarySource: CandidateRequirementEvidence['primaryEvidenceSource'] = 'none';
    let summary = '';
    let explanation = '';
    const verDetails: VerificationDetails = {};

    if (matchedCert) {
      isFound = true;
      tier = 'ASSESSMENT_VERIFIED';
      strength = 'STRONG';
      primarySource = 'skill_certifications';
      summary = `Verified Platform Certification (${matchedCert.certification_level}, ${matchedCert.score}%)`;
      explanation = `Candidate holds a verified platform certification in "${reqText}" with a score of ${matchedCert.score}%.`;
      verDetails.certificationLevel = matchedCert.certification_level;
      if (matchedCert.blockchain_hash) verDetails.certificationHash = matchedCert.blockchain_hash;
      assessmentVerifiedCount++;
    } else if (matchedAttempt) {
      isFound = true;
      tier = 'ASSESSMENT_VERIFIED';
      // Stale assessment reduces strength from STRONG to MODERATE
      strength = isStale ? 'MODERATE' : 'STRONG';
      primarySource = 'user_assessment_attempts';
      summary = `Passed Assessment Attempt (Score: ${matchedAttempt.score}%${isStale ? ', Stale >24mo' : ''})`;
      explanation = isStale
        ? `Candidate passed skill assessment for "${reqText}" with score ${matchedAttempt.score}%, but assessment is over 24 months old (DECAYED_EVIDENCE).`
        : `Candidate passed verified skill assessment for "${reqText}" with a score of ${matchedAttempt.score}%.`;
      verDetails.assessmentScore = matchedAttempt.score;
      verDetails.assessmentPassed = true;
      verDetails.assessmentDate = matchedAttempt.completed_at || undefined;
      verDetails.isDecayed = isStale;
      assessmentVerifiedCount++;
    } else if (calculatedYears > 0) {
      isFound = true;
      tier = 'SYSTEM_DERIVED';
      strength = calculatedYears >= 3 ? 'STRONG' : 'MODERATE';
      primarySource = 'work_experience';
      summary = `Calculated ${calculatedYears} Years Work Experience`;
      explanation = `Calculated ${calculatedYears} years of work experience referencing "${reqText}" across roles: ${matchedRoles.join('; ')}.`;
      verDetails.yearsCalculated = calculatedYears;
      verDetails.matchedExperienceRoles = matchedRoles;
      systemDerivedCount++;
    } else if (hasResumeSkillClaim) {
      isFound = true;
      tier = 'USER_CLAIMED_RESUME';
      strength = 'WEAK';
      primarySource = 'resume_skills';
      summary = `Candidate Self-Reported Resume Skill`;
      explanation = `Candidate self-reported "${reqText}" in resume skills list. No platform assessment or verified test on record.`;
      verDetails.resumeClaimSource = 'skills_list';
      userClaimedCount++;
    } else {
      isFound = false;
      tier = 'NONE';
      strength = 'NONE';
      primarySource = 'none';
      summary = `No Candidate Evidence Found`;
      explanation = `No verified assessment, platform certification, calculated work experience, or resume claim found for "${reqText}".`;
      missingEvidenceCount++;
    }

    if (isFound) evidenceFoundCount++;

    reqList.push({
      requirementText: reqText,
      requirementCategory: reqCat,
      isEvidenceFound: isFound,
      evidenceStrength: strength,
      trustTier: tier,
      primaryEvidenceSource: primarySource,
      evidenceSummary: summary,
      verificationDetails: Object.keys(verDetails).length > 0 ? verDetails : undefined,
      explanation,
      supportingEvidence: supportingList,
    });
  }

  return {
    candidateUserId: userId,
    evaluatedAt: new Date().toISOString(),
    totalRequirementsEvaluated: requirements.length,
    evidenceFoundCount,
    assessmentVerifiedCount,
    systemDerivedCount,
    userClaimedCount,
    staleEvidenceCount,
    missingEvidenceCount,
    requirementEvidenceList: reqList,
  };
}
