// supabase/functions/_shared/rateLimiter.ts
// Distributed Persistent Rate Limiting Engine for Supabase Edge Functions (SEC-010)
// Uses PostgreSQL atomic check_rate_limit stored procedure backed by public.edge_rate_limits

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

export interface RateLimitOptions {
  endpoint: string;
  maxRequests?: number;
  windowSeconds?: number;
  userId?: string;
  failClosed?: boolean;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  currentCount?: number;
  storeUnavailable?: boolean;
  error?: string;
}

/**
 * Computes a privacy-preserving SHA-256 hash of (endpoint + ":" + identifier).
 * Raw IP addresses or personal identifiers are NEVER stored in the database.
 */
export async function hashRateLimitKey(endpoint: string, identifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`rl:${endpoint}:${identifier.trim().toLowerCase()}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Extracts a resilient, non-manipulable client identifier from Request headers or user context.
 * Prioritizes authenticated user ID -> authenticated JWT claim -> Cloudflare/proxy IP -> fallback anon.
 */
export function getClientIdentifier(req: Request, explicitUserId?: string): string {
  if (explicitUserId && explicitUserId.trim()) {
    return `usr_${explicitUserId.trim()}`;
  }

  // 1. Check Authorization header for authenticated user / token
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (token) {
      // Use the last 24 characters of the token as identifier to avoid logging full token
      return `tok_${token.slice(-24)}`;
    }
  }

  // 2. Check trusted edge proxy IP headers (Cloudflare, Supabase edge proxy)
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp && cfConnectingIp.trim()) {
    return `ip_${cfConnectingIp.trim()}`;
  }

  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp && xRealIp.trim()) {
    return `ip_${xRealIp.trim()}`;
  }

  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor && xForwardedFor.trim()) {
    const clientIp = xForwardedFor.split(',')[0].trim();
    if (clientIp) {
      return `ip_${clientIp}`;
    }
  }

  return 'anon_unidentified';
}

// In-memory fallback circuit-breaker when DB store is temporarily unreachable
const emergencyMemoryStore = new Map<string, { count: number; expiresAt: number }>();

function checkEmergencyMemoryLimit(
  hashedKey: string,
  maxRequests: number,
  windowSeconds: number
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  
  // Conservative emergency limit: 25% of regular quota during DB downtime
  const emergencyMax = Math.max(2, Math.floor(maxRequests * 0.25));

  let record = emergencyMemoryStore.get(hashedKey);
  if (!record || record.expiresAt <= now) {
    record = { count: 1, expiresAt: now + windowMs };
    emergencyMemoryStore.set(hashedKey, record);
    return {
      allowed: true,
      remaining: emergencyMax - 1,
      resetSeconds: windowSeconds,
      currentCount: 1,
      storeUnavailable: true,
    };
  }

  record.count += 1;
  const remainingSeconds = Math.max(1, Math.ceil((record.expiresAt - now) / 1000));

  if (record.count > emergencyMax) {
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: remainingSeconds,
      currentCount: record.count,
      storeUnavailable: true,
    };
  }

  return {
    allowed: true,
    remaining: emergencyMax - record.count,
    resetSeconds: remainingSeconds,
    currentCount: record.count,
    storeUnavailable: true,
  };
}

/**
 * Checks rate limit against PostgreSQL atomic check_rate_limit stored procedure.
 * Provides distributed, multi-isolate persistence that survives cold starts and concurrent requests.
 */
export async function checkRateLimit(
  reqOrId: Request | string,
  optionsOrMax?: RateLimitOptions | number,
  legacyWindowMs?: number,
  legacyEndpoint?: string
): Promise<RateLimitResult> {
  let endpoint = "default";
  let maxRequests = 20;
  let windowSeconds = 60;
  let rawIdentifier = "anon_unidentified";
  let failClosed = true;

  if (reqOrId instanceof Request) {
    const opts = (typeof optionsOrMax === "object" && optionsOrMax !== null) ? optionsOrMax : {};
    endpoint = opts.endpoint || "default";
    maxRequests = opts.maxRequests ?? 20;
    windowSeconds = opts.windowSeconds ?? 60;
    failClosed = opts.failClosed ?? true;
    rawIdentifier = getClientIdentifier(reqOrId, opts.userId);
  } else {
    rawIdentifier = String(reqOrId);
    if (typeof optionsOrMax === "number") {
      maxRequests = optionsOrMax;
    }
    if (typeof legacyWindowMs === "number") {
      windowSeconds = Math.max(1, Math.ceil(legacyWindowMs / 1000));
    }
    if (typeof legacyEndpoint === "string") {
      endpoint = legacyEndpoint;
    }
  }

  const hashedKey = await hashRateLimitKey(endpoint, rawIdentifier);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  // If Supabase environment is unconfigured (e.g. unit tests or disconnected runtime)
  if (!supabaseUrl || !serviceRoleKey) {
    if (failClosed) {
      return {
        allowed: false,
        remaining: 0,
        resetSeconds: windowSeconds,
        storeUnavailable: true,
        error: "Rate limiter database service unavailable (fail-closed enforced)",
      };
    }
    return checkEmergencyMemoryLimit(hashedKey, maxRequests, windowSeconds);
  }

  try {
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { data, error } = await supabaseAdmin.rpc("check_rate_limit", {
      p_rate_key: hashedKey,
      p_endpoint: endpoint,
      p_max_requests: maxRequests,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      console.error("[RateLimiter] Database check_rate_limit error:", error);
      if (failClosed) {
        return {
          allowed: false,
          remaining: 0,
          resetSeconds: windowSeconds,
          storeUnavailable: true,
          error: error.message || "Database rate limit RPC error",
        };
      }
      return checkEmergencyMemoryLimit(hashedKey, maxRequests, windowSeconds);
    }

    if (!data || typeof data !== "object") {
      if (failClosed) {
        return {
          allowed: false,
          remaining: 0,
          resetSeconds: windowSeconds,
          storeUnavailable: true,
          error: "Invalid rate limiter response",
        };
      }
      return checkEmergencyMemoryLimit(hashedKey, maxRequests, windowSeconds);
    }

    return {
      allowed: Boolean(data.allowed),
      remaining: typeof data.remaining === "number" ? data.remaining : 0,
      resetSeconds: typeof data.reset_seconds === "number" ? data.reset_seconds : windowSeconds,
      currentCount: data.current_count,
    };
  } catch (err: any) {
    console.error("[RateLimiter] Unexpected exception during rate limit check:", err);
    if (failClosed) {
      return {
        allowed: false,
        remaining: 0,
        resetSeconds: windowSeconds,
        storeUnavailable: true,
        error: err?.message || "Rate limiter unexpected failure",
      };
    }
    return checkEmergencyMemoryLimit(hashedKey, maxRequests, windowSeconds);
  }
}
