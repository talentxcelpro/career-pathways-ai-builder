const { createClient } = require('@supabase/supabase-js');

const url = "https://dthlgsnakhoftinssokm.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

const client = createClient(url, key);

async function run() {
  const { data, count, error } = await client
    .from('jobs')
    .select('id, title, company_name, location, department, industry, external_url, application_deadline, expires_at, is_active', { count: 'exact' })
    .eq('is_active', true)
    .limit(10);

  console.log('Error:', error);
  console.log('Count:', count);
  console.log('Data length:', data ? data.length : 0);
  if (data && data.length > 0) {
    console.log('Sample job:', data[0]);
  }
}

run();
