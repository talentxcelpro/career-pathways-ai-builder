// src/lib/seo/globalSearchGraph/globalIntentMatrix.ts
/**
 * TalentXcel Global Intent Matrix & Anti-Cartesian Resolution Engine
 *
 * Implements Section 5, 6, 19, 33:
 * Semantic Search Intent Validation -> Multi-Domain Authoritative Routing
 *
 * Rules:
 * - Anti-Cartesian Explosion: Only generates/validates combinations with real semantic validity
 * - One Entity, One Intent, One Primary Canonical Destination
 * - Strict multi-domain routing to the authoritative production domain:
 *   - JOBS: https://jobs.talentxcel.in
 *   - LEARNING: https://learning.talentxcel.in
 *   - CAREERS: https://careers.talentxcel.in
 *   - SALARY: https://salary.talentxcel.in
 *   - RESUME: https://resume.talentxcel.in
 *   - COLLEGES: https://colleges.talentxcel.in
 *   - GOVERNMENT: https://government.talentxcel.in
 *   - EMPLOYERS: https://employers.talentxcel.in
 *   - PASSPORT: https://passport.talentxcel.in
 *   - CORE: https://talentxcel.in
 */

import {
  ProductUniverse,
  UNIVERSE_PRIMARY_DOMAIN,
  formatCanonicalUrl,
} from '@/config/domainArchitecture';
import { GlobalEntityGraph, GlobalLocationNode } from './globalEntityGraph';
import { GlobalOccupationTaxonomy, GlobalOccupationNode } from './globalOccupationTaxonomy';

export type SearchIntentType =
  | 'JOBS_SEARCH'
  | 'JOB_SEARCH'
  | 'SALARY_BENCHMARK'
  | 'SKILLS_REQUIREMENT'
  | 'SKILL_ACQUISITION'
  | 'CERTIFICATION_INQUIRY'
  | 'COURSE_LEARNING'
  | 'RESUME_EXAMPLE'
  | 'RESUME_ATS'
  | 'ATS_OPTIMIZATION'
  | 'INTERVIEW_PREPARATION'
  | 'CAREER_PROGRESSION'
  | 'COLLEGE_EDUCATION'
  | 'COLLEGE_ADMISSION'
  | 'GOVERNMENT_EXAMINATION'
  | 'GOVERNMENT_EXAM'
  | 'COMPANY_EMPLOYMENT'
  | 'EMPLOYER_HIRING'
  | 'WORK_AUTHORIZATION'
  | 'TALENT_ACQUISITION';

export interface IntentClassificationResult {
  intentType: SearchIntentType;
  primaryDomain: string;
  targetUniverse: ProductUniverse;
  canonicalUrl: string;
  routePath: string;
}

export interface SemanticIntentResolution {
  rawQuery: string;
  intentType: SearchIntentType;
  targetUniverse: ProductUniverse;
  authoritativeDomain: string;
  canonicalUrl: string;
  routePath: string;
  isValidSemanticCombination: boolean;
  rejectionReason?: string;
  entities: {
    occupation?: GlobalOccupationNode;
    location?: GlobalLocationNode;
    companySlug?: string;
    skillSlug?: string;
  };
}

export class GlobalIntentMatrix {
  /**
   * Evaluates if an Occupation x Location combination satisfies semantic validity
   * to prevent Cartesian explosions.
   */
  public static isSemanticCombinationValid(
    occupationSlug: string,
    locationSlug: string,
    intentType: SearchIntentType
  ): { isValid: boolean; reason?: string } {
    const occupation = GlobalOccupationTaxonomy.getNodeBySlug(occupationSlug);
    if (!occupation) {
      return { isValid: false, reason: `Unknown occupation entity '${occupationSlug}'` };
    }

    const location = GlobalEntityGraph.getNodeBySlug(locationSlug);
    if (!location) {
      return { isValid: false, reason: `Unknown location entity '${locationSlug}'` };
    }

    // Check location universe compatibility
    const requiredUniverse = this.mapIntentToUniverse(intentType);
    if (!location.supportedUniverses.includes(requiredUniverse as any)) {
      return {
        isValid: false,
        reason: `Location '${location.canonicalName}' does not support universe '${requiredUniverse}'`,
      };
    }

    // Check domain relevance:
    // (e.g. Commercial Pilot requires an aviation hub or country-level scope, not a local district)
    // Check domain relevance:
    // (e.g. Commercial Pilot requires an aviation hub or country-level scope, not a local district)
    if (occupation.slug === 'commercial-pilot' && location.tierLevel === 6) {
      return {
        isValid: false,
        reason: 'Aviation commercial pilot vacancies are administered at city or international hub levels, not micro-districts.',
      };
    }

    return { isValid: true };
  }

  /**
   * Evaluates Cartesian pair compatibility by ID or slug
   */
  public static validateCartesianPair(
    occupationIdOrSlug: string,
    locationIdOrSlug: string
  ): { isValid: boolean; reason?: string } {
    const occNode =
      GlobalOccupationTaxonomy.getNode(occupationIdOrSlug) ||
      GlobalOccupationTaxonomy.getNodeBySlug(occupationIdOrSlug);
    const locNode =
      GlobalEntityGraph.getNode(locationIdOrSlug) ||
      GlobalEntityGraph.getNodeBySlug(locationIdOrSlug);

    if (!occNode) {
      return { isValid: false, reason: `Unknown occupation entity '${occupationIdOrSlug}'` };
    }
    if (!locNode) {
      return { isValid: false, reason: `Unknown location entity '${locationIdOrSlug}'` };
    }

    return this.isSemanticCombinationValid(occNode.slug, locNode.slug, 'JOB_SEARCH');
  }

  /**
   * Deterministically maps a search intent type to its authoritative Product Universe
   */
  public static mapIntentToUniverse(intent: SearchIntentType): ProductUniverse {
    switch (intent) {
      case 'JOBS_SEARCH':
      case 'JOB_SEARCH':
        return 'JOBS';
      case 'SALARY_BENCHMARK':
        return 'SALARY';
      case 'SKILLS_REQUIREMENT':
      case 'SKILL_ACQUISITION':
      case 'COURSE_LEARNING':
      case 'CERTIFICATION_INQUIRY':
        return 'LEARNING';
      case 'RESUME_EXAMPLE':
      case 'RESUME_ATS':
      case 'ATS_OPTIMIZATION':
        return 'RESUME';
      case 'INTERVIEW_PREPARATION':
      case 'CAREER_PROGRESSION':
        return 'CAREERS';
      case 'COLLEGE_EDUCATION':
      case 'COLLEGE_ADMISSION':
        return 'COLLEGES';
      case 'GOVERNMENT_EXAMINATION':
      case 'GOVERNMENT_EXAM':
        return 'GOVERNMENT';
      case 'TALENT_ACQUISITION':
      case 'COMPANY_EMPLOYMENT':
      case 'EMPLOYER_HIRING':
        return 'EMPLOYERS';
      default:
        return 'CORE';
    }
  }

  /**
   * Resolves any user query into its structured semantic destination on the multi-domain network
   */
  public static resolveQueryToDestination(query: string): SemanticIntentResolution {
    const q = query.toLowerCase().trim();

    // 1. Identify Intent
    let intentType: SearchIntentType = 'JOB_SEARCH';

    if (q.includes('govt') || q.includes('government') || q.includes('sarkari') || q.includes('public sector') || q.includes('upsc') || q.includes('ias')) {
      intentType = 'GOVERNMENT_EXAM';
    } else if (q.includes('salary') || q.includes('pay') || q.includes('compensation') || q.includes('package') || q.includes('lpa')) {
      intentType = 'SALARY_BENCHMARK';
    } else if (q.includes('course') || q.includes('learn') || q.includes('tutorial') || q.includes('training') || q.includes('syllabus')) {
      intentType = 'SKILL_ACQUISITION';
    } else if (q.includes('ats') || q.includes('resume') || q.includes('cv')) {
      intentType = 'RESUME_ATS';
    } else if (q.includes('certif') || q.includes('license') || q.includes('accredit') || q.includes('nclex') || q.includes('cpa') || q.includes('atpl')) {
      intentType = 'CERTIFICATION_INQUIRY';
    } else if (q.includes('interview') || q.includes('questions') || q.includes('star response')) {
      intentType = 'INTERVIEW_PREPARATION';
    } else if (q.includes('roadmap') || q.includes('career path') || q.includes('progression') || q.includes('how to become')) {
      intentType = 'CAREER_PROGRESSION';
    } else if (q.includes('college') || q.includes('university') || q.includes('campus') || q.includes('degrees') || q.includes('admission')) {
      intentType = 'COLLEGE_ADMISSION';
    } else if (q.includes('hire') || q.includes('recruiter') || q.includes('staffing') || q.includes('post job')) {
      intentType = 'EMPLOYER_HIRING';
    } else {
      intentType = 'JOB_SEARCH';
    }

    // 2. Extract Entities
    const occupation = GlobalOccupationTaxonomy.resolveOccupation(q);
    const location = GlobalEntityGraph.resolveLocation(q);

    const targetUniverse = this.mapIntentToUniverse(intentType);
    const domain = UNIVERSE_PRIMARY_DOMAIN[targetUniverse];

    // 3. Construct Canonical Route Path
    let routePath = '/';

    if (occupation && location) {
      const validCheck = this.isSemanticCombinationValid(occupation.slug, location.slug, intentType);
      if (!validCheck.isValid) {
        return {
          rawQuery: query,
          intentType,
          targetUniverse: 'CORE',
          authoritativeDomain: UNIVERSE_PRIMARY_DOMAIN.CORE,
          canonicalUrl: `${UNIVERSE_PRIMARY_DOMAIN.CORE}/`,
          routePath: '/',
          isValidSemanticCombination: false,
          rejectionReason: validCheck.reason,
          entities: { occupation, location },
        };
      }

      switch (intentType) {
        case 'JOBS_SEARCH':
          routePath = `/jobs/${occupation.slug}/${location.slug}`;
          break;
        case 'SALARY_BENCHMARK':
          routePath = `/salary/${occupation.slug}/${location.slug}`;
          break;
        case 'COURSE_LEARNING':
          routePath = `/learning/courses?occupation=${occupation.slug}&location=${location.slug}`;
          break;
        default:
          routePath = `/${occupation.slug}/${location.slug}`;
      }
    } else if (occupation) {
      switch (intentType) {
        case 'JOBS_SEARCH':
          routePath = `/jobs?role=${occupation.slug}`;
          break;
        case 'SALARY_BENCHMARK':
          routePath = `/salary/${occupation.slug}`;
          break;
        case 'RESUME_EXAMPLE':
        case 'ATS_OPTIMIZATION':
          routePath = `/resume/${occupation.slug}`;
          break;
        case 'INTERVIEW_PREPARATION':
          routePath = `/careers/interview/${occupation.slug}`;
          break;
        case 'CAREER_PROGRESSION':
          routePath = `/careers/roadmap/${occupation.slug}`;
          break;
        case 'COURSE_LEARNING':
          routePath = `/learning/courses?role=${occupation.slug}`;
          break;
        case 'CERTIFICATION_INQUIRY':
          routePath = `/learning/certifications?role=${occupation.slug}`;
          break;
        case 'GOVERNMENT_EXAMINATION':
          routePath = `/government-jobs?role=${occupation.slug}`;
          break;
        default:
          routePath = `/careers/${occupation.slug}`;
      }
    } else if (location) {
      switch (intentType) {
        case 'JOBS_SEARCH':
          routePath = `/locations/${location.slug}`;
          break;
        case 'COLLEGE_EDUCATION':
          routePath = `/colleges?location=${location.slug}`;
          break;
        case 'GOVERNMENT_EXAMINATION':
          routePath = `/government-jobs/${location.slug}`;
          break;
        default:
          routePath = `/locations/${location.slug}`;
      }
    } else {
      // General fallbacks
      switch (intentType) {
        case 'JOBS_SEARCH':
        case 'JOB_SEARCH':
          routePath = '/jobs';
          break;
        case 'SALARY_BENCHMARK':
          routePath = '/salary';
          break;
        case 'COURSE_LEARNING':
        case 'SKILL_ACQUISITION':
        case 'CERTIFICATION_INQUIRY':
          routePath = '/learning';
          break;
        case 'RESUME_EXAMPLE':
        case 'RESUME_ATS':
        case 'ATS_OPTIMIZATION':
          routePath = '/resume';
          break;
        case 'CAREER_PROGRESSION':
        case 'INTERVIEW_PREPARATION':
          routePath = '/career-map';
          break;
        case 'COLLEGE_EDUCATION':
        case 'COLLEGE_ADMISSION':
          routePath = '/colleges';
          break;
        case 'GOVERNMENT_EXAMINATION':
        case 'GOVERNMENT_EXAM':
          routePath = '/government-jobs';
          break;
        case 'TALENT_ACQUISITION':
        case 'EMPLOYER_HIRING':
        case 'COMPANY_EMPLOYMENT':
          routePath = '/recruiters';
          break;
        default:
          routePath = '/';
      }
    }

    const canonicalUrl = formatCanonicalUrl(routePath, new URL(domain).hostname);

    return {
      rawQuery: query,
      intentType,
      targetUniverse,
      authoritativeDomain: domain,
      canonicalUrl,
      routePath,
      isValidSemanticCombination: true,
      entities: {
        occupation: occupation || undefined,
        location: location || undefined,
      },
    };
  }
}

export const globalIntentMatrix = {
  classifyIntent: (query: string): IntentClassificationResult => {
    const res = GlobalIntentMatrix.resolveQueryToDestination(query);
    return {
      intentType: res.intentType,
      primaryDomain: new URL(res.authoritativeDomain).hostname,
      targetUniverse: res.targetUniverse,
      canonicalUrl: res.canonicalUrl,
      routePath: res.routePath,
    };
  },
  validateCartesianPair: (occupationIdOrSlug: string, locationIdOrSlug: string) => {
    return GlobalIntentMatrix.validateCartesianPair(occupationIdOrSlug, locationIdOrSlug);
  },
  isSemanticCombinationValid: (occSlug: string, locSlug: string, intent: SearchIntentType) => {
    return GlobalIntentMatrix.isSemanticCombinationValid(occSlug, locSlug, intent);
  },
  resolveQueryToDestination: (query: string) => {
    return GlobalIntentMatrix.resolveQueryToDestination(query);
  },
};

