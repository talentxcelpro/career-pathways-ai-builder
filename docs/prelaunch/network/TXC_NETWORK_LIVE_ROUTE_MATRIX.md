# TXC NETWORK — CANONICAL ROUTE REGISTRY & DISCREPANCY RECONCILIATION

**Mission ID:** TXC-NETWORK-PROD-CLOSURE-003  
**Target Platform:** https://talentxcel.in/network  
**File Reference:** `src/navigation/networkRoutes.tsx`  
**Date:** 2026-11-03  
**Classification:** **PASS — CODE INSPECTED & ROUTE MAPPED**

---

## 1. ROUTE DISCREPANCY RECONCILIATION

In earlier documentation, references alternated between **20 routes** and **23 enumerated rows**, while `src/navigation/networkRoutes.tsx` contains **32 registered route definitions**.

### Explanation of Discrepancies:
1. **The 20 Baseline Canonical Routes:** The original audit specification and acceptance task listed 20 primary top-level network destinations.
2. **The 23 Acceptance Rows:** In Mission 002, the acceptance table enumerated the 20 primary destinations PLUS 3 nested parameter detail routes (`/network/groups/:id`, `/network/articles/:id`, `/network/events/:id`), totaling 23 routes.
3. **The 32 In-Code Array Entries:** The router file `src/navigation/networkRoutes.tsx` configures 32 total route objects:
   - 20 Primary Core Routes
   - 6 Nested/Parameterized Detail Routes (`/network/people/:id`, `/network/posts/:id`, `/network/articles/:id`, `/network/groups/:id`, `/network/events/:id`, `/network/messages/:id`)
   - 4 Network Auxiliary/Analysis Routes (`/network/posts`, `/network/profile/analytics`, `/network/suggestions`, `/network/mobile-analysis`)
   - 2 Cross-Product/External Redirect Routes (`/txc/mining`, `/p/:id`)

---

## 2. CANONICAL ROUTE REGISTRY (ALL 32 ENTRIES)

| # | Route Path | Title / Function | Component | Lazy Status | Auth Guard | Access Behaviour | Runtime Verification Status |
|---|---|---|---|:---:|:---:|---|:---:|
| 1 | `/network` | Main Network Feed | `NetworkPage` | Lazy (`LazyRoutes`) | Public / Hybrid | Authenticated sees personal feed; Anon sees public feed | **PASS — CODE & DB VERIFIED** |
| 2 | `/txc/mining` | TXC Mining (Auxiliary) | Inline JSX | Inline | Public | Renders static info | **PASS — CODE INSPECTED** |
| 3 | `/network/people` | Network People | `People` | Lazy (`React.lazy`) | Public / Hybrid | Renders directory of verified professionals | **PASS — CODE & DB VERIFIED** |
| 4 | `/network/connections` | My Connections | `Connections` | Lazy (`React.lazy`) | Authenticated | Redirects unauthenticated to `/auth` | **PASS — CODE & DB VERIFIED** |
| 5 | `/network/analytics` | Network Analytics | `NetworkAnalytics` | Lazy (`React.lazy`) | Authenticated | Real-time 7d/30d/90d/1y event analytics | **PASS — CODE & DB VERIFIED** |
| 6 | `/network/discover` | Discover Recommendations | `Discover` | Lazy (`React.lazy`) | Authenticated | Recommended professionals & circles | **PASS — CODE & DB VERIFIED** |
| 7 | `/network/people/:id` | Profile URL Redirect | `ProfileUrlRedirect`| Static import | Public | Redirects `/network/people/:id` to `/profile/:username` | **PASS — CODE INSPECTED** |
| 8 | `/p/:id` | Public User Profile | `PublicUserProfile` | Lazy (`React.lazy`) | Public | Read-only public portfolio view | **PASS — CODE & DB VERIFIED** |
| 9 | `/network/posts` | Network Posts Listing | `Posts` | Lazy (`React.lazy`) | Authenticated | Feed of all network posts | **PASS — CODE & DB VERIFIED** |
| 10 | `/network/posts/:id` | Post Detail View | `PublicPostPage` | Lazy (`React.lazy`) | Public / Hybrid | Single post view with RLS validation | **PASS — CODE & DB VERIFIED** |
| 11 | `/network/articles` | Network Articles Hub | `Articles` | Lazy (`React.lazy`) | Authenticated | Thought leadership article stream | **PASS — CODE & DB VERIFIED** |
| 12 | `/network/articles/:id` | Article Detail Reader | `ArticleDetail` | Lazy (`React.lazy`) | Authenticated | Full article reader and comments | **PASS — CODE & DB VERIFIED** |
| 13 | `/network/groups` | Network Groups Directory | `Groups` | Lazy (`React.lazy`) | Authenticated | Communities and circles directory | **PASS — CODE & DB VERIFIED** |
| 14 | `/network/groups/:id` | Group Detail & Feed | `GroupDetail` | Lazy (`React.lazy`) | Authenticated | Group member posts and discussions | **PASS — CODE & DB VERIFIED** |
| 15 | `/network/requests` | Connection Requests | `Requests` | Lazy (`React.lazy`) | Authenticated | Pending incoming and outgoing invites | **PASS — CODE & DB VERIFIED** |
| 16 | `/network/events` | Professional Events | `Events` | Lazy (`React.lazy`) | Authenticated | Virtual and in-person event calendar | **PASS — CODE & DB VERIFIED** |
| 17 | `/network/events/:id` | Event Detail View | `EventDetail` | Lazy (`React.lazy`) | Authenticated | Event RSVP and speaker details | **PASS — CODE & DB VERIFIED** |
| 18 | `/network/messages` | Messages Inbox | `Messages` | Lazy (`React.lazy`) | Authenticated | Real-time chat threads | **PASS — CODE & DB VERIFIED** |
| 19 | `/network/messages/new` | New Message Composer | `NewMessage` | Lazy (`React.lazy`) | Authenticated | Recipient selector and composer | **PASS — CODE & DB VERIFIED** |
| 20 | `/network/messages/:id` | Message Conversation | `Messages` | Lazy (`React.lazy`) | Authenticated | Active conversation view | **PASS — CODE & DB VERIFIED** |
| 21 | `/network/messages/requests` | Message Requests | `MessageRequests` | Lazy (`React.lazy`) | Authenticated | Inbound messages from non-connections | **PASS — CODE & DB VERIFIED** |
| 22 | `/network/messages/archived` | Archived Messages | `ArchivedMessages` | Lazy (`React.lazy`) | Authenticated | Restorable archived conversation threads | **PASS — CODE & DB VERIFIED** |
| 23 | `/network/messages/settings` | Message Settings | `MessageSettings` | Lazy (`React.lazy`) | Authenticated | Read receipts & privacy preferences | **PASS — CODE & DB VERIFIED** |
| 24 | `/network/profile/analytics` | Profile Analytics | `ProfileAnalytics` | Lazy (`React.lazy`) | Public / Hybrid | Profile traffic metrics | **PASS — CODE & DB VERIFIED** |
| 25 | `/network/notifications` | Social Notifications | `Notifications` | Lazy (`React.lazy`) | Authenticated | Real-time network activity stream | **PASS — CODE & DB VERIFIED** |
| 26 | `/network/suggestions` | Suggested Connections | `Suggestions` | Lazy (`React.lazy`) | Authenticated | Skill and company based matches | **PASS — CODE & DB VERIFIED** |
| 27 | `/network/mobile-analysis` | Mobile Analysis | `ComprehensiveMobileNetworkAnalysis` | Static import | Authenticated | Mobile performance diagnostics | **PASS — CODE INSPECTED** |
| 28 | `/network/skill-swap` | Skill Swap Exchange | `SkillSwap` | Lazy (`React.lazy`) | Authenticated | Peer-to-peer knowledge exchange | **PASS — CODE & DB VERIFIED** |
| 29 | `/network/video-intros` | Video Introductions | `VideoIntros` | Lazy (`React.lazy`) | Authenticated | Elevator pitch video feed | **PASS — CODE & DB VERIFIED** |
| 30 | `/network/verified` | Verified Directory | `Verified` | Lazy (`React.lazy`) | Authenticated | KYC and badge-verified profiles | **PASS — CODE & DB VERIFIED** |
| 31 | `/network/communities` | Communities Hub | `Communities` | Lazy (`React.lazy`) | Authenticated | Industry circles and masterclasses | **PASS — CODE & DB VERIFIED** |
| 32 | `/network/leaderboards` | Network Leaderboards | `Leaderboards` | Lazy (`React.lazy`) | Authenticated | Reputation, reach & engagement ranks | **PASS — CODE & DB VERIFIED** |
