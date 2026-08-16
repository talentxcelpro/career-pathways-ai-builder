// api/og-bot.ts
// Vercel Serverless Edge Function variant for SPA social link previews

export const config = {
  runtime: 'edge',
};

const DEFAULT_SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const username = url.searchParams.get('username') || url.pathname.split('/').pop();

  if (!username) {
    return new Response('Missing username parameter', { status: 400 });
  }

  const profile = await fetchProfileForMeta(username);
  const title = profile ? `${profile.name} — ${profile.headline || 'Professional Career Passport'} | TalentXcel` : 'Career Passport | TalentXcel';
  const description = profile?.summary?.slice(0, 200) || `${profile?.name || 'Candidate'}'s verified professional passport on TalentXcel.`;
  const image = profile?.photoUrl || 'https://talentxcel.in/lovable-uploads/711de76d-0f05-4939-b8b5-4acd21eb3119.png';
  const pageUrl = `https://talentxcel.in/passport/public/${username}`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${image}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:type" content="profile">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${image}">
  <meta http-equiv="refresh" content="0;url=${pageUrl}">
</head>
<body>
  <p>Redirecting to <a href="${pageUrl}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

  return new Response(html, {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
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
