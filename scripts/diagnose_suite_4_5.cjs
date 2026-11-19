const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const userA_id = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
  const userB_id = '3cf3251e-6132-4752-959c-70dfb6c071d7';
  const SYNTH_JOB_ID = 'j1111111-1111-1111-1111-111111111111';
  const SYNTH_APP_ID = 'a1111111-1111-1111-1111-111111111111';

  console.log('--- Checking User A and User B IDs ---');
  console.log('User A:', userA_id, 'User B:', userB_id);

  console.log('--- Testing Job Insert ---');
  const resJob = await runSql(`
    INSERT INTO public.jobs (id, title, description, posted_by)
    VALUES ('a0000000-0000-0000-0000-000000000001', 'Test Job', 'Test Desc', '${userA_id}')
    ON CONFLICT (id) DO UPDATE SET posted_by = '${userA_id}'
    RETURNING id, posted_by;
  `, 'staging');
  console.log('Job insert result:', JSON.stringify(resJob, null, 2));

  console.log('--- Testing Post Insert ---');
  const resPost = await runSql(`
    INSERT INTO public.posts (id, author_id, content, is_public, visibility, status, is_deleted)
    VALUES ('b0000000-0000-0000-0000-000000000001', '${userB_id}', 'Test Post', true, 'public', 'published', false)
    ON CONFLICT (id) DO UPDATE SET is_public = true
    RETURNING id, author_id;
  `, 'staging');
  console.log('Post insert result:', JSON.stringify(resPost, null, 2));
}

main().catch(console.error);
