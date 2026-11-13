const { createClient } = require('@supabase/supabase-js');
const url = "https://dthlgsnakhoftinssokm.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";
const supabase = createClient(url, key);

async function checkDatePosted() {
  const { count: total } = await supabase.from('jobs').select('id', { count: 'exact', head: true });
  const { count: withPostedAt } = await supabase.from('jobs').select('id', { count: 'exact', head: true }).not('posted_at', 'is', null);
  const { count: withCreatedAt } = await supabase.from('jobs').select('id', { count: 'exact', head: true }).not('created_at', 'is', null);
  
  console.log({ total, withPostedAt, withCreatedAt, missingPostedAt: total - (withPostedAt || 0) });
}

checkDatePosted();
