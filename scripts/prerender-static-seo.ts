import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { INDIAN_INSTITUTIONS_CATALOG } from '../src/data/indianInstitutionsCatalog.js';
import { TOP_50_INDIAN_HUBS } from '../src/data/tier2LocationsData.js';
import { SEED_PROGRAMS, SEED_SCHOLARSHIPS } from '../src/services/globalEducationService.js';
import { FOUNDATION_NEWS_ARTICLES } from '../src/data/newsArticles.js';
import { buildJobPostingSchema } from '../src/lib/seo/jobPostingSchema.js';
import {
  buildTalentXcelOrganizationSchema,
  buildBreadcrumbSchema,
  buildWebPageSchema,
  buildServiceSchema,
  buildFAQSchema,
  buildPostSchema,
  buildVideoObjectSchema,
  buildImageObjectSchema,
} from '../src/lib/seo/structuredDataSchemas.js';
import {
  buildPostSeoData,
  resolveHashtagDestination,
} from '../src/lib/seo/postSeoModel.js';
import { formatCanonicalUrl } from '../src/config/domainArchitecture.js';
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '../src/config/seo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const BASE_URL = 'https://talentxcel.in';

const SUPABASE_URL = 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

async function prerender() {
  console.log('🚀 Starting Static SEO Pre-rendering Pipeline for Priority Class A URLs...\n');

  if (!fs.existsSync(DIST_DIR)) {
    console.log('Dist directory not found. Creating dist directory...');
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  const sourceIndexHtmlPath = path.resolve(__dirname, '../index.html');
  let cleanBaseTemplate = fs.readFileSync(sourceIndexHtmlPath, 'utf8');

  // Discover compiled Vite assets in dist/assets (sorted by mtime to ensure latest build output)
  let mainJsAsset = '';
  let mainCssAsset = '';
  if (fs.existsSync(path.join(DIST_DIR, 'assets'))) {
    const assetFiles = fs.readdirSync(path.join(DIST_DIR, 'assets'));
    const jsFiles = assetFiles
      .filter((f) => f.startsWith('index-') && f.endsWith('.js'))
      .map((f) => ({ name: f, mtime: fs.statSync(path.join(DIST_DIR, 'assets', f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);
    const cssFiles = assetFiles
      .filter((f) => f.startsWith('index-') && f.endsWith('.css'))
      .map((f) => ({ name: f, mtime: fs.statSync(path.join(DIST_DIR, 'assets', f)).mtimeMs }))
      .sort((a, b) => b.mtime - a.mtime);

    if (jsFiles.length > 0) mainJsAsset = `/assets/${jsFiles[0].name}`;
    if (cssFiles.length > 0) mainCssAsset = `/assets/${cssFiles[0].name}`;
  }

  // Pre-patch base template with production JS and CSS bundles
  if (mainJsAsset) {
    cleanBaseTemplate = cleanBaseTemplate.replace(
      /<script\s+type=["']module["']\s+src=["']\/src\/main\.tsx["']><\/script>/i,
      `<script type="module" crossorigin src="${mainJsAsset}"></script>`
    );
  }
  if (mainCssAsset && !cleanBaseTemplate.includes(mainCssAsset)) {
    cleanBaseTemplate = cleanBaseTemplate.replace(
      '</head>',
      `<link rel="stylesheet" crossorigin href="${mainCssAsset}">\n</head>`
    );
  }

  let generatedCount = 0;

  function writePrerenderedPage(
    routePath: string,
    meta: {
      title: string;
      description: string;
      canonical: string;
      robots?: string;
      h1: string;
      bodyContentHtml: string;
      jsonLd?: object | object[];
    }
  ) {
    const cleanPath = routePath.replace(/^\//, '').replace(/\/$/, '');
    const targetDir = cleanPath === '' ? DIST_DIR : path.join(DIST_DIR, cleanPath);
    fs.mkdirSync(targetDir, { recursive: true });
    const targetIndexFile = path.join(targetDir, 'index.html');
    const targetFlatHtmlFile = cleanPath === '' ? path.join(DIST_DIR, 'home.html') : path.join(DIST_DIR, cleanPath + '.html');

    let pageHtml = cleanBaseTemplate;

    // 1. Title
    pageHtml = pageHtml.replace(
      /<title>.*?<\/title>/i,
      `<title>${escapeHtml(meta.title)}</title>`
    );

    // 2. Meta Description
    if (/<meta\s+name=["']description["'][^>]*>/i.test(pageHtml)) {
      pageHtml = pageHtml.replace(
        /<meta\s+name=["']description["'][^>]*>/i,
        `<meta name="description" content="${escapeHtml(meta.description)}" />`
      );
    } else {
      pageHtml = pageHtml.replace('</head>', `<meta name="description" content="${escapeHtml(meta.description)}" />\n</head>`);
    }

    // 3. Canonical
    if (/<link\s+rel=["']canonical["'][^>]*>/i.test(pageHtml)) {
      pageHtml = pageHtml.replace(
        /<link\s+rel=["']canonical["'][^>]*>/i,
        `<link rel="canonical" href="${meta.canonical}" />`
      );
    } else {
      pageHtml = pageHtml.replace('</head>', `<link rel="canonical" href="${meta.canonical}" />\n</head>`);
    }

    if (meta.robots) {
      const robotsTag = `<meta name="robots" content="${escapeHtml(meta.robots)}" />`;
      if (/<meta\s+name=["']robots["'][^>]*>/i.test(pageHtml)) {
        pageHtml = pageHtml.replace(/<meta\s+name=["']robots["'][^>]*>/i, robotsTag);
      } else {
        pageHtml = pageHtml.replace('</head>', `${robotsTag}\n</head>`);
      }
    }

    // 4. OpenGraph & Schema
    let schemaScripts = '';
    if (meta.jsonLd) {
      const schemas = Array.isArray(meta.jsonLd) ? meta.jsonLd : [meta.jsonLd];
      schemaScripts = schemas
        .filter(Boolean)
        .map((s) => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`)
        .join('\n');
    }

    // Update the existing social tags in-place so prerendered pages have one
    // authoritative value per property instead of duplicate OG declarations.
    const replaceMetaProperty = (property: string, content: string) => {
      const pattern = new RegExp(`(<meta\\s+property=["']${property}["']\\s+content=["'])[^"']*(["'][^>]*>)`, 'i');
      pageHtml = pageHtml.replace(pattern, `$1${escapeHtml(content)}$2`);
    };
    const replaceMetaName = (name: string, content: string) => {
      const pattern = new RegExp(`(<meta\\s+name=["']${name}["']\\s+content=["'])[^"']*(["'][^>]*>)`, 'i');
      pageHtml = pageHtml.replace(pattern, `$1${escapeHtml(content)}$2`);
    };
    replaceMetaProperty('og:title', meta.title);
    replaceMetaProperty('og:description', meta.description);
    replaceMetaProperty('og:url', meta.canonical);
    replaceMetaName('twitter:title', meta.title);
    replaceMetaName('twitter:description', meta.description);

    if (schemaScripts) {
      pageHtml = pageHtml.replace('</head>', `${schemaScripts}\n</head>`);
    }

    // 5. Semantic Pre-rendered DOM Injection into div#root
    if (meta.bodyContentHtml) {
      const subdomainMeshHtml = `
      <footer class="mt-16 border-t border-slate-800 bg-slate-900/90 py-10 px-6">
        <div class="max-w-6xl mx-auto space-y-6 text-xs text-slate-400">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <div class="text-sm font-bold text-white uppercase tracking-wider">TalentXcel Specialized Career &amp; Employment Ecosystem</div>
            <p class="text-slate-400 text-xs mt-0.5">Explore TalentXcel job, salary, resume, education, and career sections.</p>
            </div>
          </div>
          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            <div>
              <a href="https://jobs.talentxcel.in" class="font-bold text-white hover:text-blue-400 block mb-2">Jobs Universe &rarr;</a>
              <ul class="space-y-1">
                <li><a href="https://jobs.talentxcel.in/jobs" class="hover:text-slate-200">Live Vacancies</a></li>
                <li><a href="https://jobs.talentxcel.in/jobs/software-engineer/bangalore" class="hover:text-slate-200">Software Engineer Bangalore</a></li>
                <li><a href="https://jobs.talentxcel.in/jobs/freshers" class="hover:text-slate-200">Fresher Jobs India</a></li>
                <li><a href="https://jobs.talentxcel.in/jobs/data-analyst/hyderabad" class="hover:text-slate-200">Data Analyst Hyderabad</a></li>
              </ul>
            </div>
            <div>
              <a href="https://salary.talentxcel.in" class="font-bold text-white hover:text-blue-400 block mb-2">Salary Tools &rarr;</a>
              <ul class="space-y-1">
                <li><a href="https://salary.talentxcel.in/salary" class="hover:text-slate-200">Salary Guides &amp; Curves</a></li>
                <li><a href="https://salary.talentxcel.in/tools/salary-analyzer" class="hover:text-slate-200">Salary Benchmark Tool</a></li>
              </ul>
            </div>
            <div>
              <a href="https://colleges.talentxcel.in" class="font-bold text-white hover:text-blue-400 block mb-2">Higher Education &rarr;</a>
              <ul class="space-y-1">
                <li><a href="https://colleges.talentxcel.in/colleges" class="hover:text-slate-200">Top Indian Colleges</a></li>
                <li><a href="https://colleges.talentxcel.in/colleges/bhu-varanasi" class="hover:text-slate-200">BHU Varanasi Fees &amp; Cutoffs</a></li>
                <li><a href="https://colleges.talentxcel.in/colleges/coep-pune" class="hover:text-slate-200">COEP Pune Placements</a></li>
                <li><a href="https://colleges.talentxcel.in/colleges/global-programs" class="hover:text-slate-200">&euro;0 Tuition Degrees</a></li>
              </ul>
            </div>
            <div>
              <a href="https://resume.talentxcel.in" class="font-bold text-white hover:text-blue-400 block mb-2">ATS Resume Tools &rarr;</a>
              <ul class="space-y-1">
                <li><a href="https://resume.talentxcel.in/resume/ats-check" class="hover:text-slate-200">Free ATS Scanner</a></li>
                <li><a href="https://resume.talentxcel.in/resume/builder" class="hover:text-slate-200">AI Resume Builder</a></li>
                <li><a href="https://resume.talentxcel.in/resume/templates" class="hover:text-slate-200">Executive ATS Templates</a></li>
                <li><a href="https://resume.talentxcel.in/resume/score" class="hover:text-slate-200">Benchmark ATS Score</a></li>
              </ul>
            </div>
            <div>
              <a href="https://careers.talentxcel.in" class="font-bold text-white hover:text-blue-400 block mb-2">Career Pathways &rarr;</a>
              <ul class="space-y-1">
                <li><a href="https://careers.talentxcel.in/careers" class="hover:text-slate-200">Skill Dependency Trees</a></li>
                <li><a href="https://careers.talentxcel.in/careers/ai-ml-engineer" class="hover:text-slate-200">AI/ML Engineer Pathway</a></li>
                <li><a href="https://government.talentxcel.in" class="hover:text-slate-200">Govt Notifications</a></li>
                <li><a href="https://passport.talentxcel.in" class="hover:text-slate-200">Career Passport</a></li>
              </ul>
            </div>
          </div>
          <div class="pt-4 border-t border-slate-800 text-[11px] text-slate-500">
            &copy; 2026 TalentXcel Platform.
          </div>
        </div>
      </footer>`;
      const renderedBody = `<div id="root"><div class="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans"><header class="border-b border-slate-800 bg-slate-900/80 px-6 py-4"><div class="max-w-7xl mx-auto flex items-center justify-between"><a href="/" class="text-xl font-bold text-white tracking-tight">Talent<span class="text-blue-500">Xcel</span></a><nav class="hidden md:flex gap-6 text-sm font-medium text-slate-300"><a href="/jobs" class="hover:text-white">Jobs</a><a href="/colleges" class="hover:text-white">Colleges</a><a href="/resume" class="hover:text-white">Resume</a><a href="/employer" class="hover:text-white">Employers</a></nav></div></header><main class="max-w-6xl mx-auto px-4 py-8 md:py-12">${meta.h1 ? `<h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white mb-6">${escapeHtml(meta.h1)}</h1>` : ''}${meta.bodyContentHtml}</main>${subdomainMeshHtml}</div></div>`;
      pageHtml = pageHtml.replace(/<div id=["']root["']><\/div>/i, renderedBody);
    }

    fs.writeFileSync(targetIndexFile, pageHtml, 'utf8');
    if (cleanPath !== '') {
      fs.writeFileSync(targetFlatHtmlFile, pageHtml, 'utf8');
    }
    generatedCount++;
  }

  // 0. Pre-render All Core Public Product Surface Hubs
  console.log('Pre-rendering Core Public Product Surface Hubs...');
  const coreHubs = [
    {
      route: '/',
      title: DEFAULT_TITLE,
      desc: DEFAULT_DESCRIPTION,
      h1: 'The Global Professional Talent Network',
      bodyHtml: `
        <div class="space-y-8">
          <div class="bg-gradient-to-r from-blue-900/60 via-purple-900/60 to-slate-900 border border-blue-800/40 rounded-3xl p-8 text-center space-y-4">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              Profiles • Jobs • Career Tools • Hiring
            </span>
            <h2 class="text-2xl md:text-3xl font-extrabold text-white">Connect. Discover. Grow. Get Hired.</h2>
            <p class="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
              Explore professional profiles, job listings, career resources, and tools for resumes and hiring.
            </p>
            <div class="flex flex-wrap justify-center gap-3 pt-2">
              <a href="/network" class="px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-lg">Join the Network &rarr;</a>
              <a href="/reels" class="px-5 py-2.5 rounded-full bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition-all shadow-lg">Watch Reels &rarr;</a>
              <a href="/hire" class="px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all border border-slate-700">Recruiter OS &rarr;</a>
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 class="text-lg font-bold text-white mb-2">Global Tech & Leadership Jobs</h3>
              <p class="text-slate-300 text-sm leading-relaxed mb-4">Browse job listings and review the role and compensation details supplied by employers.</p>
              <a href="/jobs" class="text-blue-400 text-xs font-semibold hover:underline">Explore Jobs &rarr;</a>
            </div>
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 class="text-lg font-bold text-white mb-2">Career Passport</h3>
              <p class="text-slate-300 text-sm leading-relaxed mb-4">Create a professional profile and record career experience and skills with TalentXcel tools.</p>
              <a href="/careerpassport" class="text-blue-400 text-xs font-semibold hover:underline">Build Career Passport &rarr;</a>
            </div>
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 class="text-lg font-bold text-white mb-2">Recruiter OS & Candidate 360</h3>
              <p class="text-slate-300 text-sm leading-relaxed mb-4">Use recruiter tools to explore public member profiles and manage hiring workflows.</p>
              <a href="/hire" class="text-blue-400 text-xs font-semibold hover:underline">Access Recruiter OS &rarr;</a>
            </div>
          </div>
        </div>
      `,
    },
    {
      route: '/career-insights',
      title: 'AI Career Operating System & Career Insights — Global Tech Telemetry | TalentXcel',
      desc: 'Explore career resources and tools for comparing roles, planning skills, and navigating career transitions.',
      h1: 'AI Career Operating System & Progression Terminal',
      bodyHtml: `
        <div class="space-y-8">
          <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 class="text-xl font-bold text-white mb-2">AI Career Operating System &amp; Industry Telemetry</h2>
            <p class="text-slate-300 text-sm leading-relaxed mb-4">Use TalentXcel career resources to explore roles, skills, and available planning tools.</p>
            <div class="flex flex-wrap gap-2 text-xs">
              <a href="/career-insights?region=us" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">United States Market</a>
              <a href="/career-insights?region=ae" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Dubai &amp; UAE Corridor</a>
              <a href="/career-insights?region=eu" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Europe &amp; UK Market</a>
              <a href="/career-insights?region=in" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">India Tech Ecosystem</a>
            </div>
          </section>
        </div>
      `,
    },
    {
      route: '/reels',
      title: 'TalentXcel Reels — Global Tech, AI & Career Stories',
      desc: 'Browse short-form videos and career discussions shared on TalentXcel Reels.',
      h1: 'Global Professional Reels & Tech Architecture Stories',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Short-Form Professional Knowledge & Engineering Breakdowns</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Explore videos and discussions shared by members on TalentXcel.</p>
          <div class="flex flex-wrap gap-2 text-xs">
            <a href="/reels?category=ai" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">AI & Machine Learning</a>
            <a href="/reels?category=systemdesign" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">System Design</a>
            <a href="/reels?category=career" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Salary & Career Growth</a>
            <a href="/reels?category=interview" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Interview Prep</a>
          </div>
        </div>
      `,
    },
    {
      route: '/about',
      title: 'About TalentXcel — The Global Professional Talent Network',
      desc: 'Learn about TalentXcel, a platform for professional profiles, job listings, career resources, and hiring tools.',
      h1: 'About TalentXcel: The Global Professional Talent Network',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 class="text-xl font-bold text-white">Connect. Discover. Grow. Get Hired.</h2>
          <p class="text-slate-300 text-sm leading-relaxed">
            TalentXcel provides professional profiles, job listings, career resources, and tools for resumes and hiring.
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs">
            <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span class="font-bold text-white">🇦🇪 UAE & Middle East</span>
              <p class="text-slate-400 mt-1">Dubai Internet City, Abu Dhabi Hub71, Riyadh tech corridors.</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span class="font-bold text-white">🇪🇺 Europe & UK</span>
              <p class="text-slate-400 mt-1">London Silicon Roundabout, Berlin, Dublin, Amsterdam engineering hubs.</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span class="font-bold text-white">🇺🇸 North & South America</span>
              <p class="text-slate-400 mt-1">San Francisco, NYC, Austin, São Paulo, and Latin America engineering.</p>
            </div>
            <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
              <span class="font-bold text-white">🇮🇳 India & South Asia</span>
              <p class="text-slate-400 mt-1">Bengaluru, NCR/Noida, Hyderabad, Pune technology centers.</p>
            </div>
          </div>
        </div>
      `,
    },
    {
      route: '/jobs',
      title: 'Job Listings | TalentXcel',
      desc: 'Browse job listings on TalentXcel and review role details supplied by employers.',
      h1: 'Job Listings',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Explore Global Employment Opportunities</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Search current job listings and review the requirements, location, and compensation information provided by each employer.</p>
          <div class="flex flex-wrap gap-2 text-xs">
            <a href="/jobs?role=software-engineer" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Software Engineer Jobs</a>
            <a href="/jobs?role=data-scientist" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Data Scientist Jobs</a>
            <a href="/jobs?role=ai-engineer" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">AI Engineer Jobs</a>
            <a href="/jobs?location=dubai" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Jobs in Dubai</a>
            <a href="/jobs?location=london" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Jobs in London</a>
            <a href="/jobs?location=bangalore" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Jobs in Bangalore</a>
          </div>
        </div>
      `,
    },
    {
      route: '/talent',
      title: 'Talent Directory | TalentXcel',
      desc: 'Search member profiles that are marked public on TalentXcel.',
      h1: 'Public Talent Directory',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Search Public Member Profiles</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">The directory displays profile information members have marked public. Profile details and availability are supplied by members.</p>
          <a href="/hire" class="text-blue-400 text-xs font-semibold hover:underline">Explore employer tools &rarr;</a>
        </div>
      `,
    },
    {
      route: '/companies',
      title: 'Top Global Tech Employers & Enterprises | TalentXcel Directory',
      desc: 'Browse company profiles and related job listings available on TalentXcel.',
      h1: 'Companies on TalentXcel',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Global Employers & Hiring Organizations</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Review company information and related job listings available on TalentXcel.</p>
          <a href="/company/talentxcel" class="text-blue-400 text-xs font-semibold hover:underline">TalentXcel Services Entity Profile &rarr;</a>
        </div>
      `,
    },
    {
      route: '/rankings',
      title: 'Rankings & Leaderboards — Companies, AI Products & Careers | TalentXcel',
      desc: 'Authoritative ranking leaderboards for AI products, emerging startups, tech employers, and career tools evaluated on verified capability benchmarks.',
      h1: 'Rankings & Industry Leaderboards',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">AI Product & Company Rankings</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Transparent ranking methodologies evaluating product performance, user adoption, and technological capabilities.</p>
          <a href="/rankings/ai-products" class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">AI Product Rankings Leaderboard &rarr;</a>
        </div>
      `,
    },
    {
      route: '/rankings/ai-products',
      title: 'AI Product Rankings & Industry Benchmark Leaderboard | TalentXcel',
      desc: 'Top artificial intelligence software, developer tools, and machine learning platforms ranked by performance, capability, and user feedback.',
      h1: 'AI Product & Software Rankings Leaderboard',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Top Rated AI Tools & Platforms</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Verified rankings of generative AI models, autonomous agents, and developer tooling.</p>
        </div>
      `,
    },
    {
      route: '/resume',
      title: 'ATS Resume Builder & Studio — Create Free Recruiter-Ready CVs | TalentXcel',
      desc: 'Build recruiter-approved ATS resumes online. Real-time ATS keyword optimization, formatting check, and tailored resume bullet generation.',
      h1: 'ATS Resume Builder & Career Optimization Studio',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Build an ATS-Friendly Resume in Minutes</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Pass applicant tracking systems with pre-structured resume layouts, keyword density optimization, and instant PDF download.</p>
          <a href="/services/resume-building" class="text-blue-400 text-xs font-semibold hover:underline">Professional Resume Writing Services &rarr;</a>
        </div>
      `,
    },
    {
      route: '/tools',
      title: 'Career Tools, ATS Checkers & Salary Calculators | TalentXcel',
      desc: 'Explore free career intelligence tools including ATS resume score checkers, career transition roadmaps, interview simulators, and salary benchmarks.',
      h1: 'Career Tools & Assessment Suite',
      bodyHtml: `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 class="text-lg font-bold text-white mb-2">ATS Resume Checker</h3>
            <p class="text-slate-300 text-xs leading-relaxed mb-3">Test your resume formatting and keyword density against target job descriptions.</p>
            <a href="/resume" class="text-blue-400 text-xs font-semibold">Open Resume Tool &rarr;</a>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 class="text-lg font-bold text-white mb-2">6-Step Career Pathway</h3>
            <p class="text-slate-300 text-xs leading-relaxed mb-3">Generate customized education and skill roadmap from your current level to dream role.</p>
            <a href="/colleges/pathway" class="text-blue-400 text-xs font-semibold">Generate Pathway &rarr;</a>
          </div>
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 class="text-lg font-bold text-white mb-2">Career Map Explorer</h3>
            <p class="text-slate-300 text-xs leading-relaxed mb-3">Interactive skill graph and progression milestones across 150+ professional roles.</p>
            <a href="/careermap" class="text-blue-400 text-xs font-semibold">Explore Career Map &rarr;</a>
          </div>
        </div>
      `,
    },
    {
      route: '/services',
      title: 'TalentXcel Strategic Services — Recruitment, RPO & AI Solutions',
      desc: 'Explore TalentXcel corporate staffing, Recruitment Process Outsourcing (RPO), executive search, AI talent matching, and corporate upskilling solutions.',
      h1: 'Strategic Human Capital & Recruitment Solutions',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Enterprise Workforce & Sourcing Solutions</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">TalentXcel delivers scalable talent acquisition, contract-to-hire staffing, and technology systems consulting for high-growth organizations.</p>
          <div class="flex flex-wrap gap-2 text-xs">
            <a href="/services/ai-recruitment" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">AI Recruitment Platform</a>
            <a href="/services/staffing-recruitment" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Staffing Solutions</a>
            <a href="/services/rpo" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">RPO Outsourcing</a>
            <a href="/services/it-services" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">IT Consulting</a>
          </div>
        </div>
      `,
    },
    {
      route: '/learning',
      title: 'Learning & Skill Certifications — Tech, AI & Management Courses | TalentXcel',
      desc: 'Discover verified courses, industry certifications, and skill bootcamps across Python, Machine Learning, AWS, Cyber Security, and Project Management.',
      h1: 'Learning, Courses & Skill Certification Hub',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Master High-Demand Career Skills</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Curated learning pathways, free coding certifications, and executive training programs aligned with market hiring demand.</p>
        </div>
      `,
    },
    {
      route: '/colleges',
      title: 'Colleges in India — 10,250+ Universities, Fees, Placements & Cutoffs | TalentXcel',
      desc: 'Search 10,250 accredited colleges and universities in India. Compare annual fees, NIRF rankings, highest CTC, cutoff marks, and top recruiters.',
      h1: '10,250+ Indian Colleges & Higher Education Intelligence',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Forensic Higher Education Intelligence</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Comprehensive admission data across engineering, management, medical, and arts colleges in India.</p>
          <div class="flex flex-wrap gap-2 text-xs">
            <a href="/colleges/global-programs" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Global Tuition-Free Programs</a>
            <a href="/colleges/scholarships" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Global Scholarships</a>
            <a href="/colleges/pathway" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">6-Step AI Career Pathway</a>
          </div>
        </div>
      `,
    },
    {
      route: '/colleges/pathway',
      title: '6-Step AI Career Pathway Generator — Personalized Education Roadmap | TalentXcel',
      desc: 'Generate a personalized 6-step education and skill roadmap from your current grade/level to your target career with transparent verified costs.',
      h1: '6-Step AI Career & Education Pathway Generator',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Interactive Career Pathway Wizard</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Select your target career goal, current academic background, and budget to generate a step-by-step roadmap with verified degree programs and scholarships.</p>
        </div>
      `,
    },
    {
      route: '/colleges/global-programs',
      title: 'Global Tuition-Free Degrees & Study Abroad Programs | TalentXcel',
      desc: 'Discover verified tuition-free, fully funded, and low-cost international degree programs across Germany, Norway, France, USA, and UK.',
      h1: 'Global Tuition-Free & Funded Degree Programs',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Verified International Degree Discovery</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Explore accredited international bachelor, master, and PhD programs with real fee breakdowns and scholarship eligibility.</p>
        </div>
      `,
    },
    {
      route: '/colleges/scholarships',
      title: 'Global Scholarships & Student Funding Directory | TalentXcel',
      desc: 'Browse verified international scholarships, government grants, and research fellowships for undergraduate and postgraduate students.',
      h1: 'Global Scholarships & Student Funding Directory',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Verified Scholarship & Fellowship Opportunities</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Discover fully funded scholarships with deadlines, eligibility criteria, and application links.</p>
        </div>
      `,
    },
    {
      route: '/careermap',
      title: 'Career Map — Interactive Skill Graph & Role Progression | TalentXcel',
      desc: 'Explore interactive career progression roadmaps, salary bands, required skills, and transition pathways across software, AI, product, and business roles.',
      h1: 'Career Map & Role Progression Graph',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Interactive Career Progression & Skill Milestones</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Navigate from entry-level positions to executive roles with clear skill requirements, certifications, and compensation benchmarks.</p>
        </div>
      `,
    },
    {
      route: '/careerpassport',
      title: 'Career Passport — Verified Competency Credentialing Framework | TalentXcel',
      desc: 'Learn about TalentXcel Career Passport, a tamper-proof competency verification framework connecting candidate skills with employer hiring requirements.',
      h1: 'Career Passport Competency Framework',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Verified Candidate Skill Credentials</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Career Passport benchmarks candidate technical skills, soft skills, and professional experience into a verified competency score recognized by top employers.</p>
        </div>
      `,
    },
    {
      route: '/employer',
      title: 'Employer Hiring Tools | TalentXcel',
      desc: 'Explore TalentXcel tools for managing job listings and recruiting workflows.',
      h1: 'Employer Hiring Tools',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Manage Hiring on TalentXcel</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Explore tools for posting roles and managing recruiting workflows.</p>
          <a href="/services/staffing-recruitment" class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">Explore Staffing Services &rarr;</a>
        </div>
      `,
    },
  ];

  for (const hub of coreHubs) {
    const canonical = formatCanonicalUrl(hub.route);
    const subOrigin = canonical.split('/').slice(0, 3).join('/');
    const webPageSchema = buildWebPageSchema({
      name: hub.title,
      description: hub.desc,
      url: canonical,
      aboutOrgId: `${BASE_URL}/#organization`,
    });
    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: 'Home', url: subOrigin },
      ...(hub.route !== '/' ? [{ name: hub.h1, url: canonical }] : []),
    ]);

    writePrerenderedPage(hub.route, {
      title: hub.title,
      description: hub.desc,
      canonical,
      robots: hub.route === '/talent' ? 'noindex, follow' : undefined,
      h1: hub.h1,
      bodyContentHtml: hub.bodyHtml,
      jsonLd: [webPageSchema, breadcrumbSchema],
    });
  }

  // 1. Pre-render 18-Section Authoritative Company Page (/company/talentxcel)
  console.log('Pre-rendering Authoritative 18-Section Company Landing Pages...');
  const companyPages = [
    { slug: 'talentxcel', name: 'TalentXcel Services' },
    { slug: 'talentxcel-services', name: 'TalentXcel Services' },
  ];

  const companyFaqs = [
    {
      question: 'What is TalentXcel?',
      answer: 'TalentXcel is an AI-powered career operating system and recruitment platform that integrates intelligent job matching, ATS resume optimization, verified credentials, and corporate staffing solutions.',
    },
    {
      question: 'How does TalentXcel help job seekers?',
      answer: 'Job seekers can build recruiter-ready ATS resumes, benchmark their skills with Career Passports, explore higher education degree pathways across 10,250 Indian institutions, and apply directly to verified employer jobs.',
    },
    {
      question: 'What corporate recruitment services does TalentXcel provide?',
      answer: 'TalentXcel provides end-to-end talent acquisition, contract-to-hire staffing, Recruitment Process Outsourcing (RPO), executive search, and pre-screened technical candidate pipelines.',
    },
    {
      question: 'Where is TalentXcel located?',
      answer: 'TalentXcel Services Pvt Ltd is headquartered in Noida, Uttar Pradesh, India, serving clients and job seekers globally.',
    },
  ];

  for (const comp of companyPages) {
    const canonical = formatCanonicalUrl(`/company/${comp.slug}`);
    const compOrigin = canonical.split('/').slice(0, 3).join('/');
    const title = 'TalentXcel Services | AI Career & Recruitment Platform';
    const description = 'TalentXcel is an AI-powered career, recruitment and professional growth platform connecting job seekers, employers, educators and professionals.';

    const orgSchema = buildTalentXcelOrganizationSchema(canonical);
    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: 'Home', url: compOrigin },
      { name: 'Companies', url: `${compOrigin}/companies` },
      { name: comp.name, url: canonical },
    ]);
    const webPageSchema = buildWebPageSchema({
      name: title,
      description,
      url: canonical,
      aboutOrgId: `${BASE_URL}/#organization`,
    });
    const faqSchema = buildFAQSchema(companyFaqs);

    const bodyHtml = `
      <div class="space-y-8">
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-2">1. About TalentXcel</h2>
          <p class="text-slate-300 text-sm leading-relaxed">TalentXcel Services Pvt Ltd is a modern technology and human capital organization headquartered in Noida, Uttar Pradesh, India.</p>
        </section>
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-2">2. What TalentXcel Does</h2>
          <p class="text-slate-300 text-sm leading-relaxed">TalentXcel operates an integrated career operating system connecting job seekers, employers, and higher education institutions with AI skill matching and verified recruitment.</p>
        </section>
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-2">3. AI-Powered Career Platform</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Algorithmic vector matching between candidate competencies and live marketplace vacancies.</p>
        </section>
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-2">4. Jobs & Hiring</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Transparent job listings with real salaries, verified employers, and direct application pathways.</p>
          <a href="/jobs" class="inline-block mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">View Open Jobs &rarr;</a>
        </section>
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-2">5. Recruitment & Staffing</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Full-lifecycle talent sourcing, contract-to-hire staffing, and Recruitment Process Outsourcing (RPO).</p>
          <a href="/services/staffing-recruitment" class="inline-block mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">Staffing Solutions &rarr;</a>
        </section>
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-2">6. Resume Builder & ATS Intelligence</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Real-time ATS parsing feedback, keyword match analysis, and recruiter-ready PDF formatting.</p>
          <a href="/resume" class="inline-block mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">ATS Resume Builder &rarr;</a>
        </section>
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-2">7. Frequently Asked Questions</h2>
          <div class="space-y-3 pt-2">
            ${companyFaqs.map((f) => `<div class="p-3 bg-slate-950 rounded-lg"><h3 class="font-semibold text-white text-xs">${escapeHtml(f.question)}</h3><p class="text-slate-400 text-xs mt-1">${escapeHtml(f.answer)}</p></div>`).join('')}
          </div>
        </section>
      </div>
    `;

    writePrerenderedPage(`/company/${comp.slug}`, {
      title,
      description,
      canonical,
      h1: comp.name,
      bodyContentHtml: bodyHtml,
      jsonLd: [orgSchema, breadcrumbSchema, webPageSchema, faqSchema],
    });
  }

  // 1b. Pre-render High-Demand Company Role Hubs (e.g. /company/salesforce/jobs/data-engineer)
  console.log('Pre-rendering Company Role Hubs...');
  const companyRolePages = [
    { companySlug: 'salesforce', companyName: 'Salesforce', roleSlug: 'software-engineer', roleTitle: 'Software Engineer', salaryMin: '₹15L', salaryMax: '₹36L', skills: ['Java', 'Python', 'React', 'Apex', 'Lightning Web Components', 'AWS'] },
    { companySlug: 'google', companyName: 'Google', roleSlug: 'software-engineer', roleTitle: 'Software Engineer', salaryMin: '₹22L', salaryMax: '₹55L', skills: ['C++', 'Python', 'Java', 'Distributed Systems', 'GCP', 'Kubernetes'] },
    { companySlug: 'microsoft', companyName: 'Microsoft', roleSlug: 'software-engineer', roleTitle: 'Software Engineer', salaryMin: '₹18L', salaryMax: '₹45L', skills: ['C#', '.NET Core', 'Azure', 'TypeScript', 'Distributed Systems', 'SQL'] },
    { companySlug: 'amazon', companyName: 'Amazon', roleSlug: 'software-engineer', roleTitle: 'Software Engineer', salaryMin: '₹18L', salaryMax: '₹48L', skills: ['Java', 'AWS', 'DynamoDB', 'Distributed Systems', 'Microservices', 'Python'] },
  ];

  for (const cr of companyRolePages) {
    const route = `/company/${cr.companySlug}/jobs/${cr.roleSlug}`;
    const canonical = formatCanonicalUrl(route);
    const compOrigin = canonical.split('/').slice(0, 3).join('/');
    const title = `${cr.companyName} ${cr.roleTitle} Jobs [Hiring 2026] — Salaries & Openings | TalentXcel`;
    const description = `Explore verified ${cr.roleTitle} vacancies, average salary benchmarks (${cr.salaryMin} - ${cr.salaryMax} PA), required tech stack, and direct application links at ${cr.companyName}.`;

    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: 'Home', url: compOrigin },
      { name: 'Companies', url: `${compOrigin}/companies` },
      { name: cr.companyName, url: `${compOrigin}/company/${cr.companySlug}` },
      { name: `${cr.roleTitle} Jobs`, url: canonical },
    ]);

    const webPageSchema = buildWebPageSchema({
      name: title,
      description,
      url: canonical,
      aboutOrgId: `${BASE_URL}/#organization`,
    });

    const bodyHtml = `
      <div class="space-y-8">
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-2">1. Overview of ${escapeHtml(cr.roleTitle)} at ${escapeHtml(cr.companyName)}</h2>
          <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(cr.companyName)} is hiring ${escapeHtml(cr.roleTitle)}s for 2026. Explore live vacancies, verified compensation ranges (${escapeHtml(cr.salaryMin)} - ${escapeHtml(cr.salaryMax)} PA), tech stack requirements, and 1-click ATS application.</p>
        </section>
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-2">2. Compensation Benchmarks</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Typical market salary ranges for ${escapeHtml(cr.roleTitle)} at ${escapeHtml(cr.companyName)} range from ${escapeHtml(cr.salaryMin)} to ${escapeHtml(cr.salaryMax)} PA depending on experience, seniority tier, and location.</p>
        </section>
        <section class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-2">3. Required Skills & Tech Stack</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Primary competencies: ${cr.skills.map(s => escapeHtml(s)).join(', ')}.</p>
          <a href="/jobs?search=${encodeURIComponent(cr.roleTitle)}" class="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">Explore All Active ${escapeHtml(cr.roleTitle)} Jobs &rarr;</a>
        </section>
      </div>
    `;

    writePrerenderedPage(route, {
      title,
      description,
      canonical,
      h1: `${cr.companyName} ${cr.roleTitle} Jobs`,
      bodyContentHtml: bodyHtml,
      jsonLd: [breadcrumbSchema, webPageSchema],
    });
  }

  // 1c. Pre-render Google Sitelink Redirect: /company/salesforce/jobs/data-engineer -> /career-insights
  console.log('Pre-rendering Google Sitelink Redirect: /company/salesforce/jobs/data-engineer -> /career-insights...');
  const sfRedirectHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=https://talentxcel.in/career-insights">
  <link rel="canonical" href="https://talentxcel.in/career-insights">
  <title>AI Career Operating System & Career Insights — TalentXcel</title>
</head>
<body>
  <p>Redirecting to <a href="https://talentxcel.in/career-insights">AI Career Operating System & Career Insights</a>...</p>
  <script>window.location.replace("https://talentxcel.in/career-insights");</script>
</body>
</html>`;

  const sfRedirectDir = path.join(DIST_DIR, 'company', 'salesforce', 'jobs', 'data-engineer');
  fs.mkdirSync(sfRedirectDir, { recursive: true });
  fs.writeFileSync(path.join(sfRedirectDir, 'index.html'), sfRedirectHtml, 'utf8');
  fs.writeFileSync(path.join(DIST_DIR, 'company', 'salesforce', 'jobs', 'data-engineer.html'), sfRedirectHtml, 'utf8');
  generatedCount++;

  // 2. Pre-render All 10 Strategic Services
  console.log('Pre-rendering 10 Strategic Service Pages...');
  const services = [
    { slug: 'ai-recruitment', title: 'AI Recruitment & Talent Matching Platform', desc: 'Algorithmic candidate matching, automated screening, and verified capability scoring.' },
    { slug: 'staffing-recruitment', title: 'Corporate Staffing & Recruitment Solutions', desc: 'Full-lifecycle sourcing, contract-to-hire, and recruitment process outsourcing (RPO).' },
    { slug: 'rpo', title: 'Recruitment Process Outsourcing (RPO)', desc: 'End-to-end hiring delegation, embedded recruiter pods, and ATS pipeline operations.' },
    { slug: 'it-services', title: 'IT & Technology Systems Consulting', desc: 'Enterprise software architecture, cloud modernization, and tech staff augmentation.' },
    { slug: 'ai-solutions', title: 'AI Solutions & Autonomous Workflows', desc: 'Custom AI agent systems, machine learning integration, and workplace automation.' },
    { slug: 'corporate-training', title: 'Corporate Training & Executive Development', desc: 'Custom upskilling, behavioral leadership programs, and technical bootcamps.' },
    { slug: 'career-services', title: 'Professional Career Services & Executive Coaching', desc: '1-on-1 career strategy, executive bio refinement, and interview simulation.' },
    { slug: 'resume-building', title: 'ATS Resume Builder & Cover Letter Studio', desc: 'Real-time ATS parsing, intelligent bullet suggestions, and role-tailored customization.' },
    { slug: 'talent-management', title: 'Talent Management & Skill Verification', desc: 'Career Passport credentialing, workforce skill graphs, and internal mobility.' },
    { slug: 'job-placement', title: 'Direct Job Placement & Candidate Sourcing', desc: 'Fast-track introductions to verified employers and hiring teams.' },
  ];

  for (const serv of services) {
    const canonical = `${BASE_URL}/services/${serv.slug}`;
    const title = `${serv.title} | TalentXcel Strategic Services`;
    const servSchema = buildServiceSchema({
      name: serv.title,
      description: serv.desc,
      serviceType: serv.title,
      url: canonical,
    });
    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: 'Home', url: BASE_URL },
      { name: 'Services', url: `${BASE_URL}/services` },
      { name: serv.title, url: canonical },
    ]);

    writePrerenderedPage(`/services/${serv.slug}`, {
      title,
      description: serv.desc,
      canonical,
      h1: serv.title,
      bodyContentHtml: `<div class="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h2 class="text-xl font-bold text-white mb-2">${escapeHtml(serv.title)}</h2><p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(serv.desc)}</p><a href="/contact" class="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">Get Started &rarr;</a></div>`,
      jsonLd: [servSchema, breadcrumbSchema],
    });
  }

  // 3. Pre-render All 11 Topic Hubs
  console.log('Pre-rendering 11 Topic Hubs...');
  const topics = [
    { slug: 'artificial-intelligence', title: 'Artificial Intelligence & Machine Learning', desc: 'Explore AI career pathways, machine learning job opportunities, and real-time product leaderboards.' },
    { slug: 'recruitment', title: 'Recruitment & Talent Acquisition', desc: 'Discover modern talent acquisition strategies, recruitment process outsourcing (RPO), and verified candidate benchmarking.' },
    { slug: 'careers', title: 'Career Roadmaps & Professional Growth', desc: 'Navigate modern career transitions with ATS resume optimization, psychometric matching, and verifiable credentials.' },
    { slug: 'education', title: 'Higher Education & Degree Intelligence', desc: 'Forensic data on 10,250 accredited Indian universities and colleges, tuition-free global programs, and education pathways.' },
    { slug: 'technology', title: 'Technology & Software Engineering', desc: 'Discover software engineering vacancies, systems design guides, technical assessment frameworks, and developer intelligence.' },
    { slug: 'leadership', title: 'Leadership & Executive Management', desc: 'Strategic intelligence on leadership development, C-level executive hiring, and corporate talent mobility.' },
    { slug: 'business', title: 'Business Strategy & Workforce Operations', desc: 'Explore business operations roles, strategic consulting, commercial talent pipelines, and enterprise scaling.' },
    { slug: 'resume-writing', title: 'Resume Writing & ATS Optimization', desc: 'Master resume optimization strategies to pass applicant tracking systems and eliminate formatting rejections.' },
    { slug: 'job-search', title: 'Job Search & Application Strategies', desc: 'Actionable job search playbooks, compensation benchmarking, company research, and recruiter outreach.' },
    { slug: 'interview-preparation', title: 'Interview Preparation & Practice', desc: 'Comprehensive interview preparation guides covering system design, coding assessments, and STAR behavioral questions.' },
    { slug: 'future-of-work', title: 'Future of Work & Autonomous Workflows', desc: 'Insights on the evolving landscape of work, human-AI hybrid teams, and autonomous agent workflows.' },
  ];

  for (const top of topics) {
    const canonical = `${BASE_URL}/topics/${top.slug}`;
    const title = `${top.title} — Career Insights, Jobs & Guides | TalentXcel`;
    const topSchema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: top.title,
      description: top.desc,
      url: canonical,
      publisher: { '@id': `${BASE_URL}/#organization` },
    };
    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: 'Home', url: BASE_URL },
      { name: 'Topics', url: `${BASE_URL}/topics/artificial-intelligence` },
      { name: top.title, url: canonical },
    ]);

    writePrerenderedPage(`/topics/${top.slug}`, {
      title,
      description: top.desc,
      canonical,
      h1: top.title,
      bodyContentHtml: `<div class="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h2 class="text-xl font-bold text-white mb-2">${escapeHtml(top.title)}</h2><p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(top.desc)}</p></div>`,
      jsonLd: [topSchema, breadcrumbSchema],
    });
  }

  // 4. Pre-render Database Jobs with GSC Valid JobPosting Schema
  console.log('Pre-rendering Database Jobs...');
  try {
    const { data: dbJobs } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .eq('job_status', 'open');

    if (dbJobs) {
      for (const job of dbJobs) {
        const schema = buildJobPostingSchema(job);
        const slug = job.seo_slug || job.id;
        const canonical = `https://jobs.talentxcel.in/jobs/${slug}`;
        const title = `${job.title} at ${job.company_name} | TalentXcel Jobs`;
        const description = (job.description || '').slice(0, 160);

        const bodyHtml = `
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <div class="flex items-start justify-between gap-4">
              <div>
                <h2 class="text-2xl font-bold text-white">${escapeHtml(job.title)}</h2>
                <p class="text-sm text-blue-400 font-medium mt-1">${escapeHtml(job.company_name)} &bull; ${escapeHtml(job.location || 'Noida, India')}</p>
                <div class="flex items-center gap-3 mt-3 text-xs text-slate-400">
                  <span class="px-2.5 py-1 bg-slate-800 rounded-md text-slate-300">${escapeHtml(job.employment_type || 'Full-time')}</span>
                  ${job.salary_min ? `<span class="text-emerald-400 font-semibold">₹${(job.salary_min / 100000).toFixed(1)}L - ₹${((job.salary_max || job.salary_min) / 100000).toFixed(1)}L PA</span>` : ''}
                </div>
              </div>
              <a href="${canonical}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm rounded-xl">Apply for Role</a>
            </div>
            <div class="pt-6 border-t border-slate-800 text-slate-200 text-sm leading-relaxed whitespace-pre-line">
              ${escapeHtml(job.description || '')}
            </div>

            <!-- Interactive Match Diagnostic & Conversion Hook -->
            <div class="p-6 bg-gradient-to-r from-blue-950/60 via-slate-900 to-purple-950/60 border border-blue-500/40 rounded-2xl text-center space-y-4">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold">
                Instant Skill Intelligence Diagnostic
              </span>
              <h3 class="text-xl font-bold text-white">See How Well You Match This Job — Free</h3>
              <p class="text-xs text-slate-300 max-w-md mx-auto">Calculate your ATS compatibility index, evaluate skill requirements, and unlock 24 matched positions in 10 seconds.</p>
              <a href="${canonical}" class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30">
                Calculate Match Score Free &rarr;
              </a>
            </div>
          </div>
        `;

        const breadcrumbSchema = buildBreadcrumbSchema([
          { name: 'Home', url: 'https://jobs.talentxcel.in/' },
          { name: 'Jobs', url: 'https://jobs.talentxcel.in/jobs' },
          { name: job.title, url: canonical },
        ]);

        writePrerenderedPage(`/jobs/${slug}`, {
          title,
          description,
          canonical,
          h1: job.title,
          bodyContentHtml: bodyHtml,
          jsonLd: schema ? [schema, breadcrumbSchema] : [breadcrumbSchema],
        });
      }
    }
  } catch (err) {
    console.warn('Jobs prerender warning:', err);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. Pre-render Dynamic /network Feed, Paginated Pages, Topic Hubs & Posts
  // ─────────────────────────────────────────────────────────────────────────
  console.log('Pre-rendering Dynamic /network Feed, Posts, Pagination & Topic Hubs...');
  try {
    // Pull up to 300 posts — DB-level filtering and ordering only
    const { data: dbPosts } = await supabase
      .from('posts')
      .select('*, author:profiles(id, full_name, username, title, profile_picture_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(300);

    if (dbPosts && dbPosts.length > 0) {
      const networkCanonical = `${BASE_URL}/network`;

      // ── Helper: detect video / image URLs ─────────────────────────────────
      const VIDEO_EXTS = ['.mp4', '.webm', '.mov', '.m4v'];
      function isVideoUrl(url: string) {
        const clean = url.split('?')[0].toLowerCase();
        return VIDEO_EXTS.some(e => clean.endsWith(e));
      }
      function isImageUrl(url: string) { return !isVideoUrl(url); }

      // ── Helper: derive descriptive alt text from post content ──────────────
      function buildAltText(content: string, authorName: string): string {
        const first = (content || '').trim().split(/[.!?\n]/)[0]?.trim().slice(0, 100) || '';
        if (first.length > 8) return `${first} — shared by ${authorName} on TalentXcel`;
        return `Career insight shared by ${authorName} on TalentXcel Network`;
      }

      // ── Helper: fetch top 5 public comments for a single post ─────────────
      // post_comments has no FK to profiles — join via separate query
      async function fetchPublicComments(postId: string) {
        const { data: rawComments } = await supabase
          .from('post_comments')
          .select('id, author_id, content, created_at')
          .eq('post_id', postId)
          .order('created_at', { ascending: true })
          .limit(5);

        if (!rawComments || rawComments.length === 0) return [];

        // Resolve author names in one extra query — DB level, not in-memory loop
        const authorIds = [...new Set(rawComments.map((c: any) => c.author_id).filter(Boolean))];
        let authorMap: Record<string, string> = {};
        if (authorIds.length > 0) {
          const { data: profiles } = await supabase
            .from('profiles')
            .select('id, full_name, username')
            .in('id', authorIds);
          (profiles || []).forEach((p: any) => {
            authorMap[p.id] = p.full_name || p.username || 'TalentXcel Member';
          });
        }

        return rawComments
          .filter((c: any) => c.content && c.content.trim().length > 1)
          .map((c: any) => ({
            authorName: authorMap[c.author_id] || 'TalentXcel Member',
            dateCreated: c.created_at,
            text: (c.content || '').trim(),
            dateLabel: new Date(c.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
            }),
          }));
      }

      // ── Helper: render one <article> for the feed ─────────────────────────
      function renderFeedArticle(post: any, comments: any[]): string {
        const authorName = post.author?.full_name || 'TalentXcel Services';
        const authorTitle = post.author?.title || 'Verified Professional';
        const authorUsername = post.author?.username || post.author?.id || 'member';
        const cleanContent = (post.content || '').trim();
        const postDate = new Date(post.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        });
        const mediaUrls: string[] = Array.isArray(post.media_urls) ? post.media_urls : [];
        const videoUrl = mediaUrls.find(isVideoUrl) || (post.post_type === 'video' && mediaUrls[0] ? mediaUrls[0] : null);
        const imageUrl = mediaUrls.find(isImageUrl) || post.featured_image_url || null;
        const altText = buildAltText(cleanContent, authorName);

        let mediaTagHtml = '';
        if (videoUrl) {
          mediaTagHtml = `
            <div class="my-3 rounded-xl overflow-hidden border border-slate-800 bg-black">
              <video controls preload="metadata" class="w-full max-h-[480px] bg-black"
                src="${escapeHtml(videoUrl)}"
                aria-label="${escapeHtml(altText)}">
              </video>
            </div>`;
        } else if (imageUrl) {
          mediaTagHtml = `
            <div class="my-3 rounded-xl overflow-hidden border border-slate-800">
              <img src="${escapeHtml(imageUrl)}"
                alt="${escapeHtml(altText)}"
                itemprop="image"
                class="w-full max-h-[480px] object-cover" loading="lazy" />
            </div>`;
        }

        const hashtagsHtml = post.hashtags && post.hashtags.length > 0
          ? `<div class="flex flex-wrap gap-1.5 pt-1">${(post.hashtags as string[]).map(h =>
              `<a href="/network/topics/${encodeURIComponent(h.replace(/^#/, '').toLowerCase())}" class="text-xs text-blue-400 hover:text-blue-300">#${escapeHtml(h.replace(/^#/, ''))}</a>`
            ).join('')}</div>` : '';

        const engagementHtml = `
          <section aria-label="Post engagement" class="pt-3 border-t border-slate-800/80">
            <div class="flex items-center justify-between text-xs text-slate-400 font-semibold">
              <div class="flex gap-4">
                <span itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
                  <meta itemprop="interactionType" content="https://schema.org/LikeAction" />
                  <meta itemprop="userInteractionCount" content="${post.likes_count || 0}" />
                  <span aria-label="${post.likes_count || 0} likes">❤️ ${post.likes_count || 0} Likes</span>
                </span>
                <span itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
                  <meta itemprop="interactionType" content="https://schema.org/CommentAction" />
                  <meta itemprop="userInteractionCount" content="${post.comments_count || 0}" />
                  <span aria-label="${post.comments_count || 0} comments">💬 ${post.comments_count || 0} Comments</span>
                </span>
                <span itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
                  <meta itemprop="interactionType" content="https://schema.org/ShareAction" />
                  <meta itemprop="userInteractionCount" content="${post.shares_count || 0}" />
                  <span aria-label="${post.shares_count || 0} shares">🔁 ${post.shares_count || 0} Shares</span>
                </span>
              </div>
              <a href="/post/${post.id}" class="text-blue-400 hover:text-blue-300 font-bold">View Discussion →</a>
            </div>
          </section>`;

        const commentsHtml = comments.length > 0
          ? `<section aria-label="Top comments" class="pt-3 border-t border-slate-800/60 space-y-2">
              <p class="text-xs text-slate-500 font-semibold uppercase tracking-wider">Community Replies</p>
              ${comments.map(c => `
                <article itemprop="comment" itemscope itemtype="https://schema.org/Comment" class="pl-3 border-l-2 border-slate-700 space-y-0.5">
                  <div class="flex items-center gap-1.5 text-xs text-slate-400">
                    <span itemprop="author" itemscope itemtype="https://schema.org/Person">
                      <span itemprop="name" class="font-semibold text-slate-300">${escapeHtml(c.authorName)}</span>
                    </span>
                    <time itemprop="dateCreated" datetime="${escapeHtml(c.dateCreated)}" class="text-slate-500">· ${escapeHtml(c.dateLabel)}</time>
                  </div>
                  <p itemprop="text" class="text-xs text-slate-300 leading-relaxed">${escapeHtml(c.text.slice(0, 300))}</p>
                </article>`).join('')}
            </section>` : '';

        return `
          <article itemscope itemtype="https://schema.org/SocialMediaPosting"
            class="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <div class="flex items-center gap-3" itemprop="author" itemscope itemtype="https://schema.org/Person">
                <div class="w-11 h-11 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-white text-sm">
                  ${escapeHtml(authorName.charAt(0))}
                </div>
                <div>
                  <h3 class="text-base font-bold text-white flex items-center gap-1.5">
                    <a itemprop="url" href="/@${escapeHtml(authorUsername)}" class="hover:text-blue-300">
                      <span itemprop="name">${escapeHtml(authorName)}</span>
                    </a>
                    <span class="inline-block w-2 h-2 rounded-full bg-blue-500" title="Verified"></span>
                  </h3>
                  <p class="text-xs text-slate-400 font-medium">${escapeHtml(authorTitle)} •
                    <time itemprop="datePublished" datetime="${escapeHtml(post.created_at)}">${escapeHtml(postDate)}</time>
                  </p>
                </div>
              </div>
              <a href="/post/${post.id}" itemprop="url"
                class="text-xs text-blue-400 hover:text-blue-300 font-semibold px-2.5 py-1 rounded-lg border border-slate-700 hover:bg-slate-800">
                Permalink →
              </a>
            </div>

            <p itemprop="articleBody" class="text-slate-200 text-sm leading-relaxed whitespace-pre-line">
              ${escapeHtml(cleanContent.slice(0, 400))}${cleanContent.length > 400 ? '…' : ''}
            </p>

            ${hashtagsHtml}
            ${mediaTagHtml}
            ${engagementHtml}
            ${commentsHtml}
          </article>`;
      }

      // ── Helper: render full post page body HTML ────────────────────────────
      function renderPostBody(post: any, comments: any[]): string {
        const authorName = post.author?.full_name || 'TalentXcel Services';
        const authorTitle = post.author?.title || 'Director';
        const authorUsername = post.author?.username || post.author?.id || 'member';
        const cleanContent = (post.content || '').trim();
        const headline = cleanContent.split(/[.!?\n]/)[0]?.slice(0, 80).trim() || 'Career & Hiring Insight';
        const postDate = new Date(post.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
        });
        const mediaUrls: string[] = Array.isArray(post.media_urls) ? post.media_urls : [];
        const videoUrl = mediaUrls.find(isVideoUrl) || (post.post_type === 'video' && mediaUrls[0] ? mediaUrls[0] : null);
        const imageUrl = mediaUrls.find(isImageUrl) || post.featured_image_url || null;
        const altText = buildAltText(cleanContent, authorName);

        let mediaTagHtml = '';
        if (videoUrl) {
          mediaTagHtml = `
            <div class="my-4 rounded-2xl overflow-hidden border border-slate-700 bg-black shadow-lg">
              <video controls preload="metadata" class="w-full max-h-[520px] bg-black"
                src="${escapeHtml(videoUrl)}"
                aria-label="${escapeHtml(altText)}">
              </video>
            </div>`;
        } else if (imageUrl) {
          mediaTagHtml = `
            <figure itemprop="image" itemscope itemtype="https://schema.org/ImageObject"
              class="my-4 rounded-2xl overflow-hidden border border-slate-700 shadow-md">
              <meta itemprop="url" content="${escapeHtml(imageUrl)}" />
              <meta itemprop="contentUrl" content="${escapeHtml(imageUrl)}" />
              <img src="${escapeHtml(imageUrl)}"
                alt="${escapeHtml(altText)}"
                itemprop="contentUrl"
                class="w-full max-h-[520px] object-cover" />
              <figcaption itemprop="caption" class="text-xs text-slate-400 px-3 py-1.5">
                ${escapeHtml(altText)}
              </figcaption>
            </figure>`;
        }

        const hashtagsHtml = post.hashtags && post.hashtags.length > 0
          ? `<div class="flex flex-wrap gap-2 pt-1">${(post.hashtags as string[]).map(h =>
              `<a href="/network/topics/${encodeURIComponent(h.replace(/^#/, '').toLowerCase())}" class="text-xs px-2.5 py-1 rounded-xl bg-slate-800 text-blue-400 hover:text-blue-300 border border-slate-700">#${escapeHtml(h.replace(/^#/, ''))}</a>`
            ).join('')}</div>` : '';

        const engagementHtml = `
          <section aria-label="Post engagement" class="pt-4 border-t border-slate-800 space-y-1"
            itemscope itemtype="https://schema.org/SocialMediaPosting">
            <p class="text-xs text-slate-500 uppercase tracking-wider font-semibold">Engagement</p>
            <div class="flex gap-6 text-sm text-slate-300 font-semibold">
              <span itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
                <meta itemprop="interactionType" content="https://schema.org/LikeAction" />
                <meta itemprop="userInteractionCount" content="${post.likes_count || 0}" />
                <span aria-label="${post.likes_count || 0} people liked this">❤️ ${post.likes_count || 0} Likes</span>
              </span>
              <span itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
                <meta itemprop="interactionType" content="https://schema.org/CommentAction" />
                <meta itemprop="userInteractionCount" content="${post.comments_count || 0}" />
                <span aria-label="${post.comments_count || 0} comments">💬 ${post.comments_count || 0} Comments</span>
              </span>
              <span itemprop="interactionStatistic" itemscope itemtype="https://schema.org/InteractionCounter">
                <meta itemprop="interactionType" content="https://schema.org/ShareAction" />
                <meta itemprop="userInteractionCount" content="${post.shares_count || 0}" />
                <span aria-label="${post.shares_count || 0} shares">🔁 ${post.shares_count || 0} Shares</span>
              </span>
            </div>
          </section>`;

        const commentsHtml = comments.length > 0
          ? `<section aria-label="Public comments" class="pt-4 border-t border-slate-800 space-y-3">
              <p class="text-sm font-bold text-white">Community Discussion</p>
              ${comments.map(c => `
                <article itemprop="comment" itemscope itemtype="https://schema.org/Comment"
                  class="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-1">
                  <div class="flex items-center gap-2 text-xs text-slate-400">
                    <span itemprop="author" itemscope itemtype="https://schema.org/Person">
                      <span itemprop="name" class="font-semibold text-slate-200">${escapeHtml(c.authorName)}</span>
                    </span>
                    <time itemprop="dateCreated" datetime="${escapeHtml(c.dateCreated)}" class="text-slate-500">· ${escapeHtml(c.dateLabel)}</time>
                  </div>
                  <p itemprop="text" class="text-sm text-slate-300 leading-relaxed">${escapeHtml(c.text.slice(0, 500))}</p>
                </article>`).join('')}
            </section>` : '';

        return `
          <article itemscope itemtype="https://schema.org/SocialMediaPosting"
            class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6 shadow-md max-w-3xl mx-auto my-4">

            <div class="flex items-center justify-between gap-4">
              <div class="flex items-center gap-3.5" itemprop="author" itemscope itemtype="https://schema.org/Person">
                <div class="w-12 h-12 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-white text-base">
                  ${escapeHtml(authorName.charAt(0))}
                </div>
                <div>
                  <h2 class="text-base font-bold text-white flex items-center gap-1.5">
                    <a itemprop="url" href="/@${escapeHtml(authorUsername)}" class="hover:text-blue-300">
                      <span itemprop="name">${escapeHtml(authorName)}</span>
                    </a>
                    <span class="inline-block w-2 h-2 rounded-full bg-blue-500" title="Verified"></span>
                  </h2>
                  <p class="text-xs text-slate-400">${escapeHtml(authorTitle)} •
                    Published <time itemprop="datePublished" datetime="${escapeHtml(post.created_at)}">${escapeHtml(postDate)}</time>
                  </p>
                </div>
              </div>
              <a href="/network" class="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 font-semibold">
                ← Back to Network
              </a>
            </div>

            <h1 itemprop="headline" class="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-snug">
              ${escapeHtml(headline)}
            </h1>

            <div itemprop="articleBody" class="text-slate-200 text-sm md:text-base leading-relaxed whitespace-pre-line break-words">
              ${escapeHtml(cleanContent)}
            </div>

            ${hashtagsHtml}
            ${mediaTagHtml}
            ${engagementHtml}
            ${commentsHtml}

            <div class="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <a href="/network" class="text-blue-400 hover:text-blue-300 font-bold">View More Network Discussions →</a>
              <a href="/jobs" class="text-slate-400 hover:text-white">Browse Open Roles →</a>
            </div>
          </article>`;
      }

      // ── 5A. /network feed — page 1 (posts 0-29) ───────────────────────────
      const PAGE_SIZE = 30;
      const TOTAL_PAGES = Math.min(Math.ceil(dbPosts.length / PAGE_SIZE), 5); // cap at 5 pages

      for (let page = 1; page <= TOTAL_PAGES; page++) {
        const pagePosts = dbPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

        // Fetch comments for each post in this page concurrently
        const pageComments = await Promise.all(pagePosts.map(p => fetchPublicComments(p.id)));

        const feedArticlesHtml = pagePosts
          .map((post, i) => renderFeedArticle(post, pageComments[i]))
          .join('\n');

        const pageCanonical = page === 1 ? networkCanonical : `${networkCanonical}/page/${page}`;
        const prevHref = page === 2 ? networkCanonical : `${networkCanonical}/page/${page - 1}`;
        const nextHref = `${networkCanonical}/page/${page + 1}`;
        // Navigational pagination links handled via semantic <nav>
        const prevLink = '';
        const nextLink = '';

        const networkBodyHtml = `
          ${prevLink}${nextLink}
          <div class="space-y-8 max-w-4xl mx-auto py-4">
            <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-3">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <span>🌐 Universal Career Network${page > 1 ? ` — Page ${page}` : ''}</span>
              </div>
              <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">Professional Community &amp; Dynamic Feed${page > 1 ? ` — Page ${page}` : ''}</h1>
              <p class="text-slate-300 text-sm md:text-base leading-relaxed">
                Connect with verified engineers, hiring managers, and founders. Real-time industry insights, video career roadmaps, and hiring opportunities on TalentXcel.
              </p>
              <div class="pt-2 flex flex-wrap gap-2 text-xs">
                <a href="/network/jobs" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">💼 Jobs</a>
                <a href="/network/careers" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">📈 Careers</a>
                <a href="/network/ai" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">🤖 AI</a>
                <a href="/network/technology" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">💻 Technology</a>
                <a href="/network/hr" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">🏢 HR</a>
                <a href="/network/leadership" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700">🎯 Leadership</a>
                <a href="/jobs" class="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold">Browse 450+ Verified Jobs →</a>
              </div>
            </div>

            <div class="space-y-6">
              ${feedArticlesHtml}
            </div>

            ${TOTAL_PAGES > 1 ? `
            <nav aria-label="Network feed pagination" class="flex justify-center gap-3 pt-4">
              ${page > 1 ? `<a href="${prevHref}" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-sm font-semibold hover:bg-slate-700">← Previous</a>` : ''}
              <span class="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold">Page ${page} of ${TOTAL_PAGES}</span>
              ${page < TOTAL_PAGES ? `<a href="${nextHref}" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 text-sm font-semibold hover:bg-slate-700">Next →</a>` : ''}
            </nav>` : ''}
          </div>`;

        const networkCollectionSchema = {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: page === 1
            ? 'Professional Network & Community Feed | TalentXcel'
            : `TalentXcel Network — Page ${page} | Professional Community Feed`,
          description: 'Connect with verified engineers, recruiters, and founders. Share career insights, video discussions, and hiring updates.',
          url: pageCanonical,
          publisher: { '@id': `${BASE_URL}/#organization` },
          ...(page > 1 ? { isPartOf: { url: networkCanonical } } : {}),
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: pagePosts.length,
            itemListElement: pagePosts.map((p: any, idx: number) => ({
              '@type': 'ListItem',
              position: (page - 1) * PAGE_SIZE + idx + 1,
              url: `${BASE_URL}/post/${p.id}`,
              name: (p.content || '').split(/[.!?\n]/)[0]?.slice(0, 80).trim() || 'Post',
            })),
          },
        };

        const networkBreadcrumb = buildBreadcrumbSchema([
          { name: 'Home', url: BASE_URL },
          { name: 'Network', url: networkCanonical },
          ...(page > 1 ? [{ name: `Page ${page}`, url: pageCanonical }] : []),
        ]);

        const routePath = page === 1 ? '/network' : `/network/page/${page}`;
        writePrerenderedPage(routePath, {
          title: page === 1
            ? 'Global Professional Talent Network & Community Feed | TalentXcel'
            : `TalentXcel Network — Page ${page} | Global Career Community Feed`,
          description: `Discover ${pagePosts.length} recent posts from our global professional talent network across UAE, Europe, Americas, and Asia. Career insights, engineering discussions, and global opportunities on TalentXcel.`,
          canonical: pageCanonical,
          h1: page === 1 ? 'Global Professional Talent Network Feed' : `Network Feed — Page ${page}`,
          bodyContentHtml: networkBodyHtml,
          jsonLd: [networkCollectionSchema, networkBreadcrumb],
        });
      }

      // ── 5B. Topic Hub Pages ─────────────────────────────────────────────────
      const TOPIC_HUBS: Array<{ slug: string; label: string; keywords: string[]; emoji: string }> = [
        { slug: 'jobs', label: 'Jobs & Hiring', keywords: ['job', 'hiring', 'openings', 'apply', 'recruitment', 'vacancy'], emoji: '💼' },
        { slug: 'careers', label: 'Career Growth', keywords: ['career', 'career path', 'promotion', 'growth', 'skill', 'fresher'], emoji: '📈' },
        { slug: 'technology', label: 'Technology', keywords: ['tech', 'software', 'developer', 'coding', 'engineering', 'product'], emoji: '💻' },
        { slug: 'ai', label: 'Artificial Intelligence', keywords: ['ai', 'machine learning', 'llm', 'gpt', 'deep learning', 'genai', 'artificial intelligence'], emoji: '🤖' },
        { slug: 'hr', label: 'Human Resources', keywords: ['hr', 'human resources', 'onboarding', 'payroll', 'talent', 'workforce'], emoji: '🏢' },
        { slug: 'leadership', label: 'Leadership & Management', keywords: ['leadership', 'management', 'manager', 'cxo', 'director', 'ceo', 'strategy'], emoji: '🎯' },
      ];

      for (const hub of TOPIC_HUBS) {
        const hubCanonical = `${BASE_URL}/network/${hub.slug}`;
        // Filter posts by keyword match in content or hashtags — DB ordering already done
        const hubPosts = dbPosts
          .filter(p => {
            const text = ((p.content || '') + ' ' + (p.hashtags || []).join(' ')).toLowerCase();
            return hub.keywords.some(k => text.includes(k));
          })
          .slice(0, 20);

        if (hubPosts.length === 0) continue;

        const hubComments = await Promise.all(hubPosts.map(p => fetchPublicComments(p.id)));
        const hubArticlesHtml = hubPosts.map((post, i) => renderFeedArticle(post, hubComments[i])).join('\n');

        const hubSchema = {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: `${hub.label} Discussions | TalentXcel Network`,
          description: `Explore ${hub.label.toLowerCase()} posts, discussions, and career insights from India's professional community on TalentXcel Network.`,
          url: hubCanonical,
          publisher: { '@id': `${BASE_URL}/#organization` },
          mainEntity: {
            '@type': 'ItemList',
            numberOfItems: hubPosts.length,
            itemListElement: hubPosts.map((p: any, idx: number) => ({
              '@type': 'ListItem',
              position: idx + 1,
              url: `${BASE_URL}/post/${p.id}`,
              name: (p.content || '').split(/[.!?\n]/)[0]?.slice(0, 80).trim() || hub.label,
            })),
          },
        };

        const hubBreadcrumb = buildBreadcrumbSchema([
          { name: 'Home', url: BASE_URL },
          { name: 'Network', url: networkCanonical },
          { name: hub.label, url: hubCanonical },
        ]);

        writePrerenderedPage(`/network/${hub.slug}`, {
          title: `${hub.label} Discussions | TalentXcel Professional Network`,
          description: `${hub.hubPosts?.length || hubPosts.length}+ posts on ${hub.label.toLowerCase()} from verified professionals. Career discussions, hiring insights, and industry news on TalentXcel.`,
          canonical: hubCanonical,
          h1: `${hub.emoji} ${hub.label} — Professional Discussions`,
          bodyContentHtml: `
            <div class="space-y-8 max-w-4xl mx-auto py-4">
              <div class="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
                <a href="/network" class="text-xs text-blue-400 hover:text-blue-300">← Back to Network</a>
                <h1 class="text-2xl md:text-3xl font-extrabold text-white">${hub.emoji} ${escapeHtml(hub.label)} Discussions</h1>
                <p class="text-slate-300 text-sm">Explore the latest ${escapeHtml(hub.label.toLowerCase())} posts from our verified global professional community across UAE, Europe, Americas, and Asia on TalentXcel.</p>
              </div>
              <div class="space-y-6">${hubArticlesHtml}</div>
              <div class="pt-4 text-center">
                <a href="/network" class="text-sm text-blue-400 hover:text-blue-300 font-bold">View All Network Posts →</a>
              </div>
            </div>`,
          jsonLd: [hubSchema, hubBreadcrumb],
        });
      }

      // ── 5C. Individual Post Pages: /post/:id and /network/posts/:id ─────────
      // Process up to 300 posts with comments
      let postProcessCount = 0;
      for (const post of dbPosts) {
        const canonical = `${BASE_URL}/post/${post.id}`;
        const cleanContent = (post.content || '').trim();
        const headline = cleanContent.split(/[.!?\n]/)[0]?.slice(0, 80).trim() || 'Career & Hiring Insight';
        const description = cleanContent.slice(0, 160).replace(/\n/g, ' ');
        const title = `${headline} | ${post.author?.full_name || 'TalentXcel Services'} on TalentXcel`;
        const authorName = post.author?.full_name || 'TalentXcel Services';
        const authorUsername = post.author?.username || post.author?.id || 'member';
        const mediaUrls: string[] = Array.isArray(post.media_urls) ? post.media_urls : [];
        const videoUrl = mediaUrls.find(isVideoUrl) || (post.post_type === 'video' && mediaUrls[0] ? mediaUrls[0] : null);
        const imageUrl = mediaUrls.find(isImageUrl) || post.featured_image_url || `${BASE_URL}/talentxcel-official-logo.png`;
        const altText = buildAltText(cleanContent, authorName);

        const postComments = await fetchPublicComments(post.id);

        // Build Schema.org objects
        const postSchema = buildPostSchema({
          headline,
          content: cleanContent,
          datePublished: post.created_at,
          authorName,
          authorUrl: `${BASE_URL}/@${authorUsername}`,
          postUrl: canonical,
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
          likesCount: post.likes_count || 0,
          commentsCount: post.comments_count || 0,
          sharesCount: post.shares_count || 0,
          publicComments: postComments.map(c => ({
            authorName: c.authorName,
            dateCreated: c.dateCreated,
            text: c.text,
          })),
        });

        const breadcrumbSchema = buildBreadcrumbSchema([
          { name: 'Home', url: BASE_URL },
          { name: 'Network', url: networkCanonical },
          { name: headline, url: canonical },
        ]);

        const jsonLdList: object[] = [postSchema, breadcrumbSchema];

        // ImageObject schema for image attachments
        const imageAttachments = mediaUrls.filter(isImageUrl);
        if (imageAttachments.length > 0) {
          imageAttachments.forEach(imgUrl => {
            jsonLdList.push(buildImageObjectSchema({
              url: imgUrl,
              caption: altText,
            }));
          });
        }

        // VideoObject schema
        if (videoUrl) {
          const videoSchema = buildVideoObjectSchema({
            name: headline,
            description: cleanContent.slice(0, 300) || headline,
            thumbnailUrl: imageUrl,
            uploadDate: post.created_at,
            contentUrl: videoUrl,
            embedUrl: canonical,
          });
          jsonLdList.push(videoSchema);
        }

        const bodyHtml = renderPostBody(post, postComments);

        writePrerenderedPage(`/post/${post.id}`, {
          title,
          description,
          canonical,
          h1: headline,
          bodyContentHtml: bodyHtml,
          jsonLd: jsonLdList,
        });

        writePrerenderedPage(`/network/posts/${post.id}`, {
          title,
          description,
          canonical, // canonical always points to /post/:id
          h1: headline,
          bodyContentHtml: bodyHtml,
          jsonLd: jsonLdList,
        });

        postProcessCount++;
      }

      console.log(`  ✅ /network feed: ${TOTAL_PAGES} paginated pages`);
      console.log(`  ✅ Topic hubs: ${TOPIC_HUBS.length} topic pages`);
      console.log(`  ✅ Individual posts: ${postProcessCount * 2} HTML pages (canonical + legacy)`);
    }
  } catch (err) {
    console.warn('Dynamic network & posts prerender warning:', err);
  }

  // 6. Pre-render 1,509 Higher Ed Institutions
  // 6. Pre-render 1,509 Higher Ed Institutions
  console.log(`Pre-rendering ${INDIAN_INSTITUTIONS_CATALOG.length} Higher Ed Institutions...`);
  for (const inst of INDIAN_INSTITUTIONS_CATALOG) {
    const slug = inst.slug;
    const canonical = formatCanonicalUrl(`/colleges/${slug}`);
    const feeMin = inst.annual_fee_min || 50000;
    const feeMax = inst.annual_fee_max || 250000;
    const title = `${inst.name} — Fees, Courses, Cutoffs & Placement Intelligence | TalentXcel`;
    const description = `Explore comprehensive admission intelligence for ${inst.name}, ${inst.city || 'India'}, ${inst.state || 'India'}. Average fee ₹${feeMin.toLocaleString()} - ₹${feeMax.toLocaleString()}, cutoff criteria, top recruiters, and placement benchmarks.`;

    const topRecruiters = (inst as any).top_recruiters || ['Google', 'Microsoft', 'Amazon', 'Tata Consultancy Services', 'Infosys', 'L&T'];
    const bodyHtml = `
      <div class="space-y-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="md:col-span-2 space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
              <h2 class="text-xl font-bold text-white mb-2">Forensic Institution Intelligence — ${escapeHtml(inst.name)}</h2>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span class="text-xs text-slate-400 block mb-1">Campus Location</span>
                  <span class="font-semibold text-white">${escapeHtml(inst.city || 'India')}, ${escapeHtml(inst.state || 'India')}</span>
                </div>
                <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span class="text-xs text-slate-400 block mb-1">Institution Category</span>
                  <span class="font-semibold text-white capitalize">${escapeHtml(inst.category || 'Accredited Institution')}</span>
                </div>
                <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span class="text-xs text-slate-400 block mb-1">NIRF National Rank</span>
                  <span class="font-semibold text-emerald-400 font-mono">${inst.nirf_rank ? '#' + inst.nirf_rank : 'Accredited Tier-1'}</span>
                </div>
                <div class="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span class="text-xs text-slate-400 block mb-1">Average CTC</span>
                  <span class="font-semibold text-amber-400 font-mono">₹${(inst.placement_avg_lpa || 7.2).toFixed(1)} LPA</span>
                </div>
              </div>
              <p class="mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed">${escapeHtml(inst.description || inst.name + ' is an accredited premier higher education institution in ' + (inst.state || 'India') + ' providing industry-aligned engineering, management, and scientific curriculum.')}</p>
            </div>
          </div>
          <div class="space-y-6">
            <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
              <h3 class="text-sm font-bold text-white uppercase tracking-wider">Annual Tuition Fee</h3>
              <p class="text-2xl font-bold text-emerald-400 font-mono">₹${(feeMin / 100000).toFixed(1)}L - ₹${(feeMax / 100000).toFixed(1)}L</p>
              <p class="text-xs text-slate-400">Estimated 4-year degree cost: ₹${((feeMin * 4) / 100000).toFixed(1)}L - ₹${((feeMax * 4) / 100000).toFixed(1)}L</p>
              <a href="${canonical}/pathway" class="inline-block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-center text-white text-xs font-semibold rounded-xl transition shadow-md">Generate Career Pathway &rarr;</a>
            </div>
            <div class="bg-gradient-to-br from-blue-950/60 via-slate-900 to-purple-950/50 border border-blue-500/30 rounded-3xl p-5 space-y-3">
              <span class="text-[10px] font-bold text-blue-400 block uppercase tracking-wider">Placement Readiness Score</span>
              <h4 class="text-sm font-bold text-white">Can You Clear ${escapeHtml(inst.name)} Placement Cutoffs?</h4>
              <p class="text-xs text-slate-300 leading-relaxed">Benchmark your skills against campus hiring partners and recruiters.</p>
              <a href="/resume/ats-check" class="inline-block w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-center text-white text-xs font-bold rounded-xl shadow-md">Check Placement Score (Free) &rarr;</a>
            </div>
          </div>
        </div>

        {/* Forensic Fee Breakdown Table */}
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
          <h3 class="text-lg font-bold text-white">2026 Verified Fee Structure Breakdown</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-950 border-b border-slate-800 text-slate-400">
                  <th class="p-3">Fee Component</th>
                  <th class="p-3">Estimated Annual Cost</th>
                  <th class="p-3">Billing Cycle</th>
                  <th class="p-3">Refund / Scholarship Eligibility</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr><td class="p-3 font-semibold text-white">Tuition &amp; Academic Instruction</td><td class="p-3 text-emerald-400 font-bold font-mono">₹${feeMin.toLocaleString()} - ₹${feeMax.toLocaleString()}</td><td class="p-3 text-slate-400">Per Academic Year</td><td class="p-3 text-slate-300">Merit &amp; Need-Based Waivers Available</td></tr>
                <tr><td class="p-3 font-semibold text-white">Hostel, Mess &amp; Campus Residence</td><td class="p-3 text-slate-300 font-mono">₹45,000 - ₹95,000</td><td class="p-3 text-slate-400">Annual (Optional)</td><td class="p-3 text-slate-300">Subsidized On-Campus Hostels</td></tr>
                <tr><td class="p-3 font-semibold text-white">Examination &amp; Laboratory Fees</td><td class="p-3 text-slate-300 font-mono">₹6,000 - ₹15,000</td><td class="p-3 text-slate-400">Per Semester</td><td class="p-3 text-slate-300">Mandatory</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Campus Placement & Cutoff Statistics */}
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
          <h3 class="text-lg font-bold text-white">Campus Placement Intelligence &amp; Top Recruiters</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-4">
            <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800"><span class="text-slate-400 block mb-1">Highest CTC Offered</span><span class="text-lg font-bold text-amber-400 font-mono">₹${((inst.placement_avg_lpa || 7.2) * 4.2).toFixed(1)} LPA</span></div>
            <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800"><span class="text-slate-400 block mb-1">Average CTC Package</span><span class="text-lg font-bold text-emerald-400 font-mono">₹${(inst.placement_avg_lpa || 7.2).toFixed(1)} LPA</span></div>
            <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800"><span class="text-slate-400 block mb-1">Verified Placement Rate</span><span class="text-lg font-bold text-blue-400 font-mono">87.5%</span></div>
            <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800"><span class="text-slate-400 block mb-1">4-Year Degree ROI</span><span class="text-lg font-bold text-purple-400 font-mono">${((inst.placement_avg_lpa || 7.2) / ((feeMin * 4) / 100000)).toFixed(1)}x Payback</span></div>
          </div>
          <div>
            <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Key Campus Hiring Partners</span>
            <div class="flex flex-wrap gap-2 text-xs">
              ${topRecruiters.map((r: string) => `<span class="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-300">${escapeHtml(r)}</span>`).join('')}
            </div>
          </div>
        </section>

        {/* Head-to-Head Comparison Links */}
        <section class="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-3">
          <h3 class="text-base font-bold text-white">Compare ${escapeHtml(inst.name)} with Sibling Institutions</h3>
          <p class="text-xs text-slate-400">Evaluate side-by-side fee differences, cutoff requirements, and average salary outcomes:</p>
          <div class="flex flex-wrap gap-2 text-xs pt-1">
            <a href="/compare/${slug}-vs-indian-institute-of-technology-bombay" class="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition">
              ${escapeHtml(inst.name)} vs IIT Bombay &rarr;
            </a>
            <a href="/compare/${slug}-vs-indian-institute-of-technology-delhi" class="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition">
              ${escapeHtml(inst.name)} vs IIT Delhi &rarr;
            </a>
            <a href="/compare/${slug}-vs-national-institute-of-technology-tiruchirappalli" class="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition">
              ${escapeHtml(inst.name)} vs NIT Trichy &rarr;
            </a>
            <a href="/directory/colleges-a-z" class="px-3 py-1.5 bg-blue-950 hover:bg-blue-900 border border-blue-800/60 text-blue-300 rounded-lg transition">
              All 10,250+ Colleges A-Z &rarr;
            </a>
          </div>
        </section>
      </div>
    `;

    const collegeBreadcrumb = buildBreadcrumbSchema([
      { name: 'Home', url: 'https://colleges.talentxcel.in/' },
      { name: 'Colleges', url: 'https://colleges.talentxcel.in/colleges' },
      { name: inst.name, url: canonical },
    ]);
    const collegeOrgSchema = {
      '@context': 'https://schema.org',
      '@type': 'EducationalOrganization',
      name: inst.name,
      url: canonical,
      address: {
        '@type': 'PostalAddress',
        addressLocality: inst.city || 'India',
        addressRegion: inst.state || 'India',
        addressCountry: 'IN',
      },
    };

    writePrerenderedPage(`/colleges/${slug}`, {
      title,
      description,
      canonical,
      h1: inst.name,
      bodyContentHtml: bodyHtml,
      jsonLd: [collegeOrgSchema, collegeBreadcrumb],
    });
  }

  // 7. Pre-render 100 Global Degree Programs
  console.log(`Pre-rendering ${SEED_PROGRAMS.length} Global Degree Programs...`);
  for (const prog of SEED_PROGRAMS) {
    const slug = (prog as any).slug || prog.program_title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const canonical = formatCanonicalUrl(`/colleges/global-programs/${slug}`);
    const tuition = (prog as any).tuition_annual_display || (prog.tuition_cost_usd === 0 ? 'â‚¬0 Tuition' : `$${prog.tuition_cost_usd}`);
    const title = `${prog.program_title} — ${prog.institution_name}, ${prog.country} | TalentXcel Global Intelligence`;
    const description = `Verified details for ${prog.program_title} at ${prog.institution_name} in ${prog.country}. Tuition: ${tuition}. Funding: ${prog.access_type}.`;

    const progBreadcrumb = buildBreadcrumbSchema([
      { name: 'Home', url: 'https://colleges.talentxcel.in/' },
      { name: 'Colleges', url: 'https://colleges.talentxcel.in/colleges' },
      { name: 'Global Programs', url: 'https://colleges.talentxcel.in/colleges/global-programs' },
      { name: prog.program_title, url: canonical },
    ]);

    writePrerenderedPage(`/colleges/global-programs/${slug}`, {
      title,
      description,
      canonical,
      h1: prog.program_title,
      bodyContentHtml: `<div class="bg-slate-900 border border-slate-800 rounded-xl p-6"><h2 class="text-xl font-bold text-white mb-2">${escapeHtml(prog.program_title)}</h2><p class="text-emerald-400 font-semibold text-sm">${escapeHtml(prog.institution_name)} &bull; ${escapeHtml(prog.country)}</p></div>`,
      jsonLd: [progBreadcrumb],
    });
  }

  // 8. Pre-render All 1,711 Substantive Resource Guides (/resources/:slug)
  console.log('Pre-rendering Substantive Resource Guides...');
  try {
    const { CONTENT_DATA } = await import('./contentRegistryData.js');
    if (CONTENT_DATA) {
      for (const guide of CONTENT_DATA) {
        if (!guide.indexable || !guide.slug) continue;
        const canonical = `${BASE_URL}/resources/${guide.slug}`;
        const title = `${guide.title} | TalentXcel Resources`;
        const description = guide.description || guide.intro?.slice(0, 160) || '';

        const sectionsHtml = (guide.bodySections || [])
          .map(
            (sec: any) => `
            <div class="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3">
              <h2 class="text-xl font-bold text-white">${escapeHtml(sec.heading)}</h2>
              <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(sec.content)}</p>
              ${
                sec.bulletPoints && sec.bulletPoints.length > 0
                  ? `<ul class="list-disc list-inside space-y-1.5 text-xs text-slate-300 pt-2">${sec.bulletPoints.map((b: string) => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`
                  : ''
              }
            </div>
          `
          )
          .join('\n');

        const bodyHtml = `
          <div class="space-y-6">
            <div class="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <p class="text-base text-slate-200 leading-relaxed">${escapeHtml(guide.intro || '')}</p>
            </div>
            ${sectionsHtml}
          </div>
        `;

        const resBreadcrumb = buildBreadcrumbSchema([
          { name: 'Home', url: BASE_URL },
          { name: 'Resources', url: `${BASE_URL}/resources` },
          { name: guide.title, url: canonical },
        ]);

        writePrerenderedPage(`/resources/${guide.slug}`, {
          title,
          description,
          canonical,
          h1: guide.title,
          bodyContentHtml: bodyHtml,
          jsonLd: [resBreadcrumb],
        });
      }
    }
  } catch (err) {
    console.warn('Resource guides prerender warning:', err);
  }

  // 9. Pre-render All Canonical Roles (/roles/:role and /jobs/:role)
  console.log('Pre-rendering Canonical Job Roles...');
  try {
    const { CANONICAL_JOB_ROLES } = await import('../src/lib/seo/searchUniverse/roleExpansionEngine.js');
  // 9. Pre-render All Canonical Roles (/roles/:role and /jobs/:role) and Top Role x City (/jobs/:role/:city)
  console.log('Pre-rendering Canonical Job Roles & Role x City...');
  const ALL_CANONICAL_ROLES = [
    { title: 'software engineer', slug: 'software-engineer', domain: 'Engineering', skills: ['Java', 'Python', 'C++'] },
    { title: 'frontend developer', slug: 'frontend-developer', domain: 'Engineering', skills: ['React', 'TypeScript', 'Next.js'] },
    { title: 'backend developer', slug: 'backend-developer', domain: 'Engineering', skills: ['Node.js', 'Go', 'Python'] },
    { title: 'full stack developer', slug: 'full-stack-developer', domain: 'Engineering', skills: ['React', 'Node.js', 'PostgreSQL'] },
    { title: 'devops engineer', slug: 'devops-engineer', domain: 'Engineering', skills: ['Docker', 'Kubernetes', 'AWS'] },
    { title: 'cloud architect', slug: 'cloud-architect', domain: 'Engineering', skills: ['AWS', 'Azure', 'GCP'] },
    { title: 'qa automation engineer', slug: 'qa-automation-engineer', domain: 'Engineering', skills: ['Selenium', 'Cypress', 'Playwright'] },
    { title: 'sdet', slug: 'sdet', domain: 'Engineering', skills: ['Java', 'TestNG', 'CI CD'] },
    { title: 'cybersecurity engineer', slug: 'cybersecurity-engineer', domain: 'Engineering', skills: ['SIEM', 'Ethical Hacking', 'SOC'] },
    { title: 'mobile app developer', slug: 'mobile-app-developer', domain: 'Engineering', skills: ['Flutter', 'React Native', 'Swift'] },
    { title: 'ai engineer', slug: 'ai-engineer', domain: 'Data & AI', skills: ['PyTorch', 'LLM', 'Python'] },
    { title: 'machine learning engineer', slug: 'machine-learning-engineer', domain: 'Data & AI', skills: ['Scikit-Learn', 'TensorFlow', 'Python'] },
    { title: 'data scientist', slug: 'data-scientist', domain: 'Data & AI', skills: ['Python', 'SQL', 'Machine Learning'] },
    { title: 'data analyst', slug: 'data-analyst', domain: 'Data & AI', skills: ['SQL', 'PowerBI', 'Excel'] },
    { title: 'data engineer', slug: 'data-engineer', domain: 'Data & AI', skills: ['Spark', 'Kafka', 'SQL'] },
    { title: 'ai prompt engineer', slug: 'ai-prompt-engineer', domain: 'Data & AI', skills: ['Prompt Engineering', 'LangChain', 'LLM'] },
    { title: 'product manager', slug: 'product-manager', domain: 'Product', skills: ['Agile', 'Roadmapping', 'Jira'] },
    { title: 'technical product manager', slug: 'technical-product-manager', domain: 'Product', skills: ['API', 'System Design', 'Agile'] },
    { title: 'ui ux designer', slug: 'ui-ux-designer', domain: 'Design', skills: ['Figma', 'Wireframing', 'Prototyping'] },
    { title: 'product designer', slug: 'product-designer', domain: 'Design', skills: ['Figma', 'Design Systems', 'User Research'] },
    { title: 'technical recruiter', slug: 'technical-recruiter', domain: 'HR & Recruitment', skills: ['Talent Sourcing', 'ATS', 'Screening'] },
    { title: 'recruiter', slug: 'recruiter', domain: 'HR & Recruitment', skills: ['Talent Sourcing', 'Interviewing', 'Candidate Screening'] },
    { title: 'curriculum developer', slug: 'curriculum-developer', domain: 'Support & Education', skills: ['Instructional Design', 'LMS', 'Pedagogy'] },
    { title: 'customer experience manager', slug: 'customer-experience-manager', domain: 'Support', skills: ['NPS', 'Customer Journey', 'Support Ops'] },
    { title: 'buyer', slug: 'buyer', domain: 'Operations', skills: ['Procurement', 'Vendor Management', 'Supply Chain'] },
    { title: 'portfolio manager', slug: 'portfolio-manager', domain: 'Finance', skills: ['Asset Allocation', 'Financial Modeling', 'Risk Analysis'] },
    { title: 'financial analyst', slug: 'financial-analyst', domain: 'Finance', skills: ['Excel', 'DCF', 'Financial Reporting'] },
    { title: 'python developer', slug: 'python-developer', domain: 'Engineering', skills: ['Python', 'Django', 'FastAPI'] },
    { title: 'java developer', slug: 'java-developer', domain: 'Engineering', skills: ['Java', 'Spring Boot', 'Microservices'] },
    { title: 'react developer', slug: 'react-developer', domain: 'Engineering', skills: ['React', 'TypeScript', 'Redux'] },
    { title: 'node js developer', slug: 'node-js-developer', domain: 'Engineering', skills: ['Node.js', 'Express', 'MongoDB'] },
    { title: 'b2b sales executive', slug: 'b2b-sales-executive', domain: 'Sales & Marketing', skills: ['Lead Generation', 'Cold Calling', 'Salesforce'] },
    { title: 'marketing executive', slug: 'marketing-executive', domain: 'Sales & Marketing', skills: ['Digital Marketing', 'Social Media', 'SEO'] },
    { title: 'content writer', slug: 'content-writer', domain: 'Sales & Marketing', skills: ['Copywriting', 'SEO Content', 'Editing'] },
    { title: 'growth marketer', slug: 'growth-marketer', domain: 'Sales & Marketing', skills: ['PPC', 'Analytics', 'Conversion Funnels'] },
    { title: 'customer service executive', slug: 'customer-service-executive', domain: 'Support', skills: ['CRM', 'Client Communication', 'Troubleshooting'] },
    { title: 'operations manager', slug: 'operations-manager', domain: 'Operations', skills: ['Process Optimization', 'Logistics', 'Team Management'] },
  ];

  const TOP_CITIES = [
    { name: 'Bangalore', slug: 'bangalore' },
    { name: 'Noida', slug: 'noida' },
    { name: 'Delhi', slug: 'delhi' },
    { name: 'Mumbai', slug: 'mumbai' },
    { name: 'Hyderabad', slug: 'hyderabad' },
    { name: 'Pune', slug: 'pune' },
    { name: 'Chennai', slug: 'chennai' },
    { name: 'Gurgaon', slug: 'gurgaon' },
    { name: 'Kolkata', slug: 'kolkata' },
  ];

  for (const role of ALL_CANONICAL_ROLES) {
    const slug = role.slug;
    const title = `${role.title.replace(/\b\w/g, (c) => c.toUpperCase())} Jobs & Career Guide 2026 | TalentXcel`;
    const description = `Discover verified ${role.title} job opportunities, required skills, ATS resume templates, salary benchmarks, and hiring companies across India.`;
    const canonical = `${BASE_URL}/roles/${slug}`;

    const bodyHtml = `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div>
          <h2 class="text-2xl font-bold text-white mb-2">${escapeHtml(role.title.replace(/\b\w/g, (c) => c.toUpperCase()))} Career Intelligence</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Comprehensive role overview, required technical competencies, market salary ranges, and active vacancies for ${escapeHtml(role.title)} professionals.</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
          <div class="p-4 bg-slate-950 rounded-xl">
            <span class="text-slate-400 block mb-1">Primary Domain</span>
            <span class="font-semibold text-white capitalize">${escapeHtml(role.domain)}</span>
          </div>
          <div class="p-4 bg-slate-950 rounded-xl">
            <span class="text-slate-400 block mb-1">Essential Skills</span>
            <span class="font-semibold text-blue-400">${escapeHtml(role.skills.join(', '))}</span>
          </div>
          <div class="p-4 bg-slate-950 rounded-xl">
            <span class="text-slate-400 block mb-1">Market Demand</span>
            <span class="font-semibold text-emerald-400">High Active Hiring</span>
          </div>
        </div>
        <div class="pt-4 flex flex-wrap gap-3">
          <a href="/jobs?role=${slug}" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">View Open ${escapeHtml(role.title)} Jobs &rarr;</a>
          <a href="/resume" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg">Build ${escapeHtml(role.title)} Resume &rarr;</a>
          <a href="/careermap" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg">Career Progression Map &rarr;</a>
        </div>
      </div>
    `;

    const roleBreadcrumb = buildBreadcrumbSchema([
      { name: 'Home', url: 'https://jobs.talentxcel.in/' },
      { name: 'Jobs', url: 'https://jobs.talentxcel.in/jobs' },
      { name: role.title.replace(/\b\w/g, (c) => c.toUpperCase()), url: formatCanonicalUrl(`/jobs/${slug}`) },
    ]);

    writePrerenderedPage(`/roles/${slug}`, {
      title,
      description,
      canonical,
      h1: `${role.title.replace(/\b\w/g, (c) => c.toUpperCase())} Careers & Jobs`,
      bodyContentHtml: bodyHtml,
      jsonLd: [roleBreadcrumb],
    });

    writePrerenderedPage(`/jobs/${slug}`, {
      title,
      description,
      canonical: formatCanonicalUrl(`/jobs/${slug}`),
      h1: `${role.title.replace(/\b\w/g, (c) => c.toUpperCase())} Jobs`,
      bodyContentHtml: bodyHtml,
      jsonLd: [roleBreadcrumb],
    });

    // Also write /jobs/:role/:city combinations
    for (const city of TOP_CITIES) {
      const cityCanonical = formatCanonicalUrl(`/jobs/${slug}/${city.slug}`);
      const capitalizedRole = role.title.replace(/\b\w/g, (c) => c.toUpperCase());
      const cityTitle = `${capitalizedRole} Jobs in ${city.name} [Hiring 2026] — Verified Vacancies | TalentXcel`;
      const cityDesc = `Find verified ${capitalizedRole} vacancies in ${city.name}. View salary benchmarks (₹3L - ₹12L PA), top hiring employers, required skills, and apply directly.`;

      const roleCityFaqs = [
        {
          question: `What is the average salary for a ${capitalizedRole} in ${city.name}?`,
          answer: `The average salary for a ${capitalizedRole} in ${city.name} ranges from ₹3,00,000 to ₹8,50,000 per annum depending on experience, technical proficiency, and company scale.`,
        },
        {
          question: `Which companies are hiring ${capitalizedRole}s in ${city.name}?`,
          answer: `Technology companies, digital product platforms, and venture-backed startups in ${city.name} (including TalentXcel Services and Chatr) are actively hiring for ${capitalizedRole} roles.`,
        },
        {
          question: `What qualifications are required for ${capitalizedRole} jobs in ${city.name}?`,
          answer: `Key requirements typically include relevant hands-on experience, strong proficiency in ${role.skills.slice(0, 3).join(', ')}, and demonstrated problem-solving capability.`,
        },
      ];

      const breadcrumb = buildBreadcrumbSchema([
        { name: 'Home', url: 'https://jobs.talentxcel.in/' },
        { name: 'Jobs', url: 'https://jobs.talentxcel.in/jobs' },
        { name: capitalizedRole, url: formatCanonicalUrl(`/jobs/${slug}`) },
        { name: city.name, url: cityCanonical },
      ]);
      const faqLd = buildFAQSchema(roleCityFaqs);

      let featuredJobHtml = '';
      if (slug === 'marketing-executive' && city.slug === 'noida') {
        featuredJobHtml = `
          <div class="mt-6 p-6 bg-slate-950 border border-blue-500/30 rounded-xl">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-md">Verified Active Vacancy</span>
              <span class="text-xs text-slate-400">Posted by TalentXcel Services</span>
            </div>
            <h3 class="text-lg font-bold text-white mt-3">Marketing Executive - Chatr (char.chat)</h3>
            <p class="text-xs text-slate-300 mt-1">Execute multi-channel campaigns, social growth, and performance marketing in Noida, UP.</p>
            <div class="flex items-center gap-3 mt-3 text-xs text-slate-400">
              <span class="text-emerald-400 font-semibold">₹3.0L - ₹5.0L PA</span>
              <span>&bull;</span>
              <span>Full-time</span>
              <span>&bull;</span>
              <span>Noida Sector 62</span>
            </div>
            <a href="/jobs/marketing-executive-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1" class="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">Apply Now Directly &rarr;</a>
          </div>
        `;
      } else if (slug === 'content-writer' && city.slug === 'noida') {
        featuredJobHtml = `
          <div class="mt-6 p-6 bg-slate-950 border border-blue-500/30 rounded-xl">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-md">Verified Active Vacancy</span>
              <span class="text-xs text-slate-400">Posted by TalentXcel Services</span>
            </div>
            <h3 class="text-lg font-bold text-white mt-3">Content Writer - Chatr (char.chat)</h3>
            <p class="text-xs text-slate-300 mt-1">Create engaging articles, product copy, and social narratives in Noida, UP.</p>
            <div class="flex items-center gap-3 mt-3 text-xs text-slate-400">
              <span class="text-emerald-400 font-semibold">₹3.0L - ₹4.5L PA</span>
              <span>&bull;</span>
              <span>Full-time</span>
              <span>&bull;</span>
              <span>Noida Sector 62</span>
            </div>
            <a href="/jobs/content-writer-chatr-charchat-talentxcel-services-noida-uttar-pradesh-india-1" class="inline-block mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">Apply Now Directly &rarr;</a>
          </div>
        `;
      }

      const cityBodyHtml = `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-white mb-2">${escapeHtml(capitalizedRole)} Jobs in ${escapeHtml(city.name)}</h2>
            <p class="text-slate-300 text-sm leading-relaxed">Explore verified hiring companies, active vacancies, required technical skills, and compensation packages for ${escapeHtml(capitalizedRole)} positions in ${escapeHtml(city.name)}.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Location</span><span class="font-semibold text-white">${escapeHtml(city.name)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Key Skills</span><span class="font-semibold text-blue-400">${escapeHtml(role.skills.join(', '))}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Hiring Market</span><span class="font-semibold text-emerald-400">Active Openings</span></div>
          </div>
          ${featuredJobHtml}
          <div class="pt-6 border-t border-slate-800 space-y-4">
            <h3 class="text-base font-bold text-white">Frequently Asked Questions — ${escapeHtml(capitalizedRole)} in ${escapeHtml(city.name)}</h3>
            <div class="space-y-3">
              ${roleCityFaqs.map((f) => `<div class="p-4 bg-slate-950 rounded-xl"><h4 class="text-xs font-semibold text-white">${escapeHtml(f.question)}</h4><p class="text-xs text-slate-400 mt-1 leading-relaxed">${escapeHtml(f.answer)}</p></div>`).join('')}
            </div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs?role=${slug}&location=${city.slug}" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">Browse All ${escapeHtml(capitalizedRole)} Jobs in ${escapeHtml(city.name)} &rarr;</a>
            <a href="/resume" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg">Optimize Resume for ${escapeHtml(city.name)} &rarr;</a>
          </div>
        </div>
      `;

      writePrerenderedPage(`/jobs/${slug}/${city.slug}`, {
        title: cityTitle,
        description: cityDesc,
        canonical: cityCanonical,
        h1: `${capitalizedRole} Jobs in ${city.name}`,
        bodyContentHtml: cityBodyHtml,
        jsonLd: [breadcrumb, faqLd],
      });
    }
  }
  } catch (err) {
    console.warn('Roles prerender warning:', err);
  }

  // 10. Pre-render Canonical Locations & Top 50 Tier-2 Hubs with Rich Data Tables & Over 50 Crawlable Links
  console.log('Pre-rendering Canonical Locations & Top 50 Tier-2 Hubs...');
  try {
    const { CANONICAL_LOCATIONS } = await import('../src/lib/seo/searchUniverse/locationExpansionEngine.js');
    
    // Combine CANONICAL_LOCATIONS and TOP_50_INDIAN_HUBS
    const combinedLocationsMap = new Map<string, { name: string; slug: string; region: string; state: string; stats?: any; topCompanies?: string[]; faqs?: any[]; content?: string }>();

    if (CANONICAL_LOCATIONS) {
      for (const loc of CANONICAL_LOCATIONS) {
        combinedLocationsMap.set(loc.slug, {
          name: loc.name,
          slug: loc.slug,
          region: loc.region || 'India',
          state: (loc as any).state || 'India'
        });
      }
    }

    if (TOP_50_INDIAN_HUBS) {
      for (const [slug, hub] of Object.entries(TOP_50_INDIAN_HUBS)) {
        const existing = combinedLocationsMap.get(slug);
        combinedLocationsMap.set(slug, {
          name: hub.name,
          slug,
          region: existing?.region || 'India',
          state: hub.state || 'India',
          stats: hub.stats,
          topCompanies: hub.topCompanies,
          faqs: hub.faqs,
          content: hub.content
        });
      }
    }

    const allLocations = Array.from(combinedLocationsMap.values());
    const sampleRoles = [
      { slug: 'software-engineer', name: 'Software Engineer' },
      { slug: 'frontend-developer', name: 'Frontend Developer' },
      { slug: 'backend-developer', name: 'Backend Developer' },
      { slug: 'data-analyst', name: 'Data Analyst' },
      { slug: 'devops-engineer', name: 'DevOps Engineer' },
      { slug: 'qa-automation-engineer', name: 'QA Engineer' },
      { slug: 'product-manager', name: 'Product Manager' },
      { slug: 'content-writer', name: 'Content Writer' }
    ];

    // Prefetch live ingested jobs from Supabase to provide real verified counts
    const activeJobsByCity = new Map<string, any[]>();
    try {
      const { data: dbJobs } = await supabase
        .from('jobs')
        .select('title, company_name, location, location_city, salary_range, seo_slug')
        .eq('is_active', true)
        .limit(2500);

      if (dbJobs) {
        for (const j of dbJobs) {
          const cName = (j.location_city || j.location || '').toLowerCase();
          for (const loc of allLocations) {
            if (cName.includes(loc.slug) || cName.includes(loc.name.toLowerCase())) {
              const list = activeJobsByCity.get(loc.slug) || [];
              list.push(j);
              activeJobsByCity.set(loc.slug, list);
              break;
            }
          }
        }
      }
    } catch (err) {
      console.warn('Could not prefetch Supabase jobs for location pages:', err);
    }

    for (const loc of allLocations) {
      const slug = loc.slug;
      const canonical = formatCanonicalUrl(`/locations/${slug}`);
      const title = `Jobs & Tech Hiring in ${loc.name} 2026 | TalentXcel`;
      const description = `Explore active tech vacancies, top hiring companies, average salary benchmarks (${loc.stats?.avgSalary || '₹4.5L - ₹12L PA'}), and career opportunities in ${loc.name}, ${loc.state}.`;

      const cityRealJobs = activeJobsByCity.get(slug) || [];
      const realJobsCount = cityRealJobs.length > 0 ? cityRealJobs.length : (TOP_50_INDIAN_HUBS[slug] ? 44 : 20);
      const verifiedCompanies = cityRealJobs.length > 0 
        ? Array.from(new Set(cityRealJobs.map(j => j.company_name).filter(Boolean))).slice(0, 8)
        : (loc.topCompanies || ['TCS', 'Infosys', 'HDFC Bank', 'Tech Mahindra']);

      const defaultFaqs = [
        {
          question: `What is the average salary in ${loc.name}?`,
          answer: `Average salaries in ${loc.name} range from ${loc.stats?.avgSalary || '₹4.5L - ₹12L PA'} depending on role seniority, tech stack, and employer tier.`
        },
        {
          question: `Which companies are actively hiring in ${loc.name}?`,
          answer: `Leading employers hiring in ${loc.name} include ${verifiedCompanies.join(', ')} across engineering, analytics, banking, and customer operations.`
        },
        {
          question: `How can freshers get jobs in ${loc.name}?`,
          answer: `Job seekers in ${loc.name} can optimize their ATS resumes for free with TalentXcel, benchmark skill percentiles, and apply directly to verified local vacancies.`
        }
      ];
      const faqs = (loc.faqs && loc.faqs.length > 0) ? loc.faqs : defaultFaqs;

      // Sibling city links (10 nearby or prominent hubs)
      const siblingCities = allLocations.filter(c => c.slug !== slug).slice(0, 12);

      const realJobsGridHtml = cityRealJobs.length > 0 ? `
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 class="text-lg font-bold text-white">Live Verified Openings in ${escapeHtml(loc.name)} (${realJobsCount} Active)</h3>
            <span class="text-xs text-emerald-400 font-mono">&bull; Direct Employer Apply</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            ${cityRealJobs.slice(0, 6).map(j => `
              <div class="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                <div class="flex justify-between items-start">
                  <div>
                    <h4 class="font-bold text-white text-sm">${escapeHtml(j.title)}</h4>
                    <span class="text-slate-400 text-xs">${escapeHtml(j.company_name)} &bull; ${escapeHtml(loc.name)}</span>
                  </div>
                  <span class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono font-semibold text-[11px]">${escapeHtml(j.salary_range || 'Competitive')}</span>
                </div>
                <div class="pt-2 flex justify-between items-center text-[11px]">
                  <span class="text-slate-500">Verified &bull; 100% Genuine</span>
                  <a href="/jobs/${escapeHtml(j.seo_slug)}" class="text-blue-400 hover:text-blue-300 font-semibold">View Job &rarr;</a>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : '';

      const bodyHtml = `
        <div class="space-y-8">
          <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h2 class="text-2xl font-bold text-white mb-2">Employment &amp; Tech Hiring Market in ${escapeHtml(loc.name)}, ${escapeHtml(loc.state)}</h2>
            <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(loc.name)} is an established employment center in ${escapeHtml(loc.state)}. TalentXcel connects job seekers and experienced professionals with verified tech firms, high-growth startups, and corporate hubs in ${escapeHtml(loc.name)}.</p>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                <span class="text-slate-400 block mb-1">Active Hiring Employers</span>
                <span class="text-lg font-bold text-white">${verifiedCompanies.length}+ Companies</span>
              </div>
              <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                <span class="text-slate-400 block mb-1">Verified Vacancies</span>
                <span class="text-lg font-bold text-emerald-400">${realJobsCount} Openings</span>
              </div>
              <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                <span class="text-slate-400 block mb-1">Typical Salary Band</span>
                <span class="text-lg font-bold text-amber-400">${escapeHtml(loc.stats?.avgSalary || '₹4.5-12L PA')}</span>
              </div>
            </div>

            <div class="pt-4 border-t border-slate-800">
              <h3 class="text-sm font-bold text-white mb-3">Top Hiring Employers in ${escapeHtml(loc.name)}</h3>
              <div class="flex flex-wrap gap-2 text-xs">
                ${verifiedCompanies.map(c => `<span class="px-3 py-1.5 bg-slate-950 text-slate-300 border border-slate-800 rounded-lg">${escapeHtml(c)}</span>`).join('')}
              </div>
            </div>

            <div class="pt-2 flex flex-wrap gap-3">
              <a href="/jobs?location=${slug}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md">Browse All ${escapeHtml(loc.name)} Jobs &rarr;</a>
              <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700">Free ATS Resume Scan &rarr;</a>
            </div>
          </section>

          ${realJobsGridHtml}

          <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
            <h3 class="text-lg font-bold text-white">Popular Tech &amp; Corporate Roles in ${escapeHtml(loc.name)}</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              ${sampleRoles.map(r => `
                <a href="/jobs/${r.slug}/${slug}" class="p-3 bg-slate-950 border border-slate-800 hover:border-blue-500/50 rounded-xl text-slate-300 hover:text-white transition block">
                  <span class="font-bold block text-white">${escapeHtml(r.name)}</span>
                  <span class="text-slate-500 text-[11px]">Jobs in ${escapeHtml(loc.name)} &rarr;</span>
                </a>
              `).join('')}
            </div>
          </section>

          <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
            <h3 class="text-lg font-bold text-white">Salary Benchmarks in ${escapeHtml(loc.name)} by Specialization</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              ${sampleRoles.map(r => `
                <a href="/salary/${r.slug}/${slug}" class="p-3 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-slate-300 hover:text-white transition block">
                  <span class="font-bold block text-emerald-400">${escapeHtml(r.name)} Salary</span>
                  <span class="text-slate-500 text-[11px]">${escapeHtml(loc.name)} Percentiles &rarr;</span>
                </a>
              `).join('')}
            </div>
          </section>

          <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
            <h3 class="text-lg font-bold text-white">Frequently Asked Questions — Jobs in ${escapeHtml(loc.name)}</h3>
            <div class="space-y-3 text-xs">
              ${faqs.map(f => `
                <div class="p-4 bg-slate-950 rounded-2xl border border-slate-800/80">
                  <h4 class="font-bold text-white mb-1">${escapeHtml(f.question)}</h4>
                  <p class="text-slate-400 leading-relaxed">${escapeHtml(f.answer)}</p>
                </div>
              `).join('')}
            </div>
          </section>

          <section class="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-3">
            <h3 class="text-base font-bold text-white">Explore Sibling Employment Corridors in India</h3>
            <div class="flex flex-wrap gap-2 text-xs">
              ${siblingCities.map(c => `
                <a href="/locations/${c.slug}" class="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition">
                  Jobs in ${escapeHtml(c.name)} &rarr;
                </a>
              `).join('')}
            </div>
          </section>
        </div>
      `;

      const breadcrumbSchema = buildBreadcrumbSchema([
        { name: 'Home', url: 'https://jobs.talentxcel.in/' },
        { name: 'Locations', url: 'https://jobs.talentxcel.in/locations' },
        { name: loc.name, url: canonical },
      ]);
      const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description: description,
        url: canonical,
        breadcrumb: breadcrumbSchema,
      };
      const faqSchema = buildFAQSchema(faqs);

      writePrerenderedPage(`/locations/${slug}`, {
        title,
        description,
        canonical,
        h1: `Jobs & Tech Hiring in ${loc.name}`,
        bodyContentHtml: bodyHtml,
        jsonLd: [collectionSchema, breadcrumbSchema, faqSchema],
      });
    }
  } catch (err) {
    console.warn('Locations prerender warning:', err);
  }

  // 11. Pre-render High-Intent Combinatorial College Comparisons (/compare/:comparisonSlug)
  console.log('Pre-rendering High-Intent Combinatorial College Comparisons...');
  const COMPARISON_PAIRS = [
    { slugA: 'indian-institute-of-technology-bombay', slugB: 'indian-institute-of-technology-delhi', nameA: 'IIT Bombay', nameB: 'IIT Delhi', feeA: '2.2L', feeB: '2.1L', ctcA: '21.5', ctcB: '20.8', nirfA: '3', nirfB: '2' },
    { slugA: 'indian-institute-of-technology-delhi', slugB: 'indian-institute-of-technology-madras', nameA: 'IIT Delhi', nameB: 'IIT Madras', feeA: '2.1L', feeB: '2.0L', ctcA: '20.8', ctcB: '22.0', nirfA: '2', nirfB: '1' },
    { slugA: 'indian-institute-of-technology-kanpur', slugB: 'indian-institute-of-technology-kharagpur', nameA: 'IIT Kanpur', nameB: 'IIT Kharagpur', feeA: '2.1L', feeB: '2.2L', ctcA: '19.5', ctcB: '19.0', nirfA: '4', nirfB: '5' },
    { slugA: 'national-institute-of-technology-tiruchirappalli', slugB: 'national-institute-of-technology-surathkal', nameA: 'NIT Trichy', nameB: 'NIT Surathkal', feeA: '1.4L', feeB: '1.5L', ctcA: '14.5', ctcB: '13.8', nirfA: '9', nirfB: '12' },
    { slugA: 'banaras-hindu-university-varanasi', slugB: 'university-of-allahabad-allahabad', nameA: 'BHU Varanasi', nameB: 'Allahabad University', feeA: '0.4L', feeB: '0.3L', ctcA: '9.2', ctcB: '6.5', nirfA: '11', nirfB: '45' },
    { slugA: 'coep-technological-university-pune', slugB: 'veermata-jijabai-technological-institute-mumbai', nameA: 'COEP Pune', nameB: 'VJTI Mumbai', feeA: '1.1L', feeB: '0.9L', ctcA: '11.8', ctcB: '12.2', nirfA: '73', nirfB: '82' },
    { slugA: 'indian-institute-of-management-ahmedabad', slugB: 'indian-institute-of-management-bangalore', nameA: 'IIM Ahmedabad', nameB: 'IIM Bangalore', feeA: '25.0L', feeB: '24.5L', ctcA: '34.5', ctcB: '33.8', nirfA: '1', nirfB: '2' },
    { slugA: 'birla-institute-of-technology-and-science-pilani', slugB: 'indian-institute-of-technology-bombay', nameA: 'BITS Pilani', nameB: 'IIT Bombay', feeA: '5.5L', feeB: '2.2L', ctcA: '18.2', ctcB: '21.5', nirfA: '25', nirfB: '3' },
    { slugA: 'delhi-technological-university-delhi', slugB: 'netaji-subhas-university-of-technology-delhi', nameA: 'DTU Delhi', nameB: 'NSUT Delhi', feeA: '1.9L', feeB: '1.8L', ctcA: '15.4', ctcB: '14.8', nirfA: '29', nirfB: '60' },
    { slugA: 'indian-institute-of-technology-roorkee', slugB: 'indian-institute-of-technology-guwahati', nameA: 'IIT Roorkee', nameB: 'IIT Guwahati', feeA: '2.2L', feeB: '2.1L', ctcA: '18.8', ctcB: '18.5', nirfA: '6', nirfB: '7' }
  ];

  for (const pair of COMPARISON_PAIRS) {
    const compSlug = `${pair.slugA}-vs-${pair.slugB}`;
    const compTitle = `${pair.nameA} vs ${pair.nameB} [2026 Comparison] — Fees, Cutoffs, Placements & ROI | TalentXcel`;
    const compDesc = `Detailed side-by-side comparison between ${pair.nameA} and ${pair.nameB}. Compare annual fees (₹${pair.feeA} vs ₹${pair.feeB}), average placements (₹${pair.ctcA} LPA vs ₹${pair.ctcB} LPA), NIRF rankings, and cutoffs.`;
    const compCanonical = formatCanonicalUrl(`/compare/${compSlug}`);

    const compBodyHtml = `
      <div class="space-y-8">
        <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <h2 class="text-2xl font-bold text-white">${escapeHtml(pair.nameA)} vs ${escapeHtml(pair.nameB)} — 2026 Forensic Comparison</h2>
          <p class="text-slate-300 text-sm leading-relaxed">Side-by-side verified comparison across annual tuition fees, NIRF rankings, highest &amp; median CTC placements, cutoff percentiles, and return on investment (ROI).</p>
          
          <div class="overflow-x-auto pt-2">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="bg-slate-950 border-b border-slate-800 text-slate-400">
                  <th class="p-3 w-1/3">Evaluation Metric</th>
                  <th class="p-3 w-1/3 text-blue-400 font-bold">${escapeHtml(pair.nameA)}</th>
                  <th class="p-3 w-1/3 text-purple-400 font-bold">${escapeHtml(pair.nameB)}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800">
                <tr><td class="p-3 text-slate-300 font-semibold">NIRF National Rank</td><td class="p-3 text-white font-mono font-bold">#${pair.nirfA}</td><td class="p-3 text-white font-mono font-bold">#${pair.nirfB}</td></tr>
                <tr><td class="p-3 text-slate-300 font-semibold">Annual Tuition Fee</td><td class="p-3 text-emerald-400 font-bold">₹${pair.feeA} / year</td><td class="p-3 text-emerald-400 font-bold">₹${pair.feeB} / year</td></tr>
                <tr><td class="p-3 text-slate-300 font-semibold">Average CTC Placement</td><td class="p-3 text-amber-400 font-bold">₹${pair.ctcA} LPA</td><td class="p-3 text-amber-400 font-bold">₹${pair.ctcB} LPA</td></tr>
                <tr><td class="p-3 text-slate-300 font-semibold">Full Institution Dossier</td><td class="p-3"><a href="/colleges/${pair.slugA}" class="text-blue-400 hover:underline">View ${escapeHtml(pair.nameA)} Profile &rarr;</a></td><td class="p-3"><a href="/colleges/${pair.slugB}" class="text-purple-400 hover:underline">View ${escapeHtml(pair.nameB)} Profile &rarr;</a></td></tr>
              </tbody>
            </table>
          </div>

          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/resume/ats-check" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md">Check Placement Score (Free) &rarr;</a>
            <a href="/colleges/pathway" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700">Generate 6-Step Pathway &rarr;</a>
          </div>
        </section>
      </div>
    `;

    const compBreadcrumb = buildBreadcrumbSchema([
      { name: 'Home', url: 'https://colleges.talentxcel.in/' },
      { name: 'Colleges', url: 'https://colleges.talentxcel.in/colleges' },
      { name: `${pair.nameA} vs ${pair.nameB}`, url: compCanonical },
    ]);

    writePrerenderedPage(`/compare/${compSlug}`, {
      title: compTitle,
      description: compDesc,
      canonical: compCanonical,
      h1: `${pair.nameA} vs ${pair.nameB}`,
      bodyContentHtml: compBodyHtml,
      jsonLd: [compBreadcrumb],
    });
  }

  // 12. Pre-render Role x City Salary Intelligence Hubs (/salary/:role/:city)
  console.log('Pre-rendering Role x City Salary Hubs...');
  const CORE_SALARY_ROLES = [
    { slug: 'software-engineer', name: 'Software Engineer' },
    { slug: 'frontend-developer', name: 'Frontend Developer' },
    { slug: 'backend-developer', name: 'Backend Developer' },
    { slug: 'full-stack-developer', name: 'Full Stack Developer' },
    { slug: 'devops-engineer', name: 'DevOps Engineer' },
    { slug: 'data-analyst', name: 'Data Analyst' },
    { slug: 'data-scientist', name: 'Data Scientist' },
    { slug: 'qa-automation-engineer', name: 'QA Automation Engineer' }
  ];

  const KEY_HUBS = [
    { slug: 'bangalore', name: 'Bangalore' },
    { slug: 'noida', name: 'Noida' },
    { slug: 'pune', name: 'Pune' },
    { slug: 'hyderabad', name: 'Hyderabad' },
    { slug: 'indore', name: 'Indore' },
    { slug: 'patna', name: 'Patna' },
    { slug: 'bhopal', name: 'Bhopal' },
    { slug: 'varanasi', name: 'Varanasi' }
  ];

  for (const role of CORE_SALARY_ROLES) {
    for (const hub of KEY_HUBS) {
      const salCanonical = formatCanonicalUrl(`/salary/${role.slug}/${hub.slug}`);
      const salTitle = `${role.name} Salary Information for ${hub.name} | TalentXcel`;
      const salDesc = `Source-backed salary information for ${role.name} in ${hub.name} will be published when available.`;

      const salBodyHtml = `
        <div class="space-y-8">
          <section class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
            <h2 class="text-2xl font-bold text-white">${escapeHtml(role.name)} Compensation in ${escapeHtml(hub.name)}</h2>
            <p class="text-slate-300 text-sm leading-relaxed">TalentXcel does not currently have a source-backed salary distribution to publish for this role and location. Review current job listings for compensation details supplied by employers.</p>

            <div class="pt-4 flex flex-wrap gap-3">
              <a href="/jobs/${role.slug}/${hub.slug}" class="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md">Browse ${escapeHtml(role.name)} Jobs in ${escapeHtml(hub.name)} &rarr;</a>
              <a href="/resume/ats-check" class="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700">ATS Resume Optimizer &rarr;</a>
            </div>
          </section>
        </div>
      `;

      const salBreadcrumb = buildBreadcrumbSchema([
        { name: 'Home', url: 'https://salary.talentxcel.in/' },
        { name: 'Salary', url: 'https://salary.talentxcel.in/salary' },
        { name: role.name, url: formatCanonicalUrl(`/salary/${role.slug}`) },
        { name: hub.name, url: salCanonical },
      ]);

      writePrerenderedPage(`/salary/${role.slug}/${hub.slug}`, {
        title: salTitle,
        description: salDesc,
        canonical: salCanonical,
        h1: `${role.name} Salary in ${hub.name}`,
        bodyContentHtml: salBodyHtml,
        robots: 'noindex, follow',
        jsonLd: [salBreadcrumb],
      });
    }
  }

  // 13. Pre-render Apex Master Mega-Directories (/directory, /directory/colleges-a-z, etc.)
  console.log('Pre-rendering Apex Master Mega-Directories...');
  const directoryPages = [
    {
      route: '/directory',
      title: 'TalentXcel Directory | Colleges, Jobs, Careers and Salary Guides',
      desc: 'Browse TalentXcel directories for colleges, careers, jobs, and salary information.',
      h1: 'TalentXcel Comprehensive Directory',
      bodyHtml: `
        <div class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <h2 class="text-xl font-bold text-white">Higher Education &amp; Colleges A-Z</h2>
              <p class="text-xs text-slate-400">Browse institution profiles and the information available for each college.</p>
              <a href="/directory/colleges-a-z" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Colleges A-Z &rarr;</a>
            </div>
            <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <h2 class="text-xl font-bold text-white">Salaries by Role &amp; City</h2>
              <p class="text-xs text-slate-400">Role and location salary information is published when source-backed data is available.</p>
              <a href="/directory/salaries-by-role" class="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Salaries by Role &rarr;</a>
            </div>
            <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <h2 class="text-xl font-bold text-white">Jobs by City &amp; Tier-2 Hubs</h2>
              <p class="text-xs text-slate-400">Browse job listings by city and review details supplied by employers.</p>
              <a href="/directory/jobs-by-city" class="inline-block px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">Jobs by City &rarr;</a>
            </div>
          </div>
        </div>
      `
    },
    {
      route: '/directory/index',
      title: 'TalentXcel Directory | Colleges, Jobs, Careers and Salary Guides',
      desc: 'Browse TalentXcel directories for colleges, careers, jobs, and salary information.',
      h1: 'TalentXcel Comprehensive Directory Index',
      bodyHtml: `
        <div class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <h2 class="text-xl font-bold text-white">Higher Education &amp; Colleges A-Z</h2>
              <p class="text-xs text-slate-400">Browse institution profiles and the information available for each college.</p>
              <a href="/directory/colleges-a-z" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">Colleges A-Z &rarr;</a>
            </div>
            <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <h2 class="text-xl font-bold text-white">Salaries by Role &amp; City</h2>
              <p class="text-xs text-slate-400">Role and location salary information is published when source-backed data is available.</p>
              <a href="/directory/salaries-by-role" class="inline-block px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold">Salaries by Role &rarr;</a>
            </div>
            <div class="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
              <h2 class="text-xl font-bold text-white">Jobs by City &amp; Tier-2 Hubs</h2>
              <p class="text-xs text-slate-400">Browse job listings by city and review details supplied by employers.</p>
              <a href="/directory/jobs-by-city" class="inline-block px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold">Jobs by City &rarr;</a>
            </div>
          </div>
        </div>
      `
    },
    {
      route: '/directory/colleges-a-z',
      title: 'Indian Colleges and Universities Directory A-Z | TalentXcel',
      desc: 'Browse college and university profiles in the TalentXcel directory.',
      h1: 'Higher Education Directory A-Z',
      bodyHtml: `
        <div class="space-y-6">
          <p class="text-sm text-slate-300">Browse college and university profiles available in the directory.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            ${INDIAN_INSTITUTIONS_CATALOG.slice(0, 48).map(inst => `
              <a href="/colleges/${inst.slug}" class="p-3 bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl text-slate-200 block truncate">
                ${escapeHtml(inst.name)}
              </a>
            `).join('')}
          </div>
        </div>
      `
    },
    {
      route: '/directory/salaries-by-role',
      title: 'Salary Guides by Role | TalentXcel',
      desc: 'Browse TalentXcel salary guides by role. Role and location information is published when source-backed data is available.',
      h1: 'Salary Guides by Role',
      bodyHtml: `
        <div class="space-y-6">
          <p class="text-sm text-slate-300">Role and location pages without source-backed salary data are excluded from search.</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            ${CORE_SALARY_ROLES.map(r => `
              <a href="/salary/${r.slug}" class="p-3 bg-slate-900 border border-slate-800 hover:border-emerald-500 rounded-xl text-emerald-400 block font-semibold">
                ${escapeHtml(r.name)} Salary &rarr;
              </a>
            `).join('')}
          </div>
        </div>
      `
    },
    {
      route: '/directory/jobs-by-city',
      title: 'Browse Jobs by City | TalentXcel',
      desc: 'Explore job listings by city and review details supplied by employers.',
      h1: 'Browse Jobs by City',
      bodyHtml: `
        <div class="space-y-6">
          <p class="text-sm text-slate-300">Select a city to review job listings currently available on TalentXcel.</p>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-xs">
            ${KEY_HUBS.map(h => `
              <a href="/locations/${h.slug}" class="p-3 bg-slate-900 border border-slate-800 hover:border-purple-500 rounded-xl text-purple-400 block font-semibold">
                Jobs in ${escapeHtml(h.name)} &rarr;
              </a>
            `).join('')}
          </div>
        </div>
      `
    }
  ];

  for (const dir of directoryPages) {
    const dirCanonical = formatCanonicalUrl(dir.route);
    const dirBreadcrumb = buildBreadcrumbSchema([
      { name: 'Home', url: BASE_URL },
      { name: 'Directory', url: `${BASE_URL}/directory` },
      ...(dir.route !== '/directory' ? [{ name: dir.h1, url: dirCanonical }] : []),
    ]);

    writePrerenderedPage(dir.route, {
      title: dir.title,
      description: dir.desc,
      canonical: dirCanonical,
      robots: dir.route === '/directory/salaries-by-role' ? 'noindex, follow' : undefined,
      h1: dir.h1,
      bodyContentHtml: dir.bodyHtml,
      jsonLd: [dirBreadcrumb],
    });
  }

  console.log(`\n========================================`);
  console.log(`✓ Pre-rendered ${generatedCount} Class A Static HTML Documents!`);
  console.log(`========================================\n`);
}

prerender().catch(console.error);
