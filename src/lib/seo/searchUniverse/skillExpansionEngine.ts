// src/lib/seo/searchUniverse/skillExpansionEngine.ts
// Authentic Skill Taxonomy & Semantic Relationships

export interface SkillNode {
  name: string;
  category: 'PROGRAMMING' | 'FRAMEWORK' | 'DATABASE' | 'CLOUD_DEVOPS' | 'AI_ML' | 'DESIGN' | 'MARKETING_SALES' | 'MANAGEMENT';
  relatedRoles: string[];
}

export const CANONICAL_SKILLS: SkillNode[] = [
  // Programming & Frameworks
  { name: 'Python', category: 'PROGRAMMING', relatedRoles: ['software engineer', 'data scientist', 'AI engineer'] },
  { name: 'Java', category: 'PROGRAMMING', relatedRoles: ['software engineer', 'backend developer', 'SDET'] },
  { name: 'JavaScript', category: 'PROGRAMMING', relatedRoles: ['frontend developer', 'full stack developer'] },
  { name: 'TypeScript', category: 'PROGRAMMING', relatedRoles: ['frontend developer', 'full stack developer'] },
  { name: 'React', category: 'FRAMEWORK', relatedRoles: ['frontend developer', 'full stack developer'] },
  { name: 'Node.js', category: 'FRAMEWORK', relatedRoles: ['backend developer', 'full stack developer'] },
  { name: 'Next.js', category: 'FRAMEWORK', relatedRoles: ['frontend developer', 'full stack developer'] },
  { name: 'Spring Boot', category: 'FRAMEWORK', relatedRoles: ['backend developer', 'software engineer'] },
  { name: 'Django', category: 'FRAMEWORK', relatedRoles: ['backend developer', 'Python developer'] },
  { name: 'FastAPI', category: 'FRAMEWORK', relatedRoles: ['backend developer', 'AI engineer'] },

  // Cloud & DevOps
  { name: 'AWS', category: 'CLOUD_DEVOPS', relatedRoles: ['cloud architect', 'DevOps engineer', 'backend developer'] },
  { name: 'Azure', category: 'CLOUD_DEVOPS', relatedRoles: ['cloud architect', 'DevOps engineer'] },
  { name: 'GCP', category: 'CLOUD_DEVOPS', relatedRoles: ['cloud architect', 'data engineer'] },
  { name: 'Docker', category: 'CLOUD_DEVOPS', relatedRoles: ['DevOps engineer', 'software engineer'] },
  { name: 'Kubernetes', category: 'CLOUD_DEVOPS', relatedRoles: ['DevOps engineer', 'cloud architect'] },
  { name: 'Terraform', category: 'CLOUD_DEVOPS', relatedRoles: ['DevOps engineer', 'cloud architect'] },

  // AI & Data
  { name: 'Machine Learning', category: 'AI_ML', relatedRoles: ['machine learning engineer', 'data scientist'] },
  { name: 'Deep Learning', category: 'AI_ML', relatedRoles: ['AI engineer', 'machine learning engineer'] },
  { name: 'PyTorch', category: 'AI_ML', relatedRoles: ['AI engineer', 'AI researcher'] },
  { name: 'TensorFlow', category: 'AI_ML', relatedRoles: ['machine learning engineer', 'AI engineer'] },
  { name: 'LLM', category: 'AI_ML', relatedRoles: ['AI engineer', 'AI prompt engineer'] },
  { name: 'LangChain', category: 'AI_ML', relatedRoles: ['AI engineer', 'AI prompt engineer'] },
  { name: 'SQL', category: 'DATABASE', relatedRoles: ['data analyst', 'data engineer', 'backend developer'] },
  { name: 'PostgreSQL', category: 'DATABASE', relatedRoles: ['backend developer', 'full stack developer'] },
  { name: 'PowerBI', category: 'AI_ML', relatedRoles: ['data analyst', 'business analyst'] },
  { name: 'Tableau', category: 'AI_ML', relatedRoles: ['data analyst', 'business analyst'] },

  // Design, Sales & Recruiting
  { name: 'Figma', category: 'DESIGN', relatedRoles: ['UI UX designer', 'product designer'] },
  { name: 'SEO', category: 'MARKETING_SALES', relatedRoles: ['content writer', 'growth marketer'] },
  { name: 'B2B Sales', category: 'MARKETING_SALES', relatedRoles: ['B2B sales executive'] },
  { name: 'Talent Acquisition', category: 'MANAGEMENT', relatedRoles: ['technical recruiter', 'talent acquisition specialist'] },
];

export const ALL_SKILLS_NAMES = CANONICAL_SKILLS.map((s) => s.name);
