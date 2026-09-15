import { TaxonomyNode } from '@/types/learningAggregator';

export const ENORMOUS_LEARNING_TAXONOMY: TaxonomyNode[] = [
  // 1. TECHNOLOGY -> DATA
  {
    industry: 'Technology',
    domain: 'Data Science & Analytics',
    subject: 'Data Management',
    category: 'SQL Databases',
    skill: 'SQL',
    sub_skills: ['Joins', 'Aggregation', 'Window Functions', 'Subqueries', 'Indexing', 'Stored Procedures'],
    career_paths: ['Data Analyst', 'Business Intelligence Specialist', 'Database Administrator', 'Data Engineer']
  },
  {
    industry: 'Technology',
    domain: 'Data Science & Analytics',
    subject: 'Business Intelligence',
    category: 'BI Dashboarding',
    skill: 'Power BI',
    sub_skills: ['DAX Expressions', 'Power Query', 'Data Modeling', 'Row-Level Security', 'Report Design'],
    career_paths: ['Data Analyst', 'BI Specialist', 'Reporting Analyst']
  },

  // 2. TECHNOLOGY -> ARTIFICIAL INTELLIGENCE
  {
    industry: 'Technology',
    domain: 'AI & Generative AI',
    subject: 'Machine Learning',
    category: 'Deep Learning',
    skill: 'Neural Networks',
    sub_skills: ['Transformers', 'LLMs', 'Prompt Engineering', 'PyTorch', 'TensorFlow', 'Model Fine-tuning'],
    career_paths: ['AI Engineer', 'Machine Learning Engineer', 'AI Research Scientist', 'Prompt Engineer']
  },

  // 3. TECHNOLOGY -> PROGRAMMING & SOFTWARE
  {
    industry: 'Technology',
    domain: 'Programming & Software',
    subject: 'Software Engineering',
    category: 'Python Development',
    skill: 'Python',
    sub_skills: ['Control Flow', 'Object-Oriented Programming', 'Pandas', 'NumPy', 'FastAPI', 'Data Structures'],
    career_paths: ['Software Developer', 'Backend Engineer', 'Python Developer', 'Data Scientist']
  },

  // 4. TECHNOLOGY -> CYBERSECURITY
  {
    industry: 'Technology',
    domain: 'Cybersecurity & Networking',
    subject: 'Network Security',
    category: 'Threat Defense',
    skill: 'Cybersecurity',
    sub_skills: ['Firewalls', 'Malware Analysis', 'Penetration Testing', 'Cryptography', 'SOC Operations'],
    career_paths: ['Cybersecurity Analyst', 'SOC Analyst', 'Ethical Hacker', 'Network Security Engineer']
  },

  // 5. BUSINESS & MANAGEMENT -> HR & RECRUITMENT
  {
    industry: 'Business & Management',
    domain: 'HR & Recruitment',
    subject: 'People Analytics',
    category: 'HR Analytics',
    skill: 'HR Data Analytics',
    sub_skills: ['Attrition Modeling', 'Workforce Planning', 'Recruitment Metrics', 'Excel Analytics', 'HR Dashboarding'],
    career_paths: ['HR Analyst', 'People Analytics Manager', 'HR Operations Lead', 'Recruitment Specialist']
  },

  // 6. BUSINESS & MANAGEMENT -> FINANCE & ACCOUNTING
  {
    industry: 'Business & Management',
    domain: 'Finance & Accounting',
    subject: 'Financial Modeling',
    category: 'Corporate Finance',
    skill: 'Financial Analysis',
    sub_skills: ['DCF Valuation', 'Budgeting', 'Financial Statements', 'Excel Modeling', 'Risk Assessment'],
    career_paths: ['Financial Analyst', 'Investment Banker', 'Corporate Finance Manager', 'Accountant']
  },

  // 7. HEALTHCARE & LIFE SCIENCES
  {
    industry: 'Healthcare & Life Sciences',
    domain: 'Healthcare & Life Sciences',
    subject: 'Health Informatics',
    category: 'Medical Data',
    skill: 'Healthcare Data Analytics',
    sub_skills: ['EHR Systems', 'Epidemiology Modeling', 'Clinical Data Analysis', 'HIPAA Compliance'],
    career_paths: ['Health Data Analyst', 'Clinical Informatics Specialist', 'Public Health Analyst']
  },

  // 8. SOCIAL SCIENCES & HUMANITIES
  {
    industry: 'Humanities & Social Sciences',
    domain: 'Social Sciences & Humanities',
    subject: 'Behavioral Sciences',
    category: 'Psychology',
    skill: 'Cognitive Psychology',
    sub_skills: ['Behavioral Economics', 'Decision Making', 'Consumer Psychology', 'User Research'],
    career_paths: ['UX Researcher', 'Behavioral Analyst', 'Marketing Strategist']
  }
];

export const DOMAIN_TARGETS = [
  { domain: 'AI & Generative AI', target: 150, count: 165 },
  { domain: 'Data Science & Analytics', target: 200, count: 215 },
  { domain: 'Programming & Software', target: 350, count: 380 },
  { domain: 'Web Development', target: 200, count: 210 },
  { domain: 'Cloud & DevOps', target: 180, count: 195 },
  { domain: 'Cybersecurity & Networking', target: 180, count: 185 },
  { domain: 'Business & Management', target: 200, count: 220 },
  { domain: 'Finance & Accounting', target: 120, count: 135 },
  { domain: 'Marketing & Sales', target: 180, count: 190 },
  { domain: 'HR & Recruitment', target: 100, count: 110 },
  { domain: 'Product & Project Management', target: 120, count: 130 },
  { domain: 'Design & UI/UX', target: 120, count: 125 },
  { domain: 'Communication & Languages', target: 120, count: 130 },
  { domain: 'Healthcare & Life Sciences', target: 100, count: 105 },
  { domain: 'Education & Teaching', target: 80, count: 85 },
  { domain: 'Engineering & STEM', target: 150, count: 160 },
  { domain: 'Social Sciences & Humanities', target: 100, count: 110 },
  { domain: 'Career & Professional Skills', target: 100, count: 115 }
];
