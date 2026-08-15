import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

interface LinkedInOptimizerPanelProps {
  resumeData: any;
  targetJobTitle?: string;
}

export const LinkedInOptimizerPanel: React.FC<LinkedInOptimizerPanelProps> = ({
  resumeData,
  targetJobTitle
}) => {
  const [selectedHeadline, setSelectedHeadline] = useState(0);

  const fullName = resumeData?.personalInfo?.fullName || "Professional";
  const primaryRole = targetJobTitle || resumeData?.experience?.[0]?.title || "Full Stack Engineer";
  const topSkills = (resumeData?.skills || []).slice(0, 4).map((s: any) => typeof s === 'string' ? s : s.name).join(' | ');

  // Dynamic Score Calculation from canonical resumeData — no hardcoded metrics
  const hasName = !!resumeData?.personalInfo?.fullName;
  const hasSummary = (resumeData?.personalInfo?.summary || '').length > 80;
  const skillCount = (resumeData?.skills || []).length;
  const expCount = (resumeData?.experience || []).length;

  const headlineScore = hasName && skillCount >= 3 ? Math.min(98, 60 + skillCount * 3 + (targetJobTitle ? 15 : 0)) : 40;
  const aboutScore = hasSummary ? Math.min(95, 50 + Math.round((resumeData?.personalInfo?.summary?.length || 0) / 10)) : 30;
  const expScore = expCount > 0 ? Math.min(95, 50 + expCount * 12) : 20;
  const skillsScore = skillCount === 0 ? 0 : Math.min(100, Math.round((skillCount / 15) * 100));
  const keywordsScore = Math.round((headlineScore + aboutScore + skillsScore) / 3);
  const overallLinkedinScore = Math.round((headlineScore + aboutScore + expScore + skillsScore + keywordsScore) / 5);

  const tenureYearsText = resumeData?.experience?.length 
    ? `${resumeData.experience.length * 2}+ Years Operational Impact`
    : 'Proven Academic & Project Execution';

  const headlines = [
    `${primaryRole} | ${topSkills || 'Key Tech Stack'} | Scaled Mission-Critical Systems`,
    `Results-Driven ${primaryRole} specializing in ${topSkills || 'Core Skills'} | ${tenureYearsText}`,
    `Strategic ${primaryRole} | ${topSkills || 'Key Competencies'} | Driving Scalable Engineering & Process Efficiency`
  ];

  const linkedinAbout = `Accomplished ${primaryRole} with extensive experience driving technical architecture, operational resilience, and high-stakes execution.

Key Expertise:
• ${topSkills || 'Core Technical & Leadership Competencies'}
• Team Leadership & Cross-Functional Collaboration
• Scalable Systems & Process Optimization

${resumeData?.personalInfo?.summary || 'Proven track record of delivering end-to-end solutions that elevate business performance.'} Always open to connecting with fellow leaders and industry innovators.`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <Card className="border-border/60 shadow-sm mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            in
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">LinkedIn Profile Optimizer</CardTitle>
            <p className="text-xs text-muted-foreground">Reputation &amp; Social Scanning Surface derived from Master Career Identity</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30 text-xs font-semibold">
          Score: {overallLinkedinScore}%
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Dynamic Score Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="p-2.5 rounded-lg border bg-background space-y-1">
            <span className="text-[11px] text-muted-foreground">Headline</span>
            <p className="font-bold text-emerald-600">{headlineScore}%</p>
          </div>
          <div className="p-2.5 rounded-lg border bg-background space-y-1">
            <span className="text-[11px] text-muted-foreground">About</span>
            <p className="font-bold text-blue-600">{aboutScore}%</p>
          </div>
          <div className="p-2.5 rounded-lg border bg-background space-y-1">
            <span className="text-[11px] text-muted-foreground">Experience</span>
            <p className="font-bold text-emerald-600">{expScore}%</p>
          </div>
          <div className="p-2.5 rounded-lg border bg-background space-y-1">
            <span className="text-[11px] text-muted-foreground">Skills</span>
            <p className="font-bold text-purple-600">{skillsScore}%</p>
          </div>
          <div className="p-2.5 rounded-lg border bg-background space-y-1">
            <span className="text-[11px] text-muted-foreground">Keywords</span>
            <p className="font-bold text-amber-600">{keywordsScore}%</p>
          </div>
        </div>

        {/* Headline Optimizer */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Optimized LinkedIn Headline Alternatives</label>
          <div className="space-y-2">
            {headlines.map((hl, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedHeadline(idx)}
                className={`p-3 rounded-xl border text-xs leading-relaxed cursor-pointer flex items-center justify-between gap-3 ${
                  selectedHeadline === idx 
                    ? 'border-blue-500 bg-blue-500/5 ring-1 ring-blue-500' 
                    : 'border-border/60 hover:border-blue-500/40 bg-background'
                }`}
              >
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px]">Option {idx + 1}</Badge>
                  <p className="font-semibold text-foreground">{hl}</p>
                </div>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(hl, `Headline Option ${idx + 1}`);
                  }} 
                  size="sm" 
                  variant="ghost" 
                  className="h-7 text-xs gap-1 shrink-0 text-blue-600"
                >
                  <Copy className="w-3 h-3" />
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* LinkedIn About Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Formatted LinkedIn About Summary</label>
            <Button 
              onClick={() => copyToClipboard(linkedinAbout, "LinkedIn About Summary")} 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs font-semibold gap-1 border-blue-400 text-blue-700"
            >
              <Copy className="w-3 h-3" />
              Copy About Section
            </Button>
          </div>
          <Textarea value={linkedinAbout} readOnly rows={6} className="text-xs leading-relaxed bg-background" />
        </div>
      </CardContent>
    </Card>
  );
};
