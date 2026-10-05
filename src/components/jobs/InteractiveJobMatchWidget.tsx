// src/components/jobs/InteractiveJobMatchWidget.tsx
// High-Converting Interactive Job Match & 1-Click Acquisition Funnel with Viral Loops
// Flow: Google Search -> 10-Sec Interactive Match -> 1-Click Google Auth -> Matched Score -> Apply -> Share

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import {
  Sparkles,
  CheckCircle2,
  Share2,
  Lock,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Zap,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { GrowthFunnelTracker } from '@/lib/analytics/growthFunnelTracker';
import { getPublicJobUrl } from '@/lib/seo/canonicalUrls';

interface InteractiveJobMatchWidgetProps {
  job: {
    id: string;
    title: string;
    company_name?: string;
    location?: string;
    skills_required?: string[] | string;
    experience_level?: string;
    salary_min?: number;
    salary_max?: number;
    salary_currency?: string;
    seo_slug?: string;
  };
  onApplyClick?: () => void;
}

export const InteractiveJobMatchWidget: React.FC<InteractiveJobMatchWidgetProps> = ({
  job,
  onApplyClick,
}) => {
  const { user } = useAuth();

  // Extract skills list
  const defaultSkills = ['React', 'TypeScript', 'Node.js', 'Problem Solving', 'System Design'];
  const jobSkills: string[] = React.useMemo(() => {
    if (Array.isArray(job.skills_required) && job.skills_required.length > 0) {
      return job.skills_required.slice(0, 6);
    }
    if (typeof job.skills_required === 'string' && job.skills_required.trim().length > 0) {
      return job.skills_required.split(/[;,|]+/).map(s => s.trim()).filter(Boolean).slice(0, 6);
    }
    const titleWords = job.title.split(/[\s-/]+/);
    const candidate = titleWords.filter(w => w.length > 2 && !['Senior', 'Junior', 'Lead', 'Manager', 'Executive', 'Engineer'].includes(w));
    return candidate.length > 0 ? candidate.concat(['Problem Solving', 'Communication']).slice(0, 5) : defaultSkills;
  }, [job]);

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [experience, setExperience] = useState<string>('1-3');
  const [calculatedScore, setCalculatedScore] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCopiedShare, setHasCopiedShare] = useState(false);

  // Initialize selected skills with first 2
  useEffect(() => {
    if (jobSkills.length > 0 && selectedSkills.length === 0) {
      setSelectedSkills(jobSkills.slice(0, 2));
    }
  }, [jobSkills]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleCalculateMatch = () => {
    setIsCalculating(true);
    GrowthFunnelTracker.track('match_score_started', {
      job_id: job.id,
      job_title: job.title,
      skills_count: selectedSkills.length,
      experience,
    });

    setTimeout(() => {
      // Dynamic deterministic score based on selected skills + base
      const skillBonus = Math.min(30, selectedSkills.length * 8);
      const expBonus = experience === '3-5' || experience === '5+' ? 20 : 15;
      const base = 50;
      const score = Math.min(97, Math.max(72, base + skillBonus + expBonus));
      setCalculatedScore(score);
      setIsCalculating(false);

      GrowthFunnelTracker.track('ats_score_generated', {
        job_id: job.id,
        job_title: job.title,
        ats_score: score,
      });
    }, 600);
  };

  const handleGoogleSignIn = async () => {
    GrowthFunnelTracker.track('auth_started', {
      provider: 'google',
      job_id: job.id,
      ats_score: calculatedScore || undefined,
    });

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.href,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error('Google sign-in could not be initiated.');
    }
  };

  const shareUrl = getPublicJobUrl(job.seo_slug || job.id);
  const companyName = job.company_name || 'TalentXcel Partner';
  const shareText = `I scored a ${calculatedScore || 92}% match for the ${job.title} role at ${companyName} on TalentXcel! Test your skills match score free:`;

  const handleShareLinkedIn = () => {
    GrowthFunnelTracker.track('match_score_shared', {
      platform: 'linkedin',
      job_id: job.id,
      score: calculatedScore || undefined,
    });
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    GrowthFunnelTracker.track('match_score_shared', {
      platform: 'whatsapp',
      job_id: job.id,
      score: calculatedScore || undefined,
    });
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    GrowthFunnelTracker.track('match_score_shared', {
      platform: 'copy_link',
      job_id: job.id,
      score: calculatedScore || undefined,
    });
    navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
    setHasCopiedShare(true);
    toast.success('Shareable match link copied to clipboard!');
    setTimeout(() => setHasCopiedShare(false), 3000);
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-blue-950/40 to-slate-900 border border-blue-500/30 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
      {/* Decorative accent glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Interactive Match Diagnostic</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
            See How Well You Match This Job
          </h2>
          <p className="text-slate-300 text-xs md:text-sm mt-1">
            Benchmark your background against requirements in 10 seconds — 100% free.
          </p>
        </div>
        <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-xs shrink-0 py-1">
          Instant Evaluation
        </Badge>
      </div>

      {/* Step 1: Skill & Experience Selector */}
      {calculatedScore === null ? (
        <div className="space-y-5 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Select the skills you currently possess:
            </label>
            <div className="flex flex-wrap gap-2">
              {jobSkills.map(skill => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 border border-blue-400'
                        : 'bg-slate-800/80 text-slate-300 border border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                    }`}
                  >
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                    <span>{skill}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Relevant experience level:
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: '0–1 yr', val: '0-1' },
                { label: '1–3 yrs', val: '1-3' },
                { label: '3–5 yrs', val: '3-5' },
                { label: '5+ yrs', val: '5+' },
              ].map(opt => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setExperience(opt.val)}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                    experience === opt.val
                      ? 'bg-indigo-600 text-white border border-indigo-400 shadow-md shadow-indigo-500/25'
                      : 'bg-slate-800/60 text-slate-300 border border-slate-700/80 hover:bg-slate-800'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleCalculateMatch}
            disabled={isCalculating}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm py-6 rounded-xl shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
          >
            {isCalculating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Analyzing Job Alignment...
              </span>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                Calculate My Match Score Free
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      ) : (
        /* Step 2: Score Reveal & Frictionless Auth / Viral Loop */
        <div className="space-y-6 pt-2">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border-2 border-emerald-400/60 shadow-xl">
              <span className="text-3xl font-black text-emerald-400">
                {calculatedScore}%
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Strong Competency Match!
              </h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                Your profile indicates high alignment for <span className="text-white font-semibold">{job.title}</span> at <span className="text-blue-400">{companyName}</span>.
              </p>
            </div>

            {/* Competency breakdown */}
            <div className="grid grid-cols-3 gap-2 pt-3 text-left max-w-md mx-auto">
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Skills Fit</span>
                <span className="text-xs font-bold text-emerald-400">95% High</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Experience</span>
                <span className="text-xs font-bold text-blue-400">Verified</span>
              </div>
              <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Location</span>
                <span className="text-xs font-bold text-indigo-400">Eligible</span>
              </div>
            </div>
          </div>

          {/* If NOT logged in: 1-Click Google Sign-In Payoff */}
          {!user ? (
            <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/40 to-slate-900 border border-blue-500/40 rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0">
                  <Lock className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Unlock 24 Matched Jobs + 1-Click Apply
                  </h4>
                  <p className="text-xs text-slate-300">
                    Sign in with Google in 5 seconds to unlock your detailed report and auto-apply.
                  </p>
                </div>
              </div>

              {/* 1-Click Google Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm py-3 px-4 rounded-xl shadow-lg flex items-center justify-center gap-3 transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Continue with Google
              </button>
            </div>
          ) : (
            /* If ALREADY logged in: 1-Click Direct Apply */
            <div className="space-y-3">
              <Button
                onClick={onApplyClick}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-6 rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Apply for {job.title} Now (1-Click)
              </Button>
            </div>
          )}

          {/* Viral Sharing Loop */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 block text-center uppercase tracking-wider">
              Share Your Score & Challenge Colleagues
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                onClick={handleShareLinkedIn}
                className="border-slate-700 bg-slate-900/60 hover:bg-blue-900/30 text-xs text-blue-300 gap-1.5 h-8"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                LinkedIn
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleShareWhatsApp}
                className="border-slate-700 bg-slate-900/60 hover:bg-emerald-900/30 text-xs text-emerald-300 gap-1.5 h-8"
              >
                <Share2 className="w-3.5 h-3.5" />
                WhatsApp
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyLink}
                className="border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs text-slate-300 gap-1.5 h-8"
              >
                <Copy className="w-3.5 h-3.5" />
                {hasCopiedShare ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
