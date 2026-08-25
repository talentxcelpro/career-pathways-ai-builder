// src/lib/seo/keywordTaxonomy.ts
// Central Semantic Keyword Taxonomy for TalentXcel (12 Strategic Intent Clusters)
// Complies 100% with Google Search Quality Standards (Zero stuffing, Zero fabricated metrics).

export type SearchIntentType =
  | 'brand'
  | 'commercial'
  | 'transactional'
  | 'informational'
  | 'navigational'
  | 'job-search'
  | 'employer'
  | 'education'
  | 'career'
  | 'comparison';

export type KeywordClusterId =
  | 'CLUSTER_A_BRAND_ENTITY'
  | 'CLUSTER_B_RECRUITMENT'
  | 'CLUSTER_C_STAFFING'
  | 'CLUSTER_D_RPO'
  | 'CLUSTER_E_AI_RECRUITMENT'
  | 'CLUSTER_F_CAREER_SERVICES'
  | 'CLUSTER_G_RESUME_ATS'
  | 'CLUSTER_H_JOB_SEARCH'
  | 'CLUSTER_I_EDUCATION'
  | 'CLUSTER_J_LEARNING_SKILLS'
  | 'CLUSTER_K_EMPLOYER_B2B'
  | 'CLUSTER_L_TECHNOLOGY_IT';

export interface KeywordTaxonomyNode {
  keyword: string;
  clusterId: KeywordClusterId;
  clusterName: string;
  primaryIntent: SearchIntentType;
  secondaryIntent?: SearchIntentType;
  targetRoute: string;
  parentHub: string;
  conversionGoal: 'JOB_APPLY' | 'EMPLOYER_LEAD' | 'RESUME_CREATE' | 'CAREER_PATHWAY' | 'NEWSLETTER' | 'BRAND_ENGAGEMENT';
  priority: 1 | 2 | 3;
  semanticVariants: string[];
}

export const TALENTXCEL_KEYWORD_TAXONOMY: KeywordTaxonomyNode[] = [
  // =========================================================================
  // CLUSTER A: TALENTXCEL BRAND & ENTITY
  // =========================================================================
  {
    keyword: 'TalentXcel',
    clusterId: 'CLUSTER_A_BRAND_ENTITY',
    clusterName: 'TalentXcel Brand & Entity',
    primaryIntent: 'brand',
    secondaryIntent: 'navigational',
    targetRoute: '/company/talentxcel',
    parentHub: '/',
    conversionGoal: 'BRAND_ENGAGEMENT',
    priority: 1,
    semanticVariants: ['TalentXcel Services', 'TalentXcel India', 'TalentXcel company profile', 'TalentXcel Noida headquarters'],
  },
  {
    keyword: 'TalentXcel careers and jobs',
    clusterId: 'CLUSTER_A_BRAND_ENTITY',
    clusterName: 'TalentXcel Brand & Entity',
    primaryIntent: 'job-search',
    secondaryIntent: 'brand',
    targetRoute: '/jobs',
    parentHub: '/company/talentxcel',
    conversionGoal: 'JOB_APPLY',
    priority: 1,
    semanticVariants: ['careers at TalentXcel', 'TalentXcel job openings', 'TalentXcel recruitment platform'],
  },

  // =========================================================================
  // CLUSTER B: RECRUITMENT SERVICES
  // =========================================================================
  {
    keyword: 'recruitment services India',
    clusterId: 'CLUSTER_B_RECRUITMENT',
    clusterName: 'Recruitment Solutions',
    primaryIntent: 'commercial',
    secondaryIntent: 'employer',
    targetRoute: '/services/staffing-recruitment',
    parentHub: '/topics/recruitment',
    conversionGoal: 'EMPLOYER_LEAD',
    priority: 1,
    semanticVariants: ['professional recruitment agency', 'talent recruitment firm', 'corporate hiring consultants', 'employee recruitment company'],
  },
  {
    keyword: 'recruitment topics and guides',
    clusterId: 'CLUSTER_B_RECRUITMENT',
    clusterName: 'Recruitment Solutions',
    primaryIntent: 'informational',
    secondaryIntent: 'commercial',
    targetRoute: '/topics/recruitment',
    parentHub: '/company/talentxcel',
    conversionGoal: 'EMPLOYER_LEAD',
    priority: 1,
    semanticVariants: ['talent acquisition strategies', 'modern recruiting best practices', 'hiring process optimization'],
  },

  // =========================================================================
  // CLUSTER C: STAFFING & WORKFORCE SOLUTIONS
  // =========================================================================
  {
    keyword: 'corporate staffing solutions',
    clusterId: 'CLUSTER_C_STAFFING',
    clusterName: 'Staffing Solutions',
    primaryIntent: 'commercial',
    secondaryIntent: 'employer',
    targetRoute: '/services/staffing-recruitment',
    parentHub: '/topics/recruitment',
    conversionGoal: 'EMPLOYER_LEAD',
    priority: 1,
    semanticVariants: ['IT staffing company India', 'contract staffing services', 'staff augmentation agency', 'temporary workforce solutions'],
  },

  // =========================================================================
  // CLUSTER D: RPO (RECRUITMENT PROCESS OUTSOURCING)
  // =========================================================================
  {
    keyword: 'recruitment process outsourcing services',
    clusterId: 'CLUSTER_D_RPO',
    clusterName: 'RPO Solutions',
    primaryIntent: 'commercial',
    secondaryIntent: 'employer',
    targetRoute: '/services/rpo',
    parentHub: '/topics/recruitment',
    conversionGoal: 'EMPLOYER_LEAD',
    priority: 1,
    semanticVariants: ['RPO company India', 'enterprise recruitment outsourcing', 'outsourced talent acquisition team', 'RPO hiring solutions'],
  },

  // =========================================================================
  // CLUSTER E: AI RECRUITMENT & TALENT MATCHING
  // =========================================================================
  {
    keyword: 'AI recruitment platform',
    clusterId: 'CLUSTER_E_AI_RECRUITMENT',
    clusterName: 'AI Recruitment',
    primaryIntent: 'commercial',
    secondaryIntent: 'employer',
    targetRoute: '/services/ai-recruitment',
    parentHub: '/topics/artificial-intelligence',
    conversionGoal: 'EMPLOYER_LEAD',
    priority: 1,
    semanticVariants: ['AI-powered hiring software', 'algorithmic talent matching', 'automated candidate screening tool', 'AI recruiting solutions India'],
  },
  {
    keyword: 'artificial intelligence career topic hub',
    clusterId: 'CLUSTER_E_AI_RECRUITMENT',
    clusterName: 'AI Recruitment',
    primaryIntent: 'informational',
    secondaryIntent: 'career',
    targetRoute: '/topics/artificial-intelligence',
    parentHub: '/company/talentxcel',
    conversionGoal: 'BRAND_ENGAGEMENT',
    priority: 1,
    semanticVariants: ['AI engineering careers', 'machine learning roles overview', 'future of AI workforce'],
  },

  // =========================================================================
  // CLUSTER F: CAREER SERVICES & COACHING
  // =========================================================================
  {
    keyword: 'professional career services',
    clusterId: 'CLUSTER_F_CAREER_SERVICES',
    clusterName: 'Career Services',
    primaryIntent: 'career',
    secondaryIntent: 'commercial',
    targetRoute: '/services/career-services',
    parentHub: '/topics/careers',
    conversionGoal: 'RESUME_CREATE',
    priority: 1,
    semanticVariants: ['executive career coaching', 'career transition guidance', 'salary negotiation consulting', 'career planning roadmap'],
  },
  {
    keyword: 'career growth and progression hub',
    clusterId: 'CLUSTER_F_CAREER_SERVICES',
    clusterName: 'Career Services',
    primaryIntent: 'informational',
    secondaryIntent: 'career',
    targetRoute: '/topics/careers',
    parentHub: '/company/talentxcel',
    conversionGoal: 'JOB_APPLY',
    priority: 1,
    semanticVariants: ['career roadmap tools', 'professional development strategies', 'career milestone planning'],
  },

  // =========================================================================
  // CLUSTER G: RESUME & ATS INTELLIGENCE
  // =========================================================================
  {
    keyword: 'ATS resume builder',
    clusterId: 'CLUSTER_G_RESUME_ATS',
    clusterName: 'Resume & ATS Tools',
    primaryIntent: 'transactional',
    secondaryIntent: 'career',
    targetRoute: '/services/resume-building',
    parentHub: '/topics/resume-writing',
    conversionGoal: 'RESUME_CREATE',
    priority: 1,
    semanticVariants: ['free ATS resume maker', 'ATS compliant resume checker', 'resume optimization studio', 'cover letter builder'],
  },
  {
    keyword: 'ATS friendly resume writing guide',
    clusterId: 'CLUSTER_G_RESUME_ATS',
    clusterName: 'Resume & ATS Tools',
    primaryIntent: 'informational',
    secondaryIntent: 'career',
    targetRoute: '/resources/how-to-write-an-ats-friendly-resume-in-2026-complete-step-by-step-guide',
    parentHub: '/topics/resume-writing',
    conversionGoal: 'RESUME_CREATE',
    priority: 1,
    semanticVariants: ['how to pass applicant tracking systems', 'ATS resume formatting rules', 'resume keyword matching techniques'],
  },

  // =========================================================================
  // CLUSTER H: JOB SEARCH & VACANCIES
  // =========================================================================
  {
    keyword: 'verified jobs in Noida',
    clusterId: 'CLUSTER_H_JOB_SEARCH',
    clusterName: 'Job Search',
    primaryIntent: 'job-search',
    secondaryIntent: 'transactional',
    targetRoute: '/jobs',
    parentHub: '/company/talentxcel',
    conversionGoal: 'JOB_APPLY',
    priority: 1,
    semanticVariants: ['marketing jobs Noida', 'content writer openings', 'B2B sales executive jobs', 'customer service vacancies'],
  },
  {
    keyword: 'job search strategy and preparation',
    clusterId: 'CLUSTER_H_JOB_SEARCH',
    clusterName: 'Job Search',
    primaryIntent: 'informational',
    secondaryIntent: 'job-search',
    targetRoute: '/topics/job-search',
    parentHub: '/company/talentxcel',
    conversionGoal: 'JOB_APPLY',
    priority: 1,
    semanticVariants: ['how to find tech jobs', 'job application strategies', 'hidden job market tactics'],
  },

  // =========================================================================
  // CLUSTER I: HIGHER EDUCATION & CAREER PATHWAYS
  // =========================================================================
  {
    keyword: 'top engineering and MBA colleges India',
    clusterId: 'CLUSTER_I_EDUCATION',
    clusterName: 'Higher Education',
    primaryIntent: 'education',
    secondaryIntent: 'informational',
    targetRoute: '/colleges',
    parentHub: '/topics/education',
    conversionGoal: 'CAREER_PATHWAY',
    priority: 1,
    semanticVariants: ['best colleges in India', 'NIRF college rankings', 'college placement CTC benchmarks', 'college admission eligibility'],
  },
  {
    keyword: '6-step AI career pathway generator',
    clusterId: 'CLUSTER_I_EDUCATION',
    clusterName: 'Higher Education',
    primaryIntent: 'education',
    secondaryIntent: 'career',
    targetRoute: '/colleges/pathway',
    parentHub: '/topics/education',
    conversionGoal: 'CAREER_PATHWAY',
    priority: 1,
    semanticVariants: ['zero budget education finder', 'education to career roadmap', 'customized student pathway builder'],
  },
  {
    keyword: 'tuition free global masters and scholarships',
    clusterId: 'CLUSTER_I_EDUCATION',
    clusterName: 'Higher Education',
    primaryIntent: 'education',
    secondaryIntent: 'informational',
    targetRoute: '/colleges/global-programs',
    parentHub: '/topics/education',
    conversionGoal: 'CAREER_PATHWAY',
    priority: 1,
    semanticVariants: ['study abroad scholarships', 'fully funded degree programs Europe', 'international student grants'],
  },

  // =========================================================================
  // CLUSTER J: LEARNING & SKILL DEVELOPMENT
  // =========================================================================
  {
    keyword: 'online learning and verified skills',
    clusterId: 'CLUSTER_J_LEARNING_SKILLS',
    clusterName: 'Learning & Skills',
    primaryIntent: 'education',
    secondaryIntent: 'career',
    targetRoute: '/learning',
    parentHub: '/topics/education',
    conversionGoal: 'CAREER_PATHWAY',
    priority: 2,
    semanticVariants: ['professional skill verification', 'in-demand technical skills', 'career certification courses'],
  },

  // =========================================================================
  // CLUSTER K: EMPLOYER & B2B RECRUITMENT
  // =========================================================================
  {
    keyword: 'hire pre-screened talent for employers',
    clusterId: 'CLUSTER_K_EMPLOYER_B2B',
    clusterName: 'Employer Solutions',
    primaryIntent: 'employer',
    secondaryIntent: 'commercial',
    targetRoute: '/employer',
    parentHub: '/company/talentxcel',
    conversionGoal: 'EMPLOYER_LEAD',
    priority: 1,
    semanticVariants: ['hire employees India', 'post a job for recruiters', 'bulk hiring for startups', 'candidate talent pipeline'],
  },

  // =========================================================================
  // CLUSTER L: TECHNOLOGY & IT SERVICES
  // =========================================================================
  {
    keyword: 'IT systems consulting and software engineering',
    clusterId: 'CLUSTER_L_TECHNOLOGY_IT',
    clusterName: 'Technology & IT Services',
    primaryIntent: 'commercial',
    secondaryIntent: 'employer',
    targetRoute: '/services/it-services',
    parentHub: '/topics/technology',
    conversionGoal: 'EMPLOYER_LEAD',
    priority: 1,
    semanticVariants: ['dedicated software development team', 'enterprise cloud architecture consulting', 'tech staff augmentation'],
  },
];

export const KEYWORD_TAXONOMY = TALENTXCEL_KEYWORD_TAXONOMY;
