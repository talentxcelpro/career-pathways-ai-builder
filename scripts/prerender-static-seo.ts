import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { INDIAN_INSTITUTIONS_CATALOG } from '../src/data/indianInstitutionsCatalog.js';
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
} from '../src/lib/seo/structuredDataSchemas.js';

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

  const cleanBaseTemplate = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
  let generatedCount = 0;

  function writePrerenderedPage(
    routePath: string,
    meta: {
      title: string;
      description: string;
      canonical: string;
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

    // 4. OpenGraph & Schema
    let schemaScripts = '';
    if (meta.jsonLd) {
      const schemas = Array.isArray(meta.jsonLd) ? meta.jsonLd : [meta.jsonLd];
      schemaScripts = schemas
        .filter(Boolean)
        .map((s) => `<script type="application/ld+json">\n${JSON.stringify(s, null, 2)}\n</script>`)
        .join('\n');
    }

    const ogInjections = `
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:url" content="${meta.canonical}" />
    <meta property="og:type" content="website" />
    ${schemaScripts}
    `;

    pageHtml = pageHtml.replace('</head>', `${ogInjections}\n</head>`);

    // 5. Inject Semantic Markup into <div id="root">
    const semanticShell = `
    <div id="root">
      <main class="min-h-screen bg-slate-950 text-slate-100 p-6">
        <header class="max-w-6xl mx-auto py-8">
          <nav aria-label="Breadcrumb" class="text-xs text-slate-400 mb-4">
            <a href="/" class="hover:underline">Home</a> &gt; 
            <span class="text-blue-400">${escapeHtml(meta.h1)}</span>
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

  // 0. Pre-render All Core Public Product Surface Hubs
  console.log('Pre-rendering Core Public Product Surface Hubs...');
  const coreHubs = [
    {
      route: '/',
      title: 'TalentXcel — AI Career Operating System & Corporate Recruitment',
      desc: 'TalentXcel is an AI-powered career operating system and recruitment ecosystem connecting job seekers, verified employers, higher education institutions, and professional networks.',
      h1: 'AI-Powered Career & Recruitment Ecosystem',
      bodyHtml: `
        <div class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 class="text-xl font-bold text-white mb-2">Jobs & Hiring</h2>
              <p class="text-slate-300 text-sm leading-relaxed mb-4">Discover verified job openings with transparent compensation, ATS compatibility, and direct employer introductions.</p>
              <a href="/jobs" class="text-blue-400 text-xs font-semibold hover:underline">Explore Jobs &rarr;</a>
            </div>
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 class="text-xl font-bold text-white mb-2">ATS Resume Builder</h2>
              <p class="text-slate-300 text-sm leading-relaxed mb-4">Create recruiter-ready, ATS-optimized resumes with real-time scoring, formatting validation, and keyword matching.</p>
              <a href="/resume" class="text-blue-400 text-xs font-semibold hover:underline">Build ATS Resume &rarr;</a>
            </div>
            <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h2 class="text-xl font-bold text-white mb-2">Higher Education Pathways</h2>
              <p class="text-slate-300 text-sm leading-relaxed mb-4">Forensic data across 10,250 Indian colleges, global tuition-free degree programs, and 6-step AI pathways.</p>
              <a href="/colleges" class="text-blue-400 text-xs font-semibold hover:underline">Explore Colleges &rarr;</a>
            </div>
          </div>
        </div>
      `,
    },
    {
      route: '/jobs',
      title: 'Jobs in India — Software, Tech, Management & AI Vacancies | TalentXcel',
      desc: 'Explore active job vacancies across software engineering, data science, AI, marketing, sales, and management in Noida, Bangalore, Hyderabad, Pune, and Remote.',
      h1: 'Verified Job Vacancies & Tech Openings',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Explore Active Employment Opportunities</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Search thousands of verified jobs across top Indian tech hubs with salary transparency and direct application paths.</p>
          <div class="flex flex-wrap gap-2 text-xs">
            <a href="/jobs?role=software-engineer" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Software Engineer Jobs</a>
            <a href="/jobs?role=data-scientist" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Data Scientist Jobs</a>
            <a href="/jobs?role=ai-engineer" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">AI Engineer Jobs</a>
            <a href="/jobs?location=noida" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Jobs in Noida</a>
            <a href="/jobs?location=bangalore" class="px-3 py-1.5 bg-slate-800 text-slate-200 rounded-lg">Jobs in Bangalore</a>
          </div>
        </div>
      `,
    },
    {
      route: '/companies',
      title: 'Verified Companies & Top Tech Employers | TalentXcel Directory',
      desc: 'Browse verified companies, tech startups, and enterprise employers hiring across India. Research company culture, tech stacks, active job openings, and salaries.',
      h1: 'Verified Companies Directory & Employer Intelligence',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Top Employers & Hiring Organizations</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Discover verified companies across FinTech, HealthTech, AI/ML, SaaS, and Enterprise IT hiring on TalentXcel.</p>
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
      route: '/network',
      title: 'Professional Network & Community Feed | TalentXcel',
      desc: 'Connect with verified engineers, recruiters, and founders. Share industry insights, technical discussions, and hiring opportunities.',
      h1: 'Professional Community & Network Feed',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Connect with Industry Peers & Hiring Managers</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Engage in professional discourse, discover unlisted job opportunities, and build verified professional relationships.</p>
        </div>
      `,
    },
    {
      route: '/employer',
      title: 'Employer Hiring Solutions & Talent Acquisition Platform | TalentXcel',
      desc: 'Hire pre-vetted tech, sales, and management talent with AI-assisted candidate matching, automated screening, and flexible RPO staffing pods.',
      h1: 'Employer Talent Acquisition & Staffing Solutions',
      bodyHtml: `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 class="text-xl font-bold text-white mb-3">Accelerate Your Engineering & Executive Hiring</h2>
          <p class="text-slate-300 text-sm leading-relaxed mb-4">Source high-performing candidates with algorithmic matching and dedicated recruitment specialists.</p>
          <a href="/services/staffing-recruitment" class="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">Explore Staffing Services &rarr;</a>
        </div>
      `,
    },
  ];

  for (const hub of coreHubs) {
    const canonical = `${BASE_URL}${hub.route === '/' ? '' : hub.route}`;
    const webPageSchema = buildWebPageSchema({
      name: hub.title,
      description: hub.desc,
      url: canonical,
      aboutOrgId: `${BASE_URL}/#organization`,
    });
    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: 'Home', url: BASE_URL },
      ...(hub.route !== '/' ? [{ name: hub.h1, url: canonical }] : []),
    ]);

    writePrerenderedPage(hub.route, {
      title: hub.title,
      description: hub.desc,
      canonical,
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
    const canonical = `${BASE_URL}/company/${comp.slug}`;
    const title = 'TalentXcel Services | AI Career & Recruitment Platform';
    const description = 'TalentXcel is an AI-powered career, recruitment and professional growth platform connecting job seekers, employers, educators and professionals.';

    const orgSchema = buildTalentXcelOrganizationSchema(canonical);
    const breadcrumbSchema = buildBreadcrumbSchema([
      { name: 'Home', url: BASE_URL },
      { name: 'Companies', url: `${BASE_URL}/companies` },
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
        const canonical = `${BASE_URL}/jobs/${slug}`;
        const title = `${job.title} at ${job.company_name} | TalentXcel`;
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
          </div>
        `;

        writePrerenderedPage(`/jobs/${slug}`, {
          title,
          description,
          canonical,
          h1: job.title,
          bodyContentHtml: bodyHtml,
          jsonLd: schema || undefined,
        });
      }
    }
  } catch (err) {
    console.warn('Jobs prerender warning:', err);
  }

  // 5. Pre-render Public Feed Posts
  console.log('Pre-rendering Top Public Feed Posts...');
  try {
    const { data: dbPosts } = await supabase
      .from('posts')
      .select('*, author:profiles(id, full_name, username, title)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (dbPosts) {
      for (const post of dbPosts) {
        const canonical = `${BASE_URL}/post/${post.id}`;
        const authorName = post.author?.full_name || 'TalentXcel Member';
        const cleanContent = (post.content || '').trim();
        const headline = cleanContent.split(/[.!?\n]/)[0]?.slice(0, 80).trim() || 'TalentXcel Update';
        const description = cleanContent.slice(0, 160).replace(/\n/g, ' ');
        const title = `${headline} | ${authorName} on TalentXcel`;

        const postSchema = buildPostSchema({
          headline,
          content: cleanContent,
          datePublished: post.created_at,
          authorName,
          authorUrl: `${BASE_URL}/@${post.author?.username || post.author?.id || 'member'}`,
          postUrl: canonical,
          mediaUrls: Array.isArray(post.media_urls) ? post.media_urls : undefined,
        });

        const bodyHtml = `
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center font-bold text-white">
                ${escapeHtml(authorName.charAt(0))}
              </div>
              <div>
                <h2 class="text-base font-bold text-white">${escapeHtml(authorName)}</h2>
                <p class="text-xs text-slate-400">${escapeHtml(post.author?.title || 'Verified Professional')}</p>
              </div>
            </div>
            <p class="text-slate-200 text-sm leading-relaxed whitespace-pre-line">${escapeHtml(cleanContent)}</p>
          </div>
        `;

        writePrerenderedPage(`/post/${post.id}`, {
          title,
          description,
          canonical,
          h1: headline,
          bodyContentHtml: bodyHtml,
          jsonLd: postSchema,
        });
      }
    }
  } catch (err) {
    console.warn('Posts prerender warning:', err);
  }

  // 6. Pre-render 1,509 Higher Ed Institutions
  console.log(`Pre-rendering ${INDIAN_INSTITUTIONS_CATALOG.length} Higher Ed Institutions...`);
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
        </div>
        <div class="space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 class="text-lg font-bold text-white mb-3">Annual Fee Range</h3>
            <p class="text-2xl font-bold text-emerald-400 mb-2">₹${(feeMin / 100000).toFixed(1)}L - ₹${(feeMax / 100000).toFixed(1)}L</p>
            <a href="${canonical}/pathway" class="inline-block w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-center text-white text-sm font-semibold rounded-lg">Generate Career Pathway &rarr;</a>
          </div>
        </div>
      </div>
    `;

    writePrerenderedPage(`/colleges/${slug}`, {
      title,
      description,
      canonical,
      h1: inst.name,
      bodyContentHtml: bodyHtml,
    });
  }

  // 7. Pre-render 100 Global Degree Programs
  console.log(`Pre-rendering ${SEED_PROGRAMS.length} Global Degree Programs...`);
  for (const prog of SEED_PROGRAMS) {
    const slug = (prog as any).slug || prog.program_title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const canonical = `${BASE_URL}/colleges/global-programs/${slug}`;
    const tuition = (prog as any).tuition_annual_display || (prog.tuition_cost_usd === 0 ? '€0 Tuition' : `$${prog.tuition_cost_usd}`);
    const title = `${prog.program_title} — ${prog.institution_name}, ${prog.country} | TalentXcel Global Intelligence`;
    const description = `Verified details for ${prog.program_title} at ${prog.institution_name} in ${prog.country}. Tuition: ${tuition}. Funding: ${prog.access_type}.`;

    writePrerenderedPage(`/colleges/global-programs/${slug}`, {
      title,
      description,
      canonical,
      h1: prog.program_title,
      bodyContentHtml: `<div class="bg-slate-900 border border-slate-800 rounded-xl p-6"><h2 class="text-xl font-bold text-white mb-2">${escapeHtml(prog.program_title)}</h2><p class="text-emerald-400 font-semibold text-sm">${escapeHtml(prog.institution_name)} &bull; ${escapeHtml(prog.country)}</p></div>`,
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

        writePrerenderedPage(`/resources/${guide.slug}`, {
          title,
          description,
          canonical,
          h1: guide.title,
          bodyContentHtml: bodyHtml,
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

    writePrerenderedPage(`/roles/${slug}`, {
      title,
      description,
      canonical,
      h1: `${role.title.replace(/\b\w/g, (c) => c.toUpperCase())} Careers & Jobs`,
      bodyContentHtml: bodyHtml,
    });

    writePrerenderedPage(`/jobs/${slug}`, {
      title,
      description,
      canonical: `${BASE_URL}/jobs/${slug}`,
      h1: `${role.title.replace(/\b\w/g, (c) => c.toUpperCase())} Jobs`,
      bodyContentHtml: bodyHtml,
    });

    // Also write /jobs/:role/:city combinations
    for (const city of TOP_CITIES) {
      const cityCanonical = `${BASE_URL}/jobs/${slug}/${city.slug}`;
      const cityTitle = `${role.title.replace(/\b\w/g, (c) => c.toUpperCase())} Jobs in ${city.name} 2026 | TalentXcel`;
      const cityDesc = `Find verified ${role.title} vacancies in ${city.name}. Apply directly to top tech employers with transparent compensation and ATS resume scoring.`;

      const cityBodyHtml = `
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <h2 class="text-2xl font-bold text-white mb-2">${escapeHtml(role.title.replace(/\b\w/g, (c) => c.toUpperCase()))} Jobs in ${escapeHtml(city.name)}</h2>
            <p class="text-slate-300 text-sm leading-relaxed">Verified hiring companies, active vacancies, required skills, and compensation packages for ${escapeHtml(role.title)} positions in ${escapeHtml(city.name)}.</p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Location</span><span class="font-semibold text-white">${escapeHtml(city.name)}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Key Tech Skills</span><span class="font-semibold text-blue-400">${escapeHtml(role.skills.join(', '))}</span></div>
            <div class="p-4 bg-slate-950 rounded-xl"><span class="text-slate-400 block mb-1">Hiring Status</span><span class="font-semibold text-emerald-400">Actively Interviewing</span></div>
          </div>
          <div class="pt-4 flex flex-wrap gap-3">
            <a href="/jobs?role=${slug}&location=${city.slug}" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg">Apply to ${escapeHtml(role.title)} Jobs in ${escapeHtml(city.name)} &rarr;</a>
            <a href="/resume" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg">Optimize Resume for ${escapeHtml(city.name)} Employers &rarr;</a>
          </div>
        </div>
      `;

      writePrerenderedPage(`/jobs/${slug}/${city.slug}`, {
        title: cityTitle,
        description: cityDesc,
        canonical: cityCanonical,
        h1: `${role.title.replace(/\b\w/g, (c) => c.toUpperCase())} Jobs in ${city.name}`,
        bodyContentHtml: cityBodyHtml,
      });
    }
  }
  } catch (err) {
    console.warn('Roles prerender warning:', err);
  }

  // 10. Pre-render Canonical Locations (/locations/:location)
  console.log('Pre-rendering Canonical Locations...');
  try {
    const { CANONICAL_LOCATIONS } = await import('../src/lib/seo/searchUniverse/locationExpansionEngine.js');
    if (CANONICAL_LOCATIONS) {
      for (const loc of CANONICAL_LOCATIONS) {
        const slug = loc.slug;
        const canonical = `${BASE_URL}/locations/${slug}`;
        const title = `Jobs & Tech Hiring in ${loc.name} 2026 | TalentXcel`;
        const description = `Explore active tech vacancies, top hiring companies, average salary benchmarks, and career opportunities in ${loc.name}.`;

        const bodyHtml = `
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
            <h2 class="text-2xl font-bold text-white mb-2">Employment & Tech Hiring Market in ${escapeHtml(loc.name)}</h2>
            <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(loc.name)} is a key employment center in India. TalentXcel connects professionals with verified tech companies, startups, and enterprise organizations in ${escapeHtml(loc.name)}.</p>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-xs">
              <div class="p-4 bg-slate-950 rounded-lg"><span class="text-slate-400 block mb-1">Region</span><span class="font-semibold text-white">${loc.region}</span></div>
              <div class="p-4 bg-slate-950 rounded-lg"><span class="text-slate-400 block mb-1">Market Tier</span><span class="font-semibold text-emerald-400">Tier ${loc.tier} Hub</span></div>
              <div class="p-4 bg-slate-950 rounded-lg"><span class="text-slate-400 block mb-1">Hiring Status</span><span class="font-semibold text-blue-400">Active Opportunities</span></div>
            </div>
            <div class="pt-2">
              <a href="/jobs?location=${slug}" class="inline-block px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">Browse Jobs in ${escapeHtml(loc.name)} &rarr;</a>
            </div>
          </div>
        `;

        writePrerenderedPage(`/locations/${slug}`, {
          title,
          description,
          canonical,
          h1: `Jobs & Tech Hiring in ${loc.name}`,
          bodyContentHtml: bodyHtml,
        });
      }
    }
  } catch (err) {
    console.warn('Locations prerender warning:', err);
  }

  console.log(`\n========================================`);
  console.log(`✓ Pre-rendered ${generatedCount} Class A Static HTML Documents!`);
  console.log(`========================================\n`);
}

prerender().catch(console.error);
