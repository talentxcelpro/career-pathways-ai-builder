import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createSign } from 'crypto';

let serviceKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!serviceKey && fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) {
      serviceKey = trimmed.split('=')[1].replace(/["']/g, '').trim();
    }
  }
}

const TX_SUPABASE_URL = process.env.TX_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const supabase = createClient(TX_SUPABASE_URL, serviceKey, {
  auth: { persistSession: false },
});

async function syncAll() {
  console.log('=== STARTING FULL LIVE GSC INGESTION ===');

  // Authenticate with Google
  const sa = JSON.parse(fs.readFileSync('gsc-service-account.json', 'utf8'));
  const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    iss: sa.client_email,
    scope: SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url');

  const sign = createSign('RSA-SHA256');
  sign.update(`${header}.${payload}`);
  const jwt = `${header}.${payload}.${sign.sign(sa.private_key, 'base64url')}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const { access_token } = await tokenRes.json() as any;
  console.log('Google Auth OK. Fetching all GSC rows...');

  const siteUrl = 'https://talentxcel.in/';
  const endDt = new Date();
  endDt.setDate(endDt.getDate() - 3);
  const endDate = endDt.toISOString().slice(0, 10);
  const startDt = new Date(endDt);
  startDt.setDate(startDt.getDate() - 28);
  const startDate = startDt.toISOString().slice(0, 10);

  const gscRes = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query', 'page', 'country', 'device'],
        rowLimit: 25000,
      }),
    }
  );

  const gscData = await gscRes.json() as any;
  const rows = gscData.rows || [];
  console.log(`Fetched ${rows.length} total rows from GSC.`);

  const syncTimestamp = new Date().toISOString();

  // Deduplicate rows by (normalized_query, country)
  const dedupedMap = new Map<string, any>();
  for (const r of rows) {
    const query = r.keys[0];
    const page = r.keys[1] || '';
    const country = r.keys[2] || 'unknown';
    const device = r.keys[3] || 'ALL';
    const norm = query.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!norm) continue;

    const key = `${norm}:::${country}`;
    if (!dedupedMap.has(key)) {
      dedupedMap.set(key, {
        tenant_id: 'talentxcel',
        query,
        normalized_query: norm,
        country,
        device,
        impressions: r.impressions || 0,
        clicks: r.clicks || 0,
        positionSum: (r.position || 0) * (r.impressions || 1),
        supply_page: page,
      });
    } else {
      const existing = dedupedMap.get(key);
      existing.impressions += (r.impressions || 0);
      existing.clicks += (r.clicks || 0);
      existing.positionSum += (r.position || 0) * (r.impressions || 1);
    }
  }

  const dedupedList = Array.from(dedupedMap.values()).map(d => ({
    tenant_id: d.tenant_id,
    query: d.query,
    normalized_query: d.normalized_query,
    country: d.country,
    device: d.device,
    impressions: d.impressions,
    clicks: d.clicks,
    ctr: d.impressions > 0 ? Number((d.clicks / d.impressions).toFixed(4)) : 0,
    avg_position: d.impressions > 0 ? Number((d.positionSum / d.impressions).toFixed(2)) : 0,
    data_source: 'gsc_api',
    supply_page: d.supply_page,
    last_gsc_sync_at: syncTimestamp,
    last_updated_at: syncTimestamp,
  }));

  console.log(`Deduplicated 5553 raw records into ${dedupedList.length} unique demand entities.`);

  const BATCH_SIZE = 250;
  let totalUpserted = 0;

  for (let i = 0; i < dedupedList.length; i += BATCH_SIZE) {
    const batch = dedupedList.slice(i, i + BATCH_SIZE);

    const { error: entErr } = await supabase.from('udx_demand_entities').upsert(
      batch,
      { onConflict: 'tenant_id,normalized_query,country', ignoreDuplicates: false }
    );

    if (entErr) {
      console.warn(`Batch ${i / BATCH_SIZE} error:`, entErr.message);
    } else {
      totalUpserted += batch.length;
    }

    process.stdout.write(`Ingested: ${totalUpserted} / ${dedupedList.length}...\r`);
  }

  console.log(`\nSuccessfully ingested ${totalUpserted} demand entities into Supabase!`);

  // Trigger opportunity recalculation
  console.log('Recalculating UDX opportunities...');
  try {
    const { data: oppCount, error: oppErr } = await supabase.rpc('calculate_udx_opportunities', {
      p_tenant_id: 'talentxcel',
    });
    console.log('calculate_udx_opportunities result:', { oppCount, oppErr });
  } catch (rpcErr) {
    console.warn('RPC calculate_udx_opportunities error:', rpcErr);
  }

  // Update tenant
  await supabase.from('udx_tenants').upsert({
    tenant_id: 'talentxcel',
    tenant_name: 'TalentXcel Global Career Platform',
    domain: 'talentxcel.in',
    gsc_property_id: 'https://talentxcel.in/',
    status: 'ACTIVE',
    updated_at: syncTimestamp,
  });

  // Log in udx_audit_log
  await supabase.from('udx_audit_log').insert({
    tenant_id: 'talentxcel',
    log_type: 'EXECUTION',
    actor: 'GSC_CONNECTOR',
    action_taken: 'gsc_full_production_sync',
    policy_class: 'AUTO',
    outcome: 'AUTO_EXECUTED',
    metadata: {
      siteUrl,
      totalRows: rows.length,
      totalUpserted,
      startDate,
      endDate,
    },
  });

  console.log('=== GSC LIVE INGESTION & SYNC COMPLETED SUCCESSFULLY ===');
}

syncAll().catch(console.error);
