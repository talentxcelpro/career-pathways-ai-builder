const https = require('https');

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const indexJs = await get('https://talentxcel.in/assets/index-BPUzBC0R.js');
  console.log('Index size:', indexJs.length);
  
  // Find all chunk imports like import("./JobDetails-xxxx.js") or "__vitePreload"
  const chunks = [...indexJs.matchAll(/assets\/([a-zA-Z0-9_\-]+-[a-zA-Z0-9_\-]+\.js)/g)].map(m => m[1]);
  const unique = [...new Set(chunks)];
  console.log('Total referenced chunks in live bundle:', unique.length);

  const jobChunks = unique.filter(c => c.toLowerCase().includes('job') || c.toLowerCase().includes('apply'));
  console.log('Job related chunks:', jobChunks);

  for (const c of jobChunks) {
    const code = await get(`https://talentxcel.in/assets/${c}`);
    if (code.includes('setShowGuestModal') || code.includes('showGuestModal') || code.includes('public-job-apply')) {
      console.log('Found in chunk:', c);
      console.log('  Includes setShowGuestModal:', code.includes('setShowGuestModal'));
      console.log('  Includes showGuestModal:', code.includes('showGuestModal'));
      // Let's check the exact function definition around handleClick
      const idx = code.indexOf('public-job-apply');
      if (idx !== -1) {
        console.log('  Snippet around public-job-apply:');
        console.log(code.substring(Math.max(0, idx - 200), idx + 200));
      }
    }
  }
}

main().catch(console.error);
