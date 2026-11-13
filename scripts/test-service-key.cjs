const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

let serviceKey = '';
const url = 'https://dthlgsnakhoftinssokm.supabase.co';

if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=') || trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      const idx = trimmed.indexOf('=');
      serviceKey = trimmed.substring(idx + 1).replace(/^['"]|['"]$/g, '').trim();
    }
  });
}

console.log('Found key length:', serviceKey.length);
const supabase = createClient(url, serviceKey);

async function main() {
  const { count, error } = await supabase.from('jobs').select('id', { count: 'exact', head: true });
  if (error) {
    console.error('Service key error:', error);
  } else {
    console.log('TALENTXCEL_SERVICE_ROLE_KEY SUCCESS! Total jobs in Supabase:', count);
  }
}
main();
