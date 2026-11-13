const { createClient } = require('@supabase/supabase-js');
const url = "https://dthlgsnakhoftinssokm.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";
const supabase = createClient(url, key);

async function findExact() {
  const { data: exactRows } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, salary_min, salary_max, salary_currency, created_at')
    .eq('company_name', 'TalentXcel Services');
  
  console.log(`Exact "TalentXcel Services" count: ${exactRows?.length}`);
  console.log(exactRows);

  // Check what the 12 monthly salary rows might be (e.g. in salaries table or jobs table)
  // Let's check tables in supabase:
  const { data: salariesRows } = await supabase
    .from('salaries')
    .select('*')
    .limit(20);
  console.log('salaries table sample:', salariesRows?.length);

  // Check jobs with salary_max < 150000
  const { data: lowSalaryJobs } = await supabase
    .from('jobs')
    .select('id, title, company_name, salary_min, salary_max, salary_currency')
    .lt('salary_max', 150000)
    .gt('salary_max', 0);
  console.log('lowSalaryJobs count:', lowSalaryJobs?.length);
  console.log('lowSalaryJobs:', lowSalaryJobs);
}

findExact();
