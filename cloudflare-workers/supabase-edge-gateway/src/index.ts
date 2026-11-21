import {
  Env,
  WorkerExecutionContext,
  PUBLIC_CACHEABLE_ENTITIES,
  SENSITIVE_PRIVATE_ENTITIES,
  SENSITIVE_QUERY_PATTERNS,
  SUPPORTED_PREFER_DIRECTIVES,
} from './types';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'apikey, Authorization, Content-Type, Range, Prefer, X-Client-Info',
  'Access-Control-Expose-Headers': 'Content-Range, X-Total-Count, Content-Length, ETag',
};

/**
 * Extracts PostgREST entity name from pathname (e.g. /rest/v1/jobs -> 'jobs')
 */
function extractEntity(pathname: string): string | null {
  const match = pathname.match(/\/rest\/v1\/([^/?]+)/);
  return match ? match[1] : null;
}

/**
 * Normalizes request variance headers (Accept, Prefer) that materially affect
 * the PostgREST response body or pagination structure.
 */
function extractVarianceDimensions(headers: Headers): {
  accept: string;
  prefer: string;
} {
  const rawAccept = headers.get('Accept') || '';
  let accept = 'application/json';
  if (rawAccept.includes('text/csv')) {
    accept = 'text/csv';
  } else if (rawAccept.includes('application/vnd.pgrst.object+json')) {
    accept = 'application/vnd.pgrst.object+json';
  } else if (rawAccept.includes('application/openapi+json')) {
    accept = 'application/openapi+json';
  }

  const rawPrefer = (headers.get('Prefer') || '').toLowerCase();
  let prefer = '';
  if (rawPrefer) {
    const directives = rawPrefer.split(',').map((d) => d.trim()).filter(Boolean);
    prefer = directives.sort().join(';');
  }

  return { accept, prefer };
}

/**
 * Generates a deterministic canonical cache key Request.
 * - Sorts query parameter keys alphabetically.
 * - Strictly PRESERVES the relative order of duplicate values for each key (never sorts values).
 * - Ignores/filters internal discriminator keys from query input.
 * - Binds request variance dimensions (__cg_accept, __cg_prefer) to prevent cache collisions.
 */
export function getCanonicalCacheKey(targetUrl: URL, headers: Headers): Request {
  const canonicalUrl = new URL(targetUrl.toString());

  // Group search parameters by key in alphabetical order without altering value order
  const paramMap = new Map<string, string[]>();
  for (const [key, value] of targetUrl.searchParams.entries()) {
    if (key.startsWith('__cg_')) continue; // Ignore internal discriminators in incoming queries
    if (!paramMap.has(key)) {
      paramMap.set(key, []);
    }
    paramMap.get(key)!.push(value);
  }

  const sortedKeys = Array.from(paramMap.keys()).sort();
  const sortedParams = new URLSearchParams();
  for (const key of sortedKeys) {
    const values = paramMap.get(key)!;
    for (const val of values) {
      sortedParams.append(key, val);
    }
  }

  // Bind request variance dimensions
  const variance = extractVarianceDimensions(headers);
  sortedParams.set('__cg_accept', variance.accept);
  if (variance.prefer) {
    sortedParams.set('__cg_prefer', variance.prefer);
  }

  canonicalUrl.search = sortedParams.toString();
  return new Request(canonicalUrl.toString(), { method: 'GET' });
}

/**
 * Strict fail-closed security boundary for cache eligibility.
 * 
 * Strict Staging Readiness Invariants:
 * 1. Method must be GET or HEAD.
 * 2. Range header: Conservatively BYPASSES all requests carrying a Range header.
 * 3. Client discriminator collision: Reject/BYPASS any query parameter starting with `__cg_`.
 * 4. Prefer validation: Only explicitly supported count directives allowed; any other directive BYPASSES.
 * 5. Allowlisted public entity: Only verified public catalog/directory tables (jobs, companies, etc.).
 * 6. Sensitive entities: Explicit denylist strictly BYPASSES.
 * 7. Sensitive query filters: Reject queries targeting user/profile/employer IDs.
 * 8. Cookies: Any cookie strictly BYPASSES.
 * 9. Exact trusted anonymous key match:
 *    - If Authorization present: must strictly equal `Bearer ${env.SUPABASE_ANON_KEY}`.
 *    - If Authorization absent: apikey must strictly equal `env.SUPABASE_ANON_KEY`.
 *    - If env.SUPABASE_ANON_KEY not set: all caching disabled.
 */
export function isPublicCacheable(
  req: Request,
  entity: string | null,
  url: URL,
  env: Env
): boolean {
  // 1. Method check: strictly idempotent safe reads
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return false;
  }

  // 2. Conservative Range Gate: strictly BYPASS any request with a Range header
  if (req.headers.has('Range') || req.headers.has('range')) {
    return false;
  }

  // 3. Client Discriminator Collision Gate: Reject client-supplied reserved parameters
  for (const key of url.searchParams.keys()) {
    if (key.startsWith('__cg_')) {
      return false; // Prevent client collision with internal cache namespace
    }
  }

  // 4. Prefer Directive Gate: Only explicitly supported directives allowed
  const preferHeader = req.headers.get('Prefer') || '';
  if (preferHeader) {
    const directives = preferHeader.split(',').map((d) => d.trim().toLowerCase()).filter(Boolean);
    for (const directive of directives) {
      if (!SUPPORTED_PREFER_DIRECTIVES.has(directive)) {
        return false; // Unsupported or ambiguous Prefer directive -> fail closed to BYPASS
      }
    }
  }

  // 5. Allowlisted public entity check
  if (!entity || !PUBLIC_CACHEABLE_ENTITIES.has(entity)) {
    return false;
  }

  // 6. Sensitive / private entity denylist
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

  // 7. Reject user-identifying or sensitive query parameters
  const searchLower = url.search.toLowerCase();
  for (const pattern of SENSITIVE_QUERY_PATTERNS) {
    if (searchLower.includes(`${pattern}=`) || searchLower.includes(`.${pattern}`)) {
      return false;
    }
  }

  // 8. Reject any session or authentication cookies
  const cookieHeader = req.headers.get('Cookie') || '';
  if (
    cookieHeader.includes('sb-') ||
    cookieHeader.includes('auth-token') ||
    cookieHeader.includes('access_token') ||
    cookieHeader.includes('supabase-auth') ||
    cookieHeader.includes('token=')
  ) {
    return false;
  }

  // 9. Trusted Credential Validation (Fail-Closed)
  const trustedAnonKey = env.SUPABASE_ANON_KEY?.trim();
  if (!trustedAnonKey) {
    // If trusted anon key is not configured in environment, fail closed
    return false;
  }

  const authHeader = req.headers.get('Authorization')?.trim() || '';
  const apiKeyHeader = req.headers.get('apikey')?.trim() || url.searchParams.get('apikey')?.trim() || '';

  if (authHeader) {
    // If Authorization is supplied, it MUST match the exact trusted anonymous key
    if (authHeader !== `Bearer ${trustedAnonKey}`) {
      return false;
    }
  } else {
    // If Authorization is absent, apikey MUST match the exact trusted anonymous key
    if (apiKeyHeader !== trustedAnonKey) {
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

    const origin = env.SUPABASE_ORIGIN || 'https://dthlgsnakhoftinssokm.supabase.co';

    // 3. Protected Cache Purge Endpoint
    if (url.pathname === '/purge' && req.method === 'POST') {
      const authKey = req.headers.get('X-Purge-Key');
      if (!env.PURGE_API_KEY || !authKey || authKey !== env.PURGE_API_KEY) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized purge request' }),
          { status: 401, headers: CORS_HEADERS }
        );
      }

      const body = (await req.json().catch(() => ({}))) as {
        targetUrl?: string;
        entity?: string;
        accept?: string;
        prefer?: string;
      };

      if (!body.targetUrl && !body.entity) {
        return new Response(
          JSON.stringify({ error: 'Missing targetUrl or entity in purge payload' }),
          { status: 400, headers: CORS_HEADERS }
        );
      }

      const cache = (caches as any).default;
      if (cache) {
        try {
          const purgeTarget = body.targetUrl || `${origin}/rest/v1/${body.entity}`;
          const purgeHeaders = new Headers({
            'Accept': body.accept || 'application/json',
            'Prefer': body.prefer || '',
          });
          const canonicalKey = getCanonicalCacheKey(new URL(purgeTarget, origin), purgeHeaders);
          const wasCached = await cache.delete(canonicalKey);
          return new Response(
            JSON.stringify({ success: true, purged: canonicalKey.url, wasCached }),
            { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
          );
        } catch (err: any) {
          return new Response(
            JSON.stringify({ error: 'Purge execution failure', details: err?.message || String(err) }),
            { status: 500, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
          );
        }
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Purge accepted (no cache store)' }),
        { status: 200, headers: { 'Content-Type': 'application/json', ...CORS_HEADERS } }
      );
    }

    const entity = extractEntity(url.pathname);
    const targetUrl = new URL(url.pathname + url.search, origin);

    const publicCacheable = isPublicCacheable(req, entity, url, env);

    // 4. Edge Cache Evaluation (Cloudflare Cache API)
    const cache = (caches as any).default;
    const cacheKey = getCanonicalCacheKey(targetUrl, req.headers);

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
        // Cache read failure resilience: log and transparently fall through to origin
        console.error('[Edge Gateway Cache Match Error]', err);
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

    // Prepare client response headers
    const clientHeaders = new Headers(originRes.headers);
    for (const [k, v] of Object.entries(CORS_HEADERS)) {
      clientHeaders.set(k, v);
    }

    // 6. Cache Storage Decision
    // Strictly require publicCacheable AND origin status 200 OK (reject 206, 3xx, 4xx, 5xx)
    if (publicCacheable && originRes.status === 200) {
      const ttl = Number(env.DEFAULT_PUBLIC_TTL) || 120; // 2 minutes default
      const maxStale = Number(env.MAX_PUBLIC_TTL) || 300; // 5 minutes stale-while-revalidate

      clientHeaders.set(
        'Cache-Control',
        `public, max-age=${ttl}, s-maxage=${ttl}, stale-while-revalidate=${maxStale}`
      );
      clientHeaders.set('CF-Cache-Status', 'MISS');
      clientHeaders.set('X-Edge-Origin', 'Supabase-Origin');

      // Strip Set-Cookie from public response (anonymous public reads do not need tracking cookies)
      clientHeaders.delete('Set-Cookie');
      clientHeaders.delete('set-cookie');

      // Prepare sanitized headers specifically for edge cache storage
      const cacheHeaders = new Headers(clientHeaders);
      cacheHeaders.delete('Set-Cookie');
      cacheHeaders.delete('set-cookie');
      cacheHeaders.delete('Pragma');
      cacheHeaders.delete('Expires');
      cacheHeaders.delete('sb-request-id');
      cacheHeaders.delete('x-envoy-upstream-service-time');

      const responseToCache = new Response(originRes.clone().body, {
        status: originRes.status,
        statusText: originRes.statusText,
        headers: cacheHeaders,
      });

      if (cache) {
        ctx.waitUntil(
          cache.put(cacheKey, responseToCache).catch((err: any) => {
            // Cache write failure resilience: log without interrupting client response
            console.error('[Edge Gateway Cache Put Error]', err);
          })
        );
      }
    } else {
      // Non-public, authenticated, or non-200 responses MUST NEVER be stored at the shared edge
      clientHeaders.set('Cache-Control', 'private, no-cache, no-store, max-age=0, must-revalidate');
      clientHeaders.set('CF-Cache-Status', 'BYPASS');
      clientHeaders.set('X-Edge-Origin', 'Supabase-Origin');
    }

    return new Response(originRes.body, {
      status: originRes.status,
      statusText: originRes.statusText,
      headers: clientHeaders,
    });
  },
};
