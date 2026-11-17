const { runSql } = require('./db-audit-helper.cjs');

const sql = `
  SELECT id, name, public, file_size_limit, allowed_mime_types
  FROM storage.buckets;
`;

const res = runSql(sql, 'staging');
console.log('Storage buckets on staging:', JSON.stringify(res, null, 2));
