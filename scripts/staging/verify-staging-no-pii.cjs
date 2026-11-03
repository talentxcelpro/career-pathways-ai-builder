const { execSync } = require('child_process');
const fs = require('fs');

function runQuery(sql) {
  const tmpFile = 'scripts/staging/.tmp-pii-query.sql';
  fs.writeFileSync(tmpFile, sql);
  const output = execSync(`npx supabase db query --linked -f ${tmpFile}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
  fs.unlinkSync(tmpFile);
  const startIdx = output.indexOf('{');
  const endIdx = output.lastIndexOf('}');
  if (startIdx !== -1 && endIdx !== -1) {
    const jsonStr = output.slice(startIdx, endIdx + 1);
    return JSON.parse(jsonStr).rows || [];
  }
  return output;
}

console.log('--- USER COUNTS & EMAILS IN STAGING ---');
const users = runQuery(`
  SELECT id, email, created_at, role 
  FROM auth.users;
`);
console.log('Auth users count:', users.length);
console.log('Auth users sample:', users);

console.log('--- PROFILES IN STAGING ---');
const profiles = runQuery(`
  SELECT id, full_name, email, role 
  FROM public.profiles;
`);
console.log('Profiles count:', profiles.length);
console.log('Profiles sample:', profiles);

console.log('--- USER ROLES IN STAGING ---');
const roles = runQuery(`
  SELECT user_id, role 
  FROM public.user_roles;
`);
console.log('User roles count:', roles.length);
console.log('User roles:', roles);
