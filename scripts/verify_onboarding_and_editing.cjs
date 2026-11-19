const { createClient } = require('@supabase/supabase-js');
const { runSql, STAGING_REF } = require('./db-audit-helper.cjs');

const SUPABASE_URL = `https://${STAGING_REF}.supabase.co`;
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2d3d0cXV1ZXhoeXlkd2loamJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTM1OTI1NzYsImV4cCI6MjEwOTE2ODU3Nn0.ZBevJqFcBzb2UAwwr_o5zgUcrrI5uf1rFgsn-cMFXnQ";

async function verifyOnboardingAndEditing() {
  const anonClient = createClient(SUPABASE_URL, ANON_KEY, { auth: { persistSession: false } });
  
  // Login Candidate A
  const { data: authA, error: errAuth } = await anonClient.auth.signInWithPassword({
    email: 'audit_cand1@talentxcel-audit.local',
    password: 'AuditPassword123!Secure'
  });
  if (errAuth) throw errAuth;
  const clientA = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${authA.session.access_token}` } },
    auth: { persistSession: false }
  });
  const uid = authA.user.id;

  console.log('--- 1. TESTING LEGITIMATE PROFILE EDIT (UPDATE) ---');
  const { data: updateData, error: errUpdate } = await clientA
    .from('profiles')
    .update({
      headline: 'Executive Lead Security Architect',
      location: 'Dubai Internet City, UAE',
      about: 'Verified security architect with deep expertise in multi-cloud infrastructure and zero-trust engineering.'
    })
    .eq('id', uid)
    .select('id, headline, location, about')
    .single();

  console.log('Profile Edit Result:', { updateData, errUpdate });

  console.log('\n--- 2. TESTING DIRECT ONBOARDING UPSERT ---');
  const { data: upsertData, error: errUpsert } = await clientA
    .from('profiles')
    .upsert({
      id: uid,
      full_name: 'Audit Candidate One (Onboarded)',
      headline: 'Principal Infrastructure Security Engineer',
      location: 'Abu Dhabi, UAE',
      skills: ['PostgreSQL', 'Cloud Security', 'Zero Trust', 'Kubernetes']
    })
    .select('id, full_name, headline, location, skills')
    .single();

  console.log('Onboarding Upsert Result:', { upsertData, errUpsert });
}

verifyOnboardingAndEditing().catch(console.error);
