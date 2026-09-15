/**
 * TALENTXCEL — PHASE 3 GATE 3C
 * Evidence-Aware ATS Explanation Layer
 * src/lib/resume/evidenceAwareATS.ts
 *
 * PURPOSE:
 *   Connect the in-memory Evidence Correlation Engine (Gate 3B) to the
 *   existing ATS Analysis Result (Phase 1) so that each requirement match
 *   displays its verified evidence lineage.
 *
 * GUARANTEES:
 *   - Phase 1 ATS Score is 100% UNTOUCHED and UNINFLATED (Score contribution is 0%)
 *   - Phase 1 matching algorithm & weights remain FROZEN
 *   - Phase 2 job ingestion remains FROZEN
 *   - Pure in-memory correlation — 0 DB writes, 0 schema changes
 *   - Clear distinction: ASSESSMENT_VERIFIED vs SYSTEM_DERIVED vs USER_CLAIMED_RESUME
 *   - Decayed evidence (>24mo) explicitly marked DECAYED EVIDENCE
 *   - Candidate privacy & ownership respected
 */

import { ATSAnalysisResult, RequirementMatch, ScoreBreakdown } from './atsEngine';
import {
  correlateCandidateEvidence,
  CandidateEvidenceContext,
  CandidateRequirementEvidence,
  EvidenceTrustTier,
  EvidenceStrength,
} from './evidenceCorrelationEngine';
import { NormalizedJobRequirement } from '../job/normalizeJobContent';

// ---------------------------------------------------------------------------
// Types & Interfaces
// ---------------------------------------------------------------------------

export type EvidenceTrustLabel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';

export interface EvidenceLineage {
  isEvidenceFound: boolean;
  evidenceStrength: EvidenceStrength;
  trustTier: EvidenceTrustTier;
  primaryEvidenceSource: CandidateRequirementEvidence['primaryEvidenceSource'];
  evidenceSummary: string;
  trustLabel: EvidenceTrustLabel;
  isDecayed: boolean;
  sources: Array<{
    source: string;
    trustTier: EvidenceTrustTier;
    detail: string;
  }>;
  explanation: string;
}

export interface EvidenceAwareRequirementMatch extends RequirementMatch {
  evidenceLineage: EvidenceLineage;
  requirementSource: 'SOURCE_PROVIDED' | 'AI_INFERRED';
}

export interface EvidenceAwareATSResult {
  version: '1.0';
  analyzedAt: string;
  resumeId: string;
  jobId: string;
  variantDetected: string;
  normalizationWarnings: string[];

  // Phase 1 Score (100% UNCHANGED & FROZEN)
  score: number;
  breakdown: ScoreBreakdown;

  // Enriched requirement list with attached evidence lineage
  requirements: EvidenceAwareRequirementMatch[];
  experienceAlignment: ATSAnalysisResult['experienceAlignment'];
  assessmentEvidence: ATSAnalysisResult['assessmentEvidence'];

  gaps: ATSAnalysisResult['gaps'];

  // Evidence summary metrics
  evidenceStats: {
    totalRequirements: number;
    assessmentVerifiedCount: number;
    systemDerivedCount: number;
    userClaimedCount: number;
    decayedEvidenceCount: number;
    missingEvidenceCount: number;
  };

  // Meta
  deterministicMatchCount: number;
  semanticMatchCount: number;
  dataIntegrityVerified: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function deriveTrustLabel(tier: EvidenceTrustTier, strength: EvidenceStrength, isDecayed: boolean): EvidenceTrustLabel {
  if (isDecayed) return 'MEDIUM';
  if (tier === 'ASSESSMENT_VERIFIED' || tier === 'EXTERNALLY_VERIFIED') return 'HIGH';
  if (tier === 'SYSTEM_DERIVED') return strength === 'STRONG' ? 'HIGH' : 'MEDIUM';
  if (tier === 'USER_PROVIDED_STRUCTURED') return 'MEDIUM';
  if (tier === 'USER_CLAIMED_RESUME') return 'LOW';
  return 'UNVERIFIED';
}

// ---------------------------------------------------------------------------
// Main Public Function
// ---------------------------------------------------------------------------

/**
 * attachEvidenceToATSResult
 *
 * Takes a frozen Phase 1 ATSAnalysisResult and attaches in-memory Gate 3B
 * candidate evidence lineage to each requirement match.
 *
 * GUARANTEES:
 *   - `result.score` is 100% IDENTICAL to `atsResult.score`
 *   - `result.breakdown` is 100% IDENTICAL to `atsResult.breakdown`
 *   - Zero database mutations
 */
export function attachEvidenceToATSResult(
  atsResult: ATSAnalysisResult,
  evidenceContext: CandidateEvidenceContext,
  jobRequirementsSourceMap?: Record<string, 'SOURCE_PROVIDED' | 'AI_INFERRED'>
): EvidenceAwareATSResult {
  // Convert ATS requirements to NormalizedJobRequirement array for correlation engine
  const canonicalReqs: NormalizedJobRequirement[] = atsResult.requirements.map(req => ({
    text: req.requirement,
    category: req.requirementClass as any,
    source: (jobRequirementsSourceMap && jobRequirementsSourceMap[req.requirement]) || 'SOURCE_PROVIDED',
    confidence: 'HIGH',
  }));

  // Run in-memory Gate 3B Evidence Correlation Engine
  const correlationResult = correlateCandidateEvidence(canonicalReqs, evidenceContext);

  // Map correlation results back onto ATS requirement matches
  const enrichedRequirements: EvidenceAwareRequirementMatch[] = atsResult.requirements.map(req => {
    const matchedEvidence = correlationResult.requirementEvidenceList.find(
      e => e.requirementText.toLowerCase().trim() === req.requirement.toLowerCase().trim()
    );

    const isFound = matchedEvidence ? matchedEvidence.isEvidenceFound : false;
    const tier: EvidenceTrustTier = matchedEvidence ? matchedEvidence.trustTier : 'NONE';
    const strength: EvidenceStrength = matchedEvidence ? matchedEvidence.evidenceStrength : 'NONE';
    const isDecayed = matchedEvidence?.verificationDetails?.isDecayed === true;
    const trustLabel = deriveTrustLabel(tier, strength, isDecayed);

    let summary = matchedEvidence ? matchedEvidence.evidenceSummary : 'No Candidate Evidence Found';
    if (isDecayed) {
      summary = `[DECAYED EVIDENCE] ${summary}`;
    }

    let explanation = matchedEvidence
      ? matchedEvidence.explanation
      : `No verified assessment, platform certification, or calculated work experience on record for "${req.requirement}".`;

    if (req.matchType !== 'MISSING' && tier === 'USER_CLAIMED_RESUME') {
      explanation = `${explanation} (Matched resume text claim — NO VERIFIED ASSESSMENT OR PLATFORM CERTIFICATION ON RECORD).`;
    }

    const lineage: EvidenceLineage = {
      isEvidenceFound: isFound,
      evidenceStrength: strength,
      trustTier: tier,
      primaryEvidenceSource: matchedEvidence ? matchedEvidence.primaryEvidenceSource : 'none',
      evidenceSummary: summary,
      trustLabel,
      isDecayed,
      sources: matchedEvidence ? matchedEvidence.supportingEvidence : [],
      explanation,
    };

    const reqSource = (jobRequirementsSourceMap && jobRequirementsSourceMap[req.requirement]) || 'SOURCE_PROVIDED';

    return {
      ...req,
      evidenceLineage: lineage,
      requirementSource: reqSource,
    };
  });

  return {
    version: '1.0',
    analyzedAt: atsResult.analyzedAt,
    resumeId: atsResult.resumeId,
    jobId: atsResult.jobId,
    variantDetected: atsResult.variantDetected,
    normalizationWarnings: atsResult.normalizationWarnings,

    // SCORE & BREAKDOWN PRESERVED 100% UNCHANGED FROM PHASE 1
    score: atsResult.score,
    breakdown: atsResult.breakdown,

    requirements: enrichedRequirements,
    experienceAlignment: atsResult.experienceAlignment,
    assessmentEvidence: atsResult.assessmentEvidence,

    gaps: atsResult.gaps,

    evidenceStats: {
      totalRequirements: correlationResult.totalRequirementsEvaluated,
      assessmentVerifiedCount: correlationResult.assessmentVerifiedCount,
      systemDerivedCount: correlationResult.systemDerivedCount,
      userClaimedCount: correlationResult.userClaimedCount,
      decayedEvidenceCount: correlationResult.staleEvidenceCount,
      missingEvidenceCount: correlationResult.missingEvidenceCount,
    },

    deterministicMatchCount: atsResult.deterministicMatchCount,
    semanticMatchCount: atsResult.semanticMatchCount,
    dataIntegrityVerified: atsResult.dataIntegrityVerified,
  };
}
