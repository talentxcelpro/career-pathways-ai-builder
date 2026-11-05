const fs = require('fs');

const html = fs.readFileSync('backlink-engine/src/scripts/ghulamali.html', 'utf8');

const targetVars = [
  'picksData_picksGrid_e6048af',
  'tierData_tierGrid1_148566f',
  'tierData_tierGrid2_8aa22e2',
  'tierData_tierGrid3_b1cc76a',
  'tierData_tierGrid4_71eb508'
];

const allData = [];

targetVars.forEach(v => {
  const startStr = `var ${v} = [`;
  const startIdx = html.indexOf(startStr);
  if (startIdx !== -1) {
    const endIdx = html.indexOf('];', startIdx);
    if (endIdx !== -1) {
      const code = html.slice(startIdx + `var ${v} = `.length, endIdx + 1);
      try {
        const parsed = (new Function(`return ${code};`))();
        console.log(`Variable ${v}: parsed ${parsed.length} items.`);
        parsed.forEach(item => {
          allData.push({
            tierVar: v,
            ...item
          });
        });
      } catch (e) {
        console.log(`Error parsing ${v}:`, e.message);
      }
    }
  }
});

console.log(`\nTotal items extracted: ${allData.length}`);

// Group by tier
const tiers = {
  'Top 10 Picks': allData.filter(d => d.tierVar.includes('picks')),
  'Tier 1 (DR 90+)': allData.filter(d => d.tierVar.includes('tierGrid1')),
  'Tier 2 (DR 70-89)': allData.filter(d => d.tierVar.includes('tierGrid2')),
  'Tier 3 (DR 50-69)': allData.filter(d => d.tierVar.includes('tierGrid3')),
  'Tier 4 (DR <50)': allData.filter(d => d.tierVar.includes('tierGrid4'))
};

for (const [tierName, items] of Object.entries(tiers)) {
  console.log(`\n=== ${tierName} (${items.length} items) ===`);
  items.slice(0, 8).forEach(it => {
    console.log(`  #${it.rank || 'N/A'}: ${it.name} (DR ${it.dr}) | ${it.url} | ${it.meta || ''}`);
  });
}
