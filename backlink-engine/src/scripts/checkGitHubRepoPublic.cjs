// backlink-engine/src/scripts/checkGitHubRepoPublic.cjs
const https = require('https');

https.get('https://github.com/talentxcelpro/career-pathways-ai-builder', {
  headers: { 'User-Agent': 'Mozilla/5.0' }
}, res => {
  console.log('GitHub repo status:', res.statusCode);
  if (res.headers.location) console.log('Location:', res.headers.location);
});
