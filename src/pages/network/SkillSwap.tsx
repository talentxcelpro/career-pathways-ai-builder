import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdvancedNetworking } from '@/hooks/useAdvancedNetworking';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useOptimizedAuth } from '@/contexts/OptimizedAuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  ArrowLeftRight,
  Zap,
  Users,
  Star,
  Calendar,
  MessageSquare,
  Plus,
  Search,
  TrendingUp,
  Award,
  BookOpen,
  Cpu,
  Briefcase,
  Globe,
  Heart,
  X,
  Check,
  Clock,
  Trophy,
  Shield,
  Sparkles,
  User,
  Coins,
  Filter,
  ChevronDown,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface RawExchange {
  id: string;
  requester_id: string | null;
  provider_id: string | null;
  skill_offered: string;
  skill_requested: string;
  description: string | null;
  estimated_hours: number | null;
  credits_value: number | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  deadline: string | null;
  completed_at: string | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  title: string | null;
  profile_picture_url: string | null;
  skills: string[] | null;
  about: string | null;
  location: string | null;
  username: string | null;
}

interface Exchange extends RawExchange {
  profile: Profile | null;
}

interface TxcBalance {
  user_id: string;
  txc_balance: number;
  total_earned: number;
  total_spent: number;
}

interface TxcTransaction {
  id: string;
  user_id: string;
  transaction_type: string | null;
  amount: number | null;
  description: string | null;
  activity_type: string | null;
  source: string | null;
  reference_id: string | null;
  created_at: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', label: 'All', icon: null },
  { id: 'programming', label: 'Programming', keywords: ['python', 'react', 'typescript', 'node', 'java', 'sql', 'coding', 'software', 'web', 'backend', 'frontend', 'javascript', 'c++', 'rust', 'go', 'api'] },
  { id: 'design', label: 'Design', keywords: ['figma', 'adobe', 'ui', 'ux', 'canva', 'illustration', 'video editing', 'motion', 'graphic', 'design', 'branding', 'prototype'] },
  { id: 'marketing', label: 'Marketing', keywords: ['seo', 'content', 'social media', 'email marketing', 'google ads', 'copywriting', 'growth', 'advertising', 'campaign'] },
  { id: 'finance', label: 'Finance', keywords: ['excel', 'financial', 'accounting', 'investment', 'budgeting', 'analytics', 'valuation', 'economics', 'tax'] },
  { id: 'hr', label: 'HR & People', keywords: ['hr', 'hiring', 'recruitment', 'talent', 'people', 'culture', 'onboarding', 'compensation'] },
  { id: 'career', label: 'Career Growth', keywords: ['resume', 'interview', 'career', 'cv', 'job', 'professional', 'growth', 'personal brand', 'linkedin'] },
  { id: 'ai', label: 'AI & Data', keywords: ['machine learning', 'data science', 'chatgpt', 'prompt', 'ai', 'power bi', 'tableau', 'nlp', 'deep learning', 'data analysis', 'ml', 'llm'] },
  { id: 'languages', label: 'Languages', keywords: ['english', 'spanish', 'french', 'german', 'mandarin', 'arabic', 'language', 'translation', 'writing'] },
  { id: 'leadership', label: 'Leadership', keywords: ['management', 'agile', 'product', 'strategy', 'speaking', 'negotiation', 'leadership', 'scrum', 'communication'] },
];

const POPULAR_SKILLS = [
  'Python', 'React', 'TypeScript', 'Node.js', 'Machine Learning', 'Data Science',
  'SQL', 'Java', 'C++', 'Figma', 'Adobe XD', 'UI/UX', 'Canva', 'Illustration',
  'Video Editing', 'Motion Graphics', 'SEO', 'Content Writing', 'Social Media',
  'Email Marketing', 'Google Ads', 'Copywriting', 'Excel', 'Financial Modeling',
  'Accounting', 'Investment Analysis', 'Budgeting', 'Management', 'Agile',
  'Product Management', 'Strategy', 'Public Speaking', 'Negotiation',
  'ChatGPT', 'Prompt Engineering', 'Data Analysis', 'Power BI', 'Tableau',
];

const LEARNING_PODS = [
  { id: 'programming', label: 'Tech & Dev', icon: Cpu, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', text: 'text-blue-700', keywords: ['python', 'react', 'typescript', 'node', 'java', 'sql', 'coding', 'software', 'web', 'backend', 'frontend', 'javascript', 'c++', 'rust', 'go', 'api'] },
  { id: 'design', label: 'Design & UX', icon: Sparkles, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50', text: 'text-pink-700', keywords: ['figma', 'adobe', 'ui', 'ux', 'canva', 'illustration', 'video editing', 'motion', 'graphic', 'design', 'branding', 'prototype'] },
  { id: 'finance', label: 'Business & Finance', icon: Briefcase, color: 'from-emerald-500 to-green-500', bg: 'bg-emerald-50', text: 'text-emerald-700', keywords: ['excel', 'financial', 'accounting', 'investment', 'budgeting', 'analytics', 'valuation', 'economics', 'tax'] },
  { id: 'marketing', label: 'Marketing', icon: TrendingUp, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50', text: 'text-orange-700', keywords: ['seo', 'content', 'social media', 'email marketing', 'google ads', 'copywriting', 'growth', 'advertising', 'campaign'] },
  { id: 'career', label: 'Career & HR', icon: Award, color: 'from-purple-500 to-violet-500', bg: 'bg-purple-50', text: 'text-purple-700', keywords: ['hr', 'hiring', 'recruitment', 'talent', 'resume', 'interview', 'career', 'cv', 'job', 'professional', 'growth'] },
  { id: 'ai', label: 'AI & Data', icon: Zap, color: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50', text: 'text-indigo-700', keywords: ['machine learning', 'data science', 'chatgpt', 'prompt', 'ai', 'power bi', 'tableau', 'nlp', 'deep learning', 'data analysis', 'ml', 'llm'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getLevelFromHours(hours: number | null): { label: string; color: string } {
  const h = hours ?? 1;
  if (h < 2) return { label: 'Beginner', color: 'bg-green-100 text-green-700 border-green-200' };
  if (h <= 5) return { label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  return { label: 'Advanced', color: 'bg-red-100 text-red-700 border-red-200' };
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function matchesCategory(exchange: RawExchange, categoryId: string): boolean {
  if (categoryId === 'all') return true;
  const cat = CATEGORIES.find(c => c.id === categoryId);
  if (!cat || !cat.keywords) return false;
  const haystack = `${exchange.skill_offered} ${exchange.skill_requested} ${exchange.description || ''}`.toLowerCase();
  return cat.keywords.some(k => haystack.includes(k));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
        </div>
      </div>
      <div className="h-10 bg-green-50 rounded-xl" />
      <div className="h-10 bg-blue-50 rounded-xl" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-100 rounded" />
        <div className="h-3 bg-gray-100 rounded w-5/6" />
        <div className="h-3 bg-gray-100 rounded w-4/6" />
      </div>
      <div className="h-10 bg-blue-100 rounded-xl" />
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ profile, size = 'md' }: { profile: Profile | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-9 h-9', md: 'w-12 h-12', lg: 'w-16 h-16' };
  const iconSizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-7 w-7' };
  return (
    <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden shadow-md flex-shrink-0`}>
      {profile?.profile_picture_url ? (
        <img src={profile.profile_picture_url} alt={profile.full_name || 'User'} className="w-full h-full object-cover" />
      ) : (
        <User className={`${iconSizes[size]} text-white`} />
      )}
    </div>
  );
}

// ─── Exchange Card ────────────────────────────────────────────────────────────

function ExchangeCard({ exchange, currentUserId, onRequest, onMessage }: {
  exchange: Exchange;
  currentUserId: string | null;
  onRequest: (id: string) => void;
  onMessage: (id: string) => void;
}) {
  const level = getLevelFromHours(exchange.estimated_hours);
  const sessionMin = exchange.estimated_hours ? Math.round(exchange.estimated_hours * 60) : 60;
  const credits = exchange.credits_value ?? 10;
  const isMine = exchange.requester_id === currentUserId;

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group relative">
      {/* Decorative orb */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full translate-x-10 -translate-y-10 pointer-events-none" />

      <div className="p-6 relative">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar profile={exchange.profile} />
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 dark:text-foreground truncate">
              {exchange.profile?.full_name || 'Community Member'}
            </p>
            <p className="text-xs text-gray-500 dark:text-muted-foreground truncate">
              {exchange.profile?.title || 'Professional'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge className={`text-xs px-2 py-0.5 rounded-full border ${level.color}`}>
              {level.label}
            </Badge>
            <span className="text-xs text-gray-400">{relativeTime(exchange.created_at)}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-100 dark:border-green-900/40 rounded-xl px-3 py-2">
            <span className="text-xs font-bold text-green-600 uppercase tracking-wide whitespace-nowrap">TEACHES →</span>
            <span className="text-sm font-semibold text-green-800 dark:text-green-300 truncate">{exchange.skill_offered}</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 rounded-xl px-3 py-2">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wide whitespace-nowrap">LEARNS ←</span>
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-300 truncate">{exchange.skill_requested}</span>
          </div>
        </div>

        {/* Description */}
        {exchange.description && (
          <p className="text-sm text-gray-600 dark:text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
            {exchange.description}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-1.5 text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{sessionMin}min</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
            <Coins className="h-4 w-4" />
            <span>{credits} TXC</span>
          </div>
        </div>

        {/* Actions */}
        {!isMine && (
          <div className="flex gap-2">
            <Button
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-medium text-sm"
              onClick={() => onRequest(exchange.id)}
            >
              Request Exchange
            </Button>
            <Button
              variant="outline"
              className="p-2.5 rounded-xl border-gray-200"
              onClick={() => onMessage(exchange.id)}
            >
              <MessageSquare className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        )}
        {isMine && (
          <div className="flex items-center justify-center py-1">
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 text-xs">
              <Check className="h-3 w-3 mr-1" />Your listing
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Hero Stats ───────────────────────────────────────────────────────────────

function HeroStats({ activeCount, profileCount, txcCirculation, loading }: {
  activeCount: number;
  profileCount: number;
  txcCirculation: number;
  loading: boolean;
}) {
  const stats = [
    { label: 'Active Exchanges', value: activeCount, icon: ArrowLeftRight, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Learners', value: profileCount, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'TXC in Circulation', value: txcCirculation.toLocaleString(), icon: Coins, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map(stat => (
        <div key={stat.label} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-4 text-center">
          <div className={`inline-flex p-2 rounded-xl ${stat.bg} mb-2`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          {loading ? (
            <div className="h-7 bg-gray-200 rounded animate-pulse w-16 mx-auto mb-1" />
          ) : (
            <p className="text-2xl font-bold text-gray-900 dark:text-foreground">{stat.value}</p>
          )}
          <p className="text-xs text-gray-500 dark:text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const SkillSwap: React.FC = () => {
  const { user } = useOptimizedAuth();
  const { createSkillExchange, loading: createLoading } = useAdvancedNetworking();
  const { availableBalance, refreshBalance } = useTokenBalance();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('marketplace');
  const [myExchangesSubTab, setMyExchangesSubTab] = useState<'posted' | 'received'>('posted');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [skillSuggestField, setSkillSuggestField] = useState<'offered' | 'requested' | null>(null);

  // Create form state
  const [formData, setFormData] = useState({
    skill_offered: '',
    skill_requested: '',
    description: '',
    estimated_hours: 1,
    credits_value: 50,
    format: '1-on-1 Video',
  });

  // ─── Queries ──────────────────────────────────────────────────────────────

  // All exchanges with profiles
  const { data: exchanges = [], isLoading: exchangesLoading } = useQuery<Exchange[]>({
    queryKey: ['skill-exchanges'],
    queryFn: async () => {
      const { data: raw, error } = await supabase
        .from('skill_exchanges')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!raw || raw.length === 0) return [];

      const userIds = Array.from(new Set(raw.map((e: RawExchange) => e.requester_id).filter(Boolean)));
      let profilesMap = new Map<string, Profile>();

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, title, profile_picture_url, skills, about, location, username')
          .in('id', userIds);

        if (profiles) {
          profilesMap = new Map(profiles.map((p: Profile) => [p.id, p]));
        }
      }

      return raw.map((e: RawExchange): Exchange => ({
        ...e,
        profile: e.requester_id ? (profilesMap.get(e.requester_id) ?? null) : null,
      }));
    },
    staleTime: 30000,
  });

  // Global stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['skill-swap-stats'],
    queryFn: async () => {
      const [exchangeRes, profileRes, txcRes] = await Promise.all([
        supabase.from('skill_exchanges').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('user_txc_balances').select('txc_balance'),
      ]);

      const activeCount = exchangeRes.count ?? 0;
      const profileCount = profileRes.count ?? 0;
      const txcCirculation = (txcRes.data ?? []).reduce((sum: number, row: { txc_balance: number }) => sum + (row.txc_balance || 0), 0);

      return { activeCount, profileCount, txcCirculation };
    },
    staleTime: 60000,
  });

  // My TXC balance details
  const { data: myBalance } = useQuery<TxcBalance | null>({
    queryKey: ['my-txc-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('user_txc_balances')
        .select('user_id, txc_balance, total_earned, total_spent')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') return null;
      return data as TxcBalance | null;
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // My TXC transactions
  const { data: myTransactions = [] } = useQuery<TxcTransaction[]>({
    queryKey: ['my-txc-transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('txc_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) return [];
      return (data as TxcTransaction[]) ?? [];
    },
    enabled: !!user?.id,
    staleTime: 30000,
  });

  // ─── Realtime subscriptions ───────────────────────────────────────────────

  useEffect(() => {
    const channel = supabase
      .channel('skillswap-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'skill_exchanges' }, () => {
        queryClient.invalidateQueries({ queryKey: ['skill-exchanges'] });
        queryClient.invalidateQueries({ queryKey: ['skill-swap-stats'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_txc_balances' }, () => {
        queryClient.invalidateQueries({ queryKey: ['my-txc-balance'] });
        queryClient.invalidateQueries({ queryKey: ['skill-swap-stats'] });
        refreshBalance();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'txc_transactions' }, () => {
        queryClient.invalidateQueries({ queryKey: ['my-txc-transactions'] });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [queryClient, refreshBalance]);

  // ─── Filtered exchanges ───────────────────────────────────────────────────

  const filteredExchanges = exchanges.filter(ex => {
    const catMatch = matchesCategory(ex, activeCategory);
    const searchMatch = !searchTerm ||
      ex.skill_offered.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ex.skill_requested.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ex.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return catMatch && searchMatch;
  });

  const myPostedExchanges = exchanges.filter(ex => ex.requester_id === user?.id);
  const receivedRequests = exchanges.filter(ex => ex.provider_id === user?.id);

  // ─── Pod exchange counts ──────────────────────────────────────────────────

  function podCount(pod: typeof LEARNING_PODS[0]) {
    return exchanges.filter(ex => {
      const haystack = `${ex.skill_offered} ${ex.skill_requested} ${ex.description || ''}`.toLowerCase();
      return pod.keywords.some(k => haystack.includes(k));
    }).length;
  }

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleRequest = useCallback((id: string) => {
    if (!user) {
      toast.error('Please sign in to request an exchange');
      return;
    }
    toast.success('Exchange request sent!', { description: 'The other member will be notified.' });
  }, [user]);

  const handleMessage = useCallback((id: string) => {
    if (!user) {
      toast.error('Please sign in to send messages');
      return;
    }
    toast.info('Messaging feature coming soon!');
  }, [user]);

  const handleCreateExchange = async () => {
    if (!user) {
      toast.error('Please sign in to create an exchange');
      return;
    }
    if (!formData.skill_offered.trim() || !formData.skill_requested.trim()) {
      toast.error('Please fill in both skill fields');
      return;
    }

    const result = await createSkillExchange(
      formData.skill_offered.trim(),
      formData.skill_requested.trim(),
      formData.description.trim(),
      formData.credits_value,
      formData.estimated_hours,
    );

    if (result.success) {
      setShowCreatePanel(false);
      setFormData({ skill_offered: '', skill_requested: '', description: '', estimated_hours: 1, credits_value: 50, format: '1-on-1 Video' });
      queryClient.invalidateQueries({ queryKey: ['skill-exchanges'] });
      queryClient.invalidateQueries({ queryKey: ['skill-swap-stats'] });
      refreshBalance();
    }
  };

  const handlePodClick = (pod: typeof LEARNING_PODS[0]) => {
    setActiveCategory(pod.id);
    setActiveTab('marketplace');
  };

  const skillSuggestions = POPULAR_SKILLS.filter(s =>
    skillSuggestField === 'offered'
      ? s.toLowerCase().includes(formData.skill_offered.toLowerCase()) && formData.skill_offered.length > 0
      : s.toLowerCase().includes(formData.skill_requested.toLowerCase()) && formData.skill_requested.length > 0,
  ).slice(0, 6);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-full px-3 py-1 text-xs font-semibold mb-2">
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Skill Exchange Network
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground">
              Learn. Teach. <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Grow Together.</span>
            </h1>
            <p className="text-gray-500 dark:text-muted-foreground text-sm mt-1">
              Trade skills, earn TXC, and accelerate your career in a thriving peer community
            </p>
          </div>
          <Button
            onClick={() => setShowCreatePanel(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl px-5 py-2.5 font-semibold shadow-md whitespace-nowrap"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Exchange
          </Button>
        </div>

        {/* ── Balance Banner (authenticated) ──────────────────────────────── */}
        {user && (
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/20 rounded-xl">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">{availableBalance || myBalance?.txc_balance || 0} TXC</p>
                <p className="text-blue-100 text-xs">Available credits</p>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-white font-semibold">{myBalance?.total_earned?.toLocaleString() ?? '—'}</p>
                <p className="text-blue-100 text-xs">Earned</p>
              </div>
              <div>
                <p className="text-white font-semibold">{myBalance?.total_spent?.toLocaleString() ?? '—'}</p>
                <p className="text-blue-100 text-xs">Spent</p>
              </div>
              <div>
                <p className="text-white font-semibold">{myPostedExchanges.length}</p>
                <p className="text-blue-100 text-xs">My Listings</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Main Tabs ────────────────────────────────────────────────────── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="bg-white/70 dark:bg-card/70 backdrop-blur-sm border border-white/30 dark:border-border rounded-2xl p-1.5 shadow-sm inline-flex gap-1 min-w-max">
              {[
                { value: 'marketplace', label: 'Marketplace', icon: ArrowLeftRight },
                { value: 'mentorship', label: 'Mentorship Hub', icon: Star },
                { value: 'pods', label: 'Learning Pods', icon: BookOpen },
                { value: 'my-exchanges', label: 'My Exchanges', icon: Trophy },
                { value: 'create', label: '+ Create', icon: Plus },
              ].map(tab => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="rounded-xl px-4 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-700 flex items-center gap-1.5"
                >
                  <tab.icon className="h-3.5 w-3.5" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 1: MARKETPLACE
          ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="marketplace" className="space-y-6">

            {/* Stats Bar */}
            <HeroStats
              activeCount={stats?.activeCount ?? 0}
              profileCount={stats?.profileCount ?? 0}
              txcCirculation={stats?.txcCirculation ?? 0}
              loading={statsLoading}
            />

            {/* Search + Category Filters */}
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-4 space-y-4">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search skills, topics, descriptions..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl border-gray-200"
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                      activeCategory === cat.id
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                        : 'bg-white dark:bg-muted text-gray-600 dark:text-muted-foreground border-gray-200 dark:border-border hover:border-blue-300 hover:text-blue-600'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {exchangesLoading ? 'Loading...' : `${filteredExchanges.length} exchange${filteredExchanges.length !== 1 ? 's' : ''} found`}
              </p>
              {activeCategory !== 'all' && (
                <button onClick={() => setActiveCategory('all')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                  <X className="h-3 w-3" /> Clear filter
                </button>
              )}
            </div>

            {/* Grid */}
            {exchangesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => <CardSkeleton key={i} />)}
              </div>
            ) : filteredExchanges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredExchanges.map(ex => (
                  <ExchangeCard
                    key={ex.id}
                    exchange={ex}
                    currentUserId={user?.id ?? null}
                    onRequest={handleRequest}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/60 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ArrowLeftRight className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-2">
                  {searchTerm || activeCategory !== 'all' ? 'No matches found' : 'No exchanges yet'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-muted-foreground max-w-xs mx-auto mb-6">
                  {searchTerm || activeCategory !== 'all'
                    ? 'Try a different search term or category filter'
                    : 'Be the first to post a skill exchange and start the community!'}
                </p>
                {activeCategory !== 'all' || searchTerm ? (
                  <Button variant="outline" onClick={() => { setSearchTerm(''); setActiveCategory('all'); }}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"
                    onClick={() => setShowCreatePanel(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Exchange
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 2: MENTORSHIP HUB
          ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="mentorship" className="space-y-6">
            <div className="text-center py-6">
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 rounded-full px-3 py-1 text-xs font-semibold mb-3">
                <Star className="h-3.5 w-3.5" />
                Mentorship Hub
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">Find an Expert Mentor in Your Field</h2>
              <p className="text-gray-500 dark:text-muted-foreground text-sm max-w-md mx-auto">
                Connect with experienced professionals who've posted skill exchanges focused on teaching and mentoring
              </p>
            </div>

            <MentorshipSection exchanges={exchanges} loading={exchangesLoading} onRequest={handleRequest} />
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 3: LEARNING PODS
          ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="pods" className="space-y-6">
            <div className="text-center py-6">
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-3 py-1 text-xs font-semibold mb-3">
                <BookOpen className="h-3.5 w-3.5" />
                Learning Pods
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-foreground mb-2">Join a Community Learning Pod</h2>
              <p className="text-gray-500 dark:text-muted-foreground text-sm max-w-md mx-auto">
                Skill-focused micro-communities. Click a pod to explore its exchanges.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {LEARNING_PODS.map(pod => {
                const count = podCount(pod);
                return (
                  <div
                    key={pod.id}
                    className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group"
                    onClick={() => handlePodClick(pod)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${pod.color}`} />
                    <div className="p-6">
                      <div className={`inline-flex p-3 rounded-xl ${pod.bg} mb-4`}>
                        <pod.icon className={`h-6 w-6 ${pod.text}`} />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-1">{pod.label}</h3>
                      <p className={`text-2xl font-black ${pod.text} mb-1`}>{count}</p>
                      <p className="text-xs text-gray-400 mb-5">active exchange{count !== 1 ? 's' : ''}</p>
                      <Button
                        className={`w-full rounded-xl bg-gradient-to-r ${pod.color} text-white border-0 font-semibold group-hover:shadow-md transition-all`}
                        onClick={e => { e.stopPropagation(); handlePodClick(pod); }}
                      >
                        Explore Pod →
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 4: MY EXCHANGES
          ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="my-exchanges" className="space-y-6">
            {!user ? (
              <div className="text-center py-20 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border">
                <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-2">Sign in to view your exchanges</h3>
                <p className="text-sm text-gray-500 dark:text-muted-foreground">Your personal dashboard awaits after sign-in</p>
              </div>
            ) : (
              <>
                {/* Sub-tab toggle */}
                <div className="flex gap-2">
                  {(['posted', 'received'] as const).map(sub => (
                    <button
                      key={sub}
                      onClick={() => setMyExchangesSubTab(sub)}
                      className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                        myExchangesSubTab === sub
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white dark:bg-muted text-gray-600 dark:text-muted-foreground border-gray-200 dark:border-border hover:border-blue-300'
                      }`}
                    >
                      {sub === 'posted' ? `My Listings (${myPostedExchanges.length})` : `Received Requests (${receivedRequests.length})`}
                    </button>
                  ))}
                </div>

                {/* Posted */}
                {myExchangesSubTab === 'posted' && (
                  myPostedExchanges.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {myPostedExchanges.map(ex => (
                        <MyExchangeCard key={ex.id} exchange={ex} />
                      ))}
                    </div>
                  ) : (
                    <EmptyMyExchanges onCreate={() => setShowCreatePanel(true)} />
                  )
                )}

                {/* Received */}
                {myExchangesSubTab === 'received' && (
                  receivedRequests.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {receivedRequests.map(ex => (
                        <ExchangeCard
                          key={ex.id}
                          exchange={ex}
                          currentUserId={user?.id ?? null}
                          onRequest={handleRequest}
                          onMessage={handleMessage}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border">
                      <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-2">No requests received yet</h3>
                      <p className="text-sm text-gray-500 dark:text-muted-foreground">When others request your skills, they'll appear here</p>
                    </div>
                  )
                )}

                {/* TXC Transaction History */}
                <TxcHistory transactions={myTransactions} balance={myBalance} />
              </>
            )}
          </TabsContent>

          {/* ═══════════════════════════════════════════════════════════════
              TAB 5: CREATE EXCHANGE
          ═══════════════════════════════════════════════════════════════ */}
          <TabsContent value="create" className="space-y-6">
            <CreateExchangeForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCreateExchange}
              loading={createLoading}
              user={user}
              skillSuggestions={skillSuggestions}
              skillSuggestField={skillSuggestField}
              setSkillSuggestField={setSkillSuggestField}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Slide-in Create Panel ─────────────────────────────────────────── */}
      {showCreatePanel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white dark:bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-border">
              <h3 className="text-lg font-bold text-gray-900 dark:text-foreground">Create Skill Exchange</h3>
              <button onClick={() => setShowCreatePanel(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-muted rounded-xl transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-5">
              <CreateExchangeForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={() => handleCreateExchange().then(() => setShowCreatePanel(false))}
                loading={createLoading}
                user={user}
                skillSuggestions={skillSuggestions}
                skillSuggestField={skillSuggestField}
                setSkillSuggestField={setSkillSuggestField}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function MentorshipSection({ exchanges, loading, onRequest }: {
  exchanges: Exchange[];
  loading: boolean;
  onRequest: (id: string) => void;
}) {
  // Mentors: profiles that posted exchanges with 'mentor' in description or skill, deduplicated by user
  const mentorExchanges = exchanges.filter(ex => {
    const haystack = `${ex.skill_offered} ${ex.description || ''}`.toLowerCase();
    return haystack.includes('mentor') || haystack.includes('coach') || haystack.includes('teach');
  });

  // Fallback: top contributors
  const contributors = [...exchanges].sort((a, b) => {
    // Count how many times each requester_id appears
    const aCount = exchanges.filter(e => e.requester_id === a.requester_id).length;
    const bCount = exchanges.filter(e => e.requester_id === b.requester_id).length;
    return bCount - aCount;
  }).filter((ex, idx, arr) => arr.findIndex(e => e.requester_id === ex.requester_id) === idx).slice(0, 6);

  const displayList = mentorExchanges.length > 0 ? mentorExchanges.slice(0, 6) : contributors;

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (displayList.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Structural "coming soon" mentor cards */}
        {[
          { name: 'Senior Engineer', title: 'Full-Stack Development', skills: ['React', 'Node.js', 'TypeScript'] },
          { name: 'UX Designer', title: 'Product Design & Research', skills: ['Figma', 'User Research', 'Prototyping'] },
          { name: 'Data Scientist', title: 'AI & Machine Learning', skills: ['Python', 'ML', 'Data Analysis'] },
        ].map((m, i) => (
          <div key={i} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">{m.name}</p>
                <p className="text-xs text-gray-400">{m.title}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {m.skills.map(s => (
                <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
              ))}
            </div>
            <p className="text-xs text-gray-400 italic mb-4">Mentor profiles coming soon — be the first to list yourself!</p>
            <Button variant="outline" className="w-full rounded-xl text-sm" disabled>
              <Clock className="h-3.5 w-3.5 mr-2" />Coming Soon
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {displayList.map(ex => {
        const sessionCount = exchanges.filter(e => e.requester_id === ex.requester_id).length;
        return (
          <div key={ex.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm hover:shadow-lg transition-all duration-300 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Avatar profile={ex.profile} size="lg" />
              <div>
                <p className="font-bold text-gray-900 dark:text-foreground">{ex.profile?.full_name || 'Community Expert'}</p>
                <p className="text-xs text-gray-500 dark:text-muted-foreground">{ex.profile?.title || 'Professional'}</p>
              </div>
            </div>

            {ex.profile?.skills && ex.profile.skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {ex.profile.skills.slice(0, 4).map((s: string) => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            )}

            <div className="bg-green-50 dark:bg-green-950/30 rounded-xl px-3 py-2 mb-4">
              <p className="text-xs font-bold text-green-600 uppercase">Teaches</p>
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">{ex.skill_offered}</p>
            </div>

            <div className="flex items-center justify-between mb-4 text-sm">
              <span className="text-gray-500"><Calendar className="h-4 w-4 inline mr-1" />{sessionCount} session{sessionCount !== 1 ? 's' : ''}</span>
              <span className="font-bold text-blue-600">{ex.credits_value ?? 10} TXC/hr</span>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-semibold"
              onClick={() => onRequest(ex.id)}
            >
              <Star className="h-4 w-4 mr-2" />
              Book Session
            </Button>
          </div>
        );
      })}
    </div>
  );
}

function MyExchangeCard({ exchange }: { exchange: Exchange }) {
  const level = getLevelFromHours(exchange.estimated_hours);
  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700 border-green-200',
    completed: 'bg-blue-100 text-blue-700 border-blue-200',
    paused: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    cancelled: 'bg-red-100 text-red-700 border-red-200',
  };
  const statusColor = statusColors[exchange.status || 'active'] || statusColors.active;

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm hover:shadow-md transition-all p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-2">
          <Badge className={`text-xs border ${level.color}`}>{level.label}</Badge>
          <Badge className={`text-xs border ${statusColor}`}>{exchange.status || 'active'}</Badge>
        </div>
        <span className="text-xs text-gray-400">{relativeTime(exchange.created_at)}</span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="bg-green-50 dark:bg-green-950/30 rounded-xl px-3 py-2">
          <span className="text-xs font-bold text-green-600 uppercase">TEACHES →</span>
          <p className="text-sm font-semibold text-green-800 dark:text-green-300">{exchange.skill_offered}</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl px-3 py-2">
          <span className="text-xs font-bold text-blue-600 uppercase">LEARNS ←</span>
          <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">{exchange.skill_requested}</p>
        </div>
      </div>

      {exchange.description && (
        <p className="text-xs text-gray-500 dark:text-muted-foreground line-clamp-2 mb-4">{exchange.description}</p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-border">
        <div className="flex items-center gap-1.5 text-blue-600 font-bold text-sm">
          <Coins className="h-4 w-4" />
          <span>{exchange.credits_value ?? 10} TXC</span>
        </div>
        <div className="flex items-center gap-1 text-sm text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          <span>{exchange.estimated_hours ? Math.round(exchange.estimated_hours * 60) : 60}min</span>
        </div>
      </div>
    </div>
  );
}

function EmptyMyExchanges({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="text-center py-20 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border">
      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950/60 rounded-full flex items-center justify-center mx-auto mb-4">
        <ArrowLeftRight className="h-8 w-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-2">No exchanges posted yet</h3>
      <p className="text-sm text-gray-500 dark:text-muted-foreground max-w-xs mx-auto mb-6">
        Share your skills with the community and start earning TXC credits!
      </p>
      <Button
        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl"
        onClick={onCreate}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create Your First Exchange
      </Button>
    </div>
  );
}

function TxcHistory({ transactions, balance }: { transactions: TxcTransaction[]; balance: TxcBalance | null }) {
  if (!balance && transactions.length === 0) return null;

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 dark:border-border flex items-center justify-between">
        <h3 className="font-bold text-gray-900 dark:text-foreground flex items-center gap-2">
          <Coins className="h-5 w-5 text-amber-500" />
          TXC Transaction History
        </h3>
        <span className="text-xs text-gray-400">Last 10 transactions</span>
      </div>

      {transactions.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400">No transactions recorded yet</div>
      ) : (
        <div className="divide-y divide-gray-50 dark:divide-border">
          {transactions.map(tx => (
            <div key={tx.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-foreground">{tx.description || tx.activity_type || 'Transaction'}</p>
                <p className="text-xs text-gray-400">{relativeTime(tx.created_at)}</p>
              </div>
              <span className={`font-bold text-sm ${(tx.amount ?? 0) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {(tx.amount ?? 0) >= 0 ? '+' : ''}{tx.amount} TXC
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type FormData = {
  skill_offered: string;
  skill_requested: string;
  description: string;
  estimated_hours: number;
  credits_value: number;
  format: string;
};

function CreateExchangeForm({
  formData,
  setFormData,
  onSubmit,
  loading,
  user,
  skillSuggestions,
  skillSuggestField,
  setSkillSuggestField,
}: {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  onSubmit: () => void;
  loading: boolean;
  user: any;
  skillSuggestions: string[];
  skillSuggestField: 'offered' | 'requested' | null;
  setSkillSuggestField: React.Dispatch<React.SetStateAction<'offered' | 'requested' | null>>;
}) {
  if (!user) {
    return (
      <div className="text-center py-16 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border">
        <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-foreground mb-2">Sign in to create an exchange</h3>
        <p className="text-sm text-gray-500 dark:text-muted-foreground">Join the community to start sharing and learning</p>
      </div>
    );
  }

  const durationOptions = [
    { label: '30 minutes', value: 0.5 },
    { label: '1 hour', value: 1 },
    { label: '2 hours', value: 2 },
    { label: '4+ hours', value: 4 },
  ];

  return (
    <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-border shadow-sm p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-foreground mb-1">Create a Skill Exchange</h3>
        <p className="text-sm text-gray-500 dark:text-muted-foreground">Post what you can teach and what you'd like to learn in return</p>
      </div>

      {/* Skill Offered */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
          What I Teach <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            value={formData.skill_offered}
            onChange={e => setFormData(f => ({ ...f, skill_offered: e.target.value }))}
            onFocus={() => setSkillSuggestField('offered')}
            onBlur={() => setTimeout(() => setSkillSuggestField(null), 200)}
            placeholder="e.g. Python, Figma, SEO..."
            className="rounded-xl border-gray-200"
          />
          {skillSuggestField === 'offered' && skillSuggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-lg">
              {skillSuggestions.map(s => (
                <button
                  key={s}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/30 first:rounded-t-xl last:rounded-b-xl"
                  onMouseDown={() => setFormData(f => ({ ...f, skill_offered: s }))}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Skill Requested */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
          What I Want to Learn <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            value={formData.skill_requested}
            onChange={e => setFormData(f => ({ ...f, skill_requested: e.target.value }))}
            onFocus={() => setSkillSuggestField('requested')}
            onBlur={() => setTimeout(() => setSkillSuggestField(null), 200)}
            placeholder="e.g. React, Marketing, Leadership..."
            className="rounded-xl border-gray-200"
          />
          {skillSuggestField === 'requested' && skillSuggestions.length > 0 && (
            <div className="absolute z-20 w-full mt-1 bg-white dark:bg-card border border-gray-200 dark:border-border rounded-xl shadow-lg">
              {skillSuggestions.map(s => (
                <button
                  key={s}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/30 first:rounded-t-xl last:rounded-b-xl"
                  onMouseDown={() => setFormData(f => ({ ...f, skill_requested: s }))}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">Description</label>
        <Textarea
          value={formData.description}
          onChange={e => setFormData(f => ({ ...f, description: e.target.value.slice(0, 500) }))}
          placeholder="Describe your teaching style, experience level, what you'll cover, and what you're hoping to learn..."
          rows={4}
          className="rounded-xl border-gray-200 resize-none"
        />
        <p className="text-xs text-gray-400 mt-1 text-right">{formData.description.length}/500</p>
      </div>

      {/* Duration + Format row */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">Session Duration</label>
          <Select
            value={String(formData.estimated_hours)}
            onValueChange={v => setFormData(f => ({ ...f, estimated_hours: Number(v) }))}
          >
            <SelectTrigger className="rounded-xl border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map(opt => (
                <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">Format</label>
          <Select
            value={formData.format}
            onValueChange={v => setFormData(f => ({ ...f, format: v }))}
          >
            <SelectTrigger className="rounded-xl border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['1-on-1 Video', 'Group Session', 'Async Review', 'Chat'].map(fmt => (
                <SelectItem key={fmt} value={fmt}>{fmt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* TXC Slider */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-foreground mb-1.5">
          TXC Credits to Request: <span className="text-blue-600 font-bold">{formData.credits_value} TXC</span>
        </label>
        <Slider
          min={10}
          max={500}
          step={10}
          value={[formData.credits_value]}
          onValueChange={([v]) => setFormData(f => ({ ...f, credits_value: v }))}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>10 TXC</span>
          <span>500 TXC</span>
        </div>
      </div>

      {/* Submit */}
      <Button
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl py-3 font-semibold text-sm shadow-md"
        onClick={onSubmit}
        disabled={loading || !formData.skill_offered.trim() || !formData.skill_requested.trim()}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Posting Exchange...
          </div>
        ) : (
          <>
            <Zap className="h-4 w-4 mr-2" />
            Post Exchange
          </>
        )}
      </Button>
    </div>
  );
}

export default SkillSwap;
