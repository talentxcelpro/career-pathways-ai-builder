# PRD: Private Profile Visitor Analytics (TalentXcel.in)

## 1. Objective
Implement a secure, LinkedIn-style Profile Visitor Analytics feature that allows a profile owner to see who visited their profile and when, by making the existing unique profile views count (e.g. `19 Profile Views (8 unique)`) clickable to open a private, paginated visitor analytics panel ("Who viewed your profile").

## 2. Scope & Key Deliverables
1. **Forensic Audit**:
   - Inspect existing Profile Views and unique views implementation on the user's profile page.
   - Inspect existing Supabase tables, views, RPCs, and RLS policies around profile views, analytics, and visitor tracking.
   - Inspect profile APIs, privacy rules, and blocking logic.
2. **Database Architecture & Migration**:
   - Inspect if an existing table can be safely used/extended, or create `public.profile_visits` (or similar) with:
     - `id` (UUID PK)
     - `profile_owner_id` (UUID references profiles/users)
     - `visitor_user_id` (UUID references profiles/users)
     - `visited_at` (TIMESTAMPTZ)
     - `visit_source` (TEXT optional)
     - `created_at` (TIMESTAMPTZ)
   - Proper foreign keys, composite indexes (`(profile_owner_id, visited_at DESC)` and `(profile_owner_id, visitor_user_id, visited_at DESC)`).
   - Reversible migrations with clean rollback.
3. **Visit Tracking Logic**:
   - Server-side tracking via secure RPC or endpoint (`record_profile_visit`).
   - Visitor must be authenticated and cannot be the profile owner (`visitor_user_id != profile_owner_id`).
   - Deduplication: enforce 30-minute deduplication window per visitor/profile pair (prevent rapid refreshes / React re-renders from creating duplicate visits).
   - Respect block relationships, profile visibility, and privacy rules.
   - Exclude bots/automated requests and invalid profile requests.
4. **Unique Visitor Count & Analytics**:
   - Preserve existing lifetime unique vs total views consistency.
   - Server-side RPC to fetch paginated visitor list (`get_profile_visitors(p_page, p_page_size)`), strictly restricted to `auth.uid() = profile_owner_id`.
   - Never expose visitor lists to non-owners.
5. **UI & Visitor Panel**:
   - Profile views section on user's profile page: make unique visitor count (e.g., `8 unique` or `View visitors`) clickable with hover/focus states.
   - "Who viewed your profile" modal/drawer/panel with supporting text: `Only you can see this list.`
   - Entry details: photo, full name, professional headline, company, location (if available/permitted), relative/exact visit timestamp in local timezone, clickable profile link, visit frequency count.
   - Loading skeleton, empty state (`Your profile views will appear here when people visit your profile.`), error state, pagination/infinite scroll, responsive mobile layout.
6. **Security & RLS**:
   - Strict RLS on visit tables: only profile owner can read their visitors.
   - Direct API access cannot bypass authorization.
   - Input validation and sanitized queries.
7. **Performance & Verification**:
   - Zero polling for visitor lists.
   - Bounded queries with pagination.
   - Comprehensive test suite covering authorization, tracking deduplication, privacy, and UI.
   - TypeScript check (`npx tsc --noEmit`) and production build (`npm run build`).
