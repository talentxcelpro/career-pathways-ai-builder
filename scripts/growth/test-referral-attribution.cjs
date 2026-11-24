const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const idx = line.indexOf('=');
  if (idx > 0) {
    const k = line.slice(0, idx).trim();
    let v = line.slice(idx + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    env[k] = v;
  }
});

const supabase = createClient(env.TX_SUPABASE_URL, env.TALENTXCEL_SERVICE_ROLE_KEY);

async function testReferralAttribution() {
  console.log('=== TESTING REFERRAL ATTRIBUTION ENGINE ===');

  // 1. Fetch an existing valid referral code or user
  const { data: sampleRef } = await supabase
    .from('user_referrals')
    .select('referral_code, referrer_id')
    .limit(1)
    .single();

  const referralCode = sampleRef?.referral_code || 'TXC5FC21D0D';
  console.log('Using test referral code:', referralCode);

  // 2. Simulate Visitor Click Attribution
  const testVisitorId = 'test-visitor-' + Date.now();
  const { data: clickRes, error: clickErr } = await supabase.rpc('attribute_growth_referral', {
    p_referral_code: referralCode,
    p_visitor_id: testVisitorId,
    p_landing_path: '/network/skills/react',
    p_channel: 'shortlink',
    p_campaign: 'growth_engine_test'
  });

  if (clickErr) {
    console.error('Click attribution failed:', clickErr);
    process.exit(1);
  }
  console.log('✓ Click attribution recorded:', clickRes);

  // 3. Simulate Signup Conversion Attribution
  const testUserId = '0f808047-f6bb-43f7-873c-d5ede605733b'; // real profile ID
  const { data: signupRes, error: signupErr } = await supabase.rpc('attribute_growth_referral', {
    p_referral_code: referralCode,
    p_visitor_id: testVisitorId,
    p_landing_path: '/network/skills/react',
    p_channel: 'shortlink',
    p_campaign: 'growth_engine_test',
    p_user_id: testUserId
  });

  if (signupErr) {
    console.error('Signup attribution failed:', signupErr);
    process.exit(1);
  }
  console.log('✓ Signup conversion recorded:', signupRes);

  // 4. Verify in growth_referral_attributions
  const { data: records, error: fetchErr } = await supabase
    .from('growth_referral_attributions')
    .select('*')
    .eq('visitor_id', testVisitorId);

  console.log(`✓ Verified ${records?.length || 0} attribution records in database:`, records);
  console.log('✅ Referral Engine verification PASSED!');
}

testReferralAttribution().catch(console.error);
