// middleware.ts
// Place this at the ROOT of your Vercel project (same level as package.json).
//
// What it does:
// - Runs on Vercel's Edge Network before your static SPA is served.
// - Only activates for known bot/crawler User-Agents (WhatsApp, LinkedIn,
//   Twitter/X, Slack, Facebook, iMessage, Googlebot, etc).
// - Only intercepts /passport/public/:username routes.
// - Fetches that user's name/title/photo from Supabase, then rewrites the
//   <title> and og:*/twitter:* meta tags in the HTML response.
// - Real human visitors are untouched — they get your normal React SPA,
//   unchanged, at full speed.

const BOT_UA = /facebookexternalhit|WhatsApp|Twitterbot|LinkedInBot|Slackbot|TelegramBot|Discordbot|Googlebot|Applebot|redditbot|Pinterest/i;

const DEFAULT_SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

export const config = {
  matcher: ['/passport/public/:username*', '/company/:slug*'],
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

  let title = '';
  let description = '';
  let image = 'https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png';

  if (section === 'company') {
    const company = await fetchCompanyForMeta(slug);
    if (!company) return;
    title = `${company.name} — AI Product Leaderboard | TalentXcel Rankings`;
    description = company.tagline || company.description || `${company.name} is ranked on the TalentXcel Global AI Product Leaderboard.`;
    if (company.logo_url) image = company.logo_url;
  } else {
    const profile = await fetchProfileForMeta(slug);
    if (!profile) return;
    title = `${profile.name} — ${profile.headline || profile.title || 'Professional Career Passport'} | TalentXcel`;
    description = profile.summary?.slice(0, 200) || `${profile.name}'s verified professional passport on TalentXcel.`;
    if (profile.photoUrl) image = profile.photoUrl;
  }

  // Fetch the real index.html Vercel would have served, then patch it.
  const originRes = await fetch(new URL('/index.html', req.url).toString());
  if (!originRes.ok) return;
  let html = await originRes.text();

  const pageUrl = url.toString();

  html = html
    .replace(/<title>.*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${pageUrl}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escapeHtml(title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escapeHtml(description)}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
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
    if (!rows?.length) return null;
    return rows[0];
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
  } catch (err) {
    return null;
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
