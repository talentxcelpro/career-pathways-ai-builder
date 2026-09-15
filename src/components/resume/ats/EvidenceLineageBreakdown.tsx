/**
 * TALENTXCEL — PHASE 3 GATE 3D
 * Candidate-Facing Evidence Experience Component
 * src/components/resume/ats/EvidenceLineageBreakdown.tsx
 *
 * PURPOSE:
 *   Renders candidate-facing requirement match breakdown displaying:
 *     - Requirement Name & Category
 *     - Match Status (MATCHED / MISSING)
 *     - Evidence Status & Strength (STRONG / MODERATE / WEAK / NONE)
 *     - Trust Badge (HIGH / MEDIUM / LOW / UNVERIFIED / DECAYED)
 *     - Evidence Sources List (Platform Cert, Passed Assessment, Calculated Exp, Resume Claim)
 *     - Explainable Explanation ("Why do we believe it?")
 *     - Action Buttons linking to existing TalentXcel workflows (/assessments, /resume/editor, /learning)
 *
 * GUARANTEES:
 *   - Phase 1 ATS Score is displayed separately from Evidence Strength (0.0% score manipulation)
 *   - 100% Read-Only (Does NOT mutate ai_resumes.content)
 *   - Candidate Privacy respected
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ShieldCheck, Clock, FileText, AlertCircle, Award, ArrowUpRight, Sparkles, BookOpen, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EvidenceAwareATSResult, EvidenceAwareRequirementMatch } from '@/lib/resume/evidenceAwareATS';

export interface EvidenceLineageBreakdownProps {
  result: EvidenceAwareATSResult;
  onNavigateAction?: (route: string, context?: any) => void;
}

export const EvidenceLineageBreakdown: React.FC<EvidenceLineageBreakdownProps> = ({
  result,
  onNavigateAction,
}) => {
  const navigate = useNavigate();

  const handleActionClick = (route: string) => {
    if (onNavigateAction) {
      onNavigateAction(route);
    } else {
      navigate(route);
    }
  };

  const getTrustBadge = (req: EvidenceAwareRequirementMatch) => {
    const lineage = req.evidenceLineage;
    if (lineage.isDecayed) {
      return <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1"><Clock className="w-3 h-3" /> DECAYED EVIDENCE</Badge>;
    }
    switch (lineage.trustLabel) {
      case 'HIGH':
        return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1"><ShieldCheck className="w-3 h-3" /> HIGH TRUST</Badge>;
      case 'MEDIUM':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 border-blue-500/30 gap-1"><ShieldCheck className="w-3 h-3" /> MEDIUM TRUST</Badge>;
      case 'LOW':
        return <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/30 gap-1"><FileText className="w-3 h-3" /> LOW TRUST</Badge>;
      case 'UNVERIFIED':
      default:
        return <Badge variant="outline" className="bg-gray-500/10 text-gray-600 border-gray-500/30 gap-1"><AlertCircle className="w-3 h-3" /> UNVERIFIED</Badge>;
    }
  };

  const getStrengthBadge = (strength: string) => {
    switch (strength) {
      case 'STRONG':
        return <Badge className="bg-emerald-500 text-white">STRONG EVIDENCE</Badge>;
      case 'MODERATE':
        return <Badge className="bg-blue-500 text-white">MODERATE EVIDENCE</Badge>;
      case 'WEAK':
        return <Badge variant="outline" className="text-orange-600 border-orange-500/40">WEAK EVIDENCE</Badge>;
      case 'NONE':
      default:
        return <Badge variant="outline" className="text-gray-500 border-gray-300">NO VERIFIED EVIDENCE</Badge>;
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* ATS Fit Score Card (Phase 1 Score Preserved) */}
        <Card className="border-primary/20 bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Phase 1 ATS Compatibility Score</CardDescription>
            <CardTitle className="text-4xl font-bold text-primary flex items-baseline gap-2">
              {result.score}%
              <span className="text-sm font-normal text-muted-foreground">overall fit</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs text-muted-foreground">
            Deterministic & semantic match composite. Score is 100% frozen and separate from evidence verification strength.
          </CardContent>
        </Card>

        {/* Evidence Verification Summary Card */}
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold text-emerald-700">Verified Evidence Summary</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-700 flex items-center gap-2">
              <Award className="w-6 h-6 text-emerald-600" />
              {result.evidenceStats.assessmentVerifiedCount} Verified Credentials
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Assessment & Cert Verified:</span>
              <span className="font-semibold text-foreground">{result.evidenceStats.assessmentVerifiedCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Calculated Work Experience:</span>
              <span className="font-semibold text-foreground">{result.evidenceStats.systemDerivedCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Candidate Resume Claims:</span>
              <span className="font-semibold text-foreground">{result.evidenceStats.userClaimedCount}</span>
            </div>
            {result.evidenceStats.decayedEvidenceCount > 0 && (
              <div className="flex justify-between text-amber-600 font-medium">
                <span>Decayed Evidence (>24mo):</span>
                <span>{result.evidenceStats.decayedEvidenceCount}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Requirement Breakdown List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          Requirement Match & Evidence Lineage
        </h3>

        <div className="grid gap-4">
          {result.requirements.map((req, idx) => {
            const lineage = req.evidenceLineage;
            const isMatched = req.matchType !== 'MISSING';

            return (
              <Card key={idx} className={`p-4 border transition-all ${isMatched ? 'border-border' : 'border-red-500/20 bg-red-500/5'}`}>
                <div className="space-y-3">
                  {/* Top Bar: Title, Category, Match Badge, Trust Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-semibold text-foreground">{req.requirement}</span>
                      <Badge variant="outline" className="text-xs">{req.requirementClass}</Badge>
                      {req.requirementSource === 'AI_INFERRED' && (
                        <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-600 border-purple-300">AI INFERRED REQ</Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {isMatched ? (
                        <Badge className="bg-emerald-600 text-white gap-1"><CheckCircle2 className="w-3 h-3" /> MATCHED ({req.matchType})</Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1"><AlertCircle className="w-3 h-3" /> MISSING</Badge>
                      )}
                      {getTrustBadge(req)}
                      {getStrengthBadge(lineage.evidenceStrength)}
                    </div>
                  </div>

                  {/* Evidence Sources List */}
                  {lineage.sources && lineage.sources.length > 0 ? (
                    <div className="bg-muted/50 rounded-md p-3 space-y-1.5 text-xs">
                      <span className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider block mb-1">Supporting Evidence Sources</span>
                      {lineage.sources.map((src, sIdx) => (
                        <div key={sIdx} className="flex items-start gap-2 text-foreground">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{src.detail}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-muted/30 rounded-md p-3 text-xs text-muted-foreground italic">
                      No verified assessment, platform certification, or calculated experience on record.
                    </div>
                  )}

                  {/* Explanation & Action Bar */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 border-t border-border/50 text-xs">
                    <p className="text-muted-foreground flex-1">
                      <strong className="text-foreground">Why: </strong>
                      {lineage.explanation}
                    </p>

                    {/* Actionable Next Steps linking ONLY to existing workflows */}
                    <div className="shrink-0">
                      {(!lineage.isEvidenceFound || lineage.trustTier === 'USER_CLAIMED_RESUME') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1 border-primary/40 hover:bg-primary/10"
                          onClick={() => handleActionClick('/assessments')}
                        >
                          <Award className="w-3.5 h-3.5 text-primary" />
                          Assess This Skill
                          <ArrowUpRight className="w-3 h-3" />
                        </Button>
                      )}

                      {!isMatched && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1"
                            onClick={() => handleActionClick('/resume/editor')}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Improve Resume
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs gap-1"
                            onClick={() => handleActionClick('/learning')}
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            Learn Skill
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
