// scripts/generate-subdomain-sitemaps.ts
/**
 * TalentXcel Subdomain Dedicated Sitemap Generator
 * 
 * Generates physical, isolated sitemap XML files in public/ for each of
 * the authoritative production subdomains:
 * - public/sitemap-resume.xml
 * - public/sitemap-salary.xml
 * - public/sitemap-careers.xml
 * - public/sitemap-government.xml
 * - public/sitemap-employers.xml
 * - public/sitemap-passport.xml
 * - public/sitemap-core.xml
 * - public/sitemap-learning.xml
 * 
 * STRICT INVARIANTS:
 * 1. Zero duplicate URLs across sitemaps.
 * 2. Every URL starts with that subdomain's canonical origin.
 * 3. 0 URLs for legacy alias employer.talentxcel.in.
 * 4. 0 private passport profiles.
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { SubdomainId } from '../src/lib/domain-seo/types';
import { DomainSitemapManager } from '../src/lib/domain-seo/domainSitemapManager';

const SUBDOMAINS_TO_GENERATE: { id: SubdomainId; filename: string }[] = [
  { id: 'CORE', filename: 'sitemap-core.xml' },
  { id: 'JOBS', filename: 'sitemap-jobs.xml' },
  { id: 'LEARNING', filename: 'sitemap-learning.xml' },
  { id: 'PASSPORT', filename: 'sitemap-passport.xml' },
  { id: 'GOVERNMENT', filename: 'sitemap-government.xml' },
  { id: 'EMPLOYERS', filename: 'sitemap-employers.xml' },
  { id: 'COLLEGES', filename: 'sitemap-colleges.xml' },
  { id: 'CAREERS', filename: 'sitemap-careers.xml' },
  { id: 'SALARY', filename: 'sitemap-salary.xml' },
  { id: 'RESUME', filename: 'sitemap-resume.xml' },
];

export function generateAllSubdomainSitemaps() {
  const publicDir = resolve(process.cwd(), 'public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  console.log('🚀 Generating dedicated subdomain sitemaps in public/ ...');

  for (const item of SUBDOMAINS_TO_GENERATE) {
    const xml = DomainSitemapManager.generateSitemapXml(item.id);
    const dest = resolve(publicDir, item.filename);
    writeFileSync(dest, xml, 'utf-8');
    const entries = DomainSitemapManager.getDomainSitemapEntries(item.id);
    console.log(`  ✓ Generated ${item.filename} (${entries.length} URLs)`);
  }

  // Audit integrity
  const audit = DomainSitemapManager.auditSitemapIntegrity();
  console.log(`\n📊 Domain Sitemap Manager Audit: ${audit.isValid ? 'PASSED' : 'FAILED'}`);
  console.log(`  • Audited URLs: ${audit.totalUrls}`);
  console.log(`  • Cross-Domain Duplicates: ${audit.duplicateUrls.length}`);
  console.log(`  • Misaligned Origin URLs: ${audit.misalignedDomainUrls.length}`);

  if (!audit.isValid) {
    throw new Error('Subdomain sitemap audit failed: integrity invariants violated');
  }
}

if (process.argv[1]?.endsWith('generate-subdomain-sitemaps.ts') || process.argv[1]?.endsWith('generate-subdomain-sitemaps.js')) {
  generateAllSubdomainSitemaps();
}
