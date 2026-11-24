import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.TX_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const serviceKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, serviceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  try {
    const {
      referral_code,
      visitor_id,
      landing_path,
      channel,
      campaign,
      user_id
    } = req.body || {};

    if (!referral_code || typeof referral_code !== 'string') {
      return res.status(400).json({ error: 'REFERRAL_CODE_REQUIRED' });
    }

    const cleanCode = referral_code.trim().toUpperCase();
    const cleanVisitorId = visitor_id || crypto.randomUUID();

    // Hash IP & User Agent for anonymous deduplication without storing PII
    const rawIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
    const rawUa = (req.headers['user-agent'] as string) || '';
    const ipHash = rawIp ? crypto.createHash('sha256').update(rawIp).digest('hex').slice(0, 32) : null;
    const uaHash = rawUa ? crypto.createHash('sha256').update(rawUa).digest('hex').slice(0, 32) : null;

    // Call secure RPC
    const { data, error } = await supabase.rpc('attribute_growth_referral', {
      p_referral_code: cleanCode,
      p_visitor_id: cleanVisitorId,
      p_landing_path: landing_path || '/network',
      p_channel: channel || 'shortlink',
      p_campaign: campaign || null,
      p_user_id: user_id || null
    });

    if (error) {
      console.error('RPC attribute_growth_referral error:', error.message);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      result: data
    });
  } catch (err: any) {
    console.error('Referral attribution handler error:', err);
    return res.status(500).json({ error: err.message || 'INTERNAL_SERVER_ERROR' });
  }
}
