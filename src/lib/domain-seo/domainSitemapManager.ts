// src/lib/domain-seo/domainSitemapManager.ts
/**
 * TalentXcel Dedicated Subdomain Sitemap Manager
 * 
 * Generates and validates dedicated, isolated sitemap XML inventories for
 * each production subdomain:
 * - sitemap-core.xml
 * - sitemap-jobs.xml
 * - sitemap-learning.xml
 * - sitemap-passport.xml (public opt-in only)
 * - sitemap-government.xml
 * - sitemap-employers.xml (primary employer authority)
 * - sitemap-colleges.xml
 * - sitemap-careers.xml
 * - sitemap-salary.xml
 * - sitemap-resume.xml
 * 
 * STRICT INVARIANTS:
 * 1. Zero duplicate URLs across sitemaps.
 * 2. Every URL in a domain sitemap strictly matches that domain's canonical origin.
 * 3. Legacy alias employer.talentxcel.in emits ZERO independent URLs.
 * 4. Private Passport profiles are excluded with 100% strictness.
 */

import { SubdomainId } from './types';
import { DOMAIN_SEO_CONFIGS, getAuthoritativeDomains } from './domainRegistry';

export interface DomainSitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: string;
}

export class DomainSitemapManager {
  /**
   * Builds the isolated sitemap URL list for a specific subdomain.
   */
  public static getDomainSitemapEntries(subdomainId: SubdomainId): DomainSitemapEntry[] {
    const config = DOMAIN_SEO_CONFIGS[subdomainId];
    if (config.isAlias) {
      // Aliases emit ZERO independent sitemap entries
      return [];
    }

    const today = new Date().toISOString().split('T')[0];
    const origin = config.canonicalOrigin;
    const entries: DomainSitemapEntry[] = [];

    // Root destination
    entries.push({
      loc: `${origin}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: '1.0',
    });

    // Subdomain-specific indexable entries
    switch (subdomainId) {
      case 'JOBS':
        entries.push(
          { loc: `${origin}/jobs`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/jobs/software-engineer/bangalore`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/jobs/fresher/software-engineer/bangalore`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/jobs/data-analyst/hyderabad`, lastmod: today, changefreq: 'daily', priority: '0.8' },
          { loc: `${origin}/jobs/frontend-developer/pune`, lastmod: today, changefreq: 'daily', priority: '0.8' },
          { loc: `${origin}/jobs/remote/software-engineer`, lastmod: today, changefreq: 'daily', priority: '0.8' }
        );
        break;

      case 'RESUME':
        entries.push(
          { loc: `${origin}/resume`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/resume/software-engineer/ats-keywords`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/resume/data-analyst/ats-keywords`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/resume/devops-engineer/ats-keywords`, lastmod: today, changefreq: 'daily', priority: '0.8' },
          { loc: `${origin}/resume/templates`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
          { loc: `${origin}/tools/ats-checker`, lastmod: today, changefreq: 'daily', priority: '0.9' }
        );
        break;

      case 'CAREERS':
        entries.push(
          { loc: `${origin}/career-map`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/career-map/software-engineer`, lastmod: today, changefreq: 'weekly', priority: '0.9' },
          { loc: `${origin}/career-map/data-analyst`, lastmod: today, changefreq: 'weekly', priority: '0.9' },
          { loc: `${origin}/how-to-become/cloud-architect`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
          { loc: `${origin}/how-to-become/product-manager`, lastmod: today, changefreq: 'weekly', priority: '0.8' }
        );
        break;

      case 'SALARY':
        entries.push(
          { loc: `${origin}/salary`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/salary/software-engineer/bangalore`, lastmod: today, changefreq: 'weekly', priority: '0.9' },
          { loc: `${origin}/salary/data-analyst/hyderabad`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
          { loc: `${origin}/salary/devops-engineer/india`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
          { loc: `${origin}/tools/salary-analyzer`, lastmod: today, changefreq: 'daily', priority: '0.8' }
        );
        break;

      case 'LEARNING':
        entries.push(
          { loc: `${origin}/learning`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/skills/python`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
          { loc: `${origin}/skills/aws`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
          { loc: `${origin}/pathways/cloud-engineer`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
          { loc: `${origin}/courses`, lastmod: today, changefreq: 'daily', priority: '0.8' }
        );
        break;

      case 'COLLEGES':
        entries.push(
          { loc: `${origin}/colleges`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/colleges/global-programs`, lastmod: today, changefreq: 'daily', priority: '0.8' },
          { loc: `${origin}/colleges/scholarships`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
          { loc: `${origin}/colleges/programs/b-tech-computer-science`, lastmod: today, changefreq: 'weekly', priority: '0.8' }
        );
        break;

      case 'GOVERNMENT':
        entries.push(
          { loc: `${origin}/government-jobs`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/government-jobs/exams/upsc-2026`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/government-jobs/exams/ssc-cgl-2026`, lastmod: today, changefreq: 'daily', priority: '0.9' }
        );
        break;

      case 'EMPLOYERS':
        entries.push(
          { loc: `${origin}/companies`, lastmod: today, changefreq: 'daily', priority: '0.9' },
          { loc: `${origin}/recruiters`, lastmod: today, changefreq: 'weekly', priority: '0.8' },
          { loc: `${origin}/hire`, lastmod: today, changefreq: 'daily', priority: '0.9' }
        );
        break;

      case 'PASSPORT':
        entries.push(
          { loc: `${origin}/passport`, lastmod: today, changefreq: 'weekly', priority: '0.8' }
          // ONLY verified public opt-in profiles added here; private profiles never included
        );
        break;

      case 'CORE':
        entries.push(
          { loc: `${origin}/network`, lastmod: today, changefreq: 'daily', priority: '0.8' },
          { loc: `${origin}/about`, lastmod: today, changefreq: 'monthly', priority: '0.5' },
          { loc: `${origin}/research/india-tech-compensation-2026`, lastmod: today, changefreq: 'weekly', priority: '0.9' }
        );
        break;
    }

    return entries;
  }

  /**
   * Generates valid Sitemap XML content string.
   */
  public static generateSitemapXml(subdomainId: SubdomainId): string {
    const entries = this.getDomainSitemapEntries(subdomainId);
    const xmlLines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];

    for (const e of entries) {
      xmlLines.push('  <url>');
      xmlLines.push(`    <loc>${e.loc}</loc>`);
      xmlLines.push(`    <lastmod>${e.lastmod}</lastmod>`);
      xmlLines.push(`    <changefreq>${e.changefreq}</changefreq>`);
      xmlLines.push(`    <priority>${e.priority}</priority>`);
      xmlLines.push('  </url>');
    }

    xmlLines.push('</urlset>');
    return xmlLines.join('\n');
  }

  /**
   * Audits all domain sitemaps to verify that:
   * 1. No URL is shared across multiple sitemaps.
   * 2. No URL has the wrong domain origin.
   * 3. No legacy alias URLs are present.
   */
  public static auditSitemapIntegrity(): {
    isValid: boolean;
    totalUrls: number;
    duplicateUrls: string[];
    misalignedDomainUrls: string[];
  } {
    const seenUrls = new Map<string, SubdomainId>();
    const duplicates: string[] = [];
    const misaligned: string[] = [];
    let total = 0;

    const domains = getAuthoritativeDomains();

    for (const d of domains) {
      const entries = this.getDomainSitemapEntries(d.subdomainId);
      total += entries.length;

      for (const e of entries) {
        // Check for duplicates across domains
        if (seenUrls.has(e.loc)) {
          duplicates.push(`${e.loc} found in both ${seenUrls.get(e.loc)} and ${d.subdomainId}`);
        } else {
          seenUrls.set(e.loc, d.subdomainId);
        }

        // Check if URL belongs to domain origin
        if (!e.loc.startsWith(d.canonicalOrigin)) {
          misaligned.push(`${e.loc} does not match domain origin ${d.canonicalOrigin}`);
        }

        // Check legacy alias
        if (e.loc.includes('employer.talentxcel.in')) {
          misaligned.push(`Forbidden legacy alias in sitemap: ${e.loc}`);
        }
      }
    }

    return {
      isValid: duplicates.length === 0 && misaligned.length === 0,
      totalUrls: total,
      duplicateUrls: duplicates,
      misalignedDomainUrls: misaligned,
    };
  }
}
