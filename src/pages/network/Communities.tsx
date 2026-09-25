import React, { useState, useMemo, useCallback } from 'react';
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
  Rocket
} from 'lucide-react';
import { toast } from 'sonner';

export interface ProfessionalCommunity {
  id: string;
  name: string;
  headline: string;
  description: string;
  category: 'ai' | 'systems' | 'leadership' | 'product' | 'design' | 'security' | 'startups';
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
  recent_discussion: {
    title: string;
    replies_count: number;
    author: string;
    time_ago: string;
  };
  member_avatars: string[];
}

const GLOBAL_COMMUNITIES: ProfessionalCommunity[] = [
  {
    id: 'comm-genai-agents',
    name: 'GenAI & Autonomous Agent Architects',
    headline: 'Multi-agent frameworks, LLM evals, and production inference',
    description: 'A global network of AI researchers and engineers sharing production architectures for agentic workflows, memory systems, and scalable reasoning pipelines.',
    category: 'ai',
    category_label: 'AI & Machine Learning',
    hub: 'us',
    hub_label: 'San Francisco & Global Remote',
    member_count: 18420,
    online_count: 620,
    is_private: false,
    is_featured: true,
    cover_gradient: 'from-indigo-900 via-purple-950 to-slate-900',
    tags: ['#AgenticRAG', '#PyTorch', '#LLMArchitectures', '#AutonomousAgents'],
    host_name: 'Sarah Chen',
    host_title: 'Staff AI Researcher @ Anthropic',
    host_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    recent_discussion: {
      title: 'Consensus protocols for multi-agent reasoning graphs at scale',
      replies_count: 48,
      author: 'David Zhang',
      time_ago: '14m ago'
    },
    member_avatars: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'comm-dubai-mena-leaders',
    name: 'Dubai & MENA Tech Executive Circle',
    headline: 'FinTech scale, cross-border infrastructure, and GCC innovation',
    description: 'C-suite executives, VPs of Engineering, and technical founders leading the digital economy across the UAE, Saudi Arabia, and greater MENA.',
    category: 'leadership',
    category_label: 'Executive Leadership',
    hub: 'dubai',
    hub_label: 'Dubai & MENA',
    member_count: 9850,
    online_count: 310,
    is_private: false,
    is_featured: true,
    cover_gradient: 'from-amber-900 via-stone-900 to-slate-900',
    tags: ['#FinTech', '#CloudSovereignty', '#MENATech', '#ExecutiveScale'],
    host_name: 'Tariq Al-Mansoor',
    host_title: 'VP of Engineering @ PayGulf',
    host_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    recent_discussion: {
      title: 'Real-time cross-border settlement rails across GCC banks: Lessons learned',
      replies_count: 34,
      author: 'Rashid Al-Husseini',
      time_ago: '1h ago'
    },
    member_avatars: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'comm-distributed-systems',
    name: 'High-Throughput Distributed Systems',
    headline: 'Zero-downtime sharding, multi-region Raft, and 10M+ QPS design',
    description: 'Senior and staff backend engineers dissecting high-concurrency databases, distributed streaming with Kafka, and Kubernetes orchestrations.',
    category: 'systems',
    category_label: 'Distributed Systems',
    hub: 'india',
    hub_label: 'Bengaluru & Global Remote',
    member_count: 16300,
    online_count: 540,
    is_private: false,
    is_featured: true,
    cover_gradient: 'from-blue-900 via-slate-900 to-indigo-950',
    tags: ['#Kubernetes', '#Go', '#DistributedDBs', '#KafkaScale'],
    host_name: 'Vikram Malhotra',
    host_title: 'Principal Systems Architect • Ex-AWS',
    host_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    recent_discussion: {
      title: 'Mitigating distributed lock contention at 10M peak transactions per second',
      replies_count: 52,
      author: 'Arjun Mehta',
      time_ago: '42m ago'
    },
    member_avatars: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'comm-london-europe-fintech',
    name: 'London & Europe FinTech Engineers',
    headline: 'High-frequency trading, Open Banking, and compliant cloud architectures',
    description: 'Engineers building next-generation digital banks, payment rails, and regulatory-compliant distributed financial ledgers across Europe and the UK.',
    category: 'systems',
    category_label: 'FinTech & Systems',
    hub: 'europe',
    hub_label: 'London & Europe',
    member_count: 11200,
    online_count: 390,
    is_private: false,
    is_featured: false,
    cover_gradient: 'from-emerald-950 via-teal-900 to-slate-900',
    tags: ['#OpenBanking', '#Rust', '#LowLatency', '#SecurityInfra'],
    host_name: 'Elena Rostova',
    host_title: 'Staff Platform Engineer @ DataCore',
    host_avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    recent_discussion: {
      title: 'Rust async execution benchmarks for sub-microsecond matching engines',
      replies_count: 29,
      author: 'Liam Davies',
      time_ago: '2h ago'
    },
    member_avatars: [
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'comm-sv-founders',
    name: 'Silicon Valley Founders & Founding Engineers',
    headline: 'Zero to one, rapid MVPs, AI-native products, and venture fundraising',
    description: 'Founders, early CTOs, and first engineering hires trading tactical playbooks on customer discovery, fundraising, and hyperscale architecture.',
    category: 'startups',
    category_label: 'Founders & Startups',
    hub: 'us',
    hub_label: 'Silicon Valley & US',
    member_count: 13750,
    online_count: 480,
    is_private: false,
    is_featured: true,
    cover_gradient: 'from-purple-950 via-violet-900 to-slate-900',
    tags: ['#FoundingEng', '#VentureScale', '#ProductMarketFit', '#AIStartups'],
    host_name: 'Marcus Vance',
    host_title: 'Founding Engineer @ SynapseAI',
    host_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    recent_discussion: {
      title: 'Technical debt vs velocity: What to cut when chasing your first $1M ARR',
      replies_count: 67,
      author: 'Chloe Simmons',
      time_ago: '35m ago'
    },
    member_avatars: [
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'comm-product-design-systems',
    name: 'Staff Design Systems & Product Strategy',
    headline: 'Multi-platform design tokens, headless UI, and design operations',
    description: 'Design architects, UI engineers, and product design leaders engineering scalable systems for multi-platform products with 50M+ users.',
    category: 'design',
    category_label: 'Product & Design',
    hub: 'europe',
    hub_label: 'London & Europe',
    member_count: 8920,
    online_count: 270,
    is_private: false,
    is_featured: false,
    cover_gradient: 'from-pink-950 via-rose-900 to-slate-900',
    tags: ['#DesignOps', '#FigmaSystems', '#DesignTokens', '#MicroFrontends'],
    host_name: 'Sofia Rodriguez',
    host_title: 'Design Director @ FintechStudio',
    host_avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    recent_discussion: {
      title: 'Automated token syncing between Figma variables and React/Tailwind in CI',
      replies_count: 24,
      author: 'Karim Mansour',
      time_ago: '3h ago'
    },
    member_avatars: [
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'comm-cloud-security-ebpf',
    name: 'Cloud Security, eBPF & DevSecOps Guild',
    headline: 'Zero-trust runtime defense, kernel telemetry, and AWS hardening',
    description: 'Security engineers and DevSecOps practitioners hardening cloud infrastructure, auditing Kubernetes workloads, and deploying eBPF observability.',
    category: 'security',
    category_label: 'Security & DevOps',
    hub: 'remote',
    hub_label: 'Global Remote / Toronto',
    member_count: 10640,
    online_count: 340,
    is_private: false,
    is_featured: false,
    cover_gradient: 'from-slate-900 via-zinc-950 to-black',
    tags: ['#ZeroTrust', '#eBPF', '#KubernetesSecurity', '#CloudAudit'],
    host_name: 'Amara Okafor',
    host_title: 'Principal Security Architect @ CyberShield',
    host_avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    recent_discussion: {
      title: 'Real-time container escape detection using eBPF kernel event probes',
      replies_count: 38,
      author: 'Marcus Vance',
      time_ago: '5h ago'
    },
    member_avatars: [
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80'
    ]
  },
  {
    id: 'comm-singapore-apac',
    name: 'Singapore & APAC Tech Ecosystem',
    headline: 'Cross-border SaaS, AI products, and Southeast Asia growth',
    description: 'Engineers, product leads, and investors building scalable platforms across Singapore, Japan, Korea, Australia, and Southeast Asia.',
    category: 'leadership',
    category_label: 'APAC Growth',
    hub: 'apac',
    hub_label: 'Singapore & APAC',
    member_count: 7450,
    online_count: 210,
    is_private: false,
    is_featured: false,
    cover_gradient: 'from-cyan-950 via-blue-900 to-slate-900',
    tags: ['#APAC', '#CrossBorderTech', '#SuperApps', '#AIProducts'],
    host_name: 'David Kim',
    host_title: 'Head of AI Products @ Hyperscale',
    host_avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    recent_discussion: {
      title: 'Managing multi-language LLM latency across APAC edge regions',
      replies_count: 22,
      author: 'Wei Ling Tan',
      time_ago: '6h ago'
    },
    member_avatars: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80'
    ]
  }
];

const GLOBAL_COMMUNITY_HUBS = [
  { id: 'all', label: 'All Worldwide', icon: '🌍' },
  { id: 'dubai', label: 'Dubai & MENA', icon: '🇦🇪' },
  { id: 'us', label: 'Silicon Valley & US', icon: '🇺🇸' },
  { id: 'europe', label: 'London & Europe', icon: '🇬🇧' },
  { id: 'india', label: 'Bengaluru & India', icon: '🇮🇳' },
  { id: 'apac', label: 'Singapore & APAC', icon: '🇸🇬' },
  { id: 'remote', label: 'Global Remote', icon: '🌐' }
];

const CATEGORY_FILTERS = [
  { id: 'all', label: 'All Circles' },
  { id: 'ai', label: '⚡ AI & ML' },
  { id: 'systems', label: '🏗️ Distributed Systems' },
  { id: 'leadership', label: '💼 Executive Leadership' },
  { id: 'startups', label: '🚀 Founders & Startups' },
  { id: 'design', label: '🎨 Product & Design' },
  { id: 'security', label: '🛡️ Security & DevOps' }
];

const Communities: React.FC = () => {
  const [communities, setCommunities] = useState<ProfessionalCommunity[]>(GLOBAL_COMMUNITIES);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('txc_joined_communities');
      if (saved) return new Set(JSON.parse(saved));
    } catch (e) {}
    // Default pre-joined communities for immediate rich experience
    return new Set(['comm-genai-agents', 'comm-distributed-systems']);
  });

  const [activeTab, setActiveTab] = useState<'discover' | 'my-circles' | 'featured'>('discover');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedHub, setSelectedHub] = useState('all');

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCircleForDetail, setSelectedCircleForDetail] = useState<ProfessionalCommunity | null>(null);

  // New circle form state
  const [newCircleName, setNewCircleName] = useState('');
  const [newCircleHeadline, setNewCircleHeadline] = useState('');
  const [newCircleCategory, setNewCircleCategory] = useState<ProfessionalCommunity['category']>('ai');
  const [newCircleHub, setNewCircleHub] = useState<ProfessionalCommunity['hub']>('remote');
  const [newCircleDesc, setNewCircleDesc] = useState('');
  const [newCircleTags, setNewCircleTags] = useState('');

  // Handle Join / Leave Community
  const toggleJoinCommunity = useCallback((communityId: string, communityName: string) => {
    setJoinedIds(prev => {
      const next = new Set(prev);
      if (next.has(communityId)) {
        next.delete(communityId);
        toast.info(`Left ${communityName}`);
      } else {
        next.add(communityId);
        toast.success(`Welcome to ${communityName}! You can now participate in discussions.`);
      }
      try {
        localStorage.setItem('txc_joined_communities', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });
  }, []);

  // Filtered communities
  const filteredCommunities = useMemo(() => {
    return communities.filter(c => {
      if (selectedCategory !== 'all' && c.category !== selectedCategory) return false;
      if (selectedHub !== 'all' && c.hub !== selectedHub) return false;
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesDesc = c.description.toLowerCase().includes(query);
        const matchesHeadline = c.headline.toLowerCase().includes(query);
        const matchesTags = c.tags.some(t => t.toLowerCase().includes(query));
        return matchesName || matchesDesc || matchesHeadline || matchesTags;
      }
      return true;
    });
  }, [communities, selectedCategory, selectedHub, searchTerm]);

  // My joined communities
  const myJoinedCommunities = useMemo(() => {
    return communities.filter(c => joinedIds.has(c.id));
  }, [communities, joinedIds]);

  // Handle create circle
  const handleCreateCircle = () => {
    if (!newCircleName.trim() || !newCircleDesc.trim()) {
      toast.error('Please enter a circle name and description');
      return;
    }

    const created: ProfessionalCommunity = {
      id: `comm-custom-${Date.now()}`,
      name: newCircleName.trim(),
      headline: newCircleHeadline.trim() || 'A high-impact technical circle on TalentXcel',
      description: newCircleDesc.trim(),
      category: newCircleCategory,
      category_label: CATEGORY_FILTERS.find(f => f.id === newCircleCategory)?.label || 'General',
      hub: newCircleHub,
      hub_label: GLOBAL_COMMUNITY_HUBS.find(h => h.id === newCircleHub)?.label || 'Worldwide',
      member_count: 1,
      online_count: 1,
      is_private: false,
      is_featured: false,
      cover_gradient: 'from-blue-900 via-indigo-950 to-slate-900',
      tags: newCircleTags ? newCircleTags.split(',').map(t => t.trim().startsWith('#') ? t.trim() : `#${t.trim()}`) : ['#TechCircle'],
      host_name: 'You (Creator)',
      host_title: 'Circle Lead & Moderator',
      host_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      recent_discussion: {
        title: `Welcome to the new ${newCircleName} Circle! Introduce yourself.`,
        replies_count: 1,
        author: 'You',
        time_ago: 'Just now'
      },
      member_avatars: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80']
    };

    setCommunities(prev => [created, ...prev]);
    setJoinedIds(prev => {
      const next = new Set(prev);
      next.add(created.id);
      try {
        localStorage.setItem('txc_joined_communities', JSON.stringify(Array.from(next)));
      } catch (e) {}
      return next;
    });

    setIsCreateOpen(false);
    setNewCircleName('');
    setNewCircleHeadline('');
    setNewCircleDesc('');
    setNewCircleTags('');
    toast.success(`Circle "${created.name}" created successfully!`);
  };

  const handleShareCircle = (comm: ProfessionalCommunity) => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        navigator.share({
          title: `${comm.name} on TalentXcel`,
          text: `Join ${comm.name} on TalentXcel's Global Professional Network: ${comm.headline}`,
          url
        });
        return;
      } catch (e) {}
    }
    navigator.clipboard.writeText(url);
    toast.success('Circle link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">

        {/* ── Top Executive Global Positioning Hero ─────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white py-4 sm:py-5 px-5 sm:px-7 shadow-lg border border-indigo-900/40">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-8 w-60 h-60 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-[11px] font-semibold tracking-wide uppercase backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                The Global Professional Talent Network
                <span className="text-white/30">•</span>
                <span>54,000+ Members Active in Circles</span>
              </div>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Professional <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Communities & Circles</span>
              </h1>

              <p className="text-slate-300 text-xs sm:text-sm leading-normal line-clamp-2">
                Connect with verified technical leaders, founders, and specialized engineering circles. Share production architectures, participate in weekly tech debates, and build relationships with peers worldwide.
              </p>
            </div>

            {/* Quick KPI stats row & Action Button */}
            <div className="flex items-center gap-3 shrink-0 pt-1 md:pt-0">
              <div className="hidden lg:flex items-center gap-3 text-xs text-slate-300 font-medium">
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px]">Verified Peer Groups</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
                  <Globe2 className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[11px]">Global Hubs</span>
                </div>
              </div>

              <Button
                onClick={() => setIsCreateOpen(true)}
                className="h-9 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Circle</span>
              </Button>
            </div>
          </div>
        </div>

        {/* ── Search, Hubs & Categories Bar ─────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search circles by topic, architecture, or tag (e.g. '#LLMs', 'Distributed Systems', 'Dubai FinTech')..."
                className="pl-10 pr-9 h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Global Hub Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
              Hubs:
            </span>
            {GLOBAL_COMMUNITY_HUBS.map((hub) => (
              <button
                key={hub.id}
                onClick={() => setSelectedHub(hub.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  selectedHub === hub.id
                    ? 'bg-blue-600 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{hub.icon}</span>
                <span>{hub.label}</span>
              </button>
            ))}
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800/60 pt-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
              Circles:
            </span>
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold'
                    : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main Layout: Tabs Grid & Right Sidebar ─────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left/Center Directory (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">

            <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-12 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <TabsTrigger value="discover" className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 transition-all">
                  <Compass className="w-4 h-4 mr-1.5 text-blue-500" />
                  Discover Circles
                </TabsTrigger>
                <TabsTrigger value="my-circles" className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 transition-all">
                  <Users className="w-4 h-4 mr-1.5 text-emerald-500" />
                  My Circles ({myJoinedCommunities.length})
                </TabsTrigger>
                <TabsTrigger value="featured" className="rounded-lg text-xs sm:text-sm font-semibold data-[state=active]:bg-slate-900 data-[state=active]:text-white dark:data-[state=active]:bg-slate-100 dark:data-[state=active]:text-slate-900 transition-all">
                  <Star className="w-4 h-4 mr-1.5 text-amber-500" />
                  Featured & Verified
                </TabsTrigger>
              </TabsList>

              {/* Discover Circles Grid */}
              <TabsContent value="discover" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCommunities.map((comm) => {
                    const isJoined = joinedIds.has(comm.id);

                    return (
                      <Card
                        key={comm.id}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-sm hover:shadow-xl hover:border-blue-400/60 dark:hover:border-blue-600/60 transition-all duration-300 overflow-hidden"
                      >
                        <div>
                          {/* Circle Banner Header */}
                          <div className={`h-24 bg-gradient-to-r ${comm.cover_gradient} relative p-4 flex flex-col justify-between`}>
                            <div className="flex items-center justify-between">
                              <Badge className="bg-white/10 backdrop-blur-md text-white border-white/20 text-[10px] font-bold">
                                {comm.category_label}
                              </Badge>

                              <div className="flex items-center gap-1.5 text-white/90 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px]">{comm.online_count} online</span>
                              </div>
                            </div>

                            <div className="flex items-center justify-between text-white/80 text-[11px]">
                              <span className="font-medium">📍 {comm.hub_label}</span>
                              {comm.is_featured && (
                                <span className="flex items-center gap-1 text-amber-300 text-[11px] font-bold">
                                  <Star className="w-3 h-3 fill-amber-300" /> Featured
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Body Content */}
                          <div className="p-5 space-y-3.5">
                            <div>
                              <h3 
                                onClick={() => setSelectedCircleForDetail(comm)}
                                className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors cursor-pointer"
                              >
                                {comm.name}
                              </h3>
                              <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                                {comm.headline}
                              </p>
                            </div>

                            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {comm.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1.5">
                              {comm.tags.map((tag, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>

                            {/* Recent Discussion Pill */}
                            <div 
                              onClick={() => setSelectedCircleForDetail(comm)}
                              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-blue-300 transition-colors cursor-pointer space-y-1"
                            >
                              <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-bold">
                                  <MessageSquare className="w-3 h-3" /> Recent Discussion
                                </span>
                                <span>{comm.recent_discussion.time_ago}</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                                "{comm.recent_discussion.title}"
                              </p>
                            </div>

                            {/* Members Avatars & Count */}
                            <div className="flex items-center justify-between pt-1">
                              <div className="flex items-center -space-x-2">
                                {comm.member_avatars.map((av, avIdx) => (
                                  <Avatar key={avIdx} className="w-6 h-6 border-2 border-white dark:border-slate-900">
                                    <AvatarImage src={av} />
                                    <AvatarFallback className="text-[9px]">U</AvatarFallback>
                                  </Avatar>
                                ))}
                                <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 text-[9px] font-bold flex items-center justify-center text-slate-600">
                                  +{(comm.member_count / 1000).toFixed(0)}k
                                </div>
                              </div>

                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                {comm.member_count.toLocaleString()} members
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bottom Actions */}
                        <div className="px-5 pb-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => toggleJoinCommunity(comm.id, comm.name)}
                            className={`flex-1 h-9 rounded-xl text-xs font-bold transition-all shadow-sm ${
                              isJoined
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {isJoined ? (
                              <>
                                <Check className="w-3.5 h-3.5 mr-1" />
                                Member
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5 mr-1" />
                                Join Circle
                              </>
                            )}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCircleForDetail(comm)}
                            className="h-9 px-3.5 rounded-xl border-slate-200 dark:border-slate-700 hover:border-blue-300 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600"
                          >
                            Discussions
                            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                          </Button>

                          <button
                            onClick={() => handleShareCircle(comm)}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:text-blue-600 text-slate-400 transition-colors"
                            title="Share Circle"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>

              {/* My Circles Tab */}
              <TabsContent value="my-circles" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myJoinedCommunities.map((comm) => (
                    <Card
                      key={comm.id}
                      className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge className="bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold mb-1.5">
                            {comm.category_label}
                          </Badge>
                          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">{comm.name}</h3>
                          <p className="text-xs text-slate-500 mt-0.5">{comm.headline}</p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                          Active Member
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Recent Thread</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                          "{comm.recent_discussion.title}"
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {comm.recent_discussion.replies_count} contributions • Host: {comm.host_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          size="sm"
                          onClick={() => setSelectedCircleForDetail(comm)}
                          className="flex-1 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                        >
                          Open Circle Feed
                          <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleJoinCommunity(comm.id, comm.name)}
                          className="h-9 px-3 text-xs text-slate-500 hover:text-rose-600"
                        >
                          Leave
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Featured Tab */}
              <TabsContent value="featured" className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {communities.filter(c => c.is_featured).map((comm) => (
                    <Card
                      key={comm.id}
                      onClick={() => setSelectedCircleForDetail(comm)}
                      className="group rounded-2xl border border-amber-200/80 dark:border-amber-900/40 bg-white dark:bg-slate-900 shadow-md hover:shadow-xl p-5 space-y-4 cursor-pointer transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-xs font-bold">
                          <Crown className="w-3.5 h-3.5" /> Featured Leadership Circle
                        </span>
                        <span className="text-xs font-bold text-slate-500">{comm.hub_label}</span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                          {comm.name}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {comm.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span>👥 {comm.member_count.toLocaleString()} Global Leaders</span>
                        <span className="text-blue-600 font-bold flex items-center gap-1">
                          Explore Circle <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar (1 Col) ─────────────────────────────────── */}
          <div className="space-y-6">

            {/* Trending Discussions Widget */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Trending Discussions
                  </h3>
                </div>
                <Badge variant="secondary" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200">
                  Live
                </Badge>
              </div>

              <div className="p-4 space-y-3.5">
                {GLOBAL_COMMUNITIES.slice(0, 4).map((comm, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedCircleForDetail(comm)}
                    className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-xl transition-colors space-y-1"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      "{comm.recent_discussion.title}"
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>in {comm.name.split(' ')[0]}...</span>
                      <span className="text-blue-600 font-semibold">{comm.recent_discussion.replies_count} replies</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Circle Hosts */}
            <Card className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-4 space-y-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-500" />
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Circle Hosts & Leaders
                </h4>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Sarah Chen', title: 'Staff AI Researcher', hub: 'San Francisco', img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80' },
                  { name: 'Tariq Al-Mansoor', title: 'VP of Engineering', hub: 'Dubai, UAE', img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80' },
                  { name: 'Vikram Malhotra', title: 'Principal Architect', hub: 'Bengaluru', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80' },
                  { name: 'Elena Rostova', title: 'Staff Platform Eng', hub: 'Berlin', img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80' }
                ].map((host, idx) => (
                  <div key={idx} className="flex items-center gap-2.5">
                    <Avatar className="w-9 h-9 rounded-xl">
                      <AvatarImage src={host.img} alt={host.name} className="object-cover" />
                      <AvatarFallback>{host.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">{host.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{host.title} • {host.hub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Launch Your Own Circle Promo */}
            <Card className="rounded-2xl border-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-5 shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider">
                  <Rocket className="w-3 h-3 text-purple-400" />
                  Community Builder
                </div>

                <h3 className="font-extrabold text-base leading-tight text-white">
                  Lead a Technical Circle
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Host discussions, mentor engineers, and establish your industry authority across 40+ countries.
                </p>

                <Button
                  onClick={() => setIsCreateOpen(true)}
                  className="w-full h-9 bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs rounded-xl shadow-md transition-all"
                >
                  Start a Circle →
                </Button>
              </div>
            </Card>

          </div>
        </div>

      </div>

      {/* ── Create Circle Dialog ──────────────────────────────────────── */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Create a Professional Circle
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Launch a technical community or hub chapter on the Global Talent Network.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Circle Name *
              </label>
              <Input
                value={newCircleName}
                onChange={(e) => setNewCircleName(e.target.value)}
                placeholder="e.g. NextGen LLM Infra Guild"
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Headline / Focus
              </label>
              <Input
                value={newCircleHeadline}
                onChange={(e) => setNewCircleHeadline(e.target.value)}
                placeholder="e.g. Production inference, vLLM optimizations, and agentic workflows"
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Category
                </label>
                <select
                  value={newCircleCategory}
                  onChange={(e) => setNewCircleCategory(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="ai">AI & Machine Learning</option>
                  <option value="systems">Distributed Systems</option>
                  <option value="leadership">Executive Leadership</option>
                  <option value="startups">Founders & Startups</option>
                  <option value="design">Product & Design</option>
                  <option value="security">Security & DevOps</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Primary Hub
                </label>
                <select
                  value={newCircleHub}
                  onChange={(e) => setNewCircleHub(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium text-slate-800 dark:text-slate-200"
                >
                  <option value="remote">Global Remote</option>
                  <option value="dubai">Dubai & MENA</option>
                  <option value="us">Silicon Valley / US</option>
                  <option value="europe">London & Europe</option>
                  <option value="india">Bengaluru & India</option>
                  <option value="apac">Singapore & APAC</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Description *
              </label>
              <textarea
                value={newCircleDesc}
                onChange={(e) => setNewCircleDesc(e.target.value)}
                rows={3}
                placeholder="Describe what members will learn, discuss, and build together..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Key Tags (comma separated)
              </label>
              <Input
                value={newCircleTags}
                onChange={(e) => setNewCircleTags(e.target.value)}
                placeholder="e.g. #LLMs, #PyTorch, #DistributedDBs"
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateOpen(false)}
              className="h-9 px-4 rounded-xl text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateCircle}
              className="h-9 px-5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl"
            >
              Create & Publish Circle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Circle Discussion & Detail Modal ─────────────────────────── */}
      {selectedCircleForDetail && (
        <Dialog open={!!selectedCircleForDetail} onOpenChange={() => setSelectedCircleForDetail(null)}>
          <DialogContent className="max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-blue-50 text-blue-700 text-[10px] font-bold">
                  {selectedCircleForDetail.category_label}
                </Badge>
                <span className="text-xs text-slate-400">• {selectedCircleForDetail.hub_label}</span>
              </div>
              <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                {selectedCircleForDetail.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                {selectedCircleForDetail.headline}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {selectedCircleForDetail.description}
              </p>

              {/* Host & Community Stats */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 rounded-xl">
                    <AvatarImage src={selectedCircleForDetail.host_avatar} className="object-cover" />
                    <AvatarFallback>{selectedCircleForDetail.host_name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Host: {selectedCircleForDetail.host_name}
                    </p>
                    <p className="text-[11px] text-slate-500">{selectedCircleForDetail.host_title}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-blue-600">
                    {selectedCircleForDetail.member_count.toLocaleString()} members
                  </p>
                  <p className="text-[11px] text-emerald-500 font-semibold">
                    🟢 {selectedCircleForDetail.online_count} online now
                  </p>
                </div>
              </div>

              {/* Live Discussions in Circle */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  Active Discussion Threads
                </h4>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span>"{selectedCircleForDetail.recent_discussion.title}"</span>
                    <Badge variant="outline" className="text-[10px]">Active</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Started by {selectedCircleForDetail.recent_discussion.author} • {selectedCircleForDetail.recent_discussion.time_ago} • {selectedCircleForDetail.recent_discussion.replies_count} responses
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
                    <span>"Benchmarking real-world memory pressure in high-concurrency workloads"</span>
                    <Badge variant="outline" className="text-[10px]">Hot</Badge>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Started by Elena Rostova • 3h ago • 31 responses
                  </p>
                </div>
              </div>

              {/* Quick Reply Bar */}
              <div className="flex items-center gap-2 pt-2">
                <Input
                  placeholder="Share a perspective or ask the circle..."
                  className="h-10 text-xs rounded-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      toast.success('Your contribution was posted to the circle discussion!');
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
                <Button
                  size="sm"
                  onClick={() => toast.success('Your contribution was posted to the circle discussion!')}
                  className="h-10 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setSelectedCircleForDetail(null)}
                className="h-9 px-4 rounded-xl text-xs"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  toggleJoinCommunity(selectedCircleForDetail.id, selectedCircleForDetail.name);
                }}
                className={`h-9 px-5 rounded-xl text-xs font-bold ${
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

    </div>
  );
};

export default Communities;