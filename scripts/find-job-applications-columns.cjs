// scripts/find-job-applications-columns.cjs
const { createClient } = require('@supabase/supabase-js');

const url = 'https://dthlgsnakhoftinssokm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(url, key);

async function findCols() {
  // Let's try select * from job_applications limit 0 to see if PostgREST returns headers or error
  const { data, error } = await supabase.from('job_applications').select('*').limit(1);
  console.log('Select * from job_applications:', { data, error });

  // Let's test columns one by one
  const testCols = [
    'id', 'job_id', 'user_id', 'applicant_id', 'candidate_id', 'status', 'created_at',
    'resume_url', 'cover_letter', 'notes', 'applied_at', 'full_name', 'name', 'email', 'phone'
  ];

  for (const c of testCols) {
    const { error: colErr } = await supabase.from('job_applications').select(c).limit(1);
    if (!colErr) {
      console.log(`Column [${c}]: EXISTS!`);
    } else {
      console.log(`Column [${c}]: NOT present (${colErr.message})`);
    }
  }
}

findCols();
