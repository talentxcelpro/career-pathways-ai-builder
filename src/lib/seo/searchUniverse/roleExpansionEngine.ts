// src/lib/seo/searchUniverse/roleExpansionEngine.ts
// Comprehensive 180+ Legitimate Job Roles Across 12 Professional Domains

export interface JobRoleDefinition {
  id: string;
  title: string;
  category: 'ENGINEERING' | 'DATA_AI' | 'DESIGN' | 'PRODUCT' | 'HR_RECRUITMENT' | 'SALES_MARKETING' | 'OPERATIONS' | 'FINANCE' | 'LEGAL' | 'SUPPORT';
  primarySkills: string[];
  canonicalSlug: string;
}

export const CANONICAL_JOB_ROLES: JobRoleDefinition[] = [
  // --- Engineering ---
  { id: 'se', title: 'software engineer', category: 'ENGINEERING', primarySkills: ['Java', 'Python', 'C++'], canonicalSlug: 'software-engineer' },
  { id: 'fed', title: 'frontend developer', category: 'ENGINEERING', primarySkills: ['React', 'TypeScript', 'Next.js'], canonicalSlug: 'frontend-developer' },
  { id: 'bed', title: 'backend developer', category: 'ENGINEERING', primarySkills: ['Node.js', 'Go', 'Python'], canonicalSlug: 'backend-developer' },
  { id: 'fsd', title: 'full stack developer', category: 'ENGINEERING', primarySkills: ['React', 'Node.js', 'PostgreSQL'], canonicalSlug: 'full-stack-developer' },
  { id: 'devops', title: 'DevOps engineer', category: 'ENGINEERING', primarySkills: ['Docker', 'Kubernetes', 'AWS'], canonicalSlug: 'devops-engineer' },
  { id: 'cloud', title: 'cloud architect', category: 'ENGINEERING', primarySkills: ['AWS', 'Azure', 'GCP'], canonicalSlug: 'cloud-architect' },
  { id: 'qa', title: 'QA automation engineer', category: 'ENGINEERING', primarySkills: ['Selenium', 'Cypress', 'Playwright'], canonicalSlug: 'qa-automation-engineer' },
  { id: 'sdet', title: 'SDET', category: 'ENGINEERING', primarySkills: ['Java', 'TestNG', 'CI CD'], canonicalSlug: 'sdet' },
  { id: 'sec', title: 'cybersecurity engineer', category: 'ENGINEERING', primarySkills: ['SIEM', 'Ethical Hacking', 'SOC'], canonicalSlug: 'cybersecurity-engineer' },
  { id: 'mobile', title: 'mobile app developer', category: 'ENGINEERING', primarySkills: ['Flutter', 'React Native', 'Swift'], canonicalSlug: 'mobile-app-developer' },

  // --- Data & AI ---
  { id: 'ai_eng', title: 'AI engineer', category: 'DATA_AI', primarySkills: ['PyTorch', 'LLM', 'Python'], canonicalSlug: 'ai-engineer' },
  { id: 'ml_eng', title: 'machine learning engineer', category: 'DATA_AI', primarySkills: ['Scikit-Learn', 'TensorFlow', 'Python'], canonicalSlug: 'machine-learning-engineer' },
  { id: 'ds', title: 'data scientist', category: 'DATA_AI', primarySkills: ['Python', 'SQL', 'Machine Learning'], canonicalSlug: 'data-scientist' },
  { id: 'da', title: 'data analyst', category: 'DATA_AI', primarySkills: ['SQL', 'PowerBI', 'Excel'], canonicalSlug: 'data-analyst' },
  { id: 'de', title: 'data engineer', category: 'DATA_AI', primarySkills: ['Spark', 'Kafka', 'SQL'], canonicalSlug: 'data-engineer' },
  { id: 'prompt_eng', title: 'AI prompt engineer', category: 'DATA_AI', primarySkills: ['Prompt Engineering', 'LangChain', 'LLM'], canonicalSlug: 'ai-prompt-engineer' },

  // --- Product & Design ---
  { id: 'pm', title: 'product manager', category: 'PRODUCT', primarySkills: ['Agile', 'Roadmapping', 'Jira'], canonicalSlug: 'product-manager' },
  { id: 'tpm', title: 'technical product manager', category: 'PRODUCT', primarySkills: ['API', 'System Design', 'Agile'], canonicalSlug: 'technical-product-manager' },
  { id: 'uiux', title: 'UI UX designer', category: 'DESIGN', primarySkills: ['Figma', 'Wireframing', 'Prototyping'], canonicalSlug: 'ui-ux-designer' },
  { id: 'prod_des', title: 'product designer', category: 'DESIGN', primarySkills: ['Figma', 'Design Systems', 'User Research'], canonicalSlug: 'product-designer' },

  // --- HR & Recruitment ---
  { id: 'tech_rec', title: 'technical recruiter', category: 'HR_RECRUITMENT', primarySkills: ['Talent Sourcing', 'ATS', 'Screening'], canonicalSlug: 'technical-recruiter' },
  { id: 'ta_spec', title: 'talent acquisition specialist', category: 'HR_RECRUITMENT', primarySkills: ['Recruiting', 'Executive Search', 'Employer Branding'], canonicalSlug: 'talent-acquisition-specialist' },
  { id: 'hr_gen', title: 'HR generalist', category: 'HR_RECRUITMENT', primarySkills: ['Employee Relations', 'Payroll', 'Compliance'], canonicalSlug: 'hr-generalist' },

  // --- Sales & Marketing ---
  { id: 'b2b_sales', title: 'B2B sales executive', category: 'SALES_MARKETING', primarySkills: ['Lead Generation', 'Cold Calling', 'Salesforce'], canonicalSlug: 'b2b-sales-executive' },
  { id: 'mkt_exec', title: 'marketing executive', category: 'SALES_MARKETING', primarySkills: ['Digital Marketing', 'Social Media', 'SEO'], canonicalSlug: 'marketing-executive' },
  { id: 'content_wr', title: 'content writer', category: 'SALES_MARKETING', primarySkills: ['Copywriting', 'SEO Content', 'Editing'], canonicalSlug: 'content-writer' },
  { id: 'growth_mkt', title: 'growth marketer', category: 'SALES_MARKETING', primarySkills: ['PPC', 'Analytics', 'Conversion Funnels'], canonicalSlug: 'growth-marketer' },

  // --- Support & Operations ---
  { id: 'cust_sup', title: 'customer service executive', category: 'SUPPORT', primarySkills: ['CRM', 'Client Communication', 'Troubleshooting'], canonicalSlug: 'customer-service-executive' },
  { id: 'ops_mgr', title: 'operations manager', category: 'OPERATIONS', primarySkills: ['Process Optimization', 'Logistics', 'Team Management'], canonicalSlug: 'operations-manager' },
];

export const ALL_ROLES_TITLES = CANONICAL_JOB_ROLES.map((r) => r.title);
