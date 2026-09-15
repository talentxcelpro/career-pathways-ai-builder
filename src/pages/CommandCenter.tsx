import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Zap, Sparkles, Briefcase, BookOpen, Users, TrendingUp,
  ArrowRight, Bell, Settings, Target, Flame, Trophy,
  ChevronRight, MapPin, Building, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  { icon: Briefcase, label: 'Find Jobs', to: '/jobs', color: 'bg-blue-50 text-blue-700' },
  { icon: Sparkles,  label: 'Navigator', to: '/navigator', color: 'bg-violet-50 text-violet-700' },
  { icon: BookOpen,  label: 'Learn',     to: '/learning', color: 'bg-emerald-50 text-emerald-700' },
  { icon: Users,     label: 'Network',   to: '/network',  color: 'bg-amber-50 text-amber-700' },
];

const CommandCenter: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading } = useCommandCenterData(user?.id);

  const score = data?.profile?.talent_score ?? 0;
  const tier = getTier(score);
  const firstName = data?.profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'there';
  const streak = data?.profile?.streak_days ?? 0;
  const completion = data?.profile?.profile_completion ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

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
                <Link to="/notifications" aria-label="Notifications"><Bell className="h-4 w-4 text-slate-600" /></Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-9 w-9 rounded-xl bg-slate-50 hover:bg-slate-100">
                <Link to="/profile/settings" aria-label="Settings"><Settings className="h-4 w-4 text-slate-600" /></Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 pt-6 space-y-5">

          {/* ── Hero: Greeting + TalentScore ───────────────────────────────── */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
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
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10">
                      <Zap className="h-3.5 w-3.5 text-yellow-400" />
                      <span className="text-xs font-bold text-white">{data.profile?.txc_coins ?? 0} TXC</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Profile completion nudge */}
            {completion < 80 && (
              <Link to="/profile/edit" className="relative z-10 flex items-center justify-between mt-4 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors group">
                <div className="flex items-center gap-2.5">
                  <Target className="h-4 w-4 text-blue-300" />
                  <div>
                    <p className="text-xs font-bold text-white">Complete your profile</p>
                    <p className="text-[10px] text-white/50">Unlock Precision Matches — {completion}% done</p>
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

          {/* ── Stats Row ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Applied', value: data?.stats.applicationsTotal ?? 0, icon: Briefcase, to: '/profile/applications', color: 'text-blue-600 bg-blue-50' },
              { label: 'Saved',   value: data?.stats.savedJobsTotal ?? 0,    icon: Target,    to: '/jobs/saved',           color: 'text-violet-600 bg-violet-50' },
              { label: 'Views',   value: data?.stats.profileViews ?? 0,      icon: TrendingUp,to: '/profile/CareerAnalytics',    color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Network', value: data?.stats.TalentNetwork ?? 0,        icon: Users,    to: '/network/TalentNetwork',  color: 'text-amber-600 bg-amber-50' },
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

          {/* ── Core Priority Actions ──────────────────────────────────────────── */}
          <div className="rounded-3xl bg-white border border-slate-100 overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-violet-50">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">Career Moves</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Talent Strategy</p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-full text-[10px] font-bold border-violet-200 text-violet-600 bg-violet-50">
                3 new
              </Badge>
            </div>
            <div className="divide-y divide-slate-50">
              {[
                {
                  emoji: '📄',
                  title: 'Add your portfolio link',
                  desc: 'Boosts TalentScore by ~45 points and increases recruiter callbacks',
                  action: 'Complete now',
                  to: '/profile/edit',
                  badge: '+45 pts',
                  badgeColor: 'bg-blue-50 text-blue-700',
                },
                {
                  emoji: '🎯',
                  title: 'Apply to your top match',
                  desc: 'Senior React Engineer at Razorpay — 94% match, closes in 2 days',
                  action: 'View job',
                  to: '/jobs',
                  badge: '94% match',
                  badgeColor: 'bg-green-50 text-green-700',
                },
                {
                  emoji: '🤝',
                  title: 'Complete React skill assessment',
                  desc: 'Earns a verified badge and 25 TalentScore points',
                  action: 'Start',
                  to: '/tools/skill-assessor',
                  badge: '+25 pts',
                  badgeColor: 'bg-violet-50 text-violet-700',
                },
              ].map(({ emoji, title, desc, action, to, badge, badgeColor }) => (
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
            <div className="rounded-3xl bg-white border border-slate-100 overflow-hidden">
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
                ) : (data?.topJobMatches ?? []).slice(0, 4).map((job) => (
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
                        <span className="text-xs text-slate-500 truncate">{job.company_name}</span>
                        {job.location && (
                          <>
                            <span className="text-slate-300">·</span>
                            <span className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="h-2.5 w-2.5" />{job.location}
                            </span>
                          </>
                        )}
                      </div>
                      {formatSalary(job.salary_min, job.salary_max) && (
                        <p className="text-[11px] font-bold text-emerald-600 mt-0.5">
                          {formatSalary(job.salary_min, job.salary_max)}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-200 group-hover:text-slate-400 shrink-0 mt-1 transition-colors" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            <div className="rounded-3xl bg-white border border-slate-100 overflow-hidden">
              <div className="px-5 py-4 flex items-center justify-between border-b border-slate-50">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-violet-600" />
                  <p className="text-sm font-black text-slate-900">Applications</p>
                </div>
                <Link to="/profile/applications" className="text-xs font-bold text-blue-600 hover:underline">
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
                    <p className="text-xs text-slate-400 mt-1">Apply to jobs to track them here</p>
                    <Button asChild size="sm" className="mt-4 rounded-xl bg-blue-600 text-white font-bold">
                      <Link to="/jobs">Browse Jobs</Link>
                    </Button>
                  </div>
                ) : (data?.recentApplications ?? []).map((app) => (
                  <div key={app.id} className="flex items-start gap-3 px-5 py-3.5">
                    <div className="p-2 rounded-xl bg-violet-50 shrink-0">
                      <Briefcase className="h-3.5 w-3.5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">
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
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Quick Actions ────────────────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3 px-1">
              Quick Actions
            </p>
            <div className="grid grid-cols-4 gap-3">
              {QUICK_ACTIONS.map(({ icon: Icon, label, to, color }) => (
                <Link key={to} to={to}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white border border-slate-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <div className={cn('p-2.5 rounded-xl', color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700">{label}</span>
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





