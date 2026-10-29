/**
 * api/claim/opt-out.ts
 * TalentXcel Professional Activation — Contact Opt-Out & Deletion Endpoint
 * 
 * Honors user privacy and communication preferences:
 * - Allows a recipient to opt out of future activation outreach
 * - Updates imported_professionals status to 'opted_out'
 * - Adds the email to email_suppression_list with reason 'user_optout'
 * - Nullifies the claim token so the profile cannot be claimed
 * - Logs audit event
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.TX_SUPABASE_URL || process.env.SUPABASE_URL || '';
const serviceRoleKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

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

  const { token, reason, deleteData } = req.body || {};

  if (!token || typeof token !== 'string' || token.trim().length < 16) {
    return res.status(400).json({ error: 'Invalid or missing claim token' });
  }

  if (!supabaseUrl || !serviceRoleKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const tokenHash = hashToken(token);
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    // 1. Find record by token hash
    const { data: record, error: lookupErr } = await supabase
      .from('imported_professionals')
      .select('id, email_normalized, email_raw, status')
      .eq('claim_token_hash', tokenHash)
      .maybeSingle();

    if (lookupErr || !record) {
      return res.status(404).json({ error: 'Record not found or token invalid' });
    }

    const email = record.email_normalized || record.email_raw.toLowerCase().trim();

    // 2. Add to global suppression list
    await supabase.from('email_suppression_list').upsert({
      email_address: email,
      reason: reason || 'user_optout',
      is_active: true,
      notes: `Opted out via claim link on ${new Date().toISOString()}`,
    }, { onConflict: 'email_address' }).catch(err => {
      console.warn('[claim/opt-out] Suppression list upsert warning:', err);
    });

    // 3. Update imported_professionals record
    if (deleteData) {
      // Hard anonymization: remove personal fields, set status 'opted_out'
      await supabase.from('imported_professionals').update({
        status: 'opted_out',
        claim_token: null,
        claim_token_hash: null,
        full_name: '[REDACTED]',
        first_name: null,
        last_name: null,
        phone_e164: null,
        headline: null,
        skills: [],
        portfolio_url: null,
        updated_at: new Date().toISOString(),
      }).eq('id', record.id);
    } else {
      // Soft opt-out: mark status, invalidate token
      await supabase.from('imported_professionals').update({
        status: 'opted_out',
        claim_token: null,
        claim_token_hash: null,
        updated_at: new Date().toISOString(),
      }).eq('id', record.id);
    }

    // 4. Audit log
    await supabase.from('claim_audit_log').insert({
      imported_professional_id: record.id,
      action: 'opt_out',
      token_hash: tokenHash,
      ip_address: clientIp,
      user_agent: userAgent,
      metadata: { reason: reason || 'user_optout', deleteData: !!deleteData },
    }).catch(() => {});

    return res.status(200).json({
      success: true,
      message: 'You have been unsubscribed and your preferences have been updated.',
    });
  } catch (err: any) {
    console.error('[claim/opt-out] Unhandled exception:', err);
    return res.status(500).json({ error: 'Internal server error processing opt-out' });
  }
}
