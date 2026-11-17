// src/components/conversion/RoleATSScannerWidget.tsx
// Above-the-fold PLG Conversion Widget for Resume Templates & ATS Check Hubs
// Role ATS scanner & live CV builder preview -> 1-Click Google OAuth gate for PDF export

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileCheck2, Sparkles, UploadCloud, CheckCircle2, AlertCircle, ArrowRight, Download, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface RoleATSScannerWidgetProps {
  roleName?: string;
  vendorName?: string;
  formatRegion?: string;
  className?: string;
}

export const RoleATSScannerWidget: React.FC<RoleATSScannerWidgetProps> = ({
  roleName = 'Software Engineer',
  vendorName = 'Workday',
  formatRegion = 'US Letter / Global Format',
  className = '',
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [simulatedScore, setSimulatedScore] = useState<number>(82);

  const keySkills = [
    'System Architecture',
    'CI/CD Automation',
    'Python & React',
    'Cloud Security',
    'REST APIs',
    'Agile Delivery'
  ];

  const handleStartScanOrExport = () => {
    if (user) {
      navigate(`/resume/ats-check?role=${encodeURIComponent(roleName)}`);
    } else {
      navigate(`/auth/login?redirect=${encodeURIComponent(window.location.pathname)}&intent=ats_export`);
    }
  };

  return (
    <Card className={`border-2 border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/40 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 shadow-md rounded-2xl overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 px-4 py-2 text-white flex items-center justify-between text-xs font-semibold">
        <span className="flex items-center gap-1.5">
          <FileCheck2 className="w-3.5 h-3.5 text-amber-300" />
          <span>{vendorName} ATS Compatibility Checker (2026 Engine)</span>
        </span>
        <Badge variant="outline" className="border-white/30 text-white bg-white/10 text-[10px]">
          {formatRegion}
        </Badge>
      </div>

      <CardContent className="p-5 sm:p-6 space-y-5">
        <div>
          <h3 className="text-lg font-extrabold text-foreground tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <span>Optimize Your CV for {roleName} Recruiter Screens</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Top enterprise ATS systems filter out 75% of applicants before human review. Test your resume against live keywords.
          </p>
        </div>

        {/* ATS Score Dial Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-foreground">Target ATS Match Benchmark:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                {simulatedScore}% Pass Rate
              </span>
            </div>
            <Progress value={simulatedScore} className="h-2.5 bg-slate-200 dark:bg-slate-700" />
            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Optimized for {vendorName}, Greenhouse, &amp; Taleo algorithms.</span>
            </p>
          </div>

          {/* Core Keywords Checklist */}
          <div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
              Top Scored Keywords for {roleName}:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {keySkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-white dark:bg-card border text-slate-700 dark:text-slate-300 shadow-2xs flex items-center gap-1"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-1 space-y-2">
          <Button
            onClick={handleStartScanOrExport}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs h-10 rounded-xl shadow-md gap-2"
          >
            {user ? (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Upload Resume &amp; Run 10-Second Scan</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Run Free ATS Scan &amp; Export Tailored CV (1-Click Google)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
          <div className="flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
            <span>Free forever for job seekers</span>
            <span>&bull;</span>
            <span>Zero watermark</span>
            <span>&bull;</span>
            <span>Instant PDF Download</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleATSScannerWidget;
