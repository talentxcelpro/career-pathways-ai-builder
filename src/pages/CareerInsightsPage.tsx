import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  Briefcase, 
  Sparkles, 
  Brain, 
  ShieldCheck, 
  ArrowRight, 
  ArrowUpRight, 
  LineChart, 
  PieChart, 
  Lock,
  Compass,
  FileCheck2,
  CheckCircle2,
  Layers,
  Clock,
  Download,
  Share2,
  RefreshCw,
  Zap,
  Target,
  Award,
  Globe,
  Sliders,
  ChevronRight,
  ExternalLink,
  Cpu,
  Shield,
  Cloud,
  Code2,
  Database,
  Building2,
  Activity,
  Check,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useCareerMetrics } from '@/hooks/useCareerMetrics';
import { useAchievements } from '@/hooks/useAchievements';
import { useToast } from '@/hooks/use-toast';
import { SEOHead } from '@/components/seo/SEOHead';
import { formatCanonicalUrl } from '@/config/domainArchitecture';
import CareerIntelligenceDashboard from '@/pages/CareerIntelligenceDashboard';

// ==========================================
// REGIONAL & GLOBAL CURRENCY DATA MATRIX
// ==========================================
type RegionCode = 'GLOBAL' | 'IN' | 'UAE' | 'US' | 'EU' | 'SG';

interface RegionData {
  code: RegionCode;
  label: string;
  flag: string;
  currency: string;
  symbol: string;
  avgCompensation: string;
  growthVelocity: string;
  totalRoles: string;
  activeCompanies: string;
  seniorBand: string;
  hubs: { city: string; salary: string; growth: string; jobs: string; badge: string }[];
}

const REGION_REGISTRY: Record<RegionCode, RegionData> = {
  GLOBAL: {
    code: 'GLOBAL',
    label: 'Global Index',
    flag: '🌐',
    currency: 'USD',
    symbol: '$',
    avgCompensation: '$145,000',
    growthVelocity: '+26.4%',
    totalRoles: '68,000+',
    activeCompanies: '3,800+',
    seniorBand: '$180k - $320k',
    hubs: [
      { city: 'San Francisco & Remote', salary: '$195k', growth: '+22.4%', jobs: '18.5K', badge: 'AI & Core Platform' },
      { city: 'London & UK', salary: '£115k', growth: '+18.6%', jobs: '14.2K', badge: 'Fintech & Scale' },
      { city: 'Dubai Internet City', salary: 'AED 440k', growth: '+36.2%', jobs: '9.4K', badge: 'Sovereign Tech' },
      { city: 'Zurich & DACH', salary: 'CHF 175k', growth: '+15.8%', jobs: '5.8K', badge: 'Systems Engineering' },
      { city: 'Singapore & APAC', salary: 'S$185k', growth: '+21.3%', jobs: '7.9K', badge: 'Web3 & Financial Systems' },
      { city: 'Bangalore & India Hub', salary: '₹26 LPA', growth: '+28.0%', jobs: '28.0K', badge: 'Scale & Architecture' },
    ]
  },
  IN: {
    code: 'IN',
    label: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    avgCompensation: '₹22.5 LPA',
    growthVelocity: '+28.2%',
    totalRoles: '38,500+',
    activeCompanies: '2,600+',
    seniorBand: '₹28 - 55 LPA',
    hubs: [
      { city: 'Bangalore', salary: '₹26 LPA', growth: '+28.0%', jobs: '16.5K', badge: 'Silicon Valley of Asia' },
      { city: 'Mumbai', salary: '₹28 LPA', growth: '+21.4%', jobs: '7.2K', badge: 'Fintech & Banking Capital' },
      { city: 'Delhi-NCR', salary: '₹24 LPA', growth: '+23.8%', jobs: '8.4K', badge: 'Enterprise & Consumer Tech' },
      { city: 'Hyderabad', salary: '₹23 LPA', growth: '+26.2%', jobs: '6.9K', badge: 'Cloud & AI Innovation' },
      { city: 'Pune', salary: '₹21 LPA', growth: '+25.0%', jobs: '5.4K', badge: 'High-Scale Engineering' },
      { city: 'Chennai', salary: '₹20 LPA', growth: '+19.5%', jobs: '4.8K', badge: 'SaaS & Enterprise Core' },
    ]
  },
  UAE: {
    code: 'UAE',
    label: 'UAE & Gulf',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'AED ',
    avgCompensation: 'AED 390,000',
    growthVelocity: '+38.5%',
    totalRoles: '14,200+',
    activeCompanies: '1,450+',
    seniorBand: 'AED 420k - 680k',
    hubs: [
      { city: 'Dubai Internet City', salary: 'AED 440k', growth: '+42.5%', jobs: '8.1K', badge: 'Global Headquarters' },
      { city: 'DIFC Fintech Hive', salary: 'AED 480k', growth: '+39.2%', jobs: '4.2K', badge: 'Institutional Tech' },
      { city: 'Abu Dhabi Hub71', salary: 'AED 460k', growth: '+36.0%', jobs: '3.5K', badge: 'Autonomous & AI' },
      { city: 'Riyadh Tech Zone', salary: 'SAR 420k', growth: '+48.5%', jobs: '5.9K', badge: 'Vision 2030 Transformation' },
      { city: 'Doha Digital District', salary: 'QAR 380k', growth: '+27.4%', jobs: '2.1K', badge: 'Energy & Cloud' },
      { city: 'Manama Tech Park', salary: 'BHD 36k', growth: '+22.0%', jobs: '1.2K', badge: 'Regional Gateway' },
    ]
  },
  US: {
    code: 'US',
    label: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    avgCompensation: '$185,000',
    growthVelocity: '+21.4%',
    totalRoles: '44,000+',
    activeCompanies: '3,100+',
    seniorBand: '$220k - $380k',
    hubs: [
      { city: 'San Francisco Bay Area', salary: '$225k', growth: '+24.1%', jobs: '14.2K', badge: 'AI & Deep Tech' },
      { city: 'Seattle Tech Corridor', salary: '$210k', growth: '+18.5%', jobs: '9.1K', badge: 'Cloud Infrastructure' },
      { city: 'New York Silicon Alley', salary: '$205k', growth: '+21.0%', jobs: '11.4K', badge: 'Fintech & AdTech' },
      { city: 'Austin Tech Ridge', salary: '$180k', growth: '+28.4%', jobs: '6.8K', badge: 'Semiconductor & Cloud' },
      { city: 'Boston Route 128', salary: '$190k', growth: '+17.9%', jobs: '5.2K', badge: 'Biotech & Robotics' },
      { city: 'Remote US (Anywhere)', salary: '$185k', growth: '+25.2%', jobs: '18.9K', badge: 'Distributed Teams' },
    ]
  },
  EU: {
    code: 'EU',
    label: 'Europe',
    flag: '🇪🇺',
    currency: 'EUR',
    symbol: '€',
    avgCompensation: '€115,000',
    growthVelocity: '+19.2%',
    totalRoles: '31,000+',
    activeCompanies: '2,200+',
    seniorBand: '€135k - $210k',
    hubs: [
      { city: 'Zurich & Switzerland', salary: '€180k', growth: '+16.2%', jobs: '6.1K', badge: 'Core Cryptography & Systems' },
      { city: 'London (UK)', salary: '€140k', growth: '+20.5%', jobs: '13.8K', badge: 'Global Financial Engineering' },
      { city: 'Berlin Silicon Allee', salary: '€105k', growth: '+22.4%', jobs: '8.4K', badge: 'SaaS & Marketplace' },
      { city: 'Amsterdam Tech Hub', salary: '€112k', growth: '+19.0%', jobs: '6.5K', badge: 'Fintech & Cloud Hosting' },
      { city: 'Dublin Silicon Docks', salary: '€118k', growth: '+17.5%', jobs: '5.9K', badge: 'EMEA Corporate Tech' },
      { city: 'Stockholm Tech Scene', salary: '€108k', growth: '+18.1%', jobs: '4.2K', badge: 'Gaming & High Scale' },
    ]
  },
  SG: {
    code: 'SG',
    label: 'Singapore & APAC',
    flag: '🇸🇬',
    currency: 'SGD',
    symbol: 'S$ ',
    avgCompensation: 'S$180,000',
    growthVelocity: '+24.5%',
    totalRoles: '16,500+',
    activeCompanies: '1,300+',
    seniorBand: 'S$210k - 340k',
    hubs: [
      { city: 'Singapore CBD', salary: 'S$195k', growth: '+26.1%', jobs: '8.9K', badge: 'APAC Regional HQ' },
      { city: 'Sydney Tech Central', salary: 'A$185k', growth: '+20.4%', jobs: '6.5K', badge: 'Enterprise & Minerals' },
      { city: 'Tokyo Shibuya Tech', salary: '¥14.5M', growth: '+18.2%', jobs: '7.1K', badge: 'Robotics & Gaming' },
      { city: 'Hong Kong Cyberport', salary: 'HK$1.1M', growth: '+16.5%', jobs: '4.2K', badge: 'Algorithmic Trading' },
      { city: 'Seoul Gangnam Hub', salary: '₩120M', growth: '+22.0%', jobs: '5.6K', badge: 'AI & High Scale' },
      { city: 'Remote APAC', salary: 'S$175k', growth: '+28.5%', jobs: '9.4K', badge: 'Cross-Border Teams' },
    ]
  }
};

// ==========================================
// TECHNICAL DOMAINS MATRIX
// ==========================================
type DomainCode = 'SWE' | 'AI' | 'CLOUD' | 'PRODUCT' | 'DATA' | 'CYBER';

interface DomainSpec {
  code: DomainCode;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  topSkills: { name: string; growth: string; salaryMult: number; demand: string; tag: string }[];
  industries: { name: string; growth: string; vacancies: string; velocity: string }[];
}

const DOMAIN_SPECS: Record<DomainCode, DomainSpec> = {
  SWE: {
    code: 'SWE',
    label: 'Software & Architecture',
    icon: Code2,
    description: 'Distributed systems, high-concurrency microservices, Rust, Go, Python and full-stack platforms.',
    topSkills: [
      { name: 'Distributed Systems & Event-Driven Architecture', growth: '+31.4%', salaryMult: 1.25, demand: 'Surging', tag: 'Core Arch' },
      { name: 'Rust & High-Performance Systems', growth: '+42.8%', salaryMult: 1.35, demand: 'Critical', tag: 'High Performance' },
      { name: 'Go Microservices & gRPC Services', growth: '+28.6%', salaryMult: 1.20, demand: 'Very High', tag: 'Enterprise' },
      { name: 'Full Stack TypeScript & React Core', growth: '+19.2%', salaryMult: 1.10, demand: 'High', tag: 'Product Engine' },
      { name: 'Database Sharding & CockroachDB/Postgres', growth: '+26.5%', salaryMult: 1.18, demand: 'High', tag: 'Data Tier' }
    ],
    industries: [
      { name: 'Distributed Cloud & Infrastructure', growth: '+34.2%', vacancies: '18,500', velocity: 'Hyper-growth' },
      { name: 'Fintech & Low-Latency Trading', growth: '+26.8%', vacancies: '14,200', velocity: 'Strong Expansion' },
      { name: 'Enterprise SaaS & Automation', growth: '+21.5%', vacancies: '19,800', velocity: 'Active Hiring' },
      { name: 'Autonomous Systems & Robotics', growth: '+29.4%', vacancies: '5,900', velocity: 'Accelerating' }
    ]
  },
  AI: {
    code: 'AI',
    label: 'AI & Machine Learning',
    icon: Brain,
    description: 'LLM fine-tuning, neural architectures, PyTorch, RAG pipelines, MLOps and autonomous agents.',
    topSkills: [
      { name: 'Large Language Model (LLM) Fine-Tuning & Quantization', growth: '+68.4%', salaryMult: 1.45, demand: 'Surging', tag: 'Generative AI' },
      { name: 'Vector Databases, RAG & LangChain Architecture', growth: '+52.1%', salaryMult: 1.38, demand: 'Very High', tag: 'Search & Embed' },
      { name: 'MLOps, Triton Server & Distributed Training', growth: '+38.5%', salaryMult: 1.30, demand: 'Critical', tag: 'Production ML' },
      { name: 'PyTorch & GPU Kernel Optimization (CUDA)', growth: '+44.2%', salaryMult: 1.42, demand: 'High', tag: 'Deep Learning' },
      { name: 'Autonomous AI Agents & Tool Calling Workflows', growth: '+76.0%', salaryMult: 1.40, demand: 'Surging', tag: 'Next Gen' }
    ],
    industries: [
      { name: 'Generative Enterprise Intelligence', growth: '+72.5%', vacancies: '12,800', velocity: 'Massive Surge' },
      { name: 'Biotech & Drug Discovery AI', growth: '+38.2%', vacancies: '4,100', velocity: 'Hyper-growth' },
      { name: 'Fintech Fraud & Risk Intelligence', growth: '+28.9%', vacancies: '8,400', velocity: 'Strong Expansion' },
      { name: 'Autonomous Mobility & Vision Systems', growth: '+31.0%', vacancies: '6,200', velocity: 'Accelerating' }
    ]
  },
  CLOUD: {
    code: 'CLOUD',
    label: 'Cloud, DevOps & SRE',
    icon: Cloud,
    description: 'Kubernetes orchestration, Terraform IAC, AWS/GCP, multi-region resilience and zero-downtime CI/CD.',
    topSkills: [
      { name: 'Kubernetes Multi-Cluster Management & Service Mesh', growth: '+34.2%', salaryMult: 1.25, demand: 'Very High', tag: 'Orchestration' },
      { name: 'Terraform & Pulumi Infrastructure as Code', growth: '+26.8%', salaryMult: 1.20, demand: 'High', tag: 'IaC' },
      { name: 'Site Reliability Engineering & Distributed Tracing (OpenTelemetry)', growth: '+31.0%', salaryMult: 1.28, demand: 'Critical', tag: 'Resilience' },
      { name: 'AWS & Multi-Cloud Architecture Design', growth: '+22.4%', salaryMult: 1.18, demand: 'High', tag: 'Enterprise Cloud' },
      { name: 'Zero-Trust Cloud Networking & eBPF Observability', growth: '+41.5%', salaryMult: 1.32, demand: 'Surging', tag: 'Next Gen Infra' }
    ],
    industries: [
      { name: 'Multi-Cloud Hosting & Edge CDN', growth: '+28.4%', vacancies: '15,200', velocity: 'Consistent Demand' },
      { name: 'SaaS Platforms & Developer Tools', growth: '+24.1%', vacancies: '18,400', velocity: 'Active Hiring' },
      { name: 'Telecom & 5G Edge Infrastructure', growth: '+21.5%', vacancies: '7,100', velocity: 'Expanding' },
      { name: 'Defense & Secure Cloud Infrastructure', growth: '+32.0%', vacancies: '5,400', velocity: 'Accelerating' }
    ]
  },
  PRODUCT: {
    code: 'PRODUCT',
    label: 'Product & Engineering Leadership',
    icon: Compass,
    description: 'Technical strategy, product architecture, engineering management, OKR delivery and executive alignment.',
    topSkills: [
      { name: 'Technical Product Management & System Architecture', growth: '+24.5%', salaryMult: 1.30, demand: 'High', tag: 'Tech PM' },
      { name: 'Engineering Management & Org Scaling (50+ Engineers)', growth: '+21.8%', salaryMult: 1.38, demand: 'Critical', tag: 'Leadership' },
      { name: 'AI Product Strategy & Data Monetization', growth: '+48.2%', salaryMult: 1.40, demand: 'Surging', tag: 'AI Strategy' },
      { name: 'P&L Ownership & Cloud Unit Economics (FinOps)', growth: '+32.4%', salaryMult: 1.35, demand: 'High', tag: 'Executive' },
      { name: 'Global Cross-Functional Delivery Leadership', growth: '+18.5%', salaryMult: 1.22, demand: 'Steady', tag: 'Operations' }
    ],
    industries: [
      { name: 'Global Enterprise SaaS', growth: '+26.4%', vacancies: '11,200', velocity: 'Strong Expansion' },
      { name: 'Fintech & Digital Neo-Banking', growth: '+24.0%', vacancies: '9,800', velocity: 'Active Hiring' },
      { name: 'HealthTech & Telemedicine', growth: '+19.8%', vacancies: '6,400', velocity: 'Steady Demand' },
      { name: 'B2B Logistics & Supply Chain Scale', growth: '+18.2%', vacancies: '7,500', velocity: 'Expanding' }
    ]
  },
  DATA: {
    code: 'DATA',
    label: 'Data Engineering & Analytics',
    icon: Database,
    description: 'Real-time streaming (Kafka, Flink), Snowflake, dbt, lakehouses and massive scale data modeling.',
    topSkills: [
      { name: 'Apache Kafka & Real-Time Event Streaming', growth: '+36.2%', salaryMult: 1.28, demand: 'Very High', tag: 'Streaming' },
      { name: 'Snowflake, Databricks & Iceberg Lakehouses', growth: '+41.0%', salaryMult: 1.32, demand: 'Surging', tag: 'Modern Stack' },
      { name: 'dbt, Dataform & Production Data Modeling', growth: '+28.5%', salaryMult: 1.20, demand: 'High', tag: 'Analytics Eng' },
      { name: 'Apache Spark, Ray & Distributed Compute', growth: '+24.1%', salaryMult: 1.24, demand: 'High', tag: 'Big Data' },
      { name: 'Data Governance, Lineage & Privacy Compliance', growth: '+33.0%', salaryMult: 1.22, demand: 'Critical', tag: 'Governance' }
    ],
    industries: [
      { name: 'Real-Time Financial Intelligence', growth: '+31.5%', vacancies: '12,400', velocity: 'Hyper-growth' },
      { name: 'E-Commerce Personalization Engines', growth: '+22.4%', vacancies: '14,100', velocity: 'Active Hiring' },
      { name: 'Healthcare Predictive Analytics', growth: '+27.8%', vacancies: '7,200', velocity: 'Accelerating' },
      { name: 'AdTech & Audience Measurement', growth: '+16.5%', vacancies: '8,900', velocity: 'Steady' }
    ]
  },
  CYBER: {
    code: 'CYBER',
    label: 'Cybersecurity & Trust',
    icon: Shield,
    description: 'Zero-trust architecture, cloud security (CSPM/CWPP), threat intelligence, application security and DevSecOps.',
    topSkills: [
      { name: 'Zero-Trust Architecture & Cloud IAM Governance', growth: '+45.8%', salaryMult: 1.35, demand: 'Critical', tag: 'Zero Trust' },
      { name: 'Cloud Security Posture Management (CSPM & CIEM)', growth: '+38.2%', salaryMult: 1.30, demand: 'Very High', tag: 'Cloud Sec' },
      { name: 'Application Security (AppSec) & DevSecOps Pipelines', growth: '+29.6%', salaryMult: 1.26, demand: 'High', tag: 'DevSecOps' },
      { name: 'Offensive Security, Penetration Testing & Red Teaming', growth: '+24.0%', salaryMult: 1.25, demand: 'High', tag: 'Offensive' },
      { name: 'AI Safety, Prompt Injection Defense & Model Auditing', growth: '+84.2%', salaryMult: 1.48, demand: 'Surging', tag: 'AI Security' }
    ],
    industries: [
      { name: 'Banking, Payment Gateways & Cryptography', growth: '+38.5%', vacancies: '14,600', velocity: 'Hyper-growth' },
      { name: 'Critical Cloud Infrastructure Defense', growth: '+34.0%', vacancies: '11,800', velocity: 'Massive Demand' },
      { name: 'Healthcare & Patient Data Protection', growth: '+25.2%', vacancies: '8,400', velocity: 'Strong Expansion' },
      { name: 'Government & Sovereign Cloud Security', growth: '+41.2%', vacancies: '6,900', velocity: 'Surging' }
    ]
  }
};

// ==========================================
// EXPERIENCE TIERS FOR INTERACTIVE SIMULATOR
// ==========================================
interface ExperienceTier {
  level: string;
  yoe: string;
  scoreBase: number;
  percentile: number;
  growthVelocity: string;
  promotionProbability: string;
  salaryMultipliers: Record<RegionCode, string>;
  keyPrerequisite: string;
}

const EXPERIENCE_TIERS: ExperienceTier[] = [
  {
    level: 'Associate & Early Career',
    yoe: '0 - 2 YOE',
    scoreBase: 68,
    percentile: 45,
    growthVelocity: '+38% YoY',
    promotionProbability: '74% in 12-18 mos',
    salaryMultipliers: {
      GLOBAL: '$75k - $110k',
      IN: '₹8 - 14 LPA',
      UAE: 'AED 180k - 260k',
      US: '$95k - $135k',
      EU: '€55k - 80k',
      SG: 'S$85k - 125k'
    },
    keyPrerequisite: 'Master algorithmic problem solving, core CI/CD and clean production code deployment.'
  },
  {
    level: 'Mid Specialist',
    yoe: '3 - 5 YOE',
    scoreBase: 78,
    percentile: 72,
    growthVelocity: '+29% YoY',
    promotionProbability: '68% in 12 mos',
    salaryMultipliers: {
      GLOBAL: '$120k - $165k',
      IN: '₹16 - 28 LPA',
      UAE: 'AED 280k - 420k',
      US: '$145k - $195k',
      EU: '€85k - 120k',
      SG: 'S$130k - 180k'
    },
    keyPrerequisite: 'Own end-to-end service reliability, asynchronous queues, caching layers and schema migrations.'
  },
  {
    level: 'Senior Specialist & Tech Lead',
    yoe: '5 - 8 YOE',
    scoreBase: 86,
    percentile: 88,
    growthVelocity: '+24% YoY',
    promotionProbability: '58% in 12 mos',
    salaryMultipliers: {
      GLOBAL: '$165k - $240k',
      IN: '₹28 - 48 LPA',
      UAE: 'AED 420k - 620k',
      US: '$195k - $290k',
      EU: '€120k - 170k',
      SG: 'S$185k - 260k'
    },
    keyPrerequisite: 'Architect fault-tolerant systems, mentor teams, and enforce cross-service SLAs and scalability.'
  },
  {
    level: 'Staff / Principal Architect',
    yoe: '8 - 12+ YOE',
    scoreBase: 94,
    percentile: 96,
    growthVelocity: '+18% YoY',
    promotionProbability: 'Senior Leadership Active',
    salaryMultipliers: {
      GLOBAL: '$240k - $420k+',
      IN: '₹50 - 1.1 Cr+',
      UAE: 'AED 620k - 950k+',
      US: '$310k - $550k+',
      EU: '€175k - 300k+',
      SG: 'S$270k - 450k+'
    },
    keyPrerequisite: 'Shape multi-year technical vision, direct platform strategy, and represent engineering at executive level.'
  }
];

export default function CareerInsightsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<string>(requestedTab || (user ? 'progression' : 'market'));

  // Interactive UI state
  const [selectedRegion, setSelectedRegion] = useState<RegionCode>('GLOBAL');
  const [selectedDomain, setSelectedDomain] = useState<DomainCode>('SWE');
  const [selectedTierIndex, setSelectedTierIndex] = useState<number>(2); // Default to Senior Specialist
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Live Metrics Hook
  const { careerScore, growthRate, marketRank, opportunities } = useCareerMetrics();
  const { achievements, totalPoints } = useAchievements();

  // Region and domain lookups
  const activeRegion = REGION_REGISTRY[selectedRegion];
  const activeDomain = DOMAIN_SPECS[selectedDomain];
  const activeTier = EXPERIENCE_TIERS[selectedTierIndex];

  useEffect(() => {
    if (requestedTab) {
      setActiveTab(requestedTab);
    }
  }, [requestedTab]);

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setSearchParams({ tab: val });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
      toast({
        title: "Global Telemetry Synchronized",
        description: `Live capability indices updated across ${activeRegion.label} and 6 international hubs.`
      });
    }, 600);
  };

  const handleExport = () => {
    toast({
      title: "Generating Executive Report",
      description: `Exporting verified career intelligence report for ${activeDomain.label} in ${activeRegion.label}.`
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'TalentXcel Global Career Insights & Progression Terminal',
          text: `Explore verified career capability telemetry and compensation indices for ${activeDomain.label} across ${activeRegion.label}`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Terminal URL Copied",
          description: "Link to this exact career intelligence snapshot copied to clipboard."
        });
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Terminal URL Copied",
        description: "Link to this exact career intelligence snapshot copied to clipboard."
      });
    }
  };

  // Compute live responsive score
  const dynamicTalentScore = user && careerScore > 0 ? careerScore : activeTier.scoreBase;
  const dynamicGrowth = user && growthRate !== 0 ? growthRate : 24.8;

  return (
    <>
      <SEOHead
        title="Career Insights & Progression Intelligence | Global Tech Telemetry | TalentXcel"
        description="Global career telemetry, international compensation benchmarks, and capability scoring. Explore live salary data across US, India, UAE, Europe, and Asia on TalentXcel."
        canonical={formatCanonicalUrl('/career-insights', 'talentxcel.in')}
        type="website"
      />

      <div className="dark min-h-screen bg-[#070b14] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200 relative overflow-hidden font-sans">
        
        {/* Subtle Ambient High-End Radial Glows */}
        <div className="absolute -top-32 left-1/3 w-[700px] h-[380px] bg-gradient-to-br from-cyan-500/10 via-blue-600/5 to-transparent blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-48 -right-20 w-[600px] h-[400px] bg-gradient-to-bl from-purple-600/10 via-indigo-600/5 to-transparent blur-[140px] pointer-events-none rounded-full" />
        <div className="absolute bottom-40 -left-20 w-[500px] h-[350px] bg-gradient-to-tr from-emerald-500/5 to-transparent blur-[120px] pointer-events-none rounded-full" />

        {/* Global Live Ticker Strip */}
        <div className="border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-xl px-4 py-2 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto whitespace-nowrap scrollbar-none">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5 text-cyan-400 font-semibold uppercase tracking-wider text-[11px]">
                <Activity className="h-3.5 w-3.5 animate-pulse text-emerald-400" />
                Live International Signals:
              </span>
              <span className="text-slate-300">
                🇦🇪 <strong className="text-white">UAE Sovereign AI:</strong> +42% surge in Staff Distributed Systems requisitions (AED 420K+)
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">
                🇺🇸 <strong className="text-white">US Remote:</strong> 18,900+ active cross-border roles with transparent compensation
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">
                🇮🇳 <strong className="text-white">India Tier-1:</strong> Median specialist architecture compensation up +28.0% YoY
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300">
                🇪🇺 <strong className="text-white">Zurich & London:</strong> High-performance Rust & low-latency roles commanding €160K+
              </span>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-slate-500 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>Real-Time Index Feed</span>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8 relative z-10">

          {/* Top Hero & Global Control Bar */}
          <div className="space-y-6">
            
            {/* Top Bar: Regional Selector & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold tracking-wider uppercase backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                  Global Career Intelligence Terminal
                </span>
                <span className="text-slate-500 text-xs hidden sm:inline">•</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Telemetry Synced: {lastUpdated.toLocaleTimeString()}</span>
                </div>
              </div>

              {/* International Geography Switcher */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-white/[0.08] p-1 rounded-2xl backdrop-blur-2xl shadow-xl">
                <span className="text-[11px] font-semibold text-slate-400 px-2.5 flex items-center gap-1">
                  <Globe className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="hidden md:inline">Region:</span>
                </span>
                {(Object.keys(REGION_REGISTRY) as RegionCode[]).map((rCode) => {
                  const reg = REGION_REGISTRY[rCode];
                  const isSelected = selectedRegion === rCode;
                  return (
                    <button
                      key={rCode}
                      onClick={() => setSelectedRegion(rCode)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1 ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/50'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                      }`}
                    >
                      <span>{reg.flag}</span>
                      <span className="hidden sm:inline">{reg.label.split(' ')[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Action Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/[0.06] pb-6">
              <div className="space-y-2 max-w-3xl">
                <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                  Career Insights <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">&amp;</span> Progression
                </h1>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  Real-time capability benchmarking, international compensation bands, and predictive progression telemetry indexed for <strong className="text-white">{activeRegion.label}</strong> and international tech hubs.
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2.5">
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  disabled={isRefreshing}
                  className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl backdrop-blur-md"
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 text-cyan-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>

                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl backdrop-blur-md"
                >
                  <Share2 className="h-3.5 w-3.5 mr-1.5 text-blue-400" />
                  Share
                </Button>

                <Button
                  onClick={handleExport}
                  variant="outline"
                  size="sm"
                  className="border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs rounded-xl backdrop-blur-md"
                >
                  <Download className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                  Export
                </Button>

                <Button
                  onClick={() => navigate('/career-map')}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-cyan-950/40"
                >
                  <Compass className="h-4 w-4 mr-1.5" />
                  AI Career Map
                </Button>
              </div>
            </div>

            {/* Interactive Technical Domain Selector Pills */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                <span>Select Domain / Specialization:</span>
                <span className="text-cyan-400 font-medium normal-case">Filtering {activeDomain.label}</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {(Object.keys(DOMAIN_SPECS) as DomainCode[]).map((dCode) => {
                  const spec = DOMAIN_SPECS[dCode];
                  const Icon = spec.icon;
                  const isSelected = selectedDomain === dCode;
                  return (
                    <button
                      key={dCode}
                      onClick={() => setSelectedDomain(dCode)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all duration-300 flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-950/40'
                          : 'bg-slate-900/60 border-white/[0.06] text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <span>{spec.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Unified KPI Command Center (4 Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Capability & TalentScore Dial */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <Card className="bg-slate-900/70 border-white/[0.08] hover:border-cyan-500/40 text-slate-100 backdrop-blur-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all pointer-events-none" />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-cyan-400" />
                      Capability TalentScore
                    </span>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border-cyan-500/30 text-[10px] font-bold">
                      {dynamicTalentScore >= 85 ? 'Elite Tier' : 'Senior Specialist'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                          {dynamicTalentScore}
                        </span>
                        <span className="text-slate-400 font-semibold text-sm">/ 100</span>
                      </div>
                      <div className="text-[11px] text-cyan-400 font-medium mt-1">
                        Peer Top {activeTier.percentile}% in {activeDomain.label.split(' ')[0]}
                      </div>
                    </div>

                    {/* Circular SVG Mini Progress Dial */}
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <svg className="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-800"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-cyan-400 transition-all duration-1000 ease-out"
                          strokeDasharray={`${dynamicTalentScore}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <span className="absolute text-[11px] font-bold text-white">{dynamicTalentScore}%</span>
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/[0.06]">
                    <span>Verified Capability Matrix</span>
                    <span className="text-emerald-400 font-medium">{activeTier.yoe}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* KPI 2: Growth Velocity */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-slate-900/70 border-white/[0.08] hover:border-emerald-500/40 text-slate-100 backdrop-blur-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all pointer-events-none" />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      Growth Momentum
                    </span>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                      {activeTier.growthVelocity}
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-extrabold text-emerald-400 tracking-tight">
                      +{dynamicGrowth}%
                    </span>
                    <span className="text-slate-400 font-semibold text-sm">YoY</span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Promotion readiness: <strong className="text-slate-200">{activeTier.promotionProbability}</strong> based on production telemetry.
                  </p>

                  <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/[0.06]">
                    <span>Market Inflow Rate</span>
                    <span className="text-emerald-400 font-medium">{activeRegion.growthVelocity}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* KPI 3: Target Compensation Band */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="bg-slate-900/70 border-white/[0.08] hover:border-blue-500/40 text-slate-100 backdrop-blur-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BarChart3 className="h-4 w-4 text-blue-400" />
                      Target Compensation
                    </span>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-[10px] font-bold">
                      {activeRegion.currency} Band
                    </Badge>
                  </div>

                  <div className="space-y-0.5">
                    <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                      {activeTier.salaryMultipliers[selectedRegion]}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Median for {activeTier.level.split('&')[0]} in {activeRegion.label}
                    </div>
                  </div>

                  <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/[0.06]">
                    <span>Live Benchmark</span>
                    <Link to="/salary" className="text-cyan-400 hover:underline font-semibold flex items-center">
                      Analyze Offer <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* KPI 4: Active Verified Opportunities */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-slate-900/70 border-white/[0.08] hover:border-amber-500/40 text-slate-100 backdrop-blur-2xl shadow-xl transition-all duration-300 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all pointer-events-none" />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-amber-400" />
                      Active Opportunities
                    </span>
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px] font-bold">
                      Direct ATS
                    </Badge>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-extrabold text-amber-400 tracking-tight">
                      {activeRegion.totalRoles}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Across <strong className="text-slate-200">{activeRegion.activeCompanies} verified hiring organizations</strong> with 1-click ATS application.
                  </p>

                  <div className="pt-1 text-[11px] text-slate-400 flex items-center justify-between border-t border-white/[0.06]">
                    <span>Global Search</span>
                    <Link to="/jobs" className="text-cyan-400 hover:underline font-semibold flex items-center">
                      Browse Jobs <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* INTERACTIVE EXPERIENCE TIER SIMULATOR */}
          <Card className="bg-slate-900/60 border-white/[0.08] p-5 md:p-6 rounded-3xl backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-cyan-400" />
                    <h3 className="text-base font-bold text-white">Interactive Capability &amp; Seniority Simulator</h3>
                  </div>
                  <p className="text-xs text-slate-400">
                    Select your seniority stage to simulate live market bands, capability prerequisites, and percentile standing.
                  </p>
                </div>
                <Badge className="w-fit bg-slate-800 text-cyan-300 border border-slate-700 text-xs px-3 py-1">
                  Active Stage: {activeTier.level} ({activeTier.yoe})
                </Badge>
              </div>

              {/* Seniority Selector Tabs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {EXPERIENCE_TIERS.map((tier, idx) => {
                  const isSelected = selectedTierIndex === idx;
                  return (
                    <button
                      key={tier.level}
                      onClick={() => setSelectedTierIndex(idx)}
                      className={`p-3.5 rounded-2xl text-left border transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-br from-cyan-950/70 via-slate-900 to-blue-950/70 border-cyan-500/50 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/40'
                          : 'bg-slate-950/60 border-white/[0.06] hover:border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                          {tier.yoe}
                        </span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-cyan-400" />}
                      </div>
                      <div className="text-xs md:text-sm font-bold text-white">{tier.level}</div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Est: <strong className="text-slate-200">{tier.salaryMultipliers[selectedRegion]}</strong>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Milestone & Requirement Banner for Selected Stage */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1 max-w-3xl">
                  <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Key Capability Prerequisite for {activeTier.level}:
                  </span>
                  <p className="text-slate-300 leading-relaxed">
                    {activeTier.keyPrerequisite}
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/career-map/ai-roadmap-builder')}
                  size="sm"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs whitespace-nowrap shadow-md"
                >
                  Bridge Capability Gap &rarr;
                </Button>
              </div>
            </div>
          </Card>

          {/* Primary Unified Tabs Container */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <TabsList className="bg-slate-900/90 border border-white/[0.08] p-1.5 rounded-2xl backdrop-blur-2xl">
                <TabsTrigger
                  value="progression"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-slate-400 text-xs md:text-sm font-semibold rounded-xl px-4 py-2 transition-all flex items-center gap-2"
                >
                  <Zap className="h-4 w-4" />
                  <span>Real-Time Telemetry</span>
                </TabsTrigger>

                <TabsTrigger
                  value="market"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-slate-400 text-xs md:text-sm font-semibold rounded-xl px-4 py-2 transition-all flex items-center gap-2"
                >
                  <TrendingUp className="h-4 w-4" />
                  <span>Market Intelligence &amp; Trends</span>
                </TabsTrigger>

                <TabsTrigger
                  value="pathways"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-blue-600 data-[state=active]:text-white text-slate-400 text-xs md:text-sm font-semibold rounded-xl px-4 py-2 transition-all flex items-center gap-2"
                >
                  <Compass className="h-4 w-4" />
                  <span>Career Pathways &amp; Tools</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: Real-Time Progression */}
            <TabsContent value="progression" className="space-y-6">
              {user ? (
                <div className="rounded-3xl border border-white/[0.08] bg-slate-900/40 p-2 backdrop-blur-2xl shadow-2xl">
                  <CareerIntelligenceDashboard embedded={true} />
                </div>
              ) : (
                <div className="p-8 md:p-12 bg-slate-900/80 border border-white/[0.08] rounded-3xl text-center space-y-6 max-w-4xl mx-auto backdrop-blur-2xl shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-inner">
                    <Brain className="h-8 w-8" />
                  </div>
                  <div className="space-y-2 max-w-2xl mx-auto">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">
                      Unlock Your Personal Career Progress Telemetry
                    </h3>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Sign in to compute your verified TalentScore, track monthly skill growth velocity, view recruiter profile inspections, and receive AI-guided promotion pathways.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-3xl mx-auto py-2">
                    <div className="p-4 bg-slate-950/80 border border-white/[0.08] rounded-2xl space-y-1.5 hover:border-cyan-500/30 transition-all">
                      <div className="text-cyan-400 font-bold text-xs uppercase tracking-wider">TalentScore</div>
                      <div className="text-sm font-bold text-white">Capability Benchmarking</div>
                      <p className="text-xs text-slate-400">Deep telemetry across coding, systems architecture, and engineering management.</p>
                    </div>

                    <div className="p-4 bg-slate-950/80 border border-white/[0.08] rounded-2xl space-y-1.5 hover:border-emerald-500/30 transition-all">
                      <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Recruiter OS Views</div>
                      <div className="text-sm font-bold text-white">Verified Employer Visits</div>
                      <p className="text-xs text-slate-400">Track which international hiring teams view your credentials and inspect your code repos.</p>
                    </div>

                    <div className="p-4 bg-slate-950/80 border border-white/[0.08] rounded-2xl space-y-1.5 hover:border-purple-500/30 transition-all">
                      <div className="text-purple-400 font-bold text-xs uppercase tracking-wider">Promotion AI</div>
                      <div className="text-sm font-bold text-white">Capability Gap Analysis</div>
                      <p className="text-xs text-slate-400">Targeted upskilling recommendations to transition to the next compensation tier.</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-center gap-3 pt-3">
                    <Button
                      onClick={() => navigate('/auth?returnTo=/career-insights')}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-cyan-950/50"
                    >
                      Sign In to View Report
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                    <Button
                      onClick={() => navigate('/auth?mode=signup&returnTo=/career-insights')}
                      variant="outline"
                      className="border-slate-700 bg-slate-950 hover:bg-slate-800 text-slate-200 px-6 py-3 rounded-xl"
                    >
                      Create Free Career Passport
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: Market Intelligence & Trends */}
            <TabsContent value="market" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Most In-Demand Skills for Selected Domain */}
                <Card className="bg-slate-900/70 border-white/[0.08] text-slate-100 backdrop-blur-2xl shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-cyan-400" />
                        Top In-Demand Capabilities ({activeDomain.label})
                      </span>
                      <Badge variant="outline" className="text-xs border-cyan-500/40 text-cyan-300">
                        {activeRegion.currency} Index
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Capabilities with the highest recruitment volume and compensation premium in {activeRegion.label}.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeDomain.topSkills.map((skill, index) => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-white/[0.06] rounded-2xl hover:border-slate-700 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 font-bold text-sm w-5">#{index + 1}</span>
                          <div>
                            <div className="font-semibold text-white text-sm">{skill.name}</div>
                            <div className="text-xs text-slate-400 mt-0.5">
                              Skill Class: <span className="text-slate-200 font-medium">{skill.tag}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            className={`text-xs ${
                              skill.demand === 'Surging' || skill.demand === 'Critical'
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {skill.demand}
                          </Badge>
                          <span className="text-emerald-400 text-xs font-bold flex items-center">
                            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                            {skill.growth}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* High-Growth Industry Sectors for Selected Domain */}
                <Card className="bg-slate-900/70 border-white/[0.08] text-slate-100 backdrop-blur-2xl shadow-xl">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <PieChart className="h-5 w-5 text-blue-400" />
                        Industry Growth Sectors
                      </span>
                      <Badge variant="outline" className="text-xs border-blue-500/40 text-blue-300">
                        {activeRegion.label}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-xs">
                      Sectors leading job creation, funding expansion, and technology hiring.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {activeDomain.industries.map((sector) => (
                      <div
                        key={sector.name}
                        className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-white/[0.06] rounded-2xl hover:border-slate-700 transition-all"
                      >
                        <div>
                          <div className="font-semibold text-white text-sm">{sector.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {sector.vacancies} active roles • {sector.velocity}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 text-xs font-bold flex items-center">
                            <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
                            {sector.growth}
                          </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Geographic Technology Hubs Comparison */}
              <Card className="bg-slate-900/70 border-white/[0.08] text-slate-100 backdrop-blur-2xl shadow-xl">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <LineChart className="h-5 w-5 text-purple-400" />
                      Key Tech Hubs &amp; Compensation ({activeRegion.label})
                    </span>
                    <Link
                      to="/jobs"
                      className="text-xs text-cyan-400 hover:underline flex items-center font-medium"
                    >
                      Browse location hubs <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-xs">
                    Salary benchmarks and active opportunities indexed by regional technology centers.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                    {activeRegion.hubs.map((hub) => (
                      <div
                        key={hub.city}
                        className="p-4 bg-slate-950/80 border border-white/[0.06] rounded-2xl text-center hover:border-cyan-500/30 transition-all"
                      >
                        <div className="font-bold text-white text-sm mb-1">{hub.city}</div>
                        <div className="text-xs text-cyan-300 font-bold mb-1">{hub.salary}</div>
                        <div className="text-[11px] text-emerald-400 font-semibold mb-1">
                          {hub.growth} growth
                        </div>
                        <div className="text-[11px] text-slate-400">{hub.jobs} jobs</div>
                        <Badge className="mt-2 text-[10px] bg-slate-900 text-slate-300 border border-slate-800">
                          {hub.badge}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Verified Hiring Networks Ticker */}
              <div className="p-5 rounded-3xl bg-slate-900/50 border border-white/[0.06] backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-cyan-400" />
                  <span className="font-semibold text-white">Verified Employers Actively Querying TalentXcel Telemetry:</span>
                </div>
                <div className="flex flex-wrap items-center gap-3 font-semibold text-slate-300 text-xs">
                  <span>Google</span>
                  <span className="text-slate-600">•</span>
                  <span>Microsoft</span>
                  <span className="text-slate-600">•</span>
                  <span>Amazon AWS</span>
                  <span className="text-slate-600">•</span>
                  <span>Stripe</span>
                  <span className="text-slate-600">•</span>
                  <span>Razorpay</span>
                  <span className="text-slate-600">•</span>
                  <span>Careem</span>
                  <span className="text-slate-600">•</span>
                  <span>Revolut</span>
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Pathways & Tools */}
            <TabsContent value="pathways" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visual Pathway Card 1: AI Career Roadmap Builder */}
                <Card className="bg-slate-900/70 border-white/[0.08] text-slate-100 p-6 space-y-5 backdrop-blur-2xl hover:border-cyan-500/40 transition-all rounded-3xl shadow-xl relative overflow-hidden group">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-inner">
                      <Compass className="h-6 w-6" />
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                      Interactive Nodes
                    </Badge>
                  </div>
                  
                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white">AI Career Roadmap Builder</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Map customized step-by-step career pathways from your current technical stack to principal and leadership roles.
                    </p>
                  </div>

                  {/* Visual Node Graph Preview */}
                  <div className="p-3.5 bg-slate-950/80 border border-white/[0.06] rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Step 1: Senior Engineer</span>
                      <span className="text-emerald-400">Current</span>
                    </div>
                    <div className="flex items-center justify-center text-cyan-400">
                      <div className="w-0.5 h-3 bg-cyan-500/40" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-white font-semibold">
                      <span>Step 2: Systems Architect</span>
                      <span className="text-cyan-400">Target Role</span>
                    </div>
                    <div className="flex items-center justify-center text-cyan-400">
                      <div className="w-0.5 h-3 bg-cyan-500/40" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Step 3: Head of Engineering</span>
                      <span>Milestone</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/career-map/ai-roadmap-builder')}
                    className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-lg"
                  >
                    Launch AI Roadmap Builder &rarr;
                  </Button>
                </Card>

                {/* Visual Pathway Card 2: ATS Resume Optimizer */}
                <Card className="bg-slate-900/70 border-white/[0.08] text-slate-100 p-6 space-y-5 backdrop-blur-2xl hover:border-blue-500/40 transition-all rounded-3xl shadow-xl relative overflow-hidden group">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-inner">
                      <FileCheck2 className="h-6 w-6" />
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                      Parser Engine
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white">ATS Resume Optimizer</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Optimize your resume keywords against top engineering benchmarks to pass recruiter ATS screens with high fidelity.
                    </p>
                  </div>

                  {/* Visual ATS Score Widget Preview */}
                  <div className="p-3.5 bg-slate-950/80 border border-white/[0.06] rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">ATS Match Score</span>
                      <span className="text-emerald-400 font-bold">96% High Fidelity</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full w-[96%]" />
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      <span className="text-[10px] bg-slate-900 text-cyan-300 px-2 py-0.5 rounded-md">Distributed Systems</span>
                      <span className="text-[10px] bg-slate-900 text-cyan-300 px-2 py-0.5 rounded-md">Kubernetes</span>
                      <span className="text-[10px] bg-slate-900 text-cyan-300 px-2 py-0.5 rounded-md">gRPC</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/resume')}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-lg"
                  >
                    Open Resume Studio &rarr;
                  </Button>
                </Card>

                {/* Visual Pathway Card 3: Cryptographic Career Passport */}
                <Card className="bg-slate-900/70 border-white/[0.08] text-slate-100 p-6 space-y-5 backdrop-blur-2xl hover:border-purple-500/40 transition-all rounded-3xl shadow-xl relative overflow-hidden group">
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shadow-inner">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      Cryptographic Seal
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-white">Verified Career Passport</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Consolidate your verifiable skills, projects, and benchmarks into a cryptographically signed passport recognized worldwide.
                    </p>
                  </div>

                  {/* Visual Passport Card Preview */}
                  <div className="p-3.5 bg-slate-950/80 border border-purple-500/20 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">TalentPassport™ ID</span>
                      <span className="text-purple-400 font-mono text-[11px]">0x7f9a...3c2e</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Verification Level</span>
                      <span className="text-emerald-400 font-semibold">Tier-1 Sovereign Verified</span>
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Instantly shareable with global enterprise recruitment teams.
                    </div>
                  </div>

                  <Button
                    onClick={() => navigate('/passport')}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs py-2.5 rounded-xl shadow-lg"
                  >
                    Explore Passport &rarr;
                  </Button>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
