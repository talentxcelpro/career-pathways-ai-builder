const fs = require('fs');
const path = require('path');

function auditRecoveryReadiness() {
  console.log('========================================================================');
  console.log('TALENTXCEL GATE 4 — PRODUCTION RECOVERY READINESS AUDIT');
  console.log('Target: backups/production_pre_migration_20261117/');
  console.log('========================================================================\n');

  const backupDir = path.resolve('backups', 'production_pre_migration_20261117');
  if (!fs.existsSync(backupDir)) {
    console.error('Backup directory missing!');
    process.exit(1);
  }

  const files = fs.readdirSync(backupDir);
  let totalBytes = 0;
  const manifest = [];

  for (const f of files) {
    const full = path.join(backupDir, f);
    const stats = fs.statSync(full);
    totalBytes += stats.size;
    let recordCount = null;
    try {
      const data = JSON.parse(fs.readFileSync(full, 'utf8'));
      if (Array.isArray(data)) recordCount = data.length;
      else if (data && typeof data === 'object') recordCount = Object.keys(data).length;
    } catch (e) {
      recordCount = 'N/A (raw/sql)';
    }

    manifest.push({
      file: f,
      size_kb: (stats.size / 1024).toFixed(2),
      records: recordCount,
      timestamp: stats.mtime.toISOString()
    });
  }

  console.log(`Total Backup Size: ${(totalBytes / (1024 * 1024)).toFixed(2)} MB`);
  console.table(manifest);
}

auditRecoveryReadiness();
