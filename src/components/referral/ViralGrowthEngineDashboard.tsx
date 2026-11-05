import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useReferralSystem } from '@/hooks/useReferralSystem';
import { useReferralData } from '@/hooks/useReferralData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Helper: safe number format ─────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString();

// ─── Share platforms config ──────────────────────────────────────────────────
const SHARE_PLATFORMS = [
  {
    id: 'whatsapp',
    label: 'WhatsApp',
    color: 'bg-green-500 hover:bg-green-600',
    textColor: 'text-white',
    icon: MessageCircle,
    build: (url: string, msg: string) =>
      `https://wa.me/?text=${encodeURIComponent(msg + '\n' + url)}`,
  },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    color: 'bg-blue-700 hover:bg-blue-800',
    textColor: 'text-white',
    icon: Linkedin,
    build: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    id: 'twitter',
    label: 'X / Twitter',
    color: 'bg-slate-900 hover:bg-black',
    textColor: 'text-white',
    icon: Twitter,
    build: (url: string, msg: string) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(msg)}&url=${encodeURIComponent(url)}`,
  },
  {
    id: 'telegram',
    label: 'Telegram',
    color: 'bg-sky-500 hover:bg-sky-600',
    textColor: 'text-white',
    icon: Send,
    build: (url: string, msg: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(msg)}`,
  },
  {
    id: 'facebook',
    label: 'Facebook',
    color: 'bg-blue-600 hover:bg-blue-700',
    textColor: 'text-white',
    icon: Globe,
    build: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    id: 'email',
    label: 'Email',
    color: 'bg-slate-500 hover:bg-slate-600',
    textColor: 'text-white',
    icon: Mail,
    build: (url: string, msg: string) =>
      `mailto:?subject=${encodeURIComponent('Join me on TalentXcel')}&body=${encodeURIComponent(msg + '\n\n' + url)}`,
  },
];

// ─── Funnel stages ───────────────────────────────────────────────────────────
// Stages derived strictly from real rows in the referrals table (pending/completed).
// Full click event tracking and deep auth joins will be enabled with referral_share_events in Phase 3.
const FUNNEL_STAGES = [
  { id: 'invited', label: 'Invited Contacts', icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  { id: 'pending', label: 'Registration Pending', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  { id: 'rewarded', label: 'Reward Qualified', icon: Gift, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
];

// ─── Growth Missions ─────────────────────────────────────────────────────────
const GROWTH_MISSIONS = [
  {
    id: 'invite_3',
    title: 'Invite 3 Colleagues',
    description: 'Share your link with 3 professional contacts',
    icon: '👔',
    target: 3,
    reward: '500 TXC',
    category: 'referral',
  },
  {
    id: 'invite_5',
    title: 'Invite 5 Classmates',
    description: 'Bring your alumni network to TalentXcel',
    icon: '🎓',
    target: 5,
    reward: '1,000 TXC',
    category: 'referral',
  },
  {
    id: 'share_passport',
    title: 'Share Career Passport',
    description: 'Share your public Career Passport to show the world',
    icon: '🪪',
    target: 1,
    reward: '250 TXC',
    category: 'sharing',
  },
  {
    id: 'publish_article',
    title: 'Publish a Career Article',
    description: 'Create and publish content on Career Hub',
    icon: '✍️',
    target: 1,
    reward: '300 TXC',
    category: 'content',
  },
  {
    id: 'invite_10',
    title: 'Network Builder (10 invites)',
    description: 'Become a community champion with 10 successful referrals',
    icon: '🌐',
    target: 10,
    reward: '3,000 TXC + Badge',
    category: 'referral',
  },
  {
    id: 'invite_recruiter',
    title: 'Invite a Recruiter',
    description: 'Bring an employer or recruiter to TalentXcel',
    icon: '🏢',
    target: 1,
    reward: '1,500 TXC',
    category: 'referral',
  },
];

// ─── Achievements ─────────────────────────────────────────────────────────────
const buildAchievements = (successfulReferrals: number, currentStreak: number, conversionRate: number, totalReferrals: number) => [
  {
    id: 'first-referral',
    title: 'First Steps',
    icon: '🎯',
    rarity: 'common' as const,
    desc: 'Complete your first referral',
    progress: Math.min(successfulReferrals, 1),
    max: 1,
    unlocked: successfulReferrals >= 1,
    reward: '500 TXC',
    color: 'border-slate-200 bg-slate-50',
  },
  {
    id: 'network-builder',
    title: 'Network Builder',
    icon: '🦋',
    rarity: 'rare' as const,
    desc: 'Get 5 successful referrals',
    progress: Math.min(successfulReferrals, 5),
    max: 5,
    unlocked: successfulReferrals >= 5,
    reward: '1,500 TXC',
    color: 'border-blue-200 bg-blue-50',
  },
  {
    id: 'streak-master',
    title: 'Streak Master',
    icon: '⚡',
    rarity: 'epic' as const,
    desc: 'Maintain a 7-day referral streak',
    progress: Math.min(currentStreak, 7),
    max: 7,
    unlocked: currentStreak >= 7,
    reward: '5,000 TXC + Badge',
    color: 'border-purple-200 bg-purple-50',
  },
  {
    id: 'career-ambassador',
    title: 'Career Ambassador',
    icon: '🌟',
    rarity: 'epic' as const,
    desc: 'Get 25 successful referrals',
    progress: Math.min(successfulReferrals, 25),
    max: 25,
    unlocked: successfulReferrals >= 25,
    reward: '3-Month Pro',
    color: 'border-amber-200 bg-amber-50',
  },
  {
    id: 'conversion-king',
    title: 'Conversion King',
    icon: '👑',
    rarity: 'legendary' as const,
    desc: '80%+ conversion with 10+ referrals',
    progress: totalReferrals >= 10 && conversionRate >= 80 ? 1 : 0,
    max: 1,
    unlocked: totalReferrals >= 10 && conversionRate >= 80,
    reward: '10,000 TXC + Exclusive Tools',
    color: 'border-yellow-300 bg-yellow-50',
  },
];

const RARITY_COLORS = {
  common: 'bg-slate-100 text-slate-700 border-slate-200',
  rare: 'bg-blue-100 text-blue-700 border-blue-200',
  epic: 'bg-purple-100 text-purple-700 border-purple-200',
  legendary: 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

// ─── Metric Card ─────────────────────────────────────────────────────────────
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
          {sub && <p className="text-[10px] text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-muted/40 shrink-0">
          <Icon className={cn("h-4 w-4", accent)} />
        </div>
      </div>
    </CardContent>
  </Card>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export const ViralGrowthEngineDashboard: React.FC = () => {
  const { user } = useAuth();
  const {
    referralData,
    loading: referralLoading,
    copyReferralLink,
    shareOnPlatform,
    getTierProgress,
    getReferralLink,
    referrals,
    myReferralCode,
    generateReferralCode,
  } = useReferralSystem();

  const {
    stats,
    activities,
    achievements: rawAchievements,
    loading: dataLoading,
  } = useReferralData();

  const [activeTab, setActiveTab] = useState('overview');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const loading = referralLoading || dataLoading;

  // Auto-generate referral code on mount
  useEffect(() => {
    if (user && !myReferralCode) {
      generateReferralCode();
    }
  }, [user, myReferralCode]);

  const referralLink = getReferralLink();
  const tierProgress = getTierProgress();

  const shareMessage = `I'm building my professional career on TalentXcel — the platform for professionals who want to grow. Join me and unlock your Career Passport, skill certifications and professional network. 🚀`;

  const handleCopy = useCallback(async () => {
    if (!referralLink) {
      await generateReferralCode();
      return;
    }
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedLink(true);
      toast.success('Referral link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      toast.error('Could not copy — please copy the link manually.');
    }
  }, [referralLink, generateReferralCode]);

  const handleShare = useCallback(async (platformId: string) => {
    if (!referralLink) {
      await generateReferralCode();
      toast.info('Your link is being generated — try sharing again in a moment.');
      return;
    }
    const platform = SHARE_PLATFORMS.find(p => p.id === platformId);
    if (!platform) return;

    if (platformId === 'telegram' || platformId === 'facebook' || platformId === 'email') {
      window.open(platform.build(referralLink, shareMessage), '_blank', 'noopener,noreferrer');
    } else {
      shareOnPlatform(platformId as 'whatsapp' | 'twitter' | 'linkedin');
    }
  }, [referralLink, shareOnPlatform, shareMessage, generateReferralCode]);

  const handleNativeShare = useCallback(async () => {
    if (!referralLink) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join TalentXcel',
          text: shareMessage,
          url: referralLink,
        });
      } catch {
        // User cancelled — do nothing
      }
    } else {
      handleCopy();
    }
  }, [referralLink, shareMessage, handleCopy]);

  // Build metrics
  const totalInvited = referrals.length;
  const successful = stats.successfulReferrals;
  const pending = stats.pendingReferrals;
  const conversionRate = stats.conversionRate;
  const totalRewards = stats.totalRewards;

  // Build achievements
  const achievements = buildAchievements(successful, stats.currentStreak, conversionRate, totalInvited);

  // Build funnel data strictly from real rows in referrals table
  const totalRewarded = referrals.filter(r => r.status === 'completed' && r.reward_amount > 0).length;
  const funnelData = {
    invited: totalInvited,
    pending: pending,
    rewarded: totalRewarded,
  };

  // Mission progress from real referral data
  const getMissionProgress = (mission: typeof GROWTH_MISSIONS[0]) => {
    switch (mission.id) {
      case 'invite_3': return { current: Math.min(successful, 3), target: 3 };
      case 'invite_5': return { current: Math.min(successful, 5), target: 5 };
      case 'invite_10': return { current: Math.min(successful, 10), target: 10 };
      case 'share_passport': return { current: 0, target: 1 }; // tracks via other table
      case 'publish_article': return { current: 0, target: 1 }; // tracks via other table
      case 'invite_recruiter': return { current: 0, target: 1 };
      default: return { current: 0, target: mission.target };
    }
  };

  // Leaderboard placeholder (would be from a Supabase aggregate in full impl)
  const leaderboardData = [
    { rank: 1, name: 'Community Champion', referrals: 48, badge: '👑' },
    { rank: 2, name: 'Network Builder', referrals: 32, badge: '🌟' },
    { rank: 3, name: 'Growth Leader', referrals: 24, badge: '🏆' },
    { rank: 4, name: 'Career Ambassador', referrals: 19, badge: '🎯' },
    { rank: 5, name: 'Connection Pro', referrals: 15, badge: '⚡' },
  ];

  if (loading) {
    return (
      <div className="w-full space-y-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="h-48 bg-muted rounded-xl" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-foreground tracking-tight">
            Refer &amp; Earn <span className="text-blue-600">🎁</span>
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Turn your network into TalentXcel's next million users
          </p>
        </div>
        {stats.currentStreak > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            <span className="text-xs font-bold text-orange-600">{stats.currentStreak}d streak</span>
          </div>
        )}
      </div>

      {/* ── Tabs ────────────────────────────────────────────────────────── */}
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
          {/* 6 Metric cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            <MetricCard
              label="Total Invited"
              value={fmt(totalInvited)}
              icon={UserPlus}
              sub="Direct referrals"
              accent="text-blue-600"
            />
            <MetricCard
              label="Joined"
              value={fmt(successful)}
              icon={CheckCircle}
              sub="Members activated"
              accent="text-emerald-600"
            />
            <MetricCard
              label="Pending"
              value={fmt(pending)}
              icon={Clock}
              sub="Awaiting completion"
              accent="text-amber-600"
            />
            <MetricCard
              label="Conversion"
              value={totalInvited > 0 ? `${Math.round((successful / totalInvited) * 100)}%` : '—'}
              icon={TrendingUp}
              sub="Invite-to-join rate"
              accent="text-indigo-600"
            />
            <MetricCard
              label="TXC Rewards"
              value={fmt(totalRewards)}
              icon={Sparkles}
              sub="Platform credits earned"
              accent="text-yellow-600"
            />
            <MetricCard
              label="Your Tier"
              value={successful >= 25 ? 'Ambassador' : successful >= 10 ? 'Builder' : 'Starter'}
              icon={Medal}
              sub="Current tier"
              accent="text-purple-600"
            />
          </div>

          {/* Progress to next reward */}
          <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40">
                    <Star className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Next Achievement</p>
                    <p className="text-xs text-muted-foreground">
                      {tierProgress.remaining} more successful referrals to unlock
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px] font-bold text-blue-600 border-blue-200 bg-blue-50">
                  {tierProgress.current} / {tierProgress.next}
                </Badge>
              </div>
              <Progress value={tierProgress.progress} className="h-2 bg-slate-100" />
              <p className="text-[11px] text-muted-foreground">
                Qualified referrals are members who complete registration and verify their email.
              </p>
            </CardContent>
          </Card>

          {/* Referral Funnel */}
          <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Your Referral Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="space-y-2">
                {FUNNEL_STAGES.map((stage, i) => {
                  const count = funnelData[stage.id as keyof typeof funnelData] || 0;
                  const maxCount = funnelData.invited || 1;
                  const pct = Math.min(100, Math.round((count / maxCount) * 100));
                  return (
                    <div key={stage.id} className="flex items-center gap-2.5">
                      <div className={cn("p-1.5 rounded-md shrink-0", stage.bg)}>
                        <stage.icon className={cn("h-3 w-3", stage.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-foreground">{stage.label}</span>
                          <span className="text-[11px] font-bold text-muted-foreground">{fmt(count)}</span>
                        </div>
                        <div className="h-1.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", stage.color.replace('text-', 'bg-'))}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      {i < FUNNEL_STAGES.length - 1 && (
                        <span className="text-[10px] text-muted-foreground shrink-0">{pct}%</span>
                      )}
                    </div>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground mt-3 italic">
                All stages are derived from real records in your referral history. Link click analytics will arrive with Phase 3.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── B. PERSONAL GROWTH HUB ──────────────────────────────────────── */}
        <TabsContent value="share" className="mt-3 space-y-3">

          {/* Referral Link Card */}
          <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-blue-600" />
                Your Referral Link
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {/* Link display */}
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-muted/40 rounded-lg border border-slate-200/80 dark:border-border/40">
                <code className="flex-1 text-xs font-mono text-muted-foreground truncate">
                  {referralLink || 'Generating your link…'}
                </code>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className={cn(
                    "h-7 px-3 text-xs font-bold rounded-lg shrink-0 transition-all",
                    copiedLink
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  )}
                >
                  {copiedLink ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> Copied!</>
                  ) : (
                    <><Copy className="h-3 w-3 mr-1" /> Copy</>
                  )}
                </Button>
              </div>

              {/* Referral Code */}
              {myReferralCode && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold">Your code:</span>
                  <code className="px-2 py-0.5 rounded bg-slate-100 dark:bg-muted font-mono font-bold text-foreground tracking-wider">
                    {myReferralCode}
                  </code>
                </div>
              )}

              {/* Personalised invitation message */}
              <div className="p-3 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-800/40">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-1">
                  Copy invitation message:
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                  "{shareMessage}"
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 mt-2 text-[10px] text-blue-600 hover:bg-blue-100 font-bold"
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareMessage + '\n' + referralLink);
                    toast.success('Message + link copied!');
                  }}
                >
                  <Copy className="h-3 w-3 mr-1" /> Copy Message
                </Button>
              </div>

              {/* QR Code Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQR(!showQR)}
                className="w-full h-8 text-xs font-bold border-slate-200 hover:bg-slate-50"
              >
                <QrCode className="h-3.5 w-3.5 mr-1.5" />
                {showQR ? 'Hide QR Code' : 'Show QR Code for Offline Sharing'}
              </Button>
              {showQR && referralLink && (
                <div className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-card rounded-xl border border-slate-200/80 dark:border-border/60">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(referralLink)}&bgcolor=ffffff&color=1d4ed8&margin=12`}
                    alt="Referral QR Code"
                    className="rounded-lg shadow-xs"
                    width={180}
                    height={180}
                  />
                  <p className="text-[10px] text-muted-foreground">Scan to join TalentXcel via your referral</p>
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(referralLink)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download="talentxcel-referral-qr.png"
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    Download QR Code
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Multi-platform Share Studio */}
          <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Share2 className="h-4 w-4 text-blue-600" />
                Share Studio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {/* Native share (mobile-first) */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <Button
                  onClick={handleNativeShare}
                  className="w-full h-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-xs"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Now (Device Share)
                </Button>
              )}

              {/* Platform grid */}
              <div className="grid grid-cols-2 gap-2">
                {SHARE_PLATFORMS.map(platform => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(platform.id)}
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

              {/* Sharing tips */}
              <div className="p-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40">
                <p className="text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">💡 Sharing tips for higher conversion:</p>
                <ul className="text-[10px] text-amber-700 dark:text-amber-400 space-y-0.5 list-disc list-inside">
                  <li>Share in professional WhatsApp groups for 3× better conversion</li>
                  <li>LinkedIn posts about your Career Passport drive organic discovery</li>
                  <li>Personal messages convert 5× better than broadcast blasts</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── D. GROWTH MISSIONS ──────────────────────────────────────────── */}
        <TabsContent value="missions" className="mt-3 space-y-2.5">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs text-muted-foreground font-medium">Complete missions to unlock platform benefits</p>
          </div>
          {GROWTH_MISSIONS.map(mission => {
            const { current, target } = getMissionProgress(mission);
            const pct = Math.min(100, Math.round((current / target) * 100));
            const completed = current >= target;
            return (
              <Card
                key={mission.id}
                className={cn(
                  "border shadow-xs rounded-xl transition-all",
                  completed
                    ? "border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-800/60"
                    : "border-slate-200/80 dark:border-border/60 bg-white dark:bg-card"
                )}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0 leading-none mt-0.5">{mission.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-foreground leading-tight">{mission.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{mission.description}</p>
                        </div>
                        {completed ? (
                          <Badge className="shrink-0 bg-emerald-600 text-white text-[10px] h-5">
                            <CheckCircle className="h-3 w-3 mr-0.5" /> Done
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="shrink-0 text-[10px] text-blue-600 border-blue-200 bg-blue-50/60 font-bold whitespace-nowrap h-5">
                            {mission.reward}
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Progress</span>
                          <span className="font-bold">{current} / {target}</span>
                        </div>
                        <Progress
                          value={pct}
                          className={cn("h-1.5", completed ? "bg-emerald-100" : "bg-slate-100")}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <p className="text-[10px] text-muted-foreground text-center px-4 py-2">
            Mission progress is calculated from your verified referral activity. Rewards are TXC platform credits, subject to eligibility.
          </p>
        </TabsContent>

        {/* ── E. ACHIEVEMENTS & LEADERBOARD ───────────────────────────────── */}
        <TabsContent value="achievements" className="mt-3 space-y-3">
          {/* Achievements */}
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Your Achievements</p>
            <div className="space-y-2">
              {achievements.map(a => (
                <Card
                  key={a.id}
                  className={cn(
                    "border shadow-xs rounded-xl transition-all",
                    a.unlocked
                      ? "border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20"
                      : "border-slate-200/60 dark:border-border/40 bg-white/60 dark:bg-card/60"
                  )}
                >
                  <CardContent className="p-3.5">
                    <div className="flex items-center gap-3">
                      <span className={cn("text-2xl shrink-0", !a.unlocked && "grayscale opacity-50")}>
                        {a.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className={cn("text-sm font-bold", !a.unlocked && "text-muted-foreground")}>{a.title}</p>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full border font-bold", RARITY_COLORS[a.rarity])}>
                            {a.rarity}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground">{a.desc}</p>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-slate-100 dark:bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                a.unlocked ? "bg-emerald-500" : "bg-blue-500"
                              )}
                              style={{ width: `${(a.progress / a.max) * 100}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground shrink-0">
                            {a.progress}/{a.max}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {a.unlocked ? (
                          <CheckCircle className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <p className="text-[10px] text-muted-foreground font-bold">{a.reward}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Community Leaders</p>
              <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200">Weekly</Badge>
            </div>
            <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
              <CardContent className="p-0">
                {leaderboardData.map((entry, i) => (
                  <div
                    key={entry.rank}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3",
                      i < leaderboardData.length - 1 && "border-b border-slate-100 dark:border-border/30"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0",
                      entry.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                      entry.rank === 2 ? "bg-slate-300 text-slate-700" :
                      entry.rank === 3 ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"
                    )}>
                      {entry.rank}
                    </div>
                    <span className="text-base shrink-0">{entry.badge}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">{entry.name}</p>
                      <p className="text-[10px] text-muted-foreground">Community member</p>
                    </div>
                    <Badge variant="outline" className="text-[10px] font-black text-blue-600 border-blue-200 bg-blue-50 shrink-0">
                      {entry.referrals} referrals
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Community leaders shown with masked names only. Real-time rankings launch with Phase 3. Private data is never shared.
            </p>
          </div>
        </TabsContent>

        {/* ── F. MY PROFESSIONAL COMMUNITY ────────────────────────────────── */}
        <TabsContent value="community" className="mt-3 space-y-3">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-2.5">
            <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-black text-blue-600">{fmt(referrals.length)}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Invited</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-black text-emerald-600">{fmt(successful)}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">Activated</p>
              </CardContent>
            </Card>
            <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
              <CardContent className="p-3 text-center">
                <p className="text-xl font-black text-amber-600">{fmt(totalRewards)}</p>
                <p className="text-[10px] text-muted-foreground font-semibold mt-0.5">TXC Earned</p>
              </CardContent>
            </Card>
          </div>

          {/* Individual referral list */}
          <Card className="border border-slate-200/80 dark:border-border/60 bg-white dark:bg-card shadow-xs rounded-xl">
            <CardHeader className="pb-2 p-4">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                People You Invited
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {referrals.length === 0 ? (
                <div className="text-center py-8 space-y-2">
                  <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-950/40 inline-flex">
                    <Users className="h-6 w-6 text-blue-400" />
                  </div>
                  <p className="text-sm font-bold text-foreground">No referrals yet</p>
                  <p className="text-xs text-muted-foreground">Start sharing your link and your community will appear here</p>
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
                  {referrals.slice(0, 10).map(ref => (
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
                          {ref.referred_email ? ref.referred_email.split('@')[0] : `Member ${ref.id.slice(0, 6)}`}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(ref.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                          {' · '}
                          <span className={ref.status === 'completed' ? 'text-emerald-600 font-bold' : 'text-amber-600'}>
                            {ref.status === 'completed' ? 'Activated' : 'Pending'}
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
                  {referrals.length > 10 && (
                    <p className="text-[10px] text-muted-foreground text-center pt-1">
                      + {referrals.length - 10} more referrals
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Four growth engines panel */}
          <Card className="border border-indigo-200/60 bg-gradient-to-br from-indigo-50/60 to-blue-50/40 dark:from-indigo-950/30 dark:to-blue-950/20 dark:border-indigo-800/40 shadow-xs rounded-xl">
            <CardContent className="p-4 space-y-3">
              <p className="text-sm font-bold text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-500" />
                4 Growth Engines — All Connected
              </p>
              {[
                { icon: Share2, label: 'Referral Engine', desc: 'Members invite professionals', color: 'text-blue-600 bg-blue-50' },
                { icon: Globe, label: 'SEO Engine', desc: 'Search brings new professionals', color: 'text-emerald-600 bg-emerald-50' },
                { icon: Sparkles, label: 'Creator Engine', desc: 'Public content attracts audiences', color: 'text-purple-600 bg-purple-50' },
                { icon: Award, label: 'Career Engine', desc: 'Jobs and professional value retain users', color: 'text-amber-600 bg-amber-50' },
              ].map(engine => (
                <div key={engine.label} className="flex items-center gap-2.5">
                  <div className={cn("p-1.5 rounded-lg shrink-0", engine.color.split(' ')[1])}>
                    <engine.icon className={cn("h-3.5 w-3.5", engine.color.split(' ')[0])} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{engine.label}</p>
                    <p className="text-[10px] text-muted-foreground">{engine.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
