import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTION_ORIGIN } from '../src/config/seo';
import { CANDIDATE_SERVICES, EMPLOYER_SERVICES, INDUSTRY_HUBS, LOCATION_HUBS, RESOURCE_HUBS } from '../src/config/publicIA';
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

const CANONICAL_ROLES = [
  'software-engineer', 'full-stack-developer', 'frontend-developer', 'backend-developer',
  'react-developer', 'node-js-developer', 'python-developer', 'java-developer',
  'golang-developer', 'ios-developer', 'android-developer', 'flutter-developer',
  'react-native-developer', 'devops-engineer', 'cloud-architect', 'aws-solutions-architect',
  'site-reliability-engineer', 'database-administrator', 'security-engineer',
  'cybersecurity-analyst', 'qa-automation-engineer', 'blockchain-developer',
  'ai-engineer', 'machine-learning-engineer', 'data-scientist', 'data-engineer',
  'data-analyst', 'prompt-engineer', 'llm-engineer', 'computer-vision-engineer',
  'nlp-engineer', 'business-intelligence-analyst', 'deep-learning-researcher',
  'product-manager', 'technical-product-manager', 'ui-ux-designer', 'product-designer',
  'graphic-designer', 'interaction-designer', 'ux-researcher',
  'marketing-manager', 'digital-marketing-specialist', 'seo-specialist', 'growth-marketer',
  'content-writer', 'copywriter', 'social-media-manager', 'performance-marketing-manager',
  'business-analyst', 'management-consultant', 'sales-manager', 'account-executive',
  'business-development-executive', 'customer-success-manager',
  'hr-manager', 'talent-acquisition-specialist', 'technical-recruiter', 'hr-business-partner',
  'financial-analyst', 'chartered-accountant', 'investment-banker', 'finance-manager',
  'operations-manager', 'scrum-master', 'agile-coach'
];

const CANONICAL_LOCATIONS = [
  'bangalore', 'hyderabad', 'pune', 'noida', 'gurgaon', 'mumbai', 'delhi-ncr',
  'chennai', 'kolkata', 'ahmedabad', 'chandigarh', 'jaipur', 'kochi', 'indore',
  'lucknow', 'coimbatore', 'bhopal', 'nagpur', 'bhubaneswar', 'visakhapatnam',
  'trivandrum', 'vadodara', 'surat', 'patna', 'dehradun',
  'remote', 'dubai', 'singapore', 'london', 'new-york', 'san-francisco', 'toronto',
  'berlin', 'amsterdam', 'sydney', 'tokyo', 'dublin', 'austin', 'seattle'
];

const CANONICAL_SKILLS = [
  'react', 'python', 'java', 'node-js', 'aws', 'docker', 'kubernetes', 'typescript',
  'javascript', 'next-js', 'sql', 'postgresql', 'mongodb', 'c-plus-plus', 'golang',
  'machine-learning', 'artificial-intelligence', 'deep-learning', 'pytorch', 'tensorflow',
  'langchain', 'graphql', 'html-css', 'tailwind-css', 'git', 'linux', 'devops',
  'microservices', 'rest-apis', 'ci-cd', 'solidity', 'web3', 'flutter', 'react-native',
  'product-management', 'ui-ux-design', 'figma', 'seo', 'digital-marketing', 'data-analytics',
  'power-bi', 'tableau', 'excel', 'financial-modeling', 'agile', 'scrum'
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
  const sitemapNodes = sitemapFiles.map(({ filename }) => [
    '  <sitemap>',
    `    <loc>${PRODUCTION_ORIGIN}/${filename}</loc>`,
    `    <lastmod>${today}</lastmod>`,
    '  </sitemap>',
  ].join('\n'));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapNodes,
    '</sitemapindex>',
    '',
  ].join('\n');
}

export async function generateProductionSitemaps() {
  console.log('🚀 Starting TalentXcel Comprehensive Programmatic Sitemap Generation (Scale Model)...');
  const publicDir = resolve(process.cwd(), 'public');
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

  const seenUrls = new Set<string>();
  const deduplicate = (entries: SitemapEntry[]): SitemapEntry[] => {
    const filtered: SitemapEntry[] = [];
    entries.forEach((e) => {
      const normalized = e.path.toLowerCase().replace(/\/+$/, '') || '/';
      if (!seenUrls.has(normalized)) {
        seenUrls.add(normalized);
        filtered.push({ ...e, path: normalized });
      }
    });
    return filtered;
  };

  // 1. Base Pages
  const baseEntries = deduplicate(BASE_PAGES);

  // 2. Colleges & Higher Ed
  const collegeEntries = deduplicate(
    INDIAN_INSTITUTIONS_CATALOG.map((inst) => ({
      path: `/colleges/${inst.slug}`,
      changefreq: 'weekly' as const,
      priority: '0.8',
    }))
  );

  // 3. Global Degree Programs
  const globalList: SitemapEntry[] = [];
  (SEED_PROGRAMS || []).forEach((prog) => {
    globalList.push({
      path: `/colleges/global-programs/${prog.id}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });
  const countries = ['germany', 'norway', 'usa', 'uk', 'singapore', 'australia', 'canada', 'netherlands', 'sweden', 'france'];
  countries.forEach((c) => {
    globalList.push({
      path: `/colleges/global-programs/country/${c}`,
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
    'devops-engineer', 'product-manager', 'machine-learning-engineer', 'investment-banker'
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

  // 7. Verified Database Jobs
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
    console.warn('Jobs query warning:', err);
  }
  const jobEntries = deduplicate(jobEntriesList);

  // 8. Programmatic Role x Location Job Hubs
  const programmaticJobsList: SitemapEntry[] = [];
  CANONICAL_ROLES.forEach((r) => {
    programmaticJobsList.push({
      path: `/jobs/role/${r}`,
      changefreq: 'daily',
      priority: '0.85',
    });
    CANONICAL_LOCATIONS.slice(0, 25).forEach((loc) => {
      programmaticJobsList.push({
        path: `/jobs/${r}/in/${loc}`,
        changefreq: 'daily',
        priority: '0.8',
      });
    });
  });
  CANONICAL_LOCATIONS.forEach((loc) => {
    programmaticJobsList.push({
      path: `/jobs/location/${loc}`,
      changefreq: 'daily',
      priority: '0.85',
    });
  });
  const programmaticJobEntries = deduplicate(programmaticJobsList);

  // 9. Programmatic Salary & Tax Intelligence Matrix (Wise-Model)
  const salaryList: SitemapEntry[] = [];
  CANONICAL_ROLES.forEach((r) => {
    salaryList.push({
      path: `/salary/${r}`,
      changefreq: 'weekly',
      priority: '0.85',
    });
    CANONICAL_LOCATIONS.slice(0, 20).forEach((loc) => {
      salaryList.push({
        path: `/salary/${r}/${loc}`,
        changefreq: 'weekly',
        priority: '0.8',
      });
    });
  });
  const salaryEntries = deduplicate(salaryList);

  // 10. Skills Job Matrix
  const skillsList: SitemapEntry[] = [];
  CANONICAL_SKILLS.forEach((sk) => {
    skillsList.push({
      path: `/jobs/skill/${sk}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
    CANONICAL_LOCATIONS.slice(0, 15).forEach((loc) => {
      skillsList.push({
        path: `/jobs/${sk}/jobs/in/${loc}`,
        changefreq: 'weekly',
        priority: '0.75',
      });
    });
  });
  const skillEntries = deduplicate(skillsList);

  // 11. Posts & Social Feed
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
    console.warn('Posts query warning:', err);
  }
  const postEntries = deduplicate(postEntriesList);

  // 12. Topics & Services
  const topicSlugs = ['artificial-intelligence', 'recruitment', 'careers', 'education', 'technology', 'leadership', 'business'];
  const topicEntries = deduplicate(topicSlugs.map((t) => ({ path: `/topics/${t}`, changefreq: 'weekly' as const, priority: '0.8' })));

  const serviceSlugs = ['ai-recruitment', 'staffing-recruitment', 'it-consulting', 'ai-solutions', 'corporate-training', 'career-services', 'resume-building', 'talent-management'];
  const serviceEntries = deduplicate([
    ...serviceSlugs.map((s) => ({ path: `/services/${s}`, changefreq: 'weekly' as const, priority: '0.8' })),
    ...CANDIDATE_SERVICES.map((s) => ({ path: `/${s.slug}`, changefreq: 'weekly' as const, priority: '0.8' })),
    ...EMPLOYER_SERVICES.map((s) => ({ path: `/${s.slug}`, changefreq: 'weekly' as const, priority: '0.8' })),
  ]);

  const companyEntries = deduplicate([
    { path: '/company/talentxcel', changefreq: 'daily', priority: '1.0' },
    { path: '/company/talentxcel-services', changefreq: 'daily', priority: '1.0' },
    { path: '/companies/talentxcel', changefreq: 'weekly', priority: '0.8' },
  ]);

  const editorialEntries = deduplicate([
    ...(FOUNDATION_NEWS_ARTICLES || []).map((art) => ({ path: `/news/${art.slug}`, changefreq: 'weekly' as const, priority: '0.8' })),
    ...(CONTENT_DATA || []).map((item) => ({ path: `/resources/${item.slug}`, changefreq: 'monthly' as const, priority: '0.6' })),
  ]);

  const industryEntries = deduplicate(INDUSTRY_HUBS.map((hub) => ({ path: `/industries/${hub.slug}`, changefreq: 'weekly', priority: '0.7' })));
  const locationEntries = deduplicate(LOCATION_HUBS.map((hub) => ({ path: `/locations/${hub.slug}`, changefreq: 'weekly', priority: '0.7' })));
  const resourceEntries = deduplicate(RESOURCE_HUBS.map((hub) => ({ path: `/resources/${hub.slug}`, changefreq: 'weekly', priority: '0.7' })));

  const toolsEntries = deduplicate([
    { path: '/resume-builder', changefreq: 'weekly', priority: '0.8' },
    { path: '/career-tools', changefreq: 'weekly', priority: '0.8' },
    { path: '/salary-calculator', changefreq: 'weekly', priority: '0.7' },
    { path: '/skill-assessment', changefreq: 'weekly', priority: '0.7' },
    { path: '/claim1/watch', changefreq: 'weekly', priority: '0.7' },
  ]);

  const sitemapConfig = [
    { filename: 'sitemap-base.xml', entries: baseEntries },
    { filename: 'sitemap-colleges.xml', entries: collegeEntries },
    { filename: 'sitemap-global-programs.xml', entries: globalEntries },
    { filename: 'sitemap-scholarships.xml', entries: scholarshipEntries },
    { filename: 'sitemap-career-paths.xml', entries: pathwayEntries },
    { filename: 'sitemap-learning.xml', entries: learningEntries },
    { filename: 'sitemap-jobs.xml', entries: jobEntries },
    { filename: 'sitemap-job-roles.xml', entries: programmaticJobEntries },
    { filename: 'sitemap-salaries.xml', entries: salaryEntries },
    { filename: 'sitemap-skills.xml', entries: skillEntries },
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
  console.log(`Total URLs Published/Discovered in Sitemaps: ${seenUrls.size.toLocaleString()}`);
}

generateProductionSitemaps().catch(console.error);
