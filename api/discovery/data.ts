/**
 * api/discovery/data.ts
 * GET /api/discovery/data
 *
 * Provides real-time live discovery telemetry, GSC connection state,
 * demand entities count, opportunities, search memory, and audit log.
 *
 * Runtime: Node.js
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export const config = { runtime: 'nodejs' };

const TX_SUPABASE_URL = process.env.TX_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';

function getSupabase(): SupabaseClient {
  const serviceKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('TALENTXCEL_SERVICE_ROLE_KEY environment variable is not configured.');
  }
  return createClient(TX_SUPABASE_URL, serviceKey, {
    auth: { persistSession: false },
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const supabase = getSupabase();

    // 1. Entities count & sample
    const { count: totalEntities, error: entCountErr } = await supabase
      .from('udx_demand_entities')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', 'talentxcel');

    if (entCountErr) {
      console.warn('[Discovery Data API] Entities count error:', entCountErr.message);
    }

    const { data: entities, error: entErr } = await supabase
      .from('udx_demand_entities')
      .select('*')
      .eq('tenant_id', 'talentxcel')
      .order('impressions', { ascending: false })
      .limit(200);

    if (entErr) {
      console.warn('[Discovery Data API] Entities list error:', entErr.message);
    }

    // 2. Opportunities count & sample
    const { count: totalOpportunities, error: oppCountErr } = await supabase
      .from('udx_opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', 'talentxcel');

    if (oppCountErr) {
      console.warn('[Discovery Data API] Opportunities count error:', oppCountErr.message);
    }

    const { data: opportunities, error: oppErr } = await supabase
      .from('udx_opportunities')
      .select(`
        opportunity_id,
        opportunity_type,
        priority,
        quadrant,
        opportunity_score,
        status,
        recommended_action,
        created_at,
        udx_demand_entities (
          entity_id, query, normalized_query, impressions, clicks, ctr, avg_position, country, intent, audience, business_segment, supply_page
        )
      `)
      .eq('tenant_id', 'talentxcel')
      .order('opportunity_score', { ascending: false })
      .limit(100);

    if (oppErr) {
      console.warn('[Discovery Data API] Opportunities list error:', oppErr.message);
    }

    // 3. Search Memory
    const { data: memory } = await supabase
      .from('udx_search_memory')
      .select('*')
      .eq('tenant_id', 'talentxcel')
      .order('confidence', { ascending: false })
      .limit(50);

    // 4. Audit Log
    const { data: auditLogs } = await supabase
      .from('udx_audit_log')
      .select('*')
      .eq('tenant_id', 'talentxcel')
      .order('created_at', { ascending: false })
      .limit(50);

    // 5. GSC Status (verified against environment availability)
    const hasGscCreds = Boolean(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
    );

    const gscStatus = {
      hasCredentials: hasGscCreds,
      propertyId: 'https://talentxcel.in/',
      mode: hasGscCreds ? 'LIVE_GSC_CONNECTED' : 'CREDENTIALS_PENDING',
      serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || null,
      clientId: '114907681688043399974',
    };

    const finalEntityCount = totalEntities ?? (entities?.length || 0);
    const finalOppCount = totalOpportunities ?? (opportunities?.length || 0);

    return res.status(200).json({
      success: true,
      totalEntities: finalEntityCount,
      totalOpportunities: finalOppCount,
      entity_count: finalEntityCount,
      opportunities_count: finalOppCount,
      entities: entities || [],
      opportunities: opportunities || [],
      memory: memory || [],
      auditLogs: auditLogs || [],
      gscStatus,
    });
  } catch (err: any) {
    console.error('[Discovery Data API Error]:', err);
    return res.status(200).json({
      success: false,
      error: err.message,
      totalEntities: 0,
      totalOpportunities: 0,
      entity_count: 0,
      opportunities_count: 0,
      entities: [],
      opportunities: [],
      memory: [],
      auditLogs: [],
      gscStatus: {
        hasCredentials: false,
        propertyId: 'https://talentxcel.in/',
        mode: 'CONFIG_REQUIRED',
        serviceAccountEmail: null,
        clientId: null,
      },
    });
  }
}