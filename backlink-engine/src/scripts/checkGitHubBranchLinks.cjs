// backlink-engine/src/scripts/checkGitHubBranchLinks.cjs
const https = require('https');

https.get('https://api.github.com/repos/talentxcelpro/career-pathways-ai-builder/branches', {
  headers: { 
    'User-Agent': 'TalentXcel-Backlink-Engine/1.0',
    'Accept': 'application/vnd.github.v3+json'
  }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const branches = JSON.parse(data);
    console.log('Branches:', branches.map(b => b.name));
    const mainBranch = branches.find(b => b.name === 'main');
    console.log('Main branch exists:', !!mainBranch);
  });
});
