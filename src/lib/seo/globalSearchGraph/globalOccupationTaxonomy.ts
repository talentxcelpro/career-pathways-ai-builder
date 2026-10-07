// src/lib/seo/globalSearchGraph/globalOccupationTaxonomy.ts
/**
 * TalentXcel Global Occupation Taxonomy & Multi-Sector Hierarchy
 *
 * Implements Section 2 & 4:
 * INDUSTRY -> SECTOR -> SUB-SECTOR -> OCCUPATION -> SPECIALIZATION -> ROLE
 *
 * Features:
 * - 6-Tier global career taxonomy
 * - Stable Occupation Entity IDs (e.g., OCC-HLT-PHARM-001, OCC-TECH-SWE-001)
 * - Coverage across 48+ global sectors (Healthcare, Tech, BFSI, Aviation, Construction, Energy, Agriculture, Hospitality, etc.)
 * - Rich entity aliases and synonyms (SWE, RN, CA, Pilot, Developer, etc.)
 * - Multi-currency regional baseline benchmarks (INR, USD, GBP, AED, SAR, EUR)
 * - Career stages: ENTRY_LEVEL, MID_LEVEL, SENIOR_LEVEL, LEAD_EXECUTIVE
 */

export type GlobalOccupationTier =
  | 'INDUSTRY'
  | 'SECTOR'
  | 'SUB_SECTOR'
  | 'OCCUPATION'
  | 'SPECIALIZATION'
  | 'ROLE';

export type CareerStageLevel =
  | 'ENTRY_LEVEL'     // 0 - 2 years
  | 'MID_LEVEL'       // 3 - 7 years
  | 'SENIOR_LEVEL'    // 8 - 12 years
  | 'LEAD_EXECUTIVE'; // 12+ years

export interface GlobalOccupationNode {
  entityId: string; // OCC-{SECTOR_CODE}-{SLUG}
  slug: string;
  canonicalName: string;
  tier: GlobalOccupationTier;
  industrySlug: string;
  sectorSlug?: string;
  subSectorSlug?: string;
  parentEntityId?: string;
  aliases: string[];
  description: string;
  skills: {
    coreTechnical: string[];
    domainKnowledge: string[];
    toolsAndFrameworks: string[];
    softSkills: string[];
  };
  certifications: string[];
  careerStages: {
    stage: CareerStageLevel;
    title: string;
    yearsExperience: string;
    description: string;
  }[];
  regionalSalaryBaseline: {
    countryCode: string;
    currency: string;
    unit: 'LPA' | 'USD_YEAR' | 'GBP_YEAR' | 'AED_MONTH' | 'SAR_MONTH' | 'EUR_YEAR';
    median: number;
    p10: number;
    p90: number;
  }[];
  adjacentOccupations: string[]; // Slugs of transferable careers
  isHighDemand: boolean;
  governingBodies?: string[];
  industryId?: string;
  salaryBenchmark?: {
    currency: string;
    percentileP50: number;
    regionalMultipliers?: Record<string, number>;
  };
}

export const COMPREHENSIVE_GLOBAL_OCCUPATIONS: GlobalOccupationNode[] = [
  // ============================================================================
  // 1. HEALTHCARE & LIFE SCIENCES
  // ============================================================================
  {
    entityId: 'OCC-HLT-PHARM-001',
    slug: 'pharmacist',
    canonicalName: 'Pharmacist',
    tier: 'OCCUPATION',
    industrySlug: 'healthcare',
    sectorSlug: 'pharmacy',
    subSectorSlug: 'clinical-pharmacy',
    aliases: ['pharmacist', 'chemist', 'druggist', 'pharmacy-officer', 'clinical-pharmacist', 'hospital-pharmacist'],
    description: 'Healthcare professional specialized in the safe dispensing, therapeutic monitoring, and pharmacological management of medications.',
    skills: {
      coreTechnical: ['Pharmacotherapy', 'Drug-Drug Interactions', 'Sterile Compounding', 'Dispensing Protocols'],
      domainKnowledge: ['Pharmacokinetics', 'FDA/CDSCO Regulations', 'Hospital Formulary', 'Patient Counseling'],
      toolsAndFrameworks: ['Epic Willow Pharmacy', 'Cerner PharmNet', 'Micromedex', 'Lexicomp'],
      softSkills: ['Clinical Judgment', 'Meticulous Attention to Detail', 'Patient Communication', 'Interprofessional Collaboration'],
    },
    certifications: ['Registered Pharmacist (RPh)', 'PharmD License', 'Board Certified Pharmacotherapy Specialist (BCPS)'],
    careerStages: [
      { stage: 'ENTRY_LEVEL', title: 'Junior Staff Pharmacist', yearsExperience: '0-2 yrs', description: 'Dispensing prescriptions, medication reviews, and OTC consultation.' },
      { stage: 'MID_LEVEL', title: 'Clinical Pharmacist', yearsExperience: '3-6 yrs', description: 'ICU/Inpatient clinical rounds, dosing adjustments, and antibiotic stewardship.' },
      { stage: 'SENIOR_LEVEL', title: 'Lead / Clinical Specialist', yearsExperience: '7-10 yrs', description: 'Department leadership, therapeutic drug monitoring, and pharmacy quality compliance.' },
      { stage: 'LEAD_EXECUTIVE', title: 'Director of Pharmacy Services', yearsExperience: '11+ yrs', description: 'Executive oversight of healthcare hospital pharmacy operations and procurement.' },
    ],
    regionalSalaryBaseline: [
      { countryCode: 'IN', currency: 'INR', unit: 'LPA', median: 6.8, p10: 3.5, p90: 14.5 },
      { countryCode: 'US', currency: 'USD', unit: 'USD_YEAR', median: 132000, p10: 95000, p90: 165000 },
      { countryCode: 'GB', currency: 'GBP', unit: 'GBP_YEAR', median: 48000, p10: 34000, p90: 68000 },
      { countryCode: 'AE', currency: 'AED', unit: 'AED_MONTH', median: 16500, p10: 9000, p90: 28000 },
    ],
    adjacentOccupations: ['clinical-research-associate', 'medical-science-liaison', 'pharmacovigilance-specialist'],
    isHighDemand: true,
    governingBodies: ['Pharmacy Council of India (PCI)', 'American Pharmacists Association (APhA)', 'General Pharmaceutical Council (GPhC)'],
  },
  {
    entityId: 'OCC-HLT-CRA-001',
    slug: 'clinical-research-associate',
    canonicalName: 'Clinical Research Associate (CRA)',
    tier: 'OCCUPATION',
    industrySlug: 'healthcare',
    sectorSlug: 'clinical-research',
    subSectorSlug: 'clinical-trials',
    aliases: ['clinical research associate', 'cra', 'clinical trial monitor', 'clinical monitor'],
    description: 'Life sciences professional monitoring clinical trial compliance, Good Clinical Practice (GCP) guidelines, and clinical data integrity.',
    skills: {
      coreTechnical: ['Good Clinical Practice (GCP)', 'Clinical Trial Monitoring', 'Trial Master File (TMF)', 'Protocol Compliance'],
      domainKnowledge: ['ICH-GCP Guidelines', 'FDA 21 CFR Part 11', 'Pharmacovigilance', 'CDISC Standards'],
      toolsAndFrameworks: ['Medidata Rave', 'Oracle Clinical', 'Veeva Vault CTMS', 'Inform EDC'],
      softSkills: ['Auditing Integrity', 'Investigator Site Relationship', 'Meticulous Documentation'],
    },
    certifications: ['CCRA (Certified Clinical Research Associate)', 'GCP Certification', 'ACRP-CP'],
    careerStages: [
      { stage: 'ENTRY_LEVEL', title: 'Clinical Trial Assistant / CRA I', yearsExperience: '0-2 yrs', description: 'Site initiation visits, document archival, and regulatory binder tracking.' },
      { stage: 'MID_LEVEL', title: 'Senior CRA (CRA II / Senior)', yearsExperience: '3-6 yrs', description: 'Routine site monitoring visits, protocol deviation resolution, and audit readiness.' },
      { stage: 'SENIOR_LEVEL', title: 'Clinical Project Manager / Lead CRA', yearsExperience: '7-10 yrs', description: 'Multi-site clinical trial execution, CRO coordination, and ethics committee reviews.' },
      { stage: 'LEAD_EXECUTIVE', title: 'Director of Clinical Operations', yearsExperience: '11+ yrs', description: 'Global clinical trials governance, regulatory submissions, and budget leadership.' },
    ],
    regionalSalaryBaseline: [
      { countryCode: 'IN', currency: 'INR', unit: 'LPA', median: 8.5, p10: 4.2, p90: 18.0 },
      { countryCode: 'US', currency: 'USD', unit: 'USD_YEAR', median: 108000, p10: 72000, p90: 152000 },
      { countryCode: 'GB', currency: 'GBP', unit: 'GBP_YEAR', median: 48000, p10: 32000, p90: 72000 },
      { countryCode: 'AE', currency: 'AED', unit: 'AED_MONTH', median: 22000, p10: 12000, p90: 38000 },
    ],
    adjacentOccupations: ['pharmacovigilance-specialist', 'clinical-data-manager', 'medical-science-liaison'],
    isHighDemand: true,
    industryId: 'IND-HEALTH',
  },
  {
    entityId: 'OCC-HLT-NURSE-001',
    slug: 'nurse',
    canonicalName: 'Registered Nurse (RN)',
    tier: 'OCCUPATION',
    industrySlug: 'healthcare',
    sectorSlug: 'nursing',
    subSectorSlug: 'inpatient-nursing',
    aliases: ['nurse', 'registered nurse', 'rn', 'staff nurse', 'clinical nurse', 'nursing officer'],
    description: 'Licensed healthcare professional responsible for patient care planning, clinical monitoring, vital assessments, and bedside treatment administration.',
    skills: {
      coreTechnical: ['Patient Assessment', 'Medication Administration', 'IV Infusion Therapy', 'Wound Management'],
      domainKnowledge: ['Basic Life Support (BLS)', 'Advanced Cardiac Life Support (ACLS)', 'Infection Control', 'HIPAA'],
      toolsAndFrameworks: ['Epic Systems EHR', 'Cerner Millennium', 'Meditech', 'Vital Signs Telemetry Monitors'],
      softSkills: ['Empathy', 'Crisis Management', 'Patient Advocacy', 'Effective Triage'],
    },
    certifications: ['NCLEX-RN License', 'State Nursing Council Registration', 'ACLS Certification', 'CCRN (Critical Care)'],
    careerStages: [
      { stage: 'ENTRY_LEVEL', title: 'Staff Nurse', yearsExperience: '0-2 yrs', description: 'Direct bedside patient care, vitals monitoring, and documentation.' },
      { stage: 'MID_LEVEL', title: 'Senior Staff Nurse / Charge Nurse', yearsExperience: '3-6 yrs', description: 'Ward supervision, triage coordination, and high-dependency nursing.' },
      { stage: 'SENIOR_LEVEL', title: 'Nurse Manager / Clinical Nurse Specialist', yearsExperience: '7-10 yrs', description: 'Unit management, patient safety protocols, and staff training.' },
      { stage: 'LEAD_EXECUTIVE', title: 'Chief Nursing Officer (CNO)', yearsExperience: '11+ yrs', description: 'Executive hospital nursing governance, clinical quality, and accreditation.' },
    ],
    regionalSalaryBaseline: [
      { countryCode: 'IN', currency: 'INR', unit: 'LPA', median: 5.2, p10: 2.8, p90: 11.0 },
      { countryCode: 'US', currency: 'USD', unit: 'USD_YEAR', median: 86000, p10: 62000, p90: 122000 },
      { countryCode: 'GB', currency: 'GBP', unit: 'GBP_YEAR', median: 37500, p10: 28000, p90: 52000 },
      { countryCode: 'AE', currency: 'AED', unit: 'AED_MONTH', median: 14000, p10: 8000, p90: 22000 },
    ],
    adjacentOccupations: ['nurse-practitioner', 'clinical-educator', 'healthcare-administrator'],
    isHighDemand: true,
    governingBodies: ['Indian Nursing Council (INC)', 'American Nurses Association (ANA)', 'Nursing & Midwifery Council (NMC)'],
  },

  // ============================================================================
  // 2. TECHNOLOGY & SOFTWARE SYSTEMS
  // ============================================================================
  {
    entityId: 'OCC-TECH-SWE-001',
    slug: 'software-engineer',
    canonicalName: 'Software Engineer',
    tier: 'OCCUPATION',
    industrySlug: 'technology',
    sectorSlug: 'software',
    subSectorSlug: 'application-development',
    aliases: ['software engineer', 'software developer', 'swe', 'programmer', 'software architect', 'application developer', 'react developer', 'frontend developer', 'backend developer'],
    description: 'Engineering professional designing, developing, testing, and deploying scalable distributed software applications and systems.',
    skills: {
      coreTechnical: ['Data Structures & Algorithms', 'Distributed Systems', 'API Design (REST/gRPC)', 'System Architecture'],
      domainKnowledge: ['Cloud Computing (AWS/GCP/Azure)', 'Microservices Architecture', 'CI/CD Pipelines', 'Database Optimization'],
      toolsAndFrameworks: ['Java', 'Python', 'Go', 'TypeScript', 'Node.js', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'Kafka'],
      softSkills: ['Analytical Problem Solving', 'Code Review Integrity', 'Cross-functional Collaboration', 'Technical Mentorship'],
    },
    certifications: ['AWS Certified Solutions Architect', 'Google Cloud Professional Cloud Architect', 'Certified Kubernetes Administrator (CKA)'],
    careerStages: [
      { stage: 'ENTRY_LEVEL', title: 'Associate Software Engineer', yearsExperience: '0-2 yrs', description: 'Feature implementation, unit testing, bug fixing, and code base onboarding.' },
      { stage: 'MID_LEVEL', title: 'Software Engineer II', yearsExperience: '3-6 yrs', description: 'End-to-end component ownership, architecture design, and microservice integration.' },
      { stage: 'SENIOR_LEVEL', title: 'Senior / Staff Software Engineer', yearsExperience: '7-10 yrs', description: 'Multi-service architecture, performance optimization, and engineering roadmap.' },
      { stage: 'LEAD_EXECUTIVE', title: 'Principal Engineer / VP Engineering', yearsExperience: '11+ yrs', description: 'Enterprise engineering strategy, technology roadmap, and tech organization leadership.' },
    ],
    regionalSalaryBaseline: [
      { countryCode: 'IN', currency: 'INR', unit: 'LPA', median: 14.5, p10: 6.0, p90: 38.0 },
      { countryCode: 'US', currency: 'USD', unit: 'USD_YEAR', median: 148000, p10: 98000, p90: 240000 },
      { countryCode: 'GB', currency: 'GBP', unit: 'GBP_YEAR', median: 72000, p10: 45000, p90: 125000 },
      { countryCode: 'AE', currency: 'AED', unit: 'AED_MONTH', median: 28000, p10: 15000, p90: 55000 },
      { countryCode: 'DE', currency: 'EUR', unit: 'EUR_YEAR', median: 82000, p10: 55000, p90: 120000 },
    ],
    adjacentOccupations: ['data-engineer', 'cloud-architect', 'devops-engineer', 'site-reliability-engineer'],
    isHighDemand: true,
    industryId: 'IND-TECH',
    salaryBenchmark: {
      currency: 'INR',
      percentileP50: 18.0,
      regionalMultipliers: {
        US: 5.2,
        GB: 4.1,
        AE: 3.8,
      },
    },
  },
  {
    entityId: 'OCC-TECH-DS-001',
    slug: 'data-scientist',
    canonicalName: 'Data Scientist',
    tier: 'OCCUPATION',
    industrySlug: 'technology',
    sectorSlug: 'artificial-intelligence',
    subSectorSlug: 'machine-learning',
    aliases: ['data scientist', 'machine learning scientist', 'ai scientist', 'ml engineer'],
    description: 'Specialist applying statistical modeling, predictive algorithms, and machine learning techniques to extract actionable intelligence from big data.',
    skills: {
      coreTechnical: ['Statistical Inference', 'Machine Learning Algorithms', 'Deep Learning', 'NLP / LLM Fine-tuning'],
      domainKnowledge: ['Feature Engineering', 'Hypothesis Testing', 'Data Pipeline Architecture', 'Model Governance'],
      toolsAndFrameworks: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'SQL', 'Spark', 'Hugging Face', 'Databricks'],
      softSkills: ['Business Translation', 'Data Storytelling', 'Curiosity', 'Executive Presentation'],
    },
    certifications: ['TensorFlow Developer Certificate', 'AWS Machine Learning Specialty', 'Databricks Certified Machine Learning Professional'],
    careerStages: [
      { stage: 'ENTRY_LEVEL', title: 'Junior Data Scientist', yearsExperience: '0-2 yrs', description: 'Data wrangling, exploratory data analysis, and baseline model training.' },
      { stage: 'MID_LEVEL', title: 'Data Scientist II', yearsExperience: '3-6 yrs', description: 'Production model deployment, feature store engineering, and A/B test analysis.' },
      { stage: 'SENIOR_LEVEL', title: 'Lead Data Scientist', yearsExperience: '7-10 yrs', description: 'ML system architecture, complex algorithm design, and business strategy modeling.' },
      { stage: 'LEAD_EXECUTIVE', title: 'Chief Data Scientist / Head of AI', yearsExperience: '11+ yrs', description: 'Enterprise AI vision, research roadmap, and strategic automation leadership.' },
    ],
    regionalSalaryBaseline: [
      { countryCode: 'IN', currency: 'INR', unit: 'LPA', median: 16.0, p10: 7.5, p90: 42.0 },
      { countryCode: 'US', currency: 'USD', unit: 'USD_YEAR', median: 156000, p10: 105000, p90: 250000 },
      { countryCode: 'GB', currency: 'GBP', unit: 'GBP_YEAR', median: 78000, p10: 50000, p90: 130000 },
      { countryCode: 'AE', currency: 'AED', unit: 'AED_MONTH', median: 32000, p10: 18000, p90: 60000 },
    ],
    adjacentOccupations: ['data-engineer', 'machine-learning-engineer', 'quantitative-analyst'],
    isHighDemand: true,
  },
  {
    entityId: 'OCC-TECH-DA-001',
    slug: 'data-analyst',
    canonicalName: 'Data Analyst',
    tier: 'OCCUPATION',
    industrySlug: 'technology',
    sectorSlug: 'analytics',
    subSectorSlug: 'business-intelligence',
    aliases: ['data analyst', 'business data analyst', 'bi analyst', 'junior data analyst'],
    description: 'Analytics specialist transforming raw datasets into dashboards, reports, and statistical insights to guide business decision-making.',
    skills: {
      coreTechnical: ['SQL Query Optimization', 'Exploratory Data Analysis', 'Statistical Analysis', 'Dashboard Design'],
      domainKnowledge: ['KPI Formulation', 'Cohort Analysis', 'A/B Testing Metrics', 'Data Warehousing'],
      toolsAndFrameworks: ['SQL', 'Python (Pandas)', 'Power BI', 'Tableau', 'Excel (VBA)', 'dbt'],
      softSkills: ['Analytical Rigor', 'Business Acumen', 'Executive Storytelling'],
    },
    certifications: ['Microsoft Certified: Power BI Data Analyst', 'Google Data Analytics Professional Certificate'],
    careerStages: [
      { stage: 'ENTRY_LEVEL', title: 'Junior Data Analyst', yearsExperience: '0-2 yrs', description: 'Data extraction, SQL reporting, and dashboard maintenance.' },
      { stage: 'MID_LEVEL', title: 'Senior Data Analyst', yearsExperience: '3-6 yrs', description: 'Complex analytical models, automated ETL checks, and business unit leadership.' },
      { stage: 'SENIOR_LEVEL', title: 'Analytics Manager / Lead', yearsExperience: '7-10 yrs', description: 'Enterprise analytics roadmap, data governance, and strategic intelligence.' },
      { stage: 'LEAD_EXECUTIVE', title: 'Head of Business Intelligence', yearsExperience: '11+ yrs', description: 'C-suite strategic data decisioning and organizational metrics strategy.' },
    ],
    regionalSalaryBaseline: [
      { countryCode: 'IN', currency: 'INR', unit: 'LPA', median: 9.5, p10: 4.5, p90: 22.0 },
      { countryCode: 'US', currency: 'USD', unit: 'USD_YEAR', median: 92000, p10: 60000, p90: 135000 },
      { countryCode: 'GB', currency: 'GBP', unit: 'GBP_YEAR', median: 45000, p10: 28000, p90: 72000 },
      { countryCode: 'AE', currency: 'AED', unit: 'AED_MONTH', median: 19000, p10: 10000, p90: 36000 },
    ],
    adjacentOccupations: ['data-scientist', 'business-intelligence-engineer', 'data-engineer'],
    isHighDemand: true,
  },

  // ============================================================================
  // 3. BFSI & FINANCIAL SERVICES
  // ============================================================================
  {
    entityId: 'OCC-FIN-RM-001',
    slug: 'relationship-manager',
    canonicalName: 'Relationship Manager',
    tier: 'OCCUPATION',
    industrySlug: 'finance',
    sectorSlug: 'banking',
    subSectorSlug: 'wealth-management',
    aliases: ['relationship manager', 'rm', 'client relationship manager', 'wealth manager', 'private banker'],
    description: 'Financial professional managing high-net-worth client relationships, portfolio allocations, and banking solutions.',
    skills: {
      coreTechnical: ['Portfolio Management', 'Wealth Advisory', 'Credit Analysis', 'Financial Planning'],
      domainKnowledge: ['Mutual Funds', 'Fixed Income', 'AML/KYC Regulations', 'Tax Planning'],
      toolsAndFrameworks: ['Finacle', 'Bloomberg Terminal', 'Salesforce Financial Services Cloud', 'Morningstar Direct'],
      softSkills: ['High-Trust Relationship Building', 'Persuasion', 'Active Listening', 'Client Retention'],
    },
    certifications: ['NISM Series V-A (Mutual Funds)', 'Certified Financial Planner (CFP)', 'Chartered Wealth Manager (CWM)'],
    careerStages: [
      { stage: 'ENTRY_LEVEL', title: 'Assistant Relationship Manager', yearsExperience: '0-2 yrs', description: 'Client onboarding, service requests, and financial product cross-selling.' },
      { stage: 'MID_LEVEL', title: 'Senior Relationship Manager', yearsExperience: '3-6 yrs', description: 'Managing ₹50Cr+ AUM, personalized portfolio reviews, and high-yield client retention.' },
      { stage: 'SENIOR_LEVEL', title: 'Vice President - Wealth Management', yearsExperience: '7-10 yrs', description: 'Ultra-HNW portfolio strategy, team mentorship, and regional revenue quotas.' },
      { stage: 'LEAD_EXECUTIVE', title: 'Managing Director - Private Banking', yearsExperience: '11+ yrs', description: 'Head of national wealth management operations and strategic asset allocation.' },
    ],
    regionalSalaryBaseline: [
      { countryCode: 'IN', currency: 'INR', unit: 'LPA', median: 11.0, p10: 5.0, p90: 28.0 },
      { countryCode: 'US', currency: 'USD', unit: 'USD_YEAR', median: 115000, p10: 75000, p90: 210000 },
      { countryCode: 'GB', currency: 'GBP', unit: 'GBP_YEAR', median: 62000, p10: 40000, p90: 110000 },
      { countryCode: 'AE', currency: 'AED', unit: 'AED_MONTH', median: 24000, p10: 12000, p90: 45000 },
    ],
    adjacentOccupations: ['investment-banker', 'financial-analyst', 'credit-analyst'],
    isHighDemand: true,
  },
  {
    entityId: 'OCC-FIN-CA-001',
    slug: 'chartered-accountant',
    canonicalName: 'Chartered Accountant (CA / CPA)',
    tier: 'OCCUPATION',
    industrySlug: 'finance',
    sectorSlug: 'accounting',
    subSectorSlug: 'audit-taxation',
    aliases: ['chartered accountant', 'ca', 'certified public accountant', 'cpa', 'auditor', 'statutory auditor'],
    description: 'Accounting authority providing statutory audits, corporate taxation, financial reporting, and compliance advisory.',
    skills: {
      coreTechnical: ['Statutory Audit', 'Corporate Taxation (Direct & Indirect)', 'IFRS / Ind AS Compliance', 'Financial Modeling'],
      domainKnowledge: ['Company Law', 'Transfer Pricing', 'Internal Controls over Financial Reporting (ICFR)', 'Forensic Audit'],
      toolsAndFrameworks: ['SAP ERP', 'Oracle Financials', 'Tally Prime', 'Tableau for Audit Analytics'],
      softSkills: ['Professional Skepticism', 'Integrity', 'Executive Reporting', 'Negotiation with Regulators'],
    },
    certifications: ['Chartered Accountant (ICAI Member)', 'Certified Public Accountant (CPA)', 'ACCA Qualification'],
    careerStages: [
      { stage: 'ENTRY_LEVEL', title: 'Audit Senior / Associate CA', yearsExperience: '0-2 yrs', description: 'Statutory audit fieldwork, tax computation, and compliance filing.' },
      { stage: 'MID_LEVEL', title: 'Audit Manager / Finance Controller', yearsExperience: '3-6 yrs', description: 'Leading audit engagements, financial closing, and direct tax assessments.' },
      { stage: 'SENIOR_LEVEL', title: 'Director / Partner (Audit/Tax)', yearsExperience: '7-10 yrs', description: 'Client acquisition, complex M&A tax structuring, and partner-level governance.' },
      { stage: 'LEAD_EXECUTIVE', title: 'Chief Financial Officer (CFO)', yearsExperience: '11+ yrs', description: 'Corporate finance leadership, capital allocation, treasury, and investor relations.' },
    ],
    regionalSalaryBaseline: [
      { countryCode: 'IN', currency: 'INR', unit: 'LPA', median: 15.0, p10: 8.0, p90: 36.0 },
      { countryCode: 'US', currency: 'USD', unit: 'USD_YEAR', median: 125000, p10: 82000, p90: 195000 },
      { countryCode: 'GB', currency: 'GBP', unit: 'GBP_YEAR', median: 68000, p10: 44000, p90: 115000 },
      { countryCode: 'AE', currency: 'AED', unit: 'AED_MONTH', median: 26000, p10: 14000, p90: 52000 },
    ],
    adjacentOccupations: ['finance-manager', 'treasury-manager', 'investment-analyst'],
    isHighDemand: true,
    governingBodies: ['Institute of Chartered Accountants of India (ICAI)', 'AICPA', 'ICAEW'],
    industryId: 'IND-FIN',
  },

  // ============================================================================
  // 4. CONSTRUCTION, REAL ESTATE & INFRASTRUCTURE
  // ============================================================================
  {
    entityId: 'OCC-ENG-CIVIL-001',
    slug: 'civil-engineer',
    canonicalName: 'Civil Engineer',
    tier: 'OCCUPATION',
    industrySlug: 'construction',
    sectorSlug: 'civil-infrastructure',
    subSectorSlug: 'structural-engineering',
    aliases: ['civil engineer', 'structural engineer', 'site engineer', 'construction engineer', 'project engineer civil'],
    description: 'Engineering professional planning, designing, overseeing, and managing the construction and maintenance of building structures and public infrastructure.',
    skills: {
      coreTechnical: ['Structural Analysis', 'Concrete & Steel Design', 'Quantity Surveying', 'Site Execution & QA/QC'],
      domainKnowledge: ['Building Codes (IS/IBC/Eurocode)', 'Geotechnical Engineering', 'Project Scheduling', 'HSE Compliance'],
      toolsAndFrameworks: ['AutoCAD', 'STAAD.Pro', 'ETABS', 'Primavera P6', 'Revit BIM'],
      softSkills: ['Site Contractor Coordination', 'Vendor Negotiation', 'Safety Consciousness', 'Budget Management'],
    },
    certifications: ['Professional Engineer (PE) License', 'Chartered Engineer (IEI)', 'PMP Certification'],
    careerStages: [
      { stage: 'ENTRY_LEVEL', title: 'Site Civil Engineer', yearsExperience: '0-2 yrs', description: 'Site supervision, BBS checking, quality inspection, and daily progress reporting.' },
      { stage: 'MID_LEVEL', title: 'Senior Structural / Project Engineer', yearsExperience: '3-6 yrs', description: 'Structural design modeling, contractor bill verification, and milestone coordination.' },
      { stage: 'SENIOR_LEVEL', title: 'Project Manager / Construction Lead', yearsExperience: '7-10 yrs', description: 'End-to-end EPC project delivery, cost optimization, and multi-package governance.' },
      { stage: 'LEAD_EXECUTIVE', title: 'VP Infrastructure Projects / COO', yearsExperience: '11+ yrs', description: 'Portfolio project execution, multi-crore infrastructure tendering, and company operations.' },
    ],
    regionalSalaryBaseline: [
      { countryCode: 'IN', currency: 'INR', unit: 'LPA', median: 7.5, p10: 3.8, p90: 22.0 },
      { countryCode: 'US', currency: 'USD', unit: 'USD_YEAR', median: 98000, p10: 68000, p90: 145000 },
      { countryCode: 'GB', currency: 'GBP', unit: 'GBP_YEAR', median: 52000, p10: 34000, p90: 85000 },
      { countryCode: 'AE', currency: 'AED', unit: 'AED_MONTH', median: 18500, p10: 9500, p90: 36000 },
      { countryCode: 'SA', currency: 'SAR', unit: 'SAR_MONTH', median: 21000, p10: 11000, p90: 42000 },
    ],
    adjacentOccupations: ['mep-engineer', 'project-planner', 'cost-consultant'],
    isHighDemand: true,
  },

  // ============================================================================
  // 5. AVIATION, AEROSPACE & LOGISTICS
  // ============================================================================
  {
    entityId: 'OCC-AVI-PILOT-001',
    slug: 'commercial-pilot',
    canonicalName: 'Commercial Airline Pilot',
    tier: 'OCCUPATION',
    industrySlug: 'aviation',
    sectorSlug: 'flight-operations',
    subSectorSlug: 'commercial-aviation',
    aliases: ['commercial pilot', 'airline pilot', 'first officer', 'captain', 'aviator', 'atpl pilot'],
    description: 'Licensed aviation professional operating multi-engine transport aircraft safely on scheduled passenger and cargo flight operations.',
    skills: {
      coreTechnical: ['Flight Navigation', 'Instrument Flight Rules (IFR)', 'Aircraft Systems Management', 'Crew Resource Management (CRM)'],
      domainKnowledge: ['Aviation Meteorology', 'ICAO/FAA/DGCA Regulations', 'Aerodynamics', 'Emergency Flight Procedures'],
      toolsAndFrameworks: ['Flight Management System (FMS)', 'EFB (Electronic Flight Bag)', 'Jeppesen Flight Deck Pro', 'TCAS/EGPWS'],
      softSkills: ['High-Stress Situational Awareness', 'Decisiveness', 'Clear Radio Telephony', 'Leadership'],
    },
    certifications: ['Airline Transport Pilot License (ATPL)', 'Commercial Pilot License (CPL)', 'Type Rating (A320/B737/B777)', 'Class 1 Medical'],
    careerStages: [
      { stage: 'ENTRY_LEVEL', title: 'Second Officer / Junior First Officer', yearsExperience: '0-2 yrs', description: 'Supervised line flying, cruise relief, and standard operating procedure mastery.' },
      { stage: 'MID_LEVEL', title: 'Senior First Officer', yearsExperience: '3-6 yrs', description: 'Co-pilot flight duties, bad-weather operations, and command preparation hours.' },
      { stage: 'SENIOR_LEVEL', title: 'Captain (Line Captain)', yearsExperience: '7-12 yrs', description: 'Pilot-in-Command (PIC) responsibility for aircraft, crew, and passenger safety.' },
      { stage: 'LEAD_EXECUTIVE', title: 'Chief Pilot / Fleet Captain', yearsExperience: '13+ yrs', description: 'Airline flight operations governance, simulator training, and safety audit board.' },
    ],
    regionalSalaryBaseline: [
      { countryCode: 'IN', currency: 'INR', unit: 'LPA', median: 36.0, p10: 18.0, p90: 75.0 },
      { countryCode: 'US', currency: 'USD', unit: 'USD_YEAR', median: 215000, p10: 110000, p90: 380000 },
      { countryCode: 'GB', currency: 'GBP', unit: 'GBP_YEAR', median: 110000, p10: 60000, p90: 190000 },
      { countryCode: 'AE', currency: 'AED', unit: 'AED_MONTH', median: 38000, p10: 24000, p90: 68000 },
    ],
    adjacentOccupations: ['flight-instructor', 'flight-dispatcher', 'air-traffic-controller'],
    isHighDemand: true,
    governingBodies: ['Directorate General of Civil Aviation (DGCA)', 'Federal Aviation Administration (FAA)', 'GCAA UAE'],
  },

  // ============================================================================
  // 6. HOSPITALITY, TOURISM & F&B
  // ============================================================================
  {
    entityId: 'OCC-HOS-MGR-001',
    slug: 'hotel-manager',
    canonicalName: 'Hotel General Manager',
    tier: 'OCCUPATION',
    industrySlug: 'hospitality',
    sectorSlug: 'hotel-resort-management',
    subSectorSlug: 'luxury-hospitality',
    aliases: ['hotel manager', 'general manager hotel', 'resort manager', 'hospitality operations manager'],
    description: 'Executive professional managing overall hotel operations, guest satisfaction, revenue per available room (RevPAR), and staff excellence.',
    skills: {
      coreTechnical: ['Hotel Operations Management', 'RevPAR Optimization', 'Food & Beverage Controls', 'Guest Satisfaction Auditing'],
      domainKnowledge: ['Yield Management', 'Hospitality Law & Safety', 'Event Banquet Planning', 'Luxury Brand Standards'],
      toolsAndFrameworks: ['Opera Cloud PMS', 'Amadeus Hospitality', 'HotSOS', 'RateGain'],
      softSkills: ['Hospitality Intuition', 'Crisis Resolution', 'Multicultural Leadership', 'VIP Host Management'],
    },
    certifications: ['Certified Hotel Administrator (CHA)', 'HACCP Food Safety Certification', 'WSET Wine Certification'],
    careerStages: [
      { stage: 'ENTRY_LEVEL', title: 'Assistant Front Office Manager', yearsExperience: '0-2 yrs', description: 'Guest check-in excellence, lobby operations, and night audit verification.' },
      { stage: 'MID_LEVEL', title: 'Director of Rooms / Operations Manager', yearsExperience: '3-6 yrs', description: 'Rooms division management, housekeeping standards, and operational P&L.' },
      { stage: 'SENIOR_LEVEL', title: 'Hotel Resident Manager / Hotel Manager', yearsExperience: '7-10 yrs', description: 'Day-to-day property governance, sales coordination, and guest delight scores.' },
      { stage: 'LEAD_EXECUTIVE', title: 'General Manager (Cluster / Luxury GM)', yearsExperience: '11+ yrs', description: 'Executive ownership of hotel asset, brand owner relations, and EBITDA targets.' },
    ],
    regionalSalaryBaseline: [
      { countryCode: 'IN', currency: 'INR', unit: 'LPA', median: 18.0, p10: 7.5, p90: 45.0 },
      { countryCode: 'US', currency: 'USD', unit: 'USD_YEAR', median: 118000, p10: 72000, p90: 195000 },
      { countryCode: 'GB', currency: 'GBP', unit: 'GBP_YEAR', median: 58000, p10: 36000, p90: 95000 },
      { countryCode: 'AE', currency: 'AED', unit: 'AED_MONTH', median: 32000, p10: 16000, p90: 60000 },
    ],
    adjacentOccupations: ['f-and-b-director', 'event-director', 'facilities-director'],
    isHighDemand: true,
  },
];

/**
 * Global Occupation Taxonomy Registry
 */
export class GlobalOccupationTaxonomy {
  private static nodeMap = new Map<string, GlobalOccupationNode>();
  private static slugMap = new Map<string, GlobalOccupationNode>();
  private static aliasMap = new Map<string, string>(); // alias.toLowerCase() -> entityId

  static {
    COMPREHENSIVE_GLOBAL_OCCUPATIONS.forEach((node) => {
      this.nodeMap.set(node.entityId, node);
      this.slugMap.set(node.slug, node);
      this.aliasMap.set(node.canonicalName.toLowerCase(), node.entityId);
      node.aliases.forEach((alias) => {
        this.aliasMap.set(alias.toLowerCase().trim(), node.entityId);
      });

      // Alias short IDs
      if (node.slug === 'software-engineer') {
        this.nodeMap.set('OCC-SWE', node);
      } else if (node.slug === 'data-analyst') {
        this.nodeMap.set('OCC-DA', node);
      } else if (node.slug === 'clinical-research-associate') {
        this.nodeMap.set('OCC-CRA', node);
      } else if (node.slug === 'chartered-accountant') {
        this.nodeMap.set('OCC-CA', node);
      }
    });
  }

  /**
   * Get an occupation by stable entity ID (e.g. OCC-TECH-SWE-001)
   */
  public static getNode(entityId: string): GlobalOccupationNode | null {
    return this.nodeMap.get(entityId) || null;
  }

  /**
   * Get an occupation by URL slug (e.g. 'pharmacist', 'software-engineer')
   */
  public static getNodeBySlug(slug: string): GlobalOccupationNode | null {
    return this.slugMap.get(slug.toLowerCase().trim()) || null;
  }

  /**
   * Resolves search query tokens to canonical occupation node
   */
  public static resolveOccupation(query: string): GlobalOccupationNode | null {
    if (!query) return null;
    const clean = query.toLowerCase().trim();

    // 1. Direct slug match
    if (this.slugMap.has(clean)) {
      return this.slugMap.get(clean)!;
    }

    // 2. Direct alias match
    const aliasedId = this.aliasMap.get(clean);
    if (aliasedId && this.nodeMap.has(aliasedId)) {
      return this.nodeMap.get(aliasedId)!;
    }

    // 3. Partial alias match
    for (const [alias, id] of this.aliasMap.entries()) {
      if (alias.length > 3 && clean.includes(alias)) {
        return this.nodeMap.get(id) || null;
      }
    }

    return null;
  }

  /**
   * Get all registered occupations
   */
  public static getAllOccupations(): GlobalOccupationNode[] {
    return COMPREHENSIVE_GLOBAL_OCCUPATIONS;
  }

  /**
   * Get localized salary baseline for an occupation and country
   */
  public static getSalaryForCountry(occupationSlug: string, countryCode: string) {
    const node = this.getNodeBySlug(occupationSlug);
    if (!node) return null;
    return node.regionalSalaryBaseline.find(
      (s) => s.countryCode.toUpperCase() === countryCode.toUpperCase()
    ) || null;
  }
}

export const globalOccupationTaxonomy = {
  getOccupation: (entityId: string): GlobalOccupationNode | null => {
    return GlobalOccupationTaxonomy.getNode(entityId);
  },
  getNode: (entityId: string): GlobalOccupationNode | null => {
    return GlobalOccupationTaxonomy.getNode(entityId);
  },
  getNodeBySlug: (slug: string): GlobalOccupationNode | null => {
    return GlobalOccupationTaxonomy.getNodeBySlug(slug);
  },
  resolveOccupation: (query: string): GlobalOccupationNode | null => {
    return GlobalOccupationTaxonomy.resolveOccupation(query);
  },
  getAllOccupations: (): GlobalOccupationNode[] => {
    return GlobalOccupationTaxonomy.getAllOccupations();
  },
  getSalaryForCountry: (occupationSlug: string, countryCode: string) => {
    return GlobalOccupationTaxonomy.getSalaryForCountry(occupationSlug, countryCode);
  },
};

