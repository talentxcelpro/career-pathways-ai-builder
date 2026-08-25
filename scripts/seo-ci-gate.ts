// scripts/seo-ci-gate.ts
// TalentXcel Production SEO & Google Search Console CI Quality Gate

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { buildJobPostingSchema } from '../src/lib/seo/jobPostingSchema.js';
import { isIndexablePublicEntity } from '../src/lib/seo/indexabilityEngine.js';
import { KEYWORD_TAXONOMY } from '../src/lib/seo/keywordTaxonomy.js';
import { resolveInternalLinkGraph } from '../src/lib/seo/internalLinkingEngine.js';
import {
  getPublicJobUrl,
  getPublicCompanyUrl,
  getPublicPostUrl,
  getPublicProfileUrl,
  getPublicTopicUrl,
  getPublicServiceUrl,
} from '../src/lib/seo/canonicalUrls.js';

const SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface CheckResult {
  category: string;
  name: string;
  passed: boolean;
  message: string;
}

const results: CheckResult[] = [];

function record(category: string, name: string, passed: boolean, message: string) {
  results.push({ category, name, passed, message });
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} [${category}] ${name}: ${message}`);
}

async function runSeoCiGate() {
  console.log('================================================================');
  console.log('🛡️ TALENTXCEL PRODUCTION SEO & GOOGLE SEARCH CONSOLE CI GATE');
  console.log('================================================================\n');

  // 1. Audit JobPosting Schema & GSC compliance
  console.log('--- 1. AUDITING DATABASE JOBS & SCHEMA COMPLIANCE ---');
  try {
    const { data: dbJobs, error: jobsErr } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true);

    if (jobsErr) {
      record('JobPosting', 'Database Query', false, `Supabase error: ${jobsErr.message}`);
    } else {
      record('JobPosting', 'Database Query', true, `Fetched ${dbJobs?.length || 0} active jobs`);

      for (const job of dbJobs || []) {
        const schema = buildJobPostingSchema(job);
        const hasTitle = Boolean(schema && schema.title && schema.title.trim().length > 0);
        const hasDate = Boolean(schema && schema.datePosted && /^\d{4}-\d{2}-\d{2}$/.test(schema.datePosted));
        const hasOrg = Boolean(schema && schema.hiringOrganization?.name);
        const hasLocation = Boolean(schema && (schema.jobLocation || schema.jobLocationType === 'TELECOMMUTE'));

        record('JobPosting', `Job #${job.id.slice(0, 8)} Title Check`, hasTitle, `Title "${schema?.title}"`);
        record('JobPosting', `Job #${job.id.slice(0, 8)} Date Format`, hasDate, `Date: ${schema?.datePosted}`);
        record('JobPosting', `Job #${job.id.slice(0, 8)} Organization`, hasOrg, `Hiring Org: "${schema?.hiringOrganization?.name}"`);
        record('JobPosting', `Job #${job.id.slice(0, 8)} Location Structure`, hasLocation, schema?.jobLocationType === 'TELECOMMUTE' ? 'Remote' : `Physical (${schema?.jobLocation?.address?.addressLocality})`);
      }
    }
  } catch (err: any) {
    record('JobPosting', 'Execution Failure', false, err.message);
  }

  // 2. Canonical URL Generator Integrity
  console.log('\n--- 2. AUDITING CANONICAL URL GENERATION ---');
  const sampleJobUrl = getPublicJobUrl('software-engineer-noida-1');
  record('Canonical', 'Job URL Format', sampleJobUrl === 'https://talentxcel.in/jobs/software-engineer-noida-1', `Generated: ${sampleJobUrl}`);

  const sampleCompanyUrl = getPublicCompanyUrl('talentxcel-services');
  record('Canonical', 'Company URL Format', sampleCompanyUrl === 'https://talentxcel.in/company/talentxcel-services', `Generated: ${sampleCompanyUrl}`);

  const samplePostUrl = getPublicPostUrl('post-1234');
  record('Canonical', 'Post URL Format', samplePostUrl === 'https://talentxcel.in/post/post-1234', `Generated: ${samplePostUrl}`);

  const sampleTopicUrl = getPublicTopicUrl('artificial-intelligence');
  record('Canonical', 'Topic URL Format', sampleTopicUrl === 'https://talentxcel.in/topics/artificial-intelligence', `Generated: ${sampleTopicUrl}`);

  const sampleServiceUrl = getPublicServiceUrl('ai-recruitment');
  record('Canonical', 'Service URL Format', sampleServiceUrl === 'https://talentxcel.in/services/ai-recruitment', `Generated: ${sampleServiceUrl}`);

  // 3. Keyword Taxonomy & Cannibalization
  console.log('\n--- 3. AUDITING KEYWORD TAXONOMY & CANNIBALIZATION ---');
  const keywordSet = new Set<string>();
  let hasDuplicates = false;
  for (const item of KEYWORD_TAXONOMY) {
    if (keywordSet.has(item.keyword.toLowerCase())) {
      hasDuplicates = true;
      break;
    }
    keywordSet.add(item.keyword.toLowerCase());
  }
  record('Taxonomy', 'Keyword Uniqueness', !hasDuplicates, `Validated ${KEYWORD_TAXONOMY.length} distinct target concepts`);

  // 4. Internal Link Graph & Zero Orphan Tier-1
  console.log('\n--- 4. AUDITING INTERNAL LINK GRAPH ---');
  const sampleGraph = resolveInternalLinkGraph('/services/ai-recruitment');
  const hasParent = Boolean(sampleGraph.parentHub);
  const hasCompany = Boolean(sampleGraph.companyEntityLink);
  const hasRelated = sampleGraph.relatedServices.length > 0;
  record('LinkGraph', 'Parent Hub Linked', hasParent, `Parent: ${sampleGraph.parentHub?.anchorText}`);
  record('LinkGraph', 'Company Entity Linked', hasCompany, `Entity: ${sampleGraph.companyEntityLink?.anchorText}`);
  record('LinkGraph', 'Contextual Links Linked', hasRelated, `Related Services: ${sampleGraph.relatedServices.length}`);

  // 5. Indexability & Quality Grading
  console.log('\n--- 5. AUDITING QUALITY GRADING ---');
  const sampleCollegeQuality = isIndexablePublicEntity('college', { name: 'IIT Madras', nirf_rank: 1, annual_fee_min: 200000 });
  record('QualityEngine', 'Tier A Quality Grading', sampleCollegeQuality.qualityGrade === 'A+', `Grade: ${sampleCollegeQuality.qualityGrade} (Score: ${sampleCollegeQuality.qualityScore})`);

  // 6. Robots.txt and Master Sitemap checks
  console.log('\n--- 6. AUDITING ROBOTS.TXT & SITEMAPS ---');
  const robotsPath = resolve('public/robots.txt');
  if (existsSync(robotsPath)) {
    const content = readFileSync(robotsPath, 'utf-8');
    record('Robots', 'Sitemap Declaration', content.includes('Sitemap: https://talentxcel.in/sitemap.xml'), 'robots.txt declares sitemap.xml');
    record('Robots', 'Admin Route Protection', content.includes('Disallow: /admin/'), 'robots.txt blocks /admin/');
    record('Robots', 'Dashboard Protection', content.includes('Disallow: /dashboard'), 'robots.txt blocks /dashboard');
  } else {
    record('Robots', 'File Exists', false, 'public/robots.txt not found');
  }

  const sitemapPath = resolve('public/sitemap.xml');
  if (existsSync(sitemapPath)) {
    const sitemapContent = readFileSync(sitemapPath, 'utf-8');
    record('Sitemap', 'Master Index Exists', sitemapContent.includes('<sitemapindex'), 'public/sitemap.xml is a valid sitemapindex');
  } else {
    record('Sitemap', 'File Exists', false, 'public/sitemap.xml not found');
  }

  // Summary
  console.log('\n================================================================');
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  if (failed > 0) {
    console.error(`❌ SEO CI GATE FAILED: ${failed} of ${total} checks failed!`);
    process.exit(1);
  } else {
    console.log(`✅ SEO CI GATE PASSED: All ${passed} checks succeeded cleanly!`);
    console.log('================================================================\n');
  }
}

runSeoCiGate().catch((err) => {
  console.error('Fatal CI Gate Error:', err);
  process.exit(1);
});
