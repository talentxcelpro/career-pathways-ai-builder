const { createClient } = require('@supabase/supabase-js');

const url = "https://dthlgsnakhoftinssokm.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";
const supabase = createClient(url, key);

async function inspectJobs() {
  const { data, count, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, location_city, location_state, is_remote, work_mode, industry', { count: 'exact' })
    .limit(500);

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }
  console.log('Total jobs count:', count);
  const locs = {};
  const industries = {};
  (data || []).forEach(j => {
    const l = j.location || 'Unknown';
    locs[l] = (locs[l] || 0) + 1;
    const ind = j.industry || 'General';
    industries[ind] = (industries[ind] || 0) + 1;
  });
  console.log('Locations count breakdown (top 20):', Object.entries(locs).sort((a,b)=>b[1]-a[1]).slice(0, 20));
  console.log('Industries count breakdown:', Object.entries(industries).sort((a,b)=>b[1]-a[1]));
}
inspectJobs();
