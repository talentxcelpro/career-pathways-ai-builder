// src/config/jobs/roles.ts
// 50+ Validated High-Demand Technical and Business Roles for TalentXcel Jobs Matrix
// Normalized taxonomy with synonyms, core skills, and related role clusters

export interface JobRoleConfig {
  slug: string;
  title: string;
  category: 'Engineering & Tech' | 'Data & AI' | 'Product & Design' | 'Marketing & Growth' | 'Sales & Business' | 'Operations & Finance';
  synonyms: string[];
  skills: string[];
  relatedRoleSlugs: string[];
  description: string;
}

export const JOB_ROLES: JobRoleConfig[] = [
  // ── Software & Engineering (15 roles) ──
  {
    slug: 'software-engineer',
    title: 'Software Engineer',
    category: 'Engineering & Tech',
    synonyms: ['software developer', 'software development engineer', 'sde', 'programmer', 'software programmer'],
    skills: ['Data Structures', 'Algorithms', 'System Design', 'Git', 'OOP', 'Problem Solving'],
    relatedRoleSlugs: ['frontend-developer', 'backend-developer', 'full-stack-developer', 'devops-engineer'],
    description: 'Design, develop, test, and maintain robust software applications and distributed systems.'
  },
  {
    slug: 'frontend-developer',
    title: 'Frontend Developer',
    category: 'Engineering & Tech',
    synonyms: ['front end engineer', 'ui developer', 'web developer', 'react developer', 'angular developer'],
    skills: ['React', 'TypeScript', 'JavaScript', 'HTML5/CSS3', 'Tailwind CSS', 'Next.js', 'Redux', 'Web Performance'],
    relatedRoleSlugs: ['software-engineer', 'full-stack-developer', 'ui-ux-designer'],
    description: 'Build responsive, accessible, and high-performance user interfaces and web applications.'
  },
  {
    slug: 'backend-developer',
    title: 'Backend Developer',
    category: 'Engineering & Tech',
    synonyms: ['back end engineer', 'server-side engineer', 'api developer', 'java developer', 'node developer'],
    skills: ['Node.js', 'Python', 'Java', 'PostgreSQL', 'MongoDB', 'RESTful APIs', 'Microservices', 'Redis'],
    relatedRoleSlugs: ['software-engineer', 'full-stack-developer', 'devops-engineer', 'cloud-architect'],
    description: 'Architect scalable server-side systems, database schemas, and microservice APIs.'
  },
  {
    slug: 'full-stack-developer',
    title: 'Full Stack Developer',
    category: 'Engineering & Tech',
    synonyms: ['full stack engineer', 'fullstack developer', 'mern developer', 'mean developer'],
    skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'NoSQL', 'GraphQL', 'Docker', 'AWS'],
    relatedRoleSlugs: ['frontend-developer', 'backend-developer', 'software-engineer'],
    description: 'Deliver end-to-end web applications bridging elegant frontends and resilient backends.'
  },
  {
    slug: 'react-developer',
    title: 'React Developer',
    category: 'Engineering & Tech',
    synonyms: ['react.js developer', 'reactjs engineer', 'react native developer'],
    skills: ['React', 'React Native', 'TypeScript', 'Next.js', 'State Management', 'REST/GraphQL'],
    relatedRoleSlugs: ['frontend-developer', 'full-stack-developer', 'mobile-app-developer'],
    description: 'Engineer modern single-page applications and mobile apps leveraging the React ecosystem.'
  },
  {
    slug: 'java-developer',
    title: 'Java Developer',
    category: 'Engineering & Tech',
    synonyms: ['core java developer', 'java backend developer', 'spring boot developer'],
    skills: ['Java', 'Spring Boot', 'Microservices', 'Hibernate', 'Kafka', 'SQL', 'Docker'],
    relatedRoleSlugs: ['backend-developer', 'software-engineer', 'devops-engineer'],
    description: 'Develop enterprise-grade, high-throughput microservices using Java and Spring Boot.'
  },
  {
    slug: 'python-developer',
    title: 'Python Developer',
    category: 'Engineering & Tech',
    synonyms: ['python backend developer', 'django developer', 'fastapi developer'],
    skills: ['Python', 'FastAPI', 'Django', 'PostgreSQL', 'Docker', 'AsyncIO', 'Celery'],
    relatedRoleSlugs: ['backend-developer', 'data-engineer', 'machine-learning-engineer'],
    description: 'Construct resilient server backends, web services, and automation pipelines with Python.'
  },
  {
    slug: 'devops-engineer',
    title: 'DevOps Engineer',
    category: 'Engineering & Tech',
    synonyms: ['site reliability engineer', 'sre', 'platform engineer', 'infrastructure engineer'],
    skills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'AWS', 'Linux', 'Ansible', 'Prometheus'],
    relatedRoleSlugs: ['cloud-architect', 'backend-developer', 'cybersecurity-analyst'],
    description: 'Automate build pipelines, containerized deployments, and ensure high system availability.'
  },
  {
    slug: 'cloud-architect',
    title: 'Cloud Architect',
    category: 'Engineering & Tech',
    synonyms: ['aws architect', 'azure architect', 'cloud engineer', 'cloud solutions architect'],
    skills: ['AWS', 'Azure', 'GCP', 'Cloud Security', 'Cost Optimization', 'Kubernetes', 'IaC'],
    relatedRoleSlugs: ['devops-engineer', 'backend-developer', 'system-administrator'],
    description: 'Formulate enterprise cloud strategies, multi-region architectures, and disaster recovery.'
  },
  {
    slug: 'mobile-app-developer',
    title: 'Mobile App Developer',
    category: 'Engineering & Tech',
    synonyms: ['android developer', 'ios developer', 'flutter developer', 'react native engineer'],
    skills: ['Kotlin', 'Swift', 'Flutter', 'React Native', 'Mobile UI/UX', 'REST APIs'],
    relatedRoleSlugs: ['frontend-developer', 'software-engineer', 'ui-ux-designer'],
    description: 'Build native and cross-platform mobile apps for iOS and Android devices.'
  },
  {
    slug: 'qa-automation-engineer',
    title: 'QA Automation Engineer',
    category: 'Engineering & Tech',
    synonyms: ['software test engineer', 'sdet', 'automation tester', 'quality assurance engineer'],
    skills: ['Selenium', 'Cypress', 'Playwright', 'Java/Python', 'API Testing', 'Postman', 'JMeter'],
    relatedRoleSlugs: ['software-engineer', 'devops-engineer'],
    description: 'Implement automated test suites, end-to-end testing, and performance validation.'
  },
  {
    slug: 'cybersecurity-analyst',
    title: 'Cybersecurity Analyst',
    category: 'Engineering & Tech',
    synonyms: ['information security analyst', 'infosec engineer', 'soc analyst', 'security engineer'],
    skills: ['Network Security', 'SIEM', 'Threat Intelligence', 'Penetration Testing', 'Vulnerability Assessment', 'ISO 27001'],
    relatedRoleSlugs: ['devops-engineer', 'system-administrator', 'cloud-architect'],
    description: 'Safeguard corporate networks, detect intrusion attempts, and enforce security protocols.'
  },
  {
    slug: 'system-administrator',
    title: 'System Administrator',
    category: 'Engineering & Tech',
    synonyms: ['sysadmin', 'linux administrator', 'it administrator', 'network administrator'],
    skills: ['Linux', 'Windows Server', 'Active Directory', 'Networking', 'Bash Scripting', 'Virtualization'],
    relatedRoleSlugs: ['devops-engineer', 'cybersecurity-analyst'],
    description: 'Maintain on-premise and virtualized server infrastructure, networking, and user directory systems.'
  },
  {
    slug: 'blockchain-developer',
    title: 'Blockchain Developer',
    category: 'Engineering & Tech',
    synonyms: ['web3 developer', 'smart contract developer', 'solidity engineer'],
    skills: ['Solidity', 'Ethereum', 'Smart Contracts', 'Web3.js', 'Rust', 'Cryptography'],
    relatedRoleSlugs: ['software-engineer', 'backend-developer'],
    description: 'Develop decentralized applications, smart contract protocols, and cryptographically verified systems.'
  },
  {
    slug: 'embedded-systems-engineer',
    title: 'Embedded Systems Engineer',
    category: 'Engineering & Tech',
    synonyms: ['firmware engineer', 'iot engineer', 'hardware engineer'],
    skills: ['C/C++', 'Microcontrollers', 'RTOS', 'Firmware', 'PCB Design', 'IoT Protocols'],
    relatedRoleSlugs: ['software-engineer', 'qa-automation-engineer'],
    description: 'Program hardware microcontrollers, sensor arrays, and IoT connected hardware.'
  },

  // ── Data & AI (10 roles) ──
  {
    slug: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data & AI',
    synonyms: ['applied scientist', 'ml researcher', 'statistical modeler'],
    skills: ['Python', 'Machine Learning', 'Statistics', 'Pandas', 'Scikit-learn', 'SQL', 'Deep Learning'],
    relatedRoleSlugs: ['machine-learning-engineer', 'data-analyst', 'ai-engineer'],
    description: 'Transform complex enterprise data into predictive models and actionable business intelligence.'
  },
  {
    slug: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data & AI',
    synonyms: ['business data analyst', 'bi analyst', 'analytics specialist'],
    skills: ['SQL', 'Power BI', 'Tableau', 'Excel', 'Python', 'Data Visualization', 'Business Insights'],
    relatedRoleSlugs: ['data-scientist', 'business-analyst', 'data-engineer'],
    description: 'Extract, clean, and visualize operational data to empower data-driven leadership decisions.'
  },
  {
    slug: 'data-engineer',
    title: 'Data Engineer',
    category: 'Data & AI',
    synonyms: ['big data engineer', 'etl developer', 'data platform engineer'],
    skills: ['Spark', 'Airflow', 'Kafka', 'SQL', 'Snowflake', 'Python', 'Data Warehousing', 'AWS/GCP'],
    relatedRoleSlugs: ['data-scientist', 'backend-developer', 'cloud-architect'],
    description: 'Build scalable ETL pipelines, lakehouse architectures, and real-time streaming infrastructure.'
  },
  {
    slug: 'machine-learning-engineer',
    title: 'Machine Learning Engineer',
    category: 'Data & AI',
    synonyms: ['ml engineer', 'mloops engineer', 'deep learning engineer'],
    skills: ['PyTorch', 'TensorFlow', 'MLOps', 'Docker', 'Kubeflow', 'Model Deployment', 'Python'],
    relatedRoleSlugs: ['data-scientist', 'ai-engineer', 'software-engineer'],
    description: 'Train, optimize, and deploy production-grade machine learning algorithms into live environments.'
  },
  {
    slug: 'ai-engineer',
    title: 'AI Engineer',
    category: 'Data & AI',
    synonyms: ['generative ai engineer', 'llm engineer', 'ai solutions engineer'],
    skills: ['LLMs', 'LangChain', 'RAG', 'Vector Databases', 'OpenAI APIs', 'Python', 'Prompt Engineering'],
    relatedRoleSlugs: ['machine-learning-engineer', 'data-scientist', 'full-stack-developer'],
    description: 'Build enterprise applications powered by Large Language Models, RAG, and generative AI.'
  },
  {
    slug: 'business-intelligence-engineer',
    title: 'BI Engineer',
    category: 'Data & AI',
    synonyms: ['bi developer', 'power bi developer', 'tableau developer'],
    skills: ['Power BI', 'DAX', 'Tableau', 'SQL Server', 'ETL', 'Data Modeling'],
    relatedRoleSlugs: ['data-analyst', 'data-engineer', 'business-analyst'],
    description: 'Design executive dashboards, semantic data models, and enterprise self-service reporting.'
  },
  {
    slug: 'computer-vision-engineer',
    title: 'Computer Vision Engineer',
    category: 'Data & AI',
    synonyms: ['cv engineer', 'image processing engineer'],
    skills: ['OpenCV', 'PyTorch', 'YOLO', 'Object Detection', 'Image Segmentation', 'Python'],
    relatedRoleSlugs: ['machine-learning-engineer', 'ai-engineer'],
    description: 'Engineer visual perception systems for camera automation, healthcare imaging, and robotics.'
  },
  {
    slug: 'nlp-engineer',
    title: 'NLP Engineer',
    category: 'Data & AI',
    synonyms: ['natural language processing engineer', 'text analytics engineer'],
    skills: ['Transformers', 'Hugging Face', 'BERT', 'SpaCy', 'Text Classification', 'LLMs'],
    relatedRoleSlugs: ['ai-engineer', 'machine-learning-engineer'],
    description: 'Construct language understanding pipelines, sentiment analysis, and conversational AI.'
  },
  {
    slug: 'ai-product-manager',
    title: 'AI Product Manager',
    category: 'Data & AI',
    synonyms: ['data product manager', 'ml product manager'],
    skills: ['AI Roadmap', 'User Experience', 'Model Evaluation', 'Data Ethics', 'Scrum', 'Stakeholder Management'],
    relatedRoleSlugs: ['product-manager', 'ai-engineer', 'data-scientist'],
    description: 'Lead AI product strategy from algorithmic discovery to commercially viable user solutions.'
  },
  {
    slug: 'database-administrator',
    title: 'Database Administrator',
    category: 'Data & AI',
    synonyms: ['dba', 'sql dba', 'postgres dba', 'oracle dba'],
    skills: ['PostgreSQL', 'Oracle', 'MySQL', 'Performance Tuning', 'Backup & Recovery', 'High Availability'],
    relatedRoleSlugs: ['data-engineer', 'backend-developer', 'system-administrator'],
    description: 'Manage, optimize, and secure enterprise relational and distributed databases.'
  },

  // ── Product & Design (7 roles) ──
  {
    slug: 'product-manager',
    title: 'Product Manager',
    category: 'Product & Design',
    synonyms: ['technical product manager', 'tpm', 'associate product manager', 'apm'],
    skills: ['Product Strategy', 'Roadmapping', 'Agile/Scrum', 'User Research', 'Data Analysis', 'Jira'],
    relatedRoleSlugs: ['business-analyst', 'ui-ux-designer', 'ai-product-manager'],
    description: 'Define product vision, orchestrate cross-functional teams, and drive user-centric features.'
  },
  {
    slug: 'ui-ux-designer',
    title: 'UI/UX Designer',
    category: 'Product & Design',
    synonyms: ['product designer', 'user experience designer', 'interaction designer'],
    skills: ['Figma', 'Prototyping', 'Design Systems', 'User Research', 'Wireframing', 'Usability Testing'],
    relatedRoleSlugs: ['product-manager', 'frontend-developer'],
    description: 'Design intuitive, aesthetically refined, and accessible digital customer experiences.'
  },
  {
    slug: 'business-analyst',
    title: 'Business Analyst',
    category: 'Product & Design',
    synonyms: ['it business analyst', 'systems analyst', 'functional consultant'],
    skills: ['Requirements Gathering', 'BRD/FRD', 'UML', 'SQL', 'Stakeholder Management', 'Agile'],
    relatedRoleSlugs: ['product-manager', 'data-analyst', 'scrum-master'],
    description: 'Bridge business objectives and engineering implementations through rigorous specifications.'
  },
  {
    slug: 'scrum-master',
    title: 'Scrum Master',
    category: 'Product & Design',
    synonyms: ['agile coach', 'delivery manager', 'agile project manager'],
    skills: ['Scrum Framework', 'Sprint Planning', 'Jira', 'Kanban', 'Team Facilitation', 'Continuous Improvement'],
    relatedRoleSlugs: ['product-manager', 'project-manager'],
    description: 'Facilitate agile sprint cadence, eliminate team bottlenecks, and foster engineering velocity.'
  },
  {
    slug: 'project-manager',
    title: 'Technical Project Manager',
    category: 'Product & Design',
    synonyms: ['it project manager', 'program manager', 'pmp'],
    skills: ['Project Governance', 'Risk Management', 'Resource Allocation', 'Budgeting', 'PMP', 'MS Project'],
    relatedRoleSlugs: ['product-manager', 'scrum-master'],
    description: 'Plan, budget, and oversee complex technology initiatives to achieve on-time milestones.'
  },
  {
    slug: 'technical-writer',
    title: 'Technical Writer',
    category: 'Product & Design',
    synonyms: ['documentation specialist', 'api documenter', 'content designer'],
    skills: ['API Documentation', 'Markdown', 'GitBook', 'Technical Communication', 'Swagger/OpenAPI'],
    relatedRoleSlugs: ['product-manager', 'software-engineer'],
    description: 'Author developer guides, API specifications, and clear software documentation.'
  },
  {
    slug: 'graphic-designer',
    title: 'Graphic Designer',
    category: 'Product & Design',
    synonyms: ['visual designer', 'brand designer', 'creative designer'],
    skills: ['Adobe Photoshop', 'Illustrator', 'Branding', 'Typography', 'Figma', 'Visual Identity'],
    relatedRoleSlugs: ['ui-ux-designer', 'digital-marketing-specialist'],
    description: 'Create brand identity assets, marketing collateral, and compelling digital graphics.'
  },

  // ── Marketing & Growth (8 roles) ──
  {
    slug: 'digital-marketing-specialist',
    title: 'Digital Marketing Specialist',
    category: 'Marketing & Growth',
    synonyms: ['digital marketing executive', 'performance marketer', 'growth marketer'],
    skills: ['SEO', 'SEM', 'Google Ads', 'Meta Ads', 'Email Marketing', 'Analytics', 'Conversion Optimization'],
    relatedRoleSlugs: ['seo-specialist', 'content-marketer', 'social-media-manager'],
    description: 'Execute multi-channel digital campaigns to acquire, engage, and retain active customers.'
  },
  {
    slug: 'seo-specialist',
    title: 'SEO Specialist',
    category: 'Marketing & Growth',
    synonyms: ['search engine optimization specialist', 'technical seo analyst', 'organic growth manager'],
    skills: ['Technical SEO', 'Keyword Research', 'Search Console', 'Ahrefs/Semrush', 'On-Page SEO', 'Link Building'],
    relatedRoleSlugs: ['digital-marketing-specialist', 'content-marketer'],
    description: 'Drive high-intent organic traffic, optimize site crawlability, and boost search rankings.'
  },
  {
    slug: 'content-marketer',
    title: 'Content Marketer',
    category: 'Marketing & Growth',
    synonyms: ['content writer', 'content strategist', 'copywriter'],
    skills: ['Copywriting', 'Content Strategy', 'SEO Writing', 'Blogging', 'Storytelling', 'Editing'],
    relatedRoleSlugs: ['digital-marketing-specialist', 'seo-specialist', 'social-media-manager'],
    description: 'Produce high-converting blog posts, whitepapers, landing page copy, and case studies.'
  },
  {
    slug: 'social-media-manager',
    title: 'Social Media Manager',
    category: 'Marketing & Growth',
    synonyms: ['social media specialist', 'community manager'],
    skills: ['Social Media Strategy', 'LinkedIn Growth', 'Instagram/Twitter Marketing', 'Community Engagement', 'Canva'],
    relatedRoleSlugs: ['digital-marketing-specialist', 'content-marketer'],
    description: 'Build brand affinity and drive social engagement across major professional and social networks.'
  },
  {
    slug: 'performance-marketing-manager',
    title: 'Performance Marketing Manager',
    category: 'Marketing & Growth',
    synonyms: ['paid ads specialist', 'ppc manager', 'growth lead'],
    skills: ['Google Ads', 'Facebook Ads', 'ROAS Optimization', 'CAC/LTV Analysis', 'A/B Testing'],
    relatedRoleSlugs: ['digital-marketing-specialist', 'growth-hacker'],
    description: 'Manage paid acquisition budgets, optimize return on ad spend, and scale user funnels.'
  },
  {
    slug: 'growth-hacker',
    title: 'Growth Hacker',
    category: 'Marketing & Growth',
    synonyms: ['growth engineer', 'growth marketing lead'],
    skills: ['Viral Loops', 'Funnel Optimization', 'Product Analytics', 'Data Scraping', 'Rapid Experimentation'],
    relatedRoleSlugs: ['performance-marketing-manager', 'product-manager'],
    description: 'Deploy rapid growth experiments and automation workflows to accelerate viral user acquisition.'
  },
  {
    slug: 'email-marketing-specialist',
    title: 'Email Marketing Specialist',
    category: 'Marketing & Growth',
    synonyms: ['crm marketing executive', 'retention marketer'],
    skills: ['Klaviyo/Mailchimp', 'Email Automation', 'Drip Campaigns', 'Deliverability', 'Segmentation'],
    relatedRoleSlugs: ['digital-marketing-specialist', 'content-marketer'],
    description: 'Design automated lifecycle drip emails, newsletters, and win-back retention sequences.'
  },
  {
    slug: 'brand-manager',
    title: 'Brand Manager',
    category: 'Marketing & Growth',
    synonyms: ['brand marketing manager', 'marketing manager'],
    skills: ['Brand Architecture', 'Market Positioning', 'PR Campaigns', 'Consumer Research', 'Media Buying'],
    relatedRoleSlugs: ['digital-marketing-specialist', 'product-manager'],
    description: 'Establish enterprise brand presence, positioning, and global corporate reputation.'
  },

  // ── Sales & Business (6 roles) ──
  {
    slug: 'business-development-executive',
    title: 'Business Development Executive',
    category: 'Sales & Business',
    synonyms: ['bde', 'sales executive', 'inside sales specialist'],
    skills: ['Lead Generation', 'Cold Calling', 'Sales Pipeline', 'Client Presentations', 'CRM (HubSpot/Salesforce)'],
    relatedRoleSlugs: ['account-executive', 'sales-manager'],
    description: 'Identify commercial opportunities, pitch value propositions, and generate qualified sales pipelines.'
  },
  {
    slug: 'account-executive',
    title: 'Account Executive',
    category: 'Sales & Business',
    synonyms: ['enterprise sales executive', 'saas sales rep', 'closer'],
    skills: ['Solution Selling', 'Contract Negotiation', 'Enterprise Pitching', 'Deal Closing', 'Quota Attainment'],
    relatedRoleSlugs: ['business-development-executive', 'customer-success-manager'],
    description: 'Close enterprise software contracts, manage high-value deals, and exceed revenue targets.'
  },
  {
    slug: 'customer-success-manager',
    title: 'Customer Success Manager',
    category: 'Sales & Business',
    synonyms: ['csm', 'client relationship manager', 'account manager'],
    skills: ['Client Onboarding', 'Churn Reduction', 'Upselling', 'Stakeholder Management', 'Customer Retention'],
    relatedRoleSlugs: ['account-executive', 'business-development-executive'],
    description: 'Guide customers to realized value, maximize software adoption, and eliminate churn.'
  },
  {
    slug: 'sales-manager',
    title: 'Sales Manager',
    category: 'Sales & Business',
    synonyms: ['regional sales manager', 'head of sales'],
    skills: ['Sales Leadership', 'Pipeline Forecasting', 'Revenue Strategy', 'Team Coaching', 'Territory Planning'],
    relatedRoleSlugs: ['business-development-executive', 'account-executive'],
    description: 'Lead sales personnel, establish territory revenue quotas, and execute commercial strategy.'
  },
  {
    slug: 'partnership-manager',
    title: 'Partnership Manager',
    category: 'Sales & Business',
    synonyms: ['alliances manager', 'channel partner manager'],
    skills: ['Strategic Alliances', 'Channel Sales', 'Ecosystem Growth', 'Contracting', 'Co-Marketing'],
    relatedRoleSlugs: ['business-development-executive', 'sales-manager'],
    description: 'Form strategic channel partnerships and vendor alliances to expand market distribution.'
  },
  {
    slug: 'recruiter',
    title: 'Talent Acquisition Specialist',
    category: 'Sales & Business',
    synonyms: ['technical recruiter', 'hr recruiter', 'talent sourcer'],
    skills: ['Candidate Sourcing', 'Technical Screening', 'LinkedIn Recruiter', 'ATS Tools', 'Offer Negotiation'],
    relatedRoleSlugs: ['hr-specialist', 'business-development-executive'],
    description: 'Source, screen, and recruit high-caliber engineering and executive talent for growing teams.'
  },

  // ── Operations & Finance (5 roles) ──
  {
    slug: 'hr-specialist',
    title: 'HR Specialist',
    category: 'Operations & Finance',
    synonyms: ['human resources executive', 'hr generalist', 'people operations specialist'],
    skills: ['Employee Relations', 'HR Policies', 'Payroll Management', 'Onboarding', 'Labor Laws', 'Performance Reviews'],
    relatedRoleSlugs: ['recruiter', 'operations-manager'],
    description: 'Oversee employee lifecycle operations, workplace culture, and statutory HR compliance.'
  },
  {
    slug: 'operations-manager',
    title: 'Operations Manager',
    category: 'Operations & Finance',
    synonyms: ['business operations manager', 'coo executive', 'process manager'],
    skills: ['Process Optimization', 'Vendor Management', 'Cost Control', 'SLA Management', 'Cross-Functional Leadership'],
    relatedRoleSlugs: ['project-manager', 'hr-specialist'],
    description: 'Streamline day-to-day organizational workflows, manage vendor SLAs, and maximize efficiency.'
  },
  {
    slug: 'financial-analyst',
    title: 'Financial Analyst',
    category: 'Operations & Finance',
    synonyms: ['finance executive', 'fp&a analyst', 'investment analyst'],
    skills: ['Financial Modeling', 'Budgeting & Forecasting', 'Excel/VBA', 'P&L Analysis', 'Variance Analysis'],
    relatedRoleSlugs: ['accountant', 'business-analyst'],
    description: 'Model fiscal projections, track company cash flow, and guide investment allocations.'
  },
  {
    slug: 'accountant',
    title: 'Chartered Accountant / Senior Accountant',
    category: 'Operations & Finance',
    synonyms: ['general accountant', 'tax consultant', 'audit executive'],
    skills: ['Tally', 'GST Compliance', 'Taxation', 'Financial Auditing', 'Statutory Reporting', 'Balance Sheets'],
    relatedRoleSlugs: ['financial-analyst', 'operations-manager'],
    description: 'Manage balance sheets, tax filings, statutory compliance, and corporate bookkeeping.'
  },
  {
    slug: 'supply-chain-specialist',
    title: 'Supply Chain Specialist',
    category: 'Operations & Finance',
    synonyms: ['logistics manager', 'procurement specialist', 'inventory analyst'],
    skills: ['Procurement', 'Inventory Management', 'Vendor Negotiation', 'Logistics Planning', 'ERP Systems'],
    relatedRoleSlugs: ['operations-manager', 'project-manager'],
    description: 'Optimize product procurement, warehouse logistics, and global vendor supply chains.'
  }
];

export const TOTAL_ROLES_COUNT = JOB_ROLES.length;

const ROLE_SLUG_MAP = new Map<string, JobRoleConfig>();
const ROLE_SYNONYM_MAP = new Map<string, JobRoleConfig>();

for (const r of JOB_ROLES) {
  ROLE_SLUG_MAP.set(r.slug, r);
  ROLE_SLUG_MAP.set(r.title.toLowerCase(), r);
  for (const s of r.synonyms) {
    ROLE_SYNONYM_MAP.set(s.toLowerCase(), r);
  }
}

export function getRoleBySlug(slug: string): JobRoleConfig | undefined {
  if (!slug) return undefined;
  const clean = slug.toLowerCase().trim();
  return ROLE_SLUG_MAP.get(clean) || ROLE_SYNONYM_MAP.get(clean);
}

export function getRelatedRoles(role: JobRoleConfig): JobRoleConfig[] {
  return role.relatedRoleSlugs
    .map(s => ROLE_SLUG_MAP.get(s))
    .filter((r): r is JobRoleConfig => Boolean(r));
}
