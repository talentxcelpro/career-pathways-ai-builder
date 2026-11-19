const { runSql } = require('./db-audit-helper.cjs');

async function main() {
  const res = await runSql(`
    SELECT 
      storage.foldername('0b28a473-bcbb-4c49-b291-f9ea0daf4add/audit_resume_doc1.pdf') AS foldername_arr,
      (storage.foldername('0b28a473-bcbb-4c49-b291-f9ea0daf4add/audit_resume_doc1.pdf'))[1] AS first_element;
  `, 'staging');
  console.log(res);
}

main().catch(console.error);
