// scripts/probe-more-job-app-cols.cjs
const { createClient } = require('@supabase/supabase-js');

const url = 'https://dthlgsnakhoftinssokm.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(url, key);

async function probe() {
  const testCols = [
    'updated_at', 'last_activity_at', 'ai_match_score', 'screening_answers',
    'rating', 'stage', 'feedback', 'source', 'resume_id', 'portfolio_url',
    'expected_salary', 'current_salary', 'notice_period', 'experience_years',
    'match_score', 'compatibility_score', 'rejection_reason', 'metadata'
  ];

  for (const c of testCols) {
    const { error } = await supabase.from('job_applications').select(c).limit(1);
    if (!error) console.log(`Column [${c}]: EXISTS!`);
  }
}

probe();
