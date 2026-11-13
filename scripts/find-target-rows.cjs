const { createClient } = require('@supabase/supabase-js');
const url = "https://dthlgsnakhoftinssokm.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";
const supabase = createClient(url, key);

async function findRows() {
  console.log('--- 1. Searching for "TalentXcel Services" company rows ---');
  const { data: companyRows, error: compErr } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, salary_min, salary_max, salary_currency, created_at')
    .ilike('company_name', '%TalentXcel%');
  
  console.log(`Found ${companyRows?.length || 0} TalentXcel Services job rows:`);
  console.log(companyRows);

  console.log('\n--- 2. Searching for monthly salary rows ---');
  // Monthly salaries are usually < 100,000 INR (e.g. 15,000 - 80,000/mo) or flagged as monthly in salary_period/description
  const { data: allJobs } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, salary_min, salary_max, salary_currency, description')
    .order('created_at', { ascending: false })
    .limit(3000);

  const monthlyCandidates = (allJobs || []).filter(j => {
    const desc = (j.description || '').toLowerCase();
    const isMonthlyWord = desc.includes('/month') || desc.includes('per month') || desc.includes('monthly');
    const isLowInr = (j.salary_currency === 'INR' || !j.salary_currency) && j.salary_max && j.salary_max <= 100000 && j.salary_max >= 5000;
    return isMonthlyWord || isLowInr;
  });

  console.log(`Found ${monthlyCandidates.length} monthly candidate rows:`);
  console.log(monthlyCandidates.slice(0, 15).map(j => ({
    id: j.id,
    title: j.title,
    company: j.company_name,
    min: j.salary_min,
    max: j.salary_max,
    curr: j.salary_currency
  })));
}

findRows();
