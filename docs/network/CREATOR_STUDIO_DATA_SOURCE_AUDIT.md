# CREATOR STUDIO DATA SOURCE AUDIT

**Mission ID:** TXC-NETWORK-CREATOR-STUDIO-009  
**Platform:** TalentXcel Network (https://talentxcel.in/network/creator-studio)  
**Database:** Supabase Production `dthlgsnakhoftinssokm`  
**Audit Standard:** Zero Fake Data, Zero Unsupported Claims, Attributable Telemetry  

---

## 1. Executive Summary

This audit establishes the definitive authoritative data sources for every metric, target, eligibility check, and reward computation rendered within Creator Studio (`/network/creator-studio`).

---

## 2. Metric Source & Telemetry Registry

| Metric Key | UI Label | Authoritative Source Table | Source Columns / Query | Validation Rule & Evidence | Classification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `human_reach` | Qualified Human Reach | `public.profile_views` | `profile_id`, `viewer_id`, `created_at` | `COUNT(DISTINCT viewer_id)` where `profile_id = auth.uid() AND viewer_id != auth.uid()`. Unauthenticated views flagged as unverified reach. | **VERIFIED REAL DATA** |
| `engagements` | Meaningful Engagements | `public.posts`, `public.post_reactions`, `public.post_comments` | `author_id`, `likes_count`, `comments_count`, `shares_count` | `SUM(likes_count + comments_count + shares_count)` on original published posts where `author_id = auth.uid()`. | **VERIFIED REAL DATA** |
| `articles` | Technical Articles | `public.posts` | `author_id`, `post_type`, `status`, `is_deleted` | `COUNT(*)` where `author_id = auth.uid() AND post_type IN ('article', 'career_article') AND status = 'published' AND is_deleted = false`. | **VERIFIED REAL DATA** |
| `helpful_answers` | Helpful Answers | Non-provisioned | `answers` table does not exist in public schema | Query evaluated; table absent. UI renders `Not enough data` / `Unavailable`. Zero fake answers injected. | **UNAVAILABLE** |
| `mentorship` | Mentorship Contributions | `public.mentorship_sessions` | `mentor_id`, `status`, `created_at` | `COUNT(*)` where `mentor_id = auth.uid() AND status = 'completed'`. | **VERIFIED REAL DATA** |
| `quality_posts` | Quality Posts | `public.posts` | `author_id`, `post_type`, `status`, `is_deleted` | `COUNT(*)` where `author_id = auth.uid() AND post_type NOT IN ('article', 'career_article') AND status = 'published' AND is_deleted = false`. | **VERIFIED REAL DATA** |
| `audience_growth` | Genuine Audience Growth | `public.connections` | `requester_id`, `recipient_id`, `status`, `created_at` | `COUNT(*)` where `(requester_id = auth.uid() OR recipient_id = auth.uid()) AND status = 'accepted' AND created_at >= periodStart`. | **VERIFIED REAL DATA** |
| `subscription_eligibility` | Creator Program Eligibility | `public.subscribers` | `user_id`, `subscription_tier`, `status`, `subscribed` | RPC `check_user_subscription` verified against `public.subscribers`. Active on Starter ₹199, Pro ₹499, or Premium ₹999 required for pool payouts. | **VERIFIED REAL DATA** |
| `reward_points_ledger` | Eligible Points Ledger | Dynamic calculation | Weighted formula over verified activity | Sum of reach (0.25), engagement (0.25), articles (20 pts), posts (5 pts), mentorship (25 pts), growth (10 pts). | **VERIFIED REAL DATA** |
| `integrity_bot_score` | Spam / Bot Telemetry | Telemetry assessment | Behavioral audit logs | Lacking automated behavioral telemetry; truthfully reported as `Not assessed (Insufficient behavioral telemetry)`. | **UNAVAILABLE / UNASSESSED** |
| `integrity_peer_score` | Peer Help Rating | Peer reviews | Review feedback | 0 qualifying reviews found; truthfully reported as `Not assessed (Sample size: 0 reviews)`. | **UNAVAILABLE / UNASSESSED** |
