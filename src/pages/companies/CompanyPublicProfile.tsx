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
  Layers,
  HelpCircle,
  Cpu,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useEntity, useEntityListings } from '@/hooks/useClaim1';
import { getPublicCompanyUrl } from '@/lib/seo/canonicalUrls';
import { getGoogleCompanyLogo } from '@/services/companyLogoService';
import {
  buildTalentXcelOrganizationSchema,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildFAQSchema,
} from '@/lib/seo/structuredDataSchemas';
import { RelatedHubsMesh } from '@/components/seo/RelatedHubsMesh';

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
      'Autonomous SI Agent Messaging & Workflows',
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
  },
  'ntpc': {
    name: 'NTPC Limited',
    tagline: 'India’s Largest Energy Utility & Premier Maharatna Public Sector Enterprise',
    description: 'NTPC Limited is India’s largest state-owned electric power generation enterprise, leading the nation’s transition toward reliable thermal power, solar capacity, and green hydrogen infrastructure.',
    whatItDoes: 'NTPC generates and distributes reliable power across India, recruiting top engineering, technical, and operational talent through competitive graduate trainee and executive career tracks.',
    industry: 'Energy & Power Generation (PSU)',
    location: 'New Delhi, Delhi NCR, India',
    website: 'https://careers.ntpc.co.in',
    legalEntity: 'NTPC Limited',
    foundedYear: 1975,
    sizeRange: '10,000+ employees',
    coreServices: ['Electric Power Generation', 'Renewable Energy Systems', 'Thermal Engineering', 'National Grid Transmission'],
    techStack: ['Power Grid SCADA', 'Cloud Infrastructure', 'Industrial IoT', 'Automation Systems'],
    searchKeyword: 'NTPC'
  },
  'hdfc-bank': {
    name: 'HDFC Bank',
    tagline: 'India’s Premier Private Sector Bank & Digital Financial Solutions Leader',
    description: 'HDFC Bank is India’s largest private sector bank, delivering comprehensive banking, financial technology, investment services, and digital retail products to millions of customers.',
    whatItDoes: 'HDFC Bank offers expansive career pathways across retail banking, credit underwriting, branch management, digital payments engineering, and wealth advisory nationwide.',
    industry: 'Banking & Financial Services',
    location: 'Mumbai, Maharashtra, India',
    website: 'https://careers.hdfcbank.com',
    legalEntity: 'HDFC Bank Limited',
    foundedYear: 1994,
    sizeRange: '100,000+ employees',
    coreServices: ['Retail & Commercial Banking', 'Digital Payments & Fintech', 'Corporate Credit', 'Wealth Management'],
    techStack: ['Core Banking Systems', 'Fintech APIs', 'Microservices', 'Enterprise Cloud'],
    searchKeyword: 'HDFC'
  },
  'tata-steel': {
    name: 'Tata Steel',
    tagline: 'Pioneering Global Steel Manufacturer & Industrial Innovation Leader',
    description: 'Tata Steel is one of the world’s top steel manufacturers with extensive mining operations, research centers, and cutting-edge steel fabrication plants across India and Europe.',
    whatItDoes: 'Tata Steel develops high-performance steel products for infrastructure, automotive, and defense industries while creating structured career ladders for engineering trainees and operational leads.',
    industry: 'Manufacturing & Metals',
    location: 'Jamshedpur, Jharkhand, India',
    website: 'https://careers.tatasteel.com',
    legalEntity: 'Tata Steel Limited',
    foundedYear: 1907,
    sizeRange: '50,000+ employees',
    coreServices: ['Integrated Steel Manufacturing', 'Mining & Metallurgy', 'Industrial Automation', 'Global Supply Chain'],
    techStack: ['Industrial IoT', 'SAP S/4HANA', 'Automation Control', 'Data Analytics'],
    searchKeyword: 'Tata Steel'
  },
  'steel-authority-of-india': {
    name: 'Steel Authority of India Limited (SAIL)',
    tagline: 'Premier Maharatna Steel Manufacturing CPSE of India',
    description: 'SAIL is India’s foremost central public sector enterprise operating integrated steel plants in Ranchi, Bhilai, Bokaro, Rourkela, and Salem.',
    whatItDoes: 'SAIL manufactures steel for railways, defense, infrastructure, and heavy industry while hiring thousands of engineers, management trainees, and technicians.',
    industry: 'Manufacturing & Mining (PSU)',
    location: 'New Delhi, Delhi NCR, India',
    website: 'https://sail.co.in',
    legalEntity: 'Steel Authority of India Limited',
    foundedYear: 1954,
    sizeRange: '50,000+ employees',
    coreServices: ['Heavy Steel Manufacturing', 'Blast Furnace Operations', 'Defense Grade Metallurgy', 'Domestic Supply Infrastructure'],
    techStack: ['Process Control Systems', 'ERP Systems', 'Industrial Quality Automation'],
    searchKeyword: 'SAIL'
  },
  'jindal-steel-power': {
    name: 'Jindal Steel & Power',
    tagline: 'Leading Industrial Conglomerate in Steel, Mining & Energy',
    description: 'Jindal Steel & Power is a top Indian industrial enterprise with significant operations across steel manufacturing, power generation, and global infrastructure.',
    whatItDoes: 'JSPL produces specialized rails, structural steel, and renewable power, recruiting across operations, data analysis, logistics, and management tracks.',
    industry: 'Metals & Energy',
    location: 'New Delhi, Delhi NCR, India',
    website: 'https://jindalsteelpower.com',
    legalEntity: 'Jindal Steel & Power Limited',
    foundedYear: 1979,
    sizeRange: '10,000+ employees',
    coreServices: ['Structural Steel Manufacturing', 'Energy Generation', 'Mining Operations', 'Logistics Infrastructure'],
    techStack: ['Industrial SCADA', 'SAP Enterprise', 'Supply Chain Analytics'],
    searchKeyword: 'Jindal'
  },
  'bajaj-auto': {
    name: 'Bajaj Auto',
    tagline: 'World’s Leading Two-Wheeler & Three-Wheeler Manufacturer',
    description: 'Bajaj Auto is a global automotive powerhouse with premier engineering R&D hubs, manufacturing plants in Pune and Aurangabad, and distribution in 70+ countries.',
    whatItDoes: 'Bajaj Auto engineers electric and combustion mobility solutions, hiring Graduate Engineer Trainees (GETs), EV powertrain specialists, and digital operations leaders.',
    industry: 'Automotive & EV Mobility',
    location: 'Pune, Maharashtra, India',
    website: 'https://careers.bajajauto.com',
    legalEntity: 'Bajaj Auto Limited',
    foundedYear: 1945,
    sizeRange: '10,000+ employees',
    coreServices: ['Automotive Engineering', 'Electric Vehicle Design', 'Global Mobility Export', 'Advanced R&D'],
    techStack: ['Automotive CAD/CAM', 'Embedded Systems', 'IoT Telematics', 'Cloud Logistics'],
    searchKeyword: 'Bajaj'
  },
  'hcl-technologies': {
    name: 'HCL Technologies',
    tagline: 'Global Technology Enterprise Supercharging Progress with Cloud & AI',
    description: 'HCLTech is a premier global technology services enterprise helping modern enterprises reimagine their businesses through digital, engineering, cloud, and AI solutions.',
    whatItDoes: 'HCLTech delivers global IT consulting, engineering R&D, and enterprise software solutions, recruiting technical candidates across top Indian tech corridors.',
    industry: 'IT Services & Consulting',
    location: 'Noida, Uttar Pradesh, India',
    website: 'https://hcltech.com',
    legalEntity: 'HCL Technologies Limited',
    foundedYear: 1991,
    sizeRange: '200,000+ employees',
    coreServices: ['Digital Engineering', 'Hybrid Cloud Infrastructure', 'Enterprise AI & Analytics', 'Cybersecurity'],
    techStack: ['Cloud Native', 'Kubernetes', 'Python', 'Java', 'Azure/AWS', 'AI/ML Systems'],
    searchKeyword: 'HCL'
  },
  'bharat-coking-coal-limited': {
    name: 'Bharat Coking Coal Limited (BCCL)',
    tagline: 'Premier Coal India Subsidiary Fueling the Nation’s Heavy Industry',
    description: 'BCCL operates coking coal mines, modern coal washeries, and regional infrastructure across Dhanbad in the Jharia Coalfield.',
    whatItDoes: 'BCCL supplies critical prime coking coal to Indian steel plants and recruits mining engineers, geologists, QA automation specialists, and administrative personnel.',
    industry: 'Mining & Heavy Industry (PSU)',
    location: 'Dhanbad, Jharkhand, India',
    website: 'https://bcclweb.in',
    legalEntity: 'Bharat Coking Coal Limited',
    foundedYear: 1972,
    sizeRange: '30,000+ employees',
    coreServices: ['Prime Coking Coal Extraction', 'Coal Beneficiation & Washing', 'Mine Safety & Geotechnical Analysis'],
    techStack: ['Geographic Information Systems (GIS)', 'Mine Safety Telemetry', 'ERP Logistics'],
    searchKeyword: 'BCCL'
  },
  'raymond': {
    name: 'Raymond',
    tagline: 'Iconic Indian Textile, Apparel & Precision Lifestyle Conglomerate',
    description: 'Raymond is one of India’s most trusted conglomerates with advanced fabric mills in Amravati and Thane, premium retail networks, and engineering divisions.',
    whatItDoes: 'Raymond produces suiting fabrics, garment manufacturing, and precision engineering products, hiring software tech leads, design specialists, and operations managers.',
    industry: 'Textile & Precision Manufacturing',
    location: 'Mumbai, Maharashtra, India',
    website: 'https://raymond.in',
    legalEntity: 'Raymond Limited',
    foundedYear: 1925,
    sizeRange: '10,000+ employees',
    coreServices: ['High-Performance Textile Manufacturing', 'Global Apparel Retail', 'Precision Tools Engineering'],
    techStack: ['Supply Chain ERP', 'CAD/CAM Fashion Tech', 'Automated Warehouse Systems'],
    searchKeyword: 'Raymond'
  },
  'zomato': {
    name: 'Zomato',
    tagline: 'High-Scale Food Ordering, Quick Commerce & Consumer Tech Pioneer',
    description: 'Zomato is India’s leading food delivery and hyper-local logistics enterprise operating consumer platforms connecting millions of customers, delivery partners, and restaurants.',
    whatItDoes: 'Zomato builds high-concurrency microservices, mobile applications (iOS/Android), and real-time routing engines, hiring top engineering, product, and data talent.',
    industry: 'Internet & Food Technology',
    location: 'Gurugram, Haryana, India',
    website: 'https://zomato.com/careers',
    legalEntity: 'Zomato Limited',
    foundedYear: 2008,
    sizeRange: '5,000+ employees',
    coreServices: ['High-Scale Food Delivery', 'Quick Commerce & Logistics', 'Restaurant Tech Solutions', 'Fintech & Payments'],
    techStack: ['Go', 'React Native', 'Kotlin', 'Swift', 'Python', 'Kubernetes', 'PostgreSQL', 'Redis'],
    searchKeyword: 'Zomato'
  },
  'ibs-software': {
    name: 'IBS Software',
    tagline: 'Leading SaaS Solutions for Global Aviation, Travel & Logistics',
    description: 'IBS Software is a worldwide SaaS leader powering mission-critical operations for major airlines, busy airports, cruise lines, and hospitality conglomerates from Infopark Kochi.',
    whatItDoes: 'IBS Software develops airline passenger management, cargo operations, and flight planning SaaS platforms, recruiting QA test automation engineers and distributed systems developers.',
    industry: 'Enterprise SaaS & Aviation Tech',
    location: 'Kochi, Kerala, India',
    website: 'https://ibsplc.com',
    legalEntity: 'IBS Software Pvt Ltd',
    foundedYear: 1997,
    sizeRange: '3,000+ employees',
    coreServices: ['Aviation SaaS Platforms', 'Airline Cargo Management', 'Travel Tech & Hospitality Systems'],
    techStack: ['Java Spring Boot', 'Microservices', 'Angular', 'Oracle Cloud', 'Automated QA Frameworks'],
    searchKeyword: 'IBS'
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
        .eq('is_active', true);

      if (error || !data) return [];

      const kw = searchKeyword.toLowerCase();
      const nSlug = normalizedSlug.replace(/-/g, ' ');
      return data.filter((j: any) => {
        if (entity?.id && j.company_id === entity.id) return true;
        const cName = (j.company_name || '').toLowerCase();
        return cName.includes(kw) || cName.includes(nSlug) || (nSlug === 'hdfc bank' && cName.includes('hdfc')) || (nSlug === 'ntpc' && cName.includes('ntpc'));
      });
    },
  });

  const canonicalUrl = getPublicCompanyUrl(normalizedSlug);
  const logoUrl = getGoogleCompanyLogo(companyName, companyWebsite);

  const countStr = publicJobs.length > 0 ? ` (${publicJobs.length} Live Openings)` : '';
  const pageTitle = `${companyName} Careers${countStr} | TalentXcel`.slice(0, 60);
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

      <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
        {/* Breadcrumbs */}
        <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
          <nav aria-label="Breadcrumb" className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
            <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/companies" className="hover:text-blue-600 transition-colors">Companies</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-semibold">{companyName}</span>
          </nav>
        </div>

        {/* Hero Header Card - Clean High Contrast Light Mode */}
        <header className="max-w-6xl mx-auto px-4 py-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 sm:gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white dark:bg-slate-800 p-2 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
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
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                      {companyName}
                    </h1>
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 gap-1 text-[11px] font-semibold py-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Platform Entity
                    </Badge>
                  </div>
                  <p className="text-blue-600 dark:text-blue-400 mt-1 text-xs sm:text-sm font-semibold">
                    {companyTagline}
                  </p>
                  <p className="text-slate-600 dark:text-slate-300 mt-2 text-xs sm:text-sm leading-relaxed max-w-3xl">
                    {companyDescription}
                  </p>
                  <div className="flex items-center gap-3 sm:gap-4 mt-3 text-xs text-slate-600 dark:text-slate-400 flex-wrap font-medium">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {companyLocation}
                    </span>
                    <a
                      href={companyWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                    >
                      <Globe className="w-3.5 h-3.5" /> {companyWebsite.replace(/^https?:\/\//, '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-400" /> {companyIndustry}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 flex-wrap w-full md:w-auto shrink-0">
                <Link to={`/jobs?search=${encodeURIComponent(searchKeyword)}`} className="flex-1 md:flex-initial">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm text-xs h-9">
                    <Briefcase className="w-4 h-4" /> View Open Jobs ({publicJobs.length})
                  </Button>
                </Link>
                <Link to="/employer" className="flex-1 md:flex-initial">
                  <Button variant="outline" className="w-full border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs h-9">
                    Hire Talent
                  </Button>
                </Link>
              </div>
            </div>

            {/* Claim #1 Board Rank (if present) */}
            {listings.length > 0 && (
              <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-wrap bg-blue-50/60 dark:bg-blue-950/30 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 bg-amber-100 dark:bg-amber-950 rounded-lg">
                    <Trophy className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500">Global AI Products Leaderboard</div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      Rank #{listings[0].current_rank} • {listings[0].scope?.name || 'Global Board'}
                    </div>
                  </div>
                </div>
                <Link to="/rankings/ai-products">
                  <Button size="sm" variant="ghost" className="text-blue-600 hover:text-blue-700 font-semibold gap-1 text-xs h-7">
                    View Live Board <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic Factual Sections - High Contrast Clean Cards */}
        <main className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main 2 Columns */}
          <div className="lg:col-span-2 space-y-5">
            {/* 1. About Company */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-2.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" /> 1. About {companyName}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {companyDescription} Headquartered in {companyLocation}, {companyName} delivers reliable, scalable capabilities to its clients and partners across the industry.
              </p>
            </section>

            {/* 2. What Company Does */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-2.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" /> 2. What {companyName} Does
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
                {whatItDoes}
              </p>
            </section>

            {/* 3. Core Capabilities & Offerings */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" /> 3. Core Offerings & Services
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                {coreServices.map((service, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 p-3 rounded-xl flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-800 dark:text-slate-200 font-semibold">{service}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* 4. Technology Stack & Frameworks */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-600" /> 4. Technology & Tooling Stack
              </h2>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {techStack.map((tech, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-slate-100 dark:bg-purple-950/40 text-slate-800 dark:text-purple-300 border border-slate-200 dark:border-purple-800/40 text-xs font-semibold px-3 py-1 rounded-lg">
                    {tech}
                  </Badge>
                ))}
              </div>
            </section>

            {/* 5. Active Job Openings from Database */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-3.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" /> 5. Active Job Openings ({publicJobs.length})
                </h2>
                <Link to={`/jobs?search=${encodeURIComponent(searchKeyword)}`}>
                  <Button size="sm" variant="ghost" className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold gap-1 h-7">
                    View All in Jobs Hub <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>

              {publicJobs.length > 0 ? (
                <div className="space-y-2.5">
                  {publicJobs.slice(0, 5).map((job: any) => (
                    <div key={job.id} className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 rounded-xl flex items-center justify-between gap-4 hover:border-blue-300 transition-colors">
                      <div>
                        <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors">
                          {job.title}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1 font-medium">
                          <span>{job.location || companyLocation}</span>
                          <span>•</span>
                          <span>{job.employment_type || 'Full-time'}</span>
                          {job.salary_min && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-700 font-semibold">₹{(job.salary_min / 100000).toFixed(1)} - {(job.salary_max / 100000).toFixed(1)} LPA</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Link to={`/jobs/${job.seo_slug || job.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-7 px-3 font-semibold shadow-2xs">
                          Apply Now
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-500">
                  <p>No active openings currently published for {companyName}.</p>
                  <p className="mt-0.5">Check back soon or follow to receive new job alerts.</p>
                </div>
              )}
            </section>

            {/* 6. Frequently Asked Questions */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600" /> 6. Frequently Asked Questions
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, idx) => (
                  <AccordionItem key={idx} value={`item-${idx}`} className="border-slate-100 dark:border-slate-800">
                    <AccordionTrigger className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 py-3">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pb-3">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          </div>

          {/* Right Sidebar: Entity Overview */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b pb-2">
                Entity Overview
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Legal Entity</span>
                  <div className="text-slate-900 dark:text-white font-bold mt-0.5">{legalEntity}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">Headquarters</span>
                  <div className="text-slate-900 dark:text-white font-bold mt-0.5">{companyLocation}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">Primary Domain</span>
                  <div className="text-blue-600 font-bold mt-0.5 truncate">
                    <a href={companyWebsite} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                      {companyWebsite} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">Industry</span>
                  <div className="text-slate-900 dark:text-white font-bold mt-0.5">{companyIndustry}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">Company Size</span>
                  <div className="text-slate-900 dark:text-white font-bold mt-0.5">{sizeRange}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">Founded</span>
                  <div className="text-slate-900 dark:text-white font-bold mt-0.5">{foundedYear}</div>
                </div>

                <div>
                  <span className="text-slate-500 font-medium">Verification Status</span>
                  <div className="mt-1">
                    <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 text-[10px] font-semibold">
                      Verified Platform Entity
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Apply CTA */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200/80 dark:border-blue-900/40 rounded-2xl p-6 text-center space-y-3">
              <Sparkles className="w-7 h-7 text-blue-600 mx-auto" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Looking for Opportunities?</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Optimize your resume with our AI ATS Scanner to maximize your chances of getting hired at {companyName}.
              </p>
              <Link to="/resume/ats-check" className="block pt-1">
                <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8">
                  Scan My Resume Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Sibling Career Hubs Mesh */}
          <div className="col-span-full mt-8">
            <RelatedHubsMesh currentCompanySlug={normalizedSlug} />
          </div>
        </main>
      </div>
    </>
  );
}
