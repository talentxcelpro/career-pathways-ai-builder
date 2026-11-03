const { createClient } = require('@supabase/supabase-js');

const client = createClient(
  'https://dthlgsnakhoftinssokm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc'
);

async function inspect() {
  const { data: profiles, error } = await client
    .from('profiles')
    .select('id, full_name, title, headline, current_job_title, skills, verified_skills, education_history, work_experiences, profile_picture_url, profile_photo_url')
    .not('full_name', 'is', null)
    .limit(5);

  if (error) {
    console.error('Error fetching profiles:', error);
    return;
  }

  console.log(`Found ${profiles.length} real profiles in database:\n`);
  profiles.forEach((p, idx) => {
    console.log(`=== USER ${idx + 1} ===`);
    console.log(`ID: ${p.id}`);
    console.log(`Name: ${p.full_name}`);
    console.log(`Headline: ${p.headline || p.title || p.current_job_title || 'N/A'}`);
    console.log(`Skills: ${JSON.stringify(p.skills || [])}`);
    console.log(`Verified Skills: ${JSON.stringify(p.verified_skills || [])}`);
    console.log(`Education: ${JSON.stringify(p.education_history || [])}`);
    console.log(`Work Experiences: ${JSON.stringify(p.work_experiences || [])}\n`);
  });
}

inspect();
