/**
 * TalentXcel Public Discovery & Segmented Sitemap Generator
 *
 * Generates segmented XML sitemaps for all 14 public entity types and editorial content categories,
 * referencing them in a master sitemap index (/sitemap.xml).
 * Runs before `vite dev` and `vite build` via predev/prebuild hooks.
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { PRODUCTION_ORIGIN } from '../src/config/seo';
import { CANDIDATE_SERVICES, EMPLOYER_SERVICES, INDUSTRY_HUBS, LOCATION_HUBS, RESOURCE_HUBS } from '../src/config/publicIA';
import { JOB_CATEGORIES } from '../src/utils/jobCategories';
import { coursesDatabase } from '../src/data/coursesData';
import { CONTENT_REGISTRY } from '../src/config/contentRegistry';

interface SitemapEntry {
  path: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
  lastmod?: string;
}

// 1. Core Public Base Pages
const BASE_PAGES: SitemapEntry[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/jobs', changefreq: 'daily', priority: '0.9' },
  { path: '/companies', changefreq: 'daily', priority: '0.8' },
  { path: '/network', changefreq: 'daily', priority: '0.8' },
  { path: '/learning', changefreq: 'weekly', priority: '0.8' },
  { path: '/passport', changefreq: 'weekly', priority: '0.8' },
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

function generateSegmentedSitemaps() {
  const publicDir = resolve('public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  // 1. Services
  const serviceEntries: SitemapEntry[] = [
    ...CANDIDATE_SERVICES.map((s) => ({ path: `/${s.slug}`, changefreq: 'weekly' as const, priority: '0.8' })),
    ...EMPLOYER_SERVICES.map((s) => ({ path: `/${s.slug}`, changefreq: 'weekly' as const, priority: '0.8' })),
  ];

  // 2. Industries
  const industryEntries: SitemapEntry[] = INDUSTRY_HUBS.map((hub) => ({
    path: `/industries/${hub.slug}`,
    changefreq: 'weekly',
    priority: '0.7',
  }));

  // 3. Locations
  const locationEntries: SitemapEntry[] = LOCATION_HUBS.map((hub) => ({
    path: `/locations/${hub.slug}`,
    changefreq: 'weekly',
    priority: '0.7',
  }));

  // 4. Resources Hubs
  const resourceEntries: SitemapEntry[] = RESOURCE_HUBS.map((hub) => ({
    path: `/resources/${hub.slug}`,
    changefreq: 'weekly',
    priority: '0.7',
  }));

  // 5. Roles & Skills (derived from JOB_CATEGORIES)
  const roleSet = new Set<string>();
  const skillSet = new Set<string>();

  Object.values(JOB_CATEGORIES).forEach((cat) => {
    cat.roles.forEach((r) => roleSet.add(r));
    cat.skills.forEach((s) => skillSet.add(s));
  });

  const roleEntries: SitemapEntry[] = Array.from(roleSet).map((role) => ({
    path: `/roles/${encodeURIComponent(role.toLowerCase().replace(/\s+/g, '-'))}`,
    changefreq: 'weekly',
    priority: '0.7',
  }));

  const skillEntries: SitemapEntry[] = Array.from(skillSet).map((skill) => ({
    path: `/skills/${encodeURIComponent(skill.toLowerCase().replace(/\s+/g, '-'))}`,
    changefreq: 'weekly',
    priority: '0.7',
  }));

  // 6. Learning / Courses
  const learningEntries: SitemapEntry[] = (coursesDatabase || []).map((course) => ({
    path: `/courses/${course.id}`,
    changefreq: 'monthly',
    priority: '0.6',
  }));

  // 7. Companies
  const companyEntries: SitemapEntry[] = [
    { path: '/companies/talentxcel', changefreq: 'weekly', priority: '0.8' },
    { path: '/companies/tech-corp', changefreq: 'monthly', priority: '0.6' },
  ];

  // 8. Colleges
  const collegeEntries: SitemapEntry[] = [
    { path: '/colleges/iit-delhi', changefreq: 'monthly', priority: '0.6' },
    { path: '/colleges/iit-bombay', changefreq: 'monthly', priority: '0.6' },
  ];

  // 9. Jobs
  const jobEntries: SitemapEntry[] = [
    { path: '/jobs', changefreq: 'daily', priority: '0.9' },
  ];

  // 10. Passports
  const passportEntries: SitemapEntry[] = [
    { path: '/passport', changefreq: 'weekly', priority: '0.8' },
  ];

  // 11. Authors
  const authorEntries: SitemapEntry[] = [
    { path: '/authors/talentxcel-editorial', changefreq: 'monthly', priority: '0.5' },
  ];

  // 12. Segment Content Registry Guides
  const resumeGuideEntries: SitemapEntry[] = [];
  const interviewGuideEntries: SitemapEntry[] = [];
  const skillGuideEntries: SitemapEntry[] = [];
  const careerPathEntries: SitemapEntry[] = [];
  const employerGuideEntries: SitemapEntry[] = [];
  const salaryGuideEntries: SitemapEntry[] = [];
  const generalArticleEntries: SitemapEntry[] = [
    { path: '/news/future-of-ai-recruitment-in-india', changefreq: 'monthly', priority: '0.6' },
  ];

  CONTENT_REGISTRY.filter((item) => item.indexable).forEach((item) => {
    const entry: SitemapEntry = {
      path: `/resources/${item.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: item.updatedDate || item.publishedDate,
    };

    switch (item.category) {
      case 'ResumeGuide':
        resumeGuideEntries.push(entry);
        break;
      case 'InterviewGuide':
        interviewGuideEntries.push(entry);
        break;
      case 'SkillGuide':
        skillGuideEntries.push(entry);
        break;
      case 'CareerPath':
      case 'CareerGuide':
        careerPathEntries.push(entry);
        break;
      case 'EmployerGuide':
      case 'HRGuide':
        employerGuideEntries.push(entry);
        break;
      case 'SalaryGuide':
        salaryGuideEntries.push(entry);
        break;
      default:
        generalArticleEntries.push(entry);
        break;
    }
  });

  // 13. People / Profiles (Indexable public profiles)
  const peopleEntries: SitemapEntry[] = [
    { path: '/profile/arshid-hussain-wani', changefreq: 'weekly', priority: '0.7' },
  ];

  // Segment Map Definition
  const segments: { filename: string; entries: SitemapEntry[] }[] = [
    { filename: 'sitemap-base.xml', entries: BASE_PAGES },
    { filename: 'sitemap-services.xml', entries: serviceEntries },
    { filename: 'sitemap-industries.xml', entries: industryEntries },
    { filename: 'sitemap-locations.xml', entries: locationEntries },
    { filename: 'sitemap-resources.xml', entries: resourceEntries },
    { filename: 'sitemap-roles.xml', entries: roleEntries },
    { filename: 'sitemap-skills.xml', entries: skillEntries },
    { filename: 'sitemap-learning.xml', entries: learningEntries },
    { filename: 'sitemap-companies.xml', entries: companyEntries },
    { filename: 'sitemap-colleges.xml', entries: collegeEntries },
    { filename: 'sitemap-jobs.xml', entries: jobEntries },
    { filename: 'sitemap-passports.xml', entries: passportEntries },
    { filename: 'sitemap-authors.xml', entries: authorEntries },
    { filename: 'sitemap-articles.xml', entries: generalArticleEntries },
    { filename: 'sitemap-career-paths.xml', entries: careerPathEntries },
    { filename: 'sitemap-resume-guides.xml', entries: resumeGuideEntries },
    { filename: 'sitemap-interview-guides.xml', entries: interviewGuideEntries },
    { filename: 'sitemap-skill-guides.xml', entries: skillGuideEntries },
    { filename: 'sitemap-employer-guides.xml', entries: employerGuideEntries },
    { filename: 'sitemap-salary-guides.xml', entries: salaryGuideEntries },
    { filename: 'sitemap-people.xml', entries: peopleEntries },
  ];

  // Write sub-sitemaps
  const sitemapFiles: { filename: string; count: number }[] = [];
  let totalUrls = 0;

  segments.forEach(({ filename, entries }) => {
    const xml = buildUrlSetXml(entries);
    writeFileSync(resolve(publicDir, filename), xml);
    sitemapFiles.push({ filename, count: entries.length });
    totalUrls += entries.length;
  });

  // Write Master Sitemap Index (/sitemap.xml)
  const masterIndexXml = buildSitemapIndexXml(sitemapFiles);
  writeFileSync(resolve(publicDir, 'sitemap.xml'), masterIndexXml);

  console.log(`✅ Master sitemap.xml written (${sitemapFiles.length} sub-sitemaps referencing ${totalUrls} total URLs)`);

  return {
    totalUrls,
    sitemapFiles,
  };
}

generateSegmentedSitemaps();
