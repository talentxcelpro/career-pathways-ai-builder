import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INDIAN_INSTITUTIONS_CATALOG } from '../src/data/indianInstitutionsCatalog.js';
import { SEED_PROGRAMS, SEED_SCHOLARSHIPS } from '../src/services/globalEducationService.js';
import { FOUNDATION_NEWS_ARTICLES } from '../src/data/newsArticles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, '../dist');
const BASE_URL = 'https://talentxcel.in';

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

  const templatePath = fs.existsSync(path.join(DIST_DIR, 'index.html'))
    ? path.join(DIST_DIR, 'index.html')
    : path.resolve(__dirname, '../index.html');

  let templateHtml = fs.readFileSync(templatePath, 'utf8');

  let generatedCount = 0;

  // Helper to write an HTML page with injected metadata and semantic pre-rendered body
  function writePrerenderedPage(
    routePath: string,
    meta: {
      title: string;
      description: string;
      canonical: string;
      h1: string;
      bodyContentHtml: string;
      jsonLd?: object;
    }
  ) {
    const cleanPath = routePath.replace(/^\//, '').replace(/\/$/, '');
    const targetDir = path.join(DIST_DIR, cleanPath);
    fs.mkdirSync(targetDir, { recursive: true });
    const targetIndexFile = path.join(targetDir, 'index.html');
    const targetFlatHtmlFile = path.join(DIST_DIR, cleanPath + '.html');

    let pageHtml = templateHtml;

    // 1. Replace Title
    pageHtml = pageHtml.replace(
      /<title>.*?<\/title>/i,
      `<title>${escapeHtml(meta.title)}</title>`
    );

    // 2. Replace or Inject Meta Description
    if (/<meta\s+name=["']description["'][^>]*>/i.test(pageHtml)) {
      pageHtml = pageHtml.replace(
        /<meta\s+name=["']description["'][^>]*>/i,
        `<meta name="description" content="${escapeHtml(meta.description)}" />`
      );
    } else {
      pageHtml = pageHtml.replace('</head>', `<meta name="description" content="${escapeHtml(meta.description)}" />\n</head>`);
    }

    // 3. Replace or Inject Canonical Tag
    if (/<link\s+rel=["']canonical["'][^>]*>/i.test(pageHtml)) {
      pageHtml = pageHtml.replace(
        /<link\s+rel=["']canonical["'][^>]*>/i,
        `<link rel="canonical" href="${meta.canonical}" />`
      );
    } else {
      pageHtml = pageHtml.replace('</head>', `<link rel="canonical" href="${meta.canonical}" />\n</head>`);
    }

    // 4. Inject OpenGraph & Schema
    const ogInjections = `
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${meta.canonical}" />
    <meta property="og:type" content="website" />
    ${
      meta.jsonLd
        ? `<script type="application/ld+json">\n${JSON.stringify(meta.jsonLd, null, 2)}\n</script>`
        : ''
    }
    `;

    pageHtml = pageHtml.replace('</head>', `${ogInjections}\n</head>`);

    // 3. Inject Initial Semantic Markup into <div id="root">
    const semanticShell = `
    <div id="root">
      <main class="min-h-screen bg-slate-950 text-slate-100 p-6">
        <header class="max-w-6xl mx-auto py-8">
          <nav aria-label="Breadcrumb" class="text-xs text-slate-400 mb-4">
            <a href="/" class="hover:underline">Home</a> &gt; 
            <a href="/colleges" class="hover:underline">Colleges</a> &gt; 
            <span class="text-indigo-400">${escapeHtml(meta.h1)}</span>
          </nav>
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">${escapeHtml(meta.h1)}</h1>
          <p class="text-base text-slate-300 max-w-3xl leading-relaxed">${escapeHtml(meta.description)}</p>
        </header>
        <section class="max-w-6xl mx-auto py-6">
          ${meta.bodyContentHtml}
        </section>
      </main>
    </div>
    `;

    pageHtml = pageHtml.replace(/<div id="root"><\/div>/i, semanticShell);

    fs.writeFileSync(targetIndexFile, pageHtml, 'utf8');
    fs.writeFileSync(targetFlatHtmlFile, pageHtml, 'utf8');
    generatedCount++;
  }

  // 1. Pre-render 1,509 Indian Higher Education Institutions
  console.log(`Pre-rendering ${INDIAN_INSTITUTIONS_CATALOG.length} Indian Higher Ed Institutions...`);
  for (const inst of INDIAN_INSTITUTIONS_CATALOG) {
    const slug = inst.slug;
    const canonical = `${BASE_URL}/colleges/${slug}`;
    const feeMin = inst.annual_fee_min || 50000;
    const feeMax = inst.annual_fee_max || 250000;
    const title = `${inst.name} — Fees, Courses, Cutoffs & Placement Intelligence | TalentXcel`;
    const description = `Explore comprehensive admission intelligence for ${inst.name}, ${inst.city || 'India'}, ${inst.state || 'India'}. Average fee ₹${feeMin.toLocaleString()} - ₹${feeMax.toLocaleString()}, cutoff criteria, top recruiters, and placement benchmarks.`;
    
    const bodyHtml = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="md:col-span-2 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 class="text-xl font-bold text-white mb-4">Forensic Institution Intelligence</h2>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div class="p-3 bg-slate-950/80 rounded-lg">
                <span class="text-xs text-slate-400 block">Location</span>
                <span class="font-semibold text-white">${escapeHtml(inst.city || '')}, ${escapeHtml(inst.state || '')}</span>
              </div>
              <div class="p-3 bg-slate-950/80 rounded-lg">
                <span class="text-xs text-slate-400 block">Category</span>
                <span class="font-semibold text-white capitalize">${escapeHtml(inst.category || 'Institution')}</span>
              </div>
              <div class="p-3 bg-slate-950/80 rounded-lg">
                <span class="text-xs text-slate-400 block">NIRF / Rank</span>
                <span class="font-semibold text-emerald-400">${inst.nirf_rank ? '#' + inst.nirf_rank : 'Accredited'}</span>
              </div>
              <div class="p-3 bg-slate-950/80 rounded-lg">
                <span class="text-xs text-slate-400 block">Avg CTC</span>
                <span class="font-semibold text-amber-400">₹${(inst.placement_avg_lpa || 6.5).toFixed(1)} LPA</span>
              </div>
            </div>
            <p class="mt-4 text-sm text-slate-300 leading-relaxed">${escapeHtml(inst.description || inst.name + ' is an accredited higher education institution in ' + (inst.state || 'India'))}</p>
          </div>

          <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 class="text-xl font-bold text-white mb-4">Admissions & Key Disciplines</h2>
            <div class="flex flex-wrap gap-2 mb-4">
              ${(inst.disciplines || ['Engineering', 'Management', 'Sciences']).map(d => `<span class="px-2.5 py-1 bg-slate-800 text-xs rounded-md text-slate-200">${escapeHtml(d)}</span>`).join('')}
            </div>
            <p class="text-xs text-slate-400">Entrance Exams: ${escapeHtml((inst.entrance_exams || ['JEE Main', 'CAT', 'State CET']).join(', '))}</p>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 class="text-lg font-bold text-white mb-3">Annual Fee Range</h3>
            <p class="text-2xl font-bold text-emerald-400 mb-2">₹${(feeMin / 100000).toFixed(1)}L - ₹${(feeMax / 100000).toFixed(1)}L</p>
            <p class="text-xs text-slate-400 mb-4">Tuition, lab, and institutional charges per academic year.</p>
            <a href="${canonical}/pathway" class="inline-block w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-center text-white text-sm font-semibold rounded-lg">Generate Career Pathway &rarr;</a>
          </div>
        </div>
      </div>
    `;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollegeOrUniversity",
      "name": inst.name,
      "url": canonical,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": inst.city || "India",
        "addressRegion": inst.state || "India",
        "addressCountry": "IN"
      },
      "description": description
    };

    writePrerenderedPage(`/colleges/${slug}`, {
      title,
      description,
      canonical,
      h1: inst.name,
      bodyContentHtml: bodyHtml,
      jsonLd
    });
  }

  function slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  // 2. Pre-render 100 Global Degree Programs
  console.log(`Pre-rendering ${SEED_PROGRAMS.length} Global Degree Programs...`);
  for (const prog of SEED_PROGRAMS) {
    const slug = (prog as any).slug || slugify(`${prog.institution_name}-${prog.program_title}`);
    const canonical = `${BASE_URL}/colleges/global-programs/${slug}`;
    const tuition = (prog as any).tuition_annual_display || (prog.tuition_cost_usd === 0 ? '€0 Tuition' : `$${prog.tuition_cost_usd}`);
    const title = `${prog.program_title} — ${prog.institution_name}, ${prog.country} | TalentXcel Global Intelligence`;
    const description = `Verified details for ${prog.program_title} at ${prog.institution_name} in ${prog.country}. Tuition: ${tuition}. Funding: ${prog.access_type}.`;

    const bodyHtml = `
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h2 class="text-xl font-bold text-white mb-2">${escapeHtml(prog.program_title)}</h2>
        <p class="text-emerald-400 font-semibold text-sm mb-4">${escapeHtml(prog.institution_name)} &bull; ${escapeHtml(prog.country)}</p>
        <p class="text-sm text-slate-300 mb-4">${escapeHtml(prog.currency_note || 'Verified tuition and funding data.')}</p>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
          <div class="p-3 bg-slate-950 rounded-lg"><span class="text-xs text-slate-400 block">Tuition</span><span class="font-semibold text-white">${escapeHtml(tuition)}</span></div>
          <div class="p-3 bg-slate-950 rounded-lg"><span class="text-xs text-slate-400 block">Level</span><span class="font-semibold text-white capitalize">${escapeHtml(prog.level || 'Master')}</span></div>
          <div class="p-3 bg-slate-950 rounded-lg"><span class="text-xs text-slate-400 block">Duration</span><span class="font-semibold text-white">${escapeHtml(prog.duration_months ? prog.duration_months + ' Months' : 'Standard')}</span></div>
          <div class="p-3 bg-slate-950 rounded-lg"><span class="text-xs text-slate-400 block">Status</span><span class="font-semibold text-emerald-400">${escapeHtml(prog.access_type)}</span></div>
        </div>
      </div>
    `;

    writePrerenderedPage(`/colleges/global-programs/${slug}`, {
      title,
      description,
      canonical,
      h1: prog.program_title,
      bodyContentHtml: bodyHtml
    });
  }

  writePrerenderedPage('/colleges/global-programs', {
    title: 'Global Degree & Program Discovery — 100 Verified Programs | TalentXcel',
    description: 'Explore 100 verified tuition-free, fully funded, and scholarship-eligible degree programs worldwide across Germany, Norway, Sweden, and Europe.',
    canonical: `${BASE_URL}/colleges/global-programs`,
    h1: 'Global Degree & Program Discovery',
    bodyContentHtml: '<p class="text-slate-300">100 verified degree programs across Europe and international universities.</p>'
  });

  writePrerenderedPage('/learning/providers', {
    title: 'Top Verified Learning Providers & Institutions | TalentXcel',
    description: 'Explore verified professional course providers including MIT, Harvard, Google, Microsoft, IBM, Stanford, and AWS.',
    canonical: `${BASE_URL}/learning/providers`,
    h1: 'Top Verified Learning Providers',
    bodyContentHtml: '<p class="text-slate-300">Browse verified learning providers and university credentials.</p>'
  });

  // 3. Pre-render Core Hubs
  console.log('Pre-rendering Core Hubs (/colleges, /learning, /colleges/scholarships, /colleges/pathway)...');
  writePrerenderedPage('/colleges', {
    title: 'Education Intelligence Command Center — 1,509 Indian Institutions | TalentXcel',
    description: 'Explore 1,509 verified universities, colleges, and professional institutes across 36 Indian States and UTs. Forensic data on fees, admissions, cutoffs, placements, and global pathways.',
    canonical: `${BASE_URL}/colleges`,
    h1: 'Education Intelligence Command Center',
    bodyContentHtml: '<p class="text-slate-300">Browse verified higher education institutions across 36 Indian states.</p>'
  });

  writePrerenderedPage('/colleges/scholarships', {
    title: 'Global Scholarships & ₹0 Funding Directory | TalentXcel',
    description: 'Verified scholarships and grants from international governments and universities. Explore funding options that make degree tuition ₹0.',
    canonical: `${BASE_URL}/colleges/scholarships`,
    h1: 'Global Scholarships & Funding Directory',
    bodyContentHtml: '<p class="text-slate-300">Verified international funding and scholarship opportunities.</p>'
  });

  writePrerenderedPage('/colleges/pathway', {
    title: 'AI Career Pathway Future OS — 6-Step Education Matrix | TalentXcel',
    description: 'Plan your complete education journey from 10th/12th grade to dream career. Connect Indian degrees, €0 global programs, scholarships, and verified skill milestones.',
    canonical: `${BASE_URL}/colleges/pathway`,
    h1: 'AI Career Pathway Future OS',
    bodyContentHtml: '<p class="text-slate-300">Intelligent 6-step education and career pathway roadmap.</p>'
  });

  writePrerenderedPage('/learning', {
    title: 'Learning Hub — 2,650+ Verified Courses & Certifications | TalentXcel',
    description: 'Search 2,650+ verified courses and professional certifications from top global providers including MIT, Harvard, Google, Microsoft, and IBM.',
    canonical: `${BASE_URL}/learning`,
    h1: 'Learning & Certification Hub',
    bodyContentHtml: '<p class="text-slate-300">2,650+ courses and certifications from global universities and tech leaders.</p>'
  });

  const additionalHubs = [
    { path: '/jobs', title: 'Jobs & Career Opportunities — Verified Tech & Business Roles | TalentXcel', desc: 'Discover verified jobs across top companies and high-growth startups.' },
    { path: '/companies', title: 'Companies Directory — Verified Employers & Culture Insights | TalentXcel', desc: 'Browse verified hiring companies, engineering cultures, and active job openings.' },
    { path: '/career-map', title: 'Interactive Career Maps & Roadmap Discovery | TalentXcel', desc: 'Map your career progression, identify skill gaps, and visualize role transitions.' },
    { path: '/passport', title: 'TalentXcel Career Passport — Verified Badges & Credibility', desc: 'Showcase verified competencies, project proof, and talent credibility.' },
    { path: '/tools', title: 'Career Tools Suite — ATS Resume, Salary & Interview Prep | TalentXcel', desc: 'AI-powered career tools to optimize resumes, evaluate role fit, and prepare for interviews.' },
    { path: '/services', title: 'TalentXcel Strategic Services — Talent & Hiring Solutions', desc: 'Strategic workforce and recruitment solutions for modern enterprises.' },
    { path: '/industries', title: 'Industry Career Hubs — Jobs & Trends Across Sectors | TalentXcel', desc: 'Explore career pathways and hiring trends across Technology, Finance, Healthcare, and Engineering.' },
    { path: '/locations', title: 'Locations Directory — Jobs Across Indian Cities | TalentXcel', desc: 'Search job opportunities and salary benchmarks across major Indian employment hubs.' },
    { path: '/resources', title: 'Career Resources & Hiring Guides | TalentXcel', desc: 'Expert guides on resume building, interview techniques, and career transition.' },
    { path: '/about', title: 'About TalentXcel — Building the Future of Work & Learning', desc: 'Learn about TalentXcel mission to connect verified education, skills, and employment.' },
    { path: '/contact', title: 'Contact TalentXcel — Support & Enterprise Inquiries', desc: 'Get in touch with our team for enterprise recruitment, institution partnerships, and support.' },
    { path: '/privacy-policy', title: 'Privacy Policy | TalentXcel', desc: 'Our commitment to protecting your personal data and career information.' },
    { path: '/terms', title: 'Terms of Service | TalentXcel', desc: 'Terms and conditions for using the TalentXcel career and education platform.' },
    { path: '/blog', title: 'TalentXcel Insights — Career Trends & Education Intelligence', desc: 'Articles and forensic analysis on hiring trends, technology skills, and higher education.' },
    { path: '/news', title: 'Platform News & Industry Updates | TalentXcel', desc: 'Latest announcements and industry news from the TalentXcel ecosystem.' },
    { path: '/help', title: 'Help & Knowledge Base | TalentXcel', desc: 'Frequently asked questions and guides for job seekers, students, and employers.' }
  ];

  for (const hub of additionalHubs) {
    writePrerenderedPage(hub.path, {
      title: hub.title,
      description: hub.desc,
      canonical: `${BASE_URL}${hub.path}`,
      h1: hub.title.split('—')[0].trim(),
      bodyContentHtml: `<p class="text-slate-300">${escapeHtml(hub.desc)}</p>`
    });
  }

  // Pre-render News Articles
  if (FOUNDATION_NEWS_ARTICLES && FOUNDATION_NEWS_ARTICLES.length > 0) {
    console.log(`Pre-rendering ${FOUNDATION_NEWS_ARTICLES.length} News & Insight Articles...`);
    for (const article of FOUNDATION_NEWS_ARTICLES) {
      writePrerenderedPage(`/news/${article.slug}`, {
        title: `${article.title} | TalentXcel News & Insights`,
        description: article.summary,
        canonical: `${BASE_URL}/news/${article.slug}`,
        h1: article.title,
        bodyContentHtml: `
          <div class="prose prose-invert max-w-none">
            <p class="text-lg font-medium text-slate-200 mb-6">${escapeHtml(article.summary)}</p>
            <div class="article-content">${article.content || ''}</div>
          </div>
        `
      });
    }
  }

  console.log(`\n========================================`);
  console.log(`✓ Pre-rendered ${generatedCount} Class A Static HTML Documents!`);
  console.log(`========================================\n`);
}

prerender().catch(console.error);
