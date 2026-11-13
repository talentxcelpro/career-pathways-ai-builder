// src/services/billing/planCatalogue.ts
// TalentXcel Central Commercial Catalogue & Plan Entitlement Engine
// All monetary values are strictly represented in integer paise (₹1 = 100 paise)

export type PlanTier = 'free' | 'starter' | 'pro' | 'max' | 'business' | 'enterprise';

export interface FeatureEntitlement {
  featureId: string;
  name: string;
  description: string;
  product: 'resume' | 'jobs' | 'salary' | 'colleges' | 'passport' | 'government' | 'careers' | 'learning' | 'employers' | 'global';
  accessLevel: 'none' | 'basic' | 'standard' | 'advanced' | 'unlimited';
  monthlyQuota: number; // -1 for unlimited, 0 for disallowed
  warningThresholdPercent: number; // e.g. 80 for 80%
  aiCreditCost?: number; // Cost in AI credits if consumed beyond subscription quota
}

export interface PlanDefinition {
  id: PlanTier;
  name: string;
  badge?: string;
  popular?: boolean;
  tagline: string;
  description: string;
  monthlyPricePaise: number; // in paise
  monthlyPriceRupees: number; // in rupees
  annualPricePaise?: number; // configurable in paise, unpublished by default
  isAnnualPublished: boolean; // false until separately approved
  currency: 'INR';
  rank: number; // 0=free, 1=starter, 2=pro, 3=max, 4=business, 5=enterprise
  entitlements: Record<string, FeatureEntitlement>;
  includedAiCredits: number;
  highlightFeatures: string[];
}

export interface AiCreditPack {
  id: string;
  name: string;
  credits: number;
  pricePaise: number;
  priceRupees: number;
  popular?: boolean;
  badge?: string;
}

// Approved AI Credit Packs
export const AI_CREDIT_PACKS: AiCreditPack[] = [
  { id: 'ai-pack-100', name: '100 AI Credits', credits: 100, pricePaise: 19900, priceRupees: 199 },
  { id: 'ai-pack-300', name: '300 AI Credits', credits: 300, pricePaise: 49900, priceRupees: 499, popular: true, badge: 'Best Value' },
  { id: 'ai-pack-1000', name: '1,000 AI Credits', credits: 1000, pricePaise: 149900, priceRupees: 1499, badge: 'Power Pack' },
];

export const APPROVED_AI_CREDIT_PACKS = AI_CREDIT_PACKS;

// Master Central Plan Definitions
export const CENTRAL_PLAN_CATALOGUE: Record<PlanTier, PlanDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Essential discovery tools for new job seekers and students.',
    description: 'Free forever access to ATS scanning, job browsing, and verified government vacancy gazettes.',
    monthlyPricePaise: 0,
    monthlyPriceRupees: 0,
    isAnnualPublished: false,
    currency: 'INR',
    rank: 0,
    includedAiCredits: 5,
    highlightFeatures: [
      '1 Free ATS Resume Scan per month',
      '3 1-Click Job Applications',
      'Standard Section 115BAC Calculator',
      'Public Career Passport link & QR',
      '100% Free Government Vacancy Notices'
    ],
    entitlements: {
      // ResumeStudio
      'resume_builder': { featureId: 'resume_builder', name: 'Resume Builder', description: 'Standard single-column templates', product: 'resume', accessLevel: 'basic', monthlyQuota: -1, warningThresholdPercent: 100 },
      'ats_scan': { featureId: 'ats_scan', name: 'ATS Resume Scans', description: 'Basic ATS readability score', product: 'resume', accessLevel: 'basic', monthlyQuota: 1, warningThresholdPercent: 100, aiCreditCost: 5 },
      'resume_rewrite': { featureId: 'resume_rewrite', name: 'AI Resume Rewrites', description: 'Role-specific AI bullet tailoring', product: 'resume', accessLevel: 'none', monthlyQuota: 0, warningThresholdPercent: 0, aiCreditCost: 10 },
      // JobMatch OS
      'job_applications': { featureId: 'job_applications', name: '1-Click Job Applies', description: 'Apply directly with Career Passport', product: 'jobs', accessLevel: 'basic', monthlyQuota: 3, warningThresholdPercent: 80 },
      'job_matching_ai': { featureId: 'job_matching_ai', name: 'AI Job Match Score', description: 'Match percentage against vacancies', product: 'jobs', accessLevel: 'basic', monthlyQuota: -1, warningThresholdPercent: 100 },
      // PayScale
      'salary_calculator': { featureId: 'salary_calculator', name: 'In-Hand CTC Calculator', description: 'Section 115BAC baseline calculations', product: 'salary', accessLevel: 'basic', monthlyQuota: -1, warningThresholdPercent: 100 },
      'salary_benchmarks': { featureId: 'salary_benchmarks', name: 'Salary Benchmarking', description: 'City & role percentile reports', product: 'salary', accessLevel: 'none', monthlyQuota: 0, warningThresholdPercent: 0 },
      // CampusOS
      'cohort_access': { featureId: 'cohort_access', name: 'TPO Cohort Portal', description: 'Access batch placement test links', product: 'colleges', accessLevel: 'basic', monthlyQuota: -1, warningThresholdPercent: 100 },
      'placement_readiness': { featureId: 'placement_readiness', name: 'Readiness Audit', description: 'Comprehensive campus placement score', product: 'colleges', accessLevel: 'basic', monthlyQuota: 1, warningThresholdPercent: 100 },
      // Career Passport
      'public_passport': { featureId: 'public_passport', name: 'Shareable Profile', description: 'Custom public talent link & QR card', product: 'passport', accessLevel: 'basic', monthlyQuota: -1, warningThresholdPercent: 100 },
      'verified_credential_badge': { featureId: 'verified_credential_badge', name: 'Verified Talent Badge', description: 'Cryptographic proof on profile', product: 'passport', accessLevel: 'none', monthlyQuota: 0, warningThresholdPercent: 0 },
      // SarkariHub
      'sarkari_vacancies': { featureId: 'sarkari_vacancies', name: 'Government Vacancies', description: '100% authentic PSU and Govt notices', product: 'government', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'exam_prep_ai': { featureId: 'exam_prep_ai', name: 'Exam AI Prep & Alerts', description: 'Personalized syllabus and instant alerts', product: 'government', accessLevel: 'none', monthlyQuota: 0, warningThresholdPercent: 0 },
      // Career Pathfinder
      'career_roadmaps': { featureId: 'career_roadmaps', name: 'Transition Roadmaps', description: 'Standard career transition blueprints', product: 'careers', accessLevel: 'basic', monthlyQuota: 1, warningThresholdPercent: 100 },
      'transition_milestone_tracker': { featureId: 'transition_milestone_tracker', name: 'Milestone Tracking', description: '16-week structured milestone tracking', product: 'careers', accessLevel: 'none', monthlyQuota: 0, warningThresholdPercent: 0 },
      // SkillPods
      'skill_diagnostics': { featureId: 'skill_diagnostics', name: 'Technical Assessments', description: 'Practical coding & cloud diagnostics', product: 'learning', accessLevel: 'basic', monthlyQuota: 1, warningThresholdPercent: 100 },
      // Recruiter Workspace
      'talent_search': { featureId: 'talent_search', name: 'Candidate Discovery', description: 'Explore verified candidate archetypes', product: 'employers', accessLevel: 'basic', monthlyQuota: -1, warningThresholdPercent: 100 },
      'candidate_contact_unlock': { featureId: 'candidate_contact_unlock', name: 'Direct Contact Unlocks', description: 'Access phone, email & full dossier', product: 'employers', accessLevel: 'none', monthlyQuota: 0, warningThresholdPercent: 0 }
    }
  },

  starter: {
    id: 'starter',
    name: 'Starter',
    badge: 'Popular for Freshers',
    tagline: 'Enhanced tools for active job applicants and competitive test takers.',
    description: 'Perfect for active job seekers needing regular ATS scans, fast applications, and AI resume rewrites.',
    monthlyPricePaise: 29900, // ₹299
    monthlyPriceRupees: 299,
    isAnnualPublished: false,
    currency: 'INR',
    rank: 1,
    includedAiCredits: 30,
    highlightFeatures: [
      '8 ATS Scans + 3 AI Bullet Rewrites',
      '15 1-Click Fast Applications',
      'State-Level Salary Benchmark Reports',
      'Silver Passport Tier Verification',
      '3 Practical Technical Skill Diagnostics'
    ],
    entitlements: {
      'resume_builder': { featureId: 'resume_builder', name: 'Resume Builder', description: 'All standard & modern templates', product: 'resume', accessLevel: 'standard', monthlyQuota: -1, warningThresholdPercent: 100 },
      'ats_scan': { featureId: 'ats_scan', name: 'ATS Resume Scans', description: 'Detailed 4-pillar ATS analysis', product: 'resume', accessLevel: 'standard', monthlyQuota: 8, warningThresholdPercent: 80, aiCreditCost: 5 },
      'resume_rewrite': { featureId: 'resume_rewrite', name: 'AI Resume Rewrites', description: 'Tailored keyword recommendations', product: 'resume', accessLevel: 'basic', monthlyQuota: 3, warningThresholdPercent: 80, aiCreditCost: 10 },
      'job_applications': { featureId: 'job_applications', name: '1-Click Job Applies', description: 'Daily active applications', product: 'jobs', accessLevel: 'standard', monthlyQuota: 15, warningThresholdPercent: 80 },
      'job_matching_ai': { featureId: 'job_matching_ai', name: 'AI Job Match Score', description: 'Skill-gap insights on listings', product: 'jobs', accessLevel: 'standard', monthlyQuota: -1, warningThresholdPercent: 100 },
      'salary_calculator': { featureId: 'salary_calculator', name: 'In-Hand CTC Calculator', description: 'Saved scenarios & deduction charts', product: 'salary', accessLevel: 'standard', monthlyQuota: -1, warningThresholdPercent: 100 },
      'salary_benchmarks': { featureId: 'salary_benchmarks', name: 'Salary Benchmarking', description: 'State-level compensation percentiles', product: 'salary', accessLevel: 'basic', monthlyQuota: 5, warningThresholdPercent: 80 },
      'cohort_access': { featureId: 'cohort_access', name: 'TPO Cohort Portal', description: 'Batch tests with rank estimation', product: 'colleges', accessLevel: 'standard', monthlyQuota: -1, warningThresholdPercent: 100 },
      'placement_readiness': { featureId: 'placement_readiness', name: 'Readiness Audit', description: 'NIRF tier benchmarking report', product: 'colleges', accessLevel: 'standard', monthlyQuota: 3, warningThresholdPercent: 80 },
      'public_passport': { featureId: 'public_passport', name: 'Shareable Profile', description: 'Enhanced portfolio with git links', product: 'passport', accessLevel: 'standard', monthlyQuota: -1, warningThresholdPercent: 100 },
      'verified_credential_badge': { featureId: 'verified_credential_badge', name: 'Verified Talent Badge', description: 'Silver Passport Tier verification', product: 'passport', accessLevel: 'basic', monthlyQuota: -1, warningThresholdPercent: 100 },
      'sarkari_vacancies': { featureId: 'sarkari_vacancies', name: 'Government Vacancies', description: 'Personalized PSU notification alerts', product: 'government', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'exam_prep_ai': { featureId: 'exam_prep_ai', name: 'Exam AI Prep & Alerts', description: 'Saved vacancies & deadline tracking', product: 'government', accessLevel: 'basic', monthlyQuota: 10, warningThresholdPercent: 80 },
      'career_roadmaps': { featureId: 'career_roadmaps', name: 'Transition Roadmaps', description: 'Saved roadmaps with phase checklists', product: 'careers', accessLevel: 'standard', monthlyQuota: 3, warningThresholdPercent: 80 },
      'transition_milestone_tracker': { featureId: 'transition_milestone_tracker', name: 'Milestone Tracking', description: '4-week phase 1 milestone tracking', product: 'careers', accessLevel: 'basic', monthlyQuota: 1, warningThresholdPercent: 80 },
      'skill_diagnostics': { featureId: 'skill_diagnostics', name: 'Technical Assessments', description: '3 assessments with explanations', product: 'learning', accessLevel: 'standard', monthlyQuota: 3, warningThresholdPercent: 80 },
      'talent_search': { featureId: 'talent_search', name: 'Candidate Discovery', description: 'Search candidates by city and role', product: 'employers', accessLevel: 'basic', monthlyQuota: -1, warningThresholdPercent: 100 },
      'candidate_contact_unlock': { featureId: 'candidate_contact_unlock', name: 'Direct Contact Unlocks', description: 'Direct recruiter messages', product: 'employers', accessLevel: 'none', monthlyQuota: 0, warningThresholdPercent: 0 }
    }
  },

  pro: {
    id: 'pro',
    name: 'Pro',
    popular: true,
    badge: 'Most Popular',
    tagline: 'Accelerate career growth with unlimited scans, AI rewrites, and priority hiring visibility.',
    description: 'The standard choice for career acceleration. Unlimited ATS scans, priority recruiter delivery, and 100 AI credits.',
    monthlyPricePaise: 49900, // ₹499
    monthlyPriceRupees: 499,
    isAnnualPublished: false,
    currency: 'INR',
    rank: 2,
    includedAiCredits: 100,
    highlightFeatures: [
      'Unlimited ATS Scans + 20 AI Rewrites',
      'Unlimited 1-Click Fast Applies',
      'Priority Recruiter Delivery Queue',
      'Gold Passport Tier Verification',
      'Full Compensation & Peer Salary Grids'
    ],
    entitlements: {
      'resume_builder': { featureId: 'resume_builder', name: 'Resume Builder', description: 'Full access to all ATS-certified templates', product: 'resume', accessLevel: 'advanced', monthlyQuota: -1, warningThresholdPercent: 100 },
      'ats_scan': { featureId: 'ats_scan', name: 'ATS Resume Scans', description: 'Unlimited enterprise ATS diagnostics', product: 'resume', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'resume_rewrite': { featureId: 'resume_rewrite', name: 'AI Resume Rewrites', description: 'Full AI bullet re-engineering & metrics', product: 'resume', accessLevel: 'advanced', monthlyQuota: 20, warningThresholdPercent: 80, aiCreditCost: 10 },
      'job_applications': { featureId: 'job_applications', name: '1-Click Job Applies', description: 'Unlimited 1-click direct applies', product: 'jobs', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'job_matching_ai': { featureId: 'job_matching_ai', name: 'AI Job Match Score', description: 'Priority Recruiter Delivery queue', product: 'jobs', accessLevel: 'advanced', monthlyQuota: -1, warningThresholdPercent: 100 },
      'salary_calculator': { featureId: 'salary_calculator', name: 'In-Hand CTC Calculator', description: 'Custom tax exemption scenario builder', product: 'salary', accessLevel: 'advanced', monthlyQuota: -1, warningThresholdPercent: 100 },
      'salary_benchmarks': { featureId: 'salary_benchmarks', name: 'Salary Benchmarking', description: 'Peer salary grids & negotiation script', product: 'salary', accessLevel: 'advanced', monthlyQuota: -1, warningThresholdPercent: 100 },
      'cohort_access': { featureId: 'cohort_access', name: 'TPO Cohort Portal', description: 'Comprehensive percentile breakdown', product: 'colleges', accessLevel: 'advanced', monthlyQuota: -1, warningThresholdPercent: 100 },
      'placement_readiness': { featureId: 'placement_readiness', name: 'Readiness Audit', description: 'Company-specific interview cutoff predictor', product: 'colleges', accessLevel: 'advanced', monthlyQuota: 10, warningThresholdPercent: 80 },
      'public_passport': { featureId: 'public_passport', name: 'Shareable Profile', description: 'Gold Passport Tier verification', product: 'passport', accessLevel: 'advanced', monthlyQuota: -1, warningThresholdPercent: 100 },
      'verified_credential_badge': { featureId: 'verified_credential_badge', name: 'Verified Talent Badge', description: 'Priority placement in talent database', product: 'passport', accessLevel: 'standard', monthlyQuota: -1, warningThresholdPercent: 100 },
      'sarkari_vacancies': { featureId: 'sarkari_vacancies', name: 'Government Vacancies', description: 'Instant WhatsApp & Email exam alerts', product: 'government', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'exam_prep_ai': { featureId: 'exam_prep_ai', name: 'Exam AI Prep & Alerts', description: 'Automated syllabus gap diagnostics', product: 'government', accessLevel: 'advanced', monthlyQuota: -1, warningThresholdPercent: 100 },
      'career_roadmaps': { featureId: 'career_roadmaps', name: 'Transition Roadmaps', description: 'Personalized AI role transition planner', product: 'careers', accessLevel: 'advanced', monthlyQuota: -1, warningThresholdPercent: 100 },
      'transition_milestone_tracker': { featureId: 'transition_milestone_tracker', name: 'Milestone Tracking', description: 'Full 16-week milestone tracking with reminders', product: 'careers', accessLevel: 'advanced', monthlyQuota: 3, warningThresholdPercent: 80 },
      'skill_diagnostics': { featureId: 'skill_diagnostics', name: 'Technical Assessments', description: 'Unlimited diagnostics & verifiable badges', product: 'learning', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'talent_search': { featureId: 'talent_search', name: 'Candidate Discovery', description: 'Search candidates with verified skills filter', product: 'employers', accessLevel: 'standard', monthlyQuota: -1, warningThresholdPercent: 100 },
      'candidate_contact_unlock': { featureId: 'candidate_contact_unlock', name: 'Direct Contact Unlocks', description: 'Direct candidate contact requests', product: 'employers', accessLevel: 'basic', monthlyQuota: 5, warningThresholdPercent: 80 }
    }
  },

  max: {
    id: 'max',
    name: 'Max',
    badge: 'Executive',
    tagline: 'Maximum power for serious career pivoters, senior engineers, and consultants.',
    description: 'Executive-level toolkit: 60 AI rewrites, direct recruiter messaging, Diamond Passport, and 250 AI credits.',
    monthlyPricePaise: 99900, // ₹999
    monthlyPriceRupees: 999,
    isAnnualPublished: false,
    currency: 'INR',
    rank: 3,
    includedAiCredits: 250,
    highlightFeatures: [
      'Unlimited Scans + 60 Executive AI Rewrites',
      'Top of Recruiter Queue Guarantee',
      'Diamond Tier Verified Career Passport',
      '15 Direct Verified Recruiter Contacts / mo',
      'ESOP & Executive Compensation Modeler'
    ],
    entitlements: {
      'resume_builder': { featureId: 'resume_builder', name: 'Resume Builder', description: 'Unlimited multi-role executive resumes', product: 'resume', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'ats_scan': { featureId: 'ats_scan', name: 'ATS Resume Scans', description: 'Unlimited scans with Workday/Taleo rules', product: 'resume', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'resume_rewrite': { featureId: 'resume_rewrite', name: 'AI Resume Rewrites', description: 'Unlimited AI bullet rewrites & executive summaries', product: 'resume', accessLevel: 'unlimited', monthlyQuota: 60, warningThresholdPercent: 80, aiCreditCost: 10 },
      'job_applications': { featureId: 'job_applications', name: '1-Click Job Applies', description: 'Unlimited priority 1-click applies', product: 'jobs', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'job_matching_ai': { featureId: 'job_matching_ai', name: 'AI Job Match Score', description: 'Top of Recruiter Queue guarantee', product: 'jobs', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'salary_calculator': { featureId: 'salary_calculator', name: 'In-Hand CTC Calculator', description: 'Executive stock option / ESOP tax analysis', product: 'salary', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'salary_benchmarks': { featureId: 'salary_benchmarks', name: 'Salary Benchmarking', description: 'Full CXO / Principal benchmark dossiers', product: 'salary', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'cohort_access': { featureId: 'cohort_access', name: 'TPO Cohort Portal', description: 'Advanced career transition mentorship', product: 'colleges', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'placement_readiness': { featureId: 'placement_readiness', name: 'Readiness Audit', description: 'Executive leadership readiness scorecard', product: 'colleges', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'public_passport': { featureId: 'public_passport', name: 'Shareable Profile', description: 'Diamond Tier verified career passport', product: 'passport', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'verified_credential_badge': { featureId: 'verified_credential_badge', name: 'Verified Talent Badge', description: 'Cryptographic hash on blockchain ledger', product: 'passport', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'sarkari_vacancies': { featureId: 'sarkari_vacancies', name: 'Government Vacancies', description: 'PSU Grade A & Officer interview prep', product: 'government', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'exam_prep_ai': { featureId: 'exam_prep_ai', name: 'Exam AI Prep & Alerts', description: 'Mock technical screens with scoring', product: 'government', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'career_roadmaps': { featureId: 'career_roadmaps', name: 'Transition Roadmaps', description: 'Multi-role career transition roadmaps', product: 'careers', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'transition_milestone_tracker': { featureId: 'transition_milestone_tracker', name: 'Milestone Tracking', description: 'Unlimited transition tracking with AI audit', product: 'careers', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'skill_diagnostics': { featureId: 'skill_diagnostics', name: 'Technical Assessments', description: 'Full system architecture evaluation', product: 'learning', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'talent_search': { featureId: 'talent_search', name: 'Candidate Discovery', description: 'Full talent directory access', product: 'employers', accessLevel: 'advanced', monthlyQuota: -1, warningThresholdPercent: 100 },
      'candidate_contact_unlock': { featureId: 'candidate_contact_unlock', name: 'Direct Contact Unlocks', description: '15 verified direct contacts / month', product: 'employers', accessLevel: 'standard', monthlyQuota: 15, warningThresholdPercent: 80 }
    }
  },

  business: {
    id: 'business',
    name: 'Business',
    badge: 'Teams & Hiring',
    tagline: 'Complete recruitment OS and workforce upskilling for startups, agencies, and hiring teams.',
    description: 'Designed for startups, agencies, and recruiting teams. Bulk candidate searches, 50 contact unlocks, and 1,000 AI credits.',
    monthlyPricePaise: 249900, // ₹2,499
    monthlyPriceRupees: 2499,
    isAnnualPublished: false,
    currency: 'INR',
    rank: 4,
    includedAiCredits: 1000,
    highlightFeatures: [
      'Full Recruiter Workspace & Copilot Search',
      '50 Direct Verified Candidate Contact Unlocks',
      '5 Active Employer Job Requisitions',
      'Bulk ATS Resume Parsing (100/batch)',
      '1,000 Universal AI Credits'
    ],
    entitlements: {
      'resume_builder': { featureId: 'resume_builder', name: 'Resume Builder', description: 'Team resume review and candidate audit', product: 'resume', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'ats_scan': { featureId: 'ats_scan', name: 'ATS Resume Scans', description: 'Bulk resume ATS parsing (up to 100/batch)', product: 'resume', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'resume_rewrite': { featureId: 'resume_rewrite', name: 'AI Resume Rewrites', description: 'Team candidate optimization', product: 'resume', accessLevel: 'unlimited', monthlyQuota: 200, warningThresholdPercent: 80, aiCreditCost: 10 },
      'job_applications': { featureId: 'job_applications', name: '1-Click Job Applies', description: 'Recruitment workflow integration', product: 'jobs', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'job_matching_ai': { featureId: 'job_matching_ai', name: 'AI Job Match Score', description: '5 Active Employer Job Requisitions', product: 'jobs', accessLevel: 'unlimited', monthlyQuota: 5, warningThresholdPercent: 80 },
      'salary_calculator': { featureId: 'salary_calculator', name: 'In-Hand CTC Calculator', description: 'Workforce pay band & CTC modeler', product: 'salary', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'salary_benchmarks': { featureId: 'salary_benchmarks', name: 'Salary Benchmarking', description: 'Industry competitive salary analytics', product: 'salary', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'cohort_access': { featureId: 'cohort_access', name: 'TPO Cohort Portal', description: 'Direct college hiring pipeline access', product: 'colleges', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'placement_readiness': { featureId: 'placement_readiness', name: 'Readiness Audit', description: 'Campus placement drive management', product: 'colleges', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'public_passport': { featureId: 'public_passport', name: 'Shareable Profile', description: 'Corporate verified credential issuer', product: 'passport', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'verified_credential_badge': { featureId: 'verified_credential_badge', name: 'Verified Talent Badge', description: 'Issue verified employee credentials', product: 'passport', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'sarkari_vacancies': { featureId: 'sarkari_vacancies', name: 'Government Vacancies', description: 'Corporate CSR & public talent outreach', product: 'government', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'exam_prep_ai': { featureId: 'exam_prep_ai', name: 'Exam AI Prep & Alerts', description: 'Institutional training modules', product: 'government', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'career_roadmaps': { featureId: 'career_roadmaps', name: 'Transition Roadmaps', description: 'Employee upskilling & transition paths', product: 'careers', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'transition_milestone_tracker': { featureId: 'transition_milestone_tracker', name: 'Milestone Tracking', description: 'Team skill progression analytics', product: 'careers', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'skill_diagnostics': { featureId: 'skill_diagnostics', name: 'Technical Assessments', description: 'Custom technical diagnostic authoring', product: 'learning', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'talent_search': { featureId: 'talent_search', name: 'Candidate Discovery', description: 'Full talent database with AI copilot search', product: 'employers', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'candidate_contact_unlock': { featureId: 'candidate_contact_unlock', name: 'Direct Contact Unlocks', description: '50 direct verified contacts / month', product: 'employers', accessLevel: 'unlimited', monthlyQuota: 50, warningThresholdPercent: 80 }
    }
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    badge: 'Custom Contract',
    tagline: 'Tailored infrastructure, API access, and SLAs for universities, staffing firms, and enterprises.',
    description: 'Custom SLA, white-label placement portal, unlimited candidate unlocks, and institutional API access.',
    monthlyPricePaise: 0, // Negotiated
    monthlyPriceRupees: 0,
    isAnnualPublished: false,
    currency: 'INR',
    rank: 5,
    includedAiCredits: 5000,
    highlightFeatures: [
      'Custom SLA & High-Throughput ATS API',
      'Unlimited Candidate Contact Unlocks',
      'Campus-wide TPO Screening Deployment',
      'Dedicated Customer Success & AI Fine-Tuning',
      'Institutional Digital Credential Issuance'
    ],
    entitlements: {
      'resume_builder': { featureId: 'resume_builder', name: 'Resume Builder', description: 'Enterprise white-label resume portal', product: 'resume', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'ats_scan': { featureId: 'ats_scan', name: 'ATS Resume Scans', description: 'High-throughput ATS API endpoints', product: 'resume', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'resume_rewrite': { featureId: 'resume_rewrite', name: 'AI Resume Rewrites', description: 'Custom fine-tuned rewrite models', product: 'resume', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'job_applications': { featureId: 'job_applications', name: '1-Click Job Applies', description: 'Enterprise ATS direct sync', product: 'jobs', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'job_matching_ai': { featureId: 'job_matching_ai', name: 'AI Job Match Score', description: 'Custom candidate scoring models', product: 'jobs', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'salary_calculator': { featureId: 'salary_calculator', name: 'In-Hand CTC Calculator', description: 'Enterprise payroll & statutory tax API', product: 'salary', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'salary_benchmarks': { featureId: 'salary_benchmarks', name: 'Salary Benchmarking', description: 'Custom compensation survey integration', product: 'salary', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'cohort_access': { featureId: 'cohort_access', name: 'TPO Cohort Portal', description: 'Full campus-wide TPO screening deployment', product: 'colleges', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'placement_readiness': { featureId: 'placement_readiness', name: 'Readiness Audit', description: 'Institutional accreditation analytics', product: 'colleges', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'public_passport': { featureId: 'public_passport', name: 'Shareable Profile', description: 'Custom domain & co-branded credentials', product: 'passport', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'verified_credential_badge': { featureId: 'verified_credential_badge', name: 'Verified Talent Badge', description: 'Institutional digital certificate issuance', product: 'passport', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'sarkari_vacancies': { featureId: 'sarkari_vacancies', name: 'Government Vacancies', description: 'Government recruitment training integration', product: 'government', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'exam_prep_ai': { featureId: 'exam_prep_ai', name: 'Exam AI Prep & Alerts', description: 'Custom syllabus question bank builder', product: 'government', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'career_roadmaps': { featureId: 'career_roadmaps', name: 'Transition Roadmaps', description: 'Corporate reskilling & internal mobility', product: 'careers', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'transition_milestone_tracker': { featureId: 'transition_milestone_tracker', name: 'Milestone Tracking', description: 'Enterprise workforce transition telemetry', product: 'careers', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'skill_diagnostics': { featureId: 'skill_diagnostics', name: 'Technical Assessments', description: 'Custom proctored assessment pipelines', product: 'learning', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'talent_search': { featureId: 'talent_search', name: 'Candidate Discovery', description: 'Dedicated talent sourcer copilot & API', product: 'employers', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 },
      'candidate_contact_unlock': { featureId: 'candidate_contact_unlock', name: 'Direct Contact Unlocks', description: 'Unlimited candidate contact unlocks', product: 'employers', accessLevel: 'unlimited', monthlyQuota: -1, warningThresholdPercent: 100 }
    }
  }
};

/**
 * Formats integer paise into clean Indian Rupee format (e.g. 49900 -> ₹499)
 */
export function formatPaiseToRupees(paise: number): string {
  if (paise === 0) return 'Free';
  const rupees = Math.round(paise / 100);
  return `₹${rupees.toLocaleString('en-IN')}`;
}

/**
 * Returns available public subscription plans
 */
export function getAvailablePlans(): PlanDefinition[] {
  return [
    CENTRAL_PLAN_CATALOGUE.free,
    CENTRAL_PLAN_CATALOGUE.starter,
    CENTRAL_PLAN_CATALOGUE.pro,
    CENTRAL_PLAN_CATALOGUE.max,
    CENTRAL_PLAN_CATALOGUE.business,
  ];
}

/**
 * Looks up a specific plan definition safely
 */
export function getPlanById(planId: string): PlanDefinition {
  const normalized = (planId || 'free').toLowerCase() as PlanTier;
  return CENTRAL_PLAN_CATALOGUE[normalized] || CENTRAL_PLAN_CATALOGUE.free;
}

/**
 * Looks up entitlement for a specific feature on a plan
 */
export function getEntitlement(planId: string, featureId: string): FeatureEntitlement | null {
  const plan = getPlanById(planId);
  return plan.entitlements[featureId] || null;
}
