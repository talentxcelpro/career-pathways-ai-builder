import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Target, 
  FileText, 
  BarChart3, 
  Package, 
  Wrench, 
  Plus, 
  ChevronRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { CanonicalCareerStage } from '@/utils/careerStageClassifier';

interface ContextualNextBestActionSidebarProps {
  careerStage: CanonicalCareerStage;
  targetJobTitle?: string;
  completeness: number;
  atsScore?: number | null;
  hasSummary: boolean;
  hasProjects: boolean;
  onNavigateToTab: (tab: string) => void;
  onOpenSummaryModal: () => void;
  onOpenBulletModal: () => void;
  onRunATSAnalysis: () => void;
  onExportPDF: () => void;
  onExportDOCX: () => void;
  showLivePreview: boolean;
  onToggleLivePreview: () => void;
}

export const ContextualNextBestActionSidebar: React.FC<ContextualNextBestActionSidebarProps> = ({
  careerStage,
  targetJobTitle,
  completeness,
  atsScore,
  hasSummary,
  hasProjects,
  onNavigateToTab,
  onOpenSummaryModal,
  onOpenBulletModal,
  onRunATSAnalysis,
  onExportPDF,
  onExportDOCX,
  showLivePreview,
  onToggleLivePreview
}) => {
  // Determine Stage-Aware Dynamic Recommendations
  const isExecutiveOrSenior = careerStage.includes('Executive') || careerStage.includes('Senior') || careerStage.includes('Mid');
  const isFreshGradOrStudent = careerStage.includes('Fresh') || careerStage.includes('Student') || careerStage.includes('Early');

  const getDynamicActions = () => {
    if (targetJobTitle) {
      return [
        {
          num: 1,
          title: `Analyze Fit for "${targetJobTitle}"`,
          desc: 'Run ATS check to reveal keyword gaps',
          onClick: onRunATSAnalysis,
          actionText: atsScore != null ? `ATS Score: ${atsScore}%` : 'Run ATS Analysis',
          completed: atsScore != null,
          badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
        },
        {
          num: 2,
          title: 'Optimize Target Job Bullets',
          desc: 'Align achievement bullets to target requirements',
          onClick: onOpenBulletModal,
          actionText: 'Improve Bullets',
          completed: false,
          badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-500/30'
        },
        {
          num: 3,
          title: 'Generate Application Pack',
          desc: 'Resume + Cover Letter + Interview Prep',
          onClick: () => onNavigateToTab('application-pack'),
          actionText: 'Application Pack',
          completed: false,
          badgeColor: 'bg-purple-500/10 text-purple-700 border-purple-500/30'
        }
      ];
    }

    if (isSeniorOrExecutive(careerStage)) {
      return [
        {
          num: 1,
          title: 'Measurable Leadership Achievements',
          desc: 'Add budget, team scale or revenue metrics',
          onClick: onOpenBulletModal,
          actionText: 'Improve Bullets',
          completed: false,
          badgeColor: 'bg-amber-500/10 text-amber-700 border-amber-500/30'
        },
        {
          num: 2,
          title: 'Executive Summary Positioning',
          desc: 'Refine governance & strategic authority narrative',
          onClick: onOpenSummaryModal,
          actionText: hasSummary ? 'Refine Summary' : 'Create Summary',
          completed: hasSummary,
          badgeColor: 'bg-primary/10 text-primary border-primary/30'
        },
        {
          num: 3,
          title: 'Select Target Leadership Role',
          desc: 'Calculate precise executive ATS fit',
          onClick: () => onNavigateToTab('target'),
          actionText: 'Select Target Job',
          completed: !!targetJobTitle,
          badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
        }
      ];
    }

    // Fresh Grad / Early Career
    return [
      {
        num: 1,
        title: 'Add Key Project or Capstone',
        desc: 'Practical projects prove hands-on capability',
        onClick: () => onNavigateToTab('build'),
        actionText: hasProjects ? 'Manage Projects' : 'Add First Project',
        completed: hasProjects,
        badgeColor: 'bg-blue-500/10 text-blue-700 border-blue-500/30'
      },
      {
        num: 2,
        title: 'Strengthen Professional Summary',
        desc: 'Articulate career focus & core technical skills',
        onClick: onOpenSummaryModal,
        actionText: hasSummary ? 'Edit Summary' : 'Create Summary',
        completed: hasSummary,
        badgeColor: 'bg-primary/10 text-primary border-primary/30'
      },
      {
        num: 3,
        title: 'Select Target Job Profile',
        desc: 'Align skills with entry-level job postings',
        onClick: () => onNavigateToTab('target'),
        actionText: 'Select Target Job',
        completed: !!targetJobTitle,
        badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
      }
    ];
  };

  function isSeniorOrExecutive(stage: string) {
    return stage.includes('Executive') || stage.includes('Senior') || stage.includes('Mid');
  }

  const actions = getDynamicActions();

  return (
    <div className="space-y-4">
      {/* Contextual Next Best Action Card */}
      <Card className="border-border/60 shadow-sm bg-card overflow-hidden">
        <CardHeader className="py-3 px-4 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">Next Best Action</CardTitle>
          </div>
          <Badge variant="outline" className="text-[10px] font-semibold bg-background">
            {careerStage}
          </Badge>
        </CardHeader>

        <CardContent className="p-3.5 space-y-3">
          <div className="space-y-2">
            {actions.map((act) => (
              <div 
                key={act.num}
                onClick={act.onClick}
                className="p-2.5 rounded-lg border border-border/50 bg-background hover:bg-muted/30 transition-all cursor-pointer space-y-1.5 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                      {act.num}
                    </span>
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {act.title}
                    </span>
                  </div>
                  {act.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground pl-7 line-clamp-1">{act.desc}</p>
              </div>
            ))}
          </div>

          {/* Quick Exports */}
          <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2">
            <Button onClick={onExportPDF} size="sm" variant="default" className="h-8 text-xs font-semibold gap-1.5 bg-blue-600 hover:bg-blue-700 text-white">
              <FileText className="w-3.5 h-3.5" />
              Download PDF
            </Button>
            <Button onClick={onExportDOCX} size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1.5 border-blue-500/40 text-blue-700 dark:text-blue-300">
              <FileText className="w-3.5 h-3.5" />
              Download DOCX
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
