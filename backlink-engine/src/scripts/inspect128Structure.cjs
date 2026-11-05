const fs = require('fs');

const html = fs.readFileSync('backlink-engine/src/scripts/ghulamali.html', 'utf8');

// The arrays in ghulamali.html are:
// picksData_picksGrid_e6048af (10 items)
// tierData_tierGrid1_148566f (31 items, rank 1 to 31)
// tierData_tierGrid2_8aa22e2 (39 items, rank 32 to 70)
// tierData_tierGrid3_b1cc76a (33 items, rank 71 to 103)
// tierData_tierGrid4_71eb508 (25 items, rank 104 to 128)

// Notice: 31 + 39 + 33 + 25 = 128 items!
// The "Top 10 Picks" are a duplicate subset of the 128 ranked entries!

const tierVars = [
  { name: 'Tier 1 (DR 90+)', varName: 'tierData_tierGrid1_148566f' },
  { name: 'Tier 2 (DR 70-89)', varName: 'tierData_tierGrid2_8aa22e2' },
  { name: 'Tier 3 (DR 50-69)', varName: 'tierData_tierGrid3_b1cc76a' },
  { name: 'Tier 4 (DR <50)', varName: 'tierData_tierGrid4_71eb508' }
];

const rankedEntries = [];

tierVars.forEach(tv => {
  const startStr = `var ${tv.varName} = [`;
  const startIdx = html.indexOf(startStr);
  if (startIdx !== -1) {
    const endIdx = html.indexOf('];', startIdx);
    if (endIdx !== -1) {
      const code = html.slice(startIdx + `var ${tv.varName} = `.length, endIdx + 1);
      const parsed = (new Function(`return ${code};`))();
      console.log(`${tv.name} (${tv.varName}): ${parsed.length} entries`);
      parsed.forEach(item => {
        rankedEntries.push({
          tierName: tv.name,
          ...item
        });
      });
    }
  }
});

console.log(`Total ranked entries from Tiers 1-4: ${rankedEntries.length}`);

// Check picksData
const picksStr = 'var picksData_picksGrid_e6048af = [';
const picksStart = html.indexOf(picksStr);
if (picksStart !== -1) {
  const picksEnd = html.indexOf('];', picksStart);
  const code = html.slice(picksStart + 'var picksData_picksGrid_e6048af = '.length, picksEnd + 1);
  const picks = (new Function(`return ${code};`))();
  console.log(`Top Picks: ${picks.length} entries`);
  picks.forEach(p => {
    console.log(`  Top Pick #${p.rank}: ${p.name} (${p.url}) - meta: ${p.meta}`);
  });
}
