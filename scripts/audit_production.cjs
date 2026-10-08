const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("--- PHASE 2A & 2B: MIGRATION SAFETY AUDIT ---");
  
  // 1. Audit existing tables using anon key
  const tablesToAudit = ['resumes', 'job_applications', 'profiles', 'jobs', 'companies'];
  for (const table of tablesToAudit) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error && error.code === '42P01') {
      console.log(`[ERROR] Table ${table} DOES NOT EXIST in production!`);
    } else {
      console.log(`[OK] Table ${table} exists.`);
    }
  }

  const missingTablesToAudit = ['career_passports', 'requirements', 'shortlists'];
  for (const table of missingTablesToAudit) {
    const { error } = await supabase.from(table).select('id').limit(1);
    if (error && error.code === '42P01') {
      console.log(`[OK] Proposed table ${table} correctly does NOT exist yet.`);
    } else {
      console.log(`[WARNING] Proposed table ${table} already exists or returned unexpected error:`, error);
    }
  }
}

run();
