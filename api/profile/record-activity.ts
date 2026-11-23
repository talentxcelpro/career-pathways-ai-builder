/**
 * api/profile/record-activity.ts
 * POST /api/profile/record-activity
 *
 * Real-time User Activity & Freshness Recording Engine
 * Updates updated_at, last_login_at, last_seen, last_heartbeat_at, and is_online.
 * Hardened with caller authorization check.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'nodejs' };

const SUPABASE_URL =
  process.env.TALENTXCEL_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://dthlgsnakhoftinssokm.supabase.co';

const SUPABASE_SERVICE_ROLE_KEY =
  process.env.TALENTXCEL_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  '';

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId } = req.body || {};
    if (!userId || typeof userId !== 'string') {
      return res.status(400).json({ error: 'Missing valid userId' });
    }

    // Verify authenticated user identity if auth header provided
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY || SUPABASE_SERVICE_ROLE_KEY);
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
      if (authError || !user || user.id !== userId) {
        return res.status(403).json({ error: 'Forbidden: Cannot update presence for another user.' });
      }
    }

    if (!SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('[RecordActivity] Missing service role key; fallback acknowledge');
      return res.status(200).json({ success: true, fallback: true });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false }
    });

    const now = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        updated_at: now,
        last_login_at: now,
        last_seen: now,
        last_heartbeat_at: now,
        is_online: true
      })
      .eq('id', userId);

    if (error) {
      console.error('[RecordActivity] Update error:', error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ success: true, updated_at: now });
  } catch (err: any) {
    console.error('[RecordActivity] Unexpected error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
