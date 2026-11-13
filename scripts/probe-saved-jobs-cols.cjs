// scripts/probe-saved-jobs-cols.cjs
const { createClient } = require('@supabase/supabase-js');

const url = 'https://dthlgsnakhoftinssokm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(url, key);

async function probe() {
  const testCols = ['id', 'job_id', 'user_id', 'saved_at', 'created_at', 'notes'];

  for (const c of testCols) {
    const { error } = await supabase.from('saved_jobs').select(c).limit(1);
    if (!error) console.log(`saved_jobs Column [${c}]: EXISTS!`);
  }
}

probe();
