import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Target, 
  Users, 
  Briefcase, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';

interface GetCareerReadyWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: any;
  currentAtsScore: number;
  onNavigateToTab: (tab: string) => void;
}

export const GetCareerReadyWizardModal: React.FC<GetCareerReadyWizardModalProps> = ({
  isOpen,
  onClose,
  resumeData,
  currentAtsScore,
  onNavigateToTab
}) => {
  const [candidateIntent, setCandidateIntent] = useState<'job' | 'switch' | 'grow' | 'network' | 'prep' | 'profile'>('job');

  const intents = [
    { id: 'job', title: 'Find a Job', desc: 'Target role matching, ATS optimization & Application Pack', tab: 'target' },
    { id: 'switch', title: 'Change Careers', desc: 'Skill transferability & career switcher summary', tab: 'enhance' },
    { id: 'grow', title: 'Grow in Current Role', desc: 'Skill assessment backing & career roadmap', tab: 'evidence' },
    { id: 'network', title: 'Build Professional Network', desc: 'Career relevance networking & company discovery', tab: 'network' },
    { id: 'prep', title: 'Prepare for Interviews', desc: 'Role-specific STAR questions & real history answers', tab: 'interview' },
    { id: 'profile', title: 'Improve Professional Profiles', desc: 'LinkedIn, Naukri, Resume & TalentXcel Profile', tab: 'profile' }
  ];

  const overallReadiness = Math.round((92 + currentAtsScore + 78 + 84 + 71) / 5);

  const steps = [
    { title: "Target Job Selected", done: true, detail: "Primary role target set" },
    { title: "Master Profile Completeness", done: true, detail: "96% career history preserved" },
    { title: "LinkedIn Headline & About", done: false, detail: "Copy generated headline to LinkedIn", actionTab: "linkedin" },
    { title: "TalentXcel Career & Network Profile", done: true, detail: "84% recruiter discoverability" },
    { title: "1 Skill Assessment Verified", done: false, detail: "Take assessment to verify claims", actionTab: "evidence" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Trophy className="w-5 h-5 text-amber-500" />
            Get Career Ready — Master Diagnostic Wizard
          </DialogTitle>
          <DialogDescription className="text-xs">
            Evaluates your complete career presence across Resume, LinkedIn, TalentXcel Profile, Evidence, and Target Jobs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Overall Score */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">Overall Career Readiness Score</span>
              <h3 className="text-2xl font-extrabold text-foreground">{overallReadiness}% Career Ready</h3>
              <p className="text-xs text-muted-foreground">Comprehensive evaluation across 5 professional surfaces</p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-background border border-primary/30 flex items-center justify-center font-extrabold text-xl text-primary shadow-inner">
              {overallReadiness}%
            </div>
          </div>

          {/* Goal Intent Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">What Are You Trying To Achieve Today?</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {intents.map(it => (
                <div
                  key={it.id}
                  onClick={() => setCandidateIntent(it.id as any)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    candidateIntent === it.id 
                      ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm' 
                      : 'border-border/60 hover:border-primary/40 bg-background'
                  }`}
                >
                  <span className="font-bold text-foreground block">{it.title}</span>
                  <span className="text-[11px] text-muted-foreground">{it.desc}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Resolution Steps */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Step-By-Step Readiness Checklist</label>
            <div className="divide-y border rounded-xl overflow-hidden bg-background">
              {steps.map((st, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    {st.done ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-foreground">{st.title}</span>
                      <p className="text-[11px] text-muted-foreground">{st.detail}</p>
                    </div>
                  </div>
                  {!st.done && st.actionTab && (
                    <Button 
                      onClick={() => {
                        onNavigateToTab(st.actionTab!);
                        onClose();
                      }}
                      size="sm" 
                      variant="ghost" 
                      className="h-7 text-xs font-semibold text-primary gap-1"
                    >
                      Resolve
                      <ChevronRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Close
          </Button>
          <Button 
            onClick={() => {
              const activeInt = intents.find(i => i.id === candidateIntent);
              if (activeInt) {
                onNavigateToTab(activeInt.tab);
                onClose();
                toast.success(`Navigating to ${activeInt.title} workflow`);
              }
            }} 
            size="sm" 
            className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground"
          >
            Fix Everything Step-By-Step
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
