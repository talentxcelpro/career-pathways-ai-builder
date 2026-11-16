const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let serviceKey = '';
let supabaseUrl = '';

function loadEnv(file) {
  const p = path.resolve(file);
  if (fs.existsSync(p)) {
    const lines = fs.readFileSync(p, 'utf-8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) {
        serviceKey = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
      }
      if (trimmed.startsWith('TX_SUPABASE_URL=')) {
        supabaseUrl = trimmed.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
      }
    }
  }
}

loadEnv('.env');
loadEnv('.env.local');

console.log('Using URL:', supabaseUrl, 'Key length:', serviceKey.length);
const s = createClient(supabaseUrl, serviceKey);

async function run() {
  const targetIds = [
    'e5a0cbf2-dca1-453e-a51b-bff6de5a3689',
    'e729b4f5-85dd-4f51-b7b9-5c7c40bbbe54',
    'd5ed370e-c04e-489e-97f6-9a8bb0dad386',
    'e8b2da2a-e80c-481a-a3ce-bd37ad57ccb1',
    '27a9621e-6cda-4b94-9dc6-ed4a41669327',
    '5fb400b0-95b4-4d06-810e-8b4a94f11e07'
  ];

  for (const id of targetIds) {
    const { data, error } = await s
      .from('jobs')
      .update({ is_active: true, job_status: 'open' })
      .eq('id', id)
      .select('id, title, is_active, job_status');
    console.log(`Updated ${id}:`, data, error);
  }

  // Also activate any remaining inactive
  const { data: allUpdated, error: updateAllErr } = await s
    .from('jobs')
    .update({ is_active: true, job_status: 'open' })
    .eq('is_active', false)
    .select('id, title');
  console.log('Bulk reactivate remaining:', allUpdated?.length, updateAllErr);

  const { count: inactiveCount } = await s.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', false);
  console.log('Remaining inactive count:', inactiveCount);

  const { count: totalActive } = await s.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true);
  console.log('Total verified active jobs now:', totalActive);
}

run();
