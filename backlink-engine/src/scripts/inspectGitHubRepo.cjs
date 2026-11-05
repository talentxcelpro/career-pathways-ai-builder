// backlink-engine/src/scripts/inspectGitHubRepo.cjs
const https = require('https');

https.get('https://api.github.com/repos/talentxcelpro/career-pathways-ai-builder', {
  headers: { 
    'User-Agent': 'TalentXcel-Backlink-Engine/1.0',
    'Accept': 'application/vnd.github.v3+json'
  }
}, res => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    const repo = JSON.parse(data);
    console.log('Repo details:');
    console.log('  Name:', repo.name);
    console.log('  Full name:', repo.full_name);
    console.log('  Private:', repo.private);
    console.log('  Description:', repo.description);
    console.log('  Homepage:', repo.homepage);
    console.log('  Topics:', repo.topics);
    console.log('  Stars:', repo.stargazers_count);
    console.log('  HTML URL:', repo.html_url);
    console.log('  README link would be:', `https://raw.githubusercontent.com/${repo.full_name}/${repo.default_branch}/README.md`);
  });
});
