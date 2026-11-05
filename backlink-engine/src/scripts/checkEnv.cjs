// backlink-engine/src/scripts/checkEnv.cjs
console.log('GitHub Token present:', !!process.env.GITHUB_TOKEN);
console.log('GH Token present:', !!process.env.GH_TOKEN);
const keys = Object.keys(process.env).filter(k => /git|token|key|secret/i.test(k));
console.log('Matching env keys:', keys);
