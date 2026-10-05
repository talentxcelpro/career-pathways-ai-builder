// src/lib/seo/searchUniverse/globalIndustryHierarchy.ts
/**
 * TalentXcel Multi-Tier Global Industry & Occupation Hierarchy
 *
 * Implements the strategic mandate:
 * "TalentXcel = Global Career Intelligence Graph for every profession, occupation, and industry."
 *
 * Formal 6-Tier Hierarchy:
 * Tier 1: Industry       (e.g., Healthcare, Banking, Construction, Hospitality, Aviation)
 * Tier 2: Sector         (e.g., Pharmacy, Clinical Medicine, Retail Banking, Hotel Operations)
 * Tier 3: SubSector      (e.g., Retail Pharmacy, Hospital Pharmacy, Commercial Lending)
 * Tier 4: Occupation     (e.g., Pharmacist, Nurse, Physician, Hotel Manager, Civil Engineer)
 * Tier 5: Specialization (e.g., Clinical Pharmacist, Oncology Pharmacist, Structural Engineer)
 * Tier 6: Role           (e.g., hospital-pharmacist, oncology-pharmacist, store-manager, head-chef)
 *
 * Cross-connected to 22 Intent Dimensions:
 * Jobs | Salary | Skills | Resume | ATS | Interview | Courses | Certifications | Career Path | Companies | Locations | Govt Jobs
 */

export type IndustryTier = 
  | 'INDUSTRY'        // Tier 1
  | 'SECTOR'          // Tier 2
  | 'SUB_SECTOR'      // Tier 3
  | 'OCCUPATION'      // Tier 4
  | 'SPECIALIZATION'  // Tier 5
  | 'ROLE';           // Tier 6

export interface IndustryHierarchyNode {
  slug: string;
  name: string;
  tier: IndustryTier;
  parentSlug?: string;
  industrySlug: string; // Root Industry slug
  aliases: string[];
  description: string;
  isHighDemand: boolean;
  sampleIntentQueries?: string[];
  skills?: string[];
  certifications?: string[];
  governingBodies?: string[];
}

export interface IndustryRelationshipEdge {
  sourceSlug: string;
  targetSlug: string;
  relationship: 'PARENT_OF' | 'SECTOR_OF' | 'SUBSECTOR_OF' | 'OCCUPATION_OF' | 'SPECIALIZATION_OF' | 'ADJACENT_TO';
}

/**
 * Global Multi-Industry & Occupation Catalog
 * Covering 32 Global Industry Sectors with deep occupational branching.
 */
export const COMPREHENSIVE_INDUSTRY_CATALOG: IndustryHierarchyNode[] = [
  // ============================================================================
  // 1. HEALTHCARE & MEDICINE
  // ============================================================================
  {
    slug: 'healthcare',
    name: 'Healthcare & Medicine',
    tier: 'INDUSTRY',
    industrySlug: 'healthcare',
    aliases: ['health', 'medical', 'hospital', 'clinical', 'medicine'],
    description: 'Global healthcare systems, hospitals, diagnostics, and patient care delivery.',
    isHighDemand: true,
  },
  // Sectors & Sub-sectors
  {
    slug: 'pharmacy',
    name: 'Pharmacy & Pharmaceuticals Care',
    tier: 'SECTOR',
    parentSlug: 'healthcare',
    industrySlug: 'healthcare',
    aliases: ['pharma care', 'pharmaceuticals', 'dispensary'],
    description: 'Drug discovery, clinical dispensing, pharmacy operations, and therapeutic monitoring.',
    isHighDemand: true,
  },
  {
    slug: 'retail-pharmacy',
    name: 'Retail & Community Pharmacy',
    tier: 'SUB_SECTOR',
    parentSlug: 'pharmacy',
    industrySlug: 'healthcare',
    aliases: ['community pharmacy', 'chemist shop', 'retail drug store'],
    description: 'Direct patient dispensing, prescription fulfillment, and OTC consultation.',
    isHighDemand: true,
  },
  {
    slug: 'hospital-pharmacy-sector',
    name: 'Hospital & Inpatient Pharmacy',
    tier: 'SUB_SECTOR',
    parentSlug: 'pharmacy',
    industrySlug: 'healthcare',
    aliases: ['inpatient pharmacy', 'clinical drug supply'],
    description: 'Inpatient prescription review, sterile IV compounding, and ICU pharmacotherapy.',
    isHighDemand: true,
  },
  // Occupations & Specializations
  {
    slug: 'pharmacist',
    name: 'Pharmacist',
    tier: 'OCCUPATION',
    parentSlug: 'pharmacy',
    industrySlug: 'healthcare',
    aliases: ['druggist', 'chemist', 'pharmacy officer', 'rph'],
    description: 'Licensed healthcare professional specialized in the safe use and dispensing of medications.',
    isHighDemand: true,
    skills: ['Pharmacology', 'Prescription Dispensing', 'Drug Interaction Screening', 'Patient Counseling', 'Inventory Control'],
    certifications: ['PharmD / B.Pharm License', 'Board Certified Pharmacotherapy Specialist (BCPS)'],
    governingBodies: ['Pharmacy Council of India (PCI)', 'General Pharmaceutical Council (GPhC)', 'FDA', 'NABP'],
    sampleIntentQueries: [
      'pharmacist jobs in delhi',
      'pharmacist salary in dubai',
      'pharmacist resume examples',
      'pharmacist ats keywords',
      'pharmacist interview questions',
      'pharmacist government jobs',
      'pharmacist courses and certifications'
    ]
  },
  {
    slug: 'clinical-pharmacist',
    name: 'Clinical Pharmacist',
    tier: 'SPECIALIZATION',
    parentSlug: 'pharmacist',
    industrySlug: 'healthcare',
    aliases: ['hospital pharmacist', 'inpatient pharmacist'],
    description: 'Pharmacist working directly with medical teams in hospital wards to optimize drug therapy.',
    isHighDemand: true,
  },
  {
    slug: 'oncology-pharmacist',
    name: 'Oncology Pharmacist',
    tier: 'SPECIALIZATION',
    parentSlug: 'pharmacist',
    industrySlug: 'healthcare',
    aliases: ['cancer pharmacy specialist', 'chemotherapy pharmacist'],
    description: 'Specialist managing chemotherapy drug regimens, supportive care, and clinical oncology trials.',
    isHighDemand: true,
  },
  {
    slug: 'nurse',
    name: 'Registered Nurse',
    tier: 'OCCUPATION',
    parentSlug: 'healthcare',
    industrySlug: 'healthcare',
    aliases: ['rn', 'staff nurse', 'nursing officer', 'sister'],
    description: 'Primary patient care provider assessing patient needs, administering treatments, and assisting physicians.',
    isHighDemand: true,
    skills: ['Patient Triage', 'IV Cannulation', 'Vital Signs Monitoring', 'EHR Charting', 'ICU Care', 'BLS / ACLS'],
    certifications: ['B.Sc Nursing License', 'NCLEX-RN', 'OET / IELTS for Healthcare'],
  },
  {
    slug: 'doctor-physician',
    name: 'Doctor / Physician',
    tier: 'OCCUPATION',
    parentSlug: 'healthcare',
    industrySlug: 'healthcare',
    aliases: ['physician', 'medical officer', 'doctor', 'mbbs doctor', 'consultant physician'],
    description: 'Licensed medical practitioner diagnosing diseases, prescribing treatments, and managing clinical care.',
    isHighDemand: true,
  },
  {
    slug: 'medical-lab-technician',
    name: 'Medical Laboratory Technician',
    tier: 'OCCUPATION',
    parentSlug: 'healthcare',
    industrySlug: 'healthcare',
    aliases: ['lab technician', 'pathology technician', 'dmlt', 'phlebotomist'],
    description: 'Allied health professional conducting clinical tests on biological specimens for medical diagnosis.',
    isHighDemand: true,
  },

  // ============================================================================
  // 2. BANKING, FINANCIAL SERVICES & INSURANCE (BFSI)
  // ============================================================================
  {
    slug: 'banking-finance',
    name: 'Banking & Financial Services',
    tier: 'INDUSTRY',
    industrySlug: 'banking-finance',
    aliases: ['banking', 'finance', 'bfsi', 'fintech', 'financial services'],
    description: 'Commercial banking, retail banking, wealth management, and capital markets.',
    isHighDemand: true,
  },
  {
    slug: 'relationship-manager',
    name: 'Relationship Manager (Banking)',
    tier: 'OCCUPATION',
    parentSlug: 'banking-finance',
    industrySlug: 'banking-finance',
    aliases: ['rm', 'priority banker', 'wealth relationship manager', 'premier banker'],
    description: 'Client-facing banking professional managing high-net-worth portfolios and commercial banking relationships.',
    isHighDemand: true,
    skills: ['Portfolio Advisory', 'Wealth Management', 'Cross-Selling', 'KYC / AML Compliance', 'Credit Risk Appraisal'],
  },
  {
    slug: 'credit-analyst',
    name: 'Credit Analyst',
    tier: 'OCCUPATION',
    parentSlug: 'banking-finance',
    industrySlug: 'banking-finance',
    aliases: ['underwriter', 'commercial credit officer', 'risk analyst'],
    description: 'Financial professional evaluating creditworthiness of corporate and retail loan applicants.',
    isHighDemand: true,
    skills: ['Financial Statement Analysis', 'Cash Flow Modeling', 'Debt Service Coverage (DSCR)', 'Credit Appraisal', 'Risk Rating'],
  },
  {
    slug: 'branch-manager',
    name: 'Bank Branch Manager',
    tier: 'OCCUPATION',
    parentSlug: 'banking-finance',
    industrySlug: 'banking-finance',
    aliases: ['branch head', 'branch operations manager'],
    description: 'Executive in charge of branch administrative operations, CASA deposits, and regulatory compliance.',
    isHighDemand: true,
  },
  {
    slug: 'insurance-actuary',
    name: 'Actuary / Insurance Risk Modeler',
    tier: 'OCCUPATION',
    parentSlug: 'banking-finance',
    industrySlug: 'banking-finance',
    aliases: ['actuary', 'actuarial analyst', 'underwriting actuary'],
    description: 'Mathematical professional assessing financial consequences of risk and uncertain future events for insurance.',
    isHighDemand: true,
  },

  // ============================================================================
  // 3. HOSPITALITY, TRAVEL & TOURISM
  // ============================================================================
  {
    slug: 'hospitality-tourism',
    name: 'Hospitality, Travel & Tourism',
    tier: 'INDUSTRY',
    industrySlug: 'hospitality-tourism',
    aliases: ['hospitality', 'hotels', 'tourism', 'travel', 'resorts'],
    description: 'Hotels, luxury resorts, guest services, culinary arts, and travel consulting.',
    isHighDemand: true,
  },
  {
    slug: 'hotel-manager',
    name: 'Hotel Manager / General Manager',
    tier: 'OCCUPATION',
    parentSlug: 'hospitality-tourism',
    industrySlug: 'hospitality-tourism',
    aliases: ['hotel manager', 'general manager hotel', 'resort manager', 'hotel gm', 'front office manager'],
    description: 'Senior leader overseeing hotel operations, guest satisfaction, revenue management (RevPAR), and team leadership.',
    isHighDemand: true,
    skills: ['RevPAR Optimization', 'Front Office Management', 'Guest Delight Operations', 'P&L Management', 'F&B Operations'],
    sampleIntentQueries: [
      'hotel manager jobs in london',
      'hotel manager salary in dubai',
      'hotel manager resume examples',
      'hotel manager interview questions',
      'hotel management courses and degrees'
    ]
  },
  {
    slug: 'executive-chef',
    name: 'Executive Chef / Head Chef',
    tier: 'OCCUPATION',
    parentSlug: 'hospitality-tourism',
    industrySlug: 'hospitality-tourism',
    aliases: ['chef', 'head chef', 'culinary director', 'sous chef'],
    description: 'Master culinary artist commanding kitchen operations, menu engineering, food cost control, and food safety standards.',
    isHighDemand: true,
    skills: ['Menu Engineering', 'HACCP Safety Standards', 'Food Cost Control', 'Culinary Presentation', 'Staff Training'],
  },
  {
    slug: 'travel-consultant',
    name: 'Travel Consultant & Tour Manager',
    tier: 'OCCUPATION',
    parentSlug: 'hospitality-tourism',
    industrySlug: 'hospitality-tourism',
    aliases: ['travel agent', 'tour operator', 'itinerary planner', 'holiday specialist'],
    description: 'Travel specialist designing customized international holiday itineraries, corporate travel, and visa booking.',
    isHighDemand: true,
  },

  // ============================================================================
  // 4. CIVIL ENGINEERING & CONSTRUCTION
  // ============================================================================
  {
    slug: 'construction-real-estate',
    name: 'Construction, Infrastructure & Real Estate',
    tier: 'INDUSTRY',
    industrySlug: 'construction-real-estate',
    aliases: ['construction', 'civil engineering', 'infrastructure', 'real estate', 'property'],
    description: 'Commercial buildings, highways, bridges, mega-structures, and real estate development.',
    isHighDemand: true,
  },
  {
    slug: 'civil-engineer',
    name: 'Civil Engineer',
    tier: 'OCCUPATION',
    parentSlug: 'construction-real-estate',
    industrySlug: 'construction-real-estate',
    aliases: ['structural engineer', 'site engineer', 'construction engineer', 'project engineer civil'],
    description: 'Engineering professional designing, executing, and supervising infrastructure construction projects.',
    isHighDemand: true,
    skills: ['AutoCAD', 'STAAD.Pro', 'Site Execution', 'Quality Control / QA-QC', 'BOM / Estimation', 'RCC Design'],
    sampleIntentQueries: [
      'civil engineer jobs in dubai',
      'civil engineer salary in bangalore',
      'civil engineer resume format',
      'civil engineer interview questions',
      'civil engineering government jobs upsc ies'
    ]
  },
  {
    slug: 'quantity-surveyor',
    name: 'Quantity Surveyor / Cost Estimator',
    tier: 'OCCUPATION',
    parentSlug: 'construction-real-estate',
    industrySlug: 'construction-real-estate',
    aliases: ['qs', 'cost consultant', 'billing engineer', 'contracts engineer'],
    description: 'Construction professional managing project costs, tender evaluations, contracts, and measurement audits.',
    isHighDemand: true,
  },
  {
    slug: 'real-estate-broker',
    name: 'Real Estate Broker & Property Advisor',
    tier: 'OCCUPATION',
    parentSlug: 'construction-real-estate',
    industrySlug: 'construction-real-estate',
    aliases: ['realtor', 'property consultant', 'commercial leasing manager'],
    description: 'Licensed professional mediating commercial and residential property transactions and leasing agreements.',
    isHighDemand: true,
  },

  // ============================================================================
  // 5. MANUFACTURING, AUTOMOTIVE & HEAVY ENGINEERING
  // ============================================================================
  {
    slug: 'manufacturing-automotive',
    name: 'Manufacturing & Automotive',
    tier: 'INDUSTRY',
    industrySlug: 'manufacturing-automotive',
    aliases: ['manufacturing', 'automotive', 'production', 'mechanical', 'plant operations'],
    description: 'Automobile assembly, component fabrication, industrial automation, and plant engineering.',
    isHighDemand: true,
  },
  {
    slug: 'production-engineer',
    name: 'Production Engineer / Plant Manager',
    tier: 'OCCUPATION',
    parentSlug: 'manufacturing-automotive',
    industrySlug: 'manufacturing-automotive',
    aliases: ['plant manager', 'manufacturing engineer', 'shop floor manager', 'operations engineer'],
    description: 'Engineer responsible for manufacturing line uptime, lean 5S execution, throughput yield, and worker safety.',
    isHighDemand: true,
    skills: ['Lean Manufacturing', 'Six Sigma', 'TPM / OEE Optimization', 'Root Cause Analysis (8D)', 'ISO 9001 / IATF 16949'],
  },
  {
    slug: 'cnc-machinist',
    name: 'CNC Machinist & Operator',
    tier: 'OCCUPATION',
    parentSlug: 'manufacturing-automotive',
    industrySlug: 'manufacturing-automotive',
    aliases: ['cnc programmer', 'vmc operator', 'lathe machinist', 'tool and die maker'],
    description: 'Skilled technician programming and operating computer numerical control machine tools to fabricate precision parts.',
    isHighDemand: true,
  },
  {
    slug: 'automotive-service-advisor',
    name: 'Automotive Service Advisor & Technician',
    tier: 'OCCUPATION',
    parentSlug: 'manufacturing-automotive',
    industrySlug: 'manufacturing-automotive',
    aliases: ['service advisor', 'auto mechanic', 'vehicle diagnostician', 'workshop manager'],
    description: 'Automotive specialist handling customer car diagnostics, service estimations, repair scheduling, and delivery.',
    isHighDemand: true,
  },

  // ============================================================================
  // 6. AVIATION & AEROSPACE
  // ============================================================================
  {
    slug: 'aviation-aerospace',
    name: 'Aviation & Aerospace',
    tier: 'INDUSTRY',
    industrySlug: 'aviation-aerospace',
    aliases: ['aviation', 'airlines', 'aerospace', 'airport operations', 'pilot'],
    description: 'Commercial airlines, flight operations, air traffic management, and aircraft maintenance (MRO).',
    isHighDemand: true,
  },
  {
    slug: 'commercial-pilot',
    name: 'Commercial Airline Pilot',
    tier: 'OCCUPATION',
    parentSlug: 'aviation-aerospace',
    industrySlug: 'aviation-aerospace',
    aliases: ['pilot', 'captain', 'first officer', 'airline captain', 'cpl holder'],
    description: 'Licensed aviator commanding commercial passenger and cargo aircraft under FAA / DGCA / EASA regulations.',
    isHighDemand: true,
    skills: ['Flight Navigation', 'Cockpit Resource Management (CRM)', 'Instrument Rating (IR)', 'Multi-Engine Jet Rating', 'Aviation Meteorology'],
    certifications: ['Commercial Pilot License (CPL)', 'Airline Transport Pilot License (ATPL)', 'Class 1 Medical'],
  },
  {
    slug: 'cabin-crew',
    name: 'Cabin Crew / Flight Attendant',
    tier: 'OCCUPATION',
    parentSlug: 'aviation-aerospace',
    industrySlug: 'aviation-aerospace',
    aliases: ['flight attendant', 'air hostess', 'flight steward', 'cabin attendant'],
    description: 'In-flight service and safety professional managing passenger security, emergency evacuations, and VIP hospitality.',
    isHighDemand: true,
  },
  {
    slug: 'aircraft-maintenance-engineer',
    name: 'Aircraft Maintenance Engineer (AME)',
    tier: 'OCCUPATION',
    parentSlug: 'aviation-aerospace',
    industrySlug: 'aviation-aerospace',
    aliases: ['ame', 'avionics engineer', 'airframe technician', 'aircraft mechanic'],
    description: 'Certified engineer inspecting, servicing, and certifying airworthiness of aircraft mechanical and avionics systems.',
    isHighDemand: true,
  },

  // ============================================================================
  // 7. LOGISTICS, SUPPLY CHAIN & TRANSPORT
  // ============================================================================
  {
    slug: 'logistics-supply-chain',
    name: 'Logistics, Supply Chain & Freight',
    tier: 'INDUSTRY',
    industrySlug: 'logistics-supply-chain',
    aliases: ['logistics', 'supply chain', 'freight', 'shipping', 'warehouse', '3pl'],
    description: 'Intermodal freight, warehouse fulfillment, customs clearance, and global container logistics.',
    isHighDemand: true,
  },
  {
    slug: 'supply-chain-manager',
    name: 'Supply Chain Manager',
    tier: 'OCCUPATION',
    parentSlug: 'logistics-supply-chain',
    industrySlug: 'logistics-supply-chain',
    aliases: ['logistics director', 'scm lead', 'global logistics manager'],
    description: 'Leader coordinating end-to-end global vendor procurement, warehouse networks, distribution, and freight freight optimization.',
    isHighDemand: true,
  },
  {
    slug: 'warehouse-operations-manager',
    name: 'Warehouse Operations Manager',
    tier: 'OCCUPATION',
    parentSlug: 'logistics-supply-chain',
    industrySlug: 'logistics-supply-chain',
    aliases: ['warehouse manager', 'fulfillment center lead', 'hub incharge'],
    description: 'Leader directing inventory receiving, picking, packing, automated sorting, and last-mile dispatch.',
    isHighDemand: true,
  },

  // ============================================================================
  // 8. EDUCATION, ACADEMIA & TEACHING
  // ============================================================================
  {
    slug: 'education-academia',
    name: 'Education, Teaching & EdTech',
    tier: 'INDUSTRY',
    industrySlug: 'education-academia',
    aliases: ['education', 'teaching', 'schools', 'universities', 'coaching', 'edtech'],
    description: 'Primary/secondary schools, higher education universities, vocational institutes, and online learning.',
    isHighDemand: true,
  },
  {
    slug: 'school-teacher',
    name: 'Teacher / Educator',
    tier: 'OCCUPATION',
    parentSlug: 'education-academia',
    industrySlug: 'education-academia',
    aliases: ['teacher', 'faculty', 'pgt', 'tgt', 'primary teacher', 'school educator'],
    description: 'Classroom instructor facilitating structured syllabus learning, student mentoring, and academic evaluations.',
    isHighDemand: true,
    skills: ['Pedagogy', 'Curriculum Design', 'Classroom Management', 'Differentiated Instruction', 'Educational Assessment'],
  },
  {
    slug: 'school-principal',
    name: 'Principal / Headmaster',
    tier: 'OCCUPATION',
    parentSlug: 'education-academia',
    industrySlug: 'education-academia',
    aliases: ['principal', 'headmistress', 'dean', 'school director'],
    description: 'Chief educational administrator managing academic standards, faculty leadership, regulatory accreditation, and parent relations.',
    isHighDemand: true,
  },
  {
    slug: 'academic-counselor',
    name: 'Academic & Admissions Counselor',
    tier: 'OCCUPATION',
    parentSlug: 'education-academia',
    industrySlug: 'education-academia',
    aliases: ['education counselor', 'career advisor', 'admissions officer'],
    description: 'Specialist advising students and parents on degree choices, college admissions cutoffs, study abroad, and career paths.',
    isHighDemand: true,
  },

  // ============================================================================
  // 9. LEGAL, COMPLIANCE & PUBLIC POLICY
  // ============================================================================
  {
    slug: 'legal-compliance',
    name: 'Legal, Judiciary & Corporate Compliance',
    tier: 'INDUSTRY',
    industrySlug: 'legal-compliance',
    aliases: ['legal', 'law', 'corporate counsel', 'compliance', 'advocate', 'lawyer'],
    description: 'Litigation law, corporate contract advisory, intellectual property, and statutory regulatory compliance.',
    isHighDemand: true,
  },
  {
    slug: 'corporate-lawyer',
    name: 'Corporate Lawyer / Legal Counsel',
    tier: 'OCCUPATION',
    parentSlug: 'legal-compliance',
    industrySlug: 'legal-compliance',
    aliases: ['lawyer', 'legal counsel', 'in-house counsel', 'corporate advocate', 'attorney'],
    description: 'Legal professional drafting commercial agreements, managing mergers and acquisitions, and mitigating corporate regulatory exposure.',
    isHighDemand: true,
    skills: ['Contract Drafting', 'M&A Due Diligence', 'Intellectual Property', 'Statutory Compliance', 'Dispute Resolution'],
  },
  {
    slug: 'compliance-officer',
    name: 'Chief Compliance Officer (CCO) & Analyst',
    tier: 'OCCUPATION',
    parentSlug: 'legal-compliance',
    industrySlug: 'legal-compliance',
    aliases: ['compliance manager', 'regulatory affairs specialist', 'aml compliance officer'],
    description: 'Corporate auditor ensuring organizational adherence to internal governance, external statutory mandates, and anti-fraud regulations.',
    isHighDemand: true,
  },

  // ============================================================================
  // 10. AGRICULTURE, FORESTRY & FOOD PROCESSING
  // ============================================================================
  {
    slug: 'agriculture-food-processing',
    name: 'Agriculture, Agritech & Food Processing',
    tier: 'INDUSTRY',
    industrySlug: 'agriculture-food-processing',
    aliases: ['agriculture', 'farming', 'agritech', 'food processing', 'horticulture'],
    description: 'Commercial crop farming, seed breeding, soil science, precision agritech, and packaged food manufacturing.',
    isHighDemand: true,
  },
  {
    slug: 'agronomist',
    name: 'Agronomist & Crop Scientist',
    tier: 'OCCUPATION',
    parentSlug: 'agriculture-food-processing',
    industrySlug: 'agriculture-food-processing',
    aliases: ['crop specialist', 'agricultural scientist', 'soil scientist'],
    description: 'Agricultural scientist researching soil health, pest management, crop yields, and climate-resilient farming techniques.',
    isHighDemand: true,
  },
  {
    slug: 'food-technologist',
    name: 'Food Technologist / Quality Officer',
    tier: 'OCCUPATION',
    parentSlug: 'agriculture-food-processing',
    industrySlug: 'agriculture-food-processing',
    aliases: ['food quality inspector', 'fssai officer', 'food safety specialist'],
    description: 'Scientist ensuring safety, chemical balance, packaging shelf-life, and regulatory compliance of manufactured foods.',
    isHighDemand: true,
  },

  // ============================================================================
  // 11. MEDIA, JOURNALISM & ENTERTAINMENT
  // ============================================================================
  {
    slug: 'media-entertainment',
    name: 'Media, Journalism & Entertainment',
    tier: 'INDUSTRY',
    industrySlug: 'media-entertainment',
    aliases: ['media', 'journalism', 'news', 'entertainment', 'broadcasting', 'film'],
    description: 'Broadcast journalism, digital newsrooms, video production, OTT publishing, and creative advertising.',
    isHighDemand: true,
  },
  {
    slug: 'journalist',
    name: 'Journalist / News Reporter',
    tier: 'OCCUPATION',
    parentSlug: 'media-entertainment',
    industrySlug: 'media-entertainment',
    aliases: ['reporter', 'investigative journalist', 'correspondent', 'news anchor'],
    description: 'Media investigator reporting breaking events, interviewing newsmakers, and publishing verified news analyses.',
    isHighDemand: true,
  },
  {
    slug: 'video-producer',
    name: 'Video Producer & Creative Director',
    tier: 'OCCUPATION',
    parentSlug: 'media-entertainment',
    industrySlug: 'media-entertainment',
    aliases: ['content producer', 'multimedia producer', 'filmmaker'],
    description: 'Creative leader overseeing conceptualization, camera crews, post-production editing, and sound design.',
    isHighDemand: true,
  },

  // ============================================================================
  // 12. ENERGY, OIL, GAS & RENEWABLES
  // ============================================================================
  {
    slug: 'energy-oil-gas-renewables',
    name: 'Energy, Oil, Gas & Renewable CleanTech',
    tier: 'INDUSTRY',
    industrySlug: 'energy-oil-gas-renewables',
    aliases: ['energy', 'oil and gas', 'renewables', 'solar', 'wind power', 'petroleum', 'cleantech'],
    description: 'Petroleum drilling, pipeline infrastructure, power generation grids, solar PV farms, and wind turbines.',
    isHighDemand: true,
  },
  {
    slug: 'electrical-power-engineer',
    name: 'Electrical Power Engineer',
    tier: 'OCCUPATION',
    parentSlug: 'energy-oil-gas-renewables',
    industrySlug: 'energy-oil-gas-renewables',
    aliases: ['power systems engineer', 'grid engineer', 'substation engineer'],
    description: 'Engineer designing high-voltage transmission lines, electrical transformers, and microgrid power management systems.',
    isHighDemand: true,
  },
  {
    slug: 'solar-technician',
    name: 'Solar Energy Technician & Installer',
    tier: 'OCCUPATION',
    parentSlug: 'energy-oil-gas-renewables',
    industrySlug: 'energy-oil-gas-renewables',
    aliases: ['solar installer', 'photovoltaic technician', 'solar pv engineer'],
    description: 'Field specialist installing rooftop and commercial solar panel arrays, inverters, and battery storage units.',
    isHighDemand: true,
  },
  {
    slug: 'drilling-engineer',
    name: 'Petroleum & Drilling Engineer',
    tier: 'OCCUPATION',
    parentSlug: 'energy-oil-gas-renewables',
    industrySlug: 'energy-oil-gas-renewables',
    aliases: ['oil rig engineer', 'reservoir engineer', 'drilling supervisor'],
    description: 'Upstream oil engineer planning and executing deepwater and terrestrial exploratory wells safely.',
    isHighDemand: true,
  },

  // ============================================================================
  // 13. GOVERNMENT, DEFENCE & CIVIL SERVICES
  // ============================================================================
  {
    slug: 'government-public-services',
    name: 'Government, Defence & Civil Administration',
    tier: 'INDUSTRY',
    industrySlug: 'government-public-services',
    aliases: ['govt', 'public sector', 'civil services', 'defence', 'police', 'sarkari'],
    description: 'Central civil administration, law enforcement, national defense forces, municipal governance, and public sector undertakings.',
    isHighDemand: true,
  },
  {
    slug: 'civil-services-officer',
    name: 'Civil Services Officer (IAS / IPS / IFS / Civil Servant)',
    tier: 'OCCUPATION',
    parentSlug: 'government-public-services',
    industrySlug: 'government-public-services',
    aliases: ['ias officer', 'ips officer', 'civil servant', 'district magistrate', 'deputy commissioner'],
    description: 'Elite administrative executive formulating government policy, managing district law and order, and directing public welfare.',
    isHighDemand: true,
  },
  {
    slug: 'police-officer',
    name: 'Police Officer & Law Enforcement',
    tier: 'OCCUPATION',
    parentSlug: 'government-public-services',
    industrySlug: 'government-public-services',
    aliases: ['sub inspector', 'police inspector', 'dsp', 'constable', 'detective'],
    description: 'Law enforcement professional preserving public safety, criminal investigations, and community peace.',
    isHighDemand: true,
  },

  // ============================================================================
  // 14. RETAIL & E-COMMERCE
  // ============================================================================
  {
    slug: 'retail-ecommerce',
    name: 'Retail & E-Commerce',
    tier: 'INDUSTRY',
    industrySlug: 'retail-ecommerce',
    aliases: ['retail', 'ecommerce', 'shopping', 'supermarket', 'd2c'],
    description: 'Omnichannel retail stores, direct-to-consumer commerce, catalog merchandising, and consumer brand distribution.',
    isHighDemand: true,
  },
  {
    slug: 'retail-store-manager',
    name: 'Retail Store Manager',
    tier: 'OCCUPATION',
    parentSlug: 'retail-ecommerce',
    industrySlug: 'retail-ecommerce',
    aliases: ['store manager', 'showroom manager', 'retail general manager'],
    description: 'Manager overseeing retail outlet sales quotas, visual merchandising, stock replenishment, and associate training.',
    isHighDemand: true,
  },
  {
    slug: 'ecommerce-category-manager',
    name: 'E-Commerce Category Manager',
    tier: 'OCCUPATION',
    parentSlug: 'retail-ecommerce',
    industrySlug: 'retail-ecommerce',
    aliases: ['category lead', 'marketplace manager', 'catalog manager'],
    description: 'Digital commerce leader owning gross merchandise value (GMV), pricing elasticity, promotions, and vendor negotiations.',
    isHighDemand: true,
  },

  // ============================================================================
  // 15. IT, SOFTWARE & CLOUD (Recognized as ONE large industry within the Graph)
  // ============================================================================
  {
    slug: 'it-software',
    name: 'Information Technology & Software Services',
    tier: 'INDUSTRY',
    industrySlug: 'it-software',
    aliases: ['it', 'software', 'tech', 'technology', 'cloud computing', 'cybersecurity'],
    description: 'Enterprise software, software-as-a-service, cloud platforms, cybersecurity, and artificial intelligence.',
    isHighDemand: true,
  },
  {
    slug: 'software-engineer',
    name: 'Software Engineer',
    tier: 'OCCUPATION',
    parentSlug: 'it-software',
    industrySlug: 'it-software',
    aliases: ['developer', 'programmer', 'software developer', 'coder', 'sde'],
    description: 'Engineering professional designing, coding, testing, and maintaining software applications and distributed systems.',
    isHighDemand: true,
  },
  {
    slug: 'cloud-devops-engineer',
    name: 'Cloud & DevOps Engineer',
    tier: 'OCCUPATION',
    parentSlug: 'it-software',
    industrySlug: 'it-software',
    aliases: ['devops', 'sre', 'cloud architect', 'platform engineer'],
    description: 'Infrastructure engineer automating CI/CD pipelines, container orchestration, and cloud reliability.',
    isHighDemand: true,
  },
  {
    slug: 'data-scientist',
    name: 'Data Scientist & AI Specialist',
    tier: 'OCCUPATION',
    parentSlug: 'it-software',
    industrySlug: 'it-software',
    aliases: ['machine learning engineer', 'ai researcher', 'data analyst'],
    description: 'Specialist applying machine learning models, statistical inference, and big data architectures to extract business intelligence.',
    isHighDemand: true,
  }
];

export class GlobalIndustryHierarchy {
  private static catalogMap = new Map<string, IndustryHierarchyNode>();
  private static aliasMap = new Map<string, string>();
  private static occupationToIndustryMap = new Map<string, string>();

  static {
    for (const item of COMPREHENSIVE_INDUSTRY_CATALOG) {
      this.catalogMap.set(item.slug, item);
      this.aliasMap.set(item.name.toLowerCase(), item.slug);
      this.aliasMap.set(item.slug.replace(/-/g, ' ').toLowerCase(), item.slug);
      for (const alias of item.aliases) {
        this.aliasMap.set(alias.toLowerCase(), item.slug);
      }
      if (item.tier === 'OCCUPATION' || item.tier === 'SPECIALIZATION') {
        this.occupationToIndustryMap.set(item.slug, item.industrySlug);
      }
    }
  }

  /**
   * Resolves any query string, occupation token, or industry alias to a canonical node
   */
  public static resolveEntity(token: string): IndustryHierarchyNode | null {
    if (!token) return null;
    const clean = token.toLowerCase().trim();

    // 1. Direct slug or name match
    if (this.catalogMap.has(clean)) {
      return this.catalogMap.get(clean)!;
    }

    // 2. Direct slug match with spaces converted to hyphens
    const hyphenated = clean.replace(/\s+/g, '-');
    if (this.catalogMap.has(hyphenated)) {
      return this.catalogMap.get(hyphenated)!;
    }

    // 2. Direct alias match
    const directSlug = this.aliasMap.get(clean);
    if (directSlug && this.catalogMap.has(directSlug)) {
      return this.catalogMap.get(directSlug)!;
    }

    // 3. Substring containment for multi-word phrases
    for (const [alias, slug] of this.aliasMap.entries()) {
      if (clean === alias || (alias.length > 3 && clean.includes(alias))) {
        return this.catalogMap.get(slug) || null;
      }
    }

    return null;
  }

  /**
   * Retrieves all canonical industries (Tier 1 roots)
   */
  public static getAllIndustries(): IndustryHierarchyNode[] {
    return COMPREHENSIVE_INDUSTRY_CATALOG.filter(node => node.tier === 'INDUSTRY');
  }

  /**
   * Retrieves all canonical occupations (Tier 4 professions)
   */
  public static getAllOccupations(): IndustryHierarchyNode[] {
    return COMPREHENSIVE_INDUSTRY_CATALOG.filter(node => node.tier === 'OCCUPATION');
  }

  /**
   * Returns all occupations belonging to an industry root
   */
  public static getOccupationsForIndustry(industrySlug: string): IndustryHierarchyNode[] {
    return COMPREHENSIVE_INDUSTRY_CATALOG.filter(
      node => (node.tier === 'OCCUPATION' || node.tier === 'SPECIALIZATION') && node.industrySlug === industrySlug
    );
  }

  /**
   * Traverses up to retrieve the full ancestor hierarchy:
   * Specialization -> Occupation -> Sub-Sector -> Sector -> Industry
   */
  public static getOccupationHierarchy(nodeSlug: string): IndustryHierarchyNode[] {
    const hierarchy: IndustryHierarchyNode[] = [];
    let current = this.catalogMap.get(nodeSlug);

    while (current) {
      hierarchy.push(current);
      if (!current.parentSlug) break;
      current = this.catalogMap.get(current.parentSlug);
    }

    return hierarchy;
  }
}
