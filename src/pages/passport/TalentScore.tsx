import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Gauge,
  GraduationCap,
  LineChart,
  Network,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UserRound,
  Zap,
  Activity,
  Layers,
  Brain
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useTalentScore, TalentScoreCategory } from '@/hooks/useTalentScore';
import { useAuth } from '@/contexts/AuthContext';
import { updateMetaTags } from '@/utils/metaTags';

const categoryMeta: Record<string, {
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  accent: string;
}> = {
  skills: { icon: ShieldCheck, route: '/skills-verification', accent: 'text-blue-600' },
  experience: { icon: Briefcase, route: '/profile', accent: 'text-violet-600' },
  network: { icon: Network, route: '/network', accent: 'text-emerald-600' },
  learning: { icon: BookOpen, route: '/learning', accent: 'text-amber-600' },
  achievements: { icon: Award, route: '/achievements', accent: 'text-rose-600' },
};

const signalLabels: Record<string, string> = {
  profile_completion: 'Identity Hub completion',
  skills_count: 'Capability Matrix',
  verified_skills_count: 'Verified Capabilities',
  resumes_count: 'Identity Hubs',
  applications_count: 'Precision Matches',
  connections_count: 'Ecosystem Partners',
  enrollments_count: 'Synchronized Learning',
  completed_courses_count: 'Mastery Completed',
  certifications_count: 'Verified Credentials',
  achievements_count: 'Evolution Milestones',
  achievement_points: 'Intelligence Points',
};

function getDeltaView(delta: number) {
  if (delta > 0) {
    return {
      icon: TrendingUp,
      text: `+${delta}`,
      tone: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    };
  }

  if (delta < 0) {
    return {
      icon: TrendingDown,
      text: `${delta}`,
      tone: 'text-rose-600 bg-rose-50 border-rose-200',
    };
  }

  return {
    icon: CheckCircle2,
    text: 'Synchronized',
    tone: 'text-slate-600 bg-slate-50 border-slate-200',
  };
}

function getScoreTone(score: number) {
  if (score >= 850) return 'text-emerald-600';
  if (score >= 700) return 'text-blue-600';
  if (score >= 550) return 'text-amber-600';
  return 'text-slate-700';
}

function CategoryCard({ category }: { category: TalentScoreCategory }) {
  const meta = categoryMeta[category.key] ?? categoryMeta.skills;
  const Icon = meta.icon;
  const percent = Math.round((category.score / category.max) * 100);

  return (
    <Card className="overflow-hidden border-white/20 bg-white/80 backdrop-blur-xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group rounded-[32px] border">
      <CardContent className="p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-5">
            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-50 group-hover:bg-blue-50 transition-colors shadow-inner">
              <Icon className={`h-7 w-7 ${meta.accent}`} />
            </div>
            <div>
              <h3 className="font-apple-heavy text-slate-950 tracking-tight text-lg">{category.label}</h3>
              <p className="mt-2 text-xs font-apple-medium text-slate-500 line-clamp-2 leading-relaxed">{category.summary}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-apple-heavy text-slate-950">{category.score}</div>
            <div className="text-[10px] font-apple-bold uppercase tracking-widest text-slate-300">Max {category.max}</div>
          </div>
        </div>

        <div className="mt-8 relative h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute top-0 left-0 h-full bg-slate-950 transition-all duration-500 ease-out"
          />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {category.signals.slice(0, 3).map((signal) => (
            <Badge key={signal} variant="secondary" className="rounded-xl bg-slate-50 text-[10px] font-apple-heavy text-slate-500 border-slate-100 uppercase tracking-widest px-3 py-1">
              {signal}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center edge-to-edge">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-4 border-slate-950 border-t-transparent rounded-full animate-spin shadow-2xl" />
        <p className="text-slate-400 font-apple-heavy text-xs uppercase tracking-[0.3em]">Synchronizing Performance Index</p>
      </div>
    </div>
  );
}

export default function TalentScore() {
  const { user } = useAuth();
  const { talentScore, isLoading, error, recompute, isRecomputing } = useTalentScore();

  useEffect(() => {
    updateMetaTags({
      title: 'Performance Index | TalentXcel',
      description: 'Your professional performance index across capabilities, evolution, ecosystem, and synchronized learning.',
      url: `${window.location.origin}/talent-score`,
    });
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl flex items-center justify-center edge-to-edge">
        <Card className="mx-auto max-w-xl rounded-[40px] border-slate-200 bg-white shadow-2xl overflow-hidden border">
          <CardContent className="p-12 text-center space-y-8">
            <div className="w-20 h-20 mx-auto bg-slate-50 rounded-[28px] flex items-center justify-center shadow-inner">
              <Activity className="h-10 w-10 text-slate-300" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-apple-heavy text-slate-950 tracking-tight">Initialize Performance Index</h1>
              <p className="text-slate-500 font-apple-medium leading-relaxed">Sign in to synchronize your professional performance metrics with the TalentXcel ecosystem.</p>
            </div>
            <Button asChild className="w-full h-16 rounded-2xl bg-slate-950 text-white font-apple-heavy hover:scale-105 transition-all shadow-xl shadow-slate-950/20">
              <Link to="/auth/login text-lg">Activate Identity Hub</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) return <LoadingState />;

  if (error || !talentScore) {
    return (
      <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl flex items-center justify-center edge-to-edge">
        <Card className="mx-auto max-w-xl rounded-[40px] border-slate-200 bg-white shadow-2xl overflow-hidden border">
          <CardContent className="p-12 text-center space-y-8">
            <div className="w-20 h-20 mx-auto bg-slate-50 rounded-[28px] flex items-center justify-center shadow-inner">
              <RefreshCw className="h-10 w-10 text-amber-500" />
            </div>
            <div className="space-y-3">
              <h1 className="text-3xl font-apple-heavy text-slate-950 tracking-tight">Performance Syncing</h1>
              <p className="text-slate-500 font-apple-medium leading-relaxed">
                The performance engine is initializing. Please synchronize your professional telemetry.
              </p>
            </div>
            <Button onClick={() => recompute()} className="w-full h-16 rounded-2xl bg-slate-950 text-white font-apple-heavy hover:scale-105 transition-all" disabled={isRecomputing}>
              <RefreshCw className={`mr-3 h-6 w-6 ${isRecomputing ? 'animate-spin' : ''}`} />
              Synchronize Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deltaView = getDeltaView(talentScore.delta);
  const DeltaIcon = deltaView.icon;
  const lowestCategory = [...talentScore.breakdown].sort((a, b) => (a.score / a.max) - (b.score / b.max))[0];
  const scorePercent = Math.round((talentScore.score / 1000) * 100);

  return (
    <div className="min-h-screen bg-[#f6f8fb] pb-32 edge-to-edge">
      <div className="sticky top-0 z-[100] bg-white/80 backdrop-blur-3xl border-b border-slate-200/50">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-6 px-8 py-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-[24px] bg-slate-950 flex items-center justify-center shadow-2xl">
              <Activity className="h-8 w-8 text-white" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="rounded-lg bg-blue-600 text-white font-apple-heavy px-3 py-1 border-0 shadow-lg shadow-blue-500/20 text-[9px] uppercase tracking-widest">
                  <Sparkles className="mr-2 h-3 w-3" />
                  PERFORMANCE CORE
                </Badge>
                <Badge variant="outline" className="rounded-lg border-slate-200 text-slate-500 font-apple-heavy px-3 py-1 text-[9px] uppercase tracking-widest bg-white">
                  PRIVATE IDENTITY SYNC
                </Badge>
              </div>
              <h1 className="mt-3 text-4xl font-apple-heavy tracking-tighter text-slate-950 leading-none">
                Performance Index
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => recompute()} disabled={isRecomputing} variant="ghost" className="h-14 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all font-apple-heavy px-8">
              <RefreshCw className={`mr-3 h-5 w-5 ${isRecomputing ? 'animate-spin' : ''}`} />
              Sync Telemetry
            </Button>
            <Button asChild className="h-14 rounded-2xl bg-slate-950 text-white shadow-2xl shadow-slate-950/20 hover:scale-105 transition-all font-apple-heavy px-8">
              <Link to="/profile/passport">Evolution Hub</Link>
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto space-y-12 px-8 py-16">
        <section className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <Card className="rounded-[56px] border-white/20 bg-white shadow-2xl overflow-hidden relative border">
            <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
              <Gauge className="h-[400px] w-[400px] rotate-12" />
            </div>
            <CardContent className="p-12 sm:p-16 relative z-10">
              <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-xs font-apple-heavy uppercase tracking-[0.3em] text-slate-400 mb-8">Professional Index Metric</p>
                  <div className="flex items-baseline gap-6">
                    <span className={`text-[12rem] font-apple-heavy leading-none tracking-tighter ${getScoreTone(talentScore.score)}`}>
                      {talentScore.score}
                    </span>
                    <span className="text-4xl font-apple-heavy text-slate-300">/1000</span>
                  </div>
                  <div className="mt-12 flex flex-wrap items-center gap-4">
                    <Badge className="rounded-2xl bg-slate-950 text-white font-apple-heavy px-6 py-3 shadow-xl text-sm">
                      {talentScore.band}
                    </Badge>
                    <Badge variant="outline" className={`rounded-2xl border font-apple-heavy px-6 py-3 text-sm ${deltaView.tone}`}>
                      <DeltaIcon className="mr-3 h-5 w-5" />
                      {deltaView.text}
                    </Badge>
                    <div className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-apple-heavy text-slate-700">Top {100 - talentScore.percentile}% Elite</span>
                    </div>
                  </div>
                </div>

                <div className="w-full max-w-sm space-y-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-apple-heavy uppercase tracking-[0.2em] text-slate-400">Evolution progress</span>
                    <span className="text-xl font-apple-heavy text-slate-950">{scorePercent}%</span>
                  </div>
                  <div className="relative h-5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${scorePercent}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="absolute top-0 left-0 h-full bg-slate-950 shadow-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-6 shadow-sm">
                      <p className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 mb-2">Global Index</p>
                      <p className="text-3xl font-apple-heavy text-slate-950 tracking-tighter">{talentScore.percentile}th</p>
                    </div>
                    <div className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-6 shadow-sm">
                      <p className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 mb-2">Integrity</p>
                      <p className="text-3xl font-apple-heavy text-emerald-600 tracking-tighter">Verified</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-950 text-white rounded-[56px] overflow-hidden shadow-2xl relative group border-0">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-transparent pointer-events-none" />
            <CardHeader className="p-10 border-b border-white/10">
              <CardTitle className="flex items-center gap-4 text-xl font-apple-heavy tracking-tight">
                <Sparkles className="h-6 w-6 text-blue-400" />
                Intelligence Move
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-10">
              {talentScore.recommendations[0] ? (
                <>
                  <div className="space-y-4">
                    <h4 className="text-3xl font-apple-heavy tracking-tighter leading-tight">{talentScore.recommendations[0].title}</h4>
                    <p className="text-lg text-slate-400 leading-relaxed font-apple-medium">{talentScore.recommendations[0].description}</p>
                  </div>
                  <Button asChild className="w-full h-16 rounded-[24px] bg-white text-slate-950 hover:bg-slate-100 shadow-2xl transition-all duration-300 font-apple-heavy text-lg group">
                    <Link to={talentScore.recommendations[0].route}>
                      Execute Tactical Move
                      <ArrowRight className="ml-3 h-6 w-6 transition-transform group-hover:translate-x-2" />
                    </Link>
                  </Button>
                </>
              ) : (
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-10 text-center space-y-4">
                  <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
                  <p className="font-apple-heavy text-2xl tracking-tight">Roadmap Optimized</p>
                  <p className="text-base text-slate-400 font-apple-medium">Your professional signal is at peak synchronization.</p>
                </div>
              )}

              <div className="pt-10 border-t border-white/10 flex items-center justify-between">
                <div className="flex -space-x-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="h-10 w-10 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center text-[10px] font-bold shadow-lg">
                      {String.fromCharCode(64+i)}
                    </div>
                  ))}
                  <div className="h-10 w-10 rounded-full border-2 border-slate-950 bg-blue-600 flex items-center justify-center text-[10px] font-bold shadow-lg">
                    +12
                  </div>
                </div>
                <p className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-500">PEERS IN BAND</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Intelligence Matrix Suite */}
        <section className="space-y-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-apple-heavy tracking-tighter text-slate-950">Intelligence Matrix</h2>
              <p className="text-xs font-apple-heavy text-slate-400 uppercase tracking-[0.2em] mt-2">Analyze your index with synchronized intelligence models</p>
            </div>
            <Badge variant="outline" className="rounded-xl border-blue-600/20 bg-blue-50 text-blue-700 font-apple-heavy px-5 py-2 text-[10px] uppercase tracking-widest shadow-sm">
              MULTI-MODEL ANALYSIS ACTIVE
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { name: 'Gemini', icon: Sparkles, color: 'blue', desc: 'Deep multimodal analysis of your evolution roadmap and capabilities.' },
              { name: 'ChatGPT', icon: Activity, color: 'emerald', desc: 'Intelligence-powered coaching and strategic professional planning.' },
              { name: 'Claude', icon: Brain, color: 'amber', desc: 'Nuanced, high-fidelity reasoning for professional transitions.' }
            ].map((ai, idx) => (
              <Card key={idx} className="rounded-[40px] bg-white border border-slate-200/50 shadow-xl hover:shadow-2xl transition-all duration-500 group cursor-pointer overflow-hidden border">
                <CardContent className="p-10 text-center space-y-6">
                  <div className={`mx-auto h-20 w-20 rounded-[24px] bg-${ai.color}-50 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                    <ai.icon className={`h-10 w-10 text-${ai.color}-600`} />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-apple-heavy text-slate-950 text-xl tracking-tight">Analyze with {ai.name}</h3>
                    <p className="text-base font-apple-medium text-slate-500 leading-relaxed px-2">{ai.desc}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full h-14 rounded-2xl border-slate-200 font-apple-heavy hover:bg-slate-50 text-slate-900 shadow-sm"
                    onClick={() => {
                      const prompt = `I have a Performance Index of ${talentScore.score}/1000. Breakdown: ${talentScore.breakdown.map(b => `${b.label}: ${b.score}/${b.max}`).join(', ')}. Analyze my professional standing.`;
                      if (ai.name === 'Gemini') window.open(`https://gemini.google.com/app?prompt=${encodeURIComponent(prompt)}`);
                      if (ai.name === 'ChatGPT') window.open(`https://chatgpt.com/?q=${encodeURIComponent(prompt)}`);
                      if (ai.name === 'Claude') window.open(`https://claude.ai/new?q=${encodeURIComponent(prompt)}`);
                    }}
                  >
                    Open {ai.name} Hub
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-10">
          <div className="mb-10">
            <h2 className="text-3xl font-apple-heavy tracking-tighter text-slate-950">Intelligence Architecture</h2>
            <p className="text-xs font-apple-heavy text-slate-400 uppercase tracking-[0.2em] mt-2">Detailed breakdown of weighted professional signals</p>
          </div>
          <div className="grid gap-10 md:grid-cols-2 xl:grid-cols-5">
            {talentScore.breakdown.map((category) => (
              <CategoryCard key={category.key} category={category} />
            ))}
          </div>
        </section>

        <section className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="rounded-[48px] bg-white border border-slate-200/50 shadow-2xl overflow-hidden border">
            <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-4 text-xl font-apple-heavy tracking-tight">
                <Activity className="h-6 w-6 text-slate-950" />
                Intelligence Telemetry
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10">
              <div className="grid grid-cols-2 gap-6">
                {Object.entries(talentScore.signals).map(([key, value]) => (
                  <div key={key} className="rounded-[28px] border border-slate-100 bg-slate-50/50 p-6 transition-all hover:border-blue-200 hover:bg-white hover:shadow-xl group shadow-sm">
                    <p className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 group-hover:text-blue-600 transition-colors">{signalLabels[key] ?? key.replace(/_/g, ' ')}</p>
                    <p className="mt-3 text-3xl font-apple-heavy text-slate-950 tracking-tighter">{String(value ?? 0)}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[48px] bg-white border border-slate-200/50 shadow-2xl overflow-hidden border">
            <CardHeader className="p-8 border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="flex items-center gap-4 text-xl font-apple-heavy tracking-tight">
                <Target className="h-6 w-6 text-slate-950" />
                Evolution Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent className="p-10 space-y-6">
              {talentScore.recommendations.map((item) => {
                const meta = categoryMeta[item.category] ?? { icon: GraduationCap, accent: 'text-blue-600' };
                const Icon = meta.icon;

                return (
                  <Link
                    key={item.id}
                    to={item.route}
                    className="flex items-center justify-between gap-10 rounded-[32px] border border-slate-100 p-8 transition-all duration-300 hover:border-blue-200 hover:bg-white hover:shadow-2xl hover:-translate-x-2 group shadow-sm"
                  >
                    <div className="flex items-start gap-6">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-slate-50 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 transition-colors shadow-inner">
                        <Icon className={`h-8 w-8 ${meta.accent}`} />
                      </div>
                      <div className="space-y-2">
                        <p className="font-apple-heavy text-slate-950 text-xl tracking-tight">{item.title}</p>
                        <p className="text-base font-apple-medium text-slate-500 leading-relaxed max-w-md">{item.description}</p>
                      </div>
                    </div>
                    <div className="hidden shrink-0 text-right sm:block group-hover:translate-x-2 transition-transform">
                      <p className="text-3xl font-apple-heavy text-emerald-600 tracking-tighter">+{item.impact}</p>
                      <p className="text-[10px] font-apple-heavy uppercase tracking-widest text-slate-400">Impact</p>
                    </div>
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
