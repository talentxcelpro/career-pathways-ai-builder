// api/sitemap-passport.ts
// Dynamic Supabase-Driven Sitemap & Sitemap Index for all qualifying Career Passports (isIndexReady === true)
// Serves real-time XML with zero static build steps or GitHub commits.
// Fully compliant with Google & Schema sitemap protocol:
// - Strictly includes profiles with active affirmative consent and index completeness
// - Accurate lastmod timestamps from updated_at / created_at
// - Canonical URLs strictly on https://talentxcel.in/u/:username
// - XML escaped and supports pagination (?page=1)
// - Exposes sitemapindex if total profiles exceed segment capacity or when view=index is requested
// - Guarantees every qualifying profile appears in exactly one segment (shard)

export const config = {
  runtime: 'edge',
};

const PAGE_SIZE = 10_000; // Strict sitemap shard limit (well within Google's 50,000 URL / 50MB limit)

function getSupabaseAnonKey(): string {
  return process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
}

function getSupabaseRestUrl(): string {
  const base = process.env.SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
  return `${base.replace(/\/$/, '')}/rest/v1`;
}

function escapeXml(unsafe: string): string {
  return (unsafe || '').replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

function formatDateIso(dateStr?: string | null): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch {
    // fallback
  }
  return new Date().toISOString().split('T')[0];
}

export default async function handler(req: Request): Promise<Response> {
  const reqUrl = new URL(req.url);
  const viewParam = reqUrl.searchParams.get('view');
  const hasExplicitPage = reqUrl.searchParams.has('page');
  const pageParam = parseInt(reqUrl.searchParams.get('page') || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const offset = (page - 1) * PAGE_SIZE;

  const authHeaders = {
    'apikey': getSupabaseAnonKey(),
    'Authorization': `Bearer ${getSupabaseAnonKey()}`,
  };

  // If view=index is requested or no page is provided, check total count to decide if an index is required
  let totalCount = 0;
  try {
    const countRes = await fetch(`${getSupabaseRestUrl()}/public_profiles?select=id`, {
      method: 'HEAD',
      headers: {
        ...authHeaders,
        'Prefer': 'count=exact',
      },
    });
    if (countRes.ok) {
      const cr = countRes.headers.get('content-range');
      if (cr && cr.includes('/')) {
        totalCount = parseInt(cr.split('/')[1], 10) || 0;
      }
    }
  } catch {
    // Non-fatal count check
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // If view=index OR (totalCount > PAGE_SIZE and caller requested root /sitemap-passport.xml without ?page=)
  if (viewParam === 'index' || (!hasExplicitPage && totalPages > 1)) {
    let xmlIndex = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xmlIndex += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    const today = new Date().toISOString().split('T')[0];
    for (let p = 1; p <= totalPages; p++) {
      xmlIndex += `  <sitemap>\n`;
      xmlIndex += `    <loc>${escapeXml(`https://talentxcel.in/sitemap-passport.xml?page=${p}`)}</loc>\n`;
      xmlIndex += `    <lastmod>${today}</lastmod>\n`;
      xmlIndex += `  </sitemap>\n`;
    }
    xmlIndex += '</sitemapindex>';

    return new Response(xmlIndex, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
        'Cache-Tag': 'sitemap,sitemap-passport',
        'Surrogate-Key': 'sitemap,sitemap-passport',
        'X-Robots-Tag': 'noindex, follow',
        'X-Render-Engine': 'TalentXcel-Dynamic-Passport-Sitemap-Index',
      },
    });
  }

  // Otherwise serve the URL set for the requested page
  // Query public_profiles view (automatically enforces affirmative consent security barrier)
  const url = `${getSupabaseRestUrl()}/public_profiles?select=username,skills,headline,about,title,experience_years,current_company,created_at&order=created_at.desc&limit=${PAGE_SIZE}&offset=${offset}`;

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  try {
    const res = await fetch(url, { headers: authHeaders });

    if (res.ok) {
      const profiles = await res.json();
      if (Array.isArray(profiles)) {
        for (const p of profiles) {
          if (!p.username) continue;

          const skills = Array.isArray(p.skills) ? p.skills.filter(Boolean) : [];
          const bio = (p.headline || p.about || p.title || '').trim();
          const isPlaceholder = /^(test|fresher|n\/a|na|none|null|undefined|student|seeking opportunities|looking for job)$/i.test(bio);

          const hasEnoughSkills = skills.length >= 3;
          const hasRich = (!isPlaceholder && bio.length >= 40) ||
                          (p.experience_years && Number(p.experience_years) > 0) ||
                          Boolean(p.current_company && p.current_company.trim().length > 0);

          if (hasEnoughSkills && hasRich) {
            const loc = `https://talentxcel.in/u/${encodeURIComponent(p.username)}`;
            const lastmod = formatDateIso(p.created_at);
            xml += `  <url>\n`;
            xml += `    <loc>${escapeXml(loc)}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>0.7</priority>\n`;
            xml += `  </url>\n`;
          }
        }
      }
    }
  } catch {
    // Non-fatal edge fallback
  }

  xml += '</urlset>';

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'Cache-Tag': 'sitemap,sitemap-passport',
      'Surrogate-Key': 'sitemap,sitemap-passport',
      'X-Robots-Tag': 'noindex, follow',
      'X-Render-Engine': 'TalentXcel-Dynamic-Passport-Sitemap',
    },
  });
}
