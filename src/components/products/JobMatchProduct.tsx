// src/components/products/JobMatchProduct.tsx
// Next-Generation Employment Platform for jobs.talentxcel.in (JobMatch OS)
// Master Light SaaS Design System matching user visual mockup perfectly
// Zero mock data • Direct Supabase integration • Complete user workflows

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Helmet } from 'react-helmet-async';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Globe,
  Flame,
  Plane,
  Cpu,
  ShoppingBag,
  Radio,
  Gamepad2,
  Tv,
  Database,
  Layers,
  Briefcase,
  Plus,
  X, 
  Search, 
  MapPin, 
  Building2, 
  ArrowRight, 
  Sparkles, 
  Bookmark, 
  CheckCircle2, 
  ExternalLink,
  Laptop,
  Coins,
  Megaphone,
  Cog,
  Heart,
  Star,
  SlidersHorizontal,
  GraduationCap,
  Clock,
  RotateCcw,
  ShieldCheck,
  Zap,
  Users,
  FileText,
  ChevronRight,
  ChevronDown,
  Bell,
  BarChart3,
  Target,
  ArrowUpRight,
  Compass,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { conversionTelemetry } from '@/utils/conversionTelemetry';
import { GuestJobApplyModal } from '@/components/jobs/GuestJobApplyModal';
import { toast } from 'sonner';

import { JobPortalHeader } from './jobmatch/JobPortalHeader';
import { JobDetailDrawer, JobDetailItem } from './jobmatch/JobDetailDrawer';
import { AIMatchWorkspace } from './jobmatch/AIMatchWorkspace';
import { CandidateApplicationTracker } from './jobmatch/CandidateApplicationTracker';
import { EmployerRequisitionWorkspace } from './jobmatch/EmployerRequisitionWorkspace';
import { RecruiterTalentSearch } from './jobmatch/RecruiterTalentSearch';
import { AIInterviewPrepCoach } from './jobmatch/AIInterviewPrepCoach';
import { JobPortalDiscoveryGrid } from './jobmatch/JobPortalDiscoveryGrid';
import { CareerResourcesSection } from './jobmatch/CareerResourcesSection';
import { JobPortalFooter } from './jobmatch/JobPortalFooter';
import { TalentSparkJobCard } from '@/components/jobs/TalentSparkJobCard';
import { ComprehensiveJobFilters } from '@/components/jobs/ComprehensiveJobFilters';
import { CompanyLogoAvatar } from './jobmatch/CompanyLogoAvatar';
import { PlatformEcosystemSidebar } from './jobmatch/PlatformEcosystemSidebar';

interface CategoryDef {
  id: string;
  name: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  bg: string;
  iconColor: string;
  keywords: string[];
}

export const GLOBAL_REGIONS = [
  { id: 'all', label: 'All Global Theaters', flag: '🌍', desc: 'Worldwide Network' },
  { id: 'india', label: 'India', flag: '🇮🇳', desc: 'Pan-India Tech & PSUs', keywords: ['india', 'bengaluru', 'mumbai', 'delhi', 'noida', 'gurugram', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad', 'jaipur', 'bhopal', 'indore', 'chandigarh'] },
  { id: 'middle-east', label: 'Middle East & GCC', flag: '🇦🇪', desc: 'Dubai, Riyadh & Doha', keywords: ['dubai', 'abu dhabi', 'riyadh', 'emirates', 'saudi', 'qatar', 'doha', 'gcc', 'oman', 'bahrain', 'kuwait', 'jeddah', 'manama', 'muscat', 'middle east'] },
  { id: 'africa', label: 'Africa', flag: '🇿🇦', desc: 'Lagos, Nairobi & Cape Town', keywords: ['nigeria', 'kenya', 'south africa', 'egypt', 'rwanda', 'ghana', 'morocco', 'lagos', 'nairobi', 'johannesburg', 'cape town', 'cairo', 'kigali', 'accra', 'casablanca', 'africa'] },
  { id: 'europe', label: 'Europe & UK', flag: '🇪🇺', desc: 'London, Berlin & Dublin', keywords: ['united kingdom', 'london', 'germany', 'berlin', 'amsterdam', 'netherlands', 'ireland', 'dublin', 'france', 'paris', 'switzerland', 'zurich', 'munich', 'brussels', 'sweden', 'stockholm', 'europe'] },
  { id: 'americas', label: 'Americas', flag: '🇺🇸', desc: 'USA & Canada Tech Hubs', keywords: ['united states', 'usa', 'new york', 'seattle', 'austin', 'san francisco', 'california', 'texas', 'canada', 'toronto', 'vancouver', 'atlanta', 'boston', 'chicago', 'washington', 'americas'] },
  { id: 'apac', label: 'Asia-Pacific', flag: '🌏', desc: 'Singapore, Tokyo & Sydney', keywords: ['singapore', 'australia', 'sydney', 'canberra', 'melbourne', 'japan', 'tokyo', 'apac'] },
  { id: 'remote', label: 'Worldwide Remote', flag: '🌐', desc: '100% Work from Anywhere', keywords: ['remote', 'worldwide', 'global', 'anywhere'] }
];

export const CATEGORIES_DATA: CategoryDef[] = [
  {
    id: 'it-software',
    name: 'Technology, Cloud & AI',
    count: 360,
    icon: Laptop,
    bg: 'bg-purple-50',
    iconColor: 'text-[#7138E8]',
    keywords: ['software', 'developer', 'engineer', 'frontend', 'backend', 'full stack', 'react', 'python', 'node', 'java', 'cloud', 'devops', 'platform', 'tech', 'web', 'system', 'architect', 'aws', 'kubernetes', 'sre']
  },
  {
    id: 'ai-data',
    name: 'AI & Data Science',
    count: 145,
    icon: Cpu,
    bg: 'bg-indigo-50',
    iconColor: 'text-indigo-600',
    keywords: ['ai', 'artificial intelligence', 'data', 'machine learning', 'ml', 'deep learning', 'nlp', 'llm', 'pytorch', 'tensorflow', 'analytics', 'spark', 'snowflake', 'data science', 'big data']
  },
  {
    id: 'banking-finance',
    name: 'Banking, FinTech & Capital Markets',
    count: 240,
    icon: Coins,
    bg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    keywords: ['bank', 'finance', 'fintech', 'account', 'audit', 'tax', 'credit', 'risk', 'analyst', 'wealth', 'investment', 'payments', 'crypto', 'blockchain', 'trading', 'fx', 'settlement', 'revolut', 'stripe', 'qnb', 'flutterwave', 'paystack']
  },
  {
    id: 'healthcare',
    name: 'Healthcare, Pharma & Biotech',
    count: 110,
    icon: Heart,
    bg: 'bg-red-50',
    iconColor: 'text-red-500',
    keywords: ['health', 'hospital', 'medical', 'clinical', 'pharma', 'pharmacy', 'nurse', 'doctor', 'biotech', 'laboratory', 'technician', 'healthcare', 'safety', 'life sciences', 'telemedicine']
  },
  {
    id: 'energy-cleantech',
    name: 'Energy, CleanTech & Oil & Gas',
    count: 95,
    icon: Flame,
    bg: 'bg-orange-50',
    iconColor: 'text-orange-600',
    keywords: ['energy', 'oil', 'gas', 'petroleum', 'aramco', 'solar', 'wind', 'renewable', 'cleantech', 'climate', 'power', 'grid', 'utilities', 'sustainability', 'battery', 'iocl', 'bhel']
  },
  {
    id: 'consulting-strategy',
    name: 'Management Consulting & Strategy',
    count: 130,
    icon: Compass,
    bg: 'bg-blue-50',
    iconColor: 'text-[#2563EB]',
    keywords: ['consulting', 'strategy', 'advisory', 'mckinsey', 'bain', 'bcg', 'deloitte', 'ey', 'pwc', 'kpmg', 'corporate', 'management', 'analyst', 'transformation', 'mergers', 'legal']
  },
  {
    id: 'engineering',
    name: 'Core Engineering & Manufacturing',
    count: 160,
    icon: Cog,
    bg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
    keywords: ['mechanical', 'civil', 'electrical', 'design', 'cad', 'cam', 'plant', 'manufacturing', 'industrial', 'quality', 'maintenance', 'semiconductor', 'asml', 'robotics', 'automotive', 'tata', 'ev', 'aerospace', 'hardware']
  },
  {
    id: 'supply-chain',
    name: 'Supply Chain, Logistics & Maritime',
    count: 115,
    icon: Plane,
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    keywords: ['supply chain', 'logistics', 'warehouse', 'freight', 'procurement', 'shipping', 'cargo', 'aviation', 'emirates', 'noon', 'distribution', 'fulfillment', 'fleet', 'maritime', 'transport']
  },
  {
    id: 'sales-marketing',
    name: 'Sales, BD & Digital Growth',
    count: 155,
    icon: Megaphone,
    bg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    keywords: ['sales', 'marketing', 'business development', 'growth', 'customer', 'client', 'lead', 'brand', 'b2b', 'enterprise', 'digital marketing', 'seo', 'content', 'account manager', 'revenue', 'expansion']
  },
  {
    id: 'ecommerce-retail',
    name: 'Ecommerce & Consumer Brands',
    count: 120,
    icon: ShoppingBag,
    bg: 'bg-teal-50',
    iconColor: 'text-teal-600',
    keywords: ['ecommerce', 'e-commerce', 'retail', 'fmcg', 'shopify', 'amazon', 'consumer', 'store', 'merchandising', 'brand', 'dtc', 'noon', 'marketplace', 'catalog']
  },
  {
    id: 'telecom-space',
    name: 'Telecom, 5G & SpaceTech',
    count: 85,
    icon: Radio,
    bg: 'bg-sky-50',
    iconColor: 'text-sky-600',
    keywords: ['telecom', 'telecommunications', '5g', 'network', 'satellite', 'spacetech', 'isro', 'airtel', 'safaricom', 'spectrum', 'fiber', 'broadband', 'wireless', 'rf']
  },
  {
    id: 'human-resources',
    name: 'People, HR & Global Mobility',
    count: 80,
    icon: Users,
    bg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    keywords: ['hr', 'human resources', 'recruiter', 'recruitment', 'talent', 'hiring', 'payroll', 'people', 'staffing', 'onboarding', 'mobility', 'compensation', 'benefits', 'culture']
  },
  {
    id: 'education',
    name: 'Education, EdTech & Academic',
    count: 65,
    icon: GraduationCap,
    bg: 'bg-lime-50',
    iconColor: 'text-lime-700',
    keywords: ['education', 'trainer', 'training', 'teacher', 'faculty', 'professor', 'academic', 'tutor', 'curriculum', 'instructor', 'mentor', 'university', 'research', 'edtech', 'learning']
  },
  {
    id: 'real-estate',
    name: 'Real Estate, PropTech & Infra',
    count: 70,
    icon: Building2,
    bg: 'bg-stone-50',
    iconColor: 'text-stone-700',
    keywords: ['real estate', 'property', 'proptech', 'infrastructure', 'urban', 'construction', 'architecture', 'civil', 'facilities', 'commercial', 'leasing']
  },
  {
    id: 'media-gaming',
    name: 'Media, Design & Gaming',
    count: 75,
    icon: Gamepad2,
    bg: 'bg-fuchsia-50',
    iconColor: 'text-fuchsia-600',
    keywords: ['gaming', 'game', 'media', 'design', 'ui', 'ux', 'creative', 'animation', 'video', 'content', 'streaming', 'audio', 'spotify', 'entertainment', 'graphics']
  },
  {
    id: 'government-defense',
    name: 'Government, Defense & Public Sector',
    count: 88,
    icon: ShieldCheck,
    bg: 'bg-slate-50',
    iconColor: 'text-slate-700',
    keywords: ['government', 'psu', 'defense', 'public sector', 'drdo', 'bhel', 'isro', 'ministry', 'military', 'aerospace', 'sovereign', 'civil service', 'policy']
  }
];

function generateSlug(title: string, id: string): string {
  const cleanTitle = (title || 'job')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${cleanTitle}-${id}`;
}

function getCountryFromLocation(location?: string, city?: string): { code: string; flag: string; name: string } {
  const loc = `${city || ''} ${location || ''}`.toLowerCase();
  if (loc.includes('united arab emirates') || loc.includes('dubai') || loc.includes('abu dhabi') || loc.includes('sharjah') || loc.includes('uae')) {
    return { code: 'AE', flag: '🇦🇪', name: 'UAE' };
  }
  if (loc.includes('saudi arabia') || loc.includes('riyadh') || loc.includes('ksa') || loc.includes('jeddah')) {
    return { code: 'SA', flag: '🇸🇦', name: 'Saudi Arabia' };
  }
  if (loc.includes('qatar') || loc.includes('doha')) {
    return { code: 'QA', flag: '🇶🇦', name: 'Qatar' };
  }
  if (loc.includes('oman') || loc.includes('muscat')) {
    return { code: 'OM', flag: '🇴🇲', name: 'Oman' };
  }
  if (loc.includes('united states') || loc.includes('usa') || loc.includes('washington') || loc.includes('atlanta') || loc.includes('seattle') || loc.includes('austin') || loc.includes('san francisco') || loc.includes('new york') || loc.includes('san mateo')) {
    return { code: 'US', flag: '🇺🇸', name: 'United States' };
  }
  if (loc.includes('united kingdom') || loc.includes('london') || loc.includes('uk')) {
    return { code: 'GB', flag: '🇬🇧', name: 'UK' };
  }
  if (loc.includes('germany') || loc.includes('berlin') || loc.includes('munich') || loc.includes('darmstadt')) {
    return { code: 'DE', flag: '🇩🇪', name: 'Germany' };
  }
  if (loc.includes('singapore')) {
    return { code: 'SG', flag: '🇸🇬', name: 'Singapore' };
  }
  if (loc.includes('australia') || loc.includes('sydney') || loc.includes('canberra')) {
    return { code: 'AU', flag: '🇦🇺', name: 'Australia' };
  }
  if (loc.includes('canada') || loc.includes('toronto') || loc.includes('ottawa')) {
    return { code: 'CA', flag: '🇨🇦', name: 'Canada' };
  }
  if (loc.includes('belgium') || loc.includes('brussels')) {
    return { code: 'BE', flag: '🇧🇪', name: 'Belgium' };
  }
  if (loc.includes('remote') || loc.includes('worldwide') || loc.includes('global')) {
    return { code: 'REMOTE', flag: '🌐', name: 'Global Remote' };
  }
  return { code: 'IN', flag: '🇮🇳', name: 'India' };
}

function formatSalary(min?: number, max?: number, currency?: string, location?: string): string | null {
  if (!min || min <= 0) return null;
  const country = getCountryFromLocation(location);
  const curr = (currency || '').toUpperCase() || (
    country.code === 'AE' ? 'AED' :
    country.code === 'SA' ? 'SAR' :
    country.code === 'QA' ? 'QAR' :
    country.code === 'OM' ? 'OMR' :
    country.code === 'US' ? 'USD' :
    'INR'
  );

  // International formatting without speculative conversions
  if (curr === 'AED') {
    const minK = Math.round(min / 1000);
    const maxK = max ? Math.round(max / 1000) : null;
    return maxK && maxK !== minK ? `AED ${minK}k – ${maxK}k / yr` : `AED ${minK}k / yr`;
  }
  if (curr === 'USD') {
    const minK = Math.round(min / 1000);
    const maxK = max ? Math.round(max / 1000) : null;
    return maxK && maxK !== minK ? `$${minK}k – $${maxK}k / yr` : `$${minK}k / yr`;
  }
  if (curr === 'SAR') {
    const minK = Math.round(min / 1000);
    const maxK = max ? Math.round(max / 1000) : null;
    return maxK && maxK !== minK ? `SAR ${minK}k – ${maxK}k / yr` : `SAR ${minK}k / yr`;
  }
  if (curr === 'QAR') {
    const minK = Math.round(min / 1000);
    const maxK = max ? Math.round(max / 1000) : null;
    return maxK && maxK !== minK ? `QAR ${minK}k – ${maxK}k / yr` : `QAR ${minK}k / yr`;
  }
  if (curr === 'OMR') {
    const minK = Math.round(min / 1000);
    const maxK = max ? Math.round(max / 1000) : null;
    return maxK && maxK !== minK ? `OMR ${minK}k – ${maxK}k / yr` : `OMR ${minK}k / yr`;
  }

  // Standard Indian LPA formatting
  const minLakhs = (min / 100000).toFixed(0);
  if (!max || max === min) return `₹${minLakhs} LPA`;
  const maxLakhs = (max / 100000).toFixed(0);
  return `₹${minLakhs} – ${maxLakhs} LPA`;
}

function timeAgo(dateString?: string): string {
  if (!dateString) return 'Posted recently';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return 'Posted today';
  if (diffDays === 1) return 'Posted 1 day ago';
  if (diffDays < 30) return `Posted ${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `Posted ${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;
}

export const JobMatchProduct: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Active View Tab (discover | match | tracker | saved | employer | talent | interview)
  const getInitialTab = (): string => {
    const param = searchParams.get('tab');
    if (param) return param;
    if (typeof window !== 'undefined') {
      const p = window.location.pathname.toLowerCase();
      if (p.includes('/post') || p.includes('/hire')) return 'employer';
      if (p.includes('/manage')) return 'employer';
      if (p.includes('/tracker') || p.includes('/applications') || p.includes('/applied')) return 'tracker';
      if (p.includes('/saved')) return 'saved';
      if (p.includes('/talent') || p.includes('/candidates')) return 'talent';
      if (p.includes('/match')) return 'match';
      if (p.includes('/interview')) return 'interview';
    }
    return 'discover';
  };

  const activeTab = getInitialTab();

  const setActiveTab = (tab: string) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    });
  };

  // Primary Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState<string>('all');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('INR');
  const [selectedEligibility, setSelectedEligibility] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState('all');
  const [selectedSalary, setSelectedSalary] = useState('all');
  const [selectedWorkMode, setSelectedWorkMode] = useState('all');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState('all');
  const [selectedIndustry, setSelectedIndustry] = useState('all');
  const [selectedCategory8, setSelectedCategory8] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedSubTab, setSelectedSubTab] = useState<'all' | 'remote' | 'freshers' | 'high_paying'>('all');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'latest' | 'salary_high' | 'experience'>('latest');

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [sidebarFilters, setSidebarFilters] = useState<any>({
    search: '',
    location: '',
    employment_type: [],
    experience_level: [],
    salary_min: 0,
    salary_max: 0,
    is_remote: false,
    skills: [],
    department: [],
    company_type: [],
    work_mode: [],
    industry: [],
    role_category: [],
    education: [],
    posted_by: [],
    freshness: [],
    company_id: ''
  });

  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('txc_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });

  const [jobs, setJobs] = useState<JobDetailItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(2236);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);

  const [trackedApplicationsCount, setTrackedApplicationsCount] = useState<number>(() => {
    try {
      const arr = JSON.parse(localStorage.getItem('txc_tracked_applications') || '[]');
      return arr.length;
    } catch {
      return 0;
    }
  });

  // Modals & Drawers state
  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobDetailItem | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobDetailItem | null>(null);
  const [selectedJobForInterview, setSelectedJobForInterview] = useState<JobDetailItem | null>(null);
  const [platformSidebarOpen, setPlatformSidebarOpen] = useState(false);
  const [aiMatchModalOpen, setAiMatchModalOpen] = useState(false);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [mobileFilterDrawerOpen, setMobileFilterDrawerOpen] = useState(false);

  const openInterviewCoach = (job?: JobDetailItem) => {
    if (job) {
      setSelectedJobForInterview(job);
    } else if (jobs && jobs.length > 0) {
      setSelectedJobForInterview(jobs[0]);
    } else {
      setSelectedJobForInterview(null);
    }
    setInterviewModalOpen(true);
  };

  // Prevent background scroll while modal is active without shifting page coordinates
  useEffect(() => {
    const isAnyModalOpen = aiMatchModalOpen || interviewModalOpen || selectedJobForInterview || selectedJobForDetail || selectedJobForApply;
    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [aiMatchModalOpen, interviewModalOpen, selectedJobForInterview, selectedJobForDetail, selectedJobForApply]);

  useEffect(() => {
    conversionTelemetry.track('landing_view', { product: 'jobmatch_os', universe: 'JOBS' });
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      // 1. Fetch exact live inventory count
      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      if (count && count > 0) {
        setTotalCount(count);
      }

      // 2. Fetch ALL authentic active vacancies directly from Supabase via parallel range batches
      const FIELDS = 'id, title, company_name, location, location_city, location_state, employment_type, is_remote, work_mode, salary_min, salary_max, salary_currency, applicant_location_requirements, description, department, industry, external_url, skills_required, application_deadline, expires_at, created_at, job_summary, min_experience, max_experience, is_featured, views_count, applications_count, experience_level';
      const totalActive = (count && count > 0) ? count : 2500;
      const batchCount = Math.ceil(totalActive / 1000);
      const batchPromises = [];
      for (let i = 0; i < batchCount; i++) {
        batchPromises.push(
          supabase
            .from('jobs')
            .select(FIELDS)
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .range(i * 1000, (i + 1) * 1000 - 1)
        );
      }

      const results = await Promise.all(batchPromises);
      let allData: any[] = [];
      let fetchError: any = null;
      for (const res of results) {
        if (res.error) {
          fetchError = res.error;
          console.error('Supabase jobs fetch error:', res.error);
        }
        if (res.data) {
          allData = allData.concat(res.data);
        }
      }

      if (fetchError && allData.length === 0) {
        setErrorState(fetchError.message || 'Unable to connect to live jobs database');
        setJobs([]);
        return;
      }

      const now = new Date();
      const unexpired = allData.filter(j => {
        if (j.application_deadline && new Date(j.application_deadline) < now) return false;
        if (j.expires_at && new Date(j.expires_at) < now) return false;
        return true;
      });

      setJobs(unexpired as any);
      setTotalCount(unexpired.length);
    } catch (e: any) {
      console.error('Job fetch exception:', e);
      setErrorState(e?.message || 'Error communicating with database');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtered jobs matching mockup criteria
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Saved tab view
      if (activeTab === 'saved' && !savedJobIds.includes(job.id)) return false;

      // Sidebar Filters Integration
      if (sidebarFilters.work_mode && sidebarFilters.work_mode.length > 0) {
        const matchesMode = sidebarFilters.work_mode.some((mode: string) => {
          const m = mode.toLowerCase();
          if (m.includes('home') || m.includes('remote')) {
            return job.is_remote || (job.location || '').toLowerCase().includes('remote') || (job.work_mode || '').toLowerCase().includes('remote');
          }
          if (m.includes('hybrid')) {
            return (job.work_mode || '').toLowerCase().includes('hybrid') || (job.location || '').toLowerCase().includes('hybrid');
          }
          if (m.includes('office')) {
            return (!job.is_remote && !(job.location || '').toLowerCase().includes('remote')) || (job.work_mode || '').toLowerCase().includes('office');
          }
          return false;
        });
        if (!matchesMode) return false;
      }

      if (sidebarFilters.experience_level && sidebarFilters.experience_level.length > 0) {
        const exp = job.min_experience || 0;
        const matchesExp = sidebarFilters.experience_level.some((level: string) => {
          const l = level.toLowerCase();
          if (l.includes('0-1') || l.includes('fresher')) return exp <= 1;
          if (l.includes('1-3')) return exp >= 1 && exp <= 3;
          if (l.includes('3-7') || l.includes('3-5')) return exp >= 3 && exp <= 7;
          if (l.includes('5-10')) return exp >= 5 && exp <= 10;
          if (l.includes('7-12')) return exp >= 7 && exp <= 12;
          if (l.includes('8+')) return exp >= 8;
          if (l.includes('12+')) return exp >= 12;
          if (l.includes('15+')) return exp >= 15;
          return false;
        });
        if (!matchesExp) return false;
      }

      if (sidebarFilters.industry && sidebarFilters.industry.length > 0) {
        const full = `${job.title} ${job.company_name} ${job.department || ''} ${job.industry || ''}`.toLowerCase();
        const matchesInd = sidebarFilters.industry.some((ind: string) => full.includes(ind.toLowerCase()));
        if (!matchesInd) return false;
      }

      if (sidebarFilters.department && sidebarFilters.department.length > 0) {
        const full = `${job.title} ${job.department || ''}`.toLowerCase();
        const matchesDept = sidebarFilters.department.some((dept: string) => full.includes(dept.toLowerCase()));
        if (!matchesDept) return false;
      }

      if (sidebarFilters.company_type && sidebarFilters.company_type.length > 0) {
        const full = `${job.company_name} ${(job as any).company_type || ''}`.toLowerCase();
        const matchesType = sidebarFilters.company_type.some((type: string) => full.includes(type.toLowerCase()));
        if (!matchesType) return false;
      }

      // Sidebar Country Filter
      if (sidebarFilters.country && sidebarFilters.country.length > 0) {
        const country = getCountryFromLocation(job.location, job.location_city);
        const matchesCountry = sidebarFilters.country.some((code: string) => {
          if (code === 'REMOTE') return job.is_remote || (job.location || '').toLowerCase().includes('remote');
          return country.code === code;
        });
        if (!matchesCountry) return false;
      }

      // Sidebar Currency Filter
      if (sidebarFilters.currency && sidebarFilters.currency.length > 0) {
        const country = getCountryFromLocation(job.location, job.location_city);
        const jobCurr = ((job as any).salary_currency || '').toUpperCase() || (
          country.code === 'AE' ? 'AED' :
          country.code === 'US' ? 'USD' :
          country.code === 'SA' ? 'SAR' :
          country.code === 'QA' ? 'QAR' :
          country.code === 'OM' ? 'OMR' :
          country.code === 'GB' ? 'GBP' :
          country.code === 'SG' ? 'SGD' :
          country.code === 'AU' ? 'AUD' :
          'INR'
        );
        if (!sidebarFilters.currency.includes(jobCurr)) return false;
      }

      // Sidebar Visa & Eligibility Filter
      if (sidebarFilters.applicant_eligibility && sidebarFilters.applicant_eligibility.length > 0) {
        const eligStr = `${(job as any).applicant_location_requirements || ''} ${job.location || ''} ${(job as any).description || ''}`.toLowerCase();
        const matchesElig = sidebarFilters.applicant_eligibility.some((elig: string) => {
          if (elig === 'uae_visa') return eligStr.includes('uae') && (eligStr.includes('visa sponsored') || eligStr.includes('residence visa'));
          if (elig === 'us_auth') return eligStr.includes('us work') || eligStr.includes('authorization') || eligStr.includes('united states');
          if (elig === 'intl_remote') return eligStr.includes('worldwide') || eligStr.includes('international') || eligStr.includes('india');
          if (elig === 'relocation') return eligStr.includes('relocation') || eligStr.includes('flight');
          return false;
        });
        if (!matchesElig) return false;
      }

      // Country Filter
      if (selectedCountry !== 'all') {
        const country = getCountryFromLocation(job.location, job.location_city);
        if (selectedCountry === 'REMOTE') {
          const isRem = job.is_remote || (job.location || '').toLowerCase().includes('remote') || (job.work_mode || '').toLowerCase() === 'remote';
          if (!isRem) return false;
        } else if (country.code !== selectedCountry) {
          return false;
        }
      }

      // Currency Filter
      if (selectedCurrency !== 'all') {
        const country = getCountryFromLocation(job.location, job.location_city);
        const jobCurr = ((job as any).salary_currency || '').toUpperCase() || (
          country.code === 'AE' ? 'AED' :
          country.code === 'US' ? 'USD' :
          country.code === 'SA' ? 'SAR' :
          country.code === 'QA' ? 'QAR' :
          country.code === 'OM' ? 'OMR' :
          'INR'
        );
        if (jobCurr !== selectedCurrency) return false;
      }

      // Visa & Applicant Eligibility Filter
      if (selectedEligibility !== 'all') {
        const eligStr = `${(job as any).applicant_location_requirements || ''} ${job.location || ''} ${(job as any).description || ''}`.toLowerCase();
        if (selectedEligibility === 'uae_visa') {
          if (!eligStr.includes('uae') && !eligStr.includes('visa sponsored') && !eligStr.includes('residence visa')) return false;
        } else if (selectedEligibility === 'us_auth') {
          if (!eligStr.includes('us work') && !eligStr.includes('authorization') && !eligStr.includes('united states')) return false;
        } else if (selectedEligibility === 'intl_remote') {
          if (!eligStr.includes('worldwide') && !eligStr.includes('international') && !eligStr.includes('india and') && !eligStr.includes('open to applicants')) return false;
        } else if (selectedEligibility === 'relocation') {
          if (!eligStr.includes('relocation') && !eligStr.includes('flight support')) return false;
        }
      }

      // Global Theater / Region filter
      if (selectedRegion !== 'all') {
        const regionDef = GLOBAL_REGIONS.find(r => r.id === selectedRegion);
        if (regionDef && regionDef.keywords) {
          const locStr = `${job.location || ''} ${job.location_city || ''} ${job.location_state || ''}`.toLowerCase();
          const isRemote = job.is_remote || locStr.includes('remote');
          if (selectedRegion === 'remote') {
            if (!isRemote) return false;
          } else {
            const matchesRegion = regionDef.keywords.some(k => locStr.includes(k));
            if (!matchesRegion && !isRemote) return false;
          }
        }
      }

      // 16 Category filter
      if (selectedCategory8 !== 'all') {
        const catDef = CATEGORIES_DATA.find(c => c.id === selectedCategory8);
        if (catDef) {
          const full = `${job.title} ${job.company_name} ${job.department || ''} ${job.industry || ''}`.toLowerCase();
          const matches = catDef.keywords.some(k => full.includes(k));
          if (!matches) return false;
        }
      }

      // Sub-tab filter (All Jobs | Remote | Freshers | High Paying)
      if (selectedSubTab === 'remote') {
        const isRem = job.is_remote || (job.work_mode || '').toLowerCase() === 'remote' || (job.location || '').toLowerCase().includes('remote');
        if (!isRem) return false;
      } else if (selectedSubTab === 'freshers') {
        const isFresher = (job.min_experience || 0) <= 1 || (job.title || '').toLowerCase().includes('trainee') || (job.title || '').toLowerCase().includes('intern') || (job.title || '').toLowerCase().includes('fresher');
        if (!isFresher) return false;
      } else if (selectedSubTab === 'high_paying') {
        const isHigh = (job.salary_max || job.salary_min || 0) >= 1000000;
        if (!isHigh) return false;
      }

      // City filter
      if (selectedCity !== 'all') {
        const loc = `${job.location_city || ''} ${job.location || ''}`.toLowerCase();
        if (selectedCity === 'remote') {
          if (!job.is_remote && !loc.includes('remote')) return false;
        } else if (!loc.includes(selectedCity.toLowerCase())) {
          return false;
        }
      }

      // Work mode filter
      if (selectedWorkMode === 'remote' && !job.is_remote && !(job.location || '').toLowerCase().includes('remote')) return false;
      if (selectedWorkMode === 'hybrid' && !(job.location || '').toLowerCase().includes('hybrid')) return false;
      if (selectedWorkMode === 'on-site' && (job.is_remote || (job.location || '').toLowerCase().includes('remote'))) return false;

      // Salary filter
      if (selectedSalary !== 'all') {
        const minLakhs = (job.salary_min || 0) / 100000;
        if (selectedSalary === '3lpa' && minLakhs < 3) return false;
        if (selectedSalary === '6lpa' && minLakhs < 6) return false;
        if (selectedSalary === '10lpa' && minLakhs < 10) return false;
        if (selectedSalary === '20lpa' && minLakhs < 20) return false;
      }

      // Experience filter
      if (selectedExperience !== 'all') {
        const exp = job.min_experience || 0;
        if (selectedExperience === 'fresher' && exp > 1) return false;
        if (selectedExperience === '1-3' && (exp < 1 || exp > 3)) return false;
        if (selectedExperience === '3-5' && (exp < 3 || exp > 5)) return false;
        if (selectedExperience === '5+' && exp < 5) return false;
      }

      // Employment type filter
      if (selectedEmploymentType !== 'all') {
        const emp = (job.employment_type || '').toLowerCase();
        if (!emp.includes(selectedEmploymentType.toLowerCase())) return false;
      }

      // Industry filter
      if (selectedIndustry !== 'all') {
        const catDef = CATEGORIES_DATA.find(c => c.id === selectedIndustry);
        if (catDef) {
          const full = `${job.title} ${job.company_name} ${job.department || ''} ${job.industry || ''}`.toLowerCase();
          const matches = catDef.keywords.some(k => full.includes(k));
          if (!matches) return false;
        }
      }

      // Search query filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const skillsText = (job.skills_required || []).join(' ').toLowerCase();
        const searchableText = `${job.title} ${job.company_name} ${job.location} ${job.department || ''} ${job.industry || ''} ${skillsText}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }

      return true;
    });
  }, [jobs, selectedCategory8, selectedSubTab, selectedCity, selectedCountry, selectedCurrency, selectedEligibility, selectedWorkMode, selectedSalary, selectedExperience, selectedEmploymentType, selectedIndustry, searchTerm, activeTab, savedJobIds]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCity, selectedCountry, selectedCurrency, selectedEligibility, selectedWorkMode, selectedSalary, selectedExperience, selectedEmploymentType, selectedIndustry, selectedCategory8, selectedSubTab]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCountry !== 'all') count++;
    if (selectedCurrency !== 'all') count++;
    if (selectedEligibility !== 'all') count++;
    if (selectedExperience !== 'all') count++;
    if (selectedSalary !== 'all') count++;
    if (selectedWorkMode !== 'all') count++;
    if (selectedEmploymentType !== 'all') count++;
    if (selectedIndustry !== 'all') count++;
    if (selectedCategory8 !== 'all') count++;
    if (selectedCity !== 'all') count++;
    return count;
  }, [selectedCountry, selectedCurrency, selectedEligibility, selectedExperience, selectedSalary, selectedWorkMode, selectedEmploymentType, selectedIndustry, selectedCategory8, selectedCity]);

  const sortedJobs = useMemo(() => {
    const list = [...filteredJobs];
    if (sortBy === 'salary_high') {
      list.sort((a, b) => (b.salary_max || b.salary_min || 0) - (a.salary_max || a.salary_min || 0));
    } else if (sortBy === 'experience') {
      list.sort((a, b) => (a.min_experience || 0) - (b.min_experience || 0));
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [filteredJobs, sortBy]);

  const featuredJobs = useMemo(() => {
    return sortedJobs.filter(j => j.is_featured);
  }, [sortedJobs]);

  const totalPages = Math.ceil(sortedJobs.length / pageSize) || 1;
  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedJobs.slice(start, start + pageSize);
  }, [sortedJobs, currentPage]);

  const handleApplyClick = (job: JobDetailItem) => {
    setSelectedJobForApply(job);
    conversionTelemetry.track('job_apply_clicked', { job_id: job.id, job_title: job.title });
  };

  const toggleSaveJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedJobIds(prev => {
      const next = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem('txc_saved_jobs', JSON.stringify(next));
      } catch {}
      toast.success(next.includes(jobId) ? 'Job saved to your bookmarks' : 'Job removed from bookmarks');
      return next;
    });
  };

  const resetAllFilters = () => {
    setSearchTerm('');
    setSelectedCity('all');
    setSelectedCountry('all');
    setSelectedCurrency('INR');
    setSelectedEligibility('all');
    setSelectedExperience('all');
    setSelectedSalary('all');
    setSelectedWorkMode('all');
    setSelectedEmploymentType('all');
    setSelectedIndustry('all');
    setSelectedCategory8('all');
    setSelectedRegion('all');
    setSelectedSubTab('all');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      <Helmet>
        <title>TalentXcel Jobs — Verified Employment Ecosystem</title>
        <meta 
          name="description" 
          content="Find the right job for your next career move. Discover verified job opportunities, apply easily, track applications and grow your career." 
        />
        <link rel="canonical" href="https://jobs.talentxcel.in/" />
      </Helmet>

      {/* Primary Clean Navigation */}
      <JobPortalHeader 
        activeTab={activeTab === 'discover' ? 'find' : activeTab}
        onSelectTab={(tab) => {
          if (tab === 'find') {
            setActiveTab('discover');
            const el = document.getElementById('search-hero');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'categories') {
            setActiveTab('discover');
            const el = document.getElementById('browse-categories-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'companies') {
            setActiveTab('discover');
            const el = document.getElementById('companies-discovery-grid');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'resources') {
            setActiveTab('discover');
            const el = document.getElementById('career-resources-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          } else if (tab === 'profile' || tab === 'preferences') setActiveTab('match');
          else if (tab === 'applications' || tab === 'tracker') setActiveTab('tracker');
          else if (tab === 'saved') setActiveTab('saved');
          else if (tab === 'post' || tab === 'employer') setActiveTab('employer');
          else if (tab === 'talent') setActiveTab('talent');
          else if (tab === 'interview') setActiveTab('interview');
          else setActiveTab(tab);
        }}
        savedJobsCount={savedJobIds.length}
        applicationsCount={trackedApplicationsCount}
      />

      {/* Main Content Area (with bottom padding on mobile for bottom navigation bar) */}
      <main className="flex-1 pb-16 md:pb-0">
        {/* VIEW 1: DISCOVER JOBS */}
        {activeTab === 'discover' && (
          <div>
            {/* HERO SECTION MATCHING USER MOCKUP */}
            <section id="search-hero" className="bg-gradient-to-b from-white via-white to-[#F8FAFC] px-3 sm:px-4 pt-3 sm:pt-6 pb-3 sm:pb-6 border-b border-[#E2E8F0]">
              <div className="max-w-7xl mx-auto">
                {/* 1. MOBILE HERO: Clean, ultra-compact, matching Image 1 */}
                <div className="md:hidden space-y-2 pb-1 text-left">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 border border-blue-200 text-[#2563EB]">
                      <Briefcase className="w-3 h-3 text-[#2563EB]" />
                      TALENTXCEL JOBS
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {totalCount > 0 ? `${totalCount.toLocaleString()} Live` : '2,282 Live'}
                    </span>
                  </div>

                  <h1 className="text-base font-black tracking-tight text-[#111827]">
                    Discover Jobs That Match Your Ambition
                  </h1>

                  {/* Compact Integrated Search Bar matching Image 1 */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-1.5 shadow-xs flex items-center gap-2">
                    <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1.5" />
                    <input 
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search jobs by role, skills, location, experience..."
                      className="w-full text-xs text-[#111827] placeholder:text-slate-400 focus:outline-hidden bg-transparent font-medium"
                    />
                    {searchTerm && (
                      <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 p-0.5">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button 
                      type="button"
                      onClick={() => setMobileFilterDrawerOpen(true)}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-[#2563EB] hover:bg-slate-50 relative shrink-0 cursor-pointer"
                      title="Filter Jobs"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      {activeFilterCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#2563EB] rounded-full" />
                      )}
                    </button>
                    <button 
                      type="button"
                      onClick={() => {
                        const el = document.getElementById('latest-jobs-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold shrink-0 flex items-center gap-1 cursor-pointer"
                      title="Search Jobs"
                    >
                      <Search className="w-3 h-3" />
                      <span>Find</span>
                    </button>
                  </div>

                  {/* Sleek Horizontal Filter Pills matching Image 1 */}
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 touch-pan-x text-xs">
                    <button
                      onClick={() => {
                        setSelectedWorkMode(selectedWorkMode === 'remote' ? 'all' : 'remote');
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 border transition-all cursor-pointer ${
                        selectedWorkMode === 'remote'
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#475569] border-[#E2E8F0]'
                      }`}
                    >
                      🌐 Remote
                    </button>
                    <button
                      onClick={() => {
                        setSelectedIndustry(selectedIndustry === 'tech-ai' ? 'all' : 'tech-ai');
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 border transition-all cursor-pointer ${
                        selectedIndustry === 'tech-ai'
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#475569] border-[#E2E8F0]'
                      }`}
                    >
                      ⚡ AI & ML
                    </button>
                    <button
                      onClick={() => {
                        setSelectedIndustry(selectedIndustry === 'engineering' ? 'all' : 'engineering');
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 border transition-all cursor-pointer ${
                        selectedIndustry === 'engineering'
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#475569] border-[#E2E8F0]'
                      }`}
                    >
                      💻 Tech & Engineering
                    </button>
                    <button
                      onClick={() => {
                        setSelectedIndustry(selectedIndustry === 'finance' ? 'all' : 'finance');
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 border transition-all cursor-pointer ${
                        selectedIndustry === 'finance'
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#475569] border-[#E2E8F0]'
                      }`}
                    >
                      💳 FinTech
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCountry(selectedCountry === 'AE' ? 'all' : 'AE');
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 border transition-all cursor-pointer ${
                        selectedCountry === 'AE'
                          ? 'bg-[#2563EB] text-white border-[#2563EB]'
                          : 'bg-white text-[#475569] border-[#E2E8F0]'
                      }`}
                    >
                      🌍 Global / NRI
                    </button>
                    <button
                      onClick={() => {
                        setSelectedExperience(selectedExperience === 'fresher' ? 'all' : 'fresher');
                        setCurrentPage(1);
                      }}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 border transition-all cursor-pointer ${
                        selectedExperience === 'fresher'
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-emerald-700 border-emerald-200'
                      }`}
                    >
                      🎓 Freshers
                    </button>
                  </div>
                </div>

                {/* 2. DESKTOP HERO: Full rich view */}
                <div className="hidden md:grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
                  
                  {/* Left Column: Headline, Subtitle & Fast Action Buttons */}
                  <div className="lg:col-span-7 space-y-3 sm:space-y-4 text-left">
                    {/* Clean Pill Badge */}
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50/90 border border-blue-200 text-[#2563EB] text-[11px] sm:text-xs font-bold shadow-2xs max-w-full">
                      <Globe className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <span className="truncate">Global Employment Ecosystem • India • Middle East • Africa • Europe • Americas</span>
                    </div>

                    {/* H1 Headline (Crisp, balanced font sizing and line wrap matching user mockup) */}
                    <h1 className="text-2xl sm:text-3xl lg:text-[34px] xl:text-[38px] font-black text-[#111827] tracking-tight leading-[1.2]">
                      Find the Right Job<br />
                      <span className="text-[#111827]">for Your </span><span className="text-[#2563EB]">Next Global Career Move</span>
                    </h1>

                    {/* Subtitle */}
                    <p className="text-[#64748B] text-xs sm:text-sm md:text-base leading-relaxed max-w-xl">
                      Connecting verified professionals with 2,250+ unexpired vacancies across India, Africa, Middle East, Europe & Americas. Zero ghost listings, transparent compensation benchmarks, and AI match routing.
                    </p>

                    {/* Quick Hero Actions */}
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setAiMatchModalOpen(true);
                        }}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 shadow-xs hover:shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                      >
                        <Sparkles className="w-4 h-4 text-white" />
                        <span>Run AI Compatibility Match</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          openInterviewCoach();
                        }}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#7138E8] bg-purple-50 hover:bg-purple-100 border border-purple-200 flex items-center gap-2 cursor-pointer transition-all active:scale-98"
                      >
                        <GraduationCap className="w-4 h-4 text-[#7138E8]" />
                        <span>AI Interview Prep Coach</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Female Professional Visual + Floating Feature Cards */}
                  <div className="lg:col-span-5 hidden lg:flex items-center justify-center relative">
                    {/* Organic purple wave glow in backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-200/40 via-blue-100/30 to-purple-100/50 rounded-[32px] blur-xl transform -rotate-1 scale-95" />

                    <div className="relative w-full flex items-center justify-between gap-3">
                      {/* Professional Portrait */}
                      <div className="relative z-10 w-[240px] h-[270px] rounded-2xl overflow-hidden shadow-xl border border-purple-100/80 bg-white">
                        <img 
                          src="/hero-female-jobseeker.jpg?v=2"
                          onError={(e) => { (e.currentTarget).src = '/hero-female-jobseeker-v2.jpg'; }}
                          alt="TalentXcel Verified Professional"
                          className="w-full h-full object-cover object-center select-none transition-transform duration-500 hover:scale-[1.03]"
                        />
                      </div>

                      {/* Floating Card: 4 Quick Tools (100% Fully Working) */}
                      <div className="relative z-20 w-[185px] bg-white/95 backdrop-blur-md border border-[#E2E8F0] p-3 rounded-2xl shadow-lg space-y-2 shrink-0">
                        {/* 1. Job Alerts */}
                        <div 
                          onClick={() => toast.success('Job Alerts Activated: You will receive real-time notifications for verified matches!')}
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-purple-50 text-[#7138E8] flex items-center justify-center shrink-0">
                            <Bell className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-[#111827]">Job Alerts</div>
                            <div className="text-[10px] text-[#64748B]">Get matching jobs</div>
                          </div>
                        </div>

                        {/* 2. Salary Insights */}
                        <a 
                          href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://salary.localhost:8080' : 'https://salary.talentxcel.in'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                            <BarChart3 className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-[#111827]">Salary Insights</div>
                            <div className="text-[10px] text-[#64748B]">Know your market value</div>
                          </div>
                        </a>

                        {/* 3. Resume Builder */}
                        <a 
                          href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://resume.localhost:8080' : 'https://resume.talentxcel.in'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-[#111827]">Resume Builder</div>
                            <div className="text-[10px] text-[#64748B]">Winning resumes</div>
                          </div>
                        </a>

                        {/* 4. Interview Prep */}
                        <div 
                          onClick={() => openInterviewCoach()}
                          className="flex items-center gap-2 cursor-pointer p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Target className="w-3.5 h-3.5" />
                          </div>
                          <div className="text-left">
                            <div className="text-xs font-bold text-[#111827]">Interview Prep</div>
                            <div className="text-[10px] text-[#64748B]">Be interview ready</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Search Bar + Filters + 4 Innovation Cards (Desktop View) */}
                <div className="mt-6 space-y-3 hidden md:block">
                  
                  {/* Global Region Theater Selector Strip (Clean Horizontal Scroll) */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                    <span className="text-[#64748B] font-bold text-[10px] sm:text-[11px] shrink-0 mr-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span className="hidden sm:inline">Global Theater:</span>
                    </span>
                    {GLOBAL_REGIONS.map(reg => {
                      const isActive = selectedRegion === reg.id;
                      return (
                        <button
                          key={reg.id}
                          type="button"
                          onClick={() => {
                            setSelectedRegion(reg.id);
                            if (reg.id === 'india') setSelectedCurrency('INR');
                            else if (reg.id === 'middle-east') setSelectedCurrency('AED');
                            else if (reg.id === 'americas') setSelectedCurrency('USD');
                            else if (reg.id === 'europe') setSelectedCurrency('GBP');
                            else if (reg.id === 'all') setSelectedCurrency('INR');
                            setCurrentPage(1);
                          }}
                          className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer ${
                            isActive
                              ? 'bg-[#2563EB] text-white shadow-xs'
                              : 'bg-white text-[#475569] hover:bg-slate-100 border border-[#E2E8F0]'
                          }`}
                        >
                          <span>{reg.flag}</span>
                          <span>{reg.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Primary Search Bar */}
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-2 shadow-xs flex flex-col md:flex-row items-center gap-2">
                    {/* Job Title & Skill Search */}
                    <div className="flex items-center gap-2.5 flex-1 px-3 w-full">
                      <Search className="w-4 h-4 text-slate-400 shrink-0" />
                      <input 
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Job title, skills or company (e.g. Software Engineer, TCS)"
                        className="w-full text-xs sm:text-sm text-[#111827] placeholder:text-slate-400 focus:outline-hidden bg-transparent font-medium"
                      />
                      {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="text-slate-400 hover:text-slate-600 p-0.5">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="h-6 w-px bg-slate-200 hidden md:block" />

                    {/* Location Dropdown */}
                    <div className="flex items-center gap-2 px-3 w-full md:w-[220px]">
                      <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                      <select 
                        value={selectedCity}
                        onChange={(e) => {
                          setSelectedCity(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full text-xs sm:text-sm text-[#334155] bg-transparent focus:outline-hidden cursor-pointer font-medium"
                      >
                        <option value="all">🌍 All Global Locations (Worldwide)</option>
                        <option value="remote">🌐 100% Worldwide Remote (Work Anywhere)</option>

                        <optgroup label="🇮🇳 India & South Asia">
                          <option value="bengaluru">Bengaluru (India)</option>
                          <option value="mumbai">Mumbai (India)</option>
                          <option value="delhi">Delhi NCR / Noida / Gurugram (India)</option>
                          <option value="hyderabad">Hyderabad (India)</option>
                          <option value="pune">Pune (India)</option>
                          <option value="chennai">Chennai (India)</option>
                          <option value="kolkata">Kolkata (India)</option>
                          <option value="ahmedabad">Ahmedabad (India)</option>
                        </optgroup>

                        <optgroup label="🇦🇪 Middle East & GCC">
                          <option value="dubai">Dubai (United Arab Emirates)</option>
                          <option value="abu dhabi">Abu Dhabi (UAE)</option>
                          <option value="riyadh">Riyadh (Saudi Arabia)</option>
                          <option value="doha">Doha (Qatar)</option>
                          <option value="muscat">Muscat (Oman)</option>
                        </optgroup>

                        <optgroup label="🇿🇦 Africa & Emerging Markets">
                          <option value="lagos">Lagos (Nigeria)</option>
                          <option value="nairobi">Nairobi (Kenya)</option>
                          <option value="cape town">Cape Town (South Africa)</option>
                          <option value="johannesburg">Johannesburg (South Africa)</option>
                          <option value="cairo">Cairo (Egypt)</option>
                          <option value="kigali">Kigali (Rwanda)</option>
                          <option value="accra">Accra (Ghana)</option>
                        </optgroup>

                        <optgroup label="🇪🇺 Europe & United Kingdom">
                          <option value="london">London (United Kingdom)</option>
                          <option value="berlin">Berlin (Germany)</option>
                          <option value="amsterdam">Amsterdam (Netherlands)</option>
                          <option value="dublin">Dublin (Ireland)</option>
                          <option value="munich">Munich (Germany)</option>
                          <option value="paris">Paris (France)</option>
                          <option value="zurich">Zurich (Switzerland)</option>
                        </optgroup>

                        <optgroup label="🇺🇸 Americas (USA & Canada)">
                          <option value="new york">New York, NY (USA)</option>
                          <option value="seattle">Seattle, WA (USA)</option>
                          <option value="austin">Austin, TX (USA)</option>
                          <option value="san francisco">San Francisco / Silicon Valley (USA)</option>
                          <option value="atlanta">Atlanta, GA (USA)</option>
                          <option value="toronto">Toronto, ON (Canada)</option>
                          <option value="vancouver">Vancouver, BC (Canada)</option>
                        </optgroup>

                        <optgroup label="🌏 Asia-Pacific & Australia">
                          <option value="singapore">Singapore</option>
                          <option value="sydney">Sydney (Australia)</option>
                          <option value="melbourne">Melbourne (Australia)</option>
                          <option value="tokyo">Tokyo (Japan)</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Find Jobs Button */}
                    <Button 
                      onClick={() => {
                        const el = document.getElementById('latest-jobs-section');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full md:w-auto bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shrink-0 shadow-xs cursor-pointer"
                    >
                      <Search className="w-3.5 h-3.5 mr-1" />
                      Find Jobs
                    </Button>
                  </div>

                  {/* Mobile Filter Toggle Button (collapses 8 filter dropdowns so jobs are visible first on mobile) */}
                  <div className="md:hidden flex items-center justify-between gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                      className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                        activeFilterCount > 0
                          ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]'
                          : 'bg-white border-[#E2E8F0] text-[#334155]'
                      }`}
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>{mobileFiltersOpen ? 'Hide Quick Filters' : 'Filter by Country, Currency & Work Mode'}</span>
                      {activeFilterCount > 0 && (
                        <span className="bg-[#2563EB] text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                          {activeFilterCount}
                        </span>
                      )}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Dropdown Filters Row: Always visible on desktop (md+), collapsible on mobile */}
                  <div className={`${mobileFiltersOpen ? 'flex' : 'hidden md:flex'} flex-wrap items-center justify-between gap-2 text-xs pt-1`}>
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Country Filter */}
                      <select 
                        value={selectedCountry}
                        onChange={(e) => {
                          setSelectedCountry(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Country ▾ (Global)</option>
                        <option value="IN">🇮🇳 India</option>
                        <option value="AE">🇦🇪 United Arab Emirates</option>
                        <option value="SA">🇸🇦 Saudi Arabia</option>
                        <option value="QA">🇶🇦 Qatar</option>
                        <option value="OM">🇴🇲 Oman</option>
                        <option value="US">🇺🇸 United States</option>
                        <option value="GB">🇬🇧 United Kingdom</option>
                        <option value="DE">🇩🇪 Germany</option>
                        <option value="REMOTE">🌐 Worldwide Remote</option>
                      </select>

                      {/* Currency Filter */}
                      <select 
                        value={selectedCurrency}
                        onChange={(e) => {
                          setSelectedCurrency(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="INR">₹ INR (Indian Rupee) • Default</option>
                        <option value="all">🌍 All Currencies (Global)</option>
                        <option value="AED">AED (UAE Dirham)</option>
                        <option value="USD">$ USD (US Dollar)</option>
                        <option value="SAR">SAR (Saudi Riyal)</option>
                        <option value="QAR">QAR (Qatari Riyal)</option>
                        <option value="OMR">OMR (Omani Rial)</option>
                        <option value="GBP">£ GBP (British Pound)</option>
                        <option value="SGD">S$ SGD (Singapore Dollar)</option>
                        <option value="AUD">A$ AUD (Australian Dollar)</option>
                        <option value="EUR">€ EUR (Euro)</option>
                        <option value="CAD">C$ CAD (Canadian Dollar)</option>
                      </select>

                      {/* Visa & Applicant Eligibility Filter */}
                      <select 
                        value={selectedEligibility}
                        onChange={(e) => {
                          setSelectedEligibility(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Visa & Eligibility ▾</option>
                        <option value="uae_visa">🇦🇪 UAE Visa Sponsored</option>
                        <option value="us_auth">🇺🇸 US Work Auth Required</option>
                        <option value="intl_remote">🌐 Open to International / India</option>
                        <option value="relocation">✈️ Relocation Support</option>
                      </select>

                      {/* Experience Filter */}
                      <select 
                        value={selectedExperience}
                        onChange={(e) => setSelectedExperience(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Experience ▾</option>
                        <option value="fresher">Fresher (0 - 1 yr)</option>
                        <option value="1-3">1 - 3 Yrs (Mid)</option>
                        <option value="3-5">3 - 5 Yrs (Senior)</option>
                        <option value="5+">5+ Yrs (Lead/Principal)</option>
                      </select>

                      {/* Salary Filter */}
                      <select 
                        value={selectedSalary}
                        onChange={(e) => setSelectedSalary(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Salary ▾</option>
                        <option value="3lpa">₹3L+ LPA</option>
                        <option value="6lpa">₹6L+ LPA</option>
                        <option value="10lpa">₹10L+ LPA</option>
                        <option value="20lpa">₹20L+ LPA</option>
                      </select>

                      {/* Work Mode Filter */}
                      <select 
                        value={selectedWorkMode}
                        onChange={(e) => setSelectedWorkMode(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Work Mode ▾</option>
                        <option value="remote">Remote</option>
                        <option value="hybrid">Hybrid</option>
                        <option value="on-site">On-site</option>
                      </select>

                      {/* Job Type Filter */}
                      <select 
                        value={selectedEmploymentType}
                        onChange={(e) => setSelectedEmploymentType(e.target.value)}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">Job Type ▾</option>
                        <option value="full-time">Full-Time</option>
                        <option value="part-time">Part-Time</option>
                        <option value="contract">Contract</option>
                        <option value="internship">Internship</option>
                      </select>

                      {/* Industry Filter */}
                      <select 
                        value={selectedIndustry}
                        onChange={(e) => {
                          setSelectedIndustry(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="bg-white border border-[#E2E8F0] rounded-xl px-3 py-1.5 text-xs font-semibold text-[#334155] focus:outline-hidden cursor-pointer hover:border-slate-300"
                      >
                        <option value="all">16 Global Industries ▾</option>
                        {CATEGORIES_DATA.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    {(searchTerm || selectedCity !== 'all' || selectedCountry !== 'all' || selectedCurrency !== 'all' || selectedEligibility !== 'all' || selectedExperience !== 'all' || selectedSalary !== 'all' || selectedWorkMode !== 'all' || selectedEmploymentType !== 'all' || selectedIndustry !== 'all' || selectedCategory8 !== 'all' || selectedSubTab !== 'all') && (
                      <button
                        onClick={resetAllFilters}
                        className="text-xs text-[#2563EB] hover:text-[#7138E8] font-bold flex items-center gap-1 cursor-pointer hover:underline"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Filters</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 2-COLUMN MARKETPLACE SECTION: LATEST JOBS & SIDEBAR */}
            <section id="latest-jobs-section" className="max-w-[1440px] mx-auto px-4 pb-16">
              <div className="flex gap-6 items-start">
                
                {/* LEFT SIDEBAR: ComprehensiveJobFilters (Sticky, matching screenshot) */}
                <aside className="w-72 flex-shrink-0 hidden lg:block" aria-label="Job Filters">
                  <ComprehensiveJobFilters
                    filters={sidebarFilters}
                    onFiltersChange={setSidebarFilters}
                    onClearFilters={() => {
                      setSidebarFilters({
                        search: '',
                        location: '',
                        employment_type: [],
                        experience_level: [],
                        salary_min: 0,
                        salary_max: 0,
                        is_remote: false,
                        skills: [],
                        department: [],
                        company_type: [],
                        work_mode: [],
                        industry: [],
                        role_category: [],
                        education: [],
                        posted_by: [],
                        freshness: [],
                        company_id: ''
                      });
                      resetAllFilters();
                    }}
                    className="sticky top-20 max-h-[calc(100vh-5.5rem)] overflow-y-auto scrollbar-thin shadow-xs border-[#E2E8F0] bg-white rounded-2xl"
                  />
                </aside>

                {/* RIGHT MAIN CONTENT: ATS Banner + Featured + 2-Column Cards Grid */}
                <div className="flex-1 min-w-0 space-y-4">
                  
                  {/* Quick Category Chips for Tablet Only (Desktop uses right sidebar; Mobile uses integrated chips) */}
                  <div className="hidden sm:flex xl:hidden items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                    {CATEGORIES_DATA.map(cat => {
                      const Icon = cat.icon;
                      const isSelected = selectedCategory8 === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setSelectedCategory8(isSelected ? 'all' : cat.id);
                            setCurrentPage(1);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 border transition-all shrink-0 ${
                            isSelected
                              ? 'bg-[#2563EB] text-white border-[#2563EB] shadow-xs'
                              : 'bg-white text-[#334155] border-[#E2E8F0] hover:border-slate-300'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : cat.iconColor}`} />
                          <span>{cat.name}</span>
                          <span className={`text-[10px] font-mono ${isSelected ? 'text-blue-100' : 'text-[#64748B]'}`}>({cat.count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Compact Value Proposition Banner (matching screenshot) */}
                  <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-xl px-3.5 py-2 flex items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <Sparkles className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <span className="text-[#111827] truncate text-xs">
                        <strong className="font-semibold">Optimize Your Application:</strong> Free instant ATS match score against any role.
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        conversionTelemetry.track('signup_cta_click', { source: 'jobs' });
                        conversionTelemetry.setAcquisitionContext('jobs', '/jobs');
                        window.location.href = 'https://talentxcel.in/resume/ats-check?source=jobs';
                      }}
                      className="h-6 px-2.5 text-[11px] shrink-0 font-semibold border-blue-500/30 text-blue-600 hover:bg-blue-500/10"
                    >
                      Free ATS Audit →
                    </Button>
                  </div>

                  {/* Featured Opportunities Section (matching screenshot) */}
                  {featuredJobs.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2.5">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <h2 className="text-sm sm:text-base font-bold text-[#111827]">Featured Opportunities</h2>
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0 font-semibold">Premium</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {featuredJobs.slice(0, 4).map((job) => (
                          <TalentSparkJobCard
                            key={job.id}
                            job={job}
                            onSave={(id) => toggleSaveJob(id)}
                            onQuickApply={(id) => handleApplyClick(jobs.find(j => j.id === id) || job)}
                            onApplyClick={(j) => handleApplyClick(j)}
                            onViewDetails={(j) => setSelectedJobForDetail(j)}
                            isSaved={savedJobIds.includes(job.id)}
                            txcReward={15}
                            viewMode="card"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Header & Sub-Tabs Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2E8F0] pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Briefcase className="w-4 h-4 text-[#2563EB]" />
                      <h3 className="text-base sm:text-lg font-black text-[#111827]">
                        All Verified Openings
                      </h3>
                      <Badge variant="outline" className="text-xs font-mono font-semibold text-[#64748B] border-[#E2E8F0]">
                        {filteredJobs.length.toLocaleString()} total
                      </Badge>
                    </div>

                    {/* Sub-Tabs: All Jobs | Remote | Freshers | High Paying */}
                    <div className="flex items-center gap-3 text-xs font-bold">
                      <button
                        onClick={() => setSelectedSubTab('all')}
                        className={`pb-1 transition-colors relative ${
                          selectedSubTab === 'all'
                            ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                            : 'text-[#64748B] hover:text-[#111827]'
                        }`}
                      >
                        All Jobs
                      </button>
                      <button
                        onClick={() => setSelectedSubTab('remote')}
                        className={`pb-1 transition-colors relative ${
                          selectedSubTab === 'remote'
                            ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                            : 'text-[#64748B] hover:text-[#111827]'
                        }`}
                      >
                        Remote
                      </button>
                      <button
                        onClick={() => setSelectedSubTab('freshers')}
                        className={`pb-1 transition-colors relative ${
                          selectedSubTab === 'freshers'
                            ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                            : 'text-[#64748B] hover:text-[#111827]'
                        }`}
                      >
                        Freshers
                      </button>
                      <button
                        onClick={() => setSelectedSubTab('high_paying')}
                        className={`pb-1 transition-colors relative ${
                          selectedSubTab === 'high_paying'
                            ? 'text-[#2563EB] border-b-2 border-[#2563EB]'
                            : 'text-[#64748B] hover:text-[#111827]'
                        }`}
                      >
                        High Paying
                      </button>
                    </div>
                  </div>

                  {/* 2-COLUMN RESPONSIVE JOBS GRID (matching screenshot) */}
                  <div className="pt-1">
                    {errorState ? (
                      <div className="bg-white border border-red-200 p-8 rounded-2xl text-center space-y-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto font-bold text-lg">!</div>
                        <h4 className="font-bold text-base text-[#111827]">Unable to load vacancies from database</h4>
                        <p className="text-xs text-[#64748B] max-w-md mx-auto">{errorState}</p>
                        <Button size="sm" onClick={fetchJobs} className="bg-[#2563EB] text-white text-xs rounded-xl">
                          Retry Connection
                        </Button>
                      </div>
                    ) : loading ? (
                      <div className="p-12 text-center text-xs font-semibold text-[#64748B] space-y-2">
                        <Clock className="w-6 h-6 text-[#2563EB] animate-spin mx-auto" />
                        <div>Loading verified vacancies from Supabase...</div>
                      </div>
                    ) : filteredJobs.length === 0 ? (
                      <div className="bg-white border border-[#E2E8F0] p-10 rounded-2xl text-center space-y-3">
                        <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
                        <h4 className="font-bold text-base text-[#111827]">No vacancies found matching your filters</h4>
                        <p className="text-xs text-[#64748B]">
                          Out of {totalCount.toLocaleString()} verified vacancies, none matched your criteria.
                        </p>
                        <Button
                          size="sm"
                          onClick={resetAllFilters}
                          className="text-xs bg-[#2563EB] text-white rounded-xl"
                        >
                          Reset All Filters
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {paginatedJobs.map((job) => (
                          <TalentSparkJobCard
                            key={job.id}
                            job={job}
                            onSave={(id) => toggleSaveJob(id)}
                            onQuickApply={(id) => handleApplyClick(jobs.find(j => j.id === id) || job)}
                            onApplyClick={(j) => handleApplyClick(j)}
                            onViewDetails={(j) => setSelectedJobForDetail(j)}
                            isSaved={savedJobIds.includes(job.id)}
                            txcReward={15}
                            viewMode="card"
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E2E8F0] text-xs">
                      <span className="text-[#64748B]">
                        Showing <strong className="text-[#111827]">{(currentPage - 1) * pageSize + 1}</strong> -{' '}
                        <strong className="text-[#111827]">{Math.min(currentPage * pageSize, filteredJobs.length)}</strong> of{' '}
                        <strong className="text-[#111827]">{filteredJobs.length.toLocaleString()}</strong> vacancies
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => {
                            setCurrentPage(p => Math.max(1, p - 1));
                            const el = document.getElementById('latest-jobs-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-xs h-8 px-3 rounded-lg"
                        >
                          Previous
                        </Button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pNum = i + 1;
                          if (totalPages > 5 && currentPage > 3) {
                            pNum = currentPage - 2 + i;
                            if (pNum > totalPages) pNum = totalPages - (4 - i);
                          }
                          return (
                            <Button
                              key={pNum}
                              variant={currentPage === pNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                setCurrentPage(pNum);
                                const el = document.getElementById('latest-jobs-section');
                                if (el) el.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className={`text-xs h-8 w-8 p-0 rounded-lg ${
                                currentPage === pNum ? 'bg-[#2563EB] text-white font-bold' : 'text-[#475569]'
                              }`}
                            >
                              {pNum}
                            </Button>
                          );
                        })}

                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => {
                            setCurrentPage(p => Math.min(totalPages, p + 1));
                            const el = document.getElementById('latest-jobs-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="text-xs h-8 px-3 rounded-lg"
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}

                </div>
              
                {/* RIGHT SIDEBAR: AI Career Tools & Category Hub (Sticky beside jobs) */}
                <aside className="w-80 flex-shrink-0 hidden xl:block space-y-4" aria-label="AI Career Hub & Categories">
                  
                  {/* Block 1: AI Career Tools & Quality */}
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
                      <Sparkles className="w-4 h-4 text-[#7138E8]" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-[#111827]">
                        AI Career Tools
                      </h3>
                      <Badge variant="secondary" className="ml-auto bg-purple-50 text-[#7138E8] text-[10px] font-bold">
                        Verified
                      </Badge>
                    </div>

                    <div className="space-y-2.5">
                      {/* Tool 1: AI Compatibility Match */}
                      <div
                        onClick={() => setAiMatchModalOpen(true)}
                        className="p-3 rounded-xl border border-purple-200/80 hover:border-purple-400 bg-purple-50/30 hover:bg-purple-50/60 transition-all cursor-pointer flex items-start gap-2.5 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-[#7138E8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#111827] group-hover:text-[#7138E8] transition-colors leading-tight flex items-center justify-between">
                            <span>AI Compatibility Match</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#7138E8] group-hover:translate-x-0.5 transition-all" />
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                            Real-time skill gap analysis & instant score
                          </div>
                        </div>
                      </div>

                      {/* Tool 2: Zero Ghost Listings */}
                      <div
                        onClick={() => {
                          setSelectedSubTab('all');
                          setSelectedCategory8('all');
                          toast.success('Zero Ghost Listings: All active vacancies are unexpired, pre-screened and directly verified.');
                        }}
                        className="p-3 rounded-xl border border-blue-200/80 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50/60 transition-all cursor-pointer flex items-start gap-2.5 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#2563EB] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#111827] group-hover:text-[#2563EB] transition-colors leading-tight flex items-center justify-between">
                            <span>Zero Ghost Listings</span>
                            <span className="text-[10px] bg-blue-100 text-[#2563EB] font-bold px-1.5 py-0.2 rounded">100% Direct</span>
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                            100% unexpired verified routing
                          </div>
                        </div>
                      </div>

                      {/* Tool 3: AI Interview Simulator */}
                      <div
                        onClick={() => openInterviewCoach()}
                        className="p-3 rounded-xl border border-amber-200/80 hover:border-amber-400 bg-amber-50/30 hover:bg-amber-50/60 transition-all cursor-pointer flex items-start gap-2.5 group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#111827] group-hover:text-amber-700 transition-colors leading-tight flex items-center justify-between">
                            <span>AI Interview Simulator</span>
                            <ChevronRight className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all" />
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                            Practice specific role Q&A & feedback
                          </div>
                        </div>
                      </div>

                      {/* Tool 4: Transparent Benchmarks */}
                      <a
                        href={typeof window !== 'undefined' && window.location.hostname.includes('localhost') ? 'http://salary.localhost:8080' : 'https://salary.talentxcel.in'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3 rounded-xl border border-emerald-200/80 hover:border-emerald-400 bg-emerald-50/30 hover:bg-emerald-50/60 transition-all cursor-pointer flex items-start gap-2.5 group block"
                      >
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                          <BarChart3 className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-[#111827] group-hover:text-emerald-700 transition-colors leading-tight flex items-center justify-between">
                            <span>Transparent Benchmarks</span>
                            <ExternalLink className="w-3 h-3 text-[#94A3B8] group-hover:text-emerald-700" />
                          </div>
                          <div className="text-[11px] text-[#64748B] mt-0.5 leading-snug">
                            Real CTC percentiles & compensation
                          </div>
                        </div>
                      </a>
                    </div>
                  </div>

                  {/* Block 2: Browse by Industry / Category */}
                  <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-[#F1F5F9]">
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-[#2563EB]" />
                        <h3 className="text-xs font-black uppercase tracking-wider text-[#111827]">
                          Browse Categories
                        </h3>
                      </div>
                      {selectedCategory8 !== 'all' && (
                        <button
                          onClick={() => setSelectedCategory8('all')}
                          className="text-[10px] font-bold text-[#2563EB] hover:underline cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                      {CATEGORIES_DATA.map(cat => {
                        const Icon = cat.icon;
                        const isSelected = selectedCategory8 === cat.id;

                        return (
                          <div
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory8(isSelected ? 'all' : cat.id);
                              setCurrentPage(1);
                            }}
                            className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50/90 border-[#2563EB] shadow-2xs ring-1 ring-[#2563EB]'
                                : 'bg-white border-transparent hover:border-[#E2E8F0] hover:bg-slate-50/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cat.bg} ${cat.iconColor}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className={`text-xs font-semibold truncate ${isSelected ? 'text-[#2563EB]' : 'text-[#334155]'}`}>
                                {cat.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold font-mono text-[#64748B] bg-slate-100 px-1.5 py-0.5 rounded-md shrink-0">
                              {cat.count}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </aside>
</div>
            </section>

            {/* Comprehensive Marketplace Discovery Grids (Cities, Categories, Employers) */}
            <div id="companies-discovery-grid" className="py-12 border-t border-[#E2E8F0] bg-white">
              <JobPortalDiscoveryGrid 
                onSelectCategory={(cat) => {
                  setSelectedIndustry(cat.id.includes('soft') ? 'it-software' : cat.id.includes('bank') ? 'banking-finance' : 'all');
                  setSearchTerm(cat.name);
                  const el = document.getElementById('search-hero');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onSelectLocation={(loc) => {
                  setSelectedCity(loc.slug);
                  const el = document.getElementById('search-hero');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                onSelectCompany={(comp) => {
                  setSearchTerm(comp.name);
                  const el = document.getElementById('search-hero');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                totalActiveCount={totalCount}
                recent30DaysCount={1688}
              />
            </div>

            {/* Comprehensive Public Career Guides */}
            <div id="career-resources-section">
              <CareerResourcesSection />
            </div>
          </div>
        )}

        {/* VIEW 2: AI MATCH & PROFILE */}
        {activeTab === 'match' && (
          <div className="px-4 max-w-5xl mx-auto py-10">
            <AIMatchWorkspace
              jobs={jobs}
              onApplyJob={handleApplyClick}
              onOpenJobDetail={(j) => setSelectedJobForDetail(j)}
              isSavedJob={(id) => savedJobIds.includes(id)}
              onToggleSaveJob={(id) => toggleSaveJob(id)}
            />
          </div>
        )}

        {/* VIEW 3: APPLICATION TRACKER */}
        {activeTab === 'tracker' && (
          <div className="px-4 max-w-5xl mx-auto py-10">
            <CandidateApplicationTracker
              onBrowseJobs={() => setActiveTab('discover')}
              onLaunchInterviewPrep={(t, c) => {
                const found = jobs.find(j => j.title.toLowerCase().includes(t.toLowerCase()));
                if (found) setSelectedJobForInterview(found);
                setActiveTab('interview');
              }}
            />
          </div>
        )}

        {/* VIEW 4: SAVED JOBS */}
        {activeTab === 'saved' && (
          <div className="px-4 max-w-5xl mx-auto py-10 space-y-6 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="font-black text-xl text-[#111827]">Your Saved Vacancies ({savedJobIds.length})</h3>
                <p className="text-xs text-[#64748B]">Bookmarked opportunities ready for 1-click application.</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab('discover')}
                className="text-xs rounded-xl"
              >
                ← Back to All Vacancies
              </Button>
            </div>

            {savedJobIds.length === 0 ? (
              <div className="bg-white border border-[#E2E8F0] p-12 rounded-2xl text-center space-y-3">
                <Bookmark className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-base text-[#111827]">No saved vacancies yet</h4>
                <p className="text-xs text-[#64748B]">Click the bookmark icon on any job card to save it for later review.</p>
                <Button size="sm" onClick={() => setActiveTab('discover')} className="text-xs bg-[#2563EB] text-white rounded-xl">
                  Explore Active Vacancies
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.filter(j => savedJobIds.includes(j.id)).map(job => (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobForDetail(job)}
                    className="bg-white border border-[#E2E8F0] hover:border-[#2563EB]/60 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer text-left"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <CompanyLogoAvatar companyName={job.company_name} size="lg" className="shrink-0" />
                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="font-bold text-sm sm:text-base text-[#111827] hover:text-[#2563EB] transition-colors leading-snug">
                          {job.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                          <span className="font-semibold text-[#334155]">{job.company_name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#64748B] flex-wrap pt-0.5">
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{job.location || 'India'}</span>
                          <span>•</span>
                          <span className="font-semibold text-emerald-700">{formatSalary(job.salary_min, job.salary_max) || 'Best in Industry'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => toggleSaveJob(job.id, e)}
                        className="h-9 w-9 p-0 rounded-xl text-amber-500 fill-amber-500"
                        title="Remove from Saved"
                      >
                        <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApplyClick(job)}
                        className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VIEW 5: EMPLOYER WORKSPACE */}
        {activeTab === 'employer' && (
          <div className="px-4 max-w-5xl mx-auto py-10">
            <EmployerRequisitionWorkspace
              onJobPublished={(newJob) => setJobs(prev => [newJob, ...prev])}
              onBackToPortal={() => setActiveTab('discover')}
            />
          </div>
        )}

        {/* VIEW 6: RECRUITER TALENT SEARCH */}
        {activeTab === 'talent' && (
          <div className="px-4 max-w-5xl mx-auto py-10">
            <RecruiterTalentSearch
              onContactCandidate={(c) => toast.success(`InMail invitation sent to ${c.full_name}`)}
              onBackToJobs={() => setActiveTab('discover')}
            />
          </div>
        )}

        {/* VIEW 7: AI INTERVIEW COACH */}
        {activeTab === 'interview' && (
          <div className="px-4 max-w-5xl mx-auto py-10">
            <AIInterviewPrepCoach
              jobs={jobs}
              selectedJob={selectedJobForInterview}
              onClose={() => setActiveTab('discover')}
            />
          </div>
        )}
      </main>

      {/* Floating 12-Platform Quick Explorer (Desktop only; on mobile accessible via menu) */}
      <div className="hidden md:flex fixed bottom-5 right-5 z-40">
        <button
          onClick={() => setPlatformSidebarOpen(true)}
          className="bg-[#111827] hover:bg-black text-white px-4 py-2.5 rounded-full shadow-2xl border border-slate-700 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 cursor-pointer"
        >
          <Compass className="w-4 h-4 text-blue-400 animate-spin-slow" />
          <span>Explore All 12 Platforms</span>
        </button>
      </div>

      {/* Mobile App Bottom Navigation Bar matching Image 1 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] px-4 py-2 flex items-center justify-around shadow-lg">
        <button 
          onClick={() => {
            setActiveTab('discover');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }} 
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer ${activeTab === 'discover' ? 'text-[#2563EB]' : 'text-[#64748B]'}`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Jobs</span>
        </button>
        <button 
          onClick={() => setActiveTab('match')} 
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer ${activeTab === 'match' ? 'text-[#2563EB]' : 'text-[#64748B]'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Match</span>
        </button>
        <button 
          onClick={() => setActiveTab('employer')} 
          className="w-9 h-9 rounded-full bg-gradient-to-r from-[#2563EB] to-[#7138E8] text-white flex items-center justify-center shadow-md active:scale-95 cursor-pointer -mt-2"
          title="Post a Job"
        >
          <Plus className="w-5 h-5 text-white" />
        </button>
        <button 
          onClick={() => setActiveTab('tracker')} 
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer ${activeTab === 'tracker' ? 'text-[#2563EB]' : 'text-[#64748B]'}`}
        >
          <Clock className="w-4 h-4" />
          <span>Applied ({trackedApplicationsCount})</span>
        </button>
        <button 
          onClick={() => setActiveTab('saved')} 
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold cursor-pointer ${activeTab === 'saved' ? 'text-[#2563EB]' : 'text-[#64748B]'}`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved ({savedJobIds.length})</span>
        </button>
      </nav>

      {/* Mobile Filters Slide-Up Drawer */}
      {typeof document !== 'undefined' && mobileFilterDrawerOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) setMobileFilterDrawerOpen(false);
          }}
        >
          <div 
            className="relative bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-4 sm:p-5 shadow-2xl border border-[#E2E8F0] animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] mb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#2563EB]" />
                <h3 className="text-sm font-bold text-[#111827]">Filter Vacancies</h3>
              </div>
              <button
                onClick={() => setMobileFilterDrawerOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <ComprehensiveJobFilters
              filters={sidebarFilters}
              onFiltersChange={(f) => {
                setSidebarFilters(f);
                setCurrentPage(1);
              }}
              onClearFilters={() => {
                setSidebarFilters({
                  search: '', location: '', employment_type: [], experience_level: [],
                  salary_min: 0, salary_max: 0, is_remote: false, skills: [],
                  department: [], company_type: [], work_mode: [], industry: [],
                  role_category: [], education: [], posted_by: [], freshness: [], company_id: ''
                });
                resetAllFilters();
              }}
              className="border-0 shadow-none p-0"
            />
            <div className="pt-4 border-t border-[#E2E8F0] mt-4 flex items-center gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => {
                  resetAllFilters();
                  setMobileFilterDrawerOpen(false);
                }}
              >
                Reset All
              </Button>
              <Button
                className="flex-1 bg-[#2563EB] text-white text-xs font-bold"
                onClick={() => setMobileFilterDrawerOpen(false)}
              >
                Apply Filters ({filteredJobs.length.toLocaleString()})
              </Button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 12 Platform Ecosystem Drawer */}
      <PlatformEcosystemSidebar
        isOpen={platformSidebarOpen}
        onClose={() => setPlatformSidebarOpen(false)}
      />

      {/* Job Detail Drawer */}
      {selectedJobForDetail && (
        <JobDetailDrawer
          job={selectedJobForDetail}
          onClose={() => setSelectedJobForDetail(null)}
          onApply={(job) => {
            setSelectedJobForDetail(null);
            handleApplyClick(job);
          }}
          onLaunchMatch={(job) => {
            setSelectedJobForDetail(null);
            setActiveTab('match');
          }}
          onLaunchInterviewPrep={(job) => {
            setSelectedJobForDetail(null);
            setSelectedJobForInterview(job);
            setActiveTab('interview');
          }}
          isSaved={savedJobIds.includes(selectedJobForDetail.id)}
          onToggleSave={(id) => toggleSaveJob(id)}
        />
      )}

      {/* 1-Click Direct Application Modal */}
      {selectedJobForApply && (
        <GuestJobApplyModal
          job={selectedJobForApply}
          isOpen={true}
          onClose={() => setSelectedJobForApply(null)}
          onSuccess={() => {
            setTrackedApplicationsCount(prev => prev + 1);
            toast.success('Your application has been delivered to the employer hiring coordinator.');
          }}
        />
      )}

      {/* Consolidated AI Interview Prep Modal (Portaled directly to document.body) */}
      {typeof document !== 'undefined' && (interviewModalOpen || selectedJobForInterview) && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setInterviewModalOpen(false);
              setSelectedJobForInterview(null);
            }
          }}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-[#E2E8F0] my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7138E8] flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-[#7138E8]" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#111827]">AI Interview Simulator & STAR Practice Coach</h3>
                  <p className="text-xs text-[#64748B]">Real-time role-specific interview simulation, timed responses & STAR answer frameworks.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setInterviewModalOpen(false);
                  setSelectedJobForInterview(null);
                }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AIInterviewPrepCoach
              jobs={jobs}
              selectedJob={selectedJobForInterview || jobs[0]}
              onClose={() => {
                setInterviewModalOpen(false);
                setSelectedJobForInterview(null);
              }}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Interactive AI Compatibility Match Modal (Portaled directly to document.body) */}
      {typeof document !== 'undefined' && aiMatchModalOpen && createPortal(
        <div 
          className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setAiMatchModalOpen(false);
          }}
        >
          <div 
            className="relative bg-white rounded-3xl max-w-4xl w-full max-h-[88vh] overflow-y-auto p-5 sm:p-6 shadow-2xl border border-[#E2E8F0] my-auto animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#7138E8] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#111827]">AI Compatibility Match & Skill-Gap Analysis</h3>
                  <p className="text-xs text-[#64748B]">Calculate real-time fit scores against 2,236+ verified vacancies.</p>
                </div>
              </div>
              <button
                onClick={() => setAiMatchModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <AIMatchWorkspace
              jobs={jobs}
              onApplyJob={(j) => {
                setAiMatchModalOpen(false);
                handleApplyClick(j);
              }}
              onOpenJobDetail={(j) => {
                setAiMatchModalOpen(false);
                setSelectedJobForDetail(j);
              }}
              isSavedJob={(id) => savedJobIds.includes(id)}
              onToggleSaveJob={(id) => toggleSaveJob(id)}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Public Light Footer */}
      <JobPortalFooter onNavigateToTab={(tab) => setActiveTab(tab)} />
    </div>
  );
};

export default JobMatchProduct;
