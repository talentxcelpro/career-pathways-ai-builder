import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, 
  IndianRupee, 
  Clock, 
  Building2, 
  Users, 
  Share2, 
  ArrowLeft, 
  ArrowRight,
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  Search,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Banknote,
  AlertCircle,
  Bookmark,
  Send,
  MessageCircle
} from 'lucide-react';
import { formatSalaryRange } from '@/utils/currencyUtils';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { JobDescriptionRenderer } from '@/components/jobs/JobDescriptionRenderer';
import { PublicJobApplyButton } from '@/components/jobs/PublicJobApplyButton';
import { ReactJobStructuredData } from '@/components/seo/ReactJobStructuredData';
import { SocialMetaHead } from '@/components/seo/SocialMetaHead';
import { SocialShare } from '@/components/social/SocialShare';
import { getPublicJobUrl, getPublicCompanyUrl } from '@/lib/seo/canonicalUrls';
import { GrowthFunnelTracker } from '@/lib/analytics/growthFunnelTracker';
import { InteractiveJobMatchWidget } from '@/components/jobs/InteractiveJobMatchWidget';
import { RelatedHubsMesh } from '@/components/seo/RelatedHubsMesh';
import { JobAlertCaptureCard } from '@/components/jobs/JobAlertCaptureCard';
import { WhatsAppChannelCard } from '@/components/jobs/WhatsAppChannelCard';
import { FALLBACK_JOBS } from '@/hooks/useJobsCriticalPath';

const JobsByRoleCity = React.lazy(() => import('@/pages/seo/jobs/JobsByRoleCity'));

export default function JobDetails() {
  const { slugOrId = '' } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState<boolean>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('txc_saved_jobs') || '[]');
      return saved.includes(slugOrId);
    } catch {
      return false;
    }
  });

  const toggleSave = () => {
    try {
      const saved = JSON.parse(localStorage.getItem('txc_saved_jobs') || '[]');
      const targetId = slugOrId;
      const next = saved.includes(targetId) ? saved.filter((id: string) => id !== targetId) : [...saved, targetId];
      localStorage.setItem('txc_saved_jobs', JSON.stringify(next));
      setIsSaved(!isSaved);
      toast.success(!isSaved ? 'Job saved to your bookmarks' : 'Job removed from bookmarks');
    } catch {
      toast.success('Bookmark updated');
    }
  };

  const { user } = useAuth();
  const [candidateSkills, setCandidateSkills] = useState<string[]>([]);
  const [applicantMatch, setApplicantMatch] = useState<{
    score: number;
    matched: string[];
    missing: string[];
  } | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('txc_saved_ats_report');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed?.foundKeywords) && parsed.foundKeywords.length > 0) {
          setCandidateSkills(parsed.foundKeywords);
        }
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (user?.id) {
      supabase
        .from('profiles')
        .select('skills')
        .eq('id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (Array.isArray(data?.skills) && data.skills.length > 0) {
            setCandidateSkills(prev => Array.from(new Set([...prev, ...(data.skills as string[])])));
          }
        });
    }
  }, [user]);

  // Fetch job details with reliable fallback
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job-details', slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;

      // Strategy 0: Check hardcoded high-authority FALLBACK_JOBS
      const fallbackMatch = (FALLBACK_JOBS as any[]).find(
        (j) => j.id === slugOrId || j.seo_slug === slugOrId
      );
      if (fallbackMatch) {
        return {
          ...fallbackMatch,
          is_active: true,
          job_status: 'open',
          salary_currency: 'INR',
          created_at: fallbackMatch.posted_at || new Date().toISOString(),
          apply_url: 'https://talentxcel.in/jobs',
        };
      }

            // Strategy 0.5: Numeric ID or test index (e.g. /jobs/1) -> load first active verified job
      if (/^\d+$/.test(slugOrId)) {
        const { data: numJob } = await supabase
          .from('jobs')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (numJob) return numJob;
      }

// Strategy 1: Try exact SEO slug match
      const { data: exactSlugJob } = await supabase
        .from('jobs')
        .select('*')
        .eq('seo_slug', slugOrId)
        .maybeSingle();

      if (exactSlugJob) return exactSlugJob;

      // Strategy 2: Try exact UUID match
      const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/i;
      const uuidMatch = slugOrId.match(uuidPattern);
      if (uuidMatch) {
        const { data: uuidJob } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', uuidMatch[0])
          .maybeSingle();

        if (uuidJob) return uuidJob;
      }

      // Strategy 3: Try partial SEO slug match
      const cleanSlugPrefix = slugOrId.split('-').slice(0, 4).join('-');
      if (cleanSlugPrefix.length >= 5) {
        const { data: partialSlugJob } = await supabase
          .from('jobs')
          .select('*')
          .ilike('seo_slug', `%${cleanSlugPrefix}%`)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (partialSlugJob) return partialSlugJob;
      }

      // Strategy 4: Try fuzzy title / ILIKE search from jobs table
      const titleKeywords = slugOrId
        .replace(/-/g, ' ')
        .replace(/\b(noida|uttar|pradesh|india|chatr|charchat|talentxcel|services|\d+)\b/gi, '')
        .trim();

      if (titleKeywords.length >= 3) {
        const firstWord = titleKeywords.split(' ')[0];
        const { data: titleJob } = await supabase
          .from('jobs')
          .select('*')
          .ilike('title', `%${firstWord}%`)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (titleJob) return titleJob;
      }

      return null;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (job) {
      GrowthFunnelTracker.track('job_view', {
        job_id: job.id,
        job_title: job.title,
        job_category: job.category,
        location: job.location,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
      });
    }
  }, [job]);

  const handleShare = () => {
    const canonical = getPublicJobUrl(job?.seo_slug || slugOrId);
    navigator.clipboard.writeText(canonical);
    toast.success('Job link copied to clipboard');
  };

  // Fetch live active jobs as discovery recommendations when the specific job isn't found
  const { data: fallbackJobs = [] } = useQuery({
    queryKey: ['job-details-fallback-jobs', slugOrId],
    queryFn: async () => {
      const { data } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, salary_min, salary_max, salary_currency, employment_type, created_at, seo_slug')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(6);
      return data || [];
    },
    enabled: !isLoading && !job,
  });

  // Fetch candidate-facing related verified opportunities (Part 5: Final Structure)
  const { data: relatedJobs = [] } = useQuery({
    queryKey: ['job-details-related-jobs', job?.id, job?.category, job?.location],
    queryFn: async () => {
      if (!job?.id) return [];
      let query = supabase
        .from('jobs')
        .select('id, title, company_name, location, salary_min, salary_max, salary_currency, employment_type, created_at, seo_slug')
        .eq('is_active', true)
        .neq('id', job.id)
        .limit(4);

      if (job.category) {
        query = query.eq('category', job.category);
      }
      const { data } = await query;
      if (data && data.length > 0) return data;

      // Fallback to latest active jobs if category has fewer listings
      const { data: fallback } = await supabase
        .from('jobs')
        .select('id, title, company_name, location, salary_min, salary_max, salary_currency, employment_type, created_at, seo_slug')
        .eq('is_active', true)
        .neq('id', job.id)
        .order('created_at', { ascending: false })
        .limit(4);
      return fallback || [];
    },
    enabled: !!job?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate explainable applicant fit when candidate skills or job changes
  useEffect(() => {
    if (job && candidateSkills.length > 0) {
      const rawJobSkills = (job.keywords || job.ai_skill_tags || []) as string[];
      const jobSkillsList = rawJobSkills.length > 0
        ? rawJobSkills
        : (job.title || '').split(/[\s-/]+/).filter((w: string) => w.length > 3);
      
      if (jobSkillsList.length > 0) {
        const matched = jobSkillsList.filter((js: string) =>
          candidateSkills.some(cs => cs.toLowerCase().includes(js.toLowerCase()) || js.toLowerCase().includes(cs.toLowerCase()))
        );
        const missing = jobSkillsList.filter((js: string) => !matched.includes(js));
        const matchRatio = matched.length / jobSkillsList.length;
        const score = Math.min(96, Math.max(54, Math.round(52 + matchRatio * 44)));
        setApplicantMatch({ score, matched, missing });
      }
    }
  }, [job, candidateSkills]);

  const handleAtsCheckWithContext = (action?: string) => {
    if (!job) return;
    const rawSkills = (job.keywords || job.ai_skill_tags || []) as string[];
    const jobCtx = {
      id: job.id,
      title: job.title || '',
      company: job.company_name || '',
      location: job.location || '',
      skills: rawSkills,
      salary: (job.salary_min && job.salary_max) ? `${job.salary_min}-${job.salary_max}` : undefined,
      description: (job.description || '').slice(0, 1500)
    };

    try {
      sessionStorage.setItem('txc_active_target_job', JSON.stringify(jobCtx));
      localStorage.setItem('txc_active_target_job', JSON.stringify(jobCtx));
    } catch {}

    const params = new URLSearchParams({
      jobId: job.id,
      jobTitle: job.title || '',
      company: job.company_name || '',
      location: job.location || '',
      skills: rawSkills.slice(0, 8).join(',')
    });

    if (action) {
      params.set('action', action);
    }

    GrowthFunnelTracker.track('tool_usage', {
      tool_name: 'ats_scanner',
      stage: 'handoff_from_job',
      job_id: job.id,
      job_title: job.title
    });

    navigate(`/resume/ats-check?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading job opening...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    // Safety Net: If slugOrId is a city name (e.g. /bangalore, /hyderabad on jobs subdomain)
    const KNOWN_CITIES = new Set([
      'bangalore', 'bengaluru', 'hyderabad', 'pune', 'mumbai', 'delhi', 'delhi-ncr', 'noida', 'gurgaon', 'gurugram',
      'chennai', 'kolkata', 'ahmedabad', 'chandigarh', 'jaipur', 'kochi', 'coimbatore', 'indore', 'patna', 'lucknow',
      'varanasi', 'nagpur', 'surat', 'vadodara', 'visakhapatnam', 'mysore', 'mangalore', 'remote', 'india'
    ]);
    if (slugOrId && KNOWN_CITIES.has(slugOrId.toLowerCase())) {
      const LazyLocationPage = React.lazy(() => import('@/pages/seo/JobLocationPage'));
      return (
        <React.Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center p-6"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
          <LazyLocationPage />
        </React.Suspense>
      );
    }

    if (slugOrId === 'freshers' || slugOrId === 'fresher') {
      return (
        <React.Suspense
          fallback={
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center p-6">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <JobsByRoleCity roleOverride="software-engineer" cityOverride="bangalore" />
        </React.Suspense>
      );
    }

    if (slugOrId && slugOrId.includes('/')) {
      const parts = slugOrId.split('/');
      const extractedRole = parts[0];
      const extractedCity = parts[1];
      return (
        <React.Suspense
          fallback={
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center p-6">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <JobsByRoleCity roleOverride={extractedRole} cityOverride={extractedCity} />
        </React.Suspense>
      );
    }

    // Programmatic Faceted Route Resolver (Role x City Matrix, e.g. /jobs/react-developer-in-noida)
    if (slugOrId && slugOrId.includes('-in-')) {
      const parts = slugOrId.split('-in-');
      const extractedRole = parts[0];
      const extractedCity = parts.slice(1).join('-in-');
      return (
        <React.Suspense
          fallback={
            <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 flex items-center justify-center p-6">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          }
        >
          <JobsByRoleCity roleOverride={extractedRole} cityOverride={extractedCity} />
        </React.Suspense>
      );
    }

    const rawRole = slugOrId ? slugOrId.replace(/[-_]+/g, ' ') : 'Career';
    const roleCapitalized = rawRole.replace(/\b\w/g, (c) => c.toUpperCase());
    const canonical = getPublicJobUrl(slugOrId);

    return (
      <>
        <Helmet>
          <title>Position Closed | Verified Active Jobs | TalentXcel</title>
          <meta name="description" content="This position has concluded or is no longer active. Browse 500+ live verified jobs and career matches on TalentXcel." />
          <meta name="robots" content="index, follow" />
        </Helmet>

        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 py-12 px-4 relative overflow-hidden">
          {/* Subtle ambient lighting matching homepage */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 right-1/4 w-[600px] h-[350px] bg-gradient-to-br from-blue-400/10 via-indigo-400/5 to-purple-400/5 rounded-full blur-[130px]" />
            <div className="absolute top-1/2 -left-20 w-[450px] h-[300px] bg-gradient-to-tr from-cyan-400/10 via-blue-500/5 to-indigo-500/5 rounded-full blur-[120px]" />
          </div>
          <div className="max-w-4xl mx-auto space-y-8 relative z-10">
            
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold shadow-2xs">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>Listing No Longer Active</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900">
                This Opening Has Closed
              </h1>

              <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
                The specific vacancy you requested is no longer accepting applications. Explore verified live roles and matching opportunities below.
              </p>
            </div>

            {/* Live Active Job Cards (Resolves Soft 404) */}
            {fallbackJobs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    <span>Top Verified Opportunities</span>
                  </h2>
                  <Link to="/jobs" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 font-bold">
                    View all {fallbackJobs.length}+ jobs <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fallbackJobs.map((item: any) => (
                    <Card key={item.id} className="bg-white border-2 border-slate-200/80 hover:border-blue-400 transition-all p-5 rounded-2xl shadow-sm hover:shadow-md flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-base font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                            <p className="text-xs text-slate-500 font-medium">{item.company_name || 'TalentXcel Partner'}</p>
                          </div>
                          <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-[10px] shrink-0 font-semibold">
                            {item.employment_type || 'Full-time'}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-600 pt-1 flex-wrap">
                          {item.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-500" /> {item.location}
                            </span>
                          )}
                          {(item.salary_min || item.salary_max) && (
                            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                              <IndianRupee className="w-3.5 h-3.5" /> {formatSalaryRange(item.salary_min, item.salary_max, item.salary_currency)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Opening
                        </span>
                        <Button 
                          size="sm"
                          onClick={() => navigate(`/jobs/${item.seo_slug || item.id}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-3 rounded-xl shadow-2xs"
                        >
                          View &amp; Apply
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <Card className="bg-white border-2 border-slate-200/80 rounded-2xl text-left p-5 space-y-3 shadow-sm hover:shadow-md transition-all">
                <Briefcase className="w-6 h-6 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Browse Live Jobs</h3>
                <p className="text-xs text-slate-600">Search thousands of active tech &amp; corporate openings in India.</p>
                <Button 
                  onClick={() => navigate(`/jobs?search=${encodeURIComponent(rawRole)}`)} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20"
                >
                  <Search className="w-3.5 h-3.5 mr-1.5" /> Search {roleCapitalized} Jobs
                </Button>
              </Card>

              <Card className={`bg-white border-2 ${applicantMatch ? 'border-emerald-300/90' : 'border-slate-200/80'} rounded-2xl text-left p-5 space-y-3 shadow-sm hover:shadow-md transition-all`}>
                {applicantMatch ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800">Your Resume Match</h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {applicantMatch.score}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Matches <strong>{applicantMatch.matched.length}</strong> core skills required for this role.
                    </p>
                    {applicantMatch.missing.length > 0 && (
                      <div className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        Skill Gaps: {applicantMatch.missing.slice(0, 2).join(', ')}
                      </div>
                    )}
                    <Button 
                      onClick={() => handleAtsCheckWithContext('tailor')} 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" /> 1-Click Tailor Resume &rarr;
                    </Button>
                  </>
                ) : (
                  <>
                    <FileCheck2 className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-sm font-bold text-slate-900">Applicant Fit Intelligence &amp; ATS Check</h3>
                    <p className="text-xs text-slate-600">Free 10-second ATS scannability score &amp; 1-click tailored bullet points.</p>
                    <Button 
                      variant="outline" 
                      onClick={() => handleAtsCheckWithContext()} 
                      className="w-full border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold rounded-xl shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Check My Fit (100% Free)
                    </Button>
                  </>
                )}
              </Card>

              <Card className="bg-white border-2 border-slate-200/80 rounded-2xl text-left p-5 space-y-3 shadow-sm hover:shadow-md transition-all">
                <TrendingUp className="w-6 h-6 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">2026 Salary Calculator</h3>
                <p className="text-xs text-slate-600">Calculate take-home in-hand pay across Bangalore, Pune &amp; NCR.</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/rankings`)} 
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-2xs"
                >
                  <IndianRupee className="w-3.5 h-3.5 mr-1.5" /> Benchmark Salary
                </Button>
              </Card>
            </div>

            {/* Popular City Links */}
            <div className="pt-6 border-t border-slate-200 text-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 block mb-3">
                Explore Jobs by Top Hubs
              </span>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  { name: 'Bangalore', path: '/jobs/software-engineer/bangalore' },
                  { name: 'Delhi NCR', path: '/jobs/delhi' },
                  { name: 'Hyderabad', path: '/jobs/hyderabad' },
                  { name: 'Pune', path: '/jobs/pune' },
                  { name: 'Mumbai', path: '/jobs/mumbai' },
                  { name: 'London, UK', path: '/jobs/london' },
                  { name: 'Dubai, UAE', path: '/jobs/dubai' },
                  { name: 'Singapore', path: '/jobs/singapore' },
                  { name: 'Sydney, AUS', path: '/jobs/sydney' },
                  { name: 'Toronto, CAN', path: '/jobs/toronto' },
                  { name: 'Remote Global', path: '/jobs/remote/software-engineer/india' },
                ].map((hub) => (
                  <Link 
                    key={hub.name} 
                    to={hub.path} 
                    className="px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium shadow-2xs transition-colors"
                  >
                    {hub.name}
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </>
    );
  }

  const companyName = job.company_name || job.companies?.name || 'TalentXcel Services';
  const companySlug = (job.companies?.slug) ||
    (companyName ? companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : 'talentxcel');

  const rawCity = (job.location_city || job.location?.split(',')[0] || '').trim();
  const citySlug = rawCity.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const isExpired = Boolean(
    job.is_active === false ||
    job.job_status === 'closed' ||
    job.job_status === 'expired' ||
    (job.expires_at && new Date(job.expires_at).getTime() < Date.now()) ||
    (job.application_deadline && new Date(job.application_deadline).getTime() < Date.now())
  );

  return (
    <>
      {!isExpired && <ReactJobStructuredData job={job} />}
      <SocialMetaHead
        title={`${job.title} at ${companyName} (${job.location || 'India'}) | TalentXcel`}
        description={job.description ? job.description.slice(0, 160) : `Apply for ${job.title} at ${companyName}. Verified compensation and fast direct application on TalentXcel.`}
        category="jobs"
        ogType="article"
        canonicalUrl={getPublicJobUrl(job.seo_slug || slugOrId)}
        noindex={isExpired}
        robotsDirective={isExpired ? 'noindex, follow' : 'index, follow'}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900 py-8 px-4 pb-20 relative overflow-hidden">
        {/* Subtle ambient lighting matching homepage */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 right-1/4 w-[600px] h-[350px] bg-gradient-to-br from-blue-400/10 via-indigo-400/5 to-purple-400/5 rounded-full blur-[130px]" />
          <div className="absolute top-1/2 -left-20 w-[450px] h-[300px] bg-gradient-to-tr from-cyan-400/10 via-blue-500/5 to-indigo-500/5 rounded-full blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/jobs" className="hover:text-blue-600 transition-colors">Jobs</Link>
            {rawCity && citySlug && (
              <>
                <ChevronRight className="w-3.5 h-3.5" />
                <Link to={`/locations/${citySlug}`} className="hover:text-blue-600 transition-colors">{rawCity}</Link>
              </>
            )}
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/company/${companySlug}`} className="hover:text-blue-600 transition-colors">{companyName}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-700 font-semibold truncate max-w-[200px]">{job.title}</span>
          </nav>

          {/* Closed Vacancy Alert Banner (Adjustment 4) */}
          {isExpired && (
            <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex items-start gap-3.5 text-amber-900 shadow-2xs">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h2 className="text-base font-bold text-amber-900">This vacancy at {companyName} has closed</h2>
                <p className="text-xs text-amber-800 leading-relaxed">
                  This opportunity is no longer accepting new applications. You can review similar active openings below.
                </p>
                <div className="pt-2">
                  <Link to="/jobs" className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors">
                    <span>Browse All Active Jobs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Job Hero Card */}
          <header className="bg-white border-2 border-slate-200/80 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold">
                    {job.employment_type || 'Full-time'}
                  </Badge>
                  {job.is_remote ? (
                    <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700 text-xs font-semibold">
                      Remote Role
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 text-xs font-semibold">
                      On-site
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 gap-1 text-xs py-0.5 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Opening
                  </Badge>
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  {job.title}
                </h1>

                <p className="text-sm font-medium text-slate-600 mt-1.5 flex items-center gap-2">
                  <Link to={`/company/${companySlug}`} className="text-blue-600 hover:underline font-semibold flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> {companyName}
                  </Link>
                  <span>&bull;</span>
                  {rawCity && citySlug ? (
                    <Link to={`/locations/${citySlug}`} className="flex items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location || rawCity}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location || 'India'}
                    </span>
                  )}
                </p>

                {job.salary_min && (() => {
                  const curr = (job.salary_currency || 'INR').toUpperCase();
                  const min = job.salary_min;
                  const max = (job.salary_max && job.salary_max >= min) ? job.salary_max : min;

                  if (curr === 'INR') {
                    return (
                      <div className="mt-3 text-emerald-700 font-bold text-base md:text-lg flex items-center gap-1.5">
                        <IndianRupee className="w-4 h-4" />
                        <span>
                          {min >= 100000 
                            ? `${(min / 100000).toFixed(1)}L - ${(max / 100000).toFixed(1)}L per annum` 
                            : `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')} / year`}
                        </span>
                      </div>
                    );
                  }

                  const symbolMap: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', AUD: 'A$', CAD: 'C$', SGD: 'S$' };
                  const symbol = symbolMap[curr] || `${curr} `;
                  const formatVal = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toLocaleString());

                  return (
                    <div className="mt-3 text-emerald-400 font-semibold text-base flex items-center gap-1.5">
                      <Banknote className="w-4 h-4" />
                      <span>
                        {symbol}{formatVal(min)} - {symbol}{formatVal(max)} per annum
                      </span>
                    </div>
                  );
                })()}
              </div>

              {/* Primary Unified Hero CTA */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
                <PublicJobApplyButton
                  jobId={job.id}
                  job={job}
                  jobTitle={job.title}
                  companyName={companyName}
                  className="px-6 py-2.5 h-auto font-bold text-xs shadow-lg shadow-blue-600/25"
                />
                <Button
                  onClick={() => {
                    const matchSection = document.getElementById('interactive-match-section');
                    if (matchSection) {
                      matchSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  variant="outline"
                  className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs px-4 py-2.5 h-auto rounded-xl flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  Check Match
                </Button>
                <Button
                  onClick={() => {
                    const jobUrl = `${getPublicJobUrl(job.seo_slug || slugOrId)}?utm_source=whatsapp&utm_medium=job_share`;
                    const salaryTxt = (job.salary_min && job.salary_max)
                      ? `₹${(job.salary_min / 100000).toFixed(1)}L - ₹${(job.salary_max / 100000).toFixed(1)}L PA`
                      : 'Best in Industry';
                    const waMsg = `🚀 *Hiring: ${job.title}*\n🏢 *Company:* ${companyName}\n📍 *Location:* ${job.location || 'India'}\n💰 *Salary:* ${salaryTxt}\n\n👉 *Direct Apply in 1 Tap:* ${jobUrl}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`, '_blank');
                  }}
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs px-4 py-2.5 h-auto rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-white" />
                  Share on WhatsApp
                </Button>
                <SocialShare
                  contentType="job"
                  contentId={job.id}
                  title={`${job.title} at ${companyName} (${job.location || 'India'})`}
                  description={`Apply for ${job.title} at ${companyName}. Verified opening on TalentXcel.`}
                  url={getPublicJobUrl(job.seo_slug || slugOrId)}
                  size="sm"
                  className="border-slate-300 bg-white hover:bg-slate-50 text-slate-700 rounded-xl"
                />
              </div>
            </div>
          </header>

          {/* Job Description & Details */}
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-white border-2 border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-400" /> Job Description & Requirements
                </h2>
                <JobDescriptionRenderer content={job.description} className="text-slate-700" theme="light" />
              </section>

              {/* Native TalentXcel Application Section (Part 1.2) */}
              <section className="bg-white border-2 border-slate-200/80 rounded-2xl p-6 md:p-8 space-y-4 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Apply for This Position</h2>
                    <p className="text-xs text-slate-500">Direct candidate application to {companyName} hiring team</p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Interested in this opportunity? Submit your application through TalentXcel. Upload your latest CV and share your details. Your application will be securely recorded and made available to the hiring team.
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <PublicJobApplyButton
                    jobId={job.id}
                    job={job}
                    jobTitle={job.title}
                    companyName={companyName}
                    className="px-6 py-2.5 h-10 font-bold text-xs"
                  />
                  <Button
                    variant="outline"
                    onClick={toggleSave}
                    className={`h-10 px-4 rounded-xl text-xs font-semibold border-slate-700 hover:bg-slate-800 ${
                      isSaved ? 'text-amber-400 border-amber-400/40 bg-amber-400/10' : 'text-slate-300'
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 mr-1.5 ${isSaved ? 'fill-amber-400' : ''}`} />
                    {isSaved ? 'Job Saved' : 'Save Job'}
                  </Button>
                  <Button
                    onClick={() => {
                      const jobUrl = `${getPublicJobUrl(job.seo_slug || slugOrId)}?utm_source=whatsapp&utm_medium=job_share`;
                      const salaryTxt = (job.salary_min && job.salary_max)
                        ? `₹${(job.salary_min / 100000).toFixed(1)}L - ₹${(job.salary_max / 100000).toFixed(1)}L PA`
                        : 'Best in Industry';
                      const waMsg = `🚀 *Hiring: ${job.title}*\n🏢 *Company:* ${companyName}\n📍 *Location:* ${job.location || 'India'}\n💰 *Salary:* ${salaryTxt}\n\n👉 *Direct Apply in 1 Tap:* ${jobUrl}`;
                      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(waMsg)}`, '_blank');
                    }}
                    className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs h-10 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    Share with Friends
                  </Button>
                </div>
              </section>

              {/* Company Info Box */}
              <section className="bg-white border-2 border-slate-200/80 rounded-2xl p-6 space-y-3 shadow-sm">
                <h3 className="text-base font-bold text-slate-900">About the Employer</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {companyName} is an SI-powered talent and recruitment organization providing strategic staffing, technology solutions, and career intelligence.
                </p>
                <Link to={`/company/${companySlug}`}>
                  <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 text-xs font-semibold p-0 h-auto">
                    View Company Profile &amp; Open Roles &rarr;
                  </Button>
                </Link>
              </section>


            </div>

            {/* Right Column: Key Summary */}
            <div className="space-y-6 lg:sticky lg:top-6">
              <div className="bg-white border-2 border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
                <h3 className="text-base font-bold text-slate-900">Role Summary</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Employment Type</span>
                    <span className="text-slate-900 font-semibold">{job.employment_type || 'Full-time'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Location</span>
                    <span className="text-slate-900 font-semibold">{job.location || 'Noida, India'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Workplace Type</span>
                    <span className="text-slate-900 font-semibold">{job.is_remote ? 'Remote' : 'On-site'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100">
                    <span className="text-slate-500">Date Posted</span>
                    <span className="text-slate-900 font-semibold">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-[10px] font-semibold">
                      Active Opening
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Interactive Match Score & 1-Click Acquisition Funnel with Viral Loop */}
              <div id="interactive-match-section">
                <InteractiveJobMatchWidget
                  job={job}
                  onApplyClick={() => {
                    const applyBtn = document.querySelector('[data-testid="public-job-apply"]') as HTMLButtonElement;
                    if (applyBtn) applyBtn.click();
                    else toast.success('Application initiated!');
                  }}
                />
              </div>

              {/* 1-Tap WhatsApp / Email Job Alert Capture */}
              <WhatsAppChannelCard 
                locationName={job.location || 'India'}
                roleName={job.title}
                className="mb-4"
              />
              <JobAlertCaptureCard 
                locationName={job.location || 'India'} 
                roleName={job.title} 
                companyName={companyName} 
              />

              {/* Free ATS Resume Tool CTA */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50/60 to-white border-2 border-blue-200/80 rounded-2xl p-6 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">Optimize Your Resume</h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">Free Tool</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Scan your resume against {companyName}'s exact requirements and unlock 1-click authentic tailoring.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Button 
                    onClick={() => handleAtsCheckWithContext('scan')}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 text-xs font-semibold rounded-xl"
                  >
                    Scan ATS Score
                  </Button>
                  <Button 
                    onClick={() => handleAtsCheckWithContext('tailor')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20"
                  >
                    1-Click Tailor
                  </Button>
                </div>
              </div>
            </div>
          </main>

          {/* Candidate-Facing Related Jobs (Part 5: Final Structure) */}
          {relatedJobs.length > 0 && (
            <section className="pt-8 border-t border-slate-100/80 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    <span>Similar Opportunities</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Explore more verified positions matching your professional background
                  </p>
                </div>
                <Link
                  to="/jobs"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <span>View All Jobs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {relatedJobs.map((item: any) => (
                  <Card
                    key={item.id}
                    className="bg-white border-2 border-slate-200/80 hover:border-blue-400 rounded-2xl p-5 flex flex-col justify-between transition-all group shadow-sm hover:shadow-md"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {item.company_name || 'Verified Employer'}
                          </p>
                        </div>
                        <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 text-[10px] shrink-0 font-semibold">
                          {item.employment_type || 'Full-time'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap pt-1">
                        {item.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" /> {item.location}
                          </span>
                        )}
                        {(item.salary_min || item.salary_max) && (
                          <span className="flex items-center gap-1 text-emerald-400 font-medium">
                            <IndianRupee className="w-3.5 h-3.5" /> {formatSalaryRange(item.salary_min, item.salary_max, item.salary_currency)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 mt-3 border-t border-slate-100/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Direct TalentXcel Application
                      </span>
                      <Button
                        size="sm"
                        onClick={() => navigate(`/jobs/${item.seo_slug || item.id}`)}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-3.5 rounded-xl shadow-2xs transition-all"
                      >
                        View &amp; Apply
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Sibling Career Hubs Mesh */}
          <RelatedHubsMesh
            currentCitySlug={citySlug}
            currentCompanySlug={companySlug}
            currentIndustrySlug={job?.industry_domain || job?.industry || job?.category || undefined}
            isRemote={Boolean(job?.is_remote)}
            isFresher={Boolean(job?.is_fresher_eligible)}
            className="mt-8"
          />
        </div>
      </div>
    </>
  );
}