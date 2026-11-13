// src/components/products/jobmatch/InternationalJobLandingPage.tsx
// High-Authority International SEO Landing Page Engine for JobMatch Global Expansion
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)
// Fulfills Phase 5 (SEO URL Structure) & Phase 6 (JobPosting / Schema.org) requirements

import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  Share2, 
  Bookmark, 
  ArrowLeft, 
  ExternalLink, 
  Sparkles, 
  AlertCircle,
  FileText,
  Calendar,
  Layers,
  ShieldCheck,
  ChevronRight,
  Globe,
  Coins,
  ArrowUpRight,
  Filter,
  GraduationCap,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { JobPortalHeader } from './JobPortalHeader';
import { JobPortalFooter } from './JobPortalFooter';
import { JobDetailDrawer, JobDetailItem } from './JobDetailDrawer';
import { GuestJobApplyModal } from '@/components/jobs/GuestJobApplyModal';
import { CompanyLogoAvatar } from './CompanyLogoAvatar';

export interface InternationalHubConfig {
  slug: string;
  roleTitle: string;
  city: string;
  country: string;
  countryCode: string;
  flag: string;
  currency: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  regionalMarketHighlights: string[];
  visaAndWorkAuthNote: string;
  searchFilter: {
    cityMatch?: string;
    countryMatch?: string;
    isRemote?: boolean;
    roleKeywords: string[];
  };
  relatedHubs: { slug: string; title: string; location: string }[];
}

export const INTERNATIONAL_HUBS: Record<string, InternationalHubConfig> = {
  'data-analyst-dubai-uae': {
    slug: 'data-analyst-dubai-uae',
    roleTitle: 'Data Analyst & Analytics Engineer',
    city: 'Dubai',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    flag: '🇦🇪',
    currency: 'AED',
    metaTitle: 'Data Analyst Jobs in Dubai, UAE (2026) — Verified Vacancies in AED | TalentXcel Jobs',
    metaDescription: 'Explore verified Data Analyst and Analytics Engineer jobs in Dubai, UAE. Direct employer routing to Tabby FinTech, Careem, and Dubai tech firms with verified AED compensation and UAE visa sponsorship.',
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/data-analyst-dubai-uae',
    regionalMarketHighlights: [
      '100% Tax-free compensation packages benchmarked in AED (UAE Dirhams).',
      'UAE Labour Law & MOHRE compliant employment residence visa sponsorship provided by verified employers.',
      'Tier-1 technology and commerce hubs: Dubai Internet City (DIC), Dubai Silicon Oasis (DSO), and DIFC Innovation Hub.',
      'End-of-service gratuity and private comprehensive medical insurance mandated by UAE federal regulations.'
    ],
    visaAndWorkAuthNote: 'UAE Labour Law requires employers to sponsor international hires with an entry permit and 2-year renewable employment residence visa upon signed offer acceptance.',
    searchFilter: {
      cityMatch: 'Dubai',
      countryMatch: 'United Arab Emirates',
      roleKeywords: ['data', 'analyst', 'analytics', 'dbt', 'snowflake', 'python', 'bi']
    },
    relatedHubs: [
      { slug: 'software-engineer-abu-dhabi-uae', title: 'Software Engineer Jobs', location: 'Abu Dhabi, UAE' },
      { slug: 'cloud-engineer-riyadh-saudi-arabia', title: 'Cloud Engineer Jobs', location: 'Riyadh, Saudi Arabia' },
      { slug: 'data-analyst-remote-usa', title: 'Data Analyst Jobs (Remote)', location: 'United States' }
    ]
  },
  'software-engineer-abu-dhabi-uae': {
    slug: 'software-engineer-abu-dhabi-uae',
    roleTitle: 'Software Engineer & Systems Specialist',
    city: 'Abu Dhabi',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    flag: '🇦🇪',
    currency: 'AED',
    metaTitle: 'Software Engineer Jobs in Abu Dhabi, UAE (2026) — Verified Vacancies in AED | TalentXcel Jobs',
    metaDescription: 'Apply for verified Software Engineer and Systems Analyst roles in Abu Dhabi, UAE. Official vacancies at First Abu Dhabi Bank (FAB), ADNOC, and Cleveland Clinic Abu Dhabi with verified AED salaries.',
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/software-engineer-abu-dhabi-uae',
    regionalMarketHighlights: [
      'Competitive tax-free AED salaries with comprehensive family health coverage and schooling allowances.',
      'Prominent sovereign and financial enterprise hubs: Abu Dhabi Global Market (ADGM), Hub71 tech ecosystem, and Masdar City.',
      'Sovereign AI and industrial digital transformation backed by G42, ADNOC Digital, and First Abu Dhabi Bank.',
      'Full UAE residence visa sponsorship and relocation flight allowance confirmed for qualified candidates.'
    ],
    visaAndWorkAuthNote: 'Sovereign entities and multinational institutions in Abu Dhabi process full UAE Ministry of Human Resources & Emiratisation (MOHRE) employment residency permits.',
    searchFilter: {
      cityMatch: 'Abu Dhabi',
      countryMatch: 'United Arab Emirates',
      roleKeywords: ['software', 'engineer', 'systems', 'analyst', 'cloud', 'mechanical', 'data']
    },
    relatedHubs: [
      { slug: 'data-analyst-dubai-uae', title: 'Data Analyst Jobs', location: 'Dubai, UAE' },
      { slug: 'cloud-engineer-riyadh-saudi-arabia', title: 'Cloud Engineer Jobs', location: 'Riyadh, Saudi Arabia' },
      { slug: 'software-engineer-remote-us', title: 'Software Engineer (Remote)', location: 'USA & Global' }
    ]
  },
  'cloud-engineer-riyadh-saudi-arabia': {
    slug: 'cloud-engineer-riyadh-saudi-arabia',
    roleTitle: 'Cloud Engineer & Infrastructure Architect',
    city: 'Riyadh',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    flag: '🇸🇦',
    currency: 'SAR',
    metaTitle: 'Cloud Engineer Jobs in Riyadh, Saudi Arabia (2026) — Verified SAR Vacancies | TalentXcel Jobs',
    metaDescription: 'Discover verified Cloud Engineer and Sovereign Cloud Architect positions in Riyadh, Saudi Arabia. Explore tier-1 openings at Aramco Digital and Saudi enterprise hubs with verified SAR compensation.',
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/cloud-engineer-riyadh-saudi-arabia',
    regionalMarketHighlights: [
      'High-growth compensation packages benchmarked in Saudi Riyals (SAR) with substantial relocation bonuses.',
      'Driven by Saudi Vision 2030 digital infrastructure initiatives, sovereign cloud frameworks, and industrial AI expansion.',
      'Key financial and tech districts: King Abdullah Financial District (KAFD) and Riyadh Digital City.',
      'Employer-sponsored Iqama (residency visa) with full medical coverage under Saudi Labour Law and GOSI registration.'
    ],
    visaAndWorkAuthNote: 'International hires in Riyadh receive full Iqama sponsorship and relocation logistics support under the Saudi Ministry of Human Resources regulations.',
    searchFilter: {
      cityMatch: 'Riyadh',
      countryMatch: 'Saudi Arabia',
      roleKeywords: ['cloud', 'architect', 'infrastructure', 'systems', 'devops', 'engineer']
    },
    relatedHubs: [
      { slug: 'data-analyst-dubai-uae', title: 'Data Analyst Jobs', location: 'Dubai, UAE' },
      { slug: 'software-engineer-abu-dhabi-uae', title: 'Software Engineer Jobs', location: 'Abu Dhabi, UAE' },
      { slug: 'software-engineer-remote-us', title: 'Software Engineer (Remote)', location: 'USA & Global' }
    ]
  },
  'data-analyst-remote-usa': {
    slug: 'data-analyst-remote-usa',
    roleTitle: 'Data Analyst & Quantitative Specialist (Remote USA)',
    city: 'United States (Remote)',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    currency: 'USD',
    metaTitle: 'Data Analyst Remote Jobs in USA (2026) — Verified USD Compensation | TalentXcel Jobs',
    metaDescription: 'Browse verified remote Data Analyst jobs based in the United States. Direct applications to JPMorgan Chase, Capital One, and US employers. Verified USD salary benchmarks and clear US work authorization terms.',
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/data-analyst-remote-usa',
    regionalMarketHighlights: [
      'Transparent USD compensation benchmarks ranging from $95,000 to $145,000+ with 401(k) matching and equity.',
      'Remote work eligibility within US domestic timezones (EST, CST, PST).',
      'High-demand sectors: Quantitative credit risk, financial engineering, healthcare informatics, and marketing attribution.',
      'Strict applicant transparency: Clearly separates domestic W-2 roles requiring US work authorization from international contracts.'
    ],
    visaAndWorkAuthNote: 'US domestic remote positions require valid United States work authorization (US Citizen, Permanent Resident / Green Card, or valid employment visa). Employer sponsorship is explicitly noted where available.',
    searchFilter: {
      countryMatch: 'United States',
      roleKeywords: ['data', 'analyst', 'quantitative', 'analytics', 'sql', 'python']
    },
    relatedHubs: [
      { slug: 'software-engineer-remote-us', title: 'Software Engineer Remote Jobs', location: 'USA & Worldwide' },
      { slug: 'data-analyst-dubai-uae', title: 'Data Analyst Jobs', location: 'Dubai, UAE' },
      { slug: 'cloud-engineer-riyadh-saudi-arabia', title: 'Cloud Engineer Jobs', location: 'Riyadh, Saudi Arabia' }
    ]
  },
  'software-engineer-remote-us': {
    slug: 'software-engineer-remote-us',
    roleTitle: 'Software Engineer (Remote US & Global)',
    city: 'Remote (USA & Global)',
    country: 'United States & Worldwide',
    countryCode: 'US',
    flag: '🇺🇸',
    currency: 'USD',
    metaTitle: 'Remote Software Engineer Jobs USA & Global (2026) — Verified USD Salaries | TalentXcel Jobs',
    metaDescription: 'Verified remote Software Engineer openings with top US and global all-remote employers including Microsoft, AWS, Snowflake, GitLab, and Automattic. Filter by US-only and international remote eligibility.',
    canonicalUrl: 'https://jobs.talentxcel.in/jobs/software-engineer-remote-us',
    regionalMarketHighlights: [
      'Verified compensation benchmarked in USD ($110,000 to $205,000+ base) with generous equity grants and wellness stipends.',
      'Pioneering all-remote engineering cultures with asynchronous collaboration across North America, Europe, and Asia-Pacific.',
      'Clear applicant requirements: Distinguishes between US-only domestic roles and Worldwide Remote roles open to applicants in India and 65+ countries.',
      'Mission-critical technology stacks: Distributed systems, Kubernetes orchestration, LLM inference serving, and CI/CD pipelines.'
    ],
    visaAndWorkAuthNote: 'Worldwide Remote listings (such as GitLab and Automattic) are open to candidates residing in India and internationally without US visa requirements. US-based roles specify US work authorization requirements.',
    searchFilter: {
      roleKeywords: ['software', 'engineer', 'backend', 'cloud', 'systems', 'platform', 'developer']
    },
    relatedHubs: [
      { slug: 'data-analyst-remote-usa', title: 'Data Analyst Remote Jobs', location: 'United States' },
      { slug: 'software-engineer-abu-dhabi-uae', title: 'Software Engineer Jobs', location: 'Abu Dhabi, UAE' },
      { slug: 'data-analyst-dubai-uae', title: 'Data Analyst Jobs', location: 'Dubai, UAE' }
    ]
  }
};

export const InternationalJobLandingPage: React.FC<{ hubId?: string }> = ({ hubId: propHubId }) => {
  const { hubSlug: paramHubSlug, slugOrId } = useParams<{ hubSlug?: string; slugOrId?: string }>();
  const navigate = useNavigate();

  // Resolve target hub configuration
  const currentSlug = propHubId || paramHubSlug || slugOrId || 'data-analyst-dubai-uae';
  const hubConfig = INTERNATIONAL_HUBS[currentSlug] || null;

  const [jobs, setJobs] = useState<JobDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [selectedSubFilter, setSelectedSubFilter] = useState<'all' | 'visa_sponsored' | 'remote' | 'high_salary'>('all');

  const [selectedJobForDetail, setSelectedJobForDetail] = useState<JobDetailItem | null>(null);
  const [selectedJobForApply, setSelectedJobForApply] = useState<JobDetailItem | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('txc_saved_jobs') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (hubConfig) {
      fetchHubJobs();
    } else {
      setLoading(false);
    }
  }, [currentSlug]);

  const fetchHubJobs = async () => {
    if (!hubConfig) return;
    setLoading(true);
    setErrorState(null);

    try {
      // 1. Query Supabase for active vacancies
      let query = supabase
        .from('jobs')
        .select('id, title, company_name, location, location_city, location_state, employment_type, is_remote, work_mode, salary_min, salary_max, salary_currency, applicant_location_requirements, description, department, industry, external_url, skills_required, application_deadline, expires_at, created_at, job_summary, min_experience, max_experience, structured_data')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (hubConfig.searchFilter.cityMatch) {
        query = query.ilike('location', `%${hubConfig.searchFilter.cityMatch}%`);
      } else if (hubConfig.countryCode === 'US') {
        query = query.or('location.ilike.%United States%,location.ilike.%USA%,location.ilike.%Austin%,location.ilike.%Seattle%,location.ilike.%New York%,location.ilike.%San Francisco%,is_remote.eq.true');
      } else if (hubConfig.searchFilter.countryMatch) {
        query = query.ilike('location', `%${hubConfig.searchFilter.countryMatch}%`);
      }

      const { data, error } = await query.limit(100);

      if (error) {
        console.error('Supabase jobs fetch error:', error);
        setErrorState('Unable to load vacancies for this regional hub.');
        setJobs([]);
        return;
      }

      const now = new Date();
      const unexpired = (data || []).filter(j => {
        if (j.application_deadline && new Date(j.application_deadline) < now) return false;
        if (j.expires_at && new Date(j.expires_at) < now) return false;
        return true;
      });

      // 2. Filter matching this specific international hub
      const matched = unexpired.filter(j => {
        const fullLoc = `${j.location || ''} ${j.location_city || ''} ${j.location_state || ''}`.toLowerCase();
        const fullText = `${j.title} ${j.company_name} ${j.department || ''} ${j.skills_required?.join(' ') || ''} ${(j as any).applicant_location_requirements || ''}`.toLowerCase();

        // City & Country matching
        if (hubConfig.searchFilter.cityMatch) {
          const cityQuery = hubConfig.searchFilter.cityMatch.toLowerCase();
          if (!fullLoc.includes(cityQuery)) return false;
        } else if (hubConfig.searchFilter.countryMatch) {
          const countryQuery = hubConfig.searchFilter.countryMatch.toLowerCase();
          const isUS = fullLoc.includes('united states') || fullLoc.includes('usa') || fullLoc.includes('seattle') || fullLoc.includes('austin') || fullLoc.includes('new york') || fullLoc.includes('san francisco');
          if (hubConfig.countryCode === 'US' && !isUS && !fullLoc.includes('remote')) return false;
        }

        // Role keywords matching
        const hasRoleKeyword = hubConfig.searchFilter.roleKeywords.some(kw => 
          fullText.includes(kw.toLowerCase()) || j.title.toLowerCase().includes(kw.toLowerCase())
        );

        return hasRoleKeyword;
      });

      setJobs(matched as any);
    } catch (e: any) {
      console.error('Hub jobs exception:', e);
      setErrorState('Error connecting to employment database.');
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredHubJobs = useMemo(() => {
    return jobs.filter(j => {
      if (selectedSubFilter === 'visa_sponsored') {
        const elig = `${(j as any).applicant_location_requirements || ''} ${j.location || ''}`.toLowerCase();
        return elig.includes('visa sponsored') || elig.includes('relocation') || elig.includes('residence visa');
      }
      if (selectedSubFilter === 'remote') {
        return j.is_remote || (j.work_mode || '').toLowerCase() === 'remote' || (j.location || '').toLowerCase().includes('remote');
      }
      if (selectedSubFilter === 'high_salary') {
        return (j.salary_min || 0) >= 150000;
      }
      return true;
    });
  }, [jobs, selectedSubFilter]);

  const toggleSaveJob = (jobId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSavedJobIds(prev => {
      const next = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem('txc_saved_jobs', JSON.stringify(next));
      } catch {}
      toast.success(next.includes(jobId) ? 'Job saved to bookmarks' : 'Job removed from bookmarks');
      return next;
    });
  };

  const formatHubSalary = (min?: number, max?: number, currency?: string) => {
    if (!min || min <= 0) return 'Market Competitive';
    const curr = (currency || hubConfig?.currency || 'AED').toUpperCase();
    const minK = Math.round(min / 1000);
    const maxK = max ? Math.round(max / 1000) : null;
    const prefix = curr === 'USD' ? '$' : `${curr} `;
    return maxK && maxK !== minK ? `${prefix}${minK}k – ${maxK}k / yr` : `${prefix}${minK}k / yr`;
  };

  if (!hubConfig) {
    return (
      <div className="min-h-screen bg-[#F4F7FC] flex flex-col font-sans">
        <JobPortalHeader activeTab="find" />
        <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-16 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-2xl font-black text-[#111827]">International Hub Not Found</h2>
          <p className="text-sm text-[#64748B] max-w-md mx-auto">
            The requested international employment route is not an active curated regional hub.
          </p>
          <div className="pt-2">
            <Button onClick={() => navigate('/jobs')} className="bg-[#2563EB] text-white text-xs font-bold px-6 rounded-xl">
              Return to All Jobs
            </Button>
          </div>
        </main>
        <JobPortalFooter />
      </div>
    );
  }

  // Schema.org CollectionPage & ItemList Structured Data
  const hasGenuineJobs = jobs.length > 0;
  const isEligibleForIndexing = hasGenuineJobs;

  const itemListSchema = hasGenuineJobs ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": hubConfig.metaTitle,
    "description": hubConfig.metaDescription,
    "numberOfItems": jobs.length,
    "itemListElement": jobs.map((job, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "item": {
        "@type": "JobPosting",
        "title": job.title,
        "hiringOrganization": {
          "@type": "Organization",
          "name": job.company_name
        },
        "jobLocation": job.is_remote ? undefined : {
          "@type": "Place",
          "address": {
            "@type": "PostalAddress",
            "addressLocality": job.location_city || hubConfig.city,
            "addressCountry": hubConfig.countryCode
          }
        },
        ...(job.is_remote ? { "jobLocationType": "TELECOMMUTE" } : {}),
        "applicantLocationRequirements": {
          "@type": "Country",
          "name": (job as any).applicant_location_requirements || hubConfig.country
        },
        "baseSalary": job.salary_min ? {
          "@type": "MonetaryAmount",
          "currency": (job as any).salary_currency || hubConfig.currency,
          "value": {
            "@type": "QuantitativeValue",
            "minValue": job.salary_min,
            "maxValue": job.salary_max || job.salary_min,
            "unitText": "YEAR"
          }
        } : undefined,
        "datePosted": job.created_at
      }
    }))
  } : null;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "TalentXcel Jobs", "item": "https://jobs.talentxcel.in" },
      { "@type": "ListItem", "position": 2, "name": "International Employment", "item": "https://jobs.talentxcel.in/jobs" },
      { "@type": "ListItem", "position": 3, "name": hubConfig.country, "item": "https://jobs.talentxcel.in/jobs" },
      { "@type": "ListItem", "position": 4, "name": `${hubConfig.roleTitle} in ${hubConfig.city}`, "item": hubConfig.canonicalUrl }
    ]
  };

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      {/* ── SEO Metadata & Canonical Head ── */}
      <Helmet>
        <title>{hubConfig.metaTitle}</title>
        <meta name="description" content={hubConfig.metaDescription} />
        <link rel="canonical" href={hubConfig.canonicalUrl} />
        <meta 
          name="robots" 
          content={isEligibleForIndexing ? "index, follow, max-snippet:-1, max-image-preview:large" : "noindex, follow"} 
        />
        <meta property="og:title" content={hubConfig.metaTitle} />
        <meta property="og:description" content={hubConfig.metaDescription} />
        <meta property="og:url" content={hubConfig.canonicalUrl} />
        <meta property="og:type" content="website" />
        {itemListSchema && (
          <script type="application/ld+json">
            {JSON.stringify(itemListSchema)}
          </script>
        )}
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      </Helmet>

      {/* Header */}
      <JobPortalHeader activeTab="find" />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8 text-left">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B] flex-wrap">
          <Link to="/" className="hover:text-[#2563EB] transition-colors">TalentXcel Jobs</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link to="/jobs" className="hover:text-[#2563EB] transition-colors">International Jobs</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-[#475569]">{hubConfig.country}</span>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-[#111827] font-semibold">{hubConfig.city} {hubConfig.roleTitle}</span>
        </nav>

        {/* Hero Banner with Regional Authority */}
        <div className="bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-100/50 via-purple-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 flex items-center gap-1.5">
                <span>{hubConfig.flag}</span>
                <span>{hubConfig.country} Hub</span>
              </span>
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Verified Active Vacancies
              </Badge>
              <Badge variant="outline" className="text-[#7138E8] bg-purple-50 border-purple-200 text-xs font-bold">
                Currency: {hubConfig.currency}
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#111827] tracking-tight leading-tight">
              {hubConfig.roleTitle} Vacancies in {hubConfig.city}, {hubConfig.country}
            </h1>

            <p className="text-xs sm:text-sm text-[#475569] leading-relaxed">
              Verified employment openings in {hubConfig.city} with transparent compensation benchmarked directly in {hubConfig.currency}. Zero ghost listings, direct unexpired employer routing, and confirmed visa/work authorization transparency.
            </p>

            <div className="pt-1 flex items-center gap-3 text-xs text-[#64748B] flex-wrap">
              <span className="flex items-center gap-1 font-semibold text-[#111827]">
                <Briefcase className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>{jobs.length} Verified Vacancies Live</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-600" />
                <span>Benchmarked in {hubConfig.currency}</span>
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">100% Screened Employers</span>
            </div>
          </div>
        </div>

        {/* Regional Market Intelligence Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#111827] uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-[#2563EB]" />
              <span>{hubConfig.city} & {hubConfig.country} Regional Market Intelligence</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#475569]">
              {hubConfig.regionalMarketHighlights.map((highlight, i) => (
                <div key={i} className="p-3 rounded-2xl bg-[#F4F7FC] border border-[#E2E8F0] space-y-1">
                  <span className="font-bold text-[#111827] block">✓ Highlight {i + 1}</span>
                  <p className="text-[11px] leading-relaxed">{highlight}</p>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Work Authorization & Visa Policy</span>
              </div>
              <p className="text-[11px] text-amber-900/90 leading-relaxed">
                {hubConfig.visaAndWorkAuthNote}
              </p>
            </div>
          </div>

          {/* Quick Cross-Hub Navigation */}
          <div className="bg-white border border-[#E2E8F0] p-6 rounded-3xl shadow-xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Related Regional Hubs</span>
              </h3>
              <div className="space-y-2">
                {hubConfig.relatedHubs.map((rh, idx) => (
                  <Link
                    key={idx}
                    to={`/jobs/${rh.slug}`}
                    className="p-2.5 rounded-xl border border-[#E2E8F0] hover:border-[#2563EB] bg-[#F4F7FC] hover:bg-blue-50/50 block transition-all group"
                  >
                    <div className="text-xs font-bold text-[#111827] group-hover:text-[#2563EB] flex items-center justify-between">
                      <span>{rh.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2563EB]" />
                    </div>
                    <div className="text-[10px] text-[#64748B]">{rh.location}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0]">
              <Link 
                to="/jobs" 
                className="text-xs font-bold text-[#2563EB] hover:text-[#7138E8] flex items-center gap-1"
              >
                <span>Browse All 2,280+ Live Jobs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live Vacancy Inventory Section */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] pb-3">
            <div>
              <h2 className="text-lg font-bold text-[#111827] flex items-center gap-2">
                <span>Verified Vacancies Currently Open</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB]">
                  {filteredHubJobs.length} Live
                </span>
              </h2>
              <p className="text-xs text-[#64748B]">All opportunities verified for active employer routing with zero ghost listings.</p>
            </div>

            {/* Sub-Filters */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
              <button
                onClick={() => setSelectedSubFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSubFilter === 'all'
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'bg-white text-[#475569] hover:bg-slate-100 border border-[#E2E8F0]'
                }`}
              >
                All Vacancies
              </button>
              <button
                onClick={() => setSelectedSubFilter('visa_sponsored')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSubFilter === 'visa_sponsored'
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'bg-white text-[#475569] hover:bg-slate-100 border border-[#E2E8F0]'
                }`}
              >
                Visa Sponsored / Relocation
              </button>
              <button
                onClick={() => setSelectedSubFilter('remote')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSubFilter === 'remote'
                    ? 'bg-[#2563EB] text-white shadow-2xs'
                    : 'bg-white text-[#475569] hover:bg-slate-100 border border-[#E2E8F0]'
                }`}
              >
                Remote / Hybrid
              </button>
            </div>
          </div>

          {loading ? (
            <div className="bg-white border border-[#E2E8F0] p-12 rounded-3xl text-center space-y-3">
              <Clock className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
              <div className="text-xs font-bold text-[#111827]">Querying live vacancies for {hubConfig.city}...</div>
            </div>
          ) : filteredHubJobs.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] p-12 rounded-3xl text-center space-y-3">
              <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="font-bold text-base text-[#111827]">No active openings matching filter</h4>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                No vacancies currently match the selected sub-filter. Select "All Vacancies" or browse related hubs.
              </p>
              <Button onClick={() => setSelectedSubFilter('all')} size="sm" className="bg-[#2563EB] text-white text-xs rounded-xl">
                Show All {hubConfig.city} Vacancies
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredHubJobs.map(job => {
                const isSaved = savedJobIds.includes(job.id);
                const salaryStr = formatHubSalary(job.salary_min, job.salary_max, (job as any).salary_currency);
                const applicantReq = (job as any).applicant_location_requirements || '';

                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJobForDetail(job)}
                    className="bg-white border border-[#E2E8F0] hover:border-[#2563EB]/60 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer text-left"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                      <CompanyLogoAvatar companyName={job.company_name} size="lg" className="shrink-0" />

                      <div className="space-y-1 min-w-0 flex-1">
                        <h4 className="font-bold text-sm sm:text-base text-[#111827] hover:text-[#2563EB] transition-colors leading-snug line-clamp-1">
                          {job.title}
                        </h4>

                        <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                          <span className="font-semibold text-[#334155]">{job.company_name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                          <a
                            href={`https://www.linkedin.com/company/${encodeURIComponent(job.company_name.toLowerCase().replace(/[^a-z0-9]/g, '-'))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#0A66C2] hover:text-[#004182] inline-flex items-center gap-0.5 text-[11px] font-bold ml-1"
                            title={`View ${job.company_name} on LinkedIn`}
                          >
                            <Linkedin className="w-3 h-3 fill-current" />
                          </a>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#64748B] flex-wrap pt-0.5">
                          <span className="flex items-center gap-1 font-semibold text-[#334155]">
                            <span>{hubConfig.flag}</span>
                            <span>{job.location || hubConfig.city}</span>
                          </span>
                          <span>•</span>
                          <span>
                            {job.min_experience ? `${job.min_experience} - ${job.max_experience || job.min_experience + 3} yrs` : '2 - 5 yrs'}
                          </span>
                          <span>•</span>
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            {salaryStr}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-[#F4F7FC] border border-slate-200 text-[#475569] text-[10px] font-bold capitalize">
                            {job.work_mode || (job.is_remote ? 'Remote' : 'On-site')}
                          </span>
                          {applicantReq.includes('Visa Sponsored') && (
                            <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                              🇦🇪 Visa Sponsored
                            </span>
                          )}
                          {applicantReq.includes('US Work Authorization') && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[10px] font-bold">
                              🇺🇸 US Work Auth
                            </span>
                          )}
                          {applicantReq.includes('Worldwide Remote') && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-[#7138E8] text-[10px] font-bold">
                              🌐 Open to International
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Actions */}
                    <div 
                      className="flex items-center gap-2.5 shrink-0 self-start sm:self-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a
                        href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://jobs.talentxcel.in/jobs/${job.seo_slug || job.id}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="h-9 w-9 rounded-xl border border-[#E2E8F0] hover:border-[#0A66C2] text-[#0A66C2] hover:bg-blue-50/80 flex items-center justify-center transition-colors shrink-0"
                        title="Share on LinkedIn"
                      >
                        <Linkedin className="w-4 h-4 fill-current" />
                      </a>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => toggleSaveJob(job.id, e)}
                        className="h-9 w-9 p-0 rounded-xl text-[#64748B] hover:text-amber-500 hover:bg-amber-50"
                        title={isSaved ? 'Saved' : 'Save Job'}
                      >
                        <Bookmark className={`w-4 h-4 ${isSaved ? 'text-amber-500 fill-amber-500' : ''}`} />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedJobForDetail(job)}
                        className="h-9 px-3 text-xs font-bold text-[#7138E8] border-purple-200 bg-purple-50 hover:bg-purple-100 rounded-xl hidden sm:flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#7138E8]" />
                        <span>AI Fit</span>
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => setSelectedJobForApply(job)}
                        className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs flex items-center gap-1"
                      >
                        <span>Apply Now</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Footer */}
      <JobPortalFooter />

      {/* Drawer */}
      <JobDetailDrawer
        job={selectedJobForDetail}
        isOpen={!!selectedJobForDetail}
        onClose={() => setSelectedJobForDetail(null)}
        onApply={(j) => setSelectedJobForApply(j)}
        isSaved={selectedJobForDetail ? savedJobIds.includes(selectedJobForDetail.id) : false}
        onToggleSave={(id) => toggleSaveJob(id)}
      />

      {/* Apply Modal */}
      {selectedJobForApply && (
        <GuestJobApplyModal
          job={selectedJobForApply}
          open={!!selectedJobForApply}
          onClose={() => setSelectedJobForApply(null)}
        />
      )}
    </div>
  );
};
export default InternationalJobLandingPage;