// supabase/functions/_shared/cors.ts
// Production Hardened CORS Configuration for TalentXcel Edge Functions (SEC-009)

export const ALLOWED_ORIGINS = [
  'https://talentxcel.in',
  'https://www.talentxcel.in',
  'https://jobs.talentxcel.in',
  'https://employers.talentxcel.in',
  'https://employer.talentxcel.in',
  'https://recruiter.talentxcel.in',
  'https://admin.talentxcel.in',
  'https://resume.talentxcel.in',
  'https://learning.talentxcel.in',
  'https://colleges.talentxcel.in',
  'https://careers.talentxcel.in',
  'https://salary.talentxcel.in',
  'https://passport.talentxcel.in',
  'https://government.talentxcel.in',
  'https://preview.talentxcel.in',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:4173',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:4173',
  'capacitor://localhost',
  'http://localhost',
];

// Strictly anchored preview origin patterns for TalentXcel.in and verified Vercel deployments
export const PREVIEW_ORIGIN_PATTERNS = [
  // Official TalentXcel.in subdomain preview / features
  /^https:\/\/[a-z0-9-]+\.preview\.talentxcel\.in$/,
  /^https:\/\/[a-z0-9-]+\.talentxcel\.in$/,
  // Exact Vercel deployment URLs strictly scoped to the career-pathways-ai-builder project and talentxcelpro team
  /^https:\/\/career-pathways-ai-builder(-[a-z0-9-]+)*-talentxcelpro\.vercel\.app$/,
  /^https:\/\/career-pathways-ai-builder\.vercel\.app$/,
];

export function isAllowedOrigin(origin: string): boolean {
  if (!origin || typeof origin !== 'string') return false;
  const trimmed = origin.trim();
  if (!trimmed) return false;
  if (ALLOWED_ORIGINS.includes(trimmed)) return true;
  return PREVIEW_ORIGIN_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function getCorsHeaders(reqOrOrigin?: Request | string | null): Record<string, string> {
  let origin = '';
  if (reqOrOrigin instanceof Request) {
    origin = reqOrOrigin.headers.get('Origin') || '';
  } else if (typeof reqOrOrigin === 'string') {
    origin = reqOrOrigin;
  }

  const allowed = isAllowedOrigin(origin);
  // If allowed, return the matching caller origin.
  // If not allowed, return primary production origin so browser security fails safely
  // (the browser detects mismatch between requested origin and returned Allow-Origin header).
  const allowOrigin = allowed ? origin : 'https://talentxcel.in';

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Vary': 'Origin',
  };
}

// Fallback constant for legacy callers — strictly points to production origin instead of wildcard '*'
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://talentxcel.in',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
  'Vary': 'Origin',
};
