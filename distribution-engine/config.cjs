// distribution-engine/config.cjs
// Configuration file for TalentXcel Global Free Content Distribution Engine (Phase 1)
// Focus: Long-tail platform discovery, rigorous validation, contextual content adaptation & ethical distribution.

const path = require('path');

const ROOT_DIR = path.resolve(__dirname);
const DATA_DIR = path.join(ROOT_DIR, 'data');
const DB_PATH = path.join(DATA_DIR, 'distribution_engine.db');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');
const SEEDS_DIR = path.join(DATA_DIR, 'seeds');

module.exports = {
  ENGINE_NAME: 'TalentXcel Global Free Content Distribution Engine',
  VERSION: '1.0.0-phase1',

  // Ecosystem Targets
  ECOSYSTEM: {
    ROOT_DOMAIN: 'talentxcel.in',
    CANONICAL_URL: 'https://talentxcel.in',
    PROPERTIES: {
      HOME: { name: 'TalentXcel Home', url: 'https://talentxcel.in' },
      CAREERS: { name: 'TalentXcel Careers', url: 'https://talentxcel.in/careers' },
      RESUME_BUILDER: { name: 'TalentXcel Resume Builder', url: 'https://talentxcel.in/resume' },
      CAREER_PASSPORT: { name: 'TalentXcel Career Passport', url: 'https://talentxcel.in/passport' },
      PROFESSIONAL_NETWORK: { name: 'TalentXcel Professional Network', url: 'https://talentxcel.in/network' },
      JOBS: { name: 'TalentXcel Jobs', url: 'https://talentxcel.in/jobs' },
      LEARNING: { name: 'TalentXcel Learning', url: 'https://talentxcel.in/learning' },
      RESOURCES: { name: 'TalentXcel Career Resources', url: 'https://talentxcel.in/resources' }
    }
  },

  // Operational Targets
  TARGETS: {
    CANDIDATE_DISCOVERY: 10000,
    VERIFIED_FREE_PLATFORMS: 1000,
    PHASE1_PRIORITY_BATCH: 200,
    QUALITY_SCORE_THRESHOLD: 70
  },

  PATHS: {
    ROOT: ROOT_DIR,
    DATA: DATA_DIR,
    DB: DB_PATH,
    EXPORTS: EXPORTS_DIR,
    SEEDS: SEEDS_DIR
  },

  // 13-State Distribution Workflow State Machine
  WORKFLOW_STATES: {
    DISCOVERED: 'DISCOVERED',
    DUPLICATE: 'DUPLICATE',
    REJECTED: 'REJECTED',
    NEEDS_VERIFICATION: 'NEEDS_VERIFICATION',
    VERIFIED_FREE: 'VERIFIED_FREE',
    VERIFIED_PAID: 'VERIFIED_PAID',
    APPROVED: 'APPROVED',
    CONTENT_READY: 'CONTENT_READY',
    SUBMISSION_READY: 'SUBMISSION_READY',
    SUBMITTED: 'SUBMITTED',
    PUBLISHED: 'PUBLISHED',
    FAILED: 'FAILED',
    FOLLOW_UP_REQUIRED: 'FOLLOW_UP_REQUIRED'
  },

  // Platform Types (Long-tail focus)
  PLATFORM_TYPES: [
    'STARTUP_NEWS_INDEPENDENT',
    'STARTUP_DISCOVERY_PLATFORM',
    'FOUNDER_COMMUNITY',
    'SMALL_BUSINESS_NEWS',
    'LOCAL_BUSINESS_PUBLICATION',
    'HR_BLOG',
    'RECRUITMENT_BLOG',
    'CAREER_BLOG',
    'RESUME_BLOG',
    'JOB_SEARCH_COMMUNITY',
    'EMPLOYMENT_COMMUNITY',
    'SAAS_DIRECTORY_FREE',
    'TECH_BLOG_INDEPENDENT',
    'ENTREPRENEURSHIP_BLOG',
    'STUDENT_COMMUNITY',
    'COLLEGE_CAREER_COMMUNITY',
    'REGIONAL_STARTUP_PUB',
    'INDEPENDENT_NEWSLETTER',
    'FREE_BLOGGING_PLATFORM',
    'COMMUNITY_FORUM',
    'SOCIAL_PUBLISHING_PLATFORM',
    'FREE_BUSINESS_DIRECTORY',
    'NICHE_RESOURCE_DIRECTORY'
  ],

  // Geographies and Macro Regions
  GEOGRAPHIES: {
    INDIA: { region: 'South Asia', country: 'India', code: 'IN', majorCities: ['Bangalore', 'Mumbai', 'Delhi NCR', 'Hyderabad', 'Pune', 'Chennai'] },
    UNITED_STATES: { region: 'North America', country: 'United States', code: 'US', majorCities: ['San Francisco', 'Austin', 'New York', 'Seattle', 'Boston', 'Chicago'] },
    UNITED_KINGDOM: { region: 'Europe', country: 'United Kingdom', code: 'UK', majorCities: ['London', 'Manchester', 'Edinburgh', 'Birmingham', 'Bristol'] },
    CANADA: { region: 'North America', country: 'Canada', code: 'CA', majorCities: ['Toronto', 'Vancouver', 'Montreal', 'Waterloo', 'Calgary'] },
    AUSTRALIA: { region: 'Oceania', country: 'Australia', code: 'AU', majorCities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth'] },
    EUROPE: { region: 'Europe', country: 'Europe (Multi)', code: 'EU', majorCities: ['Berlin', 'Amsterdam', 'Stockholm', 'Dublin', 'Paris', 'Tallinn'] },
    SOUTHEAST_ASIA: { region: 'Southeast Asia', country: 'Southeast Asia (Multi)', code: 'SEA', majorCities: ['Singapore', 'Jakarta', 'Kuala Lumpur', 'Bangkok', 'Manila'] },
    MIDDLE_EAST: { region: 'Middle East', country: 'Middle East (Multi)', code: 'ME', majorCities: ['Dubai', 'Riyadh', 'Abu Dhabi', 'Tel Aviv', 'Doha'] },
    AFRICA: { region: 'Africa', country: 'Africa (Multi)', code: 'AF', majorCities: ['Nairobi', 'Lagos', 'Cape Town', 'Johannesburg', 'Cairo', 'Kigali'] },
    LATIN_AMERICA: { region: 'Latin America', country: 'Latin America (Multi)', code: 'LATAM', majorCities: ['São Paulo', 'Mexico City', 'Buenos Aires', 'Bogotá', 'Santiago'] }
  },

  // 100-Point Scoring Model Weights & Penalties
  SCORING_WEIGHTS: {
    RELEVANCE: 30,
    ACTIVITY: 20,
    EDITORIAL_QUALITY: 20,
    FREE_SUBMISSION: 15,
    AUDIENCE_RELEVANCE: 10,
    TECHNICAL_ACCESSIBILITY: 5
  },

  // 20 TalentXcel Content Categories
  CONTENT_CATEGORIES: [
    { id: 'JOB_SEARCH_ADVICE', name: 'Job Search Advice', target: 'CAREERS' },
    { id: 'RESUME_OPTIMIZATION', name: 'Resume Optimization', target: 'RESUME_BUILDER' },
    { id: 'ATS_RESUME_GUIDANCE', name: 'ATS Resume Guidance', target: 'RESUME_BUILDER' },
    { id: 'INTERVIEW_PREPARATION', name: 'Interview Preparation', target: 'CAREERS' },
    { id: 'CAREER_DEVELOPMENT', name: 'Career Development', target: 'CAREER_PASSPORT' },
    { id: 'LINKEDIN_PROFILE_IMPROVEMENT', name: 'LinkedIn Profile Improvement', target: 'CAREER_PASSPORT' },
    { id: 'PROFESSIONAL_NETWORKING', name: 'Professional Networking', target: 'PROFESSIONAL_NETWORK' },
    { id: 'REMOTE_JOBS', name: 'Remote Jobs & Distributed Work', target: 'JOBS' },
    { id: 'SKILLS_DEVELOPMENT', name: 'Skills Development & Upskilling', target: 'LEARNING' },
    { id: 'AI_AND_EMPLOYMENT', name: 'AI and the Future of Employment', target: 'LEARNING' },
    { id: 'RECRUITMENT_TECHNOLOGY', name: 'Recruitment Technology & Talent Acquisition', target: 'CAREERS' },
    { id: 'HIRING_TRENDS', name: 'Hiring Trends & Job Market Reports', target: 'RESOURCES' },
    { id: 'CAREER_TRANSITIONS', name: 'Career Transitions & Role Pivots', target: 'CAREER_PASSPORT' },
    { id: 'SALARY_AND_NEGOTIATION', name: 'Salary Benchmarking & Compensation Negotiation', target: 'RESOURCES' },
    { id: 'WORKPLACE_INSIGHTS', name: 'Workplace Culture & Insights', target: 'RESOURCES' },
    { id: 'STARTUP_STORY', name: 'TalentXcel Startup Story & Mission', target: 'HOME' },
    { id: 'TALENTXCEL_PRODUCT_EDUCATION', name: 'TalentXcel Product Education', target: 'HOME' },
    { id: 'CAREER_PASSPORT', name: 'Verified Career Passport System', target: 'CAREER_PASSPORT' },
    { id: 'RESUME_BUILDER', name: 'Intelligent AI Resume Builder', target: 'RESUME_BUILDER' },
    { id: 'PROFESSIONAL_NETWORK', name: 'TalentXcel Professional Network', target: 'PROFESSIONAL_NETWORK' }
  ],

  // 10 Contextual Variation Formats
  VARIATION_FORMATS: [
    { id: 'STARTUP_PUB', name: 'Startup Publication Version' },
    { id: 'SMALL_BIZ', name: 'Small Business Publication Version' },
    { id: 'CAREER_BLOG', name: 'Career Blog Version' },
    { id: 'HR_COMMUNITY', name: 'HR Community Version' },
    { id: 'STUDENT_COMMUNITY', name: 'Student Community Version' },
    { id: 'FOUNDER_STORY', name: 'Founder Story Version' },
    { id: 'FORUM_DISCUSSION', name: 'Forum Discussion Version' },
    { id: 'RESOURCE_LISTING', name: 'Resource Listing Version' },
    { id: 'NEWSLETTER_PITCH', name: 'Newsletter Pitch' },
    { id: 'SHORT_SOCIAL', name: 'Short Social Version' }
  ]
};
