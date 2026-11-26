# Security, Quota & Performance Verification Audit

**Audited At:** 2026-11-25T10:40:43.440Z  
**Overall Gate:** PASS  
**Live Supabase Database Size:** 459 MB (`481455251` bytes)  
**Local Tier-1 SQLite Warehouse Size:** 2760.15 MB (out-of-cloud zero Disk I/O overhead)  

## Security Checks
- Permissive public/anon write policies on audited intelligence & taxonomy tables: **0**
- Cloudflare Edge Gateway `SENSITIVE_PRIVATE_ENTITIES` coverage: **21/21 tables protected**
- Blocking client-bundle secret or internal-table query violations: **0**
- Pre-existing server-env `SERVICE_ROLE_KEY` references in `src/` (non-`VITE_` guarded, tracked for cleanup): **4**
  - `src\agents\si\engines\CustomerAcquisitionEngine.ts`: Server-guarded process.env SERVICE_ROLE_KEY reference outside client components
  - `src\lib\discovery\connectors\GSCConnector.ts`: Server-guarded process.env SERVICE_ROLE_KEY reference outside client components
  - `src\lib\discovery\discoveryVitePlugin.ts`: Server-guarded process.env SERVICE_ROLE_KEY reference outside client components
  - `src\lib\discovery\talentxcelClient.ts`: Server-guarded process.env SERVICE_ROLE_KEY reference outside client components
- Active `pg_cron` jobs: `expire-old-jobs` (0 2 * * *), `clean-cron-logs` (0 3 * * *)