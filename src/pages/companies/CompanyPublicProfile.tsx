import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Building2,
  Globe,
  MapPin,
  Users,
  ShieldCheck,
  Briefcase,
  Sparkles,
  ArrowRight,
  Trophy,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  FileText,
  Layers,
  GraduationCap,
  HelpCircle,
  Mail,
  Award,
  Cpu,
  TrendingUp,
  Target,
  Compass,
  Network,
  BookOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEntity, useEntityListings } from '@/hooks/useClaim1';
import { getPublicCompanyUrl, getPublicJobUrl, getPublicPostUrl } from '@/lib/seo/canonicalUrls';
import {
  buildTalentXcelOrganizationSchema,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildFAQSchema,
} from '@/lib/seo/structuredDataSchemas';

export default function CompanyPublicProfile() {
  const { slug = 'talentxcel' } = useParams<{ slug: string }>();
  const normalizedSlug = slug.toLowerCase().trim();

  // 1. Fetch Claim #1 Leaderboard Entity (if claimed/listed)
  const { data: entity } = useEntity(normalizedSlug);
  const { data: listings = [] } = useEntityListings(entity?.id);

  // 2. Fetch Public Jobs for this Company
  const { data: publicJobs = [] } = useQuery({
    queryKey: ['company-public-jobs', normalizedSlug],
    queryFn: async () => {
      const isTalentXcel = normalizedSlug.includes('talentxcel');
      let query = supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .eq('job_status', 'open');

      if (isTalentXcel) {
        query = query.ilike('company_name', '%TalentXcel%');
      } else {
        query = query.ilike('company_name', `%${normalizedSlug}%`);
      }

      const { data, error } = await query.limit(10);
      if (error) return [];
      return data || [];
    },
  });

  // 3. Fetch Public Posts from the Company / Team
  const { data: companyPosts = [] } = useQuery({
    queryKey: ['company-public-posts', normalizedSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select('*, author:profiles(id, full_name, username, title, profile_picture_url)')
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) return [];
      return data || [];
    },
  });

  const isTalentXcel = normalizedSlug.includes('talentxcel');
  const companyName = isTalentXcel
    ? 'TalentXcel Services'
    : (entity?.name || normalizedSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
  const canonicalUrl = getPublicCompanyUrl(normalizedSlug);

  const pageTitle = `${companyName} | Career Profile, Culture & Jobs | TalentXcel`;
  const pageDescription = `Explore ${companyName} career opportunities, company culture, verified employee benchmarks, and active job openings on TalentXcel.`;

  const faqs = [
    {
      question: 'What is TalentXcel?',
      answer:
        'TalentXcel is an AI-powered career operating system and recruitment platform that integrates intelligent job matching, ATS resume optimization, verified credentials, and corporate staffing solutions.',
    },
    {
      question: 'How does TalentXcel help job seekers?',
      answer:
        'Job seekers can build recruiter-ready ATS resumes, benchmark their skills with Career Passports, explore higher education degree pathways across 10,250 Indian institutions, and apply directly to verified employer jobs.',
    },
    {
      question: 'What corporate recruitment services does TalentXcel provide?',
      answer:
        'TalentXcel provides end-to-end talent acquisition, contract-to-hire staffing, Recruitment Process Outsourcing (RPO), executive search, and pre-screened technical candidate pipelines.',
    },
    {
      question: 'Where is TalentXcel located?',
      answer:
        'TalentXcel Services Pvt Ltd is headquartered in Noida, Uttar Pradesh, India, serving clients and job seekers globally.',
    },
    {
      question: 'How can employers post jobs on TalentXcel?',
      answer:
        'Employers can visit the Employer Recruitment Portal at /employer to post openings, access pre-screened candidate pools, and leverage AI skill matching.',
    },
  ];

  const organizationSchema = buildTalentXcelOrganizationSchema(canonicalUrl);
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://talentxcel.in' },
    { name: 'Companies', url: 'https://talentxcel.in/companies' },
    { name: companyName, url: canonicalUrl },
  ]);
  const webPageSchema = buildWebPageSchema({
    name: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    aboutOrgId: `${canonicalUrl}#organization`,
  });
  const faqSchema = buildFAQSchema(faqs);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://talentxcel.in/talentxcel-official-logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />

        <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
        {faqSchema && <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>}
      </Helmet>

      <div className="min-h-screen bg-slate-950 text-slate-100 pb-20">
        {/* Breadcrumbs */}
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-1.5">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/companies" className="hover:text-white transition-colors">Companies</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-400 font-medium">{companyName}</span>
          </nav>
        </div>

        {/* Hero Header */}
        <header className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 md:p-10 backdrop-blur-sm shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/20 border border-blue-400/30 shrink-0">
                  T
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                      TalentXcel Services
                    </h1>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 gap-1 text-xs py-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Platform Entity
                    </Badge>
                  </div>
                  <p className="text-blue-400 mt-1.5 text-base font-semibold">
                    AI-Powered Career & Recruitment Ecosystem
                  </p>
                  <p className="text-slate-300 mt-2 text-sm leading-relaxed max-w-3xl">
                    TalentXcel is an AI-powered career, recruitment and professional growth platform connecting job seekers, employers, educators and professionals.
                  </p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> Noida, Uttar Pradesh, India
                    </span>
                    <a
                      href="https://talentxcel.in"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" /> talentxcel.in
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> HR Tech & AI Engineering
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap w-full md:w-auto shrink-0">
                <Link to="/jobs" className="flex-1 md:flex-initial">
                  <Button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-2 shadow-md shadow-blue-600/20">
                    <Briefcase className="w-4 h-4" /> View Open Jobs
                  </Button>
                </Link>
                <Link to="/employer" className="flex-1 md:flex-initial">
                  <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-200">
                    Hire Talent
                  </Button>
                </Link>
              </div>
            </div>

            {/* Claim #1 Board Rank (if present) */}
            {listings.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-between gap-4 flex-wrap bg-blue-950/20 p-4 rounded-xl border border-blue-900/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                    <Trophy className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Global AI Products Leaderboard</div>
                    <div className="text-sm font-semibold text-white">
                      Rank #{listings[0].current_rank} • {listings[0].scope?.name || 'Global Board'}
                    </div>
                  </div>
                </div>
                <Link to="/rankings/ai-products">
                  <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300 gap-1 text-xs">
                    View Live Board <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* 18 Substantive Factual Sections */}
        <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Columns */}
          <div className="lg:col-span-2 space-y-8">
            {/* 1. About TalentXcel */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" /> 1. About TalentXcel
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                TalentXcel Services Pvt Ltd is a modern technology and human capital organization headquartered in Noida, Uttar Pradesh, India. The company builds software architectures that unify talent acquisition, verified candidate credentials, higher education intelligence, and automated resume parsing to solve hiring fragmentation.
              </p>
            </section>

            {/* 2. What TalentXcel Does */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> 2. What TalentXcel Does
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                TalentXcel operates at the intersection of AI recruitment, career operating systems, and higher education intelligence. The platform automates skill verification, structures career progression milestones, matches job seekers with employers based on demonstrated capability, and assists enterprises with strategic talent acquisition.
              </p>
            </section>

            {/* 3. AI-Powered Career Platform */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" /> 3. AI-Powered Career Platform
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                The Career Platform leverages algorithmic matching to connect individual skill profiles with live market job requirements. Professionals can track career milestones, analyze salary benchmarks, and follow structured roadmaps designed for long-term capability building.
              </p>
            </section>

            {/* 4. Jobs & Hiring */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-400" /> 4. Jobs & Hiring
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                TalentXcel publishes verified job openings across technical, commercial, marketing, and operations disciplines. Every job posting includes transparent role descriptions, location details, employment types, and verified salary ranges without hidden filters.
              </p>
              <Link to="/jobs">
                <Button size="sm" variant="outline" className="border-slate-700 text-xs text-slate-200 mt-2">
                  Browse Active Jobs &rarr;
                </Button>
              </Link>
            </section>

            {/* 5. Recruitment & Staffing */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" /> 5. Recruitment & Staffing
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                TalentXcel provides comprehensive enterprise staffing, Recruitment Process Outsourcing (RPO), and contract-to-hire solutions. Dedicated recruitment teams handle candidate sourcing, skill vetting, reference checks, and onboarding support.
              </p>
              <Link to="/services/staffing-recruitment">
                <Button size="sm" variant="outline" className="border-slate-700 text-xs text-slate-200 mt-2">
                  Explore Staffing Solutions &rarr;
                </Button>
              </Link>
            </section>

            {/* 6. Resume Builder */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" /> 6. Resume Builder & ATS Intelligence
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                The integrated ATS Resume Builder allows candidates to format, audit, and optimize their resumes against real recruiter parsing algorithms. Features include instant keyword match analysis, formatting validation, and export to ATS-compliant formats.
              </p>
              <Link to="/resume">
                <Button size="sm" variant="outline" className="border-slate-700 text-xs text-slate-200 mt-2">
                  Open Resume Studio &rarr;
                </Button>
              </Link>
            </section>

            {/* 7. Career Services */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-400" /> 7. Career Services & Coaching
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Personalized professional guidance, executive bio refinement, interview simulation, and compensation negotiation strategies tailored for mid-career and senior transitions.
              </p>
              <Link to="/services/career-services">
                <Button size="sm" variant="outline" className="border-slate-700 text-xs text-slate-200 mt-2">
                  View Career Services &rarr;
                </Button>
              </Link>
            </section>

            {/* 8. Professional Networking */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Network className="w-5 h-5 text-teal-400" /> 8. Professional Networking & Feed
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                The TalentXcel network feed enables professionals to publish insights, discuss career strategies, celebrate milestones, and connect with peers and verified industry leaders.
              </p>
              <Link to="/network">
                <Button size="sm" variant="outline" className="border-slate-700 text-xs text-slate-200 mt-2">
                  Explore Network Feed &rarr;
                </Button>
              </Link>
            </section>

            {/* 9. Learning & Skill Development */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" /> 9. Learning & Higher Education Intelligence
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Comprehensive data across 10,250 accredited Indian universities and colleges, tuition-free global master’s programs, verified scholarships, and 6-step AI educational pathway builders.
              </p>
              <Link to="/colleges">
                <Button size="sm" variant="outline" className="border-slate-700 text-xs text-slate-200 mt-2">
                  Access College Directory &rarr;
                </Button>
              </Link>
            </section>

            {/* 10. Employer Solutions */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> 10. Employer Solutions
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Employers access intelligent candidate matching, candidate pipeline dashboards, automated skill assessment tools, and corporate branding hubs to attract top talent.
              </p>
              <Link to="/employer">
                <Button size="sm" variant="outline" className="border-slate-700 text-xs text-slate-200 mt-2">
                  Employer Recruitment Portal &rarr;
                </Button>
              </Link>
            </section>

            {/* 11. Technology & AI */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" /> 11. Technology & AI Architecture
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Built on high-performance web architecture, Postgres vector embeddings, cryptographic credential verification, and real-time schema validation to deliver low-latency discovery and search crawlability.
              </p>
            </section>

            {/* 12. Industries Served */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-400" /> 12. Industries Served
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-200">Information Technology</div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-200">Artificial Intelligence</div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-200">Financial Services & Fintech</div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-200">Healthcare & Life Sciences</div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-200">E-commerce & Retail</div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-slate-200">Higher Education</div>
              </div>
            </section>

            {/* 13. Careers at TalentXcel */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-400" /> 13. Careers at TalentXcel
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                TalentXcel is expanding its core engineering, product, recruitment, marketing, and operations teams in Noida and across India. Explore current internal openings below.
              </p>
            </section>

            {/* 14. Latest Updates from TalentXcel Team */}
            {companyPosts.length > 0 && (
              <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-400" /> 14. Latest TalentXcel Updates
                  </h2>
                  <Link to="/network" className="text-xs text-blue-400 hover:underline">
                    Feed &rarr;
                  </Link>
                </div>
                <div className="space-y-3">
                  {companyPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/post/${post.id}`}
                      className="p-4 bg-slate-950/70 border border-slate-800 hover:border-purple-500/50 rounded-xl transition-all block group"
                    >
                      <div className="text-xs font-semibold text-white group-hover:text-purple-300">
                        {post.author?.full_name || 'TalentXcel Team'}
                      </div>
                      <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                        {post.content}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* 15. Public Jobs */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-400" /> 15. Public Jobs ({publicJobs.length})
                </h2>
                <Link to="/jobs" className="text-xs text-blue-400 hover:underline">
                  All Jobs &rarr;
                </Link>
              </div>
              {publicJobs.length === 0 ? (
                <p className="text-slate-400 text-sm">No active listings at this time.</p>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {publicJobs.map((job) => (
                    <Link
                      key={job.id}
                      to={getPublicJobUrl(job.seo_slug || job.id).replace('https://talentxcel.in', '')}
                      className="p-4 bg-slate-950/70 border border-slate-800 hover:border-blue-500/50 rounded-xl transition-all block group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-white group-hover:text-blue-400 transition-colors">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 flex-wrap">
                            <span>{job.location || 'Noida, India'}</span>
                            <span>•</span>
                            <span>{job.employment_type || 'Full-time'}</span>
                            {job.salary_min && (
                              <span className="text-emerald-400 font-medium">
                                ₹{(job.salary_min / 100000).toFixed(1)}L - ₹{((job.salary_max || job.salary_min) / 100000).toFixed(1)}L PA
                              </span>
                            )}
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="border-slate-700 text-xs shrink-0">
                          View Role
                        </Button>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* 16. Related Career Resources */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> 16. Related Career Resources
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <Link to="/resources/how-to-write-an-ats-friendly-resume-in-2026-complete-step-by-step-guide" className="p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-blue-500 text-slate-200 block">
                  Complete ATS Resume Guide &rarr;
                </Link>
                <Link to="/colleges/pathway" className="p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-blue-500 text-slate-200 block">
                  6-Step AI Career Pathway Tool &rarr;
                </Link>
                <Link to="/services/ai-recruitment" className="p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-blue-500 text-slate-200 block">
                  AI Recruitment Solutions Guide &rarr;
                </Link>
                <Link to="/topics/artificial-intelligence" className="p-3 bg-slate-950 rounded-lg border border-slate-800 hover:border-blue-500 text-slate-200 block">
                  Artificial Intelligence Topic Hub &rarr;
                </Link>
              </div>
            </section>

            {/* 17. Frequently Asked Questions */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-amber-400" /> 17. Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-slate-800">
                    <AccordionTrigger className="text-sm font-semibold text-slate-200 hover:text-white">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-slate-400 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            {/* 18. Contact / Get Started */}
            <section className="bg-gradient-to-br from-blue-950/60 to-indigo-950/60 border border-blue-900/60 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-400" /> 18. Contact & Get Started
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Connect with the TalentXcel team to accelerate your organization’s hiring or unlock career pathways.
              </p>
              <div className="flex items-center gap-3 flex-wrap pt-2">
                <Link to="/contact">
                  <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold">
                    Contact TalentXcel Team
                  </Button>
                </Link>
                <Link to="/employer">
                  <Button variant="outline" className="border-slate-700 text-xs text-slate-200">
                    Employer Portal
                  </Button>
                </Link>
              </div>
            </section>
          </div>

          {/* Right Column: Organization Facts */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Entity Overview</h3>
              <div className="space-y-3.5 text-sm">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <span className="text-slate-400">Legal Entity</span>
                  <span className="font-medium text-white">TalentXcel Services Pvt Ltd</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <span className="text-slate-400">Headquarters</span>
                  <span className="font-medium text-white">Noida, UP, India</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <span className="text-slate-400">Primary Domain</span>
                  <span className="font-medium text-white">https://talentxcel.in</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <span className="text-slate-400">Industry</span>
                  <span className="font-medium text-white">HR Tech & AI</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Status</span>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-xs">
                    Verified Operating Entity
                  </Badge>
                </div>
              </div>
            </div>

            {/* Quick Links Card */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-3">
              <h3 className="text-base font-bold text-white mb-2">Core Services</h3>
              <div className="space-y-2 text-xs">
                <Link to="/services/ai-recruitment" className="block text-slate-300 hover:text-blue-400">
                  &bull; AI Recruitment Platform
                </Link>
                <Link to="/services/staffing-recruitment" className="block text-slate-300 hover:text-blue-400">
                  &bull; Corporate Staffing & RPO
                </Link>
                <Link to="/services/it-services" className="block text-slate-300 hover:text-blue-400">
                  &bull; IT & Systems Consulting
                </Link>
                <Link to="/services/career-services" className="block text-slate-300 hover:text-blue-400">
                  &bull; Career Coaching & Services
                </Link>
                <Link to="/services/resume-building" className="block text-slate-300 hover:text-blue-400">
                  &bull; ATS Resume Builder
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
