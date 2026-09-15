import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Copy, 
  FileText, 
  Layers, 
  ArrowRight 
} from 'lucide-react';
import { toast } from 'sonner';

interface TargetedResumeItem {
  id: string;
  targetJobTitle: string;
  targetCompany?: string;
  createdAt: string;
  matchScore: number;
}

interface TargetJobTailoringPanelProps {
  currentMasterResume: any;
  onGenerateTargetedResume: (targetJobTitle: string, jobDescription?: string) => void;
  targetedResumes?: TargetedResumeItem[];
}

export const TargetJobTailoringPanel: React.FC<TargetJobTailoringPanelProps> = ({
  currentMasterResume,
  onGenerateTargetedResume,
  targetedResumes = []
}) => {
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [presetTarget, setPresetTarget] = useState<string | null>(null);

  const presetJobs = [
    { title: "Senior React / Full-Stack Engineer", mustHave: ["React", "TypeScript", "Node.js", "Express", "MongoDB"] },
    { title: "Data Center Critical Facilities Manager", mustHave: ["Data Center", "LVAP", "HVAP", "M&E", "UPS", "HVAC"] },
    { title: "Vice President - Growth & Operations", mustHave: ["Growth Strategy", "P&L Management", "M&A", "Revenue Operations"] },
    { title: "Enterprise Account Executive (SaaS Sales)", mustHave: ["Enterprise Sales", "B2B SaaS", "Salesforce", "Quota Attainment"] },
    { title: "Senior Financial Controller (CPA / SAP)", mustHave: ["Financial Accounting", "Statutory Audit", "SAP ERP", "SOX Compliance", "CPA"] }
  ];

  const handleSelectPreset = (title: string) => {
    setPresetTarget(title);
    setTargetJobTitle(title);
  };

  const handleGenerate = () => {
    const jobTitle = targetJobTitle.trim() || presetTarget || 'Targeted Position';
    onGenerateTargetedResume(jobTitle, jobDescription || undefined);
    toast.success(`Generated Targeted Resume for "${jobTitle}" from Master Career Identity`);
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <div>
              <CardTitle className="text-base font-bold text-foreground">Target Job & 1-Click Resume Tailoring</CardTitle>
              <p className="text-xs text-muted-foreground">Generate job-specific targeted resumes from your Master Career Identity without mutating your master profile</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
            Master Profile Safe
          </Badge>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Preset Targets */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase">Popular Target Job Presets</label>
            <div className="flex flex-wrap gap-2">
              {presetJobs.map((pj, idx) => (
                <Button
                  key={idx}
                  type="button"
                  variant={presetTarget === pj.title ? 'default' : 'outline'}
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => handleSelectPreset(pj.title)}
                >
                  {pj.title}
                </Button>
              ))}
            </div>
          </div>

          {/* Target Form */}
          <div className="space-y-4 p-4 rounded-xl border border-border/60 bg-muted/10">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Target Job Title *</label>
              <Input 
                placeholder="e.g. Senior React Developer, Sales Director, Financial Controller"
                value={targetJobTitle}
                onChange={(e) => {
                  setTargetJobTitle(e.target.value);
                  setPresetTarget(null);
                }}
                className="text-xs bg-background"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Job Description or Requirements (Optional)</label>
              <Textarea 
                placeholder="Paste the employer's job description to extract required skills and calculate precise ATS match..."
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="text-xs bg-background"
              />
            </div>

            <Button 
              onClick={handleGenerate}
              disabled={!targetJobTitle.trim() && !presetTarget}
              className="w-full text-xs font-bold gap-2 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
            >
              <Sparkles className="w-4 h-4" />
              Generate Targeted Resume for {targetJobTitle || presetTarget || 'Target Job'}
            </Button>
          </div>

          {/* Generated Targeted Resumes List */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Generated Targeted Resumes</h4>
            {targetedResumes.length > 0 ? (
              <div className="space-y-2.5">
                {targetedResumes.map((tr) => (
                  <div key={tr.id} className="p-3.5 rounded-xl border border-border/60 bg-background flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <span className="font-bold text-foreground">{tr.targetJobTitle}</span>
                        <p className="text-[11px] text-muted-foreground">Generated from Master Identity • {tr.createdAt}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                        {tr.matchScore}% ATS Fit
                      </Badge>
                      <Button 
                        onClick={() => {
                          const targetedData = {
                            ...currentMasterResume,
                            personalInfo: {
                              ...currentMasterResume?.personalInfo,
                              summary: `Targeted for ${tr.targetJobTitle}: ${currentMasterResume?.personalInfo?.summary || ''}`
                            }
                          };
                          toast.success(`Exporting targeted PDF for "${tr.targetJobTitle}"`);
                          import('@/services/resumeExportService').then(m => m.exportToPDF(targetedData));
                        }} 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs font-semibold text-emerald-700 border-emerald-400 gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        PDF
                      </Button>
                      <Button 
                        onClick={() => {
                          const targetedData = {
                            ...currentMasterResume,
                            personalInfo: {
                              ...currentMasterResume?.personalInfo,
                              summary: `Targeted for ${tr.targetJobTitle}: ${currentMasterResume?.personalInfo?.summary || ''}`
                            }
                          };
                          toast.success(`Exporting targeted DOCX for "${tr.targetJobTitle}"`);
                          import('@/services/resumeExportService').then(m => m.exportToDOCX(targetedData));
                        }} 
                        size="sm" 
                        variant="outline" 
                        className="h-7 text-xs font-semibold text-blue-700 border-blue-400 gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        DOCX
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed rounded-xl space-y-1">
                <Layers className="w-8 h-8 text-muted-foreground/40 mx-auto" />
                <p className="text-xs font-semibold text-foreground">No targeted resumes generated yet</p>
                <p className="text-[11px] text-muted-foreground">Select a target job above to create your first job-specific resume without modifying your Master Profile.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
