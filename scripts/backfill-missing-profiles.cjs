const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

let key = '';
const content = fs.readFileSync('.env.local', 'utf8');
content.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=') || trimmed.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    key = trimmed.substring(trimmed.indexOf('=') + 1).replace(/^['"]|['"]$/g, '').trim();
  }
});

const supabase = createClient('https://dthlgsnakhoftinssokm.supabase.co', key);

async function backfillAll() {
  console.log('Fetching all auth users...');
  let allAuthUsers = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 100 });
    if (error || !data || data.users.length === 0) break;
    allAuthUsers.push(...data.users);
    if (data.users.length < 100) break;
    page++;
  }
  console.log(`Fetched ${allAuthUsers.length} total auth users.`);

  // Get existing profiles
  const { data: existingProfiles } = await supabase.from('profiles').select('id');
  const existingSet = new Set((existingProfiles || []).map(p => p.id));
  console.log(`Found ${existingSet.size} existing profiles.`);

  const missing = allAuthUsers.filter(u => !existingSet.has(u.id));
  console.log(`Missing profiles to insert: ${missing.length}`);

  let inserted = 0;
  let failed = 0;

  for (const user of missing) {
    const meta = user.user_metadata || {};
    const displayName = meta.full_name || meta.name || user.email.split('@')[0];
    const cleanUsername = (meta.username || user.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase()) + '_' + user.id.substring(0, 6);
    const avatarUrl = meta.avatar_url || meta.picture || null;

    const profileData = {
      id: user.id,
      email: user.email,
      full_name: displayName,
      username: cleanUsername,
      profile_picture_url: avatarUrl,
      profile_photo_url: avatarUrl,
      first_login: true,
      onboarding_completed: false,
      profile_completed: false,
      is_profile_public: false,
      profile_visibility: 'private',
      verification_status: 'unverified',
      user_role: 'candidate'
    };

    const { error: insErr } = await supabase.from('profiles').insert(profileData);
    if (insErr) {
      console.error(`Failed to insert profile for ${user.email} (${user.id}):`, insErr);
      failed++;
    } else {
      console.log(`✓ Inserted profile for: ${displayName} (${user.email})`);
      inserted++;
    }

    // Also check if admin connection exists for this user
    const adminIds = [
      '61b6d8bb-bbea-41c5-8ca4-152c4bc5d599', // talentxcelservices@gmail.com
      '5fc21d0d-dd1d-4fd8-802c-9e4ae8d6a062'  // talentxcelpro@gmail.com
    ];

    for (const adminId of adminIds) {
      if (user.id === adminId) continue;
      const { data: existingConn } = await supabase
        .from('connections')
        .select('id')
        .or(`and(requester_id.eq.${adminId},recipient_id.eq.${user.id}),and(requester_id.eq.${user.id},recipient_id.eq.${adminId})`)
        .maybeSingle();

      if (!existingConn) {
        await supabase.from('connections').insert({
          requester_id: adminId,
          recipient_id: user.id,
          status: 'accepted',
          message: "Welcome to TalentXcel! We're excited to have you in our community.",
          connected_at: new Date().toISOString()
        });
      }
    }
  }

  console.log(`\nBackfill complete! Inserted: ${inserted}, Failed: ${failed}`);
}

backfillAll();
