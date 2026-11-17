const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  console.log('Renaming legacy public_profiles table to public_profiles_legacy_qr...');
  const res = await runSql(`
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname = 'public' 
          AND c.relname = 'public_profiles' 
          AND c.relkind = 'r'
      ) THEN
        ALTER TABLE public.public_profiles RENAME TO public_profiles_legacy_qr;
        RAISE NOTICE 'Renamed public.public_profiles table to public_profiles_legacy_qr';
      END IF;
    END $$;
  `, 'production');
  console.log('Result:', res);

  // Verify
  const check = await runSql(`
    SELECT c.relname, c.relkind
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname IN ('public_profiles', 'public_profiles_legacy_qr');
  `, 'production');
  console.log('Renamed verification:', check);
}

main().catch(console.error);
