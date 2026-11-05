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
  console.log('--- Checking profiles matching life / Love ---');
  const { data: p } = await supabase.from('profiles').select('id, username, email, full_name').ilike('username', '%life%');
  console.log('Profiles matching username life:', p);
  const { data: pAll } = await supabase.from('profiles').select('id, username, email, full_name').ilike('full_name', '%Love%');
  console.log('Profiles matching full_name Love:', pAll);

  console.log('--- Checking TalentXcelServices ---');
  const { data: adminP } = await supabase.from('profiles').select('id, username, email, full_name').ilike('username', '%talent%');
  console.log('Profiles matching talent:', adminP);

  if (adminP && adminP.length > 0) {
    const adminId = adminP[0].id;
    const { count: mCount, data: msgs } = await supabase.from('messages').select('*', { count: 'exact' }).eq('recipient_id', adminId);
    console.log('Messages for adminId:', mCount, msgs ? msgs.map(m => ({ id: m.id, is_read: m.is_read, created_at: m.created_at })) : []);
    const { count: dmCount, data: dms } = await supabase.from('direct_messages').select('*', { count: 'exact' }).eq('recipient_id', adminId);
    console.log('Direct messages for adminId:', dmCount, dms ? dms.map(d => ({ id: d.id, is_read: d.is_read, created_at: d.created_at })) : []);
  }

  console.log('--- Checking recent career_players vs profiles ---');
  const { count: profCount, data: profs } = await supabase.from('profiles').select('id, created_at, username, full_name', { count: 'exact' }).order('created_at', { ascending: false }).limit(5);
  console.log('Total profiles:', profCount, 'Recent 5:', profs);
  const { count: playCount, data: players } = await supabase.from('career_players').select('id, user_id, current_xp, created_at', { count: 'exact' }).order('created_at', { ascending: false }).limit(5);
  console.log('Total career_players:', playCount, 'Recent 5:', players);
}

run().catch(console.error);
