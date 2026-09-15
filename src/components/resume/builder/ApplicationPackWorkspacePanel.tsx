import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Package,
  Target,
  FileText,
  Linkedin,
  Search,
  ShieldCheck,
  MessageSquare,
  Download,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ApplicationPackWorkspacePanelProps {
  resumeData: any;
  targetJobTitle?: string;
  atsScore?: number | null;
  onSetTargetJob?: (title: string, desc: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

interface PackItem {
  id: string;
  label: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
  icon: React.ReactNode;
  preview?: string;
}

export const ApplicationPackWorkspacePanel: React.FC<ApplicationPackWorkspacePanelProps> = ({
  resumeData,
  targetJobTitle,
  atsScore,
  onSetTargetJob,
  onNavigateToTab
}) => {
  const [localTargetJob, setLocalTargetJob] = useState(targetJobTitle || '');
  const [localJobDesc, setLocalJobDesc] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [packGenerated, setPackGenerated] = useState(false);
  const [packItems, setPackItems] = useState<PackItem[]>([]);

  const fullName = resumeData?.personalInfo?.fullName;
  const topSkills = (resumeData?.skills || []).slice(0, 4).map((s: any) => typeof s === 'string' ? s : s.name).join(', ');
  const topProject = resumeData?.projects?.[0]?.name;
  const primaryRole = resumeData?.experience?.[0]?.title || 'Professional';

  const hasCareerData = !!resumeData?.personalInfo?.fullName;
  const hasTargetJob = !!(localTargetJob || targetJobTitle);

  const handleGeneratePack = async () => {
    if (!hasCareerData) {
      toast.error('Add your career information in the MY CAREER tab first.');
      return;
    }
    if (!localTargetJob) {
      toast.error('Enter a target job title to generate your Application Pack.');
      return;
    }

    setIsGenerating(true);
    if (onSetTargetJob) onSetTargetJob(localTargetJob, localJobDesc);

    const items: PackItem[] = [
      { id: 'targeted-resume', label: 'Targeted Resume', icon: <FileText className="w-4 h-4 text-primary" />, status: 'generating' },
      { id: 'cover-letter', label: 'Cover Letter', icon: <FileText className="w-4 h-4 text-emerald-500" />, status: 'pending' },
      { id: 'linkedin-headline', label: 'LinkedIn Headline', icon: <Linkedin className="w-4 h-4 text-blue-600" />, status: 'pending' },
      { id: 'linkedin-about', label: 'LinkedIn About Section', icon: <Linkedin className="w-4 h-4 text-blue-600" />, status: 'pending' },
      { id: 'naukri-headline', label: 'Naukri.com Headline', icon: <Search className="w-4 h-4 text-emerald-600" />, status: 'pending' },
      { id: 'naukri-skills', label: 'Naukri Key Skills', icon: <Search className="w-4 h-4 text-emerald-600" />, status: 'pending' },
      { id: 'ats-report', label: 'ATS Match Report', icon: <Target className="w-4 h-4 text-amber-500" />, status: 'pending' },
      { id: 'evidence-report', label: 'Evidence Gap Report', icon: <ShieldCheck className="w-4 h-4 text-blue-500" />, status: 'pending' },
      { id: 'interview-prep', label: 'Interview Cheat Sheet', icon: <MessageSquare className="w-4 h-4 text-purple-500" />, status: 'pending' },
    ];
    setPackItems(items);

    // Simulate sequential generation
    for (let i = 0; i < items.length; i++) {
      await new Promise(r => setTimeout(r, 400));
      setPackItems(prev => prev.map((item, idx) => ({
        ...item,
        status: idx < i ? 'ready' : idx === i ? 'generating' : 'pending'
      })));
    }

    await new Promise(r => setTimeout(r, 400));
    setPackItems(prev => prev.map(item => ({ ...item, status: 'ready' })));
    setIsGenerating(false);
    setPackGenerated(true);
    toast.success(`Application Pack generated for "${localTargetJob}"`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <Package className="w-5 h-5 text-emerald-600" />
            <div>
              <CardTitle className="text-base font-bold text-foreground">1-Click Application Pack</CardTitle>
              <p className="text-xs text-muted-foreground">Generate your complete job application package from one place — resume, cover letter, LinkedIn, Naukri, ATS report, and interview prep</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold">
            Complete Package
          </Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Career Identity Check */}
          {!hasCareerData ? (
            <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs">
                <p className="font-bold text-amber-800 dark:text-amber-300">Career Identity Required</p>
                <p className="text-muted-foreground">Your Master Career Identity is empty. Add your personal information, experience, and skills in the MY CAREER tab first.</p>
                <Button
                  onClick={() => onNavigateToTab?.('profile')}
                  size="sm"
                  variant="outline"
                  className="h-7 text-xs mt-1 border-amber-400 text-amber-800"
                >
                  Go to My Career
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                Career Identity: {fullName} — {(resumeData?.experience || []).length} roles · {(resumeData?.skills || []).length} skills · {(resumeData?.projects || []).length} projects
              </span>
            </div>
          )}

          {/* Target Job Input */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Target Job Title</label>
            <Input
              placeholder="e.g. Senior React Developer, Engineering Manager, Financial Controller..."
              value={localTargetJob}
              onChange={(e) => setLocalTargetJob(e.target.value)}
              className="h-9 text-sm bg-background"
            />
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Job Description (optional, improves ATS match accuracy)</label>
              <Textarea
                placeholder="Paste the job description here for precise ATS matching and cover letter alignment..."
                value={localJobDesc}
                onChange={(e) => setLocalJobDesc(e.target.value)}
                rows={4}
                className="text-xs bg-background resize-none"
              />
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGeneratePack}
            disabled={isGenerating || !hasCareerData || !localTargetJob}
            className="w-full text-sm font-bold gap-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm h-10"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'Generating Application Pack...' : 'Generate Complete Application Pack'}
          </Button>
        </CardContent>
      </Card>

      {/* Pack Items Progress */}
      {packItems.length > 0 && (
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-foreground">
                Application Pack for &quot;{localTargetJob || targetJobTitle}&quot;
              </CardTitle>
              {packGenerated && (
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30 text-xs font-bold">
                  Ready
                </Badge>
              )}
            </div>
            {isGenerating && (
              <Progress
                value={(packItems.filter(i => i.status === 'ready').length / packItems.length) * 100}
                className="h-1.5 mt-2"
              />
            )}
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {packItems.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs ${
                    item.status === 'ready'
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : item.status === 'generating'
                      ? 'border-primary/30 bg-primary/5 animate-pulse'
                      : 'border-border/40 bg-muted/10 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {item.icon}
                    <span className="font-semibold text-foreground">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status === 'ready' && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <Button
                          onClick={() => {
                            const tabMap: Record<string, string> = {
                              'targeted-resume': 'target',
                              'cover-letter': 'coverletter',
                              'linkedin-headline': 'linkedin',
                              'linkedin-about': 'linkedin',
                              'naukri-headline': 'naukri',
                              'naukri-skills': 'naukri',
                              'ats-report': 'ats',
                              'evidence-report': 'evidence',
                              'interview-prep': 'interview',
                            };
                            onNavigateToTab?.(tabMap[item.id] || 'profile');
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-primary gap-1 font-semibold"
                        >
                          View <ChevronRight className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                    {item.status === 'generating' && (
                      <span className="text-primary text-[10px] font-semibold animate-pulse">Generating...</span>
                    )}
                    {item.status === 'pending' && (
                      <span className="text-muted-foreground text-[10px]">Queued</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {packGenerated && (
              <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-3">
                <Button
                  onClick={() => toast.info('Full package download coming soon')}
                  className="flex-1 h-9 text-xs font-bold gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Full Package
                </Button>
                <Button
                  onClick={() => toast.info('Package preview available within each workspace tab')}
                  variant="outline"
                  className="flex-1 h-9 text-xs font-bold gap-2"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Preview Everything
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State — No Target Job */}
      {!hasTargetJob && !packGenerated && packItems.length === 0 && hasCareerData && (
        <div className="text-center py-10 text-muted-foreground space-y-2">
          <Target className="w-10 h-10 mx-auto opacity-30" />
          <p className="text-sm font-semibold">Select a target job to generate your complete application package.</p>
          <p className="text-xs">Enter a job title above and click Generate to create your tailored resume, cover letter, LinkedIn optimization, ATS report, and interview cheat sheet in one go.</p>
        </div>
      )}
    </div>
  );
};
