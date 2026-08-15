import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Compass, 
  Sparkles, 
  Target, 
  ShieldCheck, 
  ChevronRight, 
  Eye, 
  CheckCircle, 
  AlertTriangle,
  Lightbulb
} from 'lucide-react';

interface ActionItem {
  id: string;
  title: string;
  description: string;
  actionText: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'summary' | 'bullets' | 'skills' | 'evidence' | 'target';
}

interface LiveCareerCoachPanelProps {
  currentAtsScore?: number | null;
  targetJobTitle?: string;
  actions: ActionItem[];
  showPreview: boolean;
  onTogglePreview: () => void;
  onExecuteAction: (action: ActionItem) => void;
  onOpenTargetJob: () => void;
}

export const LiveCareerCoachPanel: React.FC<LiveCareerCoachPanelProps> = ({
  currentAtsScore,
  targetJobTitle,
  actions,
  showPreview,
  onTogglePreview,
  onExecuteAction,
  onOpenTargetJob
}) => {
  return (
    <div className="space-y-4">
      {/* Target Job Match Banner */}
      <Card className="border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5" />
              Target Job Alignment
            </span>
            <Badge variant="secondary" className="text-[11px] font-bold bg-background text-foreground">
              {currentAtsScore != null ? `${currentAtsScore}% Fit` : '—'}
            </Badge>
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              {targetJobTitle || "No Target Selected"}
            </h4>
            <p className="text-xs text-muted-foreground">
              {targetJobTitle 
                ? "Tailoring profile against live employer criteria" 
                : "Select a target job to calculate precise ATS fit & missing skills"}
            </p>
          </div>
          <Button 
            onClick={onOpenTargetJob}
            variant="outline" 
            size="sm" 
            className="w-full text-xs font-medium border-primary/30 hover:bg-primary/10 text-primary gap-1"
          >
            {targetJobTitle ? 'Change Target Job' : 'Select Target Job'}
            <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      </Card>

      {/* Live Preview Toggle Button */}
      <Button 
        onClick={onTogglePreview}
        variant={showPreview ? 'default' : 'outline'}
        className="w-full text-xs font-semibold gap-2 shadow-sm"
      >
        <Eye className="w-4 h-4" />
        {showPreview ? 'Hide Live Preview' : 'Show Live Resume Preview'}
      </Button>

      {/* Contextual Career Coach Actions */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4 border-b border-border/40 bg-muted/20">
          <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
            <Compass className="w-4 h-4 text-primary" />
            Your Next Best Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          {actions.length > 0 ? (
            actions.map((act) => (
              <div 
                key={act.id} 
                className="p-3 rounded-lg border border-border/60 bg-background hover:border-primary/40 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground line-clamp-1">{act.title}</span>
                  <Badge 
                    variant="outline" 
                    className={`text-[10px] uppercase font-bold ${
                      act.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-600 border-amber-500/30' :
                      act.priority === 'MEDIUM' ? 'bg-blue-500/10 text-blue-600 border-blue-500/30' :
                      'bg-muted text-muted-foreground'
                    }`}
                  >
                    {act.priority}
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{act.description}</p>
                <Button 
                  onClick={() => onExecuteAction(act)}
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 h-7 justify-between px-2"
                >
                  <span>{act.actionText}</span>
                  <Sparkles className="w-3 h-3" />
                </Button>
              </div>
            ))
          ) : (
            <div className="text-center py-6 px-4 space-y-2">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-xs font-medium text-foreground">Your profile is in top shape!</p>
              <p className="text-[11px] text-muted-foreground">All primary section requirements met for current target job.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
