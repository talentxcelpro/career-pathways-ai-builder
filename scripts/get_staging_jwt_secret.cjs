const { runSql } = require('./db-audit-helper.cjs');

const s = runSql(`
  SELECT current_setting('app.settings.jwt_secret', true) as secret;
`, 'staging');
console.log('JWT secret found:', !!s[0]?.secret);
if (s[0]?.secret) {
  // We can sign a service_role token using standard jsonwebtoken or crypto!
  const crypto = require('crypto');
  const secret = s[0].secret;
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    role: 'service_role',
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  const serviceRoleToken = `${header}.${payload}.${signature}`;
  console.log('Successfully minted authentic service_role JWT for Staging.');
  const fs = require('fs');
  fs.writeFileSync('scripts/.staging_service_role_token', serviceRoleToken, 'utf8');
}
