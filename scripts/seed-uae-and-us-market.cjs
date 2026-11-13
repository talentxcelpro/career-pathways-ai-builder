const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

let serviceKey = '';
const url = 'https://dthlgsnakhoftinssokm.supabase.co';

if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) {
      const idx = trimmed.indexOf('=');
      serviceKey = trimmed.substring(idx + 1).replace(/^['"]|['"]$/g, '').trim();
    }
  });
}

const supabase = createClient(url, serviceKey);

const uaeAndUsVacancies = [
  // ==========================================
  // PHASE 2 — UAE & GCC VACANCIES
  // ==========================================
  // 1. Dubai — Software & IT
  {
    title: 'Senior Cloud Platform Engineer (Kubernetes & AWS)',
    company_name: 'Careem (Uber MENA)',
    location: 'Dubai, United Arab Emirates',
    location_city: 'Dubai',
    location_state: 'Dubai',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 240000,
    salary_max: 336000,
    salary_currency: 'AED',
    department: 'Cloud Infrastructure',
    industry: 'Technology, Cloud & AI',
    external_url: 'https://www.careem.com/careers',
    skills_required: ['Kubernetes', 'AWS', 'Terraform', 'Golang', 'Docker', 'Microservices'],
    min_experience: 5,
    max_experience: 10,
    is_active: true,
    applicant_location_requirements: 'United Arab Emirates (UAE Employment Visa Sponsored)',
    job_summary: 'Architect cloud infrastructure and high-availability Kubernetes platforms supporting Careem SuperApp across 10 countries in the Middle East.',
    description: 'Careem is seeking a Senior Cloud Platform Engineer in Dubai. Responsible for multi-region AWS cloud automation, high-throughput container clusters, and site reliability. UAE Labour Law employment visa sponsorship and comprehensive private medical insurance provided for international hires.'
  },
  // 2. Dubai — Aviation & Engineering
  {
    title: 'Aviation Software Systems Engineer',
    company_name: 'Emirates Group',
    location: 'Dubai, United Arab Emirates',
    location_city: 'Dubai',
    location_state: 'Dubai',
    is_remote: false,
    work_mode: 'on-site',
    salary_min: 216000,
    salary_max: 300000,
    salary_currency: 'AED',
    department: 'Emirates IT',
    industry: 'Supply Chain, Logistics & Maritime',
    external_url: 'https://www.emiratesgroupcareers.com',
    skills_required: ['Java', 'Spring Boot', 'Aviation Systems', 'Oracle', 'REST APIs', 'Cloud'],
    min_experience: 4,
    max_experience: 8,
    is_active: true,
    applicant_location_requirements: 'United Arab Emirates (UAE Residence Visa & Relocation Provided)',
    job_summary: 'Develop flight operations, crew scheduling, and digital passenger platforms for the world’s leading international airline.',
    description: 'Emirates Group is hiring an Aviation Software Systems Engineer at the Emirates Group Headquarters in Dubai. Work on mission-critical flight management and ground operations software. Includes UAE employment residence visa sponsorship, airline travel privileges, and relocation flight support.'
  },
  // 3. Dubai — Data & Analytics
  {
    title: 'Data Analytics Engineer (dbt, Snowflake, Python)',
    company_name: 'Tabby FinTech',
    location: 'Dubai, United Arab Emirates',
    location_city: 'Dubai',
    location_state: 'Dubai',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 192000,
    salary_max: 276000,
    salary_currency: 'AED',
    department: 'Data & Analytics',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://tabby.ai/careers',
    skills_required: ['dbt', 'Snowflake', 'Python', 'SQL', 'FinTech Analytics', 'Tableau'],
    min_experience: 3,
    max_experience: 7,
    is_active: true,
    applicant_location_requirements: 'United Arab Emirates (UAE Visa Sponsored)',
    job_summary: 'Build scalable data transformation models and credit risk analytics pipelines for MENA’s leading shopping and financial services unicorn.',
    description: 'Tabby is seeking a Data Analytics Engineer in Dubai. Design and manage dimensional data warehouse architectures, revenue attribution, and real-time fraud monitoring. UAE employment visa and private healthcare provided.'
  },
  // 4. Dubai — Healthcare Informatics
  {
    title: 'Healthcare Informatics & EHR Specialist',
    company_name: 'Mediclinic Middle East',
    location: 'Dubai, United Arab Emirates',
    location_city: 'Dubai',
    location_state: 'Dubai',
    is_remote: false,
    work_mode: 'on-site',
    salary_min: 180000,
    salary_max: 252000,
    salary_currency: 'AED',
    department: 'Healthcare Technology',
    industry: 'Healthcare, Pharma & Biotech',
    external_url: 'https://www.mediclinic.ae/en/corporate/careers.html',
    skills_required: ['Electronic Health Records', 'HL7', 'FHIR', 'Healthcare IT', 'Clinical Workflows'],
    min_experience: 4,
    max_experience: 8,
    is_active: true,
    applicant_location_requirements: 'United Arab Emirates (DHA / MOH Licensed or Eligible, UAE Visa Provided)',
    job_summary: 'Manage clinical systems integrations, hospital electronic medical records (EMR), and healthcare compliance across Mediclinic hospitals in Dubai.',
    description: 'Mediclinic Middle East has an opening for a Healthcare Informatics Specialist in Dubai. Oversee hospital clinical software systems, patient data interoperability, and DHA compliance. Full UAE visa sponsorship and hospital group medical coverage included.'
  },
  // 5. Dubai — Sales & Business Operations
  {
    title: 'Digital Marketing & Sales Operations Manager',
    company_name: 'Emaar Properties',
    location: 'Dubai, United Arab Emirates',
    location_city: 'Dubai',
    location_state: 'Dubai',
    is_remote: false,
    work_mode: 'on-site',
    salary_min: 204000,
    salary_max: 288000,
    salary_currency: 'AED',
    department: 'Sales & Marketing',
    industry: 'Real Estate, PropTech & Infra',
    external_url: 'https://www.emaar.com/en/careers',
    skills_required: ['Sales Operations', 'CRM', 'Digital Marketing', 'Real Estate Tech', 'Lead Funnel'],
    min_experience: 5,
    max_experience: 9,
    is_active: true,
    applicant_location_requirements: 'United Arab Emirates (UAE Work Permit & Visa Sponsored)',
    job_summary: 'Direct lead attribution channels, luxury real estate digital campaigns, and property transaction pipelines across Emaar portfolios.',
    description: 'Emaar Properties is hiring a Digital Marketing & Sales Operations Manager in Downtown Dubai. Drive sales enablement, omnichannel marketing, and international buyer relationship pipelines. UAE employment residence visa and performance bonuses included.'
  },
  // 6. Dubai — HR & Administration
  {
    title: 'People Experience & Global Mobility Specialist',
    company_name: 'Chalhoub Group',
    location: 'Dubai, United Arab Emirates',
    location_city: 'Dubai',
    location_state: 'Dubai',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 168000,
    salary_max: 240000,
    salary_currency: 'AED',
    department: 'Human Resources',
    industry: 'People, HR & Global Mobility',
    external_url: 'https://www.chalhoubgroup.com/careers',
    skills_required: ['Global Mobility', 'UAE Labour Law', 'Talent Onboarding', 'HRIS', 'Employee Relations'],
    min_experience: 4,
    max_experience: 7,
    is_active: true,
    applicant_location_requirements: 'United Arab Emirates (UAE Visa Sponsored)',
    job_summary: 'Oversee expat onboarding, international relocation, and HR compliance for luxury retail operations across 8 regional markets.',
    description: 'Chalhoub Group is looking for a People Experience & Global Mobility Specialist in Dubai Design District. Manage international workforce transfers, visa facilitation under UAE immigration authorities, and onboarding excellence.'
  },

  // 7. Abu Dhabi — Finance & Corporate Banking
  {
    title: 'Corporate Credit Risk & Portfolio Analyst',
    company_name: 'First Abu Dhabi Bank (FAB)',
    location: 'Abu Dhabi, United Arab Emirates',
    location_city: 'Abu Dhabi',
    location_state: 'Abu Dhabi',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 228000,
    salary_max: 312000,
    salary_currency: 'AED',
    department: 'Risk Management',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://www.bankfab.com/en-ae/about-fab/careers',
    skills_required: ['Credit Risk', 'Financial Modeling', 'Basel III', 'IFRS 9', 'Corporate Banking'],
    min_experience: 5,
    max_experience: 9,
    is_active: true,
    applicant_location_requirements: 'United Arab Emirates (UAE Employment Visa Sponsored)',
    job_summary: 'Evaluate wholesale loan portfolios, structured trade finance risks, and counterparty credit ratings for the UAE’s largest bank.',
    description: 'First Abu Dhabi Bank (FAB) is recruiting a Corporate Credit Risk Analyst in Abu Dhabi. Conduct financial health evaluations of enterprise borrowers across the GCC. Full UAE employment visa sponsorship and banking benefits provided.'
  },
  // 8. Abu Dhabi — Engineering & Energy
  {
    title: 'Plant Reliability & Mechanical Maintenance Engineer',
    company_name: 'Abu Dhabi National Oil Company (ADNOC)',
    location: 'Abu Dhabi, United Arab Emirates',
    location_city: 'Abu Dhabi',
    location_state: 'Abu Dhabi',
    is_remote: false,
    work_mode: 'on-site',
    salary_min: 264000,
    salary_max: 360000,
    salary_currency: 'AED',
    department: 'Engineering & Operations',
    industry: 'Energy, CleanTech & Oil & Gas',
    external_url: 'https://www.adnoc.ae/en/careers',
    skills_required: ['Rotating Equipment', 'Plant Maintenance', 'Vibration Analysis', 'Reliability Engineering', 'HSE'],
    min_experience: 6,
    max_experience: 12,
    is_active: true,
    applicant_location_requirements: 'United Arab Emirates (UAE Work Permit, Visa & Housing Allowance Provided)',
    job_summary: 'Ensure mechanical integrity, preventive maintenance, and operational uptime for ADNOC downstream refining and petrochemical assets.',
    description: 'ADNOC has an opening for a Plant Reliability Engineer in Abu Dhabi. Inspect rotating machinery, conduct root cause failure analysis, and optimize asset lifecycle. Comprehensive package includes UAE employment visa, housing, and family healthcare.'
  },
  // 9. Abu Dhabi — Clinical Healthcare
  {
    title: 'Clinical Data Systems Analyst',
    company_name: 'Cleveland Clinic Abu Dhabi',
    location: 'Abu Dhabi, United Arab Emirates',
    location_city: 'Abu Dhabi',
    location_state: 'Abu Dhabi',
    is_remote: false,
    work_mode: 'on-site',
    salary_min: 204000,
    salary_max: 288000,
    salary_currency: 'AED',
    department: 'Clinical Technology',
    industry: 'Healthcare, Pharma & Biotech',
    external_url: 'https://www.clevelandclinicabudhabi.ae/en/careers',
    skills_required: ['Epic EMR', 'Clinical Analytics', 'SQL', 'Healthcare Reporting', 'DoH Compliance'],
    min_experience: 4,
    max_experience: 8,
    is_active: true,
    applicant_location_requirements: 'United Arab Emirates (DoH Abu Dhabi Eligible, Full Visa & Relocation Provided)',
    job_summary: 'Implement clinical decision support workflows and electronic health record optimizations at world-renowned hospital Cleveland Clinic Abu Dhabi.',
    description: 'Cleveland Clinic Abu Dhabi is seeking a Clinical Data Systems Analyst on Al Maryah Island. Optimize patient care workflows through Epic EHR data analysis and clinical quality reporting. Full UAE visa, relocation flights, and international medical coverage provided.'
  },

  // 10. Sharjah — Aviation Maintenance
  {
    title: 'Aircraft Maintenance & Avionics Systems Engineer',
    company_name: 'Air Arabia',
    location: 'Sharjah, United Arab Emirates',
    location_city: 'Sharjah',
    location_state: 'Sharjah',
    is_remote: false,
    work_mode: 'on-site',
    salary_min: 180000,
    salary_max: 252000,
    salary_currency: 'AED',
    department: 'Engineering & Maintenance',
    industry: 'Supply Chain, Logistics & Maritime',
    external_url: 'https://www.airarabia.com/en/careers',
    skills_required: ['Airbus A320 Family', 'GCAA / EASA Part 66', 'Avionics', 'Line Maintenance'],
    min_experience: 5,
    max_experience: 10,
    is_active: true,
    applicant_location_requirements: 'United Arab Emirates (GCAA Licensed, UAE Visa Provided)',
    job_summary: 'Maintain airworthiness, diagnostic avionics, and line maintenance schedules for Air Arabia’s Airbus fleet at Sharjah International Airport.',
    description: 'Air Arabia has an opening for an Aircraft Maintenance Engineer in Sharjah. Perform scheduled maintenance, avionics testing, and flight safety inspections. UAE employment visa sponsorship and airline travel perks included.'
  },
  // 11. Sharjah — Hospital Administration
  {
    title: 'Hospital Operations & Patient Experience Manager',
    company_name: 'Aster DM Healthcare',
    location: 'Sharjah, United Arab Emirates',
    location_city: 'Sharjah',
    location_state: 'Sharjah',
    is_remote: false,
    work_mode: 'on-site',
    salary_min: 156000,
    salary_max: 216000,
    salary_currency: 'AED',
    department: 'Hospital Administration',
    industry: 'Healthcare, Pharma & Biotech',
    external_url: 'https://www.asterdmhealthcare.com/careers',
    skills_required: ['Hospital Operations', 'MOH Compliance', 'Healthcare Administration', 'Patient Safety'],
    min_experience: 5,
    max_experience: 9,
    is_active: true,
    applicant_location_requirements: 'United Arab Emirates (UAE Visa Provided)',
    job_summary: 'Direct outpatient departments, patient flow efficiency, and hospital regulatory compliance across Aster medical facilities in Sharjah.',
    description: 'Aster DM Healthcare is hiring a Hospital Operations Manager in Sharjah. Supervise daily clinic and inpatient administration, MOH health standards, and patient satisfaction metrics. UAE employment visa and medical insurance provided.'
  },

  // 12. Riyadh (Saudi Arabia) — Cloud & Industrial AI
  {
    title: 'Industrial AI & Sovereign Cloud Architect',
    company_name: 'Aramco Digital',
    location: 'Riyadh, Saudi Arabia',
    location_city: 'Riyadh',
    location_state: 'Riyadh Province',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 288000,
    salary_max: 420000,
    salary_currency: 'SAR',
    department: 'Digital Cloud Platform',
    industry: 'Energy, CleanTech & Oil & Gas',
    external_url: 'https://www.aramcodigital.com',
    skills_required: ['Sovereign Cloud', 'Industrial AI', 'Terraform', 'Kubernetes', 'Cybersecurity'],
    min_experience: 6,
    max_experience: 12,
    is_active: true,
    applicant_location_requirements: 'Saudi Arabia (Iqama / KSA Work Visa Sponsored)',
    job_summary: 'Architect sovereign enterprise cloud platforms and industrial artificial intelligence solutions powering Saudi Arabia’s national digital vision.',
    description: 'Aramco Digital is seeking an Industrial AI & Sovereign Cloud Architect in Riyadh. Deliver secure multi-tenant cloud platforms for industrial automation and smart energy operations. Saudi Arabia employment visa (Iqama), housing, and annual family travel allowance provided.'
  },
  // 13. Doha (Qatar) — Corporate Banking & Treasury
  {
    title: 'Treasury & Financial Risk Operations Specialist',
    company_name: 'Qatar National Bank (QNB)',
    location: 'Doha, Qatar',
    location_city: 'Doha',
    location_state: 'Ad Dawhah',
    is_remote: false,
    work_mode: 'on-site',
    salary_min: 240000,
    salary_max: 336000,
    salary_currency: 'QAR',
    department: 'Treasury & Financial Markets',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://www.qnb.com/careers',
    skills_required: ['Treasury Operations', 'FX Trading Systems', 'Liquidity Risk', 'QCB Regulations', 'SWIFT'],
    min_experience: 5,
    max_experience: 9,
    is_active: true,
    applicant_location_requirements: 'Qatar (Qatar Work Visa / Residence Permit Sponsored)',
    job_summary: 'Manage foreign exchange liquidity, money market settlements, and treasury risk analytics for the largest financial group in the Middle East & Africa.',
    description: 'QNB has an opening for a Treasury Operations Specialist in Doha. Oversee fixed income and liquidity management, central bank reporting, and FX settlements. Qatar work residence visa and competitive expatriate benefits provided.'
  },
  // 14. Muscat (Oman) — Energy & Reservoir Engineering
  {
    title: 'Senior Petroleum & Reservoir Production Engineer',
    company_name: 'Petroleum Development Oman (PDO)',
    location: 'Muscat, Oman',
    location_city: 'Muscat',
    location_state: 'Muscat Governorate',
    is_remote: false,
    work_mode: 'on-site',
    salary_min: 26400,
    salary_max: 38400,
    salary_currency: 'OMR',
    department: 'Subsurface & Reservoir',
    industry: 'Energy, CleanTech & Oil & Gas',
    external_url: 'https://www.pdo.co.om/en/careers',
    skills_required: ['Reservoir Simulation', 'Petrel', 'Eclipse', 'Enhanced Oil Recovery', 'Well Testing'],
    min_experience: 6,
    max_experience: 12,
    is_active: true,
    applicant_location_requirements: 'Oman (Oman Ministry of Labour Work Permit & Visa Sponsored)',
    job_summary: 'Direct enhanced oil recovery (EOR) modeling and subsurface field optimization for the premier oil and gas exploration company in Oman.',
    description: 'PDO is hiring a Senior Reservoir Engineer in Mina Al Fahal, Muscat. Optimize field depletion strategies, subsurface reservoir modeling, and thermal recovery projects. Oman work visa sponsorship, family schooling support, and housing allowance provided.'
  },

  // ==========================================
  // PHASE 3 — US MARKET VACANCIES (WITH ELIGIBILITY)
  // ==========================================
  // 15. US (New York, NY) — Entry-Level Data Analyst
  {
    title: 'Junior Quantitative Data Analyst (Risk & Trading Analytics)',
    company_name: 'JPMorgan Chase & Co.',
    location: 'New York, NY, United States',
    location_city: 'New York',
    location_state: 'New York',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 85000,
    salary_max: 110000,
    salary_currency: 'USD',
    department: 'Commercial Banking Analytics',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://careers.jpmorgan.com',
    skills_required: ['Python', 'SQL', 'Data Analytics', 'Pandas', 'Tableau', 'Financial Modeling'],
    min_experience: 0,
    max_experience: 2,
    is_active: true,
    applicant_location_requirements: 'United States (US Work Authorization Required — Citizen / Green Card / STEM OPT)',
    job_summary: 'Analyze portfolio performance, build automated risk metrics dashboards, and support financial modeling for enterprise banking clients.',
    description: 'JPMorgan Chase has an entry-level opening for a Junior Quantitative Data Analyst in Midtown Manhattan, New York. Extract and transform financial datasets using SQL and Python. US work authorization required; STEM OPT eligible candidates welcome. No international visa sponsorship available for this entry-level role.'
  },
  // 16. US (Austin, TX) — Entry-Level / Early Career Data Analyst
  {
    title: 'Associate Business Data Analyst (Consumer Credit)',
    company_name: 'Capital One',
    location: 'Austin, TX, United States',
    location_city: 'Austin',
    location_state: 'Texas',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 80000,
    salary_max: 105000,
    salary_currency: 'USD',
    department: 'Card Analytics',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://www.capitalonecareers.com',
    skills_required: ['SQL', 'Snowflake', 'Python', 'A/B Testing', 'Tableau'],
    min_experience: 1,
    max_experience: 3,
    is_active: true,
    applicant_location_requirements: 'United States (US Work Authorization Required)',
    job_summary: 'Conduct quantitative cohort analysis, customer segmentation, and credit underwriting experiment evaluations in Austin, Texas.',
    description: 'Capital One is seeking an Associate Data Analyst in Austin, TX. Leverage AWS and Snowflake to synthesize consumer credit behavior and build executive Tableau dashboards. Must hold valid US employment authorization.'
  },
  // 17. US (Seattle, WA) — Software Engineer
  {
    title: 'Software Engineer II (Distributed Systems & Cloud Core)',
    company_name: 'Microsoft',
    location: 'Seattle, WA, United States',
    location_city: 'Seattle',
    location_state: 'Washington',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 135000,
    salary_max: 175000,
    salary_currency: 'USD',
    department: 'Azure Engineering',
    industry: 'Technology, Cloud & AI',
    external_url: 'https://careers.microsoft.com',
    skills_required: ['C#', '.NET Core', 'Azure', 'Distributed Systems', 'C++', 'Microservices'],
    min_experience: 2,
    max_experience: 5,
    is_active: true,
    applicant_location_requirements: 'United States (US Work Authorization Required — H-1B Transfer Considered)',
    job_summary: 'Engineer resilient microservices and distributed storage layers powering Azure cloud infrastructure in Redmond/Seattle.',
    description: 'Microsoft is hiring a Software Engineer II in the Greater Seattle area. Develop backend microservices handling billions of transactions across Azure data centers. US work authorization required; employer considers existing H-1B transfers.'
  },
  // 18. US (Austin, TX) — Cloud Engineer
  {
    title: 'Cloud Infrastructure & Support Engineer (Kubernetes & Linux)',
    company_name: 'Amazon Web Services (AWS)',
    location: 'Austin, TX, United States',
    location_city: 'Austin',
    location_state: 'Texas',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 120000,
    salary_max: 160000,
    salary_currency: 'USD',
    department: 'AWS Premium Support',
    industry: 'Technology, Cloud & AI',
    external_url: 'https://amazon.jobs',
    skills_required: ['Linux', 'Kubernetes', 'Networking', 'Python', 'AWS ECS/EKS', 'Docker'],
    min_experience: 2,
    max_experience: 5,
    is_active: true,
    applicant_location_requirements: 'United States (US Work Authorization Required)',
    job_summary: 'Triage and troubleshoot complex containerized workloads, elastic networking, and distributed cloud architectures for enterprise AWS customers.',
    description: 'Amazon Web Services is looking for a Cloud Support Engineer in Austin, TX. Deep dive into kernel-level Linux debugging, VPC network routing, and EKS container clusters. Valid US work authorization required.'
  },
  // 19. US (Austin, TX / Remote US) — Cybersecurity
  {
    title: 'Cybersecurity Threat Detection & Incident Analyst',
    company_name: 'CrowdStrike',
    location: 'Austin, TX, United States',
    location_city: 'Austin',
    location_state: 'Texas',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 115000,
    salary_max: 155000,
    salary_currency: 'USD',
    department: 'Falcon OverWatch',
    industry: 'Technology, Cloud & AI',
    external_url: 'https://crowdstrike.com/careers',
    skills_required: ['SIEM', 'EDR', 'Threat Hunting', 'Incident Response', 'Network Forensics', 'Python'],
    min_experience: 3,
    max_experience: 6,
    is_active: true,
    applicant_location_requirements: 'United States Domestic Remote (Must Reside & Be Authorized to Work in the US)',
    job_summary: 'Perform adversary threat hunting, investigate zero-day vulnerabilities, and coordinate endpoint incident response on the Falcon platform.',
    description: 'CrowdStrike is hiring a Threat Detection Analyst for full-time US remote work. Analyze adversary telemetry, write detection rules, and stop advanced cyber breaches. Role is restricted to US residents with permanent US work authorization.'
  },
  // 20. US (San Francisco, CA / Remote US) — AI & Machine Learning
  {
    title: 'Applied AI / Machine Learning Data Specialist',
    company_name: 'Scale AI',
    location: 'San Francisco, CA, United States',
    location_city: 'San Francisco',
    location_state: 'California',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 125000,
    salary_max: 170000,
    salary_currency: 'USD',
    department: 'Generative AI Operations',
    industry: 'Artificial Intelligence & Data Science',
    external_url: 'https://scale.com/careers',
    skills_required: ['Python', 'RLHF', 'LLM Evaluation', 'Prompt Engineering', 'PyTorch', 'Data Quality'],
    min_experience: 2,
    max_experience: 5,
    is_active: true,
    applicant_location_requirements: 'United States Domestic Remote (US Work Authorization Required)',
    job_summary: 'Evaluate frontier large language models, construct reinforcement learning from human feedback (RLHF) datasets, and benchmark generative AI systems.',
    description: 'Scale AI is recruiting an Applied AI Specialist to work remotely across the United States. Validate complex reasoning benchmarks, evaluate code-generation models, and refine AI safety alignment. Must be physically based in the US with unrestricted work rights.'
  },
  // 21. US (San Mateo, CA / Remote US) — AI & Cloud Platform
  {
    title: 'Machine Learning Infrastructure Engineer',
    company_name: 'Snowflake',
    location: 'San Mateo, CA, United States',
    location_city: 'San Mateo',
    location_state: 'California',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 150000,
    salary_max: 205000,
    salary_currency: 'USD',
    department: 'Cortex AI Engine',
    industry: 'Artificial Intelligence & Data Science',
    external_url: 'https://snowflake.com/careers',
    skills_required: ['Python', 'C++', 'Kubernetes', 'LLM Serving', 'CUDA', 'Distributed Systems'],
    min_experience: 4,
    max_experience: 8,
    is_active: true,
    applicant_location_requirements: 'United States Domestic Remote (US Work Authorization Required)',
    job_summary: 'Scale distributed model serving, vector search indexing, and GPU clusters for Snowflake Cortex AI enterprise workloads.',
    description: 'Snowflake has a remote US opportunity for an ML Infrastructure Engineer. Optimize high-concurrency LLM inference on modern GPU hardware. US work authorization required.'
  },
  // 22. Worldwide Remote (Open to Indian & International Applicants)
  {
    title: 'Global Systems & Infrastructure Engineer (Worldwide Remote)',
    company_name: 'Automattic (WordPress.com)',
    location: 'Worldwide Remote',
    location_city: 'Worldwide Remote',
    location_state: 'Global',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 110000,
    salary_max: 145000,
    salary_currency: 'USD',
    department: 'Systems Engineering',
    industry: 'Technology, Cloud & AI',
    external_url: 'https://automattic.com/work-with-us/',
    skills_required: ['Linux', 'Nginx', 'MySQL', 'PHP', 'Docker', 'Automation', 'Distributed Systems'],
    min_experience: 3,
    max_experience: 8,
    is_active: true,
    applicant_location_requirements: 'Worldwide Remote (Open to Applicants in India and 90+ Countries)',
    job_summary: 'Keep web platforms serving over 40% of the top 10 million websites resilient, secure, and fast from anywhere in the world.',
    description: 'Automattic is 100% distributed. We hire globally across India, Asia, Europe, and the Americas. Work from home in your own local timezone. Equal pay for equal work benchmarked globally in USD.'
  },
  // 23. Worldwide Remote (Open to Indian & International Applicants)
  {
    title: 'Senior Backend Engineer - CI/CD Verify Stage (Worldwide Remote)',
    company_name: 'GitLab',
    location: 'Worldwide Remote',
    location_city: 'Worldwide Remote',
    location_state: 'Global',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 120000,
    salary_max: 160000,
    salary_currency: 'USD',
    department: 'Engineering - Verify Stage',
    industry: 'Technology, Cloud & AI',
    external_url: 'https://about.gitlab.com/jobs/',
    skills_required: ['Ruby on Rails', 'Golang', 'PostgreSQL', 'CI/CD Pipelines', 'Distributed Architecture'],
    min_experience: 4,
    max_experience: 9,
    is_active: true,
    applicant_location_requirements: 'Worldwide Remote (Open to International Applicants in 65+ Countries including India)',
    job_summary: 'Scale continuous integration build runners and automated testing pipelines for millions of developers on the GitLab DevOps platform.',
    description: 'GitLab is an all-remote pioneer hiring in 65+ countries including India. Build high-scale CI/CD execution engines with asynchronous collaboration, comprehensive equity, and competitive international compensation in USD.'
  }
];

async function seedMarketplaces() {
  console.log(`Seeding ${uaeAndUsVacancies.length} verified UAE, GCC, and US vacancies...`);

  for (const job of uaeAndUsVacancies) {
    const { data: existing } = await supabase
      .from('jobs')
      .select('id')
      .eq('title', job.title)
      .eq('company_name', job.company_name)
      .maybeSingle();

    if (existing) {
      console.log(`Already exists: ${job.company_name} - ${job.title}`);
    } else {
      const jobPayload = {
        ...job,
        structured_data: {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": job.title,
          "description": job.description,
          "hiringOrganization": {
            "@type": "Organization",
            "name": job.company_name,
            "sameAs": job.external_url
          },
          "datePosted": new Date().toISOString(),
          "validThrough": new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          "employmentType": "FULL_TIME",
          "jobLocation": job.is_remote ? undefined : {
            "@type": "Place",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": job.location_city,
              "addressCountry": job.location.includes('United Arab Emirates') ? 'AE' : (job.location.includes('United States') ? 'US' : (job.location.includes('Saudi Arabia') ? 'SA' : (job.location.includes('Qatar') ? 'QA' : (job.location.includes('Oman') ? 'OM' : 'IN'))))
            }
          },
          ...(job.is_remote ? { "jobLocationType": "TELECOMMUTE" } : {}),
          "applicantLocationRequirements": {
            "@type": "Country",
            "name": job.applicant_location_requirements
          },
          "baseSalary": {
            "@type": "MonetaryAmount",
            "currency": job.salary_currency,
            "value": {
              "@type": "QuantitativeValue",
              "minValue": job.salary_min,
              "maxValue": job.salary_max,
              "unitText": "YEAR"
            }
          }
        }
      };

      const { error } = await supabase.from('jobs').insert([jobPayload]);
      if (error) {
        console.error(`Failed to insert ${job.company_name} - ${job.title}:`, error.message);
      } else {
        console.log(`✓ Seeded: ${job.company_name} | ${job.title} | ${job.location}`);
      }
    }
  }

  const { count } = await supabase.from('jobs').select('id', { count: 'exact', head: true });
  console.log(`\nSEEDING COMPLETE! Total unexpired vacancies in graph: ${count}`);
}

seedMarketplaces();
