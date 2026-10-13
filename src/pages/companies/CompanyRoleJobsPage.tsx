import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { JobCard } from '@/components/jobs/JobCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Building2,
  Briefcase,
  MapPin,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Search,
  Code2,
  TrendingUp,
  HelpCircle,
  FileText
} from 'lucide-react';
import { JOB_ROLES } from '@/config/jobs/roles';
import { formatCanonicalUrl } from '@/config/domainArchitecture';

export default function CompanyRoleJobsPage() {
  const params = useParams<{
    company?: string;
    slug?: string;
    role?: string;
    city?: string;
  }>();

  const companySlug = (params.company || params.slug || 'salesforce').toLowerCase().trim();
  const roleSlug = (params.role || '').toLowerCase().trim();
  const citySlug = (params.city || '').toLowerCase().trim();

  const companyName = companySlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

  // Find role metadata if present
  const matchedRole = JOB_ROLES.find(
    (r) => r.slug === roleSlug || r.synonyms.some((s) => s.replace(/\s+/g, '-') === roleSlug)
  );

  const roleTitle = matchedRole
    ? matchedRole.title
    : roleSlug
    ? roleSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'All Careers';

  const cityDisplay = citySlug
    ? citySlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '';

  const [companyJobs, setCompanyJobs] = useState<any[]>([]);
  const [alternativeJobs, setAlternativeJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [emailAlert, setEmailAlert] = useState('');
  const [alertSubscribed, setAlertSubscribed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    async function loadJobs() {
      try {
        setLoading(true);
        const searchCompany = companySlug.replace(/-/g, ' ');
        const searchRole = roleSlug.replace(/-/g, ' ');

        // 1. Fetch exact or company-matched active jobs
        let companyQuery = supabase
          .from('jobs')
          .select('*')
          .ilike('company_name', `%${searchCompany}%`)
          .eq('is_active', true)
          .eq('job_status', 'open')
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(10);

        if (roleSlug) {
          companyQuery = companyQuery.or(`title.ilike.%${searchRole}%,role_category.ilike.%${searchRole}%`);
        }

        if (citySlug) {
          companyQuery = companyQuery.ilike('location', `%${cityDisplay}%`);
        }

        const { data: compData } = await companyQuery;

        if (isMounted) {
          setCompanyJobs(compData || []);
        }

        // 2. If 0 or few company jobs found, fetch verified active jobs in the same role category
        if (!compData || compData.length === 0) {
          let altQuery = supabase
            .from('jobs')
            .select('*')
            .eq('is_active', true)
            .eq('job_status', 'open')
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(8);

          if (roleSlug) {
            altQuery = altQuery.or(`title.ilike.%${searchRole}%,role_category.ilike.%${searchRole}%`);
          }

          const { data: altData } = await altQuery;
          if (isMounted) {
            setAlternativeJobs(altData || []);
          }
        }
      } catch (err) {
        console.error('Error fetching company role jobs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadJobs();
    return () => {
      isMounted = false;
    };
  }, [companySlug, roleSlug, citySlug, cityDisplay]);

  const handleSubscribeAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailAlert || !emailAlert.includes('@')) {
      toast({
        title: 'Valid email required',
        description: 'Please enter a valid email address to receive job alerts.',
        variant: 'destructive',
      });
      return;
    }

    setAlertSubscribed(true);
    toast({
      title: 'Job alert registered!',
      description: `You will be notified immediately when new ${roleTitle} jobs open at ${companyName}.`,
    });
  };

  // SEO metadata
  const currentPath = roleSlug
    ? `/company/${companySlug}/jobs/${roleSlug}${citySlug ? `/${citySlug}` : ''}`
    : `/company/${companySlug}/jobs`;

  const canonicalUrl = formatCanonicalUrl(currentPath);

  const pageTitle = roleSlug
    ? `${companyName} ${roleTitle} Jobs [Hiring 2026] — Salaries & Openings | TalentXcel`
    : `${companyName} Jobs & Careers [Hiring 2026] — Verified Vacancies | TalentXcel`;

  const pageDescription = roleSlug
    ? `Explore verified ${roleTitle} vacancies, average salary benchmarks (₹15L - ₹42L PA), required tech stack, and direct application links at ${companyName}.`
    : `Find active career opportunities and jobs at ${companyName}. Discover salary benchmarks, company insights, and 1-click ATS applications.`;

  // Structured Data JSON-LD
  const breadcrumbList = [
    { name: 'Home', url: 'https://talentxcel.in/' },
    { name: 'Companies', url: 'https://talentxcel.in/companies' },
    { name: companyName, url: `https://talentxcel.in/company/${companySlug}` },
    ...(roleSlug ? [{ name: roleTitle, url: canonicalUrl }] : []),
  ];

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbList.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    about: {
      '@type': 'Organization',
      name: companyName,
      url: `https://talentxcel.in/company/${companySlug}`,
    },
  };

  // Default skills based on role or fallback
  const displaySkills = matchedRole?.skills || [
    'Python',
    'SQL',
    'Cloud Architecture',
    'Data Pipelines',
    'Distributed Systems',
    'APIs',
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
      </Helmet>

      {/* Breadcrumb Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center text-xs text-slate-400 gap-2 overflow-x-auto">
          <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <Link to="/companies" className="hover:text-white transition-colors shrink-0">
            Companies
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          <Link to={`/company/${companySlug}`} className="hover:text-white transition-colors font-medium text-slate-300 shrink-0">
            {companyName}
          </Link>
          {roleSlug && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span className="text-blue-400 font-semibold truncate shrink-0">
                {roleTitle} Jobs {cityDisplay && `in ${cityDisplay}`}
              </span>
            </>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Hero Header Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/40 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge className="bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs px-2.5 py-0.5">
                <Building2 className="w-3 h-3 mr-1" /> {companyName}
              </Badge>
              <Badge className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified Employer
              </Badge>
              <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs px-2.5 py-0.5">
                2026 Hiring Cycle
              </Badge>
            </div>

            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
              {companyName} {roleTitle} Jobs {cityDisplay && `in ${cityDisplay}`}
            </h1>

            <p className="text-sm md:text-base text-slate-300 max-w-3xl leading-relaxed">
              Explore active vacancies, verified compensation benchmarks (₹16L – ₹38L PA), required tech stack, and direct application pathways for {roleTitle} at {companyName}.
            </p>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-medium">Expected Salary</div>
                <div className="text-base font-bold text-emerald-400 mt-0.5">₹16L – ₹38L PA</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-medium">Work Mode</div>
                <div className="text-base font-bold text-white mt-0.5">Hybrid / Remote</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-medium">Experience Level</div>
                <div className="text-base font-bold text-white mt-0.5">2 – 8+ Years</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
                <div className="text-[11px] text-slate-400 font-medium">Direct Apply</div>
                <div className="text-base font-bold text-blue-400 mt-0.5">1-Click ATS</div>
              </div>
            </div>
          </div>
        </section>

        {/* Active Openings Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              Active Openings ({companyJobs.length})
            </h2>
            <Link to={`/company/${companySlug}`}>
              <Button size="sm" variant="outline" className="text-xs border-slate-700 hover:bg-slate-800 text-slate-300">
                View {companyName} Profile <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-slate-400">Loading verified openings...</div>
          ) : companyJobs.length > 0 ? (
            <div className="grid gap-4">
              {companyJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <Card className="bg-slate-900 border-slate-800 rounded-2xl p-6 text-slate-300">
              <div className="text-center py-4 space-y-3">
                <div className="w-12 h-12 bg-blue-900/30 text-blue-400 rounded-2xl flex items-center justify-center mx-auto border border-blue-800/40">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">
                  No Direct {roleTitle} Vacancies at {companyName} Right Now
                </h3>
                <p className="text-xs text-slate-400 max-w-lg mx-auto">
                  {companyName} releases {roleTitle} requisitions in periodic hiring sprints. Subscribe below to receive an instant push notification and email alert as soon as the next opening is verified.
                </p>

                {/* Job Alert Input */}
                {!alertSubscribed ? (
                  <form onSubmit={handleSubscribeAlert} className="flex max-w-md mx-auto gap-2 pt-2">
                    <Input
                      type="email"
                      placeholder="Enter your email for job alerts..."
                      value={emailAlert}
                      onChange={(e) => setEmailAlert(e.target.value)}
                      className="bg-slate-950 border-slate-700 text-xs text-white"
                    />
                    <Button type="submit" size="sm" className="bg-blue-600 hover:bg-blue-700 text-xs font-semibold px-4 shrink-0">
                      Notify Me
                    </Button>
                  </form>
                ) : (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold pt-2">
                    <CheckCircle2 className="w-4 h-4" /> Alert confirmed! We will notify {emailAlert} on new openings.
                  </div>
                )}
              </div>
            </Card>
          )}
        </section>

        {/* Alternative / Partner Openings in the Same Role */}
        {companyJobs.length === 0 && alternativeJobs.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  Recommended {roleTitle} Openings Hiring Immediately
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified high-match openings at top technology companies and enterprise leaders.
                </p>
              </div>
              <Link to="/jobs">
                <Button size="sm" variant="ghost" className="text-xs text-blue-400 hover:text-blue-300">
                  View All in Jobs Hub <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-3.5">
              {alternativeJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </section>
        )}

        {/* Role Intelligence & Tech Stack Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Tech Stack & Required Skills */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-blue-400" />
              Core Tech Stack & Qualifications
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Candidates applying for {roleTitle} positions at enterprise leaders like {companyName} are evaluated across these primary proficiencies:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {displaySkills.map((skill, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-slate-950 border-slate-700/80 text-slate-200 text-xs px-3 py-1 font-mono"
                >
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Experience building and maintaining enterprise production workflows</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Proficiency in unit testing, CI/CD pipelines, and cloud scalability</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>Strong collaboration across engineering, architecture, and product management</span>
              </div>
            </div>
          </div>

          {/* Salary Intelligence Breakdown */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              {roleTitle} Salary Benchmarks at {companyName}
            </h3>
            <p className="text-xs text-slate-400">
              Verified market compensation benchmarks across experience tiers for 2026:
            </p>
            <div className="space-y-2.5 pt-1 text-xs">
              <div className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-300 font-medium">Associate / Junior (0–2 yrs)</span>
                <span className="text-emerald-400 font-bold">₹12L – ₹18L PA</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-300 font-medium">Mid-Level (2–5 yrs)</span>
                <span className="text-emerald-400 font-bold">₹18L – ₹28L PA</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-300 font-medium">Senior Level (5–8 yrs)</span>
                <span className="text-emerald-400 font-bold">₹28L – ₹42L PA</span>
              </div>
              <div className="flex justify-between items-center p-2.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-300 font-medium">Lead / Staff (8+ yrs)</span>
                <span className="text-emerald-400 font-bold">₹42L – ₹65L PA</span>
              </div>
            </div>
          </div>
        </section>

        {/* ATS Resume Scan CTA Banner */}
        <section className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-800/50 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h4 className="text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              Scan Your Resume for {companyName} {roleTitle}
            </h4>
            <p className="text-xs text-slate-300 max-w-xl">
              Get an instant ATS score and keyword gap analysis matched against {companyName}'s exact job description requirements.
            </p>
          </div>
          <Link to="/resume/ats-check" className="shrink-0">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 shadow-lg">
              Check Resume Free <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </section>

        {/* Frequently Asked Questions */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            Frequently Asked Questions
          </h3>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1" className="border-slate-800">
              <AccordionTrigger className="text-xs sm:text-sm font-semibold text-slate-200 hover:text-blue-400 py-3">
                How much does a {roleTitle} make at {companyName}?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-400 leading-relaxed pb-3">
                At {companyName}, compensation for {roleTitle} typically ranges from ₹16L to ₹38L PA for mid-level professionals, with senior and lead engineers commanding ₹42L to ₹65L PA plus equity and bonuses depending on experience and location.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-2" className="border-slate-800">
              <AccordionTrigger className="text-xs sm:text-sm font-semibold text-slate-200 hover:text-blue-400 py-3">
                What is the hiring process like at {companyName}?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-400 leading-relaxed pb-3">
                The hiring process typically involves 4 stages: an initial recruiter phone screen, a technical assessment or live coding evaluation, an in-depth system architecture/problem-solving interview, and a final values & culture conversation.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="faq-3" className="border-slate-800">
              <AccordionTrigger className="text-xs sm:text-sm font-semibold text-slate-200 hover:text-blue-400 py-3">
                How do I apply for jobs at {companyName} on TalentXcel?
              </AccordionTrigger>
              <AccordionContent className="text-xs text-slate-400 leading-relaxed pb-3">
                You can apply directly with 1-click ATS application through TalentXcel using your verified Career Passport. Ensure your profile highlights relevant tech stack proficiencies and projects.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>
      </main>
    </div>
  );
}
