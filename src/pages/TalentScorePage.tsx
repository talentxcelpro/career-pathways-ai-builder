import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Share2, Copy, Check, ExternalLink,
  Zap, Trophy, TrendingUp, ShieldCheck, Sparkles,
  Gauge, Target, BarChart3, LockKeyhole, ArrowRight,
  Activity, Brain, Globe, Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { TalentScoreRing, getTier } from '@/components/talent-score/TalentScoreRing';
import { TalentScoreBreakdown } from '@/components/talent-score/TalentScoreBreakdown';
import { GamingTalentScoreCard } from '@/components/talent-score/GamingTalentScoreCard';
import { useTalentScore } from '@/hooks/useTalentScore';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const TIER_SHARE_TEXT: Record<string, string> = {
  emerging: "I'm building my TalentScore on TalentXcel. Current score: {score}.",
  rising: "My TalentScore just moved to {score} in Rising Tier on TalentXcel.",
  pro: "TalentScore {score} in Pro Tier on TalentXcel. Momentum is real.",
  elite: "TalentScore {score} in Elite Tier on TalentXcel. Serious professionals track their signal.",
  legend: "Legend Tier with TalentScore {score}/1000. TalentXcel is fully in motion.",
};

function PublicTalentScorePreview() {
  const previewSignals = [
    {
      label: 'Identity Strength',
      value: '250 pts',
      description: 'Role clarity, work proof, and professional readiness.',
      icon: ShieldCheck,
    },
    {
      label: 'Verified Capability',
      value: '300 pts',
      description: 'Current skills, verification depth, and market relevance.',
      icon: Target,
    },
    {
      label: 'Professional Ecosystem',
      value: '150 pts',
      description: 'Trusted reach, ecosystem influence, and professional activity.',
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-hidden edge-to-edge">
      {/* Premium Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-16 px-8 py-24">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-flex w-fit items-center gap-3 rounded-full border border-blue-500/20 bg-blue-500/10 px-8 py-3 text-xs font-apple-heavy text-blue-400 shadow-2xl backdrop-blur-xl">
          <Activity className="h-4 w-4" />
          TALENTSCORE
        </motion.div>

        <section className="grid gap-20 lg:grid-cols-[1fr_480px] lg:items-center">
          <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <h1 className="text-6xl md:text-9xl font-apple-heavy leading-[0.85] tracking-tighter text-white sm:text-7xl">
              Professional identity, <br />
              <span className="text-blue-600">Synchronized.</span>
            </h1>
            <p className="mt-10 max-w-3xl text-2xl font-apple-medium leading-relaxed text-slate-400">
              TalentScore turns your identity, capabilities, momentum, and market activity into one clear career benchmark.
            </p>

            <div className="mt-12 flex flex-col gap-6 sm:flex-row">
              <AuthDialog>
                <Button className="h-20 rounded-[28px] bg-blue-600 px-12 text-lg font-apple-heavy text-white shadow-2xl shadow-blue-500/40 hover:scale-105 transition-all">
                  Unlock TalentScore
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </AuthDialog>
              <Button asChild variant="outline" className="h-20 rounded-[28px] border-white/10 bg-white/5 px-12 text-lg font-apple-heavy text-white hover:bg-white/10 transition-all border">
                <Link to="/career-os">Open TalentXcel Core</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="rounded-[64px] border border-white/10 bg-white/5 p-12 shadow-2xl relative overflow-hidden group border">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
            <div className="rounded-[56px] bg-slate-950 p-12 text-center text-white relative z-10 shadow-2xl border border-white/5">
              <p className="text-xs font-apple-heavy uppercase tracking-[0.4em] text-blue-500 mb-12">TALENTSCORE PREVIEW</p>
              <div className="flex justify-center group-hover:scale-110 transition-transform duration-700">
                <TalentScoreRing score={720} size="lg" animated={false} highContrast />
              </div>
              <p className="mt-12 text-base font-apple-medium leading-relaxed text-slate-400">
                TalentScore activates after sign-in so TalentXcel can map your profile with real data.
              </p>
            </div>
          </motion.div>
        </section>

        <section className="grid gap-10 md:grid-cols-3">
          {previewSignals.map(({ label, value, description, icon: Icon }, idx) => (
            <motion.div 
              key={label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              className="rounded-[48px] border border-white/10 bg-white/5 p-12 shadow-xl hover:bg-white/10 transition-all border group"
            >
              <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-[24px] bg-blue-600/10 text-blue-500 shadow-inner group-hover:scale-110 transition-transform">
                <Icon className="h-8 w-8" />
              </div>
              <p className="text-xs font-apple-heavy text-slate-500 uppercase tracking-[0.2em]">{label}</p>
              <p className="mt-4 text-4xl font-apple-heavy text-white tracking-tighter">{value}</p>
              <p className="mt-8 text-lg font-apple-medium leading-relaxed text-slate-400">{description}</p>
            </motion.div>
          ))}
        </section>

        <motion.section initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="rounded-[56px] border border-white/10 bg-blue-600/5 backdrop-blur-xl p-12 shadow-2xl border">
          <div className="flex items-start gap-10">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[28px] bg-white text-slate-950 shadow-2xl">
              <LockKeyhole className="h-9 w-9" />
            </div>
            <div className="pt-2">
              <h2 className="text-3xl font-apple-heavy text-white tracking-tight">Private by Design.</h2>
              <p className="mt-4 text-xl font-apple-medium leading-relaxed text-slate-400 max-w-4xl">
                Your TalentScore is private by default. You decide when to share it with recruiters, hiring teams, or trusted connections.
              </p>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

const TalentScorePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'breakdown' | 'history' | 'compare'>('breakdown');
  const { talentScore, isLoading: isTalentScoreLoading } = useTalentScore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['talent-score-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('achievement_score, full_name, username, title, current_company, profile_picture_url, skills')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        console.warn('TalentScore profile load error:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });

  const score = talentScore?.score ?? profile?.achievement_score ?? 823;
  const tier = getTier(score);
  const isScoreLoading = isLoading || isTalentScoreLoading;

  const rawDisplayName = 
    profile?.full_name || 
    user?.user_metadata?.full_name || 
    user?.user_metadata?.name || 
    profile?.username || 
    user?.email?.split('@')[0] || 
    'Candidate';

  const displayName = rawDisplayName.includes('.')
    ? rawDisplayName.split('.').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')
    : rawDisplayName;

  const handleShare = async () => {
    const text = (TIER_SHARE_TEXT[tier] || TIER_SHARE_TEXT.emerging)
      .replace('{score}', String(score));
    const url = `${window.location.origin}/t/@${user?.email?.split('@')[0] ?? 'me'}`;
    const shareText = `${text}\n${url}`;

    if (navigator.share) {
      await navigator.share({ title: 'My TalentScore', text: shareText, url });
    } else {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success('TalentScore copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/passport/${user?.email?.split('@')[0] ?? ''}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Identity Hub link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) {
    return <PublicTalentScorePreview />;
  }

  return (
    <>
      <Helmet>
        <title>TalentScore - {profile?.full_name ?? 'My'} Career Signals | TalentXcel</title>
        <meta name="description" content={`TalentScore ${score}/1000 - ${tier.charAt(0).toUpperCase() + tier.slice(1)} Tier. Track your career momentum with TalentXcel.`} />
        <meta property="og:title" content={`TalentScore ${score} - ${tier} Tier`} />
        <meta property="og:description" content={`${profile?.full_name}'s TalentScore on TalentXcel`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl edge-to-edge pb-32">
        {/* Header */}
        <div className="sticky top-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 px-4 md:px-8">
          <div className="max-w-4xl mx-auto py-5 md:py-8 flex items-center justify-between gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-3 h-12 px-6 rounded-[18px] font-apple-heavy text-slate-500 hover:text-slate-950 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
            >
              <ArrowLeft className="h-5 w-5" />
              Back
            </button>
            <div className="text-center">
              <h1 className="text-xl md:text-2xl font-apple-heavy text-slate-950 tracking-tighter leading-none">TalentScore</h1>
              <p className="text-[10px] font-apple-heavy uppercase tracking-[0.3em] text-slate-400 mt-2">CAREER SIGNALS</p>
            </div>
            <Button
              onClick={handleShare}
              variant="ghost"
              size="sm"
              className="h-12 w-12 rounded-[18px] bg-slate-50 hover:bg-slate-100 font-apple-heavy text-slate-600 border border-slate-100"
            >
              {copied ? <Check className="h-5 w-5 text-emerald-500" /> : <Share2 className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 pt-8 md:pt-16 space-y-10 md:space-y-16">

          {/* Pixel-Perfect Gaming TalentScore Card */}
          <GamingTalentScoreCard
            score={score}
            displayName={isScoreLoading ? '...' : displayName}
            title={profile?.title || 'Director Operations'}
            company={profile?.current_company || 'TalentXcel Services'}
            actionText="View & Earn in Gaming Hub"
            actionRoute="/gamification"
            rankOverride={`#${Math.floor(4821 * (1 - score / 1000)) || 853}`}
            growthDeltaOverride={`+${Math.round(score * 0.08) || 66}`}
            syncFidelityOverride="98%"
          />

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            <Button
              onClick={handleShare}
              className="h-20 rounded-[28px] font-apple-heavy text-base bg-blue-600 text-white hover:scale-105 transition-all shadow-2xl shadow-blue-500/30"
            >
              <Share2 className="h-6 w-6 mr-4" />
              Share TalentScore
            </Button>
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="h-20 rounded-[28px] font-apple-heavy text-base border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm border"
            >
              {copied ? <Check className="h-6 w-6 mr-4 text-emerald-500" /> : <Copy className="h-6 w-6 mr-4" />}
              Identity Hub Link
            </Button>
          </div>

          {/* Tactical Move nudge */}
          <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true }} className="rounded-[40px] bg-indigo-50/30 backdrop-blur-xl border border-indigo-100 p-10 flex items-start gap-8 shadow-2xl shadow-indigo-500/5 group hover:shadow-indigo-500/10 transition-all border">
            <div className="h-16 w-16 bg-white rounded-[24px] flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform">
              <Sparkles className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="pt-1">
              <p className="text-xs font-apple-heavy text-indigo-600 uppercase tracking-[0.3em] mb-2">
                TACTICAL STRATEGIC MOVE
              </p>
              <p className="text-xl font-apple-medium text-slate-700 leading-relaxed">
                Add your professional evolution roadmap and complete the Capability Sync to gain an estimated
                <span className="font-apple-heavy text-indigo-700 ml-2"> +47 points</span> this cycle.
              </p>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-3 p-3 bg-slate-100/50 backdrop-blur-xl rounded-[32px] border border-slate-200 shadow-inner">
            {(['breakdown', 'history', 'compare'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'flex-1 py-5 rounded-[24px] text-xs font-apple-heavy uppercase tracking-widest transition-all duration-500',
                  activeTab === tab
                    ? 'bg-white text-slate-950 shadow-2xl'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="min-h-[500px]">
            {activeTab === 'breakdown' && (
              <TalentScoreBreakdown
                score={score}
                onActionClick={(key) => {
                  const routes: Record<string, string> = {
                    profile: '/profile/edit',
                    skills: '/tools/skill-assessor',
                    activity: '/jobs',
                    network: '/network',
                    learning: '/learning',
                  };
                  navigate(routes[key] ?? '/career-os');
                }}
              />
            )}

            {activeTab === 'history' && (
              <div className="rounded-[56px] border border-slate-200 bg-white p-24 text-center shadow-2xl border">
                <TrendingUp className="mx-auto mb-10 h-20 w-20 text-blue-600 opacity-20 shadow-inner" />
                <p className="text-2xl font-apple-heavy text-slate-950 tracking-tight">Evolution History Syncing</p>
                <p className="text-lg font-apple-medium text-slate-500 mt-4 leading-relaxed max-w-md mx-auto">We&apos;re tracking your progress from this score point forward.</p>
              </div>
            )}

            {activeTab === 'compare' && (
              <div className="rounded-[56px] border border-slate-200 bg-white p-24 text-center shadow-2xl border">
                <BarChart3 className="mx-auto mb-10 h-20 w-20 text-indigo-600 opacity-20 shadow-inner" />
                <p className="text-2xl font-apple-heavy text-slate-950 tracking-tight">Ecosystem Benchmarking</p>
                <p className="text-lg font-apple-medium text-slate-500 mt-4 leading-relaxed max-w-md mx-auto">See how your professional evolution compares to elite tiers in your synchronized ecosystem.</p>
              </div>
            )}
          </div>

          {/* Public identity link */}
          <div className="flex items-center justify-between rounded-[48px] border border-slate-200 bg-white p-10 shadow-2xl hover:shadow-indigo-500/10 transition-all group border">
            <div className="flex items-center gap-8">
              <div className="h-16 w-16 bg-slate-50 rounded-[24px] flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                <Globe className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-apple-heavy text-slate-950 tracking-tight">Professional Identity Hub</p>
                <p className="text-base font-apple-medium text-slate-500 mt-1">Broadcast your full evolution hub to ecosystem partners</p>
              </div>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-14 px-8 rounded-2xl font-apple-heavy text-blue-600 hover:bg-blue-50 transition-all">
              <Link to="/passport">
                View Hub <ExternalLink className="h-4 w-4 ml-3" />
              </Link>
            </Button>
          </div>

          {/* Earn more score CTA */}
          <div className="rounded-[64px] bg-slate-950 p-16 text-white text-center shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-transparent pointer-events-none" />
            <div className="relative z-10">
              <Zap className="h-16 w-16 text-amber-400 mx-auto mb-10 animate-pulse shadow-lg" />
              <h3 className="text-4xl font-apple-heavy mb-6 tracking-tighter leading-none">Improve Your TalentScore</h3>
              <p className="text-slate-400 font-apple-medium text-xl mb-12 max-w-2xl mx-auto leading-relaxed">Complete focused career moves to climb from the {tier.toUpperCase()} tier toward elite momentum.</p>
              <Button asChild className="h-20 px-16 rounded-[28px] bg-white text-slate-950 hover:scale-105 transition-all font-apple-heavy text-lg shadow-2xl">
                <Link to="/career-os">Open TalentXcel Core</Link>
              </Button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default TalentScorePage;
