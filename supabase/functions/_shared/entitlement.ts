// supabase/functions/_shared/entitlement.ts
// Server-Side Entitlement & Quota Guard for TalentXcel Revenue Pro Ecosystem
// Features: Server-side JWT authentication, Atomic Quotas, AI Credit Fallback, Central Plan Catalogue

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getCorsHeaders } from './cors.ts';

export type FeatureType = 
  | 'ats_scan'
  | 'resume_rewrite'
  | 'job_applications'
  | 'candidate_contact_unlock'
  | 'skill_diagnostics'
  | 'salary_benchmarks'
  | 'placement_readiness'
  | 'exam_prep_ai'
  | 'transition_milestone_tracker';

export interface EntitlementResult {
  allowed: boolean;
  userId: string | null;
  tier: string;
  quotaLimit: number;
  currentUsage: number;
  remaining: number;
  source?: string;
  creditBalance?: number;
  error?: string;
  errorBody?: string;
  httpStatus: number;
}

const APPROVED_PLANS: Record<string, { label: string; price: string; pricePaise: number }> = {
  free:     { label: 'Free',     price: '₹0',           pricePaise: 0 },
  starter:  { label: 'Starter',  price: '₹299/month',   pricePaise: 29900 },
  pro:      { label: 'Pro',      price: '₹499/month',   pricePaise: 49900 },
  max:      { label: 'Max',      price: '₹999/month',   pricePaise: 99900 },
  business: { label: 'Business', price: '₹2,499/month', pricePaise: 249900 },
};

const UPGRADE_URL = 'https://talentxcel.in/billing';

const ERROR_MESSAGES: Record<string, string> = {
  quota_exceeded:       'You have reached your monthly subscription allowance for this feature.',
  quota_and_credits_exhausted: 'Your monthly quota and AI credits are exhausted. Please upgrade or purchase credits.',
  tier_not_permitted:   'This feature requires a higher tier plan.',
  invalid_feature_type: 'Invalid feature requested.',
  internal_error:       'An error occurred verifying access.',
};

export async function enforceEntitlement(
  req: Request,
  featureType: FeatureType,
  dryRun = false,
  productId = 'global'
): Promise<EntitlementResult> {
  const supabaseUrl    = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[entitlement] Server misconfiguration: missing SUPABASE_URL or SERVICE_ROLE_KEY');
    return _deny(null, 'free', 'server_config_error', 500, 'Server configuration error.');
  }

  // 1. Authenticate user
  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return _deny(null, 'free', 'unauthenticated', 401, 'Authentication required. Please sign in to continue.');
  }

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) {
    return _deny(null, 'free', 'unauthenticated', 401, 'Authentication required. Please sign in to continue.');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !userData?.user?.id) {
    return _deny(null, 'free', 'invalid_token', 401, 'Invalid or expired session. Please sign in again.');
  }

  const userId = userData.user.id;
  const idempotencyKey = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  // 2. Enforce quota via consume_feature_quota_v2
  const { data: quota, error: rpcError } = await supabase.rpc('consume_feature_quota_v2', {
    p_user_id:         userId,
    p_product_id:      productId,
    p_feature_id:      featureType,
    p_idempotency_key: idempotencyKey,
    p_dry_run:         dryRun,
  });

  if (rpcError) {
    console.error('[entitlement] consume_feature_quota_v2 RPC error:', rpcError);
    return _deny(userId, 'free', 'quota_rpc_error', 500, 'Failed to verify feature access.');
  }

  const q = quota as {
    allowed:          boolean;
    tier:             string;
    quota_limit:      number;
    current_usage:    number;
    remaining:        number;
    source?:          string;
    credit_balance?:  number;
    credits_deducted?: number;
    error?:           string;
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
      plans:        APPROVED_PLANS,
    });
  }

  return {
    allowed:       true,
    userId,
    tier:          q.tier ?? 'free',
    quotaLimit:    q.quota_limit ?? -1,
    currentUsage:  q.current_usage ?? 0,
    remaining:     q.remaining ?? -1,
    source:        q.source ?? 'subscription_included',
    creditBalance: q.credit_balance,
    httpStatus:    200,
  };
}

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
