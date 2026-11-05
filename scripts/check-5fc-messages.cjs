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

async function run() {
  const { data: msgs } = await supabase
    .from('messages')
    .select('id, recipient_id, sender_id, is_read, content')
    .or('is_read.is.null,is_read.eq.false')
    .limit(20);
  console.log('Unread in messages:', msgs ? msgs.length : 0);
  if (msgs && msgs.length > 0) {
    console.log(msgs.map(m => ({ id: m.id, recipient_id: m.recipient_id, is_read: m.is_read })));
  }

  const { data: dms } = await supabase
    .from('direct_messages')
    .select('id, recipient_id, sender_id, is_read, message')
    .eq('is_read', false)
    .limit(20);
  console.log('Unread in direct_messages:', dms ? dms.length : 0);
  if (dms && dms.length > 0) {
    console.log(dms.map(d => ({ id: d.id, recipient_id: d.recipient_id, is_read: d.is_read })));
  }
}
run();
