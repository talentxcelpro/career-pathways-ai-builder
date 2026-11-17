const { runSql } = require('./db-audit-helper.cjs');

const query = `
  SELECT bucket_id, name, owner, created_at 
  FROM storage.objects 
  LIMIT 10;
`;

const res = runSql(query, 'production');
console.log('Real objects in storage on production:');
console.log(JSON.stringify(res, null, 2));
