const { createClient } = require('@supabase/supabase-js');
const url = "https://dthlgsnakhoftinssokm.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";
const supabase = createClient(url, key);

async function check() {
  const { data: featured } = await supabase.from('jobs').select('id, title, company_name, is_featured').eq('is_featured', true).limit(10);
  console.log('Featured jobs count:', featured?.length);
  console.log('Featured jobs:', featured?.slice(0, 4));
}
check();
