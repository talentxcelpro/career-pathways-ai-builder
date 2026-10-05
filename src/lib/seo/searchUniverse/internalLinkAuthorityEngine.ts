// src/lib/seo/searchUniverse/internalLinkAuthorityEngine.ts
/**
 * TalentXcel Internal Link Authority Graph Engine
 *
 * Automatically constructs semantic cluster authority and bidirectional links between
 * related search destinations. Prevents orphan pages, guarantees maximum PageRank
 * distribution, and guides Googlebot and candidates smoothly along the career journey.
 */

import { LocationHierarchyNode, GlobalLocationHierarchy } from './globalLocationHierarchy';

export type SeoEdgeType =
  | 'ROLE_TO_SALARY'
  | 'ROLE_TO_RESUME'
  | 'ROLE_TO_ATS'
  | 'ROLE_TO_INTERVIEW'
  | 'ROLE_TO_SKILLS'
  | 'ROLE_TO_CAREER_MAP'
  | 'ROLE_TO_FRESHER'
  | 'ROLE_TO_REMOTE'
  | 'LOCATION_TO_ROLES'
  | 'LOCATION_TO_COMPANIES'
  | 'LOCATION_TO_COLLEGES'
  | 'LOCATION_TO_NEIGHBORS'
  | 'COMPANY_TO_ROLES'
  | 'COMPANY_TO_SALARY'
  | 'COMPANY_TO_INTERVIEW'
  | 'RELATED_ROLE'
  | 'PARENT_CLUSTER';

export interface InternalGraphLink {
  targetUrl: string;
  anchorText: string;
  edgeType: SeoEdgeType;
  authorityWeight: number; // 0.1 - 1.0
  placementZone: 'SIDEBAR' | 'IN_CONTENT' | 'FOOTER_CLUSTER' | 'ACTION_CARD';
}

export class InternalLinkAuthorityEngine {
  /**
   * Generates comprehensive internal links for any Role-driven destination
   */
  static generateRoleClusterLinks(
    roleSlug: string,
    roleTitle: string,
    currentLocation?: LocationHierarchyNode
  ): InternalGraphLink[] {
    const links: InternalGraphLink[] = [];
    const locSlug = currentLocation ? currentLocation.slug : 'bangalore';
    const locName = currentLocation ? currentLocation.canonicalName : 'India';

    // 1. Role Core Utility Links
    links.push({
      targetUrl: `/salary/${roleSlug}/${locSlug}`,
      anchorText: `${roleTitle} Salary in ${locName}`,
      edgeType: 'ROLE_TO_SALARY',
      authorityWeight: 0.95,
      placementZone: 'ACTION_CARD',
    });

    links.push({
      targetUrl: `/resume/ats-check/${roleSlug}`,
      anchorText: `Free ATS Resume Checker for ${roleTitle}`,
      edgeType: 'ROLE_TO_ATS',
      authorityWeight: 0.95,
      placementZone: 'ACTION_CARD',
    });

    links.push({
      targetUrl: `/resume-templates/${roleSlug}`,
      anchorText: `${roleTitle} Resume Templates & Examples`,
      edgeType: 'ROLE_TO_RESUME',
      authorityWeight: 0.9,
      placementZone: 'ACTION_CARD',
    });

    links.push({
      targetUrl: `/interview-questions/${roleSlug}`,
      anchorText: `${roleTitle} Interview Questions & Answers`,
      edgeType: 'ROLE_TO_INTERVIEW',
      authorityWeight: 0.88,
      placementZone: 'ACTION_CARD',
    });

    links.push({
      targetUrl: `/career-pathway/${roleSlug}`,
      anchorText: `${roleTitle} Promotion Ladder & Roadmap`,
      edgeType: 'ROLE_TO_CAREER_MAP',
      authorityWeight: 0.85,
      placementZone: 'IN_CONTENT',
    });

    links.push({
      targetUrl: `/jobs/${roleSlug}/freshers`,
      anchorText: `${roleTitle} Jobs for Freshers`,
      edgeType: 'ROLE_TO_FRESHER',
      authorityWeight: 0.85,
      placementZone: 'FOOTER_CLUSTER',
    });

    links.push({
      targetUrl: `/jobs/remote/${roleSlug}`,
      anchorText: `Remote ${roleTitle} Jobs Worldwide`,
      edgeType: 'ROLE_TO_REMOTE',
      authorityWeight: 0.9,
      placementZone: 'FOOTER_CLUSTER',
    });

    // 2. Multi-City Geographic Matrix Links
    const topAlternativeCities = ['bangalore', 'delhi-ncr', 'mumbai', 'pune', 'hyderabad', 'dubai', 'london', 'new-york'];
    topAlternativeCities
      .filter(c => !currentLocation || c !== currentLocation.slug)
      .slice(0, 4)
      .forEach(citySlug => {
        const cityNode = GlobalLocationHierarchy.resolveLocation(citySlug);
        const cityName = cityNode ? cityNode.canonicalName : citySlug;
        links.push({
          targetUrl: `/jobs/${roleSlug}/${citySlug}`,
          anchorText: `${roleTitle} Jobs in ${cityName}`,
          edgeType: 'RELATED_ROLE',
          authorityWeight: 0.8,
          placementZone: 'FOOTER_CLUSTER',
        });
      });

    return links;
  }

  /**
   * Generates location-centric internal links for geographic cluster authority
   */
  static generateLocationClusterLinks(location: LocationHierarchyNode): InternalGraphLink[] {
    const links: InternalGraphLink[] = [];
    const locSlug = location.slug;
    const locName = location.canonicalName;

    // 1. Top Tech Roles in this location
    const priorityRoles = [
      { slug: 'software-engineer', title: 'Software Engineer' },
      { slug: 'full-stack-developer', title: 'Full Stack Developer' },
      { slug: 'data-scientist', title: 'Data Scientist' },
      { slug: 'product-manager', title: 'Product Manager' },
      { slug: 'devops-engineer', title: 'DevOps Engineer' },
    ];

    priorityRoles.forEach(r => {
      links.push({
        targetUrl: `/jobs/${r.slug}/${locSlug}`,
        anchorText: `${r.title} Jobs in ${locName}`,
        edgeType: 'LOCATION_TO_ROLES',
        authorityWeight: 0.9,
        placementZone: 'SIDEBAR',
      });
    });

    // 2. Neighboring Cities & Commuter Corridors
    const neighbors = GlobalLocationHierarchy.getNearbyLocations(locSlug);
    neighbors.forEach(n => {
      links.push({
        targetUrl: `/jobs/software-engineer/${n.slug}`,
        anchorText: `Jobs in ${n.canonicalName}`,
        edgeType: 'LOCATION_TO_NEIGHBORS',
        authorityWeight: 0.75,
        placementZone: 'FOOTER_CLUSTER',
      });
    });

    return links;
  }

  /**
   * Generates company-centric internal links
   */
  static generateCompanyClusterLinks(companySlug: string, companyName: string): InternalGraphLink[] {
    return [
      {
        targetUrl: `/company/${companySlug}/jobs`,
        anchorText: `${companyName} Open Vacancies`,
        edgeType: 'COMPANY_TO_ROLES',
        authorityWeight: 0.95,
        placementZone: 'SIDEBAR',
      },
      {
        targetUrl: `/company/${companySlug}/salary`,
        anchorText: `${companyName} Salary Benchmarks`,
        edgeType: 'COMPANY_TO_SALARY',
        authorityWeight: 0.9,
        placementZone: 'SIDEBAR',
      },
      {
        targetUrl: `/company/${companySlug}/interview`,
        anchorText: `${companyName} Interview Process & Questions`,
        edgeType: 'COMPANY_TO_INTERVIEW',
        authorityWeight: 0.88,
        placementZone: 'SIDEBAR',
      },
    ];
  }
}
