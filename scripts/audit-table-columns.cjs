// scripts/audit-table-columns.cjs
const { createClient } = require('@supabase/supabase-js');

const url = 'https://dthlgsnakhoftinssokm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(url, key);

async function inspectColumns() {
  const tables = ['job_applications', 'saved_jobs', 'resumes'];

  for (const t of tables) {
    console.log(`\n--- Inspecting ${t} columns via fake insert simulation ---`);
    // Sending empty object will fail and show missing non-null columns or success
    const { error } = await supabase.from(t).insert({});
    if (error) {
      console.log(`Error message for ${t}:`, error.message, '| Details:', error.details, '| Hint:', error.hint);
    }
  }
}

inspectColumns();
