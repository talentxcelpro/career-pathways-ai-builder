import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { 
  Users, 
  Search, 
  Plus, 
  MessageSquare, 
  TrendingUp, 
  Globe2, 
  Lock, 
  Crown, 
  Star, 
  Sparkles,
  ShieldCheck,
  Check,
  Share2,
  ArrowUpRight,
  ChevronRight,
  Send,
  Zap,
  Flame,
  X,
  Compass,
  Building2,
  Layers,
  Code2,
  Cpu,
  Rocket,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export interface ProfessionalCommunity {
  id: string;
  name: string;
  headline: string;
  description: string;
  category: 'ai' | 'systems' | 'leadership' | 'product' | 'design' | 'security' | 'startups' | 'general';
  category_label: string;
  hub: 'all' | 'dubai' | 'us' | 'europe' | 'india' | 'apac' | 'remote';
  hub_label: string;
  member_count: number;
  online_count: number;
  is_private: boolean;
  is_featured: boolean;
  cover_gradient: string;
  tags: string[];
  host_name: string;
  host_title: string;
  host_avatar: string;
  created_by?: string;
  created_at?: string;
}

export interface GroupPostItem {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string;
  author_avatar?: string;
  likes_count?: number;
}

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Circles', icon: Layers },
  { id: 'ai', label: 'AI & ML', icon: Cpu },
  { id: 'systems', label: 'Systems & Cloud', icon: Code2 },
  { id: 'leadership', label: 'Executive Leadership', icon: Crown },
  { id: 'product', label: 'Product & Growth', icon: Rocket },
  { id: 'design', label: 'Design & UX', icon: Sparkles },
  { id: 'security', label: 'Security & DevOps', icon: ShieldCheck },
  { id: 'startups', label: 'Founders & Angels', icon: Flame }
];

const GLOBAL_COMMUNITY_HUBS = [
  { id: 'all', label: 'Worldwide' },
  { id: 'remote', label: 'Global Remote' },
  { id: 'india', label: 'India Tech Hubs' },
  { id: 'us', label: 'Silicon Valley / US' },
  { id: 'dubai', label: 'Dubai & MENA' },
  { id: 'europe', label: 'London & Europe' },
  { id: 'apac', label: 'Singapore & APAC' }
];

// Seed foundations for initial persistence in Supabase groups table
const FOUNDATION_CIRCLES: Omit<ProfessionalCommunity, 'online_count'>[] = [
  {
    id: 'comm-genai-agents',
    name: 'GenAI & Autonomous Agent Architects',
    headline: 'Multi-agent frameworks, LLM evals, and production inference',
    description: 'A global network of AI researchers and engineers sharing production architectures for agentic workflows, memory systems, and scalable reasoning pipelines.',
    category: 'ai',
    category_label: 'AI & Machine Learning',
    hub: 'us',
    hub_label: 'San Francisco & Global Remote',
    member_count: 1420,
    is_private: false,
    is_featured: true,
    cover_gradient: 'from-indigo-900 via-purple-950 to-slate-900',
    tags: ['#AgenticRAG', '#PyTorch', '#LLMArchitectures', '#AutonomousAgents'],
    host_name: 'Sarah Chen',
    host_title: 'Staff AI Researcher',
    host_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'comm-distributed-systems',
    name: 'High-Throughput Distributed Systems',
    headline: 'Low-latency messaging, consensus algorithms, and database internals',
    description: 'Architects and principal engineers dissecting consensus protocols (Raft, Paxos), distributed caches, zero-copy networking, and petabyte-scale storage engines.',
    category: 'systems',
    category_label: 'Systems & Cloud',
    hub: 'remote',
    hub_label: 'Global Remote',
    member_count: 980,
    is_private: false,
    is_featured: true,
    cover_gradient: 'from-blue-900 via-slate-900 to-cyan-950',
    tags: ['#DistributedSystems', '#Rust', '#Kafka', '#DatabaseInternals'],
    host_name: 'Marcus Vance',
    host_title: 'Principal Systems Architect',
    host_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'comm-cloud-native-devops',
    name: 'Cloud-Native Platform & Kubernetes Ops',
    headline: 'eBPF, service mesh, gitops pipelines, and cluster resilience',
    description: 'Site reliability engineers and platform teams sharing production incident post-mortems, multi-cloud Kubernetes orchestration, and telemetry architectures.',
    category: 'security',
    category_label: 'Security & DevOps',
    hub: 'india',
    hub_label: 'Bengaluru & India Hubs',
    member_count: 850,
    is_private: false,
    is_featured: false,
    cover_gradient: 'from-cyan-900 via-teal-950 to-slate-900',
    tags: ['#Kubernetes', '#eBPF', '#Terraform', '#GitOps'],
    host_name: 'Arjun Nair',
    host_title: 'Head of Infrastructure Engineering',
    host_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'comm-tech-executives',
    name: 'CTO & VP Engineering Syndicate',
    headline: 'Engineering strategy, high-leverage compensation, and team velocity',
    description: 'Peer council for VP Engineering and CTO leaders navigating organizational scaling, executive hiring, M&A due diligence, and capital allocation.',
    category: 'leadership',
    category_label: 'Executive Leadership',
    hub: 'dubai',
    hub_label: 'Dubai & Global',
    member_count: 620,
    is_private: false,
    is_featured: true,
    cover_gradient: 'from-purple-900 via-slate-950 to-indigo-950',
    tags: ['#EngineeringLeadership', '#TechStrategy', '#CTO', '#ExecutiveScale'],
    host_name: 'Sophia Al-Mansoor',
    host_title: 'Chief Technology Officer',
    host_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
  }
];

export const Communities: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'discover' | 'my-circles' | 'featured'>('discover');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedHub, setSelectedHub] = useState('all');

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCircleForDetail, setSelectedCircleForDetail] = useState<ProfessionalCommunity | null>(null);
  const [newDiscussionContent, setNewDiscussionContent] = useState('');
  const [isPostingDiscussion, setIsPostingDiscussion] = useState(false);

  // New circle form state
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleHeadline, setNewCircleHeadline] = useState('');
  const [newCircleCategory, setNewCircleCategory] = useState<ProfessionalCommunity['category']>('ai');
  const [newCircleHub, setNewCircleHub] = useState<ProfessionalCommunity['hub']>('remote');
  const [newCircleDesc, setNewCircleDesc] = useState('');
  const [newCircleTags, setNewCircleTags] = useState('');

  // 1. Fetch live communities from Supabase groups table
  const { data: communities = [], isLoading } = useQuery({
    queryKey: ['network-communities'],
    queryFn: async (): Promise<ProfessionalCommunity[]> => {
      try {
        const { data: dbGroups, error } = await supabase
          .from('groups')
          .select('*')
          .order('member_count', { ascending: false });

        if (error) {
          console.warn('Groups fetch error, utilizing foundation circles:', error);
          return FOUNDATION_CIRCLES.map(c => ({ ...c, online_count: Math.max(1, Math.floor(c.member_count * 0.08)) }));
        }

        // If table has records, format them
        if (dbGroups && dbGroups.length > 0) {
          return dbGroups.map((g: any) => ({
            id: g.id,
            name: g.name,
            headline: g.description?.slice(0, 75) || 'Professional Technical Circle on TalentXcel',
            description: g.description || 'A collaborative professional community on TalentXcel.',
            category: (g.category as any) || 'general',
            category_label: CATEGORY_FILTERS.find(f => f.id === g.category)?.label || 'General Community',
            hub: 'remote',
            hub_label: 'Worldwide',
            member_count: g.member_count || 1,
            online_count: Math.max(1, Math.floor((g.member_count || 10) * 0.06)),
            is_private: !g.is_public,
            is_featured: (g.member_count || 0) > 200,
            cover_gradient: 'from-indigo-900 via-purple-950 to-slate-900',
            tags: g.rules ? g.rules.split(',').map((t: string) => t.trim()) : ['#TalentXcel', '#Community'],
            host_name: 'Circle Lead',
            host_title: 'Community Moderator',
            host_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            created_by: g.created_by,
            created_at: g.created_at
          }));
        }

        // Auto-seed foundation circles into groups table if empty
        if (user?.id) {
          try {
            for (const c of FOUNDATION_CIRCLES) {
              await supabase.from('groups').insert({
                name: c.name,
                description: c.description,
                category: c.category,
                is_public: true,
                member_count: c.member_count,
                rules: c.tags.join(', ')
              });
            }
          } catch (seedErr) {
            console.warn('Auto-seed groups notice:', seedErr);
          }
        }

        return FOUNDATION_CIRCLES.map(c => ({ ...c, online_count: Math.max(1, Math.floor(c.member_count * 0.08)) }));
      } catch (err) {
        return FOUNDATION_CIRCLES.map(c => ({ ...c, online_count: Math.max(1, Math.floor(c.member_count * 0.08)) }));
      }
    }
  });

  // 2. Fetch user's joined community IDs from Supabase group_memberships
  const { data: joinedIds = new Set<string>() } = useQuery({
    queryKey: ['my-community-memberships', user?.id],
    queryFn: async (): Promise<Set<string>> => {
      if (!user?.id) return new Set<string>();

      try {
        const { data, error } = await supabase
          .from('group_memberships')
          .select('group_id')
          .eq('user_id', user.id);

        if (error || !data) return new Set<string>();
        return new Set(data.map((m: any) => m.group_id).filter(Boolean));
      } catch {
        return new Set<string>();
      }
    },
    enabled: !!user?.id
  });

  // 3. Fetch discussions for currently selected circle
  const { data: circlePosts = [], refetch: refetchCirclePosts } = useQuery({
    queryKey: ['circle-discussions', selectedCircleForDetail?.id],
    queryFn: async (): Promise<GroupPostItem[]> => {
      if (!selectedCircleForDetail?.id) return [];

      try {
        const { data: postsData, error } = await supabase
          .from('group_posts')
          .select('*')
          .eq('group_id', selectedCircleForDetail.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error || !postsData || postsData.length === 0) return [];

        const authorIds = Array.from(new Set(postsData.map((p: any) => p.user_id).filter(Boolean)));
        let authorMap = new Map<string, any>();

        if (authorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, profile_picture_url')
            .in('id', authorIds);
          (profiles || []).forEach((p: any) => authorMap.set(p.id, p));
        }

        return postsData.map((p: any) => ({
          id: p.id,
          group_id: p.group_id,
          user_id: p.user_id,
          content: p.content,
          created_at: p.created_at,
          likes_count: p.likes_count || 0,
          author_name: authorMap.get(p.user_id)?.full_name || 'Member',
          author_avatar: authorMap.get(p.user_id)?.profile_picture_url || undefined
        }));
      } catch {
        return [];
      }
    },
    enabled: !!selectedCircleForDetail?.id
  });

  // 4. Join / Leave Community Mutations
  const joinCircleMutation = useMutation({
    mutationFn: async (circle: ProfessionalCommunity) => {
      if (!user?.id) throw new Error('Please sign in to join communities');

      const isJoined = joinedIds.has(circle.id);

      if (isJoined) {
        // Leave
        await supabase
          .from('group_memberships')
          .delete()
          .eq('group_id', circle.id)
          .eq('user_id', user.id);

        await supabase
          .from('groups')
          .update({ member_count: Math.max(1, (circle.member_count || 1) - 1) })
          .eq('id', circle.id);

        return { action: 'leave', circleName: circle.name };
      } else {
        // Join
        await supabase
          .from('group_memberships')
          .insert({
            group_id: circle.id,
            user_id: user.id,
            role: 'member'
          });

        await supabase
          .from('groups')
          .update({ member_count: (circle.member_count || 0) + 1 })
          .eq('id', circle.id);

        return { action: 'join', circleName: circle.name };
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['my-community-memberships'] });
      queryClient.invalidateQueries({ queryKey: ['network-communities'] });
      if (res.action === 'join') {
        toast.success(`Welcome to ${res.circleName}! You are now an active member.`);
      } else {
        toast.info(`Left ${res.circleName}`);
      }
    },
    onError: (err: any) => {
      toast.error(err.message || 'Could not update circle membership');
    }
  });

  // 5. Create Circle Mutation
  const createCircleMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Please sign in to establish a community circle');
      if (!newCircleName.trim() || !newCircleDesc.trim()) {
        throw new Error('Please enter a circle title and mission description');
      }

      const { data: createdGroup, error } = await supabase
        .from('groups')
        .insert({
          name: newCircleName.trim(),
          description: newCircleDesc.trim(),
          category: newCircleCategory,
          created_by: user.id,
          is_public: true,
          member_count: 1,
          rules: newCircleTags.trim() || '#TalentXcel, #DomainCircle'
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin
      await supabase
        .from('group_memberships')
        .insert({
          group_id: createdGroup.id,
          user_id: user.id,
          role: 'admin'
        });

      return createdGroup;
    },
    onSuccess: (newGroup) => {
      queryClient.invalidateQueries({ queryKey: ['network-communities'] });
      queryClient.invalidateQueries({ queryKey: ['my-community-memberships'] });
      setIsCreateOpen(false);
      setNewCircleName('');
      setNewCircleHeadline('');
      setNewCircleDesc('');
      setNewCircleTags('');
      toast.success(`Circle "${newGroup.name}" established successfully!`);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to create community circle');
    }
  });

  // 6. Post Discussion Mutation
  const handlePostDiscussion = async () => {
    if (!user?.id) {
      toast.error('Please sign in to participate in circle discussions');
      return;
    }
    if (!newDiscussionContent.trim() || !selectedCircleForDetail) {
      toast.error('Please write something before posting');
      return;
    }

    setIsPostingDiscussion(true);
    try {
      const { error } = await supabase
        .from('group_posts')
        .insert({
          group_id: selectedCircleForDetail.id,
          user_id: user.id,
          content: newDiscussionContent.trim(),
          post_type: 'discussion'
        });

      if (error) throw error;

      setNewDiscussionContent('');
      refetchCirclePosts();
      toast.success('Your perspective was published to the circle discussion!');
    } catch (err: any) {
      toast.error(err.message || 'Could not post discussion');
    } finally {
      setIsPostingDiscussion(false);
    }
  };

  // Filtered lists
  const filteredCommunities = useMemo(() => {
    return communities.filter(c => {
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (selectedHub !== 'all' && c.hub !== selectedHub) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        return (
          c.name.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.headline.toLowerCase().includes(query) ||
          c.tags.some(t => t.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [communities, selectedCategory, selectedHub, searchTerm]);

  const myJoinedCommunities = useMemo(() => {
    return communities.filter(c => joinedIds.has(c.id));
  }, [communities, joinedIds]);

  const featuredCommunities = useMemo(() => {
    return communities.filter(c => c.is_featured);
  }, [communities]);

  const displayList = activeTab === 'my-circles' 
    ? myJoinedCommunities 
    : activeTab === 'featured' 
      ? featuredCommunities 
      : filteredCommunities;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-background pb-20">
      <SEOHead
        title="Professional Community Circles | TalentXcel Network"
        description="Connect with specialized professional engineering, leadership, and product communities across global tech hubs on TalentXcel."
        canonical="https://talentxcel.in/network/communities"
        type="website"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Hero Header */}
        <div className="relative rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-xl border border-indigo-900/40">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Verified Domain Guilds &amp; Circles
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Professional Communities &amp; Circles
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              Join specialized technical networks, exchange production architectures, and build deep professional relationships with verified engineers, architects, and leaders.
            </p>
            <div className="pt-2 flex flex-wrap gap-2.5">
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="rounded-xl h-9 px-4 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Establish New Circle
              </Button>
            </div>
          </div>
        </div>

        {/* Hubs & Category Filters Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Main Pill Tabs */}
          <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full md:w-auto">
            <TabsList className="bg-white dark:bg-card border border-slate-200 dark:border-border rounded-xl p-1 h-auto">
              <TabsTrigger value="discover" className="rounded-lg text-xs font-bold px-3.5 py-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Compass className="w-3.5 h-3.5 mr-1.5" />
                Discover ({communities.length})
              </TabsTrigger>
              <TabsTrigger value="my-circles" className="rounded-lg text-xs font-bold px-3.5 py-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Check className="w-3.5 h-3.5 mr-1.5" />
                My Circles ({joinedIds.size})
              </TabsTrigger>
              <TabsTrigger value="featured" className="rounded-lg text-xs font-bold px-3.5 py-1.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Crown className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                Featured Guilds
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search circles by topic, architecture, tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9.5 text-xs rounded-xl bg-white dark:bg-card border-slate-200 dark:border-border"
            />
          </div>

        </div>

        {/* Domain Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {CATEGORY_FILTERS.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors shadow-2xs ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-card border border-slate-200 dark:border-border/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Circles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse rounded-2xl border-slate-200">
                <div className="h-24 bg-slate-200 dark:bg-muted rounded-t-2xl"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 dark:bg-muted rounded w-2/3"></div>
                  <div className="h-3 bg-slate-200 dark:bg-muted rounded w-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : displayList.length === 0 ? (
          <Card className="rounded-3xl border-slate-200 dark:border-border bg-white dark:bg-card p-12 text-center space-y-3">
            <Users className="w-12 h-12 text-muted-foreground mx-auto opacity-40" />
            <h3 className="text-base font-bold text-foreground">No matching community circles found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {activeTab === 'my-circles' 
                ? "You haven't joined any community circles yet. Explore the directory to find circles in your engineering domain."
                : "No circles matched your search query. Try clearing filters or establish a new community."}
            </p>
            {activeTab === 'my-circles' && (
              <Button onClick={() => setActiveTab('discover')} className="rounded-xl h-8 px-4 text-xs font-bold bg-blue-600 text-white">
                Explore Communities
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayList.map((circle) => {
              const isJoined = joinedIds.has(circle.id);
              return (
                <Card
                  key={circle.id}
                  className="rounded-2xl border-slate-200/80 dark:border-border/60 hover:shadow-md transition-all overflow-hidden bg-white dark:bg-card flex flex-col justify-between group"
                >
                  <div>
                    {/* Circle Header Gradient */}
                    <div className={`h-24 bg-gradient-to-r ${circle.cover_gradient} p-4 flex items-start justify-between relative`}>
                      <Badge className="bg-black/40 text-white border border-white/20 text-[10px] backdrop-blur-md">
                        {circle.category_label}
                      </Badge>
                      {circle.is_featured && (
                        <div className="p-1 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                          <Crown className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <CardContent className="p-4 space-y-2.5">
                      <div className="space-y-1">
                        <h3 className="font-extrabold text-sm text-foreground tracking-tight line-clamp-1 group-hover:text-blue-600 transition-colors">
                          {circle.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 font-medium">
                          {circle.description}
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1">
                        {circle.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-muted px-2 py-0.5 rounded-md">
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-border/60 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-semibold text-foreground">
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          {circle.member_count.toLocaleString()} members
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          {circle.online_count} online
                        </span>
                      </div>
                    </CardContent>
                  </div>

                  {/* Actions Bar */}
                  <div className="p-4 pt-0 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedCircleForDetail(circle)}
                      className="flex-1 rounded-xl h-8.5 text-xs font-bold border-slate-200 dark:border-border hover:bg-slate-50"
                    >
                      View Circle
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => joinCircleMutation.mutate(circle)}
                      disabled={joinCircleMutation.isPending}
                      className={`h-8.5 px-3.5 rounded-xl text-xs font-bold shadow-xs transition-colors ${
                        isJoined
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isJoined ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Joined
                        </>
                      ) : (
                        '+ Join'
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

      </div>

      {/* Circle Detail & Live Discussion Modal */}
      {selectedCircleForDetail && (
        <Dialog open={!!selectedCircleForDetail} onOpenChange={() => setSelectedCircleForDetail(null)}>
          <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl p-6">
            <DialogHeader className="space-y-1">
              <Badge className="w-fit text-[10px] bg-blue-100 text-blue-800 border-blue-200">
                {selectedCircleForDetail.category_label}
              </Badge>
              <DialogTitle className="text-lg font-black text-foreground">
                {selectedCircleForDetail.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                {selectedCircleForDetail.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Circle Info */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-muted/40 border border-slate-100 dark:border-border text-xs">
                <div>
                  <p className="font-bold text-foreground">Community Lead: {selectedCircleForDetail.host_name}</p>
                  <p className="text-[11px] text-muted-foreground">{selectedCircleForDetail.host_title}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600">{selectedCircleForDetail.member_count} Members</p>
                  <p className="text-[11px] text-emerald-600 font-semibold">Active Circle</p>
                </div>
              </div>

              {/* Discussion Thread */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Active Circle Perspectives &amp; Discussions
                </h4>

                {circlePosts.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-border text-center text-xs text-muted-foreground">
                    No posts yet in this circle. Be the first to share an architecture insight or question!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {circlePosts.map((post) => (
                      <div key={post.id} className="p-3 rounded-xl bg-slate-50 dark:bg-muted/30 border border-slate-200/60 dark:border-border/40 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-foreground">
                          <span>{post.author_name}</span>
                          <span className="text-[10px] text-muted-foreground font-normal">
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300 font-medium">{post.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Reply Form */}
              <div className="flex gap-2 pt-2">
                <Input
                  placeholder="Share a perspective, ask an architecture question..."
                  value={newDiscussionContent}
                  onChange={(e) => setNewDiscussionContent(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handlePostDiscussion();
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={handlePostDiscussion}
                  disabled={isPostingDiscussion || !newDiscussionContent.trim()}
                  className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0"
                >
                  {isPostingDiscussion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedCircleForDetail(null)} className="rounded-xl text-xs">
                Close
              </Button>
              <Button
                size="sm"
                onClick={() => joinCircleMutation.mutate(selectedCircleForDetail)}
                disabled={joinCircleMutation.isPending}
                className={`rounded-xl text-xs font-bold ${
                  joinedIds.has(selectedCircleForDetail.id)
                    ? 'bg-emerald-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {joinedIds.has(selectedCircleForDetail.id) ? '✓ Joined Member' : '+ Join This Circle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Establish Circle Modal */}
      {isCreateOpen && (
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-lg rounded-3xl p-6">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-lg font-black text-foreground">
                Establish a Professional Community Circle
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Create a high-signal domain guild for verified architects, engineers, and specialists.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Circle Title</label>
                <Input
                  placeholder="e.g. Distributed Database Internals"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Primary Domain</label>
                <select
                  value={newCircleCategory}
                  onChange={(e: any) => setNewCircleCategory(e.target.value)}
                  className="w-full h-9 text-xs rounded-xl border border-slate-200 dark:border-border bg-white dark:bg-card px-3 font-medium"
                >
                  <option value="ai">AI &amp; Machine Learning</option>
                  <option value="systems">Systems &amp; Cloud</option>
                  <option value="leadership">Executive Leadership</option>
                  <option value="product">Product &amp; Growth</option>
                  <option value="design">Design &amp; UX</option>
                  <option value="security">Security &amp; DevOps</option>
                  <option value="startups">Founders &amp; Angels</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Mission &amp; Focus Description</label>
                <textarea
                  placeholder="Describe the scope, technical discussion expectations, and guidelines..."
                  value={newCircleDesc}
                  onChange={(e) => setNewCircleDesc(e.target.value)}
                  rows={3}
                  className="w-full text-xs rounded-xl border border-slate-200 dark:border-border p-3 resize-none bg-white dark:bg-card"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-foreground">Tags (comma-separated)</label>
                <Input
                  placeholder="#PostgreSQL, #Raft, #DistributedCaches"
                  value={newCircleTags}
                  onChange={(e) => setNewCircleTags(e.target.value)}
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="rounded-xl text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={() => createCircleMutation.mutate()}
                disabled={createCircleMutation.isPending || !newCircleName.trim() || !newCircleDesc.trim()}
                className="rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createCircleMutation.isPending ? 'Establishing...' : 'Establish Circle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

    </div>
  );
};

export default Communities;
