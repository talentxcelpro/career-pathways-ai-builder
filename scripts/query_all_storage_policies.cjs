const { runSql } = require('./db-audit-helper.cjs');

const query = `
  SELECT policyname, permissive, roles, cmd, qual 
  FROM pg_policies 
  WHERE schemaname = 'storage' AND tablename = 'objects'
  ORDER BY policyname;
`;

const res = runSql(query, 'production');
console.log('All storage policies in production:');
console.log(JSON.stringify(res, null, 2));
