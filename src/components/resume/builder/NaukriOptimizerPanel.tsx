import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, Sparkles, Flag, Search } from 'lucide-react';
import { toast } from 'sonner';

interface NaukriOptimizerPanelProps {
  resumeData: any;
  targetJobTitle?: string;
}

export const NaukriOptimizerPanel: React.FC<NaukriOptimizerPanelProps> = ({
  resumeData,
  targetJobTitle
}) => {
  const primaryRole = targetJobTitle || resumeData?.experience?.[0]?.title || "Full Stack Developer";
  const rawSkills = (resumeData?.skills || []).slice(0, 10).map((s: any) => typeof s === 'string' ? s : s.name);
  const naukriSkillsString = rawSkills.join(', ');

  const naukriHeadline = `${primaryRole} - ${rawSkills.slice(0, 5).join(', ')} | ${resumeData?.experience?.length || 1} Roles | Immediate Joiner`;

  // Compute Recruiter Visibility dynamically (no hardcoded 92%)
  const hasSummary = (resumeData?.personalInfo?.summary || '').length > 50;
  const skillCount = rawSkills.length;
  const recruiterVisibilityScore = Math.min(98, (hasSummary ? 40 : 10) + Math.min(50, skillCount * 5) + (targetJobTitle ? 10 : 0));

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied for Naukri.com!`);
  };

  return (
    <Card className="border-border/60 shadow-sm mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-border/40 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
            N
          </div>
          <div>
            <CardTitle className="text-base font-bold text-foreground">Naukri.com Profile Optimizer (India Market)</CardTitle>
            <p className="text-xs text-muted-foreground">Optimized for Indian recruiter search algorithms &amp; candidate match ranking</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-xs font-semibold">
          Recruiter Visibility: {recruiterVisibilityScore}%
        </Badge>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Naukri Resume Headline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Naukri Resume Headline (250 Chars Max)</label>
            <Button 
              onClick={() => copyToClipboard(naukriHeadline, "Naukri Headline")} 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs font-semibold gap-1 border-emerald-400 text-emerald-700"
            >
              <Copy className="w-3 h-3" />
              Copy Headline
            </Button>
          </div>
          <Input value={naukriHeadline} readOnly className="text-xs font-semibold bg-background" />
        </div>

        {/* Key Skills Tag String */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Naukri Key Skills String (Comma Separated)</label>
            <Button 
              onClick={() => copyToClipboard(naukriSkillsString, "Naukri Key Skills")} 
              size="sm" 
              variant="outline" 
              className="h-7 text-xs font-semibold gap-1 border-emerald-400 text-emerald-700"
            >
              <Copy className="w-3 h-3" />
              Copy Skills String
            </Button>
          </div>
          <Textarea value={naukriSkillsString} readOnly rows={2} className="text-xs bg-background" />
        </div>

        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-xs text-muted-foreground space-y-1">
          <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Naukri Recruiter Search Tip
          </span>
          <p>Update your Naukri profile summary and key skills string at least once every 7 days to trigger Naukri&apos;s &quot;Recently Active&quot; recruiter priority boost.</p>
        </div>
      </CardContent>
    </Card>
  );
};
