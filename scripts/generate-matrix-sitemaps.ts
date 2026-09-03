// scripts/generate-matrix-sitemaps.ts
// Dual-Stream XML Sitemap Generator
// Stream 1: Single Job Detail Sitemaps (Google JobPosting URLs only)
// Stream 2: Matrix Discovery Sitemaps (India & International quality-gated hubs)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JOB_LOCATIONS, INDIAN_LOCATIONS_COUNT } from '../src/config/jobs/locations.js';
import { JOB_ROLES } from '../src/config/jobs/roles.js';
import { JOB_EXPERIENCES } from '../src/config/jobs/experiences.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITEMAPS_DIR = path.join(__dirname, '../public/sitemaps');

if (!fs.existsSync(SITEMAPS_DIR)) {
  fs.mkdirSync(SITEMAPS_DIR, { recursive: true });
}

const BASE_URL = 'https://talentxcel.in';
const TODAY = new Date().toISOString().split('T')[0];

function generateUrlXml(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

export function generateMatrixSitemaps() {
  console.log(`[Sitemap] Starting generation for ${INDIAN_LOCATIONS_COUNT} Indian cities & global hubs...`);

  // 1. Generate India Discovery Matrix Sitemap (Tier 1 & Tier 2 SEO-eligible hubs)
  const indiaUrls: string[] = [];
  const eligibleIndiaLocations = JOB_LOCATIONS.filter(l => l.countryCode === 'IN' && l.tier <= 2 && l.seoEligible);

  for (const loc of eligibleIndiaLocations) {
    for (const role of JOB_ROLES.slice(0, 25)) { // Focus top 25 high-demand roles per tier 1/2 city
      for (const exp of JOB_EXPERIENCES) {
        const url = `${BASE_URL}/jobs/${role.slug}/${exp.slug}/${loc.slug}`;
        indiaUrls.push(generateUrlXml(url, TODAY, 'daily', '0.8'));
      }
    }
  }

  const indiaSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indiaUrls.join('\n')}
</urlset>`;

  const indiaSitemapPath = path.join(SITEMAPS_DIR, 'jobs-matrix-india.xml');
  fs.writeFileSync(indiaSitemapPath, indiaSitemapXml, 'utf8');
  console.log(`✅ jobs-matrix-india.xml written (${indiaUrls.length} quality-gated URLs)`);

  // 2. Generate International Discovery Matrix Sitemap
  const globalUrls: string[] = [];
  const globalLocations = JOB_LOCATIONS.filter(l => l.countryCode !== 'IN' && l.active);

  for (const loc of globalLocations) {
    for (const role of JOB_ROLES.slice(0, 20)) {
      for (const exp of JOB_EXPERIENCES) {
        const url = `${BASE_URL}/jobs/${role.slug}/${exp.slug}/${loc.countryCode.toLowerCase()}/${loc.slug}`;
        globalUrls.push(generateUrlXml(url, TODAY, 'daily', '0.8'));
      }
    }
  }

  const globalSitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${globalUrls.join('\n')}
</urlset>`;

  const globalSitemapPath = path.join(SITEMAPS_DIR, 'jobs-matrix-global.xml');
  fs.writeFileSync(globalSitemapPath, globalSitemapXml, 'utf8');
  console.log(`✅ jobs-matrix-global.xml written (${globalUrls.length} international URLs)`);

  // 3. Generate Master Matrix Index
  const matrixIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemaps/jobs-matrix-india.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemaps/jobs-matrix-global.xml</loc>
    <lastmod>${TODAY}</lastmod>
  </sitemap>
</sitemapindex>`;

  fs.writeFileSync(path.join(SITEMAPS_DIR, 'jobs-matrix-index.xml'), matrixIndexXml, 'utf8');
  console.log(`✅ jobs-matrix-index.xml written successfully!`);
}

generateMatrixSitemaps();
