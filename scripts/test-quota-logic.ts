// scripts/test-quota-logic.ts
// Test atomic quota mechanics directly against Supabase database

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://dthlgsnakhoftinssokm.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testQuotaEngine() {
  console.log('--- Testing consume_user_quota RPC with dry run ---');
  
  // Test with non-existent or dummy user ID
  const testUserId = '00000000-0000-0000-0000-000000000000';
  
  // 1. Dry run on ats_check for free tier
  const { data: dryRunData, error: dryRunError } = await supabase.rpc('consume_user_quota', {
    p_user_id: testUserId,
    p_feature_type: 'ats_check',
    p_dry_run: true
  });

  console.log('Dry run result (ats_check):', dryRunData, 'Error:', dryRunError?.message || 'none');

  // 2. Dry run on resume_tailoring for free tier (Free tier limit is 0)
  const { data: tailoringData, error: tailoringError } = await supabase.rpc('consume_user_quota', {
    p_user_id: testUserId,
    p_feature_type: 'resume_tailoring',
    p_dry_run: true
  });

  console.log('Dry run result (resume_tailoring on Free):', tailoringData, 'Error:', tailoringError?.message || 'none');

  // 3. Invalid feature type test
  const { data: invalidData } = await supabase.rpc('consume_user_quota', {
    p_user_id: testUserId,
    p_feature_type: 'unknown_feature',
    p_dry_run: true
  });

  console.log('Invalid feature type handling:', invalidData);
}

testQuotaEngine();
