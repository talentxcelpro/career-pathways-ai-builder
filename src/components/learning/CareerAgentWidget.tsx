import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { careerAgentService, UserCareerContext, CuratedCareerAgentResponse } from '@/services/careerAgentService';
import { learningAggregatorService } from '@/services/learningAggregatorService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Bot, 
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
  Calendar,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Send
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

  const [promptInput, setPromptInput] = useState(initialPrompt || 'I am an HR professional. What should I learn to get into HR Analytics?');
  const [isPrivacyOptIn, setIsPrivacyOptIn] = useState(true);
  const [isReasoning, setIsReasoning] = useState(false);
  const [agentResult, setAgentResult] = useState<CuratedCareerAgentResponse | null>(null);

  // Construct context from user profile & passport
  const userContext: UserCareerContext = {
    fullName: userProfile?.full_name || 'Arshid Hussain Wani',
    currentRole: userProfile?.headline || userProfile?.title || 'Business Strategist & Growth Specialist',
    location: userProfile?.location || 'Noida • India',
    existingSkills: userProfile?.skills && userProfile.skills.length > 0 
      ? userProfile.skills 
      : ['Operations Strategy', 'Recruitment', 'Employee Relations', 'Excel Analytics', 'Project Execution'],
    privacyOptIn: isPrivacyOptIn
  };

  const handleCuratePlan = async (customPrompt?: string) => {
    const targetPrompt = customPrompt || promptInput;
    if (!targetPrompt.trim()) return;

    setIsReasoning(true);
    try {
      const result = await careerAgentService.curateCareerPlan(userContext, targetPrompt);
      setTimeout(() => {
        setAgentResult(result);
        setIsReasoning(false);
      }, 500);
    } catch (err) {
      console.warn("Career agent reasoning notice:", err);
      setIsReasoning(false);
    }
  };

  useEffect(() => {
    handleCuratePlan(promptInput);
  }, []);

  return (
    <Card className="rounded-3xl border border-purple-200 dark:border-purple-900/60 bg-white dark:bg-card shadow-lg overflow-hidden">
      
      {/* AGENT TOP HEADER BANNER - Warm User Wording */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/40 backdrop-blur-md flex items-center justify-center border border-purple-400/40 shadow-inner">
              <Bot className="h-6 w-6 text-purple-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold tracking-tight text-white">TalentXcel Career Advisor</h3>
                <Badge className="bg-purple-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full">
                  AI Career Guide ✨
                </Badge>
              </div>
              <p className="text-xs text-purple-200 font-medium">We matched 2,650+ free courses & verified jobs to your background</p>
            </div>
          </div>

          {/* PRIVACY TRANSPARENCY TOGGLE */}
          <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/10">
            <Lock className="h-3.5 w-3.5 text-purple-300" />
            <span className="text-[11px] text-purple-100 font-bold">Personalize with Passport</span>
            <Switch
              checked={isPrivacyOptIn}
              onCheckedChange={(val) => {
                setIsPrivacyOptIn(val);
                toast.info(val ? "Career Passport personalization enabled" : "Career Passport personalization disabled");
              }}
            />
          </div>
        </div>

        {/* PRIVACY TRANSPARENCY NOTICE */}
        <div className="flex items-center gap-2 text-[11px] font-semibold text-purple-200 bg-purple-950/50 p-2.5 rounded-xl border border-purple-800/40">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>{isPrivacyOptIn ? `Tailored to your verified skills & experience in your Career Passport` : 'Standard recommendation model'}</span>
        </div>
      </div>

      <CardContent className="p-6 space-y-6">
        
        {/* INTERACTIVE PROMPT INPUT BOX */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
              <BrainCircuit className="h-4 w-4 text-purple-600" />
              <span>Ask Your Career Advisor Anything</span>
            </label>
            <span className="text-[11px] text-muted-foreground font-semibold">Instant Advice ✨</span>
          </div>

          <div className="relative flex items-center">
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="e.g. 'I am an HR professional. What should I learn to get into HR analytics?'..."
              rows={2}
              className="w-full p-3.5 pr-32 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600 text-foreground resize-none"
            />
            <Button
              disabled={isReasoning}
              onClick={() => handleCuratePlan()}
              className="absolute right-3 rounded-xl h-9 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold shadow-sm gap-1 cursor-pointer"
            >
              {isReasoning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              <span>Find My Path 🚀</span>
            </Button>
          </div>

          {/* QUICK PROMPT CHIPS */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {[
              "I'm an HR professional. What should I learn for HR Analytics?",
              "Build me a 90-day plan for VP of Operations",
              "What skills am I missing for AI Engineering?",
              "Find free courses with certificates for my profile"
            ].map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setPromptInput(chip);
                  handleCuratePlan(chip);
                }}
                className="px-3 py-1 rounded-full bg-slate-100 dark:bg-muted hover:bg-purple-50 hover:text-purple-700 text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/80 dark:border-border cursor-pointer"
              >
                💡 {chip}
              </button>
            ))}
          </div>
        </div>

        {/* AGENT REASONING LOADER */}
        {isReasoning && (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 bg-purple-50/50 dark:bg-purple-950/20 rounded-2xl border border-purple-200/60">
            <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-extrabold text-purple-900 dark:text-purple-300">
              Matching your Career Passport skills with 2,650+ courses & 340+ jobs...
            </p>
          </div>
        )}

        {/* AGENT RESULT DISPLAY */}
        {!isReasoning && agentResult && (
          <div className="space-y-6">
            
            {/* AGENT MESSAGE SUMMARY */}
            <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-purple-700 dark:text-purple-300">
                <Sparkles className="h-4 w-4" />
                <span>Your Personalized Career Assessment</span>
              </div>
              <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
                {agentResult.agentMessage}
              </p>
            </div>

            {/* SKILL GAP AUDIT CARDS */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                <Target className="h-4 w-4 text-blue-600" />
                <span>Skills to Master for Your Target Role</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {agentResult.skillGaps.map((gap, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-200 dark:border-border/60 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-foreground">{gap.skillName}</span>
                      <Badge className={gap.gapSeverity === 'HIGH' ? 'bg-amber-100 text-amber-800 text-[9px] font-extrabold' : 'bg-emerald-100 text-emerald-800 text-[9px] font-extrabold'}>
                        {gap.gapSeverity === 'HIGH' ? 'Key Focus' : 'Targeted'}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">{gap.category}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RECOMMENDED LEARNING ROADMAP */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <span>Recommended Free Learning Roadmap</span>
                </h4>
                <span className="text-[11px] text-emerald-600 font-bold">100% Free Courses</span>
              </div>

              <div className="space-y-2.5">
                {agentResult.learningRoadmap.map((item) => (
                  <div key={item.stepNumber} className="p-4 rounded-2xl bg-white dark:bg-card border border-slate-200 dark:border-border shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
                        {item.stepNumber}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-extrabold text-foreground">{item.title}</h5>
                          <Badge variant="outline" className="text-[9px] font-bold">{item.durationText}</Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-medium">{item.reason}</p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={async () => {
                        const url = await learningAggregatorService.trackHandoff({
                          course_id: item.course.id,
                          provider_id: item.course.provider_id,
                          provider_name: item.course.provider_name,
                          source_url: item.course.source_url,
                          clicked_at: new Date().toISOString(),
                          source_page: 'career_agent_widget'
                        });
                        window.open(url, '_blank', 'noopener,noreferrer');
                      }}
                      className="rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-500 text-white gap-1 shadow-sm shrink-0 cursor-pointer"
                    >
                      <span>Start Course on {item.course.provider_name}</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* MATCHING TALENTXCEL JOBS WIDGET */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-400" />
                  <h4 className="text-sm font-extrabold">{agentResult.matchingJobsCount} Verified Jobs Match Your New Skills</h4>
                </div>
                <Badge className="bg-emerald-500 text-white font-extrabold text-[10px]">Job Ready</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {agentResult.matchingJobsList.map((job, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => navigate('/jobs')}
                    className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors cursor-pointer space-y-1 border border-white/10"
                  >
                    <div className="text-xs font-extrabold text-white">{job.title}</div>
                    <div className="text-[10px] text-slate-300 font-medium">{job.company}</div>
                    <div className="text-[10px] text-emerald-400 font-extrabold">{job.salary}</div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => navigate('/jobs')}
                className="w-full h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-extrabold shadow-sm gap-1 cursor-pointer"
              >
                <span>Explore Verified Jobs on TalentXcel</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

          </div>
        )}

      </CardContent>
    </Card>
  );
};
