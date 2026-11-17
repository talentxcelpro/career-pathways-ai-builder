const { runSql } = require('./db-audit-helper.cjs');

const candA_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
const candB_id = '45bdd0a1-37e0-4728-8dc6-67be4ebdb735';
const rec_id = 'd5336939-770b-442b-88d0-a6edd6850657';

const COMPANY_ID = '11111111-aaaa-aaaa-aaaa-111111111111';
const OTHER_COMPANY_ID = '99999999-9999-9999-9999-999999999999';
const JOB1_ID = 'f0000000-0000-0000-0000-000000000001';
const APP1_ID = 'a0000000-0000-0000-0000-000000000001';
const CAND_A_RESUME_KEY = `${candA_id}/attached_application_resume.pdf`;

console.log('--- 1. COMPANY ROW ---');
console.log(runSql(`SELECT id, name, website FROM public.companies WHERE id = '${COMPANY_ID}';`, 'staging'));

console.log('--- 2. COMPANY_PROFILES OWNERSHIP ---');
console.log(runSql(`SELECT id, company_id, owner_id FROM public.company_profiles WHERE company_id IN ('${COMPANY_ID}', '${OTHER_COMPANY_ID}');`, 'staging'));

console.log('--- 3. COMPANY_TEAM_MEMBERS MEMBERSHIP ---');
console.log(runSql(`SELECT id, company_id, user_id, role, is_active FROM public.company_team_members WHERE company_id = '${COMPANY_ID}' AND user_id = '${rec_id}';`, 'staging'));

console.log('--- 4. JOB COMPANY ASSIGNMENT ---');
console.log(runSql(`SELECT id, company_id, title, is_active, expires_at FROM public.jobs WHERE id = '${JOB1_ID}';`, 'staging'));

console.log('--- 5. APPLICATION CANDIDATE ASSIGNMENT ---');
console.log(runSql(`SELECT id, job_id, user_id, resume_url, status FROM public.job_applications WHERE id = '${APP1_ID}';`, 'staging'));

console.log('--- 6. STORAGE OBJECT KEY & OWNER ---');
console.log(runSql(`SELECT bucket_id, name, owner FROM storage.objects WHERE bucket_id = 'documents' AND name = '${CAND_A_RESUME_KEY}';`, 'staging'));
