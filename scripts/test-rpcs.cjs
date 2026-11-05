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
const supabase = createClient(env.TX_SUPABASE_URL || env.VITE_SUPABASE_URL, env.TALENTXCEL_SERVICE_ROLE_KEY);

async function checkRpc() {
  // Test common system RPCs
  const funcs = ['exec_sql', 'run_sql', 'query', 'sql', 'execute_sql'];
  for (const f of funcs) {
    const { data, error } = await supabase.rpc(f, { query: 'SELECT 1' });
    console.log(`RPC ${f}:`, error ? error.message : 'EXISTS');
  }
}
checkRpc().catch(console.error);
