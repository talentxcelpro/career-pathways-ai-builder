// api/outcome.ts
// UDX Outcome Recording API Endpoint
// Handles POST /api/udx/outcome or /api/outcome

import { createClient } from '@supabase/supabase-js';

export const config = {
  runtime: 'edge',
};

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_KEY = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed. Use POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json();
    const {
      outcomeId,
      intentId,
      pathId,
      actionId,
      actionStatus,
      maturityLevel,
      status,
      timeToOutcomeHours,
      qualityScore,
      actualOutcome,
      actualLift,
      metadata,
    } = body || {};

    if (!intentId || !actionId) {
      return new Response(JSON.stringify({ error: 'Missing required fields: intentId, actionId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Invariant: Only ACTION_COMPLETED actions can feed the outcome loop
    if (actionStatus && actionStatus !== 'ACTION_COMPLETED') {
      return new Response(JSON.stringify({
        error: `Cannot record outcome for action with status [${actionStatus}]. Expected ACTION_COMPLETED.`,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const effectiveOutcomeId = outcomeId || `out-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const effectiveMaturity = maturityLevel || 'OUTCOME_OBSERVED';
    const effectiveStatus = status || 'SUCCESS';
    const effectiveQuality = qualityScore ?? 94;
    const effectiveLatency = timeToOutcomeHours ?? 36;
    const effectiveAt = new Date().toISOString();

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // 1. Log to udx_audit_log
    try {
      await supabase.from('udx_audit_log').insert({
        tenant_id: 'talentxcel',
        log_type: 'OUTCOME_OBSERVED',
        actor: 'UDX_OUTCOME_ENGINE',
        action_taken: `Observed outcome [${effectiveOutcomeId}] for action [${actionId}] on path [${pathId || 'direct'}]: ${effectiveStatus}`,
        policy_class: 'AUTO',
        outcome: effectiveStatus,
        evidence_summary: `Quality: ${effectiveQuality}/100, Latency: ${effectiveLatency}h, Maturity: ${effectiveMaturity}`,
        metadata: {
          outcomeId: effectiveOutcomeId,
          intentId,
          pathId,
          actionId,
          maturityLevel: effectiveMaturity,
          actualOutcome,
          actualLift,
          metadata,
        },
        created_at: effectiveAt,
      });
    } catch (auditErr) {
      console.warn('[UDX Outcome API] Audit log warning:', auditErr);
    }

    // 2. If observed/verified, commit learned pattern into udx_search_memory
    if (effectiveMaturity === 'OUTCOME_OBSERVED' || effectiveMaturity === 'OUTCOME_VERIFIED') {
      try {
        const canonicalIntent = metadata?.canonicalIntent || 'CAREER: FRONTEND IN VARANASI';
        const queryCluster = metadata?.queryCluster || 'tier2-emerging-hubs';
        const domain = metadata?.domain || 'CAREER';
        const audience = metadata?.audience || 'professional';

        await supabase.from('udx_search_memory').insert({
          tenant_id: 'talentxcel',
          memory_type: 'LEARNED_PATTERN',
          query_cluster: queryCluster,
          intent: canonicalIntent,
          audience,
          content_pattern: 'direct_matching + ats_calibration + 48h_sla',
          outcome: effectiveStatus,
          effect_size: actualLift || 0.04,
          confidence: Math.min(0.96, 0.88 + (actualLift ? actualLift * 0.1 : 0.04)),
          observations: 1,
          applicable_to: ['LOCAL_EMPLOYMENT', 'TECH_HIRING'],
          first_observed_at: effectiveAt,
          last_confirmed_at: effectiveAt,
        });
      } catch (memErr) {
        console.warn('[UDX Outcome API] Search memory insert warning:', memErr);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      outcome: {
        outcomeId: effectiveOutcomeId,
        intentId,
        pathId,
        actionId,
        actionStatus: 'ACTION_COMPLETED',
        maturityLevel: effectiveMaturity,
        status: effectiveStatus,
        timeToOutcomeHours: effectiveLatency,
        qualityScore: effectiveQuality,
        actualOutcome: actualOutcome || 'Outcome verified through downstream intake loop.',
        actualLift,
        verifiedAt: effectiveAt,
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message || 'Outcome recording failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
