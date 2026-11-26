// api/sitemap-passport.ts
// Dynamic Supabase-Driven Sitemap & Sitemap Index for all qualifying Career Passports (isIndexReady === true)
// Serves real-time XML with zero static build steps or GitHub commits.
// Fully compliant with Google & Schema sitemap protocol:
// - Strictly includes profiles with active affirmative consent (via public_profiles view) and structured completeness
// - Paginated PostgREST batch fetching (1,000 rows per batch) so inventory > 1,000 is never truncated
// - Deduplicated canonical URLs strictly on https://talentxcel.in/u/:username
// - Accurate lastmod timestamps from created_at
// - XML escaped and supports shard pagination (?page=1)

export const config = {
  runtime: 'edge',
};

export const PAGE_SIZE = 10_000; // Sitemap shard limit (well within Google's 50,000 URL / 50MB limit)
export const POSTGREST_BATCH_SIZE = 1_000; // Supabase PostgREST max-rows per HTTP request

const PLACEHOLDER_REGEX = /^(test|fresher|n\/a|na|none|null|undefined|student|seeking opportunities|looking for job)$/i;

export interface PassportSitemapRecord {
  username?: string | null;
  full_name?: string | null;
  skills?: string[] | null;
  headline?: string | null;
  about?: string | null;
  title?: string | null;
  location?: string | null;
  experience_years?: number | null;
  current_company?: string | null;
  is_profile_public?: boolean | null;
  profile_visibility?: string | null;
  is_deleted?: boolean | null;
  is_suspended?: boolean | null;
  created_at?: string | null;
}

/**
 * Targeted profile sitemap eligibility gate (Phase 5.4 / 5.5.1).
 * 100% aligned with evaluateProfileIndexability in api/seo-render.ts:
 * requires explicit opt-in (`is_profile_public === true`), valid full_name,
 * non-whitespace username, zero deletions/suspensions, and >= 2 structured signals.
 */
export function isPassportProfileSitemapEligible(p: PassportSitemapRecord): boolean {
  if (!p || typeof p.username !== 'string') return false;
  const cleanUsername = p.username.trim();
  if (cleanUsername.length < 2 || /\s/.test(cleanUsername)) return false;

  // Fail-closed: missing or undefined opt-in must not default to public
  if (p.is_profile_public !== true) return false;
  if (p.profile_visibility && p.profile_visibility !== 'public') return false;
  if (p.is_deleted === true || p.is_suspended === true) return false;

  const fullName = (p.full_name || '').trim();
  if (fullName.length < 2 || PLACEHOLDER_REGEX.test(fullName)) return false;

  const skills = Array.isArray(p.skills) ? p.skills.filter((s) => typeof s === 'string' && s.trim().length > 0) : [];
  const bio = (p.about || p.headline || p.title || '').trim();
  const hasMeaningfulBioOrTitle = !PLACEHOLDER_REGEX.test(bio) && bio.length >= 15;
  const hasSkills = skills.length >= 2;
  const hasWorkOrExp =
    (p.experience_years !== null && p.experience_years !== undefined && Number(p.experience_years) > 0) ||
    Boolean(p.current_company && p.current_company.trim().length >= 2);
  const hasLocation = Boolean(p.location && p.location.trim().length >= 2);

  const signalCount = [hasMeaningfulBioOrTitle, hasSkills, hasWorkOrExp, hasLocation].filter(Boolean).length;
  return signalCount >= 2;
}

export function escapeXml(unsafe: string): string {
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

export function formatDateIso(dateStr?: string | null): string {
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

export function buildPassportUrlsetXml(profiles: PassportSitemapRecord[], includeHubs: boolean = false): string {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  if (includeHubs) {
    const today = new Date().toISOString().split('T')[0];
    xml += `  <url>\n    <loc>https://talentxcel.in/passport</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>https://talentxcel.in/talent-score</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.95</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>https://talentxcel.in/talent</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  }

  const seenUrls = new Set<string>();
  for (const p of profiles) {
    if (!isPassportProfileSitemapEligible(p)) continue;
    const cleanUsername = p.username!.trim();
    const loc = `https://talentxcel.in/u/${encodeURIComponent(cleanUsername)}`;
    if (seenUrls.has(loc)) continue;
    seenUrls.add(loc);

    const lastmod = formatDateIso(p.created_at);
    xml += `  <url>\n`;
    xml += `    <loc>${escapeXml(loc)}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `  </url>\n`;
  }

  xml += '</urlset>';
  return xml;
}

function getSupabaseAnonKey(): string {
  return (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
}

function getSupabaseRestUrl(): string {
  const isPreview = (typeof process !== 'undefined' && (process.env?.VERCEL_ENV === 'preview' || process.env?.VITE_VERCEL_ENV === 'preview'));
  const base = (typeof process !== 'undefined' && (process.env?.SUPABASE_URL || process.env?.VITE_SUPABASE_URL))
    ? (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)!
    : (isPreview ? '' : 'https://dthlgsnakhoftinssokm.supabase.co');

  if (isPreview && (!base || base.includes('dthlgsnakhoftinssokm'))) {
    throw new Error('FAIL-CLOSED GUARD: Vercel Preview environment cannot fall back to Production Supabase (dthlgsnakhoftinssokm). Set SUPABASE_URL or VITE_SUPABASE_URL to Preview project (pvwwtquuexhyydwihjbi).');
  }
  return `${base.replace(/\/$/, '')}/rest/v1`;
}

export default async function handler(req: Request): Promise<Response> {
  const reqUrl = new URL(req.url);
  const viewParam = reqUrl.searchParams.get('view');
  const hasExplicitPage = reqUrl.searchParams.has('page');
  const pageParam = parseInt(reqUrl.searchParams.get('page') || '1', 10);
  const page = isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const shardOffset = (page - 1) * PAGE_SIZE;

  const authHeaders = {
    'apikey': getSupabaseAnonKey(),
    'Authorization': `Bearer ${getSupabaseAnonKey()}`,
  };

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
        'Vercel-Cache-Tag': 'sitemap-passport,sitemaps',
        'Cache-Tag': 'sitemap,sitemap-passport',
        'Surrogate-Key': 'sitemap,sitemap-passport',
        'X-Robots-Tag': 'noindex, follow',
        'X-Render-Engine': 'TalentXcel-Dynamic-Passport-Sitemap-Index',
      },
    });
  }

  // Paginated fetch in 1,000-row batches so PostgREST row caps never drop profiles
  const allShardProfiles: PassportSitemapRecord[] = [];
  for (let batchOffset = 0; batchOffset < PAGE_SIZE; batchOffset += POSTGREST_BATCH_SIZE) {
    const remaining = PAGE_SIZE - batchOffset;
    const batchLimit = Math.min(POSTGREST_BATCH_SIZE, remaining);
    const currentOffset = shardOffset + batchOffset;
    const url = `${getSupabaseRestUrl()}/public_profiles?select=username,full_name,skills,headline,about,title,location,experience_years,current_company,is_profile_public,profile_visibility,created_at&order=created_at.desc&limit=${batchLimit}&offset=${currentOffset}`;

    try {
      const res = await fetch(url, { headers: authHeaders });
      if (!res.ok) break;
      const batch = await res.json();
      if (!Array.isArray(batch) || batch.length === 0) break;
      allShardProfiles.push(...batch);
      if (batch.length < batchLimit) break; // Reached final record in DB
    } catch {
      break;
    }
  }

  const xml = buildPassportUrlsetXml(allShardProfiles, page === 1);

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'Vercel-Cache-Tag': 'sitemap-passport,sitemaps',
      'Cache-Tag': 'sitemap,sitemap-passport',
      'Surrogate-Key': 'sitemap,sitemap-passport',
      'X-Robots-Tag': 'noindex, follow',
      'X-Render-Engine': 'TalentXcel-Dynamic-Passport-Sitemap',
    },
  });
}
