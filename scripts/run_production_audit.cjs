const { runSql } = require('./db-audit-helper.cjs');
const fs = require('fs');
const path = require('path');

async function runAudit() {
  console.log('Running comprehensive Supabase Production Database Audit...');

  const report = {};

  // 1. Database version and uptime
  console.log('1. Database info & uptime...');
  report.db_info = runSql(`
    SELECT 
      current_database() AS db_name,
      version() AS version,
      pg_postmaster_start_time() AS postmaster_start_time,
      now() - pg_postmaster_start_time() AS uptime;
  `);

  // 2. Database level stats & cache hit ratio
  console.log('2. Database cache hit ratio & transactions...');
  report.db_stats = runSql(`
    SELECT 
      datname,
      numbackends,
      xact_commit,
      xact_rollback,
      blks_read,
      blks_hit,
      round(100.0 * blks_hit / nullif(blks_hit + blks_read, 0), 4) AS cache_hit_ratio,
      tup_returned,
      tup_fetched,
      tup_inserted,
      tup_updated,
      tup_deleted,
      stats_reset
    FROM pg_stat_database 
    WHERE datname = current_database();
  `);

  // 3. Connection utilization
  console.log('3. Connection utilization...');
  report.connections = runSql(`
    SELECT 
      count(*) AS total_connections,
      count(*) FILTER (WHERE state = 'active') AS active,
      count(*) FILTER (WHERE state = 'idle') AS idle,
      count(*) FILTER (WHERE state = 'idle in transaction') AS idle_in_transaction,
      count(*) FILTER (WHERE wait_event_type IS NOT NULL) AS waiting,
      (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS max_connections
    FROM pg_stat_activity;
  `);

  // 4. Connection breakdown by client and user
  console.log('4. Connection breakdown by user & app...');
  report.connection_breakdown = runSql(`
    SELECT 
      usename, 
      client_addr, 
      application_name, 
      state, 
      count(*) AS connection_count
    FROM pg_stat_activity 
    GROUP BY usename, client_addr, application_name, state
    ORDER BY connection_count DESC;
  `);

  // 5. Table sizes & physical footprint
  console.log('5. Table sizes...');
  report.table_sizes = runSql(`
    SELECT 
      schemaname,
      relname AS table_name,
      pg_size_pretty(pg_total_relation_size(relid)) AS total_size,
      pg_size_pretty(pg_relation_size(relid)) AS table_size,
      pg_size_pretty(pg_indexes_size(relid)) AS indexes_size,
      pg_total_relation_size(relid) AS total_bytes,
      pg_relation_size(relid) AS table_bytes,
      pg_indexes_size(relid) AS indexes_bytes
    FROM pg_catalog.pg_statio_user_tables
    ORDER BY pg_total_relation_size(relid) DESC
    LIMIT 30;
  `);

  // 6. Disk I/O by Table (pg_statio_user_tables)
  console.log('6. Disk I/O by Table...');
  report.table_io = runSql(`
    SELECT 
      schemaname,
      relname AS table_name,
      heap_blks_read,
      heap_blks_hit,
      round(100.0 * heap_blks_hit / nullif(heap_blks_hit + heap_blks_read, 0), 2) AS heap_hit_ratio,
      idx_blks_read,
      idx_blks_hit,
      round(100.0 * idx_blks_hit / nullif(idx_blks_hit + idx_blks_read, 0), 2) AS idx_hit_ratio,
      toast_blks_read,
      toast_blks_hit,
      tidx_blks_read,
      tidx_blks_hit,
      (heap_blks_read + idx_blks_read + coalesce(toast_blks_read, 0) + coalesce(tidx_blks_read, 0)) AS total_disk_reads
    FROM pg_statio_user_tables
    ORDER BY total_disk_reads DESC
    LIMIT 30;
  `);

  // 7. Sequential Scans vs Index Scans (pg_stat_user_tables)
  console.log('7. Sequential vs Index scans...');
  report.table_scans = runSql(`
    SELECT 
      schemaname,
      relname AS table_name,
      seq_scan,
      seq_tup_read,
      idx_scan,
      idx_tup_fetch,
      round(100.0 * idx_scan / nullif(seq_scan + idx_scan, 0), 2) AS percent_of_scans_indexed,
      n_live_tup,
      n_dead_tup,
      round(100.0 * n_dead_tup / nullif(n_live_tup + n_dead_tup, 0), 2) AS dead_tup_ratio,
      last_vacuum,
      last_autovacuum,
      last_analyze,
      last_autoanalyze,
      vacuum_count,
      autovacuum_count
    FROM pg_stat_user_tables
    ORDER BY seq_tup_read DESC
    LIMIT 30;
  `);

  // 8. Top 20 Most Expensive Queries by Total Execution Time
  console.log('8. Top 20 expensive queries by total time...');
  report.top20_total_time = runSql(`
    SELECT 
      queryid,
      calls,
      round(total_exec_time::numeric, 2) AS total_time_ms,
      round(mean_exec_time::numeric, 2) AS mean_time_ms,
      round(min_exec_time::numeric, 2) AS min_time_ms,
      round(max_exec_time::numeric, 2) AS max_time_ms,
      round(stddev_exec_time::numeric, 2) AS stddev_time_ms,
      rows,
      shared_blks_hit,
      shared_blks_read,
      shared_blks_dirtied,
      shared_blks_written,
      round(100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0), 2) AS cache_hit_pct,
      left(query, 300) AS query_preview,
      query AS full_query
    FROM pg_stat_statements
    ORDER BY total_exec_time DESC
    LIMIT 20;
  `);

  // 9. Top 20 Queries Generating Disk Reads (I/O Read Intensity)
  console.log('9. Top 20 queries by disk reads...');
  report.top20_disk_reads = runSql(`
    SELECT 
      queryid,
      calls,
      shared_blks_read,
      shared_blks_hit,
      round(100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0), 2) AS cache_hit_pct,
      temp_blks_read,
      temp_blks_written,
      round(mean_exec_time::numeric, 2) AS mean_time_ms,
      round(total_exec_time::numeric, 2) AS total_time_ms,
      left(query, 300) AS query_preview,
      query AS full_query
    FROM pg_stat_statements
    ORDER BY shared_blks_read DESC
    LIMIT 20;
  `);

  // 10. Top 20 Queries Generating Disk Writes / Dirtied Blocks (Write Amplification)
  console.log('10. Top 20 queries by disk writes / dirtied...');
  report.top20_disk_writes = runSql(`
    SELECT 
      queryid,
      calls,
      shared_blks_dirtied,
      shared_blks_written,
      temp_blks_written,
      round(mean_exec_time::numeric, 2) AS mean_time_ms,
      round(total_exec_time::numeric, 2) AS total_time_ms,
      left(query, 300) AS query_preview,
      query AS full_query
    FROM pg_stat_statements
    ORDER BY (shared_blks_dirtied + shared_blks_written + temp_blks_written) DESC
    LIMIT 20;
  `);

  // 11. Top 20 Most Frequent Queries (High Call Volume)
  console.log('11. Top 20 high-frequency queries...');
  report.top20_frequency = runSql(`
    SELECT 
      queryid,
      calls,
      round(mean_exec_time::numeric, 2) AS mean_time_ms,
      round(total_exec_time::numeric, 2) AS total_time_ms,
      shared_blks_hit,
      shared_blks_read,
      shared_blks_dirtied,
      left(query, 300) AS query_preview,
      query AS full_query
    FROM pg_stat_statements
    ORDER BY calls DESC
    LIMIT 20;
  `);

  // 12. Unused Indexes (storage waste & write amplification)
  console.log('12. Unused indexes...');
  report.unused_indexes = runSql(`
    SELECT 
      schemaname,
      relname AS table_name,
      indexrelname AS index_name,
      idx_scan,
      idx_tup_read,
      idx_tup_fetch,
      pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
      pg_relation_size(indexrelid) AS index_bytes
    FROM pg_stat_user_indexes
    JOIN pg_index USING (indexrelid)
    WHERE indisunique IS FALSE
      AND idx_scan = 0
    ORDER BY pg_relation_size(indexrelid) DESC;
  `);

  // 13. Missing indexes on Foreign Keys
  console.log('13. Unindexed foreign keys...');
  report.unindexed_fks = runSql(`
    WITH fk_actions AS (
      SELECT 
        conrelid::regclass AS fk_table,
        conname AS fk_constraint_name,
        pg_get_constraintdef(c.oid) AS fk_definition,
        conkey AS fk_columns
      FROM pg_constraint c
      WHERE contype = 'f'
        AND connamespace = 'public'::regnamespace
    ),
    fk_indexes AS (
      SELECT 
        indrelid::regclass AS ind_table,
        indkey AS ind_columns
      FROM pg_index
    )
    SELECT 
      fka.fk_table::text AS table_name,
      fka.fk_constraint_name,
      fka.fk_definition
    FROM fk_actions fka
    WHERE NOT EXISTS (
      SELECT 1 FROM fk_indexes fki
      WHERE fki.ind_table = fka.fk_table
        AND fki.ind_columns[0:array_length(fka.fk_columns, 1) - 1] = fka.fk_columns
    )
    ORDER BY fka.fk_table::text;
  `);

  // 14. Currently running long queries or blocking locks
  console.log('14. Currently running long queries & locks...');
  report.active_long_queries = runSql(`
    SELECT 
      pid,
      now() - query_start AS duration,
      usename,
      state,
      wait_event_type,
      wait_event,
      left(query, 300) AS query
    FROM pg_stat_activity
    WHERE state != 'idle'
      AND pid != pg_backend_pid()
    ORDER BY duration DESC;
  `);

  report.locks = runSql(`
    SELECT 
      blocked_locks.pid AS blocked_pid,
      blocked_activity.usename AS blocked_user,
      blocking_locks.pid AS blocking_pid,
      blocking_activity.usename AS blocking_user,
      blocked_activity.query AS blocked_statement,
      blocking_activity.query AS current_statement_in_blocking_process
    FROM pg_catalog.pg_locks blocked_locks
    JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
    JOIN pg_catalog.pg_locks blocking_locks 
      ON blocking_locks.locktype = blocked_locks.locktype
      AND blocking_locks.database IS NOT DISTINCT FROM blocked_locks.database
      AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
      AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
      AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
      AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
      AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
      AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
      AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
      AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
      AND blocking_locks.pid != blocked_locks.pid
    JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
    WHERE NOT blocked_locks.granted;
  `);

  // 15. Check Postgres settings affecting I/O & Memory
  console.log('15. Memory, I/O and Autovacuum settings...');
  report.pg_settings = runSql(`
    SELECT name, setting, unit, short_desc
    FROM pg_settings
    WHERE name IN (
      'shared_buffers',
      'work_mem',
      'maintenance_work_mem',
      'effective_cache_size',
      'autovacuum',
      'autovacuum_max_workers',
      'autovacuum_vacuum_cost_limit',
      'autovacuum_vacuum_cost_delay',
      'autovacuum_vacuum_scale_factor',
      'autovacuum_vacuum_threshold',
      'checkpoint_completion_target',
      'max_wal_size',
      'min_wal_size',
      'wal_buffers',
      'default_statistics_target',
      'random_page_cost',
      'seq_page_cost'
    )
    ORDER BY name;
  `);

  const outPath = path.join(__dirname, '..', 'reports', 'supabase_production_io_audit_raw.json');
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
  console.log('Audit completed! Saved to:', outPath);
}

runAudit().catch(console.error);
