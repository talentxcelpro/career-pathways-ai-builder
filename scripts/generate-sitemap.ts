import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTION_ORIGIN } from '../src/config/seo';
import { CANDIDATE_SERVICES, EMPLOYER_SERVICES, INDUSTRY_HUBS, LOCATION_HUBS, RESOURCE_HUBS } from '../src/config/publicIA';
import { coursesDatabase } from '../src/data/coursesData';
import { CONTENT_DATA } from './contentRegistryData';
import { INDIAN_INSTITUTIONS_CATALOG } from '../src/data/indianInstitutionsCatalog';
import { SEED_PROGRAMS, SEED_SCHOLARSHIPS } from '../src/services/globalEducationService';
import { FOUNDATION_NEWS_ARTICLES } from '../src/data/newsArticles';
import { BLOG_POSTS } from '../src/data/blogPostsData';

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
  { path: '/colleges/career-pathway', changefreq: 'daily', priority: '0.9' },
  { path: '/learning', changefreq: 'daily', priority: '0.9' },
  { path: '/jobs', changefreq: 'daily', priority: '1.0' },
  { path: '/hire', changefreq: 'daily', priority: '0.9' },
  { path: '/rankings', changefreq: 'daily', priority: '0.9' },
  { path: '/uae', changefreq: 'daily', priority: '0.9' },
  { path: '/uk', changefreq: 'daily', priority: '0.9' },
  { path: '/usa', changefreq: 'daily', priority: '0.9' },
  { path: '/europe', changefreq: 'daily', priority: '0.9' },
  { path: '/world', changefreq: 'daily', priority: '0.9' },
  { path: '/passport', changefreq: 'weekly', priority: '0.8' },
  { path: '/companies', changefreq: 'daily', priority: '0.8' },
  { path: '/network', changefreq: 'daily', priority: '0.8' },
  { path: '/services', changefreq: 'weekly', priority: '0.8' },
  { path: '/employer', changefreq: 'weekly', priority: '0.8' },
  { path: '/resume', changefreq: 'daily', priority: '0.9' },
  { path: '/resume/build', changefreq: 'daily', priority: '0.9' },
  { path: '/resume/ats-check', changefreq: 'daily', priority: '0.9' },
  { path: '/resume/cover-letter', changefreq: 'daily', priority: '0.9' },
  { path: '/resume/interview-prep', changefreq: 'daily', priority: '0.9' },
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
  'azure-cloud-engineer', 'gcp-cloud-architect', 'site-reliability-engineer',
  'database-administrator', 'sql-developer', 'postgresql-dba', 'security-engineer',
  'cybersecurity-analyst', 'qa-automation-engineer', 'sdet-engineer', 'blockchain-developer',
  'smart-contract-developer', 'web3-architect', 'embedded-systems-engineer',
  'ai-engineer', 'machine-learning-engineer', 'data-scientist', 'data-engineer',
  'data-analyst', 'prompt-engineer', 'llm-engineer', 'computer-vision-engineer',
  'nlp-engineer', 'business-intelligence-analyst', 'deep-learning-researcher',
  'ai-product-manager', 'mlops-engineer', 'big-data-architect',
  'product-manager', 'technical-product-manager', 'growth-product-manager',
  'ui-ux-designer', 'product-designer', 'graphic-designer', 'interaction-designer',
  'ux-researcher', 'design-systems-lead',
  'marketing-manager', 'digital-marketing-specialist', 'seo-specialist', 'growth-marketer',
  'content-writer', 'copywriter', 'social-media-manager', 'performance-marketing-manager',
  'email-marketing-specialist', 'brand-manager', 'community-manager',
  'business-analyst', 'management-consultant', 'sales-manager', 'account-executive',
  'business-development-executive', 'inside-sales-specialist', 'customer-success-manager',
  'solutions-architect', 'pre-sales-consultant',
  'hr-manager', 'talent-acquisition-specialist', 'technical-recruiter', 'hr-business-partner',
  'financial-analyst', 'chartered-accountant', 'investment-banker', 'finance-manager',
  'operations-manager', 'scrum-master', 'agile-coach', 'project-manager'
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

function buildUrlSetXml(entries: SitemapEntry[], originOverride?: string): string {
  const origin = originOverride || PRODUCTION_ORIGIN;
  const urlNodes = entries.map((entry) => {
    const loc = `${origin}${entry.path === '/' ? '/' : entry.path.replace(/\/+$/, '')}`;
    const lines = [
      '  <url>',
      `    <loc>${escapeXml(loc)}</loc>`,
    ];
    if (entry.lastmod) {
      lines.push(`    <lastmod>${entry.lastmod}</lastmod>`);
    }
    lines.push(
      entry.changefreq ? `    <changefreq>${entry.changefreq}</changefreq>` : '    <changefreq>weekly</changefreq>',
      entry.priority ? `    <priority>${entry.priority}</priority>` : '    <priority>0.7</priority>',
      '  </url>'
    );
    return lines.join('\n');
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
  const sitemapNodes = sitemapFiles.map(({ filename }) => [
    '  <sitemap>',
    `    <loc>${PRODUCTION_ORIGIN}/${filename}</loc>`,
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
  console.log('🚀 Starting TalentXcel Clean 15K Quality Core Sitemap Generation...');
  const publicDir = resolve(process.cwd(), 'public');
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

  // Clean up old obsolete sitemap XML files
  console.log('🧹 Purging obsolete matrix sitemap files from public/ ...');
  const existingFiles = readdirSync(publicDir);
  for (const f of existingFiles) {
    if (f.startsWith('sitemap-') && f.endsWith('.xml')) {
      try {
        unlinkSync(resolve(publicDir, f));
      } catch (e) {}
    }
  }

  const globalSeenLocs = new Set<string>();

  const deduplicate = (list: SitemapEntry[]): SitemapEntry[] => {
    const localSeen = new Set<string>();
    const out: SitemapEntry[] = [];
    for (const item of list) {
      const normalized = item.path.replace(/\/+$/, '') || '/';
      if (!localSeen.has(normalized)) {
        localSeen.add(normalized);
        out.push({ ...item, path: normalized });
      }
    }
    return out;
  };

  // 1. Base Static Pages (30 core pages)
  const baseEntries = deduplicate(BASE_PAGES);

  // 2. Fetch Verified Active Jobs from Supabase (548 live vacancies)
  let activeJobEntriesList: SitemapEntry[] = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/jobs', changefreq: 'daily', priority: '1.0' },
  ];
  try {
    const { data: dbJobs } = await supabase
      .from('jobs')
      .select('id, seo_slug, created_at, posted_at')
      .eq('is_active', true)
      .limit(2000);

    if (dbJobs && dbJobs.length > 0) {
      dbJobs.forEach(j => {
        const slug = j.seo_slug || j.id;
        if (slug === 'senior-devops-architect-acme-corp-bengaluru' || slug.includes('acme')) return;
        activeJobEntriesList.push({
          path: `/jobs/${slug}`,
          changefreq: 'daily',
          priority: '0.95',
          lastmod: (j.posted_at || j.created_at || '').split('T')[0] || undefined
        });
      });
    }
  } catch (e) {
    console.error('Error fetching active jobs for sitemap:', e);
  }
  const activeJobEntries = deduplicate(activeJobEntriesList);

  // 3. Fetch Verified Indian Colleges (10,250 primary dossiers only, NO sub-tab facets)
  let allColleges: any[] = [];
  try {
    const { data: dbColleges } = await supabase
      .from('colleges')
      .select('slug, state, city')
      .limit(12000);
    if (dbColleges && dbColleges.length > 0) {
      allColleges = dbColleges;
    }
  } catch (e) {}

  if (allColleges.length === 0) {
    allColleges = INDIAN_INSTITUTIONS_CATALOG.map(c => ({
      slug: c.slug,
      state: c.state,
      city: c.city
    }));
  }

  const collegeOverview: SitemapEntry[] = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/colleges', changefreq: 'daily', priority: '1.0' },
  ];
  allColleges.forEach(c => {
    if (!c.slug) return;
    collegeOverview.push({ path: `/colleges/${c.slug}`, changefreq: 'weekly', priority: '0.8' });
  });
  const collegeOverviewEntries = deduplicate(collegeOverview);

  // 4. Career Pathways (85 canonical roles)
  const pathwayEntries = deduplicate(CANONICAL_ROLES.map(r => ({
    path: `/colleges/career-pathway/${r}`,
    changefreq: 'daily',
    priority: '0.85'
  })));

  // 5. Verified Location Hubs (36 high-demand cities)
  const locationEntries = deduplicate(LOCATION_HUBS.map(hub => ({
    path: `/locations/${hub.slug}`,
    changefreq: 'weekly',
    priority: '0.85'
  })));

  // 6. Posts & Articles (Verified editorial & community data)
  let postEntriesList: SitemapEntry[] = [];
  try {
    const { data: posts } = await supabase.from('posts').select('id, created_at').limit(1000);
    if (posts) {
      posts.forEach(p => {
        postEntriesList.push({
          path: `/posts/${p.id}`,
          changefreq: 'weekly',
          priority: '0.7',
          lastmod: (p.created_at || '').split('T')[0] || undefined
        });
      });
    }
  } catch (e) {}
  const postEntries = deduplicate(postEntriesList);

  // 7. Verified Company Profiles
  const companyEntries = deduplicate([
    { path: '/company/talentxcel', changefreq: 'daily', priority: '1.0' },
    { path: '/company/talentxcel-services', changefreq: 'daily', priority: '1.0' },
    { path: '/company/chatr-chat', changefreq: 'daily', priority: '1.0' },
    { path: '/company/savantis-solutions', changefreq: 'daily', priority: '1.0' },
  ]);

  // 8. Verified Talent & Recruitment Services
  const serviceSlugs = ['ai-recruitment', 'staffing-recruitment', 'rpo', 'it-services', 'career-counseling', 'resume-optimization', 'talent-management', 'job-placement'];
  const serviceEntries = deduplicate([
    ...serviceSlugs.map(s => ({ path: `/services/${s}`, changefreq: 'weekly', priority: '0.85' })),
    ...CANDIDATE_SERVICES.map(s => ({ path: `/${s.slug}`, changefreq: 'weekly', priority: '0.8' })),
    ...EMPLOYER_SERVICES.map(s => ({ path: `/${s.slug}`, changefreq: 'weekly', priority: '0.8' })),
  ]);

  // 9. Verified Rankings Leaderboards
  const rankingsEntries = deduplicate([
    { path: '/rankings', changefreq: 'daily', priority: '1.0' },
    { path: '/rankings/ai-products', changefreq: 'daily', priority: '0.95' },
    { path: '/rankings/ai-products/global', changefreq: 'daily', priority: '0.9' },
    { path: '/rankings/ai-products/india', changefreq: 'daily', priority: '0.9' },
    { path: '/rankings/ai-products/usa', changefreq: 'daily', priority: '0.9' },
    { path: '/rankings/ai-products/uae', changefreq: 'daily', priority: '0.9' },
  ]);

  // 10. Verified Courses
  const learningEntries = deduplicate([
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/learning', changefreq: 'daily', priority: '1.0' },
    ...Object.keys(coursesDatabase || {}).map(cid => ({
      path: `/learning/course/${cid}`,
      changefreq: 'weekly' as const,
      priority: '0.8'
    }))
  ]);

  // 11. Authoritative Blog Articles (26 verified articles + /blog)
  const blogEntries = deduplicate([
    { path: '/blog', changefreq: 'daily', priority: '0.9' },
    ...BLOG_POSTS.map(p => ({
      path: `/blog/${p.slug}`,
      changefreq: 'weekly',
      priority: '0.85',
      lastmod: p.date ? new Date(p.date).toISOString().split('T')[0] : undefined
    }))
  ]);

  // 12. Authoritative News & PR Publications (20 verified articles + /news)
  const newsEntries = deduplicate([
    { path: '/news', changefreq: 'daily', priority: '0.9' },
    ...FOUNDATION_NEWS_ARTICLES.map(a => ({
      path: `/news/${a.slug}`,
      changefreq: 'weekly',
      priority: '0.85',
      lastmod: (a.updatedAt || a.publishedAt || '').split('T')[0] || undefined
    }))
  ]);

  // 13. Dedicated Subdomain Specific URL Clusters
  const resumeEntries = deduplicate([
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/resume', changefreq: 'daily', priority: '1.0' },
    { path: '/resume/build', changefreq: 'daily', priority: '0.9' },
    { path: '/resume/ats-check', changefreq: 'daily', priority: '0.9' },
    { path: '/resume/cover-letter', changefreq: 'daily', priority: '0.9' },
    { path: '/resume/interview-prep', changefreq: 'daily', priority: '0.9' },
    { path: '/resume/software-engineer/ats-keywords', changefreq: 'daily', priority: '0.9' },
    { path: '/resume/data-analyst/ats-keywords', changefreq: 'daily', priority: '0.9' },
    { path: '/resume/devops-engineer/ats-keywords', changefreq: 'daily', priority: '0.8' },
    { path: '/resume/templates', changefreq: 'weekly', priority: '0.8' },
    { path: '/tools/ats-checker', changefreq: 'daily', priority: '0.9' },
    { path: '/tools/resume-checker', changefreq: 'daily', priority: '0.9' },
  ]);

  const salaryEntries = deduplicate([
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/salary', changefreq: 'daily', priority: '1.0' },
    { path: '/salary/software-engineer/bangalore', changefreq: 'weekly', priority: '0.9' },
    { path: '/salary/data-analyst/hyderabad', changefreq: 'weekly', priority: '0.8' },
    { path: '/salary/devops-engineer/india', changefreq: 'weekly', priority: '0.8' },
    { path: '/salary/devops-engineer/pune', changefreq: 'weekly', priority: '0.8' },
    { path: '/tools/salary-analyzer', changefreq: 'daily', priority: '0.9' },
  ]);

  const careersEntries = deduplicate([
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/career-map', changefreq: 'daily', priority: '1.0' },
    { path: '/career-map/software-engineer', changefreq: 'weekly', priority: '0.9' },
    { path: '/career-map/data-analyst', changefreq: 'weekly', priority: '0.9' },
    { path: '/ai-career-hub', changefreq: 'daily', priority: '0.9' },
    { path: '/career-intelligence', changefreq: 'daily', priority: '0.9' },
    { path: '/career-platform', changefreq: 'weekly', priority: '0.8' },
    { path: '/how-to-become/cloud-architect', changefreq: 'weekly', priority: '0.8' },
    { path: '/how-to-become/product-manager', changefreq: 'weekly', priority: '0.8' },
  ]);

  const governmentEntries = deduplicate([
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/government-jobs', changefreq: 'daily', priority: '1.0' },
    { path: '/government-jobs/exams/upsc-2026', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/exams/ssc-cgl-2026', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/exams/ibps-po-2026', changefreq: 'daily', priority: '0.9' },
  ]);

  const employerEntries = deduplicate([
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/recruiters', changefreq: 'daily', priority: '1.0' },
    { path: '/companies', changefreq: 'daily', priority: '0.9' },
    { path: '/hire', changefreq: 'daily', priority: '0.9' },
    { path: '/staffing', changefreq: 'weekly', priority: '0.8' },
    { path: '/recruitment', changefreq: 'weekly', priority: '0.8' },
    { path: '/rpo', changefreq: 'weekly', priority: '0.8' },
  ]);

  const passportEntries = deduplicate([
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/passport', changefreq: 'weekly', priority: '0.9' },
  ]);

  // Master segmented configuration array (All 10 Dedicated Production Domains + Supplemental Hubs)
  const sitemapConfig: { filename: string; entries: SitemapEntry[]; origin?: string }[] = [
    { filename: 'sitemap-base.xml', entries: baseEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-core.xml', entries: baseEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-jobs.xml', entries: activeJobEntries, origin: 'https://jobs.talentxcel.in' },
    { filename: 'sitemap-learning.xml', entries: learningEntries, origin: 'https://learning.talentxcel.in' },
    { filename: 'sitemap-passport.xml', entries: passportEntries, origin: 'https://passport.talentxcel.in' },
    { filename: 'sitemap-government.xml', entries: governmentEntries, origin: 'https://government.talentxcel.in' },
    { filename: 'sitemap-employers.xml', entries: employerEntries, origin: 'https://employers.talentxcel.in' },
    { filename: 'sitemap-colleges.xml', entries: collegeOverviewEntries, origin: 'https://colleges.talentxcel.in' },
    { filename: 'sitemap-careers.xml', entries: careersEntries, origin: 'https://careers.talentxcel.in' },
    { filename: 'sitemap-salary.xml', entries: salaryEntries, origin: 'https://salary.talentxcel.in' },
    { filename: 'sitemap-resume.xml', entries: resumeEntries, origin: 'https://resume.talentxcel.in' },
    { filename: 'sitemap-career-paths.xml', entries: pathwayEntries, origin: 'https://careers.talentxcel.in' },
    { filename: 'sitemap-locations.xml', entries: locationEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-posts.xml', entries: postEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-blog.xml', entries: blogEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-news.xml', entries: newsEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-companies.xml', entries: companyEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-services.xml', entries: serviceEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-rankings.xml', entries: rankingsEntries, origin: 'https://talentxcel.in' },
  ];

  const validSitemapsForIndex: { filename: string; count: number }[] = [];

  sitemapConfig.forEach(({ filename, entries, origin }) => {
    if (entries.length > 0) {
      const xml = buildUrlSetXml(entries, origin);
      writeFileSync(resolve(publicDir, filename), xml, 'utf-8');
      validSitemapsForIndex.push({ filename, count: entries.length });
      entries.forEach(e => globalSeenLocs.add(`${origin || PRODUCTION_ORIGIN}${e.path}`));
      console.log(`✓ Generated ${filename}: ${entries.length.toLocaleString()} URLs (Origin: ${origin || PRODUCTION_ORIGIN})`);
    }
  });

  // Generate Master Index (sitemap.xml and sitemap-root.xml)
  const masterXml = buildSitemapIndexXml(validSitemapsForIndex);
  writeFileSync(resolve(publicDir, 'sitemap.xml'), masterXml, 'utf-8');
  writeFileSync(resolve(publicDir, 'sitemap-root.xml'), masterXml, 'utf-8');
  console.log(`\n✓ Master sitemap.xml & sitemap-root.xml generated with ${validSitemapsForIndex.length} segmented sitemaps!`);
  console.log(`Total URLs Published in Sitemaps: ${globalSeenLocs.size.toLocaleString()}`);

  const robotsSrc = resolve(publicDir, 'robots.txt');
  const robotsRoot = resolve(publicDir, 'robots-root.txt');
  if (existsSync(robotsSrc)) {
    const robotsContent = readFileSync(robotsSrc, 'utf-8');
    writeFileSync(robotsRoot, robotsContent, 'utf-8');
    console.log(`✓ Synchronized robots-root.txt`);
  }
}

generateProductionSitemaps().catch(console.error);
