/**
 * TalentXcel Ultra High-Scale Programmatic Sitemap Matrix Generator (165,000+ URLs)
 */

import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve } from 'path';
import { PRODUCTION_ORIGIN } from '../src/config/seo';
import { CANDIDATE_SERVICES, EMPLOYER_SERVICES, INDUSTRY_HUBS, LOCATION_HUBS, RESOURCE_HUBS } from '../src/config/publicIA';
import { JOB_CATEGORIES } from '../src/utils/jobCategories';
import { coursesDatabase } from '../src/data/coursesData';
import { INDIAN_INSTITUTIONS_CATALOG } from '../src/data/indianInstitutionsCatalog';
import { SEED_PROGRAMS, SEED_SCHOLARSHIPS } from '../src/services/globalEducationService';

const CHUNK_SIZE = 12000;

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

function buildUrlSetXml(urls: { loc: string; lastmod: string; changefreq: string; priority: string }[]): string {
  const urlNodes = urls.map((u) => [
    '  <url>',
    `    <loc>${escapeXml(u.loc)}</loc>`,
    `    <lastmod>${u.lastmod}</lastmod>`,
    `    <changefreq>${u.changefreq}</changefreq>`,
    `    <priority>${u.priority}</priority>`,
    '  </url>',
  ].join('\n'));

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urlNodes,
    '</urlset>',
    '',
  ].join('\n');
}

function buildSitemapIndexXml(sitemapFilenames: string[]): string {
  const today = new Date().toISOString().split('T')[0];
  const sitemapNodes = sitemapFilenames.map((filename) => [
    '  <sitemap>',
    `    <loc>${escapeXml(`${PRODUCTION_ORIGIN}/${filename}`)}</loc>`,
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

function generateFullMatrix() {
  const publicDir = resolve('public');
  if (!existsSync(publicDir)) {
    mkdirSync(publicDir, { recursive: true });
  }

  const today = new Date().toISOString().split('T')[0];
  const allUrls = new Set<string>();
  const urlList: { loc: string; lastmod: string; changefreq: string; priority: string }[] = [];

  const addUrl = (path: string, priority = '0.7', changefreq = 'weekly') => {
    const cleanPath = path === '/' ? '/' : path.replace(/\/+$/, '');
    const fullLoc = `${PRODUCTION_ORIGIN}${cleanPath}`;
    if (!allUrls.has(fullLoc)) {
      allUrls.add(fullLoc);
      urlList.push({ loc: fullLoc, lastmod: today, changefreq, priority });
    }
  };

  console.log('Generating 1.65 Lakh+ High-Scale Programmatic URL Universe...');

  // 1. Base Pages
  const basePages = [
    '/', '/colleges', '/colleges/global-programs', '/colleges/scholarships', '/colleges/pathway',
    '/learning', '/jobs', '/passport', '/companies', '/network', '/employer', '/about',
    '/contact', '/faq', '/terms', '/privacypolicy', '/resume-builder', '/career-tools',
    '/salary-calculator', '/skill-assessment', '/career-map'
  ];
  basePages.forEach(p => addUrl(p, '1.0', 'daily'));

  // 2. Indian Higher Education Matrix (~45,000 URLs)
  const disciplines = [
    'computer-science', 'artificial-intelligence', 'data-science', 'mechanical-engineering',
    'electrical-engineering', 'civil-engineering', 'electronics-communication', 'biotechnology',
    'information-technology', 'chemical-engineering', 'aerospace-engineering', 'robotics',
    'medicine-mbbs', 'dentistry-bds', 'pharmacy-bpharm', 'nursing', 'ayurveda-bams',
    'business-administration-bba', 'master-business-administration-mba', 'commerce-bcom',
    'chartered-accountancy', 'finance-banking', 'economics', 'law-llb', 'corporate-law',
    'design-bdes', 'fashion-technology', 'architecture-barch', 'journalism-media',
    'psychology', 'physics', 'chemistry', 'mathematics', 'agriculture'
  ];

  const exams = ['jee-advanced', 'jee-main', 'neet-ug', 'cat', 'clat', 'cuet-ug', 'gate', 'jam', 'nid-dat', 'nift', 'xat', 'mat', 'kcet', 'mht-cet', 'wbjee'];

  INDIAN_INSTITUTIONS_CATALOG.forEach(inst => {
    addUrl(`/colleges/${inst.slug}`, '0.9', 'weekly');
    addUrl(`/colleges/${inst.id}`, '0.7', 'monthly');
    addUrl(`/colleges/${inst.slug}/fees`, '0.8', 'weekly');
    addUrl(`/colleges/${inst.slug}/placements`, '0.8', 'weekly');
    addUrl(`/colleges/${inst.slug}/cutoff`, '0.8', 'weekly');
    addUrl(`/colleges/${inst.slug}/admission`, '0.8', 'weekly');
    addUrl(`/colleges/${inst.slug}/courses`, '0.8', 'weekly');
    addUrl(`/colleges/${inst.slug}/hostel-facilities`, '0.7', 'monthly');
    addUrl(`/colleges/${inst.slug}/scholarships`, '0.8', 'weekly');
    addUrl(`/colleges/${inst.slug}/faculty-reviews`, '0.7', 'monthly');
    addUrl(`/colleges/${inst.slug}/ranking-analysis`, '0.7', 'monthly');
    addUrl(`/colleges/${inst.slug}/eligibility-criteria`, '0.8', 'weekly');
  });

  const allStates = Array.from(new Set(INDIAN_INSTITUTIONS_CATALOG.map(i => i.location.state)));
  allStates.forEach(st => {
    const stSlug = encodeURIComponent(st.toLowerCase().replace(/\s+/g, '-'));
    addUrl(`/colleges/state/${stSlug}`, '0.8', 'weekly');
    disciplines.forEach(disc => {
      addUrl(`/colleges/${stSlug}/${disc}`, '0.8', 'weekly');
      addUrl(`/colleges/${stSlug}/${disc}/top-rated`, '0.8', 'weekly');
      addUrl(`/colleges/${stSlug}/${disc}/low-fees`, '0.8', 'weekly');
      addUrl(`/colleges/${stSlug}/${disc}/government`, '0.8', 'weekly');
      addUrl(`/colleges/${stSlug}/${disc}/private`, '0.8', 'weekly');
    });
  });

  // College Comparisons (~15,000 URLs)
  const topInsts = INDIAN_INSTITUTIONS_CATALOG.slice(0, 150);
  for (let i = 0; i < topInsts.length; i++) {
    for (let j = i + 1; j < Math.min(topInsts.length, i + 25); j++) {
      addUrl(`/colleges/compare/${topInsts[i].slug}-vs-${topInsts[j].slug}`, '0.8', 'weekly');
    }
  }

  // State x Exam x Discipline Matrix (~25,000 URLs)
  allStates.forEach(st => {
    const stSlug = encodeURIComponent(st.toLowerCase().replace(/\s+/g, '-'));
    exams.forEach(ex => {
      disciplines.slice(0, 15).forEach(d => {
        addUrl(`/colleges/${stSlug}/exam/${ex}/${d}`, '0.7', 'weekly');
      });
    });
  });

  // 3. Global Degree Programs & Scholarships (~20,000 URLs)
  SEED_PROGRAMS.forEach(prog => {
    const pSlug = encodeURIComponent(prog.program_title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    addUrl(`/colleges/global-programs/${pSlug}`, '0.9', 'weekly');
    addUrl(`/colleges/global-programs/${pSlug}/tuition-free-evidence`, '0.8', 'weekly');
    addUrl(`/colleges/global-programs/${pSlug}/scholarships`, '0.8', 'weekly');
    addUrl(`/colleges/global-programs/${pSlug}/visa-requirements`, '0.8', 'weekly');
    addUrl(`/colleges/global-programs/${pSlug}/eligibility-checklist`, '0.8', 'weekly');
    addUrl(`/colleges/global-programs/${pSlug}/living-cost-budget`, '0.8', 'weekly');
  });

  const globalCountries = Array.from(new Set(SEED_PROGRAMS.map(p => p.institution_country)));
  globalCountries.forEach(c => {
    const cSlug = encodeURIComponent(c.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    addUrl(`/colleges/global-programs/country/${cSlug}`, '0.8', 'weekly');
    addUrl(`/colleges/global-programs/country/${cSlug}/tuition-free`, '0.9', 'weekly');
    addUrl(`/colleges/global-programs/country/${cSlug}/master-degrees`, '0.8', 'weekly');
    addUrl(`/colleges/global-programs/country/${cSlug}/phd-fellowships`, '0.8', 'weekly');
    addUrl(`/colleges/global-programs/country/${cSlug}/bachelor-degrees`, '0.8', 'weekly');
    disciplines.forEach(d => {
      addUrl(`/colleges/global-programs/country/${cSlug}/${d}`, '0.7', 'weekly');
      addUrl(`/colleges/global-programs/country/${cSlug}/${d}/english-taught`, '0.8', 'weekly');
    });
  });

  SEED_SCHOLARSHIPS.forEach(sch => {
    const sSlug = encodeURIComponent(sch.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    addUrl(`/colleges/scholarships/${sSlug}`, '0.9', 'weekly');
    addUrl(`/colleges/scholarships/${sSlug}/eligibility`, '0.8', 'weekly');
    addUrl(`/colleges/scholarships/${sSlug}/deadlines`, '0.8', 'weekly');
    addUrl(`/colleges/scholarships/${sSlug}/application-guide`, '0.8', 'weekly');
    addUrl(`/colleges/scholarships/${sSlug}/selection-criteria`, '0.8', 'weekly');
  });

  // 4. Jobs & Roles x Location Matrix (100,000+ URLs)
  const roleSet = new Set<string>();
  const skillSet = new Set<string>();
  Object.values(JOB_CATEGORIES).forEach((cat) => {
    cat.roles.forEach((r) => roleSet.add(r));
    cat.skills.forEach((s) => skillSet.add(s));
  });

  const rolesList = Array.from(roleSet);
  const targetLocations = [
    'bangalore', 'mumbai', 'delhi-ncr', 'hyderabad', 'pune', 'chennai', 'kolkata', 'ahmedabad',
    'gurugram', 'noida', 'kochi', 'chandigarh', 'jaipur', 'indore', 'coimbatore', 'nagpur',
    'bhubaneswar', 'trivandrum', 'vadodara', 'surat', 'lucknow', 'visakhapatnam', 'patna',
    'bhopal', 'ludhiana', 'agra', 'nashik', 'varanasi', 'mysore', 'guwahati', 'dehradun',
    'ranchi', 'jamshedpur', 'mangalore', 'vijayawada', 'guntur', 'aurangabad', 'rajkot', 'tirupati',
    'singapore', 'dubai-uae', 'london-uk', 'berlin-germany', 'san-francisco-usa', 'toronto-canada',
    'sydney-australia', 'tokyo-japan', 'amsterdam-netherlands', 'dublin-ireland', 'remote',
    'work-from-home', 'india', 'united-states', 'united-kingdom', 'germany', 'canada', 'australia'
  ];

  rolesList.forEach(r => {
    const rSlug = encodeURIComponent(r.toLowerCase().replace(/\s+/g, '-'));
    addUrl(`/roles/${rSlug}`, '0.8', 'weekly');
    addUrl(`/roles/${rSlug}/salary-guide`, '0.7', 'weekly');
    addUrl(`/roles/${rSlug}/interview-questions`, '0.7', 'weekly');
    addUrl(`/roles/${rSlug}/career-roadmap`, '0.7', 'weekly');
    addUrl(`/roles/${rSlug}/skills-required`, '0.7', 'weekly');
    addUrl(`/roles/${rSlug}/resume-template`, '0.7', 'weekly');

    targetLocations.forEach(loc => {
      addUrl(`/jobs/${rSlug}/${loc}`, '0.8', 'weekly');
      addUrl(`/jobs/${rSlug}/${loc}/fresher`, '0.7', 'weekly');
      addUrl(`/jobs/${rSlug}/${loc}/experienced`, '0.7', 'weekly');
      addUrl(`/jobs/${rSlug}/${loc}/salary-insights`, '0.7', 'weekly');
      addUrl(`/jobs/${rSlug}/${loc}/interview-prep`, '0.7', 'weekly');
      addUrl(`/jobs/${rSlug}/${loc}/remote-hybrid`, '0.7', 'weekly');
      addUrl(`/jobs/${rSlug}/${loc}/career-growth`, '0.7', 'weekly');
    });
  });

  // 5. Skills & Competencies Matrix (~40,000 URLs)
  Array.from(skillSet).forEach(sk => {
    const sSlug = encodeURIComponent(sk.toLowerCase().replace(/\s+/g, '-'));
    addUrl(`/skills/${sSlug}`, '0.8', 'weekly');
    addUrl(`/skills/${sSlug}/courses`, '0.7', 'weekly');
    addUrl(`/skills/${sSlug}/interview-prep`, '0.7', 'weekly');
    addUrl(`/skills/${sSlug}/salary-benchmark`, '0.7', 'weekly');
    addUrl(`/skills/${sSlug}/career-passport-badge`, '0.7', 'weekly');
    addUrl(`/skills/${sSlug}/practice-projects`, '0.7', 'weekly');
    addUrl(`/skills/${sSlug}/top-certifications`, '0.7', 'weekly');
  });

  console.log(`\nSynthesized Matrix Size: ${allUrls.size.toLocaleString()} URLs`);

  // 6. Write Sitemaps in Chunks of 12,000 URLs
  const totalChunks = Math.ceil(urlList.length / CHUNK_SIZE);
  const sitemapFilenames: string[] = [];

  for (let i = 0; i < totalChunks; i++) {
    const chunkUrls = urlList.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
    const chunkNum = String(i + 1).padStart(2, '0');
    const filename = `sitemap-matrix-${chunkNum}.xml`;
    const xml = buildUrlSetXml(chunkUrls);
    writeFileSync(resolve(publicDir, filename), xml, 'utf-8');
    sitemapFilenames.push(filename);
    console.log(`✓ Generated ${filename}: ${chunkUrls.length.toLocaleString()} URLs`);
  }

  // Write Master Sitemap Index
  const masterXml = buildSitemapIndexXml(sitemapFilenames);
  writeFileSync(resolve(publicDir, 'sitemap.xml'), masterXml, 'utf-8');
  console.log(`\n🚀 MASTER SITEMAP INDEX generated with ${sitemapFilenames.length} segmented sitemaps!`);
  console.log(`Total URLs registered for Google Search Console: ${allUrls.size.toLocaleString()}`);
}

generateFullMatrix();
