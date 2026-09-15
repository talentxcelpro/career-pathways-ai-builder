import React, { useEffect } from 'react';
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
  Briefcase, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronRight,
  Search,
  Sparkles,
  TrendingUp,
  FileCheck2
} from 'lucide-react';
import { formatSalaryRange } from '@/utils/currencyUtils';
import { toast } from 'sonner';
import { PublicJobApplyButton } from '@/components/jobs/PublicJobApplyButton';
import { ReactJobStructuredData } from '@/components/seo/ReactJobStructuredData';
import { getPublicJobUrl, getPublicCompanyUrl } from '@/lib/seo/canonicalUrls';

export default function JobDetails() {
  const { slugOrId = '' } = useParams<{ slugOrId: string }>();
  const navigate = useNavigate();

  // Fetch job details with reliable fallback
  const { data: job, isLoading, error } = useQuery({
    queryKey: ['job-details', slugOrId],
    queryFn: async () => {
      if (!slugOrId) return null;

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

      // Strategy 3: Try fuzzy title / ILIKE search from jobs table
      const titleKeywords = slugOrId
        .replace(/-/g, ' ')
        .replace(/\b(noida|uttar|pradesh|india|chatr|charchat|talentxcel|services|\d+)\b/gi, '')
        .trim();

      if (titleKeywords.length >= 3) {
        const { data: titleJob } = await supabase
          .from('jobs')
          .select('*')
          .ilike('title', `%${titleKeywords.split(' ')[0]}%`)
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

  const handleShare = () => {
    const canonical = getPublicJobUrl(job?.seo_slug || slugOrId);
    navigator.clipboard.writeText(canonical);
    toast.success('Job link copied to clipboard');
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
    const rawRole = slugOrId ? slugOrId.replace(/[-_]+/g, ' ') : 'Career';
    const roleCapitalized = rawRole.replace(/\b\w/g, (c) => c.toUpperCase());

    return (
      <>
        <Helmet>
          <title>{roleCapitalized} Opportunities &amp; Verified Openings | TalentXcel</title>
          <meta name="description" content={`Explore live ${roleCapitalized} openings, in-hand salary calculations, and free ATS resume diagnostics on TalentXcel.`} />
          <meta name="robots" content="noindex, follow" />
        </Helmet>

        <div className="min-h-screen bg-slate-950 text-slate-100 py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-8 text-center">
            
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" />
                <span>Listing Closed / Filled</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
                {roleCapitalized} Opportunities on TalentXcel
              </h1>

              <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
                This specific job posting has concluded applications. Discover active verified {rawRole} openings across India, optimize your resume, and benchmark your 2026 salary expectations below.
              </p>
            </div>

            {/* Quick Action Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <Card className="bg-slate-900/80 border-slate-800 text-left p-5 space-y-3">
                <Briefcase className="w-6 h-6 text-blue-400" />
                <h3 className="text-sm font-bold text-white">Browse Live Jobs</h3>
                <p className="text-xs text-slate-400">Search 4,800+ active tech &amp; corporate openings in India.</p>
                <Button 
                  onClick={() => navigate(`/jobs?search=${encodeURIComponent(rawRole)}`)} 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                >
                  <Search className="w-3.5 h-3.5 mr-1.5" /> Search {roleCapitalized} Jobs
                </Button>
              </Card>

              <Card className="bg-slate-900/80 border-slate-800 text-left p-5 space-y-3">
                <FileCheck2 className="w-6 h-6 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Free ATS Resume Check</h3>
                <p className="text-xs text-slate-400">Get a 10-second parseability audit for top Indian recruiters.</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/resume')} 
                  className="w-full border-slate-700 text-white hover:bg-slate-800 text-xs font-bold"
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Check Resume (100% Free)
                </Button>
              </Card>

              <Card className="bg-slate-900/80 border-slate-800 text-left p-5 space-y-3">
                <TrendingUp className="w-6 h-6 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">2026 Salary Calculator</h3>
                <p className="text-xs text-slate-400">Calculate take-home in-hand pay across Bangalore, Pune &amp; NCR.</p>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/tools/salary-analyzer?role=${encodeURIComponent(rawRole)}`)} 
                  className="w-full border-slate-700 text-white hover:bg-slate-800 text-xs font-bold"
                >
                  <IndianRupee className="w-3.5 h-3.5 mr-1.5" /> Benchmark Salary
                </Button>
              </Card>
            </div>

            {/* Popular City Links */}
            <div className="pt-6 border-t border-slate-900">
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
                  { name: 'Remote India', path: '/jobs/remote/software-engineer/india' },
                ].map((hub) => (
                  <Link 
                    key={hub.name} 
                    to={hub.path} 
                    className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
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

  const companyName = job.company_name || 'TalentXcel Services';
  const companySlug = 'talentxcel';

  return (
    <>
      <ReactJobStructuredData job={job} />

      <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 pb-20">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-1.5 flex-wrap">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/jobs" className="hover:text-white transition-colors">Jobs</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/company/${companySlug}`} className="hover:text-white transition-colors">{companyName}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-400 font-medium truncate max-w-[200px]">{job.title}</span>
          </nav>

          {/* Job Hero Card */}
          <header className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10 text-xs">
                    {job.employment_type || 'Full-time'}
                  </Badge>
                  {job.is_remote ? (
                    <Badge variant="outline" className="border-purple-500/40 text-purple-400 bg-purple-500/10 text-xs">
                      Remote Role
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-slate-700 text-slate-300 text-xs">
                      On-site
                    </Badge>
                  )}
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 gap-1 text-xs py-0.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Opening
                  </Badge>
                </div>

                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {job.title}
                </h1>

                <p className="text-sm font-medium text-slate-300 mt-1.5 flex items-center gap-2">
                  <Link to={`/company/${companySlug}`} className="text-blue-400 hover:underline flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> {companyName}
                  </Link>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" /> {job.location || 'Noida, India'}
                  </span>
                </p>

                {job.salary_min && (
                  <div className="mt-3 text-emerald-400 font-semibold text-base flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" />
                    <span>
                      {(job.salary_min / 100000).toFixed(1)}L - {((job.salary_max || job.salary_min) / 100000).toFixed(1)}L per annum
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                <PublicJobApplyButton
                  jobId={job.id}
                  jobTitle={job.title}
                  companyName={companyName}
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  className="border-slate-700 hover:bg-slate-800 text-slate-300"
                  aria-label="Share Job"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </header>

          {/* Job Description & Details */}
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-400" /> Job Description & Requirements
                </h2>
                <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </section>

              {/* Company Info Box */}
              <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
                <h3 className="text-base font-bold text-white">About the Employer</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {companyName} is an AI-powered talent and recruitment organization providing strategic staffing, technology solutions, and career intelligence.
                </p>
                <Link to={`/company/${companySlug}`}>
                  <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 text-xs p-0 h-auto">
                    View Company Profile & Open Roles &rarr;
                  </Button>
                </Link>
              </section>
            </div>

            {/* Right Column: Key Summary */}
            <div className="space-y-6">
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white">Role Summary</h3>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Employment Type</span>
                    <span className="text-white font-medium">{job.employment_type || 'Full-time'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Location</span>
                    <span className="text-white font-medium">{job.location || 'Noida, India'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Workplace Type</span>
                    <span className="text-white font-medium">{job.is_remote ? 'Remote' : 'On-site'}</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-800">
                    <span className="text-slate-400">Date Posted</span>
                    <span className="text-white font-medium">
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status</span>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                      Active Opening
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Free ATS Resume Tool CTA */}
              <div className="bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-900/40 rounded-2xl p-6 space-y-3">
                <h3 className="text-base font-bold text-white">Optimize Your Resume</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ensure your resume matches this job’s keywords and passes applicant tracking system parsers.
                </p>
                <Link to="/resume" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
                    Open Free ATS Resume Studio
                  </Button>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}