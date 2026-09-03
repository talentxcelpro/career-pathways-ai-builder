// src/lib/seo/queryAudienceMapper.ts
// TalentXcel Organic Acquisition Operating System (O-AOS)
// High-Precision Semantic Query -> Audience -> Business Segment -> Product Conversion Mapper
// Implements prompt Sections 16, 17, 18, 19, 20

import { AcquisitionSurfaceId } from '@/lib/acquisition-os/types';
import { 
  SearchIntentCategory, 
  AudienceSegment, 
  BusinessSegment, 
  AcquisitionEventType,
  PRODUCT_CONVERSION_REGISTRY 
} from './acquisitionTaxonomy';

export interface QueryAcquisitionMapping {
  rawQuery: string;
  normalizedQuery: string;
  intentCategory: SearchIntentCategory;
  primaryAudience: AudienceSegment;
  secondaryAudiences: AudienceSegment[];
  businessSegment: BusinessSegment;
  productSurface: AcquisitionSurfaceId;
  recommendedLandingPage: string;
  primaryConversion: AcquisitionEventType;
  businessGoal: string;
  matchConfidence: number; // 0.00 to 1.00
}

/**
 * Normalizes query string for uniform tokenization and matching
 */
export function normalizeAcquisitionQuery(query: string): string {
  return (query || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ');
}

/**
 * Classifies query into one of the 20 Search Intent Categories
 */
export function classifySearchIntentCategory(query: string): SearchIntentCategory {
  const q = normalizeAcquisitionQuery(query);

  if (q.includes('talentxcel') || q.includes('chatr') || q.includes('savantis')) {
    return 'BRAND';
  }
  if (q.includes('college placement') || q.includes('campus hiring platform') || q.includes('tpo software') || q.includes('campus recruitment')) {
    return 'COLLEGE';
  }
  if (q.includes('training') || q.includes('vocational') || q.includes('certification partner') || q.includes('coaching institute')) {
    return 'TRAINING';
  }
  if (q.includes('hire') || q.includes('recruiter') || q.includes('staffing') || q.includes('post job') || q.includes('employer')) {
    return 'HIRING';
  }
  if (q.includes('ats') || q.includes('resume score') || q.includes('resume checker') || q.includes('resume scanner')) {
    return 'ATS';
  }
  if (q.includes('resume') || q.includes('cv maker') || q.includes('curriculum vitae')) {
    return 'RESUME';
  }
  if (q.includes('salary') || q.includes('pay scale') || q.includes('compensation') || q.includes('in-hand')) {
    return 'SALARY';
  }
  if (q.includes('interview') || q.includes('mock test') || q.includes('questions and answers')) {
    return 'INTERVIEW';
  }
  if (q.includes('career map') || q.includes('career path') || q.includes('how to become') || q.includes('career switch')) {
    return 'CAREER_EXPLORATION';
  }
  if (q.includes('course') || q.includes('learn') || q.includes('tutorial') || q.includes('syllabus')) {
    return 'LEARNING';
  }
  if (q.includes('passport') || q.includes('portfolio') || q.includes('credentials') || q.includes('digital profile')) {
    return 'CAREER_PASSPORT';
  }
  if (q.includes('network') || q.includes('connect with') || q.includes('professionals in') || q.includes('peers')) {
    return 'NETWORKING';
  }
  if (q.includes('company') || q.includes('reviews') || q.includes('work culture') || q.includes('overview')) {
    return 'COMPANY';
  }
  if (q.includes('college') || q.includes('university') || q.includes('admission') || q.includes('cutoff')) {
    return 'COLLEGE';
  }
  if (q.includes('executive resume') || q.includes('coaching service') || q.includes('consulting')) {
    return 'B2B_SERVICES';
  }
  if (q.includes('job') || q.includes('vacancy') || q.includes('openings') || q.includes('fresher jobs') || q.includes('remote jobs')) {
    return 'JOB_SEARCH';
  }
  if (q.includes('skills') || q.includes('skill set') || q.includes('technologies')) {
    return 'SKILL';
  }
  if (q.includes('software engineer') || q.includes('data analyst') || q.includes('product manager')) {
    return 'OCCUPATION';
  }

  return 'JOB_SEARCH';
}

/**
 * Classifies audience segments from query tokens
 */
export function classifyQueryAudience(query: string): AudienceSegment[] {
  const q = normalizeAcquisitionQuery(query);
  const audiences: AudienceSegment[] = [];

  // B2B College signals
  if (q.includes('college') || q.includes('campus') || q.includes('placement cell') || q.includes('tpo') || q.includes('university')) {
    audiences.push('COLLEGE');
  }

  // B2B Employer & Recruiter signals
  if (q.includes('hire') || q.includes('recruiter') || q.includes('hiring manager') || q.includes('post job') || q.includes('post a job') || q.includes('staffing') || q.includes('employer')) {
    audiences.push('EMPLOYER');
    audiences.push('RECRUITER');
  }

  // Training provider signals
  if (q.includes('training institute') || q.includes('coaching') || q.includes('upskilling partner')) {
    audiences.push('TRAINING_COMPANY');
    audiences.push('LEARNING_PROVIDER');
  }

  // Fresher & Student signals
  if (q.includes('fresher') || q.includes('freshers') || q.includes('graduate') || q.includes('entry level') || q.includes('0-1 years')) {
    audiences.push('FRESHER');
    audiences.push('STUDENT');
  }
  if (q.includes('intern') || q.includes('internship')) {
    audiences.push('INTERNSHIP_SEEKER');
    audiences.push('STUDENT');
  }

  // Remote seekers
  if (q.includes('remote') || q.includes('work from home') || q.includes('wfh')) {
    audiences.push('REMOTE_SEEKER');
  }

  // Career switcher
  if (q.includes('career switch') || q.includes('transition to') || q.includes('pivot into') || q.includes('non tech to tech')) {
    audiences.push('CAREER_SWITCHER');
  }

  // Experienced professionals
  if (q.includes('senior') || q.includes('lead') || q.includes('manager') || q.includes('executive') || q.includes('experienced') || q.includes('director')) {
    audiences.push('PROFESSIONAL');
    audiences.push('CAREER_PROFESSIONAL');
  }

  // Default fallback if no specific audience was identified
  if (audiences.length === 0) {
    audiences.push('JOB_SEEKER');
  }

  return Array.from(new Set(audiences));
}

/**
 * Classifies overarching business segment
 */
export function classifyQueryBusinessSegment(query: string, audiences: AudienceSegment[]): BusinessSegment {
  if (audiences.includes('COLLEGE')) return 'B2B_COLLEGE';
  if (audiences.includes('EMPLOYER') || audiences.includes('RECRUITER')) return 'B2B_EMPLOYER';
  if (audiences.includes('TRAINING_COMPANY') || audiences.includes('LEARNING_PROVIDER')) return 'B2B_TRAINING';
  if (audiences.includes('COMPANY')) return 'B2B_COMPANY';
  if (audiences.includes('STUDENT') || audiences.includes('FRESHER') || audiences.includes('INTERNSHIP_SEEKER')) return 'B2C_STUDENT';
  if (audiences.includes('PROFESSIONAL') || audiences.includes('CAREER_PROFESSIONAL')) return 'B2C_PROFESSIONAL';
  
  return 'B2C_JOB_SEEKER';
}

/**
 * Maps query directly to product surface, recommended landing page, and conversion action
 */
export function mapQueryToProduct(rawQuery: string): QueryAcquisitionMapping {
  const norm = normalizeAcquisitionQuery(rawQuery);
  const intent = classifySearchIntentCategory(norm);
  const audiences = classifyQueryAudience(norm);
  const businessSegment = classifyQueryBusinessSegment(norm, audiences);
  const primaryAudience = audiences[0] || 'JOB_SEEKER';
  const secondaryAudiences = audiences.slice(1);

  let product: AcquisitionSurfaceId = 'JOBS';
  let landingPage = '/jobs';
  let confidence = 0.85;

  // Determine Product Surface based on semantic intent & business segment
  if (businessSegment === 'B2B_COLLEGE' || intent === 'COLLEGE') {
    product = 'COLLEGES';
    landingPage = '/colleges';
    confidence = 0.94;
  } else if (businessSegment === 'B2B_EMPLOYER' || intent === 'HIRING' || intent === 'EMPLOYER') {
    product = 'EMPLOYER';
    landingPage = '/hire';
    confidence = 0.96;
  } else if (intent === 'RESUME') {
    product = 'RESUME_BUILDER';
    landingPage = '/resume';
    confidence = 0.95;
  } else if (intent === 'ATS') {
    product = 'RESUME_BUILDER';
    landingPage = '/resume/ats-scanner';
    confidence = 0.97;
  } else if (intent === 'SALARY' || intent === 'INTERVIEW') {
    product = 'CAREER_TOOLS';
    landingPage = '/tools';
    confidence = 0.91;
  } else if (intent === 'LEARNING' || intent === 'TRAINING') {
    product = 'LEARNING';
    landingPage = '/learning';
    confidence = 0.90;
  } else if (intent === 'CAREER_EXPLORATION') {
    product = 'CAREER_MAP';
    landingPage = '/career-map';
    confidence = 0.92;
  } else if (intent === 'CAREER_PASSPORT' || intent === 'PROFESSIONAL_IDENTITY') {
    product = 'CAREER_PASSPORT';
    landingPage = '/passport';
    confidence = 0.93;
  } else if (intent === 'NETWORKING') {
    product = 'NETWORK';
    landingPage = '/network';
    confidence = 0.89;
  } else if (intent === 'COMPANY') {
    product = 'COMPANIES';
    landingPage = '/companies';
    confidence = 0.88;
  } else if (intent === 'B2B_SERVICES') {
    product = 'SERVICES';
    landingPage = '/services';
    confidence = 0.92;
  } else {
    // Default to Jobs
    product = 'JOBS';
    landingPage = '/jobs';
    confidence = 0.86;
  }

  // Specific query refinements for deep landing pages
  if (product === 'JOBS') {
    if (norm.includes('bangalore')) landingPage = '/jobs/bangalore';
    else if (norm.includes('mumbai')) landingPage = '/jobs/mumbai';
    else if (norm.includes('delhi')) landingPage = '/jobs/delhi';
    else if (norm.includes('hyderabad')) landingPage = '/jobs/hyderabad';
    else if (norm.includes('pune')) landingPage = '/jobs/pune';
    else if (norm.includes('chennai')) landingPage = '/jobs/chennai';
  }

  const def = PRODUCT_CONVERSION_REGISTRY[product];

  return {
    rawQuery,
    normalizedQuery: norm,
    intentCategory: intent,
    primaryAudience,
    secondaryAudiences,
    businessSegment,
    productSurface: product,
    recommendedLandingPage: landingPage,
    primaryConversion: def.primaryConversion,
    businessGoal: def.businessGoal,
    matchConfidence: confidence,
  };
}
