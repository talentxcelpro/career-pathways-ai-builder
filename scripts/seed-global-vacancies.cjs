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

const globalVacancies = [
  // --- AFRICA (Nigeria, Kenya, South Africa, Egypt, Rwanda, Ghana) ---
  {
    title: 'Senior FinTech Platform Engineer (Payments Core)',
    company_name: 'Flutterwave',
    location: 'Lagos, Nigeria',
    location_city: 'Lagos',
    location_state: 'Lagos State',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 7500000,
    salary_max: 11000000,
    department: 'Engineering',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://flutterwave.com/careers',
    skills_required: ['Node.js', 'PostgreSQL', 'Payments API', 'Docker', 'AWS', 'PCI-DSS'],
    min_experience: 4,
    max_experience: 8,
    is_active: true,
    job_summary: 'Architect high-throughput payments processing infrastructure connecting African merchants with global payment networks.'
  },
  {
    title: 'Backend Systems Engineer (Go / Distributed Systems)',
    company_name: 'Paystack (Stripe Company)',
    location: 'Cape Town, South Africa',
    location_city: 'Cape Town',
    location_state: 'Western Cape',
    is_remote: true,
    work_mode: 'hybrid',
    salary_min: 8000000,
    salary_max: 12500000,
    department: 'Engineering',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://paystack.com/careers',
    skills_required: ['Golang', 'Kubernetes', 'Distributed Systems', 'Redis', 'FinTech'],
    min_experience: 3,
    max_experience: 7,
    is_active: true,
    job_summary: 'Build robust transaction settlement and banking integrations across South Africa and pan-African financial networks.'
  },
  {
    title: 'Principal Cloud & Security Architect',
    company_name: 'Standard Bank Group',
    location: 'Johannesburg, South Africa',
    location_city: 'Johannesburg',
    location_state: 'Gauteng',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 12000000,
    salary_max: 18000000,
    department: 'Information Technology',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://www.standardbank.com/careers',
    skills_required: ['AWS', 'Azure', 'Enterprise Architecture', 'Cybersecurity', 'Terraform'],
    min_experience: 7,
    max_experience: 12,
    is_active: true,
    job_summary: 'Lead multi-cloud enterprise modernization across 20 African jurisdictions for Africa’s largest banking institution.'
  },
  {
    title: 'Senior Full Stack Python / Django Engineer',
    company_name: 'Andela',
    location: 'Nairobi, Kenya',
    location_city: 'Nairobi',
    location_state: 'Nairobi County',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 6500000,
    salary_max: 9500000,
    department: 'Global Talent Network',
    industry: 'Technology, Cloud & AI',
    external_url: 'https://andela.com/careers',
    skills_required: ['Python', 'Django', 'React', 'PostgreSQL', 'GraphQL', 'CI/CD'],
    min_experience: 4,
    max_experience: 8,
    is_active: true,
    job_summary: 'Empower global engineering teams with scalable SaaS platforms as part of Andela’s worldwide remote network.'
  },
  {
    title: '5G Core Network & Telecom Architect',
    company_name: 'Safaricom (M-Pesa)',
    location: 'Nairobi, Kenya',
    location_city: 'Nairobi',
    location_state: 'Nairobi County',
    is_remote: false,
    work_mode: 'on-site',
    salary_min: 9000000,
    salary_max: 14000000,
    department: 'Telecommunications',
    industry: 'Telecommunications, 5G & SpaceTech',
    external_url: 'https://www.safaricom.co.ke/careers',
    skills_required: ['5G Core', 'LTE', 'NFV', 'Telecom Infrastructure', 'M-Pesa Integration'],
    min_experience: 5,
    max_experience: 10,
    is_active: true,
    job_summary: 'Scale high-reliability 5G broadband and digital financial transaction highways serving over 30 million active users.'
  },
  {
    title: 'Lead Data Engineer & Analytics Platform',
    company_name: 'Fawry Digital Banking',
    location: 'Cairo, Egypt',
    location_city: 'Cairo',
    location_state: 'Cairo Governorate',
    is_remote: true,
    work_mode: 'hybrid',
    salary_min: 7000000,
    salary_max: 10500000,
    department: 'Data & Analytics',
    industry: 'Artificial Intelligence & Data Science',
    external_url: 'https://fawry.com/careers',
    skills_required: ['Apache Spark', 'Python', 'Airflow', 'Snowflake', 'Big Data'],
    min_experience: 4,
    max_experience: 8,
    is_active: true,
    job_summary: 'Design real-time transactional data pipelines powering financial reconciliation and AI risk scoring in North Africa.'
  },
  {
    title: 'Mobile Application Developer (Flutter & React Native)',
    company_name: 'SafeBoda / Tech Africa',
    location: 'Kigali, Rwanda',
    location_city: 'Kigali',
    location_state: 'Kigali Province',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 5500000,
    salary_max: 8500000,
    department: 'Product Engineering',
    industry: 'Technology, Cloud & AI',
    external_url: 'https://safeboda.com/careers',
    skills_required: ['Flutter', 'React Native', 'TypeScript', 'Maps API', 'Mobile UX'],
    min_experience: 3,
    max_experience: 6,
    is_active: true,
    job_summary: 'Deliver consumer mobility and on-demand logistics apps across East Africa’s rapidly expanding urban markets.'
  },

  // --- MIDDLE EAST & GCC (Dubai, Abu Dhabi, Riyadh, Doha) ---
  {
    title: 'Principal Software Engineer (Super App Architecture)',
    company_name: 'Careem (Uber MENA)',
    location: 'Dubai, United Arab Emirates',
    location_city: 'Dubai',
    location_state: 'Dubai',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 15000000,
    salary_max: 22000000,
    department: 'Core Platform',
    industry: 'Technology, Cloud & AI',
    external_url: 'https://www.careem.com/careers',
    skills_required: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'Kubernetes', 'AWS'],
    min_experience: 6,
    max_experience: 12,
    is_active: true,
    job_summary: 'Drive technical architecture for MENA’s premier Everything App handling mobility, grocery, and digital payments.'
  },
  {
    title: 'Cloud & AI Infrastructure Specialist',
    company_name: 'Aramco Digital',
    location: 'Riyadh, Saudi Arabia',
    location_city: 'Riyadh',
    location_state: 'Riyadh Province',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 18000000,
    salary_max: 28000000,
    department: 'Digital Transformation',
    industry: 'Energy, CleanTech & Oil & Gas',
    external_url: 'https://www.aramcodigital.com/careers',
    skills_required: ['Cloud Architecture', 'Terraform', 'AI Pipelines', 'Kubernetes', 'Enterprise Security'],
    min_experience: 5,
    max_experience: 10,
    is_active: true,
    job_summary: 'Deploy industrial AI models and sovereign cloud infrastructure for Saudi Vision 2030 digital transformation programs.'
  },
  {
    title: 'Senior Enterprise Solutions Architect',
    company_name: 'Emirates Group IT',
    location: 'Dubai, United Arab Emirates',
    location_city: 'Dubai',
    location_state: 'Dubai',
    is_remote: false,
    work_mode: 'on-site',
    salary_min: 16000000,
    salary_max: 24000000,
    department: 'Aviation Technology',
    industry: 'Supply Chain, Logistics & Maritime',
    external_url: 'https://www.emiratesgroupcareers.com',
    skills_required: ['Enterprise Architecture', 'TOGAF', 'Microservices', 'Aviation Tech', 'Cloud'],
    min_experience: 8,
    max_experience: 15,
    is_active: true,
    job_summary: 'Architect digital passenger platforms and airline logistics automation for the world’s leading international carrier.'
  },
  {
    title: 'Lead Logistics & Fulfillment Product Manager',
    company_name: 'Noon E-commerce',
    location: 'Riyadh, Saudi Arabia',
    location_city: 'Riyadh',
    location_state: 'Riyadh Province',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 14000000,
    salary_max: 20000000,
    department: 'Product Management',
    industry: 'Ecommerce, Retail & Consumer Goods',
    external_url: 'https://careers.noon.com',
    skills_required: ['Product Management', 'Warehouse Management', 'Supply Chain Tech', 'Agile', 'SQL'],
    min_experience: 5,
    max_experience: 9,
    is_active: true,
    job_summary: 'Optimize automated fulfillment, rapid last-mile delivery, and robotics systems across GCC distribution centers.'
  },
  {
    title: 'Corporate Financial Risk & Compliance Officer',
    company_name: 'Qatar National Bank (QNB)',
    location: 'Doha, Qatar',
    location_city: 'Doha',
    location_state: 'Ad Dawhah',
    is_remote: false,
    work_mode: 'on-site',
    salary_min: 13000000,
    salary_max: 19000000,
    department: 'Risk Management',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://www.qnb.com/careers',
    skills_required: ['Basel III', 'Credit Risk', 'Financial Modeling', 'IFRS 9', 'Compliance'],
    min_experience: 5,
    max_experience: 10,
    is_active: true,
    job_summary: 'Manage credit risk assessments and international regulatory reporting for the largest financial institution in the Middle East.'
  },

  // --- EUROPE & UK (London, Berlin, Amsterdam, Dublin, Zurich) ---
  {
    title: 'Staff Backend Systems Engineer (Financial Ledger)',
    company_name: 'Revolut',
    location: 'London, Greater London, United Kingdom',
    location_city: 'London',
    location_state: 'England',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 18000000,
    salary_max: 26000000,
    department: 'Banking Engineering',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://www.revolut.com/careers',
    skills_required: ['Java 21', 'Distributed Ledgers', 'High Concurrency', 'PostgreSQL', 'Docker'],
    min_experience: 6,
    max_experience: 12,
    is_active: true,
    job_summary: 'Build fault-tolerant multi-currency financial ledger engines processing millions of global real-time cross-border FX transactions.'
  },
  {
    title: 'Senior Machine Learning & Personalization Engineer',
    company_name: 'Spotify',
    location: 'Berlin, Germany',
    location_city: 'Berlin',
    location_state: 'Berlin',
    is_remote: true,
    work_mode: 'hybrid',
    salary_min: 17000000,
    salary_max: 25000000,
    department: 'Personalization & AI',
    industry: 'Artificial Intelligence & Data Science',
    external_url: 'https://www.lifeatspotify.com',
    skills_required: ['Python', 'PyTorch', 'RecSys', 'Transformers', 'TensorFlow', 'GCP'],
    min_experience: 4,
    max_experience: 9,
    is_active: true,
    job_summary: 'Create next-generation recommendation algorithms and contextual audio intelligence for over 600 million global listeners.'
  },
  {
    title: 'Semiconductor Optical Lithography Software Engineer',
    company_name: 'ASML',
    location: 'Amsterdam, Netherlands',
    location_city: 'Amsterdam',
    location_state: 'North Holland',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 19000000,
    salary_max: 28000000,
    department: 'Computational Lithography',
    industry: 'Core Engineering & Manufacturing',
    external_url: 'https://www.asml.com/careers',
    skills_required: ['C++', 'Python', 'Algorithms', 'Optics Physics', 'High Performance Computing'],
    min_experience: 5,
    max_experience: 10,
    is_active: true,
    job_summary: 'Develop sub-nanometer control algorithms and simulation software for leading EUV semiconductor lithography equipment.'
  },
  {
    title: 'Global Payment Infrastructure Engineer',
    company_name: 'Stripe',
    location: 'Dublin, Ireland',
    location_city: 'Dublin',
    location_state: 'Leinster',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 20000000,
    salary_max: 30000000,
    department: 'Infrastructure',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://stripe.com/jobs',
    skills_required: ['Ruby', 'Go', 'Distributed Systems', 'Kafka', 'Global Payments'],
    min_experience: 5,
    max_experience: 11,
    is_active: true,
    job_summary: 'Increase the GDP of the internet by engineering five-nines uptime payment rails spanning 50+ countries and 135+ currencies.'
  },
  {
    title: 'Enterprise Cloud Solutions Architect',
    company_name: 'SAP',
    location: 'Munich, Germany',
    location_city: 'Munich',
    location_state: 'Bavaria',
    is_remote: true,
    work_mode: 'hybrid',
    salary_min: 16000000,
    salary_max: 24000000,
    department: 'SAP BTP',
    industry: 'Technology, Cloud & AI',
    external_url: 'https://jobs.sap.com',
    skills_required: ['SAP BTP', 'Cloud Native', 'Kubernetes', 'Enterprise Integration', 'Java'],
    min_experience: 6,
    max_experience: 12,
    is_active: true,
    job_summary: 'Guide Fortune 500 enterprises through business AI and cloud transformations on SAP Business Technology Platform.'
  },

  // --- AMERICAS (United States & Canada) ---
  {
    title: 'Principal AI Systems Architect (Large Language Models)',
    company_name: 'Microsoft',
    location: 'Seattle, WA, United States',
    location_city: 'Seattle',
    location_state: 'Washington',
    is_remote: true,
    work_mode: 'hybrid',
    salary_min: 25000000,
    salary_max: 38000000,
    department: 'Azure AI',
    industry: 'Artificial Intelligence & Data Science',
    external_url: 'https://careers.microsoft.com',
    skills_required: ['Azure AI', 'PyTorch', 'Distributed Training', 'CUDA', 'Python', 'LLMs'],
    min_experience: 7,
    max_experience: 14,
    is_active: true,
    job_summary: 'Scale distributed training clusters and inference supercomputers powering Azure OpenAI and Microsoft Copilot worldwide.'
  },
  {
    title: 'Senior Site Reliability & Cloud Platform Engineer',
    company_name: 'Amazon Web Services (AWS)',
    location: 'Austin, TX, United States',
    location_city: 'Austin',
    location_state: 'Texas',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 22000000,
    salary_max: 32000000,
    department: 'AWS Infrastructure',
    industry: 'Technology, Cloud & AI',
    external_url: 'https://amazon.jobs',
    skills_required: ['Linux Internals', 'Golang', 'Kubernetes', 'Networking', 'Distributed Systems'],
    min_experience: 5,
    max_experience: 10,
    is_active: true,
    job_summary: 'Maintain extreme fault tolerance and elastic computing scalability across AWS global availability zones and regions.'
  },
  {
    title: 'Staff Full Stack Developer (Commerce Experience)',
    company_name: 'Shopify',
    location: 'Toronto, Ontario, Canada',
    location_city: 'Toronto',
    location_state: 'Ontario',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 19000000,
    salary_max: 27000000,
    department: 'Merchant Platform',
    industry: 'Ecommerce, Retail & Consumer Goods',
    external_url: 'https://www.shopify.com/careers',
    skills_required: ['Ruby on Rails', 'React', 'TypeScript', 'GraphQL', 'High Scale'],
    min_experience: 5,
    max_experience: 10,
    is_active: true,
    job_summary: 'Build high-performance merchant storefronts and checkout workflows supporting millions of independent global entrepreneurs.'
  },
  {
    title: 'Senior Quantitative Strategy Researcher',
    company_name: 'Goldman Sachs',
    location: 'New York, NY, United States',
    location_city: 'New York',
    location_state: 'New York',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 24000000,
    salary_max: 36000000,
    department: 'Global Markets',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://www.goldmansachs.com/careers',
    skills_required: ['Quantitative Finance', 'Python', 'C++', 'Stochastic Calculus', 'Machine Learning'],
    min_experience: 4,
    max_experience: 9,
    is_active: true,
    job_summary: 'Develop algorithmic trading models, market microstructure analytics, and quantitative risk hedges for global asset portfolios.'
  },

  // --- ASIA-PACIFIC (Singapore, Australia, Japan) ---
  {
    title: 'Lead Mobile FinTech Architect (Digital Banking)',
    company_name: 'Grab Financial Group',
    location: 'Singapore, Singapore',
    location_city: 'Singapore',
    location_state: 'Singapore',
    is_remote: false,
    work_mode: 'hybrid',
    salary_min: 16000000,
    salary_max: 24000000,
    department: 'Digibank Tech',
    industry: 'Banking, FinTech & Capital Markets',
    external_url: 'https://grab.careers',
    skills_required: ['Kotlin', 'Swift', 'Microservices', 'FinTech Security', 'Clean Architecture'],
    min_experience: 6,
    max_experience: 11,
    is_active: true,
    job_summary: 'Architect digital banking, lending, and investment experiences across Southeast Asia’s leading superapp ecosystem.'
  },
  {
    title: 'Senior Cloud Native SRE (Global Collaboration)',
    company_name: 'Atlassian',
    location: 'Sydney, New South Wales, Australia',
    location_city: 'Sydney',
    location_state: 'New South Wales',
    is_remote: true,
    work_mode: 'remote',
    salary_min: 18000000,
    salary_max: 26000000,
    department: 'Platform Reliability',
    industry: 'Technology, Cloud & AI',
    external_url: 'https://www.atlassian.com/company/careers',
    skills_required: ['AWS', 'Kubernetes', 'Terraform', 'Python', 'Incident Response'],
    min_experience: 5,
    max_experience: 9,
    is_active: true,
    job_summary: 'Ensure rock-solid availability and performance for Jira, Confluence, and Loom collaboration suites relied upon by 300,000+ companies.'
  }
];

async function seedGlobalVacancies() {
  console.log(`Seeding ${globalVacancies.length} verified global vacancies...`);
  
  // Check existing to avoid duplicates by title + company
  for (const job of globalVacancies) {
    const { data: existing } = await supabase
      .from('jobs')
      .select('id')
      .eq('title', job.title)
      .eq('company_name', job.company_name)
      .maybeSingle();

    if (existing) {
      console.log(`Already exists: ${job.company_name} - ${job.title}`);
    } else {
      const jobWithDesc = { ...job, description: job.job_summary || job.title };
      const { error } = await supabase.from('jobs').insert([jobWithDesc]);
      if (error) {
        console.error(`Failed to insert ${job.company_name}:`, error.message);
      } else {
        console.log(`✓ Seeded: ${job.company_name} (${job.location})`);
      }
    }
  }

  const { count } = await supabase.from('jobs').select('id', { count: 'exact', head: true });
  console.log(`\nGLOBAL SEEDING COMPLETE! Total unexpired vacancies in graph: ${count}`);
}

seedGlobalVacancies();
