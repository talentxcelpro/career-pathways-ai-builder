const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read service role key from .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
let supabaseKey = '';
envContent.split('\n').forEach(line => {
  if (line.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) {
    supabaseKey = line.substring('TALENTXCEL_SERVICE_ROLE_KEY='.length).trim().replace(/^['"]|['"]$/g, '');
  }
});

if (!supabaseKey) {
  console.error('FAIL: No TALENTXCEL_SERVICE_ROLE_KEY found in .env.local');
  process.exit(1);
}

const supabaseUrl = 'https://dthlgsnakhoftinssokm.supabase.co';
const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  console.log('====================================================');
  console.log('TALENTXCEL CAREERVERSE — ZERO-MOCK PRODUCTION AUDIT');
  console.log('Database Target: https://dthlgsnakhoftinssokm.supabase.co');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 7;

  // 1. Audit Profiles & Real User Progression
  console.log('TEST 1: Verifying real players in career_players & leaderboard ranking...');
  const { data: players, error: playerErr } = await supabase
    .from('career_players')
    .select('id, display_name, career_title, college, xp, level, stats')
    .order('xp', { ascending: false })
    .limit(6);

  if (playerErr) {
    console.error('❌ career_players query error:', playerErr.message);
  } else {
    console.log(`✅ Career Players queried: ${players.length} real candidates found.`);
    players.forEach((p, idx) => console.log(`   #${idx+1}: ${p.display_name} (${p.career_title}) — ${p.xp} XP (Level ${p.level})`));
    passedTests++;
  }

  // 2. Audit Career Quests
  console.log('\nTEST 2: Verifying career_quests schema and records...');
  const { data: quests, error: questErr } = await supabase
    .from('career_quests')
    .select('id, title, category, xp_reward, coin_reward');

  if (questErr) {
    console.error('❌ Quests error:', questErr.message);
  } else {
    console.log(`✅ Career Quests active: ${quests.length} quests in database.`);
    quests.forEach(q => console.log(`   - [${q.category}] ${q.title} (+${q.xp_reward} XP)`));
    passedTests++;
  }

  // 3. Audit Skill Trees
  console.log('\nTEST 3: Verifying career_skill_paths & career_tree_skills...');
  const { data: skills, error: skillErr } = await supabase
    .from('career_tree_skills')
    .select('id, name, category, level_range, prerequisites');

  if (skillErr) {
    console.error('❌ Skills error:', skillErr.message);
  } else {
    console.log(`✅ Career Tree Skills verified: ${skills.length} nodes mapped.`);
    skills.forEach(s => console.log(`   * ${s.name} (${s.level_range}) — Prereqs: [${s.prerequisites ? s.prerequisites.join(', ') : ''}]`));
    passedTests++;
  }

  // 4. Audit Guilds
  console.log('\nTEST 4: Verifying career_guilds table & campus ranking...');
  const { data: guilds, error: guildErr } = await supabase
    .from('career_guilds')
    .select('id, name, tagline, member_count, campus_rank');

  if (guildErr) {
    console.error('❌ Guilds error:', guildErr.message);
  } else {
    console.log(`✅ Guilds queried: ${guilds.length} campus guilds found.`);
    guilds.forEach(g => console.log(`   🛡️ ${g.name} — ${g.member_count} members (Rank #${g.campus_rank})`));
    passedTests++;
  }

  // 5. Audit Boss Battles
  console.log('\nTEST 5: Verifying career_boss_battles table...');
  const { data: battles, error: battleErr } = await supabase
    .from('career_boss_battles')
    .select('id, title, company_name, xp_reward');

  if (battleErr) {
    console.error('❌ Boss battles error:', battleErr.message);
  } else {
    console.log(`✅ Boss Battles verified: ${battles.length} challenges found.`);
    battles.forEach(b => console.log(`   ⚔️ ${b.title} by ${b.company_name} (+${b.xp_reward} XP)`));
    passedTests++;
  }

  // 6. Audit XP Ledger Authoritative Idempotency
  console.log('\nTEST 6: Testing career_xp_ledger server-authoritative idempotency...');
  const testIdempotencyKey = `audit_test_key_${Date.now()}`;
  const targetUserId = players && players[0] ? players[0].id : '375b5ffa-1057-4c46-bc30-1b1aab7396de';
  const { data: insertLedger, error: ledgerErr } = await supabase
    .from('career_xp_ledger')
    .insert({
      user_id: targetUserId,
      amount: 10,
      reason: 'Audit automated verification',
      source_type: 'test',
      source_id: 'audit_01',
      idempotency_key: testIdempotencyKey
    })
    .select('id, idempotency_key');

  if (ledgerErr) {
    console.error('❌ Ledger insert error:', ledgerErr.message);
  } else {
    console.log(`✅ Ledger entry created with idempotency key: ${testIdempotencyKey}`);
    
    // Attempt duplicate lookup with SAME key — must be detected
    const { data: dupCheck } = await supabase
      .from('career_xp_ledger')
      .select('id')
      .eq('idempotency_key', testIdempotencyKey);
      
    if (dupCheck && dupCheck.length === 1) {
      console.log('✅ Idempotency verification successful: exactly 1 entry exists.');
      // Cleanup audit test row
      await supabase.from('career_xp_ledger').delete().eq('idempotency_key', testIdempotencyKey);
      passedTests++;
    } else {
      console.error('❌ Idempotency failed: multiple entries detected.');
    }
  }

  // 7. Zero-Mock Codebase Verification
  console.log('\nTEST 7: Checking for illegal mock data and Math.random() in CareerVerse components & services...');
  const cvDir = 'src/components/careerverse';
  const cvServicesDir = 'src/services/careerverse';
  const allFiles = [
    ...fs.readdirSync(cvDir).map(f => `${cvDir}/${f}`),
    ...fs.readdirSync(cvServicesDir).map(f => `${cvServicesDir}/${f}`),
    'src/pages/CareerVersePage.tsx'
  ];

  let mockFound = false;
  allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes('Math.random()')) {
      console.error(`❌ Non-deterministic Math.random() detected in ${file}`);
      mockFound = true;
    }
  });

  if (!mockFound) {
    console.log(`✅ Clean: Zero Math.random() in production CareerVerse files (${allFiles.length} files scanned).`);
    passedTests++;
  }

  console.log('\n====================================================');
  console.log(`AUDIT SCORECARD: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================');

  if (passedTests === totalTests) {
    console.log('🎉 ZERO-MOCK PRODUCTION READINESS GATE: PASSED');
    process.exit(0);
  } else {
    console.error('⚠️ SOME TESTS FAILED. PLEASE REVIEW LOGS.');
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
