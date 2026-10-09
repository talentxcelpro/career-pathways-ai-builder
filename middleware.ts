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
    '/sitemap.xml',
    '/robots.txt',
    '/passport/public/:username*',
    '/company/:slug*',
    '/jobs/:path*',
    '/colleges/:path*',
    '/salaries/:path*'
  ],
};

export default async function middleware(req: Request) {
  const url = new URL(req.url);

  // 1. Normalize trailing slashes at the edge (301 Permanent Redirect)
  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    const cleanUrl = new URL(req.url);
    cleanUrl.pathname = url.pathname.replace(/\/+$/, '');
    return Response.redirect(cleanUrl.toString(), 301);
  }

  // 2. Subdomain dedicated sitemap and robots.txt routing
  const host = (req.headers.get('x-forwarded-host') || req.headers.get('host') || url.hostname || '').toLowerCase();
  const subdomain = host.split('.')[0];

  if (url.pathname === '/sitemap.xml') {
    const subdomainMap: Record<string, string> = {
      jobs: '/sitemap-jobs.xml',
      resume: '/sitemap-resume.xml',
      salary: '/sitemap-salary.xml',
      careers: '/sitemap-careers.xml',
      learning: '/sitemap-learning.xml',
      colleges: '/sitemap-colleges.xml',
      employers: '/sitemap-employers.xml',
      employer: '/sitemap-employers.xml',
      government: '/sitemap-government.xml',
      passport: '/sitemap-passport.xml',
    };

    const targetFile = subdomainMap[subdomain];
    if (targetFile) {
      try {
        const targetUrl = new URL(targetFile, req.url);
        const fileRes = await fetch(targetUrl);
        if (fileRes.ok) {
          return new Response(fileRes.body, {
            status: 200,
            headers: {
              'content-type': 'application/xml; charset=utf-8',
              'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
              'access-control-allow-origin': '*',
            },
          });
        }
      } catch (err) {
        // Fallback to 301 redirect if internal fetch is unavailable
        return Response.redirect(new URL(targetFile, req.url).toString(), 301);
      }
    }
  }

  if (url.pathname === '/robots.txt') {
    const robotsMap: Record<string, string> = {
      jobs: '/robots-jobs.txt',
      resume: '/robots-resume.txt',
      salary: '/robots-salary.txt',
      careers: '/robots-careers.txt',
      learning: '/robots-learning.txt',
      colleges: '/robots-colleges.txt',
      employers: '/robots-employers.txt',
      employer: '/robots-employers.txt',
      government: '/robots-government.txt',
      passport: '/robots-passport.txt',
    };

    const targetFile = robotsMap[subdomain];
    if (targetFile) {
      try {
        const targetUrl = new URL(targetFile, req.url);
        const fileRes = await fetch(targetUrl);
        if (fileRes.ok) {
          return new Response(fileRes.body, {
            status: 200,
            headers: {
              'content-type': 'text/plain; charset=utf-8',
              'cache-control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
              'access-control-allow-origin': '*',
            },
          });
        }
      } catch (err) {
        return Response.redirect(new URL(targetFile, req.url).toString(), 301);
      }
    }
  }

  const ua = req.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) {
    return; // real human user — pass through untouched to Vite React SPA
  }

  const pathParts = url.pathname.split('/').filter(Boolean);
  const section = pathParts[0];
  const slug = pathParts[pathParts.length - 1];
  if (!slug) return;

  // 2. Eliminate phantom salary matrix URLs with HTTP 410 Gone
  if (section === 'salaries') {
    return new Response(
      `<!DOCTYPE html><html lang="en"><head><title>410 Gone | TalentXcel</title><meta name="robots" content="noindex, nofollow" /></head><body style="font-family:sans-serif;background:#090d16;color:#e2e8f0;padding:40px;text-align:center;"><h1>410 Gone</h1><p>This automated salary estimate has been retired in favor of verified compensation data.</p><p><a href="/jobs" style="color:#38bdf8;">Explore Live Jobs</a></p></body></html>`,
      { status: 410, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }

  // 3. Eliminate phantom company hiring matrix URLs with HTTP 410 Gone
  if (section === 'jobs' && pathParts.length > 2 && pathParts[1] === 'company') {
    return new Response(
      `<!DOCTYPE html><html lang="en"><head><title>410 Gone | TalentXcel</title><meta name="robots" content="noindex, nofollow" /></head><body style="font-family:sans-serif;background:#090d16;color:#e2e8f0;padding:40px;text-align:center;"><h1>410 Gone</h1><p>This company hiring matrix permutation is no longer active.</p><p><a href="/jobs" style="color:#38bdf8;">Browse Verified Jobs</a></p></body></html>`,
      { status: 410, headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }

  let title = 'TalentXcel — AI Career Platform for Jobs, Skills & Hiring';
  let description = 'Search verified jobs, build an ATS-ready resume, prepare for interviews and grow your skills on TalentXcel.';
  let image = 'https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png';
  let canonicalUrl = `https://talentxcel.in${url.pathname}`;

  if (section === 'jobs') {
    if (pathParts.length > 1) {
      const jobSlug = pathParts[1];
      
      // If it's a known static hub, allow standard rendering
      if (!VALID_STATIC_JOB_ROUTES.has(jobSlug.toLowerCase())) {
        const job = await fetchJobForMeta(jobSlug);
        if (job) {
          title = `${job.title} at ${job.company_name || 'Hiring Employer'} | TalentXcel Jobs`;
          description = job.description?.slice(0, 180) || `Apply now for ${job.title} on TalentXcel. Free 1-click application with instant ATS resume score.`;
          canonicalUrl = `https://talentxcel.in/jobs/${job.seo_slug || jobSlug}`;
        } else {
          // Nonexistent or expired job requested by search bot -> HTTP 410 Gone
          return new Response(
            `<!DOCTYPE html><html lang="en"><head><title>410 Gone - Job Listing Removed | TalentXcel</title><meta name="robots" content="noindex, nofollow" /></head><body style="font-family:sans-serif;background:#090d16;color:#e2e8f0;padding:40px;text-align:center;"><h1>410 Gone</h1><p>This job vacancy or search permutation is no longer active.</p><p><a href="/jobs" style="color:#38bdf8;">Browse 500+ Verified Active Openings</a></p></body></html>`,
            { status: 410, headers: { 'content-type': 'text/html; charset=utf-8' } }
          );
        }
      }
    }
  } else if (section === 'colleges') {
    if (pathParts.length > 2) {
      // Facet subtab (e.g. /colleges/iit-delhi/fees) -> Canonicalize strictly to primary entity
      const collegeSlug = pathParts[1];
      const formattedCollege = collegeSlug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      title = `${formattedCollege} — Courses, Admissions, Fees & Placements | TalentXcel`;
      description = `Comprehensive dossier for ${formattedCollege}: courses, fee structures, cutoff scores, placements, and career pathways.`;
      canonicalUrl = `https://talentxcel.in/colleges/${collegeSlug}`;
    } else if (pathParts.length === 2) {
      const formattedCollege = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      title = `${formattedCollege} — Courses, Admissions, Fees & Placements | TalentXcel`;
      description = `Comprehensive guide to ${formattedCollege}: courses, fee structures, cutoff scores, placements, and career pathways.`;
      canonicalUrl = `https://talentxcel.in/colleges/${slug}`;
    }
  } else if (section === 'company') {
    const company = await fetchCompanyForMeta(slug);
    if (company) {
      title = `${company.name} — AI Product Leaderboard | TalentXcel Rankings`;
      description = company.tagline || company.description || `${company.name} is ranked on the TalentXcel Global AI Product Leaderboard.`;
      if (company.logo_url) image = company.logo_url;
      canonicalUrl = `https://talentxcel.in/company/${slug}`;
    }
  } else if (section === 'passport') {
    const profile = await fetchProfileForMeta(slug);
    if (profile) {
      title = `${profile.name} — ${profile.headline || profile.title || 'Professional Career Passport'} | TalentXcel`;
      description = profile.summary?.slice(0, 200) || `${profile.name}'s verified professional passport on TalentXcel.`;
      if (profile.photoUrl) image = profile.photoUrl;
      canonicalUrl = `https://talentxcel.in/passport/public/${slug}`;
    }
  }

  // Fetch the real index.html Vercel would have served, then patch it.
  const originRes = await fetch(new URL('/index.html', req.url).toString());
  if (!originRes.ok) return;
  let html = await originRes.text();

  html = html
    .replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta\s+name=["']description["']\s+content=")[^"]*(")/i, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta\s+property=["']og:title["']\s+content=")[^"]*(")/i, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta\s+property=["']og:description["']\s+content=")[^"]*(")/i, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta\s+property=["']og:image["']\s+content=")[^"]*(")/i, `$1${image}$2`)
    .replace(/(<meta\s+property=["']og:url["']\s+content=")[^"]*(")/i, `$1${canonicalUrl}$2`)
    .replace(/(<meta\s+name=["']twitter:title["']\s+content=")[^"]*(")/i, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta\s+name=["']twitter:description["']\s+content=")[^"]*(")/i, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta\s+name=["']twitter:image["']\s+content=")[^"]*(")/i, `$1${image}$2`);

  // Explicitly update or inject canonical tag so Googlebot indexes the exact route URL
  if (/<link\s+rel=["']canonical["'][^>]*>/i.test(html)) {
    html = html.replace(/<link\s+rel=["']canonical["'][^>]*>/i, `<link rel="canonical" href="${canonicalUrl}" />`);
  } else {
    html = html.replace('</head>', `<link rel="canonical" href="${canonicalUrl}" />\n</head>`);
  }

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

async function fetchJobForMeta(slug: string) {
  const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/jobs?or=(seo_slug.eq.${encodeURIComponent(slug)},id.eq.${encodeURIComponent(slug)})&is_active=eq.true&select=title,company_name,description,location,seo_slug&limit=1`,
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

async function fetchCompanyForMeta(slug: string) {
  const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/claim1_entities?slug=eq.${encodeURIComponent(slug)}&select=name,tagline,description,logo_url`,
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

async function fetchProfileForMeta(username: string) {
  const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const cleaned = username.startsWith('@') ? username.slice(1) : username;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/profiles?or=(username.ilike.${encodeURIComponent(cleaned)},custom_url_slug.ilike.${encodeURIComponent(cleaned)},slug.ilike.${encodeURIComponent(cleaned)})&select=full_name,title,headline,about,profile_picture_url`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (!rows?.length) return null;

    const row = rows[0];
    return {
      name: row.full_name || cleaned,
      title: row.title || '',
      headline: row.headline || row.title || 'Verified Professional',
      summary: row.about || row.headline || '',
      photoUrl: row.profile_picture_url || '',
    };
  } catch {
    return null;
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
