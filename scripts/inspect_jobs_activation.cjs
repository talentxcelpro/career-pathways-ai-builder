const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

let serviceKey = '';
let supabaseUrl = '';
const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    if (line.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) {
      serviceKey = line.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
    }
    if (line.startsWith('TX_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim().replace(/^['"]|['"]$/g, '');
    }
  }
}

const finalUrl = supabaseUrl || 'https://dthlgsnakhoftinssokm.supabase.co';
const finalKey = serviceKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';
const s = createClient(finalUrl, finalKey);

async function check() {
  const { data: job1 } = await s.from('jobs').select('*').eq('id', '1').maybeSingle();
  console.log('Job with ID=1:', job1);

  const { data: paytmJobs } = await s.from('jobs').select('id, title, is_active, job_status, company_name, seo_slug').ilike('company_name', '%paytm%');
  console.log('Paytm jobs:', paytmJobs);

  const { count: activeCount } = await s.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', true);
  console.log('Active jobs count:', activeCount);

  const { count: inactiveCount } = await s.from('jobs').select('id', { count: 'exact', head: true }).eq('is_active', false);
  console.log('Inactive jobs count:', inactiveCount);

  const { data: recentJobs } = await s.from('jobs').select('id, title, is_active, job_status, company_name, seo_slug').limit(5);
  console.log('Recent 5 jobs:', recentJobs);
}

check();
