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
import { getPublicCompanyUrl, getPublicJobUrl } from '@/lib/seo/canonicalUrls';
import { getGoogleCompanyLogo } from '@/services/companyLogoService';
import {
  buildTalentXcelOrganizationSchema,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildFAQSchema,
} from '@/lib/seo/structuredDataSchemas';

interface CompanyProfileData {
  name: string;
  tagline: string;
  description: string;
  whatItDoes: string;
  industry: string;
  location: string;
  website: string;
  legalEntity: string;
  foundedYear: number;
  sizeRange: string;
  coreServices: string[];
  techStack: string[];
  searchKeyword: string;
}

const KNOWN_COMPANY_PROFILES: Record<string, CompanyProfileData> = {
  'savantis-solutions': {
    name: 'Savantis Solutions',
    tagline: 'Enterprise Digital Transformation, SAP Solutions & Cloud Engineering',
    description: 'Savantis Solutions is a global IT consulting and digital transformation firm specializing in enterprise SAP implementations, cloud infrastructure, full-stack software development, and technical staffing.',
    whatItDoes: 'Savantis empowers mid-market and enterprise organizations to modernize legacy systems, migrate to the cloud, optimize enterprise workflows with SAP S/4HANA, and scale engineering bandwidth with pre-screened technical talent.',
    industry: 'IT Services & Cloud Consulting',
    location: 'Noida, Uttar Pradesh, India',
    website: 'https://savantis.com',
    legalEntity: 'Savantis Solutions LLC',
    foundedYear: 2012,
    sizeRange: '500-1000 employees',
    coreServices: [
      'Enterprise SAP S/4HANA Implementations & Support',
      'Cloud Architecture & DevOps Migration (AWS/Azure)',
      'Custom Full-Stack Web & Mobile App Development',
      'Specialized IT Staffing & Dedicated Developer Teams'
    ],
    techStack: ['SAP S/4HANA', 'AWS Cloud', 'Microsoft Azure', 'Java', 'Python', 'React', 'Node.js', 'PostgreSQL'],
    searchKeyword: 'Savantis'
  },
  'chatr-chat': {
    name: 'chatr Chat',
    tagline: 'Next-Generation AI Communications & Agentic Messaging Ecosystem',
    description: 'chatr Chat is an AI-native messaging and workflow intelligence platform connecting individuals and enterprises worldwide with high-speed, secure agentic communication networks.',
    whatItDoes: 'chatr Chat combines encrypted real-time communication with autonomous AI agent assistants, omnichannel customer support automation, and seamless collaboration tools for modern high-velocity teams.',
    industry: 'Artificial Intelligence & Telecom',
    location: 'New Delhi, Delhi NCR, India',
    website: 'https://chatr.chat',
    legalEntity: 'Chatr Technologies Pvt Ltd',
    foundedYear: 2024,
    sizeRange: '50-200 employees',
    coreServices: [
      'Autonomous AI Agent Messaging & Workflows',
      'Encrypted Real-Time Chat Infrastructure',
      'Omnichannel Customer Support Intelligence',
      'Enterprise Team Collaboration Platform'
    ],
    techStack: ['Python', 'FastAPI', 'WebSockets', 'React', 'TypeScript', 'PostgreSQL', 'LangChain', 'Docker'],
    searchKeyword: 'Chatr'
  },
  'talentxcel-services': {
    name: 'TalentXcel Services',
    tagline: 'AI-Powered Career Architecture & Strategic Talent Acquisition',
    description: 'TalentXcel Services Pvt Ltd is a modern human capital and AI career technology organization providing high-velocity recruitment, executive search, and verified career credentials.',
    whatItDoes: 'TalentXcel operates at the intersection of AI recruitment, career operating systems, and higher education intelligence to match candidates based on verified skills and help employers scale rapidly.',
    industry: 'AI Recruitment & Staffing',
    location: 'Noida, Uttar Pradesh, India',
    website: 'https://talentxcel.in/services',
    legalEntity: 'TalentXcel Services Pvt Ltd',
    foundedYear: 2023,
    sizeRange: '50-200 employees',
    coreServices: [
      'AI-Driven Technical Candidate Screening & Sourcing',
      'Executive Search & Recruitment Process Outsourcing (RPO)',
      'Verified Career Passport Credentialing',
      'Corporate Training & Workforce Skill Gap Benchmarking'
    ],
    techStack: ['React', 'TypeScript', 'Node.js', 'Supabase', 'PostgreSQL', 'Python', 'Tailwind CSS'],
    searchKeyword: 'TalentXcel'
  },
  'talentxcel': {
    name: 'TalentXcel Enterprise',
    tagline: 'AI Career Operating System & Intelligent Hiring Infrastructure',
    description: 'TalentXcel Enterprise provides the comprehensive platform uniting job discovery, ATS resume diagnostics, career pathways across 10,250 higher ed institutions, and verified employer pipelines.',
    whatItDoes: 'TalentXcel provides candidates with deterministic career progression tools and gives enterprises access to pre-screened talent pools matched by capability rather than keyword density.',
    industry: 'HR Tech & Career AI',
    location: 'Gurgaon, Delhi NCR, India',
    website: 'https://talentxcel.in',
    legalEntity: 'TalentXcel Enterprise',
    foundedYear: 2023,
    sizeRange: '100-500 employees',
    coreServices: [
      'Intelligent Candidate-Job Match Algorithm',
      'Real-Time ATS Resume Scanner & Diagnostic Studio',
      '10,250 Indian Higher Education Institution Intelligence',
      'Claim #1 Global AI Product Rankings & Bidding Marketplace'
    ],
    techStack: ['React', 'TypeScript', 'Vite', 'PostgreSQL', 'Tailwind CSS'],
    searchKeyword: 'TalentXcel'
  }
};

export default function CompanyPublicProfile() {
  const { slug = 'talentxcel' } = useParams<{ slug: string }>();
  const normalizedSlug = slug.toLowerCase().trim();

  // 1. Fetch Claim #1 Leaderboard Entity (if claimed/listed)
  const { data: entity } = useEntity(normalizedSlug);
  const { data: listings = [] } = useEntityListings(entity?.id);

  // 2. Resolve known company profile or fallback dynamically
  const knownProfile = KNOWN_COMPANY_PROFILES[normalizedSlug];
  const companyName = knownProfile?.name || entity?.name || normalizedSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const companyTagline = knownProfile?.tagline || `${companyName} • Verified Platform Employer`;
  const companyDescription = knownProfile?.description || entity?.description || `${companyName} is a verified organization committed to excellence, innovation, and career development.`;
  const whatItDoes = knownProfile?.whatItDoes || `${companyName} operates in the ${knownProfile?.industry || 'technology and services'} sector, providing top-tier solutions and career opportunities.`;
  const companyIndustry = knownProfile?.industry || 'Technology & Professional Services';
  const companyLocation = knownProfile?.location || 'India';
  const companyWebsite = knownProfile?.website || 'https://talentxcel.in';
  const legalEntity = knownProfile?.legalEntity || `${companyName} Pvt Ltd`;
  const foundedYear = knownProfile?.foundedYear || 2023;
  const sizeRange = knownProfile?.sizeRange || '50-500 employees';
  const coreServices = knownProfile?.coreServices || [
    'Enterprise Technology Solutions',
    'Specialized Professional Services',
    'Talent Development & Career Growth',
    'Strategic Business Operations'
  ];
  const techStack = knownProfile?.techStack || ['Cloud Platforms', 'Modern Web Tech', 'Data Systems', 'Enterprise Security'];
  const searchKeyword = knownProfile?.searchKeyword || companyName;

  // 3. Fetch Real Public Jobs for this Company from Supabase
  const { data: publicJobs = [] } = useQuery({
    queryKey: ['company-public-jobs', normalizedSlug, searchKeyword],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .eq('job_status', 'open');

      if (error || !data) return [];

      const kw = searchKeyword.toLowerCase();
      const nSlug = normalizedSlug.replace(/-/g, ' ');
      return data.filter((j: any) => {
        const cName = (j.company_name || '').toLowerCase();
        const jTitle = (j.title || '').toLowerCase();
        return cName.includes(kw) || cName.includes(nSlug) || jTitle.includes(kw);
      });
    },
  });

  const canonicalUrl = getPublicCompanyUrl(normalizedSlug);
  const logoUrl = getGoogleCompanyLogo(companyName, companyWebsite);

  const pageTitle = `${companyName} | Career Profile, Culture & Jobs | TalentXcel`;
  const pageDescription = `Explore ${companyName} career opportunities, company culture, verified employee benchmarks, and active job openings on TalentXcel.`;

  const faqs = [
    {
      question: `What is ${companyName}?`,
      answer: companyDescription,
    },
    {
      question: `Where is ${companyName} headquartered?`,
      answer: `${companyName} is located in ${companyLocation}. Visit official website at ${companyWebsite}.`,
    },
    {
      question: `How can I apply for jobs at ${companyName}?`,
      answer: `You can view all active job openings for ${companyName} directly on TalentXcel and submit your application with a verified ATS-ready resume.`,
    },
    {
      question: `What are the core capabilities of ${companyName}?`,
      answer: `${companyName} focuses on ${coreServices.join(', ')}.`,
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
        <meta property="og:image" content={logoUrl} />
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
                <div className="w-20 h-20 rounded-2xl bg-white p-2 flex items-center justify-center shadow-lg border border-slate-700 shrink-0">
                  <img 
                    src={logoUrl} 
                    alt={companyName} 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      {companyName}
                    </h1>
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 gap-1 text-xs py-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Platform Entity
                    </Badge>
                  </div>
                  <p className="text-blue-400 mt-1 text-sm font-semibold">
                    {companyTagline}
                  </p>
                  <p className="text-slate-300 mt-2 text-xs md:text-sm leading-relaxed max-w-3xl">
                    {companyDescription}
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-slate-400 flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" /> {companyLocation}
                    </span>
                    <a
                      href={companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" /> {companyWebsite.replace(/^https?:\/\//, '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> {companyIndustry}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 flex-wrap w-full md:w-auto shrink-0">
                <Link to={`/jobs?search=${encodeURIComponent(searchKeyword)}`} className="flex-1 md:flex-initial">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold gap-2 shadow-md">
                    <Briefcase className="w-4 h-4" /> View Open Jobs ({publicJobs.length})
                  </Button>
                </Link>
                <Link to="/employer" className="flex-1 md:flex-initial">
                  <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 text-slate-200 text-xs">
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

        {/* Dynamic Factual Sections */}
        <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main 2 Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* 1. About Company */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-400" /> 1. About {companyName}
              </h2>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                {companyDescription} Headquartered in {companyLocation}, {companyName} delivers reliable, scalable capabilities to its clients and partners across the industry.
              </p>
            </section>

            {/* 2. What Company Does */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" /> 2. What {companyName} Does
              </h2>
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                {whatItDoes}
              </p>
            </section>

            {/* 3. Core Capabilities & Offerings */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" /> 3. Core Offerings & Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {coreServices.map((service, idx) => (
                  <div key={idx} className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-200 font-medium">{service}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Technology Stack & Frameworks */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" /> 4. Technology & Tooling Stack
              </h2>
              <div className="flex flex-wrap gap-2 pt-1">
                {techStack.map((tech, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-purple-950/40 text-purple-300 border border-purple-800/40 text-xs px-3 py-1">
                    {tech}
                  </Badge>
                ))}
              </div>
            </section>

            {/* 5. Active Job Openings from Database */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-400" /> 5. Active Job Openings ({publicJobs.length})
                </h2>
                <Link to={`/jobs?search=${encodeURIComponent(searchKeyword)}`}>
                  <Button size="sm" variant="ghost" className="text-xs text-emerald-400 hover:text-emerald-300 gap-1">
                    View All in Jobs Hub <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              {publicJobs.length > 0 ? (
                <div className="space-y-3">
                  {publicJobs.slice(0, 5).map((job: any) => (
                    <div key={job.id} className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white hover:text-blue-400 transition-colors">
                          {job.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <span>{job.location || companyLocation}</span>
                          <span>•</span>
                          <span>{job.employment_type || 'Full-time'}</span>
                          {job.salary_min && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-400">₹{(job.salary_min / 100000).toFixed(1)} - {(job.salary_max / 100000).toFixed(1)} LPA</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Link to={`/jobs/${job.seo_slug || job.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-7 px-3">
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-400">
                  <p>No active openings currently published for {companyName}.</p>
                  <p className="mt-1">Check back soon or follow to receive new job alerts.</p>
                </div>
              )}
            </section>

            {/* 6. Frequently Asked Questions */}
            <section className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" /> 6. Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-slate-800">
                    <AccordionTrigger className="text-xs md:text-sm font-semibold text-slate-200 hover:text-blue-400">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-slate-400 leading-relaxed">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>

          {/* Right Sidebar: Entity Overview */}
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2">
                Entity Overview
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400">Legal Entity</span>
                  <div className="text-white font-medium mt-0.5">{legalEntity}</div>
                </div>

                <div>
                  <span className="text-slate-400">Headquarters</span>
                  <div className="text-white font-medium mt-0.5">{companyLocation}</div>
                </div>

                <div>
                  <span className="text-slate-400">Primary Domain</span>
                  <div className="text-blue-400 font-medium mt-0.5 truncate">
                    <a href={companyWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      {companyWebsite} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-slate-400">Industry</span>
                  <div className="text-white font-medium mt-0.5">{companyIndustry}</div>
                </div>

                <div>
                  <span className="text-slate-400">Company Size</span>
                  <div className="text-white font-medium mt-0.5">{sizeRange}</div>
                </div>

                <div>
                  <span className="text-slate-400">Founded</span>
                  <div className="text-white font-medium mt-0.5">{foundedYear}</div>
                </div>

                <div>
                  <span className="text-slate-400">Verification Status</span>
                  <div className="mt-1">
                    <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10 text-[10px]">
                      Verified Platform Entity
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Apply CTA */}
            <div className="bg-gradient-to-br from-blue-950/60 to-indigo-950/60 border border-blue-900/40 rounded-2xl p-6 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-blue-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">Looking for Opportunities?</h4>
              <p className="text-xs text-slate-300">
                Optimize your resume with our AI ATS Scanner to maximize your chances of getting hired at {companyName}.
              </p>
              <Link to="/resume/ats-check" className="block pt-1">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs">
                  Scan My Resume Free
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
