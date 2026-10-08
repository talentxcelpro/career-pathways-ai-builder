const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("--- PHASE 2D: REAL CANDIDATE END-TO-END TEST ---");
  
  const testEmail = `candidate_test_${Date.now()}@talentxcel.local`;
  const testPassword = 'TestPassword123!';

  console.log(`1. Creating test candidate: ${testEmail}`);
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
  });

  if (authError) {
    console.error("Failed to sign up:", authError.message);
    return;
  }

  const user = authData.user;
  console.log(`2. User created and authenticated: ${user.id}`);
  
  const { error: profileError } = await supabase.from('profiles').insert({ 
      id: user.id, 
      username: `user_${Date.now()}`,
      full_name: 'Test Candidate' 
  });
  if (profileError) {
      console.log("Profile insert error:", profileError.message);
  }

  console.log(`3. Uploading parsed resume data...`);
  const { data: resumeData, error: resumeError } = await supabase.from('resumes').insert({
    user_id: user.id,
    title: 'Senior Software Engineer',
    content: {
      basics: { name: "Test Candidate", email: testEmail },
      skills: ["React", "TypeScript", "Node.js"]
    },
    is_active: true
  }).select('id').single();

  if (resumeError) {
    console.error("FAIL: Resume upload failed:", resumeError.message);
    return;
  }
  console.log(`PASS: Resume record created. ID: ${resumeData.id}`);

  console.log(`4. Generating Career Passport...`);
  const { data: passportData, error: passportError } = await supabase.from('career_passports').insert({
    user_id: user.id,
    profile_id: user.id,
    career_goals: "Become a Senior Engineer",
    talent_score: 850
  }).select('id').single();

  if (passportError) {
    console.error("FAIL: Career Passport creation failed:", passportError.message);
    return;
  }
  console.log(`PASS: Career Passport created. ID: ${passportData.id}`);

  console.log(`5. Applying for a job...`);
  const { data: jobData } = await supabase.from('jobs').select('id, posted_by').limit(1).single();
  
  const { data: appData, error: appError } = await supabase.from('job_applications').insert({
    job_id: jobData.id,
    user_id: user.id,
    resume_url: `https://fakeurl.com/resumes/${resumeData.id}.pdf`,
    application_data: { resumeId: resumeData.id }
  }).select('id').single();

  if (appError) {
    console.error("FAIL: Job application failed:", appError.message);
    return;
  }
  console.log(`PASS: Job Application created. ID: ${appData.id}`);
  console.log("\nALL CANDIDATE FLOWS PASSED SUCCESSFULLY.");
}

run();
