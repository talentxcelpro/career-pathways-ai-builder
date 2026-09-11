const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const sb = createClient(
  process.env.TX_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co',
  process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.TX_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

async function go() {
  console.log('Loading GSC dump...');
  const rows = JSON.parse(fs.readFileSync('gsc-full-dump.json', 'utf8')).rows || [];
  console.log('Rows:', rows.length);

  const intents = { JOB_SEARCH:['job','vacancy','career','hiring','naukri'], RESUME_ATS:['resume','cv'], CAREER_INTEL:['salary','pay','ctc'], INTERVIEW_PREP:['interview'], SKILL_LEARNING:['skill','course','learn','certification'], HIRING:['hire','recruit','employer'] };
  function classify(q) {
    for (const [intent, kws] of Object.entries(intents)) {
      if (kws.some(k => q.includes(k))) return intent;
    }
    return 'DISCOVERY';
  }

  const entities = rows.map(row => {
    const keys = row.keys || [];
    const query = keys[0] || '';
    const page = keys[1] || '';
    const country = (keys[2] || 'ind').toLowerCase().slice(0, 3);
    const normalized = query.toLowerCase().trim().replace(/\s+/g, ' ');
    return {
      tenant_id: 'talentxcel',
      query,
      normalized_query: normalized,
      intent: classify(normalized),
      country,
      supply_page: page,
      impressions: Math.round(row.impressions || 0),
      clicks: Math.round(row.clicks || 0),
      ctr: parseFloat((row.ctr || 0).toFixed(4)),
      position: parseFloat((row.position || 0).toFixed(2)),
      provenance_source: 'gsc_api',
      provenance_confidence: 1.0,
      provenance_as_of: new Date().toISOString()
    };
  });

  let inserted = 0, errors = 0;
  const BATCH = 50;
  for (let i = 0; i < entities.length; i += BATCH) {
    const batch = entities.slice(i, i + BATCH);
    const { error } = await sb.from('udx_demand_entities')
      .upsert(batch, { onConflict: 'tenant_id,normalized_query,country', ignoreDuplicates: false });
    if (error) { process.stdout.write('\nWARN: ' + error.message + '\n'); errors++; }
    else { inserted += batch.length; process.stdout.write('\rUpserted ' + inserted + '/' + entities.length); }
  }
  console.log('\nDone: ' + inserted + ' inserted, ' + errors + ' errors');

  const { count } = await sb.from('udx_demand_entities').select('*', { count: 'exact', head: true }).eq('tenant_id', 'talentxcel');
  console.log('Total rows in DB: ' + count);

  const { data: top } = await sb.from('udx_demand_entities')
    .select('query,impressions,position,intent')
    .eq('tenant_id', 'talentxcel')
    .order('impressions', { ascending: false })
    .limit(10);
  if (top) {
    console.log('\nTOP 10 by impressions:');
    top.forEach((r, i) => console.log((i+1) + '. ' + r.query + ' [' + r.impressions + ' imp | pos ' + r.position + ' | ' + r.intent + ']'));
  }

  const { data: rpc, error: re } = await sb.rpc('calculate_udx_opportunities', { p_tenant_id: 'talentxcel' });
  if (re) console.warn('RPC warn:', re.message);
  else console.log('\nOpportunities calculated:', rpc);

  console.log('\nSeed complete. Open http://localhost:8080/discovery');
}

go().catch(e => { console.error('Fatal:', e); process.exit(1); });