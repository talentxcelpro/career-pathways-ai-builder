import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import { createSign } from 'crypto';

// Load .env.local
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  for (const line of envContent.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      process.env[key] = val;
    }
  }
}

const TX_SUPABASE_URL = process.env.TX_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const serviceKey = process.env.TALENTXCEL_SERVICE_ROLE_KEY;

console.log('TX Supabase URL:', TX_SUPABASE_URL);
console.log('Service Key configured:', !!serviceKey);

if (!serviceKey) {
  console.error('Missing TALENTXCEL_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(TX_SUPABASE_URL, serviceKey, {
  auth: { persistSession: false },
});

async function runLiveSync() {
  console.log('--- LIVE GSC SYNC INITIATION ---');
  
  // 1. Check udx_tenants
  const { data: tenants, error: tErr } = await supabase.from('udx_tenants').select('*');
  console.log('Tenants query result:', { tenants, tErr });

  // Update tenant gsc_property_id if needed
  if (tenants && tenants.length > 0) {
    const txTenant = tenants.find(t => t.tenant_id === 'talentxcel');
    if (txTenant && txTenant.gsc_property_id !== 'https://talentxcel.in/') {
      console.log('Updating udx_tenants gsc_property_id to https://talentxcel.in/...');
      await supabase.from('udx_tenants').update({
        gsc_property_id: 'https://talentxcel.in/',
      }).eq('tenant_id', 'talentxcel');
    }
  }

  // 2. Authenticate with Google
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
  console.log('Google Auth: OK');

  // 3. Fetch full queries from GSC
  const siteUrl = 'https://talentxcel.in/';
  const endDt = new Date();
  endDt.setDate(endDt.getDate() - 3);
  const endDate = endDt.toISOString().slice(0, 10);
  const startDt = new Date(endDt);
  startDt.setDate(startDt.getDate() - 28); // 28 days of data
  const startDate = startDt.toISOString().slice(0, 10);

  console.log(`Pulling Search Analytics for ${siteUrl} from ${startDate} to ${endDate}...`);

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
  console.log(`Fetched ${rows.length} rows from Google Search Console!`);

  if (rows.length === 0) {
    console.log('No rows returned, checking query only...');
    const qRes = await fetch(
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
          dimensions: ['query'],
          rowLimit: 5000,
        }),
      }
    );
    const qData = await qRes.json() as any;
    console.log(`Query-only returned ${(qData.rows || []).length} rows`);
  }

  // 4. Ingest sample into Supabase
  const syncTimestamp = new Date().toISOString();
  let inserted = 0;
  for (const r of rows.slice(0, 100)) {
    const query = r.keys[0];
    const page = r.keys[1] || '';
    const country = r.keys[2] || 'unknown';
    const device = r.keys[3] || 'ALL';
    const norm = query.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();

    const { error: upsertErr } = await supabase.from('udx_demand_entities').upsert({
      tenant_id: 'talentxcel',
      query,
      normalized_query: norm,
      country,
      device,
      impressions: r.impressions,
      clicks: r.clicks,
      ctr: r.ctr,
      avg_position: r.position,
      data_source: 'gsc_api',
      last_gsc_sync_at: syncTimestamp,
      last_updated_at: syncTimestamp,
    }, { onConflict: 'tenant_id,normalized_query,country' });

    if (!upsertErr) inserted++;
  }

  console.log(`Upserted ${inserted} rows into udx_demand_entities!`);
}

runLiveSync().catch(console.error);
