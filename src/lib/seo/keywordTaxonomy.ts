// src/lib/seo/keywordTaxonomy.ts
// Structured Keyword Taxonomy & Search-Intent Architecture for TalentXcel
// Complies 100% with Google Search Quality Standards (Zero stuffing, Zero fabricated metrics).

export type SearchIntent =
  | 'INFORMATIONAL'
  | 'COMMERCIAL_INVESTIGATION'
  | 'TRANSACTIONAL'
  | 'NAVIGATIONAL'
  | 'JOB_SEARCH'
  | 'EDUCATIONAL'
  | 'EMPLOYER_INTENT';

export type PageType =
  | 'COMPANY_ENTITY'
  | 'COMMERCIAL_SERVICE'
  | 'TOPIC_HUB'
  | 'JOB_LISTING'
  | 'ROLE_LOCATION_HUB'
  | 'COLLEGE_PROFILE'
  | 'SCHOLARSHIP_DETAIL'
  | 'CAREER_TOOL'
  | 'PUBLIC_POST'
  | 'ARTICLE_GUIDE';

export interface KeywordConcept {
  keyword: string;
  cluster: string;
  intent: SearchIntent;
  entity: string;
  pageType: PageType;
  targetRoute: string;
  parentTopic: string;
  commercialLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  priority: 1 | 2 | 3 | 4;
  semanticVariants: string[];
}

export const KEYWORD_TAXONOMY: KeywordConcept[] = [
  // =========================================================================
  // LAYER 1: CORE COMMERCIAL (Employer & Enterprise Intent)
  // =========================================================================
  {
    keyword: 'AI recruitment platform',
    cluster: 'AI Recruitment',
    intent: 'COMMERCIAL_INVESTIGATION',
    entity: 'TalentXcel Services',
    pageType: 'COMMERCIAL_SERVICE',
    targetRoute: '/services/ai-recruitment',
    parentTopic: 'artificial-intelligence',
    commercialLevel: 'HIGH',
    priority: 1,
    semanticVariants: [
      'AI-powered talent matching',
      'algorithmic candidate screening',
      'AI hiring software India',
      'automated recruiter screening tools',
    ],
  },
  {
    keyword: 'corporate staffing services',
    cluster: 'Staffing & Recruitment',
    intent: 'TRANSACTIONAL',
    entity: 'TalentXcel Services',
    pageType: 'COMMERCIAL_SERVICE',
    targetRoute: '/services/staffing-recruitment',
    parentTopic: 'recruitment',
    commercialLevel: 'HIGH',
    priority: 1,
    semanticVariants: [
      'recruitment agency India',
      'contract staffing solutions',
      'permanent talent placement',
      'executive search firm',
    ],
  },
  {
    keyword: 'recruitment process outsourcing',
    cluster: 'RPO Solutions',
    intent: 'COMMERCIAL_INVESTIGATION',
    entity: 'TalentXcel Services',
    pageType: 'COMMERCIAL_SERVICE',
    targetRoute: '/services/rpo',
    parentTopic: 'recruitment',
    commercialLevel: 'HIGH',
    priority: 1,
    semanticVariants: [
      'RPO service provider India',
      'embedded talent acquisition team',
      'enterprise recruiting outsourcing',
      'managed hiring pipeline',
    ],
  },
  {
    keyword: 'IT systems consulting',
    cluster: 'Technology Consulting',
    intent: 'COMMERCIAL_INVESTIGATION',
    entity: 'TalentXcel Services',
    pageType: 'COMMERCIAL_SERVICE',
    targetRoute: '/services/it-services',
    parentTopic: 'technology',
    commercialLevel: 'HIGH',
    priority: 1,
    semanticVariants: [
      'IT staff augmentation',
      'software development consulting',
      'dedicated developer team India',
      'cloud migration engineering',
    ],
  },
  {
    keyword: 'AI enterprise solutions',
    cluster: 'AI Solutions',
    intent: 'COMMERCIAL_INVESTIGATION',
    entity: 'TalentXcel Services',
    pageType: 'COMMERCIAL_SERVICE',
    targetRoute: '/services/ai-solutions',
    parentTopic: 'artificial-intelligence',
    commercialLevel: 'HIGH',
    priority: 1,
    semanticVariants: [
      'workplace AI automation',
      'custom LLM agent development',
      'candidate parsing AI pipeline',
      'enterprise AI consulting',
    ],
  },
  {
    keyword: 'corporate training programs',
    cluster: 'Corporate Training',
    intent: 'COMMERCIAL_INVESTIGATION',
    entity: 'TalentXcel Services',
    pageType: 'COMMERCIAL_SERVICE',
    targetRoute: '/services/corporate-training',
    parentTopic: 'leadership',
    commercialLevel: 'HIGH',
    priority: 1,
    semanticVariants: [
      'executive leadership workshops',
      'technical workforce upskilling',
      'enterprise team coaching',
      'L&D training modules',
    ],
  },
  {
    keyword: 'career coaching services',
    cluster: 'Career Coaching',
    intent: 'COMMERCIAL_INVESTIGATION',
    entity: 'TalentXcel Services',
    pageType: 'COMMERCIAL_SERVICE',
    targetRoute: '/services/career-services',
    parentTopic: 'careers',
    commercialLevel: 'HIGH',
    priority: 1,
    semanticVariants: [
      'executive career transition coach',
      'salary negotiation consulting',
      'interview preparation coaching',
      'professional career roadmap',
    ],
  },
  {
    keyword: 'ATS resume builder',
    cluster: 'Resume Intelligence',
    intent: 'TRANSACTIONAL',
    entity: 'TalentXcel Services',
    pageType: 'COMMERCIAL_SERVICE',
    targetRoute: '/services/resume-building',
    parentTopic: 'resume-writing',
    commercialLevel: 'HIGH',
    priority: 1,
    semanticVariants: [
      'ATS resume optimization tool',
      'free ATS resume checker',
      'recruiter-friendly resume maker',
      'cover letter generator',
    ],
  },
  {
    keyword: 'talent management and skill verification',
    cluster: 'Talent Management',
    intent: 'COMMERCIAL_INVESTIGATION',
    entity: 'TalentXcel Services',
    pageType: 'COMMERCIAL_SERVICE',
    targetRoute: '/services/talent-management',
    parentTopic: 'leadership',
    commercialLevel: 'HIGH',
    priority: 1,
    semanticVariants: [
      'career passport credentialing',
      'workforce skill graph',
      'verified employee skills',
      'internal mobility matrix',
    ],
  },
  {
    keyword: 'direct job placement services',
    cluster: 'Job Placement',
    intent: 'TRANSACTIONAL',
    entity: 'TalentXcel Services',
    pageType: 'COMMERCIAL_SERVICE',
    targetRoute: '/services/job-placement',
    parentTopic: 'recruitment',
    commercialLevel: 'HIGH',
    priority: 1,
    semanticVariants: [
      'verified candidate placement',
      'fast-track job interview introductions',
      'direct employer hiring connect',
    ],
  },

  // =========================================================================
  // LAYER 2: JOB SEEKER (Transactional & Role Intent)
  // =========================================================================
  {
    keyword: 'content writer jobs Noida',
    cluster: 'Writing & Editorial Jobs',
    intent: 'JOB_SEARCH',
    entity: 'Chatr / TalentXcel Services',
    pageType: 'JOB_LISTING',
    targetRoute: '/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    parentTopic: 'careers',
    commercialLevel: 'MEDIUM',
    priority: 1,
    semanticVariants: ['content writer vacancies Noida', 'copywriter jobs Uttar Pradesh', 'content strategist roles'],
  },
  {
    keyword: 'marketing executive jobs Noida',
    cluster: 'Marketing Jobs',
    intent: 'JOB_SEARCH',
    entity: 'Chatr / TalentXcel Services',
    pageType: 'JOB_LISTING',
    targetRoute: '/jobs/marketing-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    parentTopic: 'business',
    commercialLevel: 'MEDIUM',
    priority: 1,
    semanticVariants: ['digital marketing executive jobs', 'growth marketer Noida', 'B2B marketing careers'],
  },
  {
    keyword: 'B2B sales executive jobs Noida',
    cluster: 'Sales Jobs',
    intent: 'JOB_SEARCH',
    entity: 'Chatr / TalentXcel Services',
    pageType: 'JOB_LISTING',
    targetRoute: '/jobs/b2b-sales-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1',
    parentTopic: 'business',
    commercialLevel: 'MEDIUM',
    priority: 1,
    semanticVariants: ['corporate sales jobs Noida', 'enterprise account executive', 'business development executive jobs'],
  },
  {
    keyword: 'software engineer jobs Bangalore',
    cluster: 'Software Engineering Roles',
    intent: 'JOB_SEARCH',
    entity: 'Tech Jobs',
    pageType: 'ROLE_LOCATION_HUB',
    targetRoute: '/jobs/software-engineer/bangalore',
    parentTopic: 'technology',
    commercialLevel: 'MEDIUM',
    priority: 2,
    semanticVariants: ['developer jobs Bengaluru', 'full stack engineer Bangalore', 'backend engineer roles'],
  },
  {
    keyword: 'recruiter jobs Bangalore',
    cluster: 'Recruitment Roles',
    intent: 'JOB_SEARCH',
    entity: 'HR & Talent',
    pageType: 'ROLE_LOCATION_HUB',
    targetRoute: '/jobs/recruiter/bangalore',
    parentTopic: 'recruitment',
    commercialLevel: 'MEDIUM',
    priority: 2,
    semanticVariants: ['talent acquisition specialist Bangalore', 'technical recruiter jobs', 'HR recruiter vacancies'],
  },

  // =========================================================================
  // LAYER 3: HIGHER EDUCATION & CAREER PATHWAYS (Educational Intent)
  // =========================================================================
  {
    keyword: 'IIT Madras admission placement CTC',
    cluster: 'Engineering Colleges',
    intent: 'EDUCATIONAL',
    entity: 'Indian Institute of Technology Madras',
    pageType: 'COLLEGE_PROFILE',
    targetRoute: '/colleges/indian-institute-of-technology-madras',
    parentTopic: 'education',
    commercialLevel: 'MEDIUM',
    priority: 2,
    semanticVariants: ['IIT Madras courses fees', 'IIT Madras NIRF ranking', 'IIT Madras flagship programs'],
  },
  {
    keyword: 'tuition free global master programs',
    cluster: 'Global Education',
    intent: 'EDUCATIONAL',
    entity: 'Global Degrees',
    pageType: 'CAREER_TOOL',
    targetRoute: '/colleges/global-programs',
    parentTopic: 'education',
    commercialLevel: 'MEDIUM',
    priority: 2,
    semanticVariants: ['free masters in Europe', 'fully funded degree programs', 'tuition free universities Germany'],
  },
  {
    keyword: 'AI career pathway generator',
    cluster: 'Career Pathways',
    intent: 'EDUCATIONAL',
    entity: 'TalentXcel Education Intelligence',
    pageType: 'CAREER_TOOL',
    targetRoute: '/colleges/pathway',
    parentTopic: 'careers',
    commercialLevel: 'MEDIUM',
    priority: 1,
    semanticVariants: ['6-step education roadmap', 'career transition pathway tool', 'zero budget education finder'],
  },

  // =========================================================================
  // LAYER 4: KNOWLEDGE & TOPICAL AUTHORITY (Informational Intent)
  // =========================================================================
  {
    keyword: 'artificial intelligence career guide',
    cluster: 'AI Knowledge',
    intent: 'INFORMATIONAL',
    entity: 'TalentXcel AI Topic Hub',
    pageType: 'TOPIC_HUB',
    targetRoute: '/topics/artificial-intelligence',
    parentTopic: 'artificial-intelligence',
    commercialLevel: 'INFORMATIONAL',
    priority: 1,
    semanticVariants: ['machine learning career path', 'AI job roles overview', 'future of AI engineering'],
  },
  {
    keyword: 'ATS resume formatting guide 2026',
    cluster: 'Resume Guides',
    intent: 'INFORMATIONAL',
    entity: 'TalentXcel Resource Center',
    pageType: 'ARTICLE_GUIDE',
    targetRoute: '/resources/how-to-write-an-ats-friendly-resume-in-2026-complete-step-by-step-guide',
    parentTopic: 'resume-writing',
    commercialLevel: 'INFORMATIONAL',
    priority: 1,
    semanticVariants: ['how to pass ATS filters', 'ATS compliant resume format', 'applicant tracking system keywords'],
  },
  {
    keyword: 'TalentXcel Services overview',
    cluster: 'Brand & Entity',
    intent: 'NAVIGATIONAL',
    entity: 'TalentXcel Services Pvt Ltd',
    pageType: 'COMPANY_ENTITY',
    targetRoute: '/company/talentxcel',
    parentTopic: 'business',
    commercialLevel: 'HIGH',
    priority: 1,
    semanticVariants: ['TalentXcel company profile', 'TalentXcel recruitment platform', 'TalentXcel Noida office'],
  },
];

/**
 * Returns all taxonomy concepts matching a specific search intent
 */
export function getTaxonomyByIntent(intent: SearchIntent): KeywordConcept[] {
  return KEYWORD_TAXONOMY.filter((c) => c.intent === intent);
}

/**
 * Returns all taxonomy concepts belonging to a parent topic
 */
export function getTaxonomyByTopic(topicSlug: string): KeywordConcept[] {
  const clean = topicSlug.toLowerCase().trim();
  return KEYWORD_TAXONOMY.filter((c) => c.parentTopic === clean);
}

/**
 * Finds the primary target route for a query or concept
 */
export function resolveTargetRoute(keyword: string): string | null {
  const query = keyword.toLowerCase().trim();
  const match = KEYWORD_TAXONOMY.find(
    (c) => c.keyword.toLowerCase() === query || c.semanticVariants.some((v) => v.toLowerCase() === query)
  );
  return match ? match.targetRoute : null;
}
