const { createClient } = require('@supabase/supabase-js');

const url = "https://dthlgsnakhoftinssokm.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc";

const supabase = createClient(url, key);

const CORE_ORGANIZATIONS = [
  'bhel', 'isro', 'drdo', 'iocl', 'railway', 'rrb', 'ntpc', 'ongc', 'sail',
  'hal', 'bel', 'powergrid', 'coal india', 'lic', 'sbi', 'rbi', 'upsc', 'ssc'
];

const CORE_KEYWORDS = [
  'mechanical', 'civil', 'electrical', 'safety', 'officer', 'hospital', 
  'logistics', 'supply chain', 'manufacturing', 'public', 'government', 
  'audit', 'energy', 'psu', 'technician', 'plant', 'maintenance', 'site', 'trainee', 'sub-engineer'
];

const TECH_KEYWORDS = [
  'software', 'developer', 'frontend', 'backend', 'full stack', 'react', 
  'node', 'python', 'java', 'cloud', 'devops', 'data', 'ai', 'machine learning', 
  'qa', 'automation', 'cyber', 'security', 'it support', 'freshers', 'engineer', 
  'architect', 'sre', 'tech lead', 'programmer', 'analyst', 'database', 'platform'
];

const NON_TECH_KEYWORDS = [
  'marketing', 'sales', 'operations', 'customer', 'business', 'hr', 
  'human resources', 'finance', 'account', 'content', 'writer', 'support', 
  'management trainee', 'relationship manager', 'administration', 'hospitality',
  'telecaller', 'recruiter', 'lead generation', 'procurement', 'bpo', 'executive'
];

function categorizeJob(title, company, department, industry) {
  const t = (title || '').toLowerCase();
  const c = (company || '').toLowerCase();
  const d = (department || '').toLowerCase();
  const ind = (industry || '').toLowerCase();
  const full = `${t} ${c} ${d} ${ind}`;

  if (CORE_ORGANIZATIONS.some(org => c.includes(org) || t.includes(org))) return 'core';
  if (CORE_KEYWORDS.some(k => full.includes(k))) return 'core';
  if (TECH_KEYWORDS.some(k => t.includes(k))) return 'tech';
  if (NON_TECH_KEYWORDS.some(k => full.includes(k))) return 'non-tech';
  if (d.includes('tech') || d.includes('it') || ind.includes('tech') || ind.includes('software')) return 'tech';
  return 'non-tech';
}

async function testFetch() {
  const { data, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, location_city, location_state, employment_type, is_remote, salary_min, salary_max, department, industry, external_url, skills_required, application_deadline, expires_at, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) {
    console.error('Fetch error:', error);
    return;
  }

  const now = new Date();
  const unexpired = (data || []).filter(j => {
    if (j.application_deadline && new Date(j.application_deadline) < now) return false;
    if (j.expires_at && new Date(j.expires_at) < now) return false;
    return true;
  });

  console.log(`Fetched: ${data.length}, Unexpired: ${unexpired.length}`);

  const counts = { tech: 0, 'non-tech': 0, core: 0 };
  unexpired.forEach(j => {
    const cat = categorizeJob(j.title, j.company_name, j.department, j.industry);
    counts[cat]++;
  });

  console.log('Category Counts:', counts);
  console.log('Sample tech job:', unexpired.find(j => categorizeJob(j.title, j.company_name, j.department, j.industry) === 'tech')?.title);
}

testFetch();
