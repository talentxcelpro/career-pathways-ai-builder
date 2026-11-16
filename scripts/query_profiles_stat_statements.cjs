const { runSql } = require('./db-audit-helper.cjs');

const query = `
  SELECT 
    query,
    calls,
    total_exec_time,
    mean_exec_time,
    rows
  FROM pg_stat_statements
  WHERE query ILIKE '%profiles%'
  ORDER BY calls DESC
  LIMIT 25;
`;

const res = runSql(query, 'production');
console.log('pg_stat_statements on profiles in production:');
console.log(JSON.stringify(res, null, 2));
