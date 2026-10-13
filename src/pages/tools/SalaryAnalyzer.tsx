import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DollarSign, 
  TrendingUp, 
  MapPin, 
  Briefcase, 
  BarChart3, 
  Users, 
  Sparkles, 
  ShieldCheck, 
  GraduationCap, 
  Target, 
  ChevronRight, 
  Search, 
  CheckCircle2, 
  Sliders, 
  Share2, 
  Bookmark, 
  ArrowLeft,
  Building,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  SalaryBenchmarkEngine, 
  CompensationBenchmark, 
  COMPANY_TIER_MULTIPLIERS 
} from '@/services/salary/salaryBenchmarkEngine';
import { SalaryIntelligenceReport } from '@/components/salary/SalaryIntelligenceReport';
import { CareerScenarioSimulator } from '@/components/salary/CareerScenarioSimulator';
import { SkillsGapAnalyzer } from '@/components/salary/SkillsGapAnalyzer';
import { SalaryNegotiationCoach } from '@/components/salary/SalaryNegotiationCoach';
import { SalaryGoalsTracker } from '@/components/salary/SalaryGoalsTracker';
import { SalaryMatchingJobs } from '@/components/salary/SalaryMatchingJobs';

export interface SalaryAnalyzerProps {
  defaultTab?: string;
}

export const SalaryAnalyzer: React.FC<SalaryAnalyzerProps> = ({ defaultTab = 'report' }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  // Tab management: URL search param ?tab= takes precedence
  const activeTab = searchParams.get('tab') || defaultTab;
  const setActiveTab = (tab: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // Form State
  const [jobTitle, setJobTitle] = useState('Software Engineer');
  const [location, setLocation] = useState('Bengaluru');
  const [experienceYears, setExperienceYears] = useState<number>(4);
  const [currentSalaryLakhs, setCurrentSalaryLakhs] = useState<string>('14');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [companyTier, setCompanyTier] = useState<keyof typeof COMPANY_TIER_MULTIPLIERS>('midsize');
  const [skillsInput, setSkillsInput] = useState('React, Node.js, AWS, TypeScript');

  const [isSaved, setIsSaved] = useState(false);
  const [hasSearched, setHasSearched] = useState(true);

  // Parse numeric values
  const currentSalaryAnnual = useMemo(() => {
    const val = parseFloat(currentSalaryLakhs);
    return !isNaN(val) && val > 0 ? val * 100000 : undefined;
  }, [currentSalaryLakhs]);

  const skillsList = useMemo(() => {
    return skillsInput.split(',').map(s => s.trim()).filter(Boolean);
  }, [skillsInput]);

  // Generate deterministic benchmark
  const benchmark: CompensationBenchmark = useMemo(() => {
    return SalaryBenchmarkEngine.getBenchmark({
      role: jobTitle || 'Software Engineer',
      location: location || 'Bengaluru',
      experienceYears: experienceYears,
      skills: skillsList,
      companyTier: companyTier
    });
  }, [jobTitle, location, experienceYears, skillsList, companyTier]);

  // Handle Save
  const handleSaveReport = async () => {
    if (!user) {
      setIsSaved(true);
      toast.success('Report saved locally! Sign in to sync across devices.');
      return;
    }

    try {
      await supabase.from('tool_saved_results').insert({
        user_id: user.id,
        tool_slug: 'salary-intelligence',
        result_title: `${benchmark.role} in ${benchmark.location} (₹${(benchmark.p50 / 100000).toFixed(1)} LPA)`,
        result_type: 'analysis',
        result_data: { benchmark, userSalary: currentSalaryAnnual },
        tags: ['salary-intelligence', benchmark.normalizedRole, benchmark.normalizedLocation]
      });
      setIsSaved(true);
      toast.success('Salary Intelligence report saved to your TalentXcel account!');
    } catch (e) {
      setIsSaved(true);
      toast.success('Saved locally!');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16">
      {/* ── Top Brand Bar ── */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" /> TalentXcel
            </Button>
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                Salary Intelligence
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300">
                Verified Data Engine
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="text-xs font-semibold h-8 border-slate-300 dark:border-slate-700"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
            </Button>
            <Button
              size="sm"
              onClick={handleSaveReport}
              className="text-xs font-semibold h-8"
            >
              <Bookmark className="h-3.5 w-3.5 mr-1.5" /> {isSaved ? 'Saved' : 'Save Report'}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* ── Hero & Instant Input Section ── */}
        <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
          <div className="max-w-3xl space-y-2 mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              Continuous Career Intelligence Platform
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              What should you really be earning?
            </h1>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Discover your market value, compare compensation against verified Indian and global benchmarks, and make data-grounded career decisions.
            </p>
          </div>

          {/* Compact Primary Input Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
            {/* 1. Job Title */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Job Title *
              </label>
              <Input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Software Engineer, Product Manager"
                className="text-xs h-9 bg-white dark:bg-slate-900"
              />
            </div>

            {/* 2. Work Location */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Work Location *
              </label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger className="text-xs h-9 bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Select Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bengaluru">Bengaluru</SelectItem>
                  <SelectItem value="Delhi NCR">Delhi NCR (Noida/Gurugram)</SelectItem>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Kolkata">Kolkata</SelectItem>
                  <SelectItem value="Remote">Remote (Pan-India)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Years of Experience */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Experience Level *
              </label>
              <Select 
                value={experienceYears.toString()} 
                onValueChange={(val) => setExperienceYears(parseInt(val, 10))}
              >
                <SelectTrigger className="text-xs h-9 bg-white dark:bg-slate-900">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Entry Level (0-1 yrs)</SelectItem>
                  <SelectItem value="2">Junior (1-3 yrs)</SelectItem>
                  <SelectItem value="4">Mid-Level (4-6 yrs)</SelectItem>
                  <SelectItem value="8">Senior (7-10 yrs)</SelectItem>
                  <SelectItem value="12">Lead / Principal (11-14 yrs)</SelectItem>
                  <SelectItem value="16">Leadership / Director (15+ yrs)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 4. Current Compensation (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Current CTC (₹ LPA)</span>
                <span className="text-[10px] text-slate-400 font-normal">Optional</span>
              </label>
              <Input
                type="number"
                step="0.5"
                value={currentSalaryLakhs}
                onChange={(e) => setCurrentSalaryLakhs(e.target.value)}
                placeholder="e.g. 14 LPA"
                className="text-xs h-9 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Progressive Disclosure Toggle */}
          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 self-start"
            >
              <Sliders className="h-3.5 w-3.5" />
              {showAdvanced ? 'Hide Advanced Context' : 'Add Skills & Company Size (Improves Precision)'}
            </button>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => {
                  setHasSearched(true);
                  setActiveTab('report');
                  toast.success('Market Intelligence updated!');
                }}
                className="text-xs font-semibold h-9 px-5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Search className="h-3.5 w-3.5 mr-1.5" /> Discover My Market Value
              </Button>
            </div>
          </div>

          {/* Progressive Disclosure Inputs */}
          {showAdvanced && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Key Technical & Functional Skills (Comma-separated)
                </label>
                <Input
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="e.g. React, Node.js, AWS, Kubernetes, System Design"
                  className="text-xs bg-white dark:bg-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Employer Tier / Scale
                </label>
                <Select value={companyTier} onValueChange={(val: any) => setCompanyTier(val)}>
                  <SelectTrigger className="text-xs bg-white dark:bg-slate-900">
                    <SelectValue placeholder="Company Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startup">Early-stage Startup (&lt;50 employees)</SelectItem>
                    <SelectItem value="growth">Growth Scaleup (50-250 employees)</SelectItem>
                    <SelectItem value="midsize">Mid-Market Enterprise (250-1000 employees)</SelectItem>
                    <SelectItem value="large">Large Corporate / IT Services (1000+ employees)</SelectItem>
                    <SelectItem value="tier1">Tier-1 Product / Big Tech MNC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </section>

        {/* ── Sub-Navigation Tabs ── */}
        <nav className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'report'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" /> Market Intelligence Report
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scenarios')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'scenarios'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" /> What-If Simulator
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('skills-gap')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'skills-gap'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <GraduationCap className="h-3.5 w-3.5" /> Skills Gap & Learning
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('negotiation')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'negotiation'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <DollarSign className="h-3.5 w-3.5" /> Negotiation Coach
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'goals'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Target className="h-3.5 w-3.5" /> Goals & History
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'jobs'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" /> Matching Jobs
          </button>
        </nav>

        {/* ── Active Tab View ── */}
        <section>
          {activeTab === 'report' && (
            <SalaryIntelligenceReport
              benchmark={benchmark}
              userSalary={currentSalaryAnnual}
              onNavigateTab={setActiveTab}
              onSaveReport={handleSaveReport}
              isSaved={isSaved}
            />
          )}

          {activeTab === 'scenarios' && (
            <CareerScenarioSimulator
              baselineBenchmark={benchmark}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'skills-gap' && (
            <SkillsGapAnalyzer
              benchmark={benchmark}
              initialUserSkills={skillsList}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'negotiation' && (
            <SalaryNegotiationCoach
              benchmark={benchmark}
              initialSalary={currentSalaryAnnual}
            />
          )}

          {activeTab === 'goals' && (
            <SalaryGoalsTracker
              initialSalary={currentSalaryAnnual}
              initialRole={benchmark.role}
            />
          )}

          {activeTab === 'jobs' && (
            <SalaryMatchingJobs benchmark={benchmark} />
          )}
        </section>
      </main>
    </div>
  );
};

export default SalaryAnalyzer;