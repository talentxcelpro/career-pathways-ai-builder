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
    targetAudience: 'CTOs, Engineering Leaders, and Product Teams building scalable digital products.',
    deliverables: [
      'Systems architecture review and technical audits',
      'Dedicated engineering pods (React, Node, Python, Cloud)',
      'DevOps, CI/CD pipeline, and cloud migration',
      'AI and machine learning workflow integration',
    ],
    benefits: [
      'Rapid ramp-up with vetted senior developers',
      'High code standards and modern architecture best practices',
      'Flexible time-and-materials or fixed-scope delivery',
    ],
    ctaText: 'Discuss Technical Project',
    ctaLink: '/contact',
    icon: Cpu,
  },
  'ai-solutions': {
    title: 'AI Solutions & Autonomous Workflows',
    tagline: 'Custom AI Agent Systems, Machine Learning Integration & Workplace Automation',
    description: 'Transform internal business workflows with customized AI agents, automated resume processing pipelines, LLM fine-tuning, and operational intelligence dashboards.',
    targetAudience: 'Enterprises looking to embed generative AI and predictive intelligence into their products and internal operations.',
    deliverables: [
      'Custom LLM agent architecture and prompt orchestration',
      'Automated candidate ranking and workflow automation',
      'Private vector embeddings and document parsing systems',
      'Compliance and data privacy governance',
    ],
    benefits: [
      'Immediate operational efficiency and workflow automation',
      'Proprietary data security without model leakage',
      'Production-tested agent architecture',
    ],
    ctaText: 'Explore AI Solutions',
    ctaLink: '/contact',
    icon: Layers,
  },
  'corporate-training': {
    title: 'Corporate Training & Executive Development',
    tagline: 'Custom Upskilling, Behavioral Leadership Programs & Technical Bootcamps',
    description: 'Customized talent development and human capital training designed to enhance organizational performance, team communication, and leadership effectiveness.',
    targetAudience: 'HR Leaders and Corporate L&D Departments developing next-generation leaders and upskilling technical workforces.',
    deliverables: [
      'Tailored executive coaching and leadership workshops',
      'Technical bootcamps across modern tech stacks and AI tools',
      'Pre-and-post training competency assessments',
      'Gamified learning tracks with verifiable badges',
    ],
    benefits: [
      'Measurable increase in employee engagement and retention',
      'Direct alignment between training curriculum and business KPIs',
      'Interactive cohort-based sessions with expert practitioners',
    ],
    ctaText: 'Explore Training Programs',
    ctaLink: '/contact',
    icon: GraduationCap,
  },
  'career-services': {
    title: 'Professional Career Services & Executive Coaching',
    tagline: '1-on-1 Career Strategy, Executive Bio Refinement & Interview Simulation',
    description: 'Personalized career acceleration services for ambitious professionals, including strategic job search targeting, compensation negotiation coaching, and career roadmap building.',
    targetAudience: 'Working professionals, mid-career switchers, and executives navigating career transitions.',
    deliverables: [
      'Comprehensive profile and career asset audit',
      'Mock interview sessions with industry feedback',
      'Targeted salary benchmarking and negotiation playbook',
      'Personalized 12-month career growth roadmap',
    ],
    benefits: [
      'Clear differentiation in competitive executive hiring processes',
      'Higher compensation outcomes through structured negotiation',
      'Confidence and clarity in career transitions',
    ],
    ctaText: 'Start Career Coaching',
    ctaLink: '/tools',
    icon: Target,
  },
  'resume-building': {
    title: 'ATS Resume Builder & Cover Letter Studio',
    tagline: 'Real-Time ATS Parsing, Intelligent Bullet Suggestions & Role-Tailored Customization',
    description: 'Build recruiter-ready, ATS-compliant resumes with instant parser feedback, formatting compliance checks, and role-specific keyword optimization.',
    targetAudience: 'Job seekers, graduates, and professionals preparing applications for top tech and corporate employers.',
    deliverables: [
      'ATS score audit against real recruiter parsing standards',
      'Instant keyword matching with target job descriptions',
      'Export to clean, machine-readable PDF and DOCX formats',
      'Tailored cover letter generator with matching typography',
    ],
    benefits: [
      '3x higher recruiter interview callback rates',
      'Zero formatting rejections by Taleo, Workday, or Greenhouse',
      'Instant tailoring for multiple job applications',
    ],
    ctaText: 'Build Free ATS Resume',
    ctaLink: '/resume',
    icon: FileText,
  },
  'talent-management': {
    title: 'Talent Management & Skill Verification',
    tagline: 'Career Passport Credentialing, Workforce Skill Graphs & Internal Mobility',
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

      <div className="min-h-screen bg-slate-950 text-slate-100 py-8 px-4 pb-20">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="text-xs text-slate-400 flex items-center gap-1.5">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/services" className="hover:text-white transition-colors">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-400 font-medium">{service.title}</span>
          </nav>

          {/* Hero */}
          <header className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 md:p-12 backdrop-blur-sm shadow-2xl space-y-6">
            <div className="flex items-start gap-5">
              <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-2xl text-blue-400 shrink-0">
                <ServiceIcon className="w-10 h-10" />
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {service.title}
                </h1>
                <p className="text-blue-400 text-base md:text-lg font-semibold">
                  {service.tagline}
                </p>
                <p className="text-slate-300 text-base leading-relaxed max-w-3xl">
                  {service.description}
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4 flex-wrap">
              <div className="text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Who it's for:</span> {service.targetAudience}
              </div>
              <Link to={service.ctaLink}>
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-semibold gap-2 shadow-lg shadow-blue-600/25">
                  {service.ctaText} <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </header>

          {/* Deliverables & Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> What We Deliver
              </h2>
              <ul className="space-y-3 pt-2">
                {service.deliverables.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 md:p-8 space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" /> Key Strategic Benefits
              </h2>
              <ul className="space-y-3 pt-2">
                {service.benefits.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-200">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Service Matrix */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-semibold text-white mb-3">All TalentXcel Strategic Services</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {Object.entries(SERVICE_REGISTRY).map(([key, s]) => (
                <Link key={key} to={`/services/${key}`}>
                  <Badge
                    variant={key === normalizedSlug ? 'default' : 'outline'}
                    className={key === normalizedSlug ? 'bg-blue-600 text-white' : 'border-slate-800 text-slate-400 hover:text-white text-xs'}
                  >
                    {s.title.split('&')[0].trim()}
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
