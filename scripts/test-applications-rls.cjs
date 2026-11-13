// scripts/test-applications-rls.cjs
const { createClient } = require('@supabase/supabase-js');

const url = 'https://dthlgsnakhoftinssokm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(url, key);

async function testInsert() {
  console.log('Testing anon insert to job_applications:');
  const payload = {
    job_id: 'db479639-909b-4783-a583-0605fe6ca9cd',
    job_title: 'Senior Staff Engineer / Tech Lead',
    full_name: 'Test Candidate',
    email: 'test.candidate@example.com',
    phone: '+91 9876543210',
    preferred_location: 'Agra / Remote',
    status: 'applied',
    applied_at: new Date().toISOString()
  };

  const { data, error } = await supabase.from('job_applications').insert(payload).select('id');
  console.log('Anon insert result:', { data, error });

  if (error) {
    console.log('Note: RLS blocks unauthenticated insert on job_applications. Code must gracefully handle guest applications via localStorage and authenticated applications via Supabase session!');
  } else {
    console.log('Anon insert succeeded! Cleaning up test record...');
    if (data && data[0]) {
      await supabase.from('job_applications').delete().eq('id', data[0].id);
    }
  }
}

testInsert();
