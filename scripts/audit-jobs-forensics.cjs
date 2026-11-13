// scripts/audit-jobs-forensics.cjs
const { createClient } = require('@supabase/supabase-js');

const url = 'https://dthlgsnakhoftinssokm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(url, key);

async function inspectTables() {
  const tables = [
    'jobs', 
    'job_applications', 
    'applications', 
    'profiles', 
    'resumes', 
    'companies', 
    'employers', 
    'saved_jobs', 
    'job_alerts', 
    'interviews',
    'recruiters',
    'subscriptions',
    'user_roles'
  ];

  console.log('--- SUPABASE TABLE SCHEMA & DATA AUDIT ---');
  for (const t of tables) {
    try {
      const { data, count, error } = await supabase.from(t).select('*', { count: 'exact' }).limit(1);
      if (error) {
        console.log(`[${t}]: ERROR -> ${error.message} (Code: ${error.code})`);
      } else {
        const sample = data && data[0] ? Object.keys(data[0]) : [];
        console.log(`[${t}]: ACCESSIBLE -> count: ${count}, columns: ${sample.join(', ')}`);
      }
    } catch (e) {
      console.log(`[${t}]: EXCEPTION -> ${e.message}`);
    }
  }

  console.log('\n--- JOBS TABLE DETAIL AUDIT ---');
  const { data: jobSamples, count: jobCount } = await supabase
    .from('jobs')
    .select('*')
    .limit(2);
  
  console.log('Total jobs in table:', jobCount);
  if (jobSamples && jobSamples.length > 0) {
    console.log('Sample Job Columns:', Object.keys(jobSamples[0]));
    console.log('Sample Job Record #1:', JSON.stringify(jobSamples[0], null, 2));
  }
}

inspectTables();
