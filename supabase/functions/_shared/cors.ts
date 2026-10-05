// supabase/functions/_shared/cors.ts
// Production Hardened CORS Configuration for TalentXcel Edge Functions

export const ALLOWED_ORIGINS = [
  'https://talentxcel.in',
  'https://www.talentxcel.in',
  'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:8080',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];

export function getCorsHeaders(reqOrOrigin?: Request | string | null): Record<string, string> {
  let origin = '';
  if (reqOrOrigin instanceof Request) {
    origin = reqOrOrigin.headers.get('Origin') || '';
  } else if (typeof reqOrOrigin === 'string') {
    origin = reqOrOrigin;
  }

  const isAllowed = ALLOWED_ORIGINS.includes(origin);
  // Default to primary production origin if incoming origin is not in allowlist
  const allowOrigin = isAllowed ? origin : 'https://talentxcel.in';

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