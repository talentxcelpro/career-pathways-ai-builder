// src/lib/seo/searchUniverse/queryIntentClassifier.ts
// 16-Class Semantic Search Intent Classifier for TalentXcel 10M-20M Engine

export type SearchIntentClass =
  | 'NAVIGATIONAL'
  | 'INFORMATIONAL'
  | 'COMMERCIAL'
  | 'TRANSACTIONAL'
  | 'JOB_SEARCH'
  | 'EMPLOYER'
  | 'EDUCATION'
  | 'CAREER'
  | 'COMPARISON'
  | 'LOCAL'
  | 'SALARY'
  | 'SKILL'
  | 'PROGRAM'
  | 'SCHOLARSHIP'
  | 'SERVICE'
  | 'BRAND';

export interface QueryIntentClassification {
  primaryIntent: SearchIntentClass;
  secondaryIntent?: SearchIntentClass;
  confidenceScore: number; // 0 to 1
  intentDescription: string;
}

export function classifyQueryIntent(normalizedQuery: string): QueryIntentClassification {
  const q = normalizedQuery.toLowerCase();

  // 1. Brand Intent
  if (q.includes('talentxcel')) {
    return {
      primaryIntent: 'BRAND',
      secondaryIntent: q.includes('job') || q.includes('career') ? 'JOB_SEARCH' : 'NAVIGATIONAL',
      confidenceScore: 0.99,
      intentDescription: 'Navigational query targeting TalentXcel platform entity',
    };
  }

  // 2. Job Search Intent
  if (
    q.includes('job') ||
    q.includes('vacancy') ||
    q.includes('vacancies') ||
    q.includes('hiring') ||
    q.includes('opening') ||
    q.includes('careers')
  ) {
    return {
      primaryIntent: 'JOB_SEARCH',
      secondaryIntent: q.includes('fresher') || q.includes('remote') ? 'TRANSACTIONAL' : 'LOCAL',
      confidenceScore: 0.95,
      intentDescription: 'Transactional candidate intent seeking active employment openings',
    };
  }

  // 3. Employer & B2B Services
  if (
    q.includes('staffing') ||
    q.includes('rpo') ||
    q.includes('hire') ||
    q.includes('recruitment services') ||
    q.includes('recruiting agency') ||
    q.includes('recruitment agency') ||
    q.includes('staff augmentation') ||
    q.includes('corporate training')
  ) {
    return {
      primaryIntent: 'EMPLOYER',
      secondaryIntent: 'COMMERCIAL',
      confidenceScore: 0.92,
      intentDescription: 'Commercial investigation by employers seeking workforce solutions',
    };
  }

  // 4. Resume & ATS Tools
  if (q.includes('resume') || q.includes('cv') || q.includes('ats')) {
    return {
      primaryIntent: 'TRANSACTIONAL',
      secondaryIntent: 'CAREER',
      confidenceScore: 0.94,
      intentDescription: 'Candidate transactional intent seeking ATS resume optimization tools',
    };
  }

  // 5. Higher Education & Admissions
  if (
    q.includes('college') ||
    q.includes('university') ||
    q.includes('admission') ||
    q.includes('ranking') ||
    q.includes('nirf') ||
    q.includes('tuition')
  ) {
    return {
      primaryIntent: 'EDUCATION',
      secondaryIntent: 'INFORMATIONAL',
      confidenceScore: 0.91,
      intentDescription: 'Educational intent seeking college accreditation and placement benchmarks',
    };
  }

  // 6. Scholarships & Funding
  if (q.includes('scholarship') || q.includes('grant') || q.includes('fellowship') || q.includes('funded')) {
    return {
      primaryIntent: 'SCHOLARSHIP',
      secondaryIntent: 'EDUCATION',
      confidenceScore: 0.93,
      intentDescription: 'Student funding and scholarship discovery',
    };
  }

  // 7. Salary & Compensation
  if (q.includes('salary') || q.includes('ctc') || q.includes('package') || q.includes('compensation')) {
    return {
      primaryIntent: 'SALARY',
      secondaryIntent: 'CAREER',
      confidenceScore: 0.9,
      intentDescription: 'Candidate inquiry regarding market compensation benchmarks',
    };
  }

  // 8. Interview Preparation
  if (q.includes('interview') || q.includes('questions') || q.includes('answers') || q.includes('rounds')) {
    return {
      primaryIntent: 'CAREER',
      secondaryIntent: 'INFORMATIONAL',
      confidenceScore: 0.88,
      intentDescription: 'Interview preparation and technical round guidance',
    };
  }

  // 9. Career Pathways & Roadmaps
  if (q.includes('career path') || q.includes('roadmap') || q.includes('how to become') || q.includes('transition')) {
    return {
      primaryIntent: 'CAREER',
      secondaryIntent: 'INFORMATIONAL',
      confidenceScore: 0.89,
      intentDescription: 'Long-term career planning and skill pathway guidance',
    };
  }

  // 10. Default Informational
  return {
    primaryIntent: 'INFORMATIONAL',
    secondaryIntent: 'CAREER',
    confidenceScore: 0.75,
    intentDescription: 'Top-of-funnel informational inquiry',
  };
}
