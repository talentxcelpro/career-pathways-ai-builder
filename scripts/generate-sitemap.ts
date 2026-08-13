/**
 * TalentXcel Public Discovery & Segmented Sitemap Generator
 *
 * Generates segmented XML sitemaps for all 14 public entity types, editorial content categories,
 * and high-intent career discovery pages (Role + Location combinations),
 * referencing them in a master sitemap index (/sitemap.xml).
 *
 * Performs GLOBAL URL DEDUPLICATION to ensure 0 duplicates exist across sitemap files.
 * Runs before `vite dev` and `vite build` via predev/prebuild hooks.
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { PRODUCTION_ORIGIN } from '../src/config/seo';
import { CANDIDATE_SERVICES, EMPLOYER_SERVICES, INDUSTRY_HUBS, LOCATION_HUBS, RESOURCE_HUBS } from '../src/config/publicIA';
import { JOB_CATEGORIES } from '../src/utils/jobCategories';
import { coursesDatabase } from '../src/data/coursesData';
import { CONTENT_DATA } from './contentRegistryData';

interface SitemapEntry {
  path: string;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: string;
  lastmod?: string;
}

// 1. Core Public Base Pages (Excludes /jobs and /passport which have their own dedicated sitemaps)
const BASE_PAGES: SitemapEntry[] = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/companies', changefreq: 'daily', priority: '0.8' },
  { path: '/network', changefreq: 'daily', priority: '0.8' },
  { path: '/learning', changefreq: 'weekly', priority: '0.8' },
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

  // 2. Jobs & Passports
  const jobEntries = deduplicate([{ path: '/jobs', changefreq: 'daily', priority: '0.9' }]);
  const passportEntries = deduplicate([{ path: '/passport', changefreq: 'weekly', priority: '0.8' }]);

  // 3. Services
  const serviceEntries = deduplicate([
    ...CANDIDATE_SERVICES.map((s) => ({ path: `/${s.slug}`, changefreq: 'weekly' as const, priority: '0.8' })),
    ...EMPLOYER_SERVICES.map((s) => ({ path: `/${s.slug}`, changefreq: 'weekly' as const, priority: '0.8' })),
  ]);

  // 4. Industries & Locations
  const industryEntries = deduplicate(INDUSTRY_HUBS.map((hub) => ({ path: `/industries/${hub.slug}`, changefreq: 'weekly', priority: '0.7' })));
  const locationEntries = deduplicate(LOCATION_HUBS.map((hub) => ({ path: `/locations/${hub.slug}`, changefreq: 'weekly', priority: '0.7' })));
  const resourceEntries = deduplicate(RESOURCE_HUBS.map((hub) => ({ path: `/resources/${hub.slug}`, changefreq: 'weekly', priority: '0.7' })));

  // 5. Roles & Skills
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

  // 6. High-Intent Role + Location Combinations
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

  // 7. Learning / Courses
  const learningEntries = deduplicate((coursesDatabase || []).map((course) => ({
    path: `/courses/${course.id}`,
    changefreq: 'monthly',
    priority: '0.6',
  })));

  // 8. Companies & Colleges
  const companyEntries = deduplicate([
    { path: '/companies/talentxcel', changefreq: 'weekly', priority: '0.8' },
    { path: '/companies/tech-corp', changefreq: 'monthly', priority: '0.6' },
  ]);

  const collegeEntries = deduplicate([
    { path: '/colleges/iit-delhi', changefreq: 'monthly', priority: '0.6' },
    { path: '/colleges/iit-bombay', changefreq: 'monthly', priority: '0.6' },
  ]);

  // 9. Authors & News
  const authorEntries = deduplicate([{ path: '/authors/talentxcel-editorial', changefreq: 'monthly', priority: '0.5' }]);
  const newsEntries = deduplicate([{ path: '/news/future-of-ai-recruitment-in-india', changefreq: 'monthly', priority: '0.6' }]);

  // 10. Content Registry Guides
  const resumeGuideList: SitemapEntry[] = [];
  const interviewGuideList: SitemapEntry[] = [];
  const skillGuideList: SitemapEntry[] = [];
  const careerPathList: SitemapEntry[] = [];
  const employerGuideList: SitemapEntry[] = [];
  const salaryGuideList: SitemapEntry[] = [];
  const generalArticleList: SitemapEntry[] = [];
  const fresherGuideList: SitemapEntry[] = [];
  const aiCareerGuideList: SitemapEntry[] = [];
  const passportGuideList: SitemapEntry[] = [];
  const networkingRewardsList: SitemapEntry[] = [];

  CONTENT_DATA.filter((item) => item.indexable).forEach((item) => {
    const entry: SitemapEntry = {
      path: `/resources/${item.slug}`,
      changefreq: 'weekly',
      priority: '0.8',
      lastmod: item.updatedDate || item.publishedDate,
    };

    switch (item.category) {
      case 'ResumeGuide':
        resumeGuideList.push(entry);
        break;
      case 'InterviewGuide':
        interviewGuideList.push(entry);
        break;
      case 'SkillGuide':
        skillGuideList.push(entry);
        break;
      case 'CareerPath':
      case 'CareerGuide':
        careerPathList.push(entry);
        break;
      case 'EmployerGuide':
      case 'HRGuide':
        employerGuideList.push(entry);
        break;
      case 'SalaryGuide':
        salaryGuideList.push(entry);
        break;
      case 'FresherGuide':
        fresherGuideList.push(entry);
        break;
      case 'AICareerGuide':
        aiCareerGuideList.push(entry);
        break;
      case 'CareerPassportGuide':
        passportGuideList.push(entry);
        break;
      case 'NetworkingGuide':
      case 'RewardsGuide':
      case 'ProductGuide':
        networkingRewardsList.push(entry);
        break;
      default:
        generalArticleList.push(entry);
        break;
    }
  });

  const resumeGuideEntries = deduplicate(resumeGuideList);
  const interviewGuideEntries = deduplicate(interviewGuideList);
  const skillGuideEntries = deduplicate(skillGuideList);
  const careerPathEntries = deduplicate(careerPathList);
  const employerGuideEntries = deduplicate(employerGuideList);
  const salaryGuideEntries = deduplicate(salaryGuideList);
  const generalArticleEntries = deduplicate(generalArticleList);
  const fresherGuideEntries = deduplicate(fresherGuideList);
  const aiCareerGuideEntries = deduplicate(aiCareerGuideList);
  const passportGuideEntries = deduplicate(passportGuideList);
  const networkingRewardsEntries = deduplicate(networkingRewardsList);

  // 11. People / Profiles — only profiles that meet the quality gate
  // At runtime, Supabase is queried; for now we use the known verified profile.
  const peopleEntries = deduplicate([{ path: '/profile/arshid-hussain-wani', changefreq: 'weekly', priority: '0.7' }]);


  // Segment Map Definition
  const segments: { filename: string; entries: SitemapEntry[] }[] = [
    { filename: 'sitemap-base.xml', entries: baseEntries },
    { filename: 'sitemap-jobs.xml', entries: jobEntries },
    { filename: 'sitemap-passports.xml', entries: passportEntries },
    { filename: 'sitemap-services.xml', entries: serviceEntries },
    { filename: 'sitemap-industries.xml', entries: industryEntries },
    { filename: 'sitemap-locations.xml', entries: locationEntries },
    { filename: 'sitemap-resources.xml', entries: resourceEntries },
    { filename: 'sitemap-roles.xml', entries: roleEntries },
    { filename: 'sitemap-skills.xml', entries: skillEntries },
    { filename: 'sitemap-role-locations.xml', entries: roleLocationEntries },
    { filename: 'sitemap-learning.xml', entries: learningEntries },
    { filename: 'sitemap-companies.xml', entries: companyEntries },
    { filename: 'sitemap-colleges.xml', entries: collegeEntries },
    { filename: 'sitemap-authors.xml', entries: authorEntries },
    { filename: 'sitemap-news.xml', entries: newsEntries },
    { filename: 'sitemap-articles.xml', entries: generalArticleEntries },
    { filename: 'sitemap-career-paths.xml', entries: careerPathEntries },
    { filename: 'sitemap-resume-guides.xml', entries: resumeGuideEntries },
    { filename: 'sitemap-interview-guides.xml', entries: interviewGuideEntries },
    { filename: 'sitemap-skill-guides.xml', entries: skillGuideEntries },
    { filename: 'sitemap-employer-guides.xml', entries: employerGuideEntries },
    { filename: 'sitemap-salary-guides.xml', entries: salaryGuideEntries },
    { filename: 'sitemap-fresher-guides.xml', entries: fresherGuideEntries },
    { filename: 'sitemap-ai-career.xml', entries: aiCareerGuideEntries },
    { filename: 'sitemap-passport-guides.xml', entries: passportGuideEntries },
    { filename: 'sitemap-networking-rewards.xml', entries: networkingRewardsEntries },
    { filename: 'sitemap-people.xml', entries: peopleEntries },
  ];

  // Write sub-sitemaps
  const sitemapFiles: { filename: string; count: number }[] = [];
  let totalUrls = 0;

  segments.forEach(({ filename, entries }) => {
    if (entries.length > 0) {
      const xml = buildUrlSetXml(entries);
      writeFileSync(resolve(publicDir, filename), xml);
      sitemapFiles.push({ filename, count: entries.length });
      totalUrls += entries.length;
    }
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
