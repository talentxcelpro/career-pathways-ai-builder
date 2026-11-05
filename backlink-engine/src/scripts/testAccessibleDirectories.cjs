const https = require('https');

const targets = [
  { name: 'Fazier', url: 'https://fazier.com/submit' },
  { name: 'AlternativeTo', url: 'https://alternativeto.net/add' },
  { name: 'Launching Next', url: 'https://www.launchingnext.com/submit/' },
  { name: 'PitchWall', url: 'https://pitchwall.co/submit' },
  { name: 'SaaSHub', url: 'https://www.saashub.com/submit' }
];

targets.forEach(t => {
  https.get(t.url, { timeout: 8000, headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
    let d = '';
    res.on('data', c => { if (d.length < 50000) d += c; });
    res.on('end', () => {
      console.log(`${t.name} (${t.url}) -> Status: ${res.statusCode}`);
      const hasForm = /<form/i.test(d);
      const action = d.match(/<form[^>]+action=["']([^"']*)["']/i);
      console.log(`  hasForm: ${hasForm}, action: ${action ? action[1] : 'N/A'}`);
    });
  }).on('error', e => console.log(`${t.name} Error:`, e.message));
});
