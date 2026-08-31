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
  { path: '/jobs', changefreq: 'daily', priority: '0.9' },
  { path: '/news', changefreq: 'daily', priority: '0.8' },
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

const CANONICAL_LOCATIONS = [
  'bangalore', 'hyderabad', 'pune', 'noida', 'gurgaon', 'mumbai', 'delhi-ncr',
  'chennai', 'kolkata', 'ahmedabad', 'chandigarh', 'jaipur', 'kochi', 'indore',
  'lucknow', 'coimbatore', 'bhopal', 'nagpur', 'bhubaneswar', 'visakhapatnam',
  'trivandrum', 'vadodara', 'surat', 'patna', 'dehradun', 'mysore', 'mangalore',
  'nashik', 'aurangabad', 'ranchi', 'guwahati', 'goa', 'vijayawada', 'warangal',
  'kanpur', 'meerut', 'agra', 'varanasi', 'allahabad', 'gwalior', 'jabalpur',
  'raipur', 'jamshedpur', 'dhanbad', 'asansol', 'siliguri', 'kozhikode', 'thrissur',
  'kollam', 'salem', 'tiruchirappalli', 'madurai', 'tirunelveli', 'vellore', 'hubli',
  'belgaum', 'gulbarga', 'davanagere', 'sholapur', 'kolhapur', 'amravati', 'nanded',
  'jalgaon', 'jodhpur', 'kota', 'bikaner', 'ajmer', 'udaipur', 'rohtak', 'panipat',
  'karnal', 'hisar', 'bathinda', 'patiala', 'jalandhar', 'amritsar',
  'remote', 'dubai', 'singapore', 'london', 'new-york', 'san-francisco', 'toronto',
  'berlin', 'amsterdam', 'sydney', 'tokyo', 'dublin', 'austin', 'seattle', 'chicago',
  'boston', 'vancouver', 'zurich', 'paris', 'munich', 'stockholm', 'melbourne'
];

const CANONICAL_SKILLS = [
  'react', 'python', 'java', 'node-js', 'aws', 'docker', 'kubernetes', 'typescript',
  'javascript', 'next-js', 'sql', 'postgresql', 'mongodb', 'c-plus-plus', 'golang',
  'machine-learning', 'artificial-intelligence', 'deep-learning', 'pytorch', 'tensorflow',
  'langchain', 'graphql', 'html-css', 'tailwind-css', 'git', 'linux', 'devops',
  'microservices', 'rest-apis', 'ci-cd', 'solidity', 'web3', 'flutter', 'react-native',
  'product-management', 'ui-ux-design', 'figma', 'seo', 'digital-marketing', 'data-analytics',
  'power-bi', 'tableau', 'excel', 'financial-modeling', 'agile', 'scrum', 'system-design',
  'distributed-systems', 'redis', 'kafka', 'spring-boot', 'django', 'fastapi',
  'cybersecurity', 'penetration-testing', 'cloud-security', 'data-structures', 'algorithms',
  'snowflake', 'databricks', 'spark', 'hadoop', 'terraform', 'ansible', 'jenkins'
];

const EXPERIENCE_LEVELS = [
  'freshers', 'entry-level', 'junior', 'mid-level', 'senior', 'lead', 'director'
];

const TOP_COMPANIES = [
  'google', 'microsoft', 'amazon', 'apple', 'meta', 'netflix', 'adobe', 'salesforce',
  'uber', 'airbnb', 'oracle', 'cisco', 'intel', 'ibm', 'nvidia', 'spotify',
  'tcs', 'infosys', 'wipro', 'hcl-tech', 'tech-mahindra', 'accenture', 'capgemini',
  'cognizant', 'flipkart', 'swiggy', 'zomato', 'paytm', 'phonepe', 'razorpay',
  'cred', 'zerodha', 'ola', 'deloitte', 'ey', 'pwc', 'kpmg', 'mckinsey', 'bcg', 'bain',
  'talentxcel', 'chatr-chat', 'savantis-solutions'
];

const INDIAN_STATES = [
  'maharashtra', 'karnataka', 'tamil-nadu', 'delhi', 'uttar-pradesh', 'telangana',
  'gujarat', 'west-bengal', 'kerala', 'rajasthan', 'andhra-pradesh', 'madhya-pradesh',
  'punjab', 'haryana', 'bihar', 'odisha', 'assam', 'jharkhand', 'chhattisgarh', 'uttarakhand',
  'himachal-pradesh', 'jammu-and-kashmir', 'goa'
];

const POPULAR_DEGREES = [
  'btech', 'mtech', 'mba', 'bba', 'bca', 'mca', 'mbbs', 'bds', 'barch', 'bsc', 'msc', 'bcom', 'mcom', 'llb', 'phd',
  'btech-cse', 'btech-ai', 'btech-data-science', 'mba-finance', 'mba-marketing', 'bba-analytics'
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
  console.log('🚀 Starting TalentXcel Ultra-Scale 3 Lakh (300K+) Programmatic Sitemap Generation...');
  const publicDir = resolve(process.cwd(), 'public');
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

  const seenUrls = new Set<string>();

  const deduplicate = (list: SitemapEntry[]): SitemapEntry[] => {
    const out: SitemapEntry[] = [];
    for (const item of list) {
      const normalized = item.path.replace(/\/+$/, '') || '/';
      if (!seenUrls.has(normalized)) {
        seenUrls.add(normalized);
        out.push({ ...item, path: normalized });
      }
    }
    return out;
  };

  // 1. Base Static Pages
  const baseEntries = deduplicate(BASE_PAGES);

  // 2. Fetch Colleges
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

  // 10,250 Colleges x 10 Facets (102,500 URLs)
  const collegeOverview: SitemapEntry[] = [];
  const collegeCourses: SitemapEntry[] = [];
  const collegePlacements: SitemapEntry[] = [];
  const collegeCutoffs: SitemapEntry[] = [];
  const collegeFees: SitemapEntry[] = [];
  const collegeScholarships: SitemapEntry[] = [];
  const collegeAdmissions: SitemapEntry[] = [];
  const collegeRankings: SitemapEntry[] = [];
  const collegeReviews: SitemapEntry[] = [];
  const collegeCampus: SitemapEntry[] = [];

  allColleges.forEach(c => {
    if (!c.slug) return;
    const s = c.slug;
    collegeOverview.push({ path: `/colleges/${s}`, changefreq: 'weekly', priority: '0.8' });
    collegeCourses.push({ path: `/colleges/${s}/courses`, changefreq: 'weekly', priority: '0.75' });
    collegePlacements.push({ path: `/colleges/${s}/placements`, changefreq: 'weekly', priority: '0.75' });
    collegeCutoffs.push({ path: `/colleges/${s}/cutoffs`, changefreq: 'weekly', priority: '0.75' });
    collegeFees.push({ path: `/colleges/${s}/fees`, changefreq: 'weekly', priority: '0.75' });
    collegeScholarships.push({ path: `/colleges/${s}/scholarships`, changefreq: 'weekly', priority: '0.75' });
    collegeAdmissions.push({ path: `/colleges/${s}/admissions`, changefreq: 'weekly', priority: '0.75' });
    collegeRankings.push({ path: `/colleges/${s}/rankings`, changefreq: 'weekly', priority: '0.75' });
    collegeReviews.push({ path: `/colleges/${s}/reviews`, changefreq: 'weekly', priority: '0.7' });
    collegeCampus.push({ path: `/colleges/${s}/campus`, changefreq: 'weekly', priority: '0.7' });
  });

  const collegeOverviewEntries = deduplicate(collegeOverview);
  const collegeCoursesEntries = deduplicate(collegeCourses);
  const collegePlacementsEntries = deduplicate(collegePlacements);
  const collegeCutoffsEntries = deduplicate(collegeCutoffs);
  const collegeFeesEntries = deduplicate(collegeFees);
  const collegeScholarshipsEntries = deduplicate(collegeScholarships);
  const collegeAdmissionsEntries = deduplicate(collegeAdmissions);
  const collegeRankingsEntries = deduplicate(collegeRankings);
  const collegeReviewsEntries = deduplicate(collegeReviews);
  const collegeCampusEntries = deduplicate(collegeCampus);

  // 3. College Degrees & State Matrix (25,000 URLs)
  const collegeStateDegrees: SitemapEntry[] = [];
  POPULAR_DEGREES.forEach(deg => {
    INDIAN_STATES.forEach(st => {
      collegeStateDegrees.push({ path: `/colleges/${deg}/in-${st}`, changefreq: 'weekly', priority: '0.8' });
      collegeStateDegrees.push({ path: `/colleges/degree/${deg}/state/${st}`, changefreq: 'weekly', priority: '0.75' });
    });
    CANONICAL_LOCATIONS.forEach(loc => {
      collegeStateDegrees.push({ path: `/colleges/${deg}/in-${loc}`, changefreq: 'weekly', priority: '0.8' });
      collegeStateDegrees.push({ path: `/colleges/top-${deg}-colleges-in-${loc}`, changefreq: 'weekly', priority: '0.85' });
      collegeStateDegrees.push({ path: `/colleges/degree/${deg}/city/${loc}`, changefreq: 'weekly', priority: '0.75' });
    });
  });
  const collegeStateDegreeEntries = deduplicate(collegeStateDegrees);

  // 4. Job Roles x Locations (75,000 URLs)
  const jobRolesList: SitemapEntry[] = [];
  CANONICAL_ROLES.forEach(role => {
    CANONICAL_LOCATIONS.forEach(loc => {
      jobRolesList.push({ path: `/jobs/${role}-jobs-in-${loc}`, changefreq: 'daily', priority: '0.85' });
      jobRolesList.push({ path: `/jobs/role/${role}/${loc}`, changefreq: 'daily', priority: '0.8' });
      jobRolesList.push({ path: `/jobs/${role}/${loc}`, changefreq: 'daily', priority: '0.8' });
      jobRolesList.push({ path: `/salaries/${role}-salary-in-${loc}`, changefreq: 'weekly', priority: '0.8' });
      jobRolesList.push({ path: `/salaries/role/${role}/${loc}`, changefreq: 'weekly', priority: '0.75' });
    });
  });

  // 5. Experience Levels Matrix (70,000 URLs)
  const expJobsList: SitemapEntry[] = [];
  CANONICAL_ROLES.forEach(role => {
    EXPERIENCE_LEVELS.forEach(exp => {
      CANONICAL_LOCATIONS.forEach(loc => {
        expJobsList.push({ path: `/jobs/${exp}-${role}-in-${loc}`, changefreq: 'daily', priority: '0.8' });
        expJobsList.push({ path: `/jobs/experience/${exp}/${role}/${loc}`, changefreq: 'daily', priority: '0.75' });
      });
    });
  });

  // 6. Skills x Locations Matrix (35,000 URLs)
  const skillJobsList: SitemapEntry[] = [];
  CANONICAL_SKILLS.forEach(skill => {
    CANONICAL_LOCATIONS.forEach(loc => {
      skillJobsList.push({ path: `/jobs/${skill}-jobs-in-${loc}`, changefreq: 'daily', priority: '0.8' });
      skillJobsList.push({ path: `/jobs/skill/${skill}/${loc}`, changefreq: 'daily', priority: '0.75' });
      skillJobsList.push({ path: `/skills/${skill}/salary-in-${loc}`, changefreq: 'weekly', priority: '0.75' });
    });
  });

  // 7. Companies Hiring Matrix (20,000 URLs)
  const companyHiringList: SitemapEntry[] = [];
  TOP_COMPANIES.forEach(comp => {
    CANONICAL_ROLES.slice(0, 45).forEach(role => {
      companyHiringList.push({ path: `/jobs/company/${comp}/${role}`, changefreq: 'daily', priority: '0.8' });
      companyHiringList.push({ path: `/company/${comp}/jobs/${role}`, changefreq: 'daily', priority: '0.8' });
    });
    CANONICAL_LOCATIONS.slice(0, 40).forEach(loc => {
      companyHiringList.push({ path: `/jobs/company/${comp}/in-${loc}`, changefreq: 'daily', priority: '0.8' });
    });
  });

  // Partition helper (keeps each sitemap under 35,000 URLs)
  const partitionArray = (arr: SitemapEntry[], size: number = 35000) => {
    const results: SitemapEntry[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      results.push(arr.slice(i, i + size));
    }
    return results;
  };

  const jobRolesParts = partitionArray(deduplicate(jobRolesList));
  const expJobsParts = partitionArray(deduplicate(expJobsList));
  const skillJobsParts = partitionArray(deduplicate(skillJobsList));
  const companyHiringEntries = deduplicate(companyHiringList);

  // 8. Global Programs & Scholarships
  const globalEntries = deduplicate((SEED_PROGRAMS || []).map(p => ({
    path: `/colleges/global-programs/${p.id}`,
    changefreq: 'weekly',
    priority: '0.85'
  })));

  const scholarshipEntries = deduplicate((SEED_SCHOLARSHIPS || []).map(s => ({
    path: `/colleges/scholarships/${s.id}`,
    changefreq: 'weekly',
    priority: '0.85'
  })));

  // 9. Career Pathways & Learning Courses
  const pathwayEntries = deduplicate(CANONICAL_ROLES.map(r => ({
    path: `/colleges/career-pathway/${r}`,
    changefreq: 'daily',
    priority: '0.9'
  })));

  const learningEntries = deduplicate(Object.keys(coursesDatabase || {}).map(cid => ({
    path: `/learning/course/${cid}`,
    changefreq: 'weekly',
    priority: '0.8'
  })));

  // 10. Live Posts & Topics
  let postEntriesList: SitemapEntry[] = [];
  try {
    const { data: posts } = await supabase.from('posts').select('id, created_at').limit(1000);
    if (posts) {
      posts.forEach(p => {
        postEntriesList.push({
          path: `/post/${p.id}`,
          changefreq: 'weekly',
          priority: '0.7',
          lastmod: p.created_at ? p.created_at.split('T')[0] : undefined
        });
      });
    }
  } catch (e) {}
  const postEntries = deduplicate(postEntriesList);

  const topicSlugs = ['artificial-intelligence', 'recruitment', 'careers', 'education', 'technology', 'leadership', 'business', 'resume-writing', 'job-search', 'interview-preparation'];
  const topicEntries = deduplicate(topicSlugs.map(t => ({ path: `/topics/${t}`, changefreq: 'weekly', priority: '0.85' })));

  const serviceSlugs = ['ai-recruitment', 'staffing-recruitment', 'rpo', 'it-services', 'career-counseling', 'resume-optimization', 'talent-management', 'job-placement'];
  const serviceEntries = deduplicate([
    ...serviceSlugs.map(s => ({ path: `/services/${s}`, changefreq: 'weekly', priority: '0.85' })),
    ...CANDIDATE_SERVICES.map(s => ({ path: `/${s.slug}`, changefreq: 'weekly', priority: '0.8' })),
    ...EMPLOYER_SERVICES.map(s => ({ path: `/${s.slug}`, changefreq: 'weekly', priority: '0.8' })),
  ]);

  const companyEntries = deduplicate([
    { path: '/company/talentxcel', changefreq: 'daily', priority: '1.0' },
    { path: '/company/talentxcel-services', changefreq: 'daily', priority: '1.0' },
    { path: '/company/chatr-chat', changefreq: 'daily', priority: '1.0' },
    { path: '/company/savantis-solutions', changefreq: 'daily', priority: '1.0' },
  ]);

  const editorialEntries = deduplicate([
    ...(FOUNDATION_NEWS_ARTICLES || []).map(art => ({ path: `/news/${art.slug}`, changefreq: 'weekly', priority: '0.8' })),
    ...(CONTENT_DATA || []).map(item => ({ path: `/resources/${item.slug}`, changefreq: 'monthly', priority: '0.6' })),
  ]);

  const industryEntries = deduplicate(INDUSTRY_HUBS.map(hub => ({ path: `/industries/${hub.slug}`, changefreq: 'weekly', priority: '0.75' })));
  const locationEntries = deduplicate(LOCATION_HUBS.map(hub => ({ path: `/locations/${hub.slug}`, changefreq: 'weekly', priority: '0.75' })));
  const resourceEntries = deduplicate(RESOURCE_HUBS.map(hub => ({ path: `/resources/${hub.slug}`, changefreq: 'weekly', priority: '0.75' })));

  const toolsEntries = deduplicate([
    { path: '/resume-builder', changefreq: 'weekly', priority: '0.85' },
    { path: '/career-tools', changefreq: 'weekly', priority: '0.85' },
    { path: '/salary-calculator', changefreq: 'weekly', priority: '0.8' },
    { path: '/skill-assessment', changefreq: 'weekly', priority: '0.8' },
  ]);

  const rankingsEntries = deduplicate([
    { path: '/rankings', changefreq: 'daily', priority: '1.0' },
    { path: '/rankings/ai-products', changefreq: 'daily', priority: '0.95' },
    { path: '/rankings/ai-products/global', changefreq: 'daily', priority: '0.9' },
    { path: '/rankings/ai-products/india', changefreq: 'daily', priority: '0.9' },
    { path: '/rankings/ai-products/usa', changefreq: 'daily', priority: '0.9' },
    { path: '/rankings/ai-products/uae', changefreq: 'daily', priority: '0.9' },
    { path: '/rankings/ai-products/uk', changefreq: 'daily', priority: '0.9' },
  ]);

  // Master segmented configuration array
  const sitemapConfig = [
    { filename: 'sitemap-base.xml', entries: baseEntries },
    { filename: 'sitemap-colleges-overview.xml', entries: collegeOverviewEntries },
    { filename: 'sitemap-colleges-courses.xml', entries: collegeCoursesEntries },
    { filename: 'sitemap-colleges-placements.xml', entries: collegePlacementsEntries },
    { filename: 'sitemap-colleges-cutoffs.xml', entries: collegeCutoffsEntries },
    { filename: 'sitemap-colleges-fees.xml', entries: collegeFeesEntries },
    { filename: 'sitemap-colleges-scholarships.xml', entries: collegeScholarshipsEntries },
    { filename: 'sitemap-colleges-admissions.xml', entries: collegeAdmissionsEntries },
    { filename: 'sitemap-colleges-rankings.xml', entries: collegeRankingsEntries },
    { filename: 'sitemap-colleges-reviews.xml', entries: collegeReviewsEntries },
    { filename: 'sitemap-colleges-campus.xml', entries: collegeCampusEntries },
    { filename: 'sitemap-colleges-degrees-states.xml', entries: collegeStateDegreeEntries },
    ...jobRolesParts.map((entries, idx) => ({ filename: `sitemap-job-roles-${idx + 1}.xml`, entries })),
    ...expJobsParts.map((entries, idx) => ({ filename: `sitemap-job-experience-${idx + 1}.xml`, entries })),
    ...skillJobsParts.map((entries, idx) => ({ filename: `sitemap-skills-${idx + 1}.xml`, entries })),
    { filename: 'sitemap-companies-hiring.xml', entries: companyHiringEntries },
    { filename: 'sitemap-global-programs.xml', entries: globalEntries },
    { filename: 'sitemap-scholarships.xml', entries: scholarshipEntries },
    { filename: 'sitemap-career-paths.xml', entries: pathwayEntries },
    { filename: 'sitemap-learning.xml', entries: learningEntries },
    { filename: 'sitemap-posts.xml', entries: postEntries },
    { filename: 'sitemap-topics.xml', entries: topicEntries },
    { filename: 'sitemap-services.xml', entries: serviceEntries },
    { filename: 'sitemap-companies.xml', entries: companyEntries },
    { filename: 'sitemap-industries.xml', entries: industryEntries },
    { filename: 'sitemap-locations.xml', entries: locationEntries },
    { filename: 'sitemap-resources.xml', entries: resourceEntries },
    { filename: 'sitemap-tools.xml', entries: toolsEntries },
    { filename: 'sitemap-articles.xml', entries: editorialEntries },
    { filename: 'sitemap-rankings.xml', entries: rankingsEntries },
  ];

  const validSitemapsForIndex: { filename: string; count: number }[] = [];

  sitemapConfig.forEach(({ filename, entries }) => {
    if (entries.length > 0) {
      const xml = buildUrlSetXml(entries);
      writeFileSync(resolve(publicDir, filename), xml, 'utf-8');
      validSitemapsForIndex.push({ filename, count: entries.length });
      console.log(`✓ Generated ${filename}: ${entries.length.toLocaleString()} URLs`);
    }
  });

  // Generate Master Index (sitemap.xml)
  const masterXml = buildSitemapIndexXml(validSitemapsForIndex);
  writeFileSync(resolve(publicDir, 'sitemap.xml'), masterXml, 'utf-8');
  console.log(`\n✓ Master sitemap.xml generated with ${validSitemapsForIndex.length} segmented sitemaps!`);
  console.log(`Total URLs Published in Sitemaps: ${seenUrls.size.toLocaleString()}`);
}

generateProductionSitemaps().catch(console.error);
