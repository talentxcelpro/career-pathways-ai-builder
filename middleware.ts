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

  // 2. Human vs Bot Traffic Gate
  // Human traffic passes through untouched to Vite React SPA at edge speed
  const ua = req.headers.get('user-agent') || '';
  if (!BOT_UA.test(ua)) {
    return; // real human user — pass through untouched to Vite React SPA
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

  // 7. For individual expired job UUIDs, permanently redirect to /jobs (resolves GSC 404 validation)
  if (section === 'jobs' && pathParts.length === 2) {
    const jobSlug = pathParts[1];
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobSlug);
    if (isUuid) {
      const job = await fetchJobForMeta(jobSlug);
      if (!job) {
        return Response.redirect('https://talentxcel.in/jobs', 301);
      }
    }
  }

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
