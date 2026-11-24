/**
 * Global Industry Benchmark Registry for TalentXcel TalentScore
 * Serves all global industries: Healthcare, Finance, Legal, Engineering,
 * Supply Chain, Education, Hospitality, Creative, Energy, Sales/Marketing,
 * HR, Technology, and Cross-Industry Executive Leadership.
 */

import {
  Stethoscope,
  Briefcase,
  Scale,
  HardHat,
  Truck,
  GraduationCap,
  Utensils,
  Palette,
  Zap,
  TrendingUp,
  Users,
  Cpu,
  Globe,
  Award,
  BookOpen,
  Target,
  ShieldCheck,
  User
} from 'lucide-react';

export interface IndustrySector {
  id: string;
  name: string;
  category: string;
  icon: any;
  color: string;
  badgeColor: string;
  sampleRoles: string[];
  medianBenchmark: number;
  globalCohortSize: string;
}

export const GLOBAL_INDUSTRIES: IndustrySector[] = [
  {
    id: 'universal',
    name: 'Global Cross-Industry Leadership',
    category: 'Executive & General Management',
    icon: Globe,
    color: 'from-blue-600 to-indigo-600',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-400/30',
    sampleRoles: ['Chief Executive Officer', 'Chief Operating Officer', 'Managing Director', 'VP Operations', 'General Manager'],
    medianBenchmark: 710,
    globalCohortSize: '48,000+',
  },
  {
    id: 'healthcare',
    name: 'Healthcare, Medicine & Life Sciences',
    category: 'Healthcare & Clinical Practice',
    icon: Stethoscope,
    color: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30',
    sampleRoles: ['Physician / Specialist', 'Chief Medical Officer', 'Clinical Director', 'Director of Nursing', 'Pharmaceutical Lead'],
    medianBenchmark: 735,
    globalCohortSize: '36,500+',
  },
  {
    id: 'finance',
    name: 'Finance, Banking & Accounting',
    category: 'Financial Services & Investment',
    icon: Briefcase,
    color: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-400/30',
    sampleRoles: ['Chief Financial Officer', 'Investment Banker', 'Portfolio Manager', 'Chartered Accountant / CPA', 'Risk & Compliance Lead'],
    medianBenchmark: 725,
    globalCohortSize: '42,000+',
  },
  {
    id: 'legal',
    name: 'Legal, Compliance & Corporate Governance',
    category: 'Law & Regulatory Governance',
    icon: Scale,
    color: 'from-purple-500 to-indigo-600',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-400/30',
    sampleRoles: ['General Counsel', 'Corporate Attorney', 'Chief Compliance Officer', 'Regulatory Affairs Director', 'Partner / Legal Counsel'],
    medianBenchmark: 740,
    globalCohortSize: '19,000+',
  },
  {
    id: 'engineering',
    name: 'Engineering, Architecture & Construction',
    category: 'Physical & Structural Engineering',
    icon: HardHat,
    color: 'from-orange-500 to-red-600',
    badgeColor: 'bg-orange-500/10 text-orange-400 border-orange-400/30',
    sampleRoles: ['Chief Engineer', 'Project Director', 'Civil / Structural Engineer', 'Principal Architect', 'Plant Operations Head'],
    medianBenchmark: 715,
    globalCohortSize: '29,000+',
  },
  {
    id: 'operations',
    name: 'Supply Chain, Logistics & Procurement',
    category: 'Operations & Global Trade',
    icon: Truck,
    color: 'from-cyan-500 to-blue-600',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-400/30',
    sampleRoles: ['VP Supply Chain', 'Global Logistics Director', 'Chief Procurement Officer', 'Operations Excellence Lead', 'Freight & Trade Head'],
    medianBenchmark: 705,
    globalCohortSize: '24,000+',
  },
  {
    id: 'education',
    name: 'Education, Academia & Research',
    category: 'Education, Higher Ed & EdTech',
    icon: GraduationCap,
    color: 'from-yellow-500 to-amber-600',
    badgeColor: 'bg-yellow-500/10 text-yellow-400 border-yellow-400/30',
    sampleRoles: ['Academic Dean / Director', 'Professor / Senior Researcher', 'Curriculum Architect', 'School Superintendent', 'EdTech Strategy Lead'],
    medianBenchmark: 690,
    globalCohortSize: '21,500+',
  },
  {
    id: 'hospitality',
    name: 'Hospitality, Tourism & Services',
    category: 'Hospitality & Leisure Management',
    icon: Utensils,
    color: 'from-rose-500 to-pink-600',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-400/30',
    sampleRoles: ['General Manager (Luxury Hotel)', 'VP Hospitality Operations', 'F&B Corporate Director', 'Tourism Development Head', 'Regional Operations Director'],
    medianBenchmark: 685,
    globalCohortSize: '18,500+',
  },
  {
    id: 'creative',
    name: 'Creative Arts, Design & Media',
    category: 'Creative, Media & Entertainment',
    icon: Palette,
    color: 'from-pink-500 to-purple-600',
    badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-400/30',
    sampleRoles: ['Executive Creative Director', 'Head of Brand Design', 'Media Producer / Director', 'Design Principal', 'Broadcast & Content Head'],
    medianBenchmark: 695,
    globalCohortSize: '26,000+',
  },
  {
    id: 'energy',
    name: 'Energy, Utilities & Sustainability',
    category: 'Energy, Natural Resources & ESG',
    icon: Zap,
    color: 'from-emerald-600 to-green-700',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-400/30',
    sampleRoles: ['Renewable Energy Director', 'VP Sustainability & ESG', 'Oil & Gas Operations Lead', 'Power Systems Architect', 'Environmental Engineer'],
    medianBenchmark: 720,
    globalCohortSize: '16,000+',
  },
  {
    id: 'marketing',
    name: 'Sales, Marketing & Commercial Growth',
    category: 'Commercial Growth & Brand Strategy',
    icon: TrendingUp,
    color: 'from-violet-500 to-purple-600',
    badgeColor: 'bg-violet-500/10 text-violet-400 border-violet-400/30',
    sampleRoles: ['Chief Commercial Officer', 'VP Global Sales', 'Chief Marketing Officer', 'Growth & Revenue Director', 'Enterprise Business Lead'],
    medianBenchmark: 710,
    globalCohortSize: '38,000+',
  },
  {
    id: 'hr',
    name: 'Human Resources & People Operations',
    category: 'People, Talent & Organization',
    icon: Users,
    color: 'from-blue-500 to-cyan-600',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-400/30',
    sampleRoles: ['Chief People Officer', 'VP Talent Acquisition', 'Head of Organizational Dev', 'Global HR Director', 'Total Rewards & Compensation Lead'],
    medianBenchmark: 700,
    globalCohortSize: '23,000+',
  },
  {
    id: 'technology',
    name: 'Technology, Software & AI Systems',
    category: 'Technology, Cloud & Computing',
    icon: Cpu,
    color: 'from-cyan-500 to-blue-600',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-400/30',
    sampleRoles: ['Chief Technology Officer', 'VP Engineering', 'Principal System Architect', 'Head of AI / Data', 'Engineering Director'],
    medianBenchmark: 720,
    globalCohortSize: '54,000+',
  },
];

export interface DimensionMetric {
  id: string;
  title: string;
  subtitle: string;
  score: number;
  benchmark: number;
  icon: any;
  color: string;
  description: string;
  subMetrics: { label: string; value: number }[];
  recommendation: string;
}

/**
 * Intelligently detect industry sector from user profile
 */
export function detectIndustryFromProfile(profile: any): string {
  if (profile?.industry && typeof profile.industry === 'string') {
    const raw = profile.industry.toLowerCase();
    for (const ind of GLOBAL_INDUSTRIES) {
      if (raw.includes(ind.id) || ind.name.toLowerCase().includes(raw)) {
        return ind.id;
      }
    }
  }

  const textToScan = [
    profile?.title,
    profile?.headline,
    profile?.current_job_title,
    profile?.about,
    profile?.bio,
    Array.isArray(profile?.skills) ? profile.skills.join(' ') : '',
  ].filter(Boolean).join(' ').toLowerCase();

  if (/doctor|physician|surgeon|nurse|hospital|clinical|pharma|medical|healthcare|oncolog|cardiolog/.test(textToScan)) {
    return 'healthcare';
  }
  if (/finance|bank|invest|cfo|accountant|audit|wealth|portfolio|tax|fiduciary|fintech/.test(textToScan)) {
    return 'finance';
  }
  if (/law|legal|attorney|counsel|jurist|compliance|governance|statutory|litigat/.test(textToScan)) {
    return 'legal';
  }
  if (/civil|mechanic|electrical|structural|construct|architect|cad|plant engineer/.test(textToScan)) {
    return 'engineering';
  }
  if (/supply chain|logistics|procure|warehouse|freight|transport|trade|cargo/.test(textToScan)) {
    return 'operations';
  }
  if (/teach|professor|school|educat|academic|dean|curriculum|faculty/.test(textToScan)) {
    return 'education';
  }
  if (/hotel|hospitality|resort|chef|culinary|tourism|travel|guest experience/.test(textToScan)) {
    return 'hospitality';
  }
  if (/creative|art director|design|animat|video producer|media|copywrit|photograph/.test(textToScan)) {
    return 'creative';
  }
  if (/energy|oil|gas|solar|power|renewable|utility|sustainab|esg/.test(textToScan)) {
    return 'energy';
  }
  if (/sales|market|cmo|brand|growth|revenue|advertis|customer success/.test(textToScan)) {
    return 'marketing';
  }
  if (/hr|human resources|people ops|talent acquisition|recruit|culture|chro/.test(textToScan)) {
    return 'hr';
  }
  if (/software|developer|frontend|backend|cloud|devops|cyber|fullstack|cto|ai|machine learning/.test(textToScan)) {
    return 'technology';
  }

  return 'universal';
}

/**
 * Returns dynamic 5-dimension radar data tailored to the candidate's chosen industry
 */
export function getDimensionsForIndustry(industryId: string, userScore = 820): DimensionMetric[] {
  // Score baseline ratios
  const base = Math.min(98, Math.max(50, Math.round(userScore / 10)));

  switch (industryId) {
    case 'healthcare':
      return [
        {
          id: 'clinical-authority',
          title: 'Clinical Authority & Diagnostics',
          subtitle: 'Medical rigor, diagnostic accuracy, and patient care delivery',
          score: Math.min(99, base + 8),
          benchmark: 76,
          icon: Stethoscope,
          color: 'from-emerald-400 to-teal-500',
          description: 'Evaluates your verified clinical trajectory, treatment outcomes, and specialized medical procedural excellence.',
          subMetrics: [
            { label: 'Diagnostic Rigor & Care Outcomes', value: Math.min(99, base + 9) },
            { label: 'Clinical Protocol Compliance', value: Math.min(99, base + 6) },
            { label: 'Patient Safety & Care Velocity', value: Math.min(99, base + 7) },
          ],
          recommendation: 'Complete Fellowship Accreditation or specialized board sub-specialty endorsement.',
        },
        {
          id: 'medical-capability',
          title: 'Procedural & Practice Capability',
          subtitle: 'Verified medical competencies & advanced therapeutic protocols',
          score: Math.min(99, base + 5),
          benchmark: 73,
          icon: ShieldCheck,
          color: 'from-emerald-400 to-teal-500',
          description: 'Quantifies verified clinical procedures, modern therapeutic devices, and evidence-based practice standards.',
          subMetrics: [
            { label: 'Advanced Medical Procedures', value: Math.min(99, base + 6) },
            { label: 'Health Informatics & EHR Systems', value: Math.min(99, base + 4) },
            { label: 'Clinical Risk Mitigation', value: Math.min(99, base + 5) },
          ],
          recommendation: 'Verify hospital privileges and latest advanced procedural certifications.',
        },
        {
          id: 'healthcare-demand',
          title: 'Institutional Relevance & Healthcare Demand',
          subtitle: 'Institutional hiring demand from hospitals, networks, and clinics',
          score: Math.min(99, base - 3),
          benchmark: 71,
          icon: Briefcase,
          color: 'from-emerald-400 to-teal-500',
          description: 'Measures executive demand across global hospital networks, academic medical centers, and clinical practices.',
          subMetrics: [
            { label: 'Specialist Scarcity Index', value: Math.min(99, base - 1) },
            { label: 'Healthcare Network Compensation Fit', value: Math.min(99, base - 4) },
            { label: 'Cross-Jurisdictional Licensure Value', value: Math.min(99, base - 3) },
          ],
          recommendation: 'Add multi-regional clinical licensing or international board reciprocity.',
        },
        {
          id: 'clinical-reputation',
          title: 'Institutional Standing & Peer Citations',
          subtitle: 'Peer endorsements, clinical reviews, and hospital leadership footprint',
          score: Math.min(99, base - 4),
          benchmark: 68,
          icon: Users,
          color: 'from-emerald-400 to-teal-500',
          description: 'Assesses peer citations, hospital department leadership, and demonstrable reputation among medical colleagues.',
          subMetrics: [
            { label: 'Medical Board Endorsements', value: Math.min(99, base - 2) },
            { label: 'Peer Clinical Recommendations', value: Math.min(99, base - 5) },
            { label: 'Departmental Leadership Trust', value: Math.min(99, base - 4) },
          ],
          recommendation: 'Request verified peer citations from senior clinical colleagues on TalentXcel Network.',
        },
        {
          id: 'medical-evolution',
          title: 'CME & Clinical Evolution',
          subtitle: 'Continuing medical education, clinical trials, and emerging treatments',
          score: Math.min(99, base + 2),
          benchmark: 70,
          icon: BookOpen,
          color: 'from-emerald-400 to-teal-500',
          description: 'Tracks continuous medical education (CME) velocity, clinical research participation, and protocol updates.',
          subMetrics: [
            { label: 'CME Velocity & Credit Currency', value: Math.min(99, base + 4) },
            { label: 'Clinical Research & Publications', value: Math.min(99, base + 1) },
            { label: 'Emerging Therapeutics Adoption', value: Math.min(99, base + 2) },
          ],
          recommendation: 'Record completed CME credits and ongoing clinical trials in your Career Passport.',
        },
      ];

    case 'finance':
      return [
        {
          id: 'fiduciary-depth',
          title: 'Fiduciary & Market Authority',
          subtitle: 'Portfolio stewardship, capital allocation, and fiscal governance',
          score: Math.min(99, base + 7),
          benchmark: 74,
          icon: Briefcase,
          color: 'from-amber-400 to-orange-500',
          description: 'Quantifies demonstrated fiduciary rigor, asset portfolio growth, and executive enterprise financial stewardship.',
          subMetrics: [
            { label: 'Capital Stewardship & Alpha', value: Math.min(99, base + 8) },
            { label: 'Fiscal Governance & Audit Compliance', value: Math.min(99, base + 6) },
            { label: 'Enterprise Valuation Prowess', value: Math.min(99, base + 7) },
          ],
          recommendation: 'Publish verified financial performance case study or audited transaction milestones.',
        },
        {
          id: 'quantitative-capability',
          title: 'Financial Modeling & Quantitative Rigor',
          subtitle: 'Financial analysis, risk modeling, and financial infrastructure',
          score: Math.min(99, base + 6),
          benchmark: 72,
          icon: TrendingUp,
          color: 'from-amber-400 to-orange-500',
          description: 'Evaluates verified financial modeling, M&A due diligence, treasury operations, and risk management capability.',
          subMetrics: [
            { label: 'DCF & Complex Valuation Architecture', value: Math.min(99, base + 7) },
            { label: 'Liquidity & Capital Structure Strategy', value: Math.min(99, base + 5) },
            { label: 'Enterprise Risk & Stress Testing', value: Math.min(99, base + 6) },
          ],
          recommendation: 'Complete CFA or advanced financial risk modeling certification.',
        },
        {
          id: 'market-liquidity',
          title: 'Capital Market Demand & Deal Flow',
          subtitle: 'Demand from investment funds, banks, and enterprise treasury',
          score: Math.min(99, base - 2),
          benchmark: 70,
          icon: Target,
          color: 'from-amber-400 to-orange-500',
          description: 'Measures executive demand from institutional funds, private equity, and multinational finance divisions.',
          subMetrics: [
            { label: 'Financial Executive Scarcity', value: Math.min(99, base - 1) },
            { label: 'CFO / Senior Partner Compensation Fit', value: Math.min(99, base - 3) },
            { label: 'Cross-Border Capital Relevance', value: Math.min(99, base - 2) },
          ],
          recommendation: 'Target executive corporate finance or institutional capital advisory roles.',
        },
        {
          id: 'institutional-trust',
          title: 'Institutional Trust & Audit Standing',
          subtitle: 'Regulatory compliance history, board trust, and peer reputation',
          score: Math.min(99, base - 3),
          benchmark: 69,
          icon: Users,
          color: 'from-amber-400 to-orange-500',
          description: 'Assesses institutional board endorsements, regulatory clean-standing record, and professional network footprint.',
          subMetrics: [
            { label: 'Regulatory & Licensure Standing', value: Math.min(99, base) },
            { label: 'Board & Managing Director Endorsements', value: Math.min(99, base - 4) },
            { label: 'Institutional Integrity Score', value: Math.min(99, base - 3) },
          ],
          recommendation: 'Request two verified endorsements from executive colleagues and audit partners.',
        },
        {
          id: 'fintech-evolution',
          title: 'FinTech & Modern Financial Instruments',
          subtitle: 'Adoption of automated financial intelligence, ESG metrics, and modern analytics',
          score: Math.min(99, base + 3),
          benchmark: 68,
          icon: BookOpen,
          color: 'from-amber-400 to-orange-500',
          description: 'Tracks continuous learning in automated ERP systems, modern treasury tech, and digital asset frameworks.',
          subMetrics: [
            { label: 'Automated Financial Intelligence', value: Math.min(99, base + 5) },
            { label: 'ESG Reporting & Green Finance', value: Math.min(99, base + 2) },
            { label: 'Modern Treasury Architecture', value: Math.min(99, base + 3) },
          ],
          recommendation: 'Enroll in Strategic Corporate Treasury & FinTech Modernization track.',
        },
      ];

    case 'legal':
      return [
        {
          id: 'jurisprudential-depth',
          title: 'Jurisprudential & Statutory Mastery',
          subtitle: 'Legal analysis, statutory interpretation, and judicial acumen',
          score: Math.min(99, base + 8),
          benchmark: 75,
          icon: Scale,
          color: 'from-purple-500 to-indigo-600',
          description: 'Evaluates your depth within statutory frameworks, regulatory compliance, and complex corporate jurisprudence.',
          subMetrics: [
            { label: 'Statutory Interpretation & Research', value: Math.min(99, base + 9) },
            { label: 'Regulatory Risk Forecasting', value: Math.min(99, base + 7) },
            { label: 'Complex Cross-Border Compliance', value: Math.min(99, base + 8) },
          ],
          recommendation: 'Author or document an executive precedent brief on cross-border corporate governance.',
        },
        {
          id: 'contract-architecture',
          title: 'Contractual Architecture & Negotiation',
          subtitle: 'High-stakes deal structuring, arbitration, and dispute resolution',
          score: Math.min(99, base + 6),
          benchmark: 73,
          icon: ShieldCheck,
          color: 'from-purple-500 to-indigo-600',
          description: 'Quantifies verified commercial agreement architecture, dispute resolution velocity, and transactional negotiation.',
          subMetrics: [
            { label: 'Commercial Contract Architecture', value: Math.min(99, base + 7) },
            { label: 'Alternative Dispute Resolution (ADR)', value: Math.min(99, base + 5) },
            { label: 'Intellectual Property Protection', value: Math.min(99, base + 6) },
          ],
          recommendation: 'Verify professional bar admission and specialized legal practice certifications.',
        },
        {
          id: 'legal-market-demand',
          title: 'Corporate Legal Demand Velocity',
          subtitle: 'Demand from multinational corporations, law firms, and institutions',
          score: Math.min(99, base - 2),
          benchmark: 70,
          icon: Target,
          color: 'from-purple-500 to-indigo-600',
          description: 'Measures corporate demand for General Counsel, Partners, and Senior Corporate Counsel across global markets.',
          subMetrics: [
            { label: 'General Counsel Role Scarcity', value: Math.min(99, base - 1) },
            { label: 'Corporate Legal Compensation Fit', value: Math.min(99, base - 3) },
            { label: 'International Jurisdiction Premium', value: Math.min(99, base - 2) },
          ],
          recommendation: 'Explore multi-jurisdictional legal advisory opportunities.',
        },
        {
          id: 'bar-standing',
          title: 'Bar Standing & Institutional Influence',
          subtitle: 'Bar association credentials, court citations, and peer standing',
          score: Math.min(99, base - 4),
          benchmark: 69,
          icon: Users,
          color: 'from-purple-500 to-indigo-600',
          description: 'Assesses verified Bar credentials, published judicial citations, and professional reputation among legal peers.',
          subMetrics: [
            { label: 'Bar Association Standing', value: Math.min(99, base) },
            { label: 'Senior Partner & Counsel Citations', value: Math.min(99, base - 5) },
            { label: 'Judicial & Governance Reputation', value: Math.min(99, base - 4) },
          ],
          recommendation: 'Request two peer citations from legal colleagues and corporate directors.',
        },
        {
          id: 'legal-tech-evolution',
          title: 'LegalTech & Regulatory Innovation',
          subtitle: 'Adoption of automated contract intelligence, AI discovery, and compliance tech',
          score: Math.min(99, base + 2),
          benchmark: 67,
          icon: BookOpen,
          color: 'from-purple-500 to-indigo-600',
          description: 'Tracks learning momentum in automated legal discovery, digital compliance architectures, and smart contracts.',
          subMetrics: [
            { label: 'AI Legal Discovery & Contract Intelligence', value: Math.min(99, base + 4) },
            { label: 'Data Privacy & GDPR/DPDP Frameworks', value: Math.min(99, base + 2) },
            { label: 'Modern Corporate Governance Frameworks', value: Math.min(99, base + 1) },
          ],
          recommendation: 'Complete modern AI Legal Operations and Compliance Certification.',
        },
      ];

    case 'engineering':
      return [
        {
          id: 'structural-depth',
          title: 'Engineering Rigor & Systems Integrity',
          subtitle: 'Structural design, technical specifications, and safety engineering',
          score: Math.min(99, base + 8),
          benchmark: 73,
          icon: HardHat,
          color: 'from-orange-500 to-red-600',
          description: 'Quantifies demonstrated structural analysis, engineering specifications, and safety-critical system deployment.',
          subMetrics: [
            { label: 'Structural Analysis & Integrity', value: Math.min(99, base + 9) },
            { label: 'Safety & Regulatory Standards (ISO/OSHA)', value: Math.min(99, base + 7) },
            { label: 'Multi-Discipline Engineering Synthesis', value: Math.min(99, base + 8) },
          ],
          recommendation: 'Document an engineering case study on complex infrastructure project delivery.',
        },
        {
          id: 'design-capability',
          title: 'Technical Design & CAD/BIM Capability',
          subtitle: 'Verified engineering modeling, simulation, and project execution',
          score: Math.min(99, base + 6),
          benchmark: 71,
          icon: ShieldCheck,
          color: 'from-orange-500 to-red-600',
          description: 'Evaluates proficiency in advanced CAD/CAM/BIM modeling, finite element analysis (FEA), and technical documentation.',
          subMetrics: [
            { label: 'Advanced CAD / BIM & Digital Twin Modeling', value: Math.min(99, base + 7) },
            { label: 'Finite Element Analysis & Stress Simulation', value: Math.min(99, base + 5) },
            { label: 'Constructability & Fabrication Readiness', value: Math.min(99, base + 6) },
          ],
          recommendation: 'Verify Professional Engineer (PE) / Chartered Engineer credentials.',
        },
        {
          id: 'infrastructure-demand',
          title: 'Global Infrastructure Demand Velocity',
          subtitle: 'Demand across civil infrastructure, industrial plants, and construction',
          score: Math.min(99, base - 2),
          benchmark: 69,
          icon: Target,
          color: 'from-orange-500 to-red-600',
          description: 'Measures global enterprise demand for engineering project directors, structural principals, and chief engineers.',
          subMetrics: [
            { label: 'Chief Engineer Role Scarcity', value: Math.min(99, base - 1) },
            { label: 'Infrastructure Project Compensation Fit', value: Math.min(99, base - 3) },
            { label: 'Mega-Project Experience Premium', value: Math.min(99, base - 2) },
          ],
          recommendation: 'Explore international infrastructure and EPC program leadership roles.',
        },
        {
          id: 'professional-citations',
          title: 'Chartered Licensure & Professional Citations',
          subtitle: 'PE/Chartered status, municipal approvals, and peer endorsements',
          score: Math.min(99, base - 4),
          benchmark: 67,
          icon: Users,
          color: 'from-orange-500 to-red-600',
          description: 'Assesses verified professional engineering board licensure, signed municipal project seals, and peer reputation.',
          subMetrics: [
            { label: 'Chartered / PE Licensure Standing', value: Math.min(99, base) },
            { label: 'Principal & Project Director Citations', value: Math.min(99, base - 5) },
            { label: 'Institutional Safety Record', value: Math.min(99, base - 3) },
          ],
          recommendation: 'Request two peer endorsements from licensed senior engineering directors.',
        },
        {
          id: 'sustainable-engineering',
          title: 'Sustainable Engineering & Modern Automation',
          subtitle: 'Green materials, automation, energy efficiency, and smart structures',
          score: Math.min(99, base + 3),
          benchmark: 68,
          icon: BookOpen,
          color: 'from-orange-500 to-red-600',
          description: 'Tracks learning momentum in green building standards (LEED/BREEAM), robotics, and industrial IoT monitoring.',
          subMetrics: [
            { label: 'Green Building & Sustainable Design (LEED)', value: Math.min(99, base + 4) },
            { label: 'Smart Structures & IoT Telemetry', value: Math.min(99, base + 2) },
            { label: 'Automation & Modular Construction Tech', value: Math.min(99, base + 3) },
          ],
          recommendation: 'Enroll in Sustainable Infrastructure & LEED Accredited Professional track.',
        },
      ];

    case 'operations':
      return [
        {
          id: 'supply-chain-scale',
          title: 'Supply Chain & Operational Scale',
          subtitle: 'Throughput optimization, global freight networks, and logistics velocity',
          score: Math.min(99, base + 8),
          benchmark: 73,
          icon: Truck,
          color: 'from-cyan-500 to-blue-600',
          description: 'Quantifies demonstrated capacity in multi-node supply network orchestration, procurement scale, and warehouse efficiency.',
          subMetrics: [
            { label: 'Throughput & Capacity Optimization', value: Math.min(99, base + 9) },
            { label: 'Multi-Modal Freight Network Velocity', value: Math.min(99, base + 7) },
            { label: 'Procurement Scale & Cost Architecture', value: Math.min(99, base + 8) },
          ],
          recommendation: 'Publish verified operational case study on global logistics bottleneck resolution.',
        },
        {
          id: 'operations-capability',
          title: 'Lean Operations & Process Execution',
          subtitle: 'Lean Six Sigma, quality control, ERP systems, and warehouse automation',
          score: Math.min(99, base + 6),
          benchmark: 71,
          icon: ShieldCheck,
          color: 'from-cyan-500 to-blue-600',
          description: 'Evaluates verified Lean Six Sigma methodologies, inventory turnover ratios, ERP workflows, and SLA delivery.',
          subMetrics: [
            { label: 'Lean Six Sigma & Waste Reduction', value: Math.min(99, base + 7) },
            { label: 'Inventory Turnover & SLA Reliability', value: Math.min(99, base + 5) },
            { label: 'Warehouse Management & Robotics Integration', value: Math.min(99, base + 6) },
          ],
          recommendation: 'Verify Lean Six Sigma Black Belt or CSCP / CPIM certification.',
        },
        {
          id: 'logistics-demand',
          title: 'Global Operations Demand Velocity',
          subtitle: 'Demand from multinational manufacturers, retailers, and trade operators',
          score: Math.min(99, base - 2),
          benchmark: 69,
          icon: Target,
          color: 'from-cyan-500 to-blue-600',
          description: 'Measures executive demand for VP of Supply Chain, Operations Directors, and Global Logistics Leaders.',
          subMetrics: [
            { label: 'Operations Director Scarcity Ratio', value: Math.min(99, base - 1) },
            { label: 'Executive Operations Compensation Fit', value: Math.min(99, base - 3) },
            { label: 'Cross-Border Trade Resilience Value', value: Math.min(99, base - 2) },
          ],
          recommendation: 'Target executive cross-border trade and supply network resilience roles.',
        },
        {
          id: 'vendor-trust',
          title: 'Vendor Partnerships & Operational Trust',
          subtitle: 'Vendor scorecards, executive references, and audit track record',
          score: Math.min(99, base - 3),
          benchmark: 68,
          icon: Users,
          color: 'from-cyan-500 to-blue-600',
          description: 'Assesses supplier and vendor audit scorecards, executive peer endorsements, and demonstrable institutional trust.',
          subMetrics: [
            { label: 'Vendor Performance Scorecard Average', value: Math.min(99, base) },
            { label: 'Executive Operations Peer Endorsements', value: Math.min(99, base - 4) },
            { label: 'Audit & Safety Compliance Record', value: Math.min(99, base - 3) },
          ],
          recommendation: 'Request two peer endorsements from executive operations and vendor partners.',
        },
        {
          id: 'logistics-tech-evolution',
          title: 'Predictive Logistics & Smart Automation',
          subtitle: 'Predictive demand planning, RFID/IoT tracking, and autonomous warehousing',
          score: Math.min(99, base + 3),
          benchmark: 68,
          icon: BookOpen,
          color: 'from-cyan-500 to-blue-600',
          description: 'Tracks learning momentum in AI-driven demand forecasting, real-time IoT tracking, and resilient supply chain modeling.',
          subMetrics: [
            { label: 'AI Demand Forecasting & Predictive Planning', value: Math.min(99, base + 5) },
            { label: 'IoT & Telemetry Freight Tracking', value: Math.min(99, base + 2) },
            { label: 'Autonomous Warehousing & AGV Systems', value: Math.min(99, base + 3) },
          ],
          recommendation: 'Complete Executive Predictive Supply Chain & Smart Automation certification.',
        },
      ];

    // Default universal cross-industry leadership & other sectors
    default:
      return [
        {
          id: 'domain-authority',
          title: 'Domain Authority & Leadership',
          subtitle: 'Professional depth, strategic execution, and organizational impact',
          score: Math.min(99, base + 7),
          benchmark: 72,
          icon: User,
          color: 'from-blue-500 to-indigo-600',
          description: 'Quantifies demonstrated domain expertise, operational execution, and executive stewardship across global organizations.',
          subMetrics: [
            { label: 'Domain Leadership & Governance', value: Math.min(99, base + 8) },
            { label: 'Strategic Execution & Scalability', value: Math.min(99, base + 6) },
            { label: 'Cross-Functional Transferability', value: Math.min(99, base + 7) },
          ],
          recommendation: 'Publish a verified executive case study or white paper on organizational transformation.',
        },
        {
          id: 'professional-capability',
          title: 'Professional Competency & Execution',
          subtitle: 'Validated technical competencies, tools, and professional standards',
          score: Math.min(99, base + 5),
          benchmark: 70,
          icon: ShieldCheck,
          color: 'from-blue-500 to-indigo-600',
          description: 'Evaluates verified professional workflows, domain methodologies, operational frameworks, and quality delivery.',
          subMetrics: [
            { label: 'Core Professional Competencies', value: Math.min(99, base + 6) },
            { label: 'Standards & Regulatory Rigor', value: Math.min(99, base + 4) },
            { label: 'Complex Problem Solving Velocity', value: Math.min(99, base + 5) },
          ],
          recommendation: 'Complete advanced industry-recognized certification in your primary discipline.',
        },
        {
          id: 'market-demand',
          title: 'Global Market Demand & Relevance',
          subtitle: 'Demand alignment with high-growth organizations and executive roles',
          score: Math.min(99, base - 2),
          benchmark: 69,
          icon: Target,
          color: 'from-blue-500 to-indigo-600',
          description: 'Measures executive demand from global institutions, employers, and hiring entities seeking your capability matrix.',
          subMetrics: [
            { label: 'Capability Scarcity Index', value: Math.min(99, base - 1) },
            { label: 'Executive Compensation Fit', value: Math.min(99, base - 3) },
            { label: 'Cross-Border Placement Velocity', value: Math.min(99, base - 2) },
          ],
          recommendation: 'Align profile with high-demand executive and leadership capability frameworks.',
        },
        {
          id: 'institutional-trust',
          title: 'Institutional Trust & Peer Reputation',
          subtitle: 'Verified recommendations, professional standing, and leadership footprint',
          score: Math.min(99, base - 4),
          benchmark: 67,
          icon: Users,
          color: 'from-blue-500 to-indigo-600',
          description: 'Assesses verified peer citations, institutional recommendations, and demonstrable leadership footprint.',
          subMetrics: [
            { label: 'Verified Peer Recommendations', value: Math.min(99, base - 1) },
            { label: 'Institutional Trust Score', value: Math.min(99, base - 4) },
            { label: 'Professional Network Authority', value: Math.min(99, base - 3) },
          ],
          recommendation: 'Request two verified peer endorsements from senior colleagues on TalentXcel Network.',
        },
        {
          id: 'professional-evolution',
          title: 'Continuous Evolution & Future Readiness',
          subtitle: 'Learning momentum, emerging methodologies, and modern capability adoption',
          score: Math.min(99, base + 3),
          benchmark: 68,
          icon: BookOpen,
          color: 'from-blue-500 to-indigo-600',
          description: 'Tracks continuous learning velocity, modern tool adoption, and readiness for future industry transformations.',
          subMetrics: [
            { label: '30-Day Learning Momentum', value: Math.min(99, base + 5) },
            { label: 'Modern Methodology Adoption', value: Math.min(99, base + 2) },
            { label: 'Cross-Discipline Agility', value: Math.min(99, base + 3) },
          ],
          recommendation: 'Enroll in an executive continuous learning track to maintain top-tier velocity.',
        },
      ];
  }
}

/**
 * Returns verification checklist items tailored to the user's industry
 */
export function getIndustrySyncDetails(industryId: string) {
  switch (industryId) {
    case 'healthcare':
      return {
        credentialName: 'Medical Licensure & Board Certification',
        credentialStatus: 'Verified by State Medical Board',
        workName: 'Hospital Privileges & Clinical Appointments',
        workStatus: 'Hospital Records Verified',
        portfolioName: 'Clinical Research & Case Publications',
        portfolioStatus: 'Peer-Reviewed Index Synchronized',
      };
    case 'finance':
      return {
        credentialName: 'Chartered Licensure (CPA, CFA, FINRA)',
        credentialStatus: 'Verified Regulatory Standing',
        workName: 'Banking & Fund Management History',
        workStatus: 'Verified Employment & Mandates',
        portfolioName: 'Audit & Deal Attribution Ledger',
        portfolioStatus: 'Audited Track Record Synced',
      };
    case 'legal':
      return {
        credentialName: 'Bar Admissions & Judicial Licensure',
        credentialStatus: 'Verified State/National Bar Standing',
        workName: 'Law Firm & Corporate Counsel History',
        workStatus: 'Verified Practice Records',
        portfolioName: 'Precedent Briefs & Case Filings',
        portfolioStatus: 'Public Legal Registry Verified',
      };
    case 'engineering':
      return {
        credentialName: 'Professional Engineer (PE) / Chartered Status',
        credentialStatus: 'Verified Engineering Board',
        workName: 'Project Delivery & Infrastructure Engineering',
        workStatus: 'Verified Employer Records',
        portfolioName: 'CAD/BIM Project Portfolio & Patents',
        portfolioStatus: 'Verified Project Evidence Synced',
      };
    case 'operations':
      return {
        credentialName: 'CSCP / Lean Six Sigma Master Black Belt',
        credentialStatus: 'Verified Certification Registry',
        workName: 'Supply Network & Plant Management History',
        workStatus: 'Verified Leadership Records',
        portfolioName: 'Logistics Throughput & Operational Audits',
        portfolioStatus: 'Verified Operational Scorecard',
      };
    default:
      return {
        credentialName: 'Professional Licensure & Academic Degrees',
        credentialStatus: 'Verified University & Credential Registry',
        workName: 'Executive Experience & Work History',
        workStatus: 'Verified Employment Tenure',
        portfolioName: 'Portfolio Projects & Proof of Work',
        portfolioStatus: 'Verified Artifacts & Case Studies Synced',
      };
  }
}
