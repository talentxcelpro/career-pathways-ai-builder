import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTION_ORIGIN } from '../src/config/seo';
import { formatCanonicalUrl } from '../src/config/domainArchitecture';
import { CANDIDATE_SERVICES, EMPLOYER_SERVICES, INDUSTRY_HUBS, RESOURCE_HUBS } from '../src/config/publicIA';
import { coursesDatabase } from '../src/data/coursesData';
import { CONTENT_DATA } from './contentRegistryData';
import { INDIAN_INSTITUTIONS_CATALOG } from '../src/data/indianInstitutionsCatalog';
import { SEED_PROGRAMS, SEED_SCHOLARSHIPS } from '../src/services/globalEducationService';
import { CANONICAL_ROLES, CANONICAL_CITIES } from '../src/lib/seo/pseoTaxonomy';
import { CAREER_TRANSITIONS_CATALOG } from '../src/data/careerPathwaysCatalog';

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
  { path: '/resume/ats-check', changefreq: 'daily', priority: '0.9' },
  { path: '/resume/cover-letter', changefreq: 'daily', priority: '0.9' },
  { path: '/resume/interview-prep', changefreq: 'daily', priority: '0.9' },
  { path: '/mcp', changefreq: 'daily', priority: '0.9' },
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

function canonicalSitemapLoc(entry: SitemapEntry, originOverride?: string): string {
  const normalizedPath = entry.path === '/' ? '/' : entry.path.replace(/\/+$/, '');
  // Product subdomain homepages remain canonical to that universe; routed pages
  // follow the centralized apex canonical policy in domainArchitecture.ts.
  return normalizedPath === '/'
    ? `${originOverride || PRODUCTION_ORIGIN}/`
    : formatCanonicalUrl(normalizedPath);
}

function buildUrlSetXml(entries: SitemapEntry[], originOverride?: string): string {
  const urlNodes = entries.map((entry) => {
    const loc = canonicalSitemapLoc(entry, originOverride);
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

function safeWriteFile(filePath: string, content: string, retries = 5) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      writeFileSync(filePath, content, 'utf-8');
      return;
    } catch (err) {
      if (attempt === retries) throw err;
      const end = Date.now() + 100 * attempt;
      while (Date.now() < end) {}
    }
  }
}

export async function generateProductionSitemaps() {
  console.log('Generating TalentXcel XML sitemaps from configured public routes...');
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

  let activeJobEntriesList: SitemapEntry[] = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/jobs', changefreq: 'daily', priority: '1.0' },
  ];
  try {
    let allDbJobs: any[] = [];
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data: chunk, error } = await supabase
        .from('jobs')
        .select('id, seo_slug, created_at, posted_at, expires_at, job_status')
        .eq('is_active', true)
        .range(from, to);

      if (error || !chunk || chunk.length === 0) {
        hasMore = false;
      } else {
        allDbJobs.push(...chunk);
        if (chunk.length < pageSize) {
          hasMore = false;
        } else {
          page++;
        }
      }
    }

    if (allDbJobs.length > 0) {
      allDbJobs.forEach(j => {
        const slug = j.seo_slug || j.id;
        if (!slug || slug === 'senior-devops-architect-acme-corp-bengaluru' || slug.includes('acme')) return;
        
        // Quality Gate: Exclude closed or expired jobs from XML sitemap
        if (j.job_status === 'closed' || j.job_status === 'expired') return;
        if (j.expires_at && !isNaN(new Date(j.expires_at).getTime()) && new Date(j.expires_at) < new Date()) {
          return;
        }

        activeJobEntriesList.push({
          path: `/jobs/${slug}`,
          changefreq: 'daily',
          priority: '0.95',
          lastmod: (j.posted_at || j.created_at || '').split('T')[0] || undefined
        });
      });
    }
    // Add 5 Verified International Landing Page Hubs
    const internationalHubSlugs = [
      'data-analyst-dubai-uae',
      'software-engineer-abu-dhabi-uae',
      'cloud-engineer-riyadh-saudi-arabia',
      'data-analyst-remote-usa',
      'software-engineer-remote-us'
    ];
    internationalHubSlugs.forEach(slug => {
      activeJobEntriesList.push({
        path: `/jobs/${slug}`,
        changefreq: 'daily',
        priority: '0.9',
        lastmod: new Date().toISOString().split('T')[0]
      });
    });


    console.log(`✓ Fetched ${allDbJobs.length} active jobs from database for sitemap-jobs.xml`);
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
    allColleges = INDIAN_INSTITUTIONS_CATALOG
      .filter((c: any) => c.accreditation?.nirfRank || c.nirfRank2024 || c.accreditation?.isInstituteOfEminence || c.isIndexable)
      .map((c: any) => ({
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
  const pathwayEntries = deduplicate([
    ...CANONICAL_ROLES.map(r => ({
      path: `/colleges/career-pathway/${r}`,
      changefreq: 'daily' as const,
      priority: '0.85',
    })),
    ...CAREER_TRANSITIONS_CATALOG.map(t => ({
      path: `/career-pathway/${t.id}`,
      changefreq: 'daily' as const,
      priority: '0.85',
    })),
  ]);

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
  if (postEntriesList.length === 0) {
    postEntriesList.push({
      path: '/posts',
      changefreq: 'weekly',
      priority: '0.7'
    });
  }
  const postEntries = deduplicate(postEntriesList);

  // 7. Verified Company Profiles (All 15 Verified Platform Enterprises)
  const VERIFIED_COMPANY_SLUGS = [
    'hdfc-bank', 'tata-steel', 'ntpc', 'steel-authority-of-india',
    'jindal-steel-power', 'bajaj-auto', 'hcl-technologies', 'bharat-coking-coal-limited',
    'raymond', 'zomato', 'ibs-software', 'talentxcel', 'talentxcel-services',
    'chatr-chat', 'savantis-solutions'
  ];
  const companyEntries = deduplicate(
    VERIFIED_COMPANY_SLUGS.map((slug) => ({
      path: `/company/${slug}`,
      changefreq: 'daily' as const,
      priority: '1.0',
    }))
  );

  // 7B. Verified Location Hubs (Only 60 Indian Cities with >= 10 unexpired jobs)
  const ELIGIBLE_CITY_SLUGS = [
    'bhopal', 'jaipur', 'chandigarh', 'pune', 'coimbatore', 'mumbai', 'bhubaneswar',
    'noida', 'kolkata', 'indore', 'surat', 'chennai', 'kochi', 'hyderabad', 'patna',
    'delhi', 'bangalore', 'gurugram', 'bilaspur', 'nagpur', 'dhanbad', 'jamshedpur',
    'aurangabad', 'amravati', 'kanpur', 'vadodara', 'nashik', 'kota', 'jammu', 'guwahati',
    'hubli', 'dehradun', 'srinagar', 'mysuru', 'solapur', 'kolhapur', 'gwalior', 'jabalpur',
    'jodhpur', 'udaipur', 'haridwar', 'calicut', 'ranchi', 'aligarh', 'raipur', 'mangalore',
    'belgaum', 'tiruchirappalli', 'salem', 'moradabad', 'thrissur', 'kollam', 'warangal',
    'guntur', 'vellore', 'vijayawada', 'ahmedabad', 'varanasi', 'lucknow'
  ];
  const locationEntries = deduplicate(
    ELIGIBLE_CITY_SLUGS.map((slug) => ({
      path: `/locations/${slug}`,
      changefreq: 'daily' as const,
      priority: '0.9',
    }))
  );

  // 7C. Verified Combinatorial pSEO Hubs (from mv_eligible_seo_hubs >= 5 unexpired jobs)
  let comboEntriesList: SitemapEntry[] = [];
  try {
    const { data: dbCombos } = await supabase
      .from('mv_eligible_seo_hubs')
      .select('hub_type, hub_slug, last_modified_at')
      .neq('hub_type', 'city');
    if (dbCombos && dbCombos.length > 0) {
      dbCombos.forEach((c) => {
        const pathPrefix = c.hub_type === 'company_city' ? '/company/' : '/jobs/';
        comboEntriesList.push({
          path: `${pathPrefix}${c.hub_slug}`,
          changefreq: 'daily',
          priority: '0.85',
          lastmod: (c.last_modified_at || '').split('T')[0] || undefined
        });
      });
    }
  } catch (e) {
    console.warn('Could not query mv_eligible_seo_hubs directly, skipping dynamic combos');
  }
  const comboEntries = deduplicate(comboEntriesList);

  // 8. Verified Talent & Recruitment Services
  const serviceSlugs = ['ai-recruitment', 'staffing-recruitment', 'rpo', 'it-services', 'career-counseling', 'resume-optimization', 'talent-management', 'job-placement'];
  const serviceEntries = deduplicate([
    ...serviceSlugs.map(s => ({ path: `/services/${s}`, changefreq: 'weekly', priority: '0.85' })),
    ...CANDIDATE_SERVICES.map(s => ({ path: `/${s.slug}`, changefreq: 'weekly', priority: '0.8' })),
    ...EMPLOYER_SERVICES.map(s => ({ path: `/${s.slug}`, changefreq: 'weekly', priority: '0.8' })),
  ]);

  // Public bid-based leaderboards backed by current Claim #1 records.
  const rankingsEntries = deduplicate([
    { path: '/rankings', changefreq: 'daily', priority: '0.9' },
    { path: '/rankings/ai-products', changefreq: 'daily', priority: '0.8' },
    ...['global', 'emerging', 'india', 'usa', 'uae', 'uk', 'singapore'].map((scope) => ({
      path: `/rankings/ai-products/${scope}`,
      changefreq: 'daily' as const,
      priority: '0.7',
    })),
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

  // Keep editorial detail pages out until their claims have supporting source records.
  const blogEntries = deduplicate([
    { path: '/blog', changefreq: 'weekly', priority: '0.6' },
  ]);

  // Keep news detail pages out until their claims have supporting source records.
  const newsEntries = deduplicate([
    { path: '/news', changefreq: 'weekly', priority: '0.6' },
  ]);

  // 13. Dedicated Subdomain Specific URL Clusters
  const resumeEntries = deduplicate([
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/resume', changefreq: 'daily', priority: '1.0' },
    { path: '/resume/ats-check', changefreq: 'daily', priority: '0.9' },
    { path: '/resume/cover-letter', changefreq: 'daily', priority: '0.9' },
    { path: '/resume/interview-prep', changefreq: 'daily', priority: '0.9' },
    { path: '/resume/templates', changefreq: 'weekly', priority: '0.8' },
    { path: '/tools/ats-checker', changefreq: 'daily', priority: '0.9' },
    { path: '/tools/resume-checker', changefreq: 'daily', priority: '0.9' },
    ...CANONICAL_ROLES.slice(0, 30).map((role) => ({
      path: `/resume/${role}/ats-keywords`,
      changefreq: 'daily' as const,
      priority: '0.9',
    })),
  ]);

  const salaryRoleEntries = CANONICAL_ROLES.map(role => ({
    path: `/salary/${role}-salary`,
    changefreq: 'daily' as const,
    priority: '0.85',
  }));

  const topCities = CANONICAL_CITIES.slice(0, 8);
  const salaryCityEntries: SitemapEntry[] = [];
  for (const role of CANONICAL_ROLES.slice(0, 20)) {
    for (const city of topCities) {
      salaryCityEntries.push({
        path: `/salary/${role}-salary-in-${city.slug}`,
        changefreq: 'daily' as const,
        priority: '0.8',
      });
    }
  }

  const salaryEntries = deduplicate([
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/salary', changefreq: 'daily', priority: '1.0' },
    { path: '/tools/salary-analyzer', changefreq: 'daily', priority: '0.9' },
    { path: '/tools/salary-benchmark-tool', changefreq: 'daily', priority: '0.9' },
    { path: '/salary/calculator', changefreq: 'daily', priority: '0.9' },
    { path: '/salary/tax-planning', changefreq: 'daily', priority: '0.9' },
    { path: '/salary/benchmark', changefreq: 'daily', priority: '0.9' },
    { path: '/salary/compensation', changefreq: 'daily', priority: '0.9' },
    { path: '/salary/negotiation', changefreq: 'daily', priority: '0.9' },
    { path: '/salary/wealth', changefreq: 'daily', priority: '0.9' },
    { path: '/salary/payslip', changefreq: 'daily', priority: '0.9' },
    { path: '/salary/employer', changefreq: 'daily', priority: '0.9' },
    ...salaryRoleEntries,
    ...salaryCityEntries,
  ]);

  const careersEntries = deduplicate([
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/career-map', changefreq: 'daily', priority: '1.0' },
    { path: '/ai-career-hub', changefreq: 'daily', priority: '0.9' },
    { path: '/career-intelligence', changefreq: 'daily', priority: '0.9' },
    { path: '/career-platform', changefreq: 'weekly', priority: '0.8' },
    { path: '/tools/career-pathfinder', changefreq: 'daily', priority: '0.9' },
    { path: '/tools/career-growth-score', changefreq: 'daily', priority: '0.9' },
    { path: '/tools/career-swot-analysis', changefreq: 'daily', priority: '0.9' },
    { path: '/tools/role-fit-evaluator', changefreq: 'daily', priority: '0.9' },
    { path: '/how-to-become/cloud-architect', changefreq: 'weekly', priority: '0.8' },
    { path: '/how-to-become/product-manager', changefreq: 'weekly', priority: '0.8' },
    ...CANONICAL_ROLES.map((role) => ({
      path: `/career-map/${role}`,
      changefreq: 'weekly' as const,
      priority: '0.85',
    })),
    ...CAREER_TRANSITIONS_CATALOG.map((t) => ({
      path: `/career-map/${t.id}`,
      changefreq: 'daily' as const,
      priority: '0.85',
    })),
  ]);

  const governmentEntries = deduplicate([
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/government-jobs', changefreq: 'daily', priority: '1.0' },
    { path: '/government-jobs/freshers', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/india', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/india/freshers', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/exams/upsc-2026', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/exams/ssc-cgl-2026', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/exams/ibps-po-2026', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/exams/rbi-grade-b', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/exams/gate-2026', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/exams/nda-cds', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/departments/railways', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/departments/banking', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/departments/defence', changefreq: 'daily', priority: '0.9' },
    { path: '/government-jobs/departments/civil-services', changefreq: 'daily', priority: '0.9' },
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
    { path: '/passport', changefreq: 'weekly', priority: '1.0' },
    { path: '/pricing', changefreq: 'daily', priority: '0.95' },
    { path: '/verify', changefreq: 'daily', priority: '0.95' },
    { path: '/passport/section/skills', changefreq: 'weekly', priority: '0.9' },
    { path: '/passport/section/experience', changefreq: 'weekly', priority: '0.9' },
    { path: '/passport/section/credentials', changefreq: 'weekly', priority: '0.9' },
    { path: '/passport/section/verifications', changefreq: 'weekly', priority: '0.9' },
    { path: '/passport/section/achievements', changefreq: 'weekly', priority: '0.9' },
    { path: '/passport/enterprise', changefreq: 'weekly', priority: '0.85' },
    { path: '/passport/institutions', changefreq: 'weekly', priority: '0.85' },
    { path: '/passport/faq', changefreq: 'monthly', priority: '0.7' },
  ]);

  // Master segmented configuration array (All 10 Dedicated Production Domains + Supplemental Hubs)
  const sitemapConfig: { filename: string; entries: SitemapEntry[]; origin?: string }[] = [
    { filename: 'sitemap-base.xml', entries: baseEntries, origin: 'https://talentxcel.in' },
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
    { filename: 'sitemap-posts.xml', entries: postEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-blog.xml', entries: blogEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-news.xml', entries: newsEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-companies.xml', entries: companyEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-locations.xml', entries: locationEntries, origin: 'https://talentxcel.in' },
    ...(comboEntries.length > 0 ? [{ filename: 'sitemap-combos.xml', entries: comboEntries, origin: 'https://talentxcel.in' }] : []),
    { filename: 'sitemap-services.xml', entries: serviceEntries, origin: 'https://talentxcel.in' },
    { filename: 'sitemap-rankings.xml', entries: rankingsEntries, origin: 'https://talentxcel.in' },
  ];

  const SITEMAP_MAX_URLS = 25_000;
  const validSitemapsForIndex: { filename: string; count: number }[] = [];

  sitemapConfig.forEach(({ filename, entries, origin }) => {
    if (entries.length === 0) return;
    const uniqueEntries = deduplicate(entries).filter((entry) => !globalSeenLocs.has(canonicalSitemapLoc(entry, origin)));
    if (uniqueEntries.length === 0) {
      console.log(`↷ Skipped ${filename}: all URLs already appear in an earlier sitemap`);
      return;
    }

    if (uniqueEntries.length <= SITEMAP_MAX_URLS) {
      const xml = buildUrlSetXml(uniqueEntries, origin);
      writeFileSync(resolve(publicDir, filename), xml, 'utf-8');
      validSitemapsForIndex.push({ filename, count: uniqueEntries.length });
      uniqueEntries.forEach((entry) => globalSeenLocs.add(canonicalSitemapLoc(entry, origin)));
      console.log(`✓ Generated ${filename}: ${uniqueEntries.length.toLocaleString()} URLs (Origin: ${origin || PRODUCTION_ORIGIN})`);
    } else {
      // Automatic 50,000-URL Sharding Protocol Engine
      const totalShards = Math.ceil(uniqueEntries.length / SITEMAP_MAX_URLS);
      const nameWithoutExt = filename.replace(/\.xml$/, '');
      for (let i = 0; i < totalShards; i++) {
        const shardEntries = uniqueEntries.slice(i * SITEMAP_MAX_URLS, (i + 1) * SITEMAP_MAX_URLS);
        const shardFilename = `${nameWithoutExt}-${i + 1}.xml`;
        const xml = buildUrlSetXml(shardEntries, origin);
        writeFileSync(resolve(publicDir, shardFilename), xml, 'utf-8');
        validSitemapsForIndex.push({ filename: shardFilename, count: shardEntries.length });
        shardEntries.forEach((entry) => globalSeenLocs.add(canonicalSitemapLoc(entry, origin)));
        console.log(`✓ Generated Sharded Sitemap ${shardFilename}: ${shardEntries.length.toLocaleString()} URLs (Origin: ${origin || PRODUCTION_ORIGIN})`);
      }
    }
  });

  // Generate Master Index (sitemap.xml and sitemap-root.xml)
  const masterXml = buildSitemapIndexXml(validSitemapsForIndex);
  safeWriteFile(resolve(publicDir, 'sitemap.xml'), masterXml);
  safeWriteFile(resolve(publicDir, 'sitemap-root.xml'), masterXml);
  console.log(`\n✓ Master sitemap.xml & sitemap-root.xml generated with ${validSitemapsForIndex.length} segmented sitemaps!`);
  console.log(`Total URLs Published in Sitemaps: ${globalSeenLocs.size.toLocaleString()}`);

  const robotsSrc = resolve(publicDir, 'robots.txt');
  const robotsRoot = resolve(publicDir, 'robots-root.txt');
  if (existsSync(robotsSrc)) {
    const robotsContent = readFileSync(robotsSrc, 'utf-8');
    safeWriteFile(robotsRoot, robotsContent);
    console.log(`✓ Synchronized robots-root.txt`);
  }
}

export const generateSitemaps = generateProductionSitemaps;

if (process.argv[1] && process.argv[1].endsWith('generate-sitemap.ts')) {
  generateProductionSitemaps().catch(console.error);
}
