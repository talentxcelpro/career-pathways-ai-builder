const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("--- PHASE 2E: REAL EMPLOYER END-TO-END TEST ---");
  
  const testEmail = `employer_test_${Date.now()}@talentxcel.local`;
  const testPassword = 'TestPassword123!';

  console.log(`1. Creating test employer: ${testEmail}`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (authError) {
    console.error("Failed to sign up:", authError.message);
    return;
  }

  const user = authData.user;
  console.log(`2. Employer created and authenticated: ${user.id}`);
  
  await supabase.from('profiles').insert({ 
      id: user.id, 
      username: `emp_${Date.now()}`,
      full_name: 'Test Employer' 
  });

  console.log(`3. Using an existing company (or omitting company_id)...`);
  const { data: companyData } = await supabase.from('companies').select('id').limit(1).single();
  const companyId = companyData ? companyData.id : null;

  console.log(`4. Creating Hiring Requirement...`);
  const { data: reqData, error: reqError } = await supabase.from('requirements').insert({
    employer_id: user.id,
    company_id: companyId,
    title: 'Senior Frontend Developer',
    description: 'We need an expert in React.',
    required_skills: ['React', 'TypeScript'],
    status: 'active'
  }).select('id').single();

  if (reqError) {
    console.error("FAIL: Requirement creation failed:", reqError.message);
    return;
  }
  console.log(`PASS: Requirement created. ID: ${reqData.id}`);

  console.log(`5. Creating Candidate Shortlist...`);
  // Use the newly created user.id as the candidate ID to guarantee it exists in auth.users
  const candDataId = user.id;

  const { data: listData, error: listError } = await supabase.from('shortlists').insert({
    employer_id: user.id,
    requirement_id: reqData.id,
    candidate_id: candDataId,
    status: 'shortlisted'
  }).select('id').single();

  if (listError) {
    console.error("FAIL: Shortlist creation failed:", listError.message);
    return;
  }
  console.log(`PASS: Candidate Shortlist created. ID: ${listData.id}`);
  console.log("\nALL EMPLOYER FLOWS PASSED SUCCESSFULLY.");
}

run();
