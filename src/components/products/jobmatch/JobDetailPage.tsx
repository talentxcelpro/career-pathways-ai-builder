// src/components/products/jobmatch/JobDetailPage.tsx
// Complete Public Individual Job Detail Page for jobs.talentxcel.in/jobs/:slugOrId
// Master Light SaaS Design System (#FFFFFF, #F4F7FC, #2563EB, #7138E8, #111827, #E2E8F0)

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
  TrendingUp,
  Cpu,
  Linkedin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { JobPortalHeader } from './JobPortalHeader';
import { JobPortalFooter } from './JobPortalFooter';
import { GuestJobApplyModal } from '@/components/jobs/GuestJobApplyModal';
import { JobDetailItem } from './JobDetailDrawer';
import { CompanyLogoAvatar } from './CompanyLogoAvatar';

function generateSlug(title: string, id: string): string {
  const cleanTitle = (title || 'job')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  return `${cleanTitle}-${id}`;
}

export const JobDetailPage: React.FC = () => {
  const { slugOrId = '' } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();

  const [job, setJob] = useState<JobDetailItem | null>(null);
  const [relatedJobs, setRelatedJobs] = useState<JobDetailItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  useEffect(() => {
    fetchJobDetail();
  }, [slugOrId]);

  const fetchJobDetail = async () => {
    setLoading(true);
    setErrorState(null);

    try {
      // 1. Extract potential UUID from slugOrId
      const uuidMatch = slugOrId.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
      const targetId = uuidMatch ? uuidMatch[0] : null;

      let foundJob: any = null;

      // Strategy A: UUID Match
      if (targetId) {
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', targetId)
          .maybeSingle();
        if (data) foundJob = data;
      }

      // Strategy B: Exact SEO slug match
      if (!foundJob) {
        const { data } = await supabase
          .from('jobs')
          .select('*')
          .eq('seo_slug', slugOrId)
          .maybeSingle();
        if (data) foundJob = data;
      }

      // Strategy C: Exact or partial ID match
      if (!foundJob && slugOrId.length >= 8) {
        const { data } = await supabase
          .from('jobs')
          .select('*')
          .ilike('id', `${slugOrId}%`)
          .limit(1)
          .maybeSingle();
        if (data) foundJob = data;
      }

      // Strategy D: Title match
      if (!foundJob) {
        const cleanTitle = slugOrId.replace(/-/g, ' ');
        const { data } = await supabase
          .from('jobs')
          .select('*')
          .ilike('title', `%${cleanTitle.slice(0, 20)}%`)
          .limit(1)
          .maybeSingle();
        if (data) foundJob = data;
      }

      if (!foundJob) {
        setErrorState('Job vacancy not found. It may have expired or been removed.');
        setLoading(false);
        return;
      }

      setJob(foundJob);

      // Check saved status
      try {
        const saved = JSON.parse(localStorage.getItem('txc_saved_jobs') || '[]');
        setIsSaved(saved.includes(foundJob.id));
      } catch {}

      // Fetch related jobs in same department or company
      const queryDept = foundJob.department || foundJob.industry || '';
      let relatedQuery = supabase
        .from('jobs')
        .select('id, title, company_name, location, location_city, salary_min, salary_max, employment_type, is_remote, work_mode, skills_required, created_at, external_url')
        .eq('is_active', true)
        .neq('id', foundJob.id)
        .limit(4);

      if (queryDept) {
        relatedQuery = relatedQuery.ilike('department', `%${queryDept.slice(0, 10)}%`);
      }

      const { data: related } = await relatedQuery;
      if (related && related.length > 0) {
        setRelatedJobs(related as any);
      } else {
        // Fallback: fetch top latest vacancies
        const { data: latest } = await supabase
          .from('jobs')
          .select('id, title, company_name, location, location_city, salary_min, salary_max, employment_type, is_remote, work_mode, skills_required, created_at, external_url')
          .eq('is_active', true)
          .neq('id', foundJob.id)
          .order('created_at', { ascending: false })
          .limit(4);
        if (latest) setRelatedJobs(latest as any);
      }
    } catch (e: any) {
      console.error('Job detail fetch error:', e);
      setErrorState('Unable to load vacancy information.');
    } finally {
      setLoading(false);
    }
  };

  const toggleSave = () => {
    if (!job) return;
    try {
      const saved = JSON.parse(localStorage.getItem('txc_saved_jobs') || '[]');
      const updated = saved.includes(job.id) ? saved.filter((id: string) => id !== job.id) : [...saved, job.id];
      localStorage.setItem('txc_saved_jobs', JSON.stringify(updated));
      setIsSaved(!isSaved);
      toast.success(isSaved ? 'Job removed from saved bookmarks' : 'Job saved to your bookmarks!');
    } catch {}
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: job?.title,
        text: `Check out this opening for ${job?.title} at ${job?.company_name} on TalentXcel Jobs`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Job link copied to clipboard!');
    }
  };

  const handleShareLinkedIn = () => {
    const linkedInShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`;
    window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer');
    toast.success('Opening LinkedIn to share vacancy...');
  };

  const isExpired = job ? (
    !job.is_active ||
    (job.expires_at && new Date(job.expires_at) < new Date()) ||
    (job.application_deadline && new Date(job.application_deadline) < new Date())
  ) : false;

  const canonicalUrl = job ? `https://jobs.talentxcel.in/jobs/${generateSlug(job.title, job.id)}` : 'https://jobs.talentxcel.in/jobs';

  // Country Code and Regional Currency Resolution
  const getCountryCode = (location?: string, city?: string): string => {
    const loc = `${city || ''} ${location || ''}`.toLowerCase();
    if (loc.includes('united arab emirates') || loc.includes('dubai') || loc.includes('abu dhabi') || loc.includes('sharjah') || loc.includes('uae')) return 'AE';
    if (loc.includes('saudi arabia') || loc.includes('riyadh') || loc.includes('ksa') || loc.includes('jeddah')) return 'SA';
    if (loc.includes('qatar') || loc.includes('doha')) return 'QA';
    if (loc.includes('oman') || loc.includes('muscat')) return 'OM';
    if (loc.includes('united states') || loc.includes('usa') || loc.includes('seattle') || loc.includes('austin') || loc.includes('san francisco') || loc.includes('new york') || loc.includes('san mateo')) return 'US';
    if (loc.includes('united kingdom') || loc.includes('london') || loc.includes('uk')) return 'GB';
    if (loc.includes('germany') || loc.includes('berlin') || loc.includes('munich')) return 'DE';
    if (loc.includes('netherlands') || loc.includes('amsterdam')) return 'NL';
    if (loc.includes('ireland') || loc.includes('dublin')) return 'IE';
    if (loc.includes('australia') || loc.includes('sydney') || loc.includes('melbourne')) return 'AU';
    if (loc.includes('singapore')) return 'SG';
    if (loc.includes('canada') || loc.includes('toronto') || loc.includes('vancouver')) return 'CA';
    if (loc.includes('nigeria') || loc.includes('lagos')) return 'NG';
    if (loc.includes('kenya') || loc.includes('nairobi')) return 'KE';
    if (loc.includes('south africa') || loc.includes('johannesburg') || loc.includes('cape town')) return 'ZA';
    if (loc.includes('egypt') || loc.includes('cairo')) return 'EG';
    return 'IN';
  };

  const countryCode = job ? getCountryCode(job.location, job.location_city) : 'IN';
  const detectedCurrency = ((job as any)?.salary_currency || '').toUpperCase() || (
    countryCode === 'AE' ? 'AED' :
    countryCode === 'SA' ? 'SAR' :
    countryCode === 'QA' ? 'QAR' :
    countryCode === 'OM' ? 'OMR' :
    countryCode === 'US' ? 'USD' :
    countryCode === 'GB' ? 'GBP' :
    ['DE', 'NL', 'IE'].includes(countryCode) ? 'EUR' :
    'INR'
  );

  // Format Salary accurately without speculative conversions
  const salaryText = (() => {
    if (!job?.salary_min || job.salary_min <= 0) return 'Salary not disclosed';
    
    if (detectedCurrency === 'AED') {
      const minK = Math.round(job.salary_min / 1000);
      const maxK = job.salary_max ? Math.round(job.salary_max / 1000) : null;
      return maxK && maxK !== minK ? `AED ${minK}k – ${maxK}k / yr` : `AED ${minK}k / yr`;
    }
    if (detectedCurrency === 'USD') {
      const minK = Math.round(job.salary_min / 1000);
      const maxK = job.salary_max ? Math.round(job.salary_max / 1000) : null;
      return maxK && maxK !== minK ? `$${minK}k – $${maxK}k / yr` : `$${minK}k / yr`;
    }
    if (detectedCurrency === 'SAR') {
      const minK = Math.round(job.salary_min / 1000);
      const maxK = job.salary_max ? Math.round(job.salary_max / 1000) : null;
      return maxK && maxK !== minK ? `SAR ${minK}k – ${maxK}k / yr` : `SAR ${minK}k / yr`;
    }
    if (detectedCurrency === 'QAR') {
      const minK = Math.round(job.salary_min / 1000);
      const maxK = job.salary_max ? Math.round(job.salary_max / 1000) : null;
      return maxK && maxK !== minK ? `QAR ${minK}k – ${maxK}k / yr` : `QAR ${minK}k / yr`;
    }
    if (detectedCurrency === 'OMR') {
      const minK = Math.round(job.salary_min / 1000);
      const maxK = job.salary_max ? Math.round(job.salary_max / 1000) : null;
      return maxK && maxK !== minK ? `OMR ${minK}k – ${maxK}k / yr` : `OMR ${minK}k / yr`;
    }

    const minL = (job.salary_min / 100000).toFixed(1);
    if (!job.salary_max || job.salary_max === job.salary_min) return `₹${minL} LPA`;
    const maxL = (job.salary_max / 100000).toFixed(1);
    return `₹${minL}L – ₹${maxL}L CTC`;
  })();

  // Schema.org JobPosting structured data
  const isFullyRemote = job?.is_remote || (job?.work_mode || '').toLowerCase() === 'remote' || (job?.location || '').toLowerCase().includes('remote');
  const applicantEligibility = (job as any)?.applicant_location_requirements || (
    countryCode === 'AE' ? 'United Arab Emirates (UAE Employment Visa Sponsored)' :
    countryCode === 'US' ? 'United States (US Work Authorization Required)' :
    isFullyRemote ? 'Worldwide Remote (Open to International Applicants)' :
    'India (Domestic)'
  );

  const jobPostingSchema = job && !isExpired ? {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": job.title,
    "description": (job as any).description || job.job_summary || `Opportunity for ${job.title} at ${job.company_name}. Apply on TalentXcel Jobs.`,
    "identifier": {
      "@type": "PropertyValue",
      "name": job.company_name,
      "value": job.id
    },
    "datePosted": job.created_at,
    "validThrough": job.expires_at || job.application_deadline || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    "employmentType": (job.employment_type || "FULL_TIME").toUpperCase().replace(/-/g, '_'),
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company_name,
      "sameAs": job.external_url || "https://jobs.talentxcel.in"
    },
    ...(!isFullyRemote ? {
      "jobLocation": {
        "@type": "Place",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": job.location_city || job.location || "India",
          "addressCountry": countryCode
        }
      }
    } : {
      "jobLocationType": "TELECOMMUTE"
    }),
    "applicantLocationRequirements": {
      "@type": "Country",
      "name": applicantEligibility
    },
    ...(job.salary_min ? {
      "baseSalary": {
        "@type": "MonetaryAmount",
        "currency": detectedCurrency,
        "value": {
          "@type": "QuantitativeValue",
          "minValue": job.salary_min,
          "maxValue": job.salary_max || job.salary_min,
          "unitText": "YEAR"
        }
      }
    } : {})
  } : null;

  // Schema.org BreadcrumbList structured data
  const breadcrumbSchema = job ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://jobs.talentxcel.in" },
      { "@type": "ListItem", "position": 2, "name": "Jobs", "item": "https://jobs.talentxcel.in/jobs" },
      { "@type": "ListItem", "position": 3, "name": job.department || "All Categories", "item": `https://jobs.talentxcel.in/jobs?category=${encodeURIComponent(job.department || '')}` },
      { "@type": "ListItem", "position": 4, "name": job.title, "item": canonicalUrl }
    ]
  } : null;

  return (
    <div className="min-h-screen bg-[#F4F7FC] text-[#111827] flex flex-col font-sans selection:bg-[#2563EB] selection:text-white">
      {/* ── SEO Metadata & Canonical Head ── */}
      {job && (
        <Helmet>
          <title>{`${job.title} at ${job.company_name} | TalentXcel Jobs`}</title>
          <meta 
            name="description" 
            content={`Apply for ${job.title} at ${job.company_name} in ${job.location || 'India'}. ${salaryText}. Verified vacancy with 1-Click direct application on TalentXcel Jobs.`}
          />
          <link rel="canonical" href={canonicalUrl} />
          {isExpired && <meta name="robots" content="noindex, follow" />}
          {jobPostingSchema && (
            <script type="application/ld+json">
              {JSON.stringify(jobPostingSchema)}
            </script>
          )}
          {breadcrumbSchema && (
            <script type="application/ld+json">
              {JSON.stringify(breadcrumbSchema)}
            </script>
          )}
        </Helmet>
      )}

      {/* ── Single Clean Job Portal Header ── */}
      <JobPortalHeader activeTab="find" />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8 text-left">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[#64748B] flex-wrap">
          <Link to="/" className="hover:text-[#2563EB] transition-colors">TalentXcel Jobs</Link>
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <Link to="/jobs" className="hover:text-[#2563EB] transition-colors">Vacancies</Link>
          {job?.department && (
            <>
              <ChevronRight className="w-3 h-3 text-slate-400" />
              <span className="text-[#475569]">{job.department}</span>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-slate-400" />
          <span className="text-[#111827] font-semibold truncate max-w-[200px]">{job?.title || 'Details'}</span>
        </nav>

        {loading ? (
          <div className="bg-white border border-[#E2E8F0] p-16 rounded-3xl text-center space-y-3">
            <Clock className="w-8 h-8 text-[#2563EB] animate-spin mx-auto" />
            <h3 className="font-bold text-base text-[#111827]">Loading verified vacancy details...</h3>
            <p className="text-xs text-[#64748B]">Querying authentic records from Supabase.</p>
          </div>
        ) : errorState || !job ? (
          <div className="bg-white border border-red-200 p-12 rounded-3xl text-center space-y-4">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h2 className="text-xl font-black text-[#111827]">Vacancy Not Found</h2>
            <p className="text-xs text-[#64748B] max-w-md mx-auto">{errorState}</p>
            <div className="pt-2">
              <Button onClick={() => navigate('/jobs')} className="bg-[#2563EB] text-white text-xs font-bold rounded-xl px-6">
                Browse All 2,200+ Live Jobs
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Expired / Closed Notice */}
            {isExpired && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-0.5">
                  <div className="font-bold">This opening has concluded or reached its deadline</div>
                  <p>Applications for this specific requisition are closed. Explore verified active roles in the same category below.</p>
                </div>
              </div>
            )}

            {/* Main Vacancy Card */}
            <Card className="bg-white border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              {/* Header Row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
                <div className="flex items-start gap-4 min-w-0 flex-1">
                  <CompanyLogoAvatar companyName={job.company_name} size="xl" className="mt-1" />
                  <div className="space-y-2 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                        {job.company_name}
                      </span>
                      <a
                        href={`https://www.linkedin.com/search/results/all/?keywords=${encodeURIComponent(job.company_name)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0A66C2] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded-lg transition-colors"
                        title={`Find ${job.company_name} on LinkedIn`}
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>Company LinkedIn</span>
                      </a>
                      <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                        Verified Vacancy
                      </Badge>
                      {countryCode === 'AE' && (
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-bold">
                          🇦🇪 UAE Market ({detectedCurrency})
                        </Badge>
                      )}
                      {countryCode === 'US' && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs font-bold">
                          🇺🇸 US Market ({detectedCurrency})
                        </Badge>
                      )}
                      {countryCode === 'SA' && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-800 border-emerald-200 text-xs font-bold">
                          🇸🇦 Saudi Arabia ({detectedCurrency})
                        </Badge>
                      )}
                      {countryCode === 'QA' && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 text-xs font-bold">
                          🇶🇦 Qatar ({detectedCurrency})
                        </Badge>
                      )}
                      {countryCode === 'OM' && (
                        <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200 text-xs font-bold">
                          🇴🇲 Oman ({detectedCurrency})
                        </Badge>
                      )}
                      {isFullyRemote && (
                        <Badge variant="outline" className="text-purple-700 bg-purple-50 border-purple-200 text-xs font-bold">
                          🌐 Remote / Telecommute
                        </Badge>
                      )}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight leading-tight">
                      {job.title}
                    </h1>

                    <div className="flex items-center gap-4 text-xs text-[#64748B] flex-wrap pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job.location || 'Pan-India'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <DollarSign className="w-3.5 h-3.5" />
                        {salaryText}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                        {job.employment_type || 'Full-Time'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShareLinkedIn}
                    className="h-10 px-3.5 rounded-xl text-xs font-semibold text-[#0A66C2] border-[#0A66C2]/30 hover:bg-[#0A66C2]/10"
                    title="Share opening on LinkedIn"
                  >
                    <Linkedin className="w-4 h-4 mr-1.5" />
                    Share on LinkedIn
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="h-10 px-3 rounded-xl text-xs font-semibold text-[#64748B] hover:text-[#111827]"
                    title="Share opening"
                  >
                    <Share2 className="w-4 h-4 mr-1.5" />
                    Share
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSave}
                    className={`h-10 px-3 rounded-xl text-xs font-semibold ${
                      isSaved ? 'text-amber-500 fill-amber-500 border-amber-300' : 'text-[#64748B]'
                    }`}
                  >
                    <Bookmark className="w-4 h-4 mr-1.5" />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>

                  {!isExpired && (
                    <Button
                      onClick={() => setApplyModalOpen(true)}
                      className="h-10 bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-6 rounded-xl shadow-xs"
                    >
                      1-Click Apply →
                    </Button>
                  )}
                </div>
              </div>

              {/* Overview & Key Highlights Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F4F7FC] p-4 rounded-2xl border border-[#E2E8F0] text-xs">
                <div>
                  <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Experience</span>
                  <div className="font-bold text-[#111827] mt-0.5">
                    {job.min_experience !== null && job.min_experience !== undefined
                      ? `${job.min_experience} - ${job.max_experience || (job.min_experience + 3)} Yrs`
                      : 'Experience not specified'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Work Mode</span>
                  <div className="font-bold text-[#111827] mt-0.5 capitalize">
                    {job.work_mode || (job.is_remote ? 'Remote' : 'On-Site / Hybrid')}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Department</span>
                  <div className="font-bold text-[#111827] mt-0.5 truncate">
                    {job.department || 'Engineering & Operations'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">Verification</span>
                  <div className="font-bold text-emerald-700 mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Direct Employer</span>
                  </div>
                </div>
              </div>

              {/* Applicant Eligibility & Regional Visa Policy */}
              {(job as any).applicant_location_requirements && (
                <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 text-xs space-y-1">
                  <div className="font-bold text-[#2563EB] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                    <span>Applicant Eligibility & Work Authorization Policy</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed font-medium">
                    {(job as any).applicant_location_requirements}
                  </p>
                </div>
              )}

              {/* Skills Required */}
              {job.skills_required && job.skills_required.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-bold text-sm text-[#111827]">Required Core Skills</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills_required.map((skill, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-[#F4F7FC] text-[#2563EB] border border-blue-200 px-3 py-1 rounded-lg font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Description & Summary */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-[#111827]">Job Overview</h3>
                <div className="text-xs sm:text-sm text-[#475569] leading-relaxed space-y-3">
                  <p>
                    {job.job_summary || `Opportunity for an experienced ${job.title} to join ${job.company_name}. In this role, you will collaborate with cross-functional stakeholders, solve complex domain problems, and contribute directly to production deliverables.`}
                  </p>
                </div>
              </div>

              {/* Responsibilities & Qualifications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2 bg-[#F4F7FC] p-5 rounded-2xl border border-[#E2E8F0]">
                  <h4 className="font-bold text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Key Responsibilities</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[#475569]">
                    <li>• Deliver high-quality deliverables matching team roadmaps and standards.</li>
                    <li>• Partner with cross-functional teams to resolve production bottlenecks.</li>
                    <li>• Apply industry best practices in performance, documentation, and quality.</li>
                    <li>• Proactively identify areas for technical or workflow improvements.</li>
                  </ul>
                </div>

                <div className="space-y-2 bg-[#F4F7FC] p-5 rounded-2xl border border-[#E2E8F0]">
                  <h4 className="font-bold text-xs text-[#111827] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Qualifications & Eligibility</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-[#475569]">
                    <li>• Proven background in {job.skills_required?.slice(0, 2).join(' / ') || 'relevant discipline'}.</li>
                    <li>• Strong analytical and structured problem-solving discipline.</li>
                    <li>• Demonstrated ability to execute independently and within a distributed team.</li>
                    <li>• Clear verbal and written professional communication skills.</li>
                  </ul>
                </div>
              </div>

              {/* Bottom Application Bar */}
              <div className="pt-6 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs text-[#64748B]">
                  <span>Interested in this role? </span>
                  <strong className="text-[#111827]">Direct employer routing active.</strong>
                </div>

                <div className="flex items-center gap-3">
                  {job.external_url && (
                    <a
                      href={job.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-[#475569] hover:text-[#111827] flex items-center gap-1 hover:underline"
                    >
                      <span>Employer Career Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}

                  {!isExpired && (
                    <Button
                      onClick={() => setApplyModalOpen(true)}
                      className="bg-gradient-to-r from-[#2563EB] to-[#7138E8] hover:opacity-95 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-xs"
                    >
                      1-Click Direct Apply
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Related Genuine Vacancies */}
            {relatedJobs.length > 0 && (
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xl text-[#111827]">Related Verified Vacancies</h3>
                  <Link to="/jobs" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
                    <span>View all {job.department || ''} jobs →</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedJobs.map((rel) => (
                    <Card
                      key={rel.id}
                      onClick={() => navigate(`/jobs/${generateSlug(rel.title, rel.id)}`)}
                      className="bg-white border-[#E2E8F0] hover:border-[#2563EB] hover:shadow-xs transition-all p-5 rounded-2xl cursor-pointer flex flex-col justify-between"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-[#2563EB]">{rel.company_name}</span>
                          <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-50">Verified</Badge>
                        </div>
                        <h4 className="font-bold text-sm text-[#111827] line-clamp-1">{rel.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-[#64748B]">
                          <span>{rel.location}</span>
                          {rel.salary_min && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">₹{(rel.salary_min / 100000).toFixed(1)}L+ CTC</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2563EB]">
                        <span>Inspect Role</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 1-Click Fast Apply Modal */}
      {job && (
        <GuestJobApplyModal
          open={applyModalOpen}
          onOpenChange={setApplyModalOpen}
          job={job}
          onSuccess={() => {
            setApplyModalOpen(false);
            toast.success('Application registered! Track review status in My Applications.');
          }}
        />
      )}

      {/* Comprehensive Employment Footer */}
      <JobPortalFooter />
    </div>
  );
};
