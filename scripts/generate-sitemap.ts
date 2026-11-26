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

const isPreview = (typeof process !== 'undefined' && (process.env?.VERCEL_ENV === 'preview' || process.env?.VITE_VERCEL_ENV === 'preview'));
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || (isPreview ? '' : 'https://dthlgsnakhoftinssokm.supabase.co');
if (isPreview && (!SUPABASE_URL || SUPABASE_URL.includes('dthlgsnakhoftinssokm'))) {
  throw new Error('FAIL-CLOSED GUARD: Vercel Preview build cannot connect to Production Supabase (dthlgsnakhoftinssokm). Set VITE_SUPABASE_URL to Preview project (pvwwtquuexhyydwihjbi).');
}
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
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
  { path: '/passport', changefreq: 'weekly', priority: '0.9' },
  { path: '/talent-score', changefreq: 'daily', priority: '0.95' },
  { path: '/talent', changefreq: 'daily', priority: '0.85' },
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
  { path: '/blog', changefreq: 'weekly', priority: '0.8' },
  { path: '/news', changefreq: 'daily', priority: '0.8' },
  { path: '/contact', changefreq: 'monthly', priority: '0.5' },
  { path: '/faq', changefreq: 'monthly', priority: '0.5' },
  { path: '/terms', changefreq: 'monthly', priority: '0.3' },
  { path: '/privacypolicy', changefreq: 'monthly', priority: '0.3' },
  { path: '/return-refund-policy', changefreq: 'monthly', priority: '0.3' },
  { path: '/help', changefreq: 'monthly', priority: '0.5' },
  { path: '/career-map', changefreq: 'daily', priority: '0.9' },
  { path: '/network/communities', changefreq: 'daily', priority: '0.85' },
  { path: '/communities', changefreq: 'daily', priority: '0.85' },
  { path: '/reels', changefreq: 'daily', priority: '0.9' },
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
  const distDir = resolve(process.cwd(), 'dist');
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

  let allDbJobs: any[] = [];
  let activeJobEntriesList: SitemapEntry[] = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/jobs', changefreq: 'daily', priority: '1.0' },
  ];
  try {
    let page = 0;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data: chunk, error } = await supabase
        .from('jobs')
        .select('id, seo_slug, created_at, posted_at, expires_at, job_status, location_city, location')
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

  // GSC Indexation Guard: Only indexable college hubs are submitted to sitemaps.
  // Thin programmatic college shells emit 'noindex, follow' and are excluded from XML sitemaps.
  const collegeOverview: SitemapEntry[] = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/colleges', changefreq: 'daily', priority: '1.0' },
    { path: '/colleges/global-programs', changefreq: 'daily', priority: '0.9' },
    { path: '/colleges/scholarships', changefreq: 'daily', priority: '0.9' },
    { path: '/colleges/career-pathway', changefreq: 'daily', priority: '0.9' },
  ];
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

  // 6. Posts & Articles (Verified public, non-deleted community posts — paginated past 1,000 row cap)
  let postEntriesList: SitemapEntry[] = [];
  try {
    const BATCH = 1000;
    for (let offset = 0; offset < 45000; offset += BATCH) {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('id, created_at')
        .eq('visibility', 'public')
        .neq('is_deleted', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + BATCH - 1);
      if (error || !posts || posts.length === 0) break;
      posts.forEach(p => {
        postEntriesList.push({
          path: `/posts/${p.id}`,
          changefreq: 'weekly',
          priority: '0.7',
          lastmod: (p.created_at || '').split('T')[0] || undefined
        });
      });
      if (posts.length < BATCH) break;
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

  // 6B. Verified Professional Network Discovery Hubs & Consented Profiles
  let networkEntriesList: SitemapEntry[] = [
    { path: '/network', changefreq: 'daily', priority: '0.9' },
    { path: '/network/communities', changefreq: 'daily', priority: '0.85' },
  ];

  try {
    // Keep sitemap-network.xml strictly aligned with api/seo-render.ts INDEXABLE_GEO_CITIES
    // so zero noindex URLs are published in sitemap-network.xml.
    const INDEXABLE_NETWORK_GEO_CITIES = new Set([
      'noida', 'hyderabad', 'bangalore', 'bhopal', 'jammu', 'guwahati', 'mumbai',
      'kochi', 'nagpur', 'visakhapatnam', 'mysore', 'surat', 'lucknow', 'trivandrum',
      'mangalore', 'ludhiana', 'agra', 'nashik', 'varanasi', 'chandigarh', 'coimbatore',
      'indore', 'vadodara', 'patna', 'jaipur', 'dehradun', 'bhubaneswar', 'delhi',
      'pune', 'chennai', 'kolkata', 'gurgaon', 'ahmedabad',
    ]);

    // 1. Indexable Cities from growth_geo_cities (filtered to SSR-indexable cities)
    const { data: indexableCities } = await supabase
      .from('growth_geo_cities')
      .select('slug, last_evaluated_at')
      .eq('indexation_gate', 'indexable');

    if (indexableCities) {
      indexableCities.forEach(c => {
        if (c.slug && INDEXABLE_NETWORK_GEO_CITIES.has(String(c.slug).toLowerCase())) {
          networkEntriesList.push({
            path: `/network/locations/${c.slug}`,
            changefreq: 'daily',
            priority: '0.85',
            lastmod: (c.last_evaluated_at || '').split('T')[0] || undefined
          });
        }
      });
    }

    // 2. Indexable Skills, Industries, Segments from growth_inventory_readiness
    const { data: indexableHubs } = await supabase
      .from('growth_inventory_readiness')
      .select('entity_type, entity_slug, last_computed_at')
      .eq('is_search_indexable', true);

    if (indexableHubs) {
      indexableHubs.forEach(h => {
        const prefix = h.entity_type === 'career_segment' ? '/network/segments/' : (h.entity_type === 'industry' ? '/network/industries/' : `/network/${h.entity_type}s/`);
        networkEntriesList.push({
          path: `${prefix}${h.entity_slug}`,
          changefreq: 'daily',
          priority: '0.85',
          lastmod: (h.last_computed_at || '').split('T')[0] || undefined
        });
      });
    }

    // 3. Public Profiles (/u/:username) are excluded from sitemap-network.xml unless
    // they pass the >=400-word SSR indexation gate (prevents noindex URLs in sitemaps).
    console.log(`✓ Added ${networkEntriesList.length} verified indexable network entries for sitemap-network.xml`);
  } catch (e) {
    console.warn('Could not query growth tables for sitemap-network.xml:', e);
  }
  const networkEntries = deduplicate(networkEntriesList);

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

  // 7B. Verified Location Hubs: Query authoritative city_registry (index_ready = true AND active = true)
  // Excludes bhopal, nagpur, patna, and any city failing the live SEO gate.
  const FALLBACK_INDEXABLE_CITIES = [
    'ahmedabad', 'bangalore', 'bhubaneswar', 'chandigarh', 'chennai',
    'coimbatore', 'delhi', 'gurugram', 'hyderabad', 'indore', 'jaipur', 'kochi',
    'kolkata', 'lucknow', 'mumbai', 'noida', 'pune', 'surat', 'vadodara',
    'varanasi', 'visakhapatnam'
  ];

  let gatedCitySlugs: string[] = [];
  try {
    const { data: readyCities } = await supabase
      .from('city_registry')
      .select('slug')
      .eq('index_ready', true)
      .eq('active', true)
      .order('gsc_impressions', { ascending: false })
      .limit(1000);
    if (readyCities && readyCities.length > 0) {
      gatedCitySlugs = readyCities.map((c: any) => c.slug);
    }
  } catch {
    console.warn('Could not query city_registry, using verified fallback city list');
  }

  const INDEXABLE_METRO_SLUGS = gatedCitySlugs.length > 0 ? gatedCitySlugs : FALLBACK_INDEXABLE_CITIES;

  // Verify against dist/locations/*.html if dist exists to ensure 100% parity with prerendered robots directives
  const indexableCitySlugs = INDEXABLE_METRO_SLUGS.filter((slug) => {
    const distHtmlPath = resolve(distDir, 'locations', `${slug}.html`);
    if (existsSync(distHtmlPath)) {
      const html = readFileSync(distHtmlPath, 'utf8');
      if (html.includes('content="noindex') || html.includes("content='noindex")) {
        return false;
      }
    }
    return true;
  });

  const locationEntries = deduplicate(
    indexableCitySlugs.map((slug) => ({
      path: `/locations/${slug}`,
      changefreq: 'daily' as const,
      priority: '0.9',
    }))
  );

  // 7C. Verified Combinatorial pSEO Hubs (mv_eligible_seo_hubs + discovery_clusters only — no blind matrix multiplication)
  let comboEntriesList: SitemapEntry[] = [];

  try {
    const { data: qualifiedClusters } = await supabase
      .from('discovery_clusters')
      .select('canonical_url, updated_at')
      .eq('index_ready', true)
      .eq('active', true)
      .limit(2000);
    if (qualifiedClusters && qualifiedClusters.length > 0) {
      qualifiedClusters.forEach((c: any) => {
        comboEntriesList.push({
          path: c.canonical_url.startsWith('http') ? new URL(c.canonical_url).pathname : c.canonical_url,
          changefreq: 'daily',
          priority: '0.85',
          lastmod: (c.updated_at || '').split('T')[0] || undefined,
        });
      });
    }
  } catch {
    console.warn('Could not query discovery_clusters, skipping cluster combos');
  }

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
    { path: '/resume/ats-check', changefreq: 'daily', priority: '1.0' },
    { path: '/ats-check', changefreq: 'daily', priority: '0.9' },
    { path: '/resume/cover-letter', changefreq: 'daily', priority: '0.9' },
    { path: '/resume/interview-prep', changefreq: 'daily', priority: '0.9' },
    { path: '/resume/templates', changefreq: 'weekly', priority: '0.8' },
    { path: '/tools/ats-checker', changefreq: 'daily', priority: '0.9' },
    { path: '/tools/resume-checker', changefreq: 'daily', priority: '0.9' },
    ...CANONICAL_ROLES.map((role) => ({
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
    { path: '/employer/talent-search', changefreq: 'daily', priority: '0.9' },
    { path: '/employer/post-job', changefreq: 'daily', priority: '0.9' },
    { path: '/employer/pricing', changefreq: 'weekly', priority: '0.8' },
    { path: '/employer/screening', changefreq: 'weekly', priority: '0.8' },
    { path: '/employer/ats-integrations', changefreq: 'weekly', priority: '0.8' },
    { path: '/employer/candidate-benchmarking', changefreq: 'weekly', priority: '0.8' },
    { path: '/employer/candidate-search', changefreq: 'daily', priority: '0.9' },
    { path: '/employer/talent-pool', changefreq: 'daily', priority: '0.9' },
    { path: '/employer/recruiter-directory', changefreq: 'weekly', priority: '0.85' },
  ]);

  const passportEntries = deduplicate([
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/passport', changefreq: 'weekly', priority: '1.0' },
    { path: '/talent-score', changefreq: 'daily', priority: '0.95' },
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
    { filename: 'sitemap-jobs.xml', entries: activeJobEntries, origin: 'https://talentxcel.in' },
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
    { filename: 'sitemap-network.xml', entries: networkEntries, origin: 'https://talentxcel.in' },
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

    const REQUIRED_SUBDOMAIN_SITEMAPS = [
      'sitemap-jobs.xml',
      'sitemap-salary.xml',
      'sitemap-careers.xml',
      'sitemap-resume.xml',
      'sitemap-learning.xml',
      'sitemap-colleges.xml',
      'sitemap-government.xml',
      'sitemap-employers.xml',
      'sitemap-passport.xml',
    ];

    // Google Search Console Quality Gate: Prune thin sitemaps with fewer than 10 URLs (e.g. sitemap-blog, sitemap-news)
    // EXCEPTION: Required Subdomain Manifests (must never be pruned to preserve routing contracts)
    if (uniqueEntries.length < 10 && !REQUIRED_SUBDOMAIN_SITEMAPS.includes(filename)) {
      console.log(`↷ Pruned thin sitemap ${filename}: contains only ${uniqueEntries.length} URLs (< 10 quality threshold)`);
      const existingFile = resolve(publicDir, filename);
      if (existsSync(existingFile)) {
        try { unlinkSync(existingFile); } catch (_) {}
      }
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
