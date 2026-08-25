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

  const templatePath = fs.existsSync(path.join(DIST_DIR, 'index.html'))
    ? path.join(DIST_DIR, 'index.html')
    : path.resolve(__dirname, '../index.html');

  let templateHtml = fs.readFileSync(templatePath, 'utf8');
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
    const targetDir = path.join(DIST_DIR, cleanPath);
    fs.mkdirSync(targetDir, { recursive: true });
    const targetIndexFile = path.join(targetDir, 'index.html');
    const targetFlatHtmlFile = path.join(DIST_DIR, cleanPath + '.html');

    let pageHtml = templateHtml;

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

  console.log(`\n========================================`);
  console.log(`✓ Pre-rendered ${generatedCount} Class A Static HTML Documents!`);
  console.log(`========================================\n`);
}

prerender().catch(console.error);
