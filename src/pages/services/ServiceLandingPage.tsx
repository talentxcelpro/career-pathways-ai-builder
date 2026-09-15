import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Briefcase,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Layers,
  FileText,
  Cpu,
  GraduationCap,
  Target,
  Users,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPublicServiceUrl } from '@/lib/seo/canonicalUrls';
import { buildServiceSchema, buildBreadcrumbSchema } from '@/lib/seo/structuredDataSchemas';

interface ServiceDefinition {
  title: string;
  tagline: string;
  description: string;
  targetAudience: string;
  deliverables: string[];
  benefits: string[];
  ctaText: string;
  ctaLink: string;
  icon: any;
}

const SERVICE_REGISTRY: Record<string, ServiceDefinition> = {
  'ai-recruitment': {
    title: 'AI Recruitment & Talent Matching Platform',
    tagline: 'Algorithmic Candidate Matching, Automated Screening & Verified Capability Scoring',
    description: 'TalentXcel’s AI Recruitment engine connects employers with pre-screened technical and commercial talent using deep skill graph analytics, reducing sourcing time and increasing quality-of-hire.',
    targetAudience: 'Fast-growing startups, enterprise talent acquisition teams, and staffing firms seeking verified candidate pipelines.',
    deliverables: [
      'Intelligent skill-to-job vector matching',
      'Automated technical competency screening',
      'Instant candidate shortlisting with fit scores',
      'Integrated ATS interview scheduling & feedback',
    ],
    benefits: [
      '70% reduction in time-to-first-interview',
      'Zero keyword-stuffed resume false positives',
      'Direct access to active job-seekers and passive talent',
    ],
    ctaText: 'Hire Talent with AI',
    ctaLink: '/employer',
    icon: Sparkles,
  },
  'staffing-recruitment': {
    title: 'Corporate Staffing & Recruitment Solutions',
    tagline: 'Full-Lifecycle Sourcing, Contract-to-Hire & Recruitment Process Outsourcing (RPO)',
    description: 'Comprehensive staffing and executive search services across technology, sales, operations, and corporate functions, delivered with dedicated industry recruiter teams.',
    targetAudience: 'Enterprises requiring flexible scaling, dedicated recruiting pods, or permanent placement.',
    deliverables: [
      'Dedicated recruitment consultants and account managers',
      'Rigorous background verification and references',
      'Flexible engagement models: Permanent, Contract, RPO',
      'Customized SLA and replacement guarantees',
    ],
    benefits: [
      'Scalable recruitment capacity without fixed overhead',
      'Deep talent pools across Tier-1 and Tier-2 Indian hubs',
      'Transparent milestones and compliance management',
    ],
    ctaText: 'Request Staffing Proposal',
    ctaLink: '/contact',
    icon: Briefcase,
  },
  'rpo': {
    title: 'Recruitment Process Outsourcing (RPO)',
    tagline: 'End-to-End Hiring Delegation, Embedded Recruiter Pods & ATS Operations',
    description: 'Outsource partial or complete recruitment workflows with dedicated TalentXcel recruiter teams managing job postings, candidate pipelines, interview coordination, and offer management.',
    targetAudience: 'Mid-market and enterprise organizations scaling rapidly without expanding internal recruiting headcount.',
    deliverables: [
      'Dedicated embedded talent acquisition specialists',
      'Full ATS pipeline configuration and candidate tracking',
      'Employer brand optimization and job ad distribution',
      'Weekly analytics on cost-per-hire and pipeline velocity',
    ],
    benefits: [
      '40% reduction in overall talent acquisition costs',
      'Guaranteed time-to-fill SLAs across key departments',
      'Seamless extension of internal HR teams',
    ],
    ctaText: 'Explore RPO Solutions',
    ctaLink: '/contact',
    icon: Users,
  },
  'it-services': {
    title: 'IT & Technology Systems Consulting',
    tagline: 'Enterprise Software Architecture, Cloud Modernization & Tech Staff Augmentation',
    description: 'End-to-end technology advisory, digital transformation architecture, and senior engineering team augmentation for modern enterprise technology stacks.',
    targetAudience: 'CTOs, Engineering Directors, and IT Leaders looking to accelerate product velocity.',
    deliverables: [
      'Cloud modernization and microservices architecture',
      'Full-stack engineering pod deployments',
      'DevOps, CI/CD, and infrastructure automation',
      'Security audit and compliance alignment',
    ],
    benefits: [
      'Pre-vetted senior software engineers and architects',
      'Agile delivery models with bi-weekly sprint deliverables',
      'Flexible time-and-materials or fixed-milestone pricing',
    ],
    ctaText: 'Consult with Engineering Team',
    ctaLink: '/contact',
    icon: Cpu,
  },
  'career-counseling': {
    title: 'Executive Career Counseling & Pathway Advisory',
    tagline: 'Personalized Career Milestones, Market Benchmarking & Transition Strategy',
    description: 'One-on-one executive guidance combining algorithmic market intelligence with industry mentor evaluations to map high-velocity career progressions.',
    targetAudience: 'Professionals seeking career acceleration, mid-career transitions, or executive leadership roles.',
    deliverables: [
      'Comprehensive 360° career audit and compensation benchmarking',
      'Tailored 12-month skill acquisition and transition roadmap',
      'Executive resume reconstruction and LinkedIn positioning',
      'Mock interview drills with industry directors',
    ],
    benefits: [
      'Deterministic promotion and career transition milestones',
      'Direct introductions to verified executive recruiters',
      'Confidence in compensation negotiation and offer valuation',
    ],
    ctaText: 'Book Advisory Session',
    ctaLink: '/colleges/career-pathway',
    icon: Target,
  },
  'resume-optimization': {
    title: 'ATS Resume Optimization & Diagnostic Studio',
    tagline: 'Algorithmic Parser Scoring, Keyword Gap Detection & Format Compliance',
    description: 'Instant multi-dimensional resume audits evaluating formatting compliance, ATS compatibility scores, quantified impact metrics, and role-specific keyword density.',
    targetAudience: 'Job seekers applying to Tier-1 companies and competitive technology roles.',
    deliverables: [
      '4-factor ATS compatibility score breakdown',
      'Missing keyword and skill extraction against target job descriptions',
      'Action verb enhancement and impact bullet rewriting',
      'Export to ATS-compliant PDF and Word formats',
    ],
    benefits: [
      '3x increase in recruiter interview callback rates',
      'Elimination of ATS parsing errors and invisible tables/graphics',
      'Immediate instant actionable feedback without human wait times',
    ],
    ctaText: 'Scan My Resume Now',
    ctaLink: '/resume/ats-check',
    icon: FileText,
  },
  'talent-management': {
    title: 'Enterprise Talent Management & Skills Architecture',
    tagline: 'Internal Mobility, Competency Mapping & Verified Credential Registers',
    description: 'Enable transparent, verifiable skill verification across talent pools with cryptographically auditable Career Passports, peer endorsements, and competency testing.',
    targetAudience: 'Enterprises and educational institutions managing employee skill registries and alumni career outcomes.',
    deliverables: [
      'Verifiable Career Passport credential registry',
      'Standardized skill assessment tests and psychometric evaluations',
      'Internal talent mobility and succession planning matrices',
      'Real-time workforce capability analytics',
    ],
    benefits: [
      'Verified candidate proof replacing unverifiable resume claims',
      'Frictionless talent mobility across organizational units',
      'Complete visibility into organizational capability gaps',
    ],
    ctaText: 'Explore Talent Management',
    ctaLink: '/passport',
    icon: ShieldCheck,
  },
  'job-placement': {
    title: 'Direct Job Placement & Candidate Sourcing',
    tagline: 'Fast-Track Introductions to Verified Employers and Hiring Teams',
    description: 'Direct placement services connecting qualified candidates directly to hiring managers at verified enterprises, eliminating cold application black holes.',
    targetAudience: 'Active job seekers and professionals seeking direct introductions to hiring companies.',
    deliverables: [
      'Direct resume submission to verified hiring managers',
      'Application tracking and interview scheduling support',
      'Pre-interview briefing and salary expectation alignment',
      'Feedback loops on interview performance',
    ],
    benefits: [
      'Priority consideration over general applicant pools',
      'Transparent status updates throughout the hiring cycle',
      'Zero fee to job candidates',
    ],
    ctaText: 'Explore Verified Jobs',
    ctaLink: '/jobs',
    icon: Award,
  },
};

export default function ServiceLandingPage() {
  const { slug = 'ai-recruitment' } = useParams<{ slug: string }>();
  const normalizedSlug = slug.toLowerCase().trim();
  const service = SERVICE_REGISTRY[normalizedSlug] || SERVICE_REGISTRY['ai-recruitment'];
  const ServiceIcon = service.icon;

  const canonicalUrl = getPublicServiceUrl(normalizedSlug);
  const pageTitle = `${service.title} | TalentXcel Strategic Services`;
  const pageDescription = service.description;

  const serviceSchema = buildServiceSchema({
    name: service.title,
    description: service.description,
    serviceType: service.title,
    url: canonicalUrl,
  });

  const breadcrumbsSchema = buildBreadcrumbSchema([
    { name: 'Home', url: 'https://talentxcel.in' },
    { name: 'Services', url: 'https://talentxcel.in/services' },
    { name: service.title, url: canonicalUrl },
  ]);

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

        <script type="application/ld+json">{JSON.stringify(serviceSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbsSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-8 px-4 pb-20">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/services" className="hover:text-blue-600 transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-semibold">{service.title}</span>
          </nav>

          {/* Service Hero Card - High Contrast Light Mode */}
          <header className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-800">
                    <ServiceIcon className="w-3.5 h-3.5 text-blue-600" /> TalentXcel Strategic Service
                  </span>
                  <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 text-[10px] font-semibold">
                    Verified Solution
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {service.title}
                </h1>
                <p className="text-blue-600 dark:text-blue-400 text-sm sm:text-base font-semibold">
                  {service.tagline}
                </p>
                <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
                  {service.description}
                </p>
              </div>

              <div className="shrink-0 w-full md:w-auto">
                <Link to={service.ctaLink}>
                  <Button className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-6 shadow-sm gap-2">
                    {service.ctaText} <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          {/* Deliverables & Benefits Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Core Deliverables */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3">
                <CheckCircle2 className="w-4 h-4 text-blue-600" /> Key Deliverables & Scope
              </h2>
              <div className="space-y-2.5">
                {service.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Strategic Benefits */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-3">
                <Sparkles className="w-4 h-4 text-purple-600" /> Measurable Strategic Outcomes
              </h2>
              <div className="space-y-2.5">
                {service.benefits.map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* All Services Navigation Row */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Explore All Strategic Services
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(SERVICE_REGISTRY).map(([key, item]) => (
                <Link key={key} to={`/services/${key}`}>
                  <Badge
                    variant={key === normalizedSlug ? 'default' : 'secondary'}
                    className={`text-xs px-3 py-1 rounded-lg font-medium transition-all ${
                      key === normalizedSlug
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-blue-600 border border-slate-200'
                    }`}
                  >
                    {item.title.split('&')[0].trim()}
                  </Badge>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
