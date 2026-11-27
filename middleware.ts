// middleware.ts
// Edge middleware running on Vercel Edge Network
//
// 1. Strictly enforces trailing-slash removal via HTTP 301.
// 2. Intercepts search crawlers and social bots (Googlebot, LinkedInBot, etc.).
// 3. For nonexistent/phantom job or salary permutations, returns HTTP 410 Gone (eliminating Soft 404s).
// 4. For college facet subtabs (/colleges/:slug/*), enforces canonical pointing to the primary institution dossier.
// 5. Real human users pass through untouched at static CDN speed.

const BOT_UA = /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Googlebot|Applebot|redditbot|Pinterest|bingbot|Baiduspider/i;

const DEFAULT_SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

const VALID_STATIC_JOB_ROUTES = new Set([
  'post', 'manage', 'saved', 'applied', 'alerts',
  'it-jobs', 'engineering-jobs', 'marketing-jobs',
  'bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune', 'varanasi', 'noida', 'lucknow'
]);

export const config = {
  matcher: [
    '/passport/public/:username*',
    '/company/:slug*',
    '/jobs/:path*',
    '/colleges/:path*',
    '/salaries/:path*',
    '/salary/:path*',
    '/career-map/:path*',
    '/resume/:path*',
    '/learning/:path*'
  ],
};

function getCanonicalForRoute(pathname: string, host: string): string {
  const clean = pathname.toLowerCase();
  const sub = host.split('.')[0];

  // If visiting the root of a specific subdomain, keep the subdomain root canonical
  if (clean === '/' || clean === '') {
    if (sub && sub !== 'talentxcel' && sub !== 'www') {
      return `https://${sub === 'employer' ? 'employers' : sub}.talentxcel.in/`;
    }
    return 'https://talentxcel.in/';
  }

  // All catalog, entity, job, college, salary, and content routes strictly consolidate onto apex talentxcel.in
  // This eliminates 44,000+ duplicate canonical conflicts between subdomains and apex
  return `https://talentxcel.in${pathname}`;
}

export default async function middleware(req: Request) {
  const url = new URL(req.url);

  // 1. Normalize trailing slashes at the edge (301 Permanent Redirect)
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    const cleanUrl = new URL(req.url);
    cleanUrl.pathname = url.pathname.replace(/\/+$/, '');
    return Response.redirect(cleanUrl.toString(), 301);
  }

  // 1b. Single-hop permanent redirect for jobs.talentxcel.in/jobs/<slug> -> talentxcel.in/jobs/<canonical-slug>
  if (url.hostname === 'jobs.talentxcel.in' && url.pathname.startsWith('/jobs/')) {
    const slug = url.pathname.slice('/jobs/'.length).replace(/\/+$/, '');
    if (slug && !slug.includes('/')) {
      const job = await fetchJobForMeta(slug);
      const targetSlug = job?.seo_slug || slug;
      return Response.redirect(`https://talentxcel.in/jobs/${encodeURIComponent(targetSlug)}`, 301);
    }
    return Response.redirect(`https://talentxcel.in${url.pathname}`, 301);
  }

  // 2. Human vs Bot Traffic Gate
  // Human traffic on target SEO routes & subdomain roots gets route-specific head metadata injected into /index.html
  const ua = req.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) {
    const meta = resolveBrowserRouteMeta(url.pathname, url.hostname);
    if (!meta) return;
    try {
      const htmlRes = await fetch(`${url.origin}/index.html`, { headers: { 'x-tx-edge-shell': '1' } });
      if (!htmlRes.ok) return;
      let html = await htmlRes.text();
      html = injectHeadMetadata(html, meta);
      return new Response(html, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=0, must-revalidate',
        },
      });
    } catch {
      return; // Fallback to unmodified SPA shell on any error
    }
  }

  const pathParts = url.pathname.split('/').filter(Boolean);
  const section = pathParts[0];
  const slug = pathParts[pathParts.length - 1];
  if (!slug) return;

  // 4. Redirect legacy salary matrix URLs to /salary via 301 Permanent Redirect
  if (section === 'salaries') {
    return Response.redirect('https://talentxcel.in/salary', 301);
  }

  // 5. Redirect legacy company hiring matrix URLs to /jobs via 301 Permanent Redirect
  if (section === 'jobs' && pathParts.length > 2 && pathParts[1] === 'company') {
    return Response.redirect('https://talentxcel.in/jobs', 301);
  }

  // 6. Redirect legacy college facet subtabs (/colleges/:slug/fees, /courses, etc.) to the primary college dossier
  // This permanently eliminates 92,250 legacy duplicate & soft 404 crawl errors in Google Search Console
  if (section === 'colleges' && pathParts.length > 2) {
    const collegeSlug = pathParts[1];
    return Response.redirect(`https://talentxcel.in/colleges/${collegeSlug}`, 301);
  }

  // 7. Expired & inactive job requests pass through to /api/seo-render, which returns HTTP 410 Gone.
  // We do NOT 301-redirect expired jobs to /jobs, because Google considers homepage/hub redirects for expired jobs as Soft-404 errors.

  // 8. For ALL active catalog, programmatic corridor, entity, and content routes:
  // Allow request to pass through (return;) so vercel.json rewrites crawlers directly to /api/seo-render.
  // /api/seo-render serves 100% complete semantic pre-rendered HTML with H1, JSON-LD schema,
  // rich content, and strictly unified apex canonicals (https://talentxcel.in/...).
  return;
}

async function fetchJobForMeta(slug: string) {
  const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slug);
  const filter = isUuid
    ? `or=(seo_slug.eq.${encodeURIComponent(slug)},id.eq.${encodeURIComponent(slug)})`
    : `seo_slug=eq.${encodeURIComponent(slug)}`;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/jobs?${filter}&is_active=eq.true&select=title,company_name,description,location,seo_slug&limit=1`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows?.[0] || null;
  } catch {
    return null;
  }
}

interface EdgeMeta {
  title: string;
  description: string;
  canonical: string;
  robots: string;
}

function formatSlugTitle(slug: string): string {
  return decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

function escapeAttr(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function resolveBrowserRouteMeta(pathname: string, hostname: string): EdgeMeta | null {
  const clean = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  const host = hostname.toLowerCase().replace(/:\d+$/, '');
  const sub = host.split('.')[0];

  // Subdomain roots
  if (clean === '/' && sub && sub !== 'talentxcel' && sub !== 'www') {
    const subMap: Record<string, { title: string; desc: string; canon: string }> = {
      government: {
        title: 'Government Jobs & Sarkari Naukri (2026) | TalentXcel',
        desc: 'Explore verified central and state government job notifications, PSU openings, and exam timelines on TalentXcel.',
        canon: 'https://government.talentxcel.in/',
      },
      learning: {
        title: 'Career Learning, Courses & Skill Tracks | TalentXcel',
        desc: 'Build job-ready skills with curated technical courses, certifications, and guided career tracks on TalentXcel.',
        canon: 'https://learning.talentxcel.in/',
      },
      passport: {
        title: 'Career Passport — Verified Skills & Profile | TalentXcel',
        desc: 'Create your verified TalentXcel Career Passport to showcase skills, TalentScore, and work history to top employers.',
        canon: 'https://passport.talentxcel.in/',
      },
      employers: {
        title: 'TalentXcel for Employers — Hire Verified Talent',
        desc: 'Post jobs, screen candidates with TalentScore, and hire verified talent faster with TalentXcel Recruiter OS.',
        canon: 'https://employers.talentxcel.in/',
      },
      careers: {
        title: 'Careers & Role Pathways | TalentXcel',
        desc: 'Discover structured career pathways, role transitions, and skill benchmarks across tech and enterprise domains.',
        canon: 'https://careers.talentxcel.in/',
      },
    };
    const entry = subMap[sub === 'employer' ? 'employers' : sub];
    if (entry) {
      return { title: entry.title, description: entry.desc, canonical: entry.canon, robots: 'index, follow' };
    }
  }

  if (clean.startsWith('/salary/')) {
    const slug = clean.slice('/salary/'.length).split('/')[0];
    if (slug) {
      const role = formatSlugTitle(slug);
      return {
        title: `${role} Salary in India (2026) | TalentXcel`,
        description: `Verified ${role} salary benchmarks, CTC ranges, and city-wise compensation insights on TalentXcel.`,
        canonical: `https://salary.talentxcel.in/salary/${encodeURIComponent(slug)}`,
        robots: 'index, follow',
      };
    }
  }

  if (clean === '/career-map') {
    return {
      title: 'Interactive Career Map & Role Pathways | TalentXcel',
      description: 'Explore career transitions, skill prerequisites, and salary progression across roles on TalentXcel Career Map.',
      canonical: 'https://talentxcel.in/career-map',
      robots: 'index, follow',
    };
  }

  if (clean.startsWith('/locations/')) {
    const citySlug = clean.slice('/locations/'.length).split('/')[0];
    if (citySlug) {
      const city = formatSlugTitle(citySlug);
      return {
        title: `Jobs in ${city} (2026) — Verified Openings | TalentXcel`,
        description: `Browse verified job openings, top employers, and salary benchmarks in ${city} on TalentXcel.`,
        canonical: `https://talentxcel.in/locations/${encodeURIComponent(citySlug)}`,
        robots: 'index, follow',
      };
    }
  }

  if (clean.startsWith('/resume/interview-prep/')) {
    const slug = clean.slice('/resume/interview-prep/'.length).split('/')[0];
    if (slug) {
      const topic = formatSlugTitle(slug);
      return {
        title: `${topic} Interview Questions & Answers | TalentXcel`,
        description: `Prepare for ${topic} interviews with curated technical questions, model answers, and ATS tips.`,
        canonical: `https://talentxcel.in/resume/interview-prep/${encodeURIComponent(slug)}`,
        robots: 'index, follow',
      };
    }
  }

  if (clean.startsWith('/company/')) {
    const slug = clean.slice('/company/'.length).split('/')[0];
    if (slug) {
      const company = formatSlugTitle(slug);
      return {
        title: `${company} Careers, Jobs & Salaries | TalentXcel`,
        description: `Explore verified ${company} job openings, salary bands, and hiring insights on TalentXcel.`,
        canonical: `https://talentxcel.in/company/${encodeURIComponent(slug)}`,
        robots: 'index, follow',
      };
    }
  }

  return null;
}

function injectHeadMetadata(html: string, meta: EdgeMeta): string {
  const safeTitle = escapeAttr(meta.title);
  const safeDesc = escapeAttr(meta.description);
  const safeCanon = escapeAttr(meta.canonical);
  const safeRobots = escapeAttr(meta.robots);

  let out = html
    .replace(/<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`)
    .replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${safeDesc}" />`)
    .replace(/<meta\s+name=["']robots["'][^>]*>\s*/gi, '')
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, '');

  const headInject = `<meta name="robots" content="${safeRobots}" />\n    <link rel="canonical" href="${safeCanon}" />`;
  out = out.replace(/<\/head>/i, `    ${headInject}\n  </head>`);
  return out;
}
