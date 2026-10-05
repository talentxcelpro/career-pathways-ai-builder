// src/lib/seo/searchUniverse/occupationRoadmapRegistry.ts
/**
 * TalentXcel Global Occupation Roadmap & Phase B Expansion Registry
 *
 * Implements the strategic roadmap:
 * - Phase A: 44 occupations (Validation Baseline)
 * - Phase B: 500 occupations across 50+ specialized sectors (Milestone #2 Target)
 * - Phase C: 2,500 occupations
 * - Phase D: 10,000 occupations
 * - Phase E: 50,000 occupations
 * - Phase F: 100,000+ occupations & specializations (Ubiquitous Global Career Graph)
 *
 * 5-Tier Connected Career Graph Architecture:
 * 1. Occupation Graph   : Canonical role entity (e.g., Pharmacist, Structural Engineer)
 * 2. Industry Graph     : Hierarchy (e.g., Healthcare -> Pharmacy -> Clinical Pharmacy -> Pharmacist)
 * 3. Market Graph       : Jobs + Employers + Salary percentiles + Locations
 * 4. Career Graph       : Skills + Certifications + Courses + Career progression ladders
 * 5. Candidate Graph    : Resume examples + ATS keywords + Interview STAR banks + Career Passport
 * 6. Transaction Graph  : Apply -> Match -> Hire
 */

export type RoadmapPhaseId = 'PHASE_A_44' | 'PHASE_B_500' | 'PHASE_C_2500' | 'PHASE_D_10000' | 'PHASE_E_50000' | 'PHASE_F_100000';

export interface SectorOccupationsDefinition {
  sectorSlug: string;
  sectorName: string;
  parentIndustrySlug: string;
  parentIndustryName: string;
  targetOccupationsCount: number;
  sampleOccupations: string[];
}

export interface RoadmapPhaseDefinition {
  phaseId: RoadmapPhaseId;
  name: string;
  targetOccupations: number;
  sectorsCovered: number;
  status: 'ACTIVE_DEPLOYED' | 'IN_PROGRESS' | 'PLANNED';
  description: string;
}

export type PhaseBSubMilestoneId = 'PHASE_B1_100' | 'PHASE_B2_250' | 'PHASE_B3_500';

export interface PhaseBSubMilestoneDefinition {
  milestoneId: PhaseBSubMilestoneId;
  name: string;
  targetOccupations: number;
  description: string;
  focus: string;
}

export const PHASE_B_SUB_MILESTONES: Record<PhaseBSubMilestoneId, PhaseBSubMilestoneDefinition> = {
  PHASE_B1_100: {
    milestoneId: 'PHASE_B1_100',
    name: 'Phase B1: First 100 Occupations',
    targetOccupations: 100,
    description: 'First 100 fully saturated occupations prioritized by Search Demand × Evidence × Transaction Potential.',
    focus: 'Top demand roles across Healthcare, BFSI, Construction, Aviation, and Core Tech with high job density.',
  },
  PHASE_B2_250: {
    milestoneId: 'PHASE_B2_250',
    name: 'Phase B2: 250 Occupations Expansion',
    targetOccupations: 250,
    description: 'Scale to 250 occupations ensuring sector diversity quotas across all 15 industry verticals.',
    focus: 'Expanding mid-tail occupations across Hospitality, Logistics, Manufacturing, Education, and Legal.',
  },
  PHASE_B3_500: {
    milestoneId: 'PHASE_B3_500',
    name: 'Phase B3: Complete 500-Occupation Milestone',
    targetOccupations: 500,
    description: 'Complete evidence saturation of all 500+ occupations across 68 specialized sub-sectors.',
    focus: 'Deep analysis of yield telemetry (impressions, clicks, applications, placements, revenue) before Phase C.',
  },
};

export const OCCUPATION_ROADMAP_PHASES: Record<RoadmapPhaseId, RoadmapPhaseDefinition> = {
  PHASE_A_44: {
    phaseId: 'PHASE_A_44',
    name: 'Phase A: Core Validation Baseline',
    targetOccupations: 44,
    sectorsCovered: 15,
    status: 'ACTIVE_DEPLOYED',
    description: 'Initial multi-industry proof covering Healthcare, BFSI, Construction, Aviation, Hospitality, Tech, Legal, and Education.',
  },
  PHASE_B_500: {
    phaseId: 'PHASE_B_500',
    name: 'Phase B: Systematic Multi-Industry Graph',
    targetOccupations: 500,
    sectorsCovered: 68,
    status: 'IN_PROGRESS',
    description: 'Milestone #2: Comprehensive evidence saturation across 50+ specialized industry sub-sectors and 500 canonical occupations.',
  },
  PHASE_C_2500: {
    phaseId: 'PHASE_C_2500',
    name: 'Phase C: Deep Domain Specialization',
    targetOccupations: 2500,
    sectorsCovered: 120,
    status: 'PLANNED',
    description: 'Expansion into sub-specializations, regional civil services, clinical sub-domains, and mid-tier trade crafts.',
  },
  PHASE_D_10000: {
    phaseId: 'PHASE_D_10000',
    name: 'Phase D: National & Regional Occupations',
    targetOccupations: 10000,
    sectorsCovered: 250,
    status: 'PLANNED',
    description: 'Granular municipal trades, regional state gazettes, multilingual job taxonomies (Hindi, Arabic, German, Spanish).',
  },
  PHASE_E_50000: {
    phaseId: 'PHASE_E_50000',
    name: 'Phase E: Global Micro-Specializations',
    targetOccupations: 50000,
    sectorsCovered: 500,
    status: 'PLANNED',
    description: 'Exhaustive corporate designations, niche academic research positions, and frontier AI/engineering roles.',
  },
  PHASE_F_100000: {
    phaseId: 'PHASE_F_100000',
    name: 'Phase F: Ubiquitous Global Graph',
    targetOccupations: 100000,
    sectorsCovered: 1000,
    status: 'PLANNED',
    description: 'The world’s complete career graph encompassing every recognized economic vocation worldwide.',
  },
};

/**
 * 68 Specialized Industry Sectors for Phase B (500 Occupations Target)
 */
export const PHASE_B_SECTORS_CATALOG: SectorOccupationsDefinition[] = [
  // ============================================================================
  // 1. HEALTHCARE & LIFE SCIENCES (12 Sectors, ~85 Occupations)
  // ============================================================================
  {
    sectorSlug: 'hospitals-acute-care',
    sectorName: 'Hospitals & Inpatient Acute Care',
    parentIndustrySlug: 'healthcare',
    parentIndustryName: 'Healthcare & Medicine',
    targetOccupationsCount: 10,
    sampleOccupations: ['doctor-physician', 'hospital-administrator', 'icu-nurse', 'chief-medical-officer', 'surgical-technologist']
  },
  {
    sectorSlug: 'pharmacy-care',
    sectorName: 'Pharmacy & Clinical Drug Therapy',
    parentIndustrySlug: 'healthcare',
    parentIndustryName: 'Healthcare & Medicine',
    targetOccupationsCount: 8,
    sampleOccupations: ['pharmacist', 'clinical-pharmacist', 'oncology-pharmacist', 'compounding-pharmacist', 'pharmacy-technician']
  },
  {
    sectorSlug: 'medical-devices',
    sectorName: 'Medical Devices & Biomedical Engineering',
    parentIndustrySlug: 'healthcare',
    parentIndustryName: 'Healthcare & Medicine',
    targetOccupationsCount: 7,
    sampleOccupations: ['biomedical-engineer', 'medical-device-sales-rep', 'regulatory-affairs-specialist-medtech', 'clinical-evaluator']
  },
  {
    sectorSlug: 'diagnostics-pathology',
    sectorName: 'Diagnostics, Imaging & Pathology',
    parentIndustrySlug: 'healthcare',
    parentIndustryName: 'Healthcare & Medicine',
    targetOccupationsCount: 8,
    sampleOccupations: ['medical-lab-technician', 'radiologist', 'pathologist', 'ultrasound-sonographer', 'phlebotomist']
  },
  {
    sectorSlug: 'biotechnology-genomics',
    sectorName: 'Biotechnology & Genomic Sciences',
    parentIndustrySlug: 'healthcare',
    parentIndustryName: 'Healthcare & Medicine',
    targetOccupationsCount: 6,
    sampleOccupations: ['bioinformatics-scientist', 'genetic-counselor', 'molecular-biologist', 'fermentation-scientist']
  },
  {
    sectorSlug: 'clinical-research',
    sectorName: 'Clinical Research & Clinical Trials',
    parentIndustrySlug: 'healthcare',
    parentIndustryName: 'Healthcare & Medicine',
    targetOccupationsCount: 6,
    sampleOccupations: ['clinical-research-associate', 'principal-investigator', 'clinical-data-manager', 'biostatistician']
  },
  {
    sectorSlug: 'mental-health-psychiatry',
    sectorName: 'Mental Health, Psychiatry & Behavioral Therapy',
    parentIndustrySlug: 'healthcare',
    parentIndustryName: 'Healthcare & Medicine',
    targetOccupationsCount: 7,
    sampleOccupations: ['clinical-psychologist', 'psychiatrist', 'psychiatric-nurse', 'behavioral-therapist', 'addiction-counselor']
  },
  {
    sectorSlug: 'dental-oral-care',
    sectorName: 'Dental Care & Maxillofacial Surgery',
    parentIndustrySlug: 'healthcare',
    parentIndustryName: 'Healthcare & Medicine',
    targetOccupationsCount: 6,
    sampleOccupations: ['dentist', 'orthodontist', 'dental-hygienist', 'oral-maxillofacial-surgeon', 'dental-prosthetist']
  },
  {
    sectorSlug: 'physiotherapy-rehab',
    sectorName: 'Physiotherapy, Occupational Therapy & Rehabilitation',
    parentIndustrySlug: 'healthcare',
    parentIndustryName: 'Healthcare & Medicine',
    targetOccupationsCount: 7,
    sampleOccupations: ['physiotherapist', 'occupational-therapist', 'chiropractor', 'sports-rehab-specialist', 'prosthetist-orthotist']
  },
  {
    sectorSlug: 'nursing-care',
    sectorName: 'Specialized Clinical Nursing',
    parentIndustrySlug: 'healthcare',
    parentIndustryName: 'Healthcare & Medicine',
    targetOccupationsCount: 8,
    sampleOccupations: ['nurse', 'nurse-practitioner', 'nurse-anesthetist', 'pediatric-nurse', 'neonatal-nurse']
  },
  {
    sectorSlug: 'home-healthcare',
    sectorName: 'Home Health, Palliative & Geriatric Care',
    parentIndustrySlug: 'healthcare',
    parentIndustryName: 'Healthcare & Medicine',
    targetOccupationsCount: 6,
    sampleOccupations: ['home-care-nurse', 'palliative-care-physician', 'geriatric-care-manager', 'hospice-coordinator']
  },
  {
    sectorSlug: 'public-health-epidemiology',
    sectorName: 'Public Health, Epidemiology & Global Health',
    parentIndustrySlug: 'healthcare',
    parentIndustryName: 'Healthcare & Medicine',
    targetOccupationsCount: 6,
    sampleOccupations: ['epidemiologist', 'public-health-officer', 'health-policy-analyst', 'sanitary-inspector']
  },

  // ============================================================================
  // 2. BANKING, FINANCIAL SERVICES & INSURANCE (8 Sectors, ~65 Occupations)
  // ============================================================================
  {
    sectorSlug: 'retail-banking',
    sectorName: 'Retail & Consumer Banking',
    parentIndustrySlug: 'banking-finance',
    parentIndustryName: 'Banking & Financial Services',
    targetOccupationsCount: 8,
    sampleOccupations: ['branch-manager', 'personal-banker', 'teller-supervisor', 'mortgage-loan-officer', 'branch-operations-officer']
  },
  {
    sectorSlug: 'commercial-corporate-lending',
    sectorName: 'Corporate Banking & Commercial Credit',
    parentIndustrySlug: 'banking-finance',
    parentIndustryName: 'Banking & Financial Services',
    targetOccupationsCount: 8,
    sampleOccupations: ['credit-analyst', 'corporate-relationship-manager', 'syndicated-loans-analyst', 'trade-finance-officer']
  },
  {
    sectorSlug: 'investment-banking-ma',
    sectorName: 'Investment Banking, Capital Markets & M&A',
    parentIndustrySlug: 'banking-finance',
    parentIndustryName: 'Banking & Financial Services',
    targetOccupationsCount: 9,
    sampleOccupations: ['investment-banker', 'ma-analyst', 'equity-research-associate', 'capital-markets-underwriter', 'dcm-associate']
  },
  {
    sectorSlug: 'wealth-management-private-banking',
    sectorName: 'Private Wealth Management & Family Offices',
    parentIndustrySlug: 'banking-finance',
    parentIndustryName: 'Banking & Financial Services',
    targetOccupationsCount: 8,
    sampleOccupations: ['relationship-manager', 'private-wealth-advisor', 'family-office-director', 'chartered-wealth-manager']
  },
  {
    sectorSlug: 'fintech-digital-payments',
    sectorName: 'FinTech, Digital Payments & Neo-Banking',
    parentIndustrySlug: 'banking-finance',
    parentIndustryName: 'Banking & Financial Services',
    targetOccupationsCount: 8,
    sampleOccupations: ['fintech-product-manager', 'payment-gateway-engineer', 'crypto-asset-analyst', 'fraud-detection-data-analyst']
  },
  {
    sectorSlug: 'insurance-actuarial',
    sectorName: 'Life, Health & General Insurance',
    parentIndustrySlug: 'banking-finance',
    parentIndustryName: 'Banking & Financial Services',
    targetOccupationsCount: 8,
    sampleOccupations: ['insurance-actuary', 'insurance-underwriter', 'claims-investigator', 'loss-adjuster', 'actuarial-analyst']
  },
  {
    sectorSlug: 'financial-risk-compliance',
    sectorName: 'Financial Risk, Basel III & AML/KYC',
    parentIndustrySlug: 'banking-finance',
    parentIndustryName: 'Banking & Financial Services',
    targetOccupationsCount: 8,
    sampleOccupations: ['credit-risk-modeler', 'aml-compliance-officer', 'market-risk-manager', 'liquidity-risk-analyst']
  },
  {
    sectorSlug: 'asset-management-hedge-funds',
    sectorName: 'Asset Management, Mutual Funds & Hedge Funds',
    parentIndustrySlug: 'banking-finance',
    parentIndustryName: 'Banking & Financial Services',
    targetOccupationsCount: 8,
    sampleOccupations: ['portfolio-manager', 'fund-accountant', 'quant-researcher', 'fixed-income-trader', 'derivatives-analyst']
  },

  // ============================================================================
  // 3. CONSTRUCTION, CIVIL & REAL ESTATE (6 Sectors, ~50 Occupations)
  // ============================================================================
  {
    sectorSlug: 'civil-infrastructure-highways',
    sectorName: 'Civil Infrastructure, Bridges & Highways',
    parentIndustrySlug: 'construction-real-estate',
    parentIndustryName: 'Construction & Real Estate',
    targetOccupationsCount: 9,
    sampleOccupations: ['civil-engineer', 'highway-engineer', 'bridge-structural-engineer', 'geotechnical-engineer', 'tunneling-engineer']
  },
  {
    sectorSlug: 'commercial-real-estate-high-rise',
    sectorName: 'Commercial Real Estate & High-Rise Towers',
    parentIndustrySlug: 'construction-real-estate',
    parentIndustryName: 'Construction & Real Estate',
    targetOccupationsCount: 8,
    sampleOccupations: ['structural-engineer', 'construction-project-manager', 'site-execution-engineer', 'mep-coordinator']
  },
  {
    sectorSlug: 'architecture-urban-planning',
    sectorName: 'Architecture, Interior Design & Urban Planning',
    parentIndustrySlug: 'construction-real-estate',
    parentIndustryName: 'Construction & Real Estate',
    targetOccupationsCount: 9,
    sampleOccupations: ['architect', 'urban-planner', 'interior-architect', 'landscape-architect', 'bim-architectural-modeler']
  },
  {
    sectorSlug: 'quantity-surveying-cost-consultancy',
    sectorName: 'Quantity Surveying, Contracts & Cost Management',
    parentIndustrySlug: 'construction-real-estate',
    parentIndustryName: 'Construction & Real Estate',
    targetOccupationsCount: 8,
    sampleOccupations: ['quantity-surveyor', 'cost-estimator', 'contracts-administrator', 'commercial-billing-engineer']
  },
  {
    sectorSlug: 'mep-building-services',
    sectorName: 'MEP (Mechanical, Electrical, Plumbing) Services',
    parentIndustrySlug: 'construction-real-estate',
    parentIndustryName: 'Construction & Real Estate',
    targetOccupationsCount: 8,
    sampleOccupations: ['hvac-design-engineer', 'electrical-systems-engineer', 'plumbing-firefighting-engineer', 'bms-engineer']
  },
  {
    sectorSlug: 'real-estate-brokerage-asset-management',
    sectorName: 'Real Estate Brokerage, Leasing & Property Assets',
    parentIndustrySlug: 'construction-real-estate',
    parentIndustryName: 'Construction & Real Estate',
    targetOccupationsCount: 8,
    sampleOccupations: ['real-estate-broker', 'commercial-leasing-agent', 'property-facility-manager', 'real-estate-valuation-surveyor']
  },

  // ============================================================================
  // 4. AVIATION & AEROSPACE (5 Sectors, ~35 Occupations)
  // ============================================================================
  {
    sectorSlug: 'commercial-airlines-cockpit',
    sectorName: 'Commercial Airlines & Cockpit Operations',
    parentIndustrySlug: 'aviation-aerospace',
    parentIndustryName: 'Aviation & Aerospace',
    targetOccupationsCount: 7,
    sampleOccupations: ['commercial-pilot', 'airline-captain', 'first-officer', 'cadet-pilot', 'flight-operations-officer']
  },
  {
    sectorSlug: 'in-flight-cabin-services',
    sectorName: 'In-Flight Cabin Services & Passenger Safety',
    parentIndustrySlug: 'aviation-aerospace',
    parentIndustryName: 'Aviation & Aerospace',
    targetOccupationsCount: 6,
    sampleOccupations: ['cabin-crew', 'cabin-purser', 'in-flight-service-director', 'vip-corporate-flight-attendant']
  },
  {
    sectorSlug: 'aircraft-maintenance-mro',
    sectorName: 'Aircraft Maintenance, Repair & Overhaul (MRO)',
    parentIndustrySlug: 'aviation-aerospace',
    parentIndustryName: 'Aviation & Aerospace',
    targetOccupationsCount: 8,
    sampleOccupations: ['aircraft-maintenance-engineer', 'avionics-technician', 'airframe-powerplant-mechanic', 'quality-aero-inspector']
  },
  {
    sectorSlug: 'air-traffic-airport-operations',
    sectorName: 'Air Traffic Management & Airport Operations',
    parentIndustrySlug: 'aviation-aerospace',
    parentIndustryName: 'Aviation & Aerospace',
    targetOccupationsCount: 7,
    sampleOccupations: ['air-traffic-controller', 'airport-duty-manager', 'ramp-operations-supervisor', 'airfield-safety-officer']
  },
  {
    sectorSlug: 'aerospace-defense-engineering',
    sectorName: 'Aerospace Systems & Defense Avionics',
    parentIndustrySlug: 'aviation-aerospace',
    parentIndustryName: 'Aviation & Aerospace',
    targetOccupationsCount: 7,
    sampleOccupations: ['aerospace-propulsion-engineer', 'flight-test-engineer', 'satellite-systems-engineer', 'drone-avionics-engineer']
  },

  // ============================================================================
  // 5. HOSPITALITY, TRAVEL & TOURISM (5 Sectors, ~40 Occupations)
  // ============================================================================
  {
    sectorSlug: 'luxury-hotels-resorts',
    sectorName: 'Luxury Hotels, Resorts & General Operations',
    parentIndustrySlug: 'hospitality-tourism',
    parentIndustryName: 'Hospitality, Travel & Tourism',
    targetOccupationsCount: 9,
    sampleOccupations: ['hotel-manager', 'front-office-manager', 'executive-housekeeper', 'hotel-revenue-manager', 'guest-relations-manager']
  },
  {
    sectorSlug: 'food-beverage-culinary-arts',
    sectorName: 'Food & Beverage Operations & Culinary Arts',
    parentIndustrySlug: 'hospitality-tourism',
    parentIndustryName: 'Hospitality, Travel & Tourism',
    targetOccupationsCount: 9,
    sampleOccupations: ['executive-chef', 'sous-chef', 'pastry-chef', 'food-beverage-director', 'sommelier', 'banquet-manager']
  },
  {
    sectorSlug: 'travel-agency-tour-management',
    sectorName: 'Travel Agencies, Inbound Tourism & Destination Management',
    parentIndustrySlug: 'hospitality-tourism',
    parentIndustryName: 'Hospitality, Travel & Tourism',
    targetOccupationsCount: 8,
    sampleOccupations: ['travel-consultant', 'tour-operations-manager', 'corporate-travel-desk-manager', 'itinerary-specialist']
  },
  {
    sectorSlug: 'mice-event-management',
    sectorName: 'MICE (Meetings, Incentives, Conferences, Exhibitions)',
    parentIndustrySlug: 'hospitality-tourism',
    parentIndustryName: 'Hospitality, Travel & Tourism',
    targetOccupationsCount: 7,
    sampleOccupations: ['convention-services-manager', 'event-director', 'wedding-planner', 'exhibition-operations-manager']
  },
  {
    sectorSlug: 'cruise-maritime-hospitality',
    sectorName: 'Cruise Ships & Luxury Maritime Hospitality',
    parentIndustrySlug: 'hospitality-tourism',
    parentIndustryName: 'Hospitality, Travel & Tourism',
    targetOccupationsCount: 7,
    sampleOccupations: ['cruise-director', 'shipboard-hotel-director', 'cruise-chief-purser', 'onboard-guest-services-officer']
  },

  // ============================================================================
  // 6. MANUFACTURING, AUTOMOTIVE & INDUSTRIAL (6 Sectors, ~50 Occupations)
  // ============================================================================
  {
    sectorSlug: 'automotive-future-mobility',
    sectorName: 'Automotive Manufacturing & EV Powertrain',
    parentIndustrySlug: 'manufacturing-automotive',
    parentIndustryName: 'Manufacturing & Automotive',
    targetOccupationsCount: 9,
    sampleOccupations: ['automotive-design-engineer', 'ev-battery-engineer', 'powertrain-calibration-specialist', 'vehicle-crash-test-analyst']
  },
  {
    sectorSlug: 'plant-operations-production',
    sectorName: 'Plant Operations, Shop Floor & Production',
    parentIndustrySlug: 'manufacturing-automotive',
    parentIndustryName: 'Manufacturing & Automotive',
    targetOccupationsCount: 9,
    sampleOccupations: ['production-engineer', 'plant-manager', 'shop-floor-supervisor', 'maintenance-engineering-manager']
  },
  {
    sectorSlug: 'precision-machining-tooling',
    sectorName: 'CNC Machining, Tool & Die & Precision Fabrication',
    parentIndustrySlug: 'manufacturing-automotive',
    parentIndustryName: 'Manufacturing & Automotive',
    targetOccupationsCount: 8,
    sampleOccupations: ['cnc-machinist', 'tool-die-maker', 'vmc-programmer', 'cad-cam-machining-specialist', 'die-caster']
  },
  {
    sectorSlug: 'industrial-automation-robotics',
    sectorName: 'Industrial Automation, PLC & Robotics',
    parentIndustrySlug: 'manufacturing-automotive',
    parentIndustryName: 'Manufacturing & Automotive',
    targetOccupationsCount: 8,
    sampleOccupations: ['robotics-automation-engineer', 'plc-scada-engineer', 'instrumentation-technician', 'mechatronics-engineer']
  },
  {
    sectorSlug: 'quality-assurance-lean-six-sigma',
    sectorName: 'Quality Engineering, QA/QC & Lean Six Sigma',
    parentIndustrySlug: 'manufacturing-automotive',
    parentIndustryName: 'Manufacturing & Automotive',
    targetOccupationsCount: 8,
    sampleOccupations: ['quality-assurance-manager', 'six-sigma-black-belt-consultant', 'supplier-quality-engineer', 'metrology-inspector']
  },
  {
    sectorSlug: 'automotive-aftermarket-service',
    sectorName: 'Automotive Dealership, Service & Diagnostics',
    parentIndustrySlug: 'manufacturing-automotive',
    parentIndustryName: 'Manufacturing & Automotive',
    targetOccupationsCount: 8,
    sampleOccupations: ['automotive-service-advisor', 'master-auto-diagnostician', 'dealership-general-service-manager', 'body-shop-manager']
  },

  // ============================================================================
  // 7. IT, SOFTWARE, CLOUD & AI (6 Sectors, ~50 Occupations)
  // ============================================================================
  {
    sectorSlug: 'software-engineering-systems',
    sectorName: 'Software Engineering, Full-Stack & Systems',
    parentIndustrySlug: 'it-software',
    parentIndustryName: 'IT & Software',
    targetOccupationsCount: 9,
    sampleOccupations: ['software-engineer', 'full-stack-developer', 'backend-developer', 'frontend-developer', 'systems-architect']
  },
  {
    sectorSlug: 'artificial-intelligence-machine-learning',
    sectorName: 'Artificial Intelligence, Machine Learning & LLMs',
    parentIndustrySlug: 'it-software',
    parentIndustryName: 'IT & Software',
    targetOccupationsCount: 9,
    sampleOccupations: ['machine-learning-engineer', 'ai-prompt-engineer', 'computer-vision-engineer', 'nlp-scientist', 'mlops-engineer']
  },
  {
    sectorSlug: 'cloud-infrastructure-devops',
    sectorName: 'Cloud Infrastructure, Site Reliability & DevOps',
    parentIndustrySlug: 'it-software',
    parentIndustryName: 'IT & Software',
    targetOccupationsCount: 8,
    sampleOccupations: ['cloud-devops-engineer', 'cloud-architect', 'site-reliability-engineer', 'kubernetes-platform-engineer']
  },
  {
    sectorSlug: 'cybersecurity-information-security',
    sectorName: 'Cybersecurity, Threat Intelligence & SOC',
    parentIndustrySlug: 'it-software',
    parentIndustryName: 'IT & Software',
    targetOccupationsCount: 8,
    sampleOccupations: ['cybersecurity-analyst', 'penetration-tester', 'soc-incident-responder', 'ciso', 'cloud-security-architect']
  },
  {
    sectorSlug: 'data-engineering-analytics',
    sectorName: 'Data Engineering, BI & Big Data Systems',
    parentIndustrySlug: 'it-software',
    parentIndustryName: 'IT & Software',
    targetOccupationsCount: 8,
    sampleOccupations: ['data-scientist', 'data-engineer', 'bi-dashboard-architect', 'analytics-engineering-manager']
  },
  {
    sectorSlug: 'embedded-systems-iot',
    sectorName: 'Embedded Systems, Firmware & Internet of Things',
    parentIndustrySlug: 'it-software',
    parentIndustryName: 'IT & Software',
    targetOccupationsCount: 8,
    sampleOccupations: ['embedded-firmware-engineer', 'iot-solutions-architect', 'rtos-engineer', 'pcb-hardware-engineer']
  },

  // ============================================================================
  // 8. LOGISTICS, SUPPLY CHAIN & FREIGHT (3 Sectors, ~22 Occupations)
  // ============================================================================
  {
    sectorSlug: 'freight-forwarding-multimodal',
    sectorName: 'Freight Forwarding, Customs & Multimodal Cargo',
    parentIndustrySlug: 'logistics-supply-chain',
    parentIndustryName: 'Logistics, Supply Chain & Freight',
    targetOccupationsCount: 7,
    sampleOccupations: ['supply-chain-manager', 'customs-broker', 'freight-forwarding-executive', 'cargo-operations-manager', 'multimodal-logistics-coordinator']
  },
  {
    sectorSlug: 'warehousing-fulfillment-cold-chain',
    sectorName: 'Warehousing, Fulfillment & Cold Chain Systems',
    parentIndustrySlug: 'logistics-supply-chain',
    parentIndustryName: 'Logistics, Supply Chain & Freight',
    targetOccupationsCount: 8,
    sampleOccupations: ['warehouse-operations-manager', 'cold-chain-manager', 'fulfillment-center-lead', 'inventory-controller', 'distribution-center-director']
  },
  {
    sectorSlug: 'last-mile-courier-fleet',
    sectorName: 'Last-Mile Delivery, Express Couriers & Fleet Operations',
    parentIndustrySlug: 'logistics-supply-chain',
    parentIndustryName: 'Logistics, Supply Chain & Freight',
    targetOccupationsCount: 7,
    sampleOccupations: ['last-mile-delivery-manager', 'fleet-operations-supervisor', 'dispatch-route-planner', 'express-hub-manager']
  },

  // ============================================================================
  // 9. EDUCATION, TEACHING & EDTECH (3 Sectors, ~22 Occupations)
  // ============================================================================
  {
    sectorSlug: 'higher-education-academia',
    sectorName: 'Higher Education, Research & University Administration',
    parentIndustrySlug: 'education-academia',
    parentIndustryName: 'Education, Teaching & EdTech',
    targetOccupationsCount: 7,
    sampleOccupations: ['university-professor', 'academic-registrar', 'admissions-director', 'research-grant-coordinator', 'dean-of-academic-affairs']
  },
  {
    sectorSlug: 'k12-specialized-schooling',
    sectorName: 'K-12 Primary, Secondary & Specialized Education',
    parentIndustrySlug: 'education-academia',
    parentIndustryName: 'Education, Teaching & EdTech',
    targetOccupationsCount: 8,
    sampleOccupations: ['school-teacher', 'school-principal', 'academic-counselor', 'special-education-teacher', 'stem-curriculum-coordinator']
  },
  {
    sectorSlug: 'edtech-corporate-training',
    sectorName: 'EdTech, Instructional Design & Corporate Learning',
    parentIndustrySlug: 'education-academia',
    parentIndustryName: 'Education, Teaching & EdTech',
    targetOccupationsCount: 7,
    sampleOccupations: ['instructional-designer', 'corporate-trainer', 'lms-platform-administrator', 'edtech-product-specialist', 'curriculum-author']
  },

  // ============================================================================
  // 10. LEGAL, JUDICIARY & CORPORATE COMPLIANCE (3 Sectors, ~20 Occupations)
  // ============================================================================
  {
    sectorSlug: 'corporate-law-ma-securities',
    sectorName: 'Corporate Law, M&A, Capital Markets & Transactional Legal',
    parentIndustrySlug: 'legal-compliance',
    parentIndustryName: 'Legal, Judiciary & Corporate Compliance',
    targetOccupationsCount: 7,
    sampleOccupations: ['corporate-lawyer', 'in-house-legal-counsel', 'ma-legal-associate', 'securities-lawyer', 'contract-lifecycle-manager']
  },
  {
    sectorSlug: 'intellectual-property-patents',
    sectorName: 'Intellectual Property, Patents & Tech Licensing',
    parentIndustrySlug: 'legal-compliance',
    parentIndustryName: 'Legal, Judiciary & Corporate Compliance',
    targetOccupationsCount: 6,
    sampleOccupations: ['patent-attorney', 'trademark-examiner', 'ip-licensing-manager', 'patent-analyst', 'technology-transfer-officer']
  },
  {
    sectorSlug: 'litigation-dispute-resolution',
    sectorName: 'Commercial Litigation, Arbitration & Regulatory Compliance',
    parentIndustrySlug: 'legal-compliance',
    parentIndustryName: 'Legal, Judiciary & Corporate Compliance',
    targetOccupationsCount: 7,
    sampleOccupations: ['compliance-officer', 'litigation-lawyer', 'commercial-arbitrator', 'legal-paralegal', 'regulatory-affairs-counsel']
  },

  // ============================================================================
  // 11. AGRICULTURE, AGRITECH & FOOD PROCESSING (3 Sectors, ~20 Occupations)
  // ============================================================================
  {
    sectorSlug: 'precision-agritech-crop-sciences',
    sectorName: 'Precision Agriculture, Agronomy & Crop Sciences',
    parentIndustrySlug: 'agriculture-food-processing',
    parentIndustryName: 'Agriculture, Agritech & Food Processing',
    targetOccupationsCount: 7,
    sampleOccupations: ['agronomist', 'crop-scientist', 'precision-farming-technologist', 'soil-scientist', 'agricultural-drone-pilot']
  },
  {
    sectorSlug: 'food-processing-dairy-fmcg',
    sectorName: 'Food Processing, Dairy Technology & Industrial Food Safety',
    parentIndustrySlug: 'agriculture-food-processing',
    parentIndustryName: 'Agriculture, Agritech & Food Processing',
    targetOccupationsCount: 7,
    sampleOccupations: ['food-technologist', 'food-safety-haccp-auditor', 'dairy-plant-manager', 'sensory-evaluation-analyst', 'quality-assurance-food-chemist']
  },
  {
    sectorSlug: 'agri-supply-grain-trading',
    sectorName: 'Agri-Supply Chain, Grain Trading & Farm-to-Fork Networks',
    parentIndustrySlug: 'agriculture-food-processing',
    parentIndustryName: 'Agriculture, Agritech & Food Processing',
    targetOccupationsCount: 6,
    sampleOccupations: ['commodity-grain-trader', 'farm-procurement-manager', 'cold-storage-inspector', 'agri-logistics-coordinator']
  },

  // ============================================================================
  // 12. MEDIA, JOURNALISM & ENTERTAINMENT (2 Sectors, ~14 Occupations)
  // ============================================================================
  {
    sectorSlug: 'digital-journalism-broadcasting',
    sectorName: 'Investigative Journalism, News Broadcasting & Podcasting',
    parentIndustrySlug: 'media-entertainment',
    parentIndustryName: 'Media, Journalism & Entertainment',
    targetOccupationsCount: 7,
    sampleOccupations: ['journalist', 'news-editor', 'broadcast-producer', 'digital-content-strategist', 'podcast-host-producer']
  },
  {
    sectorSlug: 'vfx-animation-game-production',
    sectorName: 'Animation, VFX, Game Art & Digital Post-Production',
    parentIndustrySlug: 'media-entertainment',
    parentIndustryName: 'Media, Journalism & Entertainment',
    targetOccupationsCount: 7,
    sampleOccupations: ['video-producer', 'vfx-artist', '3d-animator', 'game-environment-artist', 'sound-designer', 'motion-graphics-lead']
  },

  // ============================================================================
  // 13. ENERGY, OIL, GAS & RENEWABLE CLEANTECH (2 Sectors, ~14 Occupations)
  // ============================================================================
  {
    sectorSlug: 'renewable-solar-wind-storage',
    sectorName: 'Renewable Energy, Solar PV, Wind & Battery Storage',
    parentIndustrySlug: 'energy-oil-gas-renewables',
    parentIndustryName: 'Energy, Oil, Gas & Renewable CleanTech',
    targetOccupationsCount: 7,
    sampleOccupations: ['solar-technician', 'solar-photovoltaic-engineer', 'wind-turbine-technician', 'battery-storage-engineer', 'grid-integration-specialist']
  },
  {
    sectorSlug: 'oil-gas-petrochemical-power',
    sectorName: 'Oil, Gas Exploration, Power Plants & Substation Grid Systems',
    parentIndustrySlug: 'energy-oil-gas-renewables',
    parentIndustryName: 'Energy, Oil, Gas & Renewable CleanTech',
    targetOccupationsCount: 7,
    sampleOccupations: ['drilling-engineer', 'electrical-power-engineer', 'substation-automation-engineer', 'refinery-process-engineer', 'pipeline-integrity-engineer']
  },

  // ============================================================================
  // 14. GOVERNMENT, CIVIL ADMINISTRATION & DEFENCE (2 Sectors, ~13 Occupations)
  // ============================================================================
  {
    sectorSlug: 'civil-services-public-policy',
    sectorName: 'Civil Administration, Public Policy & Foreign Affairs',
    parentIndustrySlug: 'government-public-services',
    parentIndustryName: 'Government, Defence & Civil Administration',
    targetOccupationsCount: 7,
    sampleOccupations: ['civil-services-officer', 'public-policy-analyst', 'administrative-officer', 'municipal-commissioner', 'revenue-inspector']
  },
  {
    sectorSlug: 'law-enforcement-homeland-security',
    sectorName: 'Law Enforcement, Forensic Investigation & Disaster Response',
    parentIndustrySlug: 'government-public-services',
    parentIndustryName: 'Government, Defence & Civil Administration',
    targetOccupationsCount: 6,
    sampleOccupations: ['police-officer', 'forensic-investigator', 'disaster-management-officer', 'fire-safety-chief', 'cybercrime-investigator']
  },

  // ============================================================================
  // 15. RETAIL, FMCG & E-COMMERCE (2 Sectors, ~14 Occupations)
  // ============================================================================
  {
    sectorSlug: 'omnichannel-retail-merchandising',
    sectorName: 'Omnichannel Retail Operations, Merchandising & Store Networks',
    parentIndustrySlug: 'retail-ecommerce',
    parentIndustryName: 'Retail & E-Commerce',
    targetOccupationsCount: 7,
    sampleOccupations: ['retail-store-manager', 'area-retail-manager', 'visual-merchandiser', 'retail-loss-prevention-manager', 'retail-buyer']
  },
  {
    sectorSlug: 'ecommerce-d2c-category-growth',
    sectorName: 'E-Commerce Marketplaces, D2C Brands & Category Management',
    parentIndustrySlug: 'retail-ecommerce',
    parentIndustryName: 'Retail & E-Commerce',
    targetOccupationsCount: 7,
    sampleOccupations: ['ecommerce-category-manager', 'marketplace-growth-lead', 'catalog-operations-manager', 'pricing-strategy-analyst', 'd2c-brand-manager']
  },
];

export class OccupationRoadmapRegistry {
  public static getAllPhases(): RoadmapPhaseDefinition[] {
    return Object.values(OCCUPATION_ROADMAP_PHASES);
  }

  public static getActivePhase(): RoadmapPhaseDefinition {
    return OCCUPATION_ROADMAP_PHASES.PHASE_B_500;
  }

  public static getAllSectorsCatalog(): SectorOccupationsDefinition[] {
    return PHASE_B_SECTORS_CATALOG;
  }

  public static getTotalPlannedOccupationsForPhaseB(): number {
    return PHASE_B_SECTORS_CATALOG.reduce((sum, s) => sum + s.targetOccupationsCount, 0);
  }

  /**
   * Calculates the executive Career Graph Coverage and Yield KPIs
   */
  public static calculateExecutiveKPIs(metrics: {
    evidenceSaturatedOccupations: number;
    totalCanonicalOccupations: number;
    organicImpressions: number;
    organicClicks: number;
    registrations: number;
    applications: number;
    matches: number;
  }) {
    const totalTransactions = metrics.registrations + metrics.applications + metrics.matches;
    const transactions = metrics.applications + metrics.matches; // 19 + 3 = 22

    const careerGraphCoverage = metrics.totalCanonicalOccupations > 0
      ? (metrics.evidenceSaturatedOccupations / metrics.totalCanonicalOccupations) * 100
      : 0;

    const occupationSearchYield = metrics.evidenceSaturatedOccupations > 0
      ? metrics.organicImpressions / metrics.evidenceSaturatedOccupations
      : 0;

    const occupationConversionYield = metrics.organicClicks > 0
      ? (totalTransactions / metrics.organicClicks) * 100
      : 0;

    const transactionYield = metrics.evidenceSaturatedOccupations > 0
      ? transactions / metrics.evidenceSaturatedOccupations
      : 0;

    const applicationYield = metrics.evidenceSaturatedOccupations > 0
      ? metrics.applications / metrics.evidenceSaturatedOccupations
      : 0;

    const placementYield = metrics.evidenceSaturatedOccupations > 0
      ? metrics.matches / metrics.evidenceSaturatedOccupations
      : 0;

    return {
      careerGraphCoverageFormatted: `${careerGraphCoverage.toFixed(2)}% (${metrics.evidenceSaturatedOccupations} saturated / ${metrics.totalCanonicalOccupations} canonical Phase B target)`,
      careerGraphCoveragePercentage: careerGraphCoverage,
      occupationSearchYieldFormatted: `${occupationSearchYield.toFixed(1)} impressions / saturated occupation`,
      occupationSearchYieldValue: occupationSearchYield,
      careerEventYieldFormatted: `${occupationConversionYield.toFixed(2)}% (${totalTransactions} career events / ${metrics.organicClicks} clicks)`,
      occupationConversionYieldFormatted: `${occupationConversionYield.toFixed(2)}% (${totalTransactions} career events / ${metrics.organicClicks} clicks)`,
      occupationConversionYieldPercentage: occupationConversionYield,
      occupationTransactionYieldFormatted: `${applicationYield.toFixed(2)} applications / saturated occupation (${metrics.applications} applications / ${metrics.evidenceSaturatedOccupations} saturated)`,
      occupationTransactionYieldValue: applicationYield,
      occupationPlacementYieldFormatted: `${placementYield.toFixed(3)} matches / saturated occupation (${metrics.matches} matches / ${metrics.evidenceSaturatedOccupations} saturated)`,
      occupationPlacementYieldValue: placementYield,
      transactionYieldFormatted: `${transactionYield.toFixed(2)} transactions / saturated occupation (${transactions} transactions / ${metrics.evidenceSaturatedOccupations} saturated)`,
      transactionYieldValue: transactionYield,
    };
  }

  public static getPhaseBSubMilestones(): PhaseBSubMilestoneDefinition[] {
    return Object.values(PHASE_B_SUB_MILESTONES);
  }

  /**
   * Prioritizes candidate occupations for saturation in the factory:
   * Score = (Demand × 0.35 + JobDensity × 0.25 + SalaryDepth × 0.15 + TransactionPotential × 0.25) × SectorDiversityWeight
   */
  public static computeOccupationPriorityScore(input: {
    demandScore: number;            // 0 - 100
    activeJobDensity: number;       // 0 - 100
    salaryDataAvailability: number; // 0 - 100
    transactionPotential: number;   // 0 - 100
    sectorDiversityWeight?: number; // 0.8 - 1.5 (boosts underrepresented non-IT sectors)
  }): number {
    const diversity = input.sectorDiversityWeight ?? 1.0;
    const raw = (
      input.demandScore * 0.35 +
      input.activeJobDensity * 0.25 +
      input.salaryDataAvailability * 0.15 +
      input.transactionPotential * 0.25
    );
    return Math.min(100, Math.round(raw * diversity * 10) / 10);
  }
}
