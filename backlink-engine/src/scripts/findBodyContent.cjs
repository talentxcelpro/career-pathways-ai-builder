const fs = require('fs');

const html = fs.readFileSync('backlink-engine/src/scripts/ghulamali.html', 'utf8');

const occurrences = [];
let pos = 0;
while ((pos = html.indexOf('Priority Launch', pos)) !== -1) {
  occurrences.push(pos);
  pos += 15;
}

console.log('Occurrences of "Priority Launch":', occurrences.length);
occurrences.forEach((p, idx) => {
  console.log(`\nOccurrence ${idx} at pos ${p}:`);
  console.log(html.slice(p, p + 1500));
});
