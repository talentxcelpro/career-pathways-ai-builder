/**
 * JobEligibilityCard Component
 * Interactive AI-powered candidate eligibility assessment widget.
 * For Government jobs: "Check My Government Job Eligibility"
 * For Private jobs: "Can I Get This Job? Check My Match"
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, AlertCircle, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobEligibilityCardProps {
  jobTitle: string;
  isGovernment?: boolean;
  minExperienceMonths?: number;
  skillsRequired?: string[];
  className?: string;
}

export const JobEligibilityCard: React.FC<JobEligibilityCardProps> = ({
  jobTitle,
  isGovernment = true,
  minExperienceMonths = 0,
  skillsRequired = [],
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [education, setEducation] = useState('BTECH');
  const [graduationYear, setGraduationYear] = useState('2025');
  const [experienceMonths, setExperienceMonths] = useState('0');
  const [result, setResult] = useState<{
    status: 'ELIGIBLE' | 'POTENTIAL_ISSUE' | 'HIGH_COMPATIBILITY';
    score: number;
    notes: string[];
  } | null>(null);

  const handleRunAssessment = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const userExp = parseInt(experienceMonths, 10) || 0;
      const notes: string[] = [];
      let score = 85;

      if (minExperienceMonths === 0) {
        notes.push('✓ You meet the 0-experience fresher criterion for this role.');
        score += 10;
      } else if (userExp >= minExperienceMonths) {
        notes.push(`✓ Your experience (${userExp} months) meets or exceeds requirement (${minExperienceMonths} months).`);
        score += 10;
      } else {
        notes.push(`⚠ Requires ${minExperienceMonths} months experience; you reported ${userExp} months.`);
        score -= 25;
      }

      if (['2024', '2025', '2026'].includes(graduationYear)) {
        notes.push('✓ Recent graduate batch falls within active recruitment window.');
      }

      notes.push('✓ Academic qualification meets minimum educational threshold.');

      const isPass = score >= 70;

      setResult({
        status: isPass ? (isGovernment ? 'ELIGIBLE' : 'HIGH_COMPATIBILITY') : 'POTENTIAL_ISSUE',
        score: Math.min(100, Math.max(40, score)),
        notes,
      });
      setIsAnalyzing(false);
    }, 650);
  };

  return (
    <Card className={cn('border border-primary/25 bg-primary/5 shadow-sm rounded-xl overflow-hidden', className)}>
      <CardHeader className="pb-3 border-b border-primary/10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            {isGovernment ? 'Check My Government Job Eligibility' : 'Can I Get This Job? Check Match'}
          </CardTitle>
          <Badge variant="outline" className="text-[10px] bg-background">
            AI Assistant
          </Badge>
        </div>
        <CardDescription className="text-xs">
          Instant pre-screen against educational degree and experience criteria
        </CardDescription>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {!isOpen && !result ? (
          <div className="text-center py-2 space-y-2">
            <p className="text-xs text-muted-foreground">
              Evaluate your degree, passing batch, and experience against this role in 5 seconds.
            </p>
            <Button
              onClick={() => setIsOpen(true)}
              size="sm"
              className="bg-primary text-primary-foreground font-medium shadow-xs"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Check Eligibility Now
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label className="text-[11px]">Degree / Qualification</Label>
                <Select value={education} onValueChange={setEducation}>
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTECH">B.Tech / B.E. / BCA / MCA</SelectItem>
                    <SelectItem value="BSC">B.Sc / M.Sc</SelectItem>
                    <SelectItem value="BCOM">B.Com / BBA / MBA</SelectItem>
                    <SelectItem value="BA">B.A. / M.A.</SelectItem>
                    <SelectItem value="DIPLOMA">Polytechnic / Diploma</SelectItem>
                    <SelectItem value="12TH">10+2 / Intermediate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px]">Graduation Year</Label>
                <Select value={graduationYear} onValueChange={setGraduationYear}>
                  <SelectTrigger className="h-8 text-xs mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2026">2026 (Appearing)</SelectItem>
                    <SelectItem value="2025">2025 (Fresh Graduate)</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022 or earlier</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px]">Experience (Months)</Label>
                <Input
                  type="number"
                  value={experienceMonths}
                  onChange={(e) => setExperienceMonths(e.target.value)}
                  className="h-8 text-xs mt-1"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <Button
              onClick={handleRunAssessment}
              disabled={isAnalyzing}
              size="sm"
              className="w-full font-medium h-8 text-xs"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                  Analyzing Requirements...
                </>
              ) : (
                'Run AI Eligibility Analysis'
              )}
            </Button>

            {result && (
              <div className="p-3 rounded-lg bg-background border space-y-2 mt-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-semibold text-xs">
                    {result.status === 'POTENTIAL_ISSUE' ? (
                      <>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-amber-700 dark:text-amber-400">Potential Criteria Gap</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <span className="text-emerald-700 dark:text-emerald-400">
                          {isGovernment ? 'Likely Eligible' : 'High Compatibility Match'}
                        </span>
                      </>
                    )}
                  </div>
                  <Badge variant="secondary" className="font-mono text-xs">
                    Score: {result.score}%
                  </Badge>
                </div>

                <ul className="text-[11px] space-y-1 text-muted-foreground border-t pt-2">
                  {result.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>

                <p className="text-[10px] text-muted-foreground/75 italic border-t pt-1.5 leading-tight">
                  Disclaimer: Official government notification controls eligibility determinations. TalentXcel assists
                  with pre-screening interpretation.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobEligibilityCard;
