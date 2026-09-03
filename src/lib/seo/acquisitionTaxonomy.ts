// src/lib/seo/acquisitionTaxonomy.ts
// TalentXcel Organic Acquisition Operating System (O-AOS)
// Master Taxonomy: Search Intent, Audience Segments, Business Segments & Product Conversion Mappings

import { AcquisitionSurfaceId } from '@/lib/acquisition-os/types';
export * from './regionalTaxonomy';

// ==========================================
// 1. SEARCH INTENT TAXONOMY (Configurable 20 Classes)
// ==========================================
export type SearchIntentCategory =
  | 'JOB_SEARCH'
  | 'CAREER_EXPLORATION'
  | 'RESUME'
  | 'ATS'
  | 'SKILL'
  | 'LEARNING'
  | 'SALARY'
  | 'EMPLOYER'
  | 'HIRING'
  | 'COMPANY'
  | 'COLLEGE'
  | 'TRAINING'
  | 'NETWORKING'
  | 'PROFESSIONAL_IDENTITY'
  | 'CAREER_PASSPORT'
  | 'INTERVIEW'
  | 'LOCATION'
  | 'OCCUPATION'
  | 'B2B_SERVICES'
  | 'BRAND';

export const ALL_SEARCH_INTENTS: SearchIntentCategory[] = [
  'JOB_SEARCH',
  'CAREER_EXPLORATION',
  'RESUME',
  'ATS',
  'SKILL',
  'LEARNING',
  'SALARY',
  'EMPLOYER',
  'HIRING',
  'COMPANY',
  'COLLEGE',
  'TRAINING',
  'NETWORKING',
  'PROFESSIONAL_IDENTITY',
  'CAREER_PASSPORT',
  'INTERVIEW',
  'LOCATION',
  'OCCUPATION',
  'B2B_SERVICES',
  'BRAND',
];

// ==========================================
// 2. AUDIENCE TAXONOMY (18 Segments)
// ==========================================
export type AudienceSegment =
  | 'JOB_SEEKER'
  | 'STUDENT'
  | 'FRESHER'
  | 'PROFESSIONAL'
  | 'CAREER_SWITCHER'
  | 'RECRUITER'
  | 'EMPLOYER'
  | 'COMPANY'
  | 'COLLEGE'
  | 'TRAINING_COMPANY'
  | 'LEARNING_PROVIDER'
  | 'CAREER_PROFESSIONAL'
  | 'REMOTE_SEEKER'
  | 'INTERNATIONAL_SEEKER'
  | 'UNEMPLOYED'
  | 'FRESH_GRADUATE'
  | 'INTERNSHIP_SEEKER'
  | 'OTHER';

export const ALL_AUDIENCE_SEGMENTS: AudienceSegment[] = [
  'JOB_SEEKER',
  'STUDENT',
  'FRESHER',
  'PROFESSIONAL',
  'CAREER_SWITCHER',
  'RECRUITER',
  'EMPLOYER',
  'COMPANY',
  'COLLEGE',
  'TRAINING_COMPANY',
  'LEARNING_PROVIDER',
  'CAREER_PROFESSIONAL',
  'REMOTE_SEEKER',
  'INTERNATIONAL_SEEKER',
  'UNEMPLOYED',
  'FRESH_GRADUATE',
  'INTERNSHIP_SEEKER',
  'OTHER',
];

// ==========================================
// 3. BUSINESS SEGMENT TAXONOMY (9 Segments)
// ==========================================
export type BusinessSegment =
  | 'B2C_JOB_SEEKER'
  | 'B2C_STUDENT'
  | 'B2C_PROFESSIONAL'
  | 'B2B_EMPLOYER'
  | 'B2B_COMPANY'
  | 'B2B_COLLEGE'
  | 'B2B_TRAINING'
  | 'B2B_EDUCATION'
  | 'B2B_SERVICES';

export const ALL_BUSINESS_SEGMENTS: BusinessSegment[] = [
  'B2C_JOB_SEEKER',
  'B2C_STUDENT',
  'B2C_PROFESSIONAL',
  'B2B_EMPLOYER',
  'B2B_COMPANY',
  'B2B_COLLEGE',
  'B2B_TRAINING',
  'B2B_EDUCATION',
  'B2B_SERVICES',
];

// ==========================================
// 4. CUSTOMER ACQUISITION EVENTS TAXONOMY
// ==========================================
export type AcquisitionEventType =
  | 'ORGANIC_LANDING'
  | 'SIGNUP_STARTED'
  | 'SIGNUP_COMPLETED'
  | 'PHONE_VERIFIED'
  | 'PROFILE_COMPLETED'
  | 'RESUME_CREATED'
  | 'RESUME_SCANNED'
  | 'JOB_SEARCHED'
  | 'JOB_APPLIED'
  | 'EMPLOYER_SIGNUP'
  | 'COMPANY_CREATED'
  | 'JOB_POSTED'
  | 'COLLEGE_LEAD'
  | 'COLLEGE_SIGNUP'
  | 'TRAINING_LEAD'
  | 'TRAINING_SIGNUP'
  | 'COURSE_STARTED'
  | 'NETWORK_ACTIVATED'
  | 'PASSPORT_CREATED'
  | 'TOOL_USED'
  | 'CUSTOMER_CONVERTED';

export const ALL_ACQUISITION_EVENTS: AcquisitionEventType[] = [
  'ORGANIC_LANDING',
  'SIGNUP_STARTED',
  'SIGNUP_COMPLETED',
  'PHONE_VERIFIED',
  'PROFILE_COMPLETED',
  'RESUME_CREATED',
  'RESUME_SCANNED',
  'JOB_SEARCHED',
  'JOB_APPLIED',
  'EMPLOYER_SIGNUP',
  'COMPANY_CREATED',
  'JOB_POSTED',
  'COLLEGE_LEAD',
  'COLLEGE_SIGNUP',
  'TRAINING_LEAD',
  'TRAINING_SIGNUP',
  'COURSE_STARTED',
  'NETWORK_ACTIVATED',
  'PASSPORT_CREATED',
  'TOOL_USED',
  'CUSTOMER_CONVERTED',
];

// ==========================================
// 5. PRODUCT -> AUDIENCE -> CONVERSION MAP
// ==========================================
export interface ProductConversionDefinition {
  surfaceId: AcquisitionSurfaceId;
  productName: string;
  primaryAudience: AudienceSegment[];
  businessSegment: BusinessSegment;
  primaryConversion: AcquisitionEventType;
  secondaryConversions: AcquisitionEventType[];
  baseRoute: string;
  businessGoal: string;
  averageValueWeight: number; // 1 (low) to 10 (high strategic/revenue value)
}

export const PRODUCT_CONVERSION_REGISTRY: Record<AcquisitionSurfaceId, ProductConversionDefinition> = {
  JOBS: {
    surfaceId: 'JOBS',
    productName: 'Jobs & High-Intent Openings',
    primaryAudience: ['JOB_SEEKER', 'FRESHER', 'CAREER_SWITCHER', 'REMOTE_SEEKER'],
    businessSegment: 'B2C_JOB_SEEKER',
    primaryConversion: 'JOB_APPLIED',
    secondaryConversions: ['SIGNUP_COMPLETED', 'RESUME_CREATED'],
    baseRoute: '/jobs',
    businessGoal: 'Candidate acquisition & high-intent job applications',
    averageValueWeight: 6,
  },
  RESUME_BUILDER: {
    surfaceId: 'RESUME_BUILDER',
    productName: 'Resume Builder & ATS Optimizer',
    primaryAudience: ['JOB_SEEKER', 'STUDENT', 'FRESHER', 'PROFESSIONAL'],
    businessSegment: 'B2C_JOB_SEEKER',
    primaryConversion: 'RESUME_CREATED',
    secondaryConversions: ['RESUME_SCANNED', 'SIGNUP_COMPLETED', 'JOB_APPLIED'],
    baseRoute: '/resume',
    businessGoal: 'User activation via high-value career tooling',
    averageValueWeight: 7,
  },
  CAREER_TOOLS: {
    surfaceId: 'CAREER_TOOLS',
    productName: 'Career Calculators & Interview Tools',
    primaryAudience: ['JOB_SEEKER', 'PROFESSIONAL', 'CAREER_SWITCHER'],
    businessSegment: 'B2C_PROFESSIONAL',
    primaryConversion: 'TOOL_USED',
    secondaryConversions: ['SIGNUP_COMPLETED', 'RESUME_CREATED'],
    baseRoute: '/tools',
    businessGoal: 'Product-led organic acquisition via free utility tools',
    averageValueWeight: 5,
  },
  LEARNING: {
    surfaceId: 'LEARNING',
    productName: 'Courses & Skill Certifications',
    primaryAudience: ['STUDENT', 'PROFESSIONAL', 'CAREER_SWITCHER'],
    businessSegment: 'B2C_STUDENT',
    primaryConversion: 'COURSE_STARTED',
    secondaryConversions: ['SIGNUP_COMPLETED', 'RESUME_CREATED', 'JOB_APPLIED'],
    baseRoute: '/learning',
    businessGoal: 'Upskilling retention and monetization via premium tracks',
    averageValueWeight: 8,
  },
  CAREER_MAP: {
    surfaceId: 'CAREER_MAP',
    productName: 'Career Progression Pathways',
    primaryAudience: ['STUDENT', 'CAREER_SWITCHER', 'FRESHER'],
    businessSegment: 'B2C_STUDENT',
    primaryConversion: 'SIGNUP_COMPLETED',
    secondaryConversions: ['COURSE_STARTED', 'RESUME_CREATED', 'JOB_APPLIED'],
    baseRoute: '/career-map',
    businessGoal: 'Exploration-to-activation career progression journey',
    averageValueWeight: 6,
  },
  CAREER_PASSPORT: {
    surfaceId: 'CAREER_PASSPORT',
    productName: 'Career Passport & Living Professional Identity',
    primaryAudience: ['PROFESSIONAL', 'STUDENT', 'FRESHER'],
    businessSegment: 'B2C_PROFESSIONAL',
    primaryConversion: 'PASSPORT_CREATED',
    secondaryConversions: ['PROFILE_COMPLETED', 'NETWORK_ACTIVATED'],
    baseRoute: '/passport',
    businessGoal: 'Persistent identity lock-in and verified credentials',
    averageValueWeight: 7,
  },
  NETWORK: {
    surfaceId: 'NETWORK',
    productName: 'Professional Network & Directory',
    primaryAudience: ['PROFESSIONAL', 'CAREER_PROFESSIONAL'],
    businessSegment: 'B2C_PROFESSIONAL',
    primaryConversion: 'NETWORK_ACTIVATED',
    secondaryConversions: ['PROFILE_COMPLETED', 'SIGNUP_COMPLETED'],
    baseRoute: '/network',
    businessGoal: 'Viral referral density and authenticated network graph',
    averageValueWeight: 6,
  },
  EMPLOYER: {
    surfaceId: 'EMPLOYER',
    productName: 'Employer Solutions & Multi-Location Hiring',
    primaryAudience: ['EMPLOYER', 'RECRUITER'],
    businessSegment: 'B2B_EMPLOYER',
    primaryConversion: 'EMPLOYER_SIGNUP',
    secondaryConversions: ['COMPANY_CREATED', 'JOB_POSTED', 'CUSTOMER_CONVERTED'],
    baseRoute: '/hire',
    businessGoal: 'High-LTV employer acquisition and active job posting supply',
    averageValueWeight: 10,
  },
  COMPANIES: {
    surfaceId: 'COMPANIES',
    productName: 'Company Profiles & Hiring Intelligence',
    primaryAudience: ['COMPANY', 'EMPLOYER', 'JOB_SEEKER'],
    businessSegment: 'B2B_COMPANY',
    primaryConversion: 'COMPANY_CREATED',
    secondaryConversions: ['EMPLOYER_SIGNUP', 'JOB_POSTED'],
    baseRoute: '/companies',
    businessGoal: 'Employer branding and corporate partner acquisition',
    averageValueWeight: 8,
  },
  COLLEGES: {
    surfaceId: 'COLLEGES',
    productName: 'Colleges & Campus Placement Management OS',
    primaryAudience: ['COLLEGE', 'STUDENT'],
    businessSegment: 'B2B_COLLEGE',
    primaryConversion: 'COLLEGE_LEAD',
    secondaryConversions: ['COLLEGE_SIGNUP', 'CUSTOMER_CONVERTED'],
    baseRoute: '/colleges',
    businessGoal: 'B2B2C institutional acquisition producing cohorts of students',
    averageValueWeight: 10,
  },
  SERVICES: {
    surfaceId: 'SERVICES',
    productName: 'Executive Resume Writing & Career Services',
    primaryAudience: ['PROFESSIONAL', 'CAREER_PROFESSIONAL'],
    businessSegment: 'B2B_SERVICES',
    primaryConversion: 'CUSTOMER_CONVERTED',
    secondaryConversions: ['SIGNUP_COMPLETED', 'RESUME_CREATED'],
    baseRoute: '/services',
    businessGoal: 'Immediate direct high-ticket transactional revenue',
    averageValueWeight: 9,
  },
  RANKINGS: {
    surfaceId: 'RANKINGS',
    productName: 'Industry Leaderboards & Claim #1',
    primaryAudience: ['COMPANY', 'PROFESSIONAL'],
    businessSegment: 'B2B_COMPANY',
    primaryConversion: 'CUSTOMER_CONVERTED',
    secondaryConversions: ['SIGNUP_COMPLETED'],
    baseRoute: '/rankings',
    businessGoal: 'Competitive benchmarking and promotional acquisition',
    averageValueWeight: 7,
  },
};
