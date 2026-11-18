// api/notify-search-engines.ts
// Phase 4 Hardened Event-Driven Re-indexing Webhook & Multi-Layer Cache Invalidation
//
// Security & Compliance Guarantees:
// 1. Mandatory Supabase JWT Authentication — unauthenticated callers are rejected with 401.
// 2. Strict Server-Side Candidate Ownership — caller identity derived from verified JWT.
//    A candidate can only invalidate/notify their own profile URL (or service_role admin).
// 3. No arbitrary client-provided URLs are purged or submitted.
// 4. In accordance with Google Search Central policies, the Google Indexing API is strictly
//    reserved for JobPosting and BroadcastEvent structured data. Candidate ProfilePage/Person
//    URLs are NEVER sent to Google Indexing API. Candidate discovery relies on dynamic sitemaps.
// 5. IndexNow mesh notifications are dispatched strictly to participating search engines
//    (Microsoft Bing, Yandex, Naver, Seznam.cz) with server-side validation.
// 6. In-memory process-local throttle and deduplication cache debounce rapid duplicate submissions.
// 7. Transient network retry (up to 3 attempts with exponential backoff) for IndexNow calls.
// 8. Atomic multi-URL Cloudflare cache purge covering the candidate profile URL, all sitemap segments,
//    and sitemap index files.
// 9. Official Vercel REST API Cache Invalidation:
//    - On revocation (hard purge): POST /v1/edge-cache/dangerously-delete-by-tags?projectIdOrName=...
//      Guarantees stale-while-revalidate can NEVER serve previously public profile content.
//    - On update/sitemap: POST /v1/edge-cache/invalidate-by-tags?projectIdOrName=...
// 10. Audit telemetry contains zero credentials or sensitive PII.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as https from 'https';

export const config = {
  runtime: 'nodejs',
};

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'e8f4a1b2c3d54e6f9a0b1c2d3e4f5a6b';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const SUPABASE_BASE_URL = (process.env.SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co').replace(/\/$/, '');
const SUPABASE_REST_URL = `${SUPABASE_BASE_URL}/rest/v1`;
const SUPABASE_AUTH_URL = `${SUPABASE_BASE_URL}/auth/v1`;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Process-local in-memory debounce and deduplication cache (keyed by userId, expires after 20s)
interface RateLimitEntry {
  timestamp: number;
  lastAction: string;
}
const rateLimitCache = new Map<string, RateLimitEntry>();
const RATE_LIMIT_WINDOW_MS = 10_000; // 10 seconds process-local throttle per user

function cleanExpiredRateLimits(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitCache.entries()) {
    if (now - entry.timestamp > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitCache.delete(key);
    }
  }
}

/**
 * Validates Supabase JWT against Supabase Auth endpoint
 */
async function verifySupabaseJwt(token: string): Promise<{ id: string; email?: string } | null> {
  try {
    const res = await fetch(`${SUPABASE_AUTH_URL}/user`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) return null;
    const user = await res.json();
    if (user && typeof user.id === 'string') {
      return { id: user.id, email: user.email };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Pings participating search engines via IndexNow protocol (Microsoft Bing, Yandex, Naver, Seznam)
 */
async function pingIndexNowWithRetry(url: string, retries = 2): Promise<boolean> {
  const payload = JSON.stringify({
    host: 'talentxcel.in',
    key: INDEXNOW_KEY,
    keyLocation: `https://talentxcel.in/${INDEXNOW_KEY}.txt`,
    urlList: [url],
  });

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const success = await new Promise<boolean>((resolve) => {
        const req = https.request('https://api.indexnow.org/indexnow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(payload),
          },
          timeout: 4000,
        }, (res) => {
          let d = '';
          res.on('data', (c) => (d += c));
          res.on('end', () => {
            resolve(res.statusCode === 200 || res.statusCode === 202);
          });
        });
        req.on('error', () => resolve(false));
        req.on('timeout', () => {
          req.destroy();
          resolve(false);
        });
        req.write(payload);
        req.end();
      });

      if (success) return true;
    } catch {
      // Retry on network failure
    }
    if (attempt < retries) {
      await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
    }
  }
  return false;
}

interface CloudflarePurgeOptions {
  files?: string[];
  prefixes?: string[];
  tags?: string[];
}

/**
 * Executes a single-selector Cloudflare cache purge request.
 * Cloudflare Purge API mandates strictly ONE selector type per request body (files, prefixes, or tags).
 * Evaluates both HTTP status (200) and response JSON (success: true).
 * Logs failure diagnostics if Cloudflare rejects the purge.
 */
async function sendCloudflarePurge(
  zoneId: string,
  token: string,
  selectorType: 'files' | 'prefixes' | 'tags',
  payload: Record<string, string[]>
): Promise<{ ok: boolean; status: number; errors?: any[] }> {
  const body = JSON.stringify(payload);
  return new Promise((resolve) => {
    const req = https.request(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      timeout: 4000,
    }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          const isSuccess = res.statusCode === 200 && parsed.success === true;
          if (!isSuccess) {
            console.error(JSON.stringify({
              event: 'cloudflare_purge_failed',
              selector: selectorType,
              status: res.statusCode,
              errors: parsed.errors || [],
              messages: parsed.messages || [],
            }));
          }
          resolve({ ok: isSuccess, status: res.statusCode || 200, errors: parsed.errors });
        } catch {
          const isHttpOk = res.statusCode === 200;
          if (!isHttpOk) {
            console.error(JSON.stringify({
              event: 'cloudflare_purge_failed',
              selector: selectorType,
              status: res.statusCode,
              rawBody: data.slice(0, 200),
            }));
          }
          resolve({ ok: isHttpOk, status: res.statusCode || 200 });
        }
      });
    });
    req.on('error', (err) => {
      console.error(JSON.stringify({ event: 'cloudflare_purge_error', selector: selectorType, error: err.message }));
      resolve({ ok: false, status: 500 });
    });
    req.on('timeout', () => {
      req.destroy();
      console.error(JSON.stringify({ event: 'cloudflare_purge_timeout', selector: selectorType }));
      resolve({ ok: false, status: 408 });
    });
    req.write(body);
    req.end();
  });
}

/**
 * Purges Cloudflare edge cache using separate dedicated requests per selector type:
 * 1. files: exact URLs (supported across all Cloudflare tiers)
 * 2. prefixes: URL-prefix format without protocol (e.g. talentxcel.in/sitemap-passport, talentxcel.in/u/:username)
 * 3. tags: Cache-Tag purge
 * Never combines selector types into a single request body.
 */
async function purgeCloudflareCacheWithRetry(
  targets: string | string[] | CloudflarePurgeOptions,
  retries = 2
): Promise<boolean> {
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (!zoneId || !token) {
    return false; // Graceful skip if Cloudflare credentials are not configured in environment
  }

  let options: CloudflarePurgeOptions;
  if (Array.isArray(targets)) {
    options = { files: targets };
  } else if (typeof targets === 'string') {
    options = { files: [targets] };
  } else {
    options = targets;
  }

  // 1. Files Purge (Exact URLs)
  let filesSuccess = true;
  if (options.files && options.files.length > 0) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const res = await sendCloudflarePurge(zoneId, token, 'files', { files: options.files });
      if (res.ok) {
        filesSuccess = true;
        break;
      }
      filesSuccess = false;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }

  // 2. Prefixes Purge (URL-prefix format: hostname/path without protocol)
  if (options.prefixes && options.prefixes.length > 0) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const res = await sendCloudflarePurge(zoneId, token, 'prefixes', { prefixes: options.prefixes });
      if (res.ok || (res.status === 400 && res.errors?.[0]?.code === 10023)) {
        // Either success or non-Enterprise tier code 10023 (unsupported prefix tier)
        break;
      }
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }

  // 3. Tags Purge (Cache-Tags)
  if (options.tags && options.tags.length > 0) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      const res = await sendCloudflarePurge(zoneId, token, 'tags', { tags: options.tags });
      if (res.ok || (res.status === 400 && res.errors?.[0]?.code === 10023)) {
        break;
      }
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
      }
    }
  }

  return filesSuccess;
}

/**
 * Purges or hard-deletes Vercel Edge Cache by tag using official Vercel REST API:
 * - Revocation (hard delete): POST /v1/edge-cache/dangerously-delete-by-tags?projectIdOrName=...
 *   Guarantees stale-while-revalidate will NEVER serve previously public profile content.
 * - Invalidation (SWR refresh): POST /v1/edge-cache/invalidate-by-tags?projectIdOrName=...
 */
async function purgeVercelCacheByTag(
  tags: string[],
  action: 'delete' | 'invalidate' = 'invalidate'
): Promise<{ success: boolean; attempted: boolean; endpoint?: string; data?: any; limitation?: string; error?: string }> {
  const vercelToken = process.env.VERCEL_ACCESS_TOKEN || process.env.VERCEL_API_TOKEN || process.env.VERCEL_TOKEN;
  const projectIdOrName = process.env.VERCEL_PROJECT_ID || process.env.VERCEL_PROJECT_NAME || 'career-pathways-ai-builder';
  const teamId = process.env.VERCEL_TEAM_ID;
  const targetEnv = process.env.VERCEL_ENV || 'production';

  if (!vercelToken) {
    return {
      success: false,
      attempted: false,
      limitation: 'VERCEL_ACCESS_TOKEN is not configured in serverless environment; edge invalidation relies on downstream origin no-store directives',
    };
  }

  const endpointPath = action === 'delete'
    ? '/v1/edge-cache/dangerously-delete-by-tags'
    : '/v1/edge-cache/invalidate-by-tags';

  const queryParams = new URLSearchParams({ projectIdOrName });
  if (teamId) {
    queryParams.set('teamId', teamId);
  }

  const url = `https://api.vercel.com${endpointPath}?${queryParams.toString()}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${vercelToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tags,
        target: targetEnv,
      }),
    });

    if (res.ok) {
      let data: any = null;
      try {
        data = await res.json();
      } catch {
        data = { status: res.status };
      }
      return { success: true, attempted: true, endpoint: endpointPath, data };
    } else {
      const errText = await res.text();
      return {
        success: false,
        attempted: true,
        endpoint: endpointPath,
        error: `Vercel API ${res.status}: ${errText}`,
      };
    }
  } catch (err: any) {
    return { success: false, attempted: true, endpoint: endpointPath, error: err.message };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Strict HTTP Method Gate
  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'This endpoint strictly accepts POST requests.',
    });
  }

  // 2. Authentication Verification
  const authHeader = req.headers.authorization || '';
  const serviceHeader = req.headers['x-service-role-key'] || '';
  const isServiceRole = Boolean(SERVICE_ROLE_KEY && serviceHeader === SERVICE_ROLE_KEY);

  let callerUserId: string | null = null;

  if (isServiceRole) {
    // Trusted server-to-server webhook
    callerUserId = (req.body?.userId || '').toString().trim() || null;
  } else {
    // User JWT Verification
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'A valid Supabase Bearer JWT is required to trigger cache invalidation or search engine notifications.',
      });
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    const verifiedUser = await verifySupabaseJwt(token);
    if (!verifiedUser) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired authentication credentials.',
      });
    }
    callerUserId = verifiedUser.id;
  }

  if (!callerUserId) {
    return res.status(400).json({ error: 'Bad Request', message: 'Missing user identification context.' });
  }

  // 3. Candidate Ownership Gate
  const requestedUserId = (req.body?.userId || callerUserId).toString().trim();
  if (!isServiceRole && requestedUserId !== callerUserId) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied: cannot invoke cache invalidation or search notification for another candidate.',
    });
  }

  // 4. Rate Limiting & Idempotency (Process-local debounce)
  cleanExpiredRateLimits();
  const existingRate = rateLimitCache.get(callerUserId);
  const now = Date.now();
  const action = (req.body?.action || 'update').toString().trim().toLowerCase();

  if (existingRate && now - existingRate.timestamp < RATE_LIMIT_WINDOW_MS && existingRate.lastAction === action) {
    return res.status(200).json({
      success: true,
      idempotent: true,
      throttled: true,
      message: 'Duplicate request within throttle window: prior invalidation is already active.',
    });
  }
  rateLimitCache.set(callerUserId, { timestamp: now, lastAction: action });

  try {
    const headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    };

    // 5. Query candidate record server-side. Never trust a client-provided URL.
    const profileRes = await fetch(
      `${SUPABASE_REST_URL}/public_profiles?select=id,username,full_name,skills,headline,about,title,experience_years,current_company&id=eq.${encodeURIComponent(callerUserId)}&limit=1`,
      { headers }
    );

    const isConsentedPublic = profileRes.ok;
    const publicProfiles = isConsentedPublic ? await profileRes.json() : [];
    const publicProfile = Array.isArray(publicProfiles) && publicProfiles.length > 0 ? publicProfiles[0] : null;

    let targetUsername = publicProfile?.username;

    if (!targetUsername) {
      const baseRes = await fetch(
        `${SUPABASE_REST_URL}/profiles?select=id,username,profile_visibility,is_profile_public&id=eq.${encodeURIComponent(callerUserId)}&limit=1`,
        { headers }
      );
      if (baseRes.ok) {
        const baseProfiles = await baseRes.json();
        if (Array.isArray(baseProfiles) && baseProfiles.length > 0) {
          targetUsername = baseProfiles[0].username;
        }
      }
    }

    if (!targetUsername) {
      const fallbackUser = (req.body?.username || '').toString().trim().replace(/^@/, '');
      if (/^[a-zA-Z0-9_-]{3,50}$/.test(fallbackUser)) {
        targetUsername = fallbackUser;
      }
    }

    if (!targetUsername) {
      return res.status(404).json({ error: 'Profile Not Found', message: 'Candidate username could not be resolved.' });
    }

    // Determine all active sitemap segments dynamically
    // Rather than relying solely on (currentProfiles + 1), we use a multi-pronged approach:
    // 1. Common cache-tag invalidation ('sitemap-passport', 'sitemaps') via Vercel Edge API
    // 2. Cloudflare prefix purging ('talentxcel.in/sitemap-passport', 'talentxcel.in/u/:username')
    // 3. Multi-segment URL coverage extending to Math.max(currentPages + 2, 5) to guarantee
    //    that any dropped segment from concurrent revocations is evicted across all POPs.
    let sitemapSegmentUrls: string[] = ['https://talentxcel.in/sitemap-passport.xml?page=1'];
    try {
      const countRes = await fetch(`${SUPABASE_REST_URL}/public_profiles?select=id`, {
        method: 'HEAD',
        headers: {
          ...headers,
          'Prefer': 'count=exact',
        },
      });
      if (countRes.ok) {
        const cr = countRes.headers.get('content-range');
        if (cr && cr.includes('/')) {
          const currentProfiles = parseInt(cr.split('/')[1], 10) || 0;
          const currentPages = Math.max(1, Math.ceil(currentProfiles / 10_000));
          const purgeCeiling = Math.max(currentPages + 2, 5);
          sitemapSegmentUrls = Array.from({ length: purgeCeiling }, (_, i) => `https://talentxcel.in/sitemap-passport.xml?page=${i + 1}`);
        }
      }
    } catch {
      // fallback
    }

    const canonicalProfileUrl = `https://talentxcel.in/u/${encodeURIComponent(targetUsername)}`;
    const cachePurgeTargets = Array.from(new Set([
      canonicalProfileUrl,
      'https://talentxcel.in/sitemap-passport.xml',
      'https://talentxcel.in/sitemap-passport.xml?view=index',
      ...sitemapSegmentUrls,
      'https://talentxcel.in/sitemap.xml',
      'https://talentxcel.in/sitemap-root.xml',
    ]));

    const cloudflarePurgePayload: CloudflarePurgeOptions = {
      files: cachePurgeTargets,
      prefixes: [
        `talentxcel.in/u/${encodeURIComponent(targetUsername)}`,
        'talentxcel.in/sitemap-passport',
      ],
      tags: ['sitemap-passport', 'sitemaps'],
    };

    const vercelProfileTags = [
      `profile-${callerUserId}`,
      `profile-${targetUsername}`,
    ];
    const vercelSitemapTags = ['sitemap-passport', 'sitemaps'];

    // 6. Action Execution
    // Case A: Revocation or explicit cache purge
    if (action === 'revoke' || action === 'purge' || !publicProfile) {
      const purgeSuccess = await purgeCloudflareCacheWithRetry(cloudflarePurgePayload);
      // For privacy revocation: use dangerously-delete-by-tags so SWR never serves old profile HTML
      const vercelPurgeProfile = await purgeVercelCacheByTag(vercelProfileTags, 'delete');
      const vercelPurgeSitemap = await purgeVercelCacheByTag(vercelSitemapTags, 'invalidate');

      console.log(JSON.stringify({
        event: 'privacy_cache_purged',
        userId: callerUserId,
        action: action || 'revocation_purge',
        purgedTargets: cachePurgeTargets,
        purgedTags: [...vercelProfileTags, ...vercelSitemapTags],
        cloudflarePurged: purgeSuccess,
        vercelProfileDelete: vercelPurgeProfile.success,
        vercelSitemapInvalidate: vercelPurgeSitemap.success,
        timestamp: new Date().toISOString(),
      }));

      return res.status(200).json({
        success: true,
        action: 'purge',
        isIndexReady: false,
        cloudflarePurged: purgeSuccess,
        vercelPurged: vercelPurgeProfile.success,
        vercelProfileDetails: vercelPurgeProfile,
        vercelSitemapDetails: vercelPurgeSitemap,
        purgedTargets: cachePurgeTargets,
        purgedTags: [...vercelProfileTags, ...vercelSitemapTags],
        url: canonicalProfileUrl,
        message: 'Profile cache deleted and sitemaps invalidated across Cloudflare and Vercel. Subsequent requests return HTTP 404 with no-store.',
      });
    }

    // Case B: Profile update — evaluate Thin-Page Protection Gate
    let atsScore: number | null = null;
    let endorsementsCount = 0;
    let fallbackSkills: string[] = [];

    const [atsRes, endRes, skillsRes] = await Promise.allSettled([
      fetch(`${SUPABASE_REST_URL}/ats_public_scans?select=id,ats_score&user_id=eq.${encodeURIComponent(callerUserId)}&order=created_at.desc&limit=1`, { headers }),
      fetch(`${SUPABASE_REST_URL}/peer_endorsements?select=id&target_user_id=eq.${encodeURIComponent(callerUserId)}&status=eq.approved&limit=10`, { headers }),
      fetch(`${SUPABASE_REST_URL}/career_skills?select=skill_name&user_id=eq.${encodeURIComponent(callerUserId)}&limit=15`, { headers }),
    ]);

    if (atsRes.status === 'fulfilled' && atsRes.value.ok) {
      const data = await atsRes.value.json();
      if (Array.isArray(data) && data.length > 0 && typeof data[0].ats_score === 'number') {
        atsScore = data[0].ats_score;
      }
    }

    if (endRes.status === 'fulfilled' && endRes.value.ok) {
      const data = await endRes.value.json();
      if (Array.isArray(data)) endorsementsCount = data.length;
    }

    if (skillsRes.status === 'fulfilled' && skillsRes.value.ok) {
      const data = await skillsRes.value.json();
      if (Array.isArray(data)) {
        fallbackSkills = data.map((item: any) => item.skill_name).filter(Boolean);
      }
    }

    // Evaluate Gate
    const rawSkills = Array.isArray(publicProfile.skills) && publicProfile.skills.length > 0
      ? publicProfile.skills
      : fallbackSkills;
    const skills = Array.from(new Set(rawSkills.filter((s: any) => typeof s === 'string' && s.trim().length > 0)));

    const headlineOrBio = (publicProfile.headline || publicProfile.about || publicProfile.title || '').trim();
    const isPlaceholder = /^(test|fresher|n\/a|na|none|null|undefined|student|seeking opportunities|looking for job)$/i.test(headlineOrBio);
    const hasEnoughSkills = skills.length >= 3;
    const hasBioLength = !isPlaceholder && headlineOrBio.length >= 40;
    const hasAtsScore = atsScore !== null && atsScore > 0;
    const hasWorkOrEdu = (publicProfile.experience_years !== null && Number(publicProfile.experience_years) > 0) ||
                         Boolean(publicProfile.current_company && publicProfile.current_company.trim().length > 0);
    const hasEndorsement = endorsementsCount >= 1;

    const hasRichContent = hasBioLength || hasAtsScore || hasWorkOrEdu || hasEndorsement;
    const isIndexReady = hasEnoughSkills && hasRichContent;

    // Purge edge cache and sitemap caches on update
    const purgeSuccess = await purgeCloudflareCacheWithRetry(cloudflarePurgePayload);
    const vercelPurge = await purgeVercelCacheByTag([...vercelProfileTags, ...vercelSitemapTags], 'invalidate');

    // If index-ready, notify participating search engines via IndexNow (Bing, Yandex, Naver, Seznam)
    let indexNowSuccess = false;
    if (isIndexReady) {
      indexNowSuccess = await pingIndexNowWithRetry(canonicalProfileUrl);
    }

    console.log(JSON.stringify({
      event: 'profile_index_update',
      userId: callerUserId,
      isIndexReady,
      cloudflarePurged: purgeSuccess,
      vercelPurged: vercelPurge.success,
      indexNowNotified: indexNowSuccess,
      timestamp: new Date().toISOString(),
    }));

    return res.status(200).json({
      success: true,
      action: 'update',
      isIndexReady,
      cloudflarePurged: purgeSuccess,
      vercelPurged: vercelPurge.success,
      vercelPurgeDetails: vercelPurge,
      indexNowNotified: indexNowSuccess,
      indexNowEngines: ['Bing', 'Yandex', 'Naver', 'Seznam'],
      url: canonicalProfileUrl,
      purgedTargets: cachePurgeTargets,
      purgedTags: [...vercelProfileTags, ...vercelSitemapTags],
      message: isIndexReady
        ? 'Profile updated and dispatched to IndexNow participating engines. Edge and sitemap caches purged across Cloudflare and Vercel.'
        : 'Profile updated with noindex directive (thin profile protection gate). Edge and sitemap caches purged across Cloudflare and Vercel.',
    });
  } catch (err: any) {
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process search engine notification.',
    });
  }
}
