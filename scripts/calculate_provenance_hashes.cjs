const crypto = require('crypto');
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

const files = [
  'supabase/migrations/20261114170000_txc_affirmative_consent_and_public_profiles_view.sql',
  'supabase/migrations/20261114170000_txc_affirmative_consent_and_public_profiles_view_rollback.sql',
  'supabase/migrations/20261114190000_txc_migration_b_secure_profiles_access_model.sql',
  'supabase/migrations/20261114190000_txc_migration_b_secure_profiles_access_model_rollback.sql',
  'src/components/profile/ProfileVisibilitySettings.tsx',
  'src/pages/profile/ProfileEdit.tsx',
  'src/hooks/useProfileUpdate.ts',
  'api/seo-render.ts'
];

function sha256(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

console.log('=== GIT PROVENANCE & ARTIFACT SHA-256 HASHES ===\n');

try {
  const headRev = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
  console.log('Git HEAD Commit:', headRev);
  
  const branch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  console.log('Git Current Branch:', branch);

  const headStat = execSync('git show --stat --oneline HEAD', { encoding: 'utf8' }).trim();
  console.log('\nGit Show HEAD:\n' + headStat);

  const gitStatus = execSync('git status --short', { encoding: 'utf8' }).trim();
  console.log('\nGit Status (--short):\n' + (gitStatus || '(clean)'));

  console.log('\n--- ARTIFACT HASH MATRIX ---');
  for (const f of files) {
    const fullPath = path.join(process.cwd(), f);
    let workingHash = 'FILE_NOT_FOUND';
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath);
      workingHash = sha256(content);
    }

    let headHash = 'NOT_COMMITTED_IN_HEAD';
    try {
      const headContent = execSync(`git show HEAD:${f}`, { encoding: 'buffer', stdio: ['pipe', 'pipe', 'ignore'] });
      headHash = sha256(headContent);
    } catch (e) {
      headHash = 'NOT_IN_HEAD (Untracked or new)';
    }

    console.log(`\nFile: ${f}`);
    console.log(`  Working-tree SHA-256: ${workingHash}`);
    console.log(`  Git HEAD SHA-256:     ${headHash}`);
    console.log(`  Status:               ${workingHash === headHash ? 'MATCH (Committed in HEAD)' : 'DIFFER (Uncommitted/Modified in Working Tree)'}`);
  }
} catch (err) {
  console.error('Error getting provenance:', err);
}
