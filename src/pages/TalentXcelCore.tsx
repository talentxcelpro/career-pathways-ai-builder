import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  Gauge,
  Radio,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useTalentScore } from '@/hooks/useTalentScore';
import { supabase } from '@/integrations/supabase/client';

type ProfileLike = {
  full_name?: string | null;
  headline?: string | null;
  title?: string | null;
  current_job_title?: string | null;
  current_company?: string | null;
  location?: string | null;
};

type CoreOverview = {
  profile: ProfileLike | null;
  applications: number;
  network: number;
  enrollments: number;
  matches: number;
};

const emptyOverview: CoreOverview = {
  profile: null,
  applications: 0,
  network: 0,
  enrollments: 0,
  matches: 0,
};

function getFirstName(profile: ProfileLike | null, email?: string | null) {
  const name = profile?.full_name?.trim();
  if (name) return name.split(' ')[0];
  if (email) return email.split('@')[0];
  return 'there';
}

function getRole(profile: ProfileLike | null) {
  return profile?.headline || profile?.title || profile?.current_job_title || 'Career momentum in progress';
}

async function loadCoreOverview(userId: string): Promise<CoreOverview> {
  const [profileRes, applicationsRes, networkRes, enrollmentsRes, matchesRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('full_name, headline, title, current_job_title, current_company, location')
      .eq('id', userId)
      .maybeSingle(),
    supabase.from('job_applications').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase
      .from('connections')
      .select('id', { count: 'exact', head: true })
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted'),
    supabase.from('course_enrollments').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('ai_job_matches').select('id', { count: 'exact', head: true }).eq('user_id', userId),
  ]);

  return {
    profile: (profileRes.data as ProfileLike | null) ?? null,
    applications: applicationsRes.count ?? 0,
    network: networkRes.count ?? 0,
    enrollments: enrollmentsRes.count ?? 0,
    matches: matchesRes.count ?? 0,
  };
}

function LoadingTalentXcelCore() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-slate-600">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm font-semibold">Loading TalentXcel</p>
      </div>
    </div>
  );
}

function PublicTalentXcelCore() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 pb-20 pt-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xl font-apple-heavy tracking-tight">TalentXcel Core</p>
              <p className="text-xs font-apple-bold uppercase tracking-[0.28em] text-slate-400">Career Signals</p>
            </div>
          </div>

          <Button asChild className="rounded-2xl bg-slate-950 px-5 text-white hover:bg-slate-800">
            <Link to="/auth">Sign In</Link>
          </Button>
        </header>

        <main className="flex flex-1 flex-col justify-center py-14">
          <Badge className="w-fit rounded-full bg-blue-50 px-4 py-2 text-[10px] font-apple-heavy uppercase tracking-[0.28em] text-blue-700">
            Core Active
          </Badge>

          <h1 className="mt-6 max-w-3xl text-5xl font-apple-heavy tracking-tight text-slate-950 md:text-7xl">
            The command center for your next career move.
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-apple-medium leading-8 text-slate-500 md:text-xl">
            Track your TalentScore, scan the market, build your network, and move with more clarity inside one platform.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button asChild className="h-14 rounded-2xl bg-blue-600 px-8 text-base font-apple-heavy text-white hover:bg-blue-700">
              <Link to="/auth">
                Enter TalentXcel
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-14 rounded-2xl border-slate-200 bg-white px-8 text-base font-apple-heavy text-slate-900 hover:bg-slate-50">
              <Link to="/talent-score">Explore TalentScore</Link>
            </Button>
          </div>

          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {[
              {
                title: 'TalentScore',
                description: 'A clear view of your market readiness.',
                icon: Gauge,
              },
              {
                title: 'Precision Match',
                description: 'Role discovery shaped around your actual profile.',
                icon: Briefcase,
              },
              {
                title: 'Pulse',
                description: 'Professional activity and trusted network growth.',
                icon: Users,
              },
            ].map(({ title, description, icon: Icon }) => (
              <div key={title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
                  <Icon className="h-6 w-6" />
                </div>
                <p className="text-xl font-apple-heavy tracking-tight text-slate-950">{title}</p>
                <p className="mt-2 text-sm font-apple-medium leading-6 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function TalentXcelCore() {
  const { user, loading: authLoading } = useAuth();
  const { talentScore, isLoading: isScoreLoading } = useTalentScore();

  const { data: overview = emptyOverview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['talentxcel-core-overview', user?.id],
    enabled: !!user?.id,
    queryFn: () => loadCoreOverview(user!.id),
    staleTime: 5 * 60 * 1000,
  });

  const nextMoves = useMemo(() => {
    if (talentScore?.recommendations?.length) {
      return talentScore.recommendations.slice(0, 3);
    }

    return [
      {
        id: 'profile',
        title: 'Complete your profile',
        description: 'Tighten your role, location, and work history so TalentXcel can rank better matches.',
        route: '/profile',
      },
      {
        id: 'beacon',
        title: 'Run a Beacon scan',
        description: 'See which roles are already within reach and what gaps are worth closing next.',
        route: '/talent-beacon',
      },
      {
        id: 'network',
        title: 'Grow your Talent Network',
        description: 'Build warm paths into the companies and teams you want to reach.',
        route: '/network',
      },
    ];
  }, [talentScore?.recommendations]);

  if (authLoading) return <LoadingTalentXcelCore />;
  if (!user) return <PublicTalentXcelCore />;
  if (isOverviewLoading && isScoreLoading) return <LoadingTalentXcelCore />;

  const score = talentScore?.score ?? 0;
  const band = talentScore?.band ?? (score >= 850 ? 'Elite' : score >= 700 ? 'Strong' : score >= 550 ? 'Emerging' : 'Building');
  const firstName = getFirstName(overview.profile, user.email);
  const role = getRole(overview.profile);

  const cards = [
    {
      title: 'TalentScore',
      value: score || 0,
      hint: `${band} career signal`,
      route: '/talent-score',
      icon: Gauge,
    },
    {
      title: 'Job Matches',
      value: overview.matches,
      hint: overview.matches > 0 ? 'Ready to review' : 'Start a Beacon scan',
      route: '/talent-beacon',
      icon: Briefcase,
    },
    {
      title: 'Talent Network',
      value: overview.network,
      hint: overview.network > 0 ? 'Accepted connections' : 'Build your first layer',
      route: '/network',
      icon: Users,
    },
    {
      title: 'Learning',
      value: overview.enrollments,
      hint: overview.enrollments > 0 ? 'Active growth path' : 'Add a learning path',
      route: '/learning',
      icon: BookOpen,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-32 text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 md:flex-row md:items-center md:justify-between md:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-blue-600 text-white shadow-lg">
              <Zap className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-apple-heavy tracking-tight">TalentXcel Core</h1>
                <Badge className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-apple-heavy uppercase tracking-[0.24em] text-emerald-700">
                  Operational
                </Badge>
              </div>
              <p className="mt-1 truncate text-sm font-apple-medium text-slate-500">
                {firstName} | {role}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:flex md:items-center">
            <Button asChild variant="outline" className="h-12 rounded-2xl border-slate-200 bg-white font-apple-heavy text-slate-900 hover:bg-slate-50">
              <Link to="/navigator">
                <Sparkles className="mr-2 h-4 w-4 text-blue-600" />
                Navigator
              </Link>
            </Button>
            <Button asChild className="h-12 rounded-2xl bg-slate-950 font-apple-heavy text-white hover:bg-slate-800">
              <Link to="/talent-beacon">
                <Radio className="mr-2 h-4 w-4" />
                Beacon Scan
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ title, value, hint, route, icon: Icon }) => (
            <Link
              key={title}
              to={route}
              className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-100 text-slate-900">
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-[11px] font-apple-heavy uppercase tracking-[0.28em] text-slate-400">{title}</p>
              <p className="mt-3 text-5xl font-apple-heavy tracking-tight text-slate-950">{value}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-apple-medium text-slate-500">{hint}</p>
                <ArrowRight className="h-4 w-4 shrink-0 text-slate-400" />
              </div>
            </Link>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <p className="text-[11px] font-apple-heavy uppercase tracking-[0.28em] text-slate-400">Career Signal</p>
            <h2 className="mt-3 text-3xl font-apple-heavy tracking-tight text-slate-950 md:text-4xl">
              Your current signal is {band.toLowerCase()}.
            </h2>
            <p className="mt-4 max-w-2xl text-base font-apple-medium leading-7 text-slate-500">
              TalentXcel is tracking your score, applications, learning path, and network momentum in one place so you can move with less noise.
            </p>

            <div className="mt-8 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-3 rounded-full bg-blue-600 transition-all"
                style={{ width: `${Math.max(8, Math.min(100, Math.round((score / 1000) * 100)))}%` }}
              />
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-[11px] font-apple-heavy uppercase tracking-[0.24em] text-slate-400">Applications</p>
                <p className="mt-2 text-3xl font-apple-heavy tracking-tight text-slate-950">{overview.applications}</p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-[11px] font-apple-heavy uppercase tracking-[0.24em] text-slate-400">Current Company</p>
                <p className="mt-2 text-lg font-apple-heavy tracking-tight text-slate-950">
                  {overview.profile?.current_company || 'Add current role'}
                </p>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-5">
                <p className="text-[11px] font-apple-heavy uppercase tracking-[0.24em] text-slate-400">Location</p>
                <p className="mt-2 text-lg font-apple-heavy tracking-tight text-slate-950">
                  {overview.profile?.location || 'Set your target city'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-slate-950 p-6 text-white shadow-lg md:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-white/10 text-blue-300">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] font-apple-heavy uppercase tracking-[0.28em] text-slate-400">Career Moves</p>
                <h3 className="mt-1 text-2xl font-apple-heavy tracking-tight">What to do next</h3>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {nextMoves.map((item) => (
                <Link
                  key={item.id}
                  to={item.route}
                  className="block rounded-[24px] border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-apple-heavy tracking-tight text-white">{item.title}</p>
                      <p className="mt-2 text-sm font-apple-medium leading-6 text-slate-300">{item.description}</p>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
