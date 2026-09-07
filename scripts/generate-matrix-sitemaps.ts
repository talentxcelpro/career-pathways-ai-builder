// scripts/generate-matrix-sitemaps.ts
// Programmatic SEO XML Sitemap Shard Engine
// Scales across 1,194 Cities, 50 Canonical Roles, 4 Experience Tiers & 450+ Active Jobs
// Total Programmatic Footprint: 240,000+ Validated URLs sharded into compliant <10k URL sitemaps

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { JOB_LOCATIONS } from '../src/config/jobs/locations.js';
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
const SHARD_LIMIT = 10000; // 10k URLs per sitemap for optimal Googlebot ingestion speed

const SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function formatUrlEntry(loc: string, lastmod: string, changefreq: string, priority: string): string {
  return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

export async function generateMatrixSitemaps() {
  console.log(`[Sitemap Generator] Initializing Programmatic Search Matrix Generation...`);
  console.log(`[Taxonomy] Locations: ${JOB_LOCATIONS.length} | Roles: ${JOB_ROLES.length} | Experiences: ${JOB_EXPERIENCES.length}`);

  // Fetch active enterprise jobs
  console.log(`[Jobs DB] Fetching active enterprise jobs for direct XML sitemap ingestion...`);
  let dbJobs: any[] = [];
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, seo_slug, updated_at, posted_at')
      .eq('is_active', true)
      .eq('job_status', 'open');
    if (!error && data) {
      dbJobs = data;
    }
  } catch (err) {
    console.warn('DB job fetch warning:', err);
  }
  console.log(`[Jobs DB] Found ${dbJobs.length} active jobs.`);

  const shardFiles: string[] = [];
  let currentShardIndex = 1;
  let currentUrls: string[] = [];
  let totalUrlCount = 0;

  function flushShard() {
    if (currentUrls.length === 0) return;
    const shardName = `jobs-matrix-shard-${String(currentShardIndex).padStart(2, '0')}.xml`;
    const shardPath = path.join(SITEMAPS_DIR, shardName);
    const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${currentUrls.join('\n')}\n</urlset>`;
    fs.writeFileSync(shardPath, xmlContent, 'utf8');
    console.log(`  ✓ Written ${shardName} (${currentUrls.length.toLocaleString()} URLs)`);
    shardFiles.push(shardName);
    currentShardIndex++;
    currentUrls = [];
  }

  function addUrl(loc: string, lastmod: string = TODAY, changefreq: string = 'weekly', priority: string = '0.7') {
    currentUrls.push(formatUrlEntry(loc, lastmod, changefreq, priority));
    totalUrlCount++;
    if (currentUrls.length >= SHARD_LIMIT) {
      flushShard();
    }
  }

  // Stream 1: Direct Job Posting URLs (Highest Priority: 0.9)
  console.log(`\n1. Streaming ${dbJobs.length} canonical job URLs...`);
  for (const job of dbJobs) {
    const slug = job.seo_slug || job.id;
    const lastMod = (job.updated_at || job.posted_at || TODAY).split('T')[0];
    addUrl(`${BASE_URL}/jobs/${slug}`, lastMod, 'daily', '0.9');
  }

  // Stream 2: Location Hub URLs (Priority: 0.8)
  console.log(`2. Streaming ${JOB_LOCATIONS.length} location hub URLs...`);
  for (const loc of JOB_LOCATIONS) {
    const locUrl = loc.countryCode === 'IN'
      ? `${BASE_URL}/locations/${loc.slug}`
      : `${BASE_URL}/locations/${loc.countryCode.toLowerCase()}/${loc.slug}`;
    addUrl(locUrl, TODAY, 'daily', '0.8');
  }

  // Stream 3: Role Hub URLs (Priority: 0.8)
  console.log(`3. Streaming ${JOB_ROLES.length * 2} role hub URLs...`);
  for (const role of JOB_ROLES) {
    addUrl(`${BASE_URL}/roles/${role.slug}`, TODAY, 'daily', '0.8');
    addUrl(`${BASE_URL}/jobs/${role.slug}`, TODAY, 'daily', '0.8');
  }

  // Stream 4: Programmatic Matrix (Role x Experience x Location)
  console.log(`4. Streaming 238,800 Programmatic Matrix URLs (Locations × Roles × Experiences)...`);
  for (const loc of JOB_LOCATIONS) {
    const isIndia = loc.countryCode === 'IN';
    for (const role of JOB_ROLES) {
      for (const exp of JOB_EXPERIENCES) {
        const matrixUrl = isIndia
          ? `${BASE_URL}/jobs/${role.slug}/${exp.slug}/${loc.slug}`
          : `${BASE_URL}/jobs/${role.slug}/${exp.slug}/${loc.countryCode.toLowerCase()}/${loc.slug}`;
        addUrl(matrixUrl, TODAY, 'weekly', '0.7');
      }
    }
  }

  // Flush any remaining URLs
  flushShard();

  console.log(`\n================ SITEMAP GENERATION SUMMARY ================`);
  console.log(`Total URLs Processed: ${totalUrlCount.toLocaleString()}`);
  console.log(`Total Shard Files Created: ${shardFiles.length}`);

  // Generate Master Matrix Index
  const matrixIndexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${shardFiles
    .map(
      (shard) => `  <sitemap>\n    <loc>${BASE_URL}/sitemaps/${shard}</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>`
    )
    .join('\n')}\n</sitemapindex>`;

  const indexFilePath = path.join(SITEMAPS_DIR, 'jobs-matrix-index.xml');
  fs.writeFileSync(indexFilePath, matrixIndexXml, 'utf8');
  console.log(`✓ Generated Master Matrix Index: public/sitemaps/jobs-matrix-index.xml`);

  // Maintain backwards compatibility for legacy index entries
  if (shardFiles.length > 0) {
    fs.copyFileSync(path.join(SITEMAPS_DIR, shardFiles[0]), path.join(SITEMAPS_DIR, 'jobs-matrix-india.xml'));
    if (shardFiles.length > 1) {
      fs.copyFileSync(path.join(SITEMAPS_DIR, shardFiles[1]), path.join(SITEMAPS_DIR, 'jobs-matrix-global.xml'));
    }
  }

  console.log(`✅ Matrix Sitemaps generation completed successfully!\n`);
}

generateMatrixSitemaps().catch(console.error);

