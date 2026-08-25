// src/lib/seo/searchIntent.ts
// Central Search Intent Classification & Page Mapping Engine for TalentXcel

import { SearchIntentType } from './keywordTaxonomy';

export interface PageSearchIntentDescriptor {
  route: string;
  primaryIntent: SearchIntentType;
  secondaryIntent?: SearchIntentType;
  primaryTopic: string;
  secondaryTopics: string[];
  primaryKeywordConcept: string;
  relatedKeywordConcepts: string[];
  conversionGoal: 'JOB_APPLY' | 'EMPLOYER_LEAD' | 'RESUME_CREATE' | 'CAREER_PATHWAY' | 'NEWSLETTER' | 'BRAND_ENGAGEMENT';
  parentHub: string;
  childPages: string[];
}

export function resolveSearchIntent(routePath: string): PageSearchIntentDescriptor {
  const path = (routePath || '/').toLowerCase().trim();

  // 1. Core Brand & Entity Hub
  if (path === '/' || path === '/company/talentxcel' || path === '/company/talentxcel-services') {
    return {
      route: path,
      primaryIntent: 'brand',
      secondaryIntent: 'commercial',
      primaryTopic: 'business',
      secondaryTopics: ['recruitment', 'careers', 'education', 'technology'],
      primaryKeywordConcept: 'TalentXcel Services',
      relatedKeywordConcepts: ['TalentXcel recruitment platform', 'TalentXcel careers', 'TalentXcel India'],
      conversionGoal: 'BRAND_ENGAGEMENT',
      parentHub: '/',
      childPages: ['/services/ai-recruitment', '/services/staffing-recruitment', '/jobs', '/colleges'],
    };
  }

  // 2. Commercial Service Pages
  if (path.startsWith('/services/')) {
    const serviceSlug = path.replace('/services/', '');
    let topic = 'recruitment';
    let primaryConcept = 'recruitment services';

    if (serviceSlug === 'ai-recruitment' || serviceSlug === 'ai-solutions') {
      topic = 'artificial-intelligence';
      primaryConcept = 'AI recruitment platform';
    } else if (serviceSlug === 'resume-building') {
      topic = 'resume-writing';
      primaryConcept = 'ATS resume builder';
    } else if (serviceSlug === 'career-services') {
      topic = 'careers';
      primaryConcept = 'career coaching services';
    } else if (serviceSlug === 'it-services') {
      topic = 'technology';
      primaryConcept = 'IT systems consulting';
    } else if (serviceSlug === 'corporate-training') {
      topic = 'leadership';
      primaryConcept = 'corporate training programs';
    }

    return {
      route: path,
      primaryIntent: 'commercial',
      secondaryIntent: 'employer',
      primaryTopic: topic,
      secondaryTopics: ['business', 'technology'],
      primaryKeywordConcept: primaryConcept,
      relatedKeywordConcepts: ['hire talent', 'recruitment outsourcing', 'workforce solutions'],
      conversionGoal: serviceSlug === 'resume-building' ? 'RESUME_CREATE' : 'EMPLOYER_LEAD',
      parentHub: `/topics/${topic}`,
      childPages: ['/employer', '/contact'],
    };
  }

  // 3. Semantic Topic Hubs
  if (path.startsWith('/topics/')) {
    const topicSlug = path.replace('/topics/', '');
    return {
      route: path,
      primaryIntent: 'informational',
      secondaryIntent: 'career',
      primaryTopic: topicSlug,
      secondaryTopics: ['careers', 'technology'],
      primaryKeywordConcept: `${topicSlug.replace(/-/g, ' ')} guides and career insights`,
      relatedKeywordConcepts: ['career pathways', 'job market trends', 'skill requirements'],
      conversionGoal: 'JOB_APPLY',
      parentHub: '/company/talentxcel',
      childPages: ['/jobs', '/colleges/pathway'],
    };
  }

  // 4. Job Listings & Job Search Hub
  if (path.startsWith('/jobs')) {
    return {
      route: path,
      primaryIntent: 'job-search',
      secondaryIntent: 'transactional',
      primaryTopic: 'careers',
      secondaryTopics: ['recruitment', 'technology'],
      primaryKeywordConcept: 'verified job openings in India',
      relatedKeywordConcepts: ['jobs in Noida', 'marketing jobs', 'software developer jobs'],
      conversionGoal: 'JOB_APPLY',
      parentHub: '/company/talentxcel',
      childPages: ['/resume', '/colleges/pathway'],
    };
  }

  // 5. Higher Education & Career Pathways
  if (path.startsWith('/colleges')) {
    return {
      route: path,
      primaryIntent: 'education',
      secondaryIntent: 'career',
      primaryTopic: 'education',
      secondaryTopics: ['careers', 'learning'],
      primaryKeywordConcept: 'higher education admissions and career pathways',
      relatedKeywordConcepts: ['best colleges India', 'NIRF rankings', 'placement CTC benchmarks', 'tuition free masters'],
      conversionGoal: 'CAREER_PATHWAY',
      parentHub: '/topics/education',
      childPages: ['/colleges/pathway', '/colleges/global-programs', '/colleges/scholarships'],
    };
  }

  // 6. Public Feed Posts
  if (path.startsWith('/post/')) {
    return {
      route: path,
      primaryIntent: 'informational',
      secondaryIntent: 'brand',
      primaryTopic: 'careers',
      secondaryTopics: ['recruitment', 'technology'],
      primaryKeywordConcept: 'professional commentary on TalentXcel',
      relatedKeywordConcepts: ['career growth insights', 'workforce discussions'],
      conversionGoal: 'BRAND_ENGAGEMENT',
      parentHub: '/network',
      childPages: ['/network', '/topics/careers'],
    };
  }

  // Default fallback
  return {
    route: path,
    primaryIntent: 'informational',
    primaryTopic: 'careers',
    secondaryTopics: ['business'],
    primaryKeywordConcept: 'TalentXcel career operating system',
    relatedKeywordConcepts: ['jobs', 'recruitment', 'education'],
    conversionGoal: 'BRAND_ENGAGEMENT',
    parentHub: '/',
    childPages: [],
  };
}
