// src/lib/domain-seo/crossDomainGraph.ts
/**
 * TalentXcel Cross-Domain Entity Graph Engine
 * 
 * Interconnects career entities across the 10 production domains without
 * keyword cannibalization, circular canonical loops, or duplicate indexation.
 * 
 * CORE PRINCIPLE:
 * The entity is shared (e.g. "Software Engineer"), but each domain owns
 * a strictly differentiated user intent:
 * - Jobs owns the vacancy / application intent
 * - Salary owns the compensation / LPA benchmark intent
 * - Careers owns the "how to become" / pathway intent
 * - Learning owns the skill / course / certification intent
 * - Resume owns the ATS keywords / resume builder intent
 * - Colleges owns the academic degree / placement intent
 * - Employers owns the corporate culture / company careers intent
 */

import { SubdomainId } from './types';
import { DOMAIN_SEO_CONFIGS } from './domainRegistry';

export interface CrossDomainEntityNode {
  entitySlug: string;
  entityName: string;
  category: string;
  domainDestinations: Record<SubdomainId, {
    url: string;
    anchorText: string;
    intentLabel: string;
    isAuthoritative: boolean;
  }>;
}

export class CrossDomainEntityGraph {
  /**
   * Builds the complete cross-domain destination graph for any occupation or skill.
   */
  public static resolveEntityDestinations(
    entitySlug: string,
    entityName: string,
    city: string = 'bangalore'
  ): CrossDomainEntityNode {
    const cleanSlug = entitySlug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    const cleanCity = city.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    return {
      entitySlug: cleanSlug,
      entityName,
      category: 'TECH_OCCUPATION',
      domainDestinations: {
        CORE: {
          url: `https://talentxcel.in/research/${cleanSlug}-industry-outlook`,
          anchorText: `${entityName} Industry Outlook & Research`,
          intentLabel: 'Ecosystem & Market Research',
          isAuthoritative: true,
        },
        JOBS: {
          url: `https://jobs.talentxcel.in/jobs/${cleanSlug}/${cleanCity}`,
          anchorText: `Explore ${entityName} Jobs in ${city.charAt(0).toUpperCase() + city.slice(1)}`,
          intentLabel: 'Active Job Vacancies',
          isAuthoritative: true,
        },
        LEARNING: {
          url: `https://learning.talentxcel.in/skills/${cleanSlug}`,
          anchorText: `${entityName} Certifications & Learning Roadmap`,
          intentLabel: 'Courses & Skill Upgrades',
          isAuthoritative: true,
        },
        PASSPORT: {
          url: `https://passport.talentxcel.in/passport`,
          anchorText: `Verify Your ${entityName} Talent Score`,
          intentLabel: 'Credential Verification',
          isAuthoritative: true,
        },
        GOVERNMENT: {
          url: `https://government.talentxcel.in/government-jobs/${cleanSlug}`,
          anchorText: `Public Sector & Commission Vacancies for ${entityName}`,
          intentLabel: 'Government Opportunities',
          isAuthoritative: true,
        },
        EMPLOYERS: {
          url: `https://employers.talentxcel.in/companies/tech-hiring`,
          anchorText: `Top Companies Hiring ${entityName} Professionals`,
          intentLabel: 'Employer Profiles & Culture',
          isAuthoritative: true,
        },
        EMPLOYER_ALIAS: {
          // Strictly canonicalizes to EMPLOYERS authority
          url: `https://employers.talentxcel.in/companies/tech-hiring`,
          anchorText: `Top Companies Hiring ${entityName} Professionals`,
          intentLabel: 'Employer Profiles (Canonical)',
          isAuthoritative: false,
        },
        COLLEGES: {
          url: `https://colleges.talentxcel.in/colleges/programs/b-tech-computer-science`,
          anchorText: `Top Colleges for ${entityName} Degrees & Placements`,
          intentLabel: 'Degree Programs & Placements',
          isAuthoritative: true,
        },
        CAREERS: {
          url: `https://careers.talentxcel.in/career-map/${cleanSlug}`,
          anchorText: `How to Become a ${entityName}: Complete Roadmap`,
          intentLabel: 'Career Pathways & Milestones',
          isAuthoritative: true,
        },
        SALARY: {
          url: `https://salary.talentxcel.in/salary/${cleanSlug}/${cleanCity}`,
          anchorText: `${entityName} Verified Salary in ${city.charAt(0).toUpperCase() + city.slice(1)} (LPA)`,
          intentLabel: 'Audited Compensation Benchmarks',
          isAuthoritative: true,
        },
        RESUME: {
          url: `https://resume.talentxcel.in/resume/${cleanSlug}/ats-keywords`,
          anchorText: `${entityName} ATS Keywords & Resume Matcher`,
          intentLabel: 'High-Intent Resume Optimization',
          isAuthoritative: true,
        },
      },
    };
  }

  /**
   * Generates crawlable contextual internal link modules for any domain page.
   * Excludes the current host and non-authoritative aliases.
   */
  public static getContextualCrossLinks(
    currentDomain: SubdomainId,
    entitySlug: string,
    entityName: string,
    city: string = 'bangalore'
  ): Array<{ domain: SubdomainId; url: string; anchorText: string; intentLabel: string }> {
    const node = this.resolveEntityDestinations(entitySlug, entityName, city);
    const links: Array<{ domain: SubdomainId; url: string; anchorText: string; intentLabel: string }> = [];

    const allowedTargetDomains: SubdomainId[] = [
      'JOBS', 'SALARY', 'RESUME', 'CAREERS', 'LEARNING', 'COLLEGES', 'EMPLOYERS', 'GOVERNMENT'
    ];

    for (const dom of allowedTargetDomains) {
      if (dom === currentDomain) continue; // Do not cross-link to current domain via cross-graph
      const dest = node.domainDestinations[dom];
      if (dest && dest.isAuthoritative) {
        links.push({
          domain: dom,
          url: dest.url,
          anchorText: dest.anchorText,
          intentLabel: dest.intentLabel,
        });
      }
    }

    return links;
  }

  /**
   * Validates that an internal cross-domain URL strictly complies with canonical routing rules.
   */
  public static validateCrossDomainLink(url: string): { isValid: boolean; canonicalTarget?: string; reason?: string } {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();

      // Enforce the employer alias non-competing rule
      if (host === 'employer.talentxcel.in') {
        const fixedUrl = url.replace('employer.talentxcel.in', 'employers.talentxcel.in');
        return {
          isValid: false,
          canonicalTarget: fixedUrl,
          reason: 'Forbidden link to legacy alias employer.talentxcel.in; must link to authoritative employers.talentxcel.in',
        };
      }

      // Enforce private passport protection
      if (host === 'passport.talentxcel.in' && (parsed.pathname.includes('/private') || parsed.pathname.includes('/settings'))) {
        return {
          isValid: false,
          reason: 'Forbidden link to private passport page; only public opt-in profiles are indexable.',
        };
      }

      return { isValid: true };
    } catch {
      return { isValid: false, reason: 'Invalid URL format' };
    }
  }
}
