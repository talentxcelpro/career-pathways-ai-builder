const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv() {
  const env = {};
  ['.env', '.env.local'].forEach(file => {
    if (fs.existsSync(file)) {
      fs.readFileSync(file, 'utf8').split(/\r?\n/).forEach(line => {
        const match = line.match(/^([^#=]+)=(.*)$/);
        if (match) {
          let key = match[1].trim();
          let val = match[2].trim();
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
          if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
          env[key] = val;
        }
      });
    }
  });
  return env;
}

const env = loadEnv();
const supabase = createClient(env.VITE_SUPABASE_URL, env.TALENTXCEL_SERVICE_ROLE_KEY);

async function printData() {
  const adminId = '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062';
  
  const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const { data: connections } = await supabase
    .from('connections')
    .select('requester_id, recipient_id')
    .or(`requester_id.eq.${adminId},recipient_id.eq.${adminId}`)
    .eq('status', 'accepted');

  const connectedSet = new Set();
  connections?.forEach(c => {
    connectedSet.add(c.requester_id);
    connectedSet.add(c.recipient_id);
  });

  const missing = users?.filter(u => u.id !== adminId && !connectedSet.has(u.id));
  console.log('Users not connected to admin:', missing?.map(u => ({ id: u.id, email: u.email })));

  if (missing && missing.length > 0) {
    for (const u of missing) {
      // Create connection
      const { error } = await supabase.from('connections').insert({
        requester_id: adminId,
        recipient_id: u.id,
        status: 'accepted',
        message: 'Welcome to TalentXcel! We are excited to have you in our community.',
        connected_at: new Date().toISOString(),
      });
      console.log('Connected', u.email, 'error:', error?.message);
    }
  }
}

printData().catch(console.error);
