import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Zap, Sparkles, Briefcase, BookOpen, Users, TrendingUp,
  ArrowRight, Bell, Settings, Target, Flame, Trophy,
  ChevronRight, MapPin, Building, Clock, FileText, Video, Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCommandCenterData } from '@/hooks/useCommandCenterData';
import { TalentScoreRing, getTier } from '@/components/talent-score/TalentScoreRing';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  applied:      'bg-blue-100 text-blue-700',
  screening:    'bg-yellow-100 text-yellow-700',
  interview:    'bg-violet-100 text-violet-700',
  offer:        'bg-green-100 text-green-700',
  rejected:     'bg-red-100 text-red-700',
};

function formatSalary(min: number | null, max: number | null) {
  if (!min && !max) return null;
  const fmt = (n: number) => n >= 100000 ? `₹${(n / 100000).toFixed(0)}L` : `₹${n.toLocaleString()}`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (max) return `Up to ${fmt(max)}`;
  return `${fmt(min!)}+`;
}

const QUICK_ACTIONS = [
  { icon: Briefcase,   label: 'Find Jobs',      to: '/jobs',                               color: 'bg-blue-50 text-blue-700' },
  { icon: FileText,    label: 'ATS Scanner',    to: '/resume/ats-check',                   color: 'bg-emerald-50 text-emerald-700' },
  { icon: Target,      label: 'Skill Gap',      to: '/tools/skill-gap-analyzer',           color: 'bg-rose-50 text-rose-700' },
  { icon: TrendingUp,  label: 'Career Intel',   to: '/career-map/comprehensive-intelligence', color: 'bg-violet-50 text-violet-700' },
  { icon: Sparkles,    label: 'Roadmap',        to: '/roadmap-builder',                    color: 'bg-amber-50 text-amber-700' },
  { icon: Video,       label: 'Mock Interview', to: '/tools/mock-interview-simulator',     color: 'bg-cyan-50 text-cyan-700' },
  { icon: BookOpen,    label: 'Resume Builder', to: '/resume/build',                       color: 'bg-indigo-50 text-indigo-700' },
  { icon: Brain,       label: 'Tools Hub',      to: '/tools',                              color: 'bg-purple-50 text-purple-700' },
];

const CommandCenter: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useCommandCenterData(user?.id);

  const rawDbScore = data?.profile?.talent_score ?? 0;
  const connectionsCount = data?.stats?.TalentNetwork ?? 0;
  const completion = data?.profile?.profile_completion ?? 0;
  const candidateSkillsCount = (data?.profile?.skills ?? []).length;
  const profileViews = data?.stats?.profileViews ?? 0;

  // Active score: use DB score if established, otherwise calculate dynamic baseline signal
  const score = rawDbScore > 0 
    ? rawDbScore 
    : Math.min(
        950,
        Math.max(
          120,
          Math.round(
            120 + 
            (completion > 0 ? completion * 2.5 : 0) +
            Math.min(250, connectionsCount * 1.5) +
            Math.min(180, candidateSkillsCount * 20) +
            Math.min(100, profileViews * 1.5)
          )
        )
      );
  const tier = getTier(score);
  const firstName = data?.profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';
  const streak = data?.profile?.streak_days ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Dynamically constructed career moves based on genuine candidate state
  const careerMoves = [];

  // Move 1: Incomplete profile OR saved ATS resume review
  if (completion < 100) {
    careerMoves.push({
      emoji: '🎯',
      title: 'Optimize your Candidate Profile',
      desc: `Complete profile details to increase precision job matching (${completion}% completed).`,
      action: 'Complete Profile',
      to: '/profile/edit',
      badge: `${completion}% done`,
      badgeColor: 'bg-blue-50 text-blue-700',
    });
  } else if (data?.savedAtsReport) {
    careerMoves.push({
      emoji: '📄',
      title: 'Review ATS Resume Recommendations',
      desc: `Scannability score: ${data.savedAtsReport.score}/100. Target missing industry keywords for higher recruiter response.`,
      action: 'Review Resume',
      to: '/resume/ats-check',
      badge: `${data.savedAtsReport.score}/100 ATS`,
      badgeColor: 'bg-emerald-50 text-emerald-700',
    });
  } else {
    careerMoves.push({
      emoji: '📄',
      title: 'Audit your Resume against ATS filters',
      desc: 'Free instant diagnostic scanner to verify scannability, section completeness, and keyword density.',
      action: 'Run Free Audit',
      to: '/resume/ats-check',
      badge: 'Free Audit',
      badgeColor: 'bg-emerald-50 text-emerald-700',
    });
  }

  // Move 2: Top Job Match (Real dynamic job from topJobMatches)
  const topMatch = data?.topJobMatches?.[0];
  if (topMatch) {
    careerMoves.push({
      emoji: '💼',
      title: `Apply to ${topMatch.title}`,
      desc: `${topMatch.company_name ? `${topMatch.company_name} · ` : ''}${topMatch.location || 'Remote'} · ${topMatch.badgeLabel}`,
      action: 'View opening',
      to: `/jobs/${topMatch.seo_slug || topMatch.id}`,
      badge: topMatch.matchPercentage ? `${topMatch.matchPercentage}% match` : topMatch.badgeLabel,
      badgeColor: topMatch.matchPercentage ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700',
    });
  } else {
    careerMoves.push({
      emoji: '💼',
      title: 'Browse Curated Job Openings',
      desc: 'Explore active openings matching in-demand skills and preferred locations.',
      action: 'Explore jobs',
      to: '/jobs',
      badge: 'Active Hiring',
      badgeColor: 'bg-blue-50 text-blue-700',
    });
  }

  // Move 3: Skill Gap Analysis & Roadmap
  careerMoves.push({
    emoji: '🧠',
    title: 'Analyze Skill Gaps & Roadmap',
    desc: 'Map required competencies against target roles and discover personalized learning recommendations.',
    action: 'Analyze Gaps',
    to: '/tools/skill-gap-analyzer',
    badge: 'Career Intel',
    badgeColor: 'bg-violet-50 text-violet-700',
  });

  return (
    <>
      <Helmet>
        <title>CommandCenter — TalentXcel Core</title>
        <meta name="description" content="Your Talent Intelligence-powered career CommandCenter — TalentScore, job matches, and momentum metrics in one place." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-[var(--tx-bg,#f4f6fb)] pb-28">

        {/* ── Top Bar ─────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">TalentXcel Core</p>
              <h1 className="text-base font-black text-slate-900 leading-tight">CommandCenter</h1>
            </div>
            <div className="flex items-center gap-2">
              {streak > 0 && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-100">
                  <Flame className="h-3.5 w-3.5 text-orange-500" />
                  <span className="text-xs font-black text-orange-600">{streak}d</span>
                </div>
              )}
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-slate-100">
                <Link to="/network/notifications" aria-label="Notifications"><Bell className="h-4 w-4 text-slate-600" /></Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-slate-100">
                <Link to="/profile/settings" aria-label="Settings"><Settings className="h-4 w-4 text-slate-600" /></Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pt-6 space-y-5">

          {/* ── Hero: Greeting + TalentScore ───────────────────────────────── */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 shadow-sm">
            <div className="absolute inset-0 opacity-10"
              style={{ background: 'radial-gradient(ellipse at 30% 50%, #2563eb, transparent 60%), radial-gradient(ellipse at 80% 50%, #7c3aed, transparent 60%)' }} />

            <div className="relative z-10 flex items-center gap-5">
              <Link to="/talent-score" className="shrink-0 hover:scale-105 transition-transform duration-200">
                {isLoading ? (
                  <div className="w-24 h-24 rounded-full border-4 border-white/10 animate-pulse" />
                ) : (
                  <TalentScoreRing score={score} size="md" showTier={false} animated />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <p className="text-white/50 text-xs font-bold">{greeting},</p>
                <h2 className="text-xl font-black text-white tracking-tight truncate">{firstName}</h2>
                {data?.profile?.title && (
                  <p className="text-white/60 text-xs mt-0.5 truncate">
                    {data.profile.title}{data.profile.current_company ? ` · ${data.profile.current_company}` : ''}
                  </p>
                )}

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Link to="/talent-score"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-xs font-bold text-white">{score} — {tier.charAt(0).toUpperCase() + tier.slice(1)}</span>
                    <ChevronRight className="h-3 w-3 text-white/50" />
                  </Link>

                  {data?.stats && (
                    <Link to="/passport"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                      title="View Career Passport & TXC Rewards"
                    >
                      <Zap className="h-3.5 w-3.5 text-yellow-400" />
                      <span className="text-xs font-bold text-white">{data.profile?.txc_coins ?? 0} TXC</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>

            {/* Profile completion nudge */}
            {completion < 100 && (
              <Link to="/profile/edit" className="relative z-10 flex items-center justify-between mt-4 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors group">
                <div className="flex items-center gap-2.5">
                  <Target className="h-4 w-4 text-blue-300" />
                  <div>
                    <p className="text-xs font-bold text-white">Complete your candidate profile</p>
                    <p className="text-[10px] text-white/50">Unlock precision matches and verified skills — {completion}% done</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${completion}%` }} />
                  </div>
                  <ChevronRight className="h-4 w-4 text-white/40 group-hover:text-white/70 transition-colors" />
                </div>
              </Link>
            )}
          </div>

          {/* ── ATS Pre-Login Audit Handoff Banner (if available) ───────────── */}
          {data?.savedAtsReport && (
            <div className="rounded-3xl p-5 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/80 text-white shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] font-black uppercase tracking-wider">
                      ATS Audit Saved · {data.savedAtsReport.score}/100
                    </Badge>
                    <span className="text-xs text-slate-400 truncate max-w-[200px]">
                      {data.savedAtsReport.fileName}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Detected skills: <span className="text-white font-semibold">{data.savedAtsReport.foundKeywords?.slice(0, 5).join(' · ') || 'General competencies'}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow-sm">
                    <Link to={`/jobs?search=${encodeURIComponent(data.savedAtsReport.foundKeywords?.[0] || '')}`}>
                      View Matching Jobs →
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10 rounded-xl text-xs">
                    <Link to="/tools/skill-gap-analyzer">
                      Analyze Skill Gaps
                    </Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/10 rounded-xl text-xs">
                    <Link to="/resume/build">
                      Improve Resume
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ── Stats Row ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Applied', value: data?.stats.applicationsTotal ?? 0, icon: Briefcase, to: '/my-applications',    color: 'text-blue-600 bg-blue-50' },
              { label: 'Saved',   value: data?.stats.savedJobsTotal ?? 0,    icon: Target,    to: '/saved-jobs',        color: 'text-violet-600 bg-violet-50' },
              { label: 'Views',   value: data?.stats.profileViews ?? 0,      icon: TrendingUp,to: '/profile/analytics', color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Network', value: data?.stats.TalentNetwork ?? 0,     icon: Users,     to: '/network/connections', color: 'text-amber-600 bg-amber-50' },
            ].map(({ label, value, icon: Icon, to, color }) => (
              <Link key={label} to={to}
                className="rounded-2xl bg-white border border-slate-100 p-3 text-center hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center mx-auto mb-1.5', color)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-lg font-black text-slate-900 leading-none">
                  {isLoading ? '—' : value}
                </p>
                <p className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 mt-0.5">{label}</p>
              </Link>
            ))}
          </div>

          {/* ── Core Priority Actions (Career Moves) ───────────────────────── */}
          <div className="rounded-3xl bg-white border border-slate-100 overflow-hidden shadow-sm">
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-violet-50">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Career Moves</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Personalized Momentum</p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-full text-[10px] font-bold border-violet-200 text-violet-600 bg-violet-50">
                {careerMoves.length} active
              </Badge>
            </div>
            <div className="divide-y divide-slate-50">
              {careerMoves.map(({ emoji, title, desc, action, to, badge, badgeColor }) => (
                <Link key={title} to={to}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 transition-colors group"
                >
                  <span className="text-2xl shrink-0 mt-0.5">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-slate-800">{title}</p>
                      <span className={cn('text-[10px] font-extrabold px-2 py-0.5 rounded-full', badgeColor)}>{badge}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                  <span className="text-xs font-bold text-blue-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {action} →
                  </span>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Two-column: Job Matches + Recent Applications ─────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Job Matches */}
            <div className="rounded-3xl bg-white border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <p className="text-sm font-black text-slate-900">Top Matches</p>
                </div>
                <Link to="/jobs" className="text-xs font-bold text-blue-600 hover:underline">
                  View all →
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="px-5 py-4 animate-pulse">
                      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-1/2" />
                    </div>
                  ))
                ) : (data?.topJobMatches ?? []).length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm font-bold text-slate-600">No active jobs found</p>
                    <p className="text-xs text-slate-400 mt-1">Check back soon for new opportunities</p>
                    <Button asChild size="sm" className="mt-4 rounded-xl bg-blue-600 text-white font-bold">
                      <Link to="/jobs">Browse All Jobs</Link>
                    </Button>
                  </div>
                ) : (data?.topJobMatches ?? []).map((job) => (
                  <Link key={job.id} to={`/jobs/${job.seo_slug ?? job.id}`}
                    className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="p-2 rounded-xl bg-blue-50 shrink-0">
                      <Building className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-700 transition-colors">
                        {job.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {job.company_name && <span className="text-xs text-slate-500 truncate">{job.company_name}</span>}
                        {job.location && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="h-2.5 w-2.5" />{job.location}
                            </span>
                          </>
                        )}
                        {formatSalary(job.salary_min, job.salary_max) && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs font-bold text-emerald-600">
                              {formatSalary(job.salary_min, job.salary_max)}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {/* Transparent Skill Overlap Badge */}
                      <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className={cn(
                          'text-[10px] font-bold px-2 py-0.5 rounded-full',
                          job.matchPercentage && job.matchPercentage >= 60 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : job.matchPercentage 
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                        )}>
                          {job.badgeLabel}
                        </span>
                        {job.matchedSkills && job.matchedSkills.length > 0 && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[260px]">
                            Overlap: {job.matchedSkills.slice(0, 3).join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-200 group-hover:text-slate-400 shrink-0 mt-1 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="rounded-3xl bg-white border border-slate-100 overflow-hidden shadow-sm">
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-violet-600" />
                  <p className="text-sm font-black text-slate-900">Applications</p>
                </div>
                <Link to="/my-applications" className="text-xs font-bold text-blue-600 hover:underline">
                  View all →
                </Link>
              </div>
              <div className="divide-y divide-slate-50">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="px-5 py-4 animate-pulse">
                      <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-slate-100 rounded w-1/3" />
                    </div>
                  ))
                ) : (data?.recentApplications ?? []).length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <div className="text-3xl mb-2">🎯</div>
                    <p className="text-sm font-bold text-slate-600">No applications yet</p>
                    <p className="text-xs text-slate-400 mt-1">Apply to jobs to track your progress here</p>
                    <Button asChild size="sm" className="mt-4 rounded-xl bg-blue-600 text-white font-bold">
                      <Link to="/jobs">Browse Jobs</Link>
                    </Button>
                  </div>
                ) : (data?.recentApplications ?? []).map((app) => (
                  <Link key={app.id} to="/my-applications" className="flex items-start gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors group">
                    <div className="p-2 rounded-xl bg-violet-50 shrink-0">
                      <Briefcase className="h-3.5 w-3.5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                        {(app.jobs as any)?.title ?? 'Job Application'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {(app.jobs as any)?.companies?.name ?? ''}
                      </p>
                    </div>
                    <span className={cn(
                      'text-[10px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full shrink-0',
                      STATUS_COLORS[app.status] ?? 'bg-slate-100 text-slate-600'
                    )}>
                      {app.status}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Quick Actions Grid (Verified Existing Tools) ────────────────── */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 px-1">
              Platform Tools & Intelligence
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {QUICK_ACTIONS.map(({ icon: Icon, label, to, color }) => (
                <Link key={to} to={to}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center"
                >
                  <div className={cn('p-2.5 rounded-xl', color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 leading-tight">{label}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default CommandCenter;






