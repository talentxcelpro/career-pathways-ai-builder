## Three issues, one focused pass

### 1. Profile image upload fails silently

**Root cause (hypothesis, two layers):**
- `optimizedStorage.uploadFile` wraps the call in a Redis-backed cache (`upload:${bucket}:${path}:${size}`) and an in-memory `uploadQueue`. If a previous upload of the same size short-circuits to a cached result, the toast for "upload failed" never fires and no new file lands in storage. This matches the silent-fail symptom.
- The hook also catches the error and the wrapping `try` in `ProfilePictureUpload` silently swallows non-Error throws.

**Fix:**
- In `useFileUpload`, call `supabase.storage.from(bucket).upload(...)` directly (skip `optimizedStorage`) for the avatars path. Keep `upsert: true`, `cacheControl: '3600'`.
- After upload, call `getPublicUrl` and append `?v=${Date.now()}` (already done).
- In `ProfilePictureUpload`, log the raw error to console with `JSON.stringify(error)` so the next failure is diagnosable.
- Also surface bucket policy error text via `toast.error(error.message)`.

### 2. "Access Restricted — Required: MANAGE_JOBS" for company creators

**Root cause:** `company_team_members` row is never auto-created when a company is created, and the `companies` table has no `created_by` column, so we cannot retro-link an owner. The user lands as role `member`, which has zero entries in `role_permissions` → all gates closed.

**Fix (DB migration):**
1. Add `created_by uuid` column to `public.companies` (nullable, indexed).
2. Add a trigger `companies_set_owner_after_insert` that:
   - Sets `created_by = auth.uid()` if NULL.
   - Inserts a row into `company_team_members` (`company_id`, `user_id = auth.uid()`, `role = 'owner'`, `is_active = true`) on conflict do nothing.
3. Backfill: for every existing company without an owner row in `company_team_members`, find the most-likely creator from `company_profiles.user_id` (join on `company_id`) or `employer_requests` and insert as `owner`. Companies with no recoverable owner are left untouched (admin can claim later).
4. Add a `member` role to `role_permissions` with `view_dashboard=true` only — so MEMBER stops looking like a broken state.

**Fix (UI):**
- `useTeamPermissions` already handles permissions. Add a graceful `isLoading` skeleton in `employer/Dashboard.tsx` so the "Access Restricted" cards do not flash before role loads.

### 3. Consistent branding (fonts + colors)

**Scope this wave (full visual unification is multi-day — locking the foundation now):**
- **Font lockdown:** Strip every `fontFamily` override outside `index.css`. Single ramp: `--font-display` (SF Pro Display fallback → Inter), `--font-text` (SF Pro Text → Inter). Already established in memory, but `index.html`, `mobile-first-global.css`, and `criticalCSSInliner.ts` still set sizes. Audit + remove duplicates.
- **Color lockdown:** Audit `index.css` HSL tokens. Define exactly: `--background`, `--foreground`, `--primary` (TalentXcel blue), `--primary-foreground`, `--accent`, `--muted`, `--muted-foreground`, `--border`, `--card`, `--destructive`. Remove any other ad-hoc tokens (e.g. `--brand-blue-2`, `--surface-elevated-2`).
- **Sweep top-of-funnel pages** (`Index`, `Profile`, `EditProfile`, `Jobs`, `Companies`, `LearningHub`, employer `Dashboard`) to remove hardcoded `text-white`, `bg-blue-600`, `text-3xl`, etc., replacing with semantic tokens + ramp classes (`text-display-1`, `text-headline`).
- **Single Brand component:** ensure the wordmark uses one Logo component everywhere (header, footer, auth, employer).

Deeper page-by-page rewrite (cards, hero compositions, motion) lands in the next wave.

### Order of execution
1. Migration: companies.created_by + auto-owner trigger + backfill + member role permissions. (Requires user approval.)
2. Code: rewrite `useFileUpload` to bypass the cache, add console diagnostics in upload flow.
3. Code: brand foundation cleanup in `index.css`, `index.html`, `mobile-first-global.css`, `criticalCSSInliner.ts`, `tailwind.config.ts`.
4. Code: sweep the 7 top pages listed above for token violations.
5. Self-test: post a job as the test user (via SQL) to confirm the gate opens.

### Out of scope this wave
- Multi-voice TTS expansion.
- Page-level visual rewrites (hero, animations, card variants) — that is the next wave.
- Mobile/desktop route consolidation.