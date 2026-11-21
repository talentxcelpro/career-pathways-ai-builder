import {
  Env,
  WorkerExecutionContext,
  PUBLIC_CACHEABLE_ENTITIES,
  SENSITIVE_PRIVATE_ENTITIES,
  SENSITIVE_QUERY_PATTERNS,
} from './types';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'apikey, Authorization, Content-Type, Range, Prefer, X-Client-Info',
  'Access-Control-Expose-Headers': 'Content-Range, X-Total-Count, Content-Length',
};

/**
 * Safely decodes a JWT payload without external dependencies.
 * Returns null if token is malformed or invalid base64.
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }
    const jsonStr = atob(base64);
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

/**
 * Extracts PostgREST entity name from pathname (e.g. /rest/v1/jobs -> 'jobs')
 */
function extractEntity(pathname: string): string | null {
  const match = pathname.match(/\/rest\/v1\/([^/?]+)/);
  return match ? match[1] : null;
}

/**
 * Generates a deterministic canonical cache key URL by sorting query parameters.
 * E.g., /jobs?select=*&limit=1 and /jobs?limit=1&select=* produce identical cache keys.
 */
function getCanonicalCacheKeyUrl(targetUrl: URL): string {
  const canonicalUrl = new URL(targetUrl.toString());
  const sortedParams = new URLSearchParams();
  const keys = Array.from(canonicalUrl.searchParams.keys()).sort();
  for (const key of keys) {
    const values = canonicalUrl.searchParams.getAll(key).sort();
    for (const val of values) {
      sortedParams.append(key, val);
    }
  }
  canonicalUrl.search = sortedParams.toString();
  return canonicalUrl.toString();
}

/**
 * Strict fail-closed evaluator to determine if a request is eligible for shared public edge caching.
 * Protects against accidental leakage of authenticated, personalized, or sensitive data.
 */
function isPublicCacheable(req: Request, entity: string | null, url: URL): boolean {
  // 1. Only idempotent safe read methods are cacheable
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return false;
  }

  // 2. Must target a known allowlisted public entity
  if (!entity || !PUBLIC_CACHEABLE_ENTITIES.has(entity)) {
    return false;
  }

  // 3. Reject any sensitive private entity or sensitive prefix
  if (SENSITIVE_PRIVATE_ENTITIES.has(entity)) {
    return false;
  }
  if (
    entity.startsWith('user_') ||
    entity.startsWith('auth_') ||
    entity.startsWith('profile') ||
    entity.startsWith('admin_') ||
    entity.startsWith('ai_organization')
  ) {
    return false;
  }

  // 4. Reject requests containing user-specific query parameters
  const searchString = url.search.toLowerCase();
  for (const pattern of SENSITIVE_QUERY_PATTERNS) {
    if (searchString.includes(`${pattern}=`) || searchString.includes(`.${pattern}`)) {
      return false;
    }
  }

  // 5. Reject requests with authenticated session cookies
  const cookieHeader = req.headers.get('Cookie') || '';
  if (
    cookieHeader.includes('sb-') ||
    cookieHeader.includes('auth-token') ||
    cookieHeader.includes('access_token') ||
    cookieHeader.includes('supabase-auth')
  ) {
    return false;
  }

  // 6. Strict JWT Verification on Authorization Header
  const authHeader = req.headers.get('Authorization') || '';
  if (authHeader) {
    if (!authHeader.startsWith('Bearer ')) {
      // Unknown or basic auth scheme -> fail closed
      return false;
    }
    const token = authHeader.slice(7).trim();
    const payload = decodeJwtPayload(token);
    if (!payload) {
      // Malformed or invalid JWT -> fail closed
      return false;
    }

    // Role MUST strictly be 'anon'. Any 'authenticated' or service role MUST BYPASS edge cache.
    if (payload.role !== 'anon') {
      return false;
    }

    // Authenticated users have a 'sub' claim with their UUID; anon keys do not have a user sub
    if (payload.sub && typeof payload.sub === 'string' && payload.sub.length > 0) {
      return false;
    }

    // Audience must not be 'authenticated'
    if (payload.aud === 'authenticated') {
      return false;
    }
  }

  // 7. Verify apikey header if present
  const apiKeyHeader = req.headers.get('apikey') || '';
  if (apiKeyHeader && apiKeyHeader.includes('.')) {
    const apiPayload = decodeJwtPayload(apiKeyHeader);
    if (apiPayload && apiPayload.role && apiPayload.role !== 'anon') {
      return false;
    }
  }

  return true;
}

export default {
  async fetch(req: Request, env: Env, ctx: WorkerExecutionContext): Promise<Response> {
    const url = new URL(req.url);

    // 1. CORS Preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: CORS_HEADERS,
      });
    }

    // 2. Gateway Health Check
    if (url.pathname === '/health' || url.pathname === '/_health') {
      return new Response(
        JSON.stringify({
          status: 'healthy',
          edge: 'Cloudflare Anycast',
          env: env.ENVIRONMENT || 'production',
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
        }
      );
    }

    // 3. Cache Purge Webhook (Protected by secret)
    if (url.pathname === '/purge' && req.method === 'POST') {
      const authKey = req.headers.get('X-Purge-Key');
      if (!env.PURGE_API_KEY || authKey !== env.PURGE_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized purge request' }),
          { status: 401, headers: CORS_HEADERS }
        );
      }

      const body = (await req.json().catch(() => ({}))) as { targetUrl?: string };
      const cache = (caches as any).default;
      if (body.targetUrl && cache) {
        await cache.delete(new Request(body.targetUrl));
        return new Response(
          JSON.stringify({ success: true, purged: body.targetUrl }),
          { status: 200, headers: CORS_HEADERS }
        );
      }
      return new Response(
        JSON.stringify({ success: true, message: 'Purge request accepted' }),
        { status: 200, headers: CORS_HEADERS }
      );
    }

    const entity = extractEntity(url.pathname);
    const origin = env.SUPABASE_ORIGIN || 'https://dthlgsnakhoftinssokm.supabase.co';
    const targetUrl = new URL(url.pathname + url.search, origin);

    const publicCacheable = isPublicCacheable(req, entity, url);

    // 4. Edge Cache Evaluation (Cloudflare Cache API)
    const cache = (caches as any).default;
    const canonicalKeyUrl = getCanonicalCacheKeyUrl(targetUrl);
    const cacheKey = new Request(canonicalKeyUrl, {
      method: 'GET',
    });

    if (publicCacheable && cache) {
      try {
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
          const hitHeaders = new Headers(cachedResponse.headers);
          hitHeaders.set('CF-Cache-Status', 'HIT');
          hitHeaders.set('X-Edge-Origin', 'Cloudflare-Cache');
          for (const [k, v] of Object.entries(CORS_HEADERS)) {
            hitHeaders.set(k, v);
          }
          return new Response(cachedResponse.body, {
            status: cachedResponse.status,
            statusText: cachedResponse.statusText,
            headers: hitHeaders,
          });
        }
      } catch (err) {
        console.error('[Edge Cache Match Error]', err);
      }
    }

    // 5. Proxy to Supabase Origin
    const proxyHeaders = new Headers(req.headers);
    proxyHeaders.set('Host', new URL(origin).host);
    proxyHeaders.delete('cf-connecting-ip');
    proxyHeaders.delete('cf-ray');

    const originReq = new Request(targetUrl.toString(), {
      method: req.method,
      headers: proxyHeaders,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      redirect: 'follow',
    });

    const originRes = await fetch(originReq);

    // Prepare response headers
    const responseHeaders = new Headers(originRes.headers);
    for (const [k, v] of Object.entries(CORS_HEADERS)) {
      responseHeaders.set(k, v);
    }

    // 6. Cache Storage Decision
    // Only cache if public cacheable AND response is 200 OK (reject 206, 4xx, 5xx)
    if (publicCacheable && originRes.status === 200) {
      const ttl = Number(env.DEFAULT_PUBLIC_TTL) || 120; // 2 minutes default
      const maxStale = Number(env.MAX_PUBLIC_TTL) || 300; // 5 minutes stale-while-revalidate

      responseHeaders.set(
        'Cache-Control',
        `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=${maxStale}`
      );
      responseHeaders.set('CF-Cache-Status', 'MISS');
      responseHeaders.set('X-Edge-Origin', 'Supabase-Origin');

      // CRITICAL RFC 7234 & Cloudflare Cache API Compliance:
      // Strip Set-Cookie, Pragma, and Expires before caching.
      // Cloudflare Cache API strictly drops any response with Set-Cookie!
      responseHeaders.delete('Set-Cookie');
      responseHeaders.delete('set-cookie');
      responseHeaders.delete('Pragma');
      responseHeaders.delete('Expires');

      const responseToCache = new Response(originRes.clone().body, {
        status: originRes.status,
        statusText: originRes.statusText,
        headers: responseHeaders,
      });

      if (cache) {
        ctx.waitUntil(
          cache.put(cacheKey, responseToCache).catch((err: any) => {
            console.error('[Edge Cache Put Error]', err);
          })
        );
      }
    } else {
      // Non-public, authenticated, or error responses MUST NEVER be stored at the shared edge
      responseHeaders.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
      responseHeaders.set('CF-Cache-Status', 'BYPASS');
      responseHeaders.set('X-Edge-Origin', 'Supabase-Origin');
    }

    return new Response(originRes.body, {
      status: originRes.status,
      statusText: originRes.statusText,
      headers: responseHeaders,
    });
  },
};
