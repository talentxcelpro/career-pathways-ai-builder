import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  Briefcase,
  Compass,
  Flame,
  Hash,
  Home,
  ImagePlus,
  LineChart,
  Loader2,
  Map,
  MessageCircle,
  PenLine,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
  X,
  Zap,
  Network as NetworkIcon,
  Globe,
  Activity,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { AuthDialog } from '@/components/auth/AuthDialog';
import { GoogleOneTapStatus } from '@/components/auth/GoogleOneTapStatus';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { EnhancedNetworkPostsPulse } from '@/components/Pulse/EnhancedNetworkPostsPulse';
import { NetworkMessagingSidebar } from '@/components/network/NetworkMessagingSidebar';
import { TrendingHashtags } from '@/components/network/TrendingHashtags';
import { UserFollowButton } from '@/components/social/UserFollowButton';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useRealtimeSocialUpdates } from '@/hooks/useRealtimeSocialUpdates';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { updateMetaTags } from '@/utils/metaTags';
import { getCustomStorageUrl } from '@/utils/storage';
import { optimizedStorage } from '@/utils/optimizedStorage';

type PulseType = 'all' | 'connections' | 'trending';
type PulseTabId = 'for-you' | 'following' | 'trending' | 'hiring';

type NetworkProfile = {
  id: string;
  full_name?: string | null;
  title?: string | null;
  current_company?: string | null;
  location?: string | null;
  profile_picture_url?: string | null;
  profile_photo_url?: string | null;
  skills?: string[] | null;
};

type NetworkOverview = {
  profile: NetworkProfile | null;
  posts: number;
  connections: number;
  followers: number;
  following: number;
};

const emptyOverview: NetworkOverview = {
  profile: null,
  posts: 0,
  connections: 0,
  followers: 0,
  following: 0,
};

const PulseTabs: Array<{
  id: PulseTabId;
  label: string;
  description: string;
  PulseType: PulseType;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    id: 'for-you',
    label: 'Strategic',
    description: 'Personalized professional intelligence',
    PulseType: 'all',
    icon: Sparkles,
  },
  {
    id: 'following',
    label: 'Synchronized',
    description: 'Updates from your professional ecosystem',
    PulseType: 'connections',
    icon: Users,
  },
  {
    id: 'trending',
    label: 'Ecosystem Trend',
    description: 'High-velocity professional discussions',
    PulseType: 'trending',
    icon: Flame,
  },
  {
    id: 'hiring',
    label: 'Opportunities',
    description: 'Precision matches and ecosystem insights',
    PulseType: 'all',
    icon: Briefcase,
  },
];

const leftNav = [
  { label: 'TalentXcel Home', to: '/career-os', icon: Home },
  { label: 'Ecosystem', to: '/network', icon: Compass },
  { label: 'Intelligence Sync', to: '/network/messages', icon: MessageCircle },
  { label: 'Index Alerts', to: '/network/notifications', icon: Bell },
  { label: 'TalentXcel Beacon', to: '/talent-beacon', icon: Radio },
  { label: 'Intelligence Navigator', to: '/intelligence-navigator', icon: Map },
  { label: 'Precision Matches', to: '/jobs', icon: Briefcase },
];

const starterPrompts = [
  'Professional synchronization this week...',
  'Ecosystem tactical move for hiring...',
  'I am calibrating my profile for...',
  'A move that accelerated my evolution...',
];

function getInitials(profile: NetworkProfile | null, email?: string | null) {
  const name = profile?.full_name?.trim();
  if (name) {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }
  return email?.[0]?.toUpperCase() || 'TX';
}

function getDisplayName(profile: NetworkProfile | null, email?: string | null) {
  return profile?.full_name?.trim() || email?.split('@')[0] || 'TalentXcel member';
}

function getRole(profile: NetworkProfile | null) {
  const role = profile?.title || 'Professional';
  return profile?.current_company ? `${role} at ${profile.current_company}` : role;
}

async function loadNetworkOverview(userId: string): Promise<NetworkOverview> {
  const [profileRes, postsRes, connectionsRes, followersRes, followingRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    supabase.from('posts').select('id', { count: 'exact', head: true }).or(`author_id.eq.${userId},user_id.eq.${userId}`),
    supabase
      .from('connections')
      .select('id', { count: 'exact', head: true })
      .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
      .eq('status', 'accepted'),
    supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('following_id', userId),
    supabase.from('user_follows').select('id', { count: 'exact', head: true }).eq('follower_id', userId),
  ]);

  return {
    profile: (profileRes.data as NetworkProfile | null) ?? null,
    posts: postsRes.count ?? 0,
    connections: connectionsRes.count ?? 0,
    followers: followersRes.count ?? 0,
    following: followingRes.count ?? 0,
  };
}

async function loadSuggestedProfiles(userId?: string | null): Promise<NetworkProfile[]> {
  let query = supabase
    .from('profiles')
    .select('*')
    .not('full_name', 'is', null)
    .limit(5);

  if (userId) {
    query = query.neq('id', userId);
  }

  const { data, error } = await query;
  if (error) return [];
  return (data ?? []) as NetworkProfile[];
}

function NetworkComposer({
  profile,
  email,
  onPrompt,
}: {
  profile: NetworkProfile | null;
  email?: string | null;
  onPrompt?: string;
}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [content, setContent] = useState(onPrompt ?? '');
  const [isPosting, setIsPosting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'connections'>('public');

  useEffect(() => {
    if (onPrompt) setContent(onPrompt);
  }, [onPrompt]);

  const remaining = 500 - content.length;
  const canPost = !!user?.id && (content.trim().length > 0 || mediaUrls.length > 0) && remaining >= 0;

  const handleImageUpload = async (files: FileList | null) => {
    if (!files || !files.length || !user?.id) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image for ecosystem synchronization.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      toast.error('Media density must be under 8 MB.');
      return;
    }

    setIsUploading(true);
    try {
      const extension = file.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const filePath = `${user.id}/${filename}`;
      const result = await optimizedStorage.uploadFile('post-media', filePath, file, {
        cacheControl: '31536000',
        upsert: true,
      });

      if (result.error) throw result.error;
      const publicUrl = await optimizedStorage.getPublicUrl('post-media', result.data.path);
      setMediaUrls((current) => [...current, getCustomStorageUrl(publicUrl)].slice(0, 4));
      toast.success('Professional media attached.');
    } catch (error) {
      toast.error('Intelligence synchronization failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePost = async () => {
    if (!user?.id) {
      toast.error('Authenticate to synchronize insights.');
      return;
    }
    if (!canPost) return;

    setIsPosting(true);
    try {
      const words = content.split(/\s+/).filter(Boolean);
      const tags = words
        .filter((word) => word.startsWith('#') && word.length > 1)
        .map((word) => word.replace(/[^a-zA-Z0-9_#]/g, '').replace('#', '').toLowerCase())
        .filter(Boolean)
        .slice(0, 8);

      const { error } = await supabase.from('posts').insert({
        author_id: user.id,
        user_id: user.id,
        content: content.trim() || 'Synchronized a professional update',
        post_type: mediaUrls.length > 0 ? 'image' : 'text',
        status: 'published',
        is_public: visibility === 'public',
        visibility,
        origin: 'network',
        media_urls: mediaUrls,
        tags,
        hashtags: tags,
      });

      if (error) throw error;
      setContent('');
      setMediaUrls([]);
      toast.success('Professional insight synchronized with your ecosystem.');
      queryClient.invalidateQueries({ queryKey: ['network-Pulse'] });
      queryClient.invalidateQueries({ queryKey: ['network-overview'] });
    } catch (error) {
      toast.error('Synchronization failed. Verify intelligence signals.');
    } finally {
      setIsPosting(false);
    }
  };

  if (!user) {
    return (
      <div className="border-b border-slate-200 bg-white p-6">
        <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-8 shadow-inner">
          <div className="flex flex-col md:flex-row gap-6 items-center text-center md:text-left">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-xl font-apple-heavy text-white shadow-2xl">
              TX
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-apple-heavy text-slate-950 tracking-tight">Join the TalentXcel Ecosystem</h2>
              <p className="mt-2 text-lg font-apple-medium leading-relaxed text-slate-500">
                Synchronize with elite professionals, broadcast insights, and let TalentXcel map your ecosystem to precision matches.
              </p>
              <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                <AuthDialog>
                  <Button className="h-14 rounded-2xl bg-slate-950 px-8 text-white hover:scale-105 transition-all font-apple-heavy shadow-2xl shadow-slate-950/20">Sign in to initialize</Button>
                </AuthDialog>
                <Button asChild variant="outline" className="h-14 rounded-2xl border-slate-200 bg-white px-8 font-apple-heavy hover:bg-slate-50 transition-all">
                  <Link to="/career-os">Explore Core Hub</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-slate-200 bg-white p-8">
      <div className="flex gap-6">
        <Avatar className="h-16 w-16 rounded-[24px] shadow-2xl border-4 border-white">
          <AvatarImage src={profile?.profile_picture_url || profile?.profile_photo_url || undefined} />
          <AvatarFallback className="rounded-[24px] bg-blue-50 text-lg font-apple-heavy text-blue-600">
            {getInitials(profile, email)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Broadcast a professional insight, referral, or evolution win..."
            className="min-h-[140px] resize-none border-0 p-0 text-xl font-apple-medium placeholder:text-slate-400 shadow-none focus-visible:ring-0 leading-relaxed"
            maxLength={540}
          />

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => handleImageUpload(event.target.files)} />

          {mediaUrls.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              {mediaUrls.map((url) => (
                <div key={url} className="group relative overflow-hidden rounded-[28px] border border-slate-200 shadow-xl">
                  <img src={url} alt="Ecosystem attachment" className="h-56 w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={() => setMediaUrls((current) => current.filter((item) => item !== url))}
                    className="absolute right-4 top-4 h-10 w-10 rounded-2xl bg-white/90 backdrop-blur-md shadow-2xl opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isUploading || mediaUrls.length >= 4}
              onClick={() => fileInputRef.current?.click()}
              className="h-12 rounded-xl px-6 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all"
            >
              {isUploading ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : <ImagePlus className="mr-3 h-5 w-5" />}
              <span className="font-apple-heavy text-xs uppercase tracking-widest">Media</span>
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-12 rounded-xl px-6 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-all">
              <Link to="/jobs">
                <Briefcase className="mr-3 h-5 w-5" />
                <span className="font-apple-heavy text-xs uppercase tracking-widest">Match</span>
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="h-12 rounded-xl px-6 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all">
              <Link to="/intelligence-navigator">
                <Sparkles className="mr-3 h-5 w-5" />
                <span className="font-apple-heavy text-xs uppercase tracking-widest">Tactical</span>
              </Link>
            </Button>
            
            <div className="ml-auto flex items-center gap-6">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setVisibility((value) => (value === 'public' ? 'connections' : 'public'))}
                className="h-12 rounded-xl border-slate-200 font-apple-heavy text-xs uppercase tracking-widest px-6 bg-white hover:bg-slate-50 transition-all"
              >
                {visibility === 'public' ? 'Broadcast' : 'Ecosystem'}
              </Button>
              <div className="flex flex-col items-end">
                <span className={cn('text-[10px] font-apple-heavy uppercase tracking-widest', remaining < 0 ? 'text-red-600' : 'text-slate-400')}>
                  {remaining} CHARS
                </span>
                <Button
                  onClick={handlePost}
                  disabled={!canPost || isPosting}
                  className="mt-1 h-14 rounded-[20px] bg-slate-950 px-12 text-white hover:scale-105 transition-all shadow-2xl shadow-slate-950/20 font-apple-heavy uppercase tracking-widest text-xs"
                >
                  {isPosting ? 'SYNCHRONIZING...' : 'Broadcast'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[20px] border border-slate-100 bg-white p-5 shadow-sm group hover:border-blue-200 transition-all duration-500">
      <p className="text-2xl font-apple-heavy text-slate-950 tracking-tighter group-hover:text-blue-600 transition-colors">{value}</p>
      <p className="mt-1 text-[9px] font-apple-heavy uppercase tracking-widest text-slate-400">{label}</p>
    </div>
  );
}

export default function Network() {
  const { user } = useAuth();
  const { data: profileStats } = useProfileStats(user?.id);
  const composerRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<PulseTabId>('for-you');
  const [searchTerm, setSearchTerm] = useState('');
  const [composerPrompt, setComposerPrompt] = useState('');

  useRealtimeSocialUpdates();

  const { data: overview = emptyOverview } = useQuery({
    queryKey: ['network-overview', user?.id],
    enabled: !!user?.id,
    queryFn: () => loadNetworkOverview(user!.id),
    staleTime: 2 * 60 * 1000,
  });

  const { data: suggestedProfiles = [] } = useQuery({
    queryKey: ['network-suggested-profiles', user?.id],
    queryFn: () => loadSuggestedProfiles(user?.id),
    staleTime: 10 * 60 * 1000,
  });

  const currentTab = useMemo(() => PulseTabs.find((tab) => tab.id === activeTab) ?? PulseTabs[0], [activeTab]);

  useEffect(() => {
    updateMetaTags({
      title: 'TalentXcel Ecosystem | Professional Intelligence and Ecosystem Sync',
      description: 'Build a high-performance professional ecosystem with expert insights, precision matches, and TalentXcel professional guidance.',
      url: `${window.location.origin}/network`,
      keywords: ['professional ecosystem', 'intelligence insights', 'precision matches', 'talent ecosystem', 'TalentXcel'],
      type: 'website',
      image: '/app-logo.png',
    });
  }, []);

  const insightCards = [
    { label: 'Ecosystem reach', value: overview.connections, detail: 'Synchronized partners', icon: Users, tone: 'bg-blue-50 text-blue-600' },
    { label: 'Influence index', value: overview.followers, detail: `${overview.following} tracking`, icon: UserPlus, tone: 'bg-indigo-50 text-indigo-600' },
    { label: 'Identity views', value: profileStats?.profileViews ?? 0, detail: 'Discovery analytics', icon: LineChart, tone: 'bg-emerald-50 text-emerald-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 backdrop-blur-xl pb-24 text-slate-950 edge-to-edge">
      {!user && (
        <div className="mx-auto max-w-6xl px-6 pt-6">
          <GoogleOneTapStatus />
        </div>
      )}

      <div className="mx-auto grid max-w-[1440px] grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <aside className="sticky top-0 hidden h-screen border-r border-slate-200/50 bg-white/40 backdrop-blur-2xl px-8 py-10 xl:block">
          <Link to="/career-os" className="mb-12 flex items-center gap-4 px-2 hover:scale-105 transition-transform">
            <div className="h-12 w-12 rounded-[18px] bg-slate-950 flex items-center justify-center shadow-2xl">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-apple-heavy text-slate-950 tracking-tighter leading-none">TalentXcel</p>
              <p className="text-[10px] font-apple-heavy text-blue-600 uppercase tracking-[0.2em] mt-1.5">Ecosystem</p>
            </div>
          </Link>

          <nav className="space-y-3">
            {leftNav.map((item) => {
              const Icon = item.icon;
              const active = item.to === '/network';
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={cn(
                    'flex items-center gap-4 rounded-2xl px-5 py-4 text-sm transition-all duration-500 group',
                    active ? 'bg-slate-950 text-white shadow-2xl shadow-slate-950/20 scale-[1.02]' : 'text-slate-500 hover:bg-white hover:text-slate-950 hover:shadow-xl'
                  )}
                >
                  <Icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", active ? "text-blue-400" : "text-slate-400")} />
                  <span className="font-apple-heavy tracking-tight">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <Button className="mt-10 h-16 w-full rounded-[24px] bg-blue-600 text-white hover:scale-105 transition-all shadow-2xl shadow-blue-600/20 font-apple-heavy text-xs uppercase tracking-widest">
            <PenLine className="mr-3 h-5 w-5" />
            Broadcast Insight
          </Button>

          {user && (
            <div className="mt-auto pt-12">
              <div className="rounded-[32px] bg-white border border-slate-100 p-6 shadow-xl hover:shadow-2xl transition-all border group">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 rounded-[18px] shadow-lg border-2 border-white group-hover:scale-105 transition-transform">
                    <AvatarImage src={overview.profile?.profile_picture_url || overview.profile?.profile_photo_url || undefined} />
                    <AvatarFallback className="rounded-[18px] bg-blue-50 font-apple-heavy text-blue-600">TX</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-base font-apple-heavy text-slate-950 tracking-tight">{getDisplayName(overview.profile, user.email)}</p>
                    <p className="truncate text-[10px] font-apple-heavy uppercase tracking-widest text-slate-400 mt-0.5">{getRole(overview.profile)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        <main className="min-w-0 border-x border-slate-200/50 bg-white shadow-2xl">
          <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50">
            <div className="flex items-center justify-between gap-4 px-8 py-6">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-[18px] bg-slate-950 shadow-2xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-apple-heavy text-slate-950 tracking-tighter leading-none">Ecosystem Sync</h1>
                  <p className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400 mt-1.5">Professional Matrix</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button asChild variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all shadow-sm">
                  <Link to="/network/notifications"><Bell className="h-5 w-5 text-slate-600" /></Link>
                </Button>
                <Button asChild variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all shadow-sm">
                  <Link to="/network/messages"><MessageCircle className="h-5 w-5 text-slate-600" /></Link>
                </Button>
              </div>
            </div>

            <div className="px-8 pb-6">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                <Input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Synchronize insights, partners, entities..."
                  className="h-16 rounded-[24px] border-none bg-slate-100/50 pl-14 text-lg font-apple-medium focus:bg-white focus:shadow-2xl transition-all duration-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-0 border-t border-slate-100 px-4">
              {PulseTabs.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === activeTab;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={cn('flex min-h-[70px] flex-col items-center justify-center gap-2 border-b-[3px] px-2 transition-all duration-500 relative group', active ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-400 hover:text-slate-950')}>
                    <span className="flex items-center gap-2 whitespace-nowrap text-xs font-apple-heavy uppercase tracking-widest">
                      <Icon className={cn("h-4 w-4", active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-950")} />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </header>

          <div ref={composerRef}>
            <NetworkComposer profile={overview.profile} email={user?.email} onPrompt={composerPrompt} />
          </div>

          <section className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <h3 className="text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400">Initialize Sync</h3>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {starterPrompts.map((prompt) => (
                <button key={prompt} onClick={() => setComposerPrompt(prompt)} className="shrink-0 rounded-[20px] border border-slate-200 bg-white px-8 py-4 text-left text-sm font-apple-heavy text-slate-700 shadow-sm transition-all hover:border-blue-600 hover:shadow-2xl hover:text-blue-600 hover:-translate-y-1">
                  {prompt}
                </button>
              ))}
            </div>
          </section>

          <section className="px-8 py-10 bg-slate-50/30">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-apple-heavy text-slate-950 tracking-tight">{currentTab.label} Stream</h2>
                <p className="mt-2 text-[10px] font-apple-heavy uppercase tracking-[0.2em] text-slate-400">{currentTab.description}</p>
              </div>
              <Badge className="rounded-xl border-0 bg-blue-50 text-blue-600 font-apple-heavy text-[10px] uppercase tracking-widest px-4 py-2 shadow-sm">
                <Radio className="h-3 w-3 mr-2 animate-pulse" /> Ecosystem Active
              </Badge>
            </div>
            <EnhancedNetworkPostsPulse PulseType={currentTab.PulseType} searchTerm={searchTerm} />
          </section>
        </main>

        <aside className="hidden min-h-screen bg-slate-50/20 px-8 py-10 lg:block">
          <div className="sticky top-10 space-y-8">
            {user && (
              <section className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-2xl border">
                <div className="flex items-center gap-5">
                  <Avatar className="h-16 w-16 rounded-[24px] shadow-xl border-4 border-white">
                    <AvatarImage src={overview.profile?.profile_picture_url || overview.profile?.profile_photo_url || undefined} />
                    <AvatarFallback className="rounded-[24px] bg-blue-50 font-apple-heavy text-blue-600">TX</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-apple-heavy text-slate-950 tracking-tight">{getDisplayName(overview.profile, user.email)}</p>
                    <p className="truncate text-[10px] font-apple-heavy uppercase tracking-widest text-slate-400 mt-1">{getRole(overview.profile)}</p>
                  </div>
                </div>
                <div className="mt-10 grid grid-cols-3 gap-3">
                  <StatBlock label="Broadcasts" value={overview.posts} />
                  <StatBlock label="Influence" value={overview.followers} />
                  <StatBlock label="Visibility" value={profileStats?.profileViews ?? 0} />
                </div>
              </section>
            )}

            <section className="rounded-[40px] border border-slate-200 bg-white p-8 shadow-2xl border">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-lg font-apple-heavy text-slate-950 tracking-tight">Ecosystem Intelligence</h2>
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="space-y-4">
                {insightCards.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center justify-between rounded-[24px] border border-slate-100 p-5 transition-all hover:border-blue-200 hover:bg-blue-50 group shadow-sm hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <span className={cn('rounded-xl p-3 shadow-inner transition-transform group-hover:scale-110', item.tone)}><Icon className="h-5 w-5" /></span>
                        <div>
                          <p className="text-sm font-apple-heavy text-slate-950 tracking-tight">{item.label}</p>
                          <p className="text-[10px] font-apple-medium text-slate-400 uppercase tracking-widest mt-0.5">{item.detail}</p>
                        </div>
                      </div>
                      <span className="text-xl font-apple-heavy text-slate-950 tracking-tighter">{item.value}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
