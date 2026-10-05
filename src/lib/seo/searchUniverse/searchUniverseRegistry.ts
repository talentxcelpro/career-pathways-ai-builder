// src/lib/seo/searchUniverse/searchUniverseRegistry.ts
/**
 * TalentXcel 30 Search Universes Registry & Intent Classification Engine
 *
 * Models every major product surface visible in the TalentXcel ecosystem:
 * 1. FIND A JOB (Browse Jobs, Government Jobs, ATS Resume Check, My Applications)
 * 2. BUILD MY CAREER (Career Passport, Career Map, Learning & Skills, Salary & Rankings, 10,250+ Colleges, Companies)
 * 3. HIRE TALENT (Recruiter OS, Talent Discovery, Post a Job, Employer Intelligence)
 * + High-Intent Verticals (Resume Templates, Examples, Keywords, Interview Questions, Remote, Freshers, Internships, etc.)
 */

export type ProductGroup = 'FIND_A_JOB' | 'BUILD_MY_CAREER' | 'HIRE_TALENT' | 'HIGH_INTENT_UTILITY';

export type SearchUniverseId =
  | 'JOBS'
  | 'GOVERNMENT_JOBS'
  | 'COMPANIES'
  | 'TALENT_DISCOVERY'
  | 'RESUMES'
  | 'RESUME_TEMPLATES'
  | 'RESUME_EXAMPLES'
  | 'ATS_CHECKER'
  | 'RESUME_KEYWORDS'
  | 'CAREER_PASSPORT'
  | 'TALENTSCORE'
  | 'CAREER_MAP'
  | 'SKILLS'
  | 'LEARNING'
  | 'COURSES'
  | 'CERTIFICATIONS'
  | 'SALARY'
  | 'RANKINGS'
  | 'COLLEGES'
  | 'DEGREES'
  | 'ADMISSIONS'
  | 'PLACEMENTS'
  | 'INTERVIEW_QUESTIONS'
  | 'CAREER_GUIDES'
  | 'INDUSTRIES'
  | 'JOB_TYPES'
  | 'REMOTE'
  | 'INTERNSHIPS'
  | 'FRESHER'
  | 'CAREER_SWITCH';

export interface SearchUniverseDefinition {
  id: SearchUniverseId;
  name: string;
  productGroup: ProductGroup;
  baseRoute: string;
  potentialIntentsScale: string;
  conversionFunnelCta: string;
  sampleIntentQueries: string[];
  primarySchemaType: string;
}

export const SEARCH_UNIVERSES_CATALOG: Record<SearchUniverseId, SearchUniverseDefinition> = {
  // --- 1. FIND A JOB ---
  JOBS: {
    id: 'JOBS',
    name: 'Browse Jobs & Live Vacancies',
    productGroup: 'FIND_A_JOB',
    baseRoute: '/jobs',
    potentialIntentsScale: '100K - 10M+',
    conversionFunnelCta: 'Apply / Check Match Score',
    sampleIntentQueries: ['software engineer jobs in bangalore', 'python developer jobs remote', 'content writer jobs noida'],
    primarySchemaType: 'JobPosting',
  },
  GOVERNMENT_JOBS: {
    id: 'GOVERNMENT_JOBS',
    name: 'Government, PSU & UPSC Jobs',
    productGroup: 'FIND_A_JOB',
    baseRoute: '/government-jobs',
    potentialIntentsScale: '50K - 1M+',
    conversionFunnelCta: 'View Eligibility & Exam Dates',
    sampleIntentQueries: ['upsc jobs 2026', 'sarkari naukri for graduates', 'railway recruitment 2026'],
    primarySchemaType: 'JobPosting',
  },
  ATS_CHECKER: {
    id: 'ATS_CHECKER',
    name: 'ATS Resume Score Checker',
    productGroup: 'FIND_A_JOB',
    baseRoute: '/resume/ats-check',
    potentialIntentsScale: '10K - 500K+',
    conversionFunnelCta: 'Free Instant ATS Scan',
    sampleIntentQueries: ['free ats resume checker', 'ats resume score online', 'check resume against job description'],
    primarySchemaType: 'SoftwareApplication',
  },
  REMOTE: {
    id: 'REMOTE',
    name: 'Remote & Work From Home Jobs',
    productGroup: 'FIND_A_JOB',
    baseRoute: '/jobs/remote',
    potentialIntentsScale: '50K - 1M+',
    conversionFunnelCta: 'Explore Remote Roles',
    sampleIntentQueries: ['remote software engineer jobs', 'work from home data analyst', 'remote tech jobs india'],
    primarySchemaType: 'CollectionPage',
  },
  FRESHER: {
    id: 'FRESHER',
    name: 'Fresher & Entry-Level Jobs',
    productGroup: 'FIND_A_JOB',
    baseRoute: '/jobs/freshers',
    potentialIntentsScale: '50K - 1M+',
    conversionFunnelCta: 'Fresher Job Match',
    sampleIntentQueries: ['software engineer jobs for freshers', 'fresher hiring 2026', 'entry level developer jobs bangalore'],
    primarySchemaType: 'CollectionPage',
  },
  INTERNSHIPS: {
    id: 'INTERNSHIPS',
    name: 'Tech & Professional Internships',
    productGroup: 'FIND_A_JOB',
    baseRoute: '/jobs/internship',
    potentialIntentsScale: '20K - 500K+',
    conversionFunnelCta: 'Apply for Internship',
    sampleIntentQueries: ['software engineer internship bangalore', 'python developer intern remote', 'paid tech internships 2026'],
    primarySchemaType: 'CollectionPage',
  },
  JOB_TYPES: {
    id: 'JOB_TYPES',
    name: 'Employment Types (Full-Time, Contract)',
    productGroup: 'FIND_A_JOB',
    baseRoute: '/jobs/type',
    potentialIntentsScale: '20K - 200K+',
    conversionFunnelCta: 'Filter by Work Type',
    sampleIntentQueries: ['contract react developer jobs', 'part time developer jobs', 'freelance python developer'],
    primarySchemaType: 'CollectionPage',
  },

  // --- 2. BUILD MY CAREER ---
  CAREER_PASSPORT: {
    id: 'CAREER_PASSPORT',
    name: 'Universal Career Passport & Public Profiles',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/passport',
    potentialIntentsScale: '100K - 10M+',
    conversionFunnelCta: 'Create Free Career Passport',
    sampleIntentQueries: ['verified digital career passport', 'developer career portfolio', 'talent passport india'],
    primarySchemaType: 'ProfilePage',
  },
  TALENTSCORE: {
    id: 'TALENTSCORE',
    name: 'TalentScore Capability Benchmark',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/passport/talent-score',
    potentialIntentsScale: '10K - 200K+',
    conversionFunnelCta: 'Calculate My TalentScore',
    sampleIntentQueries: ['calculate software engineer talent score', 'developer skill score test', 'benchmark career score'],
    primarySchemaType: 'SoftwareApplication',
  },
  CAREER_MAP: {
    id: 'CAREER_MAP',
    name: 'Career Pathways & Skill Progression',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/colleges/career-pathway',
    potentialIntentsScale: '50K - 500K+',
    conversionFunnelCta: 'View Career Progression Roadmap',
    sampleIntentQueries: ['software engineer career path', 'junior developer to tech lead roadmap', 'data analyst to data scientist progression'],
    primarySchemaType: 'Occupation',
  },
  SKILLS: {
    id: 'SKILLS',
    name: 'High-Demand Technical Skills',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/skills',
    potentialIntentsScale: '10K - 200K+',
    conversionFunnelCta: 'Explore Skill Demand & Jobs',
    sampleIntentQueries: ['python skills in demand', 'aws cloud architect skills', 'highest paying tech skills 2026'],
    primarySchemaType: 'DefinedTerm',
  },
  LEARNING: {
    id: 'LEARNING',
    name: 'Learning Hub & Skill Development',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/learning',
    potentialIntentsScale: '20K - 500K+',
    conversionFunnelCta: 'Enroll in Learning Path',
    sampleIntentQueries: ['learn software development', 'machine learning course roadmap', 'upskilling for developers'],
    primarySchemaType: 'CollectionPage',
  },
  COURSES: {
    id: 'COURSES',
    name: 'Accredited Professional Courses',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/learning/courses',
    potentialIntentsScale: '50K - 500K+',
    conversionFunnelCta: 'Start Course',
    sampleIntentQueries: ['python for data science course', 'system design course online', 'full stack web development bootcamp'],
    primarySchemaType: 'Course',
  },
  CERTIFICATIONS: {
    id: 'CERTIFICATIONS',
    name: 'Vendor & Industry Certifications',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/learning/certifications',
    productGroup: 'BUILD_MY_CAREER',
    potentialIntentsScale: '10K - 200K+',
    conversionFunnelCta: 'Verify Certification Path',
    sampleIntentQueries: ['aws solutions architect certification', 'google cloud engineer cert', 'certified kubernetes administrator'],
    primarySchemaType: 'EducationalOccupationalCredential',
  },
  SALARY: {
    id: 'SALARY',
    name: 'Salary & Compensation Intelligence',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/salary',
    potentialIntentsScale: '100K - 1M+',
    conversionFunnelCta: 'Compare My Salary',
    sampleIntentQueries: ['software engineer salary in bangalore', 'senior data scientist salary india', 'product manager salary uae'],
    primarySchemaType: 'Dataset',
  },
  RANKINGS: {
    id: 'RANKINGS',
    name: 'AI Products & Sector Rankings',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/rankings',
    potentialIntentsScale: '5K - 100K+',
    conversionFunnelCta: 'View Top Ranked Companies',
    sampleIntentQueries: ['top ai recruitment software', 'best staffing agencies india', 'highest ranked tech companies'],
    primarySchemaType: 'ItemList',
  },
  COLLEGES: {
    id: 'COLLEGES',
    name: '10,250+ Higher Ed Institutions',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/colleges',
    potentialIntentsScale: '10K - 500K+',
    conversionFunnelCta: 'Explore College Dossier',
    sampleIntentQueries: ['iit delhi courses and fees', 'bits pilani campus review', 'top engineering colleges india'],
    primarySchemaType: 'CollegeOrUniversity',
  },
  DEGREES: {
    id: 'DEGREES',
    name: 'Academic Degrees & Majors',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/colleges/degrees',
    potentialIntentsScale: '20K - 200K+',
    conversionFunnelCta: 'View Degree Career Outcomes',
    sampleIntentQueries: ['btech computer science colleges', 'mtech artificial intelligence syllabus', 'mba in business analytics'],
    primarySchemaType: 'CollectionPage',
  },
  ADMISSIONS: {
    id: 'ADMISSIONS',
    name: 'College Admissions & Eligibility',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/colleges/admissions',
    potentialIntentsScale: '20K - 300K+',
    conversionFunnelCta: 'Check Admission Eligibility',
    sampleIntentQueries: ['iit jee cutoff 2026', 'bitsat admission eligibility', 'cat percentile for iim'],
    primarySchemaType: 'CollectionPage',
  },
  PLACEMENTS: {
    id: 'PLACEMENTS',
    name: 'College Placement Reports & Salary Stats',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/colleges/placements',
    potentialIntentsScale: '50K - 500K+',
    conversionFunnelCta: 'View Verified Placement Stats',
    sampleIntentQueries: ['iit delhi placement report 2026', 'highest package bits pilani', 'top recruiters at iit bombay'],
    primarySchemaType: 'Dataset',
  },
  COMPANIES: {
    id: 'COMPANIES',
    name: 'Verified Company Dossiers',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/companies',
    potentialIntentsScale: '50K - 500K+',
    conversionFunnelCta: 'Explore Open Positions at Company',
    sampleIntentQueries: ['google careers india', 'microsoft salaries bangalore', 'amazon hiring software engineers'],
    primarySchemaType: 'Organization',
  },
  CAREER_SWITCH: {
    id: 'CAREER_SWITCH',
    name: 'Career Transition & Switching Guides',
    productGroup: 'BUILD_MY_CAREER',
    baseRoute: '/career-switch',
    potentialIntentsScale: '20K - 200K+',
    conversionFunnelCta: 'Map Career Switch Transition',
    sampleIntentQueries: ['switch from qa to developer', 'mechanical engineer to software engineer', 'sales to tech transition'],
    primarySchemaType: 'Article',
  },

  // --- 3. HIRE TALENT ---
  TALENT_DISCOVERY: {
    id: 'TALENT_DISCOVERY',
    name: 'Talent Discovery & Verified Candidate Pool',
    productGroup: 'HIRE_TALENT',
    baseRoute: '/talent',
    potentialIntentsScale: '50K - 1M+',
    conversionFunnelCta: 'Search Verified Candidates',
    sampleIntentQueries: ['hire python developers in bangalore', 'find react native developers india', 'hire remote data scientists'],
    primarySchemaType: 'CollectionPage',
  },
  INDUSTRIES: {
    id: 'INDUSTRIES',
    name: 'Industry Sectors & Hiring Trends',
    productGroup: 'HIRE_TALENT',
    baseRoute: '/industries',
    potentialIntentsScale: '10K - 100K+',
    conversionFunnelCta: 'View Industry Hiring Report',
    sampleIntentQueries: ['fintech hiring trends 2026', 'healthcare it recruitment', 'edtech jobs market'],
    primarySchemaType: 'CollectionPage',
  },

  // --- 4. HIGH-INTENT UTILITIES (RESUME & INTERVIEWS) ---
  RESUMES: {
    id: 'RESUMES',
    name: 'Resume Hub & Builder Tools',
    productGroup: 'HIGH_INTENT_UTILITY',
    baseRoute: '/resume',
    potentialIntentsScale: '50K - 500K+',
    conversionFunnelCta: 'Build ATS-Friendly Resume',
    sampleIntentQueries: ['free resume builder for software engineers', 'ats resume format 2026', 'tech resume builder online'],
    primarySchemaType: 'WebApplication',
  },
  RESUME_TEMPLATES: {
    id: 'RESUME_TEMPLATES',
    name: 'Role-Specific Resume Templates',
    productGroup: 'HIGH_INTENT_UTILITY',
    baseRoute: '/resume-templates',
    potentialIntentsScale: '10K - 200K+',
    conversionFunnelCta: 'Download ATS Template',
    sampleIntentQueries: ['software engineer resume template word', 'data scientist resume template latex', 'fresher resume format download'],
    primarySchemaType: 'CollectionPage',
  },
  RESUME_EXAMPLES: {
    id: 'RESUME_EXAMPLES',
    name: 'Verified Real-World Resume Examples',
    productGroup: 'HIGH_INTENT_UTILITY',
    baseRoute: '/resume-examples',
    potentialIntentsScale: '50K - 500K+',
    conversionFunnelCta: 'Copy Example Bullets',
    sampleIntentQueries: ['senior software engineer resume example', 'fresher python developer resume sample', 'product manager resume bullets'],
    primarySchemaType: 'CollectionPage',
  },
  RESUME_KEYWORDS: {
    id: 'RESUME_KEYWORDS',
    name: 'ATS Keywords & Skill Taxonomies',
    productGroup: 'HIGH_INTENT_UTILITY',
    baseRoute: '/resume-keywords',
    potentialIntentsScale: '20K - 300K+',
    conversionFunnelCta: 'Optimize Resume Keywords',
    sampleIntentQueries: ['software engineer resume keywords', 'data engineer resume action verbs', 'top keywords for devops resume'],
    primarySchemaType: 'DefinedTerm',
  },
  INTERVIEW_QUESTIONS: {
    id: 'INTERVIEW_QUESTIONS',
    name: 'Role & Skill Interview Questions',
    productGroup: 'HIGH_INTENT_UTILITY',
    baseRoute: '/interview-questions',
    potentialIntentsScale: '50K - 500K+',
    conversionFunnelCta: 'Practice Technical Interview',
    sampleIntentQueries: ['software engineer interview questions and answers', 'python technical interview questions', 'system design interview questions'],
    primarySchemaType: 'FAQPage',
  },
  CAREER_GUIDES: {
    id: 'CAREER_GUIDES',
    name: 'Authoritative Career & Hiring Editorial',
    productGroup: 'HIGH_INTENT_UTILITY',
    baseRoute: '/career-advice',
    potentialIntentsScale: '50K - 500K+',
    conversionFunnelCta: 'Read Complete Guide',
    sampleIntentQueries: ['how to get hired as a software engineer at google', 'how to beat ats resume scanners', 'career guidance for freshers'],
    primarySchemaType: 'Article',
  },
};

export class SearchUniverseRegistry {
  public static getAllUniverses(): SearchUniverseDefinition[] {
    return Object.values(SEARCH_UNIVERSES_CATALOG);
  }

  public static getUniverse(id: SearchUniverseId): SearchUniverseDefinition {
    return SEARCH_UNIVERSES_CATALOG[id];
  }

  /**
   * Classifies a raw query into one of the 30 Search Universes
   */
  public static classifyUniverse(query: string): SearchUniverseId {
    const q = query.toLowerCase();

    // High Priority Patterns
    if (q.includes('ats') || q.includes('score') || q.includes('scan resume')) return 'ATS_CHECKER';
    if (q.includes('template') && q.includes('resume')) return 'RESUME_TEMPLATES';
    if ((q.includes('example') || q.includes('sample')) && (q.includes('resume') || q.includes('cv'))) return 'RESUME_EXAMPLES';
    if (q.includes('keyword') || q.includes('action verb')) return 'RESUME_KEYWORDS';
    if (q.includes('resume') || q.includes('cv') || q.includes('cover letter')) return 'RESUMES';
    if (q.includes('placement') || q.includes('highest package')) return 'PLACEMENTS';
    if (q.includes('cutoff') || q.includes('admission') || q.includes('eligibility')) return 'ADMISSIONS';
    if (q.includes('degree') || q.includes('btech') || q.includes('mtech') || q.includes('mba')) return 'DEGREES';
    if (q.includes('college') || q.includes('university') || q.includes('iit') || q.includes('nit')) return 'COLLEGES';
    if (q.includes('salary') || q.includes('ctc') || q.includes('package') || q.includes('pay scale')) return 'SALARY';
    if (q.includes('ranking') || q.includes('top companies') || q.includes('leaderboard')) return 'RANKINGS';
    if (q.includes('interview') || q.includes('questions and answers')) return 'INTERVIEW_QUESTIONS';
    if (q.includes('certificat')) return 'CERTIFICATIONS';
    if (q.includes('course') || q.includes('bootcamp') || q.includes('syllabus')) return 'COURSES';
    if (q.includes('talent score') || q.includes('talentscore')) return 'TALENTSCORE';
    if (q.includes('passport') || q.includes('profile')) return 'CAREER_PASSPORT';
    if (q.includes('career path') || q.includes('roadmap') || q.includes('progression')) return 'CAREER_MAP';
    if (q.includes('switch') || q.includes('transition')) return 'CAREER_SWITCH';
    if (q.includes('remote') || q.includes('work from home') || q.includes('wfh')) return 'REMOTE';
    if (q.includes('fresher') || q.includes('entry level') || q.includes('0 years')) return 'FRESHER';
    if (q.includes('internship') || q.includes('intern')) return 'INTERNSHIPS';
    if (q.includes('sarkari') || q.includes('govt job') || q.includes('government job') || q.includes('upsc') || q.includes('psu')) return 'GOVERNMENT_JOBS';
    if (q.includes('hire') || q.includes('recruiter') || q.includes('talent discovery')) return 'TALENT_DISCOVERY';
    if (q.includes('company') || q.includes('companies')) return 'COMPANIES';
    if (q.includes('skill')) return 'SKILLS';
    if (q.includes('job') || q.includes('vacancy') || q.includes('hiring') || q.includes('opening')) return 'JOBS';

    return 'CAREER_GUIDES';
  }
}
