const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const STAGING_REF = 'pvwwtquuexhyydwihjbi';
const PROD_REF = 'dthlgsnakhoftinssokm';

function setLinkedTarget(target = 'production') {
  const ref = target === 'staging' ? STAGING_REF : PROD_REF;
  const name = target === 'staging' ? 'TalentXcel Staging' : 'Talentxcel.in';
  const poolerUrl = target === 'staging'
    ? `postgresql://postgres.${STAGING_REF}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`
    : `postgresql://postgres.${PROD_REF}@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`;

  const projectRefPath = path.join(__dirname, '..', 'supabase', '.temp', 'project-ref');
  const linkedPath = path.join(__dirname, '..', 'supabase', '.temp', 'linked-project.json');
  const poolerPath = path.join(__dirname, '..', 'supabase', '.temp', 'pooler-url');

  fs.writeFileSync(projectRefPath, ref, 'utf8');
  fs.writeFileSync(linkedPath, JSON.stringify({
    ref,
    name,
    organization_id: 'xaauthlhhymlvvxrkuzu',
    organization_slug: 'xaauthlhhymlvvxrkuzu'
  }), 'utf8');
  fs.writeFileSync(poolerPath, poolerUrl, 'utf8');
}

function runSql(sql, target = 'production') {
  setLinkedTarget(target);
  const tmpFile = path.join(__dirname, `.tmp_${Date.now()}_${Math.floor(Math.random() * 10000)}.sql`);
  fs.writeFileSync(tmpFile, sql, 'utf8');
  try {
    const output = execSync(`npx supabase db query --linked -f "${tmpFile}"`, {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe'],
      maxBuffer: 50 * 1024 * 1024
    });
    const startIdx = output.indexOf('{');
    const endIdx = output.lastIndexOf('}');
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonStr = output.slice(startIdx, endIdx + 1);
      const parsed = JSON.parse(jsonStr);
      return parsed.rows || [];
    }
    return { raw: output };
  } catch (err) {
    return { error: err.message, stderr: err.stderr ? err.stderr.toString() : null, stdout: err.stdout ? err.stdout.toString() : null };
  } finally {
    if (fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch (e) {}
    }
  }
}

module.exports = { runSql, setLinkedTarget, STAGING_REF, PROD_REF };

if (require.main === module) {
  const target = process.argv[2] || 'production';
  const query = process.argv[3] || 'SELECT current_database(), version();';
  console.log(`Running on target: ${target}`);
  const res = runSql(query, target);
  console.log(JSON.stringify(res, null, 2));
}
