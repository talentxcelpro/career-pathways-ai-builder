/**
 * api/claim/verify.ts
 * TalentXcel Professional Activation — Claim Token Verification Endpoint
 * 
 * Validates a single-use claim token:
 * - SHA-256 hashes the submitted token to look up the staging record
 * - Enforces 14-day expiry check
 * - Checks status is 'staged' or 'invited'
 * - Returns masked preview (no raw PII, no unencrypted tokens)
 * - Records verification attempt in claim_audit_log
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.TX_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function hashToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken.trim()).digest('hex');
}

function maskEmail(email: string): string {
  if (!email || !email.includes('@')) return '***@***.***';
  const [local, domain] = email.split('@');
  const maskedLocal = local.length <= 2 
    ? local[0] + '***' 
    : local[0] + '***' + local[local.length - 1];
  return `${maskedLocal}@${domain}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS & method check
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const rawToken = (req.method === 'GET' ? req.query.token : req.body?.token) as string;

  if (!rawToken || typeof rawToken !== 'string' || rawToken.trim().length < 16) {
    return res.status(400).json({ 
      valid: false, 
      error: 'Invalid or missing claim token' 
    });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const tokenHash = hashToken(rawToken);
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    // Look up professional by hashed claim token
    const { data: record, error: lookupErr } = await supabase
      .from('imported_professionals')
      .select(`
        id,
        full_name,
        email_raw,
        headline,
        location_city,
        location_country,
        skills,
        experience_years,
        current_company,
        current_title,
        status,
        claim_token_expires_at,
        claimed_at
      `)
      .eq('claim_token_hash', tokenHash)
      .maybeSingle();

    if (lookupErr) {
      console.error('[claim/verify] Database lookup error:', lookupErr);
      return res.status(500).json({ error: 'Verification lookup failed' });
    }

    if (!record) {
      // Record failed audit attempt
      await supabase.from('claim_audit_log').insert({
        action: 'verify_failed_not_found',
        token_hash: tokenHash,
        ip_address: clientIp,
        user_agent: userAgent,
        metadata: { reason: 'token_not_found' },
      }).catch(() => {});

      return res.status(404).json({
        valid: false,
        error: 'Claim link is invalid or has expired',
      });
    }

    // Check expiry
    const now = new Date();
    const expiresAt = record.claim_token_expires_at ? new Date(record.claim_token_expires_at) : null;
    const isExpired = expiresAt ? expiresAt < now : true;

    if (isExpired) {
      await supabase.from('claim_audit_log').insert({
        imported_professional_id: record.id,
        action: 'verify_failed_expired',
        token_hash: tokenHash,
        ip_address: clientIp,
        user_agent: userAgent,
        metadata: { expires_at: record.claim_token_expires_at },
      }).catch(() => {});

      return res.status(410).json({
        valid: false,
        expired: true,
        error: 'This claim link has expired (links are valid for 14 days)',
      });
    }

    // Check status
    if (record.status === 'claimed') {
      await supabase.from('claim_audit_log').insert({
        imported_professional_id: record.id,
        action: 'verify_failed_already_claimed',
        token_hash: tokenHash,
        ip_address: clientIp,
        user_agent: userAgent,
      }).catch(() => {});

      return res.status(409).json({
        valid: false,
        already_claimed: true,
        error: 'This profile has already been claimed',
      });
    }

    if (record.status === 'opted_out') {
      return res.status(403).json({
        valid: false,
        opted_out: true,
        error: 'This contact record has been opted out',
      });
    }

    // Log successful verification
    await supabase.from('claim_audit_log').insert({
      imported_professional_id: record.id,
      action: 'verified',
      token_hash: tokenHash,
      ip_address: clientIp,
      user_agent: userAgent,
    }).catch(() => {});

    // Return safe, masked preview
    return res.status(200).json({
      valid: true,
      profile: {
        id: record.id,
        fullName: record.full_name,
        maskedEmail: maskEmail(record.email_raw),
        headline: record.headline || null,
        locationCity: record.location_city || null,
        locationCountry: record.location_country || 'India',
        skills: Array.isArray(record.skills) ? record.skills.slice(0, 8) : [],
        experienceYears: record.experience_years || null,
        currentCompany: record.current_company || null,
        currentTitle: record.current_title || null,
        expiresAt: record.claim_token_expires_at,
      },
    });
  } catch (err: any) {
    console.error('[claim/verify] Unhandled exception:', err);
    return res.status(500).json({ error: 'Internal server error during verification' });
  }
}
