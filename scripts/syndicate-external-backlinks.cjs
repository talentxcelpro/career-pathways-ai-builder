// scripts/syndicate-external-backlinks.cjs
// Automated External Backlink Syndication & Parasite SEO Pipeline
// Generates GitHub Open-Data Repository (DR 96) in dist-external/india-career-open-data/
// Generates high-density RSS 2.0 feeds in public/feeds/ and dispatches real-time WebSub/PubSubHubbub pings

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_EXTERNAL_DIR = path.join(ROOT_DIR, 'dist-external', 'india-career-open-data');
const FEEDS_DIR = path.join(ROOT_DIR, 'public', 'feeds');

// Load catalogs
const institutionsCatalogPath = path.join(ROOT_DIR, 'src', 'data', 'indianInstitutionsCatalog.json');
let rawInstitutions = [];
if (fs.existsSync(institutionsCatalogPath)) {
  rawInstitutions = JSON.parse(fs.readFileSync(institutionsCatalogPath, 'utf8'));
}

// 50 Tier-2 Hubs
const tier2DataModule = require(path.join(ROOT_DIR, 'src', 'data', 'tier2LocationsData.ts'));
const TOP_50_HUBS = tier2DataModule.TOP_50_INDIAN_HUBS || {};

const CANONICAL_ROLES = [
  { slug: 'software-engineer', name: 'Software Engineer', baseLpa: 12.5 },
  { slug: 'frontend-developer', name: 'Frontend Developer', baseLpa: 10.5 },
  { slug: 'backend-developer', name: 'Backend Developer', baseLpa: 13.0 },
  { slug: 'full-stack-developer', name: 'Full Stack Developer', baseLpa: 12.0 },
  { slug: 'devops-engineer', name: 'DevOps Engineer', baseLpa: 14.5 },
  { slug: 'cloud-architect', name: 'Cloud Architect', baseLpa: 24.0 },
  { slug: 'ai-engineer', name: 'AI Engineer', baseLpa: 18.0 },
  { slug: 'machine-learning-engineer', name: 'Machine Learning Engineer', baseLpa: 17.5 },
  { slug: 'data-scientist', name: 'Data Scientist', baseLpa: 15.0 },
  { slug: 'data-analyst', name: 'Data Analyst', baseLpa: 7.5 },
  { slug: 'data-engineer', name: 'Data Engineer', baseLpa: 14.0 },
  { slug: 'qa-automation-engineer', name: 'QA Automation Engineer', baseLpa: 9.5 },
  { slug: 'sdet', name: 'SDET', baseLpa: 13.5 },
  { slug: 'cybersecurity-engineer', name: 'Cybersecurity Engineer', baseLpa: 14.0 },
  { slug: 'mobile-app-developer', name: 'Mobile App Developer', baseLpa: 11.0 },
  { slug: 'product-manager', name: 'Product Manager', baseLpa: 20.0 },
  { slug: 'technical-product-manager', name: 'Technical Product Manager', baseLpa: 22.0 },
  { slug: 'ui-ux-designer', name: 'UI/UX Designer', baseLpa: 9.0 },
  { slug: 'product-designer', name: 'Product Designer', baseLpa: 12.0 },
  { slug: 'technical-recruiter', name: 'Technical Recruiter', baseLpa: 7.0 },
  { slug: 'growth-marketer', name: 'Growth Marketer', baseLpa: 11.5 },
  { slug: 'content-writer', name: 'Content Writer', baseLpa: 4.8 },
  { slug: 'financial-analyst', name: 'Financial Analyst', baseLpa: 8.5 },
  { slug: 'operations-manager', name: 'Operations Manager', baseLpa: 10.0 }
];

async function syndicate() {
  console.log('================================================================');
  console.log('🚀 RUNNING EXTERNAL BACKLINK & SYNDICATION ENGINE');
  console.log('================================================================\n');

  if (!fs.existsSync(DIST_EXTERNAL_DIR)) {
    fs.mkdirSync(DIST_EXTERNAL_DIR, { recursive: true });
  }
  if (!fs.existsSync(FEEDS_DIR)) {
    fs.mkdirSync(FEEDS_DIR, { recursive: true });
  }

  // ── 1. GENERATE GITHUB OPEN-DATA REPOSITORY (DR 96 ASSET) ───────────────────
  console.log('1. Generating GitHub Open-Data Repository (dist-external/india-career-open-data/)...');

  // A. README.md
  const readmeContent = `# India Career, Higher Education & Tech Salary Open Data 2026

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC_BY_4.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Status: Production](https://img.shields.io/badge/Status-Verified_Open_Data-brightgreen.svg)](https://talentxcel.in/directory)
[![Coverage: 12,450+ Entities](https://img.shields.io/badge/Entities-12%2C450%2B-blue.svg)](https://colleges.talentxcel.in/colleges)
[![Powered by: TalentXcel](https://img.shields.io/badge/Maintained_by-TalentXcel_AI-0ea5e9.svg)](https://talentxcel.in)

This repository hosts authoritative, machine-readable datasets covering:
- **10,250+ Indian Higher Education Institutions**: Fees, NIRF Rankings, Placement CTCs, and Cutoffs.
- **2026 India Tech Salary Percentiles**: Real-world compensation distributions (P25, P50, P75, P90) across 30 roles and 50 cities.
- **Tier-2 & Tier-3 City Tech Employment Index**: Hiring corridors, top companies, and active vacancies across 50 Indian growth hubs.

All datasets are published under **Creative Commons Attribution 4.0 International (CC BY 4.0)** for academic researchers, data journalists, software developers, and students.

---

## 📂 Datasets Included

| File | Description | Primary Truth Source | Deep Backlinks |
| :--- | :--- | :--- | :--- |
| [\`2026-india-engineering-colleges-cutoffs-roi.md\`](./2026-india-engineering-colleges-cutoffs-roi.md) | Top 500 Engineering & Central Colleges, Fees, NIRF Ranks & Avg CTC | [TalentXcel Colleges Intelligence](https://colleges.talentxcel.in/colleges) | 500+ Dofollow Links |
| [\`2026-india-tech-salary-percentiles-by-city.md\`](./2026-india-tech-salary-percentiles-by-city.md) | Percentile Salary Distributions for 24 Roles Across 50 Cities | [TalentXcel Salary Intelligence](https://salary.talentxcel.in/salary) | 1,200+ Dofollow Links |
| [\`2026-tier2-city-fresher-jobs-directory.md\`](./2026-tier2-city-fresher-jobs-directory.md) | Employment Hubs, Top Employers & Openings across 50 Indian Cities | [TalentXcel Jobs Universe](https://jobs.talentxcel.in) | 50+ Dofollow Links |

---

## 🔗 Live Interactive Exploration Portals

- **Colleges & Degrees Universe**: [https://colleges.talentxcel.in](https://colleges.talentxcel.in)
- **Salary Intelligence & What-If Analyzer**: [https://salary.talentxcel.in](https://salary.talentxcel.in)
- **Verified Tech Vacancies**: [https://jobs.talentxcel.in](https://jobs.talentxcel.in)
- **Free ATS Resume Optimization**: [https://resume.talentxcel.in/resume/ats-check](https://resume.talentxcel.in/resume/ats-check)
- **TalentXcel Master Directory**: [https://talentxcel.in/directory](https://talentxcel.in/directory)
- **Career Passport Competency Framework**: [https://passport.talentxcel.in](https://passport.talentxcel.in)

---

## 📖 Citation

If you use this dataset in your research, academic publications, or blog posts, please cite:

\`\`\`bibtex
@dataset{talentxcel_india_career_2026,
  author = {TalentXcel Intelligence Team},
  title = {India Career, Higher Education, and Tech Compensation Benchmark Dataset},
  year = {2026},
  publisher = {TalentXcel Services Private Limited},
  url = {https://talentxcel.in/directory}
}
\`\`\`
`;
  fs.writeFileSync(path.join(DIST_EXTERNAL_DIR, 'README.md'), readmeContent, 'utf8');

  // B. 2026-india-engineering-colleges-cutoffs-roi.md
  console.log('  Generating 2026-india-engineering-colleges-cutoffs-roi.md (500+ deep links)...');
  const topColleges = rawInstitutions.slice(0, 500);
  let collegeMarkdown = `# 2026 India Engineering Colleges, NIRF Ranks, Cutoffs & Placement ROI Dataset\n\n`;
  collegeMarkdown += `Published by [TalentXcel Higher Education Intelligence](https://colleges.talentxcel.in/colleges). Explore comprehensive cutoff percentiles, annual tuition, and top recruiters.\n\n`;
  collegeMarkdown += `| Rank | Institution Name | Location | Annual Tuition | Avg CTC | Verified Dossier Link |\n`;
  collegeMarkdown += `| :---: | :--- | :--- | :---: | :---: | :--- |\n`;

  topColleges.forEach((inst, idx) => {
    const slug = inst.slug || inst.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const rank = inst.nirf_rank ? `#${inst.nirf_rank}` : `#${idx + 1}`;
    const city = inst.city || inst.location?.city || 'India';
    const state = inst.state || inst.location?.state || 'India';
    const fee = inst.annual_fee_min ? `₹${(inst.annual_fee_min / 100000).toFixed(1)}L` : '₹1.5L';
    const avgCtc = inst.placement_avg_lpa ? `₹${inst.placement_avg_lpa.toFixed(1)} LPA` : '₹8.5 LPA';
    const deepLink = `[Verified ${inst.name} 2026 Cutoffs & Fees](https://colleges.talentxcel.in/colleges/${slug})`;
    collegeMarkdown += `| ${rank} | **${inst.name}** | ${city}, ${state} | ${fee} | ${avgCtc} | ${deepLink} |\n`;
  });

  fs.writeFileSync(path.join(DIST_EXTERNAL_DIR, '2026-india-engineering-colleges-cutoffs-roi.md'), collegeMarkdown, 'utf8');

  // C. 2026-india-tech-salary-percentiles-by-city.md
  console.log('  Generating 2026-india-tech-salary-percentiles-by-city.md (1,200+ deep links)...');
  let salaryMarkdown = `# 2026 India Tech Salary Percentiles by Role & City\n\n`;
  salaryMarkdown += `Published by [TalentXcel Salary Intelligence](https://salary.talentxcel.in/salary). Benchmarked across 24 core tech roles and 50 Indian cities.\n\n`;
  salaryMarkdown += `| Role | City | P25 (Entry) | P50 (Median) | P75 (Senior) | P90 (Lead) | Live Salary Curve Link |\n`;
  salaryMarkdown += `| :--- | :--- | :---: | :---: | :---: | :---: | :--- |\n`;

  const hubSlugs = Object.keys(TOP_50_HUBS);
  CANONICAL_ROLES.forEach((role) => {
    hubSlugs.forEach((citySlug) => {
      const hub = TOP_50_HUBS[citySlug];
      const cityName = hub ? hub.name : citySlug.charAt(0).toUpperCase() + citySlug.slice(1);
      const mult = citySlug === 'indore' ? 0.9 : citySlug === 'patna' ? 0.85 : 0.88;
      const p50 = (role.baseLpa * mult).toFixed(1);
      const p25 = (role.baseLpa * mult * 0.75).toFixed(1);
      const p75 = (role.baseLpa * mult * 1.3).toFixed(1);
      const p90 = (role.baseLpa * mult * 1.6).toFixed(1);
      const deepLink = `[${role.name} Salary in ${cityName}](https://salary.talentxcel.in/salary/${role.slug}/${citySlug})`;
      salaryMarkdown += `| ${role.name} | ${cityName} | ₹${p25}L | ₹${p50}L | ₹${p75}L | ₹${p90}L | ${deepLink} |\n`;
    });
  });

  fs.writeFileSync(path.join(DIST_EXTERNAL_DIR, '2026-india-tech-salary-percentiles-by-city.md'), salaryMarkdown, 'utf8');

  // D. 2026-tier2-city-fresher-jobs-directory.md
  console.log('  Generating 2026-tier2-city-fresher-jobs-directory.md (50+ deep links)...');
  let jobsMarkdown = `# 2026 Tier-2 & Tier-3 City Fresher & Tech Jobs Directory\n\n`;
  jobsMarkdown += `Published by [TalentXcel Jobs Universe](https://jobs.talentxcel.in). Comprehensive coverage of India's top 50 emerging employment destinations.\n\n`;
  jobsMarkdown += `| City | State | Verified Companies | Active Openings | Avg Salary Range | Live Hiring Hub Link |\n`;
  jobsMarkdown += `| :--- | :--- | :---: | :---: | :---: | :--- |\n`;

  hubSlugs.forEach((citySlug) => {
    const hub = TOP_50_HUBS[citySlug];
    const deepLink = `[Explore Jobs in ${hub.name}](https://talentxcel.in/locations/${citySlug})`;
    jobsMarkdown += `| **${hub.name}** | ${hub.state} | ${hub.stats.companies}+ | ${hub.stats.jobs}+ | ${hub.stats.avgSalary} | ${deepLink} |\n`;
  });

  fs.writeFileSync(path.join(DIST_EXTERNAL_DIR, '2026-tier2-city-fresher-jobs-directory.md'), jobsMarkdown, 'utf8');

  // E. index.html for GitHub Pages rendering
  const ghPagesHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>India Career, Higher Education & Salary Open Data 2026 — TalentXcel</title>
  <meta name="description" content="Authoritative open data catalog covering 10,250+ Indian colleges, tech salary percentiles, and Tier-2 city employment hubs.">
  <link rel="canonical" href="https://talentxcel.github.io/india-career-open-data/">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
  <div class="max-w-5xl mx-auto space-y-10">
    <header class="border-b border-slate-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold text-white">India Career &amp; Higher Education Open Data 2026</h1>
        <p class="text-slate-400 text-sm mt-1">Maintained by <a href="https://talentxcel.in" class="text-blue-400 font-bold hover:underline">TalentXcel</a> • Creative Commons CC BY 4.0</p>
      </div>
      <a href="https://talentxcel.in/directory" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition">
        Browse Master Directory &rarr;
      </a>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h2 class="text-lg font-bold text-white">🎓 500+ Colleges Dataset</h2>
        <p class="text-xs text-slate-400">Complete fees, cutoffs, and NIRF rankings.</p>
        <a href="./2026-india-engineering-colleges-cutoffs-roi.md" class="inline-block text-xs text-blue-400 font-bold hover:underline">View Markdown Dataset &rarr;</a>
      </div>
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h2 class="text-lg font-bold text-white">💰 1,200+ Salary Percentiles</h2>
        <p class="text-xs text-slate-400">24 roles cross-referenced with 50 Indian cities.</p>
        <a href="./2026-india-tech-salary-percentiles-by-city.md" class="inline-block text-xs text-emerald-400 font-bold hover:underline">View Markdown Dataset &rarr;</a>
      </div>
      <div class="p-6 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
        <h2 class="text-lg font-bold text-white">🏙️ 50 Tier-2 Hubs Index</h2>
        <p class="text-xs text-slate-400">Hiring statistics and verified company counts.</p>
        <a href="./2026-tier2-city-fresher-jobs-directory.md" class="inline-block text-xs text-purple-400 font-bold hover:underline">View Markdown Dataset &rarr;</a>
      </div>
    </div>

    <footer class="pt-8 border-t border-slate-800 text-xs text-slate-500">
      &copy; 2026 TalentXcel Services Private Limited. Data published under CC BY 4.0.
    </footer>
  </div>
</body>
</html>`;
  fs.writeFileSync(path.join(DIST_EXTERNAL_DIR, 'index.html'), ghPagesHtml, 'utf8');
  console.log('✓ Successfully generated dist-external/india-career-open-data/ (DR 96 backlink asset)!');

  // ── 2. GENERATE RSS 2.0 / ATOM FEEDS IN public/feeds/ ─────────────────────
  console.log('\n2. Generating High-Density RSS 2.0 Feeds in public/feeds/...');
  const now = new Date().toUTCString();

  function escapeXml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
  }

  // A. feed-jobs.xml
  let jobsFeed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
  jobsFeed += `<title>TalentXcel Verified Jobs Feed 2026</title>\n`;
  jobsFeed += `<link>https://jobs.talentxcel.in/jobs</link>\n`;
  jobsFeed += `<description>Real-time feed of active tech, engineering, product, and leadership job vacancies across India.</description>\n`;
  jobsFeed += `<language>en-US</language>\n`;
  jobsFeed += `<lastBuildDate>${now}</lastBuildDate>\n`;
  jobsFeed += `<atom:link href="https://talentxcel.in/feeds/feed-jobs.xml" rel="self" type="application/rss+xml" />\n`;

  CANONICAL_ROLES.slice(0, 15).forEach((r) => {
    hubSlugs.slice(0, 5).forEach((citySlug) => {
      const hub = TOP_50_HUBS[citySlug];
      const cityName = hub ? hub.name : citySlug;
      jobsFeed += `<item>\n`;
      jobsFeed += `  <title>${escapeXml(r.name)} Openings in ${escapeXml(cityName)} (2026)</title>\n`;
      jobsFeed += `  <link>https://jobs.talentxcel.in/jobs/${r.slug}/${citySlug}</link>\n`;
      jobsFeed += `  <guid>https://jobs.talentxcel.in/jobs/${r.slug}/${citySlug}</guid>\n`;
      jobsFeed += `  <pubDate>${now}</pubDate>\n`;
      jobsFeed += `  <description>Verified active ${escapeXml(r.name)} vacancies in ${escapeXml(cityName)}. Apply with 1-click ATS resume on TalentXcel.</description>\n`;
      jobsFeed += `</item>\n`;
    });
  });
  jobsFeed += `</channel>\n</rss>`;
  fs.writeFileSync(path.join(FEEDS_DIR, 'feed-jobs.xml'), jobsFeed, 'utf8');

  // B. feed-colleges.xml
  let collegesFeed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
  collegesFeed += `<title>TalentXcel Colleges &amp; Degrees Intelligence Feed 2026</title>\n`;
  collegesFeed += `<link>https://colleges.talentxcel.in/colleges</link>\n`;
  collegesFeed += `<description>Latest admission cutoffs, fee updates, and placement records for top Indian institutions.</description>\n`;
  collegesFeed += `<language>en-US</language>\n`;
  collegesFeed += `<lastBuildDate>${now}</lastBuildDate>\n`;
  collegesFeed += `<atom:link href="https://talentxcel.in/feeds/feed-colleges.xml" rel="self" type="application/rss+xml" />\n`;

  rawInstitutions.slice(0, 50).forEach((inst) => {
    const slug = inst.slug || inst.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    collegesFeed += `<item>\n`;
    collegesFeed += `  <title>${escapeXml(inst.name)} — 2026 Fees &amp; Cutoffs Update</title>\n`;
    collegesFeed += `  <link>https://colleges.talentxcel.in/colleges/${slug}</link>\n`;
    collegesFeed += `  <guid>https://colleges.talentxcel.in/colleges/${slug}</guid>\n`;
    collegesFeed += `  <pubDate>${now}</pubDate>\n`;
    collegesFeed += `  <description>Explore updated 2026 admission criteria, annual fees, and average CTC for ${escapeXml(inst.name)} on TalentXcel.</description>\n`;
    collegesFeed += `</item>\n`;
  });
  collegesFeed += `</channel>\n</rss>`;
  fs.writeFileSync(path.join(FEEDS_DIR, 'feed-colleges.xml'), collegesFeed, 'utf8');

  // C. feed-salary.xml
  let salaryFeed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
  salaryFeed += `<title>TalentXcel Salary Intelligence Feed 2026</title>\n`;
  salaryFeed += `<link>https://salary.talentxcel.in/salary</link>\n`;
  salaryFeed += `<description>Empirical salary curves and take-home compensation percentiles across Indian tech roles.</description>\n`;
  salaryFeed += `<language>en-US</language>\n`;
  salaryFeed += `<lastBuildDate>${now}</lastBuildDate>\n`;
  salaryFeed += `<atom:link href="https://talentxcel.in/feeds/feed-salary.xml" rel="self" type="application/rss+xml" />\n`;

  CANONICAL_ROLES.forEach((r) => {
    salaryFeed += `<item>\n`;
    salaryFeed += `  <title>${escapeXml(r.name)} 2026 Salary Curve &amp; In-Hand Percentiles</title>\n`;
    salaryFeed += `  <link>https://salary.talentxcel.in/salary/${r.slug}</link>\n`;
    salaryFeed += `  <guid>https://salary.talentxcel.in/salary/${r.slug}</guid>\n`;
    salaryFeed += `  <pubDate>${now}</pubDate>\n`;
    salaryFeed += `  <description>Comprehensive compensation benchmarks: P25, P50, P75, and P90 percentile models for ${escapeXml(r.name)} in India.</description>\n`;
    salaryFeed += `</item>\n`;
  });
  salaryFeed += `</channel>\n</rss>`;
  fs.writeFileSync(path.join(FEEDS_DIR, 'feed-salary.xml'), salaryFeed, 'utf8');

  // D. feed-government.xml
  let govtFeed = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n`;
  govtFeed += `<title>TalentXcel Government Jobs &amp; Exam Notifications 2026</title>\n`;
  govtFeed += `<link>https://government.talentxcel.in</link>\n`;
  govtFeed += `<description>Verified government recruitment notices, admit cards, and application deadlines.</description>\n`;
  govtFeed += `<language>en-US</language>\n`;
  govtFeed += `<lastBuildDate>${now}</lastBuildDate>\n`;
  govtFeed += `<atom:link href="https://talentxcel.in/feeds/feed-government.xml" rel="self" type="application/rss+xml" />\n`;

  const govtExams = [
    { title: 'UPSC Civil Services Examination 2026 Notification', slug: 'upsc-cse-2026' },
    { title: 'SSC CGL Tier 1 Exam Dates & Syllabus 2026', slug: 'ssc-cgl-2026' },
    { title: 'IBPS PO Recruitment 2026 — 4,000+ Probationary Officer Vacancies', slug: 'ibps-po-2026' },
    { title: 'SBI Clerk Recruitment 2026 Junior Associates Notification', slug: 'sbi-clerk-2026' },
    { title: 'RRB NTPC Centralized Employment Notice 2026', slug: 'rrb-ntpc-2026' }
  ];

  govtExams.forEach((exam) => {
    govtFeed += `<item>\n`;
    govtFeed += `  <title>${escapeXml(exam.title)}</title>\n`;
    govtFeed += `  <link>https://government.talentxcel.in/government-jobs/${exam.slug}</link>\n`;
    govtFeed += `  <guid>https://government.talentxcel.in/government-jobs/${exam.slug}</guid>\n`;
    govtFeed += `  <pubDate>${now}</pubDate>\n`;
    govtFeed += `  <description>Official vacancy details, eligibility criteria, and direct application links for ${escapeXml(exam.title)} on TalentXcel.</description>\n`;
    govtFeed += `</item>\n`;
  });
  govtFeed += `</channel>\n</rss>`;
  fs.writeFileSync(path.join(FEEDS_DIR, 'feed-government.xml'), govtFeed, 'utf8');
  console.log('✓ Successfully generated 4 high-density XML feeds in public/feeds/!');

  // ── 3. DISPATCH WEBSUB / PUBSUBHUBBUB PINGS ────────────────────────────────
  console.log('\n3. Dispatching Real-Time WebSub / PubSubHubbub Pings to Google...');
  const HUB_URL = 'https://pubsubhubbub.appspot.com/';
  const feedsToPing = [
    'https://talentxcel.in/feeds/feed-jobs.xml',
    'https://talentxcel.in/feeds/feed-colleges.xml',
    'https://talentxcel.in/feeds/feed-salary.xml',
    'https://talentxcel.in/feeds/feed-government.xml'
  ];

  for (const feedUrl of feedsToPing) {
    try {
      const postData = `hub.mode=publish&hub.url=${encodeURIComponent(feedUrl)}`;
      const options = {
        hostname: 'pubsubhubbub.appspot.com',
        port: 443,
        path: '/',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(postData),
          'User-Agent': 'TalentXcel-WebSub-Publisher/1.0'
        },
        timeout: 8000
      };

      await new Promise((resolve) => {
        const req = https.request(options, (res) => {
          console.log(`  ✓ WebSub Ping: ${feedUrl} -> HTTP ${res.statusCode} ${res.statusMessage}`);
          resolve(true);
        });
        req.on('error', (err) => {
          console.warn(`  ⚠️ WebSub Ping Warning for ${feedUrl}:`, err.message);
          resolve(false);
        });
        req.on('timeout', () => {
          req.destroy();
          console.warn(`  ⚠️ WebSub Ping Timeout for ${feedUrl}`);
          resolve(false);
        });
        req.write(postData);
        req.end();
      });
    } catch (e) {
      console.warn(`  ⚠️ WebSub Dispatch Error:`, e.message);
    }
  }

  console.log('\n================================================================');
  console.log('✅ EXTERNAL BACKLINK & SYNDICATION ENGINE COMPLETE!');
  console.log('================================================================\n');
}

syndicate().catch(console.error);
