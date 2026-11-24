const fs = require('fs');
const path = require('path');

const distAssets = path.join('C:', 'Users', 'Arshid.Wani', 'talentxcel-main', 'dist', 'assets');
const files = fs.readdirSync(distAssets).filter(f => f.endsWith('.js'));

for (const f of files) {
  const content = fs.readFileSync(path.join(distAssets, f), 'utf8');
  if (content.includes('/r/:code')) {
    console.log('Found /r/:code in:', f);
  }
  if (content.includes('/verify/:username')) {
    console.log('Found /verify/:username in:', f);
  }
  if (content.includes('G-CMYNTTNT56')) {
    console.log('Found G-CMYNTTNT56 in:', f);
  }
}
