import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Target, 
  ShieldCheck, 
  Briefcase, 
  Sparkles, 
  AlertCircle, 
  TrendingUp,
  CheckCircle2
} from 'lucide-react';

interface ExecutiveCareerSnapshotProps {
  fullName: string;
  headline?: string;
  candidateTier: string; // 'Fresher' | 'Early Career' | 'Mid Career' | 'Senior' | 'Executive' | '40+ Year Professional';
  completeness: number;
  atsReadiness?: number;
  evidenceStrength: number;
  experienceTenureYears: number;
  topStrengths: string[];
  topGaps: string[];
  onImproveProfile: () => void;
  onSelectTargetJob: () => void;
}

export const ExecutiveCareerSnapshot: React.FC<ExecutiveCareerSnapshotProps> = ({
  fullName,
  headline,
  candidateTier,
  completeness,
  atsReadiness,
  evidenceStrength,
  experienceTenureYears,
  topStrengths,
  topGaps,
  onImproveProfile,
  onSelectTargetJob
}) => {
  return (
    <Card className="border-border/60 bg-gradient-to-r from-background via-muted/30 to-background shadow-md overflow-hidden mb-6">
      <div className="border-b border-border/40 bg-muted/20 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xl shadow-inner">
            {fullName ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'CP'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">{fullName || 'Professional Profile'}</h1>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-xs font-semibold">
                {candidateTier}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {headline || `${experienceTenureYears > 0 ? `${experienceTenureYears}+ Years Experience` : 'Fresh Graduate'} • Canonical Career Identity`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={onSelectTargetJob} variant="outline" size="sm" className="gap-1.5 border-primary/30 hover:bg-primary/5 text-xs font-medium">
            <Target className="w-3.5 h-3.5 text-primary" />
            Target Job Match
          </Button>
          <Button onClick={onImproveProfile} size="sm" className="gap-1.5 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Improve My Profile
          </Button>
        </div>
      </div>

      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Completeness */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Profile Completeness
              </span>
              <span className="font-bold text-foreground">{completeness}%</span>
            </div>
            <Progress value={completeness} className="h-2 bg-muted" />
            <p className="text-[11px] text-muted-foreground">
              {completeness >= 85 ? 'Comprehensive career profile' : 'Add projects & skills to reach 90%'}
            </p>
          </div>

          {/* ATS Readiness */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                ATS Readiness
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {atsReadiness != null ? `${atsReadiness}%` : '—'}
              </span>
            </div>
            {atsReadiness != null ? (
              <>
                <Progress value={atsReadiness} className="h-2 bg-muted" />
                <p className="text-[11px] text-muted-foreground">
                  {atsReadiness >= 75 ? 'Clean parsing & high keyword fit' : 'Improve formatting & required keywords'}
                </p>
                <p className="text-[10px] text-muted-foreground opacity-70">Source: Phase 1 ATS Engine</p>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Select a target job and run ATS Analysis to calculate your fit score.
              </p>
            )}
          </div>

          {/* Evidence Strength */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                Evidence Strength
              </span>
              <span className="font-bold text-blue-600 dark:text-blue-400">
                {evidenceStrength > 0 ? `${evidenceStrength}%` : '—'}
              </span>
            </div>
            {evidenceStrength > 0 ? (
              <>
                <Progress value={evidenceStrength} className="h-2 bg-muted" />
                <p className="text-[11px] text-muted-foreground">
                  {evidenceStrength >= 70 ? 'Strong evidence from certifications & projects' : 'Add certifications or projects to strengthen evidence'}
                </p>
                <p className="text-[10px] text-muted-foreground opacity-70">Source: certifications + projects count</p>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Add certifications or projects to build your evidence profile.
              </p>
            )}
          </div>

          {/* Experience Tenure */}
          <div className="p-3.5 rounded-lg border border-border/50 bg-background/50 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 font-medium">
                <Briefcase className="w-3.5 h-3.5 text-purple-500" />
                Career Tenure
              </span>
              <span className="font-bold text-foreground">
                {experienceTenureYears === 0 ? 'Fresh Grad' : `${experienceTenureYears} Years`}
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground pt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>{candidateTier} career history preserved</span>
            </div>
          </div>
        </div>

        {/* Strengths & Gaps Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Top Strengths</span>
              <div className="flex flex-wrap gap-1.5">
                {topStrengths.length > 0 ? (
                  topStrengths.map((s, idx) => (
                    <Badge key={idx} variant="secondary" className="text-[11px] bg-background/80 font-normal">
                      {s}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Complete sections to highlight core strengths</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-500/5 border border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Recommended Improvement Gaps</span>
              <div className="flex flex-wrap gap-1.5">
                {topGaps.length > 0 ? (
                  topGaps.map((g, idx) => (
                    <Badge key={idx} variant="outline" className="text-[11px] border-amber-300/40 text-amber-900 dark:text-amber-200 bg-background/50">
                      {g}
                    </Badge>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">No critical gaps detected for current target</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
