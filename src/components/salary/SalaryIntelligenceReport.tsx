import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CompensationBenchmark, 
  InHandBreakdown, 
  SalaryBenchmarkEngine 
} from '@/services/salary/salaryBenchmarkEngine';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  MapPin, 
  Briefcase, 
  ShieldCheck, 
  Info, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Calculator, 
  Building, 
  HelpCircle,
  FileText,
  GraduationCap
} from 'lucide-react';

interface SalaryIntelligenceReportProps {
  benchmark: CompensationBenchmark;
  userSalary?: number;
  onNavigateTab: (tab: string) => void;
  onSaveReport?: () => void;
  isSaved?: boolean;
}

export const SalaryIntelligenceReport: React.FC<SalaryIntelligenceReportProps> = ({
  benchmark,
  userSalary,
  onNavigateTab,
  onSaveReport,
  isSaved = false
}) => {
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');
  const [showInHandDetails, setShowInHandDetails] = useState(false);

  // Calculate user percentile if reported salary is provided
  const percentileData = userSalary && userSalary > 0
    ? SalaryBenchmarkEngine.calculatePercentile(userSalary, benchmark)
    : null;

  // In-hand breakdown based on median benchmark or user's salary
  const activeSalaryForInHand = userSalary && userSalary > 0 ? userSalary : benchmark.p50;
  const inHandData: InHandBreakdown = SalaryBenchmarkEngine.calculateInHandBreakdown(activeSalaryForInHand);

  const formatLakhs = (amount: number): string => {
    if (!amount) return '₹0';
    if (viewMode === 'monthly') {
      const monthly = Math.round(amount / 12);
      if (monthly >= 100000) {
        return `₹${(monthly / 100000).toFixed(2)}L/mo`;
      }
      return `₹${(monthly / 1000).toFixed(0)}K/mo`;
    }
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)} LPA`;
  };

  const formatInrFull = (amount: number): string => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="space-y-6">
      {/* ── Executive Summary Header ── */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30 font-medium">
                  {benchmark.confidenceLevel} Confidence Benchmark
                </Badge>
                <Badge variant="outline" className="bg-slate-800 text-slate-300 border-slate-700">
                  {benchmark.observationPeriod}
                </Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                {benchmark.role}
              </h2>
              <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                {benchmark.location} • {benchmark.experienceYears} Years Exp ({benchmark.seniorityTier.toUpperCase()} TIER)
              </p>
            </div>

            {/* Toggle Annual vs Monthly */}
            <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl self-start md:self-auto">
              <button
                type="button"
                onClick={() => setViewMode('annual')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'annual'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Annual CTC
              </button>
              <button
                type="button"
                onClick={() => setViewMode('monthly')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'monthly'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Monthly Breakdown
              </button>
            </div>
          </div>

          {/* Primary Median & Range Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-1">
              <span className="text-xs font-semibold tracking-wider uppercase text-slate-400">
                Market Median Benchmark (P50)
              </span>
              <div className="text-4xl md:text-5xl font-black text-emerald-400 tracking-tight">
                {formatLakhs(benchmark.p50)}
              </div>
              <p className="text-xs text-slate-400">
                {viewMode === 'annual' ? 'Gross Annual CTC' : 'Average Monthly Equivalent'}
              </p>
            </div>

            <div className="md:col-span-2 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-4 md:p-5">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Lower Band (P10): <strong className="text-slate-200">{formatLakhs(benchmark.p10)}</strong></span>
                <span>Upper Band (P90): <strong className="text-slate-200">{formatLakhs(benchmark.p90)}</strong></span>
              </div>
              
              {/* Distribution Range Bar */}
              <div className="relative w-full h-4 bg-slate-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-slate-700/60" style={{ width: '25%' }} title="P10 - P25" />
                <div className="h-full bg-emerald-600/70" style={{ width: '50%' }} title="Core Market Band (P25 - P75)" />
                <div className="h-full bg-indigo-600/70" style={{ width: '25%' }} title="P75 - P90" />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
                <span>25th Percentile: {formatLakhs(benchmark.p25)}</span>
                <span className="text-emerald-400 font-semibold">Median (P50): {formatLakhs(benchmark.p50)}</span>
                <span>75th Percentile: {formatLakhs(benchmark.p75)}</span>
              </div>
            </div>
          </div>

          {/* Executive Summary Narrative */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/20 text-primary shrink-0 mt-0.5">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>Empirical Assessment:</strong> {percentileData ? percentileData.description : `Compensation for ${benchmark.normalizedRole} in ${benchmark.normalizedLocation} centers around ${formatLakhs(benchmark.p50)}, with top performers capturing up to ${formatLakhs(benchmark.p90)}.`}
              </p>
            </div>

            {onSaveReport && (
              <Button
                variant={isSaved ? "secondary" : "outline"}
                size="sm"
                onClick={onSaveReport}
                className="shrink-0 text-xs font-semibold border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-200"
              >
                {isSaved ? '✓ Saved to Dashboard' : 'Save Report'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── User's Market Percentile Card (if user provided compensation) ── */}
      {percentileData && (
        <Card className="border-l-4 border-l-emerald-500 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Your Market Percentile Positioning
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Calculated against {benchmark.sampleSize.toLocaleString('en-IN')} verified observations in comparable cohorts.
                </CardDescription>
              </div>
              <Badge className="text-sm px-3 py-1 font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {percentileData.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
                <span>Reported: {formatInrFull(userSalary!)} / yr</span>
                <span>{percentileData.percentile}% of Market Earns Less</span>
              </div>
              <Progress value={percentileData.percentile} className="h-3" />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
              {percentileData.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── CTC Structure vs Monthly In-Hand Estimation ── */}
      <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                CTC Breakdown & Estimated Monthly In-Hand (India)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Understand how gross annual compensation converts into actual bank payout under statutory Indian structures.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInHandDetails(!showInHandDetails)}
              className="text-xs text-primary font-semibold self-start sm:self-auto"
            >
              {showInHandDetails ? 'Hide Component Details' : 'View Full Deductions Breakdown'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold uppercase text-slate-500">Gross Annual CTC</span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {formatInrFull(inHandData.annualGrossCtc)}
              </div>
              <span className="text-[11px] text-slate-400">Total Employer Cost</span>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
              <span className="text-[11px] font-semibold uppercase text-emerald-700 dark:text-emerald-400">Est. Monthly In-Hand</span>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-300 mt-1">
                {formatInrFull(inHandData.estimatedMonthlyNet)}
              </div>
              <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">Net Direct Bank Credit</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold uppercase text-slate-500">Monthly Basic Pay</span>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
                {formatInrFull(inHandData.monthlyBaseSalary)}
              </div>
              <span className="text-[11px] text-slate-400">40% of CTC Baseline</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold uppercase text-slate-500">Monthly PF + Tax Deductions</span>
              <div className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {formatInrFull(inHandData.monthlyEmployeePf + inHandData.monthlyEstimatedTds + inHandData.monthlyProfessionalTax)}
              </div>
              <span className="text-[11px] text-slate-400">PF + Prof Tax + Est. TDS</span>
            </div>
          </div>

          {/* Detailed breakdown expandable table */}
          {showInHandDetails && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    Earnings Components (Monthly)
                  </h4>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Basic Salary</span>
                    <span className="font-semibold">{formatInrFull(inHandData.monthlyBaseSalary)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">House Rent Allowance (HRA)</span>
                    <span className="font-semibold">{formatInrFull(inHandData.monthlyHra)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">Special Allowances</span>
                    <span className="font-semibold">{formatInrFull(inHandData.monthlySpecialAllowance)}</span>
                  </div>
                </div>

                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-[11px]">
                    Statutory Deductions (Monthly)
                  </h4>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Employee PF (12%)</span>
                    <span className="font-semibold text-rose-600">-{formatInrFull(inHandData.monthlyEmployeePf)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">Professional Tax (PT)</span>
                    <span className="font-semibold text-rose-600">-{formatInrFull(inHandData.monthlyProfessionalTax)}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">Income Tax (Estimated TDS New Regime)</span>
                    <span className="font-semibold text-rose-600">-{formatInrFull(inHandData.monthlyEstimatedTds)}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 italic mt-2">
                * {inHandData.disclaimer}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── High Value Skills Premium & Location Differentials ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skills Premium */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              High-Impact Skills & Market Premium
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Skills observed to command measurable compensation differentials in verified job listings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {benchmark.topSkillsWithPremium.map((skillItem, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {skillItem.skill}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Demand: {skillItem.demandLevel} • In {skillItem.inSamplePercentage}% of job specs
                    </span>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300 font-mono text-xs">
                    +{skillItem.premiumPercentage}% Premium
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('skills-gap')}
              className="w-full mt-4 text-xs font-semibold"
            >
              Run Personalized Skills Gap Diagnostics <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </CardContent>
        </Card>

        {/* Location Comparison */}
        <Card className="border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <MapPin className="h-5 w-5 text-indigo-500" />
              Indian Tech Hub Geographic Differentials
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Median compensation variance relative to your benchmark location.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {benchmark.locationDifferentials.map((locDiff, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                      {locDiff.city}
                    </div>
                    <span className="text-[11px] text-slate-500">
                      Median: {formatLakhs(locDiff.medianSalary)}
                    </span>
                  </div>
                  <Badge 
                    variant="outline"
                    className={`font-mono text-xs ${
                      locDiff.differencePercentage > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                        : locDiff.differencePercentage < 0
                        ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-400'
                        : 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {locDiff.differencePercentage > 0 ? `+${locDiff.differencePercentage}%` : `${locDiff.differencePercentage}%`}
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('scenarios')}
              className="w-full mt-4 text-xs font-semibold"
            >
              Simulate City Relocation in What-If Engine <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Provenance & Methodology Transparency Card ── */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 shrink-0">
                <Info className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  Transparent Data Provenance & Methodology
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {benchmark.confidenceReason} Source: <strong>{benchmark.dataSource}</strong>. Observation window: <strong>{benchmark.observationPeriod}</strong>. Percentiles reflect empirical distributions calculated without fabricated extrapolations.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-500">Methodology v2.4</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Action Feed / Next Steps Ecosystem Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" onClick={() => onNavigateTab('scenarios')}>
          <CardContent className="p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
              <TrendingUp className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Career What-If Simulator</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore how acquiring leadership skills, changing cities, or switching company tiers shifts your earning capacity.
            </p>
            <div className="text-xs font-semibold text-primary flex items-center gap-1 pt-1">
              Launch Simulator <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" onClick={() => onNavigateTab('negotiation')}>
          <CardContent className="p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <DollarSign className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Salary Negotiation Coach</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Generate data-grounded talking points, counter-offer messages, and practice negotiation responses with AI coach.
            </p>
            <div className="text-xs font-semibold text-primary flex items-center gap-1 pt-1">
              Prepare Negotiation <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" onClick={() => onNavigateTab('jobs')}>
          <CardContent className="p-5 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
              <Briefcase className="h-4 w-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Matching Verified Jobs</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Explore live open vacancies in {benchmark.normalizedLocation} matching this compensation tier with direct application links.
            </p>
            <div className="text-xs font-semibold text-primary flex items-center gap-1 pt-1">
              View Active Jobs <ArrowRight className="h-3 w-3" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
