import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CompensationBenchmark, 
  SalaryBenchmarkEngine, 
  COMPANY_TIER_MULTIPLIERS,
  CareerScenarioComparison 
} from '@/services/salary/salaryBenchmarkEngine';
import { 
  TrendingUp, 
  ArrowRight, 
  Building, 
  MapPin, 
  Award, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface CareerScenarioSimulatorProps {
  baselineBenchmark: CompensationBenchmark;
  onNavigateTab: (tab: string) => void;
}

export const CareerScenarioSimulator: React.FC<CareerScenarioSimulatorProps> = ({
  baselineBenchmark,
  onNavigateTab
}) => {
  const [targetSeniority, setTargetSeniority] = useState<'junior' | 'mid' | 'senior' | 'lead' | 'executive'>(
    baselineBenchmark.seniorityTier === 'entry' ? 'junior' :
    baselineBenchmark.seniorityTier === 'junior' ? 'mid' :
    baselineBenchmark.seniorityTier === 'mid' ? 'senior' :
    baselineBenchmark.seniorityTier === 'senior' ? 'lead' : 'executive'
  );

  const [targetLocation, setTargetLocation] = useState<string>(
    baselineBenchmark.normalizedLocation.toLowerCase().includes('bengaluru') ? 'Delhi NCR' : 'Bengaluru'
  );

  const [targetCompanyTier, setTargetCompanyTier] = useState<keyof typeof COMPANY_TIER_MULTIPLIERS>('large');

  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    baselineBenchmark.topSkillsWithPremium.slice(0, 2).map(s => s.skill)
  );

  // Compute simulation
  const scenarioResult: CareerScenarioComparison = SalaryBenchmarkEngine.simulateScenario(
    baselineBenchmark,
    {
      targetSeniorityTier: targetSeniority,
      targetLocation: targetLocation,
      targetCompanyTier: targetCompanyTier,
      addedSkills: selectedSkills
    }
  );

  const formatLakhs = (amount: number): string => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} LPA`;
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-500" />
                Career What-If Compensation Simulator
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Model realistic compensation trajectories by adjusting seniority, geography, employer tier, and skill additions.
              </CardDescription>
            </div>
            <Badge variant="outline" className="self-start sm:self-auto text-xs font-mono">
              Baseline: {baselineBenchmark.normalizedRole} ({formatLakhs(baselineBenchmark.p50)})
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            {/* Target Seniority */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Seniority
              </label>
              <Select value={targetSeniority} onValueChange={(val: any) => setTargetSeniority(val)}>
                <SelectTrigger className="text-xs bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select Seniority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior (1-3 yrs)</SelectItem>
                  <SelectItem value="mid">Mid-Level (4-6 yrs)</SelectItem>
                  <SelectItem value="senior">Senior (7-10 yrs)</SelectItem>
                  <SelectItem value="lead">Lead / Principal (11-14 yrs)</SelectItem>
                  <SelectItem value="executive">Leadership / Director (15+ yrs)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Location */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Target Location
              </label>
              <Select value={targetLocation} onValueChange={setTargetLocation}>
                <SelectTrigger className="text-xs bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                  <SelectItem value="Delhi NCR">Delhi NCR (Gurugram/Noida)</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Kolkata">Kolkata</SelectItem>
                  <SelectItem value="Remote">Remote (Pan-India)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Target Employer Tier */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Employer Tier
              </label>
              <Select value={targetCompanyTier} onValueChange={(val: any) => setTargetCompanyTier(val)}>
                <SelectTrigger className="text-xs bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select Employer Tier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startup">Early-stage Startup</SelectItem>
                  <SelectItem value="growth">Growth Scaleup</SelectItem>
                  <SelectItem value="midsize">Mid-Market Enterprise</SelectItem>
                  <SelectItem value="large">Large Enterprise / Corporate</SelectItem>
                  <SelectItem value="tier1">Tier-1 Product / Big Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Add Skills Toggle Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              Incorporate High-Value Skill Premiums:
            </label>
            <div className="flex flex-wrap gap-2">
              {baselineBenchmark.topSkillsWithPremium.map((s, idx) => {
                const isSelected = selectedSkills.includes(s.skill);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleSkill(s.skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary/50'
                    }`}
                  >
                    {s.skill} (+{s.premiumPercentage}%)
                  </button>
                );
              })}
            </div>
          </div>

          {/* Simulation Output Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white shadow-lg space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div>
                <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  Estimated Scenario Potential
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-1">
                  {formatLakhs(scenarioResult.targetSalary)}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  vs Current Baseline: {formatLakhs(scenarioResult.baselineSalary)}
                </p>
              </div>

              <div className="text-left sm:text-right">
                <Badge 
                  className={`text-sm px-3.5 py-1 font-mono ${
                    scenarioResult.percentageDifference >= 0
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {scenarioResult.percentageDifference >= 0 ? `+${scenarioResult.percentageDifference}% Expected Upside` : `${scenarioResult.percentageDifference}% Difference`}
                </Badge>
                <div className="text-xs text-slate-400 mt-1">
                  Delta: {formatLakhs(Math.abs(scenarioResult.absoluteDifference))} / yr
                </div>
              </div>
            </div>

            {/* Assumptions & Trade-offs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <h5 className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  Key Scenario Drivers
                </h5>
                <ul className="space-y-1.5 text-slate-300">
                  {scenarioResult.assumptions.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-primary">•</span> {item}
                    </li>
                  ))}
                  <li className="flex items-start gap-1.5">
                    <span className="text-primary">•</span> Reflects {COMPANY_TIER_MULTIPLIERS[targetCompanyTier].label}.
                  </li>
                </ul>
              </div>

              <div className="space-y-2 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                <h5 className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                  <AlertCircle className="h-4 w-4 text-amber-400" />
                  Trade-offs & Considerations
                </h5>
                <ul className="space-y-1.5 text-slate-300">
                  {scenarioResult.tradeOffs.length > 0 ? (
                    scenarioResult.tradeOffs.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-400">•</span> {item}
                      </li>
                    ))
                  ) : (
                    <li className="text-slate-400">Standard market execution expectations.</li>
                  )}
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400">•</span> Higher compensation tiers involve intensified multi-round architectural and behavioral evaluations.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Link to Learning */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-slate-500">
              Want to prepare for this scenario? Review high-impact curriculum pathways in TalentXcel Learning Hub.
            </p>
            <Button
              size="sm"
              onClick={() => onNavigateTab('skills-gap')}
              className="w-full sm:w-auto text-xs font-semibold"
            >
              Analyze Skills Gap for This Role <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
