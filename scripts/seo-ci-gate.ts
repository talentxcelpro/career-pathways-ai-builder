// scripts/seo-ci-gate.ts
// TalentXcel Production SEO & Google Search Console CI Quality Gate

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { buildJobPostingSchema } from '../src/lib/seo/jobPostingSchema';
import { isIndexablePublicEntity } from '../src/lib/seo/indexabilityEngine';
import {
  getPublicJobUrl,
  getPublicCompanyUrl,
  getPublicPostUrl,
  getPublicProfileUrl,
  getPublicTopicUrl,
  getPublicServiceUrl,
} from '../src/lib/seo/canonicalUrls';

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

        // Check for empty string errors
        const hasEmptyAddressStrings = schema?.jobLocation?.address &&
          Object.values(schema.jobLocation.address).some(v => v === '');

        record(
          'JobPosting',
          `Job #${job.id.slice(0, 8)} Title Check`,
          hasTitle,
          hasTitle ? `Title "${schema?.title}"` : 'Missing title in JobPosting schema'
        );

        record(
          'JobPosting',
          `Job #${job.id.slice(0, 8)} Date Format`,
          hasDate,
          hasDate ? `Date: ${schema?.datePosted}` : 'Invalid date format'
        );

        record(
          'JobPosting',
          `Job #${job.id.slice(0, 8)} Organization`,
          hasOrg,
          hasOrg ? `Hiring Org: "${schema?.hiringOrganization.name}"` : 'Missing hiringOrganization'
        );

        record(
          'JobPosting',
          `Job #${job.id.slice(0, 8)} Location Structure`,
          hasLocation && !hasEmptyAddressStrings,
          hasLocation && !hasEmptyAddressStrings
            ? (schema?.jobLocationType === 'TELECOMMUTE' ? 'Remote (TELECOMMUTE)' : `Physical (${schema?.jobLocation.address.addressLocality})`)
            : 'Invalid location or empty address strings'
        );
      }
    }
  } catch (err: any) {
    record('JobPosting', 'Exception Check', false, err.message);
  }

  // 2. Audit Canonical URL System
  console.log('\n--- 2. AUDITING CANONICAL URL GENERATION ---');
  const testJobUrl = getPublicJobUrl('software-engineer-noida-1');
  record('Canonical', 'Job URL Format', testJobUrl === 'https://talentxcel.in/jobs/software-engineer-noida-1', `Generated: ${testJobUrl}`);

  const testCompanyUrl = getPublicCompanyUrl('talentxcel-services');
  record('Canonical', 'Company URL Format', testCompanyUrl === 'https://talentxcel.in/company/talentxcel-services', `Generated: ${testCompanyUrl}`);

  const testPostUrl = getPublicPostUrl('post-1234');
  record('Canonical', 'Post URL Format', testPostUrl === 'https://talentxcel.in/post/post-1234', `Generated: ${testPostUrl}`);

  const testTopicUrl = getPublicTopicUrl('artificial-intelligence');
  record('Canonical', 'Topic URL Format', testTopicUrl === 'https://talentxcel.in/topics/artificial-intelligence', `Generated: ${testTopicUrl}`);

  const testServiceUrl = getPublicServiceUrl('ai-recruitment');
  record('Canonical', 'Service URL Format', testServiceUrl === 'https://talentxcel.in/services/ai-recruitment', `Generated: ${testServiceUrl}`);

  // 3. Audit Robots.txt & Sitemap Files
  console.log('\n--- 3. AUDITING ROBOTS.TXT & SITEMAPS ---');
  const robotsPath = resolve('public/robots.txt');
  if (existsSync(robotsPath)) {
    const robotsContent = readFileSync(robotsPath, 'utf-8');
    const hasSitemapDeclared = robotsContent.includes('Sitemap: https://talentxcel.in/sitemap.xml');
    const hasAdminBlocked = robotsContent.includes('Disallow: /admin/');
    const hasDashboardBlocked = robotsContent.includes('Disallow: /dashboard');

    record('Robots', 'Sitemap Declaration', hasSitemapDeclared, 'robots.txt declares sitemap.xml');
    record('Robots', 'Admin Route Protection', hasAdminBlocked, 'robots.txt blocks /admin/');
    record('Robots', 'Dashboard Protection', hasDashboardBlocked, 'robots.txt blocks /dashboard');
  } else {
    record('Robots', 'File Exists', false, 'public/robots.txt is missing');
  }

  const sitemapIndexPath = resolve('public/sitemap.xml');
  if (existsSync(sitemapIndexPath)) {
    const sitemapContent = readFileSync(sitemapIndexPath, 'utf-8');
    const hasSitemapTag = sitemapContent.includes('<sitemapindex');
    record('Sitemap', 'Master Index Exists', hasSitemapTag, 'public/sitemap.xml is a valid sitemapindex');
  } else {
    record('Sitemap', 'Master Index Exists', false, 'public/sitemap.xml missing');
  }

  // 4. Summary & Verification Gate
  console.log('\n================================================================');
  const failed = results.filter(r => !r.passed);
  if (failed.length > 0) {
    console.error(`❌ SEO CI GATE FAILED with ${failed.length} errors:`);
    failed.forEach(f => console.error(`  - [${f.category}] ${f.name}: ${f.message}`));
    process.exit(1);
  } else {
    console.log(`✅ SEO CI GATE PASSED: All ${results.length} checks succeeded cleanly!`);
    console.log('================================================================\n');
  }
}

runSeoCiGate().catch((err) => {
  console.error('Fatal CI Gate error:', err);
  process.exit(1);
});
