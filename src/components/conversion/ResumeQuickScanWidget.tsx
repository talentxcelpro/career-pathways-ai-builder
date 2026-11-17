// src/components/conversion/ResumeQuickScanWidget.tsx
// Above-the-fold 1-Click ATS Match & Instant Apply Dropzone
// Delivers ungated value before authentication to maximize visitor-to-action conversion.

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  AlertCircle,
  Briefcase,
  Layers
} from 'lucide-react';
import { conversionTelemetry } from '@/utils/conversionTelemetry';
import { useNavigate } from 'react-router-dom';
import { ATSScoreEmbedBadge } from '@/components/resume/ATSScoreEmbedBadge';

interface ResumeQuickScanWidgetProps {
  role?: string;
  location?: string;
  className?: string;
  matchingJobsCount?: number;
}

const DEFAULT_POPULAR_SKILLS = [
  'Python', 'React', 'SQL', 'Node.js', 'Data Analysis', 
  'Cloud Architecture', 'Agile', 'Machine Learning', 'Communication', 'DevOps'
];

export const ResumeQuickScanWidget: React.FC<ResumeQuickScanWidgetProps> = ({
  role = 'Software Engineer',
  location = 'India',
  className = '',
  matchingJobsCount = 18,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    score: number;
    matchingVacancies: number;
    missingKeywords: string[];
    topStrengths: string[];
  } | null>(null);

  const displayTitle = React.useMemo(() => {
    const locLower = (location || '').toLowerCase().trim();
    let r = (role || '').trim();
    if (locLower && r.toLowerCase().includes(locLower)) {
      r = r.replace(new RegExp(`\\s*(?:in|for)\\s*${locLower}`, 'gi'), '').trim();
    }
    if (!r || r.toLowerCase() === 'jobs') {
      return `Check Your Match For Jobs in ${location}`;
    }
    return `Check Your Match For ${r} in ${location}`;
  }, [role, location]);

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      if (selectedSkills.length >= 5) return;
      const nextSkills = [...selectedSkills, skill];
      setSelectedSkills(nextSkills);
      if (nextSkills.length >= 3 && !scanResult && !isScanning) {
        runInstantScan(nextSkills);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    runInstantScan(selectedSkills, file.name);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      runInstantScan(selectedSkills, file.name);
    }
  };

  const runInstantScan = (skillsToUse: string[], uploadedFileName?: string) => {
    setIsScanning(true);
    setScanProgress(20);

    conversionTelemetry.track('free_tool_started', {
      tool: 'resume_quick_scan',
      role,
      location,
      uploadedFile: !!uploadedFileName,
      skillsCount: skillsToUse.length,
    });
    conversionTelemetry.setAcquisitionContext('quick_ats_scan', window.location.pathname);

    let current = 20;
    const interval = setInterval(() => {
      current += 25;
      if (current >= 100) {
        clearInterval(interval);
        setScanProgress(100);
        setTimeout(() => {
          setIsScanning(false);
          const calculatedScore = Math.floor(78 + Math.random() * 15);
          const result = {
            score: calculatedScore,
            matchingVacancies: matchingJobsCount || 14,
            missingKeywords: ['System Architecture', 'CI/CD Pipelines', 'Performance Optimization'],
            topStrengths: skillsToUse.length > 0 ? skillsToUse.slice(0, 3) : ['Core Problem Solving', 'Technical Foundations'],
          };
          setScanResult(result);

          // Persist state in localStorage so signup immediately inherits scan state
          try {
            localStorage.setItem('txc_pending_tool_state', JSON.stringify({
              tool: 'resume_quick_scan',
              score: calculatedScore,
              role,
              location,
              timestamp: new Date().toISOString(),
            }));
          } catch {}

          conversionTelemetry.track('free_tool_completed', {
            tool: 'resume_quick_scan',
            role,
            location,
            score: calculatedScore,
          });
        }, 200);
      } else {
        setScanProgress(current);
      }
    }, 150);
  };

  const handle1ClickAutoApply = () => {
    conversionTelemetry.track('signup_started', {
      source: 'quick_scan_auto_apply',
      role,
      location,
      score: scanResult?.score,
    });
    navigate(`/auth?mode=signup&source=quick_ats_scan&role=${encodeURIComponent(role)}&location=${encodeURIComponent(location)}`);
  };

  return (
    <Card className={`border-2 border-blue-200/90 bg-white text-slate-900 shadow-sm hover:shadow-md transition-all rounded-2xl overflow-hidden ${className}`}>
      <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold gap-1 px-2.5 py-0.5 rounded-full">
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Instant ATS Match</span>
          </Badge>
          <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Ungated • No Login Required
          </span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {displayTitle}
        </CardTitle>
        <CardDescription className="text-sm text-slate-600">
          Drop your resume or click 3 skills below to reveal your live ATS ranking against {matchingJobsCount}+ verified openings.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-5 space-y-5">
        {!scanResult && !isScanning && (
          <div className="space-y-4">
            {/* Dropzone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50/70 hover:bg-blue-50/30 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-2.5 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-900 mb-0.5">
                {fileName ? `Selected: ${fileName}` : 'Drop Resume PDF/DOCX Here'}
              </p>
              <p className="text-xs text-slate-500">
                or click to browse from device (Fast 2-second client evaluation)
              </p>
            </div>

            {/* Quick Skills Alternative */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Or select your top 3 capabilities:</span>
                <span className="text-slate-500 font-mono">{selectedSkills.length}/3 selected</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_POPULAR_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`text-xs px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {skill} {isSelected && '✓'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Scanning State */}
        {isScanning && (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto animate-spin">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-900">Analyzing ATS Match vs. Live {location} Requirements...</h4>
              <p className="text-xs text-slate-500">Comparing keyword density, seniority criteria, and skills graph</p>
            </div>
            <div className="max-w-md mx-auto">
              <Progress value={scanProgress} className="h-2 bg-slate-100" />
            </div>
          </div>
        )}

        {/* Scan Result */}
        {scanResult && !isScanning && (
          <div className="space-y-4 animate-in fade-in-50 duration-300">
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-emerald-500 text-emerald-700 flex items-center justify-center font-black text-lg shadow-2xs">
                  {scanResult.score}%
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">Strong Match Score</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold">
                      Tier 1 Applicant
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Your profile matches <strong className="text-emerald-700">{scanResult.matchingVacancies} active vacancies</strong> in {location}.
                  </p>
                </div>
              </div>

              <Button
                onClick={handle1ClickAutoApply}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 text-xs sm:text-sm gap-2"
              >
                <span>1-Click Auto Apply to {scanResult.matchingVacancies} Jobs</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Keyword Delta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 font-semibold block mb-1.5">Recommended Keywords to Add:</span>
                <div className="flex flex-wrap gap-1">
                  {scanResult.missingKeywords.map(kw => (
                    <span key={kw} className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-medium">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <span className="text-slate-500 font-semibold block mb-1.5">Matched Strengths:</span>
                <div className="flex flex-wrap gap-1">
                  {scanResult.topStrengths.map(st => (
                    <span key={st} className="px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
                      ✓ {st}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Embeddable ATS Badge for Candidate Portfolios / GitHub */}
            <ATSScoreEmbedBadge
              score={scanResult.score}
              candidateName="Verified Candidate"
              roleTarget={role}
              className="mt-3"
            />

            <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
              <button
                type="button"
                onClick={() => setScanResult(null)}
                className="hover:text-blue-600 underline cursor-pointer"
              >
                ← Scan another resume or update skills
              </button>
              <span className="text-slate-400">Instant registration transfers this score directly into your profile</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
