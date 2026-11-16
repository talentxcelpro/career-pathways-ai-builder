const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const rows = await runSql(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_schema = 'storage' AND table_name = 'objects';
  `, 'staging');
  console.log('storage.objects schema:');
  console.log(rows);

  const sample = await runSql(`
    SELECT id, bucket_id, name, owner, owner_id
    FROM storage.objects
    WHERE bucket_id = 'documents' AND name LIKE '%audit_resume_doc1.pdf%';
  `, 'staging');
  console.log('sample row in storage.objects:');
  console.log(sample);
}

main().catch(console.error);
