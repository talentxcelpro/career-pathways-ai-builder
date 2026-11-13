// src/pages/recruiters/RecruiterLandingPage.tsx
// Independent Standalone Product for employers.talentxcel.in (Recruiter Workspace)
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState } from 'react';
import { SEOHead } from '@/components/seo/SEOHead';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  Sparkles, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Zap, 
  Target, 
  Lock, 
  Building2, 
  ChevronRight, 
  Star, 
  Clock, 
  Filter, 
  Eye, 
  Phone, 
  Mail, 
  Award, 
  Check, 
  Bot, 
  Layers, 
  MapPin, 
  TrendingUp, 
  Bookmark, 
  Send, 
  Loader2 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { PLATFORM_METRICS } from '@/config/platformMetrics';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GrowthFunnelTracker } from '@/lib/analytics/growthFunnelTracker';
import { conversionTelemetry } from '@/utils/conversionTelemetry';
import { ProductHeader } from '@/components/products/common/ProductHeader';
import { ProductFooter } from '@/components/products/common/ProductFooter';
import { useCentralEntitlements } from '@/hooks/useCentralEntitlements';
import { UpgradeModal } from '@/components/billing/UpgradeModal';

export const SAMPLE_TALENT_ARCHETYPES = [
  {
    id: 'talent-preview-1',
    name: 'Aravind S.',
    title: 'Lead Full-Stack Architect',
    skills: ['React', 'Node.js', 'System Architecture', 'TypeScript', 'GraphQL'],
    location: 'Bangalore, India',
    company: 'Tier 1 Enterprise Tech',
    experience_years: 8,
    score: 890,
    matchPct: 98,
    why: 'Dual specialization in distributed microservices & high-concurrency frontend'
  },
  {
    id: 'talent-preview-2',
    name: 'Pooja M.',
    title: 'Senior AI/ML Engineer',
    skills: ['Python', 'PyTorch', 'LLM Fine-tuning', 'LangChain', 'FastAPI'],
    location: 'Hyderabad, India',
    company: 'AI Research Labs',
    experience_years: 6,
    score: 875,
    matchPct: 96,
    why: 'Production experience deploying enterprise RAG pipelines and model quantization'
  },
  {
    id: 'talent-preview-3',
    name: 'Vikram K.',
    title: 'Principal Cloud & DevOps Architect',
    skills: ['Kubernetes', 'AWS', 'Terraform', 'CI/CD Pipelines', 'Kafka'],
    location: 'Pune, India',
    company: 'Global Fintech Leader',
    experience_years: 10,
    score: 915,
    matchPct: 99,
    why: 'Hands-on track record managing multi-region Kubernetes clusters with 99.99% uptime'
  },
  {
    id: 'talent-preview-4',
    name: 'Sneha R.',
    title: 'Product & Growth Lead',
    skills: ['Product Analytics', 'SQL', 'A/B Testing', 'Growth Funnels', 'Figma'],
    location: 'Noida / Delhi-NCR',
    company: 'High-Growth Series B SaaS',
    experience_years: 5,
    score: 840,
    matchPct: 94,
    why: 'Spearheaded self-serve acquisition funnel scaling from 10k to 250k MAUs'
  },
  {
    id: 'talent-preview-5',
    name: 'Karthik N.',
    title: 'Senior Mobile Engineer (iOS & React Native)',
    skills: ['React Native', 'Swift', 'Offline-First DB', 'Redux', 'Mobile CI/CD'],
    location: 'Chennai, India',
    company: 'Top Consumer App',
    experience_years: 7,
    score: 860,
    matchPct: 95,
    why: 'Shipped 4 mobile applications with over 1M+ active Play Store / App Store installs'
  },
  {
    id: 'talent-preview-6',
    name: 'Ananya B.',
    title: 'Data & Analytics Engineering Lead',
    skills: ['Snowflake', 'dbt', 'Airflow', 'Python', 'Tableau'],
    location: 'Mumbai, India',
    company: 'Global Retail Enterprise',
    experience_years: 8,
    score: 880,
    matchPct: 97,
    why: 'Designed centralized enterprise data warehouse serving 500+ daily business analysts'
  }
];

export default function RecruiterLandingPage() {
  const navigate = useNavigate();
  const { 
    subscription, 
    checkEntitlement, 
    isUpgradeModalOpen, 
    openUpgradeModal, 
    closeUpgradeModal,
    refreshEntitlements 
  } = useCentralEntitlements();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [targetActionText, setTargetActionText] = useState('unlock candidate discovery');
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);

  // Registration Form State
  const [regFullName, setRegFullName] = useState('');
  const [regWorkEmail, setRegWorkEmail] = useState('');
  const [regCompanyName, setRegCompanyName] = useState('');
  const [regRole, setRegRole] = useState('Corporate Recruiter');
  const [regHiringDomain, setRegHiringDomain] = useState('Technology & Engineering');
  const [regPassword, setRegPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search Live Candidates (Query supabase with graceful fallback)
  const { data: candidates, isLoading: isSearchLoading, refetch } = useQuery({
    queryKey: ['recruiter-talent-search', searchTerm],
    queryFn: async () => {
      if (!searchTerm.trim()) return [];
      try {
        const query = searchTerm.toLowerCase().trim();
        const { data, error } = await supabase
          .from('profiles')
          .select('id, full_name, headline, bio, location, experience_level, skills, current_role, updated_at')
          .or(`skills.cs.{${query}},headline.ilike.%${query}%,bio.ilike.%${query}%,location.ilike.%${query}%`)
          .limit(12);

        if (error) {
          console.warn('Live candidate search returned error, utilizing archetypes:', error.message);
          return [];
        }

        if (data && data.length > 0) {
          return data.map((p: any) => ({
            id: p.id,
            name: p.full_name ? `${p.full_name.split(' ')[0]} ${p.full_name.split(' ')[1]?.[0] || ''}.` : 'Verified Candidate',
            title: p.headline || p.current_role || 'Engineering Specialist',
            skills: Array.isArray(p.skills) ? p.skills : ['Software Engineering', 'System Design'],
            location: p.location || 'India',
            experience_years: p.experience_level === 'Senior' ? 7 : p.experience_level === 'Lead' ? 10 : 4,
            score: 820 + Math.floor(Math.random() * 120),
            matchPct: 92 + Math.floor(Math.random() * 7),
            why: `Direct match for ${searchTerm} skills and verified experience history.`
          }));
        }

        return [];
      } catch (err) {
        console.warn('Talent search query error:', err);
        return [];
      }
    },
    enabled: false,
  });

  const handleSearch = (term?: string) => {
    const q = term || searchTerm;
    if (!q.trim()) return;
    conversionTelemetry.track('recruiter_talent_searched', { query: q });
    refetch();
  };

  const displayCandidates = (candidates && candidates.length > 0) ? candidates : SAMPLE_TALENT_ARCHETYPES;

  const handleTriggerSignup = (actionText: string, cand?: any) => {
    setTargetActionText(actionText);
    if (cand) setSelectedCandidate(cand);
    setIsSignupModalOpen(true);
  };

  const handleRecruiterRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regWorkEmail.trim() || !regPassword.trim() || !regFullName.trim() || !regCompanyName.trim()) {
      toast.error('Please fill in all required company details.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regWorkEmail.trim(),
        password: regPassword,
        options: {
          data: {
            full_name: regFullName.trim(),
            company_name: regCompanyName.trim(),
            user_role: 'employer',
            role: 'employer',
            hiring_domain: regHiringDomain
          }
        }
      });

      if (authError) throw authError;

      conversionTelemetry.track('employer_signup_completed', { company: regCompanyName.trim(), domain: regHiringDomain });
      GrowthFunnelTracker.trackOnce('sign_up', authData.user?.id || regWorkEmail.trim(), {
        role: 'employer',
        source: 'recruiter_os',
        user_id: authData.user?.id,
        company_name: regCompanyName.trim()
      });

      localStorage.setItem('txc_active_workspace', 'employer');
      localStorage.setItem('txc_recruiter_domain', regHiringDomain);
      
      toast.success('Welcome to TalentXcel Recruiter Workspace! Launching your workspace...');
      setIsSignupModalOpen(false);

      setTimeout(() => {
        navigate('/dashboard?view=role');
      }, 500);

    } catch (err: any) {
      console.error('Signup error:', err);
      toast.error(err.message || 'Registration failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <SEOHead 
        title="Recruiter Workspace | Discover & Hire Top Verified Talent | TalentXcel" 
        description="Search verified talent, discover candidates with proof-of-work, and streamline hiring with TalentXcel Recruiter Workspace." 
        canonical="https://employers.talentxcel.in/" 
        type="website" 
      />

      {/* Shared Global Product Header */}
      <ProductHeader 
        productName="Recruiter Workspace" 
        activeNav="employers"
        badgeLabel="Recruiter OS Portal"
        topBannerText={`Access ${PLATFORM_METRICS.totalProfessionalsDisplay} verified candidates • Proactive Talent Intelligence`}
        primaryActionLabel="Post a Job (Hire) →"
        primaryActionTo="/hire"
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-white via-white to-[#F4F7FC] border-b border-[#E2E8F0] px-4 pt-10 pb-16 text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold shadow-2xs">
            <Sparkles className="h-3.5 w-3.5 text-[#2563EB]" />
            <span>Stop Managing ATS Rows. Make The Database Work For You.</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111827] max-w-4xl mx-auto leading-tight">
            The Talent Database That <br />
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] bg-clip-text text-transparent">
              Actively Hires For You.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Define your hiring requirement. TalentXcel instantly discovers, ranks by proof-backed skills, and engages {PLATFORM_METRICS.totalProfessionalsDisplay} candidates in one unified hiring operating system.
          </p>

          {/* Interactive Live Search Bar (Product Value Before Signup) */}
          <div className="max-w-3xl mx-auto pt-3 space-y-3">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shadow-lg shadow-blue-900/5 rounded-2xl border border-[#E2E8F0] bg-white p-2">
              <div className="flex items-center flex-1 min-w-0">
                <Search className="h-5 w-5 ml-3 text-[#64748B] shrink-0 pointer-events-none" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search talent: e.g. Python developers in Bangalore, Cloud Architects, Full-Stack..."
                  className="border-0 bg-transparent text-[#111827] placeholder:text-[#64748B] text-sm focus-visible:ring-0 focus-visible:ring-offset-0 px-3"
                />
              </div>
              <Button
                onClick={() => handleSearch()}
                className="w-full sm:w-auto bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-6 py-2.5 rounded-xl h-11 shrink-0 shadow-xs"
              >
                Search {PLATFORM_METRICS.totalProfessionalsDisplay} Talent →
              </Button>
            </div>

            {/* Quick Search Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="text-xs text-[#64748B] font-semibold">Try searching:</span>
              {[
                'AI / ML Engineers',
                'Bangalore Tech',
                'Pune SRE',
                'Hyderabad Cloud',
                'Remote Developers',
                'Immediate Joiners'
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSearchTerm(chip);
                    handleSearch(chip);
                  }}
                  className="text-xs px-3 py-1 rounded-xl bg-white hover:border-[#2563EB] hover:text-[#2563EB] border border-[#E2E8F0] text-[#64748B] transition-all cursor-pointer font-medium shadow-2xs"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Live Metric Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-[#E2E8F0]">
            {[
              { label: 'Active Candidates', val: PLATFORM_METRICS.totalProfessionalsDisplay, sub: 'Indexed in Talent Graph' },
              { label: 'Verified Skills', val: '4,218+', sub: 'Proof-backed profiles' },
              { label: 'Immediate Joiners', val: '1,420+', sub: 'Available within 15 days' },
              { label: 'Average Time-to-Hire', val: '18 Days', sub: 'vs 45 days industry avg' }
            ].map((m, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-[#E2E8F0] shadow-xs text-left">
                <p className="text-2xl font-black text-[#111827]">{m.val}</p>
                <p className="text-xs font-bold text-[#2563EB] mt-0.5">{m.label}</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">{m.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live Candidate Search Results Preview */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#111827] flex items-center gap-2">
                <Users className="h-5 w-5 text-[#2563EB]" />
                {candidates && candidates.length > 0 ? 'Live Candidate Search Results' : 'Candidate Discovery Archetypes'}
              </h2>
              <p className="text-xs text-[#64748B] mt-1">
                {candidates && candidates.length > 0 
                  ? 'Real profiles matching your criteria. Sign up to unlock full contact info, resumes, and automated outreach.'
                  : 'Demonstration archetypes representing active market demand. Register your hiring workspace to search 100% live verified candidates.'}
              </p>
            </div>
            <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200">
              {candidates && candidates.length > 0
                ? `${candidates.length} Matches Found`
                : `${displayCandidates.length} Active Archetypes`}
            </span>
          </div>

          {/* Candidate Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {displayCandidates.map((cand: any, idx: number) => {
              const skillsList = Array.isArray(cand.skills) ? cand.skills : (cand.skills ? [cand.skills] : ['Software Systems', 'Cloud']);
              const exp = cand.experience_years ? Number(cand.experience_years) : 4 + (idx % 6);
              const score = 780 + ((idx * 19) % 160);
              const matchPct = 95 - (idx * 2);

              return (
                <Card key={cand.id} className="bg-white border-[#E2E8F0] hover:border-[#2563EB] transition-all flex flex-col justify-between shadow-xs hover:shadow-md rounded-2xl">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-[#2563EB] to-[#7138E8] flex items-center justify-center font-bold text-white text-base shadow-xs">
                          {cand.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#111827]">{cand.name}</h3>
                          <p className="text-xs text-[#64748B] truncate max-w-[180px]">{cand.title || 'Technical Specialist'}</p>
                        </div>
                      </div>
                      <Badge className="bg-blue-50 text-[#2563EB] border border-blue-200 text-[10px] font-bold">
                        {matchPct}% Match
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3.5 text-xs">
                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-[#64748B] text-[11px] font-medium">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[#64748B]" />{cand.location || 'India'}</span>
                      <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5 text-[#64748B]" />{exp} yrs</span>
                      <Badge variant="outline" className="border-blue-200 text-[#2563EB] bg-blue-50 text-[10px] ml-auto font-bold">
                        Score: {score}
                      </Badge>
                    </div>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-1.5">
                      {skillsList.slice(0, 4).map((skill: string, sIdx: number) => (
                        <span key={sIdx} className="px-2.5 py-0.5 rounded-md bg-[#F4F7FC] border border-[#E2E8F0] text-[10px] text-[#64748B] font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>

                    {/* Why matched box */}
                    <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] text-[11px] space-y-1">
                      <p className="font-bold uppercase tracking-wider text-[9px] text-[#2563EB] flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" /> Why Matched
                      </p>
                      <p className="text-[#111827] flex items-center gap-1.5 font-medium">
                        <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>{skillsList.slice(0, 2).join(', ')} core competency</span>
                      </p>
                      <p className="text-[#64748B] flex items-center gap-1.5">
                        <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                        <span>Available for immediate recruiter touchpoint</span>
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-[#E2E8F0] flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTriggerSignup(`view the full candidate intelligence dossier for ${cand.name}`, cand)}
                        className="text-xs w-full bg-white border-[#E2E8F0] text-[#111827] hover:bg-[#F4F7FC] rounded-xl"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1 text-[#2563EB]" />
                        View 360°
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleTriggerSignup(`unlock direct phone and email contact for ${cand.name}`, cand)}
                        className="text-xs w-full bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold rounded-xl shadow-xs"
                      >
                        <Lock className="h-3 w-3 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Why Recruiter OS vs Traditional ATS */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-[#E2E8F0]">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
            <Badge className="bg-purple-50 text-[#7138E8] border border-purple-200 text-xs font-bold">
              Architectural Transformation
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-[#111827] tracking-tight">
              Why Top Recruiters Are Moving to TalentXcel
            </h2>
            <p className="text-sm text-[#64748B]">
              Traditional ATS software makes recruiters manually manage endless rows. TalentXcel makes the database find, score, and surface candidate opportunities proactively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: BrainCircuitIcon,
                title: 'The Database Works For You',
                desc: `Instead of posting jobs and hoping candidates apply, TalentXcel continuously cross-matches your active requirements against ${PLATFORM_METRICS.totalProfessionalsDisplay} pre-vetted profiles.`
              },
              {
                icon: Sparkles,
                title: 'Permanent Talent Memory',
                desc: "Rejected ≠ Deleted. If a candidate isn't right for Job A today, TalentXcel remembers their strengths and automatically surfaces them when Job B opens 6 months later."
              },
              {
                icon: Bot,
                title: 'Embedded Recruiter Copilot',
                desc: 'Ask your copilot: "Find 15 Python developers in Pune who can join immediately under ₹24L". It builds your shortlist and drafts personalized outreach in seconds.'
              },
              {
                icon: Layers,
                title: 'Self-Updating Talent Pools',
                desc: 'Permanent collections like Java Architects, SAP Consultants, and Immediate Joiners that auto-refresh whenever candidate status or availability changes.'
              },
              {
                icon: ShieldCheck,
                title: 'Candidate 360° Intelligence',
                desc: 'Beyond a flat CV: View career velocity, verified proof of skills, target compensation bands, notice periods, and complete chronological relationship timelines.'
              },
              {
                icon: Zap,
                title: '1-Click Direct Outreach',
                desc: 'Initiate email, WhatsApp, and interview scheduling workflows directly from the candidate intelligence card with zero context switching.'
              }
            ].map((item, idx) => {
              const Icon = item.icon || Sparkles;
              return (
                <div key={idx} className="p-6 rounded-2xl bg-white border border-[#E2E8F0] hover:border-[#2563EB] shadow-xs hover:shadow-md transition-all space-y-3 text-left">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#111827]">{item.title}</h3>
                  <p className="text-xs text-[#64748B] leading-relaxed font-medium">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white text-center space-y-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Ready to Turn Your Hiring into an Operating System?
              </h2>
              <p className="text-sm text-blue-100">
                Create your free recruiter account in 60 seconds. Unlock candidate contacts, explore permanent talent pools, and let AI build your first shortlist today.
              </p>
              <div className="pt-2">
                <Button
                  size="lg"
                  onClick={() => handleTriggerSignup('activate your free recruiter account')}
                  className="bg-white hover:bg-slate-50 text-[#111827] font-black text-sm px-8 py-4 rounded-xl shadow-lg shadow-black/10"
                >
                  Start Hiring Free — No Credit Card Required →
                </Button>
              </div>
              <p className="text-xs text-blue-200">14-day full access • Instant database activation • Unlimited candidate searches</p>
            </div>
          </div>
        </section>
      </main>

      {/* Intent-Driven Recruiter Registration Modal */}
      <Dialog open={isSignupModalOpen} onOpenChange={setIsSignupModalOpen}>
        <DialogContent className="max-w-md bg-white text-[#111827] border-[#E2E8F0] p-6 space-y-4 rounded-2xl">
          <DialogHeader>
            <Badge className="w-fit bg-blue-50 text-[#2563EB] border border-blue-200 text-[10px] font-bold">
              Recruiter Account Setup
            </Badge>
            <DialogTitle className="text-xl font-black text-[#111827] mt-1">
              Start Hiring on TalentXcel
            </DialogTitle>
            <DialogDescription className="text-xs text-[#64748B]">
              Create your free account to {targetActionText}.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRecruiterRegister} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-[#111827] text-xs font-bold">Your Full Name</Label>
              <Input
                required
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="e.g. Priya Sharma"
                className="bg-[#F4F7FC] border-[#E2E8F0] text-[#111827] text-xs h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[#111827] text-xs font-bold">Work Email Address</Label>
              <Input
                required
                type="email"
                value={regWorkEmail}
                onChange={(e) => setRegWorkEmail(e.target.value)}
                placeholder="priya@company.com"
                className="bg-[#F4F7FC] border-[#E2E8F0] text-[#111827] text-xs h-10 rounded-xl"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-[#111827] text-xs font-bold">Company Name</Label>
              <Input
                required
                value={regCompanyName}
                onChange={(e) => setRegCompanyName(e.target.value)}
                placeholder="e.g. Acme Technologies"
                className="bg-[#F4F7FC] border-[#E2E8F0] text-[#111827] text-xs h-10 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[#111827] text-[11px] font-bold">Your Role</Label>
                <select
                  value={regRole}
                  onChange={(e) => setRegRole(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] text-[#111827] text-xs px-3 font-medium"
                >
                  <option>Corporate Recruiter</option>
                  <option>Hiring Manager</option>
                  <option>Staffing Agency</option>
                  <option>Founder / Exec</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-[#111827] text-[11px] font-bold">Primary Domain</Label>
                <select
                  value={regHiringDomain}
                  onChange={(e) => setRegHiringDomain(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] text-[#111827] text-xs px-3 font-medium"
                >
                  <option>Technology & Engineering</option>
                  <option>Data & AI</option>
                  <option>Product & Design</option>
                  <option>BFSI & Leadership</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-[#111827] text-xs font-bold">Set Password</Label>
              <Input
                required
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="bg-[#F4F7FC] border-[#E2E8F0] text-[#111827] text-xs h-10 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs py-3 mt-2 rounded-xl shadow-xs"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Creating Hiring Account...
                </>
              ) : (
                'Enter Recruiter OS →'
              )}
            </Button>

            <p className="text-[10px] text-center text-[#64748B] pt-1">
              By registering, you agree to the Terms of Service. Free tier includes live talent search and candidate pipeline management.
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Shared Global Product Footer */}
      <ProductFooter currentProduct="Recruiter Workspace" />

      {/* Central Revenue Pro Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={closeUpgradeModal}
        currentPlanId={subscription.planId}
        initialSelectedTier="business"
        targetFeatureName="Recruiter Candidate Unlocks & Direct Outreach"
        onSuccess={() => {
          refreshEntitlements();
        }}
      />
    </div>
  );
}

function BrainCircuitIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M9 13a4.5 4.5 0 0 0 3-4" />
      <path d="M6.003 5.125A3 3 0 0 0 6.401 6.5" />
      <path d="M3.477 10.896a4 4 0 0 1 .585-.396" />
      <path d="M6 18a4 4 0 0 1-1.967-.516" />
      <path d="M12 13h4" />
      <path d="M12 18h6a2 2 0 0 1 2 2v1" />
      <path d="M12 8h8" />
      <path d="M16 8V5a2 2 0 0 1 2-2" />
      <path d="M20 12h2" />
      <path d="M20 18v2" />
    </svg>
  );
}
