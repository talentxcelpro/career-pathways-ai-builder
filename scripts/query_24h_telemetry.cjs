// scripts/query_24h_telemetry.cjs
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const { createClient } = require('@supabase/supabase-js');

// 1. Google OAuth2 Auth Helper
async function getAccessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claimSet = {
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };

  const base64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${base64Url(header)}.${base64Url(claimSet)}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  const signature = sign.sign(key.private_key, 'base64url');
  const jwt = `${unsignedToken}.${signature}`;

  return new Promise((resolve, reject) => {
    const postData = `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`;
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(new Error(JSON.stringify(parsed)));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

function gscRequest(endpoint, method, token, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    const req = https.request(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function run() {
  console.log('================================================================');
  console.log('🔍 TALENTXCEL 24-HOUR TELEMETRY AUDIT & PRODUCTION RECONCILIATION');
  console.log('================================================================\n');

  // Supabase check
  const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
  const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  console.log('--- 1. Live Supabase Database Metrics ---');
  const now = new Date();
  const past24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const { count: totalProfiles } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { data: recentProfiles } = await supabase.from('profiles').select('id, created_at, full_name, email').gte('created_at', past24h);
  
  const { count: totalApplications } = await supabase.from('job_applications').select('*', { count: 'exact', head: true });
  const { data: recentApps } = await supabase.from('job_applications').select('id, created_at, job_id').gte('created_at', past24h);

  const { count: totalAiResumes } = await supabase.from('ai_resumes').select('*', { count: 'exact', head: true });
  const { data: recentResumes } = await supabase.from('ai_resumes').select('id, created_at').gte('created_at', past24h);

  const { count: totalEvents } = await supabase.from('user_behavior_events').select('*', { count: 'exact', head: true });
  const { data: recentEvents } = await supabase.from('user_behavior_events').select('id, event_type, created_at').gte('created_at', past24h);

  console.log(`  • Total Profiles in DB      : ${totalProfiles}`);
  console.log(`  • New Profiles (Last 24h)   : ${recentProfiles ? recentProfiles.length : 0}`);
  console.log(`  • Total Job Applications    : ${totalApplications}`);
  console.log(`  • New Apps (Last 24h)       : ${recentApps ? recentApps.length : 0}`);
  console.log(`  • Total AI Resumes          : ${totalAiResumes}`);
  console.log(`  • New AI Resumes (Last 24h) : ${recentResumes ? recentResumes.length : 0}`);
  console.log(`  • Total Behavior Events     : ${totalEvents}`);
  console.log(`  • New Events (Last 24h)     : ${recentEvents ? recentEvents.length : 0}`);

  // GSC API Query
  console.log('\n--- 2. Google Search Console Live Performance ---');
  let gscSummary = null;
  let gscByDate = null;
  let topQueries = null;
  let topPages = null;

  try {
    const key = JSON.parse(fs.readFileSync('gcp-key.json', 'utf8'));
    const token = await getAccessToken(key);
    const siteUrl = encodeURIComponent('https://talentxcel.in/');

    // Query 1: Daily performance for past 7 days
    const dateRangeReq = {
      startDate: '2026-09-28',
      endDate: '2026-10-06',
      dimensions: ['date'],
      rowLimit: 10
    };
    const dailyRes = await gscRequest(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`, 'POST', token, dateRangeReq);
    gscByDate = dailyRes.data ? dailyRes.data.rows : [];

    // Query 2: Overall totals for past 28 days
    const totalReq = {
      startDate: '2026-09-08',
      endDate: '2026-10-06',
      rowLimit: 1
    };
    const totalRes = await gscRequest(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`, 'POST', token, totalReq);
    gscSummary = totalRes.data ? totalRes.data.rows : [];

    // Query 3: Top queries
    const queriesReq = {
      startDate: '2026-09-08',
      endDate: '2026-10-06',
      dimensions: ['query'],
      rowLimit: 15
    };
    const qRes = await gscRequest(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`, 'POST', token, queriesReq);
    topQueries = qRes.data ? qRes.data.rows : [];

    // Query 4: Top pages
    const pagesReq = {
      startDate: '2026-09-08',
      endDate: '2026-10-06',
      dimensions: ['page'],
      rowLimit: 20
    };
    const pRes = await gscRequest(`https://www.googleapis.com/webmasters/v3/sites/${siteUrl}/searchAnalytics/query`, 'POST', token, pagesReq);
    topPages = pRes.data ? pRes.data.rows : [];

    console.log('\nGSC Search Analytics Totals:');
    if (gscSummary && gscSummary.length > 0) {
      const row = gscSummary[0];
      console.log(`  • Clicks: ${row.clicks}`);
      console.log(`  • Impressions: ${row.impressions}`);
      console.log(`  • CTR: ${(row.ctr * 100).toFixed(2)}%`);
      console.log(`  • Average Position: ${row.position.toFixed(1)}`);
    } else {
      console.log('  (No rows returned for period)');
    }

    console.log('\nGSC Daily Breakdown:');
    if (gscByDate && gscByDate.length > 0) {
      for (const d of gscByDate) {
        console.log(`  [${d.keys[0]}] Impressions: ${d.impressions} | Clicks: ${d.clicks} | CTR: ${(d.ctr * 100).toFixed(2)}% | Position: ${d.position.toFixed(1)}`);
      }
    } else {
      console.log('  (No daily rows returned)');
    }

    console.log('\nTop 10 Queries in GSC:');
    if (topQueries && topQueries.length > 0) {
      topQueries.slice(0, 10).forEach((q, idx) => {
        console.log(`  ${idx + 1}. "${q.keys[0]}" - Imp: ${q.impressions}, Clicks: ${q.clicks}, Pos: ${q.position.toFixed(1)}`);
      });
    }

    console.log('\nTop 10 Pages in GSC:');
    if (topPages && topPages.length > 0) {
      topPages.slice(0, 10).forEach((p, idx) => {
        console.log(`  ${idx + 1}. ${p.keys[0]} - Imp: ${p.impressions}, Clicks: ${p.clicks}`);
      });
    }

  } catch (err) {
    console.error('Error fetching GSC data:', err.message);
  }

  // Save report
  const output = {
    timestamp: new Date().toISOString(),
    database: {
      totalProfiles,
      newProfiles24h: recentProfiles ? recentProfiles.length : 0,
      totalApplications,
      newApplications24h: recentApps ? recentApps.length : 0,
      totalAiResumes,
      newAiResumes24h: recentResumes ? recentResumes.length : 0,
    },
    gsc: {
      summary: gscSummary,
      dailyBreakdown: gscByDate,
      topQueries,
      topPages
    }
  };

  fs.writeFileSync('production_24h_telemetry_snapshot.json', JSON.stringify(output, null, 2), 'utf8');
  console.log('\n✓ Saved full 24h telemetry snapshot to production_24h_telemetry_snapshot.json');
}

run().catch(console.error);
