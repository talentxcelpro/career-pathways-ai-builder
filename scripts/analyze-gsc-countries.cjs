const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'scratch', 'unified_gsc_demand_intelligence.json'), 'utf8'));

console.log('================================================================');
console.log('GSC GEOGRAPHIC INTELLIGENCE & MARKET RANKING ENGINE');
console.log('================================================================\n');

const countries = data.countries;
console.log(`Total countries with search demand: ${countries.length}`);

// Sort countries by impressions, clicks, CTR
const ranked = countries.map(c => {
  const ctr = c.impressions > 0 ? (c.clicks / c.impressions * 100).toFixed(2) : '0.00';
  return {
    code: c.country.toUpperCase(),
    clicks: c.clicks,
    impressions: c.impressions,
    ctr: `${ctr}%`,
    position: c.position.toFixed(1)
  };
}).sort((a, b) => b.impressions - a.impressions);

console.log('Top 20 Countries by Search Impressions:');
console.log(ranked.slice(0, 20));

console.log('\nTop Countries by Clicks:');
console.log(ranked.filter(c => c.clicks > 0).sort((a, b) => b.clicks - a.clicks));

// Save country intelligence
fs.writeFileSync(
  path.join(__dirname, '..', 'scratch', 'gsc_geographic_intelligence.json'),
  JSON.stringify({ totalCountries: countries.length, topByImpressions: ranked.slice(0, 30), topByClicks: ranked.filter(c => c.clicks > 0) }, null, 2),
  'utf8'
);
