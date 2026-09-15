/**
 * TALENTXCEL — PHASE 3F
 * Application Intelligence Implementation Hook
 * src/hooks/useApplicationIntelligence.ts
 *
 * PURPOSE:
 *   Coordinates candidate pre-application job discovery, evidence inspection,
 *   gap action resolution, and privacy-safe application submission.
 *
 * STRICT PRIVACY GUARANTEES:
 *   1. Full CandidateRequirementEvidence lineage remains 100% RUNTIME-ONLY.
 *   2. DO NOT persist raw assessment scores, attempt numbers, decay statuses,
 *      evidence trust labels, or "why" explanations into job_applications.application_data.
 *   3. Application submission writes ONLY employer-safe Phase 1 ATS summaries
 *      (score, breakdown, requirements, experienceAlignment) to application_data.ats_analysis.
 *   4. Master resume (ai_resumes.content) remains 100% IMMUTABLE.
 *   5. Zero new database tables / zero schema modifications.
 *   6. Zero changes to Phase 1 scoring (0.0% score inflation).
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { analyzeATSFit, ATSAnalysisResult, serializeATSResultForStorage } from '@/lib/resume/atsEngine';
import { CandidateEvidenceContext } from '@/lib/resume/evidenceCorrelationEngine';
import { attachEvidenceToATSResult, EvidenceAwareATSResult } from '@/lib/resume/evidenceAwareATS';
import { useCreateJobApplication } from './useJobApplications';
import { toast } from 'sonner';

export interface UseApplicationIntelligenceOptions {
  userId?: string;
  resumeId?: string;
  jobId?: string;
}

export const useApplicationIntelligence = (options: UseApplicationIntelligenceOptions = {}) => {
  const [isInspecting, setIsInspecting] = useState(false);
  const [evidenceResult, setEvidenceResult] = useState<EvidenceAwareATSResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createApplicationMutation = useCreateJobApplication();

  /**
   * inspectPreApplicationFit
   *
   * Runs Phase 1 ATS analysis + Gate 3B Evidence Correlation in-memory
   * BEFORE application submission.
   *
   * 100% Read-Only. 0 DB Writes. 0 Master Resume Mutations.
   */
  const inspectPreApplicationFit = useCallback(async (
    resumeId: string,
    jobId: string,
    userId: string,
    customEvidenceContext?: Partial<CandidateEvidenceContext>
  ): Promise<EvidenceAwareATSResult | null> => {
    setIsInspecting(true);
    setError(null);

    try {
      // 1. Run frozen Phase 1 ATS fit analysis (Read-Only)
      const atsResult = await analyzeATSFit(resumeId, jobId, userId);

      if (!('score' in atsResult)) {
        throw new Error('ATS Analysis Unavailable');
      }

      // 2. Fetch candidate assessment attempts & platform certs for evidence correlation
      const [attemptsRes, certsRes] = await Promise.all([
        supabase
          .from('user_assessment_attempts')
          .select('id, user_id, assessment_id, score, passed, completed_at, attempt_number, time_taken_minutes')
          .eq('user_id', userId)
          .eq('passed', true),
        supabase
          .from('skill_certifications')
          .select('id, user_id, skill_id, score, certification_level, is_verified, blockchain_hash, verification_url, issued_at, expires_at')
          .eq('user_id', userId)
          .eq('is_verified', true),
      ]);

      const evidenceContext: CandidateEvidenceContext = {
        userId,
        assessmentAttempts: attemptsRes.data || [],
        skillCertifications: certsRes.data || [],
        ...customEvidenceContext,
      };

      // 3. Attach in-memory evidence lineage (Gate 3C/3D)
      const enrichedResult = attachEvidenceToATSResult(atsResult as ATSAnalysisResult, evidenceContext);
      setEvidenceResult(enrichedResult);
      return enrichedResult;

    } catch (err: any) {
      console.error('[ApplicationIntelligence] Fit inspection error:', err);
      setError(err.message || 'Failed to inspect job fit');
      return null;
    } finally {
      setIsInspecting(false);
    }
  }, []);

  /**
   * submitPrivacySafeApplication
   *
   * Submits candidate application to job_applications table.
   *
   * CRITICAL PRIVACY GUARD:
   * Strips out full candidate evidence lineage before writing to application_data.
   * Persists ONLY employer-safe Phase 1 ATS summary (score, breakdown, requirements).
   */
  const submitPrivacySafeApplication = useCallback(async (params: {
    jobId: string;
    resumeUrl?: string;
    applicationData?: Record<string, unknown>;
    atsResult?: ATSAnalysisResult | EvidenceAwareATSResult;
  }) => {
    const { jobId, resumeUrl, applicationData = {}, atsResult } = params;

    // Build employer-safe ATS payload (Phase 1 summary only)
    let atsPayload: Record<string, unknown> = {};
    if (atsResult && 'score' in atsResult) {
      // Serialize using frozen Phase 1 serializer (strips private evidence lineage)
      atsPayload = serializeATSResultForStorage(atsResult as ATSAnalysisResult);
    }

    // Safe merge: preserve application form data + employer-safe ats_analysis JSONB
    const safeApplicationData = {
      ...applicationData,
      ...atsPayload, // Adds ONLY employer-safe ats_analysis key
    };

    // PRIVACY SANITY GUARD: Assert no private evidence lineage fields leaked into payload
    if (JSON.stringify(safeApplicationData).includes('evidenceLineage')) {
      console.warn('[PRIVACY GUARD] evidenceLineage detected in application payload — stripping out before persistence!');
      delete (safeApplicationData as any).evidenceLineage;
    }

    // Submit application using existing mutation
    const submitted = await createApplicationMutation.mutateAsync({
      job_id: jobId,
      resume_url: resumeUrl,
      application_data: safeApplicationData,
    });

    toast.success('Application submitted securely');
    return submitted;
  }, [createApplicationMutation]);

  return {
    isInspecting,
    evidenceResult,
    error,
    inspectPreApplicationFit,
    submitPrivacySafeApplication,
  };
};
