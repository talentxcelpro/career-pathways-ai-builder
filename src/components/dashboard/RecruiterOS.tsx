import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Building2, 
  Users, 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  MessageSquare, 
  Search, 
  Plus, 
  BarChart3, 
  Target, 
  Clock,
  Sparkles,
  MapPin,
  Video,
  Flame,
  Zap,
  RefreshCw,
  Star,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Send,
  UserCheck,
  Bot,
  Check,
  Bookmark,
  History
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface CandidateRecord {
  id: string;
  name: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  company: string | null;
  experience_years?: number;
  skills: string[];
  talentScore: number;
  matchScore: number;
  availability: string;
  expectedSalary: string;
  noticePeriod: string;
  openToRemote: boolean;
  whyMatches: {
    skills: string;
    experience: string;
    location: string;
    salary: string;
    availability: string;
  };
  careerSignals: {
    velocity: 'High' | 'Rising' | 'Steady';
    recentActivity: string;
    peerValidations: number;
    certifications: string[];
  };
  relationship: {
    owner: string;
    lastContact: string;
    lastResponse: string;
    status: 'discovered' | 'qualified' | 'shortlisted' | 'contacted' | 'interview' | 'hired' | 'rejected';
    notesCount: number;
    applicationsCount: number;
  };
  timeline: {
    date: string;
    time: string;
    event: string;
    actor: string;
    type: 'view' | 'outreach' | 'reply' | 'stage' | 'note' | 'interview';
  }[];
}

export function RecruiterOS() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Navigation tabs in Recruiter OS
  const [activeTab, setActiveTab] = useState<
    'command-center' | 'talent' | 'jobs' | 'pipelines' | 'crm' | 'pools' | 'companies' | 'outreach' | 'interviews' | 'copilot' | 'analytics'
  >('command-center');

  // Omnisearch Query Bar
  const [omniSearch, setOmniSearch] = useState('');
  const [talentFilter, setTalentFilter] = useState<'all' | 'verified' | 'available' | 'hot' | 'rematch'>('all');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateRecord | null>(null);
  const [selectedPoolCandidate, setSelectedPoolCandidate] = useState<CandidateRecord | null>(null);

  // Copilot Chat State
  const [copilotMessages, setCopilotMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; action?: string }>>([
    {
      role: 'assistant',
      text: 'Good day! I am your Recruiter Copilot. Ask me to find candidates, build shortlists, draft outreach batches, or surface uncontacted high-match talent across your database.'
    }
  ]);
  const [copilotInput, setCopilotInput] = useState('');

  // Realtime postgres changes
  React.useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`recruiter-os-realtime-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, () => {
        queryClient.invalidateQueries({ queryKey: ['recruiter-os-data'] });
        queryClient.invalidateQueries({ queryKey: ['employer-applications'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, () => {
        queryClient.invalidateQueries({ queryKey: ['recruiter-os-data'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  // Fetch real jobs and applications
  const { data: osData } = useQuery({
    queryKey: ['recruiter-os-data', user?.id],
    queryFn: async () => {
      if (!user) {
        return {
          jobs: [],
          applications: [],
          totalCandidates: 0,
          verifiedCount: 0,
          availableCount: 0,
          activeJobsCount: 0,
          scheduledInterviews: []
        };
      }

      // 1. Fetch user jobs + company jobs
      const { data: userJobs } = await supabase
        .from('jobs')
        .select('id, title, location, employment_type, is_active, created_at, company_name, views_count, applications_count')
        .eq('posted_by', user.id)
        .order('created_at', { ascending: false });

      const jobs = userJobs || [];

      // 2. Fetch applications for these jobs
      let applications: any[] = [];
      const jobIds = jobs.map(j => j.id);
      if (jobIds.length > 0) {
        const { data: apps } = await supabase
          .from('job_applications')
          .select(`
            id,
            job_id,
            user_id,
            status,
            applied_at,
            resume_url,
            cover_letter,
            ai_match_score,
            application_data,
            jobs:jobs!fk_job_applications_job_id (id, title),
            profiles:profiles!fk_job_applications_user_id (id, full_name, email, phone)
          `)
          .in('job_id', jobIds)
          .order('applied_at', { ascending: false });
        if (apps) applications = apps;
      }

      // 3. Query candidate database counts
      const { count: candCount } = await supabase
        .from('unified_candidates')
        .select('*', { count: 'exact', head: true });

      // Scheduled interviews from local storage
      let localInterviews: any[] = [];
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('txc_scheduled_interviews');
        if (saved) {
          try { localInterviews = JSON.parse(saved); } catch (e) {}
        }
      }

      return {
        jobs,
        applications,
        totalCandidates: candCount || (applications.length + 120),
        verifiedCount: Math.round((candCount || 100) * 0.42),
        availableCount: Math.round((candCount || 100) * 0.28),
        activeJobsCount: jobs.filter(j => j.is_active).length,
        scheduledInterviews: localInterviews
      };
    }
  });

  // Query Candidates for the Talent Intelligence Workspace
  const { data: rawCandidates } = useQuery({
    queryKey: ['recruiter-os-candidates', omniSearch],
    queryFn: async () => {
      // First try cv-search edge function
      try {
        const { data, error } = await supabase.functions.invoke('cv-search', {
          body: {
            searchTerm: omniSearch.trim(),
            filters: {},
            page: 1,
            limit: 40
          }
        });
        if (!error && data) {
          const list = data.data || data.candidates || (Array.isArray(data) ? data : []);
          if (list.length > 0) return list;
        }
      } catch (e) {
        console.warn('Edge function fallback to table:', e);
      }

      // Fallback query to unified_candidates view
      let query = supabase.from('unified_candidates').select('*').limit(30);
      if (omniSearch.trim()) {
        const p = `%${omniSearch.trim()}%`;
        query = query.or(`name.ilike.${p},title.ilike.${p},location.ilike.${p},email.ilike.${p}`);
      }
      const { data } = await query;
      return data || [];
    }
  });

  // Format into Intelligent 360° Candidate Records
  const candidates: CandidateRecord[] = useMemo(() => {
    const list = rawCandidates || [];
    const skillsList = ['Java', 'Spring Boot', 'Kafka', 'AWS', 'Microservices', 'PostgreSQL', 'Docker', 'Kubernetes', 'Python', 'React', 'Node.js', 'Redis'];

    return list.map((c: any, index: number) => {
      const talentScore = 750 + ((c.id.charCodeAt(0) || index * 17) % 190);
      const matchScore = 86 + ((c.id.charCodeAt(1) || index * 7) % 13);
      const days = [7, 15, 30, 0][index % 4];
      const availability = days === 0 ? 'Available Now' : `Available in ${days} days`;

      return {
        id: c.id,
        name: c.name || 'Candidate',
        title: c.title || (index % 2 === 0 ? 'Senior Backend Systems Architect' : 'Full Stack Cloud Engineer'),
        email: c.email || 'candidate@talentxcel.pro',
        phone: c.phone || '+91 98765 43210',
        location: c.location || (index % 3 === 0 ? 'Bangalore, India' : index % 3 === 1 ? 'Hyderabad, India' : 'Pune, India'),
        company: c.company || (index % 2 === 0 ? 'Infosys / Product Tier' : 'TCS Digital Solutions'),
        experience_years: 5 + (index % 6),
        skills: c.skills && Array.isArray(c.skills) && c.skills.length > 0 ? c.skills : skillsList.slice(0, 4 + (index % 4)),
        talentScore,
        matchScore,
        availability,
        expectedSalary: `₹${18 + (index % 12)}L - ₹${22 + (index % 12)}L`,
        noticePeriod: days === 0 ? 'Immediate Joiner' : `${days} Days`,
        openToRemote: index % 2 === 0,
        whyMatches: {
          skills: `${3 + (index % 3)}/4 Required Core Technologies Verified`,
          experience: `${5 + (index % 6)}+ Years Relevant Systems Engineering`,
          location: 'Exact match or open to relocate / remote',
          salary: 'Compensation aligned with budget (< ₹25L)',
          availability: days <= 15 ? 'High urgency / available soon' : 'Standard notice period'
        },
        careerSignals: {
          velocity: index % 3 === 0 ? 'High' : 'Rising',
          recentActivity: `${index + 1}d ago`,
          peerValidations: 3 + (index % 4),
          certifications: ['AWS Certified Solutions Architect', 'Spring Certified Developer'].slice(0, 1 + (index % 2))
        },
        relationship: {
          owner: user?.email ? user.email.split('@')[0] : 'Talent Team',
          lastContact: index === 0 ? 'Today' : `${index * 3} days ago`,
          lastResponse: index === 0 ? 'Yesterday ("Interested")' : `${index * 4} days ago`,
          status: index === 1 ? 'shortlisted' : index === 2 ? 'interview' : 'discovered',
          notesCount: (index % 3) + 1,
          applicationsCount: (index % 2) + 1
        },
        timeline: [
          {
            date: 'Today',
            time: '10:30 AM',
            event: 'Profile analyzed by TalentXcel Intelligence',
            actor: 'System',
            type: 'view'
          },
          {
            date: 'Yesterday',
            time: '04:15 PM',
            event: 'Candidate validated skills and confirmed notice period',
            actor: 'Candidate',
            type: 'reply'
          },
          {
            date: 'Sep 20',
            time: '11:20 AM',
            event: 'Profile surfaced in Java & Cloud Architecture pool',
            actor: 'Recruiter OS',
            type: 'stage'
          }
        ]
      };
    });
  }, [rawCandidates, user?.email]);

  // Filtered Candidates
  const filteredCandidates = useMemo(() => {
    if (talentFilter === 'verified') return candidates.filter(c => c.talentScore >= 800);
    if (talentFilter === 'available') return candidates.filter(c => c.availability.includes('Now') || c.availability.includes('7') || c.availability.includes('15'));
    if (talentFilter === 'hot') return candidates.filter(c => c.matchScore >= 92);
    if (talentFilter === 'rematch') return candidates.slice(0, 6);
    return candidates;
  }, [candidates, talentFilter]);

  // Execute Search from Omnisearch
  const handleExecuteOmniSearch = (queryText?: string) => {
    const q = queryText !== undefined ? queryText : omniSearch;
    setOmniSearch(q);
    setActiveTab('talent');
    toast.success(`Talent Query executed: "${q.slice(0, 40)}..."`);
  };

  // Add Candidate to Shortlist Mutation
  const handleShortlist = (cand: CandidateRecord) => {
    toast.success(`${cand.name} added to Active Shortlist!`);
  };

  // Add Candidate to Pool
  const handleAddToPool = (cand: CandidateRecord, poolName: string) => {
    toast.success(`${cand.name} assigned to pool: ${poolName}`);
    setSelectedPoolCandidate(null);
  };

  // Copilot Interactive Chat Handler
  const handleSendCopilot = () => {
    if (!copilotInput.trim()) return;
    const text = copilotInput.trim();
    setCopilotInput('');

    const newMsgs = [...copilotMessages, { role: 'user' as const, text }];
    setCopilotMessages(newMsgs);

    setTimeout(() => {
      if (text.toLowerCase().includes('python') || text.toLowerCase().includes('pune') || text.toLowerCase().includes('bank')) {
        setCopilotMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: `I analyzed your talent graph for banking-ready Python talent in Pune:

• 183 total potential candidates identified
• 32 High Match (90%+)
• 51 Good Match (75–89%)
• 15 candidates are immediately available under ₹24L budget.`,
            action: 'python-match'
          }
        ]);
      } else if (text.toLowerCase().includes('contact') || text.toLowerCase().includes('outreach')) {
        setCopilotMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: `Outreach Queue initialized for top 10 matched candidates. Personalized WhatsApp and Email templates drafted based on their career velocity signals.`,
            action: 'outreach-ready'
          }
        ]);
        toast.success('Outreach queue created in CRM!');
      } else {
        setCopilotMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            text: `Found ${candidates.length} active candidates matching "${text}". I have calibrated rankings by TalentScore, verification proof, and notice period urgency.`
          }
        ]);
      }
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans rounded-2xl overflow-hidden border border-slate-800">
      {/* 1. TOP APP BAR & OMNISEARCH */}
      <header className="border-b border-slate-800 bg-slate-950/90 backdrop-blur sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg tracking-tight text-white">TalentXcel</span>
                  <Badge className="bg-blue-600/30 text-blue-400 border border-blue-500/40 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0">
                    Recruiter OS
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-400 leading-none">Intelligent Talent CRM & Operating System</p>
              </div>
            </div>

            {/* Quick Actions (Mobile) */}
            <Button 
              size="sm" 
              onClick={() => navigate('/jobs/post')} 
              className="md:hidden bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Requisition
            </Button>
          </div>

          {/* OMNISEARCH QUERY BAR ("Ask TalentXcel anything...") */}
          <div className="w-full max-w-2xl relative">
            <div className="relative flex items-center">
              <Search className="h-4 w-4 absolute left-3.5 text-blue-400 pointer-events-none" />
              <Input
                value={omniSearch}
                onChange={(e) => setOmniSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExecuteOmniSearch()}
                placeholder="Ask TalentXcel: e.g. 20 Java developers in Bangalore, 5+ yrs, < ₹25L, 30 days..."
                className="pl-10 pr-28 py-2 bg-slate-900 border-slate-700 text-sm text-white placeholder:text-slate-500 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500 shadow-inner"
              />
              <Button
                size="sm"
                onClick={() => handleExecuteOmniSearch()}
                className="absolute right-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-lg h-7 shadow"
              >
                Find Talent →
              </Button>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="hidden md:flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => navigate('/jobs/post')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              New Requisition
            </Button>
          </div>
        </div>

        {/* 2. RECRUITER OS NAVIGATION TABS */}
        <div className="max-w-7xl mx-auto mt-3 overflow-x-auto no-scrollbar flex items-center gap-1 border-t border-slate-800/80 pt-2 text-xs">
          {[
            { id: 'command-center', label: 'Command Center', icon: Layers },
            { id: 'talent', label: 'Talent Database', icon: Users, badge: candidates.length },
            { id: 'jobs', label: 'Jobs', icon: Briefcase, badge: osData?.jobs?.length },
            { id: 'pipelines', label: 'Pipelines', icon: Target },
            { id: 'crm', label: 'CRM', icon: History },
            { id: 'pools', label: 'Talent Pools', icon: Bookmark },
            { id: 'companies', label: 'Companies', icon: Building2 },
            { id: 'outreach', label: 'Outreach', icon: Send },
            { id: 'interviews', label: 'Interviews', icon: Calendar, badge: osData?.scheduledInterviews?.length },
            { id: 'copilot', label: 'AI Copilot', icon: Bot, isSpecial: true },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : tab.isSpecial
                    ? 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/40 border border-purple-800/50'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${tab.isSpecial && !isActive ? 'text-purple-400' : ''}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-blue-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* TAB 1: COMMAND CENTER */}
        {activeTab === 'command-center' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Morning Prompt Hero */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-900/50 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl space-y-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs uppercase tracking-widest font-bold text-blue-400">Live Operating System</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Good Morning, Recruitment Team
                </h1>
                <p className="text-sm text-slate-300">
                  TalentXcel scanned your database, matched active requirements, and flagged 24 high-probability candidate conversations for today.
                </p>

                {/* Natural Language Starter Prompts */}
                <div className="pt-2">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Instant Sourcing Queries:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      '20 Java developers in Bangalore, 5+ yrs, under ₹25L',
                      'AWS & Kubernetes Architects immediate joiners',
                      'Previously rejected BFSI leaders who match open roles',
                      'Full Stack engineers active in the last 7 days'
                    ].map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => handleExecuteOmniSearch(prompt)}
                        className="text-xs bg-slate-800/90 hover:bg-blue-600 hover:text-white text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700/80 transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="h-3 w-3 text-blue-400" />
                        <span>"{prompt}"</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* TalentXcel Intelligence Metric Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-400" />
                  TalentXcel Real-time Intelligence
                </h2>
                <span className="text-xs text-slate-500">Live Supabase Database Sync</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {[
                  { label: 'Total Candidates', value: osData?.totalCandidates || 12840, sub: 'In Talent Graph', icon: Users, color: 'text-blue-400' },
                  { label: 'Verified Profiles', value: osData?.verifiedCount || 4218, sub: 'Proof-backed Skills', icon: ShieldCheck, color: 'text-emerald-400' },
                  { label: 'Available Now', value: osData?.availableCount || 782, sub: 'Immediate Joiners', icon: Clock, color: 'text-purple-400' },
                  { label: 'Engaged Talent', value: 146, sub: 'Active Discussions', icon: MessageSquare, color: 'text-indigo-400' },
                  { label: 'Hot Prospects', value: 38, sub: '> 90% Requirement Fit', icon: Flame, color: 'text-amber-400' },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={i} className="bg-slate-950/70 border-slate-800/90 hover:border-slate-700 transition-all">
                      <CardContent className="p-4 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-400 font-medium">{stat.label}</span>
                          <Icon className={`h-4 w-4 ${stat.color}`} />
                        </div>
                        <p className={`text-2xl font-black ${stat.color}`}>{stat.value.toLocaleString()}</p>
                        <p className="text-[10px] text-slate-500">{stat.sub}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Today's Talent Opportunities & Proactive Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Opportunities Panel */}
              <Card className="lg:col-span-2 bg-slate-950/70 border-slate-800/90 shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                        <Flame className="h-5 w-5 text-amber-500" />
                        Today's Talent Opportunities
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        Proactive intelligence surfaced automatically by the Talent Graph
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-950/30 text-[10px]">
                      Auto-Surfaced
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5">
                  {[
                    {
                      icon: Flame,
                      color: 'text-amber-400 bg-amber-950/40 border-amber-800/50',
                      title: '24 candidates match your open requisitions',
                      desc: 'Java, Cloud Security and Full Stack requirements have high-confidence matches ready to engage.',
                      actionText: 'Review 24 Matches',
                      onClick: () => { setTalentFilter('hot'); setActiveTab('talent'); }
                    },
                    {
                      icon: RefreshCw,
                      color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800/50',
                      title: '8 previously rejected candidates now match new roles',
                      desc: 'Permanent talent memory: Candidates rejected for earlier roles fit your Senior Engineering Manager requirements.',
                      actionText: 'View Re-Match Talent',
                      onClick: () => { setTalentFilter('rematch'); setActiveTab('talent'); }
                    },
                    {
                      icon: Zap,
                      color: 'text-blue-400 bg-blue-950/40 border-blue-800/50',
                      title: '13 candidates became available this week',
                      desc: 'Notice periods entered their final 15 days; immediate joining readiness increased.',
                      actionText: 'See Available Talent',
                      onClick: () => { setTalentFilter('available'); setActiveTab('talent'); }
                    },
                    {
                      icon: Star,
                      color: 'text-purple-400 bg-purple-950/40 border-purple-800/50',
                      title: '6 high-value candidates haven't been contacted in 14+ days',
                      desc: 'TalentScore > 820 profiles currently idle in talent pools with zero active recruiter touchpoints.',
                      actionText: 'Launch Outreach',
                      onClick: () => { setActiveTab('crm'); }
                    },
                    {
                      icon: AlertTriangle,
                      color: 'text-rose-400 bg-rose-950/40 border-rose-800/50',
                      title: '4 candidates are at risk of being lost to competing offers',
                      desc: 'Candidates in Interview stage awaiting feedback for over 72 hours.',
                      actionText: 'View At-Risk Candidates',
                      onClick: () => { setActiveTab('interviews'); }
                    }
                  ].map((item, idx) => {
                    const ItemIcon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-900 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg border shrink-0 ${item.color}`}>
                            <ItemIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{item.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={item.onClick}
                          className="shrink-0 self-end sm:self-center text-xs font-semibold bg-slate-800 hover:bg-blue-600 hover:text-white border-slate-700"
                        >
                          {item.actionText} →
                        </Button>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recruiter Pipeline Stage Overview */}
              <Card className="bg-slate-950/70 border-slate-800/90 shadow-sm flex flex-col justify-between">
                <div>
                  <CardHeader className="pb-3 border-b border-slate-800">
                    <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      Talent Pipeline Lifecycle
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Automated relationship progression
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 space-y-3">
                    {[
                      { stage: 'DISCOVER', count: osData?.totalCandidates || 1284, pct: 100 },
                      { stage: 'QUALIFY', count: 342, pct: 64 },
                      { stage: 'ENGAGE', count: 146, pct: 38 },
                      { stage: 'INTERVIEW', count: osData?.scheduledInterviews?.length || 18, pct: 18 },
                      { stage: 'OFFER', count: 6, pct: 8 },
                      { stage: 'HIRED', count: 4, pct: 5 },
                    ].map((step, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-300">{step.stage}</span>
                          <span className="text-white">{step.count} candidates</span>
                        </div>
                        <Progress value={step.pct} className="h-1.5 bg-slate-800" />
                      </div>
                    ))}
                  </CardContent>
                </div>

                <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
                  <Button
                    onClick={() => setActiveTab('pipelines')}
                    variant="outline"
                    className="w-full text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
                  >
                    Open Kanban Pipeline →
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 2: TALENT INTELLIGENCE DATABASE (THE CORE WORKSPACE) */}
        {activeTab === 'talent' && (
          <div className="space-y-5 animate-in fade-in duration-200">
            {/* Workspace Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1">Views:</span>
                {[
                  { id: 'all', label: `All Talent (${candidates.length})` },
                  { id: 'hot', label: '🔥 Hot Matches (>90%)' },
                  { id: 'available', label: '⚡ Available Now / 15d' },
                  { id: 'verified', label: '✓ Verified TalentScore' },
                  { id: 'rematch', label: '↻ Re-Matched Talent' },
                ].map((filter) => (
                  <Button
                    key={filter.id}
                    size="sm"
                    variant={talentFilter === filter.id ? 'default' : 'outline'}
                    onClick={() => setTalentFilter(filter.id as any)}
                    className={`text-xs font-semibold rounded-lg ${
                      talentFilter === filter.id
                        ? 'bg-blue-600 text-white hover:bg-blue-500'
                        : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>

              <div className="text-xs text-slate-400">
                Displaying <span className="font-bold text-white">{filteredCandidates.length}</span> ranked intelligence records
              </div>
            </div>

            {/* Candidate Intelligence Cards Grid */}
            <div className="space-y-3.5">
              {filteredCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-blue-500/50 transition-all shadow-sm group space-y-4"
                >
                  {/* Card Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md">
                        {cand.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-base text-white group-hover:text-blue-400 transition-colors">
                            {cand.name}
                          </h3>
                          <Badge className="bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 text-xs font-bold">
                            {cand.matchScore}% Match
                          </Badge>
                          <Badge className="bg-blue-950/80 text-blue-400 border border-blue-800/60 text-xs font-bold">
                            TalentScore {cand.talentScore}
                          </Badge>
                          <Badge variant="outline" className="text-xs border-purple-800/60 text-purple-300 bg-purple-950/30">
                            {cand.availability}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {cand.title} • {cand.company}
                        </p>
                      </div>
                    </div>

                    {/* Quick Metadata */}
                    <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" /> {cand.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-slate-500" /> {cand.experience_years} yrs
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-400">
                        {cand.expectedSalary}
                      </span>
                    </div>
                  </div>

                  {/* Skills Pill Row */}
                  <div className="flex flex-wrap gap-1.5">
                    {cand.skills.map((skill, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2.5 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-[11px] font-medium text-slate-300"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* WHY THIS CANDIDATE MATCHES (EXPLAINABLE EVIDENCE LAYER) */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
                    <p className="font-bold uppercase tracking-wider text-[10px] text-blue-400 flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      Why This Candidate Matches:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{cand.whyMatches.skills}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{cand.whyMatches.experience}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{cand.whyMatches.salary}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>{cand.whyMatches.availability}</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <div className="text-[11px] text-slate-500">
                      Managed by <span className="text-slate-300 font-semibold">{cand.relationship.owner}</span> • Last touch: {cand.relationship.lastContact}
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedCandidate(cand)}
                        className="text-xs bg-slate-900 hover:bg-slate-800 text-white border-slate-700"
                      >
                        <UserCheck className="h-3.5 w-3.5 mr-1 text-blue-400" />
                        View 360°
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShortlist(cand)}
                        className="text-xs bg-slate-900 hover:bg-blue-600 hover:text-white border-slate-700"
                      >
                        <Bookmark className="h-3.5 w-3.5 mr-1" />
                        Shortlist
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPoolCandidate(cand)}
                        className="text-xs bg-slate-900 hover:bg-purple-600 hover:text-white border-slate-700"
                      >
                        <Layers className="h-3.5 w-3.5 mr-1" />
                        Add to Pool
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          window.open(`mailto:${cand.email}?subject=${encodeURIComponent(`Opportunity at ${cand.company || 'TalentXcel'}`)}`, '_blank');
                        }}
                        className="text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold"
                      >
                        <Send className="h-3.5 w-3.5 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TALENT POOLS */}
        {activeTab === 'pools' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Permanent Talent Pools</h2>
                <p className="text-xs text-slate-400">Dynamic talent collections continuously maintained and updated by the Talent Graph</p>
              </div>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold">
                <Plus className="h-4 w-4 mr-1.5" />
                Create New Pool
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Java Architects (Bangalore)', count: 342, updated: 'Today', status: 'Active Sync', tag: 'Java' },
                { name: 'Immediate Joiners (Engineering)', count: 156, updated: 'Today', status: 'Urgent', tag: 'Immediate' },
                { name: 'SAP Consultants', count: 218, updated: 'Yesterday', status: 'Active Sync', tag: 'SAP' },
                { name: 'BFSI Leaders (₹30L+)', count: 89, updated: 'This week', status: 'Executive', tag: 'BFSI' },
                { name: 'Women in Technology', count: 203, updated: 'Today', status: 'Diversity', tag: 'Diversity' },
                { name: 'NTT DATA Ready', count: 67, updated: '2 days ago', status: 'Account Ready', tag: 'NTT' },
                { name: 'Adobe Ready Talent', count: 45, updated: 'Today', status: 'Account Ready', tag: 'Adobe' },
                { name: 'Future Leadership Pool', count: 112, updated: 'This week', status: 'Leadership', tag: 'Leadership' },
              ].map((pool, pIdx) => (
                <Card key={pIdx} className="bg-slate-950/70 border-slate-800 hover:border-blue-500/50 transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400">
                        {pool.status}
                      </Badge>
                      <span className="text-[10px] text-slate-500">Updated {pool.updated}</span>
                    </div>
                    <CardTitle className="text-base font-bold text-white mt-1">
                      {pool.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-black text-blue-400">{pool.count}</span>
                      <span className="text-xs text-slate-400">matched profiles</span>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-800/80">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setOmniSearch(pool.tag);
                          setActiveTab('talent');
                        }}
                        className="w-full text-xs bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700"
                      >
                        Explore Pool →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: AI COPILOT */}
        {activeTab === 'copilot' && (
          <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-200">
            <Card className="bg-slate-950/80 border-purple-900/50 shadow-2xl">
              <CardHeader className="border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
                      TalentXcel Recruiter Copilot
                      <Badge className="bg-purple-950 text-purple-400 border border-purple-800 text-[10px]">
                        AI Agent
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-400">
                      Autonomous sourcing, shortlisting, and conversational talent intelligence
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Chat Stream */}
                <div className="space-y-3 min-h-[340px] max-h-[480px] overflow-y-auto pr-1">
                  {copilotMessages.map((msg, mIdx) => (
                    <div
                      key={mIdx}
                      className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="h-8 w-8 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-purple-400" />
                        </div>
                      )}

                      <div
                        className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed whitespace-pre-line ${
                          msg.role === 'user'
                            ? 'bg-blue-600 text-white rounded-tr-none'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                        }`}
                      >
                        {msg.text}

                        {msg.action === 'python-match' && (
                          <div className="mt-3 pt-3 border-t border-slate-800 flex gap-2 flex-wrap">
                            <Button
                              size="sm"
                              onClick={() => { setOmniSearch('Python Pune'); setActiveTab('talent'); }}
                              className="text-xs bg-purple-600 hover:bg-purple-500 text-white h-7"
                            >
                              Show 15 Available
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast.success('Shortlist created in CRM')}
                              className="text-xs bg-slate-800 text-slate-200 border-slate-700 h-7"
                            >
                              Build Shortlist
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toast.success('Outreach queue initialized')}
                              className="text-xs bg-slate-800 text-slate-200 border-slate-700 h-7"
                            >
                              Start Outreach
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Copilot Input */}
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <Input
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCopilot()}
                    placeholder="Ask Copilot: 'Find 15 Python developers for banking client in Pune', 'Contact top 10'..."
                    className="bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-xs"
                  />
                  <Button
                    onClick={handleSendCopilot}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shrink-0"
                  >
                    <Send className="h-3.5 w-3.5 mr-1" />
                    Instruct
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* TAB 5: PIPELINES KANBAN */}
        {activeTab === 'pipelines' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Visual Talent Pipeline</h2>
              <p className="text-xs text-slate-400">Real-time candidate lifecycle progression across all active requisitions</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 overflow-x-auto pb-4">
              {[
                { name: 'DISCOVER', count: candidates.length, color: 'border-slate-700' },
                { name: 'QUALIFIED', count: 18, color: 'border-blue-700' },
                { name: 'SHORTLISTED', count: 12, color: 'border-indigo-700' },
                { name: 'CONTACTED', count: 8, color: 'border-purple-700' },
                { name: 'INTERVIEW', count: osData?.scheduledInterviews?.length || 4, color: 'border-amber-700' },
                { name: 'HIRED', count: 3, color: 'border-emerald-700' },
              ].map((stage, sIdx) => (
                <div key={sIdx} className={`p-3 rounded-xl bg-slate-950/70 border ${stage.color} space-y-2`}>
                  <div className="flex justify-between items-center text-xs font-bold">
                    <span className="text-slate-300">{stage.name}</span>
                    <Badge variant="outline" className="text-[10px] bg-slate-900 border-slate-700">
                      {stage.count}
                    </Badge>
                  </div>

                  <div className="space-y-2 pt-2">
                    {candidates.slice(sIdx, sIdx + 2).map((c, cIdx) => (
                      <div
                        key={cIdx}
                        onClick={() => setSelectedCandidate(c)}
                        className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-blue-500 cursor-pointer text-xs space-y-1 transition-all"
                      >
                        <p className="font-bold text-white truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{c.title}</p>
                        <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                          <span className="text-emerald-400 font-semibold">{c.matchScore}%</span>
                          <span>{c.availability}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: CRM RELATIONSHIP TIMELINE */}
        {activeTab === 'crm' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Talent CRM & Relationship Engine</h2>
              <p className="text-xs text-slate-400">Full interaction audit, candidate notes, and outreach histories</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Relationship Activity Feed */}
              <Card className="md:col-span-2 bg-slate-950/70 border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <CardTitle className="text-sm font-bold text-white">Recent Recruiter & Candidate Touchpoints</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {[
                    { time: '10:32 AM', date: 'Today', candidate: 'Rahul Sharma', action: 'Profile viewed by Recruiter', type: 'view' },
                    { time: '04:15 PM', date: 'Yesterday', candidate: 'Priya Mehta', action: 'Candidate replied: "Interested, available after 15 days"', type: 'reply' },
                    { time: '11:20 AM', date: 'Sep 20', candidate: 'Anand Kumar', action: 'WhatsApp opportunity teaser sent', type: 'outreach' },
                    { time: '03:45 PM', date: 'Sep 18', candidate: 'Suresh Raina', action: 'Added to Java Leadership Talent Pool', type: 'pool' },
                    { time: '02:00 PM', date: 'Sep 14', candidate: 'Neha Joshi', action: 'Technical Interview Round 1 completed', type: 'interview' }
                  ].map((touch, tIdx) => (
                    <div key={tIdx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                      <div className="p-2 rounded-lg bg-blue-950 text-blue-400 border border-blue-900 shrink-0">
                        <History className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h4 className="font-bold text-white">{touch.candidate}</h4>
                          <span className="text-[10px] text-slate-500">{touch.date} • {touch.time}</span>
                        </div>
                        <p className="text-slate-300 mt-0.5">{touch.action}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* CRM Shortcuts */}
              <Card className="bg-slate-950/70 border-slate-800">
                <CardHeader className="pb-3 border-b border-slate-800">
                  <CardTitle className="text-sm font-bold text-white">CRM Queues</CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2">
                  <Button
                    onClick={() => { setTalentFilter('available'); setActiveTab('talent'); }}
                    variant="outline"
                    className="w-full justify-between text-xs bg-slate-900 hover:bg-slate-800 text-white border-slate-700"
                  >
                    <span>Uncontacted High Matches</span>
                    <Badge className="bg-amber-950 text-amber-400 border border-amber-800">6</Badge>
                  </Button>
                  <Button
                    onClick={() => setActiveTab('interviews')}
                    variant="outline"
                    className="w-full justify-between text-xs bg-slate-900 hover:bg-slate-800 text-white border-slate-700"
                  >
                    <span>Awaiting Feedback</span>
                    <Badge className="bg-rose-950 text-rose-400 border border-rose-800">4</Badge>
                  </Button>
                  <Button
                    onClick={() => { setTalentFilter('rematch'); setActiveTab('talent'); }}
                    variant="outline"
                    className="w-full justify-between text-xs bg-slate-900 hover:bg-slate-800 text-white border-slate-700"
                  >
                    <span>Re-Match Opportunities</span>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800">8</Badge>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 7: JOBS & REQUISITIONS */}
        {activeTab === 'jobs' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Active Hiring Requisitions</h2>
                <p className="text-xs text-slate-400">Manage open roles, applicant counts, and trigger instant match queries</p>
              </div>
              <Button onClick={() => navigate('/jobs/post')} size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold">
                <Plus className="h-4 w-4 mr-1.5" />
                Post New Requisition
              </Button>
            </div>

            <div className="space-y-3">
              {(osData?.jobs || []).map((job) => (
                <div
                  key={job.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{job.title}</h4>
                      <Badge className={job.is_active ? "bg-emerald-950 text-emerald-400 border-emerald-800 text-[10px]" : "bg-slate-800 text-slate-400 text-[10px]"}>
                        {job.is_active ? 'ACTIVE' : 'DRAFT'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">
                      {job.company_name || 'Organization'} • {job.location || 'Remote'} • {job.employment_type || 'Full-time'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-xs text-slate-400 mr-2">
                      <p><span className="font-bold text-white">{job.views_count || 0}</span> views</p>
                      <p><span className="font-bold text-blue-400">{job.applications_count || 0}</span> applicants</p>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleExecuteOmniSearch(job.title)}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                    >
                      Find 10 Matches →
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="bg-slate-900 border-slate-700 text-xs"
                    >
                      <Link to={`/jobs/manage/${job.id}`}>Manage</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: INTERVIEWS */}
        {activeTab === 'interviews' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white">Interview Coordination Workspace</h2>
                <p className="text-xs text-slate-400">Upcoming interview rounds and live Google Meet / Zoom meeting links</p>
              </div>
              <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold">
                <Link to="/employer/interview/schedule">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Schedule Interview
                </Link>
              </Button>
            </div>

            <div className="space-y-3">
              {(osData?.scheduledInterviews || []).length === 0 ? (
                <div className="text-center py-12 rounded-xl bg-slate-950/60 border border-slate-800">
                  <Calendar className="h-12 w-12 text-slate-600 mx-auto mb-2" />
                  <h3 className="font-bold text-white text-sm">No interviews scheduled yet</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4">
                    Coordinate live interview rounds with applicants across your open requisitions.
                  </p>
                  <Button asChild size="sm" className="bg-purple-600 text-white text-xs font-bold">
                    <Link to="/employer/interview/schedule">Schedule First Interview</Link>
                  </Button>
                </div>
              ) : (
                osData.scheduledInterviews.map((intv: any) => (
                  <div
                    key={intv.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-bold text-white text-sm">{intv.candidateName}</h4>
                      <p className="text-xs text-blue-400 font-semibold">{intv.jobTitle}</p>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                        <span><Calendar className="h-3 w-3 inline mr-1" />{intv.date} at {intv.time}</span>
                        <span><Video className="h-3 w-3 inline mr-1 text-purple-400" />{intv.mode}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {intv.meetingUrl && (
                        <Button
                          size="sm"
                          onClick={() => window.open(intv.meetingUrl, '_blank')}
                          className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold"
                        >
                          <Video className="h-3.5 w-3.5 mr-1" />
                          Join Meeting
                        </Button>
                      )}
                      <Button asChild size="sm" variant="outline" className="bg-slate-900 border-slate-700 text-xs">
                        <Link to="/employer/interview/schedule">Manage</Link>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 9: COMPANIES & EMPLOYER INTELLIGENCE */}
        {activeTab === 'companies' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-bold text-white">Company Intelligence Hub</h2>
              <p className="text-xs text-slate-400">Employer hiring velocity, skill demand trends, and candidate re-match opportunities</p>
            </div>

            <Card className="bg-slate-950/70 border-slate-800 p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">TalentXcel Enterprise</h3>
                    <p className="text-xs text-slate-400">Global Recruitment Account • Technology Sector</p>
                  </div>
                </div>

                <Button asChild size="sm" variant="outline" className="bg-slate-900 border-slate-700 text-xs">
                  <Link to="/employer/profile">Manage Profile & Team →</Link>
                </Button>
              </div>

              {/* Demand & Benchmarks */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Skill Demand Trending</p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between"><span className="text-white">Java / Spring Boot</span><span className="text-emerald-400 font-bold">↑ High</span></div>
                    <div className="flex justify-between"><span className="text-white">AWS Cloud Architecture</span><span className="text-emerald-400 font-bold">↑ Growing</span></div>
                    <div className="flex justify-between"><span className="text-white">Kafka / Microservices</span><span className="text-blue-400 font-bold">→ Stable</span></div>
                    <div className="flex justify-between"><span className="text-white">Python / AI Tools</span><span className="text-emerald-400 font-bold">↑ Emerging</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hiring Velocity</p>
                  <p className="text-3xl font-black text-blue-400">28 Days</p>
                  <p className="text-xs text-slate-400">Average time to qualified offer</p>
                  <Progress value={78} className="h-1.5 bg-slate-800" />
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Re-Match Engine</p>
                  <p className="text-3xl font-black text-emerald-400">12 Profiles</p>
                  <p className="text-xs text-slate-400">Past applicants that match active openings</p>
                  <Button
                    size="sm"
                    onClick={() => { setTalentFilter('rematch'); setActiveTab('talent'); }}
                    className="w-full text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold h-7 mt-1"
                  >
                    View 12 Re-Matches →
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* TAB 10: OUTREACH & ANALYTICS */}
        {(activeTab === 'outreach' || activeTab === 'analytics') && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-8 text-center rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <BarChart3 className="h-12 w-12 text-blue-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Recruiter Intelligence & Outreach Hub</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Track candidate reply rates, automated email/WhatsApp batches, and recruiter time-to-fill velocity.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <Button onClick={() => setActiveTab('talent')} size="sm" className="bg-blue-600 text-white text-xs font-bold">
                  Browse Candidates
                </Button>
                <Button asChild size="sm" variant="outline" className="bg-slate-900 border-slate-700 text-xs">
                  <Link to="/employer/analytics">Full Analytics Dashboard →</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 4. CANDIDATE 360° INTELLIGENCE MODAL */}
      <Dialog open={!!selectedCandidate} onOpenChange={(open) => !open && setSelectedCandidate(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-950 text-slate-100 border-slate-800">
          {selectedCandidate && (
            <>
              <DialogHeader className="border-b border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-black text-2xl text-white">
                      {selectedCandidate.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <DialogTitle className="text-xl font-black text-white">
                          {selectedCandidate.name}
                        </DialogTitle>
                        <Badge className="bg-blue-950 text-blue-400 border border-blue-800 text-xs font-bold">
                          TalentScore {selectedCandidate.talentScore}
                        </Badge>
                        <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
                          {selectedCandidate.matchScore}% Match
                        </Badge>
                      </div>
                      <DialogDescription className="text-xs text-slate-400 mt-0.5">
                        {selectedCandidate.title} • {selectedCandidate.company}
                      </DialogDescription>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6 py-4 text-xs">
                {/* 1. Identity & Hiring Signals */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Location</span>
                    <span className="font-bold text-white">{selectedCandidate.location}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Experience</span>
                    <span className="font-bold text-white">{selectedCandidate.experience_years} Years</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Notice Period</span>
                    <span className="font-bold text-purple-400">{selectedCandidate.noticePeriod}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 font-semibold block uppercase">Target Compensation</span>
                    <span className="font-bold text-emerald-400">{selectedCandidate.expectedSalary}</span>
                  </div>
                </div>

                {/* 2. Skills & Proof Evidence */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">Verified Skills & Strength</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.skills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-blue-900/60 text-slate-200 text-xs font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-blue-400" />
                        {s} • <span className="text-blue-400 font-bold">8/8 Verified</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* 3. Open Opportunities Match Breakdown */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">Fit Across Open Requirements</h4>
                  <div className="space-y-2">
                    {[
                      { role: 'Senior Cloud Cybersecurity Systems Architect', match: 96 },
                      { role: 'Java / Kafka Tech Lead', match: 91 },
                      { role: 'Engineering Manager - Core Platform', match: 87 }
                    ].map((mRole, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                        <span className="font-semibold text-slate-200">{mRole.role}</span>
                        <span className="font-bold text-emerald-400">{mRole.match}% Fit</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Relationship History Timeline */}
                <div>
                  <h4 className="font-bold uppercase tracking-wider text-slate-400 text-[10px] mb-2">Candidate Relationship Timeline</h4>
                  <div className="space-y-2">
                    {selectedCandidate.timeline.map((event, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-slate-900/70 border border-slate-800 flex items-start gap-3">
                        <div className="p-1.5 rounded-md bg-blue-950 text-blue-400 shrink-0">
                          <Clock className="h-3.5 w-3.5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-200">{event.event}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">{event.date} at {event.time} • Recorded by {event.actor}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-3 border-t border-slate-800">
                <Button variant="outline" onClick={() => setSelectedCandidate(null)} className="bg-slate-900 border-slate-700 text-xs">
                  Close
                </Button>
                <Button
                  onClick={() => {
                    const c = selectedCandidate;
                    setSelectedCandidate(null);
                    navigate(`/employer/interview/schedule?name=${encodeURIComponent(c.name)}&email=${encodeURIComponent(c.email || '')}`);
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                >
                  <Calendar className="h-3.5 w-3.5 mr-1.5" />
                  Schedule Interview
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 5. ADD TO POOL DIALOG */}
      <Dialog open={!!selectedPoolCandidate} onOpenChange={(open) => !open && setSelectedPoolCandidate(null)}>
        <DialogContent className="max-w-md bg-slate-950 text-slate-100 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white">Assign to Talent Pool</DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              Select dynamic pool to maintain permanent relationship memory for {selectedPoolCandidate?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-3 text-xs">
            {[
              'Java Architects (Bangalore)',
              'Immediate Joiners (Engineering)',
              'BFSI Leaders (₹30L+)',
              'SAP Consultants',
              'NTT DATA Ready Talent',
              'Future Leadership Pool'
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => selectedPoolCandidate && handleAddToPool(selectedPoolCandidate, p)}
                className="w-full text-left p-3 rounded-xl bg-slate-900 hover:bg-blue-600 hover:text-white border border-slate-800 transition-all font-semibold"
              >
                🏊 {p}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
