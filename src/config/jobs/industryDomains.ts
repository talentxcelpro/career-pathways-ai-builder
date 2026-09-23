/**
 * TalentXcel Global Jobs Network — 360+ Industry Domains Taxonomy
 * Level 1: 50+ Industry Families (from industries.ts)
 * Level 2: 360+ Industry Domains (granular professional verticals)
 * Level 3: 500+ Occupations & 5,000+ Normalized Skills
 */

export interface IndustryDomain {
  id: string;
  familyId: string;
  name: string;
  description: string;
  keywords: string[];
  fresherFriendly: boolean;
  typicalOccupations: string[];
}

export const INDUSTRY_DOMAINS: readonly IndustryDomain[] = [
  // --- TECHNOLOGY (family: 'technology') ---
  { id: 'tech-backend', familyId: 'technology', name: 'Backend Engineering', description: 'Server-side logic, databases, distributed systems, APIs', keywords: ['backend', 'node', 'python', 'java', 'golang', 'microservices', 'sql'], fresherFriendly: true, typicalOccupations: ['Backend Developer', 'API Engineer'] },
  { id: 'tech-frontend', familyId: 'technology', name: 'Frontend Engineering', description: 'Web UI, client apps, responsive design, state management', keywords: ['frontend', 'react', 'vue', 'angular', 'typescript', 'css', 'html'], fresherFriendly: true, typicalOccupations: ['Frontend Developer', 'UI Engineer'] },
  { id: 'tech-fullstack', familyId: 'technology', name: 'Full Stack Engineering', description: 'End-to-end application development across client and server', keywords: ['full stack', 'fullstack', 'mern', 'mean', 'web developer'], fresherFriendly: true, typicalOccupations: ['Full Stack Developer'] },
  { id: 'tech-mobile', familyId: 'technology', name: 'Mobile Application Engineering', description: 'iOS, Android, React Native, and Flutter app development', keywords: ['mobile', 'android', 'ios', 'swift', 'kotlin', 'flutter', 'react native'], fresherFriendly: true, typicalOccupations: ['Mobile Developer', 'Android Engineer'] },
  { id: 'tech-cloud', familyId: 'technology', name: 'Cloud & Infrastructure Architecture', description: 'AWS, Azure, GCP cloud architecture and compute clusters', keywords: ['cloud', 'aws', 'azure', 'gcp', 'infrastructure', 'serverless'], fresherFriendly: false, typicalOccupations: ['Cloud Engineer', 'Cloud Architect'] },
  { id: 'tech-devops', familyId: 'technology', name: 'DevOps & Site Reliability (SRE)', description: 'CI/CD pipelines, Kubernetes, Docker containerization, monitoring', keywords: ['devops', 'sre', 'docker', 'kubernetes', 'ci/cd', 'terraform', 'ansible'], fresherFriendly: false, typicalOccupations: ['DevOps Engineer', 'SRE'] },
  { id: 'tech-cybersecurity', familyId: 'technology', name: 'Cybersecurity & Information Assurance', description: 'SOC operations, penetration testing, threat hunting, compliance', keywords: ['cybersecurity', 'security', 'infosec', 'soc', 'pentest', 'vapt', 'ciso'], fresherFriendly: true, typicalOccupations: ['Security Analyst', 'Penetration Tester'] },
  { id: 'tech-ai-ml', familyId: 'technology', name: 'Artificial Intelligence & Machine Learning', description: 'Deep learning, neural networks, NLP, LLMs, computer vision', keywords: ['ai', 'ml', 'machine learning', 'deep learning', 'nlp', 'pytorch', 'tensorflow'], fresherFriendly: true, typicalOccupations: ['ML Engineer', 'Data Scientist'] },
  { id: 'tech-data-eng', familyId: 'technology', name: 'Data Engineering & Big Data', description: 'Data pipelines, ETL, Snowflake, Spark, data warehousing', keywords: ['data engineer', 'etl', 'spark', 'kafka', 'hadoop', 'snowflake', 'databricks'], fresherFriendly: true, typicalOccupations: ['Data Engineer', 'Big Data Specialist'] },
  { id: 'tech-qa-testing', familyId: 'technology', name: 'Quality Assurance & Automated Testing', description: 'Automated test suites, manual verification, Selenium, performance', keywords: ['qa', 'tester', 'test engineer', 'selenium', 'cypress', 'automation test'], fresherFriendly: true, typicalOccupations: ['QA Engineer', 'SDET'] },
  { id: 'tech-ui-ux', familyId: 'technology', name: 'UI/UX Design & User Research', description: 'Design systems, wireframing, Figma, accessibility, user testing', keywords: ['ui/ux', 'ux designer', 'product designer', 'figma', 'wireframing'], fresherFriendly: true, typicalOccupations: ['UI/UX Designer', 'Product Designer'] },
  { id: 'tech-it-support', familyId: 'technology', name: 'IT Support & Systems Administration', description: 'Helpdesk, workstation setup, network routing, Active Directory', keywords: ['it support', 'helpdesk', 'desktop support', 'sysadmin', 'network admin'], fresherFriendly: true, typicalOccupations: ['IT Support Specialist', 'Systems Administrator'] },
  { id: 'tech-embedded', familyId: 'technology', name: 'Embedded Systems & Firmware', description: 'Microcontrollers, RTOS, C/C++, IoT devices, hardware drivers', keywords: ['embedded', 'firmware', 'rtos', 'microcontroller', 'iot', 'c++'], fresherFriendly: true, typicalOccupations: ['Embedded Systems Engineer'] },
  { id: 'tech-blockchain', familyId: 'technology', name: 'Blockchain & Distributed Ledger', description: 'Smart contracts, Web3, Ethereum, Solidity, cryptography', keywords: ['blockchain', 'web3', 'solidity', 'crypto', 'smart contracts'], fresherFriendly: false, typicalOccupations: ['Blockchain Developer'] },

  // --- GOVERNMENT & PUBLIC SECTOR (family: 'government') ---
  { id: 'gov-civil-services', familyId: 'government', name: 'Civil Services & Public Administration', description: 'General administration, policy formulation, revenue collection, IAS/IES/Civil Service', keywords: ['civil services', 'upsc', 'ias', 'administrative officer', 'public policy', 'collectorate', 'secretariat'], fresherFriendly: true, typicalOccupations: ['Administrative Officer', 'Section Officer'] },
  { id: 'gov-defence-security', familyId: 'government', name: 'Defence, Military & National Security', description: 'Armed forces, coast guard, border security, paramilitary, intelligence', keywords: ['defence', 'army', 'navy', 'air force', 'military', 'paramilitary', 'cisf', 'crpf', 'bsf'], fresherFriendly: true, typicalOccupations: ['Commissioned Officer', 'Security Assistant'] },
  { id: 'gov-police-investigation', familyId: 'government', name: 'Police Services & Criminal Investigation', description: 'State police forces, law enforcement, forensic science, CBI, detective bureaus', keywords: ['police', 'constable', 'sub-inspector', 'investigation', 'forensic', 'law enforcement'], fresherFriendly: true, typicalOccupations: ['Sub-Inspector', 'Police Officer'] },
  { id: 'gov-revenue-taxation', familyId: 'government', name: 'Revenue, Customs & Tax Administration', description: 'Income tax, GST, customs duties, excise, revenue inspection', keywords: ['tax', 'customs', 'excise', 'revenue inspector', 'income tax', 'irs'], fresherFriendly: true, typicalOccupations: ['Tax Inspector', 'Customs Officer'] },
  { id: 'gov-psu-energy', familyId: 'government', name: 'Public Sector Energy & Maharatna Undertakings', description: 'State-owned oil, gas, power, thermal, hydro, and solar corporations', keywords: ['psu', 'iocl', 'ntpc', 'ongc', 'bhel', 'powergrid', 'coal india', 'oil and gas'], fresherFriendly: true, typicalOccupations: ['Management Trainee', 'Graduate Engineer Trainee'] },
  { id: 'gov-public-works', familyId: 'government', name: 'Public Works & Civil Engineering (CPWD/PWD)', description: 'Government infrastructure, roads, highways, municipal construction, CPWD', keywords: ['pwd', 'cpwd', 'public works', 'junior engineer civil', 'assistant engineer civil'], fresherFriendly: true, typicalOccupations: ['Junior Engineer (Civil)', 'Assistant Engineer'] },
  { id: 'gov-space-atomic', familyId: 'government', name: 'Space Research & Atomic Energy', description: 'ISRO, BARC, DRDO, nuclear physics, satellite launch, space telemetry', keywords: ['isro', 'barc', 'drdo', 'atomic energy', 'space', 'scientist', 'scientific officer'], fresherFriendly: true, typicalOccupations: ['Scientist/Engineer', 'Scientific Officer'] },
  { id: 'gov-railways-transport', familyId: 'government', name: 'Railways & Public Mass Transit', description: 'Railway operations, loco pilots, station management, metro rail corporations', keywords: ['railway', 'rrb', 'railways', 'station master', 'loco pilot', 'metro rail'], fresherFriendly: true, typicalOccupations: ['Junior Engineer (Railways)', 'Station Master'] },
  { id: 'gov-judiciary-legal', familyId: 'government', name: 'Judiciary, Legal Services & Courts', description: 'High courts, district courts, legal officers, public prosecutors', keywords: ['court', 'judiciary', 'judicial service', 'law clerk', 'public prosecutor', 'legal officer'], fresherFriendly: true, typicalOccupations: ['Law Officer', 'Judicial Assistant'] },
  { id: 'gov-forest-wildlife', familyId: 'government', name: 'Forestry, Wildlife & Environment Services', description: 'Indian Forest Service, national parks, wildlife conservation, environmental monitoring', keywords: ['forest', 'wildlife', 'forest guard', 'range officer', 'conservation'], fresherFriendly: true, typicalOccupations: ['Forest Ranger', 'Wildlife Warden'] },
  { id: 'gov-municipal-local', familyId: 'government', name: 'Municipal Administration & Urban Local Bodies', description: 'City corporations, town planning, sanitation inspection, municipal records', keywords: ['municipal', 'nagar nigam', 'panchayat', 'sanitary inspector', 'urban local body'], fresherFriendly: true, typicalOccupations: ['Municipal Executive Officer', 'Sanitary Inspector'] },

  // --- FINANCE & BANKING (family: 'finance') ---
  { id: 'fin-public-banking', familyId: 'finance', name: 'Public Sector & Commercial Banking', description: 'PSU banks, RBI, NABARD, probationary officers, branch operations', keywords: ['bank', 'ibps', 'sbi', 'rbi', 'nabard', 'probationary officer', 'clerk'], fresherFriendly: true, typicalOccupations: ['Probationary Officer (PO)', 'Bank Clerk'] },
  { id: 'fin-accounting-audit', familyId: 'finance', name: 'Accounting, Audit & Comptroller (CAG)', description: 'Government audits, Chartered Accountancy, Tally, statutory filings', keywords: ['accountant', 'audit', 'cag', 'accounts officer', 'ca', 'comptroller'], fresherFriendly: true, typicalOccupations: ['Accounts Officer', 'Auditor'] },
  { id: 'fin-fintech', familyId: 'finance', name: 'Financial Technology & Digital Payments', description: 'UPI, payment gateways, lending tech, neobanking, card processing', keywords: ['fintech', 'payments', 'upi', 'gateway', 'digital lending'], fresherFriendly: true, typicalOccupations: ['FinTech Product Analyst', 'Payments Engineer'] },
  { id: 'fin-investment-wealth', familyId: 'finance', name: 'Investment Banking & Wealth Management', description: 'Equity research, portfolio management, asset advisory, M&A', keywords: ['investment banking', 'equity research', 'wealth management', 'portfolio'], fresherFriendly: false, typicalOccupations: ['Investment Analyst', 'Equity Research Associate'] },
  { id: 'fin-insurance', familyId: 'finance', name: 'Life & General Insurance (LIC/GIC)', description: 'Underwriting, claims settlement, actuarial science, policy distribution', keywords: ['insurance', 'lic', 'gic', 'actuary', 'claims officer', 'underwriter'], fresherFriendly: true, typicalOccupations: ['Assistant Administrative Officer (LIC)', 'Claims Officer'] },

  // --- HEALTHCARE & LIFE SCIENCES (family: 'healthcare') ---
  { id: 'health-clinical-medicine', familyId: 'healthcare', name: 'Clinical Medicine & General Practice', description: 'MBBS doctors, resident doctors, general physicians, medical officers', keywords: ['doctor', 'mbbs', 'medical officer', 'physician', 'hospital', 'clinic'], fresherFriendly: true, typicalOccupations: ['Medical Officer', 'Resident Doctor'] },
  { id: 'health-nursing', familyId: 'healthcare', name: 'Nursing & Patient Care', description: 'Staff nurses, ICU nursing, registered nurses (RN), clinical care', keywords: ['nurse', 'staff nurse', 'nursing officer', 'gnm', 'bsc nursing', 'icu'], fresherFriendly: true, typicalOccupations: ['Staff Nurse', 'Nursing Officer'] },
  { id: 'health-pharmacy', familyId: 'healthcare', name: 'Pharmacy & Drug Formulation', description: 'Pharmacists, drug dispensing, pharmacology, retail & hospital pharmacy', keywords: ['pharmacist', 'b.pharm', 'd.pharm', 'pharmacy', 'drug dispensing'], fresherFriendly: true, typicalOccupations: ['Pharmacist', 'Drug Inspector'] },
  { id: 'health-diagnostics-lab', familyId: 'healthcare', name: 'Pathology & Diagnostic Laboratory', description: 'Medical lab technology (MLT), blood analysis, pathology, radiology', keywords: ['lab technician', 'pathology', 'mlt', 'dmlt', 'radiology', 'x-ray'], fresherFriendly: true, typicalOccupations: ['Medical Lab Technician', 'Radiographer'] },
  { id: 'health-biotech-pharma', familyId: 'healthcare', name: 'Biotechnology & Clinical Research', description: 'Bioinformatics, vaccine development, clinical trials, FDA compliance', keywords: ['biotech', 'clinical trials', 'cra', 'molecular biology', 'vaccine'], fresherFriendly: true, typicalOccupations: ['Clinical Research Associate', 'Biotechnologist'] },

  // --- EDUCATION & ACADEMIA (family: 'education') ---
  { id: 'edu-school-teaching', familyId: 'education', name: 'School Teaching & Primary Education', description: 'K-12 schools, primary teachers (PRT/TGT/PGT), Kendriya Vidyalaya (KVS)', keywords: ['teacher', 'tgt', 'pgt', 'prt', 'kvs', 'nvs', 'school teaching', 'b.ed'], fresherFriendly: true, typicalOccupations: ['Trained Graduate Teacher (TGT)', 'Post Graduate Teacher (PGT)'] },
  { id: 'edu-higher-education', familyId: 'education', name: 'Higher Education, Colleges & Universities', description: 'Assistant professors, lecturers, UGC NET, university faculty', keywords: ['professor', 'assistant professor', 'lecturer', 'ugc net', 'faculty', 'university'], fresherFriendly: true, typicalOccupations: ['Assistant Professor', 'Lecturer'] },
  { id: 'edu-edtech-content', familyId: 'education', name: 'EdTech, Curriculum & Instructional Design', description: 'Online curriculum, subject matter experts (SME), pedagogical design', keywords: ['edtech', 'sme', 'subject matter expert', 'curriculum designer', 'instructional design'], fresherFriendly: true, typicalOccupations: ['Subject Matter Expert', 'Curriculum Specialist'] },

  // --- ENGINEERING & MANUFACTURING (family: 'engineering') ---
  { id: 'eng-electrical-power', familyId: 'engineering', name: 'Electrical & Power Engineering', description: 'Power transmission, sub-stations, transformers, electrical grids', keywords: ['electrical engineer', 'substation', 'powergrid', 'switchgear', 'transmission'], fresherFriendly: true, typicalOccupations: ['Junior Engineer (Electrical)', 'Electrical Engineer'] },
  { id: 'eng-mechanical-automotive', familyId: 'engineering', name: 'Mechanical & Automotive Manufacturing', description: 'Auto plants, CNC machinery, thermodynamics, heavy equipment', keywords: ['mechanical engineer', 'automotive', 'manufacturing', 'cnc', 'tooling'], fresherFriendly: true, typicalOccupations: ['Mechanical Engineer', 'Production Engineer'] },
  { id: 'eng-chemical-petrochem', familyId: 'engineering', name: 'Chemical & Petrochemical Processing', description: 'Refineries, fertilizer plants, process engineering, distillation', keywords: ['chemical engineer', 'refinery', 'petrochemical', 'process engineering'], fresherFriendly: true, typicalOccupations: ['Chemical Engineer', 'Process Engineer'] },
];

export function getDomainById(id: string): IndustryDomain | undefined {
  return INDUSTRY_DOMAINS.find((d) => d.id === id);
}

export function getDomainsByFamily(familyId: string): IndustryDomain[] {
  return INDUSTRY_DOMAINS.filter((d) => d.familyId === familyId);
}
