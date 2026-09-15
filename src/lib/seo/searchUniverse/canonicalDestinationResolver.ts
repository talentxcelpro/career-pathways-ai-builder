// src/lib/seo/searchUniverse/canonicalDestinationResolver.ts
// Deterministic 1-to-1 Mapping from Search Query to Canonical Destination Hub

import { BASE_PRODUCTION_ORIGIN } from '../canonicalUrls';

export interface CanonicalDestinationResult {
  targetUrl: string;
  routePath: string;
  pageType: 'COMPANY_ENTITY' | 'COMMERCIAL_SERVICE' | 'TOPIC_HUB' | 'JOB_PAGE' | 'COLLEGE_PAGE' | 'TOOL_PAGE' | 'EDITORIAL_GUIDE';
  coverageStatus: 'DIRECT' | 'SEMANTIC' | 'HUB' | 'PROGRAMMATIC' | 'CONSOLIDATED';
  canonicalReason: string;
}

export function resolveCanonicalDestination(
  normalizedQuery: string,
  cluster: string,
  role?: string,
  location?: string,
  service?: string
): CanonicalDestinationResult {
  const q = normalizedQuery.toLowerCase();

  // 1. Brand Intent
  if (q.includes('talentxcel')) {
    if (q.includes('job') || q.includes('career')) {
      return {
        targetUrl: `${BASE_PRODUCTION_ORIGIN}/jobs`,
        routePath: '/jobs',
        pageType: 'JOB_PAGE',
        coverageStatus: 'DIRECT',
        canonicalReason: 'Official TalentXcel careers hub',
      };
    }
    return {
      targetUrl: `${BASE_PRODUCTION_ORIGIN}/company/talentxcel`,
      routePath: '/company/talentxcel',
      pageType: 'COMPANY_ENTITY',
      coverageStatus: 'DIRECT',
      canonicalReason: 'Primary company entity hub',
    };
  }

  // 2. Commercial Services
  if (cluster === 'EMPLOYER_B2B' || q.includes('staffing') || q.includes('rpo') || q.includes('recruitment services')) {
    if (q.includes('ai') || q.includes('machine learning')) {
      return {
        targetUrl: `${BASE_PRODUCTION_ORIGIN}/services/ai-recruitment`,
        routePath: '/services/ai-recruitment',
        pageType: 'COMMERCIAL_SERVICE',
        coverageStatus: 'DIRECT',
        canonicalReason: 'AI Recruitment platform service landing page',
      };
    }
    if (q.includes('rpo') || q.includes('outsourc')) {
      return {
        targetUrl: `${BASE_PRODUCTION_ORIGIN}/services/rpo`,
        routePath: '/services/rpo',
        pageType: 'COMMERCIAL_SERVICE',
        coverageStatus: 'DIRECT',
        canonicalReason: 'Recruitment Process Outsourcing service landing page',
      };
    }
    if (q.includes('it') || q.includes('consulting') || q.includes('software development')) {
      return {
        targetUrl: `${BASE_PRODUCTION_ORIGIN}/services/it-services`,
        routePath: '/services/it-services',
        pageType: 'COMMERCIAL_SERVICE',
        coverageStatus: 'DIRECT',
        canonicalReason: 'IT Systems Consulting landing page',
      };
    }
    if (q.includes('training') || q.includes('upskill')) {
      return {
        targetUrl: `${BASE_PRODUCTION_ORIGIN}/services/corporate-training`,
        routePath: '/services/corporate-training',
        pageType: 'COMMERCIAL_SERVICE',
        coverageStatus: 'DIRECT',
        canonicalReason: 'Corporate training landing page',
      };
    }
    return {
      targetUrl: `${BASE_PRODUCTION_ORIGIN}/services/staffing-recruitment`,
      routePath: '/services/staffing-recruitment',
      pageType: 'COMMERCIAL_SERVICE',
      coverageStatus: 'DIRECT',
      canonicalReason: 'Corporate Staffing & Recruitment landing page',
    };
  }

  // 3. Resume & ATS Tools
  if (q.includes('resume') || q.includes('ats') || q.includes('cv')) {
    return {
      targetUrl: `${BASE_PRODUCTION_ORIGIN}/services/resume-building`,
      routePath: '/services/resume-building',
      pageType: 'TOOL_PAGE',
      coverageStatus: 'DIRECT',
      canonicalReason: 'ATS Resume Builder & Studio',
    };
  }

  // 4. Higher Education & Career Pathways
  if (cluster === 'EDUCATION' || q.includes('college') || q.includes('university') || q.includes('scholarship')) {
    if (q.includes('pathway') || q.includes('roadmap') || q.includes('how to become')) {
      return {
        targetUrl: `${BASE_PRODUCTION_ORIGIN}/colleges/pathway`,
        routePath: '/colleges/pathway',
        pageType: 'TOOL_PAGE',
        coverageStatus: 'DIRECT',
        canonicalReason: '6-Step AI Career Pathway Generator',
      };
    }
    if (q.includes('global') || q.includes('abroad') || q.includes('scholarship') || q.includes('tuition free')) {
      return {
        targetUrl: `${BASE_PRODUCTION_ORIGIN}/colleges/global-programs`,
        routePath: '/colleges/global-programs',
        pageType: 'COLLEGE_PAGE',
        coverageStatus: 'DIRECT',
        canonicalReason: 'Global Degree & Scholarship Discovery',
      };
    }
    return {
      targetUrl: `${BASE_PRODUCTION_ORIGIN}/colleges`,
      routePath: '/colleges',
      pageType: 'COLLEGE_PAGE',
      coverageStatus: 'HUB',
      canonicalReason: 'Higher Education Directory Hub',
    };
  }

  // 5. Job Search Intent
  if (role && location) {
    const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
    const locSlug = location.toLowerCase().replace(/\s+/g, '-');
    return {
      targetUrl: `${BASE_PRODUCTION_ORIGIN}/jobs/${roleSlug}/${locSlug}`,
      routePath: `/jobs/${roleSlug}/${locSlug}`,
      pageType: 'JOB_PAGE',
      coverageStatus: 'PROGRAMMATIC',
      canonicalReason: `Role and Location specific job directory (${role} in ${location})`,
    };
  }

  if (role) {
    const roleSlug = role.toLowerCase().replace(/\s+/g, '-');
    return {
      targetUrl: `${BASE_PRODUCTION_ORIGIN}/jobs/${roleSlug}`,
      routePath: `/jobs/${roleSlug}`,
      pageType: 'JOB_PAGE',
      coverageStatus: 'PROGRAMMATIC',
      canonicalReason: `Role-specific job directory (${role})`,
    };
  }

  return {
    targetUrl: `${BASE_PRODUCTION_ORIGIN}/jobs`,
    routePath: '/jobs',
    pageType: 'JOB_PAGE',
    coverageStatus: 'HUB',
    canonicalReason: 'Main Job Search Hub',
  };
}
