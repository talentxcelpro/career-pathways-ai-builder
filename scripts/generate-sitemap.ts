/**
 * TalentXcel Public Discovery & High-Scale Programmatic Sitemap Generator
 *
 * Generates segmented XML sitemaps for:
 * 1. 1,509 Indian Higher Education Institutions across all 36 States & UTs
 * 2. 100 Verified Global Degree Programs across 37 Countries
 * 3. Global Scholarships & Grants Directory
 * 4. AI Career Pathways & Blueprints
 * 5. 2,650+ Learning Courses & Provider Hubs
 * 6. High-Intent Job, Role, Skill, and Location Matrices (150,000+ programmatic discovery URLs)
 * 7. Master sitemap index (/sitemap.xml) for Google Search Console.
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { PRODUCTION_ORIGIN } from '../src/config/seo';
import { CANDIDATE_SERVICES, EMPLOYER_SERVICES, INDUSTRY_HUBS, LOCATION_HUBS, RESOURCE_HUBS } from '../src/config/publicIA';
import { JOB_CATEGORIES } from '../src/utils/jobCategories';
import { coursesDatabase } from '../src/data/coursesData';
import { CONTENT_DATA } from './contentRegistryData';
import { INDIAN_INSTITUTIONS_CATALOG } from '../src/data/indianInstitutionsCatalog';
import { SEED_PROGRAMS, SEED_SCHOLARSHIPS } from '../src/services/globalEducationService';
import { FOUNDATION_NEWS_ARTICLES } from '../src/data/newsArticles';

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

function generateHighScaleSitemaps() {
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

  // 2. Indian Higher Education Institutions (1,509 institutions + State / Category Hubs)
  const collegeList: SitemapEntry[] = [];
  INDIAN_INSTITUTIONS_CATALOG.forEach((inst) => {
    collegeList.push({
      path: `/colleges/${inst.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
    collegeList.push({
      path: `/colleges/${inst.id}`,
      changefreq: 'monthly',
      priority: '0.6',
    });
  });

  // 36 State & UT landing hubs
  const statesSet = new Set(INDIAN_INSTITUTIONS_CATALOG.map((i) => i.location.state));
  statesSet.forEach((st) => {
    const slug = encodeURIComponent(st.toLowerCase().replace(/\s+/g, '-'));
    collegeList.push({
      path: `/colleges/state/${slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });

  // Entrance Exam Hubs
  const exams = ['jee-advanced', 'jee-main', 'neet-ug', 'cat', 'clat', 'cuet-ug', 'gate', 'jam', 'nid-dat', 'nift'];
  exams.forEach((exam) => {
    collegeList.push({
      path: `/colleges/exam/${exam}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });

  const collegeEntries = deduplicate(collegeList);

  // 3. Global Degree Programs (100 Programs + Country Hubs)
  const globalList: SitemapEntry[] = [];
  SEED_PROGRAMS.forEach((prog, idx) => {
    const slug = encodeURIComponent(prog.program_title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    globalList.push({
      path: `/colleges/global-programs/${slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });
  const globalCountries = new Set(SEED_PROGRAMS.map((p) => p.institution_country));
  globalCountries.forEach((c) => {
    const cSlug = encodeURIComponent(c.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    globalList.push({
      path: `/colleges/global-programs/country/${cSlug}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });
  const globalEntries = deduplicate(globalList);

  // 4. Scholarships & Grants Directory
  const scholarshipList: SitemapEntry[] = [];
  SEED_SCHOLARSHIPS.forEach((sch) => {
    const slug = encodeURIComponent(sch.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    scholarshipList.push({
      path: `/colleges/scholarships/${slug}`,
      changefreq: 'weekly',
      priority: '0.8',
    });
  });
  const scholarshipEntries = deduplicate(scholarshipList);

  // 5. AI Career Pathways & Blueprints
  const pathwayGoals = [
    'ai-researcher', 'software-engineer', 'data-scientist', 'doctor', 'financial-analyst',
    'cybersecurity-specialist', 'ui-ux-designer', 'management-consultant', 'cloud-architect',
    'robotics-engineer', 'bioinformatician', 'product-manager', 'operations-lead'
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

  // 7. Services & Industry Hubs
  const serviceEntries = deduplicate([
    ...CANDIDATE_SERVICES.map((s) => ({ path: `/${s.slug}`, changefreq: 'weekly' as const, priority: '0.8' })),
    ...EMPLOYER_SERVICES.map((s) => ({ path: `/${s.slug}`, changefreq: 'weekly' as const, priority: '0.8' })),
  ]);
  const industryEntries = deduplicate(INDUSTRY_HUBS.map((hub) => ({ path: `/industries/${hub.slug}`, changefreq: 'weekly', priority: '0.7' })));
  const locationEntries = deduplicate(LOCATION_HUBS.map((hub) => ({ path: `/locations/${hub.slug}`, changefreq: 'weekly', priority: '0.7' })));
  const resourceEntries = deduplicate(RESOURCE_HUBS.map((hub) => ({ path: `/resources/${hub.slug}`, changefreq: 'weekly', priority: '0.7' })));

  // 8. Programmatic Roles & Skills Matrix
  const roleSet = new Set<string>();
  const skillSet = new Set<string>();
  Object.values(JOB_CATEGORIES).forEach((cat) => {
    cat.roles.forEach((r) => roleSet.add(r));
    cat.skills.forEach((s) => skillSet.add(s));
  });

  const roleEntries = deduplicate(Array.from(roleSet).map((role) => ({
    path: `/roles/${encodeURIComponent(role.toLowerCase().replace(/\s+/g, '-'))}`,
    changefreq: 'weekly',
    priority: '0.7',
  })));

  const skillEntries = deduplicate(Array.from(skillSet).map((skill) => ({
    path: `/skills/${encodeURIComponent(skill.toLowerCase().replace(/\s+/g, '-'))}`,
    changefreq: 'weekly',
    priority: '0.7',
  })));

  // 9. Programmatic High-Intent Role + Location Matrix (Jobs)
  const roleLocationList: SitemapEntry[] = [];
  const rolesList = Array.from(roleSet);
  LOCATION_HUBS.forEach((locHub) => {
    rolesList.forEach((role) => {
      const roleSlug = encodeURIComponent(role.toLowerCase().replace(/\s+/g, '-'));
      roleLocationList.push({
        path: `/jobs/${roleSlug}/${locHub.slug}`,
        changefreq: 'weekly',
        priority: '0.7',
      });
    });
  });
  const roleLocationEntries = deduplicate(roleLocationList);

  // 10. Passports & Companies
  const passportEntries = deduplicate([{ path: '/passport', changefreq: 'weekly', priority: '0.8' }]);
  const companyEntries = deduplicate([
    { path: '/companies/talentxcel', changefreq: 'weekly', priority: '0.8' },
    { path: '/companies/tech-corp', changefreq: 'monthly', priority: '0.6' },
  ]);

  // 11. Repair Previously Broken Sitemaps in GSC
  const careermapEntries = deduplicate([
    { path: '/career-map', changefreq: 'weekly', priority: '0.8' },
    { path: '/career-map/technology', changefreq: 'weekly', priority: '0.7' },
    { path: '/career-map/healthcare', changefreq: 'weekly', priority: '0.7' },
    { path: '/career-map/finance', changefreq: 'weekly', priority: '0.7' },
    { path: '/career-map/management', changefreq: 'weekly', priority: '0.7' },
  ]);

  const toolsEntries = deduplicate([
    { path: '/resume-builder', changefreq: 'weekly', priority: '0.8' },
    { path: '/career-tools', changefreq: 'weekly', priority: '0.8' },
    { path: '/salary-calculator', changefreq: 'weekly', priority: '0.7' },
    { path: '/skill-assessment', changefreq: 'weekly', priority: '0.7' },
  ]);

  const resumeEntries = deduplicate([
    { path: '/resume-builder', changefreq: 'weekly', priority: '0.8' },
    { path: '/resume-templates', changefreq: 'weekly', priority: '0.7' },
    { path: '/resume-review', changefreq: 'weekly', priority: '0.7' },
  ]);

  const employerEntries = deduplicate([
    { path: '/employer', changefreq: 'weekly', priority: '0.8' },
    { path: '/employer/post-job', changefreq: 'weekly', priority: '0.7' },
    { path: '/employer/pricing', changefreq: 'weekly', priority: '0.7' },
  ]);

  // 12. Editorial & News Registry
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

  // Write all sitemaps
  const sitemapConfig = [
    { filename: 'sitemap-base.xml', entries: baseEntries },
    { filename: 'sitemap-colleges.xml', entries: collegeEntries },
    { filename: 'sitemap-global-programs.xml', entries: globalEntries },
    { filename: 'sitemap-scholarships.xml', entries: scholarshipEntries },
    { filename: 'sitemap-career-paths.xml', entries: pathwayEntries },
    { filename: 'sitemap-learning.xml', entries: learningEntries },
    { filename: 'sitemap-jobs.xml', entries: [{ path: '/jobs', changefreq: 'daily', priority: '0.9' }] },
    { filename: 'sitemap-role-locations.xml', entries: roleLocationEntries },
    { filename: 'sitemap-roles.xml', entries: roleEntries },
    { filename: 'sitemap-skills.xml', entries: skillEntries },
    { filename: 'sitemap-services.xml', entries: serviceEntries },
    { filename: 'sitemap-industries.xml', entries: industryEntries },
    { filename: 'sitemap-locations.xml', entries: locationEntries },
    { filename: 'sitemap-resources.xml', entries: resourceEntries },
    { filename: 'sitemap-passports.xml', entries: passportEntries },
    { filename: 'sitemap-companies.xml', entries: companyEntries },
    { filename: 'sitemap-careermap.xml', entries: careermapEntries },
    { filename: 'sitemap-tools.xml', entries: toolsEntries },
    { filename: 'sitemap-resume.xml', entries: resumeEntries },
    { filename: 'sitemap-employer.xml', entries: employerEntries },
    { filename: 'sitemap-articles.xml', entries: editorialEntries },
    {
      filename: 'sitemap-rankings.xml',
      entries: deduplicate([
        { path: '/rankings', changefreq: 'daily', priority: '1.0' },
        { path: '/rankings/ai-products', changefreq: 'daily', priority: '0.9' },
        { path: '/rankings/ai-products/global', changefreq: 'daily', priority: '0.9' },
        { path: '/rankings/ai-products/emerging', changefreq: 'daily', priority: '0.9' },
        { path: '/rankings/ai-products/india', changefreq: 'daily', priority: '0.9' },
        { path: '/rankings/ai-products/usa', changefreq: 'daily', priority: '0.9' },
        { path: '/rankings/ai-products/uae', changefreq: 'daily', priority: '0.9' },
        { path: '/rankings/ai-products/uk', changefreq: 'daily', priority: '0.9' },
        { path: '/rankings/ai-products/singapore', changefreq: 'daily', priority: '0.9' },
        { path: '/rankings/ai-products/canada', changefreq: 'daily', priority: '0.9' },
        { path: '/rankings/ai-products/australia', changefreq: 'daily', priority: '0.9' },
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

generateHighScaleSitemaps();
