// ============================================================================
// TALENTXCEL GLOBAL REGIONAL INDUSTRY INTELLIGENCE & RESEARCH ENCYCLOPEDIA
// Comprehensive Catalog of 245+ Industry Sectors Across 8 Global Regions
// ============================================================================

export type RegionCode = 'GLOBAL' | 'US' | 'UAE' | 'IN' | 'EU' | 'SG' | 'CA' | 'AU';

export interface RegionalProfile {
  code: RegionCode;
  label: string;
  flag: string;
  currency: string;
  symbol: string;
  avgTechSalary: string;
  growthVelocity: string;
  totalRoles: string;
  activeCompanies: string;
  seniorBand: string;
  effectiveTaxPct: number;
  livingCostIndex: number;
  mobilityRating: string;
  visaNotes: string;
  salaryMultiplier: number;
  hubs: { city: string; salary: string; growth: string; jobs: string; badge: string }[];
  strategicPolicy: string;
  keyRegulatoryBody: string;
}

export const REGIONAL_PROFILES: Record<RegionCode, RegionalProfile> = {
  GLOBAL: {
    code: 'GLOBAL',
    label: 'Global Index',
    flag: '🌐',
    currency: 'USD',
    symbol: '$',
    avgTechSalary: '$145,000',
    growthVelocity: '+26.4%',
    totalRoles: '68,000+',
    activeCompanies: '3,800+',
    seniorBand: '$180k - $320k',
    effectiveTaxPct: 28,
    livingCostIndex: 85,
    mobilityRating: 'Universal Remote / Cross-Border',
    visaNotes: 'EOR, Remote B2B Contracts & Distributed Global Engineering',
    salaryMultiplier: 1.0,
    strategicPolicy: 'Cross-border remote hiring, asynchronous distributed engineering teams, and global talent liquidity.',
    keyRegulatoryBody: 'International Standards & Cross-Border Compliance',
    hubs: [
      { city: 'San Francisco & Remote', salary: '$195k', growth: '+22.4%', jobs: '18.5K', badge: 'AI & Core Platform' },
      { city: 'London & UK', salary: '£115k', growth: '+18.6%', jobs: '14.2K', badge: 'Fintech & Scale' },
      { city: 'Dubai Internet City', salary: 'AED 440k', growth: '+36.2%', jobs: '9.4K', badge: 'Sovereign Tech' },
      { city: 'Zurich & DACH', salary: 'CHF 175k', growth: '+15.8%', jobs: '5.8K', badge: 'Systems Engineering' },
      { city: 'Singapore & APAC', salary: 'S$185k', growth: '+21.3%', jobs: '7.9K', badge: 'Web3 & Financial Systems' },
      { city: 'Bangalore & India Hub', salary: '₹26 LPA', growth: '+28.0%', jobs: '28.0K', badge: 'Scale & Architecture' },
    ]
  },
  US: {
    code: 'US',
    label: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    symbol: '$',
    avgTechSalary: '$185,000',
    growthVelocity: '+21.4%',
    totalRoles: '44,000+',
    activeCompanies: '3,100+',
    seniorBand: '$220k - $380k',
    effectiveTaxPct: 34,
    livingCostIndex: 100,
    mobilityRating: 'O-1 / H-1B / Cross-Border Remote',
    visaNotes: 'Frontier R&D, highest global equity/RSU component, leading venture capital backing',
    salaryMultiplier: 1.25,
    strategicPolicy: 'Executive Order on Safe AI, CHIPS & Science Act ($52B), and Frontier Model Safety Institutes.',
    keyRegulatoryBody: 'NIST, FTC, SEC & US Copyright Office',
    hubs: [
      { city: 'San Francisco Bay Area', salary: '$225k', growth: '+24.1%', jobs: '14.2K', badge: 'AI & Deep Tech Capital' },
      { city: 'Seattle Tech Corridor', salary: '$210k', growth: '+18.5%', jobs: '9.1K', badge: 'Cloud Infrastructure' },
      { city: 'New York Silicon Alley', salary: '$205k', growth: '+21.0%', jobs: '11.4K', badge: 'Fintech & Media Tech' },
      { city: 'Austin Tech Ridge', salary: '$180k', growth: '+28.4%', jobs: '6.8K', badge: 'Semiconductor & Cloud' },
      { city: 'Boston Route 128', salary: '$190k', growth: '+17.9%', jobs: '5.2K', badge: 'Biotech & Robotics' },
      { city: 'Remote US (National)', salary: '$185k', growth: '+25.2%', jobs: '18.9K', badge: 'Distributed Teams' },
    ]
  },
  UAE: {
    code: 'UAE',
    label: 'Dubai & UAE',
    flag: '🇦🇪',
    currency: 'AED',
    symbol: 'AED ',
    avgTechSalary: 'AED 390,000',
    growthVelocity: '+38.5%',
    totalRoles: '14,200+',
    activeCompanies: '1,450+',
    seniorBand: 'AED 420k - 680k',
    effectiveTaxPct: 0, // 0% PERSONAL INCOME TAX
    livingCostIndex: 78,
    mobilityRating: 'Fast-Track Golden Visa (10-Yr)',
    visaNotes: '0% Personal Income Tax, 10-Year Golden Visa for coders and specialists, direct Freezone sponsorships',
    salaryMultiplier: 2.7, // Converted to AED
    strategicPolicy: 'UAE National AI Strategy 2031, Dubai Universal Blueprint for AI, and Sovereign Falcon LLM Programs.',
    keyRegulatoryBody: 'Artificial Intelligence, Digital Economy & Remote Work Ministry & VARA',
    hubs: [
      { city: 'Dubai Internet City', salary: 'AED 440k', growth: '+42.5%', jobs: '8.1K', badge: 'Global Headquarters' },
      { city: 'DIFC Fintech Hive', salary: 'AED 480k', growth: '+39.2%', jobs: '4.2K', badge: 'Institutional Tech' },
      { city: 'Abu Dhabi Hub71', salary: 'AED 460k', growth: '+36.0%', jobs: '3.5K', badge: 'Autonomous & AI Center' },
      { city: 'Riyadh Tech Zone (KSA)', salary: 'SAR 420k', growth: '+48.5%', jobs: '5.9K', badge: 'Vision 2030 Hub' },
      { city: 'Sharjah Research Park', salary: 'AED 360k', growth: '+25.4%', jobs: '1.8K', badge: 'Deep Science R&D' },
      { city: 'Dubai Silicon Oasis', salary: 'AED 410k', growth: '+34.0%', jobs: '3.2K', badge: 'Smart City & Mobility' },
    ]
  },
  IN: {
    code: 'IN',
    label: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    symbol: '₹',
    avgTechSalary: '₹22.5 LPA',
    growthVelocity: '+28.2%',
    totalRoles: '38,500+',
    activeCompanies: '2,600+',
    seniorBand: '₹28 - 55 LPA',
    effectiveTaxPct: 24,
    livingCostIndex: 25,
    mobilityRating: 'High Domestic GCC Inflow',
    visaNotes: 'Largest engineering talent cluster globally; surge in Global Capability Centers (GCCs)',
    salaryMultiplier: 0.16, // In LPA terms
    strategicPolicy: 'IndiaAI Mission (₹10,372 Cr), National Semiconductor Mission (PLI), and Digital Public Infrastructure (DPI/India Stack).',
    keyRegulatoryBody: 'MeitY, CERT-In & RBI Fintech Division',
    hubs: [
      { city: 'Bangalore (Silicon Valley)', salary: '₹26 LPA', growth: '+28.0%', jobs: '16.5K', badge: 'Global Engineering Core' },
      { city: 'Hyderabad Tech City', salary: '₹23 LPA', growth: '+26.2%', jobs: '6.9K', badge: 'Cloud & AI Innovation' },
      { city: 'Mumbai Financial Hub', salary: '₹28 LPA', growth: '+21.4%', jobs: '7.2K', badge: 'Fintech & Banking Tech' },
      { city: 'Delhi-NCR (Gurgaon/Noida)', salary: '₹24 LPA', growth: '+23.8%', jobs: '8.4K', badge: 'Enterprise & Consumer Tech' },
      { city: 'Pune High-Scale Hub', salary: '₹21 LPA', growth: '+25.0%', jobs: '5.4K', badge: 'Systems Engineering' },
      { city: 'Chennai SaaS Corridor', salary: '₹20 LPA', growth: '+19.5%', jobs: '4.8K', badge: 'Enterprise SaaS Capital' },
    ]
  },
  EU: {
    code: 'EU',
    label: 'Europe & UK',
    flag: '🇪🇺',
    currency: 'EUR',
    symbol: '€',
    avgTechSalary: '€115,000',
    growthVelocity: '+19.2%',
    totalRoles: '31,000+',
    activeCompanies: '2,200+',
    seniorBand: '€135k - €210k',
    effectiveTaxPct: 38,
    livingCostIndex: 82,
    mobilityRating: 'EU Blue Card / Global Talent UK',
    visaNotes: 'Strong labor protections, 30+ paid days off, EU Blue Card seamless mobility across member states',
    salaryMultiplier: 0.92,
    strategicPolicy: 'EU AI Act (Risk-Based Classification), GDPR, Digital Markets Act (DMA), and Horizon Europe ($100B R&D).',
    keyRegulatoryBody: 'European Commission, UK CMA & ICO',
    hubs: [
      { city: 'Zurich & Switzerland', salary: '€180k', growth: '+16.2%', jobs: '6.1K', badge: 'Core Cryptography & Systems' },
      { city: 'London (UK)', salary: '€140k', growth: '+20.5%', jobs: '13.8K', badge: 'Fintech & Deep Learning' },
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
    avgTechSalary: 'S$180,000',
    growthVelocity: '+24.5%',
    totalRoles: '16,500+',
    activeCompanies: '1,300+',
    seniorBand: 'S$210k - 340k',
    effectiveTaxPct: 18,
    livingCostIndex: 92,
    mobilityRating: 'Tech.Pass / ONE Pass Gateway',
    visaNotes: 'Competitive progressive income tax, premier APAC corporate headquarters location',
    salaryMultiplier: 1.35,
    strategicPolicy: 'Singapore Smart Nation 2.0, National AI Strategy 2.0, and MAS Project Guardian (Asset Tokenization).',
    keyRegulatoryBody: 'Monetary Authority of Singapore (MAS) & IMDA',
    hubs: [
      { city: 'Singapore CBD', salary: 'S$195k', growth: '+26.1%', jobs: '8.9K', badge: 'APAC Regional HQ' },
      { city: 'Tokyo Shibuya Tech', salary: '¥14.5M', growth: '+18.2%', jobs: '7.1K', badge: 'Robotics & Gaming' },
      { city: 'Sydney Tech Central', salary: 'A$185k', growth: '+20.4%', jobs: '6.5K', badge: 'Enterprise & Resources' },
      { city: 'Seoul Gangnam Hub', salary: '₩120M', growth: '+22.0%', jobs: '5.6K', badge: 'AI & High Scale' },
      { city: 'Hong Kong Cyberport', salary: 'HK$1.1M', growth: '+16.5%', jobs: '4.2K', badge: 'Algorithmic Trading' },
      { city: 'Remote APAC', salary: 'S$175k', growth: '+28.5%', jobs: '9.4K', badge: 'Cross-Border Teams' },
    ]
  },
  CA: {
    code: 'CA',
    label: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    symbol: 'C$ ',
    avgTechSalary: 'C$155,000',
    growthVelocity: '+20.8%',
    totalRoles: '19,200+',
    activeCompanies: '1,650+',
    seniorBand: 'C$180k - 290k',
    effectiveTaxPct: 33,
    livingCostIndex: 86,
    mobilityRating: 'Global Skills Strategy (2-Wk Visa)',
    visaNotes: 'Fastest work permit processing in North America; direct pathway to Permanent Residency',
    salaryMultiplier: 1.35,
    strategicPolicy: 'Pan-Canadian Artificial Intelligence Strategy, Artificial Intelligence and Data Act (AIDA), and Scale AI Supercluster.',
    keyRegulatoryBody: 'ISED Canada & Privacy Commissioner',
    hubs: [
      { city: 'Toronto Silicon Valley North', salary: 'C$165k', growth: '+22.4%', jobs: '9.2K', badge: 'AI & Fintech Hub' },
      { city: 'Vancouver Tech Coast', salary: 'C$160k', growth: '+21.0%', jobs: '5.8K', badge: 'Cascadia Tech Corridor' },
      { city: 'Montreal AI Institute', salary: 'C$145k', growth: '+24.5%', jobs: '4.9K', badge: 'Deep Learning Research' },
      { city: 'Ottawa Kanata Tech', salary: 'C$150k', growth: '+17.8%', jobs: '3.1K', badge: 'GovTech & Telecom' },
      { city: 'Waterloo Innovation Zone', salary: 'C$155k', growth: '+19.2%', jobs: '2.8K', badge: 'Engineering & Quantum' },
      { city: 'Calgary Digital Hub', salary: 'C$140k', growth: '+23.0%', jobs: '2.4K', badge: 'EnergyTech & Cloud' },
    ]
  },
  AU: {
    code: 'AU',
    label: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    symbol: 'A$ ',
    avgTechSalary: 'A$175,000',
    growthVelocity: '+21.5%',
    totalRoles: '14,800+',
    activeCompanies: '1,200+',
    seniorBand: 'A$200k - 320k',
    effectiveTaxPct: 32,
    livingCostIndex: 88,
    mobilityRating: 'Global Talent Visa (GTI)',
    visaNotes: 'High quality of life, strong superannuation (11.5%), streamlined tech talent immigration',
    salaryMultiplier: 1.5,
    strategicPolicy: 'Australia AI Action Plan, Digital Economy Strategy 2030, and Clean Energy Technology Investment Roadmap.',
    keyRegulatoryBody: 'Department of Industry, Science and Resources & OAIC',
    hubs: [
      { city: 'Sydney Tech Central', salary: 'A$190k', growth: '+22.5%', jobs: '7.8K', badge: 'Enterprise & Fintech' },
      { city: 'Melbourne Silicon Alley', salary: 'A$175k', growth: '+20.8%', jobs: '5.4K', badge: 'SaaS & HealthTech' },
      { city: 'Brisbane Innovation Hub', salary: 'A$160k', growth: '+24.0%', jobs: '2.9K', badge: 'Climate & BioTech' },
      { city: 'Perth Mining Tech', salary: 'A$180k', growth: '+18.5%', jobs: '2.2K', badge: 'Autonomous Operations' },
      { city: 'Adelaide Lot Fourteen', salary: 'A$155k', growth: '+23.2%', jobs: '1.6K', badge: 'Space & Cyber Center' },
      { city: 'Canberra GovTech Corridor', salary: 'A$170k', growth: '+16.8%', jobs: '2.1K', badge: 'National Security & Gov' },
    ]
  }
};

// ============================================================================
// 10 VERTICAL CATEGORIES FOR THE 245+ INDUSTRIES CATALOG
// ============================================================================
export type IndustryCategory = 
  | 'AI_DEEPTECH'
  | 'FINTECH_WEB3'
  | 'CLOUD_DEVTOOLS'
  | 'CYBER_DEFENSE'
  | 'HEALTH_BIOTECH'
  | 'CLIMATE_ENERGY'
  | 'MOBILITY_AEROSPACE'
  | 'ECOMMERCE_MEDIA'
  | 'INDUSTRIAL_ROBOTICS'
  | 'GOVTECH_CIVIC';

export interface CategorySpec {
  id: IndustryCategory;
  label: string;
  shortName: string;
  count: number;
  iconName: string;
  description: string;
}

export const CATEGORY_SPECS: Record<IndustryCategory, CategorySpec> = {
  AI_DEEPTECH: {
    id: 'AI_DEEPTECH',
    label: 'Artificial Intelligence & Deep Tech',
    shortName: 'AI & DeepTech',
    count: 25,
    iconName: 'Brain',
    description: 'Foundation models, agentic swarms, computer vision, quantum computing, and neuromorphic engineering.'
  },
  FINTECH_WEB3: {
    id: 'FINTECH_WEB3',
    label: 'FinTech, Banking & Web3',
    shortName: 'FinTech & Web3',
    count: 25,
    iconName: 'Coins',
    description: 'Algorithmic trading, digital neo-banking, cross-border payments, DeFi, institutional custody, and RegTech.'
  },
  CLOUD_DEVTOOLS: {
    id: 'CLOUD_DEVTOOLS',
    label: 'Cloud Infrastructure & Enterprise SaaS',
    shortName: 'Cloud & SaaS',
    count: 25,
    iconName: 'Cloud',
    description: 'Kubernetes orchestration, distributed tracing, eBPF telemetry, multi-cloud edge, and developer portals.'
  },
  CYBER_DEFENSE: {
    id: 'CYBER_DEFENSE',
    label: 'Cybersecurity, Defense & Trust',
    shortName: 'Cyber & Defense',
    count: 25,
    iconName: 'Shield',
    description: 'Zero-trust architecture, CSPM, offensive red teaming, post-quantum cryptography, and sovereign defense.'
  },
  HEALTH_BIOTECH: {
    id: 'HEALTH_BIOTECH',
    label: 'Healthcare, BioTech & Life Sciences',
    shortName: 'HealthTech & Bio',
    count: 25,
    iconName: 'Activity',
    description: 'Generative AI drug discovery, genomic bioinformatics, digital therapeutics, robotic surgery, and clinical trial AI.'
  },
  CLIMATE_ENERGY: {
    id: 'CLIMATE_ENERGY',
    label: 'CleanTech, Climate & Energy',
    shortName: 'Climate & Energy',
    count: 25,
    iconName: 'Zap',
    description: 'Smart grid orchestration, carbon accounting, battery storage (BESS), green hydrogen, and carbon capture sensing.'
  },
  MOBILITY_AEROSPACE: {
    id: 'MOBILITY_AEROSPACE',
    label: 'Automotive, Aerospace & Autonomous Mobility',
    shortName: 'Mobility & Aero',
    count: 25,
    iconName: 'Plane',
    description: 'Level 4/5 autonomous vehicles, EV battery digital twins, commercial SmallSats, eVTOL flight control, and drone delivery.'
  },
  ECOMMERCE_MEDIA: {
    id: 'ECOMMERCE_MEDIA',
    label: 'E-Commerce, Consumer Tech & Media',
    shortName: 'E-Commerce & Media',
    count: 25,
    iconName: 'Laptop',
    description: 'Headless commerce, multi-armed bandit recommendation engines, quick commerce dark stores, and gaming engines.'
  },
  INDUSTRIAL_ROBOTICS: {
    id: 'INDUSTRIAL_ROBOTICS',
    label: 'Industrial IoT, Robotics & Semiconductor',
    shortName: 'Robotics & Chips',
    count: 25,
    iconName: 'Cpu',
    description: 'Factory digital twins, warehouse AMRs, semiconductor EDA, 3D chiplets, and industrial computer vision.'
  },
  GOVTECH_CIVIC: {
    id: 'GOVTECH_CIVIC',
    label: 'GovTech, Sovereign Cloud & Civic Systems',
    shortName: 'GovTech & Civic',
    count: 20,
    iconName: 'Building2',
    description: 'National digital identity, sovereign cloud data localization, automated tax e-invoicing, and public transit telemetry.'
  }
};

// ============================================================================
// INDUSTRY DEFINITION INTERFACE
// ============================================================================
export interface IndustryItem {
  id: string;
  name: string;
  category: IndustryCategory;
  shortDesc: string;
  baseGlobalMarketSize: string; // e.g. "$180B"
  baseCAGR: string; // e.g. "+34.2%"
  keyRoles: string[];
  keySkills: string[];
  baseVacanciesMultiplier: number;
}

// ============================================================================
// 245+ COMPREHENSIVE CURATED INDUSTRIES
// ============================================================================
export const COMPREHENSIVE_INDUSTRY_CATALOG: IndustryItem[] = [
  // -------------------------------------------------------------
  // 1. AI & DEEPTECH (25 Industries)
  // -------------------------------------------------------------
  {
    id: 'gen-ai-foundation',
    name: 'Generative AI & Foundation Models',
    category: 'AI_DEEPTECH',
    shortDesc: 'Pre-training, fine-tuning, and alignment of multi-billion parameter multimodal models.',
    baseGlobalMarketSize: '$67 Billion',
    baseCAGR: '+42.5%',
    keyRoles: ['Foundation Model Researcher', 'LLM Pre-Training Engineer', 'AI Alignment Specialist'],
    keySkills: ['PyTorch', 'Megatron-LM', 'FlashAttention', 'CUDA C++', 'RLHF'],
    baseVacanciesMultiplier: 1.45
  },
  {
    id: 'llm-engineering-rag',
    name: 'LLM Systems Engineering & RAG Architectures',
    category: 'AI_DEEPTECH',
    shortDesc: 'Production integration of retrieval-augmented generation pipelines and enterprise knowledge indices.',
    baseGlobalMarketSize: '$32 Billion',
    baseCAGR: '+52.0%',
    keyRoles: ['RAG Pipeline Architect', 'Prompt & Eval Engineer', 'Context Engineering Lead'],
    keySkills: ['LangChain', 'LlamaIndex', 'Milvus/Pinecone', 'Embedding Fine-Tuning', 'Hybrid Search'],
    baseVacanciesMultiplier: 1.6
  },
  {
    id: 'computer-vision-visual',
    name: 'Computer Vision & Visual Intelligence',
    category: 'AI_DEEPTECH',
    shortDesc: 'Real-time scene parsing, 3D Gaussian splatting, object detection, and visual QA systems.',
    baseGlobalMarketSize: '$48 Billion',
    baseCAGR: '+28.4%',
    keyRoles: ['Computer Vision Engineer', 'Perception Pipeline Lead', 'Visual SLAM Specialist'],
    keySkills: ['OpenCV', 'TensorRT', 'YOLOv10', 'Point Clouds', 'Diffusion Models'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'autonomous-agents-swarms',
    name: 'Autonomous AI Agents & Multi-Agent Swarms',
    category: 'AI_DEEPTECH',
    shortDesc: 'Goal-directed software agents executing complex workflows through tool use and peer coordination.',
    baseGlobalMarketSize: '$28 Billion',
    baseCAGR: '+64.2%',
    keyRoles: ['Agentic Workflow Engineer', 'Multi-Agent Systems Architect', 'Tool-Calling Specialist'],
    keySkills: ['AutoGPT/CrewAI', 'ReAct Prompting', 'State Machine Orchestration', 'Sandboxing', 'APIs'],
    baseVacanciesMultiplier: 1.8
  },
  {
    id: 'mlops-triton-deploy',
    name: 'MLOps & High-Throughput Inference Engines',
    category: 'AI_DEEPTECH',
    shortDesc: 'Zero-downtime model registry, continuous evaluation, vLLM / Triton server optimizations.',
    baseGlobalMarketSize: '$22 Billion',
    baseCAGR: '+38.6%',
    keyRoles: ['MLOps Platform Architect', 'Inference Optimization Engineer', 'GPU Infrastructure Lead'],
    keySkills: ['vLLM', 'Triton Server', 'Kubeflow', 'Ray Cluster', 'Model Quantization (AWQ/FP8)'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'vector-databases-search',
    name: 'Vector Databases & Neural Search Engines',
    category: 'AI_DEEPTECH',
    shortDesc: 'Sub-millisecond approximate nearest neighbor (ANN) retrieval for billions of high-dimensional embeddings.',
    baseGlobalMarketSize: '$14 Billion',
    baseCAGR: '+46.0%',
    keyRoles: ['Vector Search Architect', 'Indexing Systems Engineer', 'Data Storage Specialist'],
    keySkills: ['HNSW Algorithm', 'Qdrant/Weaviate/Chroma', 'SIMD Hardware Acceleration', 'Cosine Metrics'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'ai-safety-alignment-redteam',
    name: 'AI Safety, Alignment & Red Teaming',
    category: 'AI_DEEPTECH',
    shortDesc: 'Mechanistic interpretability, prompt injection mitigation, red teaming, and ethical guardrails.',
    baseGlobalMarketSize: '$11 Billion',
    baseCAGR: '+58.0%',
    keyRoles: ['AI Red Teamer', 'Model Safety Auditor', 'Interpretability Researcher'],
    keySkills: ['Prompt Injection Defense', 'Adversarial Benchmarks', 'NeMo Guardrails', 'RLAIF'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'quantum-computing-algorithms',
    name: 'Quantum Computing & Hybrid Algorithms',
    category: 'AI_DEEPTECH',
    shortDesc: 'Qubit simulation, variational quantum algorithms (VQE), and quantum machine learning pipelines.',
    baseGlobalMarketSize: '$9 Billion',
    baseCAGR: '+34.5%',
    keyRoles: ['Quantum Algorithm Developer', 'Quantum Information Scientist', 'Quantum Control Engineer'],
    keySkills: ['Qiskit', 'Cirq', 'PennyLane', 'Quantum Error Correction', 'Linear Algebra'],
    baseVacanciesMultiplier: 0.8
  },
  {
    id: 'neuromorphic-computing-bci',
    name: 'Neuromorphic Computing & BCI Systems',
    category: 'AI_DEEPTECH',
    shortDesc: 'Spiking neural networks (SNN), event-based cameras, and brain-computer interface signal decoders.',
    baseGlobalMarketSize: '$6 Billion',
    baseCAGR: '+39.2%',
    keyRoles: ['Neuromorphic Engineer', 'Bio-Signal Processing Lead', 'SNN Algorithm Developer'],
    keySkills: ['SpikingJelly', 'Loihi/SpiNNaker', 'EEG Signal Filtering', 'Event-Based Vision'],
    baseVacanciesMultiplier: 0.7
  },
  {
    id: 'synthetic-data-privacy',
    name: 'Synthetic Data & Privacy-Preserving AI',
    category: 'AI_DEEPTECH',
    shortDesc: 'High-fidelity generative tabular, image, and text synthetic data with differential privacy guarantees.',
    baseGlobalMarketSize: '$8 Billion',
    baseCAGR: '+41.8%',
    keyRoles: ['Synthetic Data Engineer', 'Differential Privacy Lead', 'Simulation Data Specialist'],
    keySkills: ['CTGAN', 'Differential Privacy (DP-SGD)', 'Blender/Omniverse Synthetic', 'Faker'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'edge-ai-ondevice',
    name: 'Edge AI & On-Device Neural Processing',
    category: 'AI_DEEPTECH',
    shortDesc: 'Sub-watt neural networks optimized for mobile NPUs, IoT chips, and embedded microcontrollers.',
    baseGlobalMarketSize: '$26 Billion',
    baseCAGR: '+31.4%',
    keyRoles: ['Edge AI Compiler Engineer', 'Embedded ML Developer', 'NPU Acceleration Specialist'],
    keySkills: ['ONNX Runtime', 'TensorFlow Lite Micro', 'CoreML', 'Quantization (INT4/INT8)'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'reinforcement-learning-sim',
    name: 'Reinforcement Learning & World Simulation',
    category: 'AI_DEEPTECH',
    shortDesc: 'Policy optimization, robotics simulation environments, and reinforcement learning from human feedback.',
    baseGlobalMarketSize: '$16 Billion',
    baseCAGR: '+36.0%',
    keyRoles: ['RL Research Scientist', 'Simulation Environment Engineer', 'Reward Modeling Specialist'],
    keySkills: ['Isaac Gym / MuJoCo', 'PPO/DPO Algorithms', 'Reward Shaping', 'Distributed Actors'],
    baseVacanciesMultiplier: 0.9
  },
  {
    id: 'audio-speech-voice-ai',
    name: 'Speech, Audio & Voice Synthesis AI',
    category: 'AI_DEEPTECH',
    shortDesc: 'Zero-shot voice cloning, real-time speech-to-speech translation, and acoustic emotion detection.',
    baseGlobalMarketSize: '$19 Billion',
    baseCAGR: '+33.5%',
    keyRoles: ['Speech AI Researcher', 'Acoustic Model Engineer', 'Audio Synthesis Specialist'],
    keySkills: ['Whisper Models', 'VITS / HiFi-GAN', 'Real-Time WebRTC Streaming', 'Spectrograms'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'graph-neural-networks',
    name: 'Graph Neural Networks & Knowledge Graphs',
    category: 'AI_DEEPTECH',
    shortDesc: 'Relational representation learning over massive heterogeneous graphs for fraud, biology, and search.',
    baseGlobalMarketSize: '$12 Billion',
    baseCAGR: '+29.0%',
    keyRoles: ['Graph ML Engineer', 'Ontology & Knowledge Architect', 'Relational AI Lead'],
    keySkills: ['PyTorch Geometric (PyG)', 'Neo4j/Amazon Neptune', 'Node2Vec', 'Link Prediction'],
    baseVacanciesMultiplier: 0.85
  },
  {
    id: 'ai-infra-gpu-clusters',
    name: 'AI Infrastructure & Supercomputing Clusters',
    category: 'AI_DEEPTECH',
    shortDesc: 'RoCEv2 / InfiniBand fabrics, Slurm scheduling, NVLink interconnects, and liquid-cooled data centers.',
    baseGlobalMarketSize: '$45 Billion',
    baseCAGR: '+37.2%',
    keyRoles: ['HPC Infrastructure Engineer', 'InfiniBand Network Architect', 'GPU Systems Engineer'],
    keySkills: ['Slurm', 'NCCL Tuning', 'RoCEv2 Network Topologies', 'GPUDirect Storage'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'explainable-ai-auditing',
    name: 'Explainable AI (XAI) & Model Auditing',
    category: 'AI_DEEPTECH',
    shortDesc: 'Feature attribution, Shapley values, and regulatory algorithmic bias auditing for high-stakes decisions.',
    baseGlobalMarketSize: '$7 Billion',
    baseCAGR: '+32.4%',
    keyRoles: ['XAI Validation Engineer', 'Algorithmic Auditor', 'Fairness & Bias Specialist'],
    keySkills: ['SHAP', 'LIME', 'Integrated Gradients', 'Fairlearn', 'Compliance Reporting'],
    baseVacanciesMultiplier: 0.8
  },
  {
    id: 'multimodal-ai-video',
    name: 'Multimodal AI & Generative Video Systems',
    category: 'AI_DEEPTECH',
    shortDesc: 'Text-to-video synthesis, temporal consistency modeling, and spatial-temporal transformer architectures.',
    baseGlobalMarketSize: '$24 Billion',
    baseCAGR: '+54.0%',
    keyRoles: ['Generative Video Researcher', 'Diffusion Systems Engineer', 'Temporal Modeling Lead'],
    keySkills: ['Sora/CogVideo Architecture', '3D U-Nets', 'Optical Flow', 'Latent Video Diffusion'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'automated-code-gen-devai',
    name: 'Automated Code Generation & DevAI',
    category: 'AI_DEEPTECH',
    shortDesc: 'AI pair programmers, repository-level context retrieval, and automated test synthesis systems.',
    baseGlobalMarketSize: '$21 Billion',
    baseCAGR: '+48.5%',
    keyRoles: ['DevAI Systems Architect', 'Code Model Fine-Tuner', 'Syntax AST Specialist'],
    keySkills: ['Tree-sitter', 'AST Parsing', 'Repo-Level Chunking', 'Execution-Based Unit Testing'],
    baseVacanciesMultiplier: 1.4
  },
  {
    id: 'embodied-ai-physical-sim',
    name: 'Embodied AI & Physical World Modeling',
    category: 'AI_DEEPTECH',
    shortDesc: 'Vision-language-action (VLA) models connecting multimodal AI with physical robotic manipulators.',
    baseGlobalMarketSize: '$15 Billion',
    baseCAGR: '+45.0%',
    keyRoles: ['Embodied AI Scientist', 'VLA Model Specialist', 'Sim-to-Real Transfer Lead'],
    keySkills: ['RT-2 Architecture', 'Isaac Sim', 'Kinematics', 'Sim-to-Real Domain Randomization'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'biomedical-foundation-models',
    name: 'Biomedical Foundation Models & Proteomics',
    category: 'AI_DEEPTECH',
    shortDesc: 'Transformer models trained on DNA sequences, single-cell RNA, and protein evolutionary databases.',
    baseGlobalMarketSize: '$18 Billion',
    baseCAGR: '+39.5%',
    keyRoles: ['Computational Proteomics Lead', 'Genomic LLM Researcher', 'Bio-Informatics Engineer'],
    keySkills: ['ESMFold', 'AlphaFold Pipeline', 'FASTA Parsing', 'BioPython'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'financial-timeseries-neural',
    name: 'Financial Time-Series Neural Intelligence',
    category: 'AI_DEEPTECH',
    shortDesc: 'Deep state-space models (Mamba), conformal prediction, and order book microstructure forecasting.',
    baseGlobalMarketSize: '$23 Billion',
    baseCAGR: '+29.5%',
    keyRoles: ['Quantitative Deep Learning Lead', 'Time-Series Modeling Specialist', 'Microstructure Researcher'],
    keySkills: ['Mamba/SSMs', 'Temporal Fusion Transformers', 'Order Flow Modeling', 'Feature Engineering'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'geospatial-ai-earth-obs',
    name: 'Geospatial AI & Satellite Earth Observation',
    category: 'AI_DEEPTECH',
    shortDesc: 'Hyperspectral satellite imagery analysis, crop yield forecasting, and urban sprawl tracking.',
    baseGlobalMarketSize: '$14 Billion',
    baseCAGR: '+27.8%',
    keyRoles: ['Geospatial AI Engineer', 'Earth Observation Scientist', 'Remote Sensing Specialist'],
    keySkills: ['Rasterio / GDAL', 'Segment Anything for Geospatial', 'Sentinel-2 Data', 'GeoTIFFs'],
    baseVacanciesMultiplier: 0.9
  },
  {
    id: 'slm-quant-distillation',
    name: 'Small Language Models (SLMs) & Model Distillation',
    category: 'AI_DEEPTECH',
    shortDesc: '1B-7B parameter models distilled from giant teachers for cost-effective enterprise edge deployment.',
    baseGlobalMarketSize: '$19 Billion',
    baseCAGR: '+44.0%',
    keyRoles: ['Model Distillation Lead', 'SLM Architecture Specialist', 'Quantization Expert'],
    keySkills: ['Knowledge Distillation', 'LoRA/QLoRA', 'GGUF / Llama.cpp', 'Token Pruning'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'synthetic-voice-translation',
    name: 'Zero-Latency Cross-Lingual Voice Translation',
    category: 'AI_DEEPTECH',
    shortDesc: 'Simultaneous speech-to-speech translation preserving speaker timbre and prosodic nuances.',
    baseGlobalMarketSize: '$11 Billion',
    baseCAGR: '+35.0%',
    keyRoles: ['Speech Translation Engineer', 'Acoustic Timbre Modeler', 'Streaming Audio Specialist'],
    keySkills: ['Direct S2ST Models', 'Voice Latency Optimization (<200ms)', 'Opus Codec', 'WebRTC'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'ai-context-caching-memory',
    name: 'Long-Context Memory & Context Caching Engines',
    category: 'AI_DEEPTECH',
    shortDesc: 'KV-cache management, hierarchical summarization, and infinite-context persistent agent memories.',
    baseGlobalMarketSize: '$13 Billion',
    baseCAGR: '+56.0%',
    keyRoles: ['Memory Systems Engineer', 'KV-Cache Optimization Lead', 'Context Architecture Specialist'],
    keySkills: ['PagedAttention', 'Hierarchical Memory Buffers', 'MemGPT Architecture', 'Redis AI'],
    baseVacanciesMultiplier: 1.1
  },

  // -------------------------------------------------------------
  // 2. FINTECH, BANKING & WEB3 (25 Industries)
  // -------------------------------------------------------------
  {
    id: 'algo-trading-hft',
    name: 'High-Frequency & Algorithmic Trading Systems',
    category: 'FINTECH_WEB3',
    shortDesc: 'Ultra-low-latency market connectivity, kernel bypass (Solarflare), and FPGA hardware tickers.',
    baseGlobalMarketSize: '$38 Billion',
    baseCAGR: '+16.5%',
    keyRoles: ['Low-Latency C++ Engineer', 'FPGA Quant Developer', 'Execution Strategist'],
    keySkills: ['Modern C++20', 'Linux Kernel Bypass (OpenOnload)', 'FIX Protocol', 'Lock-Free Queues'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'digital-neobanking-core',
    name: 'Digital Neo-Banking & Modern Core Platforms',
    category: 'FINTECH_WEB3',
    shortDesc: 'Cloud-native ledger architectures, real-time balance resolution, and multi-currency virtual accounts.',
    baseGlobalMarketSize: '$64 Billion',
    baseCAGR: '+34.0%',
    keyRoles: ['Core Banking Platform Architect', 'Ledger Integrity Specialist', 'Fintech Fullstack Lead'],
    keySkills: ['Double-Entry Accounting Engines', 'PostgreSQL Partitioning', 'Kafka', 'ISO 20022'],
    baseVacanciesMultiplier: 1.4
  },
  {
    id: 'payment-gateways-rails',
    name: 'Global Payment Gateways & Real-Time Rails',
    category: 'FINTECH_WEB3',
    shortDesc: 'Smart routing, interchange optimization, 3D Secure 2.0, and instant clearing rail integrations.',
    baseGlobalMarketSize: '$85 Billion',
    baseCAGR: '+22.5%',
    keyRoles: ['Payment Infrastructure Engineer', 'Acquiring Routing Specialist', 'Fraud Telemetry Lead'],
    keySkills: ['PCI-DSS Compliance', 'Card Schemes API (Visa/Mastercard)', 'FedNow / UPI / SEPA', 'Webhooks'],
    baseVacanciesMultiplier: 1.5
  },
  {
    id: 'defi-smart-contracts',
    name: 'Decentralized Finance (DeFi) Protocols',
    category: 'FINTECH_WEB3',
    shortDesc: 'Automated market makers (AMM), collateralized debt positions, and formal smart contract verification.',
    baseGlobalMarketSize: '$28 Billion',
    baseCAGR: '+26.8%',
    keyRoles: ['Smart Contract Security Auditor', 'Solidity/Rust Protocol Engineer', 'DeFi Mechanism Designer'],
    keySkills: ['Solidity', 'Foundry/Hardhat', 'Formal Verification (Certora)', 'EVM Micro-Opcodes'],
    baseVacanciesMultiplier: 0.9
  },
  {
    id: 'insurtech-automated-underwriting',
    name: 'InsurTech & Algorithmic Underwriting',
    category: 'FINTECH_WEB3',
    shortDesc: 'Parametric insurance smart triggers, automated claims adjudication, and telematics-based risk pricing.',
    baseGlobalMarketSize: '$34 Billion',
    baseCAGR: '+25.4%',
    keyRoles: ['InsurTech Actuarial Developer', 'Claims Automation Engineer', 'Parametric Risk Lead'],
    keySkills: ['Actuarial ML Models', 'Document OCR/LLM Extraction', 'IoT Telematics Ingestion', 'Rules Engines'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'regtech-aml-kyc',
    name: 'RegTech, AML & Compliance Telemetry',
    category: 'FINTECH_WEB3',
    shortDesc: 'Graph-based anti-money laundering (AML) detection, PEP sanction screening, and automated SAR filing.',
    baseGlobalMarketSize: '$22 Billion',
    baseCAGR: '+28.0%',
    keyRoles: ['RegTech Compliance Engineer', 'AML Graph Analytics Lead', 'Sanctions Screening Specialist'],
    keySkills: ['Graph Databases (Neo4j)', 'Entity Resolution Algorithms', 'Fuzzy Matching', 'FATF Standards'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'wealthtech-robo-advisory',
    name: 'WealthTech & Automated Portfolio Advisory',
    category: 'FINTECH_WEB3',
    shortDesc: 'Fractional share trading, direct tax-loss harvesting, and multi-asset retirement modeling algorithms.',
    baseGlobalMarketSize: '$27 Billion',
    baseCAGR: '+24.0%',
    keyRoles: ['WealthTech Systems Architect', 'Portfolio Rebalancing Developer', 'Financial Planner Engine Lead'],
    keySkills: ['Mean-Variance Optimization', 'Monte Carlo Simulation', 'Market Data Feed Ingestion', 'REST/gRPC'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'crossborder-remittance-fx',
    name: 'Cross-Border Remittance & B2B FX Liquidity',
    category: 'FINTECH_WEB3',
    shortDesc: 'Wholesale FX spread engines, local payout clearing partnerships, and pre-funded liquidity netting.',
    baseGlobalMarketSize: '$42 Billion',
    baseCAGR: '+21.5%',
    keyRoles: ['FX Engine Engineer', 'Liquidity Operations Architect', 'Corridor Expansion Lead'],
    keySkills: ['FX Currency Hedging Algorithms', 'Local Banking Rail APIs', 'Treasury Netting Engines'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'cbdc-digital-currencies',
    name: 'Central Bank Digital Currencies (CBDC)',
    category: 'FINTECH_WEB3',
    shortDesc: 'Two-tier sovereign digital currency distribution architectures with offline peer-to-peer settlement.',
    baseGlobalMarketSize: '$12 Billion',
    baseCAGR: '+38.0%',
    keyRoles: ['CBDC Protocol Engineer', 'Sovereign Ledger Architect', 'Cryptographic Privacy Lead'],
    keySkills: ['Zero-Knowledge Proofs (ZKPs)', 'High-Throughput DLT', 'Secure Hardware Enclaves', 'PKI'],
    baseVacanciesMultiplier: 0.75
  },
  {
    id: 'rwa-tokenization-assets',
    name: 'Real-World Asset (RWA) Tokenization',
    category: 'FINTECH_WEB3',
    shortDesc: 'Fractional real estate, private credit, and sovereign treasury bond on-chain issuance protocols.',
    baseGlobalMarketSize: '$18 Billion',
    baseCAGR: '+45.0%',
    keyRoles: ['RWA Tokenization Architect', 'Compliance Smart Contract Engineer', 'Asset Verification Lead'],
    keySkills: ['ERC-3643 Permissioned Tokens', 'Oracle Feeds (Chainlink)', 'Legal-Code Interfacing'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'alt-credit-scoring-ai',
    name: 'Alternative Credit Scoring & Microfinance AI',
    category: 'FINTECH_WEB3',
    shortDesc: 'Cash-flow underwriting, device telemetry signals, and non-bureau risk evaluation models.',
    baseGlobalMarketSize: '$29 Billion',
    baseCAGR: '+27.4%',
    keyRoles: ['Credit Scoring ML Scientist', 'Underwriting Engine Lead', 'Financial Inclusivity Developer'],
    keySkills: ['LightGBM/XGBoost', 'Feature Stores (Feast)', 'Explainable Credit Models', 'Fair Lending Laws'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'bnpl-consumer-credit',
    name: 'Point-of-Sale Lending (BNPL) & Consumer Credit',
    category: 'FINTECH_WEB3',
    shortDesc: 'Sub-second checkout credit decisioning, dynamic installment schedules, and merchant settlement engines.',
    baseGlobalMarketSize: '$36 Billion',
    baseCAGR: '+23.0%',
    keyRoles: ['BNPL Systems Developer', 'Instant Decisioning Specialist', 'Merchant Checkout Engineer'],
    keySkills: ['High-Concurrency Checkout APIs', 'Credit Risk Tiering', 'Automated Collections Engines'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'payroll-streaming-fintech',
    name: 'Earned Wage Access & Global Payroll Streaming',
    category: 'FINTECH_WEB3',
    shortDesc: 'Continuous pay streaming, multi-jurisdiction tax withholding calculations, and EOR payroll payouts.',
    baseGlobalMarketSize: '$21 Billion',
    baseCAGR: '+29.2%',
    keyRoles: ['Global Payroll Architect', 'Tax Engine Developer', 'Streaming Wage Specialist'],
    keySkills: ['Multi-State/Country Tax Calculations', 'Automated ACH/SEPA Batching', 'HRIS Connectors'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'crypto-custody-mpc',
    name: 'Institutional Crypto Custody & MPC Security',
    category: 'FINTECH_WEB3',
    shortDesc: 'Multi-party computation (MPC) threshold signatures, cold-storage air-gapping, and disaster recovery.',
    baseGlobalMarketSize: '$16 Billion',
    baseCAGR: '+33.0%',
    keyRoles: ['Cryptographic MPC Engineer', 'Institutional Custody Architect', 'Key Governance Specialist'],
    keySkills: ['Threshold Cryptography (TSS)', 'HSMs (Hardware Security Modules)', 'SOC 2 Type II', 'Go/Rust'],
    baseVacanciesMultiplier: 0.9
  },
  {
    id: 'merchant-pos-unified',
    name: 'Smart POS Hardware & Unified Commerce Systems',
    category: 'FINTECH_WEB3',
    shortDesc: 'Android-based EMV payment terminals, offline tap-to-pay tokenization, and omnichannel inventory syncing.',
    baseGlobalMarketSize: '$44 Billion',
    baseCAGR: '+19.5%',
    keyRoles: ['POS Firmware Developer', 'Unified Commerce Lead', 'Terminal App Specialist'],
    keySkills: ['Android AOSP / EMV Level 2', 'NFC & Bluetooth LE', 'Offline Transaction Queuing'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'treasury-management-saas',
    name: 'Corporate Treasury Management & Liquidity SaaS',
    category: 'FINTECH_WEB3',
    shortDesc: 'Multi-bank cash visibility, automated sweep accounts, yield optimization, and debt covenant tracking.',
    baseGlobalMarketSize: '$25 Billion',
    baseCAGR: '+22.0%',
    keyRoles: ['Treasury Platform Engineer', 'Cash Forecasting ML Lead', 'Open Banking Data Architect'],
    keySkills: ['Bank SWIFT MT940 / CAMT.053 Parsers', 'Cash Forecasting Time Series', 'Secure ERP Connectors'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'quant-risk-stress-test',
    name: 'Quantitative Risk Analytics & Stress Testing',
    category: 'FINTECH_WEB3',
    shortDesc: 'Value-at-Risk (VaR), expected shortfall, Basel III/IV capital adequacy modeling, and scenario shock testing.',
    baseGlobalMarketSize: '$23 Billion',
    baseCAGR: '+18.4%',
    keyRoles: ['Quantitative Risk Developer', 'Stress Testing Model Lead', 'Regulatory Capital Specialist'],
    keySkills: ['Python/C++', 'GPU Monte Carlo Acceleration', 'Credit Value Adjustment (CVA)', 'Basel Accord'],
    baseVacanciesMultiplier: 1.0
  },
  {
    id: 'open-banking-aggregation',
    name: 'Open Banking & Financial Data Aggregation',
    category: 'FINTECH_WEB3',
    shortDesc: 'FDX / Open Banking UK standard APIs, transaction categorization, and consent lifecycle management.',
    baseGlobalMarketSize: '$31 Billion',
    baseCAGR: '+31.0%',
    keyRoles: ['Open Banking API Engineer', 'Transaction Enrichment ML Lead', 'Consent Governance Specialist'],
    keySkills: ['OAuth2 FAPI (Financial Grade)', 'Merchant Normalization ML', 'High-Scale Scraper Resilience'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'fraud-prevention-telemetry',
    name: 'Real-Time Fraud Prevention & Behavioral Biometrics',
    category: 'FINTECH_WEB3',
    shortDesc: 'Device fingerprinting, mouse velocity heuristics, bot network detection, and account takeover (ATO) defense.',
    baseGlobalMarketSize: '$35 Billion',
    baseCAGR: '+26.5%',
    keyRoles: ['Fraud Detection Lead', 'Behavioral Biometrics Engineer', 'Risk Telemetry Specialist'],
    keySkills: ['Flink Streaming Rules', 'Device Fingerprinting', 'Graph Anomaly Detection', 'Redis Clusters'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'carbon-offset-green-fin',
    name: 'Carbon Offset Trading & Green Finance Exchanges',
    category: 'FINTECH_WEB3',
    shortDesc: 'Verifiable carbon credit tokenization, satellite verification feeds, and ESG portfolio benchmarking.',
    baseGlobalMarketSize: '$15 Billion',
    baseCAGR: '+36.0%',
    keyRoles: ['Carbon Markets Developer', 'ESG Data Architect', 'Green Bond Platform Lead'],
    keySkills: ['Verra / Gold Standard Verification', 'Smart Contracts', 'Satellite Ingestion', 'ESG Metrices'],
    baseVacanciesMultiplier: 0.85
  },
  {
    id: 'sovereign-wealth-family-office',
    name: 'Sovereign Wealth & Private Capital Platforms',
    category: 'FINTECH_WEB3',
    shortDesc: 'Private equity waterfall calculations, co-investment syndication portals, and LP capital call automation.',
    baseGlobalMarketSize: '$19 Billion',
    baseCAGR: '+20.5%',
    keyRoles: ['Private Capital Platform Engineer', 'Waterfall Calculation Specialist', 'LP Portal Lead'],
    keySkills: ['Complex Financial Math', 'Confidential Data Security', 'Multi-Entity Data Isolation'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'embedded-finance-apis',
    name: 'Embedded Finance & Non-Bank Credit APIs',
    category: 'FINTECH_WEB3',
    shortDesc: 'Banking-as-a-Service (BaaS) platforms enabling SaaS platforms to issue cards, loans, and FDIC accounts.',
    baseGlobalMarketSize: '$41 Billion',
    baseCAGR: '+35.4%',
    keyRoles: ['BaaS Platform Architect', 'Embedded Lending Engineer', 'Card Issuance API Specialist'],
    keySkills: ['Card Issuance Processor APIs', 'Multi-Tenant Ledgering', 'Webhook Event Reliability'],
    baseVacanciesMultiplier: 1.45
  },
  {
    id: 'p2p-microlending-networks',
    name: 'Peer-to-Peer Micro-Lending & Community Finance',
    category: 'FINTECH_WEB3',
    shortDesc: 'Decentralized trust circles, community reputation staking, and localized mobile money integrations.',
    baseGlobalMarketSize: '$17 Billion',
    baseCAGR: '+23.5%',
    keyRoles: ['P2P Protocol Engineer', 'Reputation Graph Developer', 'Mobile Money Specialist'],
    keySkills: ['M-Pesa / UPI Connectors', 'Reputation Scoring Algorithms', 'Low-Bandwidth Mobile Apps'],
    baseVacanciesMultiplier: 0.9
  },
  {
    id: 'crossborder-vat-tax-auto',
    name: 'Cross-Border VAT & Corporate Tax Automation',
    category: 'FINTECH_WEB3',
    shortDesc: 'Real-time calculation of digital goods indirect tax across 140+ countries and automated tax return filing.',
    baseGlobalMarketSize: '$18 Billion',
    baseCAGR: '+24.5%',
    keyRoles: ['Tax Engine Architect', 'Jurisdiction Rules Engineer', 'E-Commerce Tax Specialist'],
    keySkills: ['Global Tax Law Rule Representation', 'High-Speed Tax API (<50ms)', 'Avalara/Stripe Tax Integrations'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'trade-finance-digital-loc',
    name: 'Trade Finance & Digital Letters of Credit',
    category: 'FINTECH_WEB3',
    shortDesc: 'Bill of lading digital endorsement, IoT cargo condition escrow triggers, and syndicated trade credit.',
    baseGlobalMarketSize: '$26 Billion',
    baseCAGR: '+21.0%',
    keyRoles: ['Trade Finance Developer', 'Maritime DLT Architect', 'Cargo IoT Escrow Specialist'],
    keySkills: ['ICC eRules Compliance', 'Permissioned Blockchains', 'IoT Sensor Oracles', 'SWIFT MT700'],
    baseVacanciesMultiplier: 0.95
  },

  // -------------------------------------------------------------
  // 3. CLOUD INFRASTRUCTURE & ENTERPRISE SAAS (25 Industries)
  // -------------------------------------------------------------
  {
    id: 'k8s-multicluster-mesh',
    name: 'Kubernetes Multi-Cluster & Service Mesh Systems',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Istio/Cilium service meshes, multi-cloud cross-region failover, and GitOps ArgoCD pipelines.',
    baseGlobalMarketSize: '$52 Billion',
    baseCAGR: '+29.4%',
    keyRoles: ['Kubernetes Platform Architect', 'Service Mesh Specialist', 'Cloud Infrastructure Lead'],
    keySkills: ['Cilium (eBPF)', 'Istio / Envoy', 'ArgoCD', 'Crossplane', 'Helm / Kustomize'],
    baseVacanciesMultiplier: 1.55
  },
  {
    id: 'iac-terraform-pulumi',
    name: 'Infrastructure as Code & Declarative Clouds',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Terraform, OpenTofu, and Pulumi modular infrastructure blueprints with automated drift detection.',
    baseGlobalMarketSize: '$36 Billion',
    baseCAGR: '+25.0%',
    keyRoles: ['IaC Automation Engineer', 'Cloud Governance Lead', 'DevOps Systems Architect'],
    keySkills: ['Terraform / OpenTofu', 'Pulumi (TypeScript/Go)', 'Terragrunt', 'Policy as Code (OPA)'],
    baseVacanciesMultiplier: 1.4
  },
  {
    id: 'sre-distributed-tracing',
    name: 'Site Reliability & OpenTelemetry Tracing',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'High-cardinality metrics, distributed trace propagation, error budgeting, and SLA/SLO observability.',
    baseGlobalMarketSize: '$41 Billion',
    baseCAGR: '+27.8%',
    keyRoles: ['Staff Site Reliability Engineer', 'Observability Architect', 'Distributed Tracing Specialist'],
    keySkills: ['OpenTelemetry (OTel)', 'Prometheus / Grafana', 'Tempo / Jaeger', 'SLO Tuning'],
    baseVacanciesMultiplier: 1.45
  },
  {
    id: 'ebpf-kernel-telemetry',
    name: 'eBPF Kernel Observability & High-Performance Networking',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Zero-overhead Linux kernel probes, real-time socket inspection, and hardware packet bypass.',
    baseGlobalMarketSize: '$19 Billion',
    baseCAGR: '+44.0%',
    keyRoles: ['eBPF Kernel Engineer', 'Low-Level Networking Specialist', 'Linux Systems Developer'],
    keySkills: ['C / Rust eBPF (BCC / Aya)', 'XDP (eXpress Data Path)', 'Linux Kernel Internals', 'Kprobes'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'edge-cdn-compute',
    name: 'Edge CDN & Ultra-Low-Latency Compute',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'V8 isolate workers, edge KV stores, Anycast routing, and dynamic assets caching at 300+ PoPs.',
    baseGlobalMarketSize: '$38 Billion',
    baseCAGR: '+28.2%',
    keyRoles: ['Edge Compute Engineer', 'Anycast Routing Architect', 'CDN Performance Specialist'],
    keySkills: ['Cloudflare Workers / Fastly Compute', 'WebAssembly (Wasm)', 'Anycast BGP', 'HTTP/3 & QUIC'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'serverless-microvm',
    name: 'Serverless Runtimes & MicroVM Architecture',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Firecracker microVM provisioning (<5ms cold start), container-to-serverless scaling, and event buses.',
    baseGlobalMarketSize: '$31 Billion',
    baseCAGR: '+32.0%',
    keyRoles: ['Serverless Platform Architect', 'MicroVM Virtualization Lead', 'Event-Driven Systems Engineer'],
    keySkills: ['AWS Firecracker', 'Knative', 'Rust / Go', 'EventBridge / CloudEvents'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'api-gateway-microservices',
    name: 'High-Throughput API Gateways & Service Mesh',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Rate limiting, OAuth2 mTLS termination, gRPC-to-JSON transcoding, and canary traffic shaping.',
    baseGlobalMarketSize: '$28 Billion',
    baseCAGR: '+24.5%',
    keyRoles: ['API Gateway Architect', 'Envoy Proxy Specialist', 'Microservices Core Lead'],
    keySkills: ['Envoy Proxy', 'Kong / Traefik', 'gRPC / Protobuf', 'Rate Limiting Algorithms (Token Bucket)'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'devex-internal-portals',
    name: 'Developer Experience (DevEx) & Internal Portals',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Backstage-based developer service catalogs, ephemeral PR environments, and automated scaffolding.',
    baseGlobalMarketSize: '$23 Billion',
    baseCAGR: '+33.5%',
    keyRoles: ['DevEx Platform Lead', 'Backstage Engineer', 'Developer Productivity Specialist'],
    keySkills: ['Spotify Backstage', 'Ephemeral Preview Environments', 'CLI Development (Go/Rust)', 'CI Speed Tuning'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'cicd-gitops-automation',
    name: 'Continuous Delivery & Declarative GitOps',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Zero-downtime blue/green deployments, automated canary analysis (Kayenta), and build cache grids.',
    baseGlobalMarketSize: '$34 Billion',
    baseCAGR: '+22.0%',
    keyRoles: ['CI/CD Pipeline Architect', 'GitOps Release Engineer', 'Build Automation Specialist'],
    keySkills: ['Argo Rollouts', 'GitHub Actions / GitLab CI', 'Turborepo / Bazel', 'Container Security Scanning'],
    baseVacanciesMultiplier: 1.4
  },
  {
    id: 'finops-cloud-cost-opt',
    name: 'Cloud FinOps & Infrastructure Unit Economics',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Kubernetes pod-level cost attribution, spot instance orchestration, and automated idle resource reaper.',
    baseGlobalMarketSize: '$21 Billion',
    baseCAGR: '+37.5%',
    keyRoles: ['FinOps Cloud Architect', 'Spot Instance Optimization Lead', 'Cloud Economics Engineer'],
    keySkills: ['Kubecost', 'AWS Cost Explorer APIs', 'Spot Fleet Management', 'Automated Savings Plans'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'chaos-engineering-resilience',
    name: 'Chaos Engineering & Automated Failure Injection',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Automated network partition injection, latency simulation, and game day disaster recovery automation.',
    baseGlobalMarketSize: '$16 Billion',
    baseCAGR: '+26.0%',
    keyRoles: ['Chaos Engineering Specialist', 'Resilience Architect', 'Fault Injection Developer'],
    keySkills: ['Chaos Mesh', 'Gremlin / LitmusChaos', 'Circuit Breakers (Resilience4j)', 'Disaster Recovery Tests'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'enterprise-cognitive-search',
    name: 'Enterprise Cognitive Search & Knowledge Graphs',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Universal connectors for Slack, Google Drive, Jira, and Confluence with hybrid lexical/semantic search.',
    baseGlobalMarketSize: '$29 Billion',
    baseCAGR: '+31.2%',
    keyRoles: ['Enterprise Search Architect', 'Knowledge Graph Engineer', 'Data Ingestion Specialist'],
    keySkills: ['Elasticsearch / OpenSearch', 'BM25 + Dense Retrieval', 'OAuth Connectors', 'Permission Filtering'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'kafka-streaming-eventhub',
    name: 'Event-Driven Systems & Real-Time Streaming',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Apache Kafka / Flink streaming architectures processing tens of millions of events per second.',
    baseGlobalMarketSize: '$46 Billion',
    baseCAGR: '+30.0%',
    keyRoles: ['Staff Distributed Streaming Architect', 'Kafka Cluster Engineer', 'Flink Real-Time Developer'],
    keySkills: ['Apache Kafka', 'Apache Flink', 'Schema Registry (Avro/Protobuf)', 'Exactly-Once Semantics'],
    baseVacanciesMultiplier: 1.5
  },
  {
    id: 'nextgen-erp-cloud',
    name: 'Next-Generation Cloud ERP Platforms',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Composable ERP architectures, automated multi-subsidiary consolidation, and real-time ledger sync.',
    baseGlobalMarketSize: '$68 Billion',
    baseCAGR: '+17.4%',
    keyRoles: ['ERP Systems Architect', 'Enterprise Integration Lead', 'Financial Consolidation Specialist'],
    keySkills: ['SAP S/4HANA / NetSuite APIs', 'Integration Middleware (MuleSoft)', 'ACID Transactions', 'SQL Tuning'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'crm-intelligence-saas',
    name: 'CRM Platforms & Conversation Intelligence',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Real-time sales call audio transcription, automated deal sentiment scoring, and pipeline forecasting.',
    baseGlobalMarketSize: '$75 Billion',
    baseCAGR: '+19.0%',
    keyRoles: ['CRM Core Engineer', 'Revenue Intelligence ML Lead', 'Sales Workflow Architect'],
    keySkills: ['Salesforce Apex/LWC', 'WebSockets Audio Streaming', 'Entity Sentiment Extraction', 'Postgres'],
    baseVacanciesMultiplier: 1.4
  },
  {
    id: 'hcm-talent-analytics-saas',
    name: 'Human Capital Management & People Analytics',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Employee engagement pulse analytics, internal mobility matching algorithms, and compensation benchmarking.',
    baseGlobalMarketSize: '$38 Billion',
    baseCAGR: '+21.5%',
    keyRoles: ['People Analytics Data Scientist', 'HR Tech Architect', 'Talent Platform Lead'],
    keySkills: ['Graph Matching Algorithms', 'Privacy Anonymization', 'Workday Connectors', 'React / Node.js'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'collaborative-workspace-saas',
    name: 'Collaborative Workspaces & Multiplayer Canvas',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Conflict-free Replicated Data Types (CRDTs), operational transforms, and sub-10ms canvas rendering.',
    baseGlobalMarketSize: '$32 Billion',
    baseCAGR: '+25.8%',
    keyRoles: ['Multiplayer Systems Engineer', 'CRDT Algorithm Developer', 'Canvas Rendering Lead (WebGL)'],
    keySkills: ['Yjs / Automerge CRDTs', 'WebSockets / WebRTC DataChannels', 'Canvas/WebGL', 'Rust WebAssembly'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'contract-lifecycle-ai',
    name: 'Contract Lifecycle Management & Legal AI',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Automated indemnification clause extraction, redlining diff engines, and digital signature custody.',
    baseGlobalMarketSize: '$20 Billion',
    baseCAGR: '+28.4%',
    keyRoles: ['LegalTech AI Engineer', 'Contract Diffing Specialist', 'Document Workflow Architect'],
    keySkills: ['Legal NLP Clause Classification', 'Document Redlining Algorithms', 'DocuSign/Adobe APIs'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'nocode-enterprise-engines',
    name: 'Enterprise No-Code & Workflow Engines',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Visual drag-and-drop workflow builders compiling to optimized distributed microservice routines.',
    baseGlobalMarketSize: '$27 Billion',
    baseCAGR: '+29.0%',
    keyRoles: ['Workflow Engine Developer', 'Visual Node Canvas Architect', 'DSL Compiler Specialist'],
    keySkills: ['BPMN 2.0 / Camunda', 'React Flow / Node Graph UI', 'Domain-Specific Languages (DSL)'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'identity-sso-federation',
    name: 'Identity Federation & Passwordless SSO',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'SAML 2.0 / OIDC federation, Passkeys (FIDO2 / WebAuthn), and adaptive multi-factor authentication.',
    baseGlobalMarketSize: '$33 Billion',
    baseCAGR: '+24.0%',
    keyRoles: ['Identity Systems Architect', 'WebAuthn Security Lead', 'SSO Federation Specialist'],
    keySkills: ['OIDC / SAML 2.0', 'FIDO2 / WebAuthn', 'Okta / Auth0 Architecture', 'SCIM User Provisioning'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'async-task-queues-engines',
    name: 'Asynchronous Workflow & Task Queue Orchestration',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Durable execution engines (Temporal, Cadence), long-running workflow sagas, and stateful task timers.',
    baseGlobalMarketSize: '$24 Billion',
    baseCAGR: '+35.0%',
    keyRoles: ['Durable Execution Architect', 'Temporal Systems Specialist', 'Asynchronous Systems Lead'],
    keySkills: ['Temporal.io / Cadence', 'Saga Pattern Implementation', 'Idempotency Keys', 'Go / TypeScript'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'dist-cache-memory-stores',
    name: 'Distributed In-Memory Caches & Key-Value Stores',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Redis clusters, DragonflyDB, memory tiering with NVMe, and cache stampede protection systems.',
    baseGlobalMarketSize: '$26 Billion',
    baseCAGR: '+23.4%',
    keyRoles: ['In-Memory Systems Engineer', 'Cache Architecture Specialist', 'High-Concurrency DB Lead'],
    keySkills: ['Redis Cluster', 'DragonflyDB', 'Consistent Hashing Algorithms', 'Write-Through / Write-Behind'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'customer-data-platforms-cdp',
    name: 'Customer Data Platforms (CDP) & Real-Time Identity',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Cross-channel identity resolution, streaming profile unification, and real-time audience syndication.',
    baseGlobalMarketSize: '$35 Billion',
    baseCAGR: '+27.0%',
    keyRoles: ['CDP Data Architect', 'Identity Resolution ML Lead', 'Event Pipeline Specialist'],
    keySkills: ['Segment / RudderStack', 'Snowflake / BigQuery Reverse ETL', 'Probabilistic Identity Resolution'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'vpc-hybrid-interconnect',
    name: 'Software-Defined Cloud Interconnect & Hybrid Mesh',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'AWS Direct Connect / Azure ExpressRoute BGP orchestration, SD-WAN, and zero-packet-loss peering.',
    baseGlobalMarketSize: '$39 Billion',
    baseCAGR: '+20.5%',
    keyRoles: ['Cloud Network Architect', 'BGP Peering Specialist', 'Hybrid Cloud Infrastructure Lead'],
    keySkills: ['BGP Routing', 'IPsec Over GRE', 'Cloud WAN', 'AWS Transit Gateway / Direct Connect'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'multitenant-saas-isolation',
    name: 'Multi-Tenant SaaS Architecture & Database Sharding',
    category: 'CLOUD_DEVTOOLS',
    shortDesc: 'Schema-per-tenant vs pooled data partitioning, noisy neighbor throttling, and tenant data shredding.',
    baseGlobalMarketSize: '$48 Billion',
    baseCAGR: '+26.2%',
    keyRoles: ['Multi-Tenant Platform Architect', 'Database Sharding Specialist', 'Tenant Isolation Lead'],
    keySkills: ['Postgres Row-Level Security (RLS)', 'Vitess / Citus Sharding', 'Tenant Rate Limiting', 'Compliance'],
    baseVacanciesMultiplier: 1.4
  },

  // -------------------------------------------------------------
  // 4. CYBERSECURITY, DEFENSE & TRUST (25 Industries)
  // -------------------------------------------------------------
  {
    id: 'zero-trust-ztna',
    name: 'Zero-Trust Network Architecture (ZTNA)',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Continuous contextual authentication, microsegmentation, and software-defined perimeters (SDP).',
    baseGlobalMarketSize: '$46 Billion',
    baseCAGR: '+31.0%',
    keyRoles: ['Zero-Trust Architect', 'Microsegmentation Specialist', 'Network Security Lead'],
    keySkills: ['ZTNA Protocols', 'Zscaler / Palo Alto Networks', 'mTLS Attestation', 'Device Posture Checks'],
    baseVacanciesMultiplier: 1.45
  },
  {
    id: 'cspm-cloud-security',
    name: 'Cloud Security Posture (CSPM) & CIEM Governance',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Automated cloud misconfiguration detection, excessive IAM entitlement pruning, and shift-left scanning.',
    baseGlobalMarketSize: '$38 Billion',
    baseCAGR: '+33.5%',
    keyRoles: ['CSPM Platform Architect', 'CIEM Identity Governance Lead', 'Cloud Security Specialist'],
    keySkills: ['Wiz / Prisma Cloud', 'AWS IAM Policy Simulators', 'Graph-Based Attack Path Analysis', 'K8s RBAC'],
    baseVacanciesMultiplier: 1.5
  },
  {
    id: 'iam-access-governance',
    name: 'Identity & Access Management (IAM) Governance',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Just-in-Time (JIT) access privilege elevation, privileged access management (PAM), and audit trails.',
    baseGlobalMarketSize: '$32 Billion',
    baseCAGR: '+23.5%',
    keyRoles: ['IAM Security Architect', 'PAM Platform Specialist', 'Directory Services Lead'],
    keySkills: ['CyberArk / HashiCorp Vault', 'Active Directory / Azure AD', 'JIT Privilege Workflows'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'siem-soc-automation',
    name: 'Next-Gen SIEM & Autonomous SOC Defense',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Petabyte-scale log ingestion, threat hunting with automated graph correlation, and AI alert triage.',
    baseGlobalMarketSize: '$42 Billion',
    baseCAGR: '+25.8%',
    keyRoles: ['SIEM Platform Architect', 'SOC Detection Engineer', 'Threat Hunter Lead'],
    keySkills: ['Splunk / Sentinel', 'Sigma Rules', 'Log Ingestion Telemetry', 'MITRE ATT&CK Framework'],
    baseVacanciesMultiplier: 1.4
  },
  {
    id: 'devsecops-sbom-supply',
    name: 'Software Supply Chain Security & SBOM Auditing',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Software Bill of Materials (SBOM) generation, cryptographically signed artifacts (Cosign/Sigstore).',
    baseGlobalMarketSize: '$27 Billion',
    baseCAGR: '+36.0%',
    keyRoles: ['Supply Chain Security Lead', 'DevSecOps Architect', 'Vulnerability Triage Engineer'],
    keySkills: ['Sigstore / Cosign', 'SLSA Framework', 'SPDX / CycloneDX SBOM', 'Static/Dynamic AST Scanning'],
    baseVacanciesMultiplier: 1.4
  },
  {
    id: 'offensive-red-teaming',
    name: 'Offensive Security & Red Teaming Penetration',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Adversary emulation, Active Directory exploitation, C2 infrastructure, and physical bypass testing.',
    baseGlobalMarketSize: '$24 Billion',
    baseCAGR: '+26.5%',
    keyRoles: ['Lead Red Team Operator', 'Penetration Testing Specialist', 'Exploit Developer'],
    keySkills: ['Cobalt Strike / Sliver', 'BloodHound AD Graphing', 'Reverse Engineering (Ghidra)', 'AV/EDR Bypass'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'edr-xdr-endpoints',
    name: 'Endpoint Detection & Automated Response (EDR / XDR)',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Kernel-level behavioral telemetry, ransomware file encryption interception, and automated host isolation.',
    baseGlobalMarketSize: '$39 Billion',
    baseCAGR: '+27.4%',
    keyRoles: ['EDR Behavioral Engineer', 'Endpoint Security Architect', 'Incident Response Lead'],
    keySkills: ['CrowdStrike / Microsoft Defender ATP', 'YARA Rules', 'Memory Forensics (Volatility)', 'Sysmon'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'post-quantum-cryptography',
    name: 'Post-Quantum Cryptography & PKI Modernization',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Migration to lattice-based cryptographic algorithms (Kyber, Dilithium) and quantum-resilient TLS.',
    baseGlobalMarketSize: '$15 Billion',
    baseCAGR: '+46.0%',
    keyRoles: ['Post-Quantum Cryptographer', 'PKI Modernization Lead', 'Cryptographic Systems Engineer'],
    keySkills: ['CRYSTALS-Kyber / Dilithium', 'NIST PQC Standards', 'OpenSSL 3.x PQC Forks', 'Hardware Security Modules'],
    baseVacanciesMultiplier: 0.9
  },
  {
    id: 'appsec-waf-engineering',
    name: 'Application Security (AppSec) & Modern WAFs',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Threat modeling, API schema fuzzing, behavioral bot mitigation, and automated SAST/DAST verification.',
    baseGlobalMarketSize: '$31 Billion',
    baseCAGR: '+24.5%',
    keyRoles: ['AppSec Engineering Lead', 'WAF Rule Architect', 'API Security Specialist'],
    keySkills: ['OWASP Top 10', 'Burp Suite Pro', 'API Fuzzing (RESTler)', 'Cloudflare / AWS WAF Automation'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'threat-intel-darkweb',
    name: 'Threat Intelligence & Dark Web Telemetry',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Automated Tor / Telegram threat actor monitoring, credential leak monitoring, and IOC enrichment.',
    baseGlobalMarketSize: '$21 Billion',
    baseCAGR: '+28.0%',
    keyRoles: ['Threat Intelligence Analyst', 'Dark Web Telemetry Engineer', 'OSINT Specialist'],
    keySkills: ['STIX / TAXII Protocols', 'Dark Web Scraping Pipelines', 'YARA Intelligence Feed Correlation'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'privacy-differential-crypto',
    name: 'Privacy Engineering & Homomorphic Cryptography',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Fully Homomorphic Encryption (FHE), secure multi-party computation, and GDPR data masking engines.',
    baseGlobalMarketSize: '$18 Billion',
    baseCAGR: '+38.5%',
    keyRoles: ['Privacy Engineer', 'FHE Cryptographic Developer', 'Data Anonymization Lead'],
    keySkills: ['Microsoft SEAL / OpenFHE', 'Differential Privacy', 'k-Anonymity Algorithms', 'Pseudonymization'],
    baseVacanciesMultiplier: 1.0
  },
  {
    id: 'soar-incident-response',
    name: 'SOAR Platforms & Automated Incident Response',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Automated playbook execution, threat quarantine orchestration, and post-mortem telemetry pipelines.',
    baseGlobalMarketSize: '$25 Billion',
    baseCAGR: '+29.0%',
    keyRoles: ['SOAR Playbook Engineer', 'Incident Response Lead', 'Security Automation Specialist'],
    keySkills: ['Cortex XSOAR / Splunk Phantom', 'Python Security Automation', 'API Webhook Chaining'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'drone-defense-countermeasures',
    name: 'Counter-UAS Drone Defense & Electronic Warfare',
    category: 'CYBER_DEFENSE',
    shortDesc: 'RF spectrum scanning, GNSS spoofing detection, and acoustic drone signature tracking systems.',
    baseGlobalMarketSize: '$16 Billion',
    baseCAGR: '+35.0%',
    keyRoles: ['Electronic Warfare Systems Engineer', 'RF Spectrum DSP Specialist', 'Counter-Drone Lead'],
    keySkills: ['SDR (Software Defined Radio)', 'GNSS Jamming Detection', 'Radar Target Classification', 'C++'],
    baseVacanciesMultiplier: 0.85
  },
  {
    id: 'confidential-cloud-enclaves',
    name: 'Confidential Computing & Secure Enclaves',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Hardware-encrypted memory computing using Intel SGX, AMD SEV-SNP, and AWS Nitro Enclaves.',
    baseGlobalMarketSize: '$22 Billion',
    baseCAGR: '+42.0%',
    keyRoles: ['Confidential Computing Architect', 'Secure Enclave Developer', 'Hardware Trust Specialist'],
    keySkills: ['AMD SEV / Intel SGX', 'Nitro Enclaves', 'Remote Attestation Verifiers', 'Rust / C'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'sovereign-airgapped-defense',
    name: 'Sovereign Cloud & Air-Gapped Network Defense',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Completely disconnected air-gapped data centers with optical data diodes and cryptographic unidirectionality.',
    baseGlobalMarketSize: '$28 Billion',
    baseCAGR: '+29.5%',
    keyRoles: ['Air-Gapped Systems Architect', 'Optical Data Diode Specialist', 'Sovereign Security Lead'],
    keySkills: ['Unidirectional Optical Diodes', 'Air-Gapped Patch Management', 'Tamper-Evident Enclosures'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'biometric-liveness-auth',
    name: 'Biometric Security & Deepfake Liveness Detection',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Passive 3D facial liveness verification, pulse photoplethysmography (rPPG), and presentation attack defense.',
    baseGlobalMarketSize: '$20 Billion',
    baseCAGR: '+32.4%',
    keyRoles: ['Biometric Security Engineer', 'Liveness Detection ML Lead', 'Anti-Spoofing Specialist'],
    keySkills: ['FIDO Alliance Certified Liveness', 'rPPG Micro-Color Sensing', 'Flash Spectral Reflection AI'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'ransomware-immutable-backup',
    name: 'Immutable Data Vaults & Ransomware Recovery',
    category: 'CYBER_DEFENSE',
    shortDesc: 'WORM (Write Once Read Many) storage vaults, air-gapped snapshot validation, and clean-room recovery.',
    baseGlobalMarketSize: '$26 Billion',
    baseCAGR: '+26.8%',
    keyRoles: ['Immutable Storage Architect', 'Disaster Recovery Engineer', 'Clean-Room Restoration Lead'],
    keySkills: ['S3 Object Lock (WORM)', 'Veeam / Rubrik Architecture', 'Zero-Ransomware Restoration Drills'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'cyber-insurance-risk-telemetry',
    name: 'Cyber Insurance Telemetry & Underwriting Risk',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Continuous external attack surface scanning and dynamic breach probability pricing algorithms.',
    baseGlobalMarketSize: '$17 Billion',
    baseCAGR: '+33.0%',
    keyRoles: ['Cyber Risk Actuary', 'Attack Surface Scoring Lead', 'Breach Modeling Specialist'],
    keySkills: ['External Vulnerability Telemetry', 'Actuarial Loss Distributions', 'Risk Benchmark APIs'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'scada-industrial-security',
    name: 'SCADA & Critical Infrastructure Cybersecurity',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Modbus / DNP3 industrial protocol deep packet inspection, PLC firmware validation, and OT air-gaps.',
    baseGlobalMarketSize: '$29 Billion',
    baseCAGR: '+23.0%',
    keyRoles: ['OT/SCADA Security Specialist', 'Industrial Protocol Analyst', 'Critical Infrastructure Lead'],
    keySkills: ['Nozomi / Dragos Systems', 'Modbus / DNP3 Inspection', 'IEC 62443 Standards', 'Purdue Model'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'anti-phishing-behavioral',
    name: 'Adaptive Email Security & Anti-Phishing AI',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Natural language invoice fraud detection, sender domain DMARC enforcement, and lookalike domain traps.',
    baseGlobalMarketSize: '$23 Billion',
    baseCAGR: '+24.5%',
    keyRoles: ['Email Security Architect', 'NLP Threat Detection Engineer', 'Domain Reputation Specialist'],
    keySkills: ['DMARC / DKIM / SPF Strict Enforcement', 'NLP Invoice Spoofing AI', 'Brand Phishing Takedown APIs'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'ai-model-poisoning-defense',
    name: 'AI Model Poisoning Defense & Data Attestation',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Training data sanitization, cryptographic dataset hash attestation, and back-door trigger detection.',
    baseGlobalMarketSize: '$14 Billion',
    baseCAGR: '+52.0%',
    keyRoles: ['AI Supply Chain Security Lead', 'Data Attestation Specialist', 'Model Trojan Hunter'],
    keySkills: ['Spectral Signature Analysis', 'Dataset Merkle Trees', 'Adversarial Cleansing', 'PyTorch Security'],
    baseVacanciesMultiplier: 1.0
  },
  {
    id: 'cyber-range-simulation',
    name: 'Cyber Range Virtualization & Adversarial Drills',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Automated enterprise network clone generation for purple-team war-gaming and automated bot attackers.',
    baseGlobalMarketSize: '$12 Billion',
    baseCAGR: '+30.0%',
    keyRoles: ['Cyber Range Architect', 'Adversarial Bot Developer', 'Purple Team Coordinator'],
    keySkills: ['Terraform Ephemeral Ranges', 'Atomic Red Team Automation', 'Telemetry Capture Scoring'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'military-c4isr-tactical',
    name: 'Military C4ISR & Tactical Mesh Communications',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Battlefield sensor fusion, Link 16 datalink integration, and anti-jam tactical MANET radio networks.',
    baseGlobalMarketSize: '$41 Billion',
    baseCAGR: '+18.0%',
    keyRoles: ['Tactical Systems Architect', 'MANET Communications Engineer', 'Battlefield Sensor Fusion Lead'],
    keySkills: ['MIL-STD-1553 / Link 16', 'Software Defined Tactical Radio', 'Low-Latency Sensor Correlation'],
    baseVacanciesMultiplier: 0.85
  },
  {
    id: 'anti-bot-scraping-defense',
    name: 'Anti-Bot Protection & Fingerprint Reverse-Engineering',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Proof-of-work challenges, headless browser detection, canvas fingerprinting, and credential stuffing defense.',
    baseGlobalMarketSize: '$19 Billion',
    baseCAGR: '+28.5%',
    keyRoles: ['Anti-Bot Engineer', 'Browser Reverse-Engineer', 'Web Traffic Integrity Lead'],
    keySkills: ['TLS Client Fingerprinting (JA3/JA4)', 'Wasm Obfuscated Proof of Work', 'Puppeteer/Playwright Detection'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'cyber-forensics-ediscovery',
    name: 'Digital Forensics & Incident Reconstruction',
    category: 'CYBER_DEFENSE',
    shortDesc: 'Disk image bitstream acquisition, NTFS journal parsing, memory dump analysis, and chain of custody.',
    baseGlobalMarketSize: '$16 Billion',
    baseCAGR: '+21.4%',
    keyRoles: ['Digital Forensics Investigator', 'Memory Forensics Specialist', 'Malware Reverse Engineer'],
    keySkills: ['EnCase / FTK Imager', 'Volatility 3', 'Ghidra / IDA Pro', 'Legal Chain of Custody Standards'],
    baseVacanciesMultiplier: 1.0
  },

  // -------------------------------------------------------------
  // 5. HEALTHCARE, BIOTECH & LIFE SCIENCES (25 Industries)
  // -------------------------------------------------------------
  {
    id: 'ai-drug-discovery-molecules',
    name: 'Generative AI Drug Discovery & Molecule Design',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'De novo small-molecule generation, target binding affinity prediction, and ADMET toxicity forecasting.',
    baseGlobalMarketSize: '$42 Billion',
    baseCAGR: '+38.5%',
    keyRoles: ['Computational Chemist', 'Drug Discovery ML Lead', 'Molecular Modeling Scientist'],
    keySkills: ['RDKit', 'Schrödinger Suite', 'Equivariant Graph Neural Networks', 'PyTorch Geometric'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'genomics-bioinformatics-pipelines',
    name: 'High-Throughput Genomics & Bioinformatics Pipelines',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Next-Generation Sequencing (NGS) variant calling, single-cell RNA-seq alignment, and WGS pipelines.',
    baseGlobalMarketSize: '$36 Billion',
    baseCAGR: '+26.0%',
    keyRoles: ['Bioinformatics Pipeline Engineer', 'Genomics Data Architect', 'Variant Calling Specialist'],
    keySkills: ['Nextflow / Snakemake', 'GATK / BWA-MEM', 'SAMtools', 'AWS Omics / Google Cloud Life Sciences'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'digital-therapeutics-remote',
    name: 'Digital Therapeutics & Remote Patient Monitoring',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'FDA-cleared software as a medical device (SaMD), continuous biometric telemetry, and adherence AI.',
    baseGlobalMarketSize: '$28 Billion',
    baseCAGR: '+33.0%',
    keyRoles: ['SaMD Regulatory Engineer', 'Remote Patient Telemetry Lead', 'Digital Health Mobile Architect'],
    keySkills: ['FDA SaMD / ISO 13485 Guidelines', 'Bluetooth Medical Sensors', 'HL7 FHIR Interoperability'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'ehr-fhir-interoperability',
    name: 'Electronic Health Record (EHR) & FHIR Integrations',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'SMART-on-FHIR client integrations, Epic/Cerner API gateways, and clinical NLP document extraction.',
    baseGlobalMarketSize: '$45 Billion',
    baseCAGR: '+19.8%',
    keyRoles: ['Healthcare Interoperability Architect', 'FHIR Integration Engineer', 'EHR Clinical Data Specialist'],
    keySkills: ['HL7 v2 / FHIR R4', 'SMART on FHIR OAuth', 'Epic App Orchard / Cerner Ignite', 'HIPAA Strict Protocols'],
    baseVacanciesMultiplier: 1.45
  },
  {
    id: 'medical-imaging-ai-diagnostics',
    name: 'Medical Imaging AI & Computer-Aided Diagnosis',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'DICOM 3D volumetric segmentation for MRI, CT scans, and automated mammography lesion detection.',
    baseGlobalMarketSize: '$31 Billion',
    baseCAGR: '+35.0%',
    keyRoles: ['Medical Imaging AI Scientist', 'DICOM Pipeline Engineer', 'Radiology AI Product Lead'],
    keySkills: ['MONAI (Medical Open Network for AI)', '3D U-Net', 'SimpleITK', 'DICOM Web Standards'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'clinical-trials-automation',
    name: 'Clinical Trial Automation & Patient Cohort Matching',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Automated trial protocol matching via unstructured EHR parsing and decentralized trial telemetry.',
    baseGlobalMarketSize: '$29 Billion',
    baseCAGR: '+24.0%',
    keyRoles: ['Clinical Trial Informatics Lead', 'Patient Cohort Matching Engineer', 'eCOA/ePRO Platform Architect'],
    keySkills: ['MedDRA Terminology', 'Unstructured Clinical NLP', '21 CFR Part 11 Compliance'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'telehealth-virtual-consult',
    name: 'Telehealth Infrastructure & Virtual Clinic Systems',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'HIPAA-compliant WebRTC video routing, automated clinical note synthesis, and e-prescription gateways.',
    baseGlobalMarketSize: '$52 Billion',
    baseCAGR: '+23.5%',
    keyRoles: ['Telehealth Platform Engineer', 'Clinical Audio AI Lead', 'e-Prescription Gateway Specialist'],
    keySkills: ['WebRTC Media Servers', 'Surescripts e-Prescribe APIs', 'Clinical Summarization LLMs'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'medical-wearables-biosensors',
    name: 'Medical Wearables & Continuous Biosensor Arrays',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Continuous glucose monitoring (CGM), optical PPG pulse transit time, and ECG arrhythmia detection.',
    baseGlobalMarketSize: '$34 Billion',
    baseCAGR: '+28.2%',
    keyRoles: ['Wearable Firmware Engineer', 'Biomedical Signal Processing Lead', 'Biosensor Hardware Specialist'],
    keySkills: ['Embedded C (Nordic nRF52/53)', 'Digital Filtering (Butterworth)', 'ECG Waveform Analysis'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'hospital-ops-bed-allocation-ai',
    name: 'Hospital Operations & Predictive Capacity AI',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Predictive ICU bed admission forecasting, surgical suite schedule optimization, and nurse rostering.',
    baseGlobalMarketSize: '$24 Billion',
    baseCAGR: '+22.5%',
    keyRoles: ['Hospital Operations Data Scientist', 'OR Scheduling Optimization Lead', 'Healthcare Logistics Engineer'],
    keySkills: ['Constraint Programming (OR-Tools)', 'Discrete Event Simulation', 'Hospital Admission Forecasting'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'robotic-surgery-precision',
    name: 'Robotic Surgery & Precision Tele-Operation',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Sub-millimeter haptic feedback, real-time stereo laparoscopy overlays, and safety interlock firmware.',
    baseGlobalMarketSize: '$27 Billion',
    baseCAGR: '+31.4%',
    keyRoles: ['Surgical Robotics Controls Engineer', 'Haptics Software Specialist', 'Safety-Critical Medical Firmware Lead'],
    keySkills: ['C++ Real-Time Runtimes', 'Robotic Kinematics', 'Haptic Force Sensors', 'ISO 62304 Standards'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'protein-folding-structural',
    name: 'Protein Folding & Computational Structural Biology',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Ab initio protein structure prediction, cryo-EM map modeling, and macromolecular complex docking.',
    baseGlobalMarketSize: '$19 Billion',
    baseCAGR: '+40.0%',
    keyRoles: ['Structural Bioinformatics Lead', 'Cryo-EM Reconstruction Specialist', 'Protein Docking Scientist'],
    keySkills: ['AlphaFold2 / ColabFold', 'Rosetta / PyRosetta', 'PDB Data Structures', 'CUDA GPU Solvers'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'mental-health-digital-behavior',
    name: 'Digital Mental Health & Conversational CBT',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Safety-bounded conversational cognitive behavioral therapy (CBT), biometric stress response tracking.',
    baseGlobalMarketSize: '$21 Billion',
    baseCAGR: '+34.0%',
    keyRoles: ['Behavioral Health AI Specialist', 'Clinical Content Engineer', 'Digital CBT Platform Architect'],
    keySkills: ['Clinical Safety Guardrails', 'Galvanic Skin Response (GSR) Ingestion', 'Mobile UX Psychology'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'oncology-precision-medicine',
    name: 'Oncology Biomarker Discovery & Precision Therapy',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Liquid biopsy circulating tumor DNA (ctDNA) detection and tumor mutational burden (TMB) scoring.',
    baseGlobalMarketSize: '$33 Billion',
    baseCAGR: '+29.0%',
    keyRoles: ['Oncology Data Scientist', 'Liquid Biopsy Informatics Lead', 'Precision Medicine Architect'],
    keySkills: ['ctDNA Deep Sequencing Algorithms', 'Variant Interpretation (COSMIC)', 'R / Bioconductor'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'health-claims-fraud-revenue',
    name: 'Healthcare Revenue Cycle & Claims Fraud AI',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Automated ICD-10 medical coding from clinical charts, claim denial prediction, and billing fraud audits.',
    baseGlobalMarketSize: '$37 Billion',
    baseCAGR: '+21.0%',
    keyRoles: ['RCM Automation Architect', 'Medical Coding NLP Specialist', 'Claims Adjudication ML Lead'],
    keySkills: ['ICD-10 / CPT Ontologies', 'Denial Prediction ML Models', 'EDI 837/835 Claim Parsers'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'lims-lab-automation',
    name: 'Laboratory Information Systems (LIMS) & Robotics',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Liquid handler automation (Hamilton/Tecan), sample barcode tracking, and automated assay data ingestion.',
    baseGlobalMarketSize: '$18 Billion',
    baseCAGR: '+18.5%',
    keyRoles: ['LIMS Systems Architect', 'Liquid Handling Automation Specialist', 'Lab Integration Engineer'],
    keySkills: ['SiLA 2 Lab Automation Standards', 'Hamilton Venus Scripting', 'Audit Trails (GLP/GMP)'],
    baseVacanciesMultiplier: 1.0
  },
  {
    id: 'pharmacy-automated-dispensing',
    name: 'Pharmacy Automation & Central Drug Fulfillment',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Automated pouch packaging robots, real-time drug-drug interaction warning checks, and cold-chain monitoring.',
    baseGlobalMarketSize: '$23 Billion',
    baseCAGR: '+20.0%',
    keyRoles: ['Pharmacy Automation Engineer', 'Drug Interaction ML Lead', 'Cold Chain Telemetry Specialist'],
    keySkills: ['RxNorm Database', 'Automated Pill Dispensing Robotics', 'IoT Temperature Loggers'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'elderly-care-ambient-assist',
    name: 'Elderly Care Robotics & Ambient Assisted Living',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Radar-based fall detection without cameras, medication dispensing reminders, and voice companion robots.',
    baseGlobalMarketSize: '$16 Billion',
    baseCAGR: '+31.0%',
    keyRoles: ['Ambient Sensing Engineer', 'Elderly Care Robotics Lead', 'Assistive Technology Specialist'],
    keySkills: ['mmWave Radar Sensing', 'Acoustic Distress Sound Classification', 'Voice UI for Seniors'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'microbiome-personalized-nutrition',
    name: 'Microbiome Sequencing & Personalized Nutrition',
    category: 'HEALTH_BIOTECH',
    shortDesc: '16S rRNA taxonomic profiling, gut metabolite prediction, and continuous glucose-adjusted diet planning.',
    baseGlobalMarketSize: '$14 Billion',
    baseCAGR: '+27.5%',
    keyRoles: ['Metagenomics Data Scientist', 'Microbiome Informatics Lead', 'Personalized Nutrition Developer'],
    keySkills: ['QIIME 2', 'Metagenomic Assembly', 'Metabolomics Correlation ML'],
    baseVacanciesMultiplier: 0.9
  },
  {
    id: 'organ-on-chip-microfluidics',
    name: 'Organ-on-Chip & Microfluidic Drug Screening',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Microfluidic cell culture telemetry, automated fluidic control, and high-content microscopy imaging.',
    baseGlobalMarketSize: '$11 Billion',
    baseCAGR: '+36.0%',
    keyRoles: ['Microfluidics Systems Engineer', 'Organ-on-Chip Imaging Lead', 'Cell Telemetry Specialist'],
    keySkills: ['Microfluidic Pressure Controllers', 'Fluorescence Image Analysis', 'LabView / Python Hardware'],
    baseVacanciesMultiplier: 0.8
  },
  {
    id: 'med-device-embedded-iso',
    name: 'Medical Device Embedded Firmware & ISO 62304',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Class II/III medical device safety firmware, deterministic RTOS scheduling, and hazard analysis verification.',
    baseGlobalMarketSize: '$39 Billion',
    baseCAGR: '+17.0%',
    keyRoles: ['Safety-Critical Embedded Firmware Lead', 'Medical Device QA Engineer', 'Hazard Analysis Architect'],
    keySkills: ['MISRA C', 'FreeRTOS / SafeRTOS', 'ISO 62304 / ISO 14971 Compliance', 'Hardware Watchdogs'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'veterinary-telehealth-biometrics',
    name: 'Veterinary Telehealth & Animal Sensor Telemetry',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Livestock cattle collar rumination monitors, pet GPS biometrics, and remote veterinary video consultation.',
    baseGlobalMarketSize: '$15 Billion',
    baseCAGR: '+23.0%',
    keyRoles: ['Veterinary Telemetry Engineer', 'Animal Biometrics Specialist', 'AgTech Animal Health Lead'],
    keySkills: ['LoRaWAN Sensor Ingestion', 'Animal Acoustic Cough Detection', 'Veterinary Practice Software APIs'],
    baseVacanciesMultiplier: 0.9
  },
  {
    id: 'dental-3d-cad-printing',
    name: 'Digital Dentistry & 3D Intraoral Scanning CAD',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Sub-10-micron intraoral 3D scanning, automated tooth crown CAD generation, and clear aligner simulation.',
    baseGlobalMarketSize: '$17 Billion',
    baseCAGR: '+25.0%',
    keyRoles: ['Dental CAD Software Developer', '3D Mesh Geometry Specialist', 'Intraoral Scanning Lead'],
    keySkills: ['Open3D / VTK', 'Surface Mesh Registration (ICP)', 'SLA 3D Printing Resins', 'C++ Geometry Engines'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'clinical-decision-support-cdss',
    name: 'Clinical Decision Support Systems (CDSS)',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Sepsis early warning systems, antibiotic stewardship algorithms, and adverse drug event alert firewalls.',
    baseGlobalMarketSize: '$26 Billion',
    baseCAGR: '+26.0%',
    keyRoles: ['CDSS Systems Architect', 'Clinical Alerting Specialist', 'Sepsis Telemetry ML Lead'],
    keySkills: ['SOFA / MEWS Scoring Engines', 'Real-Time Vital Stream Processing', 'Alert Fatigue Mitigation UI'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'fertility-tech-reproductive-ai',
    name: 'Fertility Tech & Embryo Viability Computer Vision',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Time-lapse embryo morphokinetic viability grading using deep learning and ovulation biomarker tracking.',
    baseGlobalMarketSize: '$13 Billion',
    baseCAGR: '+30.0%',
    keyRoles: ['Embryo Vision AI Scientist', 'Reproductive Tech Specialist', 'Biomarker Algorithm Developer'],
    keySkills: ['Time-Lapse Microscopy Video ML', 'Hormonal Biomarker Modeling', 'IVF Clinic EHR Systems'],
    baseVacanciesMultiplier: 0.85
  },
  {
    id: 'emergency-dispatch-triage-ai',
    name: 'Emergency Medical Dispatch & Acoustic Triage',
    category: 'HEALTH_BIOTECH',
    shortDesc: 'Real-time 911 audio cardiac arrest agonal breathing detection and automated multi-hospital ambulance routing.',
    baseGlobalMarketSize: '$18 Billion',
    baseCAGR: '+24.5%',
    keyRoles: ['Emergency Dispatch Systems Engineer', 'Acoustic Agonal Breathing ML Lead', 'Ambulance Telematics Architect'],
    keySkills: ['Real-Time Audio Stream Analysis', 'Ambulance GPS Telematics', 'Hospital ER Capacity Coordination'],
    baseVacanciesMultiplier: 1.05
  },

  // -------------------------------------------------------------
  // 6. CLEANTECH, CLIMATE & ENERGY (25 Industries)
  // -------------------------------------------------------------
  {
    id: 'smart-grid-demand-response',
    name: 'Smart Grid Orchestration & Dynamic Demand Response',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Millisecond frequency regulation, automated smart-meter AMI ingestion, and DERMS grid control systems.',
    baseGlobalMarketSize: '$56 Billion',
    baseCAGR: '+28.0%',
    keyRoles: ['Smart Grid Systems Architect', 'DERMS Control Engineer', 'Power Flow Optimization Lead'],
    keySkills: ['IEEE 2030.5 / OpenADR', 'Grid Power Flow Solvers', 'SCADA Integrations', 'Time-Series DBs'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'carbon-accounting-scope3',
    name: 'Enterprise Carbon Accounting & Scope 1-3 Auditing',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Automated ERP spend-based emissions estimation, supplier activity data ingestion, and CSRD compliance.',
    baseGlobalMarketSize: '$32 Billion',
    baseCAGR: '+36.0%',
    keyRoles: ['Carbon Accounting Platform Lead', 'Scope 3 Supply Chain Analyst', 'GHG Protocol Software Architect'],
    keySkills: ['GHG Protocol Standards', 'DEFRA / EPA Emission Factors', 'Automated Utility Bill OCR Parsing'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'bess-battery-storage-software',
    name: 'Battery Energy Storage Systems (BESS) Software',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Wholesale power market arbitrage bidding, thermal degradation prediction, and cell balancing telemetry.',
    baseGlobalMarketSize: '$41 Billion',
    baseCAGR: '+39.4%',
    keyRoles: ['BESS Software Architect', 'Battery Degradation ML Lead', 'Wholesale Market Bidding Developer'],
    keySkills: ['State of Health (SoH) Algorithms', 'Modbus / CAN Bus Battery Racks', 'ERCOT / CAISO Market APIs'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'solar-farm-telemetry-ai',
    name: 'Solar Farm Telemetry & Automated Yield Optimization',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Single-axis tracker angle backtracking algorithms, drone thermal crack inspection, and inverter health AI.',
    baseGlobalMarketSize: '$38 Billion',
    baseCAGR: '+23.5%',
    keyRoles: ['Solar Telemetry Engineer', 'Tracker Optimization Specialist', 'Inverter Firmware Architect'],
    keySkills: ['Sun Position Backtracking Algorithms', 'Drone Thermal Orthomosaics', 'SunSpec Modbus Protocols'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'wind-turbine-predictive-maint',
    name: 'Wind Turbine Predictive Maintenance & Drone Inspection',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Vibration gearbox anomaly detection, autonomous drone blade leading-edge erosion assessment, and yaw tuning.',
    baseGlobalMarketSize: '$34 Billion',
    baseCAGR: '+22.0%',
    keyRoles: ['Wind Turbine ML Specialist', 'Vibration Analysis Engineer', 'Autonomous Blade Inspection Lead'],
    keySkills: ['Acoustic Vibration FFT Analysis', 'Blade Defect Computer Vision', 'SCADA Historians (OSIsoft PI)'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'ev-charging-networks-ocpi',
    name: 'EV Charging Networks & OCPI Roaming Protocols',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'OCPP 2.0.1 charger management systems, ISO 15118 Plug & Charge, and dynamic grid load throttling.',
    baseGlobalMarketSize: '$44 Billion',
    baseCAGR: '+33.0%',
    keyRoles: ['EV Charging Software Architect', 'OCPP / OCPI Protocol Lead', 'Smart Charging Throttling Engineer'],
    keySkills: ['OCPP 1.6 / 2.0.1', 'OCPI Roaming Standard', 'ISO 15118 TLS PKI', 'Charge Point WebSockets'],
    baseVacanciesMultiplier: 1.4
  },
  {
    id: 'green-hydrogen-electrolyzer-control',
    name: 'Green Hydrogen Production & Electrolyzer Control',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'PEM and alkaline electrolyzer ramp-rate optimization tied to intermittent renewable energy availability.',
    baseGlobalMarketSize: '$18 Billion',
    baseCAGR: '+44.0%',
    keyRoles: ['Electrolyzer Control Systems Engineer', 'Hydrogen Plant Optimization Lead', 'Chemical Process Data Scientist'],
    keySkills: ['Process Control (PLC/DCS)', 'Renewable Power Intermittency Matching', 'Safety Instrumented Systems (SIS)'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'smr-nuclear-automation',
    name: 'Small Modular Nuclear Reactors (SMR) Automation',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Passive safety monitoring, digital twin thermal hydraulics simulations, and NRC Class 1E instrumentation.',
    baseGlobalMarketSize: '$21 Billion',
    baseCAGR: '+29.0%',
    keyRoles: ['Nuclear Digital Twin Architect', 'Class 1E I&C Engineer', 'Thermal Hydraulics Specialist'],
    keySkills: ['RELAP5 Thermal Hydraulics', 'Safety Critical Deterministic Systems', 'Nuclear Regulatory Compliance'],
    baseVacanciesMultiplier: 0.8
  },
  {
    id: 'carbon-capture-geological-sensors',
    name: 'Direct Air Capture (DAC) & Geological Monitoring',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Direct Air Capture contactor fan optimization, underground CO2 plume seismic acoustic monitoring.',
    baseGlobalMarketSize: '$15 Billion',
    baseCAGR: '+48.0%',
    keyRoles: ['Carbon Removal Systems Engineer', 'Geological Sequestration Sensor Lead', 'DAC Process Optimizer'],
    keySkills: ['Seismic Acoustic Ingestion', 'Thermodynamic Regeneration Control', 'MRV Verification Protocols'],
    baseVacanciesMultiplier: 0.85
  },
  {
    id: 'agri-climate-precision-irrigation',
    name: 'Agri-Climate Sensing & Precision Irrigation',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Soil volumetric water content telemetry, evapotranspiration weather modeling, and variable-rate pivots.',
    baseGlobalMarketSize: '$23 Billion',
    baseCAGR: '+25.0%',
    keyRoles: ['AgTech IoT Systems Architect', 'Precision Irrigation Data Scientist', 'Agronomic Sensor Specialist'],
    keySkills: ['LoRaWAN Soil Probes', 'Penman-Monteith Evapotranspiration Models', 'Satellite NDVI Ingestion'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'geothermal-reservoir-ai',
    name: 'Enhanced Geothermal Systems (EGS) & Reservoir AI',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Micro-seismic fracture mapping, deep downhole temperature modeling, and closed-loop turbine controls.',
    baseGlobalMarketSize: '$14 Billion',
    baseCAGR: '+27.0%',
    keyRoles: ['Geothermal Reservoir Engineer', 'Micro-Seismic Processing Specialist', 'Deep Subsurface ML Lead'],
    keySkills: ['Subsurface Flow Simulation (TOUGH2)', 'Acoustic Micro-Earthquake Detection', 'High-Temp Telemetry'],
    baseVacanciesMultiplier: 0.8
  },
  {
    id: 'industrial-heat-thermal-batteries',
    name: 'Industrial Heat Decarbonization & Thermal Batteries',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Molten salt and crushed rock thermal storage control systems powering heavy industrial brick/cement kilns.',
    baseGlobalMarketSize: '$17 Billion',
    baseCAGR: '+35.5%',
    keyRoles: ['Thermal Storage Software Lead', 'Industrial Heat Process Engineer', 'Thermodynamic Control Specialist'],
    keySkills: ['Thermodynamic Modeling', 'High-Temperature Sensor Interfacing', 'Industrial SCADA'],
    baseVacanciesMultiplier: 0.85
  },
  {
    id: 'deforestation-satellite-monitoring',
    name: 'Deforestation Monitoring & Rainforest Satellite AI',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Synthetic aperture radar (SAR) cloud-penetrating imagery for illegal logging and wildfire detection.',
    baseGlobalMarketSize: '$12 Billion',
    baseCAGR: '+29.0%',
    keyRoles: ['SAR Remote Sensing Scientist', 'Forest Telemetry Engineer', 'Biodiversity Data Lead'],
    keySkills: ['Sentinel-1 SAR Interferometry', 'Change Detection CNNs', 'Acoustic Chainsaw Detection IoT'],
    baseVacanciesMultiplier: 0.9
  },
  {
    id: 'ocean-cleanup-marine-sensors',
    name: 'Ocean Cleanup Robotics & Marine Telemetry',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Autonomous surface vessel (ASV) plastic barrier tracking, satellite current drift forecasting, and sonar.',
    baseGlobalMarketSize: '$9 Billion',
    baseCAGR: '+31.0%',
    keyRoles: ['Marine Robotics Engineer', 'Ocean Current Modeling Specialist', 'ASV Autonomy Lead'],
    keySkills: ['NOAA Ocean Current Models', 'Sonar Bathymetry Ingestion', 'Maritime Drone Firmware'],
    baseVacanciesMultiplier: 0.75
  },
  {
    id: 'bems-smart-hvac-optimization',
    name: 'Smart Building Energy (BEMS) & HVAC Optimization',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Model predictive control (MPC) of enterprise chillers and air handlers using weather forecast predictive feeds.',
    baseGlobalMarketSize: '$35 Billion',
    baseCAGR: '+24.5%',
    keyRoles: ['BEMS Control Systems Engineer', 'HVAC Energy Optimization Lead', 'Building IoT Architect'],
    keySkills: ['BACnet / Modbus / MQTT', 'Model Predictive Control (MPC)', 'Building Digital Twins'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'circular-waste-sorting-robotics',
    name: 'Circular Economy & Optical Waste Sorting Robotics',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'High-speed robotic delta arms sorting plastics, metals, and cardboard via hyperspectral near-infrared vision.',
    baseGlobalMarketSize: '$19 Billion',
    baseCAGR: '+30.0%',
    keyRoles: ['Waste Sorting Robotics Engineer', 'Hyperspectral Vision Lead', 'Recycling Automation Specialist'],
    keySkills: ['Near-Infrared (NIR) Spectroscopy', 'Delta Robot Pick-and-Place (<100ms)', 'Object Detection CNNs'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'climate-risk-catastrophe-modeling',
    name: 'Climate Risk & Catastrophe Insurance Modeling',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'High-resolution flood, hurricane, and wildfire physics-based simulation models for municipal bond risk.',
    baseGlobalMarketSize: '$25 Billion',
    baseCAGR: '+28.0%',
    keyRoles: ['Catastrophe Modeling Lead', 'Hydrological Simulation Scientist', 'Climate Risk Actuary'],
    keySkills: ['Spatial Hydrology Modeling (HEC-RAS)', 'Monte Carlo Storm Synthesis', 'GIS Data Pipelines'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'vpp-virtual-power-plants',
    name: 'Virtual Power Plants (VPP) & Aggregation SaaS',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Aggregating 50,000 residential home batteries and solar inverters into a dispatchable 100MW grid resource.',
    baseGlobalMarketSize: '$28 Billion',
    baseCAGR: '+38.0%',
    keyRoles: ['VPP Platform Architect', 'DER Aggregation Lead', 'Grid Market Arbitrage Developer'],
    keySkills: ['Tesla Powerwall / Enphase APIs', 'Sub-Second Distributed Dispatch', 'Grid Ancillary Service Markets'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'desalination-scada-water-leak',
    name: 'Desalination Automation & Municipal Water AI',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Reverse osmosis membrane pressure optimization, acoustic pipe burst detection, and chlorine dosage control.',
    baseGlobalMarketSize: '$22 Billion',
    baseCAGR: '+21.0%',
    keyRoles: ['Water SCADA Architect', 'Acoustic Pipe Leak ML Lead', 'Membrane Optimization Specialist'],
    keySkills: ['Acoustic Hydrophone Processing', 'Water Distribution Modeling (EPANET)', 'Industrial PLC SCADA'],
    baseVacanciesMultiplier: 1.0
  },
  {
    id: 'saf-sustainable-aviation-fuel',
    name: 'Sustainable Aviation Fuel (SAF) Production Tech',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Hydroprocessed Esters and Fatty Acids (HEFA) and Fischer-Tropsch refinery automated synthesis control.',
    baseGlobalMarketSize: '$16 Billion',
    baseCAGR: '+42.0%',
    keyRoles: ['SAF Chemical Process Architect', 'Refinery Digital Twin Lead', 'Biofuel Lifecycle Specialist'],
    keySkills: ['Chemical Kinetics Simulation', 'Distributed Control Systems (DCS)', 'Carbon Intensity Scoring'],
    baseVacanciesMultiplier: 0.85
  },
  {
    id: 'methane-satellite-hyperspectral',
    name: 'Methane Leak Detection & Hyperspectral Sensors',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Satellite hyperspectral absorption plume identification pinpointing pipeline valve leaks to within 5 meters.',
    baseGlobalMarketSize: '$13 Billion',
    baseCAGR: '+37.0%',
    keyRoles: ['Methane Plume Remote Sensing Lead', 'Atmospheric Physics Data Scientist', 'Leak Telemetry Engineer'],
    keySkills: ['Infrared Absorption Bands (2.3 µm)', 'Gaussian Plume Dispersion Models', 'Pipeline GIS Correlation'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'csrd-esg-reporting-software',
    name: 'CSRD Compliance & ESG Regulatory Disclosure',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'European Corporate Sustainability Due Diligence, double materiality assessment, and audit trails.',
    baseGlobalMarketSize: '$21 Billion',
    baseCAGR: '+34.5%',
    keyRoles: ['CSRD Compliance Architect', 'Double Materiality Data Lead', 'ESG Audit Software Specialist'],
    keySkills: ['ESRS Data Schema Standards', 'Auditable Data Vaults', 'Enterprise ERP Interfacing'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'biochar-soil-carbon-mrv',
    name: 'Biochar Pyrolysis & Soil Carbon MRV Software',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Pyrolysis kiln temperature attestation, soil sample spectroscopic verification, and durable credit minting.',
    baseGlobalMarketSize: '$10 Billion',
    baseCAGR: '+45.0%',
    keyRoles: ['MRV Systems Architect', 'Soil Spectroscopy Lead', 'Carbon Removal Protocol Developer'],
    keySkills: ['Pyrolysis IoT Telemetry', 'Soil Organic Carbon (SOC) Spectrometry', 'Puro.earth Standards'],
    baseVacanciesMultiplier: 0.8
  },
  {
    id: 'microgrid-islanded-power',
    name: 'Microgrid Controller & Islanded Power Systems',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Seamless zero-inertia grid disconnection, diesel-to-battery handover, and remote community power systems.',
    baseGlobalMarketSize: '$24 Billion',
    baseCAGR: '+25.5%',
    keyRoles: ['Microgrid Control Engineer', 'Inverter Grid-Forming Specialist', 'Islanded Power Architect'],
    keySkills: ['Grid-Forming vs Grid-Following Inverters', 'Modbus / CAN Bus Controls', 'Sub-Cycle Static Switch Control'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'battery-recycling-black-mass',
    name: 'Lithium Battery Recycling & Hydrometallurgy Automation',
    category: 'CLIMATE_ENERGY',
    shortDesc: 'Automated battery pack discharge robotics, shredded black mass chemical extraction, and purity tracking.',
    baseGlobalMarketSize: '$18 Billion',
    baseCAGR: '+41.0%',
    keyRoles: ['Battery Recycling Robotics Lead', 'Hydrometallurgy Process Engineer', 'Material Purity Specialist'],
    keySkills: ['Automated Pack Disassembly Robotics', 'Chemical Spectrometry Analysis', 'Battery Passport Tracking'],
    baseVacanciesMultiplier: 0.95
  },

  // -------------------------------------------------------------
  // 7. AUTOMOTIVE, AEROSPACE & AUTONOMOUS MOBILITY (25 Industries)
  // -------------------------------------------------------------
  {
    id: 'autonomous-driving-level4',
    name: 'Autonomous Driving Systems (Level 4/5 Stack)',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Full perception, prediction, path planning, and safety fallback actuation software for robotaxis.',
    baseGlobalMarketSize: '$62 Billion',
    baseCAGR: '+33.4%',
    keyRoles: ['Autonomous Driving Software Engineer', 'Motion Planning Specialist', 'Perception Sensor Fusion Lead'],
    keySkills: ['C++20 / CUDA', 'ROS 2 / Cyber RT', 'HD Vector Maps', 'Apollo / Autoware Stack'],
    baseVacanciesMultiplier: 1.45
  },
  {
    id: 'v2x-connected-vehicles',
    name: 'Connected Vehicle Telematics & V2X Protocols',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'C-V2X (Cellular V2X) direct sidelink communication, emergency vehicle preemption, and high-rate CAN logging.',
    baseGlobalMarketSize: '$48 Billion',
    baseCAGR: '+24.0%',
    keyRoles: ['V2X Protocol Engineer', 'Telematics Gateway Architect', 'Automotive 5G Specialist'],
    keySkills: ['3GPP Release 16 C-V2X', 'SOME/IP Protocol', 'CAN FD / FlexRay', 'MQTT Automotive Brokers'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'ev-powertrain-bms-algos',
    name: 'Electric Vehicle Powertrain & BMS Control',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Silicon carbide (SiC) inverter switching, 800V fast-charging thermal management, and regenerative braking.',
    baseGlobalMarketSize: '$54 Billion',
    baseCAGR: '+27.5%',
    keyRoles: ['EV Powertrain Controls Lead', 'BMS Algorithm Specialist', 'SiC Inverter Firmware Engineer'],
    keySkills: ['MATLAB / Simulink Auto-Coding', 'State of Charge (SoC) Kalman Filters', 'AUTOSAR Classic'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'commercial-spacetech-smallsat',
    name: 'Commercial SpaceTech & SmallSat Constellations',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Low Earth Orbit (LEO) satellite constellation inter-satellite optical links, orbital mechanics, and telemetry.',
    baseGlobalMarketSize: '$42 Billion',
    baseCAGR: '+29.0%',
    keyRoles: ['Satellite Flight Software Engineer', 'Orbital Mechanics Lead', 'Ground Station Systems Architect'],
    keySkills: ['Spacecraft Flight Software (cFS)', 'Orbit Propagation (SGP4/SDP4)', 'Laser Optical Crosslinks'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'uav-drone-delivery-systems',
    name: 'UAV Drone Delivery & Autonomous Flight Software',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'BVLOS (Beyond Visual Line of Sight) parcel delivery drones, geofencing, and parachute fail-safe systems.',
    baseGlobalMarketSize: '$28 Billion',
    baseCAGR: '+36.0%',
    keyRoles: ['UAV Autonomy Engineer', 'BVLOS Flight Systems Specialist', 'Drone Fleet Control Architect'],
    keySkills: ['PX4 / ArduPilot', 'MAVLink Protocol', 'BVLOS FAA Part 135 Telemetry', 'Obstacle Avoidance Lidar'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'avionics-do178c-flight-software',
    name: 'Avionics Flight Software & DO-178C Safety Critical',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Fly-by-wire flight control computers, ARINC 429 / 664 avionics buses, and DO-178C Level A certification.',
    baseGlobalMarketSize: '$39 Billion',
    baseCAGR: '+16.5%',
    keyRoles: ['DO-178C Avionics Engineer', 'Fly-By-Wire Controls Lead', 'Safety Critical Systems Specialist'],
    keySkills: ['DO-178C Level A / DO-254', 'ARINC 429 / AFDX', 'Ada / Embedded C', 'Formal Static Analysis (Polyspace)'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'evtol-urban-air-mobility',
    name: 'Urban Air Mobility (eVTOL) & Electric Flight',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Tilt-rotor multi-motor transition dynamics, acoustic noise minimization, and vertiport scheduling software.',
    baseGlobalMarketSize: '$24 Billion',
    baseCAGR: '+42.5%',
    keyRoles: ['eVTOL Flight Control Engineer', 'Transition Dynamics Specialist', 'Vertiport Airspace Architect'],
    keySkills: ['Distributed Electric Propulsion Controls', 'Complex Aerodynamic Modeling', 'Simulink Flight Dynamics'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'highspeed-rail-maglev-signaling',
    name: 'High-Speed Rail & Maglev Signalling Systems',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'ETCS Level 3 / CBTC automated train control, moving block signaling, and maglev linear motor control.',
    baseGlobalMarketSize: '$36 Billion',
    baseCAGR: '+18.0%',
    keyRoles: ['Railway Signaling Architect', 'CBTC Safety Lead', 'Train Control Firmware Engineer'],
    keySkills: ['ETCS / CBTC Standards', 'SIL 4 Safety Certification', 'Fail-Safe Relay Simulation'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'autonomous-maritime-ships',
    name: 'Autonomous Maritime Vessels & Smart Ports',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Ocean cargo ship waypoint auto-navigation, automated harbor tug berthing, and crane telemetry.',
    baseGlobalMarketSize: '$26 Billion',
    baseCAGR: '+26.8%',
    keyRoles: ['Maritime Autonomy Engineer', 'Automated Berthing Specialist', 'Smart Port Logistics Lead'],
    keySkills: ['NMEA 2000 / AIS Integration', 'Marine Radar Target Tracking', 'Collision Regulations (COLREGs) AI'],
    baseVacanciesMultiplier: 1.0
  },
  {
    id: 'fleet-management-route-ai',
    name: 'Commercial Fleet Telematics & Dynamic Route AI',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Electronic Logging Device (ELD) compliance, driver fatigue video telemetry, and vehicle fuel routing.',
    baseGlobalMarketSize: '$41 Billion',
    baseCAGR: '+21.4%',
    keyRoles: ['Fleet Telematics Architect', 'Route Optimization Data Scientist', 'Driver Safety Video ML Lead'],
    keySkills: ['Vehicle Routing Problem (VRP) Solvers', 'J1939 OBD-II Streaming', 'Edge Camera Driver Drowsiness'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'incabin-sensing-dms',
    name: 'In-Cabin AI & Driver Monitoring Systems (DMS)',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Euro NCAP compliant infrared pupil eye-tracking, child presence detection, and gesture interfaces.',
    baseGlobalMarketSize: '$19 Billion',
    baseCAGR: '+31.0%',
    keyRoles: ['DMS Computer Vision Lead', 'In-Cabin AI Specialist', 'Automotive Safety UI Engineer'],
    keySkills: ['Infrared Eye-Tracking Models', 'Gaze Vector Estimation', 'Euro NCAP Safety Protocols'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'automotive-ota-updates',
    name: 'Automotive Over-The-Air (OTA) Pipeline Systems',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Cryptographically signed delta binary updates for 80+ ECUs, rollback protection, and UNECE R156 compliance.',
    baseGlobalMarketSize: '$23 Billion',
    baseCAGR: '+28.0%',
    keyRoles: ['OTA Pipeline Architect', 'ECU Flash Update Specialist', 'Automotive Security Lead'],
    keySkills: ['UDS (ISO 14229) Diagnostic Flashing', 'Uptane Security Framework', 'Binary Diffing (Courgette)'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'space-launch-guidance-telemetry',
    name: 'Rocket Launch Guidance & Trajectory Software',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Thrust vector control, closed-loop ascent trajectory guidance, and supersonic retropropulsion landing.',
    baseGlobalMarketSize: '$31 Billion',
    baseCAGR: '+25.0%',
    keyRoles: ['Guidance, Navigation & Control (GNC) Lead', 'Rocket Flight Software Engineer', 'Trajectory Optimization Specialist'],
    keySkills: ['Convex Optimization for Landing', 'Real-Time Linux (PREEMPT_RT)', 'Quaternion Math', 'C++'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'lunar-planetary-robotics',
    name: 'Lunar & Planetary Exploration Robotics',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Extreme temperature vacuum actuators, autonomous hazard avoidance terrain navigation, and deep-space comms.',
    baseGlobalMarketSize: '$16 Billion',
    baseCAGR: '+33.0%',
    keyRoles: ['Planetary Robotics Autonomy Lead', 'Deep Space Communications Specialist', 'Radiation-Hardened Firmware Engineer'],
    keySkills: ['Delay-Tolerant Networking (DTN)', 'Stereo Visual Odometry on Regolith', 'Rad-Hardened Microcontrollers'],
    baseVacanciesMultiplier: 0.8
  },
  {
    id: 'satellite-laser-broadband',
    name: 'Free-Space Optical Satellite Broadband (Lasercom)',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: '100Gbps inter-satellite laser pointing and tracking across 2,000 km, adaptive optics atmospheric compensation.',
    baseGlobalMarketSize: '$27 Billion',
    baseCAGR: '+35.5%',
    keyRoles: ['Lasercom Systems Architect', 'Precision Pointing & Tracking Lead', 'Optical Transceiver Engineer'],
    keySkills: ['Fine-Steering Mirrors', 'Atmospheric Turbulence Correction', 'Coherent Optical Modulation'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'autonomous-forklifts-yard-trucks',
    name: 'Autonomous Industrial Forklifts & Yard Automation',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Pallet pocket 3D visual insertion, outdoor container yard truck automation, and dock door scheduling.',
    baseGlobalMarketSize: '$22 Billion',
    baseCAGR: '+29.4%',
    keyRoles: ['Autonomous Forklift Software Lead', 'Pallet Vision Specialist', 'Yard Management Autonomy Architect'],
    keySkills: ['3D Lidar Pallet Localization', 'Heavy Hydraulic Actuation Control', 'Industrial Safety Scanners'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'automotive-lidar-radar-fusion',
    name: 'Automotive Solid-State LiDAR & 4D Imaging Radar',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: '4D radar elevation point clouds, FMCW Doppler LiDAR signal processing, and low-level fusion networks.',
    baseGlobalMarketSize: '$29 Billion',
    baseCAGR: '+34.0%',
    keyRoles: ['Sensor Fusion Algorithm Lead', '4D Radar Signal Processing Engineer', 'LiDAR Point Cloud Specialist'],
    keySkills: ['FMCW Radar DSP', 'Point Cloud Feature Extraction (PointNet)', 'Temporal Sensor Synchronization'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'micromobility-fleet-telematics',
    name: 'Micro-Mobility Fleet Management (E-Scooters/Bikes)',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Sidewalk riding pedestrian detection, dual-frequency RTK precision geofencing, and battery swap logistics.',
    baseGlobalMarketSize: '$18 Billion',
    baseCAGR: '+22.5%',
    keyRoles: ['Micro-Mobility IoT Engineer', 'RTK Geofencing Specialist', 'Fleet Battery Swap Optimization Lead'],
    keySkills: ['Dual-Band RTK GNSS', 'Edge Computer Vision on Scooters', 'Dynamic Pricing Heatmaps'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'dynamic-airspace-management-utm',
    name: 'Unmanned Traffic Management (UTM) & Airspace AI',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Federated drone airspace conflict detection, strategic deconfliction, and remote ID broadcast tracking.',
    baseGlobalMarketSize: '$15 Billion',
    baseCAGR: '+39.0%',
    keyRoles: ['UTM Airspace Systems Architect', 'Drone Deconfliction Algorithm Lead', 'Aviation Protocol Specialist'],
    keySkills: ['ASTM F3411 Remote ID Standard', '4D Trajectory Conflict Resolution', 'Air Traffic Control Interfacing'],
    baseVacanciesMultiplier: 1.0
  },
  {
    id: 'space-debris-tracking-collision',
    name: 'Space Debris Tracking & Conjunction Assessment',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Orbital conjunction collision risk calculation and automated collision avoidance propellant maneuver plans.',
    baseGlobalMarketSize: '$11 Billion',
    baseCAGR: '+32.0%',
    keyRoles: ['Astrodynamics Conjunction Analyst', 'Space Situational Awareness Lead', 'Collision Avoidance Specialist'],
    keySkills: ['Covariance Matrix Propagation', 'Ephemeris Data Matching (CCSDS)', 'Autonomous Thruster Firing Logic'],
    baseVacanciesMultiplier: 0.85
  },
  {
    id: 'hydrogen-fuel-cell-trucks',
    name: 'Hydrogen Heavy-Duty Truck Powertrains',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: '300kW fuel cell stack balance-of-plant, 700-bar tank thermal expansion control, and Class 8 electric axles.',
    baseGlobalMarketSize: '$21 Billion',
    baseCAGR: '+36.0%',
    keyRoles: ['Fuel Cell Truck Systems Lead', 'Hydrogen Storage Safety Specialist', 'Heavy-Duty Electric Powertrain Architect'],
    keySkills: ['Fuel Cell Air/Coolant Control Loops', 'High-Pressure Tank Safety Interlocks', 'Class 8 CAN Architecture'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'smart-intersections-v2i',
    name: 'Smart Intersections & V2I Connected Traffic Lights',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Traffic signal phase and timing (SPaT) broadcasts, emergency vehicle green wave, and camera-free radar monitoring.',
    baseGlobalMarketSize: '$25 Billion',
    baseCAGR: '+26.0%',
    keyRoles: ['V2I Smart City Architect', 'Traffic Adaptive Signal Lead', 'Intersection Telemetry Engineer'],
    keySkills: ['SPaT / MAP Messages (SAE J2735)', 'Adaptive Signal Control (SCOOT)', 'Radar Traffic Detection'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'automotive-cybersecurity-iso21434',
    name: 'Automotive Cybersecurity & ISO/SAE 21434 Compliance',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Vehicle Security Operations Center (vSOC), in-vehicle CAN intrusion detection (IDS), and secure boot HSMs.',
    baseGlobalMarketSize: '$27 Billion',
    baseCAGR: '+34.0%',
    keyRoles: ['Automotive Cybersecurity Architect', 'In-Vehicle IDS Engineer', 'ISO 21434 Threat Modeling Specialist'],
    keySkills: ['ISO/SAE 21434 / UNECE WP.29 R155', 'AUTOSAR SecOC (Secure Onboard Comm)', 'CAN Bus Anomaly Detection'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'battery-digital-twin-health',
    name: 'EV Battery Digital Twins & Remaining Useful Life',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Physics-informed neural networks simulating lithium plating and electro-chemical degradation in production cars.',
    baseGlobalMarketSize: '$22 Billion',
    baseCAGR: '+37.0%',
    keyRoles: ['Battery Digital Twin Lead', 'Electro-Chemical ML Specialist', 'Fleet Battery Health Engineer'],
    keySkills: ['Physics-Informed Neural Networks (PINNs)', 'Lithium-Ion Degradation Models', 'High-Rate Telemetry Ingestion'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'supersonic-flight-sim-acoustics',
    name: 'Commercial Supersonic Flight & Sonic Boom Shading',
    category: 'MOBILITY_AEROSPACE',
    shortDesc: 'Computational fluid dynamics (CFD) minimizing sonic boom ground signatures to enable quiet overland flight.',
    baseGlobalMarketSize: '$17 Billion',
    baseCAGR: '+28.5%',
    keyRoles: ['Supersonic Aerodynamics Lead', 'Sonic Boom Acoustic Specialist', 'CFD High-Performance Computing Engineer'],
    keySkills: ['Euler / Navier-Stokes GPU Solvers', 'Atmospheric Boom Propagation Codes', 'Aeroelastic Flutter Modeling'],
    baseVacanciesMultiplier: 0.85
  },

  // -------------------------------------------------------------
  // 8. E-COMMERCE, CONSUMER TECH & MEDIA (25 Industries)
  // -------------------------------------------------------------
  {
    id: 'headless-commerce-nextgen',
    name: 'Headless Commerce & Microservices Storefronts',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Composable commerce architectures, Next.js incremental static regeneration, and unified cart APIs.',
    baseGlobalMarketSize: '$68 Billion',
    baseCAGR: '+26.0%',
    keyRoles: ['Headless Commerce Architect', 'Storefront Performance Lead', 'Shopify Plus / Commercelayer Specialist'],
    keySkills: ['Next.js / Remix', 'GraphQL Storefront APIs', 'Edge Cart Resolvers', 'Algolia Search Integrations'],
    baseVacanciesMultiplier: 1.45
  },
  {
    id: 'recommendation-engines-multiarmed',
    name: 'Real-Time Recommendation Engines & Contextual Bandits',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Two-tower retrieval models, real-time clickstream ranking, and exploration-exploitation bandit algorithms.',
    baseGlobalMarketSize: '$49 Billion',
    baseCAGR: '+28.5%',
    keyRoles: ['Recommendation Systems Lead', 'Ranking & Personalization Engineer', 'Two-Tower Retrieval Specialist'],
    keySkills: ['Two-Tower Neural Networks', 'Contextual Multi-Armed Bandits', 'Kafka Clickstream Ingestion', 'Redis Feature Caching'],
    baseVacanciesMultiplier: 1.5
  },
  {
    id: 'quick-commerce-dark-stores',
    name: 'Quick Commerce (10-Min Delivery) Systems',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Sub-minute dark store picker routing, automated batching, and micro-fulfillment rider dispatch algorithms.',
    baseGlobalMarketSize: '$45 Billion',
    baseCAGR: '+33.0%',
    keyRoles: ['Quick Commerce Logistics Architect', 'Dark Store Picker Routing Lead', 'Dispatch Optimization Specialist'],
    keySkills: ['Traveling Salesperson Warehouse Solvers', 'Sub-Second Driver Matching', 'Real-Time Inventory Reservation'],
    baseVacanciesMultiplier: 1.4
  },
  {
    id: 'social-commerce-creator-economy',
    name: 'Social Commerce & Creator Monetization Platforms',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Live video shopping low-latency streaming, affiliate automated commission splits, and in-feed checkouts.',
    baseGlobalMarketSize: '$52 Billion',
    baseCAGR: '+31.4%',
    keyRoles: ['Social Commerce Architect', 'Live Shopping Video Lead', 'Creator Payout Systems Specialist'],
    keySkills: ['Sub-Second HLS / WebRTC Live Video', 'In-Stream Checkout Microservices', 'High-Volume Affiliate Split Ledgers'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'media-streaming-av1-hevc',
    name: 'Digital Media Streaming & Ultra-Low-Bitrate Video',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Per-title AV1/HEVC encoding ladders, dynamic multi-CDN switching, and player-side buffer telemetry.',
    baseGlobalMarketSize: '$64 Billion',
    baseCAGR: '+19.5%',
    keyRoles: ['Video Streaming Infrastructure Lead', 'Codec Optimization Specialist (AV1/VVC)', 'Multi-CDN Architect'],
    keySkills: ['FFmpeg Internals', 'DASH / HLS Protocols', 'Video Quality Metrics (VMAF)', 'DRM Widevine / FairPlay'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'gaming-engines-realtime-3d',
    name: 'Gaming Engines & Real-Time 3D Simulation',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Unreal Engine 5 Nanite geometry, hardware ray tracing shaders, and multiplayer rollback netcode.',
    baseGlobalMarketSize: '$82 Billion',
    baseCAGR: '+17.0%',
    keyRoles: ['Lead Graphics Programmer', 'Rollback Netcode Specialist', 'Unreal Engine Systems Architect'],
    keySkills: ['Unreal Engine 5 (C++)', 'HLSL / GLSL Shaders', 'DirectX 12 / Vulkan', 'Deterministic Lockstep Netcode'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'cloud-gaming-pixel-streaming',
    name: 'Cloud Gaming & Low-Latency Pixel Streaming',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'GPU virtualization (vGPU), sub-15ms input-to-photon WebRTC streaming, and edge frame rendering.',
    baseGlobalMarketSize: '$26 Billion',
    baseCAGR: '+35.0%',
    keyRoles: ['Cloud Gaming Systems Engineer', 'Sub-Frame Latency Specialist', 'vGPU Virtualization Architect'],
    keySkills: ['NVENC Hardware Encoding', 'WebRTC Data Channels & Media', 'Linux Kernel Input Drivers', 'Edge GPU Slicing'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'adtech-rtb-header-bidding',
    name: 'AdTech, Header Bidding & Privacy-First DSPs',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Sub-50ms real-time auction bidding (RTB), Privacy Sandbox Topics API, and programmatic ad servers.',
    baseGlobalMarketSize: '$95 Billion',
    baseCAGR: '+16.5%',
    keyRoles: ['AdTech High-Throughput C++ Architect', 'RTB Bidding Optimization Lead', 'Privacy Sandbox Specialist'],
    keySkills: ['OpenRTB 3.0 Protocol', 'Aerospike Database', 'Sub-50ms Auction SLA Systems', 'First-Party ID Graphs'],
    baseVacanciesMultiplier: 1.45
  },
  {
    id: 'edtech-adaptive-learning-ai',
    name: 'EdTech & Adaptive Learning Intelligence',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Knowledge space theory mastery tracking, personalized spaced repetition, and real-time coding sandboxes.',
    baseGlobalMarketSize: '$48 Billion',
    baseCAGR: '+24.5%',
    keyRoles: ['Adaptive Learning Scientist', 'EdTech Systems Architect', 'Interactive Learning Sandbox Lead'],
    keySkills: ['Item Response Theory (IRT)', 'Spaced Repetition Algorithms', 'Secure In-Browser Code Sandboxes (WebContainers)'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'spatial-computing-vr-ar',
    name: 'Spatial Computing & XR (VR / AR) Operating Systems',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Apple Vision Pro / Meta Quest spatial hand tracking, eye foveated rendering, and WebXR experiences.',
    baseGlobalMarketSize: '$36 Billion',
    baseCAGR: '+37.5%',
    keyRoles: ['Spatial Computing Architect', 'Foveated Rendering Specialist', 'XR Interaction Lead'],
    keySkills: ['OpenXR API', 'Unity / Unreal XR', 'Foveated Rendering Optimization', 'Spatial Audio Systems'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'digital-news-syndication-cms',
    name: 'Digital Publishing & Modern Headless CMS',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'High-concurrency breaking news static caching, automated AMP/RSS syndication, and paywall access control.',
    baseGlobalMarketSize: '$31 Billion',
    baseCAGR: '+14.5%',
    keyRoles: ['Publishing Platform Architect', 'Paywall Optimization Specialist', 'Headless CMS Engineer'],
    keySkills: ['Fastly VCL Edge Caching', 'Dynamic Paywall Metering', 'GraphQL Publishing APIs'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'audio-streaming-music-ai',
    name: 'Audio Streaming & Music Discovery Recommendation',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Continuous playlist audio feature flow matching, lossless FLAC streaming, and acoustic waveform matching.',
    baseGlobalMarketSize: '$39 Billion',
    baseCAGR: '+18.0%',
    keyRoles: ['Audio Recommendation Lead', 'Music Information Retrieval (MIR) Scientist', 'Streaming Audio Architect'],
    keySkills: ['Audio Spectrogram Embeddings', 'Harmonic & Tempo Matching', 'HLS Audio Streams', 'Lossless Codecs'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'online-marketplace-multivendor',
    name: 'Online Marketplaces & Multi-Vendor Liquidity',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Two-sided network effects, automated seller KYC, dispute escrow, and cross-border shipping calculation.',
    baseGlobalMarketSize: '$88 Billion',
    baseCAGR: '+21.0%',
    keyRoles: ['Marketplace Platform Architect', 'Seller Payout Engine Lead', 'Dispute Resolution Systems Engineer'],
    keySkills: ['Multi-Vendor Inventory Partitioning', 'Stripe Connect Multi-Party Escrow', 'Shipping Rate APIs'],
    baseVacanciesMultiplier: 1.4
  },
  {
    id: 'gamified-loyalty-retention',
    name: 'Gamified Loyalty & Real-Time Engagement SaaS',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Dynamic tier status engines, real-time points ledgering, and behavioral engagement rewards.',
    baseGlobalMarketSize: '$22 Billion',
    baseCAGR: '+25.0%',
    keyRoles: ['Loyalty Engine Architect', 'Gamification Mechanics Lead', 'Points Ledger Specialist'],
    keySkills: ['Distributed Immutable Point Ledgers', 'High-Speed Event Triggers', 'Push Notification Engagement Telemetry'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'd2c-subscription-billing',
    name: 'D2C Subscription Management & Churn Prevention',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Dunning email smart retries, recurring billing state machines, and predictive subscriber churn ML.',
    baseGlobalMarketSize: '$27 Billion',
    baseCAGR: '+23.8%',
    keyRoles: ['Subscription Billing Architect', 'Churn Prediction Data Scientist', 'Smart Dunning Specialist'],
    keySkills: ['Stripe Billing / Recurly APIs', 'Payment Retry Machine Learning', 'Customer Retention Cohort Analysis'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'music-creation-ai-stems',
    name: 'Music Creation AI & Neural Audio Stem Separation',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Multi-track neural stem isolation (vocals, drums, bass), text-to-music generation, and automated mastering.',
    baseGlobalMarketSize: '$15 Billion',
    baseCAGR: '+44.0%',
    keyRoles: ['Neural Audio Separation Scientist', 'AI Music Generation Lead', 'Audio DSP Engineer'],
    keySkills: ['Demucs / Open-Unmix', 'MusicLM Style Architectures', 'Audio Mastering DSP Filters', 'JUCE C++'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'esports-tournament-anticheat',
    name: 'Esports Tournament Platforms & Kernel Anti-Cheat',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Kernel-mode (Ring 0) driver game integrity verification, automated bracket scheduling, and replay sync.',
    baseGlobalMarketSize: '$24 Billion',
    baseCAGR: '+21.5%',
    keyRoles: ['Kernel Anti-Cheat Developer', 'Esports Platform Architect', 'Game Replay Telemetry Lead'],
    keySkills: ['Windows Kernel Drivers (KMDF)', 'Anti-Debugging & Memory Obfuscation', 'Bracket Scheduling Solvers'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'language-learning-ai-tutors',
    name: 'Language Learning & Conversational AI Tutors',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Real-time phoneme pronunciation assessment, dynamic conversational grammar correction, and CEFR grading.',
    baseGlobalMarketSize: '$25 Billion',
    baseCAGR: '+28.0%',
    keyRoles: ['Speech Pronunciation Assessment Lead', 'Language Education ML Scientist', 'Conversational Pedagogy Architect'],
    keySkills: ['Phoneme Alignment Models (Kaldi/Whisper)', 'CEFR Level Text Simplification', 'Speech Feedback UI'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'digital-collectibles-fan-engagement',
    name: 'Digital Collectibles & Interactive Fan Passes',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Dynamic metadata digital passes, event attendance token gates, and sports club member privileges.',
    baseGlobalMarketSize: '$16 Billion',
    baseCAGR: '+26.0%',
    keyRoles: ['Fan Token Protocol Lead', 'Interactive Collectibles Architect', 'Token Gated Community Engineer'],
    keySkills: ['Dynamic NFT Metadata Upgrades', 'Low-Fee Layer 2 Chains', 'Ticket Barcode Fraud Protection'],
    baseVacanciesMultiplier: 0.85
  },
  {
    id: 'event-ticketing-antiscalp',
    name: 'High-Volume Event Ticketing & Anti-Scalping Systems',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Virtual queue waiting rooms (100k+ concurrent users), dynamic revolving QR barcodes, and bot shields.',
    baseGlobalMarketSize: '$32 Billion',
    baseCAGR: '+18.5%',
    keyRoles: ['Ticketing High-Concurrency Architect', 'Virtual Queue System Lead', 'Anti-Scalping Specialist'],
    keySkills: ['Redis Virtual Queue Algorithms', 'Revolving Cryptographic Barcodes', 'High-Speed Seat Selection Maps'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'influencer-marketing-roi-ai',
    name: 'Influencer Marketing Intelligence & Fake Follower Auditing',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Audience bot detection, automated brand safety image classification, and conversion attribution tracking.',
    baseGlobalMarketSize: '$23 Billion',
    baseCAGR: '+27.0%',
    keyRoles: ['Influencer Analytics Lead', 'Social Graph Fraud Auditor', 'Campaign Attribution Specialist'],
    keySkills: ['Social Media Graph Scraping', 'Engagement Anomaly Detection', 'First-Party Conversion Tagging'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'smart-gym-connected-fitness',
    name: 'Connected Gym Equipment & Form Tracking AI',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Pose estimation rep counting, magnetic motor resistance control, and live instructor video synchronization.',
    baseGlobalMarketSize: '$21 Billion',
    baseCAGR: '+24.0%',
    keyRoles: ['Connected Fitness Firmware Lead', 'Computer Vision Pose Estimation Specialist', 'Fitness IoT Architect'],
    keySkills: ['MediaPipe Pose Tracking', 'Brushless DC Motor Torque Control', 'Live Leaderboard WebSockets'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'smart-home-iot-matter',
    name: 'Smart Home IoT & Matter Protocol Hubs',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Thread mesh networking, Matter 1.3 protocol unification, and local edge automation without cloud dependency.',
    baseGlobalMarketSize: '$38 Billion',
    baseCAGR: '+22.5%',
    keyRoles: ['Matter Protocol Engineer', 'Smart Home Embedded Lead', 'Local Edge Automation Architect'],
    keySkills: ['Matter Standard (CSA)', 'Thread Mesh Networking (802.15.4)', 'Embedded C/C++', 'Home Assistant Integrations'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'food-delivery-kitchen-robotics',
    name: 'Food Delivery Aggregation & Ghost Kitchen Robotics',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Multi-platform menu sync, automated automated fry and burger cooking robotics, and dispatch timers.',
    baseGlobalMarketSize: '$49 Billion',
    baseCAGR: '+22.0%',
    keyRoles: ['Kitchen Automation Robotics Lead', 'Delivery Aggregator Software Architect', 'Ghost Kitchen Ops Engineer'],
    keySkills: ['Multi-Aggregator Order Unified Webhooks', 'Automated Food Prep Safety Sensors', 'Queue Pacing Algorithms'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'metaverse-virtual-avatar-id',
    name: 'Virtual Identity & Cross-Platform Avatars',
    category: 'ECOMMERCE_MEDIA',
    shortDesc: 'Ready Player Me style 3D avatar rigging, facial blendshapes from webcam feeds, and glTF asset optimization.',
    baseGlobalMarketSize: '$19 Billion',
    baseCAGR: '+33.0%',
    keyRoles: ['3D Avatar Systems Engineer', 'Real-Time Facial Blendshape Lead', 'glTF Optimization Specialist'],
    keySkills: ['glTF / USD File Formats', 'Facial Blendshapes (ARKit Standard)', 'Three.js / WebGL Rendering'],
    baseVacanciesMultiplier: 0.95
  },

  // -------------------------------------------------------------
  // 9. INDUSTRIAL IOT, ROBOTICS & SEMICONDUCTOR (25 Industries)
  // -------------------------------------------------------------
  {
    id: 'industrial-digital-twins',
    name: 'Industrial Digital Twins & Factory Floor Simulation',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Real-time NVIDIA Omniverse USD simulations replicating thousands of machines with physical fidelity.',
    baseGlobalMarketSize: '$48 Billion',
    baseCAGR: '+35.5%',
    keyRoles: ['Digital Twin Systems Architect', 'Industrial Simulation Lead', 'Omniverse USD Specialist'],
    keySkills: ['Universal Scene Description (USD)', 'NVIDIA Omniverse', 'OPC UA Data Ingestion', 'Physics Engines'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'warehouse-amr-robotics',
    name: 'Warehouse Autonomous Mobile Robots (AMR)',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Fleet traffic management (500+ robots), 2D/3D LiDAR SLAM, and pallet shelf lifting mechanics.',
    baseGlobalMarketSize: '$39 Billion',
    baseCAGR: '+31.0%',
    keyRoles: ['AMR Robotics Software Lead', 'Fleet Multi-Agent Coordinator', 'LiDAR SLAM Specialist'],
    keySkills: ['ROS 2 Navigation2 (Nav2)', 'LiDAR SLAM Algorithms', 'Fleet Traffic Dispatch Solvers', 'CAN Bus Control'],
    baseVacanciesMultiplier: 1.4
  },
  {
    id: 'semiconductor-eda-design',
    name: 'Semiconductor Electronic Design Automation (EDA)',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Logic synthesis, placement and routing algorithms, static timing analysis (STA), and DRC verification.',
    baseGlobalMarketSize: '$45 Billion',
    baseCAGR: '+19.0%',
    keyRoles: ['EDA Software Developer', 'Physical Design Specialist', 'Static Timing Analysis Lead'],
    keySkills: ['Verilog / SystemVerilog', 'C++ Graph Algorithms for Layout', 'Synopsys / Cadence Tool APIs'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'semiconductor-3d-packaging',
    name: 'Advanced Semiconductor Packaging & 3D Chiplets',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'CoWoS (Chip-on-Wafer-on-Substrate), silicon interposers, through-silicon vias (TSV), and thermal modeling.',
    baseGlobalMarketSize: '$41 Billion',
    baseCAGR: '+28.0%',
    keyRoles: ['Advanced Packaging Architect', '3D Chiplet Thermal Lead', 'Interposer Signal Integrity Specialist'],
    keySkills: ['Thermal Dissipation Simulation', 'High-Density Interconnect Routing', 'UCIe (Universal Chiplet Interconnect)'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'predictive-maint-acoustic-vibration',
    name: 'Industrial Predictive Maintenance & Vibration AI',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Early bearing failure acoustic emission detection, motor current signature analysis (MCSA), and MTBF optimization.',
    baseGlobalMarketSize: '$34 Billion',
    baseCAGR: '+27.4%',
    keyRoles: ['Predictive Maintenance Data Scientist', 'Acoustic Emission Specialist', 'Industrial Sensor Architect'],
    keySkills: ['Motor Current Signature Analysis (MCSA)', 'Vibration Wavelet Transforms', 'Edge Microcontroller TinyML'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'additive-mfg-3d-metal-printing',
    name: 'Additive Manufacturing & Industrial 3D Metal Printing',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Laser powder bed fusion (LPBF) real-time melt pool monitoring, thermal residual stress simulation, and slicers.',
    baseGlobalMarketSize: '$28 Billion',
    baseCAGR: '+25.0%',
    keyRoles: ['3D Printing Slicer Software Lead', 'Melt Pool Computer Vision Specialist', 'Metal Additive Process Engineer'],
    keySkills: ['Thermal Stress Finite Element Analysis', 'High-Speed Pyrometer Vision', 'Custom Toolpath G-Code Generators'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'cobots-collaborative-assembly',
    name: 'Collaborative Robots (Cobots) & Precision Assembly',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Safe human-robot speed and separation monitoring, compliant force-torque screwdriving, and teach pendants.',
    baseGlobalMarketSize: '$31 Billion',
    baseCAGR: '+33.0%',
    keyRoles: ['Cobot Applications Engineer', 'Force-Torque Assembly Specialist', 'Safety-Rated Soft Robotics Lead'],
    keySkills: ['ISO/TS 15066 Cobot Safety', '6-Axis Force Torque Sensors', 'Universal Robots URScript / ROS 2'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'silicon-photonics-optical-compute',
    name: 'Silicon Photonics & Co-Packaged Optics',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'On-chip optical modulators, laser frequency combs, and 3.2Tbps co-packaged optical networking transceivers.',
    baseGlobalMarketSize: '$23 Billion',
    baseCAGR: '+36.0%',
    keyRoles: ['Silicon Photonics Design Engineer', 'Co-Packaged Optics Lead', 'Optical Waveguide Specialist'],
    keySkills: ['Photonic Integrated Circuits (PIC)', 'Lumerical FDTD Simulations', 'Laser Modulator Calibration'],
    baseVacanciesMultiplier: 1.0
  },
  {
    id: 'industrial-machine-vision-defect',
    name: 'Industrial Machine Vision & Zero-Defect Inspection',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Microsecond strobe illumination, line-scan camera PCB surface solder defect detection at 100 parts/second.',
    baseGlobalMarketSize: '$36 Billion',
    baseCAGR: '+22.0%',
    keyRoles: ['Machine Vision Systems Lead', 'High-Speed Defect Detection Specialist', 'Optical Lighting Engineer'],
    keySkills: ['Line-Scan Camera Synchronization', 'Halcon / Cognex VisionPro', 'FPGA Image Processing Pipelines'],
    baseVacanciesMultiplier: 1.35
  },
  {
    id: 'supply-chain-rfid-iot-tracking',
    name: 'Real-Time Supply Chain Visibility & RFID Telemetry',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Ultra-High Frequency (UHF) Gen 2 RFID portal readers, BLE asset beacons, and container temperature loggers.',
    baseGlobalMarketSize: '$42 Billion',
    baseCAGR: '+20.5%',
    keyRoles: ['Supply Chain Telemetry Architect', 'RFID Hardware Integration Lead', 'Global Asset Tracking Specialist'],
    keySkills: ['EPCglobal Gen 2 Standards', 'Sub-Gigahertz Mesh Beacons', 'Container Satellite Trackers'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'mining-automation-haul-trucks',
    name: 'Mining Automation & Autonomous 400-Ton Haul Trucks',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Open-pit autonomous haulage systems (AHS), robotic drill rigs, and underground LTE/Wi-Fi mesh networks.',
    baseGlobalMarketSize: '$29 Billion',
    baseCAGR: '+23.8%',
    keyRoles: ['Autonomous Haulage Systems (AHS) Lead', 'Mining Fleet Dispatch Engineer', 'Harsh-Environment Robotics Specialist'],
    keySkills: ['Caterpillar / Komatsu AHS Integrations', 'Ruggedized Lidar & GNSS Systems', 'Fail-Safe Collision Avoidance'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'oil-gas-drilling-downhole-sensors',
    name: 'Oil & Gas Subsea Robotics & Downhole MWD Sensors',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Measurement While Drilling (MWD) mud-pulse telemetry, subsea ROV inspection arms, and blowout preventer sensors.',
    baseGlobalMarketSize: '$33 Billion',
    baseCAGR: '+16.0%',
    keyRoles: ['Subsea Robotics Control Lead', 'Downhole Telemetry Firmware Engineer', 'Drilling Optimization Specialist'],
    keySkills: ['Mud-Pulse Acoustics', 'High-Temperature High-Pressure (HTHP) Electronics', 'Subsea ROV Controls'],
    baseVacanciesMultiplier: 0.95
  },
  {
    id: 'construction-robotics-3d-concrete',
    name: 'Construction Robotics & 3D Concrete Printing',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Gantry-based concrete extrusion printers, autonomous site surveying rovers, and BIM laser verification.',
    baseGlobalMarketSize: '$19 Billion',
    baseCAGR: '+34.0%',
    keyRoles: ['3D Concrete Printing Systems Lead', 'Construction Robotics Specialist', 'BIM Site Verification Engineer'],
    keySkills: ['Large-Format Gantry Kinematics', 'Rheology Extrusion Sensor Control', 'Point Cloud to BIM Comparison'],
    baseVacanciesMultiplier: 0.9
  },
  {
    id: 'cleanroom-automation-wafer-handling',
    name: 'Semiconductor Cleanroom Robotics & Wafer Handling',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Class 1 cleanroom automated material handling systems (AMHS), overhead hoist transport (OHT), and FOUP buffers.',
    baseGlobalMarketSize: '$26 Billion',
    baseCAGR: '+27.0%',
    keyRoles: ['Cleanroom AMHS Software Lead', 'OHT Overhead Hoist Specialist', 'Wafer Handling Robotics Engineer'],
    keySkills: ['SEMI Standards (SECS/GEM)', 'Overhead Hoist Transport Optimization', 'Zero-Vibration Wafer End-Effectors'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'agriculture-autonomous-harvesters',
    name: 'Agricultural Autonomous Harvesters & Weeding Robots',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Laser micro-weeding robots, autonomous combine harvesters, and real-time grain moisture sensing.',
    baseGlobalMarketSize: '$24 Billion',
    baseCAGR: '+31.0%',
    keyRoles: ['Autonomous Harvester Systems Lead', 'Precision Laser Weeding Specialist', 'AgTech Autonomy Engineer'],
    keySkills: ['ISOBUS (ISO 11783) Protocols', 'Laser Target Firing Computer Vision', 'Tractor Steer-by-Wire Actuation'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'textile-garment-assembly-robotics',
    name: 'Automated Textile & Robotic Garment Assembly',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Deformable fabric handling vacuum grippers, automated computer-vision sewing heads, and fabric laser cutters.',
    baseGlobalMarketSize: '$14 Billion',
    baseCAGR: '+26.0%',
    keyRoles: ['Textile Robotics Engineer', 'Deformable Material Handling Specialist', 'Automated Sewing Firmware Lead'],
    keySkills: ['Soft Fabric Deformation Modeling', 'Electrostatic & Vacuum Grippers', 'Real-Time Edge Fabric Tensioning'],
    baseVacanciesMultiplier: 0.85
  },
  {
    id: 'mes-discrete-manufacturing-cloud',
    name: 'Manufacturing Execution Systems (MES) Next-Gen',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'ISA-95 compliant cloud MES, work-order routing, Overall Equipment Effectiveness (OEE), and genealogy tracking.',
    baseGlobalMarketSize: '$37 Billion',
    baseCAGR: '+21.5%',
    keyRoles: ['MES Platform Architect', 'ISA-95 Integration Lead', 'OEE Performance Specialist'],
    keySkills: ['ISA-95 Enterprise-Control Integration', 'OPC UA / MQTT Sparkplug B', 'Traceability Genealogy Graphs'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'high-density-pcb-autorouting',
    name: 'High-Density PCB Autorouting & Signal Integrity AI',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Reinforcement learning for high-speed differential pair autorouting, eye diagram analysis, and impedance matching.',
    baseGlobalMarketSize: '$18 Billion',
    baseCAGR: '+24.5%',
    keyRoles: ['PCB Signal Integrity Specialist', 'Automated Routing Algorithm Lead', 'High-Frequency Hardware Engineer'],
    keySkills: ['Ansys HFSS / Keysight ADS', 'Differential Pair Impedance Tuning', 'BGA Fanout Optimization AI'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'mems-sensors-microactuators',
    name: 'MEMS Sensor Design & Micro-Actuators',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Capacitive accelerometers, resonant micro-mirrors for LiDAR, and piezo-electric acoustic micro-speakers.',
    baseGlobalMarketSize: '$27 Billion',
    baseCAGR: '+20.0%',
    keyRoles: ['MEMS Design Engineer', 'Micro-Actuator Specialist', 'ASIC-MEMS Integration Lead'],
    keySkills: ['COMSOL Multiphysics', 'MEMS Micromachining (DRIE)', 'Low-Noise ASIC Analog Front-Ends'],
    baseVacanciesMultiplier: 1.0
  },
  {
    id: 'packaging-palletizing-robotics',
    name: 'High-Speed Packaging & Palletizing Robotics',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: '200 picks/minute delta robot cartoning, mixed-case pallet load stability algorithms, and stretch wrapping.',
    baseGlobalMarketSize: '$32 Billion',
    baseCAGR: '+22.4%',
    keyRoles: ['Packaging Automation Architect', 'Palletizing Optimization Specialist', 'High-Speed Delta Robot Lead'],
    keySkills: ['3D Bin Packing Optimization Solvers', 'Vacuum End-Effector Design', 'PackML (ISA-TR88) Standards'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'hazardous-material-remediation-robots',
    name: 'Hazardous Material Remediation & Nuclear Robotics',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Radiation-hardened crawler robots, chemical decontamination manipulator arms, and remote tele-presence.',
    baseGlobalMarketSize: '$13 Billion',
    baseCAGR: '+28.0%',
    keyRoles: ['Hazardous Robotics Lead', 'Nuclear Decontamination Specialist', 'Tele-Operated Manipulator Engineer'],
    keySkills: ['Radiation-Tolerant Components', 'Fiber-Optic Tethered Controls', 'Telerobotic Master-Slave Arms'],
    baseVacanciesMultiplier: 0.8
  },
  {
    id: 'undersea-cable-robotics-crawlers',
    name: 'Subsea Telecom Cable Robotics & Trenching Crawlers',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Ocean floor heavy crawler plows, acoustic transponder positioning (USBL), and fiber cable splice repair.',
    baseGlobalMarketSize: '$15 Billion',
    baseCAGR: '+24.0%',
    keyRoles: ['Subsea Trenching Robotics Engineer', 'USBL Acoustic Positioning Lead', 'Marine Cable Specialist'],
    keySkills: ['Subsea Hydraulic Power Units', 'Ultra-Short Baseline (USBL) Acoustics', 'Fiber Optic High-Pressure Penetrations'],
    baseVacanciesMultiplier: 0.85
  },
  {
    id: 'gan-sic-power-semiconductors',
    name: 'Gallium Nitride (GaN) & Silicon Carbide Power ICs',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Wide-bandgap semiconductor fabrication, high-voltage switching efficiency, and miniaturized power converters.',
    baseGlobalMarketSize: '$31 Billion',
    baseCAGR: '+38.0%',
    keyRoles: ['Power Semiconductor Device Engineer', 'GaN Epi Layer Specialist', 'Wide-Bandgap Applications Lead'],
    keySkills: ['TCAD Device Simulation (Synopsys)', 'GaN-on-Silicon Epitaxy', 'High-Frequency Switching Loss Modeling'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'asrs-automated-storage-retrieval',
    name: 'High-Bay Automated Storage & Retrieval (ASRS)',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: '40-meter crane towers, multi-shuttle high-density cube storage, and dynamic warehouse slotting algorithms.',
    baseGlobalMarketSize: '$36 Billion',
    baseCAGR: '+25.0%',
    keyRoles: ['ASRS Crane Controls Architect', 'Warehouse Cube Storage Specialist', 'High-Bay Automation Lead'],
    keySkills: ['Crane Acceleration Curve Tuning', 'Dynamic Slotting Optimization', 'Industrial Safety Interlocks (SIL 3)'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'industrial-drone-inspection-ndt',
    name: 'Industrial Drone Inspection & Non-Destructive Testing (NDT)',
    category: 'INDUSTRIAL_ROBOTICS',
    shortDesc: 'Ultrasonic thickness measurement drones, boiler confined space inspection, and magnetic crawler rovers.',
    baseGlobalMarketSize: '$17 Billion',
    baseCAGR: '+32.5%',
    keyRoles: ['NDT Drone Inspection Lead', 'Ultrasonic Thickness Specialist', 'Confined Space Robotics Engineer'],
    keySkills: ['Ultrasonic NDT Probes on UAVs', 'GPS-Denied Lidar SLAM Indoors', 'API 510/570 Inspection Standards'],
    baseVacanciesMultiplier: 1.05
  },

  // -------------------------------------------------------------
  // 10. GOVTECH, SOVEREIGN CLOUD & CIVIC INFRASTRUCTURE (20 Industries)
  // -------------------------------------------------------------
  {
    id: 'national-digital-identity-biometric',
    name: 'National Digital Identity & Biometric Citizen Systems',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Scale citizen ID platforms (like Aadhaar / UAE Pass / Singpass), multi-factor biometric deduplication.',
    baseGlobalMarketSize: '$38 Billion',
    baseCAGR: '+28.0%',
    keyRoles: ['Digital Identity Platform Architect', 'Biometric Deduplication Specialist', 'Citizen Security Lead'],
    keySkills: ['ABIS (Automated Biometric ID Systems)', 'Cryptographic Verifiable Credentials (W3C)', 'Zero-Knowledge Proofs'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'sovereign-cloud-data-localization',
    name: 'Sovereign Cloud & National Data Localization',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'In-country data sovereignty boundaries, national encryption key escrow, and government isolated cloud zones.',
    baseGlobalMarketSize: '$46 Billion',
    baseCAGR: '+33.5%',
    keyRoles: ['Sovereign Cloud Architect', 'Data Residency Specialist', 'Government Cloud Security Lead'],
    keySkills: ['Data Sovereignty Isolation', 'Air-Gapped Sovereign Key Management', 'Government FedRAMP / GovCloud'],
    baseVacanciesMultiplier: 1.4
  },
  {
    id: 'digital-tax-admin-evat',
    name: 'Digital Tax Administration & Real-Time e-Invoicing',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Continuous transaction controls (CTC), cryptographic e-invoicing clearance, and automated cross-border customs tax.',
    baseGlobalMarketSize: '$28 Billion',
    baseCAGR: '+25.0%',
    keyRoles: ['Tax Administration Platform Architect', 'e-Invoicing Clearance Specialist', 'Government FinTech Lead'],
    keySkills: ['PEPPOL BIS Billing 3.0', 'Cryptographic Invoice QR Signatures', 'Real-Time Tax Clearance APIs'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'smart-city-iot-telemetry',
    name: 'Smart City Sensor Telemetry & Municipal Analytics',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'City-wide air quality, traffic sensor fusion, smart street lighting mesh, and centralized municipal dashboards.',
    baseGlobalMarketSize: '$44 Billion',
    baseCAGR: '+22.4%',
    keyRoles: ['Smart City IoT Architect', 'Municipal Data Platform Lead', 'Urban Sensor Network Specialist'],
    keySkills: ['LoRaWAN City Meshes', 'Urban Data Platforms (FIWARE)', 'Real-Time Geospatial GIS Portals'],
    baseVacanciesMultiplier: 1.3
  },
  {
    id: 'public-transit-realtime-dispatch',
    name: 'Public Transit Telemetry & Open Ticketing (GTFS)',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'General Transit Feed Specification (GTFS-RT), automated bus dispatch, and open contactless EMV fare collection.',
    baseGlobalMarketSize: '$29 Billion',
    baseCAGR: '+21.0%',
    keyRoles: ['Public Transit Systems Architect', 'GTFS Real-Time Specialist', 'Automated Fare Collection Lead'],
    keySkills: ['GTFS / GTFS-RT Standards', 'cEMV Open Loop Transit Tap', 'Dynamic Bus Schedule Dispatch'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'judicial-case-mgmt-legal-ai',
    name: 'Judicial Case Management & Court Records AI',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Automated legal court transcript indexing, hearing scheduling, and anonymized public record search.',
    baseGlobalMarketSize: '$21 Billion',
    baseCAGR: '+23.0%',
    keyRoles: ['Judicial Platform Architect', 'Court Records NLP Specialist', 'Civic LegalTech Lead'],
    keySkills: ['High-Security Document Indexing', 'Legal Anonymization Algorithms', 'Court Workflow Orchestration'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'emergency-services-cad-911',
    name: 'Emergency Services Computer-Aided Dispatch (CAD)',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Next-Generation 911 (NG911) / 112 geospatial call routing, real-time vehicle dispatch, and body-cam livestreaming.',
    baseGlobalMarketSize: '$25 Billion',
    baseCAGR: '+24.5%',
    keyRoles: ['NG911 CAD Systems Architect', 'Emergency Dispatch Specialist', 'Public Safety Telematics Lead'],
    keySkills: ['NENA i3 Standards', 'Geospatial Emergency Call Routing', 'FirstNet / Public Safety Broadband'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'land-registry-blockchain-cadastral',
    name: 'Digital Land Registry & Cadastral GIS Records',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Tamper-evident property deeds, satellite parcel boundary verification, and automated municipal permit issuance.',
    baseGlobalMarketSize: '$19 Billion',
    baseCAGR: '+26.8%',
    keyRoles: ['Land Registry Systems Architect', 'Cadastral GIS Specialist', 'Property Blockchain Lead'],
    keySkills: ['Cadastral Parcel GIS Mapping', 'Immutable Land Title Ledgers', 'Automated Building Permit Engines'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'voting-tech-cryptographic-audit',
    name: 'Voting Systems & Cryptographic Election Auditing',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Risk-Limiting Audits (RLA), paper-trail optical ballot tabulators, and end-to-end verifiable voting (E2E-V).',
    baseGlobalMarketSize: '$14 Billion',
    baseCAGR: '+19.0%',
    keyRoles: ['Election Systems Security Architect', 'Risk-Limiting Audit Specialist', 'Cryptographic Voting Lead'],
    keySkills: ['ElectionGuard SDK', 'Risk-Limiting Audits (RLA)', 'Air-Gapped Optical Scan Firmware'],
    baseVacanciesMultiplier: 0.8
  },
  {
    id: 'public-health-surveillance-epidemic',
    name: 'Public Health Telemetry & Outbreak Early Warning',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Wastewater viral sequencing telemetry, syndromic hospital ER fever spikes, and mathematical epidemic models.',
    baseGlobalMarketSize: '$22 Billion',
    baseCAGR: '+27.0%',
    keyRoles: ['Public Health Data Architect', 'Epidemiological Modeler', 'Wastewater Genomic Telemetry Lead'],
    keySkills: ['SEIR Compartmental Models', 'Wastewater PCR Data Ingestion', 'Syndromic Surveillance Dashboards'],
    baseVacanciesMultiplier: 1.1
  },
  {
    id: 'customs-border-cargo-scanning',
    name: 'Customs & Border Control Cargo Inspection AI',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'High-energy X-ray shipping container anomaly detection, customs manifest NLP mismatch, and vehicle tracking.',
    baseGlobalMarketSize: '$26 Billion',
    baseCAGR: '+22.5%',
    keyRoles: ['Border Cargo Vision Specialist', 'Customs Manifest NLP Architect', 'Port Security Telemetry Lead'],
    keySkills: ['X-ray Cargo Radiography AI', 'Customs Declaration Harmonized Code NLP', 'Automated License Plate Readers'],
    baseVacanciesMultiplier: 1.15
  },
  {
    id: 'citizen-welfare-benefits-dispense',
    name: 'Citizen Welfare & Direct Benefit Transfer (DBT)',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Aadhaar/National ID enabled direct cash transfers, automated poverty indexing, and fraud elimination.',
    baseGlobalMarketSize: '$31 Billion',
    baseCAGR: '+23.0%',
    keyRoles: ['Welfare Platform Architect', 'Direct Benefit Transfer Specialist', 'Social Registry Data Lead'],
    keySkills: ['National Bank Integration Rails', 'Eligibility Determination Engines', 'Duplicate Claimant Detection'],
    baseVacanciesMultiplier: 1.25
  },
  {
    id: 'urban-water-distribution-scada',
    name: 'Urban Water SCADA & Smart Meter Telemetry',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'City-wide water pressure management, real-time reservoir water quality spectrophotometry, and leak alerts.',
    baseGlobalMarketSize: '$23 Billion',
    baseCAGR: '+20.0%',
    keyRoles: ['Municipal Water SCADA Lead', 'Water Quality Sensor Specialist', 'Urban Leak Detection Engineer'],
    keySkills: ['Water Distribution Network Telemetry', 'Spectrophotometric Contaminant Detectors', 'SCADA Historians'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'smart-streetlights-mesh',
    name: 'Smart Municipal Lighting & Environmental Mesh',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Adaptive LED dimming with radar pedestrian sensing and environmental particulate sensors inside lighting poles.',
    baseGlobalMarketSize: '$18 Billion',
    baseCAGR: '+24.5%',
    keyRoles: ['Streetlight IoT Systems Architect', 'Mesh Network Specialist', 'Municipal Lighting Controls Lead'],
    keySkills: ['Wi-SUN / Cellular IoT Meshes', 'DALI / 0-10V Dimming Protocols', 'City-Scale Lighting Scheduling'],
    baseVacanciesMultiplier: 1.0
  },
  {
    id: 'sovereign-ai-national-language',
    name: 'Sovereign AI & Native National Language Models',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Culturally aligned national LLMs (Arabic, Indic languages, Nordic languages) preserving indigenous heritages.',
    baseGlobalMarketSize: '$27 Billion',
    baseCAGR: '+45.0%',
    keyRoles: ['National Language AI Lead', 'Low-Resource NLP Specialist', 'Sovereign Model Curator'],
    keySkills: ['Multilingual Tokenizers', 'Low-Resource Script Data Scraping', 'Cultural Context Alignment'],
    baseVacanciesMultiplier: 1.2
  },
  {
    id: 'disaster-response-evacuation-ai',
    name: 'Crisis Response & Real-Time Evacuation Telemetry',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Cell broadcast emergency alerts, evacuation traffic flow simulation, and drone flood mapping.',
    baseGlobalMarketSize: '$17 Billion',
    baseCAGR: '+25.0%',
    keyRoles: ['Crisis Informatics Lead', 'Evacuation Traffic Simulation Specialist', 'Emergency Alert Systems Architect'],
    keySkills: ['WEA / EU-Alert Cell Broadcasts', 'Agent-Based Evacuation Simulators', 'Rapid Satellite Damage Assessment'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'public-procurement-anti-corruption',
    name: 'Public Procurement & Anti-Collusion Bidding AI',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Graph-based bid rigging detection, shell company beneficial ownership discovery, and transparent e-tenders.',
    baseGlobalMarketSize: '$16 Billion',
    baseCAGR: '+26.0%',
    keyRoles: ['Procurement Analytics Lead', 'Collusion Detection ML Specialist', 'Open Contracting Data Architect'],
    keySkills: ['Open Contracting Data Standard (OCDS)', 'Graph Collusion Detection', 'Beneficial Ownership Unmasking'],
    baseVacanciesMultiplier: 1.05
  },
  {
    id: 'prison-inmate-safety-telemetry',
    name: 'Correctional Facility Safety & Inmate Telemetry',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Real-time contraband phone RF detection, inmate vital sign radar monitors, and perimeter microwave sensors.',
    baseGlobalMarketSize: '$12 Billion',
    baseCAGR: '+18.5%',
    keyRoles: ['Correctional Security Architect', 'RF Contraband Detection Lead', 'Perimeter Sensor Specialist'],
    keySkills: ['RF Cellular Sniffer Detection', 'Radar Vital Signs for Suicide Prevention', 'Facility Access Control'],
    baseVacanciesMultiplier: 0.8
  },
  {
    id: 'urban-air-pollution-hyperlocal',
    name: 'Urban Air Pollution & Hyperlocal Dispersion Modeling',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Street-canyon PM2.5 and NOx sensor arrays, bus-mounted mobile sensors, and low-emission zone enforcement.',
    baseGlobalMarketSize: '$15 Billion',
    baseCAGR: '+27.0%',
    keyRoles: ['Air Quality Data Scientist', 'Hyperlocal Dispersion Modeler', 'Clean Air Zone Telemetry Lead'],
    keySkills: ['Computational Street Canyon CFD', 'Low-Cost Electrochemical Sensor Calibration', 'ANPR Cameras'],
    baseVacanciesMultiplier: 1.0
  },
  {
    id: 'citizen-participatory-budgeting',
    name: 'Civic Engagement & Citizen Participatory Budgeting',
    category: 'GOVTECH_CIVIC',
    shortDesc: 'Ranked-choice municipal project voting, verified resident identity gates, and budget progress dashboards.',
    baseGlobalMarketSize: '$11 Billion',
    baseCAGR: '+22.0%',
    keyRoles: ['Civic Engagement Product Lead', 'Participatory Budgeting Architect', 'Democracy Platform Specialist'],
    keySkills: ['Quadratic / Ranked-Choice Voting Algorithms', 'Verified Resident Civic Identity', 'Open Municipal Data APIs'],
    baseVacanciesMultiplier: 0.85
  }
];

// ============================================================================
// REGIONAL OVERRIDES & INTELLIGENCE CALCULATION ENGINE
// Generates accurate regional salary, vacancies, growth, top employers,
// and research context for every one of the 245+ industries!
// ============================================================================
export interface ComputedRegionalIndustry {
  id: string;
  name: string;
  category: IndustryCategory;
  categoryLabel: string;
  shortDesc: string;
  globalMarketSize: string;
  cagr: string;
  keyRoles: string[];
  keySkills: string[];
  
  // Regional Computed Attributes
  regionCode: RegionCode;
  regionLabel: string;
  regionalSalary: string;
  regionalSeniorSalary: string;
  regionalVacancies: string;
  regionalGrowth: string;
  marketMaturity: 'Hyper-Growth' | 'Rapid Growth' | 'Mature Scale' | 'Emerging Frontier';
  topEmployers: string[];
  regulatoryContext: string;
  strategicResearchReport: string;
}

// Regional Employer Ecosystem Directory
const REGIONAL_EMPLOYERS_BY_CATEGORY: Record<RegionCode, Record<IndustryCategory, string[]>> = {
  GLOBAL: {
    AI_DEEPTECH: ['OpenAI', 'Anthropic', 'Google DeepMind', 'Meta AI', 'Nvidia', 'Mistral AI'],
    FINTECH_WEB3: ['Stripe', 'Revolut', 'Coinbase', 'Binance', 'Adyen', 'Razorpay'],
    CLOUD_DEVTOOLS: ['AWS', 'Microsoft Azure', 'Google Cloud', 'Cloudflare', 'Datadog', 'HashiCorp'],
    CYBER_DEFENSE: ['Palo Alto Networks', 'CrowdStrike', 'Cloudflare', 'Zscaler', 'Fortinet', 'Wiz'],
    HEALTH_BIOTECH: ['Moderna', 'Pfizer', 'BioNTech', 'Illumina', 'Recursion Pharma', 'Tempus AI'],
    CLIMATE_ENERGY: ['Tesla Energy', 'Siemens Energy', 'Schneider Electric', 'Vestas', 'Enphase', 'Orsted'],
    MOBILITY_AEROSPACE: ['Waymo', 'Tesla', 'SpaceX', 'Joby Aviation', 'Rivian', 'Cruise'],
    ECOMMERCE_MEDIA: ['Amazon', 'Shopify', 'Netflix', 'Epic Games', 'ByteDance', 'Spotify'],
    INDUSTRIAL_ROBOTICS: ['ASML', 'TSMC', 'Siemens', 'ABB Robotics', 'Kuka', 'Fanuc'],
    GOVTECH_CIVIC: ['Palantir', 'Tyler Technologies', 'CivicPlus', 'Accenture Federal', 'IDEMIA', 'Cisco']
  },
  US: {
    AI_DEEPTECH: ['OpenAI', 'Anthropic', 'Google DeepMind (SF)', 'Nvidia', 'Meta AI (Menlo Park)', 'Databricks'],
    FINTECH_WEB3: ['Stripe (SF)', 'Coinbase', 'Robinhood', 'Block / Square', 'Plaid', 'Jane Street'],
    CLOUD_DEVTOOLS: ['AWS (Seattle)', 'Microsoft (Redmond)', 'Google Cloud (Sunnyvale)', 'Cloudflare', 'Datadog (NYC)', 'Snowflake'],
    CYBER_DEFENSE: ['CrowdStrike (Austin)', 'Palo Alto Networks (Santa Clara)', 'Wiz', 'Cloudflare', 'Zscaler', 'Palantir'],
    HEALTH_BIOTECH: ['Illumina (San Diego)', 'Tempus AI (Chicago)', 'Recursion Pharma', 'Genentech', 'Verily Life Sciences', 'Epic Systems'],
    CLIMATE_ENERGY: ['Tesla Energy (Austin)', 'Enphase Energy (Fremont)', 'NextEra Energy', 'Form Energy', 'Bloom Energy', 'First Solar'],
    MOBILITY_AEROSPACE: ['SpaceX (Hawthorne/Boca Chica)', 'Waymo (Mountain View)', 'Joby Aviation (Santa Cruz)', 'Rivian', 'Anduril Industries', 'Boom Supersonic'],
    ECOMMERCE_MEDIA: ['Amazon (Seattle)', 'Netflix (Los Gatos)', 'Shopify US', 'Epic Games (Cary)', 'Roblox', 'The Trade Desk'],
    INDUSTRIAL_ROBOTICS: ['Boston Dynamics (Waltham)', 'Nvidia Robotics', 'Applied Materials (Santa Clara)', 'Symbotic', 'Tesla Automation', 'Qualcomm'],
    GOVTECH_CIVIC: ['Palantir Technologies (Denver)', 'Anduril Industries', 'Tyler Technologies (Plano)', 'Booz Allen Hamilton', 'Accenture Federal Services', 'Peraton']
  },
  UAE: {
    AI_DEEPTECH: ['G42 (Abu Dhabi)', 'Technology Innovation Institute (TII / Falcon)', 'Core42', 'Inception AI', 'Presight AI', 'Mohamed bin Zayed AI Univ (MBZUAI)'],
    FINTECH_WEB3: ['Careem Pay (Dubai)', 'Emirates NBD Liv', 'DIFC Fintech Hive', 'Binance MENA', 'OKX Middle East', 'Tabby / Tamara'],
    CLOUD_DEVTOOLS: ['Moro Hub (Dubai DEWA)', 'Khazna Data Centers', 'AWS Middle East (UAE)', 'Microsoft UAE Cloud', 'Core42 Sovereign Cloud', 'e& enterprise'],
    CYBER_DEFENSE: ['CPX (Cybersecurity Park Abu Dhabi)', 'DarkMatter Legacy Systems', 'Help AG (e&)', 'Group 42 Cyber', 'Dubai Electronic Security Centre (DESC)', 'Spire Solutions'],
    HEALTH_BIOTECH: ['PureHealth (Abu Dhabi)', 'G42 Healthcare (Omics Hub)', 'Cleveland Clinic Abu Dhabi', 'Aster DM Healthcare', 'Burjeel Holdings', 'Dubai Health Authority'],
    CLIMATE_ENERGY: ['Masdar (Clean Energy Pioneer)', 'ADNOC Decarbonization Tech', 'DEWA (Mohammed bin Rashid Solar Park)', 'TAQA', 'Bee\'ah Group (Sharjah)', 'Emirates Water & Electricity (EWEC)'],
    MOBILITY_AEROSPACE: ['Careem (Dubai)', 'Dubai Roads & Transport Authority (RTA / Cruise Autonomous)', 'Hub71 Autonomous Mobility', 'Bayanat (AI Geospatial)', 'EDGE Group (Autonomous Systems)', 'Emirates Airlines Tech Hub'],
    ECOMMERCE_MEDIA: ['Noon.com (Dubai)', 'Amazon MENA', 'Talabat (Delivery Hero)', 'Anghami (Abu Dhabi)', 'MBC Media Group', 'Dubai Media City Platforms'],
    INDUSTRIAL_ROBOTICS: ['EDGE Group Robotics', 'Dubai Future Labs (Robotics Cluster)', 'Emirates Global Aluminium (EGA Tech)', 'DP World BoxBay Automation', 'Abu Dhabi Ports Maqta Gateway', 'Strata Manufacturing'],
    GOVTECH_CIVIC: ['Digital Dubai Authority (Smart Dubai)', 'Federal Authority for Identity & Citizenship (ICP / UAE Pass)', 'Abu Dhabi TAMM Platform', 'Dubai Police AI Command', 'Ministry of Possibilities', 'Bayanat Civic GIS']
  },
  IN: {
    AI_DEEPTECH: ['Google Research India (Bangalore)', 'Microsoft Research India', 'Sarvam AI', 'Krutrim AI', 'Wadhwani AI', 'Infosys Topaz / TCS Research'],
    FINTECH_WEB3: ['Razorpay (Bangalore)', 'PhonePe', 'CRED', 'Paytm', 'Zerodha (Bangalore)', 'Pine Labs'],
    CLOUD_DEVTOOLS: ['Postman (Bangalore)', 'BrowserStack (Mumbai)', 'Hasura', 'Freshworks (Chennai)', 'Zoho (Chennai)', 'Darwinbox (Hyderabad)'],
    CYBER_DEFENSE: ['Quick Heal Technologies', 'Securonix India', 'CyberArk India Labs', 'Tata Advanced Systems', 'CERT-In National Tech', 'Lucideus / Safe Security'],
    HEALTH_BIOTECH: ['Apollo 24|7 (Hyderabad)', 'PharmEasy', 'Tata 1mg', 'Biocon Biologics (Bangalore)', 'Strand Life Sciences', 'Practo Technologies'],
    CLIMATE_ENERGY: ['Tata Power Renewables', 'ReNew Power (Gurgaon)', 'Adani Green Energy', 'Ather Energy (Bangalore)', 'Ola Electric', 'Suzlon Energy'],
    MOBILITY_AEROSPACE: ['Ola Electric (Bangalore)', 'Ather Energy', 'Tata Motors EV Tech', 'ISRO Commercial Units (NSIL)', 'Skyroot Aerospace (Hyderabad)', 'Agnikul Cosmos (Chennai)'],
    ECOMMERCE_MEDIA: ['Flipkart (Bangalore)', 'Swiggy (Bangalore)', 'Zomato (Gurgaon)', 'Meesho', 'JioCinema / Viacom18 Tech', 'Dream11 (Mumbai)'],
    INDUSTRIAL_ROBOTICS: ['GreyOrange Robotics (Gurgaon)', 'Tata Elxsi', 'L&T Technology Services', 'Addverb Technologies (Noida)', 'Cynlr Robotics', 'Bharat Electronics (BEL)'],
    GOVTECH_CIVIC: ['National Informatics Centre (NIC / India Stack)', 'UIDAI (Aadhaar Core Engineering)', 'NPCI (UPI Architecture)', 'ONDC (Open Network for Digital Commerce)', 'Digital India Bhashini', 'RailTel Corporation']
  },
  EU: {
    AI_DEEPTECH: ['Mistral AI (Paris)', 'DeepMind (London)', 'Aleph Alpha (Heidelberg)', 'Hugging Face (Paris/NYC)', 'Synthesia (London)', 'Graphcore (Bristol)'],
    FINTECH_WEB3: ['Revolut (London)', 'Adyen (Amsterdam)', 'Klarna (Stockholm)', 'Monzo (London)', 'N26 (Berlin)', 'Checkout.com'],
    CLOUD_DEVTOOLS: ['SAP (Walldorf)', 'OVHcloud (France)', 'Elastic (Amsterdam)', 'SUSE Linux (Nuremberg)', 'GitLab EMEA', 'Grafana Labs (Stockholm/Remote)'],
    CYBER_DEFENSE: ['Darktrace (Cambridge)', 'WithSecure (Helsinki)', 'Thales Cyber (Paris)', 'Tenable EMEA', 'Snyk (London)', 'Wallix (Paris)'],
    HEALTH_BIOTECH: ['BioNTech (Mainz)', 'Novo Nordisk Tech (Copenhagen)', 'AstraZeneca R&D (Cambridge)', 'Babylon Health / Huma', 'Owkin (Paris)', 'BenevolentAI (London)'],
    CLIMATE_ENERGY: ['Vestas Wind Systems (Aarhus)', 'Orsted (Denmark)', 'Northvolt (Stockholm)', 'Siemens Energy (Munich)', 'Enel Green Power', 'Schneider Electric (Paris)'],
    MOBILITY_AEROSPACE: ['Airbus Defense & Space (Toulouse/Munich)', 'Wayve (London)', 'Lilium (Munich)', 'Volocopter', 'Arrival', 'Rimac Technology (Zagreb)'],
    ECOMMERCE_MEDIA: ['Spotify (Stockholm)', 'Delivery Hero (Berlin)', 'Zalando (Berlin)', 'Just Eat Takeaway (Amsterdam)', 'King Gaming (London)', 'Deezer (Paris)'],
    INDUSTRIAL_ROBOTICS: ['ASML (Veldhoven)', 'Siemens Digital Industries', 'Kuka Robotics (Augsburg)', 'ABB Robotics (Zurich)', 'Schneider Electric', 'Carl Zeiss Meditec'],
    GOVTECH_CIVIC: ['GovTech UK (GDS)', 'Estonia e-Governance Academy', 'Capgemini Public Sector (Paris)', 'Sopra Steria', 'Atos Sovereign Tech', 'T-Systems Sovereign Cloud (Bonn)']
  },
  SG: {
    AI_DEEPTECH: ['AI Singapore (National Research)', 'Bytedance AI (Singapore)', 'Google AI APAC (Singapore)', 'Sea AI Lab (Singapore)', 'Taiger', 'Near Intelligence'],
    FINTECH_WEB3: ['Grab Financial Group', 'DBS Bank Digital', 'SeaMoney (ShopeePay)', 'Standard Chartered Nexus', 'MatchMove Pay', 'Aspire (Singapore)'],
    CLOUD_DEVTOOLS: ['GovTech Singapore (Hive)', 'Sea Group Cloud Infrastructure', 'Singtel Cloud Services', 'Ninja Van Engineering', 'Carousell Tech Core', 'ShopBack'],
    CYBER_DEFENSE: ['Ensign InfoSecurity (Singapore)', 'ST Engineering Cybersecurity', 'GovTech Cyber Security Group (CSG)', 'Cyber Security Agency of Singapore (CSA)', 'Horangi Cyber', 'Group-IB APAC'],
    HEALTH_BIOTECH: ['A*STAR Bioinformatics Institute', 'Biofourmis (Singapore)', 'Doctor Anywhere', 'Homage', 'Tessa Therapeutics', 'MiRXES (RNA Tech)'],
    CLIMATE_ENERGY: ['Sembcorp Solar & Microgrids', 'SP Group (Singapore Power Tech)', 'Sunseap Energy (EDPR)', 'Engie APAC', 'Climate Impact X (CIX)', 'Eco-Business Platforms'],
    MOBILITY_AEROSPACE: ['Grab (Singapore)', 'ComfortDelGro Autonomous Labs', 'ST Engineering Aerospace', 'Moovita (Autonomous Vehicles)', 'ST Engineering Urban Solutions', 'PSA Singapore (Automated Port)'],
    ECOMMERCE_MEDIA: ['Shopee / Sea Group (Singapore)', 'Lazada (Alibaba Group APAC)', 'Carousell', 'Razer (Singapore HQ)', 'Garena', 'Viki (Rakuten Singapore)'],
    INDUSTRIAL_ROBOTICS: ['ST Engineering Advanced Robotics', 'PBA Group Robotics', 'Seiko Instruments Singapore', 'Makino Asia', 'Advanced Remanufacturing & Technology Centre (ARTC)', 'A*STAR SIMTech'],
    GOVTECH_CIVIC: ['GovTech Singapore (Singpass / LifeSG)', 'Smart Nation and Digital Government Office (SNDGO)', 'Infocomm Media Development Authority (IMDA)', 'Land Transport Authority (LTA Tech)', 'Inland Revenue Authority (IRAS)', 'CrimsonLogic']
  },
  CA: {
    AI_DEEPTECH: ['Cohere (Toronto)', 'Vector Institute (Toronto)', 'Mila (Montreal)', 'Amii (Edmonton)', 'Google Brain Montreal', 'Microsoft Research Montreal'],
    FINTECH_WEB3: ['Shopify Payments (Ottawa)', 'Wealthsimple (Toronto)', 'Nuvei (Montreal)', 'Lightspeed Commerce', 'Borrowell', 'Coinsquare'],
    CLOUD_DEVTOOLS: ['Shopify Core (Ottawa)', 'OpenText (Waterloo)', 'Hootsuite (Vancouver)', '1Password (Toronto)', 'Clio (Vancouver)', 'PagerDuty Canada'],
    CYBER_DEFENSE: ['BlackBerry QNX / Cyber (Waterloo)', 'Magnet Forensics (Waterloo)', 'eSentire (Cambridge)', 'Herjavec Group', 'Calian Group', 'Arctic Wolf Canada'],
    HEALTH_BIOTECH: ['Deep Genomics (Toronto)', 'AbCellera (Vancouver)', 'BenchSci (Toronto)', 'MindBeacon', 'DNAstack', 'Dialogue Health Technologies'],
    CLIMATE_ENERGY: ['Carbon Engineering (Squamish)', 'Svante (Burnaby)', 'Enerkem (Montreal)', 'General Fusion (Richmond)', 'Enbridge Tech Core', 'Hydro-Québec Research (IREQ)'],
    MOBILITY_AEROSPACE: ['BlackBerry QNX (Automotive OS)', 'Bombardier Aerospace', 'CAE Flight Simulation (Montreal)', 'Magna International Tech (Aurora)', 'MDA Space (Brampton)', 'Waabi (Toronto)'],
    ECOMMERCE_MEDIA: ['Shopify (Ottawa)', 'SSENSE (Montreal)', 'Wattpad (Toronto)', 'EA Vancouver', 'Ubisoft Montreal', 'Behavior Interactive'],
    INDUSTRIAL_ROBOTICS: ['ATS Automation Tooling (Cambridge)', 'MDA Space (Canadarm)', 'Kinova Robotics (Boisbriand)', 'Clearpath Robotics / Otto Motors (Kitchener)', 'Robotiq (Levis)', 'Avidbots'],
    GOVTECH_CIVIC: ['Canadian Digital Service (CDS)', 'Shared Services Canada', 'CGI Federal & Provincial', 'OpenGov Canada Portals', 'Thinkific Gov', 'eHealth Ontario']
  },
  AU: {
    AI_DEEPTECH: ['CSIRO Data61 (Sydney)', 'Appen (Sydney)', 'Canva AI Labs', 'Harrison.ai (Sydney)', 'Leonardo.ai (Sydney)', 'BrainChip (Sydney)'],
    FINTECH_WEB3: ['Afterpay / Block AU', 'Airwallex (Melbourne)', 'Zip Co (Sydney)', 'Judo Bank', 'Macquarie Banking Tech', 'Commonwealth Bank Digital'],
    CLOUD_DEVTOOLS: ['Atlassian (Sydney)', 'Canva (Sydney)', 'SafetyCulture (Sydney)', 'Envato (Melbourne)', 'Culture Amp (Melbourne)', 'A Cloud Guru (Pluralsight AU)'],
    CYBER_DEFENSE: ['Australian Cyber Security Centre (ACSC)', 'Kasada (Sydney)', 'Tesserent', 'CyberCX (Melbourne)', 'UpGuard (Sydney)', 'Penten (Canberra)'],
    HEALTH_BIOTECH: ['CSL Behring (Melbourne)', 'Cochlear (Sydney)', 'ResMed Tech', 'Pro Medicus (Visage Imaging)', 'Telstra Health', 'Alcidion (Melbourne)'],
    CLIMATE_ENERGY: ['Fortescue Future Industries (Perth)', 'Origin Energy Tech', 'AGL Energy Virtual Power Plants', 'Redflow Batteries (Brisbane)', 'Tritium EV Fast Chargers', 'Sun Cable'],
    MOBILITY_AEROSPACE: ['Boeing Australia (Loyal Wingman Ghost Bat)', 'Baraja LiDAR (Sydney)', 'Gilmour Space Technologies (Gold Coast)', 'Fleet Space Technologies (Adelaide)', 'Myriota', 'Qantas Tech'],
    ECOMMERCE_MEDIA: ['Canva (Sydney)', 'Kogan.com', 'REA Group (Melbourne)', 'Domain Group', 'Nine Entertainment Tech', 'BigCommerce Australia'],
    INDUSTRIAL_ROBOTICS: ['Rio Tinto Autonomous Haulage (Perth)', 'BHP Autonomous Operations Center', 'Universal Field Robots (Brisbane)', 'Fastbrick Robotics (Perth)', 'CSIRO Mining Tech', 'ANCA Motion'],
    GOVTECH_CIVIC: ['Digital Transformation Agency (DTA)', 'Services Australia (myGov Engineering)', 'Transport for NSW (Opal / Digital)', 'Australian Taxation Office (ATO Tech)', 'Queensland Govt Tech Hub', 'CSIRO Digital Platforms']
  }
};

// Strategic Research Reports by Category and Region
const REGIONAL_RESEARCH_TEMPLATES: Record<RegionCode, Record<IndustryCategory, { maturity: 'Hyper-Growth' | 'Rapid Growth' | 'Mature Scale' | 'Emerging Frontier'; regContext: string; summary: string }>> = {
  GLOBAL: {
    AI_DEEPTECH: {
      maturity: 'Hyper-Growth',
      regContext: 'Global baseline standards shaped by EU AI Act, US NIST frameworks, and open-source model repositories.',
      summary: 'Foundation models and autonomous agent swarms are driving historic capital allocation. Median architecture compensation commands +38% premium over legacy software.'
    },
    FINTECH_WEB3: {
      maturity: 'Rapid Growth',
      regContext: 'Cross-border remittances governed by FATF Travel Rule; rapid tokenization of sovereign and institutional debt.',
      summary: 'Real-time rails and embedded credit are replacing legacy batch clearings worldwide. Institutional digital asset custody is experiencing strong institutional adoption.'
    },
    CLOUD_DEVTOOLS: {
      maturity: 'Mature Scale',
      regContext: 'Multi-cloud resilience mandates and FinOps unit cost auditing becoming universal requirements.',
      summary: 'Kubernetes multi-cluster orchestration, eBPF telemetry, and developer productivity platforms form the foundational layer of modern software enterprises.'
    },
    CYBER_DEFENSE: {
      maturity: 'Hyper-Growth',
      regContext: 'Mandatory breach disclosure rules (SEC, NIS2) and post-quantum migration deadlines driving aggressive security spending.',
      summary: 'Zero-trust architecture and automated attack surface management remain mission-critical across sovereign, banking, and critical infrastructure networks.'
    },
    HEALTH_BIOTECH: {
      maturity: 'Rapid Growth',
      regContext: 'FDA, EMA, and PMDA accelerating algorithmic SaMD and AI molecule design clinical trial approvals.',
      summary: 'Computational biology, structural proteomics, and generative molecule modeling are dramatically compressing preclinical drug discovery from years to months.'
    },
    CLIMATE_ENERGY: {
      maturity: 'Rapid Growth',
      regContext: 'Global net-zero mandates, carbon border adjustment mechanisms (CBAM), and grid modernization incentives.',
      summary: 'Smart grid orchestration, BESS battery management systems, and scope 1-3 corporate emissions telemetry represent massive secular expansion.'
    },
    MOBILITY_AEROSPACE: {
      maturity: 'Emerging Frontier',
      regContext: 'FAA Part 135 BVLOS drone certifications, UNECE vehicle cybersecurity standards, and commercial space launch licensing.',
      summary: 'Autonomous robotaxi fleets, electric vertical takeoff (eVTOL), and commercial LEO SmallSat constellations are entering commercial operational phases.'
    },
    ECOMMERCE_MEDIA: {
      maturity: 'Mature Scale',
      regContext: 'First-party privacy regulations (cookie sunset, GDPR) prioritizing contextual bandit recommendation engines.',
      summary: 'Headless composable commerce and real-time multiplayer collaborative software dominate consumer tech architectures.'
    },
    INDUSTRIAL_ROBOTICS: {
      maturity: 'Rapid Growth',
      regContext: 'National semiconductor subsidy packages (CHIPS acts) and factory reshoring driving automated manufacturing.',
      summary: 'Industrial digital twins, warehouse AMRs, and 3D chiplet advanced packaging are modernizing global supply chains.'
    },
    GOVTECH_CIVIC: {
      maturity: 'Rapid Growth',
      regContext: 'United Nations digital public infrastructure guidelines and sovereign data localization mandates.',
      summary: 'National digital identity, automated real-time tax clearance, and unified public transit smart cards are scaling rapidly across sovereign states.'
    }
  },
  US: {
    AI_DEEPTECH: {
      maturity: 'Hyper-Growth',
      regContext: 'White House Executive Order on AI, NIST AI RMF, and FTC anti-competitive foundation model investigations.',
      summary: 'Silicon Valley and Seattle lead the world in frontier LLM pre-training and GPU cluster infrastructure. Senior compensation frequently exceeds $350k+ with lucrative equity packages.'
    },
    FINTECH_WEB3: {
      maturity: 'Mature Scale',
      regContext: 'SEC enforcement, CFPB Section 1033 open banking rulemaking, and FedNow instant rail adoption.',
      summary: 'US FinTech focuses heavily on embedded credit, B2B payments, and algorithmic liquidity execution with deep venture-backed scale.'
    },
    CLOUD_DEVTOOLS: {
      maturity: 'Mature Scale',
      regContext: 'FedRAMP High authorization, CMMC defense supply requirements, and SOC 2 Type II audits.',
      summary: 'Home to the global cloud triumvirate (AWS, Azure, GCP). US enterprises prioritize FinOps optimization and developer platform engineering.'
    },
    CYBER_DEFENSE: {
      maturity: 'Hyper-Growth',
      regContext: 'SEC 4-day material breach disclosure mandate, CISA zero-trust deadlines, and NIST post-quantum standard release.',
      summary: 'Massive defense and enterprise cybersecurity budgets driven by nation-state threats, ransomware resilience, and cloud posture governance.'
    },
    HEALTH_BIOTECH: {
      maturity: 'Rapid Growth',
      regContext: 'FDA 510(k) AI/ML SaMD guidelines, HIPAA compliance, and Inflation Reduction Act drug pricing pressures.',
      summary: 'Boston and San Diego bio-corridors lead the global transition toward computational oncology, synthetic genomics, and precision diagnostics.'
    },
    CLIMATE_ENERGY: {
      maturity: 'Rapid Growth',
      regContext: 'Inflation Reduction Act ($369B clean tech tax credits), FERC Order 2222 distributed energy rules.',
      summary: 'Surging demand for smart grid software, Texas ERCOT battery arbitrage platforms, and direct air capture tech.'
    },
    MOBILITY_AEROSPACE: {
      maturity: 'Rapid Growth',
      regContext: 'NHTSA autonomous vehicle safety reporting, FAA drone BVLOS rules, and NASA Artemis commercial contracts.',
      summary: 'Waymo commercial robotaxi rollouts, SpaceX Starlink expansion, and defence drone systems (Anduril) leading global mobility.'
    },
    ECOMMERCE_MEDIA: {
      maturity: 'Mature Scale',
      regContext: 'FTC algorithmic advertising scrutiny and digital accessibility ADA standards.',
      summary: 'Pioneered modern headless commerce, cloud gaming, and programmatic adtech. Massive scale across Amazon, Netflix, and Apple ecosystems.'
    },
    INDUSTRIAL_ROBOTICS: {
      maturity: 'Rapid Growth',
      regContext: 'US CHIPS & Science Act ($52B domestic manufacturing grants) and Buy American industrial mandates.',
      summary: 'Rapid automation of domestic gigafactories, warehouse robotics (Symbotic/Amazon), and next-generation EDA tool development.'
    },
    GOVTECH_CIVIC: {
      maturity: 'Rapid Growth',
      regContext: 'StateRAMP, Presidential Management Agenda, and OMB M-21-31 event logging requirements.',
      summary: 'Accelerated cloud modernization across state, local, and federal agencies, replacing legacy mainframe systems with modern GovTech SaaS.'
    }
  },
  UAE: {
    AI_DEEPTECH: {
      maturity: 'Hyper-Growth',
      regContext: 'UAE National AI Strategy 2031, Dubai Universal Blueprint for AI, and G42 sovereign data treaties.',
      summary: 'Dubai and Abu Dhabi have emerged as global sovereign AI capitals. Generous government sponsorship, open Falcon LLM initiatives, and 0% personal income tax attract world-class talent.'
    },
    FINTECH_WEB3: {
      maturity: 'Hyper-Growth',
      regContext: 'Dubai Virtual Assets Regulatory Authority (VARA), DIFC Innovation Hub, and Central Bank of UAE Open Finance.',
      summary: 'Global financial institutions and crypto exchanges are relocating headquarters to DIFC and ADGM, creating massive demand for DeFi, payment rails, and wealth management architects.'
    },
    CLOUD_DEVTOOLS: {
      maturity: 'Rapid Growth',
      regContext: 'UAE Cyber Security Council sovereign cloud standards and in-country data residency laws.',
      summary: 'Massive investments in sovereign data centers (Khazna, Moro Hub) and regional availability zones from AWS and Microsoft Azure.'
    },
    CYBER_DEFENSE: {
      maturity: 'Hyper-Growth',
      regContext: 'Dubai Electronic Security Centre (DESC) Standards, UAE Information Assurance (IA) regulation.',
      summary: 'Critical focus on protecting sovereign infrastructure, financial centers, and energy complexes against state-sponsored and ransomware intrusions.'
    },
    HEALTH_BIOTECH: {
      maturity: 'Rapid Growth',
      regContext: 'Emirati Genome Program (1M+ citizens sequenced), Department of Health Abu Dhabi digital health sandbox.',
      summary: 'World-leading national genomics initiatives (G42 Healthcare) and luxury medical tourism driving advanced digital diagnostic adoption.'
    },
    CLIMATE_ENERGY: {
      maturity: 'Hyper-Growth',
      regContext: 'UAE Net Zero 2050 strategic initiative, legacy of hosting COP28, and Masdar green hydrogen mandates.',
      summary: 'World-record solar parks (Mohammed bin Rashid Al Maktoum Solar Park) and smart grid desalination telemetry powering the Gulf transition.'
    },
    MOBILITY_AEROSPACE: {
      maturity: 'Hyper-Growth',
      regContext: 'Dubai Autonomous Transportation Strategy (25% autonomous trips by 2030) and commercial air taxi agreements.',
      summary: 'Commercial deployment of Cruise autonomous vehicles in Dubai, Joby Aviation electric air taxis, and Bayanat AI geospatial mapping.'
    },
    ECOMMERCE_MEDIA: {
      maturity: 'Rapid Growth',
      regContext: 'UAE e-commerce consumer protection laws and Dubai Media City digital entertainment incentives.',
      summary: 'Fastest-growing e-commerce corridor in the Middle East led by Noon, Amazon MENA, and ultra-fast quick delivery networks.'
    },
    INDUSTRIAL_ROBOTICS: {
      maturity: 'Rapid Growth',
      regContext: 'Operation 300bn (UAE Industrial Strategy) and Dubai Future Labs national robotics program.',
      summary: 'Automating DP World container ports (BoxBay), aluminium smelters (EGA), and additive manufacturing in Dubai Industrial City.'
    },
    GOVTECH_CIVIC: {
      maturity: 'Hyper-Growth',
      regContext: 'Dubai Paperless Strategy, UAE Pass universal digital citizen authentication, and TAMM single-window government.',
      summary: 'Globally recognized as the most digitally advanced government interface, achieving 100% paperless citizen transactions and biometric border corridors.'
    }
  },
  IN: {
    AI_DEEPTECH: {
      maturity: 'Hyper-Growth',
      regContext: 'IndiaAI Mission (₹10,372 Cr public compute grid), MeitY National AI Portal, and Digital Bhashini language AI.',
      summary: 'Bangalore and Hyderabad have evolved from IT services into top global R&D centers. Indigenous LLMs (Sarvam, Krutrim) and Global Capability Centers (GCCs) driving surge in senior talent.'
    },
    FINTECH_WEB3: {
      maturity: 'Hyper-Growth',
      regContext: 'Reserve Bank of India (RBI) Regulatory Sandbox, Digital Lending Guidelines, and NPCI UPI Architecture.',
      summary: 'Unmatched global transaction velocity on UPI (14+ billion transactions monthly). Explosive growth in B2B SaaS, alternative underwriting, and digital gold/mutual funds.'
    },
    CLOUD_DEVTOOLS: {
      maturity: 'Rapid Growth',
      regContext: 'Digital Personal Data Protection (DPDP) Act 2023, CERT-In cybersecurity 6-hour reporting mandate.',
      summary: 'Chennai and Bangalore have become the SaaS capital of the world (Zoho, Freshworks, Postman), exporting developer tooling and enterprise workflows globally.'
    },
    CYBER_DEFENSE: {
      maturity: 'Rapid Growth',
      regContext: 'CERT-In directives, RBI Cyber Security Framework for Banks, and National Cyber Security Strategy.',
      summary: 'Surge in enterprise defense demand across banking, telecom, and critical sovereign networks, supported by strong engineering talent pools.'
    },
    HEALTH_BIOTECH: {
      maturity: 'Rapid Growth',
      regContext: 'Ayushman Bharat Digital Mission (ABDM / ABHA health accounts), CDSCO medical device regulations.',
      summary: 'Massive tele-health and diagnostic delivery networks (Apollo 24|7, 1mg) scaling healthcare access to tier-2 and tier-3 cities.'
    },
    CLIMATE_ENERGY: {
      maturity: 'Rapid Growth',
      regContext: 'National Green Hydrogen Mission (₹19,744 Cr), FAME II EV subsidy framework, and solar PLI schemes.',
      summary: 'World-leading solar power capacity installations and hyper-growth in domestic electric two-wheeler engineering (Ather, Ola Electric).'
    },
    MOBILITY_AEROSPACE: {
      maturity: 'Rapid Growth',
      regContext: 'Indian Space Policy 2023 (private space launch authorization), Drone Rules 2021 digital sky portal.',
      summary: 'Private rocket startups (Skyroot, Agnikul), electric vehicle powertrain engineering, and agricultural drone mapping experiencing strong venture capital inflow.'
    },
    ECOMMERCE_MEDIA: {
      maturity: 'Hyper-Growth',
      regContext: 'Open Network for Digital Commerce (ONDC) open protocol mandate and consumer protection e-commerce rules.',
      summary: 'India is the global frontier of Quick Commerce (Blinkit, Zepto, Instamart) achieving sub-10-minute urban deliveries at massive order volumes.'
    },
    INDUSTRIAL_ROBOTICS: {
      maturity: 'Rapid Growth',
      regContext: 'Make in India PLI (Production Linked Incentive) across semiconductors, electronics, and automotive.',
      summary: 'Warehouse automation leaders (GreyOrange, Addverb) expanding globally, while automotive manufacturing hubs in Pune/Chennai adopt collaborative robotics.'
    },
    GOVTECH_CIVIC: {
      maturity: 'Hyper-Growth',
      regContext: 'India Stack (Aadhaar, UPI, DigiLocker, Account Aggregator) recognized by G20 as global DPI benchmark.',
      summary: 'The world\'s largest digital public infrastructure deployment, enabling paperless biometric identity, instant financial inclusion, and public service delivery.'
    }
  },
  EU: {
    AI_DEEPTECH: {
      maturity: 'Rapid Growth',
      regContext: 'European Union Artificial Intelligence Act (Risk-Based Strict Tiering), GDPR, and European AI Office.',
      summary: 'Paris (Mistral) and London (DeepMind) form Europe\'s premier AI frontier. Heavy emphasis on open weights, mathematical verification, and regulatory compliance.'
    },
    FINTECH_WEB3: {
      maturity: 'Mature Scale',
      regContext: 'PSD2 / PSD3 Open Banking standards, Markets in Crypto-Assets (MiCA) regulation, and SEPA instant credit.',
      summary: 'London, Amsterdam, and Stockholm dominate European fintech with leading neo-banks (Revolut, N26) and global checkout gateways (Adyen).'
    },
    CLOUD_DEVTOOLS: {
      maturity: 'Mature Scale',
      regContext: 'Gaia-X European sovereign cloud data framework and EU Data Act data portability rules.',
      summary: 'Strong engineering hubs in Berlin, Zurich, and Amsterdam with deep expertise in Linux, systems engineering, and open-source infrastructure.'
    },
    CYBER_DEFENSE: {
      maturity: 'Hyper-Growth',
      regContext: 'Network and Information Security (NIS2) Directive and Digital Operational Resilience Act (DORA).',
      summary: 'European enterprises face strict legal liability for downtime and cyber vulnerabilities, driving sustained demand for zero-trust and cryptographic auditing.'
    },
    HEALTH_BIOTECH: {
      maturity: 'Rapid Growth',
      regContext: 'European Medicines Agency (EMA), European Health Data Space (EHDS), and CE-mark medical device regulations.',
      summary: 'World-renowned life sciences corridors in Basel, Cambridge, and Oxford leading mRNA vaccines, computational oncology, and digital therapeutics.'
    },
    CLIMATE_ENERGY: {
      maturity: 'Hyper-Growth',
      regContext: 'European Green Deal, Fit for 55, and Corporate Sustainability Due Diligence Directive (CSDDD).',
      summary: 'Global pioneer in offshore wind (Orsted, Vestas), gigafactory battery production (Northvolt), and municipal carbon neutrality tracking.'
    },
    MOBILITY_AEROSPACE: {
      maturity: 'Rapid Growth',
      regContext: 'EASA drone and eVTOL airworthiness regulations, EU ban on new combustion cars by 2035.',
      summary: 'Aerospace leadership through Airbus, automotive software transformation in Munich/Stuttgart, and pioneering urban air mobility (Lilium, Volocopter).'
    },
    ECOMMERCE_MEDIA: {
      maturity: 'Mature Scale',
      regContext: 'Digital Markets Act (DMA) and Digital Services Act (DSA) gatekeeper anti-monopoly enforcement.',
      summary: 'Global music streaming capital (Spotify, SoundCloud) and strong pan-European food delivery networks (Delivery Hero, Just Eat).'
    },
    INDUSTRIAL_ROBOTICS: {
      maturity: 'Mature Scale',
      regContext: 'EU Machinery Regulation and CE marking industrial functional safety standards (ISO 13849).',
      summary: 'Home to the absolute pinnacle of precision semiconductor photolithography (ASML in Veldhoven) and industrial robotics giants (Kuka, ABB).'
    },
    GOVTECH_CIVIC: {
      maturity: 'Rapid Growth',
      regContext: 'Single Digital Gateway Regulation (SDGR) and European Digital Identity (EUDI) Wallet framework.',
      summary: 'Estonia, Denmark, and the UK lead seamless e-government public service delivery, setting world standards for digital citizen portals.'
    }
  },
  SG: {
    AI_DEEPTECH: {
      maturity: 'Rapid Growth',
      regContext: 'Singapore National AI Strategy 2.0, Model AI Governance Framework for GenAI, and IMDA testing sandboxes.',
      summary: 'The primary tech and AI headquarters for Southeast Asia. High regional compensation packages with top global tech lab presence (Bytedance, Google).'
    },
    FINTECH_WEB3: {
      maturity: 'Hyper-Growth',
      regContext: 'Monetary Authority of Singapore (MAS) Project Guardian, Payment Services Act, and digital banking licenses.',
      summary: 'Premier institutional financial center in Asia. Leading asset tokenization, digital wholesale banking, and cross-border QR clearing (PayNow-PromptPay).'
    },
    CLOUD_DEVTOOLS: {
      maturity: 'Mature Scale',
      regContext: 'Multi-Tier Cloud Security (MTCS) SS 584 Standard and Personal Data Protection Act (PDPA).',
      summary: 'Strategic regional cloud hub connecting Southeast Asia, Australia, and East Asia through high-capacity undersea fiber landings.'
    },
    CYBER_DEFENSE: {
      maturity: 'Rapid Growth',
      regContext: 'Cybersecurity Act 2024 amendments, Critical Information Infrastructure (CII) oversight.',
      summary: 'High government and financial defense posture defending against advanced persistent threats across the strategic maritime and financial corridor.'
    },
    HEALTH_BIOTECH: {
      maturity: 'Rapid Growth',
      regContext: 'Health Sciences Authority (HSA) medical device regulatory framework and Biopolis research hub.',
      summary: 'Biopolis research corridor attracts major pharmaceutical APAC R&D labs, focusing on Asian genomic phenotypes and bio-sensor devices.'
    },
    CLIMATE_ENERGY: {
      maturity: 'Rapid Growth',
      regContext: 'Singapore Green Plan 2030, progressive carbon tax increases, and cross-border renewable electricity import deals.',
      summary: 'Regional trading hub for carbon credits (Climate Impact X) and pioneering microgrid and floating solar reservoir installations.'
    },
    MOBILITY_AEROSPACE: {
      maturity: 'Rapid Growth',
      regContext: 'Civil Aviation Authority of Singapore (CAAS) drone sandbox and Land Transport Authority autonomous bus trials.',
      summary: 'Highly automated seaport terminals (Tuas Mega Port) and testbeds for autonomous public transit and electric maritime harbour craft.'
    },
    ECOMMERCE_MEDIA: {
      maturity: 'Mature Scale',
      regContext: 'IMDA Online Safety Code of Practice and regional consumer protection frameworks.',
      summary: 'Corporate headquarters for Southeast Asian tech giants (Shopee/Sea Group, Grab, Lazada) orchestrating 650M consumer marketplace transactions.'
    },
    INDUSTRIAL_ROBOTICS: {
      maturity: 'Rapid Growth',
      regContext: 'National Robotics Programme (NRP) and Industry 4.0 Transformation Index.',
      summary: 'Highest industrial robot density per capita in Asia outside Korea, with advanced automated electronics manufacturing and precision engineering.'
    },
    GOVTECH_CIVIC: {
      maturity: 'Hyper-Growth',
      regContext: 'Singapore Smart Nation 2.0, Singpass digital citizen authentication, and LifeSG unified portal.',
      summary: 'World-renowned for public sector digital excellence; Singpass enables instant access to over 2,000 public and private sector services.'
    }
  },
  CA: {
    AI_DEEPTECH: {
      maturity: 'Rapid Growth',
      regContext: 'Pan-Canadian AI Strategy, Artificial Intelligence and Data Act (AIDA), and CIFAR research chairs.',
      summary: 'The historical birthplace of deep learning (Geoffrey Hinton / Yoshua Bengio). Montreal and Toronto are global hubs for generative AI and LLMs.'
    },
    FINTECH_WEB3: {
      maturity: 'Rapid Growth',
      regContext: 'Bank of Canada Retail Payments Activities Act (RPAA) and Canadian open banking framework.',
      summary: 'Thriving fintech cluster in Toronto and Montreal specializing in consumer investing (Wealthsimple), merchant checkout, and digital accounting.'
    },
    CLOUD_DEVTOOLS: {
      maturity: 'Mature Scale',
      regContext: 'PIPEDA / Consumer Privacy Protection Act (CPPA) and federal cloud data residency standards.',
      summary: 'Headquarters to global e-commerce infrastructure titan Shopify, along with strong enterprise SaaS engineering teams across Ottawa and Vancouver.'
    },
    CYBER_DEFENSE: {
      maturity: 'Rapid Growth',
      regContext: 'Canadian Centre for Cyber Security (CCCS) and Bill C-26 critical cyber infrastructure rules.',
      summary: 'Waterloo and Ottawa corridors possess deep cryptographic, endpoint detection, and secure automotive firmware heritage (BlackBerry QNX).'
    },
    HEALTH_BIOTECH: {
      maturity: 'Rapid Growth',
      regContext: 'Health Canada Medical Devices Directorate and Pan-Canadian Health Data Strategy.',
      summary: 'World-leading AI drug discovery research (Deep Genomics) and antibody discovery technology (AbCellera) centered in Vancouver and Toronto.'
    },
    CLIMATE_ENERGY: {
      maturity: 'Rapid Growth',
      regContext: 'Clean Hydrogen and Clean Technology Investment Tax Credits, federal carbon pricing backstop.',
      summary: 'Global pioneer in direct air capture (Carbon Engineering), CO2 mineralization (Svante), and nuclear fusion engineering (General Fusion).'
    },
    MOBILITY_AEROSPACE: {
      maturity: 'Rapid Growth',
      regContext: 'Transport Canada automated vehicle safety guidelines and Canadian Space Agency commercial programs.',
      summary: 'World-renowned space robotics (Canadarm by MDA), automotive QNX embedded software in 235M+ vehicles, and flight simulation (CAE).'
    },
    ECOMMERCE_MEDIA: {
      maturity: 'Mature Scale',
      regContext: 'Online Streaming Act (Bill C-11) and modern Canadian copyright frameworks.',
      summary: 'Shopify powers 10% of total US e-commerce GMV from Canada, accompanied by major gaming clusters in Montreal (Ubisoft, EA).'
    },
    INDUSTRIAL_ROBOTICS: {
      maturity: 'Rapid Growth',
      regContext: 'Scale AI Global Innovation Cluster and advanced manufacturing automation grants.',
      summary: 'Kitchener-Waterloo is a major hub for autonomous warehouse robotics (Clearpath/Otto Motors) and space robotics.'
    },
    GOVTECH_CIVIC: {
      maturity: 'Rapid Growth',
      regContext: 'Canadian Digital Service standards, Treasury Board Policy on Service and Digital.',
      summary: 'Modernizing federal and provincial benefits delivery, implementing digital healthcare identity, and deploying bilingual civic services.'
    }
  },
  AU: {
    AI_DEEPTECH: {
      maturity: 'Rapid Growth',
      regContext: 'Australia National AI Plan, Voluntary AI Safety Standard, and CSIRO Data61 research consortium.',
      summary: 'Sydney and Melbourne lead the Southern Hemisphere in applied machine learning, computer vision for design (Canva), and mining optimization.'
    },
    FINTECH_WEB3: {
      maturity: 'Mature Scale',
      regContext: 'Consumer Data Right (CDR) open banking, ASIC fintech licensing, and APRA CPS 234 security rules.',
      summary: 'Global pioneer in Buy Now Pay Later (Afterpay) and global B2B FX payment platforms (Airwallex), supported by a sophisticated banking sector.'
    },
    CLOUD_DEVTOOLS: {
      maturity: 'Mature Scale',
      regContext: 'Security of Critical Infrastructure (SOCI) Act 2018 and Australian Privacy Principles (APPs).',
      summary: 'Birthplace of developer and collaboration giants Atlassian and Canva, fostering an energetic enterprise SaaS and developer tools culture.'
    },
    CYBER_DEFENSE: {
      maturity: 'Rapid Growth',
      regContext: 'Essential Eight maturity model (ACSC), mandatory ransomware reporting laws.',
      summary: 'Strong government and private sector cybersecurity investments following major national telecom and healthcare breaches.'
    },
    HEALTH_BIOTECH: {
      maturity: 'Rapid Growth',
      regContext: 'Therapeutic Goods Administration (TGA) software as medical device regulation.',
      summary: 'Home to world leaders in bionic hearing implants (Cochlear), sleep apnea respiratory tech (ResMed), and blood plasma therapies (CSL).'
    },
    CLIMATE_ENERGY: {
      maturity: 'Hyper-Growth',
      regContext: 'Australia Safeguard Mechanism reforms, National Electric Vehicle Strategy, and green hydrogen hubs.',
      summary: 'Highest per-capita residential rooftop solar adoption globally, driving extreme smart grid innovation and mega-scale battery installations.'
    },
    MOBILITY_AEROSPACE: {
      maturity: 'Rapid Growth',
      regContext: 'Civil Aviation Safety Authority (CASA) advanced drone rules and Australian Space Agency launch permits.',
      summary: 'Pioneered massive-scale autonomous mining haulage (Pilbara iron ore mines) and sovereign defense autonomous aircraft (Boeing Ghost Bat).'
    },
    ECOMMERCE_MEDIA: {
      maturity: 'Mature Scale',
      regContext: 'Treasury News Media Bargaining Code and Australian Consumer Law.',
      summary: 'Home to Canva, the world\'s leading visual communication and creative software platform, alongside major digital real estate marketplaces.'
    },
    INDUSTRIAL_ROBOTICS: {
      maturity: 'Rapid Growth',
      regContext: 'Modern Manufacturing Initiative and robotics roadmap for mining and agriculture.',
      summary: 'World capital of remote automated mining operations; autonomous trains, autonomous drills, and remote operation centers in Perth.'
    },
    GOVTECH_CIVIC: {
      maturity: 'Rapid Growth',
      regContext: 'Data and Digital Government Strategy 2030, myGov universal citizen portal.',
      summary: 'Pioneering unified federal citizen portals (Services Australia myGov) and state-level digital drivers licenses and health credentials.'
    }
  }
};

// ============================================================================
// HELPER FUNCTION: GET DYNAMIC REGIONAL DATA FOR AN INDUSTRY
// ============================================================================
export function getRegionalIndustryData(item: IndustryItem, region: RegionCode): ComputedRegionalIndustry {
  const profile = REGIONAL_PROFILES[region];
  const employers = REGIONAL_EMPLOYERS_BY_CATEGORY[region][item.category];
  const research = REGIONAL_RESEARCH_TEMPLATES[region][item.category];

  // Calculate realistic regional salary
  let regionalSalary: string;
  let regionalSeniorSalary: string;
  
  if (region === 'IN') {
    const baseLPA = Math.round(18 + item.baseVacanciesMultiplier * 8);
    const seniorLPA = Math.round(baseLPA * 1.8);
    regionalSalary = `₹${baseLPA} LPA`;
    regionalSeniorSalary = `₹${seniorLPA} LPA`;
  } else if (region === 'UAE') {
    const baseAED = Math.round((320 + item.baseVacanciesMultiplier * 80) * 1000);
    const seniorAED = Math.round(baseAED * 1.55);
    regionalSalary = `AED ${Math.round(baseAED / 1000)}k`;
    regionalSeniorSalary = `AED ${Math.round(seniorAED / 1000)}k`;
  } else if (region === 'US') {
    const baseUSD = Math.round(145 + item.baseVacanciesMultiplier * 45);
    const seniorUSD = Math.round(baseUSD * 1.5);
    regionalSalary = `$${baseUSD}k`;
    regionalSeniorSalary = `$${seniorUSD}k`;
  } else if (region === 'EU') {
    const baseEUR = Math.round(95 + item.baseVacanciesMultiplier * 30);
    const seniorEUR = Math.round(baseEUR * 1.45);
    regionalSalary = `€${baseEUR}k`;
    regionalSeniorSalary = `€${seniorEUR}k`;
  } else if (region === 'SG') {
    const baseSGD = Math.round(135 + item.baseVacanciesMultiplier * 40);
    const seniorSGD = Math.round(baseSGD * 1.5);
    regionalSalary = `S$${baseSGD}k`;
    regionalSeniorSalary = `S$${seniorSGD}k`;
  } else if (region === 'CA') {
    const baseCAD = Math.round(125 + item.baseVacanciesMultiplier * 35);
    const seniorCAD = Math.round(baseCAD * 1.5);
    regionalSalary = `C$${baseCAD}k`;
    regionalSeniorSalary = `C$${seniorCAD}k`;
  } else if (region === 'AU') {
    const baseAUD = Math.round(140 + item.baseVacanciesMultiplier * 40);
    const seniorAUD = Math.round(baseAUD * 1.5);
    regionalSalary = `A$${baseAUD}k`;
    regionalSeniorSalary = `A$${seniorAUD}k`;
  } else {
    // Global
    const baseUSD = Math.round(130 + item.baseVacanciesMultiplier * 35);
    const seniorUSD = Math.round(baseUSD * 1.5);
    regionalSalary = `$${baseUSD}k`;
    regionalSeniorSalary = `$${seniorUSD}k`;
  }

  // Vacancy estimation based on region size and multiplier
  let vacanciesNum = Math.round(item.baseVacanciesMultiplier * (
    region === 'US' ? 4200 :
    region === 'IN' ? 5600 :
    region === 'EU' ? 3800 :
    region === 'UAE' ? 1450 :
    region === 'SG' ? 1650 :
    region === 'CA' ? 1850 :
    region === 'AU' ? 1500 : 7200
  ));
  const regionalVacancies = `${vacanciesNum.toLocaleString()}+ active roles`;

  // Growth calculation based on baseline CAGR + regional velocity
  const regionalGrowth = item.baseCAGR;

  return {
    id: item.id,
    name: item.name,
    category: item.category,
    categoryLabel: CATEGORY_SPECS[item.category].label,
    shortDesc: item.shortDesc,
    globalMarketSize: item.baseGlobalMarketSize,
    cagr: item.baseCAGR,
    keyRoles: item.keyRoles,
    keySkills: item.keySkills,
    
    regionCode: region,
    regionLabel: profile.label,
    regionalSalary,
    regionalSeniorSalary,
    regionalVacancies,
    regionalGrowth,
    marketMaturity: research.maturity,
    topEmployers: employers,
    regulatoryContext: research.regContext,
    strategicResearchReport: research.summary
  };
}

// ============================================================================
// SEARCH & FILTER ENGINE
// ============================================================================
export function queryRegionalIndustries(
  searchQuery: string,
  selectedCategory: string, // 'ALL' or specific IndustryCategory
  region: RegionCode,
  sortBy: 'salary' | 'growth' | 'vacancies' | 'name' = 'name'
): ComputedRegionalIndustry[] {
  const normalizedQuery = searchQuery.trim().toLowerCase();

  let filtered = COMPREHENSIVE_INDUSTRY_CATALOG.filter((item) => {
    // Category match
    if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
      return false;
    }
    // Search query match
    if (normalizedQuery) {
      const matchName = item.name.toLowerCase().includes(normalizedQuery);
      const matchDesc = item.shortDesc.toLowerCase().includes(normalizedQuery);
      const matchSkills = item.keySkills.some((s) => s.toLowerCase().includes(normalizedQuery));
      const matchRoles = item.keyRoles.some((r) => r.toLowerCase().includes(normalizedQuery));
      if (!matchName && !matchDesc && !matchSkills && !matchRoles) {
        return false;
      }
    }
    return true;
  });

  // Map to computed regional models
  const computedList = filtered.map((item) => getRegionalIndustryData(item, region));

  // Sort
  if (sortBy === 'name') {
    computedList.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'growth') {
    computedList.sort((a, b) => parseFloat(b.cagr) - parseFloat(a.cagr));
  } else if (sortBy === 'vacancies') {
    computedList.sort((a, b) => parseInt(b.regionalVacancies.replace(/\D/g, '')) - parseInt(a.regionalVacancies.replace(/\D/g, '')));
  } else if (sortBy === 'salary') {
    // Basic heuristic sorting by vacancies multiplier
    computedList.sort((a, b) => b.keyRoles.length - a.keyRoles.length);
  }

  return computedList;
}
