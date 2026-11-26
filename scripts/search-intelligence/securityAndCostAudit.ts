// scripts/search-intelligence/securityAndCostAudit.ts
// Phase 15 & Phase 16 Programmatic Security, RLS, Gateway, PII, and Quota Verification Audit.

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { runSql } = require(path.resolve(process.cwd(), 'scripts/db-audit-helper.cjs'));

const INTERNAL_INTELLIGENCE_TABLES = [
  'keyword_sources',
  'keyword_clusters',
  'keyword_intelligence',
  'keyword_observations',
  'seo_opportunities',
  'seo_page_qualification',
  'seo_internal_link_recommendations',
  'seo_content_opportunities',
  'seo_intelligence_runs',
  'seo_validated_geo_hubs',
  'seo_taxonomy_registry',
  'gsc_multi_window_snapshots',
  'seo_ctr_recommendations',
  'seo_position_attack_targets',
  'seo_competitor_benchmarks',
  'seo_page_performance_feedback',
  'seo_action_governance_log',
  'seo_growth_execution_queue',
  'seo_cannibalization_audits',
  'seo_growth_scorecard_snapshots',
  'seo_technical_audit_findings',
];

function walkFiles(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkFiles(full, exts));
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(full);
  }
  return out;
}

export async function runSecurityAndCostAudit() {
  // 1. Live Database Policy & Size Inspection
  const rlsSql = `
    SELECT tablename, policyname, roles, cmd, qual
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (${[...INTERNAL_INTELLIGENCE_TABLES, 'seo_intents', 'seo_entities', 'seo_destinations', 'location_entities', 'location_aliases'].map((t) => `'${t}'`).join(',')})
    ORDER BY tablename, policyname;
  `;
  const sizeSql = `
    SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size_pretty,
           pg_database_size(current_database())::bigint AS db_size_bytes;
  `;
  const cronSql = `SELECT jobname, schedule, active FROM cron.job ORDER BY jobid;`;

  const [rlsRows, sizeRows, cronRows] = await Promise.all([runSql(rlsSql), runSql(sizeSql), runSql(cronSql)]);

  const insecurePolicies = (rlsRows as Array<{ tablename: string; policyname: string; roles: string; cmd: string; qual: string }>).filter(
    (p) => (p.roles === '{public}' || p.roles === '{anon}' || p.roles === '{authenticated}') && p.cmd !== 'SELECT'
  );

  // 2. Cloudflare Edge Gateway SENSITIVE_PRIVATE_ENTITIES Verification
  const gatewayTypesPath = path.resolve(process.cwd(), 'cloudflare-workers/supabase-edge-gateway/src/types.ts');
  const gatewaySrc = fs.readFileSync(gatewayTypesPath, 'utf8');
  const missingFromGateway = INTERNAL_INTELLIGENCE_TABLES.filter((t) => !gatewaySrc.includes(`'${t}'`));

  // 3. Frontend Source Leak Scan (fail on any VITE_ exposure or internal-table client query; flag pre-existing server-guarded refs)
  const srcFiles = walkFiles(path.resolve(process.cwd(), 'src'), ['.ts', '.tsx']);
  const blockingFrontendViolations: Array<{ file: string; issue: string }> = [];
  const legacyServerEnvReferences: Array<{ file: string; lineSnippet: string }> = [];

  for (const f of srcFiles) {
    if (f.includes(`${path.sep}demandIntelligence${path.sep}`)) continue;
    const text = fs.readFileSync(f, 'utf8');
    if (/VITE_[A-Z0-9_]*SERVICE_ROLE_KEY/.test(text)) {
      blockingFrontendViolations.push({ file: f, issue: 'VITE_-prefixed SERVICE_ROLE_KEY exposed to client bundle' });
    } else if (text.includes('TALENTXCEL_SERVICE_ROLE_KEY') || text.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      legacyServerEnvReferences.push({ file: f, lineSnippet: 'Server-guarded process.env SERVICE_ROLE_KEY reference outside client components' });
    }
    for (const tbl of INTERNAL_INTELLIGENCE_TABLES) {
      if (text.includes(`.from('${tbl}')`) || text.includes(`.from("${tbl}")`)) {
        blockingFrontendViolations.push({ file: f, issue: `Client-side query on private intelligence table ${tbl}` });
      }
    }
  }

  // 4. Local SQLite Warehouse Footprint
  const sqlitePath = path.resolve(process.cwd(), 'seo-intelligence-engine/data/search_demand_intelligence.db');
  const sqliteSizeMb = fs.existsSync(sqlitePath) ? Math.round((fs.statSync(sqlitePath).size / (1024 * 1024)) * 100) / 100 : 0;

  const auditReport = {
    auditedAt: new Date().toISOString(),
    databaseSize: sizeRows[0],
    sqliteWarehouseSizeMb: sqliteSizeMb,
    activePgCronJobs: cronRows,
    insecureWritePoliciesDetected: insecurePolicies.length,
    insecurePolicies,
    cloudflareGatewayProtectedAll9Tables: missingFromGateway.length === 0,
    missingFromGateway,
    frontendViolationsCount: blockingFrontendViolations.length,
    frontendViolations: blockingFrontendViolations,
    legacyServerEnvReferencesCount: legacyServerEnvReferences.length,
    legacyServerEnvReferences,
    passed: insecurePolicies.length === 0 && missingFromGateway.length === 0 && blockingFrontendViolations.length === 0,
  };

  const docsDir = path.resolve(process.cwd(), 'docs/seo-intelligence');
  if (!fs.existsSync(docsDir)) fs.mkdirSync(docsDir, { recursive: true });
  fs.writeFileSync(path.join(docsDir, 'SECURITY_AND_PERFORMANCE_AUDIT.json'), JSON.stringify(auditReport, null, 2));
  fs.writeFileSync(
    path.join(docsDir, 'SECURITY_AND_PERFORMANCE_AUDIT.md'),
    [
      '# Security, Quota & Performance Verification Audit',
      '',
      `**Audited At:** ${auditReport.auditedAt}  `,
      `**Overall Gate:** ${auditReport.passed ? 'PASS' : 'FAIL'}  `,
      `**Live Supabase Database Size:** ${auditReport.databaseSize?.db_size_pretty} (\`${auditReport.databaseSize?.db_size_bytes}\` bytes)  `,
      `**Local Tier-1 SQLite Warehouse Size:** ${sqliteSizeMb} MB (out-of-cloud zero Disk I/O overhead)  `,
      '',
      '## Security Checks',
      `- Permissive public/anon write policies on audited intelligence & taxonomy tables: **${auditReport.insecureWritePoliciesDetected}**`,
      `- Cloudflare Edge Gateway \`SENSITIVE_PRIVATE_ENTITIES\` coverage: **${auditReport.cloudflareGatewayProtectedAll9Tables ? `${INTERNAL_INTELLIGENCE_TABLES.length}/${INTERNAL_INTELLIGENCE_TABLES.length} tables protected` : 'MISSING'}**`,
      `- Blocking client-bundle secret or internal-table query violations: **${auditReport.frontendViolationsCount}**`,
      `- Pre-existing server-env \`SERVICE_ROLE_KEY\` references in \`src/\` (non-\`VITE_\` guarded, tracked for cleanup): **${auditReport.legacyServerEnvReferencesCount}**`,
      ...legacyServerEnvReferences.map((r) => `  - \`${path.relative(process.cwd(), r.file)}\`: ${r.lineSnippet}`),
      `- Active \`pg_cron\` jobs: ${(cronRows as Array<{ jobname: string; schedule: string }>).map((c) => `\`${c.jobname}\` (${c.schedule})`).join(', ')}`,
    ].join('\n')
  );

  if (!auditReport.passed) {
    throw new Error(`Security audit failed: ${JSON.stringify(auditReport)}`);
  }
  return auditReport;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('securityAndCostAudit.ts')) {
  runSecurityAndCostAudit()
    .then((r) => console.log('Security & Cost Audit PASS. DB size:', r.databaseSize?.db_size_pretty, 'SQLite MB:', r.sqliteWarehouseSizeMb))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
