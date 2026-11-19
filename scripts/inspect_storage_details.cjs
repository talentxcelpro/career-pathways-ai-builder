const { runSql } = require('./db-audit-helper.cjs');

async function inspectStorage() {
  const policies = await runSql(`
    SELECT policyname, cmd, roles, qual, with_check
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND qual LIKE '%documents%';
  `, 'staging');
  console.log('Documents storage policies:');
  console.log(JSON.stringify(policies, null, 2));

  // Also check existing objects in storage.objects
  const sampleObjects = await runSql(`
    SELECT id, bucket_id, name, owner, created_at
    FROM storage.objects
    WHERE bucket_id = 'documents'
    LIMIT 10;
  `, 'staging');
  console.log('Sample documents objects:');
  console.log(JSON.stringify(sampleObjects, null, 2));
}

inspectStorage().catch(e => console.error(e));
