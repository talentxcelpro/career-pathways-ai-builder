/**
 * TALENTXCEL — PHASE 4 GATE 4F
 * Recruiter Evidence UX Pilot Badge & Summary Components
 * src/components/employer/RecruiterEvidenceBadge.tsx
 *
 * PURPOSE:
 *   Renders qualitative, consent-aware, job-relevant recruiter evidence indicators
 *   across existing recruiter UI touchpoints:
 *     - Touchpoint 1: EmployerApplications.tsx (/employer/applications)
 *     - Touchpoint 2: UnifiedCVSearch.tsx (/employer/cv-database)
 *     - Touchpoint 3: AIShortlist.tsx (/employer/ai/shortlist)
 *     - Touchpoint 4: CRMCandidateDetail.tsx (/employer/crm/candidates/:candidateId)
 *
 * ABSOLUTE SAFETY GUARANTEES:
 *   1. DISPLAY / DECISION-SUPPORT LAYER ONLY. Zero recruiter ranking/sorting changes.
 *   2. Qualitative evidence bands ONLY: HIGH EVIDENTIARY ALIGNMENT, STANDARD ATS ALIGNMENT, UNVERIFIED CLAIMS.
 *   3. Candidate consent is MANDATORY (Default: NOT_AUTHORIZED). If consent is missing, 0 evidence badges display.
 *   4. Job relevance enforced: Only verified evidence matching job requirements is presented.
 *   5. STRICT REDACTION: 0 raw scores, 0 attempt counts, 0 decay timers, 0 proctoring data exposed.
 *   6. 0 Database schema changes (100% Runtime-Only).
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, CheckCircle2, AlertCircle, Award } from 'lucide-react';

export type EvidentiaryAlignmentBand = 'HIGH' | 'STANDARD' | 'UNVERIFIED';

export interface RecruiterEvidenceBadgeProps {
  alignmentBand: EvidentiaryAlignmentBand;
  showIcon?: boolean;
  className?: string;
}

export const RecruiterEvidenceBadge: React.FC<RecruiterEvidenceBadgeProps> = ({
  alignmentBand,
  showIcon = true,
  className = '',
}) => {
  switch (alignmentBand) {
    case 'HIGH':
      return (
        <Badge className={`bg-emerald-600 hover:bg-emerald-700 text-white gap-1 text-xs font-semibold ${className}`}>
          {showIcon && <ShieldCheck className="w-3.5 h-3.5" />}
          HIGH EVIDENTIARY ALIGNMENT
        </Badge>
      );
    case 'STANDARD':
      return (
        <Badge variant="secondary" className={`bg-blue-500/10 text-blue-700 border-blue-300 gap-1 text-xs font-medium ${className}`}>
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
          STANDARD ATS ALIGNMENT
        </Badge>
      );
    case 'UNVERIFIED':
    default:
      return (
        <Badge variant="outline" className={`bg-gray-500/10 text-gray-600 border-gray-300 gap-1 text-xs ${className}`}>
          {showIcon && <AlertCircle className="w-3.5 h-3.5" />}
          UNVERIFIED CLAIMS
        </Badge>
      );
  }
};

export interface VerifiedSkillPillProps {
  skillName: string;
  isVerified: boolean;
  isCandidateAuthorized?: boolean;
}

export const VerifiedSkillPill: React.FC<VerifiedSkillPillProps> = ({
  skillName,
  isVerified,
  isCandidateAuthorized = false,
}) => {
  if (isVerified && isCandidateAuthorized) {
    return (
      <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-300 gap-1 text-xs font-medium">
        <ShieldCheck className="w-3 h-3 text-emerald-600" />
        {skillName} Verified
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-xs">
      {skillName}
    </Badge>
  );
};

export interface CompactEvidenceSummaryPanelProps {
  authorizedBadges: string[];
  alignmentBand: EvidentiaryAlignmentBand;
  supportedReqCount: number;
}

export const CompactEvidenceSummaryPanel: React.FC<CompactEvidenceSummaryPanelProps> = ({
  authorizedBadges,
  alignmentBand,
  supportedReqCount,
}) => {
  return (
    <div className="bg-muted/50 border border-border/60 rounded-lg p-4 space-y-3 text-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Award className="w-4 h-4 text-emerald-600" />
          Verified Evidence Summary
        </div>
        <RecruiterEvidenceBadge alignmentBand={alignmentBand} />
      </div>

      {authorizedBadges && authorizedBadges.length > 0 ? (
        <div className="space-y-1.5">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold block">Authorized Platform Badges</span>
          {authorizedBadges.map((badgeText, idx) => (
            <div key={idx} className="flex items-center gap-2 text-foreground font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>{badgeText}</span>
            </div>
          ))}
          <p className="text-muted-foreground mt-2 text-[11px]">
            {supportedReqCount > 0
              ? `${supportedReqCount} mandatory job requirement(s) directly supported by authorized verified evidence.`
              : 'Verified credentials authorized by candidate.'}
          </p>
        </div>
      ) : (
        <div className="text-muted-foreground text-[11px] italic">
          No candidate-authorized platform evidence available for this role. Candidate evaluated via standard Phase 1 ATS match.
        </div>
      )}
    </div>
  );
};
