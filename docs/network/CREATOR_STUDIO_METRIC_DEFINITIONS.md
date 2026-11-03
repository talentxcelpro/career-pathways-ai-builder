# CREATOR STUDIO METRIC DEFINITIONS & CALCULATION SPECIFICATION

**Mission ID:** TXC-NETWORK-CREATOR-STUDIO-009  
**Specification Version:** v2026.11.1  
**Platform:** TalentXcel Network (https://talentxcel.in/network/creator-studio)  

---

## 1. Metric Specifications

### 1. Qualified Human Reach
* **Definition**: The count of distinct, verified human accounts who visited the creator's profile or read their published technical articles during the current calendar month.
* **Exclusions**:
  * Author self-views (`viewer_id = author_id`).
  * Anonymous unauthenticated visits lacking session identity (recorded as unverified reach, excluded from points).
  * Automated crawler/bot traffic.
* **Database Query**:
  ```sql
  SELECT COUNT(DISTINCT viewer_id) 
  FROM public.profile_views 
  WHERE profile_id = :authUserId 
    AND viewer_id IS NOT NULL 
    AND viewer_id != :authUserId 
    AND created_at >= :periodStart;
  ```

---

### 2. Meaningful Engagements
* **Definition**: Validated positive interactions received on original published posts during the monthly reporting window.
* **Constituent Events**:
  * Genuine post likes (`posts.likes_count`).
  * Substantive comments (`posts.comments_count`).
  * Reshares and reposts (`posts.shares_count`).
* **Exclusions**: Self-likes, self-comments, and automated engagement.
* **Database Query**:
  ```sql
  SELECT SUM(COALESCE(likes_count, 0) + COALESCE(comments_count, 0) + COALESCE(shares_count, 0))
  FROM public.posts
  WHERE author_id = :authUserId 
    AND is_deleted = false 
    AND status = 'published'
    AND created_at >= :periodStart;
  ```

---

### 3. Technical Articles
* **Definition**: Long-form technical engineering case studies, systems architecture breakdowns, and career analysis published during the monthly reporting window.
* **Criteria**: `post_type IN ('article', 'career_article')`, `status = 'published'`, and `is_deleted = false`.
* **Database Query**:
  ```sql
  SELECT COUNT(*) 
  FROM public.posts
  WHERE author_id = :authUserId 
    AND post_type IN ('article', 'career_article') 
    AND status = 'published'
    AND is_deleted = false
    AND created_at >= :periodStart;
  ```

---

### 4. Helpful Answers
* **Definition**: Verified answers to technical questions in community forums with confirmed helpful peer feedback.
* **Current Status**: Standalone Q&A answer schema is not yet provisioned in the production database. The platform displays **"Not enough data"** / **"Unavailable"** and assigns 0 points rather than fabricating synthetic answer counts.

---

### 5. Mentorship Contributions
* **Definition**: Verified 1-on-1 career or technical mentorship sessions completed by the creator as a mentor.
* **Exclusions**: Pending requests, rescheduled, or cancelled sessions.
* **Database Query**:
  ```sql
  SELECT COUNT(*) 
  FROM public.mentorship_sessions
  WHERE mentor_id = :authUserId 
    AND status = 'completed'
    AND created_at >= :periodStart;
  ```

---

### 6. Quality Posts
* **Definition**: Standard professional updates, knowledge discussions, and community challenges published during the monthly reporting window.
* **Database Query**:
  ```sql
  SELECT COUNT(*) 
  FROM public.posts
  WHERE author_id = :authUserId 
    AND post_type NOT IN ('article', 'career_article') 
    AND status = 'published'
    AND is_deleted = false
    AND created_at >= :periodStart;
  ```

---

### 7. Genuine Audience Growth
* **Definition**: Net newly established accepted connections and profile followers during the reporting window.
* **Database Query**:
  ```sql
  SELECT COUNT(*) 
  FROM public.connections
  WHERE (requester_id = :authUserId OR recipient_id = :authUserId)
    AND status = 'accepted'
    AND created_at >= :periodStart;
  ```
