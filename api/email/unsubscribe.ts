/**
 * api/email/unsubscribe.ts
 * GET / POST /api/email/unsubscribe
 *
 * RFC 8058 compliant One-Click Unsubscribe Handler
 * Validates cryptographically signed token and opts recipient out of all non-essential communications.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { verifyUnsubscribeToken } from '../../src/services/email/emailUnsubscribe';

export const config = { runtime: 'nodejs' };

const SUPABASE_URL = process.env.TX_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = (req.query?.token as string) || (req.body?.token as string);

  if (!token) {
    return res.status(400).json({ error: 'Missing unsubscribe token' });
  }

  // 1. Verify token authenticity
  const verification = await verifyUnsubscribeToken(token);
  if (!verification.valid || !verification.email) {
    return res.status(400).json({ error: verification.error || 'Invalid or expired token' });
  }

  const email = verification.email;
  const userId = verification.userId;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    // 2. Opt-out in database
    await supabase.from('email_user_preferences').upsert(
      {
        email,
        user_id: userId || null,
        unsubscribed_all_non_essential: true,
        email_job_alerts: false,
        email_job_matches: false,
        email_career_recommendations: false,
        email_marketing: false,
        email_weekly_digest: false,
        unsubscribed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'email' }
    );

    console.log(`🔕 [Unsubscribe API] Successfully unsubscribed: ${email}`);

    // If browser navigation (GET), redirect to clean confirmation page
    if (req.method === 'GET' && !req.headers['accept']?.includes('application/json')) {
      return res.redirect(302, `/unsubscribe?success=true&email=${encodeURIComponent(email)}`);
    }

    return res.status(200).json({
      success: true,
      email,
      message: 'You have been successfully unsubscribed from all non-essential TalentXcel communications.'
    });
  } catch (err: any) {
    console.error('❌ Unsubscribe API Error:', err.message);
    return res.status(500).json({ error: 'Failed to process unsubscribe request' });
  }
}
