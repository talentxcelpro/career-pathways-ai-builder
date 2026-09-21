// middleware.ts
// Edge middleware running on Vercel Edge Network
//
// Intercepts search crawlers and social bots (Googlebot, LinkedInBot, etc.)
// Dynamically injects route-specific title, description, canonical link, and OpenGraph tags
// Ensures search engines receive the exact canonical URL for /jobs/*, /colleges/*, /passport/*, and /company/*
// Real human users pass through untouched at static CDN speed.

const BOT_UA = /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Googlebot|Applebot|redditbot|Pinterest|bingbot|Baiduspider/i;

const DEFAULT_SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

export const config = {
  matcher: ['/passport/public/:username*', '/company/:slug*', '/jobs/:path*', '/colleges/:path*'],
};

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const ua = req.headers.get('user-agent') || '';

  if (!BOT_UA.test(ua)) {
    return; // real user — pass through untouched to Vite React SPA
  }

  const pathParts = url.pathname.split('/').filter(Boolean);
  const section = pathParts[0];
  const slug = pathParts[pathParts.length - 1];
  if (!slug) return;

  let title = 'TalentXcel — AI Career Platform for Jobs, Skills & Hiring';
  let description = 'Search verified jobs, build an ATS-ready resume, prepare for interviews and grow your skills on TalentXcel.';
  let image = 'https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png';

  if (section === 'jobs') {
    const job = await fetchJobForMeta(slug);
    if (job) {
      title = `${job.title} at ${job.company_name || 'Hiring Employer'} | TalentXcel Jobs`;
      description = job.description?.slice(0, 180) || `Apply now for ${job.title} on TalentXcel. Free 1-click application with instant ATS resume score.`;
    } else {
      const formattedTitle = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      title = `${formattedTitle} Jobs & Career Opportunities | TalentXcel`;
      description = `Find high-paying ${formattedTitle} jobs with verified salary ranges, direct employer applications, and instant ATS resume matching.`;
    }
  } else if (section === 'colleges') {
    const formattedCollege = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    title = `${formattedCollege} — Courses, Admissions, Fees & Placements | TalentXcel`;
    description = `Comprehensive guide to ${formattedCollege}: courses, fee structures, cutoff scores, placements, and career pathways.`;
  } else if (section === 'company') {
    const company = await fetchCompanyForMeta(slug);
    if (company) {
      title = `${company.name} — AI Product Leaderboard | TalentXcel Rankings`;
      description = company.tagline || company.description || `${company.name} is ranked on the TalentXcel Global AI Product Leaderboard.`;
      if (company.logo_url) image = company.logo_url;
    }
  } else if (section === 'passport') {
    const profile = await fetchProfileForMeta(slug);
    if (profile) {
      title = `${profile.name} — ${profile.headline || profile.title || 'Professional Career Passport'} | TalentXcel`;
      description = profile.summary?.slice(0, 200) || `${profile.name}'s verified professional passport on TalentXcel.`;
      if (profile.photoUrl) image = profile.photoUrl;
    }
  }

  // Fetch the real index.html Vercel would have served, then patch it.
  const originRes = await fetch(new URL('/index.html', req.url).toString());
  if (!originRes.ok) return;
  let html = await originRes.text();

  const canonicalUrl = `https://talentxcel.in${url.pathname}`;

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
      `${SUPABASE_URL}/rest/v1/jobs?or=(seo_slug.eq.${encodeURIComponent(slug)},id.eq.${encodeURIComponent(slug)})&select=title,company_name,description,location&limit=1`,
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
