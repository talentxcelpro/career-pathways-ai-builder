const path = require('path');
const { getDatabase } = require(path.join(__dirname, '../db/schema.cjs'));
const db = getDatabase();

const categories = db.prepare(`SELECT category, count(*) as count FROM domains GROUP BY category ORDER BY count DESC`).all();
console.log('Categories in domains:');
console.log(categories);

const startupSpecific = db.prepare(`
  SELECT id, domain, root_domain, name, category, geo_market, authority_tier, pipeline_stage, qualification_status, placement_page_url 
  FROM domains 
  WHERE (category LIKE '%DIRECTORY%' OR category LIKE '%STARTUP%' OR category LIKE '%TECH%' OR category LIKE '%MEDIA%' OR category LIKE '%B2B%')
    AND (geo_market LIKE '%India%' OR domain LIKE '%.in' OR name LIKE '%India%')
  LIMIT 50
`).all();

console.log('Startup specific Indian domains count:', startupSpecific.length);
console.log(startupSpecific.map(r => ({
  id: r.id, domain: r.domain, name: r.name, category: r.category, stage: r.pipeline_stage, url: r.placement_page_url
})));
