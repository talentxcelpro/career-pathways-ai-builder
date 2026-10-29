/**
 * api/claim/confirm.ts
 * TalentXcel Professional Activation — Profile Claim Confirmation Endpoint
 * 
 * Atomically claims a staged profile for an authenticated user:
 * - Requires an authenticated Supabase user session (Bearer token)
 * - Verifies the single-use claim token
 * - Calls the atomic PostgreSQL RPC function `claim_professional_profile()`
 * - Handles duplicate-account and already-claimed conflicts
 * - Nullifies the claim token upon successful claim (single-use invariant)
 * - Logs full audit trail in claim_audit_log
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.TX_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const anonKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, corrections } = req.body || {};

  if (!token || typeof token !== 'string' || token.trim().length < 16) {
    return res.status(400).json({ error: 'Invalid or missing claim token' });
  }

  // Extract authenticated user token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Authentication required. Please sign in or create an account to claim this profile.',
      code: 'AUTH_REQUIRED',
    });
  }

  const userJwt = authHeader.replace('Bearer ', '').trim();

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // 1. Verify user JWT using client scoped to user
  const userClient = createClient(supabaseUrl, anonKey || serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: { headers: { Authorization: `Bearer ${userJwt}` } },
  });

  const { data: { user }, error: authErr } = await userClient.auth.getUser();

  if (authErr || !user) {
    return res.status(401).json({
      error: 'Invalid or expired authentication session',
      code: 'SESSION_INVALID',
    });
  }

  // 2. Use service role to execute atomic claim RPC
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const tokenHash = hashToken(token);
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    // Call the atomic RPC function
    const { data: rpcResult, error: rpcErr } = await adminClient.rpc('claim_professional_profile', {
      claim_token_input: token.trim(),
      target_user_id: user.id,
      user_confirmations: {
        confirmed_at: new Date().toISOString(),
        client_ip: clientIp,
        user_agent: userAgent,
        corrections: corrections || null,
      },
    });

    if (rpcErr) {
      console.error('[claim/confirm] RPC error:', rpcErr);
      return res.status(500).json({ 
        error: 'Failed to process profile claim', 
        details: rpcErr.message 
      });
    }

    if (!rpcResult || !rpcResult.success) {
      const errorMsg = rpcResult?.error || 'Claim rejected';
      const statusCode = errorMsg.includes('expired') ? 410 :
                         errorMsg.includes('already claimed') ? 409 : 400;

      // Audit the failure
      await adminClient.from('claim_audit_log').insert({
        action: 'claim_failed',
        token_hash: tokenHash,
        ip_address: clientIp,
        user_agent: userAgent,
        metadata: { user_id: user.id, error: errorMsg },
      }).catch(() => {});

      return res.status(statusCode).json({
        success: false,
        error: errorMsg,
      });
    }

    // Success
    return res.status(200).json({
      success: true,
      message: 'Profile claimed successfully',
      profileId: rpcResult.profile_id,
      importedProfessionalId: rpcResult.imported_professional_id,
    });
  } catch (err: any) {
    console.error('[claim/confirm] Unhandled exception:', err);
    return res.status(500).json({ error: 'Internal server error during profile claim' });
  }
}
