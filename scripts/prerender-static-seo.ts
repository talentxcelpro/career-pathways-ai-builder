import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { INDIAN_INSTITUTIONS_CATALOG } from '../src/data/indianInstitutionsCatalog.js';
import { SEED_PROGRAMS, SEED_SCHOLARSHIPS } from '../src/services/globalEducationService.js';
import { FOUNDATION_NEWS_ARTICLES } from '../src/data/newsArticles.js';
import { buildJobPostingSchema } from '../src/lib/seo/jobPostingSchema.js';

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
      jsonLd?: object;
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

  // 1. Pre-render Verified Active Jobs with GSC Compliant JobPosting JSON-LD
  console.log('Pre-rendering Database Jobs with Valid JobPosting Schema...');
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

        // Also write fallback /jobs/:id path
        if (job.seo_slug && job.id !== job.seo_slug) {
          writePrerenderedPage(`/jobs/${job.id}`, {
            title,
            description,
            canonical,
            h1: job.title,
            bodyContentHtml: bodyHtml,
            jsonLd: schema || undefined,
          });
        }
      }
    }
  } catch (err) {
    console.warn('Jobs prerender warning:', err);
  }

  // 2. Pre-render Authoritative Company Pages
  console.log('Pre-rendering Authoritative Company Landing Pages...');
  const companyPages = [
    { slug: 'talentxcel', name: 'TalentXcel Services' },
    { slug: 'talentxcel-services', name: 'TalentXcel Services' },
    { slug: 'talentxcel-services-pvt-ltd', name: 'TalentXcel Services Pvt Ltd' },
  ];

  for (const comp of companyPages) {
    const canonical = `${BASE_URL}/company/${comp.slug}`;
    const title = `${comp.name} — AI Talent Platform, Jobs & Strategic Solutions | TalentXcel`;
    const description = 'TalentXcel Services is an AI-powered talent operating system connecting verified job seekers, students, and employers with intelligent job matching, ATS resume intelligence, higher education pathways, and corporate staffing solutions.';

    const orgSchema = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: comp.name,
      url: canonical,
      logo: 'https://talentxcel.in/talentxcel-official-logo.png',
      description,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Noida',
        addressRegion: 'Uttar Pradesh',
        addressCountry: 'IN',
      },
      sameAs: ['https://talentxcel.in'],
    };

    const bodyHtml = `
      <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
        <h2 class="text-2xl font-bold text-white">${escapeHtml(comp.name)}</h2>
        <p class="text-sm text-blue-400 font-medium">AI-Powered Career OS & Strategic Talent Solutions &bull; Noida, India</p>
        <p class="text-slate-300 text-sm leading-relaxed">${escapeHtml(description)}</p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          <div class="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <h3 class="font-bold text-white text-sm">AI Recruitment Platform</h3>
            <p class="text-xs text-slate-400 mt-1">Algorithmic skill matching & verified screening.</p>
          </div>
          <div class="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <h3 class="font-bold text-white text-sm">Strategic Staffing & RPO</h3>
            <p class="text-xs text-slate-400 mt-1">Full-lifecycle recruitment & technical talent pods.</p>
          </div>
          <div class="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <h3 class="font-bold text-white text-sm">Career OS & Intelligence</h3>
            <p class="text-xs text-slate-400 mt-1">ATS resume scoring & verified credentials.</p>
          </div>
        </div>
      </div>
    `;

    writePrerenderedPage(`/company/${comp.slug}`, {
      title,
      description,
      canonical,
      h1: comp.name,
      bodyContentHtml: bodyHtml,
      jsonLd: orgSchema,
    });
  }

  // 3. Pre-render Public Feed Posts
  console.log('Pre-rendering Top Public Posts...');
  try {
    const { data: dbPosts } = await supabase
      .from('posts')
      .select('*, author:profiles(id, full_name, username, title)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (dbPosts) {
      for (const post of dbPosts) {
        const canonical = `${BASE_URL}/post/${post.id}`;
        const authorName = post.author?.full_name || 'TalentXcel Professional';
        const cleanContent = (post.content || '').trim();
        const headline = cleanContent.slice(0, 100).replace(/\n/g, ' ') || 'TalentXcel Update';
        const description = cleanContent.slice(0, 160).replace(/\n/g, ' ');
        const title = `${authorName}: "${headline}" | TalentXcel`;

        const postSchema = {
          '@context': 'https://schema.org',
          '@type': 'SocialMediaPosting',
          headline,
          articleBody: cleanContent,
          datePublished: post.created_at,
          author: {
            '@type': 'Person',
            name: authorName,
            url: `${BASE_URL}/@${post.author?.username || post.author?.id || 'member'}`,
          },
          publisher: {
            '@type': 'Organization',
            name: 'TalentXcel',
            url: 'https://talentxcel.in',
          },
        };

        const bodyHtml = `
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-purple-600/30 flex items-center justify-center font-bold text-white">
                ${escapeHtml(authorName.charAt(0))}
              </div>
              <div>
                <h2 class="text-base font-bold text-white">${escapeHtml(authorName)}</h2>
                <p class="text-xs text-slate-400">${escapeHtml(post.author?.title || 'Professional')}</p>
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

  // 4. Pre-render Topic Hubs
  console.log('Pre-rendering Topic Hubs...');
  const topicRegistry = [
    { slug: 'artificial-intelligence', title: 'Artificial Intelligence & Machine Learning', desc: 'Explore AI career pathways, machine learning job opportunities, and real-time product leaderboards shaping the AI workforce.' },
    { slug: 'recruitment', title: 'Recruitment & Talent Acquisition', desc: 'Discover modern talent acquisition strategies, recruitment process outsourcing (RPO), and verified candidate benchmarking.' },
    { slug: 'careers', title: 'Career Roadmaps & Professional Growth', desc: 'Navigate modern career transitions with ATS resume optimization, psychometric matching, and verifiable skill credentials.' },
    { slug: 'education', title: 'Higher Education & Degree Intelligence', desc: 'Forensic data on 10,250 accredited Indian universities and colleges, €0 tuition European programs, and education pathways.' },
    { slug: 'technology', title: 'Technology & Software Engineering', desc: 'Discover software engineering vacancies, systems design guides, technical assessment frameworks, and developer career intelligence.' },
    { slug: 'leadership', title: 'Leadership & Executive Management', desc: 'Strategic intelligence on leadership development, C-level executive hiring, corporate talent mobility, and executive career opportunities.' },
    { slug: 'business', title: 'Business Strategy & Workforce Operations', desc: 'Explore business operations roles, strategic consulting, commercial talent pipelines, and enterprise scaling solutions.' },
  ];

  for (const topic of topicRegistry) {
    const canonical = `${BASE_URL}/topics/${topic.slug}`;
    const title = `${topic.title} — Career Insights, Jobs & Guides | TalentXcel`;
    writePrerenderedPage(`/topics/${topic.slug}`, {
      title,
      description: topic.desc,
      canonical,
      h1: topic.title,
      bodyContentHtml: `<div class="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h2 class="text-xl font-bold text-white mb-2">${escapeHtml(topic.title)}</h2><p class="text-slate-300 text-sm">${escapeHtml(topic.desc)}</p></div>`,
    });
  }

  // 5. Pre-render Strategic Service Landing Pages
  console.log('Pre-rendering Strategic Service Pages...');
  const serviceRegistry = [
    { slug: 'ai-recruitment', title: 'AI Recruitment & Talent Matching Platform', desc: 'Algorithmic candidate matching, automated screening, and verified capability scoring.' },
    { slug: 'staffing-recruitment', title: 'Corporate Staffing & Recruitment Solutions', desc: 'Full-lifecycle sourcing, contract-to-hire, and recruitment process outsourcing (RPO).' },
    { slug: 'it-consulting', title: 'IT & Technology Systems Consulting', desc: 'Enterprise software architecture, cloud modernization, and tech staff augmentation.' },
    { slug: 'ai-solutions', title: 'AI Solutions & Autonomous Workflows', desc: 'Custom AI agent systems, machine learning integration, and workplace automation.' },
    { slug: 'corporate-training', title: 'Corporate Training & Executive Development', desc: 'Custom upskilling, behavioral leadership programs, and technical bootcamps.' },
    { slug: 'career-services', title: 'Professional Career Services & Executive Coaching', desc: '1-on-1 career strategy, executive bio refinement, and interview simulation.' },
    { slug: 'resume-building', title: 'ATS Resume Builder & Cover Letter Studio', desc: 'Real-time ATS parsing, intelligent bullet suggestions, and role-tailored customization.' },
    { slug: 'talent-management', title: 'Talent Management & Skill Verification', desc: 'Career Passport credentialing, workforce skill graphs, and internal mobility.' },
  ];

  for (const serv of serviceRegistry) {
    const canonical = `${BASE_URL}/services/${serv.slug}`;
    const title = `${serv.title} | TalentXcel Strategic Services`;
    writePrerenderedPage(`/services/${serv.slug}`, {
      title,
      description: serv.desc,
      canonical,
      h1: serv.title,
      bodyContentHtml: `<div class="bg-slate-900 border border-slate-800 rounded-2xl p-6"><h2 class="text-xl font-bold text-white mb-2">${escapeHtml(serv.title)}</h2><p class="text-slate-300 text-sm">${escapeHtml(serv.desc)}</p></div>`,
    });
  }

  // 6. Pre-render 1,509 Indian Higher Education Institutions
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
