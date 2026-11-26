# PHASE 8 DB Maintenance Plan

## Overview
This plan outlines safe, non‑destructive maintenance actions for the three primary databases involved in TalentXcel’s SEO and growth pipelines:

1. `seo_generated_content`
2. `job_ingestion_queue`
3. `notifications`

All actions are **manual** and **must be performed during a scheduled maintenance window**. No automated VACUUM, DELETE, or schema‑changing operations are executed by this agent.

---

## 1. seo_generated_content
- **Purpose**: Stores pre‑rendered SEO HTML fragments and OG image references used by the edge‑rendering layer.
- **Current size**: ~210 MB (as of latest audit).

### Recommended Maintenance
| Step | Action | Details | Safety Checks |
|------|--------|---------|----------------|
| 1 | **Backup** | Export the table using `pg_dump` (or SQLite equivalent) to a timestamped file. | Verify file size matches expected data volume. |
| 2 | **VACUUM (FULL, ANALYZE)** | Run after confirming no active write traffic (e.g., during off‑peak hours). | Ensure no active Vercel edge functions are serving from the table. |
| 3 | **Integrity Verify** | Run `SELECT COUNT(*) FROM seo_generated_content;` and compare with backup row count. | Log any discrepancy for investigation. |
| 4 | **Rollback** | If post‑VACUUM performance regresses, restore from the backup dump. | Keep the backup file for at least 48 h. |

**Note**: The table is append‑only; no rows are currently deleted. VACUUM will reclaim free space and rebuild indexes.

---

## 2. job_ingestion_queue
- **Purpose**: Holds raw job feed items awaiting processing by the ingestion pipeline.
- **Current size**: ~120 MB with ~8 000 pending rows.

### Recommended Maintenance
| Step | Action | Details | Safety Checks |
|------|--------|---------|----------------|
| 1 | **Backup** | Export to `job_ingestion_queue_YYYYMMDD.sql`. | Verify row count matches live table. |
| 2 | **Retention Policy** | Delete rows older than **30 days** that have `status='processed'`.
   ```sql
   DELETE FROM job_ingestion_queue WHERE status='processed' AND created_at < NOW() - INTERVAL '30 days';
   ``` | Run a `SELECT COUNT(*)` preview before deletion. |
| 3 | **VACUUM ANALYZE** | Run after deletion to reclaim space. | Ensure no ingestion workers are running; pause the pipeline if needed. |
| 4 | **Rollback** | If unexpected data loss occurs, restore from backup. | Keep backup for 72 h. |

**Locking**: Use a lightweight advisory lock (`pg_advisory_lock`) around the DELETE to prevent concurrent ingestion.

---

## 3. notifications
- **Purpose**: Stores email/SMS push notifications queued for candidates and employers.
- **Current size**: ~130 MB with a mix of `pending`, `sent`, and `failed` rows.

### Recommended Maintenance
| Step | Action | Details | Safety Checks |
|------|--------|---------|----------------|
| 1 | **Backup** | Dump the table to `notifications_YYYYMMDD.sql`. | Verify backup integrity with `pg_restore --list`. |
| 2 | **Archive Sent** | Move rows with `status='sent'` older than **60 days** to an archival table `notifications_archive`.
   ```sql
   INSERT INTO notifications_archive SELECT * FROM notifications WHERE status='sent' AND sent_at < NOW() - INTERVAL '60 days';
   DELETE FROM notifications WHERE status='sent' AND sent_at < NOW() - INTERVAL '60 days';
   ``` | Check row counts before/after each step. |
| 3 | **Failed Cleanup** | Delete rows with `status='failed'` older than **90 days**.
   ```sql
   DELETE FROM notifications WHERE status='failed' AND created_at < NOW() - INTERVAL '90 days';
   ``` | Preview rows before deletion. |
| 4 | **VACUUM ANALYZE** | Run post‑cleanup. | Ensure no notification workers are actively reading the table. |
| 5 | **Rollback** | Restore from the backup dump if needed. | Retain backup for 48 h. |

---

## General Rollback Procedure
1. Stop any background jobs that interact with the target table.
2. Restore the latest backup using the appropriate CLI (`psql < dump.sql` or `sqlite3 < dump.sql`).
3. Run `VACUUM ANALYZE` to re‑optimize after restore.
4. Restart the paused pipelines/services.

## Scheduling & Communication
- **Maintenance Window**: Saturday 02:00‑04:00 UTC (low traffic).
- **Stakeholders**: Engineering lead, DB admin, SEO operations lead.
- **Notification**: Post a Slack reminder 24 h prior and a status update after each step.

---

*Prepared by the Phase 8 Growth Activation team. No destructive operations are performed automatically; execution is manual and must be approved by the DB admin.*
