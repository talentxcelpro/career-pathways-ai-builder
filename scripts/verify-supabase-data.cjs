const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPaths = ['.env.local', '.env'];
  for (const envFile of envPaths) {
    const fullPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf-8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...rest] = trimmed.split('=');
          if (key && rest.length > 0 && !process.env[key.trim()]) {
            process.env[key.trim()] = rest.join('=').replace(/^["'](.*)["']$/, '$1').trim();
          }
        }
      });
    }
  }
}
loadEnv();

const url = process.env.TX_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://dthlgsnakhoftinssokm.supabase.co';
const key = process.env.TALENTXCEL_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function check() {
  console.log('Target URL:', url);
  console.log('Key available:', !!key, 'Length:', key.length);

  const tables = [
    'analytics_events', 
    'user_behavior_events', 
    'user_behavior_analytics',
    'resumes', 
    'ai_resumes',
    'profiles', 
    'career_passport', 
    'jobs', 
    'job_applications',
    'candidate_shortlists',
    'recruiter_jobs',
    'recruiter_profiles',
    'unified_candidates'
  ];

  for (const t of tables) {
    try {
      const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
      if (error) {
        console.log(`❌ ${t}: ${error.message} (Code: ${error.code})`);
      } else {
        console.log(`✅ ${t}: ONLINE (Count: ${count})`);
      }
    } catch (e) {
      console.log(`⚠️ ${t}: ${e.message}`);
    }
  }
}

check().catch(console.error);
