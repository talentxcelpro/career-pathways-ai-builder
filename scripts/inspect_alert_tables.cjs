const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const lines = fs.readFileSync('.env.local', 'utf-8').split('\n');
let key = '', url = '';
for (const l of lines) {
  const trimmed = l.trim();
  if (trimmed.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) key = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
  if (trimmed.startsWith('TX_SUPABASE_URL=')) url = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
}
const s = createClient(url, key);

async function run() {
  const tables = ['job_alert_preferences', 'job_alert_campaigns', 'job_alert_campaign_jobs'];
  for (const t of tables) {
    const { data, error } = await s.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table ${t}: Error - ${error.message}`);
    } else {
      console.log(`Table ${t}: ✅ EXISTS!`);
    }
  }
}

run();
