const fs = require('fs');
const path = require('path');

const dumpPath = path.join(__dirname, '..', 'gsc-full-dump.json');
const dump = JSON.parse(fs.readFileSync(dumpPath, 'utf8'));
const rows = dump.rows || [];

let sql = `-- =========================================================================
-- Seed Real GSC Dump (1,000 Queries) for talentxcel.in
-- Generated from gsc-full-dump.json
-- =========================================================================

-- 1. Read access for dashboard telemetry
DROP POLICY IF EXISTS "anon_read_udx_tenants" ON udx_tenants;
CREATE POLICY "anon_read_udx_tenants" ON udx_tenants FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_read_udx_demand_entities" ON udx_demand_entities;
CREATE POLICY "anon_read_udx_demand_entities" ON udx_demand_entities FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_read_udx_opportunities" ON udx_opportunities;
CREATE POLICY "anon_read_udx_opportunities" ON udx_opportunities FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_read_udx_search_memory" ON udx_search_memory;
CREATE POLICY "anon_read_udx_search_memory" ON udx_search_memory FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_read_udx_audit_log" ON udx_audit_log;
CREATE POLICY "anon_read_udx_audit_log" ON udx_audit_log FOR SELECT TO anon USING (true);

-- 2. Ensure tenant exists
INSERT INTO udx_tenants (tenant_id, domain, gsc_property_id, status)
VALUES ('talentxcel', 'talentxcel.in', 'sc-domain:talentxcel.in', 'ACTIVE')
ON CONFLICT (tenant_id) DO UPDATE SET status = 'ACTIVE';

`;

// Deduplicate by normalized query
const seen = new Set();
const cleanRows = [];

for (const r of rows) {
  const rawQuery = (r.keys && r.keys[0]) || '';
  const query = rawQuery.replace(/'/g, "''").trim();
  const norm = rawQuery.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!norm || seen.has(norm)) continue;
  seen.add(norm);
  cleanRows.push({
    query,
    norm,
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: Number((r.ctr || 0).toFixed(4)),
    position: Number((r.position || 0).toFixed(2))
  });
}

console.log('Unique queries ready:', cleanRows.length);

// Batch inserts
const BATCH_SIZE = 100;
for (let i = 0; i < cleanRows.length; i += BATCH_SIZE) {
  const batch = cleanRows.slice(i, i + BATCH_SIZE);
  sql += `INSERT INTO udx_demand_entities (tenant_id, query, normalized_query, country, impressions, clicks, ctr, avg_position, data_source)\nVALUES\n`;
  sql += batch.map(b => 
    `  ('talentxcel', '${b.query}', '${b.norm}', 'in', ${b.impressions}, ${b.clicks}, ${b.ctr}, ${b.position}, 'gsc_api')`
  ).join(',\n') + '\n';
  sql += `ON CONFLICT (tenant_id, normalized_query, country) DO UPDATE SET\n`;
  sql += `  impressions = EXCLUDED.impressions,\n  clicks = EXCLUDED.clicks,\n  ctr = EXCLUDED.ctr,\n  avg_position = EXCLUDED.avg_position,\n  last_updated_at = NOW();\n\n`;
}

sql += `-- 3. Score and rank opportunities
SELECT calculate_udx_opportunities('talentxcel');

-- 4. Initial Audit record
INSERT INTO udx_audit_log (tenant_id, log_type, actor, action_taken, policy_class, outcome, metadata)
VALUES ('talentxcel', 'EXECUTION', 'GSC_IMPORT_SEED', 'ingest_1000_real_gsc_queries', 'AUTO', 'AUTO_EXECUTED', jsonb_build_object('total_queries', ${cleanRows.length}, 'source', 'gsc-full-dump.json'));
`;

const outputPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260910200000_seed_real_gsc_dump.sql');
fs.writeFileSync(outputPath, sql, 'utf8');
console.log('Successfully wrote:', outputPath);
console.log('File size:', (sql.length / 1024).toFixed(1), 'KB');
