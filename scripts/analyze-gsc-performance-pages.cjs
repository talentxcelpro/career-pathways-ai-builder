const fs = require('fs');

const data1 = JSON.parse(fs.readFileSync('gsc_query_page_pairs.json', 'utf8'));
const data2 = JSON.parse(fs.readFileSync('gsc-full-dump.json', 'utf8'));

const allRows = [...(data1.rows || []), ...(data2.rows || [])];

const pageStats = new Map();

for (const r of allRows) {
  const page = r.keys[1];
  if (!page) continue;
  if (!pageStats.has(page)) {
    pageStats.set(page, { impressions: 0, clicks: 0, queries: [] });
  }
  const stat = pageStats.get(page);
  stat.impressions += (r.impressions || 0);
  stat.clicks += (r.clicks || 0);
  stat.queries.push(r.keys[0]);
}

const sorted = Array.from(pageStats.entries())
  .sort((a, b) => b[1].impressions - a[1].impressions);

console.log('Total unique pages with search impressions in GSC:', sorted.length);
console.log('\nTop 25 Pages by Impressions in GSC:');
sorted.slice(0, 25).forEach(([page, stat], idx) => {
  const ctr = stat.impressions > 0 ? (stat.clicks / stat.impressions * 100).toFixed(2) : '0';
  console.log(`${idx + 1}. ${page}`);
  console.log(`    Impressions: ${stat.impressions} | Clicks: ${stat.clicks} | CTR: ${ctr}%`);
  console.log(`    Sample Queries: ${stat.queries.slice(0, 3).join(', ')}`);
});
