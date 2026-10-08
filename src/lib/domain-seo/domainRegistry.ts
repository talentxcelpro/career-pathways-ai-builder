// src/lib/domain-seo/domainRegistry.ts
/**
 * TalentXcel Dedicated Subdomain SEO Registry
 * 
 * Centralized registry defining dedicated SEO configurations for all 10 production domains
 * plus the legacy employer alias.
 * 
 * SINGLE SOURCE OF TRUTH for:
 * - Domain identity and canonical origin
 * - Employer alias non-competing rule (employer.talentxcel.in -> employers.talentxcel.in)
 * - Demand clusters and query ownership
 * - Page archetypes and schema types
 * - Sitemaps and indexation policies
 * - Cross-domain internal linking rules
 */

import { DomainSeoConfig, SubdomainId } from './types';

export const DOMAIN_SEO_CONFIGS: Record<SubdomainId, DomainSeoConfig> = {
  // =========================================================================
  // 1. CORE DOMAIN: talentxcel.in / www.talentxcel.in
  // =========================================================================
  CORE: {
    subdomainId: 'CORE',
    hostname: 'talentxcel.in',
    primaryOrigin: 'https://talentxcel.in',
    canonicalOrigin: 'https://talentxcel.in',
    isAlias: false,
    sitemapFilename: 'sitemap-core.xml',
    robotsPolicy: {
      publicDirectives: 'index, follow',
      privateDirectives: 'noindex, follow',
      disallowedPaths: ['/admin', '/api/', '/auth/callback', '/dashboard/settings'],
      sitemapUrl: 'https://talentxcel.in/sitemap-core.xml',
    },
    purpose: 'Global TalentXcel Ecosystem Authority, Brand Search, Community, and Cross-Product Gateway.',
    authoritativeEntities: ['Brand', 'Ecosystem', 'Industry Overview', 'Digital PR Whitepapers', 'Public Community'],
    demandClusters: [
      {
        id: 'CORE-DEM-01',
        queryPattern: 'talentxcel',
        sampleQueries: ['talentxcel', 'talentxcel login', 'talentxcel platform', 'talentxcel reviews'],
        intentCategory: 'GENERAL_CAREER',
        estimatedMonthlySearches: 25000,
        priority: 'P0',
        requiredEvidenceTypes: ['Brand Architecture', 'Verified Company Profile'],
        conversionAction: 'Global Ecosystem Registration',
      },
      {
        id: 'CORE-DEM-02',
        queryPattern: 'career research whitepaper [year]',
        sampleQueries: ['india tech fresher compensation report 2026', 'ai job displacement report 2026'],
        intentCategory: 'GENERAL_CAREER',
        estimatedMonthlySearches: 18000,
        priority: 'P1',
        requiredEvidenceTypes: ['Audited Survey Lake', 'Statistical Cross-Tabs'],
        conversionAction: 'Whitepaper Download / Newsletter Signup',
      },
      {
        id: 'CORE-DEM-03',
        queryPattern: 'top tech companies hiring [country]',
        sampleQueries: ['top tech employers in india', 'fastest growing startups hiring bangalore'],
        intentCategory: 'GENERAL_CAREER',
        estimatedMonthlySearches: 35000,
        priority: 'P1',
        requiredEvidenceTypes: ['Company Ledger', 'Verified Hiring Status'],
        conversionAction: 'Explore Employer Hub',
      },
    ],
    pageArchetypes: [
      {
        archetypeId: 'GLOBAL_HUB',
        name: 'TalentXcel Global Gateway',
        pathPattern: '/',
        primarySchemaType: 'WebSite',
        minWordCount: 500,
        minInventoryCount: 1,
        requiresUniqueData: false,
        crawlFrequency: 'daily',
        priorityWeight: 1.0,
        governorMinScore: 85,
      },
      {
        archetypeId: 'EDITORIAL_RESEARCH',
        name: 'Primary Compensation & Hiring Whitepaper',
        pathPattern: '/research/[slug]',
        primarySchemaType: 'Report',
        minWordCount: 1500,
        minInventoryCount: 1,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 0.9,
        governorMinScore: 80,
      },
      {
        archetypeId: 'PUBLIC_COMMUNITY',
        name: 'Public Career Network Hub',
        pathPattern: '/network',
        primarySchemaType: 'CollectionPage',
        minWordCount: 400,
        minInventoryCount: 10,
        requiresUniqueData: false,
        crawlFrequency: 'daily',
        priorityWeight: 0.8,
        governorMinScore: 75,
      },
    ],
    internalLinkDirectives: [
      { targetUniverse: 'JOBS', relationship: 'OPPORTUNITY', anchorTextPattern: 'Browse live %OCCUPATION% vacancies', maxInboundPerEntity: 3 },
      { targetUniverse: 'RESUME', relationship: 'CREDENTIAL', anchorTextPattern: 'Build ATS resume for %OCCUPATION%', maxInboundPerEntity: 2 },
      { targetUniverse: 'CAREERS', relationship: 'AUTHORITY', anchorTextPattern: 'Explore %OCCUPATION% career path', maxInboundPerEntity: 2 },
    ],
    kpis: {
      primaryKpiName: 'Global Registrations per 1,000 Organic Clicks',
      secondaryKpis: ['Brand Search Share', 'Cross-Domain Navigation CTR'],
      targetYieldPer1kClicks: 230,
      expectedApplicationRatePct: 25.0,
    },
    staircaseMilestones: [
      { step: 1, targetDailyRegistrations: 2, requiredDailyClicks: 9, dominantSurface: 'Brand & Whitepapers', achieved: true },
      { step: 2, targetDailyRegistrations: 5, requiredDailyClicks: 22, dominantSurface: 'Whitepapers & Industry Hubs', achieved: false },
      { step: 12, targetDailyRegistrations: 1000, requiredDailyClicks: 4350, dominantSurface: 'Global Brand & Digital PR', achieved: false },
    ],
    experiments: [
      {
        experimentId: 'EXP-CORE-001',
        name: 'National Compensation Whitepaper Lead Magnet',
        subdomainId: 'CORE',
        targetArchetype: 'EDITORIAL_RESEARCH',
        hypothesis: 'Adding downloadable PDF whitepaper preview increases registration yield by 35%.',
        variantAControl: 'HTML Research Summary Only',
        variantBTreatment: 'HTML Summary + Gated Executive Compensation Chart PDF',
        targetMetric: 'REGISTRATION_YIELD',
        minSampleClicks: 50,
        status: 'ACTIVE',
        observedLiftPct: 32.5,
      },
    ],
    geographicExpansion: {
      primaryCountries: ['IN', 'AE', 'US', 'GB'],
      priorityStatesIndia: ['KA', 'MH', 'DL', 'TS', 'TN'],
      tier1Metros: ['Bangalore', 'Mumbai', 'Delhi-NCR', 'Hyderabad', 'Chennai'],
      tier2Hubs: ['Pune', 'Ahmedabad', 'Kolkata', 'Chandigarh', 'Jaipur'],
    },
    occupationExpansion: {
      minEvidenceTier: 'HIGH',
      requiredEvidenceTypes: ['Industry Hierarchy', 'Market Compensation'],
      maxInitialOccupations: 50,
    },
  },

  // =========================================================================
  // 2. JOBS DOMAIN: jobs.talentxcel.in
  // =========================================================================
  JOBS: {
    subdomainId: 'JOBS',
    hostname: 'jobs.talentxcel.in',
    primaryOrigin: 'https://jobs.talentxcel.in',
    canonicalOrigin: 'https://jobs.talentxcel.in',
    isAlias: false,
    sitemapFilename: 'sitemap-jobs.xml',
    robotsPolicy: {
      publicDirectives: 'index, follow',
      privateDirectives: 'noindex, follow',
      disallowedPaths: ['/api/', '/apply/submit', '/saved-jobs', '/alerts'],
      sitemapUrl: 'https://jobs.talentxcel.in/sitemap-jobs.xml',
    },
    purpose: 'Authoritative Job Search Engine, Single-Job Google for Jobs Indexation, Role x City Vacancy Discovery.',
    authoritativeEntities: ['JobPosting', 'Occupation', 'City', 'Employer Vacancies', 'Fresher Hiring', 'Remote Work'],
    demandClusters: [
      {
        id: 'JOBS-DEM-01',
        queryPattern: '[occupation] jobs in [city]',
        sampleQueries: ['software engineer jobs in bangalore', 'data analyst jobs in hyderabad', 'frontend developer jobs pune'],
        intentCategory: 'JOB_SEEKING',
        estimatedMonthlySearches: 180000,
        priority: 'P0',
        requiredEvidenceTypes: ['Active Vacancies >= 3', 'Verified Base Salary'],
        conversionAction: 'Job Application / One-Click Apply',
      },
      {
        id: 'JOBS-DEM-02',
        queryPattern: '[occupation] jobs for freshers in [city]',
        sampleQueries: ['be fresher jobs in bangalore', 'software engineer fresher jobs in bangalore', 'fresher data analyst jobs noida'],
        intentCategory: 'JOB_SEEKING',
        estimatedMonthlySearches: 120000,
        priority: 'P0',
        requiredEvidenceTypes: ['Fresher/Entry-Level Vacancies >= 2', 'Zero Experience Criteria'],
        conversionAction: 'Apply as Fresher / ATS Check',
      },
      {
        id: 'JOBS-DEM-03',
        queryPattern: 'remote [occupation] jobs',
        sampleQueries: ['remote python developer jobs', 'remote devops engineer jobs india', 'work from home ui ux designer jobs'],
        intentCategory: 'JOB_SEEKING',
        estimatedMonthlySearches: 95000,
        priority: 'P1',
        requiredEvidenceTypes: ['TELECOMMUTE Marked Job', 'Applicant Location Rules'],
        conversionAction: 'Apply to Remote Job',
      },
    ],
    pageArchetypes: [
      {
        archetypeId: 'JOB_DETAIL',
        name: 'Single Verified Job Listing',
        pathPattern: '/jobs/[slug]',
        primarySchemaType: 'JobPosting',
        minWordCount: 200,
        minInventoryCount: 1,
        requiresUniqueData: true,
        crawlFrequency: 'daily',
        priorityWeight: 1.0,
        governorMinScore: 80,
      },
      {
        archetypeId: 'ROLE_CITY',
        name: 'Occupation Vacancies by City',
        pathPattern: '/jobs/[occupation]/[city]',
        primarySchemaType: 'CollectionPage',
        minWordCount: 350,
        minInventoryCount: 3,
        requiresUniqueData: true,
        crawlFrequency: 'daily',
        priorityWeight: 0.9,
        governorMinScore: 75,
      },
      {
        archetypeId: 'FRESHER_CITY',
        name: 'Fresher Vacancies by City',
        pathPattern: '/jobs/fresher/[occupation]/[city]',
        primarySchemaType: 'CollectionPage',
        minWordCount: 350,
        minInventoryCount: 2,
        requiresUniqueData: true,
        crawlFrequency: 'daily',
        priorityWeight: 0.9,
        governorMinScore: 75,
      },
    ],
    internalLinkDirectives: [
      { targetUniverse: 'SALARY', relationship: 'COMPENSATION', anchorTextPattern: 'Check average %OCCUPATION% salary in %CITY%', maxInboundPerEntity: 2 },
      { targetUniverse: 'RESUME', relationship: 'PREREQUISITE', anchorTextPattern: 'Optimize your %OCCUPATION% resume before applying', maxInboundPerEntity: 2 },
      { targetUniverse: 'CAREERS', relationship: 'AUTHORITY', anchorTextPattern: 'How to become a %OCCUPATION%', maxInboundPerEntity: 1 },
      { targetUniverse: 'LEARNING', relationship: 'CREDENTIAL', anchorTextPattern: 'Courses to qualify for %OCCUPATION% jobs', maxInboundPerEntity: 1 },
    ],
    kpis: {
      primaryKpiName: 'Job Registrations per 1,000 Organic Clicks',
      secondaryKpis: ['Applications per 1,000 Clicks', 'Matches per 1,000 Clicks', 'Google for Jobs Rich Snippet Impressions'],
      targetYieldPer1kClicks: 230,
      expectedApplicationRatePct: 33.0,
    },
    staircaseMilestones: [
      { step: 1, targetDailyRegistrations: 3, requiredDailyClicks: 13, dominantSurface: 'Fresher Bangalore Queries', achieved: false },
      { step: 2, targetDailyRegistrations: 10, requiredDailyClicks: 43, dominantSurface: '548 Single-Job Google Schema Broadcast', achieved: false },
      { step: 12, targetDailyRegistrations: 15000, requiredDailyClicks: 65200, dominantSurface: 'National & Global Job Engine', achieved: false },
    ],
    experiments: [
      {
        experimentId: 'EXP-JOBS-001',
        name: 'Fresher Title & Salary In-Snippet Proof',
        subdomainId: 'JOBS',
        targetArchetype: 'FRESHER_CITY',
        hypothesis: 'Displaying exact verified base LPA range in title increases SERP CTR by > 80%.',
        variantAControl: 'Software Engineer Jobs in Bangalore for Freshers | TalentXcel',
        variantBTreatment: 'Software Engineer Fresher Jobs in Bangalore (₹4.5L–₹9.2L LPA Verified) | TalentXcel',
        targetMetric: 'CTR',
        minSampleClicks: 30,
        status: 'WINNER',
        observedLiftPct: 110.5,
      },
    ],
    geographicExpansion: {
      primaryCountries: ['IN', 'AE'],
      priorityStatesIndia: ['KA', 'MH', 'DL', 'TS', 'TN', 'HR', 'PB'],
      tier1Metros: ['Bangalore', 'Hyderabad', 'Pune', 'Noida', 'Gurgaon', 'Mumbai', 'Chennai'],
      tier2Hubs: ['Patiala', 'Jaipur', 'Indore', 'Kochi', 'Coimbatore', 'Chandigarh'],
    },
    occupationExpansion: {
      minEvidenceTier: 'MEDIUM',
      requiredEvidenceTypes: ['Active Job Vacancies >= 2', 'Base Salary Data'],
      maxInitialOccupations: 120,
    },
  },

  // =========================================================================
  // 3. LEARNING DOMAIN: learning.talentxcel.in
  // =========================================================================
  LEARNING: {
    subdomainId: 'LEARNING',
    hostname: 'learning.talentxcel.in',
    primaryOrigin: 'https://learning.talentxcel.in',
    canonicalOrigin: 'https://learning.talentxcel.in',
    isAlias: false,
    sitemapFilename: 'sitemap-learning.xml',
    robotsPolicy: {
      publicDirectives: 'index, follow',
      privateDirectives: 'noindex, follow',
      disallowedPaths: ['/api/', '/progress', '/checkout'],
      sitemapUrl: 'https://learning.talentxcel.in/sitemap-learning.xml',
    },
    purpose: 'Standalone Global Learning Search Engine, Skill Certifications, Curricula, Course-to-Job Pathways.',
    authoritativeEntities: ['Skill', 'Course', 'Certification', 'Learning Path', 'Degree Pathway', 'Provider'],
    demandClusters: [
      {
        id: 'LRN-DEM-01',
        queryPattern: '[skill] certification [year]',
        sampleQueries: ['aws solutions architect certification 2026', 'python certification for beginners', 'kubernetes cka course syllabus'],
        intentCategory: 'SKILL_ACQUISITION',
        estimatedMonthlySearches: 140000,
        priority: 'P0',
        requiredEvidenceTypes: ['Accreditation Body', 'Curriculum Modules >= 4'],
        conversionAction: 'Start Learning Path / Free Diagnostic',
      },
      {
        id: 'LRN-DEM-02',
        queryPattern: '[occupation] learning path',
        sampleQueries: ['cloud engineer learning path', 'data scientist roadmap 2026', 'full stack developer syllabus'],
        intentCategory: 'SKILL_ACQUISITION',
        estimatedMonthlySearches: 85000,
        priority: 'P0',
        requiredEvidenceTypes: ['Sequential Stages >= 3', 'Linked Job Outcome Evidence'],
        conversionAction: 'Save Career Learning Path',
      },
    ],
    pageArchetypes: [
      {
        archetypeId: 'SKILL_DETAIL',
        name: 'Technical Skill Intelligence & Courses',
        pathPattern: '/skills/[skill]',
        primarySchemaType: 'Course',
        minWordCount: 400,
        minInventoryCount: 2,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 0.9,
        governorMinScore: 75,
      },
      {
        archetypeId: 'LEARNING_PATH',
        name: 'Role-Based Structured Pathway',
        pathPattern: '/pathways/[occupation]',
        primarySchemaType: 'EducationalOccupationalCredential',
        minWordCount: 600,
        minInventoryCount: 3,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 0.9,
        governorMinScore: 80,
      },
    ],
    internalLinkDirectives: [
      { targetUniverse: 'JOBS', relationship: 'OPPORTUNITY', anchorTextPattern: 'Jobs requiring %SKILL% skills', maxInboundPerEntity: 2 },
      { targetUniverse: 'SALARY', relationship: 'COMPENSATION', anchorTextPattern: 'Salary boost for %SKILL% certified professionals', maxInboundPerEntity: 1 },
      { targetUniverse: 'CAREERS', relationship: 'AUTHORITY', anchorTextPattern: 'Career roadmap for %OCCUPATION%', maxInboundPerEntity: 1 },
    ],
    kpis: {
      primaryKpiName: 'Learning Registrations per 1,000 Organic Clicks',
      secondaryKpis: ['Curriculum Engagement Rate', 'Pathway Saves', 'Downstream Job Applications'],
      targetYieldPer1kClicks: 111,
      expectedApplicationRatePct: 15.0,
    },
    staircaseMilestones: [
      { step: 1, targetDailyRegistrations: 1, requiredDailyClicks: 9, dominantSurface: 'Cloud & Python Certifications', achieved: false },
      { step: 12, targetDailyRegistrations: 3500, requiredDailyClicks: 31500, dominantSurface: 'Global Technical Skill Engine', achieved: false },
    ],
    experiments: [
      {
        experimentId: 'EXP-LRN-001',
        name: 'Course-to-Job Placement Evidence Badge',
        subdomainId: 'LEARNING',
        targetArchetype: 'LEARNING_PATH',
        hypothesis: 'Showing real median starting salary and active vacancy count on course pages increases registrations by 45%.',
        variantAControl: 'Curriculum & Modules Only',
        variantBTreatment: 'Curriculum + "Leads to ₹7.5L Average Salary & 48 Open Jobs" Badge',
        targetMetric: 'REGISTRATION_YIELD',
        minSampleClicks: 40,
        status: 'ACTIVE',
        observedLiftPct: 42.0,
      },
    ],
    geographicExpansion: {
      primaryCountries: ['IN', 'US', 'GB', 'AE'],
      priorityStatesIndia: ['KA', 'MH', 'DL', 'TS', 'TN'],
      tier1Metros: ['Bangalore', 'Hyderabad', 'Pune', 'Noida', 'Mumbai'],
      tier2Hubs: ['Jaipur', 'Indore', 'Kochi', 'Coimbatore'],
    },
    occupationExpansion: {
      minEvidenceTier: 'HIGH',
      requiredEvidenceTypes: ['Curriculum Modules', 'Prerequisite Graph'],
      maxInitialOccupations: 75,
    },
  },

  // =========================================================================
  // 4. CAREER PASSPORT DOMAIN: passport.talentxcel.in
  // =========================================================================
  PASSPORT: {
    subdomainId: 'PASSPORT',
    hostname: 'passport.talentxcel.in',
    primaryOrigin: 'https://passport.talentxcel.in',
    canonicalOrigin: 'https://passport.talentxcel.in',
    isAlias: false,
    sitemapFilename: 'sitemap-passport.xml',
    robotsPolicy: {
      publicDirectives: 'index, follow',
      privateDirectives: 'noindex, nofollow',
      disallowedPaths: ['/settings', '/security', '/edit', '/api/'],
      sitemapUrl: 'https://passport.talentxcel.in/sitemap-passport.xml',
    },
    purpose: 'Verified Talent Profile Authority. ONLY explicitly public, consented profiles are indexable. All private profiles strictly NOINDEX.',
    authoritativeEntities: ['Public Career Passport', 'Verified Skills', 'Talent Score (Public Opt-In)', 'Verified Portfolio'],
    demandClusters: [
      {
        id: 'PAS-DEM-01',
        queryPattern: '[name] talent passport',
        sampleQueries: ['verified talent passport', 'career passport verification', 'talentxcel talent score'],
        intentCategory: 'PROFILE_VERIFICATION',
        estimatedMonthlySearches: 15000,
        priority: 'P1',
        requiredEvidenceTypes: ['Opt-In Consent Flag', 'Public Visibility Enabled', 'Zero Sensitive PII'],
        conversionAction: 'Create Your Verified Passport',
      },
    ],
    pageArchetypes: [
      {
        archetypeId: 'PUBLIC_PROFILE',
        name: 'Public Consented Career Passport',
        pathPattern: '/passport/[handle]',
        primarySchemaType: 'ProfilePage',
        minWordCount: 250,
        minInventoryCount: 1,
        requiresUniqueData: true,
        crawlFrequency: 'monthly',
        priorityWeight: 0.6,
        governorMinScore: 70,
      },
    ],
    internalLinkDirectives: [
      { targetUniverse: 'JOBS', relationship: 'OPPORTUNITY', anchorTextPattern: 'Match %OCCUPATION% passport with open jobs', maxInboundPerEntity: 1 },
      { targetUniverse: 'RESUME', relationship: 'CREDENTIAL', anchorTextPattern: 'Generate ATS resume from Passport', maxInboundPerEntity: 1 },
    ],
    kpis: {
      primaryKpiName: 'Passport Registrations per 1,000 Organic Clicks',
      secondaryKpis: ['Public Profile Verification Clicks', 'Profile-to-Application Conversion'],
      targetYieldPer1kClicks: 150,
      expectedApplicationRatePct: 20.0,
    },
    staircaseMilestones: [
      { step: 1, targetDailyRegistrations: 1, requiredDailyClicks: 7, dominantSurface: 'Public Verified Profiles', achieved: false },
      { step: 12, targetDailyRegistrations: 1000, requiredDailyClicks: 6700, dominantSurface: 'Global Talent Identity Network', achieved: false },
    ],
    experiments: [
      {
        experimentId: 'EXP-PAS-001',
        name: 'Verified Talent Score Schema Badge',
        subdomainId: 'PASSPORT',
        targetArchetype: 'PUBLIC_PROFILE',
        hypothesis: 'Displaying cryptographic verification badge in schema increases trust and inbound employer discovery.',
        variantAControl: 'Standard ProfilePage Schema',
        variantBTreatment: 'ProfilePage + verifiedSkills + credentialIssued Structured Data',
        targetMetric: 'CTR',
        minSampleClicks: 20,
        status: 'ACTIVE',
        observedLiftPct: 28.0,
      },
    ],
    geographicExpansion: {
      primaryCountries: ['IN', 'AE', 'US', 'GB'],
      priorityStatesIndia: ['KA', 'MH', 'DL', 'TS'],
      tier1Metros: ['Bangalore', 'Hyderabad', 'Pune', 'Delhi-NCR'],
      tier2Hubs: ['Jaipur', 'Chandigarh', 'Ahmedabad'],
    },
    occupationExpansion: {
      minEvidenceTier: 'HIGH',
      requiredEvidenceTypes: ['Candidate Consent', 'Non-PII Sanitization'],
      maxInitialOccupations: 50,
    },
  },

  // =========================================================================
  // 5. GOVERNMENT DOMAIN: government.talentxcel.in
  // =========================================================================
  GOVERNMENT: {
    subdomainId: 'GOVERNMENT',
    hostname: 'government.talentxcel.in',
    primaryOrigin: 'https://government.talentxcel.in',
    canonicalOrigin: 'https://government.talentxcel.in',
    isAlias: false,
    sitemapFilename: 'sitemap-government.xml',
    robotsPolicy: {
      publicDirectives: 'index, follow',
      privateDirectives: 'noindex, follow',
      disallowedPaths: ['/api/', '/admit-card/download'],
      sitemapUrl: 'https://government.talentxcel.in/sitemap-government.xml',
    },
    purpose: 'Verified Public Sector, Commission & Gazette Examination Intelligence. Official notifications only.',
    authoritativeEntities: ['Government Department', 'Recruitment Notification', 'Public Exam', 'Syllabus', 'Pay Scale / 7th CPC'],
    demandClusters: [
      {
        id: 'GOV-DEM-01',
        queryPattern: 'government jobs [year] [qualification]',
        sampleQueries: ['upsc recruitment 2026', 'ssc cgl notification 2026', 'sarkari naukri for graduates 2026', 'railway recruitment board vacancy'],
        intentCategory: 'GOVERNMENT_EXAM',
        estimatedMonthlySearches: 450000,
        priority: 'P0',
        requiredEvidenceTypes: ['Gazette / Official Source URL', 'Valid Closing Date', 'Pay Level / CPC'],
        conversionAction: 'Eligibility Check / Notification Alert',
      },
      {
        id: 'GOV-DEM-02',
        queryPattern: '[department] recruitment [state]',
        sampleQueries: ['kpsc recruitment 2026 karnataka', 'mpsc notification 2026 maharashtra', 'uppsc recruitment uttar pradesh'],
        intentCategory: 'GOVERNMENT_EXAM',
        estimatedMonthlySearches: 210000,
        priority: 'P1',
        requiredEvidenceTypes: ['State PSC Notice', 'Domicile Criteria'],
        conversionAction: 'State Eligibility Verification',
      },
    ],
    pageArchetypes: [
      {
        archetypeId: 'GOV_RECRUITMENT',
        name: 'Official Recruitment Notification',
        pathPattern: '/government-jobs/[slug]',
        primarySchemaType: 'JobPosting',
        minWordCount: 400,
        minInventoryCount: 1,
        requiresUniqueData: true,
        crawlFrequency: 'daily',
        priorityWeight: 1.0,
        governorMinScore: 85,
      },
      {
        archetypeId: 'GOV_EXAM_SYLLABUS',
        name: 'Public Examination Syllabus & Pattern',
        pathPattern: '/government-jobs/exams/[exam-slug]',
        primarySchemaType: 'Article',
        minWordCount: 750,
        minInventoryCount: 1,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 0.9,
        governorMinScore: 80,
      },
    ],
    internalLinkDirectives: [
      { targetUniverse: 'COLLEGES', relationship: 'PREREQUISITE', anchorTextPattern: 'Eligible degree programs for %EXAM%', maxInboundPerEntity: 1 },
      { targetUniverse: 'SALARY', relationship: 'COMPENSATION', anchorTextPattern: '7th Pay Commission pay scale for %ROLE%', maxInboundPerEntity: 1 },
    ],
    kpis: {
      primaryKpiName: 'Government Registrations per 1,000 Organic Clicks',
      secondaryKpis: ['Notification Alert Subscriptions', 'Admit Card Link Clicks'],
      targetYieldPer1kClicks: 180,
      expectedApplicationRatePct: 28.0,
    },
    staircaseMilestones: [
      { step: 1, targetDailyRegistrations: 1, requiredDailyClicks: 6, dominantSurface: 'UPSC & SSC Gazette Alerts', achieved: false },
      { step: 12, targetDailyRegistrations: 2500, requiredDailyClicks: 13900, dominantSurface: 'National Gazette & PSC Network', achieved: false },
    ],
    experiments: [
      {
        experimentId: 'EXP-GOV-001',
        name: 'Official Gazette Verification Shield',
        subdomainId: 'GOVERNMENT',
        targetArchetype: 'GOV_RECRUITMENT',
        hypothesis: 'Explicit "Verified against Official Gazette PDF" callout increases CTR by 60% over aggregators.',
        variantAControl: 'Standard Job Notice Title',
        variantBTreatment: 'Notice Title + "[Official Gazette Verified & Direct PDF]"',
        targetMetric: 'CTR',
        minSampleClicks: 35,
        status: 'ACTIVE',
        observedLiftPct: 58.4,
      },
    ],
    geographicExpansion: {
      primaryCountries: ['IN'],
      priorityStatesIndia: ['DL', 'KA', 'MH', 'UP', 'TS', 'TN', 'WB', 'RJ', 'PB'],
      tier1Metros: ['New Delhi', 'Bangalore', 'Mumbai', 'Hyderabad', 'Lucknow'],
      tier2Hubs: ['Patna', 'Bhopal', 'Jaipur', 'Chandigarh', 'Dehradun'],
    },
    occupationExpansion: {
      minEvidenceTier: 'HIGH',
      requiredEvidenceTypes: ['Official Gazette Notice', 'Pay Scale Data'],
      maxInitialOccupations: 40,
    },
  },

  // =========================================================================
  // 6. EMPLOYERS DOMAIN: employers.talentxcel.in (PRIMARY EMPLOYER AUTHORITY)
  // =========================================================================
  EMPLOYERS: {
    subdomainId: 'EMPLOYERS',
    hostname: 'employers.talentxcel.in',
    primaryOrigin: 'https://employers.talentxcel.in',
    canonicalOrigin: 'https://employers.talentxcel.in',
    isAlias: false,
    sitemapFilename: 'sitemap-employers.xml',
    robotsPolicy: {
      publicDirectives: 'index, follow',
      privateDirectives: 'noindex, follow',
      disallowedPaths: ['/dashboard', '/candidates/private', '/billing', '/api/'],
      sitemapUrl: 'https://employers.talentxcel.in/sitemap-employers.xml',
    },
    purpose: 'Authoritative Employer Hub & Recruiter OS. Primary authority for verified company profiles, hiring hubs, and corporate careers.',
    authoritativeEntities: ['Company Profile', 'Verified Employer', 'Hiring Hub', 'Corporate Culture', 'Workplace Ratings'],
    demandClusters: [
      {
        id: 'EMP-DEM-01',
        queryPattern: '[company] careers and jobs',
        sampleQueries: ['tcs careers bangalore', 'infosys hiring freshers 2026', 'google india careers', 'flipkart tech hiring'],
        intentCategory: 'EMPLOYER_BRAND',
        estimatedMonthlySearches: 90000,
        priority: 'P0',
        requiredEvidenceTypes: ['Verified Employer DB Row', 'Active Vacancies >= 1'],
        conversionAction: 'View Open Company Vacancies',
      },
      {
        id: 'EMP-DEM-02',
        queryPattern: 'hire [occupation] in [city]',
        sampleQueries: ['hire react developer bangalore', 'hire full stack engineers hyderabad', 'tech recruitment agencies india'],
        intentCategory: 'EMPLOYER_BRAND',
        estimatedMonthlySearches: 45000,
        priority: 'P1',
        requiredEvidenceTypes: ['Candidate Talent Pool Count', 'Pricing Transparency'],
        conversionAction: 'Post a Job / Request Recruiter Demo',
      },
    ],
    pageArchetypes: [
      {
        archetypeId: 'COMPANY_PROFILE',
        name: 'Verified Company Overview & Culture',
        pathPattern: '/companies/[company-slug]',
        primarySchemaType: 'Organization',
        minWordCount: 400,
        minInventoryCount: 1,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 0.9,
        governorMinScore: 80,
      },
      {
        archetypeId: 'COMPANY_CAREERS',
        name: 'Company Active Careers & Openings',
        pathPattern: '/companies/[company-slug]/jobs',
        primarySchemaType: 'CollectionPage',
        minWordCount: 300,
        minInventoryCount: 2,
        requiresUniqueData: true,
        crawlFrequency: 'daily',
        priorityWeight: 1.0,
        governorMinScore: 85,
      },
    ],
    internalLinkDirectives: [
      { targetUniverse: 'JOBS', relationship: 'OPPORTUNITY', anchorTextPattern: 'All live jobs at %COMPANY%', maxInboundPerEntity: 3 },
      { targetUniverse: 'SALARY', relationship: 'COMPENSATION', anchorTextPattern: 'Verified %COMPANY% salary benchmarks', maxInboundPerEntity: 2 },
    ],
    kpis: {
      primaryKpiName: 'Employer & Candidate Registrations per 1,000 Clicks',
      secondaryKpis: ['Job Post Submissions', 'Recruiter Inquiries', 'Applicant Views'],
      targetYieldPer1kClicks: 160,
      expectedApplicationRatePct: 22.0,
    },
    staircaseMilestones: [
      { step: 1, targetDailyRegistrations: 1, requiredDailyClicks: 7, dominantSurface: 'Top Tech Company Profiles', achieved: false },
      { step: 12, targetDailyRegistrations: 2000, requiredDailyClicks: 12500, dominantSurface: 'National Employer Branding Hub', achieved: false },
    ],
    experiments: [
      {
        experimentId: 'EXP-EMP-001',
        name: 'Verified Employer Trust Badge & Response Time Proof',
        subdomainId: 'EMPLOYERS',
        targetArchetype: 'COMPANY_PROFILE',
        hypothesis: 'Displaying "Verified Direct Employer • 24h Average Application Response" increases candidate applications by 40%.',
        variantAControl: 'Basic Company Bio & Stats',
        variantBTreatment: 'Verified Employer Badge + Fast-Response Guarantee',
        targetMetric: 'APPLICATION_YIELD',
        minSampleClicks: 30,
        status: 'ACTIVE',
        observedLiftPct: 38.0,
      },
    ],
    geographicExpansion: {
      primaryCountries: ['IN', 'AE', 'US'],
      priorityStatesIndia: ['KA', 'MH', 'DL', 'TS', 'TN'],
      tier1Metros: ['Bangalore', 'Mumbai', 'Hyderabad', 'Delhi-NCR', 'Chennai'],
      tier2Hubs: ['Pune', 'Ahmedabad', 'Kolkata'],
    },
    occupationExpansion: {
      minEvidenceTier: 'HIGH',
      requiredEvidenceTypes: ['Company Identity', 'Verified Active Jobs'],
      maxInitialOccupations: 50,
    },
  },

  // =========================================================================
  // 7. LEGACY EMPLOYER ALIAS: employer.talentxcel.in
  // STRICT CANONICAL RULE: Non-competing alias. Canonicalizes to employers.talentxcel.in
  // =========================================================================
  EMPLOYER_ALIAS: {
    subdomainId: 'EMPLOYER_ALIAS',
    hostname: 'employer.talentxcel.in',
    primaryOrigin: 'https://employer.talentxcel.in',
    canonicalOrigin: 'https://employers.talentxcel.in', // FORCED CANONICAL TO AUTHORITATIVE HOST
    isAlias: true,
    aliasOf: 'EMPLOYERS',
    sitemapFilename: 'sitemap-employers.xml', // Shared sitemap points strictly to employers.talentxcel.in
    robotsPolicy: {
      publicDirectives: 'index, follow',
      privateDirectives: 'noindex, nofollow',
      disallowedPaths: ['*'], // Block all crawlers or enforce 301 redirect to employers.talentxcel.in
      sitemapUrl: 'https://employers.talentxcel.in/sitemap-employers.xml',
    },
    purpose: 'Legacy host alias for backward compatibility. Strictly non-competing; all canonical links point to employers.talentxcel.in.',
    authoritativeEntities: [], // Owns zero independent entities
    demandClusters: [], // Owns zero independent keyword clusters
    pageArchetypes: [],
    internalLinkDirectives: [
      { targetUniverse: 'EMPLOYERS', relationship: 'AUTHORITY', anchorTextPattern: 'Redirect to authoritative %COMPANY% page', maxInboundPerEntity: 1 },
    ],
    kpis: {
      primaryKpiName: 'Alias 301 Redirect / Canonical Adherence',
      secondaryKpis: ['Zero Duplicate Indexation'],
      targetYieldPer1kClicks: 0,
      expectedApplicationRatePct: 0,
    },
    staircaseMilestones: [],
    experiments: [],
    geographicExpansion: {
      primaryCountries: [],
      priorityStatesIndia: [],
      tier1Metros: [],
      tier2Hubs: [],
    },
    occupationExpansion: {
      minEvidenceTier: 'BASIC',
      requiredEvidenceTypes: [],
      maxInitialOccupations: 0,
    },
  },

  // =========================================================================
  // 8. COLLEGES DOMAIN: colleges.talentxcel.in
  // =========================================================================
  COLLEGES: {
    subdomainId: 'COLLEGES',
    hostname: 'colleges.talentxcel.in',
    primaryOrigin: 'https://colleges.talentxcel.in',
    canonicalOrigin: 'https://colleges.talentxcel.in',
    isAlias: false,
    sitemapFilename: 'sitemap-colleges.xml',
    robotsPolicy: {
      publicDirectives: 'index, follow',
      privateDirectives: 'noindex, follow',
      disallowedPaths: ['/api/', '/internal-rankings'],
      sitemapUrl: 'https://colleges.talentxcel.in/sitemap-colleges.xml',
    },
    purpose: 'Authoritative Higher Education Search Engine backed by 10,250+ verified institutions, placements, and degrees.',
    authoritativeEntities: ['College', 'University', 'Degree Program', 'Placement Dossier', 'Admission Cutoff', 'Scholarship'],
    demandClusters: [
      {
        id: 'COL-DEM-01',
        queryPattern: '[college] placements [year]',
        sampleQueries: ['iit bombay placement statistics 2026', 'bits pilani average package cse', 'vit vellore placement report'],
        intentCategory: 'COLLEGE_ADMISSION',
        estimatedMonthlySearches: 175000,
        priority: 'P0',
        requiredEvidenceTypes: ['Audited Placement Report', 'Verified Median CTC'],
        conversionAction: 'Compare Placements / Explore Career Pathway',
      },
      {
        id: 'COL-DEM-02',
        queryPattern: 'top [degree] colleges in [city]',
        sampleQueries: ['top btech colleges in bangalore', 'best mba colleges in pune', 'top engineering colleges hyderabad'],
        intentCategory: 'COLLEGE_ADMISSION',
        estimatedMonthlySearches: 130000,
        priority: 'P0',
        requiredEvidenceTypes: ['Accreditation (NIRF/NAAC)', 'Verified Course Catalog'],
        conversionAction: 'Download College Brochure / Check Cutoffs',
      },
    ],
    pageArchetypes: [
      {
        archetypeId: 'COLLEGE_PROFILE',
        name: 'Verified Institution Profile & NIRF Data',
        pathPattern: '/colleges/[college-slug]',
        primarySchemaType: 'CollegeOrUniversity',
        minWordCount: 500,
        minInventoryCount: 1,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 0.9,
        governorMinScore: 80,
      },
      {
        archetypeId: 'COLLEGE_PLACEMENT',
        name: 'Audited Placement Report & Alumni Outcomes',
        pathPattern: '/colleges/[college-slug]/placements',
        primarySchemaType: 'ItemPage',
        minWordCount: 450,
        minInventoryCount: 1,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 0.9,
        governorMinScore: 80,
      },
    ],
    internalLinkDirectives: [
      { targetUniverse: 'CAREERS', relationship: 'AUTHORITY', anchorTextPattern: 'Career options after graduating from %COLLEGE%', maxInboundPerEntity: 2 },
      { targetUniverse: 'SALARY', relationship: 'COMPENSATION', anchorTextPattern: 'Expected starting salary for %DEGREE% graduates', maxInboundPerEntity: 1 },
      { targetUniverse: 'JOBS', relationship: 'OPPORTUNITY', anchorTextPattern: 'Campus recruitment and fresher jobs for %DEGREE%', maxInboundPerEntity: 2 },
    ],
    kpis: {
      primaryKpiName: 'College Registrations per 1,000 Organic Clicks',
      secondaryKpis: ['Placement Comparison Clicks', 'Career Pathway Transitions'],
      targetYieldPer1kClicks: 95,
      expectedApplicationRatePct: 18.0,
    },
    staircaseMilestones: [
      { step: 1, targetDailyRegistrations: 1, requiredDailyClicks: 11, dominantSurface: 'Top IIT/NIT Placement Reports', achieved: false },
      { step: 12, targetDailyRegistrations: 2500, requiredDailyClicks: 26300, dominantSurface: '10,250+ Verified College Directory', achieved: false },
    ],
    experiments: [
      {
        experimentId: 'EXP-COL-001',
        name: 'Audited Placement Percentile Table Schema',
        subdomainId: 'COLLEGES',
        targetArchetype: 'COLLEGE_PLACEMENT',
        hypothesis: 'Presenting structured median CTC and top recruiters in schema table increases SERP clicks by 50%.',
        variantAControl: 'Text Summary of Placements',
        variantBTreatment: 'Interactive Percentile Table (Median, High, Tech Share)',
        targetMetric: 'CTR',
        minSampleClicks: 30,
        status: 'ACTIVE',
        observedLiftPct: 44.5,
      },
    ],
    geographicExpansion: {
      primaryCountries: ['IN', 'US', 'GB'],
      priorityStatesIndia: ['KA', 'MH', 'TN', 'DL', 'TS', 'UP', 'WB'],
      tier1Metros: ['Bangalore', 'Mumbai', 'Chennai', 'Delhi-NCR', 'Hyderabad'],
      tier2Hubs: ['Pune', 'Vellore', 'Pilani', 'Roorkee', 'Kharagpur', 'Coimbatore'],
    },
    occupationExpansion: {
      minEvidenceTier: 'HIGH',
      requiredEvidenceTypes: ['Placement Dossier', 'Accredited Curriculum'],
      maxInitialOccupations: 60,
    },
  },

  // =========================================================================
  // 9. CAREERS DOMAIN: careers.talentxcel.in
  // =========================================================================
  CAREERS: {
    subdomainId: 'CAREERS',
    hostname: 'careers.talentxcel.in',
    primaryOrigin: 'https://careers.talentxcel.in',
    canonicalOrigin: 'https://careers.talentxcel.in',
    isAlias: false,
    sitemapFilename: 'sitemap-careers.xml',
    robotsPolicy: {
      publicDirectives: 'index, follow',
      privateDirectives: 'noindex, follow',
      disallowedPaths: ['/api/', '/assessment/internal'],
      sitemapUrl: 'https://careers.talentxcel.in/sitemap-careers.xml',
    },
    purpose: 'Career Intelligence Engine, "How to Become" Guides, 5-Way Cross-Entity Pathways, Career Switch Maps.',
    authoritativeEntities: ['Career Pathway', 'How to Become Guide', 'Occupation Roadmap', 'Career Switch Matrix', 'Skill Taxonomy'],
    demandClusters: [
      {
        id: 'CAR-DEM-01',
        queryPattern: 'how to become [occupation]',
        sampleQueries: ['how to become a data analyst', 'how to become a cloud architect', 'how to become a product manager with no experience'],
        intentCategory: 'CAREER_EXPLORATION',
        estimatedMonthlySearches: 165000,
        priority: 'P0',
        requiredEvidenceTypes: ['Step-by-Step Milestones >= 4', 'Connected Learning + Salary + Job Data'],
        conversionAction: 'Create Career Roadmap / Free Assessment',
      },
      {
        id: 'CAR-DEM-02',
        queryPattern: 'career options after [degree]',
        sampleQueries: ['career options after bca', 'jobs after btech cse', 'career options after bcom'],
        intentCategory: 'CAREER_EXPLORATION',
        estimatedMonthlySearches: 110000,
        priority: 'P0',
        requiredEvidenceTypes: ['Degree-to-Role Mapping >= 5', 'Salary Expectations'],
        conversionAction: 'Map Your Degree to Careers',
      },
      {
        id: 'CAR-DEM-03',
        queryPattern: 'how to switch career to [occupation]',
        sampleQueries: ['how to switch from support to devops', 'switching from non tech to data science'],
        intentCategory: 'CAREER_EXPLORATION',
        estimatedMonthlySearches: 55000,
        priority: 'P1',
        requiredEvidenceTypes: ['Skill Gap Analysis', 'Transition Timelines'],
        conversionAction: 'Run Career Switch Simulation',
      },
    ],
    pageArchetypes: [
      {
        archetypeId: 'HOW_TO_BECOME',
        name: 'Comprehensive "How to Become" Guide',
        pathPattern: '/how-to-become/[occupation]',
        primarySchemaType: 'HowTo',
        minWordCount: 800,
        minInventoryCount: 1,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 0.9,
        governorMinScore: 85,
      },
      {
        archetypeId: 'CAREER_PATHWAY',
        name: '5-Way Entity Career Graph',
        pathPattern: '/career-map/[occupation]',
        primarySchemaType: 'OccupationalExperienceRequirements',
        minWordCount: 650,
        minInventoryCount: 1,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 0.9,
        governorMinScore: 85,
      },
    ],
    internalLinkDirectives: [
      { targetUniverse: 'JOBS', relationship: 'OPPORTUNITY', anchorTextPattern: 'Live %OCCUPATION% job openings', maxInboundPerEntity: 3 },
      { targetUniverse: 'SALARY', relationship: 'COMPENSATION', anchorTextPattern: 'Detailed %OCCUPATION% salary breakdown', maxInboundPerEntity: 2 },
      { targetUniverse: 'LEARNING', relationship: 'PREREQUISITE', anchorTextPattern: 'Courses to learn %SKILL% for %OCCUPATION%', maxInboundPerEntity: 2 },
      { targetUniverse: 'RESUME', relationship: 'CREDENTIAL', anchorTextPattern: '%OCCUPATION% resume format and keywords', maxInboundPerEntity: 2 },
    ],
    kpis: {
      primaryKpiName: 'Career Registrations per 1,000 Organic Clicks',
      secondaryKpis: ['Career Assessment Completions', 'Path Saves', 'Downstream Job Applications'],
      targetYieldPer1kClicks: 181,
      expectedApplicationRatePct: 50.0,
    },
    staircaseMilestones: [
      { step: 1, targetDailyRegistrations: 2, requiredDailyClicks: 11, dominantSurface: 'How to Become Data Analyst', achieved: false },
      { step: 12, targetDailyRegistrations: 6000, requiredDailyClicks: 33100, dominantSurface: 'Global Career Intelligence Graph', achieved: false },
    ],
    experiments: [
      {
        experimentId: 'EXP-CAR-001',
        name: '5-Way Entity Graph Cross-Linking Module',
        subdomainId: 'CAREERS',
        targetArchetype: 'CAREER_PATHWAY',
        hypothesis: 'Presenting immediate interconnected tabs for Jobs, Salary, Skills, Courses, and Resume increases conversion by 50%.',
        variantAControl: 'Sequential Text Article',
        variantBTreatment: 'Interactive 5-Way Graph Matrix with Direct Live CTAs',
        targetMetric: 'REGISTRATION_YIELD',
        minSampleClicks: 30,
        status: 'ACTIVE',
        observedLiftPct: 50.0,
      },
    ],
    geographicExpansion: {
      primaryCountries: ['IN', 'AE', 'US', 'GB'],
      priorityStatesIndia: ['KA', 'MH', 'DL', 'TS', 'TN'],
      tier1Metros: ['Bangalore', 'Hyderabad', 'Pune', 'Noida', 'Mumbai'],
      tier2Hubs: ['Jaipur', 'Indore', 'Kochi', 'Chandigarh'],
    },
    occupationExpansion: {
      minEvidenceTier: 'HIGH',
      requiredEvidenceTypes: ['5-Way Cross-Entity Links', 'Step-by-Step Milestones'],
      maxInitialOccupations: 90,
    },
  },

  // =========================================================================
  // 10. SALARY DOMAIN: salary.talentxcel.in
  // =========================================================================
  SALARY: {
    subdomainId: 'SALARY',
    hostname: 'salary.talentxcel.in',
    primaryOrigin: 'https://salary.talentxcel.in',
    canonicalOrigin: 'https://salary.talentxcel.in',
    isAlias: false,
    sitemapFilename: 'sitemap-salary.xml',
    robotsPolicy: {
      publicDirectives: 'index, follow',
      privateDirectives: 'noindex, follow',
      disallowedPaths: ['/api/', '/calculator/private'],
      sitemapUrl: 'https://salary.talentxcel.in/sitemap-salary.xml',
    },
    purpose: 'Audited Compensation Intelligence, Tiered LPA Benchmarks (P10, P25, Median, P75, P90), City vs Experience Spreads.',
    authoritativeEntities: ['Salary Benchmark', 'LPA Percentile Spread', 'Experience Level Pay', 'City Compensation Premium'],
    demandClusters: [
      {
        id: 'SAL-DEM-01',
        queryPattern: '[occupation] salary in [city]',
        sampleQueries: ['software engineer salary in bangalore', 'data analyst salary in hyderabad', 'frontend developer salary pune'],
        intentCategory: 'SALARY_BENCHMARK',
        estimatedMonthlySearches: 220000,
        priority: 'P0',
        requiredEvidenceTypes: ['>= 15 Audited Data Points', 'P10-P90 Spread', 'Currency LPA/AED/USD'],
        conversionAction: 'Check Your Pay Fair Value / View Matching High-Pay Jobs',
      },
      {
        id: 'SAL-DEM-02',
        queryPattern: '[occupation] salary for freshers',
        sampleQueries: ['software engineer fresher salary india', 'data analyst salary freshers bangalore', 'chartered accountant starting salary'],
        intentCategory: 'SALARY_BENCHMARK',
        estimatedMonthlySearches: 135000,
        priority: 'P0',
        requiredEvidenceTypes: ['Entry-Level Data Points >= 10', 'Verified Campus Placement Base'],
        conversionAction: 'Compare Fresher Offers / Apply to Above-Median Jobs',
      },
    ],
    pageArchetypes: [
      {
        archetypeId: 'ROLE_CITY_SALARY',
        name: 'Occupation Compensation by City',
        pathPattern: '/salary/[occupation]/[city]',
        primarySchemaType: 'Occupation',
        minWordCount: 450,
        minInventoryCount: 15,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 0.9,
        governorMinScore: 80,
      },
      {
        archetypeId: 'ROLE_EXPERIENCE_SALARY',
        name: 'Compensation Spread by Years of Experience',
        pathPattern: '/salary/[occupation]/experience',
        primarySchemaType: 'Occupation',
        minWordCount: 500,
        minInventoryCount: 20,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 0.9,
        governorMinScore: 80,
      },
    ],
    internalLinkDirectives: [
      { targetUniverse: 'JOBS', relationship: 'OPPORTUNITY', anchorTextPattern: 'Apply to %OCCUPATION% jobs paying above median (₹%P50%LPA)', maxInboundPerEntity: 3 },
      { targetUniverse: 'LEARNING', relationship: 'PREREQUISITE', anchorTextPattern: 'Skills that boost %OCCUPATION% salary to P90 tier', maxInboundPerEntity: 2 },
      { targetUniverse: 'RESUME', relationship: 'CREDENTIAL', anchorTextPattern: 'Tailor resume for top-paying %OCCUPATION% roles', maxInboundPerEntity: 1 },
    ],
    kpis: {
      primaryKpiName: 'Salary Registrations per 1,000 Organic Clicks',
      secondaryKpis: ['Salary Analyzer Submissions', 'High-Pay Job Clicks', 'Downstream Applications'],
      targetYieldPer1kClicks: 111,
      expectedApplicationRatePct: 40.0,
    },
    staircaseMilestones: [
      { step: 1, targetDailyRegistrations: 1, requiredDailyClicks: 9, dominantSurface: 'Bangalore Tech LPA Guides', achieved: false },
      { step: 12, targetDailyRegistrations: 4000, requiredDailyClicks: 36000, dominantSurface: 'National Compensation Transparency Lake', achieved: false },
    ],
    experiments: [
      {
        experimentId: 'EXP-SAL-001',
        name: 'Tiered LPA (Entry, Mid, Lead) + Above-Median Jobs Module',
        subdomainId: 'SALARY',
        targetArchetype: 'ROLE_CITY_SALARY',
        hypothesis: 'Presenting explicit LPA salary tiers alongside verified jobs paying at or above P75 increases application yield by 75%.',
        variantAControl: 'Static Salary Range Text',
        variantBTreatment: 'P10/P25/P50/P75/P90 Percentile Table + Direct Apply to P75+ Jobs',
        targetMetric: 'REGISTRATION_YIELD',
        minSampleClicks: 35,
        status: 'ACTIVE',
        observedLiftPct: 77.7,
      },
    ],
    geographicExpansion: {
      primaryCountries: ['IN', 'AE', 'US'],
      priorityStatesIndia: ['KA', 'MH', 'DL', 'TS', 'TN'],
      tier1Metros: ['Bangalore', 'Hyderabad', 'Pune', 'Noida', 'Mumbai', 'Gurgaon'],
      tier2Hubs: ['Jaipur', 'Ahmedabad', 'Kochi', 'Chandigarh'],
    },
    occupationExpansion: {
      minEvidenceTier: 'HIGH',
      requiredEvidenceTypes: ['>= 15 Data Points', 'Percentile Spread'],
      maxInitialOccupations: 80,
    },
  },

  // =========================================================================
  // 11. RESUME DOMAIN: resume.talentxcel.in
  // =========================================================================
  RESUME: {
    subdomainId: 'RESUME',
    hostname: 'resume.talentxcel.in',
    primaryOrigin: 'https://resume.talentxcel.in',
    canonicalOrigin: 'https://resume.talentxcel.in',
    isAlias: false,
    sitemapFilename: 'sitemap-resume.xml',
    robotsPolicy: {
      publicDirectives: 'index, follow',
      privateDirectives: 'noindex, follow',
      disallowedPaths: ['/api/', '/builder/saved', '/download/raw'],
      sitemapUrl: 'https://resume.talentxcel.in/sitemap-resume.xml',
    },
    purpose: 'High-Converting Resume & ATS Optimization Engine. ATS Keyword Banks, Role Resume Examples, Score Matchers.',
    authoritativeEntities: ['Resume Example', 'ATS Keyword Taxonomy', 'Resume Template', 'ATS Checker Tool', 'Cover Letter Template'],
    demandClusters: [
      {
        id: 'RES-DEM-01',
        queryPattern: '[occupation] resume keywords',
        sampleQueries: ['software engineer resume keywords for ats', 'data analyst ats resume keywords', 'devops engineer resume skills list'],
        intentCategory: 'RESUME_OPTIMIZATION',
        estimatedMonthlySearches: 195000,
        priority: 'P0',
        requiredEvidenceTypes: ['ATS Keyword Bank >= 20 Terms', 'Google XYZ Bullet Examples'],
        conversionAction: 'Check Resume ATS Score / Scan My Resume Free',
      },
      {
        id: 'RES-DEM-02',
        queryPattern: '[occupation] resume example for freshers',
        sampleQueries: ['fresher software engineer resume sample', 'data analyst resume for freshers free download', 'bca fresher resume template'],
        intentCategory: 'RESUME_OPTIMIZATION',
        estimatedMonthlySearches: 160000,
        priority: 'P0',
        requiredEvidenceTypes: ['Role Resume Template', 'Downloadable Word/PDF Format'],
        conversionAction: 'Create Resume with One Click',
      },
    ],
    pageArchetypes: [
      {
        archetypeId: 'ATS_KEYWORDS',
        name: 'Occupation ATS Keywords & Power Verbs',
        pathPattern: '/resume/[occupation]/ats-keywords',
        primarySchemaType: 'TechArticle',
        minWordCount: 500,
        minInventoryCount: 20,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 1.0,
        governorMinScore: 85,
      },
      {
        archetypeId: 'RESUME_EXAMPLE',
        name: 'Role-Specific Resume Example & Bullets',
        pathPattern: '/resume/[occupation]/examples',
        primarySchemaType: 'DigitalDocument',
        minWordCount: 600,
        minInventoryCount: 1,
        requiresUniqueData: true,
        crawlFrequency: 'weekly',
        priorityWeight: 0.9,
        governorMinScore: 80,
      },
    ],
    internalLinkDirectives: [
      { targetUniverse: 'JOBS', relationship: 'OPPORTUNITY', anchorTextPattern: 'Apply to %OCCUPATION% jobs matching this resume', maxInboundPerEntity: 3 },
      { targetUniverse: 'SALARY', relationship: 'COMPENSATION', anchorTextPattern: 'Expected compensation for this %OCCUPATION% resume profile', maxInboundPerEntity: 1 },
      { targetUniverse: 'CAREERS', relationship: 'AUTHORITY', anchorTextPattern: 'Career roadmap and progression for %OCCUPATION%', maxInboundPerEntity: 1 },
    ],
    kpis: {
      primaryKpiName: 'Resume Registrations per 1,000 Organic Clicks',
      secondaryKpis: ['ATS Checks Completed', 'Resumes Created', 'Downstream Job Applications'],
      targetYieldPer1kClicks: 357, // PROVEN #1 YIELD IN GROWTH LAB
      expectedApplicationRatePct: 55.0,
    },
    staircaseMilestones: [
      { step: 1, targetDailyRegistrations: 4, requiredDailyClicks: 11, dominantSurface: 'Tech ATS Keywords & Score Matcher', achieved: false },
      { step: 12, targetDailyRegistrations: 17500, requiredDailyClicks: 49000, dominantSurface: 'National & Global ATS Power Tool', achieved: false },
    ],
    experiments: [
      {
        experimentId: 'EXP-RES-001',
        name: 'Interactive ATS Keyword Matcher & Instant Score CTA',
        subdomainId: 'RESUME',
        targetArchetype: 'ATS_KEYWORDS',
        hypothesis: 'Offering an interactive paste-and-score box directly in the header increases registration yield to > 350 / 1k clicks.',
        variantAControl: 'Static List of ATS Keywords',
        variantBTreatment: 'Interactive Keyword Matcher Tool + 1-Click Resume Tailor CTA',
        targetMetric: 'REGISTRATION_YIELD',
        minSampleClicks: 30,
        status: 'WINNER',
        observedLiftPct: 64.3,
      },
    ],
    geographicExpansion: {
      primaryCountries: ['IN', 'US', 'GB', 'AE'],
      priorityStatesIndia: ['KA', 'MH', 'DL', 'TS', 'TN'],
      tier1Metros: ['Bangalore', 'Hyderabad', 'Pune', 'Noida', 'Mumbai', 'Gurgaon'],
      tier2Hubs: ['Jaipur', 'Indore', 'Kochi', 'Chandigarh'],
    },
    occupationExpansion: {
      minEvidenceTier: 'HIGH',
      requiredEvidenceTypes: ['ATS Keyword Bank >= 20', 'XYZ Bullets'],
      maxInitialOccupations: 100,
    },
  },
};

/**
 * Returns the domain SEO configuration for a specific subdomain ID.
 */
export function getDomainSeoConfig(subdomainId: SubdomainId): DomainSeoConfig {
  return DOMAIN_SEO_CONFIGS[subdomainId];
}

/**
 * Returns the domain SEO configuration for a given hostname.
 */
export function getDomainSeoConfigByHostname(hostname: string): DomainSeoConfig {
  const clean = hostname.split(':')[0].trim().toLowerCase();
  
  if (clean === 'talentxcel.in' || clean === 'www.talentxcel.in') return DOMAIN_SEO_CONFIGS.CORE;
  if (clean === 'jobs.talentxcel.in' || clean.startsWith('jobs.')) return DOMAIN_SEO_CONFIGS.JOBS;
  if (clean === 'learning.talentxcel.in' || clean.startsWith('learning.')) return DOMAIN_SEO_CONFIGS.LEARNING;
  if (clean === 'passport.talentxcel.in' || clean.startsWith('passport.')) return DOMAIN_SEO_CONFIGS.PASSPORT;
  if (clean === 'government.talentxcel.in' || clean.startsWith('government.')) return DOMAIN_SEO_CONFIGS.GOVERNMENT;
  if (clean === 'employer.talentxcel.in') return DOMAIN_SEO_CONFIGS.EMPLOYER_ALIAS;
  if (clean === 'employers.talentxcel.in' || clean.startsWith('employers.')) return DOMAIN_SEO_CONFIGS.EMPLOYERS;
  if (clean === 'colleges.talentxcel.in' || clean.startsWith('colleges.')) return DOMAIN_SEO_CONFIGS.COLLEGES;
  if (clean === 'careers.talentxcel.in' || clean.startsWith('careers.')) return DOMAIN_SEO_CONFIGS.CAREERS;
  if (clean === 'salary.talentxcel.in' || clean.startsWith('salary.')) return DOMAIN_SEO_CONFIGS.SALARY;
  if (clean === 'resume.talentxcel.in' || clean.startsWith('resume.')) return DOMAIN_SEO_CONFIGS.RESUME;

  return DOMAIN_SEO_CONFIGS.CORE;
}

/**
 * Returns all active authoritative domains (excluding aliases).
 */
export function getAuthoritativeDomains(): DomainSeoConfig[] {
  return Object.values(DOMAIN_SEO_CONFIGS).filter(d => !d.isAlias);
}

/**
 * Resolves the single authoritative SEO owner for any search query or intent.
 */
export function resolveAuthoritativeSubdomainForQuery(query: string): SubdomainId {
  const q = query.toLowerCase().trim();

  // 1. Resume / ATS intent
  if (/\b(resume|cv|ats|curriculum vitae|cover letter|ats score|ats check)\b/.test(q)) {
    return 'RESUME';
  }

  // 2. Salary / Compensation intent
  if (/\b(salary|pay|ctc|lpa|compensation|pay scale|package|p10|p90)\b/.test(q)) {
    return 'SALARY';
  }

  // 3. Learning / Courses / Certifications intent (higher specificity than general roadmaps)
  if (/\b(course|courses|certification|certifications|certified|bootcamp|skill path|syllabus|credentials)\b/.test(q)) {
    return 'LEARNING';
  }

  // 4. College / Degree / University intent
  if (/\b(college|colleges|university|campus|placements?|cutoff|admissions|nirf|fees)\b/.test(q)) {
    return 'COLLEGES';
  }

  // 5. Government jobs intent
  if (/\b(government|sarkari|upsc|ssc|psu|railway|psc|mpsc|kpsc|uppsc|gazette)\b/.test(q)) {
    return 'GOVERNMENT';
  }

  // 6. Career Path / How to become intent
  if (/\b(how to become|career path|career roadmap|switch career|career options after|roadmap)\b/.test(q)) {
    return 'CAREERS';
  }

  // 7. Employer / Company hiring intent
  if (/\b(hire|recruiter|employers|hiring agency|staffing|candidate sourcing)\b/.test(q)) {
    return 'EMPLOYERS';
  }

  // 8. Public Passport / Talent Score intent
  if (/\b(talent passport|public profile|talent score|verified credentials)\b/.test(q)) {
    return 'PASSPORT';
  }

  // 9. Job listings / Vacancies / Fresher jobs intent
  if (/\b(job|jobs|hiring|vacancy|vacancies|fresher|internship|walkin|opening|openings)\b/.test(q)) {
    return 'JOBS';
  }

  // Default ecosystem / brand authority
  return 'CORE';
}
