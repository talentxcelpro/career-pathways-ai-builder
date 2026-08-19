import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { weightedCareerService, WeightedCareer } from '@/data/weightedCareerGraphData';
import { learningAggregatorService } from '@/services/learningAggregatorService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  Sparkles, 
  ShieldCheck, 
  Briefcase, 
  Target, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Lock, 
  BrainCircuit, 
  Zap, 
  Compass,
  Rocket,
  BookOpen,
  Check,
  Circle,
  Award
} from 'lucide-react';

interface CareerAgentWidgetProps {
  userProfile?: {
    full_name?: string;
    headline?: string;
    title?: string;
    location?: string;
    skills?: string[];
  };
  initialPrompt?: string;
}

export const CareerAgentWidget: React.FC<CareerAgentWidgetProps> = ({ userProfile, initialPrompt = '' }) => {
  const navigate = useNavigate();

  const [intentInput, setIntentInput] = useState(initialPrompt || 'I want to become a Financial Analyst');
  const [isPassportEnabled, setIsPassportEnabled] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeCareerPlan, setActiveCareerPlan] = useState<WeightedCareer | null>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);

  // User existing profile skills from Career Passport
  const userExistingSkills = userProfile?.skills && userProfile.skills.length > 0 
    ? userProfile.skills 
    : ['Excel', 'Business Operations', 'Reporting', 'Data Analysis', 'Project Execution'];

  const handleAnalyzeIntent = async (customText?: string) => {
    const targetText = customText || intentInput;
    if (!targetText.trim()) return;

    setIsAnalyzing(true);
    
    // Resolve weighted career graph model
    const career = weightedCareerService.getCareerByIntent(targetText);
    setActiveCareerPlan(career);

    // Fetch verified courses matching career skills from DB
    try {
      const courses = await learningAggregatorService.getCourses({
        domain: career.domain
      });
      setRecommendedCourses(courses.slice(0, 3));
    } catch {
      // Fallback
    }

    setTimeout(() => {
      setIsAnalyzing(false);
    }, 200);
  };

  useEffect(() => {
    handleAnalyzeIntent(intentInput);
  }, []);

  const alignment = activeCareerPlan 
    ? weightedCareerService.calculateUserAlignment(activeCareerPlan, userExistingSkills)
    : { matchPercentage: 62, userSkillsFound: ['Excel', 'Business Operations', 'Reporting'], missingSkills: [] };

  return (
    <Card className="rounded-3xl border border-slate-200 dark:border-border bg-white dark:bg-card shadow-md overflow-hidden space-y-0">
      
      {/* 1. HERO HEADER: "What do you want to become?" */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 space-y-4 relative overflow-hidden">
        
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 backdrop-blur-md flex items-center justify-center border border-blue-400/30 shrink-0">
              <Compass className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">TalentXcel Career Navigation Engine</h3>
              <p className="text-xs text-slate-300 font-medium">Tell us what you want to become. We'll map your skills & learning path.</p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setIsPassportEnabled(!isPassportEnabled);
              toast.info(isPassportEnabled ? "Career Passport Unlinked" : "Career Passport Linked for Personalization");
            }}
            className={`rounded-xl text-xs font-extrabold gap-1.5 cursor-pointer ${
              isPassportEnabled 
                ? 'bg-blue-600/30 text-blue-200 border-blue-400/40 hover:bg-blue-600/40' 
                : 'bg-white/10 text-slate-300 border-white/20'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{isPassportEnabled ? 'Career Passport Linked' : 'Use my Career Passport'}</span>
          </Button>
        </div>

        {/* Hero Intent Input Form */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full">
            <Target className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
            <Input
              type="text"
              placeholder="What do you want to become? (e.g. Financial Analyst, Hotel Manager, HR Specialist...)"
              value={intentInput}
              onChange={(e) => setIntentInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeIntent()}
              className="pl-11 h-12 rounded-2xl bg-white/10 text-white placeholder:text-slate-400 border-white/20 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={() => handleAnalyzeIntent()}
            disabled={isAnalyzing}
            className="h-12 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shrink-0 cursor-pointer shadow-md gap-1.5"
          >
            {isAnalyzing ? (
              <>
                <BrainCircuit className="h-4 w-4 animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <span>Analyze Career Plan</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        {/* Quick Intent Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-slate-400 font-bold">Quick Examples:</span>
          {[
            'I want to become a Financial Analyst',
            'I want to become a Hotel Manager',
            'I have 12 yrs HR exp, want HR Analytics',
            'I want to become a Healthcare Admin'
          ].map((pill, idx) => (
            <button
              key={idx}
              onClick={() => {
                setIntentInput(pill);
                handleAnalyzeIntent(pill);
              }}
              className="text-[11px] font-bold px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-200 transition-colors cursor-pointer border border-white/10"
            >
              {pill}
            </button>
          ))}
        </div>

      </div>

      {/* 2. CAREER PLAN RESULT BREAKDOWN */}
      {activeCareerPlan && (
        <CardContent className="p-6 space-y-6 bg-slate-50/50 dark:bg-muted/10">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-border">
            <div>
              <div className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                YOUR CAREER PLAN • {activeCareerPlan.industry}
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {activeCareerPlan.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                {activeCareerPlan.description}
              </p>
            </div>

            {/* Weighted Match Percentage Progress Bar */}
            <div className="bg-white dark:bg-card p-4 rounded-2xl border border-slate-200 dark:border-border text-center shrink-0 min-w-[200px] shadow-2xs">
              <div className="text-xs font-black text-slate-700 dark:text-slate-200 mb-1">
                Current Profile Alignment
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-200 dark:bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${alignment.matchPercentage}%` }}
                  ></div>
                </div>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                  {alignment.matchPercentage}%
                </span>
              </div>
            </div>
          </div>

          {/* 3. SKILL BREAKDOWN: You Have vs Gaps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* You Already Have */}
            <div className="bg-white dark:bg-card p-5 rounded-2xl border border-slate-200 dark:border-border shadow-2xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> You Already Have
              </h4>
              <ul className="space-y-2">
                {alignment.userSkillsFound.length > 0 ? (
                  alignment.userSkillsFound.map((sk, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-200">
                      <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>{sk}</span>
                    </li>
                  ))
                ) : (
                  <li className="text-xs text-slate-500 font-medium">No overlapping skills found yet.</li>
                )}
              </ul>
            </div>

            {/* Your Skill Gaps */}
            <div className="bg-white dark:bg-card p-5 rounded-2xl border border-slate-200 dark:border-border shadow-2xs space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <Circle className="h-4 w-4 fill-amber-100 text-amber-600" /> Your Skill Gaps
              </h4>
              <ul className="space-y-2">
                {alignment.missingSkills.map((sk, idx) => (
                  <li key={idx} className="flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <Circle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span>{sk.name}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-extrabold border-amber-200 text-amber-700 bg-amber-50">
                      {sk.weight}% Weight
                    </Badge>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* 4. RECOMMENDED VERIFIED LEARNING & TALENTXCEL JOBS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            
            {/* Recommended Learning */}
            <div className="bg-white dark:bg-card p-5 rounded-2xl border border-slate-200 dark:border-border shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" /> Recommended Verified Learning
                </h4>
                <Link to="/learning/courses" className="text-[11px] font-bold text-blue-600 hover:underline">
                  View All →
                </Link>
              </div>

              <div className="space-y-2">
                {recommendedCourses.length > 0 ? (
                  recommendedCourses.map((c, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border flex items-center justify-between text-xs font-extrabold">
                      <div>
                        <div className="text-slate-900 dark:text-white line-clamp-1">{c.title}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">{c.provider_name}</div>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-800 text-[9px] font-extrabold shrink-0">
                        Verified
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-muted/40 text-xs text-slate-500 font-medium">
                    1. Financial Statement Analysis — Microsoft Learn<br />
                    2. Accounting Fundamentals — Corporate Finance Institute<br />
                    3. DCF Valuation & Modeling — CFA Institute
                  </div>
                )}
              </div>

              <Button
                asChild
                size="sm"
                className="w-full rounded-xl text-xs font-extrabold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer mt-2"
              >
                <Link to={`/learning/careers/${activeCareerPlan.slug}`}>
                  View Complete Pathway <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </div>

            {/* TalentXcel Jobs Connection */}
            <div className="bg-white dark:bg-card p-5 rounded-2xl border border-slate-200 dark:border-border shadow-2xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4" /> Related TalentXcel Jobs
                </h4>
                <div className="text-3xl font-black text-slate-900 dark:text-white">
                  {activeCareerPlan.matching_job_count}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Verified job openings on TalentXcel matching this career profile and your current skill alignment.
                </p>
              </div>

              <Button
                onClick={() => navigate('/public/jobs')}
                size="sm"
                variant="outline"
                className="w-full rounded-xl text-xs font-extrabold border-purple-200 text-purple-700 hover:bg-purple-50 cursor-pointer"
              >
                Explore Matching Jobs →
              </Button>
            </div>

          </div>

        </CardContent>
      )}

    </Card>
  );
};
