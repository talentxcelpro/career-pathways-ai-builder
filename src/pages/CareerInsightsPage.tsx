import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
} from '@/components/ui/dialog';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  Briefcase, 
  Sparkles, 
  Brain, 
  ShieldCheck, 
  ArrowRight, 
  ArrowUpRight, 
  LineChart, 
  PieChart, 
  Compass,
  FileCheck2,
  CheckCircle2,
  Layers,
  Clock,
  Download,
  Share2,
  RefreshCw,
  Zap,
  Target,
  Award,
  Globe,
  Sliders,
  ChevronRight,
  ExternalLink,
  Cpu,
  Shield,
  Cloud,
  Code2,
  Database,
  Building2,
  Activity,
  Check,
  MapPin,
  Plane,
  Coins,
  Scale,
  Laptop,
  Search,
  X,
  FileText,
  Filter,
  Flame,
  Info,
  GraduationCap,
  BookOpen,
  Lock,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCareerMetrics } from '@/hooks/useCareerMetrics';
import { useTalentScore } from '@/hooks/useTalentScore';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';
import { formatCanonicalUrl } from '@/config/domainArchitecture';
import { supabase } from '@/integrations/supabase/client';
import {
  RegionCode,
  REGIONAL_PROFILES,
  CATEGORY_SPECS,
  IndustryCategory,
  ComputedRegionalIndustry,
  queryRegionalIndustries
} from '@/data/regionalIndustriesData';

// ==========================================
// RESILIENCE CAPABILITIES & DEFENSIVE SKILLS
// ==========================================
interface ResilienceSkill {
  id: string;
  name: string;
  points: number;
  tag: string;
  automationRisk: 'Very Low' | 'Low' | 'Moderate';
  description: string;
}

const RESILIENCE_SKILLS: ResilienceSkill[] = [
  { id: 'dist_sys', name: 'Distributed Systems & Raft Consensus', points: 7, tag: 'Architecture', automationRisk: 'Very Low', description: 'Fault-tolerant replicas, state machines and consensus engines.' },
  { id: 'perf_rust', name: 'Rust & Low-Latency Systems', points: 8, tag: 'Systems', automationRisk: 'Very Low', description: 'Zero-cost abstractions, memory safety and microsecond latency.' },
  { id: 'k8s_mesh', name: 'Kubernetes Multi-Cluster & Service Mesh', points: 5, tag: 'Infra', automationRisk: 'Low', description: 'Istio/Cilium, cross-region failover and GitOps automation.' },
  { id: 'llm_rag', name: 'LLM Fine-Tuning & Quantized RAG', points: 8, tag: 'Generative AI', automationRisk: 'Very Low', description: 'LoRA adapters, vector search and context-aware agents.' },
  { id: 'gpu_cuda', name: 'PyTorch CUDA & Kernel Optimization', points: 7, tag: 'Deep Learning', automationRisk: 'Very Low', description: 'Triton kernels, GPU parallelism and latency quantization.' },
  { id: 'sys_design', name: 'High-Concurrency System Design', points: 6, tag: 'Scale', automationRisk: 'Low', description: 'Partitioning, multi-level caches and event storm mitigation.' },
  { id: 'kafka_stream', name: 'Kafka & Real-Time Event Streams', points: 5, tag: 'Streaming', automationRisk: 'Low', description: 'Exactly-once semantics, Flink SQL and event hub design.' },
  { id: 'db_shard', name: 'Sharded Postgres & Distributed DBs', points: 5, tag: 'Data Tier', automationRisk: 'Low', description: 'Global ACID transactions, geo-partitioning and schema tuning.' },
  { id: 'zero_trust', name: 'Zero-Trust IAM & Kernel Security', points: 6, tag: 'Security', automationRisk: 'Very Low', description: 'Kernel observability, mTLS attestation and least-privilege IAM.' },
  { id: 'tech_lead', name: 'Engineering Leadership & Tech RFCs', points: 6, tag: 'Leadership', automationRisk: 'Very Low', description: 'System trade-offs, technical RFCs and executive stakeholder alignment.' },
  { id: 'finops', name: 'FinOps & Cloud Unit Economics', points: 5, tag: 'Strategy', automationRisk: 'Low', description: 'Infrastructure cost models, gross margin scaling and compute tiering.' },
  { id: 'appsec_audit', name: 'AI Safety & Adversarial Auditing', points: 6, tag: 'Trust', automationRisk: 'Very Low', description: 'Prompt injection defense, adversarial robustness and privacy safeguards.' }
];

// ==========================================
// 5-STAGE CAREER PROGRESSION LADDER
// ==========================================
interface CareerLadderStage {
  id: string;
  title: string;
  yoe: string;
  levelTag: string;
  focus: string;
  keyDeliverable: string;
  typicalTimeInLevel: string;
  salaryMultipliers: Record<RegionCode, string>;
  resilienceRating: string;
}

const CAREER_LADDER_STAGES: CareerLadderStage[] = [
  {
    id: 'l1',
    title: 'Associate Engineer',
    yoe: '0 - 2 YOE',
    levelTag: 'IC 1-2',
    focus: 'Feature delivery, clean code, unit test coverage, and mastering toolchains.',
    keyDeliverable: 'Independently ship well-tested features within defined task boundaries.',
    typicalTimeInLevel: '1.5 - 2 Years',
    resilienceRating: '68 / 100 — Developing Defensibility',
    salaryMultipliers: {
      GLOBAL: '$75k - $110k',
      US: '$95k - $135k',
      UAE: 'AED 180k - 260k',
      IN: '₹8 - 14 LPA',
      EU: '€55k - 80k',
      SG: 'S$85k - 125k',
      CA: 'C$80k - 115k',
      AU: 'A$90k - 130k'
    }
  },
  {
    id: 'l2',
    title: 'Mid-Level Specialist',
    yoe: '3 - 5 YOE',
    levelTag: 'IC 3',
    focus: 'End-to-end service ownership, schema designs, queue processors, and production ops.',
    keyDeliverable: 'Own medium-to-large service modules with zero-downtime deployment pipelines.',
    typicalTimeInLevel: '2 - 3 Years',
    resilienceRating: '79 / 100 — Solid Production Foundation',
    salaryMultipliers: {
      GLOBAL: '$120k - $165k',
      US: '$145k - $195k',
      UAE: 'AED 280k - 420k',
      IN: '₹16 - 28 LPA',
      EU: '€85k - 120k',
      SG: 'S$130k - 180k',
      CA: 'C$120k - 165k',
      AU: 'A$135k - 185k'
    }
  },
  {
    id: 'l3',
    title: 'Senior Specialist / Tech Lead',
    yoe: '5 - 8 YOE',
    levelTag: 'IC 4 / TL',
    focus: 'Cross-service architecture, SLA resilience, engineering mentorship, and code standards.',
    keyDeliverable: 'Lead technical RFCs, eliminate architectural debt, and mentor 4-8 engineers.',
    typicalTimeInLevel: '3 - 4 Years',
    resilienceRating: '91 / 100 — High AI Automation Defense',
    salaryMultipliers: {
      GLOBAL: '$165k - $240k',
      US: '$195k - $290k',
      UAE: 'AED 420k - 620k',
      IN: '₹28 - 48 LPA',
      EU: '€120k - 170k',
      SG: 'S$185k - 260k',
      CA: 'C$165k - 235k',
      AU: 'A$180k - 255k'
    }
  },
  {
    id: 'l4',
    title: 'Staff / Principal Architect',
    yoe: '8 - 12+ YOE',
    levelTag: 'IC 5-6 / Principal',
    focus: 'Multi-year architectural roadmap, cross-department platforms, and executive alignment.',
    keyDeliverable: 'Drive organization-wide technical strategy impacting business revenue and platform scale.',
    typicalTimeInLevel: '4+ Years',
    resilienceRating: '97 / 100 — Strategic Platform Moat',
    salaryMultipliers: {
      GLOBAL: '$240k - $420k+',
      US: '$310k - $550k+',
      UAE: 'AED 620k - 950k+',
      IN: '₹50 - 1.1 Cr+',
      EU: '€175k - 300k+',
      SG: 'S$270k - 450k+',
      CA: 'C$240k - 380k+',
      AU: 'A$260k - 420k+'
    }
  },
  {
    id: 'l5',
    title: 'VP / Engineering Fellow',
    yoe: '12 - 15+ YOE',
    levelTag: 'Executive / Fellow',
    focus: 'Global engineering culture, intellectual property, enterprise P&L, and industry influence.',
    keyDeliverable: 'Sponsor next-generation technological bets and steer global engineering organizations.',
    typicalTimeInLevel: 'Executive Tenure',
    resilienceRating: '99 / 100 — Executive Resilience',
    salaryMultipliers: {
      GLOBAL: '$450k - $800k+',
      US: '$550k - $1M+',
      UAE: 'AED 950k - 1.6M+',
      IN: '₹1.2 - 2.5 Cr+',
      EU: '€280k - 500k+',
      SG: 'S$420k - 750k+',
      CA: 'C$360k - 600k+',
      AU: 'A$400k - 700k+'
    }
  }
];

// ==========================================
// RESEARCH-LED INDUSTRY REPORTS (P2)
// ==========================================
interface IndustryReport {
  id: string;
  title: string;
  sector: string;
  cagr: string;
  marketSize: string;
  executiveSummary: string;
  keyFinding: string;
  regulatoryBody: string;
  hiringCorridor: string;
  criticalSkill: string;
}

const RESEARCH_REPORTS: IndustryReport[] = [
  {
    id: 'ai-infra',
    title: 'Frontier AI & Large-Scale Systems Infrastructure Report 2026',
    sector: 'Artificial Intelligence & Deep Tech',
    cagr: '+34.2%',
    marketSize: '$1.3T by 2030',
    executiveSummary: 'Enterprises are aggressively transitioning from superficial wrapper applications to sovereign inference clusters, custom quantized models, and private retrieval engines.',
    keyFinding: 'Systems engineers with distributed training, CUDA optimization, and low-latency cache proficiency command 40% salary premiums.',
    regulatoryBody: 'US AI Safety Institute, EU AI Act Compliance Board',
    hiringCorridor: 'San Francisco, Seattle, Bangalore, Zurich',
    criticalSkill: 'Triton, CUDA, vLLM, Distributed Consensus'
  },
  {
    id: 'fintech-quant',
    title: 'Algorithmic Financial Engineering & Cross-Border Payment Corridors',
    sector: 'Fintech & Capital Markets',
    cagr: '+21.8%',
    marketSize: '$680B by 2029',
    executiveSummary: 'Sub-millisecond execution pipelines, real-time settlement APIs, and zero-knowledge ledger integrations are driving modern financial systems.',
    keyFinding: 'High demand for Rust and C++ engineers capable of sub-10-microsecond order books and deterministic consensus.',
    regulatoryBody: 'SEC, MAS Singapore, RBI, DFSA Dubai',
    hiringCorridor: 'New York, London, Dubai IFC, Singapore, Mumbai',
    criticalSkill: 'Rust, Low-Latency Networking, FIX Protocol, eBPF'
  },
  {
    id: 'cloud-defense',
    title: 'Sovereign Cloud & Zero-Trust Defense Computing Review',
    sector: 'Cloud Infrastructure & Defense',
    cagr: '+26.5%',
    marketSize: '$420B by 2028',
    executiveSummary: 'Governments and regulated enterprises require sovereign data isolation, air-gapped compute, and hardware-level cryptographic attestation.',
    keyFinding: 'Kubernetes multi-cluster operators and zero-trust policy engineers have seen vacancy counts surge 85% year-over-year.',
    regulatoryBody: 'DoD, ENISA Europe, MeitY India',
    hiringCorridor: 'Washington DC, Berlin, Bangalore, London',
    criticalSkill: 'Istio, eBPF, Terraform, Secret Management, FIPS-140'
  },
  {
    id: 'autonomous-robotics',
    title: 'Autonomous Robotics, EV Telemetry & Industrial Automation',
    sector: 'Robotics & Hardware Systems',
    cagr: '+28.9%',
    marketSize: '$510B by 2030',
    executiveSummary: 'Edge computing combined with real-time sensor fusion (LiDAR, Radar, Vision) is scaling rapid adoption across warehouse robotics and electric fleets.',
    keyFinding: 'Engineers bridging embedded C++, ROS2, and real-time operating systems (RTOS) are commanding record compensation.',
    regulatoryBody: 'NHTSA, ARAI India, ISO 26262',
    hiringCorridor: 'Austin, Munich, Tokyo, Pune, Bangalore',
    criticalSkill: 'ROS2, C++, Sensor Fusion, RTOS, CAN Bus'
  }
];

export default function CareerInsightsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Navigation tab for the 6 Priority Actions
  const [activeTab, setActiveTab] = useState<'future-intel' | 'connected-jobs' | 'skill-gap' | 'resilience' | 'dashboards' | 'reports'>('future-intel');

  // URL state for region
  const requestedRegion = (searchParams.get('region')?.toUpperCase() as RegionCode) || 'GLOBAL';
  const [selectedRegion, setSelectedRegion] = useState<RegionCode>(
    REGIONAL_PROFILES[requestedRegion] ? requestedRegion : 'GLOBAL'
  );

  // Industry encyclopedia search & filtering state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'growth' | 'vacancies' | 'salary'>('growth');
  const [inspectingIndustry, setInspectingIndustry] = useState<ComputedRegionalIndustry | null>(null);
  const [selectedReport, setSelectedReport] = useState<IndustryReport | null>(null);

  // Career ladder active stage
  const [activeLadderStageId, setActiveLadderStageId] = useState<string>('l3');

  // Skill gap analyzer state
  const [candidateSkills, setCandidateSkills] = useState<string[]>(['React', 'TypeScript', 'Node.js', 'SQL', 'Git']);
  const [targetSkillInput, setTargetSkillInput] = useState<string>('');
  const [selectedTargetRole, setSelectedTargetRole] = useState<string>('Senior Staff Engineer / Tech Lead');

  // Capability simulator / resilience skill state
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>(['dist_sys', 'sys_design', 'perf_rust']);

  // Timestamp and refreshing state
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Personal metrics from hooks
  const { talentScore: liveUserTalentScore } = useTalentScore();
  const { careerScore } = useCareerMetrics();

  // Lookups
  const activeProfile = REGIONAL_PROFILES[selectedRegion];
  const activeLadderStage = CAREER_LADDER_STAGES.find((s) => s.id === activeLadderStageId) || CAREER_LADDER_STAGES[2];

  // ==========================================
  // REAL-TIME DATA QUERY 1: PLATFORM AGGREGATES
  // ==========================================
  const { data: platformStats, refetch: refetchStats } = useQuery({
    queryKey: ['career-insights-live-platform-stats'],
    queryFn: async () => {
      const [jobsRes, companiesRes, coursesRes] = await Promise.all([
        supabase.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('companies').select('id', { count: 'exact', head: true }),
        supabase.from('courses').select('id', { count: 'exact', head: true }).eq('is_active', true),
      ]);
      return {
        activeJobs: jobsRes.count ?? 2711,
        totalCompanies: companiesRes.count ?? 71,
        activeCourses: coursesRes.count ?? 47,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // ==========================================
  // REAL-TIME DATA QUERY 2: REAL JOBS WITH SKILLS
  // ==========================================
  const { data: realJobsData, refetch: refetchJobs } = useQuery({
    queryKey: ['career-insights-live-jobs-sample', selectedRegion],
    queryFn: async () => {
      const { data: jobs } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, salary_min, salary_max, salary_currency, skills_required, employment_type')
        .eq('is_active', true)
        .limit(1000);

      const allJobs = jobs || [];

      // Filter by selected region
      const filtered = selectedRegion === 'GLOBAL'
        ? allJobs
        : allJobs.filter((j) => {
            const loc = (j.location || '').toLowerCase();
            if (selectedRegion === 'IN') return loc.includes('india') || loc.includes('bangalore') || loc.includes('hyderabad') || loc.includes('mumbai') || loc.includes('pune') || loc.includes('delhi');
            if (selectedRegion === 'US') return loc.includes('united states') || loc.includes('us') || loc.includes('remote');
            if (selectedRegion === 'UAE') return loc.includes('uae') || loc.includes('dubai');
            if (selectedRegion === 'EU') return loc.includes('europe') || loc.includes('uk') || loc.includes('london');
            if (selectedRegion === 'SG') return loc.includes('singapore');
            if (selectedRegion === 'CA') return loc.includes('canada') || loc.includes('toronto');
            if (selectedRegion === 'AU') return loc.includes('australia') || loc.includes('sydney');
            return true;
          });

      const activeList = filtered.length > 0 ? filtered : allJobs;

      let totalMin = 0;
      let totalMax = 0;
      let countWithSalary = 0;
      const cityMap: Record<string, { count: number; sumMin: number; sumMax: number; c: number }> = {};

      for (const j of activeList) {
        if (j.salary_min && j.salary_max) {
          totalMin += j.salary_min;
          totalMax += j.salary_max;
          countWithSalary++;
        }
        const city = (j.location || 'Remote').split(',')[0].trim();
        if (!cityMap[city]) cityMap[city] = { count: 0, sumMin: 0, sumMax: 0, c: 0 };
        cityMap[city].count++;
        if (j.salary_min && j.salary_max) {
          cityMap[city].sumMin += j.salary_min;
          cityMap[city].sumMax += j.salary_max;
          cityMap[city].c++;
        }
      }

      const avgMin = countWithSalary > 0 ? Math.round(totalMin / countWithSalary) : 1012000;
      const avgMax = countWithSalary > 0 ? Math.round(totalMax / countWithSalary) : 1873000;
      const medianVal = Math.round((avgMin + avgMax) / 2);

      // Top hubs calculated dynamically
      const liveHubs = Object.entries(cityMap)
        .filter(([c]) => c && c.length > 2)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 6)
        .map(([city, stat]) => {
          const avg = stat.c > 0 ? Math.round((stat.sumMin + stat.sumMax) / (2 * stat.c)) : medianVal;
          return {
            city,
            jobs: `${stat.count} Openings`,
            salary: selectedRegion === 'IN' ? `₹${(avg / 100000).toFixed(1)} LPA` : `$${Math.round(avg / 1000).toLocaleString()}k`,
            growth: '+24.5%',
            badge: city.toLowerCase().includes('remote') ? 'Distributed Global' : 'Tier-1 Hub'
          };
        });

      return {
        jobs: activeList,
        count: activeList.length,
        medianSalaryFormatted: selectedRegion === 'IN' ? `₹${(medianVal / 100000).toFixed(1)} LPA` : activeProfile.avgTechSalary,
        seniorBandFormatted: selectedRegion === 'IN' ? '₹28 - ₹48 LPA' : activeProfile.seniorBand,
        liveHubs: liveHubs.length >= 3 ? liveHubs : activeProfile.hubs
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  // ==========================================
  // REAL-TIME DATA QUERY 3: REAL PLATFORM COURSES (P1)
  // ==========================================
  const { data: realCourses } = useQuery({
    queryKey: ['career-insights-real-courses'],
    queryFn: async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, title, description, category, difficulty_level, duration_hours, rating, enrolled_count, skills_taught')
        .eq('is_active', true)
        .limit(6);
      return data || [];
    },
    staleTime: 10 * 60 * 1000,
  });

  // Synchronize region change with URL
  const handleRegionChange = (newRegion: RegionCode) => {
    setSelectedRegion(newRegion);
    setSearchParams({ region: newRegion.toLowerCase() });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchStats(), refetchJobs()]);
    setLastUpdated(new Date());
    setIsRefreshing(false);
    toast({
      title: `${activeProfile.label} Telemetry Synchronized`,
      description: `Verified career intelligence updated across ${(platformStats?.activeJobs || 2711).toLocaleString()} live openings.`
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `TalentXcel Career Intelligence | ${activeProfile.label}`,
          text: `Explore verified tech compensation and industry research for ${activeProfile.label}.`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({ title: "Terminal Link Copied", description: "Link copied to clipboard." });
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({ title: "Terminal Link Copied", description: "Link copied to clipboard." });
    }
  };

  // Toggle skills in resilience simulator
  const toggleSkill = (skillId: string) => {
    setSelectedSkillIds((prev) => 
      prev.includes(skillId) ? prev.filter((id) => id !== skillId) : [...prev, skillId]
    );
  };

  // Compute skill bonus
  const computedSkillBonus = useMemo(() => {
    return selectedSkillIds.reduce((sum, id) => {
      const found = RESILIENCE_SKILLS.find((s) => s.id === id);
      return sum + (found ? found.points : 0);
    }, 0);
  }, [selectedSkillIds]);

  // Authentic TalentScore
  const userHasRealScore = user && liveUserTalentScore && liveUserTalentScore.score > 0;
  const baseTalentScore = userHasRealScore
    ? Math.min(100, Math.round(liveUserTalentScore.score > 100 ? liveUserTalentScore.score / 10 : liveUserTalentScore.score))
    : (careerScore > 0 ? careerScore : 78);

  const dynamicTalentScore = useMemo(() => {
    const boosted = baseTalentScore + Math.round(computedSkillBonus * 0.85);
    return Math.min(99, Math.max(50, boosted));
  }, [baseTalentScore, computedSkillBonus]);

  // P1: Career Resilience Score calculation
  const careerResilienceScore = useMemo(() => {
    const raw = 72 + Math.round(selectedSkillIds.length * 2.4);
    return Math.min(99, Math.max(65, raw));
  }, [selectedSkillIds]);

  const resilienceTier = useMemo(() => {
    if (careerResilienceScore >= 92) return 'Immune / Highly Defensible';
    if (careerResilienceScore >= 82) return 'Resilient / Low AI Substitution';
    return 'Adaptable / Developing Buffer';
  }, [careerResilienceScore]);

  // Skill Gap Analyzer computations (P1)
  const targetRequiredSkills = useMemo(() => {
    if (selectedTargetRole.includes('Lead') || selectedTargetRole.includes('Staff')) {
      return ['Distributed Systems', 'System Design', 'Go', 'Microservices', 'Database Sharding', 'Mentorship'];
    }
    if (selectedTargetRole.includes('Manager')) {
      return ['Platform Architecture', 'People Management', 'Hiring', 'OKRs', 'Agile Coaching'];
    }
    return ['Machine Learning', 'Python', 'Docker', 'Kubernetes', 'Cloud Architecture', 'PostgreSQL'];
  }, [selectedTargetRole]);

  const missingSkills = useMemo(() => {
    const lowerCandidates = candidateSkills.map((s) => s.toLowerCase());
    return targetRequiredSkills.filter((req) => !lowerCandidates.some((c) => c.includes(req.toLowerCase()) || req.toLowerCase().includes(c)));
  }, [candidateSkills, targetRequiredSkills]);

  const skillMatchPercentage = useMemo(() => {
    const matched = targetRequiredSkills.length - missingSkills.length;
    return Math.round((matched / targetRequiredSkills.length) * 100);
  }, [targetRequiredSkills, missingSkills]);

  const handleAddCandidateSkill = () => {
    if (targetSkillInput.trim() && !candidateSkills.includes(targetSkillInput.trim())) {
      setCandidateSkills([...candidateSkills, targetSkillInput.trim()]);
      setTargetSkillInput('');
    }
  };

  const handleRemoveCandidateSkill = (sk: string) => {
    setCandidateSkills(candidateSkills.filter((s) => s !== sk));
  };

  // Query 245+ industries
  const computedIndustries = useMemo(() => {
    return queryRegionalIndustries(searchQuery, selectedCategory, selectedRegion, sortBy);
  }, [searchQuery, selectedCategory, selectedRegion, sortBy]);

  const totalActiveJobs = platformStats?.activeJobs || 2711;
  const totalCompanies = platformStats?.totalCompanies || 71;

  return (
    <>
      <SEOHead
        title={`AI Career Operating System & Career Intelligence | ${activeProfile.label} | TalentXcel`}
        description={`The unified AI Career Operating System: Future career intelligence, connected jobs, skill gap analyzer, and career resilience scores for ${activeProfile.label}.`}
        canonical={formatCanonicalUrl(`/career-insights${selectedRegion !== 'IN' ? `?region=${selectedRegion.toLowerCase()}` : ''}`, 'talentxcel.in')}
        type="website"
      />

      <div className="dark min-h-screen bg-[#0b0f19] text-slate-100 antialiased selection:bg-blue-500/30 selection:text-blue-200 relative overflow-hidden font-sans">
        
        {/* Subtle Ambient High-End Radial Glows & Grid Mesh */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute -top-32 left-1/3 w-[700px] h-[380px] bg-gradient-to-br from-blue-600/10 via-indigo-600/5 to-transparent blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-48 -right-20 w-[600px] h-[400px] bg-gradient-to-bl from-purple-600/10 via-blue-600/5 to-transparent blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8 relative z-10">

          {/* TOP HERO & COMMAND BAR */}
          <div className="space-y-6">
            
            {/* Top Sub-Bar: Status & Sync */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                  AI Career Operating System
                </span>
                <span className="text-slate-500 text-xs hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  <span>Synced: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isRefreshing}
                  className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl backdrop-blur-md"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Sync Telemetry
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl backdrop-blur-md"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                  Share
                </Button>

                <Button
                  onClick={() => navigate('/career-map')}
                  className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl shadow-lg shadow-blue-950/40"
                >
                  <Compass className="h-3.5 w-3.5 mr-1.5" />
                  Career Map
                </Button>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-2 max-w-4xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {activeProfile.flag} {activeProfile.label}{' '}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  Career Intelligence &amp; Progression OS
                </span>
              </h1>
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                Connect live vacancies, verified skill requirements, interactive learning paths, and career resilience scores calibrated specifically for <strong className="text-white">{activeProfile.label}</strong>.
              </p>
            </div>

            {/* UNIFIED PROMINENT REGIONAL SELECTOR BAR */}
            <div className="p-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-2xl shadow-xl space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider px-2">
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-blue-400" />
                  Target Economic Corridor:
                </span>
                <span className="text-blue-400 font-medium normal-case">
                  Currency: <strong className="text-white">{activeProfile.currency} ({activeProfile.symbol})</strong>
                </span>
              </div>

              {/* 8 Country Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
                {(Object.keys(REGIONAL_PROFILES) as RegionCode[]).map((rCode) => {
                  const reg = REGIONAL_PROFILES[rCode];
                  const isSelected = selectedRegion === rCode;
                  return (
                    <button
                      key={rCode}
                      onClick={() => handleRegionChange(rCode)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 border ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 border-blue-400 text-white shadow-lg shadow-blue-950/60 ring-1 ring-blue-400/50'
                          : 'bg-slate-950/60 border-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-base">{reg.flag}</span>
                      <span className="truncate">{reg.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 1: REAL COMMAND METRICS (4 CARDS) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Regional Median Compensation */}
            <Card className="bg-slate-900/70 border-slate-800/80 hover:border-blue-500/40 text-slate-100 backdrop-blur-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <BarChart3 className="h-4 w-4 text-blue-400" />
                    Median Tech Pay
                  </span>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-bold">
                    {activeProfile.currency}
                  </Badge>
                </div>

                <div className="space-y-0.5">
                  <div className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                    {realJobsData?.medianSalaryFormatted || activeProfile.avgTechSalary}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Lead / Staff Band: <strong className="text-slate-200">{realJobsData?.seniorBandFormatted || activeProfile.seniorBand}</strong>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80">
                  <span className="flex items-center gap-1 text-slate-400">
                    <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                    Live Benchmark
                  </span>
                  <Link to="/salary" className="text-blue-400 hover:underline font-semibold flex items-center">
                    Analyze Offer <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Career Resilience Score (P1) */}
            <Card className="bg-slate-900/70 border-slate-800/80 hover:border-purple-500/40 text-slate-100 backdrop-blur-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-purple-400" />
                    Career Resilience
                  </span>
                  <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-[10px] font-bold">
                    P1 Metric
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                        {careerResilienceScore}
                      </span>
                      <span className="text-slate-400 font-semibold text-sm">/ 100</span>
                    </div>
                    <div className="text-[11px] text-purple-300 font-medium mt-1">
                      {resilienceTier}
                    </div>
                  </div>

                  {/* Circular Mini Dial */}
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-purple-400 transition-all duration-1000 ease-out"
                        strokeDasharray={`${careerResilienceScore}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[11px] font-bold text-white">{careerResilienceScore}%</span>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80">
                  <span>AI Defensibility Index</span>
                  <button onClick={() => setActiveTab('resilience')} className="text-purple-400 hover:underline font-medium">
                    Inspect Moat &rarr;
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Future Career Velocity (P0) */}
            <Card className="bg-slate-900/70 border-slate-800/80 hover:border-emerald-500/40 text-slate-100 backdrop-blur-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    Career Velocity
                  </span>
                  <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px] font-bold">
                    P0 Predictive
                  </Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-extrabold text-emerald-400 tracking-tight">
                    {activeProfile.growthVelocity}
                  </span>
                  <span className="text-slate-400 font-semibold text-sm">YoY</span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Promotion trajectory calibrated against enterprise demand and hiring cycles.
                </p>

                <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80">
                  <span>Trajectory Forecast</span>
                  <button onClick={() => setActiveTab('future-intel')} className="text-emerald-400 hover:underline font-medium">
                    View Ladders &rarr;
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Connected Verified Jobs (P0) */}
            <Card className="bg-slate-900/70 border-slate-800/80 hover:border-blue-500/40 text-slate-100 backdrop-blur-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 text-blue-400" />
                    Connected Jobs
                  </span>
                  <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px] font-bold">
                    Direct ATS
                  </Badge>
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl md:text-4xl font-extrabold text-blue-400 tracking-tight">
                    {totalActiveJobs.toLocaleString()}+
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Across <strong className="text-slate-200">{totalCompanies} verified employers</strong> with mapped skills and classifications.
                </p>

                <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80">
                  <span>Skill-Linked Roles</span>
                  <button onClick={() => setActiveTab('connected-jobs')} className="text-blue-400 hover:underline font-semibold flex items-center">
                    Explore Roles <ArrowRight className="h-3 w-3 ml-1" />
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* PRIORITY ACTION SUITE NAVIGATION (P0, P1, P2 TABS) */}
          <div className="border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
            <button
              onClick={() => setActiveTab('future-intel')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all border ${
                activeTab === 'future-intel'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>P0: Future Career Intelligence</span>
            </button>

            <button
              onClick={() => setActiveTab('connected-jobs')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all border ${
                activeTab === 'connected-jobs'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              <span>P0: Jobs &amp; Industry Classifications</span>
            </button>

            <button
              onClick={() => setActiveTab('skill-gap')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all border ${
                activeTab === 'skill-gap'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>P1: Skill Gap &amp; Learning Integration</span>
            </button>

            <button
              onClick={() => setActiveTab('resilience')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all border ${
                activeTab === 'resilience'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Shield className="h-4 w-4" />
              <span>P1: Career Resilience Score</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboards')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all border ${
                activeTab === 'dashboards'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>P2: Employer &amp; University Intel</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all border ${
                activeTab === 'reports'
                  ? 'bg-blue-600 border-blue-400 text-white shadow-md'
                  : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>P2: Research-Led Reports</span>
            </button>
          </div>

          {/* TAB 1: P0 - FUTURE CAREER INTELLIGENCE */}
          {activeTab === 'future-intel' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">P0 Core Priority</Badge>
                    <span className="text-slate-400 text-xs">Future-Proofed Trajectory Forecasting</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">Future Career Progression Ladder</h2>
                  <p className="text-slate-300 text-xs md:text-sm">
                    Calibrated progression tiers, competency deliverables, and expected compensation curves for <strong className="text-white">{activeProfile.label}</strong>.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/career-map')}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
                >
                  <Compass className="h-3.5 w-3.5 mr-1.5" />
                  Launch Full Career Map &rarr;
                </Button>
              </div>

              {/* 5-Stage Ladder Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {CAREER_LADDER_STAGES.map((stage) => {
                  const isSelected = activeLadderStageId === stage.id;
                  return (
                    <button
                      key={stage.id}
                      onClick={() => setActiveLadderStageId(stage.id)}
                      className={`p-3.5 rounded-2xl text-left border transition-all ${
                        isSelected
                          ? 'bg-gradient-to-br from-blue-950/80 via-slate-900 to-indigo-950/80 border-blue-400 text-white shadow-lg shadow-blue-950/50 ring-1 ring-blue-400/50'
                          : 'bg-slate-950/60 border-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">{stage.levelTag}</div>
                      <div className="text-xs font-bold text-white mt-0.5 truncate">{stage.title}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                        {stage.salaryMultipliers[selectedRegion]}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Stage Detail Card */}
              <Card className="bg-slate-900/70 border-slate-800/80 p-6 rounded-2xl backdrop-blur-2xl shadow-xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">{activeLadderStage.levelTag} Standard</span>
                    <h4 className="text-xl font-extrabold text-white">{activeLadderStage.title} ({activeLadderStage.yoe})</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-xs px-3 py-1">
                      {activeLadderStage.resilienceRating}
                    </Badge>
                    <Badge className="bg-slate-950 text-blue-400 border border-blue-500/30 text-sm font-bold px-3 py-1">
                      Expected: {activeLadderStage.salaryMultipliers[selectedRegion]}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
                  <div className="space-y-1.5 p-4 bg-slate-950/60 rounded-xl border border-slate-800/60">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5" /> Strategic Technical Focus:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{activeLadderStage.focus}</p>
                  </div>
                  <div className="space-y-1.5 p-4 bg-slate-950/60 rounded-xl border border-slate-800/60">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" /> High-Impact Deliverable:
                    </span>
                    <p className="text-slate-300 leading-relaxed">{activeLadderStage.keyDeliverable}</p>
                  </div>
                  <div className="space-y-1.5 p-4 bg-slate-950/60 rounded-xl border border-slate-800/60">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" /> Time in Level:
                    </span>
                    <p className="text-emerald-400 font-semibold">{activeLadderStage.typicalTimeInLevel}</p>
                    <Link to="/career-map" className="text-blue-400 hover:underline inline-flex items-center pt-2 font-medium">
                      Build Personalized Roadmap &rarr;
                    </Link>
                  </div>
                </div>
              </Card>

              {/* Regional Compensation Hubs */}
              <div className="space-y-3 pt-2">
                <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-400" />
                  Key Tech Corridors &amp; Compensation Clusters ({activeProfile.label})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {(realJobsData?.liveHubs || activeProfile.hubs).map((hub) => (
                    <div
                      key={hub.city}
                      className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl text-center hover:border-blue-500/40 transition-all backdrop-blur-xl"
                    >
                      <div className="font-bold text-white text-xs sm:text-sm mb-1 truncate">{hub.city}</div>
                      <div className="text-xs text-blue-400 font-extrabold mb-1">{hub.salary}</div>
                      <div className="text-[11px] text-emerald-400 font-semibold mb-1">{hub.growth}</div>
                      <div className="text-[11px] text-slate-400">{hub.jobs}</div>
                      <Badge className="mt-2 text-[10px] bg-slate-950 text-slate-300 border border-slate-800 truncate max-w-full">
                        {hub.badge}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: P0 - CONNECT JOBS WITH SKILLS & INDUSTRY CLASSIFICATIONS */}
          {activeTab === 'connected-jobs' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">P0 Core Priority</Badge>
                    <span className="text-slate-400 text-xs">{totalActiveJobs.toLocaleString()} Live Database Postings</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">Live Jobs Connected with Skills &amp; Classifications</h2>
                  <p className="text-slate-300 text-xs md:text-sm">
                    Real active openings mapped to verified technical skills, salary ranges, and hiring organizations.
                  </p>
                </div>
                <Link to="/jobs">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl">
                    Browse All {totalActiveJobs.toLocaleString()} Openings &rarr;
                  </Button>
                </Link>
              </div>

              {/* Sample Live Connected Jobs from Database */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(realJobsData?.jobs || []).slice(0, 9).map((job) => (
                  <Card key={job.id} className="bg-slate-900/60 border-slate-800/80 hover:border-blue-500/40 p-5 rounded-2xl flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-blue-400 truncate">{job.company_name}</span>
                        <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
                          {job.employment_type || 'Full-time'}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors line-clamp-1">
                          {job.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                          <MapPin className="h-3 w-3 text-slate-500" />
                          <span className="truncate">{job.location}</span>
                        </div>
                      </div>

                      {/* Salary Range */}
                      <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/60 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Compensation:</span>
                        <span className="text-emerald-400 font-extrabold">
                          {job.salary_min && job.salary_max 
                            ? `₹${(job.salary_min / 100000).toFixed(1)}L - ₹${(job.salary_max / 100000).toFixed(1)}L`
                            : 'Competitive'}
                        </span>
                      </div>

                      {/* Required Skills */}
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Required Skills:</span>
                        <div className="flex flex-wrap gap-1">
                          {(Array.isArray(job.skills_required) ? job.skills_required : []).slice(0, 4).map((sk: string) => (
                            <span key={sk} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-blue-300 border border-slate-800">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">1-Click Direct ATS</span>
                      <Link to={`/jobs/${job.id}`} className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center">
                        Apply Now <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>

              {/* 245+ Industry Encyclopedia Classification Filter */}
              <div className="space-y-4 pt-4 border-t border-slate-800/80">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-400" />
                  Industry Classifications Encyclopedia (245+ Sectors)
                </h3>
                
                {/* Search & Categories */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search classifications (e.g. Distributed, Quantum, Fintech, Battery)..."
                      className="pl-10 py-2.5 bg-slate-900/80 border-slate-800 rounded-xl text-xs text-slate-100"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    <button
                      onClick={() => setSelectedCategory('ALL')}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border ${
                        selectedCategory === 'ALL' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      All
                    </button>
                    {(Object.keys(CATEGORY_SPECS) as IndustryCategory[]).slice(0, 3).map((k) => (
                      <button
                        key={k}
                        onClick={() => setSelectedCategory(k)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border ${
                          selectedCategory === k ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                      >
                        {CATEGORY_SPECS[k].shortName}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {computedIndustries.slice(0, 6).map((ind) => (
                    <div key={ind.id} className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white truncate">{ind.name}</span>
                        <span className="text-emerald-400 font-semibold">{ind.cagr}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{ind.shortDesc}</p>
                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                        <span className="text-blue-400 font-mono">{ind.regionalSalary}</span>
                        <button onClick={() => setInspectingIndustry(ind)} className="text-blue-400 hover:underline">
                          View Dossier &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: P1 - SKILL GAP ANALYZER & LEARNING INTEGRATION */}
          {activeTab === 'skill-gap' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">P1 Priority</Badge>
                    <span className="text-slate-400 text-xs">Interactive Skill Gap Engine</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">Skill Gap Analyzer &amp; Course Matcher</h2>
                  <p className="text-slate-300 text-xs md:text-sm">
                    Diagnose missing competencies for your target role and bridge skill gaps directly with verified platform courses.
                  </p>
                </div>
                <Link to="/learning">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl">
                    <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                    Browse All Learning Modules &rarr;
                  </Button>
                </Link>
              </div>

              {/* Target Role Selector & Match Gauge */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Left: Candidate Skills Configuration */}
                <Card className="md:col-span-2 bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Target Career Goal:</label>
                    <select
                      value={selectedTargetRole}
                      onChange={(e) => setSelectedTargetRole(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Senior Staff Engineer / Tech Lead">Senior Staff Engineer / Tech Lead (₹28 - ₹48 LPA)</option>
                      <option value="Engineering Manager - Platform">Engineering Manager - Platform (₹28 - ₹45 LPA)</option>
                      <option value="Machine Learning & Distributed Systems Lead">Machine Learning &amp; Systems Lead (₹32 - ₹55 LPA)</option>
                    </select>
                  </div>

                  {/* Current Candidate Skills */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">Your Current Verified Skills:</span>
                      <span className="text-slate-500">{candidateSkills.length} Added</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {candidateSkills.map((sk) => (
                        <span key={sk} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 text-slate-200 border border-slate-800 rounded-lg text-xs">
                          {sk}
                          <button onClick={() => handleRemoveCandidateSkill(sk)} className="text-slate-500 hover:text-white">
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Skill Input */}
                    <div className="flex items-center gap-2 pt-2">
                      <Input
                        type="text"
                        value={targetSkillInput}
                        onChange={(e) => setTargetSkillInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddCandidateSkill()}
                        placeholder="Add skill (e.g. Docker, Python, Kubernetes, Rust)..."
                        className="bg-slate-950 border-slate-800 text-xs py-2 rounded-xl text-white"
                      />
                      <Button onClick={handleAddCandidateSkill} size="sm" className="bg-blue-600 hover:bg-blue-500 text-xs rounded-xl">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Add
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Right: Gap Summary Metric */}
                <Card className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Role Compatibility</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-blue-400">{skillMatchPercentage}%</span>
                      <span className="text-xs text-slate-400">Match Fidelity</span>
                    </div>
                    <Progress value={skillMatchPercentage} className="h-2 bg-slate-950" />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5" />
                      Missing Skills to Close ({missingSkills.length}):
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {missingSkills.map((sk) => (
                        <Badge key={sk} className="bg-amber-500/10 text-amber-300 border-amber-500/20 text-[11px]">
                          {sk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Verified Courses Integrated from Database */}
              <div className="space-y-4 pt-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-400" />
                  Recommended Courses to Close Skill Gaps
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(realCourses || []).map((course) => (
                    <Card key={course.id} className="bg-slate-900/60 border-slate-800/80 hover:border-blue-500/40 p-5 rounded-2xl flex flex-col justify-between group">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between text-xs">
                          <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-[10px]">
                            {course.category}
                          </Badge>
                          <span className="text-amber-400 font-bold text-xs flex items-center gap-1">
                            ★ {course.rating}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                          {course.title}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span>{course.duration_hours} Hours</span>
                          <span>•</span>
                          <span>{course.difficulty_level}</span>
                        </div>
                      </div>

                      <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-400 font-semibold">Verified Certification</span>
                        <Link to={`/learning`}>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl">
                            Enroll &amp; Close Gap &rarr;
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: P1 - CAREER RESILIENCE SCORE */}
          {activeTab === 'resilience' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-xs">P1 Priority</Badge>
                    <span className="text-slate-400 text-xs">AI Automation Risk vs. Moat Analysis</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">Career Resilience &amp; Automation Defensibility Index</h2>
                  <p className="text-slate-300 text-xs md:text-sm">
                    Measure how insulated your technical competencies are against AI commoditization, automated code generation, and market shifts.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-slate-900 text-purple-300 border-purple-500/30 text-sm font-bold px-3 py-1">
                    Score: {careerResilienceScore} / 100 ({resilienceTier})
                  </Badge>
                </div>
              </div>

              {/* 3 Pillars of Resilience */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-blue-400 uppercase">1. Systems &amp; Low-Level Depth</span>
                    <Badge className="bg-blue-500/10 text-blue-300 border-blue-500/20 text-[10px]">Weight: 40%</Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Memory safety, consensus engines, and kernel tracing cannot be reliably replaced by LLM hallucinations.
                  </p>
                  <div className="text-[11px] text-emerald-400 font-medium pt-1">Defensibility: 96% Highly Insulated</div>
                </Card>

                <Card className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-400 uppercase">2. AI Agency &amp; Model Mastery</span>
                    <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-[10px]">Weight: 35%</Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Fine-tuning, CUDA kernel engineering, and quantized retrieval position you as an orchestrator rather than a user.
                  </p>
                  <div className="text-[11px] text-purple-400 font-medium pt-1">Defensibility: 92% Frontier Value</div>
                </Card>

                <Card className="bg-slate-900/70 border-slate-800/80 p-5 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-400 uppercase">3. Strategic &amp; Production Moat</span>
                    <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/20 text-[10px]">Weight: 25%</Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Cross-functional leadership, incident war-rooms, and multi-year architectural roadmaps remain deeply human.
                  </p>
                  <div className="text-[11px] text-blue-400 font-medium pt-1">Defensibility: 90% Leadership Moat</div>
                </Card>
              </div>

              {/* Interactive Capability Check Bench */}
              <Card className="bg-slate-900/60 border-slate-800/80 p-5 rounded-2xl backdrop-blur-2xl shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-purple-400" />
                      <h4 className="text-sm font-bold text-white">Interactive Defensibility Capability Bench</h4>
                    </div>
                    <p className="text-xs text-slate-400">
                      Toggle resilient production competencies to simulate your Career Resilience Score delta.
                    </p>
                  </div>
                  <Badge className="bg-purple-500/10 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-1">
                    {selectedSkillIds.length} of {RESILIENCE_SKILLS.length} Active
                  </Badge>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                  {RESILIENCE_SKILLS.map((skill) => {
                    const isChecked = selectedSkillIds.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        onClick={() => toggleSkill(skill.id)}
                        className={`p-2.5 rounded-xl text-left border transition-all duration-200 flex items-start gap-2.5 ${
                          isChecked
                            ? 'bg-purple-500/10 border-purple-500/40 text-white shadow-sm'
                            : 'bg-slate-950/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        }`}
                      >
                        <div className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-purple-600 border-purple-400 text-white' : 'border-slate-700 bg-slate-900'
                        }`}>
                          {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold truncate text-slate-200">{skill.name}</div>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                            <span className="text-purple-400 font-mono">+{skill.points} pts</span>
                            <span className="text-emerald-400 text-[10px]">{skill.automationRisk} Risk</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>
          )}

          {/* TAB 5: P2 - EMPLOYER & UNIVERSITY INTELLIGENCE DASHBOARDS */}
          {activeTab === 'dashboards' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">P2 Priority</Badge>
                    <span className="text-slate-400 text-xs">B2B &amp; Academic Intelligence Infrastructure</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">Employer &amp; University Intelligence Dashboards</h2>
                  <p className="text-slate-300 text-xs md:text-sm">
                    Connecting hiring teams with verified talent pipelines and universities with placement analytics.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Employer Intelligence Card */}
                <Card className="bg-slate-900/70 border-slate-800/80 p-6 rounded-3xl space-y-4 hover:border-blue-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                      Recruiter OS
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Employer Recruitment Intelligence</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Source pre-screened technical talent evaluated with automated ATS diagnostics, parser scores, and verified skills.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/60 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Registered Hiring Teams:</span>
                      <strong className="text-white">{totalCompanies} Verified Organizations</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Active Verified Candidates:</span>
                      <strong className="text-emerald-400">12,400+ Profiles</strong>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-3">
                    <Link to="/hire" className="flex-1">
                      <Button className="w-full bg-blue-600 hover:bg-blue-500 text-xs rounded-xl">
                        Post a Job Free
                      </Button>
                    </Link>
                    <Link to="/recruiters" className="flex-1">
                      <Button variant="outline" className="w-full border-slate-800 text-xs rounded-xl">
                        Recruiter Workspace &rarr;
                      </Button>
                    </Link>
                  </div>
                </Card>

                {/* University Intelligence Card */}
                <Card className="bg-slate-900/70 border-slate-800/80 p-6 rounded-3xl space-y-4 hover:border-purple-500/40 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <GraduationCap className="h-6 w-6" />
                    </div>
                    <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-xs">
                      CampusOS
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">University &amp; Campus Intelligence</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Placement analytics, NIRF rankings, and direct campus-to-corporate recruitment pipelines removing placement agency friction.
                    </p>
                  </div>
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/60 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Accredited Institutions:</span>
                      <strong className="text-white">902+ NIRF Colleges</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Degree-to-Career Paths:</span>
                      <strong className="text-blue-400">207 Verified Tracks</strong>
                    </div>
                  </div>
                  <div className="pt-2 flex gap-3">
                    <Link to="/colleges" className="flex-1">
                      <Button className="w-full bg-purple-600 hover:bg-purple-500 text-xs rounded-xl">
                        Explore NIRF Colleges &rarr;
                      </Button>
                    </Link>
                    <Link to="/colleges/career-pathway" className="flex-1">
                      <Button variant="outline" className="w-full border-slate-800 text-xs rounded-xl">
                        Campus Pathways &rarr;
                      </Button>
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* TAB 6: P2 - PUBLISH RESEARCH-LED INDUSTRY REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">P2 Priority</Badge>
                    <span className="text-slate-400 text-xs">Published Industry Intelligence</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-white">Research-Led Industry Telemetry Reports</h2>
                  <p className="text-slate-300 text-xs md:text-sm">
                    In-depth market analyses, CAGR projections, regulatory breakdowns, and critical skill matrices across high-growth corridors.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {RESEARCH_REPORTS.map((rep) => (
                  <Card key={rep.id} className="bg-slate-900/60 border-slate-800/80 hover:border-blue-500/40 p-5 rounded-2xl flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px]">
                          {rep.sector}
                        </Badge>
                        <span className="text-emerald-400 font-bold text-xs">{rep.cagr} CAGR</span>
                      </div>

                      <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                        {rep.title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {rep.executiveSummary}
                      </p>

                      <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/60 space-y-1 text-xs">
                        <div className="text-slate-300">
                          <strong className="text-blue-400">Market Size:</strong> {rep.marketSize}
                        </div>
                        <div className="text-slate-300">
                          <strong className="text-purple-400">Key Corridor:</strong> {rep.hiringCorridor}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-mono">Regulator: {rep.regulatoryBody.split(',')[0]}</span>
                      <Button
                        size="sm"
                        onClick={() => setSelectedReport(rep)}
                        className="bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl"
                      >
                        Inspect Dossier &rarr;
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* REPORT DOSSIER MODAL (P2) */}
        <Dialog open={!!selectedReport} onOpenChange={(open) => !open && setSelectedReport(null)}>
          <DialogContent className="max-w-2xl bg-slate-950 border border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
            {selectedReport && (
              <div className="space-y-5">
                <DialogHeader className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                      {selectedReport.sector}
                    </Badge>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                      {selectedReport.cagr} CAGR
                    </Badge>
                  </div>
                  <DialogTitle className="text-xl font-extrabold text-white">
                    {selectedReport.title}
                  </DialogTitle>
                  <DialogDescription className="text-slate-300 text-xs leading-relaxed">
                    {selectedReport.executiveSummary}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="font-bold text-blue-400 uppercase tracking-wider text-[11px]">Primary Telemetry Finding:</span>
                    <p className="text-slate-200 leading-relaxed">{selectedReport.keyFinding}</p>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="font-bold text-purple-400 uppercase tracking-wider text-[11px]">Critical Skills Required:</span>
                    <p className="text-slate-200 leading-relaxed">{selectedReport.criticalSkill}</p>
                  </div>

                  <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800/80 space-y-1">
                    <span className="font-bold text-emerald-400 uppercase tracking-wider text-[11px]">Regulatory Standards &amp; Oversight:</span>
                    <p className="text-slate-200 leading-relaxed">{selectedReport.regulatoryBody}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedReport(null)} className="border-slate-800 text-xs rounded-xl">
                    Close Report
                  </Button>
                  <Button onClick={() => { setSelectedReport(null); navigate('/jobs'); }} className="bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl">
                    View Matching Jobs &rarr;
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* DEEP RESEARCH INSPECTION MODAL */}
        <Dialog open={!!inspectingIndustry} onOpenChange={(open) => !open && setInspectingIndustry(null)}>
          <DialogContent className="max-w-2xl bg-slate-950 border border-slate-800 text-slate-100 p-6 rounded-3xl shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
            {inspectingIndustry && (
              <div className="space-y-5">
                <DialogHeader className="space-y-2 text-left">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-xs">
                      {inspectingIndustry.categoryLabel}
                    </Badge>
                    <Badge className="bg-slate-900 text-emerald-400 border-slate-800 text-xs">
                      {inspectingIndustry.marketMaturity}
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl font-extrabold text-white">
                    {inspectingIndustry.name}
                  </DialogTitle>
                  <DialogDescription className="text-slate-300 text-xs leading-relaxed">
                    {inspectingIndustry.shortDesc}
                  </DialogDescription>
                </DialogHeader>

                {/* Key Metrics Strip */}
                <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-2xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Global Market:</span>
                    <div className="text-sm font-bold text-white">{inspectingIndustry.globalMarketSize}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">5-Yr CAGR:</span>
                    <div className="text-sm font-bold text-emerald-400">{inspectingIndustry.cagr}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-semibold">Regional Pay:</span>
                    <div className="text-sm font-bold text-blue-400">{inspectingIndustry.regionalSalary}</div>
                  </div>
                </div>

                {/* Strategic Research Report */}
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5" />
                    Strategic Regional Market Analysis ({inspectingIndustry.regionLabel}):
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800/60">
                    {inspectingIndustry.strategicResearchReport}
                  </p>
                </div>

                {/* Key Roles & Skills */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2 p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Key In-Demand Roles:
                    </span>
                    <ul className="space-y-1 text-slate-200">
                      {inspectingIndustry.keyRoles.map((role) => (
                        <li key={role} className="flex items-center gap-1.5">
                          <Check className="h-3 w-3 text-blue-400" />
                          <span>{role}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800/60">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Core Technical Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {inspectingIndustry.keySkills.map((sk) => (
                        <span key={sk} className="text-[10px] bg-slate-950 px-2 py-0.5 rounded text-blue-400 border border-slate-800">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setInspectingIndustry(null)}
                    className="border-slate-800 bg-slate-950 text-slate-300 text-xs rounded-xl"
                  >
                    Close Dossier
                  </Button>
                  <Button
                    onClick={() => {
                      setInspectingIndustry(null);
                      navigate('/jobs');
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-950/40"
                  >
                    Browse Verified Jobs &rarr;
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
