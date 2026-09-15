/**
 * Master Multi-Product Acquisition Graph (14 Core Product Surfaces)
 * Frozen URL Architecture & Acquisition Taxonomy
 */

import { ProductSurface14, SurfaceGraphDefinition } from './types';

export const MULTI_PRODUCT_SURFACE_GRAPHS: Record<ProductSurface14, SurfaceGraphDefinition> = {
  JOBS: {
    surface: 'JOBS',
    surface_name: 'Jobs & High-Intent Career Vacancies',
    base_route: '/jobs',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['TRANSACTIONAL_JOB', 'GEOGRAPHIC_DISCOVERY'],
    theoretical_permutations: 120_000_000,
    normalized_intent_clusters: 2_850_000,
    evidenced_demand_opportunities: 85_000,
    published_documents: 4_200,
    competitor_benchmarks: ['NAUKRI', 'INDEED', 'APNA']
  },
  PROFESSIONAL_NETWORK: {
    surface: 'PROFESSIONAL_NETWORK',
    surface_name: 'Professional Network & Insights',
    base_route: '/network',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['INFORMATIONAL_SOCIAL', 'NAV_ORGANIZATIONAL'],
    theoretical_permutations: 35_000_000,
    normalized_intent_clusters: 990_000,
    evidenced_demand_opportunities: 24_000,
    published_documents: 1_150,
    competitor_benchmarks: ['LINKEDIN', 'GOOGLE_SEARCH_CONSOLE']
  },
  RESUME_ATS: {
    surface: 'RESUME_ATS',
    surface_name: 'Resume Builder & ATS Optimizer Studio',
    base_route: '/resume',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['COMMERCIAL_TOOL', 'COMMERCIAL_SERVICE'],
    theoretical_permutations: 25_000_000,
    normalized_intent_clusters: 720_000,
    evidenced_demand_opportunities: 38_000,
    published_documents: 380,
    competitor_benchmarks: ['GOOGLE_KEYWORD_PLANNER', 'GOOGLE_SEARCH_CONSOLE']
  },
  CAREER_PASSPORT: {
    surface: 'CAREER_PASSPORT',
    surface_name: 'Career Passport & Verified Digital Credentials',
    base_route: '/career-passport',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['COMMERCIAL_IDENTITY', 'INFORMATIONAL_SKILL'],
    theoretical_permutations: 18_000_000,
    normalized_intent_clusters: 460_000,
    evidenced_demand_opportunities: 15_000,
    published_documents: 240,
    competitor_benchmarks: ['LINKEDIN', 'GOOGLE_KEYWORD_PLANNER']
  },
  MO1_BUSINESS_OS: {
    surface: 'MO1_BUSINESS_OS',
    surface_name: 'MO1 Autonomous Business OS & Enterprise Solutions',
    base_route: '/claim1',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['COMMERCIAL_ENTERPRISE', 'NAV_COMMERCIAL'],
    theoretical_permutations: 15_000_000,
    normalized_intent_clusters: 350_000,
    evidenced_demand_opportunities: 12_000,
    published_documents: 160,
    competitor_benchmarks: ['GOOGLE_KEYWORD_PLANNER', 'AMBITION_BOX']
  },
  BIDDER_RANKINGS: {
    surface: 'BIDDER_RANKINGS',
    surface_name: 'Claim #1 & Live Industry Leaderboards',
    base_route: '/rankings',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['NAV_COMMERCIAL', 'COMMERCIAL_SERVICE'],
    theoretical_permutations: 22_000_000,
    normalized_intent_clusters: 590_000,
    evidenced_demand_opportunities: 18_000,
    published_documents: 450,
    competitor_benchmarks: ['AMBITION_BOX', 'GOOGLE_SEARCH_CONSOLE']
  },
  COMPANIES: {
    surface: 'COMPANIES',
    surface_name: 'Company Profiles, Salaries & Culture Hubs',
    base_route: '/companies',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['NAV_ORGANIZATIONAL', 'COMMERCIAL_SERVICE'],
    theoretical_permutations: 45_000_000,
    normalized_intent_clusters: 1_280_000,
    evidenced_demand_opportunities: 65_000,
    published_documents: 1_820,
    competitor_benchmarks: ['AMBITION_BOX', 'NAUKRI', 'INDEED']
  },
  ROLE_GUIDES: {
    surface: 'ROLE_GUIDES',
    surface_name: 'Career Roles & Salary Progression Guides',
    base_route: '/roles',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['INFORMATIONAL_ROLE', 'DECISIONAL_PATHWAY'],
    theoretical_permutations: 30_000_000,
    normalized_intent_clusters: 920_000,
    evidenced_demand_opportunities: 42_000,
    published_documents: 960,
    competitor_benchmarks: ['NAUKRI', 'INDEED', 'LINKEDIN']
  },
  LOCATIONS: {
    surface: 'LOCATIONS',
    surface_name: 'Geographic Tech Hubs & City Portals',
    base_route: '/locations',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['GEOGRAPHIC_DISCOVERY', 'TRANSACTIONAL_JOB'],
    theoretical_permutations: 28_000_000,
    normalized_intent_clusters: 760_000,
    evidenced_demand_opportunities: 35_000,
    published_documents: 540,
    competitor_benchmarks: ['APNA', 'NAUKRI', 'INDEED']
  },
  SKILLS: {
    surface: 'SKILLS',
    surface_name: 'Skills Intelligence & Verification Directory',
    base_route: '/skills',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['INFORMATIONAL_SKILL', 'COMMERCIAL_TOOL'],
    theoretical_permutations: 26_000_000,
    normalized_intent_clusters: 710_000,
    evidenced_demand_opportunities: 31_000,
    published_documents: 610,
    competitor_benchmarks: ['LINKEDIN', 'GOOGLE_KEYWORD_PLANNER']
  },
  COLLEGES: {
    surface: 'COLLEGES',
    surface_name: 'Colleges, NIRF Cutoffs & Global Programs',
    base_route: '/colleges',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['EDUCATIONAL_SEARCH', 'DECISIONAL_PATHWAY'],
    theoretical_permutations: 24_000_000,
    normalized_intent_clusters: 650_000,
    evidenced_demand_opportunities: 46_000,
    published_documents: 1_280,
    competitor_benchmarks: ['SHIKSHA', 'GOOGLE_SEARCH_CONSOLE']
  },
  LEARNING_COURSES: {
    surface: 'LEARNING_COURSES',
    surface_name: 'Learning Hub, Free Courses & Certifications',
    base_route: '/learning',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['EDUCATIONAL_COURSE', 'INFORMATIONAL_SKILL'],
    theoretical_permutations: 16_000_000,
    normalized_intent_clusters: 420_000,
    evidenced_demand_opportunities: 22_000,
    published_documents: 340,
    competitor_benchmarks: ['SHIKSHA', 'GOOGLE_KEYWORD_PLANNER']
  },
  CAREER_MAP: {
    surface: 'CAREER_MAP',
    surface_name: 'Career Pathway Navigation & Role Maps',
    base_route: '/careermap',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['DECISIONAL_PATHWAY', 'INFORMATIONAL_ROLE'],
    theoretical_permutations: 12_000_000,
    normalized_intent_clusters: 310_000,
    evidenced_demand_opportunities: 16_000,
    published_documents: 190,
    competitor_benchmarks: ['LINKEDIN', 'GOOGLE_SEARCH_CONSOLE']
  },
  CAREER_TOOLS: {
    surface: 'CAREER_TOOLS',
    surface_name: 'Career Calculators & Enterprise Services',
    base_route: '/tools',
    access_tier: 'CLASS_A_CANONICAL',
    primary_intents: ['COMMERCIAL_TOOL', 'COMMERCIAL_SERVICE'],
    theoretical_permutations: 13_000_000,
    normalized_intent_clusters: 330_000,
    evidenced_demand_opportunities: 14_000,
    published_documents: 272,
    competitor_benchmarks: ['GOOGLE_KEYWORD_PLANNER', 'GOOGLE_SEARCH_CONSOLE']
  }
};

/**
 * Total Scaled Query Intelligence Across 14 Surfaces
 */
export function getAcquisitionGraphSummary() {
  const surfaces = Object.values(MULTI_PRODUCT_SURFACE_GRAPHS);
  return {
    totalSurfaces: surfaces.length,
    totalTheoreticalPermutations: surfaces.reduce((acc, s) => acc + s.theoretical_permutations, 0),
    totalNormalizedIntents: surfaces.reduce((acc, s) => acc + s.normalized_intent_clusters, 0),
    totalEvidencedDemandOpportunities: surfaces.reduce((acc, s) => acc + s.evidenced_demand_opportunities, 0),
    totalPublishedDocuments: surfaces.reduce((acc, s) => acc + s.published_documents, 0)
  };
}
