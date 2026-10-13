import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { CompensationBenchmark } from '@/services/salary/salaryBenchmarkEngine';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  GraduationCap, 
  ArrowRight, 
  BookOpen, 
  FileText,
  Plus,
  X
} from 'lucide-react';

interface SkillsGapAnalyzerProps {
  benchmark: CompensationBenchmark;
  initialUserSkills?: string[];
  onNavigateTab: (tab: string) => void;
}

export const SkillsGapAnalyzer: React.FC<SkillsGapAnalyzerProps> = ({
  benchmark,
  initialUserSkills = [],
  onNavigateTab
}) => {
  const [userSkills, setUserSkills] = useState<string[]>(
    initialUserSkills.length > 0 ? initialUserSkills : ['JavaScript', 'React', 'SQL', 'Git']
  );
  const [newSkillInput, setNewSkillInput] = useState('');

  // Extract reference target requirements from benchmark
  const targetSkills = benchmark.topSkillsWithPremium.map(s => s.skill);

  // Compute matching and missing skills
  const lowerUserSkills = userSkills.map(s => s.toLowerCase().trim());
  const matchingSkills = benchmark.topSkillsWithPremium.filter(s =>
    lowerUserSkills.some(us => us.includes(s.skill.toLowerCase()) || s.skill.toLowerCase().includes(us))
  );

  const missingHighImpactSkills = benchmark.topSkillsWithPremium.filter(s =>
    !lowerUserSkills.some(us => us.includes(s.skill.toLowerCase()) || s.skill.toLowerCase().includes(us))
  );

  const matchScore = benchmark.topSkillsWithPremium.length > 0
    ? Math.round((matchingSkills.length / benchmark.topSkillsWithPremium.length) * 100)
    : 70;

  const handleAddSkill = () => {
    if (newSkillInput.trim() && !userSkills.includes(newSkillInput.trim())) {
      setUserSkills([...userSkills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setUserSkills(userSkills.filter(s => s !== skillToRemove));
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-500" />
                Skills Gap & Career Development Diagnostics
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Identify verified technical competencies that differentiate compensation tiers for {benchmark.normalizedRole}.
              </CardDescription>
            </div>
            <Badge variant="outline" className="self-start sm:self-auto font-mono text-xs">
              Role: {benchmark.normalizedRole}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* User Skills Inventory Input */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Your Current Skill Profile ({userSkills.length} Verified)
              </label>
              <span className="text-[11px] text-slate-400">Click &times; to remove</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {userSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 pt-1">
              <Input
                value={newSkillInput}
                onChange={(e) => setNewSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                placeholder="Add skill (e.g. Docker, Python, AWS)..."
                className="text-xs h-9 bg-white dark:bg-slate-900"
              />
              <Button size="sm" onClick={handleAddSkill} className="text-xs shrink-0 h-9">
                <Plus className="h-3.5 w-3.5 mr-1" /> Add Skill
              </Button>
            </div>
          </div>

          {/* Alignment Score Meter */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 w-full sm:w-2/3">
              <div className="flex justify-between text-xs text-slate-300">
                <span className="font-semibold">Target High-Value Skill Alignment</span>
                <span className="font-mono text-emerald-400 font-bold">{matchScore}% Match</span>
              </div>
              <Progress value={matchScore} className="h-2.5 bg-slate-800" />
              <p className="text-[11px] text-slate-400">
                You match {matchingSkills.length} of {benchmark.topSkillsWithPremium.length} top-tier premium market skills for this role.
              </p>
            </div>

            <div className="text-right shrink-0">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium text-xs">
                {missingHighImpactSkills.length} High-Impact Opportunities
              </Badge>
            </div>
          </div>

          {/* Missing High-Impact Skills Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Identified High-Value Skill Gaps & Recommended Learning Pathways
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missingHighImpactSkills.map((gap, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {gap.skill}
                      </span>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 font-mono text-[11px]">
                        +{gap.premiumPercentage}% Avg Premium
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Present in {gap.inSamplePercentage}% of upper-percentile job requirements for {benchmark.normalizedRole}. Demand rating: <strong>{gap.demandLevel}</strong>.
                    </p>
                  </div>

                  <a
                    href="https://learning.talentxcel.in/courses"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary text-primary transition-all text-center"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    Browse Course Pathways in Learning Hub
                  </a>
                </div>
              ))}

              {missingHighImpactSkills.length === 0 && (
                <div className="col-span-2 p-6 text-center rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 dark:text-emerald-200 text-xs font-medium">
                  🎉 Outstanding! Your skill inventory covers all primary high-premium technical requirements for this role.
                </div>
              )}
            </div>
          </div>

          {/* Practical Next Action Feed */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Update Your Professional Resume Evidence
                </h5>
                <p className="text-xs text-slate-500">
                  Highlight verified projects covering these skills in the TalentXcel Resume Builder.
                </p>
              </div>
            </div>

            <a
              href="https://resume.talentxcel.in/build"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all shrink-0 w-full sm:w-auto"
            >
              Open Resume Builder <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
