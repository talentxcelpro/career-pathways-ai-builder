const fs = require('fs');

let code = fs.readFileSync('src/components/auth/SocialLogin.tsx', 'utf8');

const targetStr = `    try {
      // Don't use skipBrowserRedirect — let Supabase manage PKCE verifier storage naturally
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: \`\${window.location.origin}/auth/callback\`,
          scopes: 'openid profile email',
        },
      });`;

const replacementStr = `    const searchParams = new URLSearchParams(window.location.search);
    const returnToParam = searchParams.get('returnTo') || searchParams.get('redirect') || searchParams.get('returnUrl');
    const currentPath = \`\${window.location.pathname}\${window.location.search}\${window.location.hash}\`;
    const effectiveReturn = returnToParam || (!currentPath.startsWith('/auth') && currentPath !== '/' ? currentPath : null);

    if (effectiveReturn && isValidInternalPath(effectiveReturn)) {
      recordUserIntent(null, effectiveReturn);
    }

    try {
      const callbackUrl = effectiveReturn && isValidInternalPath(effectiveReturn)
        ? \`\${window.location.origin}/auth/callback?returnTo=\${encodeURIComponent(effectiveReturn)}\`
        : \`\${window.location.origin}/auth/callback\`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'linkedin_oidc',
        options: {
          redirectTo: callbackUrl,
          scopes: 'openid profile email',
        },
      });`;

const normalize = (s) => s.replace(/\r\n/g, '\n');

if (normalize(code).includes(normalize(targetStr))) {
  // Preserve original line endings
  const isCrlf = code.includes('\r\n');
  const normalizedCode = normalize(code);
  const updated = normalizedCode.replace(normalize(targetStr), normalize(replacementStr));
  fs.writeFileSync('src/components/auth/SocialLogin.tsx', isCrlf ? updated.replace(/\n/g, '\r\n') : updated, 'utf8');
  console.log('Successfully updated SocialLogin.tsx');
} else {
  console.error('Target not found in SocialLogin.tsx');
}
