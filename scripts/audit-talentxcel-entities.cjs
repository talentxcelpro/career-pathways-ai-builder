const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envContent = fs.readFileSync('.env.local', 'utf8');
let key = '';
envContent.split('\n').forEach(l => {
  if (l.startsWith('TALENTXCEL_SERVICE_ROLE_KEY=')) {
    key = l.substring('TALENTXCEL_SERVICE_ROLE_KEY='.length).trim().replace(/^['"]|['"]$/g, '');
  }
});

const supabase = createClient('https://dthlgsnakhoftinssokm.supabase.co', key);

async function checkTables() {
  const tables = [
    'profiles',
    'career_players',
    'skills',
    'user_skills',
    'candidate_skills',
    'assessments',
    'user_assessments',
    'assessment_results',
    'courses',
    'user_courses',
    'course_enrollments',
    'resumes',
    'jobs',
    'job_applications',
    'career_goals',
    'career_passport_skills',
    'career_quests',
    'career_tree_skills',
    'career_boss_battles'
  ];

  console.log('=== TALENTXCEL DATABASE ENTITY AUDIT ===');
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`❌ ${t}: NOT FOUND (${error.message})`);
    } else if (!data || data.length === 0) {
      console.log(`⚪ ${t}: FOUND (0 records)`);
    } else {
      console.log(`✅ ${t}: FOUND (${Object.keys(data[0]).length} columns):`, Object.keys(data[0]).slice(0, 8).join(', '));
    }
  }
}

checkTables().catch(console.error);
