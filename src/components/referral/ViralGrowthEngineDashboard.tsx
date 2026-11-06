import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { trackShareClick } from '@/utils/referralTracker';
import { toast } from 'sonner';
import QRCode from 'qrcode';
import { QRCodeSVG } from 'qrcode.react';
import {
  Users,
  Gift,
  Copy,
  Share2,
  MessageCircle,
  Linkedin,
  Twitter,
  Send,
  TrendingUp,
  CheckCircle,
  Trophy,
  Flame,
  Award,
  Zap,
  Target,
  Globe,
  Mail,
  QrCode,
  ExternalLink,
  Star,
  ArrowRight,
  UserPlus,
  Sparkles,
  BarChart3,
  Medal,
  Clock,
  CircleDot,
  RefreshCw,
  Download,
  ShieldCheck,
  MousePointerClick,
  UserCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReferralChannel, UserMissionProgressRPC, UserLeaderboardEntryRPC } from '@/types/growthEngine';

const fmt = (n: number) => (n ?? 0).toLocaleString();

// ─── Shared Network Tiers & Milestones ──────────────────────────────────────
export const NETWORK_TIERS = [
  { min: 0, max: 2, label: 'Starter', badge: 'bg-slate-100 text-slate-700 border-slate-200' },
  { min: 3, max: 9, label: 'Builder', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
  { min: 10, max: 24, label: 'Ambassador', badge: 'bg-purple-100 text-purple-700 border-purple-200' },
  { min: 25, max: Infinity, label: 'Champion', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
];

export const getTierFromCount = (count: number) => {
  return NETWORK_TIERS.find(t => count >= t.min && count <= t.max) || NETWORK_TIERS[0];
};

const SHARE_MESSAGE = "I'm building my professional career on TalentXcel. Join me to unlock your Career Passport, skill certifications and verified network. 🚀";

const SHARE_PLATFORMS: Array<{
  id: ReferralChannel;
  label: string;
  color: string;
  textColor: string;
  icon: React.ElementType;
  build: (url: string, msg: string) => string;
}> = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: 'bg-green-500 hover:bg-green-600',
    textColor: 'text-white',
    icon: MessageCircle,
    build: (url, msg) => `https://wa.me/?text=${encodeURIComponent(msg + '\n' + url)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    color: 'bg-sky-500 hover:bg-sky-600',
    textColor: 'text-white',
    icon: Send,
    build: (url, msg) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(msg)}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    color: 'bg-blue-700 hover:bg-blue-800',
    textColor: 'text-white',
    icon: Linkedin,
    build: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'x',
    label: 'X / Twitter',
    color: 'bg-slate-900 hover:bg-black',
    textColor: 'text-white',
    icon: Twitter,
    build: (url, msg) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-white',
    icon: Globe,
    build: (url, msg) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(msg)}`,
  },
  {
    id: 'email',
    label: 'Email',
    color: 'bg-slate-500 hover:bg-slate-600',
    textColor: 'text-white',
    icon: Mail,
    build: (url, msg) => `mailto:?subject=${encodeURIComponent('Join me on TalentXcel')}&body=${encodeURIComponent(msg + '\n\n' + url)}`,
  },
];

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  accent?: string;
}> = ({ label, value, icon: Icon, sub, accent = 'text-blue-600' }) => (
  <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
    <CardContent className="p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider truncate">{label}</p>
          <p className={cn("text-2xl font-black mt-0.5 leading-none", accent)}>{value}</p>
          {sub && <p className="text-[10px] text-muted-foreground mt-1 truncate">{sub}</p>}
        </div>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-muted/40 shrink-0">
          <Icon className={cn("h-4 w-4", accent)} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ViralGrowthEngineDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [referralCode, setReferralCode] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && user?.id) {
      return 'TXC' + user.id.replace(/-/g, '').slice(0, 8).toUpperCase();
    }
    return null;
  });

  useEffect(() => {
    if (user?.id && !referralCode) {
      setReferralCode('TXC' + user.id.replace(/-/g, '').slice(0, 8).toUpperCase());
    }
  }, [user?.id, referralCode]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [claimingKey, setClaimingKey] = useState<string | null>(null);

  // Live state & freshness
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Real-time data payloads
  const [stats, setStats] = useState({
    totalInvited: 0,
    completed: 0,
    pending: 0,
    expired: 0,
    totalRewards: 0,
    currentStreak: 0,
    tier: 'Starter',
  });

  const [funnel, setFunnel] = useState({
    linkOpens: 0,
    signups: 0,
    emailVerified: 0,
    activated: 0,
    qualified: 0,
    expired: 0,
  });

  const [missions, setMissions] = useState<UserMissionProgressRPC[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserLeaderboardEntryRPC[]>([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'week' | 'month' | 'all'>('week');
  const [referralsList, setReferralsList] = useState<Array<{
    id: string;
    referred_id: string | null;
    status: string;
    created_at: string;
    reward_amount: number;
  }>>([]);

  // Ticking time for live indicator
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // 1. Fetch or create user's referral code with dual-table & deterministic safety
  const loadReferralCode = useCallback(async () => {
    if (!user?.id) return null;
    const deterministicCode = 'TXC' + user.id.replace(/-/g, '').slice(0, 8).toUpperCase();

    try {
      // Check user_referrals table (real Supabase table)
      const { data: uRef } = await supabase
        .from('user_referrals')
        .select('referral_code')
        .eq('referrer_id', user.id)
        .maybeSingle();

      if (uRef?.referral_code) {
        setReferralCode(uRef.referral_code);
        return uRef.referral_code;
      }

      // Check profiles table
      const { data: prof } = await supabase
        .from('profiles')
        .select('referral_code')
        .eq('id', user.id)
        .maybeSingle();

      if (prof?.referral_code) {
        setReferralCode(prof.referral_code);
        return prof.referral_code;
      }

      // Insert into user_referrals if not present
      const { data: created } = await supabase
        .from('user_referrals')
        .insert({
          referrer_id: user.id,
          referral_code: deterministicCode,
          total_referrals: 0,
          successful_referrals: 0,
          is_active: true
        })
        .select('referral_code')
        .maybeSingle();

      const finalCode = created?.referral_code || deterministicCode;
      setReferralCode(finalCode);
      return finalCode;
    } catch (e) {
      console.warn('Notice in loadReferralCode (using clean deterministic code):', e);
      setReferralCode(deterministicCode);
      return deterministicCode;
    }
  }, [user?.id]);

  // 2. Hydrate dashboard from RPCs with graceful query fallbacks
  const hydrateDashboard = useCallback(async () => {
    if (!user?.id) return;
    setIsRefreshing(true);

    try {
      // A. Stats RPC (or fallback)
      const { data: rpcStats, error: statsError } = await supabase.rpc('get_my_referral_stats');
      if (!statsError && rpcStats && rpcStats.length > 0) {
        const s = rpcStats[0];
        setStats({
          totalInvited: Number(s.total_invited) || 0,
          completed: Number(s.completed) || 0,
          pending: Number(s.pending) || 0,
          expired: Number(s.expired) || 0,
          totalRewards: Number(s.total_rewards) || 0,
          currentStreak: Number(s.current_streak) || 0,
          tier: s.tier || 'Starter',
        });
      } else {
        // Direct query fallback
        const { data: rows } = await supabase
          .from('referrals')
          .select('id, status, reward_amount')
          .eq('referrer_id', user.id);
        const r = rows || [];
        const completed = r.filter(x => x.status === 'completed').length;
        setStats({
          totalInvited: r.length,
          completed,
          pending: r.filter(x => x.status === 'pending').length,
          expired: r.filter(x => x.status === 'expired').length,
          totalRewards: r.filter(x => x.status === 'completed').reduce((sum, x) => sum + (x.reward_amount || 0), 0),
          currentStreak: 0,
          tier: getTierFromCount(completed).label,
        });
      }

      // B. Funnel RPC (or fallback)
      const { data: rpcFunnel, error: funnelError } = await supabase.rpc('get_my_referral_funnel');
      if (!funnelError && rpcFunnel && rpcFunnel.length > 0) {
        const f = rpcFunnel[0];
        setFunnel({
          linkOpens: Number(f.link_opens) || 0,
          signups: Number(f.signups) || 0,
          emailVerified: Number(f.email_verified) || 0,
          activated: Number(f.activated) || 0,
          qualified: Number(f.qualified) || 0,
          expired: Number(f.expired) || 0,
        });
      } else {
        // Direct query fallback for funnel
        const { count: opensCount } = await supabase
          .from('referral_share_events')
          .select('*', { count: 'exact', head: true })
          .eq('referrer_id', user.id)
          .eq('event_type', 'link_open');

        const { data: refRows } = await supabase
          .from('referrals')
          .select('status, referred_id, reward_status')
          .eq('referrer_id', user.id);

        const refs = refRows || [];
        setFunnel({
          linkOpens: opensCount || 0,
          signups: refs.length,
          emailVerified: refs.filter(x => x.referred_id !== null).length,
          activated: refs.filter(x => x.status === 'completed').length,
          qualified: refs.filter(x => x.status === 'completed').length,
          expired: refs.filter(x => x.status === 'expired').length,
        });
      }

      // C. Missions RPC
      const { data: rpcMissions } = await supabase.rpc('get_my_mission_progress');
      if (rpcMissions && rpcMissions.length > 0) {
        setMissions(rpcMissions);
      } else {
        // Fallback default mission cards
        const { data: dbMissions } = await supabase
          .from('referral_missions')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (dbMissions) {
          setMissions(
            dbMissions.map(m => ({
              mission_id: m.id,
              key: m.key,
              title: m.title,
              description: m.description,
              target: m.threshold,
              current_progress: Math.min(stats.completed, m.threshold),
              reward_txc: m.reward_txc,
              period: m.period,
              is_claimed: false,
              can_claim: stats.completed >= m.threshold,
            }))
          );
        }
      }

      // D. Direct Referrals list (Privacy-safe: no raw emails)
      const { data: recentRefs } = await supabase
        .from('referrals')
        .select('id, referred_id, status, created_at, reward_amount')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      setReferralsList(recentRefs || []);

      setLastUpdated(new Date());
    } catch (err) {
      console.warn('Hydration warning:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [user?.id, stats.completed]);

  // E. Leaderboard RPC
  const loadLeaderboard = useCallback(async () => {
    try {
      const { data: rpcLeaders, error } = await supabase.rpc('get_referral_leaderboard', {
        p_period: leaderboardPeriod,
        p_limit: 10,
      });

      if (!error && rpcLeaders) {
        setLeaderboard(rpcLeaders);
      } else {
        setLeaderboard([]);
      }
    } catch {
      setLeaderboard([]);
    }
  }, [leaderboardPeriod]);

  // Mount effects
  useEffect(() => {
    loadReferralCode();
    hydrateDashboard();
  }, [loadReferralCode, hydrateDashboard]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Real-time invalidation channel
  useEffect(() => {
    if (!user?.id) return;

    let debounceTimer: ReturnType<typeof setTimeout>;
    const triggerDebouncedRefresh = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        hydrateDashboard();
        loadLeaderboard();
      }, 350);
    };

    const channel = supabase
      .channel(`growth-user-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'referrals', filter: `referrer_id=eq.${user.id}` }, triggerDebouncedRefresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'referral_share_events', filter: `referrer_id=eq.${user.id}` }, triggerDebouncedRefresh)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'referral_mission_claims', filter: `user_id=eq.${user.id}` }, triggerDebouncedRefresh)
      .subscribe();

    // Fallback polling every 45s in case WebSocket drops
    const fallbackPoll = setInterval(() => {
      hydrateDashboard();
    }, 45000);

    return () => {
      clearTimeout(debounceTimer);
      clearInterval(fallbackPoll);
      supabase.removeChannel(channel);
    };
  }, [user?.id, hydrateDashboard, loadLeaderboard]);

  // Helper for generating referral URL with channel utm
  const buildReferralUrl = useCallback((channel: ReferralChannel) => {
    const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const base = isLocal ? 'https://talentxcel.in' : (typeof window !== 'undefined' ? window.location.origin : 'https://talentxcel.in');
    const codeParam = referralCode ? `&ref=${encodeURIComponent(referralCode)}` : '';
    return `${base}/network?tab=refer-and-earn${codeParam}&utm_source=${channel}&utm_medium=referral`;
  }, [referralCode]);

  // Copy handler
  const handleCopyLink = useCallback(async (channel: ReferralChannel = 'copy') => {
    const url = buildReferralUrl(channel);
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      toast.success('Referral link copied to clipboard!');
      trackShareClick(referralCode!, channel);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error('Could not copy link automatically');
    }
  }, [buildReferralUrl, referralCode]);

  // Social share dispatcher
  const handleShare = useCallback((platform: typeof SHARE_PLATFORMS[0]) => {
    const url = buildReferralUrl(platform.id);
    if (referralCode) {
      trackShareClick(referralCode, platform.id);
    }
    window.open(platform.build(url, SHARE_MESSAGE), '_blank', 'noopener,noreferrer');
  }, [referralCode, buildReferralUrl]);

  // Native device share
  const handleNativeShare = useCallback(async () => {
    if (!referralCode) return;
    const url = buildReferralUrl('native');
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'Join TalentXcel',
          text: SHARE_MESSAGE,
          url,
        });
        trackShareClick(referralCode, 'native');
      } catch {
        // User cancelled
      }
    } else {
      handleCopyLink('copy');
    }
  }, [referralCode, buildReferralUrl, handleCopyLink]);

  // QR Code generator
  useEffect(() => {
    if (showQR && referralCode) {
      const url = buildReferralUrl('qr');
      QRCode.toDataURL(url, {
        width: 320,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
      }).then(setQrDataUrl).catch(() => {});
    }
  }, [showQR, referralCode, buildReferralUrl]);

  // Claim Mission Reward
  const handleClaimMission = useCallback(async (missionId: string, missionKey: string) => {
    setClaimingKey(missionKey);
    try {
      const { data, error } = await supabase.functions.invoke('claim-referral-mission', {
        body: { mission_id: missionId, period_key: 'lifetime' },
      });

      if (error || !data?.success) {
        toast.error(data?.error || 'Could not claim reward at this time');
      } else {
        toast.success(`Reward claimed! +${data.reward_txc} TXC added to your balance.`);
        hydrateDashboard();
      }
    } catch {
      toast.error('Network error during reward claim');
    } finally {
      setClaimingKey(null);
    }
  }, [hydrateDashboard]);

  // Derived funnel rates
  const linkToSignupRate = funnel.linkOpens > 0
    ? Math.round((funnel.signups / funnel.linkOpens) * 100)
    : 0;
  const completionRate = funnel.signups > 0
    ? Math.round((funnel.qualified / funnel.signups) * 100)
    : 0;

  const currentTierInfo = getTierFromCount(stats.completed);

  return (
    <div className="w-full space-y-4">

      {/* ── Header Row with Live Indicator ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-border/40">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight flex items-center gap-2">
            Refer &amp; Earn <span className="text-blue-600">🎁</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Turn your network into TalentXcel's next million users
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Live indicator badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Live ({secondsAgo}s ago)</span>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => { hydrateDashboard(); loadLeaderboard(); }}
            disabled={isRefreshing}
            className="h-7 w-7 p-0 rounded-full"
            title="Refresh now"
          >
            <RefreshCw className={cn("h-3.5 w-3.5 text-muted-foreground", isRefreshing && "animate-spin text-blue-600")} />
          </Button>

          {stats.currentStreak > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              <span className="text-xs font-bold text-orange-600">{stats.currentStreak}d streak</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs Navigation ──────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full h-auto p-1 grid grid-cols-5 gap-0.5 bg-slate-100 dark:bg-muted/50 rounded-xl">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'share', label: 'Share', icon: Share2 },
            { id: 'missions', label: 'Missions', icon: Target },
            { id: 'achievements', label: 'Awards', icon: Trophy },
            { id: 'community', label: 'Network', icon: Users },
          ].map(tab => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex flex-col items-center gap-0.5 py-1.5 px-1 text-[10px] font-bold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-card data-[state=active]:shadow-xs data-[state=active]:text-blue-600"
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── A. GROWTH OVERVIEW ──────────────────────────────────────────── */}
        <TabsContent value="overview" className="mt-3 space-y-3">
          {/* 6 Real Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            <MetricCard
              label="Total Invited"
              value={fmt(stats.totalInvited)}
              icon={UserPlus}
              sub="Direct invitations"
              accent="text-blue-600"
            />
            <MetricCard
              label="Joined"
              value={fmt(stats.completed)}
              icon={CheckCircle}
              sub="Completed registration"
              accent="text-emerald-600"
            />
            <MetricCard
              label="Pending"
              value={fmt(stats.pending)}
              icon={Clock}
              sub="Awaiting verification"
              accent="text-amber-600"
            />
            <MetricCard
              label="Link-to-Signup"
              value={funnel.linkOpens > 0 ? `${linkToSignupRate}%` : '—'}
              icon={TrendingUp}
              sub={`${funnel.signups}/${funnel.linkOpens} visitors registered`}
              accent="text-indigo-600"
            />
            <MetricCard
              label="Completion Rate"
              value={funnel.signups > 0 ? `${completionRate}%` : '—'}
              icon={ShieldCheck}
              sub={`${funnel.qualified}/${funnel.signups} fully qualified`}
              accent="text-purple-600"
            />
            <MetricCard
              label="TXC Rewards"
              value={fmt(stats.totalRewards)}
              icon={Sparkles}
              sub="Platform credits earned"
              accent="text-yellow-600"
            />
          </div>

          {/* Tier Status Card */}
          <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40">
                    <Medal className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground">Your Network Tier</p>
                      <Badge className={cn("text-[9px] font-bold border", currentTierInfo.badge)}>
                        {currentTierInfo.label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {currentTierInfo.max === Infinity
                        ? 'Highest tier unlocked! You are a community leader.'
                        : `${currentTierInfo.max - stats.completed + 1} more qualified referral(s) to reach next tier`}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold text-blue-600 border-blue-200 bg-blue-50">
                  {stats.completed} Done
                </Badge>
              </div>
              <Progress
                value={
                  currentTierInfo.max === Infinity
                    ? 100
                    : Math.min(100, Math.round(((stats.completed - currentTierInfo.min) / (currentTierInfo.max - currentTierInfo.min + 1)) * 100))
                }
                className="h-2 bg-slate-100 dark:bg-muted"
              />
              <p className="text-[11px] text-muted-foreground">
                Qualified referrals require the referred member to complete registration and email verification. Rewards are issued as platform credits.
              </p>
            </CardContent>
          </Card>

          {/* 5-Stage Live Referral Funnel */}
          <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
            <CardHeader className="pb-2 p-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Your Referral Journey Funnel
                </CardTitle>
                {funnel.expired > 0 && (
                  <Badge variant="outline" className="text-[10px] text-red-600 border-red-200 bg-red-50">
                    {funnel.expired} Expired
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {[
                { label: 'Link Opened', count: funnel.linkOpens, icon: MousePointerClick, color: 'text-blue-500 bg-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
                { label: 'Signed Up', count: funnel.signups, icon: UserPlus, color: 'text-indigo-500 bg-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
                { label: 'Email Verified', count: funnel.emailVerified, icon: ShieldCheck, color: 'text-cyan-500 bg-cyan-500', bg: 'bg-cyan-50 dark:bg-cyan-950/40' },
                { label: 'Profile Activated', count: funnel.activated, icon: UserCheck, color: 'text-emerald-500 bg-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
                { label: 'Reward Qualified', count: funnel.qualified, icon: Gift, color: 'text-amber-500 bg-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
              ].map((stage) => {
                const maxVal = Math.max(funnel.linkOpens, funnel.signups, 1);
                const stagePct = Math.min(100, Math.round((stage.count / maxVal) * 100));
                return (
                  <div key={stage.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-2">
                        <div className={cn("p-1 rounded-md", stage.bg)}>
                          <stage.icon className={cn("h-3 w-3", stage.color.split(' ')[0])} />
                        </div>
                        {stage.label}
                      </span>
                      <span className="font-bold text-foreground">
                        {fmt(stage.count)}
                        <span className="text-[10px] text-muted-foreground ml-1 font-normal">
                          ({stagePct}%)
                        </span>
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", stage.color.split(' ')[1])}
                        style={{ width: `${stagePct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <p className="text-[10px] text-muted-foreground pt-1 italic">
                All metrics are computed in real time from database attribution logs. India DPDP privacy compliant.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── B. SHARE STUDIO ────────────────────────────────────────────── */}
        <TabsContent value="share" className="mt-3 space-y-3">
          {/* Referral Link & Message Card */}
          <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                Your Personal Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-muted/40 rounded-lg border border-slate-200/80 dark:border-border/40">
                <code className="flex-1 text-xs font-mono text-muted-foreground truncate">
                  {buildReferralUrl('direct') || 'Generating your referral link…'}
                </code>
                <Button
                  size="sm"
                  onClick={() => handleCopyLink('copy')}
                  className={cn(
                    "h-7 px-3 text-xs font-bold rounded-lg shrink-0 transition-all",
                    copiedLink ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  {copiedLink ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Copied!</>
                  ) : (
                    <><Copy className="h-3 w-3 mr-1" /> Copy</>
                  )}
                </Button>
              </div>

              {referralCode && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold">Your Referral Code:</span>
                  <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-muted font-mono font-bold text-foreground tracking-wider">
                    {referralCode}
                  </code>
                </div>
              )}

              {/* Personal invitation message preview */}
              <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40 space-y-2">
                <p className="text-[11px] font-bold text-blue-900 dark:text-blue-200">Pre-written Invitation Message:</p>
                <p className="text-xs text-blue-800 dark:text-blue-300 italic leading-relaxed">
                  "{SHARE_MESSAGE}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    const msg = `${SHARE_MESSAGE}\n\n${buildReferralUrl('copy')}`;
                    await navigator.clipboard.writeText(msg);
                    toast.success('Message and link copied to clipboard!');
                    trackShareClick(referralCode!, 'copy');
                  }}
                  className="h-6 px-2 text-[10px] text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900 font-bold"
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy Full Message
                </Button>
              </div>

              {/* QR Code toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(!showQR)}
                className="w-full h-8 text-xs font-bold border-slate-200 dark:border-border/60 hover:bg-slate-50"
              >
                <QrCode className="h-3.5 w-3.5 mr-1.5" />
                {showQR ? 'Hide QR Code' : 'Show Offline QR Code'}
              </Button>

              {showQR && (
                <div className="flex flex-col items-center gap-3 p-4 bg-slate-50 dark:bg-muted/30 rounded-xl border border-slate-200/80 dark:border-border/40">
                  <div className="bg-white p-3 rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
                    <QRCodeSVG
                      id="referral-qr-svg"
                      value={buildReferralUrl('qr') || `https://talentxcel.in/network?tab=refer-and-earn&ref=${referralCode || 'TXC'}`}
                      size={180}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Scan to open your referral link directly on mobile
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const svg = document.getElementById('referral-qr-svg');
                      if (svg) {
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const canvas = document.createElement('canvas');
                        canvas.width = 400;
                        canvas.height = 400;
                        const ctx = canvas.getContext('2d');
                        const img = new (window as any).Image();
                        img.onload = () => {
                          if (ctx) {
                            ctx.fillStyle = '#ffffff';
                            ctx.fillRect(0, 0, 400, 400);
                            ctx.drawImage(img, 20, 20, 360, 360);
                            const pngFile = canvas.toDataURL('image/png');
                            const downloadLink = document.createElement('a');
                            downloadLink.download = `talentxcel-referral-${referralCode || 'qr'}.png`;
                            downloadLink.href = pngFile;
                            downloadLink.click();
                            toast.success('QR Code downloaded successfully!');
                          }
                        };
                        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-lg transition-all"
                  >
                    <Download className="h-3.5 w-3.5" /> Download QR (PNG)
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Platform Share Grid (WhatsApp First) */}
          <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Share2 className="h-4 w-4 text-blue-600" />
                One-Click Share Studio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {/* Native device share for mobile */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <Button
                  onClick={handleNativeShare}
                  className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share via Device
                </Button>
              )}

              {/* 6 Platforms Grid */}
              <div className="grid grid-cols-2 gap-2">
                {SHARE_PLATFORMS.map(platform => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(platform)}
                    className={cn(
                      "h-9 justify-start text-xs font-bold gap-2 rounded-lg border-0",
                      platform.color,
                      platform.textColor
                    )}
                  >
                    <platform.icon className="h-3.5 w-3.5 shrink-0" />
                    {platform.label}
                  </Button>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">💡 Professional Tip:</p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400">
                  Sharing in professional alumni groups and Telegram communities yields up to 3× higher conversion into verified members.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── C. GROWTH MISSIONS ─────────────────────────────────────────── */}
        <TabsContent value="missions" className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground font-medium">Complete growth missions to claim TXC platform credits</p>
          </div>

          {missions.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground bg-white dark:bg-card rounded-xl border border-dashed">
              No active growth missions at this time.
            </div>
          ) : (
            missions.map(mission => {
              const current = Number(mission.current_progress) || 0;
              const target = Number(mission.target) || 1;
              const pct = Math.min(100, Math.round((current / target) * 100));
              const isClaimed = mission.is_claimed;
              const canClaim = mission.can_claim && !isClaimed;

              return (
                <Card
                  key={mission.mission_id || mission.key}
                  className={cn(
                    "border shadow-xs rounded-xl transition-all",
                    isClaimed
                      ? "border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800/60"
                      : "border-slate-200/80 dark:border-border/60 bg-white dark:bg-card"
                  )}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground leading-tight">{mission.title}</p>
                          <Badge variant="outline" className="text-[9px] font-bold text-blue-600 border-blue-200 bg-blue-50">
                            +{fmt(mission.reward_txc)} TXC
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{mission.description}</p>

                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <span>Progress</span>
                            <span className="font-bold">{current} / {target}</span>
                          </div>
                          <Progress
                            value={pct}
                            className={cn("h-1.5", isClaimed ? "bg-emerald-100" : "bg-slate-100")}
                          />
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center pt-1">
                        {isClaimed ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] h-6">
                            <CheckCircle className="h-3 w-3 mr-1" /> Claimed
                          </Badge>
                        ) : canClaim ? (
                          <Button
                            size="sm"
                            onClick={() => handleClaimMission(mission.mission_id, mission.key)}
                            disabled={claimingKey === mission.key}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold h-7 px-3 rounded-lg"
                          >
                            {claimingKey === mission.key ? 'Claiming…' : 'Claim Reward'}
                          </Button>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground border-slate-200">
                            {pct}% Done
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* ── D. AWARDS & LEADERBOARD ────────────────────────────────────── */}
        <TabsContent value="achievements" className="mt-3 space-y-3">
          {/* Milestone Badges */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Achievement Milestones</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { title: 'First Steps', req: '1 referral', unlocked: stats.completed >= 1, reward: '500 TXC', icon: '🎯' },
                { title: 'Network Builder', req: '5 referrals', unlocked: stats.completed >= 5, reward: '1,500 TXC', icon: '🦋' },
                { title: 'Streak Master', req: '7-day streak', unlocked: stats.currentStreak >= 7, reward: '5,000 TXC', icon: '⚡' },
                { title: 'Career Ambassador', req: '25 referrals', unlocked: stats.completed >= 25, reward: 'Champion Badge', icon: '🌟' },
              ].map(badge => (
                <div
                  key={badge.title}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    badge.unlocked
                      ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                      : "bg-white dark:bg-card border-slate-200/60 opacity-70"
                  )}
                >
                  <span className="text-2xl shrink-0">{badge.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground truncate">{badge.title}</p>
                    <p className="text-[10px] text-muted-foreground">{badge.req} · {badge.reward}</p>
                  </div>
                  {badge.unlocked ? (
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                  ) : (
                    <CircleDot className="h-4 w-4 text-slate-300 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Masked Leaderboard */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Community Leaders</p>
              <div className="flex gap-1">
                {(['week', 'month', 'all'] as const).map(p => (
                  <Button
                    key={p}
                    size="sm"
                    variant={leaderboardPeriod === p ? 'default' : 'outline'}
                    onClick={() => setLeaderboardPeriod(p)}
                    className="h-6 px-2 text-[10px] font-bold"
                  >
                    {p === 'week' ? 'Weekly' : p === 'month' ? 'Monthly' : 'All-Time'}
                  </Button>
                ))}
              </div>
            </div>

            <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
              <CardContent className="p-0">
                {leaderboard.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground">
                    No qualified referrals recorded in this period yet. Share your link to take the lead!
                  </div>
                ) : (
                  leaderboard.map((entry, idx) => (
                    <div
                      key={entry.rank || idx}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5",
                        idx < leaderboard.length - 1 && "border-b border-slate-100 dark:border-border/30",
                        entry.is_me && "bg-blue-50/50 dark:bg-blue-950/30"
                      )}
                    >
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                        idx === 0 ? "bg-yellow-400 text-yellow-900" :
                        idx === 1 ? "bg-slate-300 text-slate-700" :
                        idx === 2 ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"
                      )}>
                        {entry.rank}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={cn("text-xs font-bold truncate", entry.is_me && "text-blue-600")}>
                          {entry.masked_label}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Verified Member</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-[9px] font-bold border-slate-200">
                          {entry.tier}
                        </Badge>
                        <Badge className="text-[10px] font-black bg-blue-50 text-blue-700 border border-blue-200">
                          {entry.count} referrals
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Privacy protected. Member identifiers are masked. Rankings are computed on verified activations only.
            </p>
          </div>
        </TabsContent>

        {/* ── E. MY PROFESSIONAL NETWORK ─────────────────────────────────── */}
        <TabsContent value="community" className="mt-3 space-y-3">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-2.5">
            <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-black text-blue-600">{fmt(stats.totalInvited)}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Invited</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-black text-emerald-600">{fmt(stats.completed)}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Activated</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-black text-amber-600">{fmt(stats.totalRewards)}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">TXC Earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Privacy-Safe Referral List */}
          <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Direct Invited Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {referralsList.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950/40 inline-flex">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-sm font-bold text-foreground">No referrals yet</p>
                  <p className="text-xs text-muted-foreground">Share your referral link with colleagues to build your network</p>
                  <Button
                    size="sm"
                    onClick={() => setActiveTab('share')}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-4 rounded-lg"
                  >
                    Share Your Link <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {referralsList.map(ref => (
                    <div
                      key={ref.id}
                      className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-border/30 last:border-0"
                    >
                      <div className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-black shrink-0",
                        ref.status === 'completed' ? "bg-emerald-500" : "bg-slate-400"
                      )}>
                        {ref.status === 'completed' ? <CheckCircle className="h-3.5 w-3.5" /> : <CircleDot className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">
                          {ref.referred_id ? `Member ${ref.referred_id.slice(0, 6).toUpperCase()}` : `Invited Contact ${ref.id.slice(0, 6)}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(ref.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          {' · '}
                          <span className={ref.status === 'completed' ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                            {ref.status === 'completed' ? 'Activated' : 'Pending Verification'}
                          </span>
                        </p>
                      </div>
                      {ref.status === 'completed' && ref.reward_amount > 0 && (
                        <Badge className="bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold shrink-0 h-5">
                          +{ref.reward_amount} TXC
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
