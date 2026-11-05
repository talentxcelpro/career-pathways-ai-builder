// backlink-engine/src/scripts/probeZenodoAndHuggingFace.cjs
const https = require('https');

function fetchPage(url) {
  return new Promise(resolve => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0' },
      timeout: 10000
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve({ status: res.statusCode, location: res.headers.location, data }));
    }).on('error', err => resolve({ status: 500, error: err.message }));
  });
}

async function run() {
  // Zenodo API
  const z = await fetchPage('https://zenodo.org/api/records?communities=zenodo&size=1');
  console.log('Zenodo API status:', z.status);
  
  // Hugging Face
  const hf = await fetchPage('https://huggingface.co/api/datasets');
  console.log('HuggingFace API status:', hf.status);
  
  // Internet Archive
  const ia = await fetchPage('https://archive.org/services/check_identifier.php?identifier=talentxcel-ats-dataset');
  console.log('Internet Archive check status:', ia.status, ia.data.slice(0, 100));
  
  // GitHub topics for talentxcel
  const gh = await fetchPage('https://api.github.com/repos/talentxcelpro/career-pathways-ai-builder');
  console.log('GitHub API status:', gh.status);
  console.log('GitHub repo:', gh.data.slice(0, 300));
}

run();
