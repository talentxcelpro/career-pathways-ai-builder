// api/og-bot.ts
// Vercel Serverless Edge Function variant for SPA social link previews (LinkedIn, Twitter/X, WhatsApp, Facebook, Slack)

export const config = {
  runtime: 'edge',
};

const DEFAULT_SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const pathSegment = url.searchParams.get('username') || url.pathname.split('/').pop() || '';
  const cleanSegment = decodeURIComponent(pathSegment).trim();

  // 1. TalentScore Preview Handler
  if (cleanSegment === 'talent-score' || cleanSegment === 'talentscore' || url.searchParams.get('type') === 'talent_score') {
    const title = 'TalentScore | Universal Career Readiness & Capability Benchmark | TalentXcel';
    const description = 'Benchmark your professional capabilities across 13 global industries. 1000-point career readiness, verified skills, and portable Career Passport identity.';
    const image = 'https://talentxcel.in/assets/og/talentxcel-og-passport.png';
    const pageUrl = 'https://talentxcel.in/talent-score';

    const html = buildSocialHtml({
      title,
      description,
      image,
      pageUrl,
      type: 'website'
    });

    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  // 2. Career Passport Hub Handler
  if (cleanSegment === 'passport' || cleanSegment === 'career-passport') {
    const title = 'Career Passport | Universal Verified Professional Identity | TalentXcel';
    const description = 'Showcase verified competencies, career milestones, and professional credentials with the tamper-evident TalentXcel Career Passport.';
    const image = 'https://talentxcel.in/assets/og/talentxcel-og-passport.png';
    const pageUrl = 'https://talentxcel.in/passport';

    const html = buildSocialHtml({
      title,
      description,
      image,
      pageUrl,
      type: 'website'
    });

    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  }

  // 3. Candidate Passport / Public Profile Handler
  if (!cleanSegment) {
    return new Response('Missing identifier parameter', { status: 400 });
  }

  const profile = await fetchProfileForMeta(cleanSegment);
  const title = profile
    ? `${profile.name} — ${profile.headline || 'Verified Career Passport'} | TalentXcel`
    : 'Career Passport | TalentXcel';
  const description = profile?.summary?.slice(0, 200) || `${profile?.name || 'Candidate'}'s verified professional passport on TalentXcel.`;
  const image = profile?.photoUrl || 'https://talentxcel.in/assets/og/talentxcel-og-passport.png';
  const pageUrl = profile?.username
    ? `https://talentxcel.in/u/${encodeURIComponent(profile.username)}`
    : `https://talentxcel.in/passport/public/${encodeURIComponent(cleanSegment)}`;

  const html = buildSocialHtml({
    title,
    description,
    image,
    pageUrl,
    type: 'profile'
  });

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

function buildSocialHtml(opts: {
  title: string;
  description: string;
  image: string;
  pageUrl: string;
  type: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(opts.title)}</title>
  <meta name="description" content="${escapeHtml(opts.description)}">
  <meta property="og:title" content="${escapeHtml(opts.title)}">
  <meta property="og:description" content="${escapeHtml(opts.description)}">
  <meta property="og:site_name" content="TalentXcel">
  <meta property="og:image" content="${escapeHtml(opts.image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(opts.image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(opts.title)}">
  <meta property="og:url" content="${escapeHtml(opts.pageUrl)}">
  <meta property="og:type" content="${escapeHtml(opts.type)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:site" content="@TalentXcel">
  <meta name="twitter:title" content="${escapeHtml(opts.title)}">
  <meta name="twitter:description" content="${escapeHtml(opts.description)}">
  <meta name="twitter:image" content="${escapeHtml(opts.image)}">
  <meta http-equiv="refresh" content="0;url=${escapeHtml(opts.pageUrl)}">
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(opts.pageUrl)}">${escapeHtml(opts.title)}</a>...</p>
</body>
</html>`;
}

async function fetchProfileForMeta(username: string) {
  const SUPABASE_URL = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const cleaned = username.startsWith('@') ? username.slice(1) : username;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleaned);

  try {
    let filter = '';
    if (isUuid) {
      filter = `id=eq.${encodeURIComponent(cleaned)}`;
    } else {
      filter = `or=(username.ilike.${encodeURIComponent(cleaned)},full_name.ilike.${encodeURIComponent(cleaned.replace(/-/g, " "))})`;
    }

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/public_profiles?${filter}&select=id,username,full_name,title,headline,about,profile_picture_url,profile_photo_url&limit=1`,
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
      id: row.id,
      username: row.username,
      name: row.full_name || cleaned,
      title: row.title || '',
      headline: row.headline || row.title || 'Verified Professional',
      summary: row.about || row.headline || '',
      photoUrl: row.profile_picture_url || row.profile_photo_url || '',
    };
  } catch (err) {
    return null;
  }
}

function escapeHtml(s: string) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
