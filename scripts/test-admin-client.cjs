const fs = require('fs');
const env = fs.readFileSync('.env.local', 'utf8');
let key = '';
env.split('\n').forEach(l => {
  if (l.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) {
    key = l.substring('TALENTXCEL_SERVICE_ROLE_KEY='.length).trim().replace(/^['"]|['"]$/g, '');
  }
});
const { createClient } = require('@supabase/supabase-js');
const adminClient = createClient('https://dthlgsnakhoftinssokm.supabase.co', key);

async function testAdmin() {
  console.log('Testing adminClient with service role key...');
  const res = await adminClient.from('profiles').select('id', { count: 'exact', head: true });
  console.log('Admin profiles count:', res.count, 'error:', res.error ? res.error.message : 'none');

  // Check RPC functions available
  const rpcRes = await adminClient.rpc('exec_sql', { query: 'SELECT 1;' });
  console.log('exec_sql RPC available?:', rpcRes.error ? rpcRes.error.message : 'YES');
}
testAdmin().catch(console.error);
