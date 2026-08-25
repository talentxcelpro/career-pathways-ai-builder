/**
 * TalentXcel Public Discovery & Programmatic Sitemap Generator
 * Sitemaps architecture:
 * 1. Base pages (Home, Network, Colleges, Jobs, Learning, Companies, Services, etc.)
 * 2. 1,509 Indian Higher Education Institutions across all 36 States & UTs
 * 3. 100 Verified Global Degree Programs & Country Hubs
 * 4. Global Scholarships Directory
 * 5. AI Career Pathways & Blueprints
 * 6. Learning & Courses Registry
 * 7. Verified Active Jobs (Database-First)
 * 8. Public Posts & Articles (Database-First)
 * 9. Topics Hubs (AI, Recruitment, Careers, Education, Tech, Leadership, Business)
 * 10. Strategic Services (AI Recruitment, Staffing, Consulting, etc.)
 * 11. Companies Directory
 * 12. Master sitemap index (/sitemap.xml) for Google Search Console.
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTION_ORIGIN } from '../src/config/seo';
import { CANDIDATE_SERVICES, EMPLOYER_SERVICES, INDUSTRY_HUBS, LOCATION_HUBS, RESOURCE_HUBS } from '../src/config/publicIA';
import { JOB_CATEGORIES } from '../src/utils/jobCategories';
import { coursesDatabase } from '../src/data/coursesData';
import { CONTENT_DATA } from './contentRegistryData';
import { INDIAN_INSTITUTIONS_CATALOG } from '../src/data/indianInstitutionsCatalog';
import { SEED_PROGRAMS, SEED_SCHOLARSHIPS } from '../src/services/globalEducationService';
import { FOUNDATION_NEWS_ARTICLES } from '../src/data/newsArticles';
import { isIndexablePublicEntity } from '../src/lib/seo/indexabilityEngine';

const SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

interface SitemapEntry {
  path: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
  lastmod?: string;
}

const BASE_PAGES: SitemapEntry[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/colleges', changefreq: 'daily', priority: '0.9' },
  { path: '/colleges/global-programs', changefreq: 'daily', priority: '0.9' },
  { path: '/colleges/scholarships', changefreq: 'daily', priority: '0.9' },
  { path: '/colleges/pathway', changefreq: 'daily', priority: '0.9' },
  { path: '/learning', changefreq: 'daily', priority: '0.9' },
  { path: '/jobs', changefreq: 'daily', priority: '0.9' },
  { path: '/news', changefreq: 'daily', priority: '0.8' },
  { path: '/passport', changefreq: 'weekly', priority: '0.8' },
  { path: '/companies', changefreq: 'daily', priority: '0.8' },
  { path: '/network', changefreq: 'daily', priority: '0.8' },
  { path: '/services', changefreq: 'weekly', priority: '0.8' },
  { path: '/employer', changefreq: 'weekly', priority: '0.8' },
  { path: '/about', changefreq: 'monthly', priority: '0.6' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/faq', changefreq: 'monthly', priority: '0.5' },
  { path: '/terms', changefreq: 'monthly', priority: '0.3' },
  { path: '/privacypolicy', changefreq: 'monthly', priority: '0.3' },
];

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function buildUrlSetXml(entries: SitemapEntry[]): string {
  const today = new Date().toISOString().split('T')[0];
  const urlNodes = entries.map((entry) => {
    const loc = `${PRODUCTION_ORIGIN}${entry.path === '/' ? '/' : entry.path.replace(/\/+$/, '')}`;
    return [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${entry.lastmod || today}</lastmod>`,
      entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : '    <changefreq>weekly</changefreq>',
      entry.priority ? `    <priority>${entry.priority}</priority>` : '    <priority>0.7</priority>',
      '  </url>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlNodes,
    '</urlset>',
    '',
  ].join('\n');
}

function buildSitemapIndexXml(sitemapFiles: { filename: string; count: number }[]): string {
  const today = new Date().toISOString().split('T')[0];
  const sitemapNodes = sitemapFiles.map(({ filename }) => {
    const loc = `${PRODUCTION_ORIGIN}/${filename}`;
    return [
      '  <sitemap>',
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      '  </sitemap>',
    ].join('\n');
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapNodes,
    '</sitemapindex>',
    '',
  ].join('\n');
}

async function generateProductionSitemaps() {
  console.log('🚀 Starting TalentXcel Production Dynamic Sitemap Generation...\n');

  const publicDir = resolve('public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  const seenUrls = new Set<string>();

  const deduplicate = (entries: SitemapEntry[]): SitemapEntry[] => {
    return entries.filter((e) => {
      const fullUrl = `${PRODUCTION_ORIGIN}${e.path === '/' ? '/' : e.path.replace(/\/+$/, '')}`;
      if (seenUrls.has(fullUrl)) {
        return false;
      }
      seenUrls.add(fullUrl);
      return true;
    });
  };

  // 1. Base Pages
  const baseEntries = deduplicate(BASE_PAGES);

  // 2. Colleges & Institutions
  const collegeList: SitemapEntry[] = [];
  INDIAN_INSTITUTIONS_CATALOG.forEach((inst) => {
    collegeList.push({
      path: `/colleges/${inst.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });
  const statesSet = new Set(INDIAN_INSTITUTIONS_CATALOG.map((i) => i.location.state));
  statesSet.forEach((st) => {
    const slug = encodeURIComponent(st.toLowerCase().replace(/\s+/g, '-'));
    collegeList.push({
      path: `/colleges/state/${slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });
  const exams = ['jee-advanced', 'jee-main', 'neet-ug', 'cat', 'clat', 'cuet-ug', 'gate', 'jam', 'nid-dat', 'nift'];
  exams.forEach((exam) => {
    collegeList.push({
      path: `/colleges/exam/${exam}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });
  const collegeEntries = deduplicate(collegeList);

  // 3. Global Degree Programs
  const globalList: SitemapEntry[] = [];
  SEED_PROGRAMS.forEach((prog) => {
    const slug = encodeURIComponent(prog.program_title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    globalList.push({
      path: `/colleges/global-programs/${slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });
  const globalEntries = deduplicate(globalList);

  // 4. Scholarships
  const scholarshipEntries = deduplicate(SEED_SCHOLARSHIPS.map((sch) => ({
    path: `/colleges/scholarships/${encodeURIComponent(sch.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))}`,
    changefreq: 'weekly' as const,
    priority: '0.8',
  })));

  // 5. Pathways
  const pathwayGoals = [
    'ai-researcher', 'software-engineer', 'data-scientist', 'doctor', 'financial-analyst',
    'cybersecurity-specialist', 'ui-ux-designer', 'management-consultant', 'cloud-architect',
  ];
  const pathwayEntries = deduplicate(pathwayGoals.map((g) => ({
    path: `/colleges/pathway/${g}`,
    changefreq: 'weekly' as const,
    priority: '0.8',
  })));

  // 6. Learning & Courses
  const learningList: SitemapEntry[] = [];
  (coursesDatabase || []).forEach((c) => {
    learningList.push({
      path: `/learning/courses/${c.id}`,
      changefreq: 'weekly',
      priority: '0.7',
    });
  });
  const providers = ['microsoft-learn', 'google-cloud', 'mit-ocw', 'harvard-online', 'ibm-skills', 'freecodecamp', 'aws-training', 'coursera'];
  providers.forEach((p) => {
    learningList.push({
      path: `/learning/providers/${p}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });
  const learningEntries = deduplicate(learningList);

  // 7. Verified Database Jobs (Database-First)
  const jobEntriesList: SitemapEntry[] = [{ path: '/jobs', changefreq: 'daily', priority: '0.9' }];
  try {
    const { data: dbJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .eq('job_status', 'open');

    if (dbJobs) {
      dbJobs.forEach((job) => {
        const check = isIndexablePublicEntity('job', job);
        if (check.isIndexable) {
          const path = `/jobs/${job.seo_slug || job.id}`;
          jobEntriesList.push({
            path,
            changefreq: 'daily',
            priority: '0.9',
            lastmod: job.created_at ? job.created_at.split('T')[0] : undefined,
          });
        }
      });
    }
  } catch (err) {
    console.warn('Jobs query warning during sitemap generation:', err);
  }
  const jobEntries = deduplicate(jobEntriesList);

  // 8. Verified Public Posts (Database-First)
  const postEntriesList: SitemapEntry[] = [{ path: '/network', changefreq: 'daily', priority: '0.8' }];
  try {
    const { data: dbPosts } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);

    if (dbPosts) {
      dbPosts.forEach((post) => {
        const check = isIndexablePublicEntity('post', post);
        if (check.isIndexable) {
          postEntriesList.push({
            path: `/post/${post.id}`,
            changefreq: 'weekly',
            priority: '0.7',
            lastmod: post.created_at ? post.created_at.split('T')[0] : undefined,
          });
        }
      });
    }
  } catch (err) {
    console.warn('Posts query warning during sitemap generation:', err);
  }
  const postEntries = deduplicate(postEntriesList);

  // 9. Topic Hubs
  const topicSlugs = [
    'artificial-intelligence',
    'recruitment',
    'careers',
    'education',
    'technology',
    'leadership',
    'business',
  ];
  const topicEntries = deduplicate(topicSlugs.map((t) => ({
    path: `/topics/${t}`,
    changefreq: 'weekly' as const,
    priority: '0.8',
  })));

  // 10. Strategic Services
  const serviceSlugs = [
    'ai-recruitment',
    'staffing-recruitment',
    'it-consulting',
    'ai-solutions',
    'corporate-training',
    'career-services',
    'resume-building',
    'talent-management',
  ];
  const serviceEntries = deduplicate([
    ...serviceSlugs.map((s) => ({ path: `/services/${s}`, changefreq: 'weekly' as const, priority: '0.8' })),
    ...CANDIDATE_SERVICES.map((s) => ({ path: `/${s.slug}`, changefreq: 'weekly' as const, priority: '0.8' })),
    ...EMPLOYER_SERVICES.map((s) => ({ path: `/${s.slug}`, changefreq: 'weekly' as const, priority: '0.8' })),
  ]);

  // 11. Companies
  const companyEntries = deduplicate([
    { path: '/company/talentxcel', changefreq: 'daily', priority: '1.0' },
    { path: '/company/talentxcel-services', changefreq: 'daily', priority: '1.0' },
    { path: '/companies/talentxcel', changefreq: 'weekly', priority: '0.8' },
  ]);

  // 12. News & Editorial
  const editorialEntries = deduplicate([
    ...(FOUNDATION_NEWS_ARTICLES || []).map((art) => ({
      path: `/news/${art.slug}`,
      changefreq: 'weekly' as const,
      priority: '0.8',
    })),
    ...(CONTENT_DATA || []).map((item) => ({
      path: `/${item.type}s/${item.slug}`,
      changefreq: 'monthly' as const,
      priority: '0.6',
    })),
  ]);

  const industryEntries = deduplicate(INDUSTRY_HUBS.map((hub) => ({ path: `/industries/${hub.slug}`, changefreq: 'weekly', priority: '0.7' })));
  const locationEntries = deduplicate(LOCATION_HUBS.map((hub) => ({ path: `/locations/${hub.slug}`, changefreq: 'weekly', priority: '0.7' })));
  const resourceEntries = deduplicate(RESOURCE_HUBS.map((hub) => ({ path: `/resources/${hub.slug}`, changefreq: 'weekly', priority: '0.7' })));

  const toolsEntries = deduplicate([
    { path: '/resume-builder', changefreq: 'weekly', priority: '0.8' },
    { path: '/career-tools', changefreq: 'weekly', priority: '0.8' },
    { path: '/salary-calculator', changefreq: 'weekly', priority: '0.7' },
    { path: '/skill-assessment', changefreq: 'weekly', priority: '0.7' },
  ]);

  const sitemapConfig = [
    { filename: 'sitemap-base.xml', entries: baseEntries },
    { filename: 'sitemap-colleges.xml', entries: collegeEntries },
    { filename: 'sitemap-global-programs.xml', entries: globalEntries },
    { filename: 'sitemap-scholarships.xml', entries: scholarshipEntries },
    { filename: 'sitemap-career-paths.xml', entries: pathwayEntries },
    { filename: 'sitemap-learning.xml', entries: learningEntries },
    { filename: 'sitemap-jobs.xml', entries: jobEntries },
    { filename: 'sitemap-posts.xml', entries: postEntries },
    { filename: 'sitemap-topics.xml', entries: topicEntries },
    { filename: 'sitemap-services.xml', entries: serviceEntries },
    { filename: 'sitemap-companies.xml', entries: companyEntries },
    { filename: 'sitemap-industries.xml', entries: industryEntries },
    { filename: 'sitemap-locations.xml', entries: locationEntries },
    { filename: 'sitemap-resources.xml', entries: resourceEntries },
    { filename: 'sitemap-tools.xml', entries: toolsEntries },
    { filename: 'sitemap-articles.xml', entries: editorialEntries },
    {
      filename: 'sitemap-rankings.xml',
      entries: deduplicate([
        { path: '/rankings', changefreq: 'daily', priority: '1.0' },
        { path: '/rankings/ai-products', changefreq: 'daily', priority: '0.9' },
        { path: '/rankings/ai-products/global', changefreq: 'daily', priority: '0.9' },
        { path: '/rankings/ai-products/emerging', changefreq: 'daily', priority: '0.9' },
        { path: '/rankings/ai-products/india', changefreq: 'daily', priority: '0.9' },
        { path: '/claim1/watch', changefreq: 'weekly', priority: '0.7' },
      ]),
    },
  ];

  const validSitemapsForIndex: { filename: string; count: number }[] = [];

  sitemapConfig.forEach(({ filename, entries }) => {
    const xml = buildUrlSetXml(entries);
    writeFileSync(resolve(publicDir, filename), xml, 'utf-8');
    validSitemapsForIndex.push({ filename, count: entries.length });
    console.log(`✓ Generated ${filename}: ${entries.length} URLs`);
  });

  // Generate Master Index
  const masterXml = buildSitemapIndexXml(validSitemapsForIndex);
  writeFileSync(resolve(publicDir, 'sitemap.xml'), masterXml, 'utf-8');
  console.log(`\n✓ Master sitemap.xml generated with ${validSitemapsForIndex.length} segmented sitemaps!`);
  console.log(`Total URLs indexed in sitemaps: ${seenUrls.size.toLocaleString()}`);
}

generateProductionSitemaps().catch(console.error);
