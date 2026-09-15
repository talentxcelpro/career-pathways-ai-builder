import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ArrowRight, CheckCircle2, Target, Trophy, ShieldCheck, Briefcase } from 'lucide-react';
import { CanonicalCareerStage } from '@/utils/careerStageClassifier';

interface YourCareerAssistantBannerProps {
  completeness: number;
  atsReadiness?: number | null;
  evidenceCoverage: number;
  careerStage: CanonicalCareerStage;
  targetJobTitle?: string;
  hasSummary: boolean;
  hasProjects: boolean;
  hasCerts: boolean;
  onActionClick: (actionKey: string) => void;
}

export const YourCareerAssistantBanner: React.FC<YourCareerAssistantBannerProps> = ({
  completeness,
  atsReadiness,
  evidenceCoverage,
  careerStage,
  targetJobTitle,
  hasSummary,
  hasProjects,
  hasCerts,
  onActionClick
}) => {
  // Determine Primary Recommendation
  let recommendationText = "";
  let actionLabel = "Improve My Profile";
  let actionKey = "build";

  if (!hasSummary) {
    recommendationText = "Add a 2-3 sentence Professional Summary to clearly articulate your core career identity & domain authority.";
    actionLabel = "Generate Smart Summary";
    actionKey = "summary";
  } else if (!targetJobTitle) {
    recommendationText = "Select a Target Job Title to unlock precise ATS Keyword Matching and tailored score analysis.";
    actionLabel = "Select Target Job";
    actionKey = "target";
  } else if (atsReadiness == null) {
    recommendationText = `Target Job "${targetJobTitle}" selected. Run Phase 1 ATS Analysis to benchmark your fit against recruiter filters.`;
    actionLabel = "Run ATS Analysis";
    actionKey = "ats";
  } else if (!hasProjects && (careerStage.includes('Executive') || careerStage.includes('Senior') || careerStage.includes('Mid'))) {
    recommendationText = "Add 1-2 Key Projects or Leadership Initiatives to demonstrate tangible business scale, budget, or team impact.";
    actionLabel = "Add Key Project";
    actionKey = "build";
  } else if (!hasCerts && evidenceCoverage < 50) {
    recommendationText = "Add verified certifications or complete a skill assessment to boost your Evidence Strength above 70%.";
    actionLabel = "Strengthen Evidence";
    actionKey = "evidence";
  } else {
    recommendationText = "Your Career Identity is strong & ready! Generate your 1-Click Application Pack for instant job submission.";
    actionLabel = "Open Application Pack";
    actionKey = "application-pack";
  }

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-background to-primary/5 shadow-md overflow-hidden mb-6">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Metrics Bar */}
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Your Career Readiness Status</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] font-semibold">
                {careerStage}
              </Badge>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="p-2 rounded-lg bg-background/80 border border-border/40 text-center">
                <span className="text-[10px] font-medium text-muted-foreground block">Profile Strength</span>
                <span className="text-sm font-bold text-foreground">{Math.min(100, Math.max(0, completeness))}%</span>
              </div>
              <div className="p-2 rounded-lg bg-background/80 border border-border/40 text-center">
                <span className="text-[10px] font-medium text-muted-foreground block">ATS Readiness</span>
                <span className="text-sm font-bold text-emerald-600">
                  {atsReadiness != null ? `${Math.min(100, Math.max(0, atsReadiness))}%` : '—'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-background/80 border border-border/40 text-center">
                <span className="text-[10px] font-medium text-muted-foreground block">Evidence Strength</span>
                <span className="text-sm font-bold text-blue-600">
                  {evidenceCoverage > 0 ? `${Math.min(100, Math.max(0, evidenceCoverage))}%` : '—'}
                </span>
              </div>
              <div className="p-2 rounded-lg bg-background/80 border border-border/40 text-center">
                <span className="text-[10px] font-medium text-muted-foreground block">Target Fit</span>
                <span className="text-sm font-bold text-purple-600 line-clamp-1">
                  {targetJobTitle || 'Not Set'}
                </span>
              </div>
            </div>

            {/* Next Best Action Recommendation */}
            <div className="flex items-start gap-2 pt-1">
              <span className="text-xs font-bold text-foreground shrink-0 mt-0.5">NEXT BEST ACTION:</span>
              <p className="text-xs text-muted-foreground leading-relaxed">{recommendationText}</p>
            </div>
          </div>

          {/* Call to Action Button */}
          <div className="shrink-0 flex items-center">
            <Button 
              onClick={() => onActionClick(actionKey)}
              size="default" 
              className="w-full sm:w-auto text-xs font-bold gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            >
              {actionLabel}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

        </div>
      </CardContent>
    </Card>
  );
};
