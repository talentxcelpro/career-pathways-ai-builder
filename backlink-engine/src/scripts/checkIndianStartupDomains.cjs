const path = require('path');
const { getDatabase } = require(path.join(__dirname, '../db/schema.cjs'));
const db = getDatabase();

const rows = db.prepare(`
  SELECT id, domain, root_domain, name, category, geo_market, authority_tier, pipeline_stage, qualification_status, placement_page_url 
  FROM domains 
  WHERE geo_market LIKE '%India%' OR domain LIKE '%.in' OR name LIKE '%India%' OR category LIKE '%Startup%'
`).all();

console.log('Total matching Indian / Startup domains in DB:', rows.length);
console.log('Sample matching domains:');
console.log(rows.slice(0, 20).map(r => ({
  id: r.id,
  domain: r.domain,
  name: r.name,
  category: r.category,
  stage: r.pipeline_stage,
  status: r.qualification_status,
  url: r.placement_page_url
})));
