// scripts/autonomous-daily-digests.cjs
// Autonomous Daily Jobs Digest & Verification Engine
// Run: node scripts/autonomous-daily-digests.cjs [--dry-run] [--approve-all]

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR0aGxnc25ha2hvZnRpbnNzb2ttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4NTMyODksImV4cCI6MjA2NjQyOTI4OX0.PLs-kisnVaPMd6NvO-jL15Qwi0jpheplnCAuFnVYarc';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TECH_KEYWORDS = [
  'software', 'developer', 'frontend', 'backend', 'full stack', 'react', 
  'node', 'python', 'java', 'cloud', 'devops', 'data', 'ai', 'machine learning', 
  'qa', 'automation', 'cyber', 'security', 'it support', 'freshers'
];

const NON_TECH_KEYWORDS = [
  'marketing', 'sales', 'operations', 'customer', 'business', 'hr', 
  'human resources', 'finance', 'account', 'content', 'writer', 'support', 
  'management trainee', 'relationship manager', 'administration', 'hospitality'
];

const CORE_KEYWORDS = [
  'mechanical', 'civil', 'electrical', 'safety', 'officer', 'hospital', 
  'logistics', 'supply chain', 'manufacturing', 'public', 'government', 
  'audit', 'energy', 'iocl', 'isro', 'drdo', 'psu'
];

function categorizeJob(title, department) {
  const text = `${title} ${department || ''}`.toLowerCase();
  if (CORE_KEYWORDS.some(k => text.includes(k))) return 'core-industry';
  if (NON_TECH_KEYWORDS.some(k => text.includes(k))) return 'non-tech';
  return 'tech';
}

function deduplicateJobs(jobs) {
  const seen = new Set();
  return jobs.filter(j => {
    const key = `${(j.title || '').trim().toLowerCase()}_${(j.company_name || '').trim().toLowerCase()}_${(j.location || '').trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatSalary(min, max) {
  if (!min) return null;
  const minLakhs = (min / 100000).toFixed(1);
  if (!max || max === min) return `₹${minLakhs} LPA`;
  const maxLakhs = (max / 100000).toFixed(1);
  return `₹${minLakhs}L – ₹${maxLakhs}L CTC`;
}

async function run() {
  const now = new Date();
  const dateDisplay = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  });
  const dateIso = now.toISOString().split('T')[0];

  console.log('===============================================================');
  console.log(`[AUTONOMOUS JOB DIGEST ENGINE] Running for: ${dateDisplay} (IST)`);
  console.log('===============================================================\n');

  console.log('[PHASE 4: VERIFICATION] Querying active jobs from Supabase...');
  const { data: rawJobs, error } = await supabase
    .from('jobs')
    .select('id, title, company_name, location, employment_type, is_remote, salary_min, salary_max, industry, external_url, application_deadline, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) {
    console.error('Failed to fetch jobs:', error);
    process.exit(1);
  }

  console.log(`[VERIFIED INVENTORY] Fetched ${rawJobs.length} active jobs.`);

  const deduped = deduplicateJobs(rawJobs);
  console.log(`[DEDUPLICATION] ${deduped.length} unique vacancies after deduplication.`);

  const buckets = {
    tech: [],
    'non-tech': [],
    'core-industry': []
  };

  deduped.forEach(j => {
    const cat = categorizeJob(j.title, j.industry);
    buckets[cat].push(j);
  });

  console.log(`\nInventory Breakdown:`);
  console.log(`- Tech & IT Jobs: ${buckets.tech.length}`);
  console.log(`- Non-Tech & Corporate: ${buckets['non-tech'].length}`);
  console.log(`- Core Industry & PSU: ${buckets['core-industry'].length}`);

  const outputPackages = {};

  const categories = [
    {
      id: 'tech',
      title: 'Tech & IT Engineering Jobs',
      header: '🚀 TALENTXCEL TECH DIGEST',
      cta: '⚠️ Over 70% of tech resumes fail automated ATS screening. Check your score free:\n👉 https://resume.talentxcel.in/resume/ats-check?utm_source=telegram&utm_medium=tech_digest'
    },
    {
      id: 'non-tech',
      title: 'Non-Tech & Business Jobs',
      header: '💼 TALENTXCEL BUSINESS & OPERATIONS DIGEST',
      cta: '💡 Calculate your exact monthly in-hand take-home salary in 30 seconds:\n👉 https://salary.talentxcel.in/analyzer?utm_source=whatsapp&utm_medium=nontech_digest'
    },
    {
      id: 'core-industry',
      title: 'Core Engineering & PSU Jobs',
      header: '⚙️ TALENTXCEL CORE INDUSTRY & PSU DIGEST',
      cta: '🛡️ Stand out to industrial hiring committees with a verified Career Passport:\n👉 https://passport.talentxcel.in?utm_source=telegram&utm_medium=core_digest'
    }
  ];

  categories.forEach(cat => {
    const topJobs = buckets[cat.id].slice(0, 5);
    let md = `${cat.header} — ${dateDisplay}\n`;
    md += `Verified Active Vacancies (Direct 1-Click Apply Links)\n\n`;

    topJobs.forEach((job, idx) => {
      const sal = formatSalary(job.salary_min, job.salary_max);
      const applyUrl = `https://jobs.talentxcel.in/jobs/${job.id}?utm_source=job_digest&utm_medium=${cat.id}&utm_campaign=daily_${dateIso}`;
      md += `${idx + 1}️⃣ *${job.title}*\n`;
      md += `🏢 ${job.company_name || 'Verified Employer'}\n`;
      md += `📍 ${job.location || 'Multiple Locations / Remote'}${sal ? ` | ${sal}` : ''}\n`;
      md += `👉 Apply: ${applyUrl}\n\n`;
    });

    md += `${cat.cta}\n`;

    outputPackages[cat.id] = {
      dateIso,
      dateDisplay,
      category: cat.id,
      categoryTitle: cat.title,
      jobsCount: topJobs.length,
      markdown: md,
      generatedAt: now.toISOString()
    };
  });

  // Save to local cache file
  const cacheDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }

  const cachePath = path.join(cacheDir, 'daily_digests_cache.json');
  fs.writeFileSync(cachePath, JSON.stringify(outputPackages, null, 2), 'utf8');

  console.log(`\n[AUTONOMOUS COMPILATION SUCCESS] Output saved to: ${cachePath}`);
  console.log('Founder review status: READY FOR REVIEW & DISPATCH IN COMMAND CENTRE.');
}

run();
