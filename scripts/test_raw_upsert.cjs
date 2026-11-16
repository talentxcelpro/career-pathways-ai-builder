const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const res = await runSql(`
    SET ROLE authenticated;
    SET request.jwt.claim.sub = '0b28a473-bcbb-4c49-b291-f9ea0daf4add';
    SET request.jwt.claim.role = 'authenticated';

    INSERT INTO public.profiles (id, full_name, headline)
    VALUES ('0b28a473-bcbb-4c49-b291-f9ea0daf4add', 'Audit Candidate One Upserted', 'Architect')
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      headline = EXCLUDED.headline;
  `, 'staging');
  console.log('Raw SQL upsert as authenticated:', res);
}

main().catch(console.error);
