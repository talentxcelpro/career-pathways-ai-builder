/**
 * src/config/jobs/industryTaxonomy.ts
 *
 * TalentXcel Canonical 20-Industry Marketplace Taxonomy
 * Single Source of Truth for:
 * - Search filters & facets across talentxcel.in/jobs and jobs.talentxcel.in
 * - Database classification & backfill
 * - Programmatic SEO industry hubs (/jobs/{industry-slug})
 * - Google JobPosting schema & category attribution
 */

export interface SubindustryDef {
  id: string;
  slug: string;
  name: string;
  jobFamilies: string[];
}

export interface IndustryDefinition {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string;
  subindustries: SubindustryDef[];
  canonicalJobTitles: string[];
  entityKeywords: string[];
  companyIndicators: string[];
}

export const CANONICAL_20_INDUSTRIES: readonly IndustryDefinition[] = [
  {
    id: 'it-software',
    slug: 'information-technology',
    name: 'Information Technology',
    icon: 'Laptop',
    description: 'Software engineering, cloud infrastructure, AI/ML, cybersecurity, systems architecture and IT services.',
    subindustries: [
      { id: 'it-software-eng', slug: 'software-engineering', name: 'Software Engineering', jobFamilies: ['Full Stack Developer', 'Frontend Developer', 'Backend Developer', 'Mobile Developer', 'Systems Engineer'] },
      { id: 'it-cloud-devops', slug: 'cloud-devops', name: 'Cloud & DevOps', jobFamilies: ['DevOps Engineer', 'Cloud Architect', 'Site Reliability Engineer', 'Kubernetes Administrator'] },
      { id: 'it-ai-data', slug: 'ai-data-science', name: 'AI & Data Science', jobFamilies: ['AI Engineer', 'Machine Learning Engineer', 'Data Scientist', 'Data Engineer', 'Data Analyst'] },
      { id: 'it-cybersecurity', slug: 'cybersecurity', name: 'Cybersecurity', jobFamilies: ['Security Engineer', 'SOC Analyst', 'Penetration Tester', 'Information Security Officer'] },
      { id: 'it-qa-testing', slug: 'qa-testing', name: 'QA & Testing', jobFamilies: ['QA Automation Engineer', 'SDET', 'Manual Test Engineer', 'Performance Tester'] },
      { id: 'it-product-design', slug: 'product-ui-ux', name: 'Product & Design', jobFamilies: ['Product Manager', 'Technical Product Manager', 'UI/UX Designer', 'Product Designer'] },
    ],
    canonicalJobTitles: [
      'Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Tech Lead', 'Engineering Manager',
      'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'DevOps Engineer', 'Cloud Architect',
      'Data Scientist', 'Data Engineer', 'Data Analyst', 'AI Engineer', 'Machine Learning Engineer',
      'Security Engineer', 'QA Automation Engineer', 'SDET', 'Product Manager', 'Solutions Architect'
    ],
    entityKeywords: ['software', 'developer', 'engineer', 'devops', 'cloud', 'aws', 'python', 'react', 'java', 'kubernetes', 'golang', 'frontend', 'backend', 'fullstack', 'database', 'cybersecurity', 'ai', 'machine learning', 'qa', 'sdet'],
    companyIndicators: ['google', 'microsoft', 'amazon', 'gitlab', 'databricks', 'rubrik', 'servicenow', 'meta', 'apple', 'infosys', 'tcs', 'wipro', 'hcl', 'cognizant', 'accenture', 'capgemini', 'oracle', 'salesforce', 'cisco', 'ibm']
  },
  {
    id: 'bfsi',
    slug: 'banking-financial-services',
    name: 'Banking & Financial Services',
    icon: 'Building2',
    description: 'Retail & commercial banking, investment management, wealth advisory, fintech and credit operations.',
    subindustries: [
      { id: 'bfsi-retail-banking', slug: 'retail-banking', name: 'Retail Banking', jobFamilies: ['Branch Manager', 'Personal Banker', 'Credit Officer', 'Loan Specialist'] },
      { id: 'bfsi-investment-banking', slug: 'investment-banking', name: 'Investment Banking & Capital Markets', jobFamilies: ['Investment Analyst', 'Equity Research Associate', 'Portfolio Manager', 'M&A Associate'] },
      { id: 'bfsi-wealth-fintech', slug: 'wealth-fintech', name: 'WealthTech & Digital Banking', jobFamilies: ['Fintech Product Manager', 'Payment Operations Specialist', 'Quantitative Trader'] },
      { id: 'bfsi-risk-treasury', slug: 'risk-treasury', name: 'Risk Management & Treasury', jobFamilies: ['Credit Risk Analyst', 'Treasury Officer', 'Market Risk Specialist'] },
    ],
    canonicalJobTitles: [
      'Financial Analyst', 'Senior Financial Analyst', 'Investment Banker', 'Credit Analyst', 'Branch Manager',
      'Relationship Manager', 'Treasury Analyst', 'Equity Research Associate', 'Portfolio Manager', 'Risk Analyst',
      'Loan Officer', 'Probationary Officer', 'Wealth Manager', 'Quant Analyst'
    ],
    entityKeywords: ['banking', 'investment', 'wealth', 'credit', 'equity', 'portfolio', 'treasury', 'financial analyst', 'risk management', 'capital markets', 'm&a', 'underwriting', 'loan', 'mortgage', 'fintech'],
    companyIndicators: ['jpmorgan', 'goldman sachs', 'morgan stanley', 'hdfc', 'icici', 'axis bank', 'sbi', 'state bank of india', 'kotak', 'citigroup', 'hsbc', 'standard chartered', 'barclays', 'deutsche bank', 'rbi', 'nabard']
  },
  {
    id: 'bpo-call-centres',
    slug: 'bpo-call-centres',
    name: 'BPO & Call Centres',
    icon: 'Headphones',
    description: 'Voice & non-voice customer support, business process outsourcing, technical helpdesk and tele-sales.',
    subindustries: [
      { id: 'bpo-customer-support', slug: 'customer-support', name: 'Customer Support (Voice/Chat)', jobFamilies: ['Customer Service Representative', 'Support Associate', 'Voice Process Specialist'] },
      { id: 'bpo-tech-support', slug: 'tech-support', name: 'Technical Support Helpdesk', jobFamilies: ['Technical Support Engineer', 'Helpdesk Associate', 'IT Service Desk Specialist'] },
      { id: 'bpo-operations', slug: 'bpo-operations', name: 'Operations & Quality Analysis', jobFamilies: ['Team Leader (BPO)', 'Quality Analyst', 'Operations Manager', 'WFM Planner'] },
    ],
    canonicalJobTitles: [
      'Customer Support Associate', 'Customer Support Executive', 'Technical Support Representative',
      'Voice Process Executive', 'Non-Voice Process Associate', 'BPO Team Leader', 'Customer Success Associate',
      'Call Center Representative', 'Telecaller', 'Helpdesk Associate'
    ],
    entityKeywords: ['customer support', 'call center', 'call centre', 'bpo', 'kpo', 'voice process', 'non-voice', 'inbound', 'outbound', 'telecaller', 'customer service', 'chat support', 'helpdesk', 'teleperformance'],
    companyIndicators: ['teleperformance', 'concentrix', 'genpact', 'wipro bpo', 'infosys bpm', 'wns', 'firstsource', 'exl service', 'taskus', 'foundever', '24/7.ai', 'tech mahindra bpo']
  },
  {
    id: 'sales-biz-dev',
    slug: 'sales-business-development',
    name: 'Sales & Business Development',
    icon: 'TrendingUp',
    description: 'Enterprise B2B sales, account management, retail sales, business development and revenue generation.',
    subindustries: [
      { id: 'sales-enterprise', slug: 'enterprise-sales', name: 'Enterprise B2B Sales', jobFamilies: ['Account Executive', 'Enterprise Sales Director', 'Strategic Account Manager'] },
      { id: 'sales-inside', slug: 'inside-sales-bdr', name: 'Inside Sales & SDR/BDR', jobFamilies: ['Sales Development Representative', 'Business Development Associate', 'Lead Generation Specialist'] },
      { id: 'sales-field-retail', slug: 'field-retail-sales', name: 'Field & Channel Sales', jobFamilies: ['Field Sales Executive', 'Area Sales Manager', 'Channel Partner Manager', 'Territory Manager'] },
    ],
    canonicalJobTitles: [
      'Account Executive', 'Senior Account Executive', 'Business Development Representative',
      'Sales Development Representative', 'Area Sales Manager', 'Regional Sales Manager', 'Sales Director',
      'Business Development Manager', 'Field Sales Executive', 'Inside Sales Specialist', 'Key Account Manager'
    ],
    entityKeywords: ['sales', 'business development', 'bdr', 'sdr', 'account executive', 'revenue', 'quota', 'cold calling', 'lead generation', 'pipeline', 'key accounts', 'field sales', 'channel sales'],
    companyIndicators: ['salesforce', 'hubspot', 'zoominfo', 'oracle sales', 'byju', 'unacademy', 'zomato sales', 'swiggy sales', 'indiamart', 'justdial', 'naukri sales']
  },
  {
    id: 'marketing-advertising',
    slug: 'marketing-advertising',
    name: 'Marketing & Advertising',
    icon: 'Megaphone',
    description: 'Performance marketing, brand management, digital marketing, SEO, content strategy and public relations.',
    subindustries: [
      { id: 'mktg-digital-performance', slug: 'digital-performance-marketing', name: 'Digital & Performance Marketing', jobFamilies: ['Performance Marketer', 'PPC Specialist', 'Growth Hacker', 'Media Buyer'] },
      { id: 'mktg-content-brand', slug: 'content-brand-strategy', name: 'Content Strategy & Brand Management', jobFamilies: ['Brand Manager', 'Content Strategist', 'Copywriter', 'Creative Director'] },
      { id: 'mktg-seo-growth', slug: 'seo-organic-growth', name: 'SEO & Organic Growth', jobFamilies: ['SEO Specialist', 'Organic Growth Manager', 'Technical SEO Lead'] },
      { id: 'mktg-social-pr', slug: 'social-media-pr', name: 'Social Media & Communications', jobFamilies: ['Social Media Manager', 'Community Manager', 'Public Relations Specialist'] },
    ],
    canonicalJobTitles: [
      'Marketing Manager', 'Growth Marketer', 'Performance Marketing Specialist', 'Digital Marketing Manager',
      'SEO Specialist', 'Content Strategist', 'Copywriter', 'Brand Manager', 'Social Media Manager',
      'PPC Lead', 'Communications Manager', 'Creative Strategist'
    ],
    entityKeywords: ['marketing', 'advertising', 'digital marketing', 'performance marketing', 'seo', 'sem', 'ppc', 'growth', 'brand', 'content writing', 'copywriting', 'social media', 'campaigns', 'pr'],
    companyIndicators: ['ogilvy', 'dentsu', 'wpp', 'publicis', 'omnicom', 'groupm', 'schbang', 'interactive aza', 'watconsult']
  },
  {
    id: 'hr-recruitment',
    slug: 'human-resources-recruitment',
    name: 'Human Resources & Recruitment',
    icon: 'Users',
    description: 'Talent acquisition, HR business partnering, compensation & benefits, employee engagement and people ops.',
    subindustries: [
      { id: 'hr-talent-acquisition', slug: 'talent-acquisition', name: 'Talent Acquisition & Sourcing', jobFamilies: ['Technical Recruiter', 'Talent Acquisition Specialist', 'Executive Recruiter', 'Sourcing Specialist'] },
      { id: 'hr-people-ops', slug: 'people-operations-hrbp', name: 'People Operations & HRBP', jobFamilies: ['HR Business Partner', 'People Operations Manager', 'HR Generalist'] },
      { id: 'hr-comp-benefits', slug: 'compensation-payroll', name: 'Compensation, Benefits & Payroll', jobFamilies: ['Payroll Specialist', 'Comp & Benefits Analyst', 'HR Analytics Lead'] },
    ],
    canonicalJobTitles: [
      'HR Manager', 'Talent Acquisition Specialist', 'Technical Recruiter', 'HR Generalist',
      'HR Business Partner', 'Recruitment Specialist', 'People Operations Lead', 'Compensation Analyst',
      'Talent Sourcing Specialist', 'Campus Recruiter', 'HR Coordinator'
    ],
    entityKeywords: ['human resources', 'recruitment', 'recruiter', 'talent acquisition', 'hrbp', 'people operations', 'payroll', 'onboarding', 'employee engagement', 'talent sourcing', 'hiring'],
    companyIndicators: ['randstad', 'adecco', 'manpowergroup', 'michael page', 'allegis', 'korn ferry', 'kelly services', 'abc consultants', 'quess corp', 'teamlease']
  },
  {
    id: 'healthcare-hospitals',
    slug: 'healthcare-hospitals',
    name: 'Healthcare & Hospitals',
    icon: 'Heart',
    description: 'Clinical medical practice, hospital operations, nursing, diagnostic laboratories and patient care services.',
    subindustries: [
      { id: 'health-clinical', slug: 'clinical-medicine', name: 'Clinical Medicine & Doctors', jobFamilies: ['General Physician', 'Medical Officer', 'Resident Doctor', 'Surgeon', 'Consultant Specialist'] },
      { id: 'health-nursing-care', slug: 'nursing-patient-care', name: 'Nursing & Critical Care', jobFamilies: ['Staff Nurse', 'Nursing Officer', 'ICU Nurse', 'Clinical Nurse Specialist'] },
      { id: 'health-admin-ops', slug: 'hospital-administration', name: 'Hospital Administration & Operations', jobFamilies: ['Hospital Administrator', 'Medical Superintendent', 'Healthcare Operations Manager'] },
      { id: 'health-diagnostics', slug: 'pathology-diagnostics', name: 'Diagnostics & Medical Lab', jobFamilies: ['Lab Technician', 'Radiographer', 'Pathologist', 'Dialysis Technician'] },
    ],
    canonicalJobTitles: [
      'Medical Officer', 'Staff Nurse', 'Resident Doctor', 'General Physician', 'Hospital Administrator',
      'Medical Lab Technician', 'Radiographer', 'Clinical Coordinator', 'Healthcare Operations Manager',
      'Physiotherapist', 'Dietitian', 'Pharmacist (Hospital)'
    ],
    entityKeywords: ['healthcare', 'hospital', 'doctor', 'mbbs', 'nurse', 'nursing', 'medical officer', 'clinical', 'pathology', 'radiology', 'patient care', 'icu', 'surgeon', 'physician', 'hospital administration'],
    companyIndicators: ['apollo hospitals', 'fortis healthcare', 'max healthcare', 'manipal hospitals', 'narayana health', 'medanta', 'aiims', 'dr lal pathlabs', 'metropolis healthcare']
  },
  {
    id: 'pharma-biotech',
    slug: 'pharmaceuticals-biotechnology',
    name: 'Pharmaceuticals & Biotechnology',
    icon: 'FlaskConical',
    description: 'Drug formulation, clinical research, pharmacology, biotechnology, quality control and regulatory affairs.',
    subindustries: [
      { id: 'pharma-rd-formulation', slug: 'rd-formulation', name: 'R&D & Formulation', jobFamilies: ['Research Scientist', 'Formulation Chemist', 'Analytical Chemist', 'Biotechnologist'] },
      { id: 'pharma-qa-qc', slug: 'quality-control-regulatory', name: 'Quality Control & Regulatory Affairs', jobFamilies: ['QC Analyst', 'QA Officer (Pharma)', 'Regulatory Affairs Executive'] },
      { id: 'pharma-clinical-trials', slug: 'clinical-trials', name: 'Clinical Research & Data Management', jobFamilies: ['Clinical Research Associate', 'Clinical Data Manager', 'Pharmacovigilance Officer'] },
      { id: 'pharma-manufacturing', slug: 'pharma-production', name: 'Pharma Production & Plant Operations', jobFamilies: ['Production Chemist', 'Machine Operator', 'Plant Supervisor'] },
    ],
    canonicalJobTitles: [
      'Research Scientist', 'Quality Control Analyst', 'Formulation Scientist', 'Clinical Research Associate',
      'Pharmacovigilance Officer', 'Regulatory Affairs Specialist', 'Analytical Chemist', 'Medical Representative',
      'Pharma Production Executive', 'Drug Safety Associate'
    ],
    entityKeywords: ['pharmaceutical', 'biotechnology', 'pharma', 'drug', 'formulation', 'clinical research', 'pharmacovigilance', 'regulatory affairs', 'qc', 'qa', 'chemist', 'biotech', 'fda', 'gmp'],
    companyIndicators: ['sun pharma', 'dr reddy', 'cipla', 'lupin', 'aurobindo pharma', 'zydus', 'torrent pharma', 'biocon', 'mankind pharma', 'glenmark', 'pfizer', 'novartis', 'roche']
  },
  {
    id: 'manufacturing-industrial',
    slug: 'manufacturing-industrial',
    name: 'Manufacturing & Industrial',
    icon: 'Factory',
    description: 'Heavy machinery, plant operations, industrial engineering, quality assurance, CNC tooling and production.',
    subindustries: [
      { id: 'mfg-production-ops', slug: 'plant-production', name: 'Plant Production & Operations', jobFamilies: ['Production Engineer', 'Plant Manager', 'Shift Supervisor', 'CNC Programmer'] },
      { id: 'mfg-quality-maintenance', slug: 'maintenance-reliability', name: 'Maintenance & Reliability Engineering', jobFamilies: ['Maintenance Engineer', 'Reliability Lead', 'Tooling Specialist'] },
      { id: 'mfg-process-industrial', slug: 'process-industrial-eng', name: 'Process & Industrial Engineering', jobFamilies: ['Industrial Engineer', 'Lean Six Sigma Lead', 'Process Optimization Engineer'] },
    ],
    canonicalJobTitles: [
      'Production Engineer', 'Manufacturing Engineer', 'Plant Manager', 'Quality Assurance Engineer (Industrial)',
      'Maintenance Engineer', 'Industrial Engineer', 'CNC Machinist', 'Shift In-Charge', 'Operations Supervisor',
      'Process Engineer', 'Mechanical Design Engineer'
    ],
    entityKeywords: ['manufacturing', 'industrial', 'production', 'plant', 'machinery', 'cnc', 'tooling', 'fabrication', 'assembly', 'maintenance engineer', 'six sigma', 'lean manufacturing', 'foundry', 'metallurgy'],
    companyIndicators: ['tata steel', 'larsen & toubro', 'l&t', 'jsw steel', 'aditya birla', 'bhel', 'bharat forge', 'godrej', 'vedanta', 'hindalco', 'siemens manufacturing', 'caterpillar']
  },
  {
    id: 'logistics-supply-chain',
    slug: 'logistics-supply-chain',
    name: 'Logistics & Supply Chain',
    icon: 'Truck',
    description: 'Freight forwarding, warehouse management, fleet operations, 3PL logistics, inventory planning and procurement.',
    subindustries: [
      { id: 'log-warehouse-distribution', slug: 'warehouse-distribution', name: 'Warehouse & Fulfillment Operations', jobFamilies: ['Warehouse Manager', 'Fulfillment Supervisor', 'Inventory Controller'] },
      { id: 'log-freight-fleet', slug: 'freight-fleet-management', name: 'Freight, Fleet & Transportation', jobFamilies: ['Fleet Operations Manager', 'Logistics Coordinator', 'Dispatch Officer'] },
      { id: 'log-supply-planning', slug: 'procurement-supply-planning', name: 'Procurement & Supply Chain Planning', jobFamilies: ['Supply Chain Manager', 'Procurement Specialist', 'Demand Planner'] },
    ],
    canonicalJobTitles: [
      'Supply Chain Manager', 'Logistics Coordinator', 'Warehouse Manager', 'Procurement Specialist',
      'Inventory Controller', 'Fleet Manager', 'Operations Executive (Logistics)', 'Freight Forwarding Specialist',
      'Dispatch Supervisor', 'Demand Planner', 'Logistics Associate'
    ],
    entityKeywords: ['logistics', 'supply chain', 'warehouse', 'freight', 'fleet', 'inventory', 'procurement', 'shipping', 'transportation', 'fulfillment', 'dispatch', '3pl', 'customs clearance', 'distribution'],
    companyIndicators: ['delhivery', 'blue dart', 'dhl', 'fedex', 'allcargo', 'maersk', 'tci', 'safexpress', 'shadowfax', 'ecom express', 'shiprocket']
  },
  {
    id: 'retail-ecommerce',
    slug: 'retail-ecommerce',
    name: 'Retail & E-commerce',
    icon: 'ShoppingBag',
    description: 'Omnichannel retail, e-commerce merchandising, catalog operations, category management and store operations.',
    subindustries: [
      { id: 'retail-store-ops', slug: 'store-operations', name: 'Store Operations & Visual Merchandising', jobFamilies: ['Store Manager', 'Retail Sales Associate', 'Visual Merchandiser', 'Cashier'] },
      { id: 'retail-ecom-cat', slug: 'ecommerce-category-management', name: 'E-commerce & Category Management', jobFamilies: ['Category Manager', 'Catalog Specialist', 'E-commerce Operations Specialist'] },
      { id: 'retail-merchandising', slug: 'merchandising-buying', name: 'Merchandising & Buying', jobFamilies: ['Merchandiser', 'Buyer', 'Sourcing Manager (Retail)'] },
    ],
    canonicalJobTitles: [
      'Store Manager', 'Category Manager', 'E-commerce Operations Specialist', 'Retail Sales Associate',
      'Visual Merchandiser', 'Catalog Executive', 'Merchandiser', 'Buyer', 'Assistant Store Manager',
      'Department Manager (Retail)'
    ],
    entityKeywords: ['retail', 'ecommerce', 'e-commerce', 'store manager', 'category manager', 'catalog', 'merchandising', 'merchandise', 'visual merchandising', 'pos', 'store operations', 'fashion retail'],
    companyIndicators: ['reliance retail', 'flipkart', 'amazon india', 'myntra', 'trent', 'zara india', 'shoppers stop', 'lifestyle', 'd-mart', 'avenue supermarts', 'nykaa', 'meesho', 'blinkit', 'zepto']
  },
  {
    id: 'education-edtech',
    slug: 'education-edtech',
    name: 'Education & EdTech',
    icon: 'GraduationCap',
    description: 'School teaching, university academia, online curriculum design, instructional coaching and educational counseling.',
    subindustries: [
      { id: 'edu-k12-teaching', slug: 'k12-school-teaching', name: 'K-12 School Teaching', jobFamilies: ['Primary Teacher (PRT)', 'Trained Graduate Teacher (TGT)', 'Post Graduate Teacher (PGT)', 'School Principal'] },
      { id: 'edu-higher-academia', slug: 'higher-education-professors', name: 'Higher Education & Research', jobFamilies: ['Assistant Professor', 'Associate Professor', 'Lecturer', 'Dean/HOD'] },
      { id: 'edu-edtech-content', slug: 'curriculum-instructional-design', name: 'EdTech Curriculum & SME', jobFamilies: ['Subject Matter Expert (SME)', 'Curriculum Designer', 'Instructional Designer', 'Academic Counselor'] },
    ],
    canonicalJobTitles: [
      'Teacher', 'Assistant Professor', 'Subject Matter Expert', 'Curriculum Designer', 'Academic Counselor',
      'Lecturer', 'Primary Teacher', 'High School Teacher', 'Instructional Designer', 'School Principal',
      'Online Tutor', 'Faculty Member'
    ],
    entityKeywords: ['education', 'edtech', 'teacher', 'professor', 'lecturer', 'curriculum', 'sme', 'subject matter expert', 'school', 'college', 'university', 'academic', 'pedagogy', 'tutoring', 'counselor'],
    companyIndicators: ['byju', 'unacademy', 'physicswallah', 'vedantu', 'upgrad', 'allen career institute', 'aakash', 'dps', 'amity university', 'manipal university', 'bits pilani']
  },
  {
    id: 'hospitality-tourism',
    slug: 'hospitality-tourism',
    name: 'Hospitality & Tourism',
    icon: 'Utensils',
    description: 'Hotels & resorts, restaurant operations, culinary arts, travel management and front office guest relations.',
    subindustries: [
      { id: 'hosp-hotel-resort', slug: 'hotel-resort-management', name: 'Hotel & Resort Operations', jobFamilies: ['Hotel General Manager', 'Front Office Executive', 'Housekeeping Manager', 'Concierge'] },
      { id: 'hosp-fb-culinary', slug: 'food-beverage-culinary', name: 'F&B, Bar & Culinary Arts', jobFamilies: ['Executive Chef', 'Sous Chef', 'F&B Manager', 'Bartender', 'Restaurant Supervisor'] },
      { id: 'hosp-travel-tourism', slug: 'travel-ticketing-tourism', name: 'Travel, Ticketing & Tourism', jobFamilies: ['Travel Consultant', 'Tour Manager', 'Ticketing Executive', 'Reservation Agent'] },
    ],
    canonicalJobTitles: [
      'Hotel Operations Manager', 'Front Office Executive', 'Executive Chef', 'Sous Chef', 'F&B Manager',
      'Restaurant Manager', 'Travel Consultant', 'Guest Relations Executive', 'Housekeeping Supervisor',
      'Barista', 'Tour Coordinator'
    ],
    entityKeywords: ['hospitality', 'tourism', 'hotel', 'resort', 'culinary', 'chef', 'restaurant', 'front office', 'housekeeping', 'food & beverage', 'f&b', 'travel agency', 'tour', 'guest relations'],
    companyIndicators: ['taj hotels', 'ihcl', 'oberoi', 'itc hotels', 'marriott', 'hyatt', 'radisson', 'lemon tree', 'make my trip', 'yatra', 'thomas cook']
  },
  {
    id: 'accounting-finance',
    slug: 'accounting-finance',
    name: 'Accounting & Finance',
    icon: 'Receipt',
    description: 'Chartered accountancy, statutory auditing, direct/indirect taxation, corporate financial planning and bookkeeping.',
    subindustries: [
      { id: 'acc-audit-statutory', slug: 'audit-statutory-assurance', name: 'Statutory Audit & Assurance', jobFamilies: ['Chartered Accountant (CA)', 'Audit Senior', 'Internal Auditor', 'Audit Manager'] },
      { id: 'acc-taxation', slug: 'taxation-gst-direct', name: 'Direct & Indirect Taxation (GST)', jobFamilies: ['Tax Consultant', 'GST Practitioner', 'Transfer Pricing Specialist'] },
      { id: 'acc-corporate-fp-a', slug: 'corporate-fp-a-bookkeeping', name: 'Corporate FP&A & Bookkeeping', jobFamilies: ['Financial Controller', 'Finance Manager', 'Accountant', 'Accounts Executive', 'Bookkeeper'] },
    ],
    canonicalJobTitles: [
      'Chartered Accountant', 'Senior Accountant', 'Finance Manager', 'Statutory Auditor', 'Tax Consultant',
      'Accounts Executive', 'Financial Controller', 'Internal Auditor', 'GST Specialist', 'Accountant',
      'Junior Accountant', 'Bookkeeper'
    ],
    entityKeywords: ['accounting', 'accountant', 'chartered accountant', 'ca', 'auditing', 'taxation', 'gst', 'income tax', 'tally', 'balance sheet', 'p&l', 'bookkeeping', 'statutory audit', 'financial controller'],
    companyIndicators: ['deloitte', 'pwc', 'ey', 'kpmg', 'bdo', 'grant thornton', 'haribhakti', 'bansi s mehta', 'singhi & co']
  },
  {
    id: 'media-entertainment',
    slug: 'media-entertainment',
    name: 'Media & Entertainment',
    icon: 'Tv',
    description: 'Broadcast journalism, film & video production, video editing, animation/VFX, audio engineering and talent management.',
    subindustries: [
      { id: 'media-video-production', slug: 'video-film-production', name: 'Film, Video & TV Production', jobFamilies: ['Video Editor', 'Cinematographer', 'Video Producer', 'Sound Designer'] },
      { id: 'media-animation-vfx', slug: 'animation-vfx-gaming', name: 'Animation, VFX & 3D Arts', jobFamilies: ['3D Animator', 'VFX Artist', 'Motion Graphics Designer', 'Storyboard Artist'] },
      { id: 'media-journalism-publishing', slug: 'journalism-news-publishing', name: 'Journalism, News & Editorial', jobFamilies: ['Journalist', 'News Anchor', 'Sub-Editor', 'Correspondent'] },
    ],
    canonicalJobTitles: [
      'Video Editor', 'Motion Graphics Artist', 'Animator', 'Content Producer', 'Journalist',
      'News Anchor', 'Sound Engineer', 'Cinematographer', 'VFX Artist', 'Broadcast Associate',
      'Media Planner', 'Scriptwriter'
    ],
    entityKeywords: ['media', 'entertainment', 'film', 'television', 'video editor', 'animation', 'vfx', '3d modeling', 'motion graphics', 'journalism', 'reporter', 'broadcasting', 'audio engineering', 'production assistant'],
    companyIndicators: ['zee entertainment', 'sony pictures', 'disney star', 'ndtv', 'times group', 'viacom18', 'network18', 'red chillies', 'prime focus', 'netflix india']
  },
  {
    id: 'legal-compliance',
    slug: 'legal-compliance',
    name: 'Legal & Compliance',
    icon: 'Scale',
    description: 'Corporate law, contract drafting & negotiation, regulatory compliance, intellectual property and litigation.',
    subindustries: [
      { id: 'legal-corporate-commercial', slug: 'corporate-law-contracts', name: 'Corporate Law & Contracts', jobFamilies: ['Corporate Counsel', 'Legal Associate', 'Contract Specialist', 'General Counsel'] },
      { id: 'legal-regulatory-compliance', slug: 'regulatory-compliance-aml', name: 'Regulatory Compliance & AML', jobFamilies: ['Compliance Officer', 'AML Analyst', 'Ethics & Compliance Manager'] },
      { id: 'legal-ipr-patents', slug: 'ipr-patents-trademark', name: 'Intellectual Property (IPR) & Patents', jobFamilies: ['Patent Attorney', 'IPR Associate', 'Trademark Specialist'] },
    ],
    canonicalJobTitles: [
      'Legal Counsel', 'Corporate Lawyer', 'Compliance Officer', 'Legal Associate', 'Contract Manager',
      'Company Secretary', 'Intellectual Property Attorney', 'Legal Advisor', 'Regulatory Compliance Lead',
      'Paralegal', 'Law Officer'
    ],
    entityKeywords: ['legal', 'lawyer', 'attorney', 'advocate', 'compliance', 'corporate counsel', 'contract drafting', 'litigation', 'ipr', 'patent', 'trademark', 'paralegal', 'company secretary', 'regulatory compliance'],
    companyIndicators: ['shardul amarchand mangaldas', 'cyril amarchand mangaldas', 'khaitan & co', 'azb & partners', 'trilegal', 'luthra and luthra', 'j sagar associates']
  },
  {
    id: 'construction-real-estate',
    slug: 'construction-real-estate',
    name: 'Construction & Real Estate',
    icon: 'Building',
    description: 'Civil engineering, project site management, architectural design, property valuation and real estate leasing.',
    subindustries: [
      { id: 'cons-civil-site-eng', slug: 'civil-site-engineering', name: 'Civil Engineering & Site Execution', jobFamilies: ['Civil Engineer', 'Site Engineer', 'Project Manager (Construction)', 'Structural Engineer'] },
      { id: 'cons-architecture-bim', slug: 'architecture-bim-interior', name: 'Architecture, BIM & Interior Design', jobFamilies: ['Architect', 'BIM Modeler', 'Interior Designer', 'Urban Planner'] },
      { id: 'cons-re-leasing-sales', slug: 'real-estate-leasing-sales', name: 'Real Estate Sales & Property Leasing', jobFamilies: ['Property Consultant', 'Leasing Manager', 'Real Estate Valuation Associate'] },
    ],
    canonicalJobTitles: [
      'Civil Engineer', 'Site Engineer', 'Project Manager (Construction)', 'Architect', 'Structural Engineer',
      'BIM Engineer', 'Interior Designer', 'Quantity Surveyor', 'Safety Officer (HSE)', 'Property Consultant',
      'Leasing Specialist'
    ],
    entityKeywords: ['construction', 'real estate', 'civil engineer', 'structural engineer', 'site engineer', 'architecture', 'architect', 'interior design', 'bim', 'quantity surveyor', 'property management', 'builder'],
    companyIndicators: ['dlf', 'godrej properties', 'prestige group', 'sobha', 'brigade', 'lodha', 'macrotech', 'hiranandani', 'oberoi realty', 'shapoorji pallonji']
  },
  {
    id: 'automobile-automotive',
    slug: 'automobile-automotive',
    name: 'Automobile & Automotive',
    icon: 'Car',
    description: 'Automotive engineering, electric vehicles (EV), battery technology, powertrain, automotive assembly and dealership ops.',
    subindustries: [
      { id: 'auto-ev-powertrain', slug: 'ev-powertrain-battery', name: 'EV, Battery Tech & Powertrain', jobFamilies: ['EV Powertrain Engineer', 'Battery Systems Engineer', 'BMS Specialist'] },
      { id: 'auto-assembly-manufacturing', slug: 'assembly-body-chassis', name: 'Chassis, Body & Assembly', jobFamilies: ['Automotive Engineer', 'Body-in-White Engineer', 'Assembly Line Supervisor'] },
      { id: 'auto-service-dealership', slug: 'dealership-service-operations', name: 'Dealership & Service Operations', jobFamilies: ['Service Advisor', 'Automotive Technician', 'Workshop Manager'] },
    ],
    canonicalJobTitles: [
      'Automotive Engineer', 'EV Powertrain Engineer', 'Battery Management Systems (BMS) Engineer',
      'Vehicle Dynamics Engineer', 'Automotive Technician', 'Service Advisor', 'Workshop Manager',
      'Mechanical Engineer (Automotive)', 'Assembly Supervisor', 'Automotive Design Engineer'
    ],
    entityKeywords: ['automobile', 'automotive', 'ev', 'electric vehicle', 'powertrain', 'battery', 'bms', 'vehicle', 'chassis', 'dealership', 'auto workshop', 'mechanic', 'oem'],
    companyIndicators: ['tata motors', 'mahindra & mahindra', 'maruti suzuki', 'bajaj auto', 'tvs motor', 'hero motocorp', 'ola electric', 'ather energy', 'hyundai india', 'toyota kirloskar', 'bosch india']
  },
  {
    id: 'insurance',
    slug: 'insurance',
    name: 'Insurance',
    icon: 'Shield',
    description: 'Life insurance, health insurance, general casualty, actuarial analysis, claims adjustment and underwriting.',
    subindustries: [
      { id: 'ins-underwriting-actuarial', slug: 'underwriting-actuarial-science', name: 'Underwriting & Actuarial Science', jobFamilies: ['Underwriter', 'Actuary', 'Risk Assessor'] },
      { id: 'ins-claims-surveying', slug: 'claims-surveying-settlement', name: 'Claims Processing & Surveying', jobFamilies: ['Claims Officer', 'Surveyor & Loss Assessor', 'Medical Claims Manager'] },
      { id: 'ins-agency-bancassurance', slug: 'agency-bancassurance-distribution', name: 'Agency & Bancassurance Sales', jobFamilies: ['Agency Manager', 'Bancassurance Officer', 'Insurance Advisor'] },
    ],
    canonicalJobTitles: [
      'Underwriter', 'Claims Officer', 'Actuary', 'Insurance Advisor', 'Bancassurance Manager',
      'Agency Development Manager', 'Risk Surveyor', 'Claims Adjuster', 'Policy Administrator',
      'Actuarial Analyst'
    ],
    entityKeywords: ['insurance', 'life insurance', 'general insurance', 'health insurance', 'underwriter', 'actuary', 'actuarial', 'claims', 'bancassurance', 'policy', 'lic', 'gic', 'surveyor', 'claims assessor'],
    companyIndicators: ['lic', 'life insurance corporation', 'hdfc life', 'icici prudential', 'sbi life', 'max life', 'bajaj allianz', 'tata aia', 'star health', 'icici lombard', 'new india assurance']
  },
  {
    id: 'government-public-sector',
    slug: 'government-public-sector',
    name: 'Government & Public Sector',
    icon: 'Landmark',
    description: 'Central civil services, state administrative exams, Public Sector Undertakings (PSUs), defense and municipal bodies.',
    subindustries: [
      { id: 'gov-civil-services', slug: 'civil-services-administration', name: 'Civil Services & Public Administration', jobFamilies: ['Assistant Section Officer', 'Administrative Officer', 'Section Officer'] },
      { id: 'gov-psu-enterprises', slug: 'psu-engineering-management', name: 'PSU Enterprises & Technical Services', jobFamilies: ['Management Trainee (PSU)', 'Graduate Engineer Trainee (GET)', 'Junior Engineer'] },
      { id: 'gov-defence-research', slug: 'defence-atomic-space-research', name: 'Defense, Space & Scientific Research', jobFamilies: ['Scientist/Engineer', 'Scientific Assistant', 'Technical Officer'] },
    ],
    canonicalJobTitles: [
      'Assistant Section Officer', 'Graduate Apprentice (PSU)', 'Management Trainee (PSU)', 'Junior Engineer (Govt)',
      'Scientific Officer', 'Station Master', 'Statistical Investigator', 'Administrative Officer',
      'Sub Inspector', 'Civil Judge', 'Section Officer'
    ],
    entityKeywords: ['government', 'govt', 'public sector', 'psu', 'upsc', 'ssc', 'rrb', 'railways', 'defence', 'civil services', 'isro', 'drdo', 'iocl', 'ongc', 'ntpc', 'sail', 'bhel', 'state government', 'central government'],
    companyIndicators: ['upsc', 'ssc', 'rrb', 'isro', 'drdo', 'iocl', 'ongc', 'ntpc', 'bhel', 'sail', 'coal india', 'bharat petroleum', 'hal', 'bel', 'indian railways', 'post office']
  }
] as const;

export function getAllIndustries(): readonly IndustryDefinition[] {
  return CANONICAL_20_INDUSTRIES;
}

export function getIndustryBySlug(slug: string): IndustryDefinition | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  return CANONICAL_20_INDUSTRIES.find(i => i.slug === clean || i.id === clean);
}

export function getIndustryById(id: string): IndustryDefinition | undefined {
  if (!id) return undefined;
  return CANONICAL_20_INDUSTRIES.find(i => i.id === id);
}

export function getIndustryByName(name: string): IndustryDefinition | undefined {
  if (!name) return undefined;
  const clean = name.toLowerCase().trim();
  return CANONICAL_20_INDUSTRIES.find(i => i.name.toLowerCase() === clean);
}
