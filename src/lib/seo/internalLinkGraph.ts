// src/lib/seo/internalLinkGraph.ts
// Automated Internal Link Graph & Contextual Anchor Distribution Engine for TalentXcel

import { BASE_PRODUCTION_ORIGIN } from './canonicalUrls';

export interface LinkGraphNode {
  sourceUrl: string;
  targetUrl: string;
  anchorText: string;
  relationship:
    | 'PARENT_TO_CHILD'
    | 'CHILD_TO_PARENT'
    | 'SIBLING_CONTEXTUAL'
    | 'CONTENT_TO_SERVICE'
    | 'CONTENT_TO_TOPIC'
    | 'CONTENT_TO_JOB'
    | 'COMPANY_TO_SERVICE'
    | 'SERVICE_TO_COMPANY'
    | 'JOB_TO_COMPANY'
    | 'COLLEGE_TO_PATHWAY';
  intent: 'COMMERCIAL' | 'INFORMATIONAL' | 'NAVIGATIONAL' | 'JOB_SEARCH' | 'CAREER';
}

export interface InternalLinkCluster {
  parentHub: { url: string; anchor: string };
  companyNode: { url: string; anchor: string };
  relatedServices: { url: string; anchor: string }[];
  relatedTopics: { url: string; anchor: string }[];
  activeJobs: { url: string; anchor: string }[];
  careerTools: { url: string; anchor: string }[];
}

export const SITE_AUTHORITY_HUBS = {
  homepage: `${BASE_PRODUCTION_ORIGIN}/`,
  company: `${BASE_PRODUCTION_ORIGIN}/company/talentxcel`,
  jobs: `${BASE_PRODUCTION_ORIGIN}/jobs`,
  colleges: `${BASE_PRODUCTION_ORIGIN}/colleges`,
  pathway: `${BASE_PRODUCTION_ORIGIN}/colleges/pathway`,
  resume: `${BASE_PRODUCTION_ORIGIN}/resume`,
  network: `${BASE_PRODUCTION_ORIGIN}/network`,
  employer: `${BASE_PRODUCTION_ORIGIN}/employer`,
};

/**
 * Returns rotated, descriptive anchor text for any destination URL
 */
export function getNaturalAnchor(targetUrl: string, variantIndex: number = 0): string {
  const clean = targetUrl.replace(BASE_PRODUCTION_ORIGIN, '').toLowerCase();

  const anchorVariations: Record<string, string[]> = {
    '/company/talentxcel': [
      'TalentXcel Services',
      'TalentXcel Company Overview',
      'About TalentXcel',
      'TalentXcel Platform Entity',
    ],
    '/services/ai-recruitment': [
      'AI Recruitment Platform',
      'AI-Powered Candidate Matching',
      'Automated Talent Sourcing Solutions',
      'AI Hiring Software',
    ],
    '/services/staffing-recruitment': [
      'Corporate Staffing & Recruitment',
      'Contract & Permanent Staffing Solutions',
      'Technical Recruitment Agency',
      'Workforce Staffing Services',
    ],
    '/services/rpo': [
      'Recruitment Process Outsourcing (RPO)',
      'Enterprise RPO Hiring Solutions',
      'Outsourced Talent Acquisition',
      'Managed Recruitment Services',
    ],
    '/services/resume-building': [
      'ATS Resume Builder',
      'Resume Optimization Studio',
      'Recruiter-Ready Resume Generator',
      'ATS Format Checker',
    ],
    '/services/career-services': [
      'Career Coaching & Strategy',
      'Executive Career Services',
      'Professional Growth Roadmaps',
    ],
    '/services/it-services': [
      'IT Systems Consulting',
      'Technology Staff Augmentation',
      'Enterprise Software Advisory',
    ],
    '/topics/artificial-intelligence': [
      'Artificial Intelligence Topic Hub',
      'AI Industry Trends & Careers',
      'AI Workforce Insights',
    ],
    '/topics/recruitment': [
      'Recruitment & Hiring Knowledge Hub',
      'Modern Talent Acquisition Strategies',
      'Corporate Recruitment Insights',
    ],
    '/topics/careers': [
      'Career Growth & Roadmaps',
      'Professional Career Guidance',
      'Career Progression Insights',
    ],
    '/topics/education': [
      'Higher Education Directory',
      'College Admissions & Pathways',
      'Indian Institution Rankings',
    ],
    '/colleges/pathway': [
      '6-Step AI Career Pathway Tool',
      'Education to Career Roadmap',
      'Personalized Career Pathway Builder',
    ],
    '/jobs': [
      'Explore Active Job Openings',
      'Verified Jobs in India',
      'Browse Career Opportunities',
    ],
    '/employer': [
      'Hire Talent for Employers',
      'Employer Recruitment Portal',
      'Corporate Hiring Dashboard',
    ],
  };

  const options = anchorVariations[clean] || ['TalentXcel Career Solutions'];
  return options[variantIndex % options.length];
}

/**
 * Builds the complete semantic internal link graph for any route
 */
export function buildPageLinkCluster(routePath: string, index: number = 0): InternalLinkCluster {
  const path = (routePath || '/').toLowerCase().trim();

  let activeTopic = 'careers';
  if (path.includes('ai') || path.includes('artificial-intelligence')) activeTopic = 'artificial-intelligence';
  else if (path.includes('staffing') || path.includes('recruit') || path.includes('rpo')) activeTopic = 'recruitment';
  else if (path.includes('tech') || path.includes('developer') || path.includes('it-')) activeTopic = 'technology';
  else if (path.includes('college') || path.includes('education') || path.includes('scholarship')) activeTopic = 'education';
  else if (path.includes('resume') || path.includes('ats')) activeTopic = 'resume-writing';

  return {
    parentHub: {
      url: `${BASE_PRODUCTION_ORIGIN}/topics/${activeTopic}`,
      anchor: getNaturalAnchor(`/topics/${activeTopic}`, index),
    },
    companyNode: {
      url: SITE_AUTHORITY_HUBS.company,
      anchor: getNaturalAnchor('/company/talentxcel', index),
    },
    relatedServices: [
      { url: `${BASE_PRODUCTION_ORIGIN}/services/ai-recruitment`, anchor: getNaturalAnchor('/services/ai-recruitment', index) },
      { url: `${BASE_PRODUCTION_ORIGIN}/services/staffing-recruitment`, anchor: getNaturalAnchor('/services/staffing-recruitment', index) },
      { url: `${BASE_PRODUCTION_ORIGIN}/services/rpo`, anchor: getNaturalAnchor('/services/rpo', index) },
      { url: `${BASE_PRODUCTION_ORIGIN}/services/resume-building`, anchor: getNaturalAnchor('/services/resume-building', index) },
    ],
    relatedTopics: [
      { url: `${BASE_PRODUCTION_ORIGIN}/topics/artificial-intelligence`, anchor: getNaturalAnchor('/topics/artificial-intelligence', index) },
      { url: `${BASE_PRODUCTION_ORIGIN}/topics/recruitment`, anchor: getNaturalAnchor('/topics/recruitment', index) },
      { url: `${BASE_PRODUCTION_ORIGIN}/topics/careers`, anchor: getNaturalAnchor('/topics/careers', index) },
    ],
    activeJobs: [
      {
        url: `${BASE_PRODUCTION_ORIGIN}/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1`,
        anchor: 'Content Writer - Chatr (char.chat)',
      },
      {
        url: `${BASE_PRODUCTION_ORIGIN}/jobs/marketing-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1`,
        anchor: 'Marketing Executive - Chatr (char.chat)',
      },
    ],
    careerTools: [
      { url: SITE_AUTHORITY_HUBS.pathway, anchor: getNaturalAnchor('/colleges/pathway', index) },
      { url: SITE_AUTHORITY_HUBS.resume, anchor: getNaturalAnchor('/services/resume-building', index) },
      { url: SITE_AUTHORITY_HUBS.jobs, anchor: getNaturalAnchor('/jobs', index) },
    ],
  };
}
