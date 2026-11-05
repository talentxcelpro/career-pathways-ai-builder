// ADMIN ONLY — This component is wrapped in AdminGuard which calls
// get_user_app_role() server-side via Supabase RPC. Regular users
// cannot reach this component through the admin route guard.
// All aggregates query the referrals table directly — no fabricated data.
// Individual user identity is masked in the leaderboard.

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AdminGuard } from '@/components/admin/AdminGuard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  TrendingUp,
  Users,
  Gift,
  Clock,
  Zap,
  BarChart3,
  Trophy,
  Target,
  AlertCircle,
  RefreshCw,
  Shield,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fmt = (n: number) => n.toLocaleString();
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

interface PlatformStats {
  total: number;
  completed: number;
  pending: number;
  expired: number;
  conversionRate: number;
  totalTXCIssued: number;
  uniqueReferrers: number;
  weeklyCompleted: number;
  weeklyReferrers: number;
  avgCycleHours: number | null;
}

interface LeaderEntry {
  referrer_id: string;
  count: number;
  txc: number;
}

interface MissionStat {
  id: string;
  title: string;
  target: number;
  reward: string;
  qualifiedUsers: number | null;
  note?: string;
}

const MISSIONS: MissionStat[] = [
  { id: 'invite_3', title: 'Invite 3 Colleagues', target: 3, reward: '500 TXC', qualifiedUsers: null },
  { id: 'invite_5', title: 'Invite 5 Classmates', target: 5, reward: '1,000 TXC', qualifiedUsers: null },
  { id: 'invite_10', title: 'Network Builder (10)', target: 10, reward: '3,000 TXC + Badge', qualifiedUsers: null },
  { id: 'share_passport', title: 'Share Career Passport', target: 1, reward: '250 TXC', qualifiedUsers: null, note: 'Phase 3: requires referral_share_events table' },
  { id: 'publish_article', title: 'Publish a Career Article', target: 1, reward: '300 TXC', qualifiedUsers: null, note: 'Phase 3: requires creator_events table' },
  { id: 'invite_recruiter', title: 'Invite a Recruiter', target: 1, reward: '1,500 TXC', qualifiedUsers: null, note: 'Phase 3: requires employer role tag on referred user' },
];

const getTierBadge = (count: number) => {
  if (count >= 25) return { label: 'Champion', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
  if (count >= 10) return { label: 'Ambassador', color: 'bg-purple-100 text-purple-800 border-purple-200' };
  if (count >= 3) return { label: 'Builder', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  return { label: 'Starter', color: 'bg-slate-100 text-slate-700 border-slate-200' };
};

const maskId = (id: string) => `User ${id.slice(0, 8)}`;

type Period = 'all' | 'month' | 'week';

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  accent?: string;
}> = ({ label, value, icon: Icon, sub, accent = 'text-blue-600' }) => (
  <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider truncate">{label}</p>
          <p className={cn("text-2xl font-black mt-0.5 leading-none", accent)}>{value}</p>
          {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-muted/40 shrink-0">
          <Icon className={cn("h-4 w-4", accent)} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const GrowthEngineAdminPanel: React.FC = () => {
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [missions, setMissions] = useState<MissionStat[]>(MISSIONS);
  const [leaderboard, setLeaderboard] = useState<LeaderEntry[]>([]);
  const [period, setPeriod] = useState<Period>('all');
  const [leaderLoading, setLeaderLoading] = useState(false);

  const getPeriodFilter = (p: Period) => {
    if (p === 'week') return new Date(Date.now() - 7 * 86400000).toISOString();
    if (p === 'month') return new Date(Date.now() - 30 * 86400000).toISOString();
    return null;
  };

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      // All-time counts from real referrals table
      const { data: allRows, error } = await supabase
        .from('referrals')
        .select('status, reward_amount, referrer_id, referred_at, completed_at, created_at');

      if (error) throw error;

      const rows = allRows || [];
      const total = rows.length;
      const completed = rows.filter(r => r.status === 'completed').length;
      const pending = rows.filter(r => r.status === 'pending').length;
      const expired = rows.filter(r => r.status === 'expired').length;
      const totalTXCIssued = rows
        .filter(r => r.status === 'completed' && r.reward_amount)
        .reduce((s, r) => s + (r.reward_amount || 0), 0);
      const uniqueReferrers = new Set(rows.map(r => r.referrer_id)).size;

      // Weekly
      const weekRows = rows.filter(r => r.referred_at >= weekAgo || r.created_at >= weekAgo);
      const weeklyCompleted = weekRows.filter(r => r.status === 'completed').length;
      const weeklyReferrers = new Set(weekRows.map(r => r.referrer_id)).size;

      // Avg cycle time (hours) for completed referrals that have both dates
      const cycleTimes = rows
        .filter(r => r.status === 'completed' && r.completed_at && r.referred_at)
        .map(r => (new Date(r.completed_at!).getTime() - new Date(r.referred_at!).getTime()) / 3600000);
      const avgCycleHours = cycleTimes.length > 0
        ? Math.round(cycleTimes.reduce((a, b) => a + b, 0) / cycleTimes.length)
        : null;

      setStats({
        total,
        completed,
        pending,
        expired,
        conversionRate: pct(completed, total),
        totalTXCIssued,
        uniqueReferrers,
        weeklyCompleted,
        weeklyReferrers,
        avgCycleHours,
      });

      // Mission stats (referral-based only)
      const referrerCounts = new Map<string, number>();
      rows.filter(r => r.status === 'completed').forEach(r => {
        referrerCounts.set(r.referrer_id, (referrerCounts.get(r.referrer_id) || 0) + 1);
      });
      const counts = Array.from(referrerCounts.values());
      setMissions(prev => prev.map(m => {
        if (m.note) return m; // Phase 3 missions
        const q = counts.filter(c => c >= m.target).length;
        return { ...m, qualifiedUsers: q };
      }));

    } catch (err) {
      console.error('Growth engine stats error:', err);
      toast.error('Could not load referral stats');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLeaderboard = useCallback(async () => {
    setLeaderLoading(true);
    try {
      const since = getPeriodFilter(period);
      let query = supabase
        .from('referrals')
        .select('referrer_id, reward_amount, created_at')
        .eq('status', 'completed');
      if (since) query = query.gte('created_at', since);

      const { data, error } = await query;
      if (error) throw error;

      // Aggregate client-side from real verified rows
      const map = new Map<string, { count: number; txc: number }>();
      (data || []).forEach(r => {
        const e = map.get(r.referrer_id) || { count: 0, txc: 0 };
        e.count++;
        e.txc += r.reward_amount || 0;
        map.set(r.referrer_id, e);
      });

      const sorted = Array.from(map.entries())
        .map(([referrer_id, v]) => ({ referrer_id, ...v }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setLeaderboard(sorted);
    } catch (err) {
      console.error('Leaderboard error:', err);
    } finally {
      setLeaderLoading(false);
    }
  }, [period]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadLeaderboard(); }, [loadLeaderboard]);

  const kFactor = stats && stats.weeklyReferrers > 0
    ? (stats.weeklyCompleted / stats.weeklyReferrers).toFixed(2)
    : '—';

  return (
    <AdminGuard>
      <div className="w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Growth Engine <span className="text-blue-600">— Admin Command Room</span>
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              Platform-wide referral analytics, viral coefficient (K-factor), mission performance, and verified rankings
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { loadStats(); loadLeaderboard(); }}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="w-full h-auto p-1 grid grid-cols-4 gap-0.5 bg-slate-100 dark:bg-muted/50 rounded-xl">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'funnel', label: 'Funnel', icon: TrendingUp },
                { id: 'missions', label: 'Missions', icon: Target },
                { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
              ].map(t => (
                <TabsTrigger
                  key={t.id}
                  value={t.id}
                  className="flex flex-col items-center gap-0.5 py-1.5 px-1 text-[10px] font-bold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xs data-[state=active]:text-blue-600"
                >
                  <t.icon className="h-3.5 w-3.5" />
                  <span>{t.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── A. OVERVIEW ── */}
            <TabsContent value="overview" className="mt-3 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                <StatCard label="Total Referrals" value={fmt(stats?.total ?? 0)} icon={Users} sub="All-time direct" accent="text-blue-600" />
                <StatCard label="Completed" value={fmt(stats?.completed ?? 0)} icon={CheckCircle} sub="Qualified activation" accent="text-emerald-600" />
                <StatCard label="Pending" value={fmt(stats?.pending ?? 0)} icon={Clock} sub="Awaiting verification" accent="text-amber-600" />
                <StatCard label="Expired" value={fmt(stats?.expired ?? 0)} icon={AlertCircle} sub="Lapsed invites" accent="text-red-500" />
                <StatCard label="Conversion" value={`${stats?.conversionRate ?? 0}%`} icon={TrendingUp} sub="Completed / Total" accent="text-indigo-600" />
                <StatCard label="TXC Issued" value={fmt(stats?.totalTXCIssued ?? 0)} icon={Gift} sub="Platform credits" accent="text-yellow-600" />
                <StatCard label="Unique Referrers" value={fmt(stats?.uniqueReferrers ?? 0)} icon={Users} sub="Members who shared" accent="text-purple-600" />
                <StatCard
                  label="Avg Cycle Time"
                  value={stats?.avgCycleHours != null ? `${stats.avgCycleHours}h` : '—'}
                  icon={Clock}
                  sub="Invite → Completion"
                  accent="text-slate-600"
                />
              </div>

              {/* K-Factor */}
              <Card className="border border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 dark:from-blue-950/30 dark:to-indigo-950/20 shadow-xs rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-600 shrink-0">
                      <Zap className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-blue-900 dark:text-blue-100">Weekly Viral Coefficient (K-factor)</p>
                      <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">{kFactor}</p>
                      <p className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1">
                        = {stats?.weeklyCompleted ?? 0} completions this week ÷ {stats?.weeklyReferrers ?? 0} active referrers this week
                      </p>
                      <p className="text-[10px] text-blue-600/70 dark:text-blue-400/70 mt-1">
                        A sustained K above 1.0 indicates organic viral expansion without paid acquisition. Full multi-touch conversion attribution connects to referral_share_events in Phase 3.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── B. FUNNEL ── */}
            <TabsContent value="funnel" className="mt-3 space-y-3">
              <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
                <CardHeader className="pb-2 p-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    Platform-Wide Referral Funnel
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-4">
                  {[
                    {
                      label: 'Total Invited',
                      count: stats?.total ?? 0,
                      max: stats?.total ?? 1,
                      color: 'bg-blue-500',
                      icon: Users,
                      note: 'All recorded referral invitations in the database',
                    },
                    {
                      label: 'Registered (Pending)',
                      count: stats?.pending ?? 0,
                      max: stats?.total ?? 1,
                      color: 'bg-amber-500',
                      icon: Clock,
                      note: 'Records with status = pending awaiting profile/email verification',
                    },
                    {
                      label: 'Qualified (Completed)',
                      count: stats?.completed ?? 0,
                      max: stats?.total ?? 1,
                      color: 'bg-emerald-500',
                      icon: CheckCircle,
                      note: 'Records with status = completed where rewards have qualified',
                    },
                  ].map(stage => {
                    const p = pct(stage.count, stage.max);
                    return (
                      <div key={stage.label} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground flex items-center gap-1.5">
                            <stage.icon className="h-3.5 w-3.5 text-muted-foreground" />
                            {stage.label}
                          </span>
                          <span className="font-black text-foreground">{fmt(stage.count)} <span className="text-muted-foreground font-normal">({p}%)</span></span>
                        </div>
                        <Progress value={p} className={cn("h-3 bg-slate-100 dark:bg-muted")} />
                        <p className="text-[10px] text-muted-foreground">{stage.note}</p>
                      </div>
                    );
                  })}
                  <div className="mt-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40">
                    <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Planned Phase 3 Funnel Telemetry
                    </p>
                    <ul className="text-[10px] text-amber-700 dark:text-amber-400 space-y-0.5 list-disc list-inside">
                      <li>Link Click Events — requires referral_share_events table (Phase 3)</li>
                      <li>Email Verification Joins — requires server-side auth schema inspection</li>
                      <li>Career Passport Verification — requires join to career_passport records</li>
                      <li>First Professional Interaction — requires event telemetry bus</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ── C. MISSIONS ── */}
            <TabsContent value="missions" className="mt-3 space-y-2.5">
              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/40 mb-1">
                <p className="text-xs font-bold text-blue-800 dark:text-blue-300">Phase 2 Mission Audit — Read-only State</p>
                <p className="text-[10px] text-blue-700 dark:text-blue-400 mt-0.5">
                  Real-time mission qualification is calculated from verified rows. Full mission CRUD management (create, pause, budget allocation, expiration) is scheduled for Phase 3.
                </p>
              </div>
              {missions.map(m => (
                <Card key={m.id} className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
                  <CardContent className="p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">{m.title}</p>
                        <p className="text-[10px] text-muted-foreground">Target: {m.target} · Reward: {m.reward}</p>
                        {m.note ? (
                          <Badge variant="outline" className="mt-1.5 text-[9px] text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                            {m.note}
                          </Badge>
                        ) : (
                          <p className="text-xs text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                            {m.qualifiedUsers !== null ? `${fmt(m.qualifiedUsers)} users qualified` : 'Loading…'}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="shrink-0 text-[10px] font-bold text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                        {m.note ? 'Phase 3' : 'Active'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* ── D. LEADERBOARD ── */}
            <TabsContent value="leaderboard" className="mt-3 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Referrers (Verified)</p>
                <div className="flex gap-1">
                  {(['all', 'month', 'week'] as Period[]).map(p => (
                    <Button
                      key={p}
                      size="sm"
                      variant={period === p ? 'default' : 'outline'}
                      className="h-6 px-2.5 text-[10px] font-bold"
                      onClick={() => setPeriod(p)}
                    >
                      {p === 'all' ? 'All time' : p === 'month' ? 'Month' : 'Week'}
                    </Button>
                  ))}
                </div>
              </div>
              <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
                <CardContent className="p-0">
                  {leaderLoading ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">Loading verified rankings…</div>
                  ) : leaderboard.length === 0 ? (
                    <div className="p-6 text-center text-xs text-muted-foreground">No qualified referrals recorded in this period</div>
                  ) : (
                    leaderboard.map((entry, i) => {
                      const tier = getTierBadge(entry.count);
                      return (
                        <div
                          key={entry.referrer_id}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3",
                            i < leaderboard.length - 1 && "border-b border-slate-100 dark:border-border/30"
                          )}
                        >
                          <div className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                            i === 0 ? "bg-yellow-400 text-yellow-900" :
                            i === 1 ? "bg-slate-300 text-slate-700" :
                            i === 2 ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"
                          )}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-foreground">{maskId(entry.referrer_id)}</p>
                            <p className="text-[10px] text-muted-foreground">{fmt(entry.txc)} TXC earned</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={cn("text-[9px] border font-bold", tier.color)}>{tier.label}</Badge>
                            <Badge variant="outline" className="text-[10px] font-black text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-950/30">
                              {entry.count} qualified
                            </Badge>
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
              <p className="text-[10px] text-muted-foreground text-center">
                User IDs are masked for privacy compliance. Real identity inspection requires full super_admin role privilege.
              </p>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AdminGuard>
  );
};
