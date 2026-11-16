const { runSql } = require('./db-audit-helper.cjs');
const res = runSql("SELECT title, job_title, experience_level, min_experience, max_experience FROM jobs WHERE id = '7ccd3b92-b063-49ff-9de6-17bf915862fd';");
console.log(JSON.stringify(res, null, 2));
