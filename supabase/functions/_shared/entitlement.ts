// supabase/functions/_shared/entitlement.ts
// Server-Side Entitlement & Quota Guard for TalentXcel Career Accelerator
//
// USAGE IN EDGE FUNCTIONS:
//   import { enforceEntitlement } from '../_shared/entitlement.ts';
//   const check = await enforceEntitlement(req, 'ats_check');
//   if (!check.allowed) {
//     return new Response(check.errorBody, {
//       status: check.httpStatus,
//       headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
//     });
//   }
//   // proceed using check.userId — never use a userId from the request body

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getCorsHeaders } from './cors.ts';

export type FeatureType = 'ats_check' | 'resume_tailoring' | 'interview_prep';

export interface EntitlementResult {
  allowed: boolean;
  userId: string | null;
  tier: string;
  quotaLimit: number;
  currentUsage: number;
  remaining: number;
  error?: string;
  /** Pre-serialised JSON body to return directly when allowed = false */
  errorBody?: string;
  /** HTTP status code to use when returning the error */
  httpStatus: number;
}

const PLAN_LABELS: Record<string, string> = {
  free:    'Career Free',
  starter: 'Career Starter (₹199/month)',
  pro:     'Career Pro (₹499/month)',
  premium: 'Career Premium (₹999/month)',
};

const UPGRADE_URL = 'https://talentxcel.in/pro/subscription';

const ERROR_MESSAGES: Record<string, string> = {
  quota_exceeded:       'You have reached your monthly usage limit for this feature.',
  tier_not_permitted:   'This feature is not available on your current plan.',
  invalid_feature_type: 'Invalid feature type requested.',
  internal_error:       'An internal error occurred while checking your quota. Please try again.',
};

/**
 * Authenticates the request via Bearer token and consumes one unit of quota
 * for the given feature type before the AI call runs.
 *
 * Security guarantees:
 *  - User identity is derived exclusively from the Supabase-verified JWT.
 *  - Tier and quota limits are resolved server-side via consume_user_quota().
 *  - No client-supplied user ID, tier, or quota value is trusted.
 *
 * Quota policy (enforced in the DB, not here):
 *  free:    ats_check=1, resume_tailoring=0, interview_prep=0  per month
 *  starter: ats_check=5, resume_tailoring=2, interview_prep=3  per month
 *  pro:     ats_check=∞, resume_tailoring=15, interview_prep=∞ per month
 *  premium: all features unlimited per month
 *
 * @param req         The incoming Edge Function Request
 * @param featureType Which quota bucket to consume
 * @param dryRun      If true, checks quota without consuming (for UI pre-checks)
 */
export async function enforceEntitlement(
  req: Request,
  featureType: FeatureType,
  dryRun = false,
): Promise<EntitlementResult> {
  const supabaseUrl    = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Server misconfiguration — fail closed
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[entitlement] SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not set');
    return _deny(null, 'free', 'server_config_error', 500,
      'Server configuration error. Please contact support.');
  }

  // ── 1. Authenticate ────────────────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return _deny(null, 'free', 'unauthenticated', 401,
      'Authentication required. Please sign in to continue.');
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return _deny(null, 'free', 'unauthenticated', 401,
      'Authentication required. Please sign in to continue.');
  }

  // Use service role to verify the user JWT without RLS restrictions
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !userData?.user?.id) {
    console.warn('[entitlement] Invalid token:', authError?.message);
    return _deny(null, 'free', 'invalid_token', 401,
      'Invalid or expired session. Please sign in again.');
  }

  const userId = userData.user.id;

  // ── 2. Enforce quota via server-side DB function ───────────────────────────
  const { data: quota, error: rpcError } = await supabase.rpc('consume_user_quota', {
    p_user_id:      userId,
    p_feature_type: featureType,
    p_dry_run:      dryRun,
  });

  if (rpcError) {
    console.error('[entitlement] consume_user_quota RPC error:', rpcError);
    return _deny(userId, 'free', 'quota_rpc_error', 500,
      'Failed to verify feature access. Please try again.');
  }

  const q = quota as {
    allowed:       boolean;
    tier:          string;
    quota_limit:   number;
    current_usage: number;
    remaining:     number;
    error?:        string;
  };

  if (!q.allowed) {
    const code = q.error ?? 'quota_exceeded';
    const tier = q.tier ?? 'free';
    const msg  = ERROR_MESSAGES[code] ?? 'Feature access denied.';

    return _deny(userId, tier, code, 402, msg, {
      tier,
      quotaLimit:   q.quota_limit ?? 0,
      currentUsage: q.current_usage ?? 0,
      remaining:    0,
      upgradeUrl:   UPGRADE_URL,
      plans: {
        starter: { price: '₹199/month', label: PLAN_LABELS.starter },
        pro:     { price: '₹499/month', label: PLAN_LABELS.pro },
        premium: { price: '₹999/month', label: PLAN_LABELS.premium },
      },
    });
  }

  return {
    allowed:      true,
    userId,
    tier:         q.tier          ?? 'free',
    quotaLimit:   q.quota_limit   ?? -1,
    currentUsage: q.current_usage ?? 0,
    remaining:    q.remaining     ?? -1,
    httpStatus:   200,
  };
}

// ── Internal helpers ─────────────────────────────────────────────────────────

function _deny(
  userId:     string | null,
  tier:       string,
  error:      string,
  httpStatus: number,
  message:    string,
  extra:      Record<string, unknown> = {},
): EntitlementResult {
  return {
    allowed:      false,
    userId,
    tier,
    quotaLimit:   extra.quotaLimit  as number ?? 0,
    currentUsage: extra.currentUsage as number ?? 0,
    remaining:    extra.remaining   as number ?? 0,
    error,
    httpStatus,
    errorBody: JSON.stringify({
      error:   message,
      code:    error.toUpperCase(),
      tier,
      ...extra,
    }),
  };
}
