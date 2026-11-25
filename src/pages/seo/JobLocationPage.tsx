import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Building, TrendingUp, AlertCircle, Globe, Sparkles, CheckCircle2, IndianRupee, Bookmark } from 'lucide-react';
import { formatSalaryRange } from '@/utils/currencyUtils';
import { conversionTelemetry } from '@/utils/conversionTelemetry';
import { createSafeHtml } from '@/utils/sanitize';
import { GrowthExperimentWrapper } from '@/components/conversion/GrowthExperimentWrapper';
import { ResumeQuickScanWidget } from '@/components/conversion/ResumeQuickScanWidget';
import { RelatedSubdomainLinks } from '@/components/navigation/RelatedSubdomainLinks';
import { SubdomainMeshFooter } from '@/components/navigation/SubdomainMeshFooter';
import { RelatedHubsMesh } from '@/components/seo/RelatedHubsMesh';
import { getTier2LocationConfig } from '@/data/tier2LocationsData';
import { isNoindexPath } from '@/config/seo';
import { JobAlertCaptureCard } from '@/components/jobs/JobAlertCaptureCard';
import { WhatsAppChannelCard } from '@/components/jobs/WhatsAppChannelCard';
import { CITY_REGISTRY_ALL, resolveCity } from '@/lib/geo/cityRegistry';
import { findNearbyQualifiedCities } from '@/lib/geo/cityInternalLinking';
import { resolveCanonicalLocation } from '@/lib/geo/canonicalGeoResolver';

/**
 * Non-city slugs that have been incorrectly indexed under /locations/.
 * Each entry maps slug → redirect target.
 * SOURCE: GSC Pages.csv analysis — these slugs appear in /locations/ namespace
 * but resolve to topic/brand pages, not geographic job pages.
 */
const NON_CITY_REDIRECT_MAP: Record<string, string> = {
  'deep-learning': '/jobs?skill=deep-learning',
  'freshers': '/jobs?experience=fresher',
  'spotify': '/companies?q=spotify',
  'talentxcel': '/about',
};

interface JobLocationPageProps {}

export const CITY_ALIAS_MAP: Record<string, string> = {
  'gurgaon': 'gurugram',
  'cyber city': 'gurugram',
  'cyber city gurgaon': 'gurugram',
  'gurugram, haryana': 'gurugram',
  'gurgaon, haryana': 'gurugram',
  'bengaluru': 'bangalore',
  'bangalore, karnataka': 'bangalore',
  'bengaluru, karnataka': 'bangalore',
  'prayagraj': 'allahabad',
  'allahabad': 'prayagraj',
  'cochin': 'kochi',
  'ernakulam': 'kochi',
  'trivandrum': 'thiruvananthapuram',
  'mysore': 'mysuru',
  'baroda': 'vadodara',
  'vizag': 'visakhapatnam',
  'bombay': 'mumbai',
  'madras': 'chennai',
  'calcutta': 'kolkata',
  'poona': 'pune',
  'secunderabad': 'hyderabad',
  'cyberabad': 'hyderabad',
  'new delhi': 'delhi',
  'delhi ncr': 'delhi',
  'ncr': 'delhi',
  'greater noida': 'noida',
  'pondicherry': 'puducherry',
  'belagavi': 'belgaum',
  'hubballi': 'hubli',
  'vijayapura': 'bijapur',
  'kalaburagi': 'gulbarga',
  'shimoga': 'shivamogga',
  'mangaluru': 'mangalore',
  'waltair': 'visakhapatnam',
  'simla': 'shimla',
  'gauhati': 'guwahati',
  'trichy': 'tiruchirappalli',
  'tirunelveli': 'nellai',
  'tuticorin': 'thoothukudi',
  'tanjore': 'thanjavur',
  'kozhikode': 'calicut',
  'palghat': 'palakkad',
  'alleppey': 'alappuzha',
  'quilon': 'kollam',
  'cannannore': 'kannur',
  'remote - india': 'remote',
  'india - remote': 'remote',
  'remote, india': 'remote',
  'remote, in': 'remote',
  'work from home': 'remote',
  'wfh': 'remote',
  'pan india': 'pan-india',
  'all india': 'pan-india',
  'pan-india': 'pan-india',
};

const JobLocationPage: React.FC<JobLocationPageProps> = () => {
  const { location: routeLocation } = useParams<{ location: string }>();
  const navigate = useNavigate();
  const [realJobs, setRealJobs] = useState<any[]>([]);
  const [totalJobsCount, setTotalJobsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [indexReadyCities, setIndexReadyCities] = useState<Set<string>>(new Set());

  // ── Non-city slug guard ──────────────────────────────────────────────────────
  // These slugs were incorrectly indexed under /locations/ namespace.
  // Redirect them to their correct destination before any data fetch.
  useEffect(() => {
    if (!routeLocation) return;
    const slug = routeLocation.toLowerCase().trim();
    const redirectTarget = NON_CITY_REDIRECT_MAP[slug];
    if (redirectTarget) {
      // 301-equivalent client-side redirect; server must also implement this
      navigate(redirectTarget, { replace: true });
    }
  }, [routeLocation, navigate]);

  // Robust location resolution: supports route params and direct URL segments (/locations/varanasi, /jobs/varanasi)
  const derivedLocation = useMemo(() => {
    if (routeLocation && routeLocation.trim()) {
      return routeLocation.toLowerCase().trim();
    }
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname.toLowerCase();
      const match = pathname.match(/\/(?:locations|jobs)\/([a-z0-9-]+)/i) || pathname.match(/^\/([a-z0-9-]+)$/i);
      if (match && match[1]) {
        return match[1].toLowerCase().trim();
      }
    }
    return 'varanasi';
  }, [routeLocation]);

  const isGurgaonVariant = derivedLocation === 'gurgaon' || derivedLocation === 'gurugram';
  const canonicalCity = CITY_ALIAS_MAP[derivedLocation] || derivedLocation;
  const locationData = getLocationData(derivedLocation);
  const displayName = isGurgaonVariant ? 'Gurgaon / Gurugram' : locationData.name;
  const canonicalUrl = isGurgaonVariant
    ? 'https://talentxcel.in/locations/gurugram'
    : `https://talentxcel.in/locations/${canonicalCity}`;

  const verifiedCompaniesCount = useMemo(() => {
    return new Set(realJobs.map((j) => j.company_name).filter(Boolean)).size;
  }, [realJobs]);

  // Fetch index-ready city slugs once for geographically justified nearby linking
  useEffect(() => {
    let cancelled = false;
    supabase
      .from('city_registry')
      .select('slug')
      .eq('index_ready', true)
      .eq('active', true)
      .limit(200)
      .then(({ data }) => {
        if (!cancelled && data) {
          setIndexReadyCities(new Set(data.map((r: { slug: string }) => r.slug)));
        }
      });
    return () => { cancelled = true; };
  }, []);

  const nearbyQualifiedCities = useMemo(() => {
    const currentRecord = resolveCity(canonicalCity);
    if (!currentRecord || indexReadyCities.size === 0) return [];
    return findNearbyQualifiedCities(currentRecord, CITY_REGISTRY_ALL, indexReadyCities, 150, 6);
  }, [canonicalCity, indexReadyCities]);

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const locClean = canonicalCity.replace(/-/g, ' ').trim();
        const cityRecord = resolveCity(canonicalCity);
        const searchTerms = Array.from(
          new Set([
            locClean,
            ...(cityRecord?.aliases || []).slice(0, 4),
            ...(canonicalCity === 'bangalore' ? ['bengaluru'] : []),
            ...(canonicalCity === 'gurugram' ? ['gurgaon'] : []),
            ...(canonicalCity === 'aurangabad' ? ['chhatrapati sambhajinagar'] : []),
            ...(canonicalCity === 'hubballi' ? ['hubballi-dharwad', 'hubli'] : []),
          ])
        ).filter(Boolean);

        const filterOr = searchTerms
          .map((t) => `location.ilike.%${t}%,location_city.ilike.%${t}%`)
          .join(',');

        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .or(filterOr)
          .eq('is_active', true)
          .order('posted_at', { ascending: false })
          .limit(200);

        // Word-boundary + canonical alias filter prevents substring leaks (e.g. Visakhapatnam -> Patna)
        // while preserving 100% of genuine active jobs regardless of expiry_date.
        const genuinelyMapped = (data || []).filter((job: any) => {
          const resolved = resolveCanonicalLocation(job.location, job.location_city);
          return resolved.allCities.some((c) => c.canonicalSlug === canonicalCity);
        });

        if (!error && genuinelyMapped.length > 0) {
          setRealJobs(genuinelyMapped.slice(0, 50));
          setTotalJobsCount(genuinelyMapped.length);
        } else {
          // If no local jobs exist for this city, show zero local count and optional remote jobs
          const { data: fallbackData } = await supabase
            .from('jobs')
            .select('*')
            .or('is_remote.eq.true,location.ilike.%remote%')
            .eq('is_active', true)
            .limit(10);
          setRealJobs(fallbackData || []);
          setTotalJobsCount(0);
        }
      } catch (err) {
        console.warn('[JobLocationPage] Error loading location jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [derivedLocation, canonicalCity, isGurgaonVariant]);

  // ── Index Readiness Gate ─────────────────────────────────────────────────────
  // CRITICAL: isIndexable must NEVER be hardcoded to true.
  // Index readiness is determined by live job inventory once loading completes.
  // Rules (from cityIndexReadinessGate.ts thresholds):
  //   - Minimum 5 active jobs (MIN_ACTIVE_JOBS)
  //   - Loading: use isNoindexPath() as the conservative default
  //   - Non-city slugs: handled by NON_CITY_REDIRECT_MAP above (never reach here)
  const effectiveCount = totalJobsCount || realJobs.length;
  const isIndexable: boolean = loading
    ? !isNoindexPath(`/locations/${canonicalCity}`)  // Conservative: use config gate during SSR/load
    : effectiveCount >= 5;                             // Live gate: require ≥5 active jobs
  const locationRobotsDirective = isIndexable ? 'index, follow' : 'noindex, follow';
  const pageTitle = (isGurgaonVariant && effectiveCount > 0)
    ? `Jobs in Gurgaon / Gurugram: ${effectiveCount} Openings, Apply in 1 Tap | TalentXcel`.slice(0, 60)
    : (effectiveCount > 0
        ? `Jobs in ${displayName}: ${effectiveCount} Openings, Apply in 1 Tap | TalentXcel`.slice(0, 60)
        : `Jobs in ${displayName}: Verified Vacancies | TalentXcel`.slice(0, 60)
      );

  const pageDescription = effectiveCount > 0
    ? `Apply in 1 tap to ${effectiveCount} verified job vacancies in ${displayName}. Direct hiring across IT, tech, logistics, and sales with transparent salaries on TalentXcel.`
    : locationData.description;

  useEffect(() => {
    conversionTelemetry.track('landing_view', {
      source: 'seo_job_location',
      location: derivedLocation,
      city_name: locationData.name
    });
    conversionTelemetry.setAcquisitionContext('seo_job_location', `/locations/${derivedLocation}`);
  }, [derivedLocation, locationData.name]);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={locationData.keywords.join(', ')} />
        <link rel="canonical" href={canonicalUrl} />
        <meta name="robots" content={locationRobotsDirective} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        
        {/* Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify(locationData.structuredData)}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 text-slate-900">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-50 py-10 sm:py-14 border-b border-slate-200/60">
          {/* Ambient lighting matching homepage */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-24 right-1/4 w-[600px] h-[350px] bg-gradient-to-br from-blue-400/10 via-indigo-400/5 to-purple-400/5 rounded-full blur-[130px]" />
            <div className="absolute top-1/2 -left-20 w-[450px] h-[300px] bg-gradient-to-tr from-cyan-400/10 via-blue-500/5 to-indigo-500/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10">
            {/* Breadcrumbs */}
            <nav className="mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2 text-xs sm:text-sm text-slate-500">
                <li><a href="/" className="hover:text-blue-600 transition-colors">Home</a></li>
                <li><span className="mx-2 text-slate-300">/</span></li>
                <li><a href="/jobs" className="hover:text-blue-600 transition-colors">Jobs</a></li>
                <li><span className="mx-2 text-slate-300">/</span></li>
                <li className="text-slate-900 font-semibold">{locationData.name}</li>
              </ol>
            </nav>

            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs mb-4">
                <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Verified Local Openings &bull; {locationData.name}, India</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.12] mb-3">
                Job Vacancies in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">{locationData.name}</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 mb-6 leading-relaxed max-w-3xl">
                {locationData.description}
              </p>
              
              <div className="flex flex-wrap gap-3 mb-8">
                <Button 
                  size="lg" 
                  className="gap-2 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 rounded-xl h-11"
                  onClick={() => {
                    const jobsSection = document.getElementById('location-jobs-grid');
                    if (jobsSection) jobsSection.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <Search className="h-4 w-4" />
                  View {totalJobsCount || realJobs.length} Verified Jobs
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="gap-2 font-semibold border-slate-200 bg-white text-slate-800 hover:bg-slate-50 hover:text-blue-600 rounded-xl h-11 shadow-2xs"
                  onClick={() => navigate('/resume/ats-check')}
                >
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  Free ATS Resume Score
                </Button>
              </div>

              {/* 1-Click ATS Match & Instant Apply Dropzone */}
              <div className="my-6">
                <ResumeQuickScanWidget
                  role="Verified Roles"
                  location={locationData.name}
                  matchingJobsCount={totalJobsCount || realJobs.length || 16}
                />
              </div>

              {/* Location Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8">
                <div className="bg-white border-2 border-slate-200/80 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                    <Building className="h-5 w-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">{verifiedCompaniesCount}+</div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Companies Hiring</p>
                </div>
                <div className="bg-white border-2 border-slate-200/80 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-2">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">{totalJobsCount || realJobs.length}+</div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Active Verified Openings</p>
                </div>
                <div className="bg-white border-2 border-slate-200/80 p-5 sm:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-2">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900">{locationData.stats.avgSalary}</div>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">Average Salary Band</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 sm:py-16 bg-white text-slate-900">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-10">
                {/* Job Listings Anchor */}
                <div id="location-jobs-grid" className="space-y-6">
                  {/* High-Converting 1-Tap Job Alert Capture */}
                  <WhatsAppChannelCard locationName={locationData.name} className="mb-6" />
                  <JobAlertCaptureCard locationName={locationData.name} />
                  
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h2 className="text-2xl font-black text-slate-900">Verified Openings in {locationData.name}</h2>
                      <p className="text-xs text-slate-500 mt-0.5">Updated live &bull; 100% verified employer listings</p>
                    </div>
                    {realJobs.length > 0 && (
                      <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-mono font-bold">
                        {realJobs.length} Live Openings
                      </span>
                    )}
                  </div>

                  {loading ? (
                    <div className="p-12 text-center text-sm font-mono text-slate-400 animate-pulse bg-slate-50 rounded-2xl border border-slate-200">
                      Loading verified jobs in {locationData.name}...
                    </div>
                  ) : realJobs.length > 0 ? (
                    <div className="grid gap-4 sm:gap-5">
                      {realJobs.map((job) => (
                        <Card 
                          key={job.id} 
                          className="bg-white border border-slate-200/90 hover:border-blue-400 hover:shadow-md transition-all p-5 rounded-2xl flex flex-col justify-between space-y-3.5 group text-left"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  {job.is_featured && (
                                    <Badge className="bg-blue-50 border-blue-200 text-blue-700 text-[10px] font-semibold">
                                      Featured
                                    </Badge>
                                  )}
                                  {job.is_remote && (
                                    <Badge className="bg-purple-50 border-purple-200 text-purple-700 text-[10px] font-semibold">
                                      Remote
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="border-slate-200 text-slate-600 text-[10px] shrink-0">
                                    {job.employment_type || 'Full-time'}
                                  </Badge>
                                </div>
                                <h3 
                                  onClick={() => navigate(`/jobs/${job.seo_slug || job.id}`)}
                                  className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors cursor-pointer line-clamp-1"
                                >
                                  {job.title || job.job_title}
                                </h3>
                                <p className="text-xs text-slate-600 font-medium">{job.company_name || 'TalentXcel Partner'}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-600 pt-0.5 flex-wrap">
                              {(job.location || locationData.name) && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                  {job.location || locationData.name}
                                </span>
                              )}
                              {(job.salary_min || job.salary_max) && (
                                <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                                  <IndianRupee className="w-3.5 h-3.5" />
                                  {formatSalaryRange(job.salary_min, job.salary_max, job.salary_currency)}
                                </span>
                              )}
                              {job.experience_level && (
                                <span className="text-slate-400">
                                  &bull; {job.experience_level}
                                </span>
                              )}
                            </div>

                            {/* Skills Tags */}
                            {job.skills_required && job.skills_required.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {(Array.isArray(job.skills_required) ? job.skills_required : (job.ai_skill_tags ? job.ai_skill_tags.split(',') : [])).slice(0, 4).map((s: string, idx: number) => (
                                  <span key={idx} className="bg-slate-100 text-slate-700 border border-slate-200 text-[11px] px-2 py-0.5 rounded-md font-medium">
                                    {s.trim()}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="pt-3.5 mt-2 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Opening
                            </span>
                            <Button 
                              size="sm"
                              onClick={() => navigate(`/jobs/${job.seo_slug || job.id}`)}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold h-8 px-4 rounded-xl shadow-xs"
                            >
                              View &amp; Apply
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 rounded-2xl border border-amber-200 bg-amber-50/40 space-y-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-slate-900 text-base">
                            Local Openings Currently Onboarding in {locationData.name}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">
                            TalentXcel verifies every opening to prevent ghost jobs. While new local employers in {locationData.name} are completing verification, explore immediate matching alternatives:
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <Button variant="outline" onClick={() => navigate('/jobs')} className="justify-start gap-2 h-auto py-3 border-slate-200 bg-white hover:bg-slate-50 text-slate-800">
                          <Globe className="w-4 h-4 text-blue-600 shrink-0" />
                          <div className="text-left">
                            <div className="text-xs font-semibold">Browse Pan-India & Remote Jobs</div>
                            <div className="text-[11px] text-slate-500">Work from {locationData.name} for verified employers</div>
                          </div>
                        </Button>
                        <Button variant="outline" onClick={() => navigate('/resume/ats-check')} className="justify-start gap-2 h-auto py-3 border-slate-200 bg-white hover:bg-slate-50 text-slate-800">
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div className="text-left">
                            <div className="text-xs font-semibold">Instant ATS Skill Readiness Scan</div>
                            <div className="text-[11px] text-slate-500">Benchmark profile & get matched automatically</div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Editorial Industry Guide */}
                <div 
                  className="prose prose-slate max-w-none pt-8 border-t border-slate-200 text-slate-700 prose-headings:text-slate-900 prose-headings:font-bold prose-strong:text-slate-900 prose-li:text-slate-700"
                  dangerouslySetInnerHTML={createSafeHtml(locationData.content)}
                />

                {/* Controlled Cohort Experiment */}
                <div className="mb-10 text-slate-900">
                  <GrowthExperimentWrapper
                    location={locationData.name}
                    sourcePage={`job_location_${derivedLocation}`}
                  />
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                {/* Popular Job Categories */}
                <div className="bg-white border-2 border-slate-200/80 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-base font-bold mb-4 text-slate-900">Popular Job Categories in {locationData.name}</h3>
                  <div className="space-y-1.5 text-sm">
                    {['IT & Software Jobs', 'Fresher Jobs', 'Banking & Finance Jobs', 'Healthcare Jobs', 'Teaching & Academic Jobs', 'Sales & Marketing Jobs'].map((category) => (
                      <a 
                        key={category}
                        href={`/jobs?search=${encodeURIComponent(category + ' ' + locationData.name)}`}
                        className="block text-slate-600 hover:text-blue-600 font-medium transition-colors py-2 border-b border-slate-100 last:border-0"
                      >
                        {category} in {locationData.name}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Top Companies */}
                <div className="bg-white border-2 border-slate-200/80 p-6 rounded-2xl shadow-sm">
                  <h3 className="text-base font-bold mb-4 text-slate-900">Top Employers Hiring in {locationData.name}</h3>
                  <div className="space-y-2 text-sm">
                    {locationData.topCompanies.map((company: string) => (
                      <div 
                        key={company}
                        className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                      >
                        <span className="text-slate-900 font-medium">{company}</span>
                        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Hiring
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nearby Qualified Employment Hubs (<= 150km, Index-Ready Only) */}
                {nearbyQualifiedCities.length > 0 && (
                  <div className="bg-white border-2 border-slate-200/80 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-base font-bold mb-4 text-slate-900">
                      Nearby Employment Hubs
                    </h3>
                    <div className="space-y-1.5 text-sm">
                      {nearbyQualifiedCities.map(({ city, distanceKm }) => (
                        <a
                          key={city.slug}
                          href={`/locations/${city.slug}`}
                          className="flex items-center justify-between text-slate-600 hover:text-blue-600 font-medium transition-colors py-2 border-b border-slate-100 last:border-0"
                        >
                          <span>Jobs in {city.canonicalName}</span>
                          <span className="text-xs text-slate-400 font-mono">
                            {Math.round(distanceKm)} km
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Job Alerts CTA */}
                <div className="bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/80 p-6 rounded-2xl border-2 border-blue-200/90 shadow-sm space-y-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Sparkles className="w-5 h-5" />
                    <h3 className="text-base font-bold text-slate-900">Instant Job Alerts</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Get real-time WhatsApp and email alerts when new verified jobs in {locationData.name} are posted.
                  </p>
                  <Button 
                    onClick={() => navigate(`/jobs?location=${encodeURIComponent(locationData.name)}&alert=true`)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 shadow-md shadow-blue-500/20 rounded-xl"
                  >
                    Subscribe to {locationData.name} Alerts
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        {locationData.faqs && (
          <section className="py-16 bg-slate-50 border-t border-slate-200/80">
            <div className="container mx-auto px-4 max-w-4xl">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-8 text-center sm:text-left">
                Frequently Asked Questions &bull; Jobs in {locationData.name}
              </h2>
              <div className="space-y-4">
                {locationData.faqs.map((faq: any, index: number) => (
                  <div key={index} className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-2">{faq.question}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contextual Subdomain Discovery Mesh */}
        <section className="py-12 bg-white border-t border-slate-200/80">
          <div className="container mx-auto px-4 max-w-5xl">
            <RelatedHubsMesh currentCitySlug={derivedLocation} className="mb-8" />
            <RelatedSubdomainLinks role="Software Engineer" city={locationData.name} className="mb-8" />
          </div>
        </section>

        {/* Global Crawlable Subdomain Mesh Footer */}
        <SubdomainMeshFooter />
      </div>
    </>
  );
};

// Location data configuration
function getLocationData(location: string) {
  const norm = (location || '').toLowerCase().trim();

  const locations: Record<string, any> = {
    'varanasi': {
      name: 'Varanasi',
      title: 'Job Vacancies in Varanasi 2026 | Freshers & Experienced | TalentXcel',
      description: 'Explore verified job vacancies in Varanasi for freshers and experienced candidates. Apply directly to IT, banking, teaching, software, and healthcare roles on TalentXcel.',
      h1: 'Job Vacancies in Varanasi (2026)',
      keywords: ['jobs in varanasi', 'varanasi job vacancy', 'jobs for freshers in varanasi', 'it jobs in varanasi', 'private jobs in varanasi', 'teaching jobs varanasi', 'bank jobs in varanasi'],
      stats: {
        avgSalary: '₹3-8L'
      },
      topCompanies: ['TCS', 'Utkarsh Small Finance Bank', 'Banaras Hindu University', 'HDFC Bank', 'Byju\'s', 'Apex Hospitals', 'Tech Mahindra'],
      content: `
        <div class="space-y-6">
          <p>Varanasi is experiencing accelerated economic development, emerging as a prominent commercial and technology corridor in Eastern Uttar Pradesh. With robust infrastructure enhancements, digital governance initiatives, and a burgeoning services sector, career opportunities for freshers and seasoned professionals are expanding rapidly across information technology, banking, healthcare, and higher education.</p>
          
          <h2 class="text-2xl font-bold mt-8 mb-4">Why Build Your Career in Varanasi?</h2>
          <p>The convergence of premier academic institutions like <strong>IIT (BHU) Varanasi</strong> and <strong>Banaras Hindu University</strong> with modern logistics corridors has transformed the regional talent landscape. Leading national enterprises and high-growth fintech startups have established operational bases in Varanasi, offering competitive compensation, structured career ladders, and high quality of life without metro congestion.</p>
          
          <h2 class="text-2xl font-bold mt-8 mb-4">Leading Employment Sectors in Varanasi</h2>
          <ul class="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Information Technology & Software:</strong> Full-stack web development, mobile applications, cloud services, and technical support centers.</li>
            <li><strong>Banking & Financial Services:</strong> Retail banking, microfinance, credit underwriting, and operations led by organizations such as Utkarsh Small Finance Bank and leading national private banks.</li>
            <li><strong>Education & Research:</strong> Academic professorships, research associates, and educational administration across BHU and affiliated institutes.</li>
            <li><strong>Healthcare & Pharmaceuticals:</strong> Super-specialty hospital management, medical technology, diagnostics, and clinical operations.</li>
            <li><strong>Logistics & Supply Chain:</strong> Inland waterway logistics, multimodal transport hubs, and warehousing networks.</li>
          </ul>
          
          <h2 class="text-2xl font-bold mt-8 mb-4">Fresher Opportunities & Salary Benchmark</h2>
          <p>Fresh graduates in Varanasi typically start between ₹2.5L and ₹4.5L per annum in software engineering, technical support, and banking operations. Mid-level and senior professionals in tech leads and managerial roles command salaries ranging from ₹6L to ₹12L+, paired with significantly lower living costs compared to Delhi NCR or Bangalore.</p>
        </div>
      `,
      faqs: [
        {
          question: "What are the best job opportunities in Varanasi for freshers?",
          answer: "Freshers in Varanasi find strong hiring across IT support, junior software engineering, banking sales/operations, digital marketing, and academic teaching roles. Top campus recruiters include TCS, Utkarsh Bank, and regional tech firms."
        },
        {
          question: "Which companies are actively hiring in Varanasi?",
          answer: "Major employers in Varanasi include Utkarsh Small Finance Bank, Tata Consultancy Services (TCS), Banaras Hindu University, HDFC Bank, ICICI Bank, Apex Super Specialty Hospitals, and emerging regional software houses."
        },
        {
          question: "What is the average salary for private jobs in Varanasi?",
          answer: "The average salary band in Varanasi ranges from ₹3,00,000 to ₹8,00,000 per annum depending on experience and domain. Technical roles and financial services offer higher packages with annual performance bonuses."
        },
        {
          question: "How can I check my ATS resume score for Varanasi jobs?",
          answer: "You can use TalentXcel's free ATS Resume Match tool above to instantly upload your resume and benchmark your skill alignment against active Varanasi openings before applying."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Varanasi",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Varanasi",
          "addressRegion": "Uttar Pradesh",
          "addressCountry": "IN"
        },
        "description": "Find verified job vacancies in Varanasi for freshers and experienced professionals. Browse IT, banking, teaching, and healthcare openings."
      }
    },
    'noida': {
      name: 'Noida',
      title: 'Jobs in Noida 2026 | IT, Software, MNCs & Freshers | TalentXcel',
      description: 'Find verified job openings in Noida & Greater Noida. Top IT companies, MNCs, freshers & experienced positions. Apply directly on TalentXcel.',
      h1: 'Jobs in Noida - Premier IT & Corporate Hub (2026)',
      keywords: ['jobs in noida', 'it jobs in noida', 'fresher jobs noida', 'noida corporate jobs', 'software jobs noida'],
      stats: {
        avgSalary: '₹5-14L'
      },
      topCompanies: ['HCL', 'Paytm', 'Adobe', 'Samsung', 'TCS', 'Wipro', 'Microsoft'],
      content: `
        <div class="space-y-6">
          <p>Noida is one of India's premier technology and industrial centers, hosting global corporate headquarters, R&D centers, and software innovation campuses across Sector 62, Expressway, and Greater Noida.</p>
          <h2 class="text-2xl font-bold mt-8 mb-4">Key Industries in Noida</h2>
          <p>Major hiring domains include Software Engineering, Cloud Computing, Fintech, Electronics Manufacturing, and Digital Media.</p>
        </div>
      `,
      faqs: [
        {
          question: "What is the average IT salary in Noida?",
          answer: "IT salaries in Noida average ₹5,00,000 to ₹14,00,000 per annum, with senior software engineers and architects earning ₹18L to ₹35L+."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Noida",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Noida",
          "addressRegion": "Uttar Pradesh",
          "addressCountry": "IN"
        },
        "description": "Explore high-paying IT, corporate, and fresher jobs in Noida."
      }
    },
    'lucknow': {
      name: 'Lucknow',
      title: 'Jobs in Lucknow 2026 | IT, Healthcare, Banking & Freshers | TalentXcel',
      description: 'Discover top job vacancies in Lucknow across IT, healthcare, banking, education, and administrative sectors. Apply online now.',
      h1: 'Job Openings in Lucknow (2026)',
      keywords: ['jobs in lucknow', 'lucknow job vacancy', 'it jobs in lucknow', 'fresher jobs lucknow'],
      stats: {
        avgSalary: '₹3.5-9L'
      },
      topCompanies: ['TCS', 'HCL', 'Tata Motors', 'Utkarsh Bank', 'Medanta', 'Apollo'],
      content: `
        <div class="space-y-6">
          <p>Lucknow, the capital of Uttar Pradesh, offers expanding career opportunities in IT Parks, manufacturing, healthcare, and financial services.</p>
        </div>
      `,
      faqs: [
        {
          question: "Which IT companies are present in Lucknow?",
          answer: "TCS and HCL have large delivery campuses in Lucknow, providing hundreds of technology and business process roles."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Lucknow",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Lucknow",
          "addressRegion": "Uttar Pradesh",
          "addressCountry": "IN"
        },
        "description": "Find verified careers in Lucknow across IT, healthcare, and corporate sectors."
      }
    },
    'bangalore': {
      name: 'Bangalore',
      title: 'Jobs in Bangalore 2026 | IT, Engineering & All Categories | TalentXcel',
      description: 'Find the best jobs in Bangalore. Browse IT, engineering, product management, and startup opportunities in India\'s Silicon Valley. Apply now!',
      h1: 'Jobs in Bangalore - India\'s Silicon Valley (2026)',
      keywords: ['jobs in bangalore', 'bangalore careers', 'it jobs bangalore', 'engineering jobs bangalore', 'fresher jobs bangalore'],
      stats: {
        avgSalary: '₹5-12L'
      },
      topCompanies: ['Infosys', 'TCS', 'Wipro', 'Accenture', 'Microsoft', 'Google'],
      content: `
        <div class="space-y-6">
          <p>Bangalore, often called India's Silicon Valley, is the country's leading technology hub offering exceptional career opportunities for professionals across all domains. From startups to multinational corporations, the city hosts the largest concentration of IT companies in India.</p>
        </div>
      `,
      faqs: [
        {
          question: "What is the cost of living in Bangalore?",
          answer: "Bangalore has a moderate to high cost of living. Tech corridors like Whitefield and HSR Layout are competitive, but strong compensation packages offer high purchasing power."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Bangalore",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Bangalore",
          "addressRegion": "Karnataka",
          "addressCountry": "IN"
        },
        "description": "Find top jobs in Bangalore's tech and startup ecosystem."
      }
    },
    'mumbai': {
      name: 'Mumbai',
      title: 'Jobs in Mumbai 2026 | Finance, Media & All Industries | TalentXcel',
      description: 'Explore job opportunities in Mumbai - India\'s financial capital. Find roles in banking, finance, media, entertainment, and tech.',
      h1: 'Jobs in Mumbai - Financial Capital of India (2026)',
      keywords: ['jobs in mumbai', 'mumbai careers', 'finance jobs mumbai', 'banking jobs mumbai', 'media jobs mumbai'],
      stats: {
        avgSalary: '₹6-15L'
      },
      topCompanies: ['HDFC Bank', 'ICICI Bank', 'Reliance', 'Tata Group', 'Aditya Birla', 'Bajaj'],
      content: `
        <div class="space-y-6">
          <p>Mumbai, India's financial capital, offers premier opportunities in banking, wealth management, media, corporate law, and technology.</p>
        </div>
      `,
      faqs: [
        {
          question: "Which areas are best for finance careers in Mumbai?",
          answer: "Bandra-Kurla Complex (BKC), Lower Parel, Nariman Point, and Fort host the majority of top investment banks and financial institutions."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Mumbai",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Mumbai",
          "addressRegion": "Maharashtra",
          "addressCountry": "IN"
        },
        "description": "Explore finance, tech, and corporate jobs in Mumbai."
      }
    },
    'delhi': {
      name: 'Delhi NCR',
      title: 'Jobs in Delhi NCR 2026 | Government, Corporate & Tech | TalentXcel',
      description: 'Discover career opportunities in Delhi NCR. Find jobs in government, corporate consulting, IT, and media in India\'s capital region.',
      h1: 'Jobs in Delhi NCR - Capital of Opportunities (2026)',
      keywords: ['jobs in delhi', 'delhi ncr careers', 'government jobs delhi', 'corporate jobs delhi', 'gurgaon jobs'],
      stats: {
        avgSalary: '₹5-14L'
      },
      topCompanies: ['HCL', 'Genpact', 'American Express', 'IBM', 'Deloitte', 'EY'],
      content: `
        <div class="space-y-6">
          <p>Delhi NCR provides immense career depth across public sector organizations, multinational consulting hubs in Gurgaon, and tech corridors in Noida.</p>
        </div>
      `,
      faqs: [
        {
          question: "How is the job market for freshers in Delhi NCR?",
          answer: "Delhi NCR has extensive fresher hiring across consulting, software services, financial analytics, and government exam pathways."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Delhi NCR",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Delhi",
          "addressRegion": "Delhi",
          "addressCountry": "IN"
        },
        "description": "Explore jobs in Delhi NCR across corporate, tech, and government sectors."
      }
    },
    'hyderabad': {
      name: 'Hyderabad',
      title: 'Jobs in Hyderabad 2026 | IT, Pharma, Biotech & MNCs | TalentXcel',
      description: 'Explore high-paying jobs in Hyderabad. Top IT, AI, Cyberabad tech corridor, and pharmaceutical companies hiring freshers and experienced talent.',
      h1: 'Jobs in Hyderabad - HITEC City & Tech Capital (2026)',
      keywords: ['jobs in hyderabad', 'hitec city jobs', 'it jobs hyderabad', 'pharma jobs hyderabad'],
      stats: {
        avgSalary: '₹5.5-16L'
      },
      topCompanies: ['Microsoft', 'Google', 'Amazon', 'Novartis', 'Dr. Reddy\'s', 'Deloitte'],
      content: `
        <div class="space-y-6">
          <p>Hyderabad is a premier global technology center with HITEC City, Gachibowli, and Genome Valley leading India's tech and life sciences innovation.</p>
        </div>
      `,
      faqs: [
        {
          question: "Which areas in Hyderabad host major tech companies?",
          answer: "HITEC City, Madhapur, Gachibowli, and Financial District host Google, Microsoft, Amazon, and major global capability centers."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Hyderabad",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Hyderabad",
          "addressRegion": "Telangana",
          "addressCountry": "IN"
        },
        "description": "Find tech and pharma jobs in Hyderabad."
      }
    },
    'chennai': {
      name: 'Chennai',
      title: 'Jobs in Chennai 2026 | IT, Automotive, SaaS & Engineering | TalentXcel',
      description: 'Find top career opportunities in Chennai. IT corridor, automotive giants, SaaS startups, and engineering roles. Apply now on TalentXcel.',
      h1: 'Jobs in Chennai - SaaS & Engineering Capital (2026)',
      keywords: ['jobs in chennai', 'it jobs chennai', 'omr chennai jobs', 'automotive jobs chennai'],
      stats: {
        avgSalary: '₹4.8-13L'
      },
      topCompanies: ['Zoho', 'Freshworks', 'Cognizant', 'Hyundai', 'Ford', 'TCS'],
      content: `
        <div class="space-y-6">
          <p>Chennai is India's SaaS and automotive capital, with Old Mahabalipuram Road (OMR) housing leading tech firms and automotive manufacturing corridors.</p>
        </div>
      `,
      faqs: [
        {
          question: "What makes Chennai unique for tech professionals?",
          answer: "Chennai is the birthplace of India's product SaaS revolution, spearheaded by Zoho and Freshworks, alongside major automotive tech hubs."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Chennai",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Chennai",
          "addressRegion": "Tamil Nadu",
          "addressCountry": "IN"
        },
        "description": "Find SaaS and automotive jobs in Chennai."
      }
    },
    'pune': {
      name: 'Pune',
      title: 'Jobs in Pune 2026 | IT, Automobile, Manufacturing & Startups | TalentXcel',
      description: 'Explore verified job vacancies in Pune. Top IT parks in Hinjewadi & Magarpatta, automotive manufacturing, and tech startups.',
      h1: 'Jobs in Pune - Tech & Engineering Hub (2026)',
      keywords: ['jobs in pune', 'hinjewadi it jobs', 'pune fresher jobs', 'automobile jobs pune'],
      stats: {
        avgSalary: '₹5-13.5L'
      },
      topCompanies: ['Infosys', 'Wipro', 'Tata Motors', 'Bajaj', 'Barclays', 'Tech Mahindra'],
      content: `
        <div class="space-y-6">
          <p>Pune combines world-class engineering institutes with massive IT corridors in Hinjewadi and Magarpatta, creating exceptional career opportunities.</p>
        </div>
      `,
      faqs: [
        {
          question: "How is the IT job market in Pune?",
          answer: "Pune offers extensive opportunities in software development, cloud infrastructure, automotive embedded software, and fintech."
        }
      ],
      structuredData: {
        "@context": "https://schema.org",
        "@type": "Place",
        "name": "Pune",
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Pune",
          "addressRegion": "Maharashtra",
          "addressCountry": "IN"
        },
        "description": "Explore tech and engineering jobs in Pune."
      }
    }
  };

  if (locations[norm]) {
    return locations[norm];
  }

  const tier2Data = getTier2LocationConfig(norm);
  if (tier2Data) {
    return tier2Data;
  }

  // Dynamic fallback for any unlisted city
  const formattedName = norm.charAt(0).toUpperCase() + norm.slice(1).replace(/-/g, ' ');
  return {
    name: formattedName,
    title: `Job Vacancies in ${formattedName} 2026 | Verified Opportunities | TalentXcel`,
    description: `Browse verified job openings in ${formattedName}. Apply directly to tech, finance, fresher, and experienced positions on TalentXcel.`,
    h1: `Job Vacancies in ${formattedName} (2026)`,
    keywords: [`jobs in ${norm}`, `${norm} job vacancy`, `fresher jobs ${norm}`, `careers in ${norm}`],
    stats: {
      avgSalary: '₹4-10L'
    },
    topCompanies: ['TCS', 'Infosys', 'HDFC Bank', 'Reliance', 'Wipro'],
    content: `
      <div class="space-y-6">
        <p>Explore high-growth career opportunities in ${formattedName}. TalentXcel connects job seekers with verified employers across IT, banking, education, and corporate sectors.</p>
      </div>
    `,
    faqs: [
      {
        question: `How can I find verified jobs in ${formattedName}?`,
        answer: `Use TalentXcel to search active, verified jobs in ${formattedName}. Filter by domain, salary, and experience to apply directly.`
      }
    ],
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Place",
      "name": formattedName,
      "description": `Find verified job openings in ${formattedName}.`
    }
  };
}

export default JobLocationPage;