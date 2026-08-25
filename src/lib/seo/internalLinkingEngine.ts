// src/lib/seo/internalLinkingEngine.ts
// Semantic Internal Linking & Cross-Entity Graph Resolution Engine for TalentXcel
// Distributes authority contextually between Company, Services, Topics, Jobs, Colleges, and Posts.

import { BASE_PRODUCTION_ORIGIN } from './canonicalUrls';
import { KEYWORD_TAXONOMY, KeywordConcept } from './keywordTaxonomy';

export interface InternalLinkItem {
  anchorText: string;
  url: string;
  relationship: 'PARENT_TOPIC' | 'RELATED_SERVICE' | 'RELATED_JOB' | 'RELATED_TOPIC' | 'COMPANY_ENTITY' | 'CAREER_TOOL' | 'EDITORIAL_GUIDE';
  entityName: string;
}

export interface InternalLinkGraphResult {
  currentUrl: string;
  parentHub?: InternalLinkItem;
  companyEntityLink: InternalLinkItem;
  relatedServices: InternalLinkItem[];
  relatedTopics: InternalLinkItem[];
  relatedJobs: InternalLinkItem[];
  careerTools: InternalLinkItem[];
  recommendedContextualLinks: InternalLinkItem[];
}

export const COMPANY_ENTITY_LINK: InternalLinkItem = {
  anchorText: 'TalentXcel Services',
  url: `${BASE_PRODUCTION_ORIGIN}/company/talentxcel`,
  relationship: 'COMPANY_ENTITY',
  entityName: 'TalentXcel Services Pvt Ltd',
};

/**
 * Computes semantic internal links for any given route
 */
export function resolveInternalLinkGraph(routePath: string, parentTopicSlug?: string): InternalLinkGraphResult {
  const cleanPath = routePath.toLowerCase().trim();

  // 1. Determine Topic Associations
  let activeTopic = parentTopicSlug || 'careers';
  if (cleanPath.includes('ai') || cleanPath.includes('artificial-intelligence') || cleanPath.includes('machine-learning')) {
    activeTopic = 'artificial-intelligence';
  } else if (cleanPath.includes('staffing') || cleanPath.includes('recruit') || cleanPath.includes('rpo')) {
    activeTopic = 'recruitment';
  } else if (cleanPath.includes('tech') || cleanPath.includes('developer') || cleanPath.includes('software') || cleanPath.includes('it-')) {
    activeTopic = 'technology';
  } else if (cleanPath.includes('college') || cleanPath.includes('scholarship') || cleanPath.includes('degree') || cleanPath.includes('education')) {
    activeTopic = 'education';
  } else if (cleanPath.includes('resume') || cleanPath.includes('ats')) {
    activeTopic = 'resume-writing';
  }

  // 2. Compute Parent Topic Link
  const parentHub: InternalLinkItem = {
    anchorText: `${activeTopic.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Topic Hub`,
    url: `${BASE_PRODUCTION_ORIGIN}/topics/${activeTopic}`,
    relationship: 'PARENT_TOPIC',
    entityName: activeTopic,
  };

  // 3. Compute Relevant Services based on active topic
  const relatedServices: InternalLinkItem[] = [];
  if (activeTopic === 'artificial-intelligence') {
    relatedServices.push(
      { anchorText: 'AI Recruitment Platform', url: `${BASE_PRODUCTION_ORIGIN}/services/ai-recruitment`, relationship: 'RELATED_SERVICE', entityName: 'AI Recruitment' },
      { anchorText: 'Enterprise AI Solutions', url: `${BASE_PRODUCTION_ORIGIN}/services/ai-solutions`, relationship: 'RELATED_SERVICE', entityName: 'AI Solutions' }
    );
  } else if (activeTopic === 'recruitment') {
    relatedServices.push(
      { anchorText: 'Corporate Staffing Solutions', url: `${BASE_PRODUCTION_ORIGIN}/services/staffing-recruitment`, relationship: 'RELATED_SERVICE', entityName: 'Staffing' },
      { anchorText: 'Recruitment Process Outsourcing (RPO)', url: `${BASE_PRODUCTION_ORIGIN}/services/rpo`, relationship: 'RELATED_SERVICE', entityName: 'RPO' }
    );
  } else if (activeTopic === 'technology') {
    relatedServices.push(
      { anchorText: 'IT Systems Consulting', url: `${BASE_PRODUCTION_ORIGIN}/services/it-services`, relationship: 'RELATED_SERVICE', entityName: 'IT Consulting' },
      { anchorText: 'Direct Placement Services', url: `${BASE_PRODUCTION_ORIGIN}/services/job-placement`, relationship: 'RELATED_SERVICE', entityName: 'Placement' }
    );
  } else {
    relatedServices.push(
      { anchorText: 'ATS Resume Builder', url: `${BASE_PRODUCTION_ORIGIN}/services/resume-building`, relationship: 'RELATED_SERVICE', entityName: 'Resume Studio' },
      { anchorText: 'Career Coaching & Strategy', url: `${BASE_PRODUCTION_ORIGIN}/services/career-services`, relationship: 'RELATED_SERVICE', entityName: 'Career Services' }
    );
  }

  // 4. Compute Related Topics
  const allTopicSlugs = ['artificial-intelligence', 'recruitment', 'careers', 'education', 'technology', 'leadership', 'resume-writing', 'job-search'];
  const relatedTopics: InternalLinkItem[] = allTopicSlugs
    .filter((t) => t !== activeTopic)
    .slice(0, 3)
    .map((t) => ({
      anchorText: `${t.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`,
      url: `${BASE_PRODUCTION_ORIGIN}/topics/${t}`,
      relationship: 'RELATED_TOPIC',
      entityName: t,
    }));

  // 5. Compute Relevant Active Jobs
  const relatedJobs: InternalLinkItem[] = [
    {
      anchorText: 'Content Writer - Chatr (char.chat)',
      url: `${BASE_PRODUCTION_ORIGIN}/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1`,
      relationship: 'RELATED_JOB',
      entityName: 'TalentXcel Services',
    },
    {
      anchorText: 'Marketing Executive - Chatr (char.chat)',
      url: `${BASE_PRODUCTION_ORIGIN}/jobs/marketing-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1`,
      relationship: 'RELATED_JOB',
      entityName: 'TalentXcel Services',
    },
    {
      anchorText: 'B2B Sales Executive - Chatr (char.chat)',
      url: `${BASE_PRODUCTION_ORIGIN}/jobs/b2b-sales-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1`,
      relationship: 'RELATED_JOB',
      entityName: 'TalentXcel Services',
    },
  ];

  // 6. Compute Career Tools
  const careerTools: InternalLinkItem[] = [
    { anchorText: '6-Step AI Career Pathway Tool', url: `${BASE_PRODUCTION_ORIGIN}/colleges/pathway`, relationship: 'CAREER_TOOL', entityName: 'Career Pathway' },
    { anchorText: 'Global Degree Discovery', url: `${BASE_PRODUCTION_ORIGIN}/colleges/global-programs`, relationship: 'CAREER_TOOL', entityName: 'Global Degrees' },
    { anchorText: 'Free ATS Resume Studio', url: `${BASE_PRODUCTION_ORIGIN}/resume`, relationship: 'CAREER_TOOL', entityName: 'ATS Resume' },
  ];

  return {
    currentUrl: `${BASE_PRODUCTION_ORIGIN}${routePath.startsWith('/') ? routePath : '/' + routePath}`,
    parentHub,
    companyEntityLink: COMPANY_ENTITY_LINK,
    relatedServices,
    relatedTopics,
    relatedJobs,
    careerTools,
    recommendedContextualLinks: [parentHub, COMPANY_ENTITY_LINK, ...relatedServices, ...careerTools],
  };
}
