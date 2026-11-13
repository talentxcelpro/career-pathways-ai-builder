const { createClient } = require('@supabase/supabase-js');

const url = 'https://dthlgsnakhoftinssokm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(url, key);

async function check() {
  const { count, error } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_active', true);
  console.log('Live Active Jobs Count:', count, 'Error:', error);

  const { data: sampleJobs } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, location_city, salary_min, salary_max, employment_type, is_remote, work_mode, skills_required, created_at, external_url, min_experience, max_experience')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(5);

  console.log('\nSample 5 Real Database Jobs:');
  sampleJobs.forEach((j, i) => {
    console.log(`[${i+1}] Title: ${j.title} | Company: ${j.company_name} | Location: ${j.location} | Salary: ${j.salary_min} - ${j.salary_max} | Exp: ${j.min_experience} - ${j.max_experience} | Remote: ${j.is_remote}`);
  });
}

check();
