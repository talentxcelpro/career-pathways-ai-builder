# TalentXcel Universal MCP Server — Tool Catalogue

The TalentXcel Universal MCP Server registers **26 production tools** categorized across 6 functional intelligence domains plus a Unified Natural-Language Search Engine.

All tools adhere to the Model Context Protocol (MCP 2024-11-05) standard with Zod schema validation and Row Level Security.

---

## Group A: Job Intelligence (Tools 1–4)

### 1. `search_jobs`
* **Access Level:** Public
* **Description:** Search live job listings with multi-dimensional filtering.
* **Parameters:**
  * `query` (optional string): Keyword across title, description, and company.
  * `designation` (optional string): Targeted role designation.
  * `skills` (optional string[]): Required technical or domain competencies.
  * `location` (optional string): Target city, state, or region.
  * `experience_min` / `experience_max` (optional integer): Experience bounds.
  * `salary_min` (optional number): Minimum CTC filter.
  * `employment_type` (optional enum): `full_time`, `part_time`, `contract`, `internship`, `remote`.
  * `limit` (integer, default 10) / `offset` (integer, default 0).
* **Data Source:** `jobs` table (`is_active = true`).

### 2. `get_job_details`
* **Access Level:** Public
* **Description:** Retrieve comprehensive details of an active listing.
* **Parameters:** `job_id` (UUID).
* **Returns:** Company details, full description, must-have/nice-to-have requirements, salary range, benefits, and direct application URL.

### 3. `find_similar_jobs`
* **Access Level:** Public
* **Description:** Identify active opportunities similar to a reference job.
* **Parameters:** `job_id` (UUID), `limit` (optional integer).
* **Returns:** Similar postings ranked by skill overlap and category match.

### 4. `get_trending_jobs`
* **Access Level:** Public
* **Description:** Retrieve trending vacancies using real platform telemetry.
* **Parameters:** `limit` (integer, default 10).
* **Data Source:** `get_trending_jobs` database RPC / view counts.

---

## Group B: Candidate Intelligence (Tools 5–8)

### 5. `search_candidates`
* **Access Level:** Employer / Admin (Authenticated)
* **Description:** Search candidates respecting candidate consent and privacy.
* **Parameters:** `skills` (string[]), `location` (string), `min_experience_years` (integer), pagination.
* **Privacy Controls:** PII (phone, email) is redacted unless employer-candidate mutual consent exists. Candidates must have `is_profile_public = true` or `looking_for_job = true`.

### 6. `get_candidate_profile`
* **Access Level:** User (Own) / Employer (Verified Public)
* **Description:** Retrieve authorized candidate career profile.
* **Parameters:** `candidate_id` (optional UUID).

### 7. `match_candidate_to_jobs`
* **Access Level:** User (Authenticated)
* **Description:** Match authenticated user's profile against active vacancies.
* **Parameters:** `limit` (integer, default 5).
* **Returns:** Ranked job matches with percentage score, skill overlap, and missing competencies.

### 8. `calculate_skill_gap`
* **Access Level:** User (Authenticated)
* **Description:** Compute skill deficit between profile and a target role.
* **Parameters:** `target_role` (string).
* **Returns:** Readiness score, possessed skills, missing competencies, and priority development sprints.

---

## Group C: Resume Intelligence (Tools 9–12)

### 9. `analyze_resume`
* **Access Level:** User (Authenticated)
* **Description:** Evaluate resume structure, content, and ATS compatibility score.
* **Parameters:** `target_job_title` (optional), `resume_text` (optional).
* **Returns:** ATS score (0-100), detected strengths, flagged issues, and recommendations.

### 10. `optimize_resume`
* **Access Level:** User (Authenticated)
* **Description:** Advisory resume enhancement guide without overwriting user data.
* **Parameters:** `target_role` (string).
* **Returns:** Action verb formula, ATS formatting guidelines, and tailored headline.

### 11. `get_resume_profile`
* **Access Level:** User (Authenticated)
* **Description:** Retrieve authenticated user's structured resume records.
* **Returns:** Primary resume metadata, stored resumes, and active resume URL.

### 12. `generate_resume_recommendations`
* **Access Level:** User (Authenticated)
* **Description:** Role-specific tailoring analysis based on a target job description.
* **Parameters:** `job_description` (string).
* **Returns:** High-priority JD keywords to integrate and positioning advice.

---

## Group D: Career Intelligence (Tools 13–16)

### 13. `career_path_recommendation`
* **Access Level:** Public / User
* **Description:** Strategic career advancement roadmap to reach a target role.
* **Parameters:** `current_role` (optional), `target_role` (string).
* **Returns:** Stepped progression milestones, required bridging competencies, and estimated timeline.

### 14. `skill_recommendations`
* **Access Level:** Public
* **Description:** Top competencies demanded in live job postings for a target role.
* **Parameters:** `target_role` (string).
* **Returns:** High-demand skills with market frequency and criticality rating.

### 15. `salary_insights`
* **Access Level:** Public
* **Description:** Verified market compensation percentiles.
* **Parameters:** `job_title` (string), `location` (optional).
* **Returns:** P25, Median (P50), P75 percentiles based on live postings and salary benchmarks.

### 16. `career_coach`
* **Access Level:** Public / User
* **Description:** Contextual career guidance across job search, negotiation, career change, skills, and interviews.
* **Parameters:** `question` (string), `context` (enum).

---

## Group E: Employer Intelligence (Tools 17–20)

### 17. `search_employers`
* **Access Level:** Public
* **Description:** Search verified employers and organizations.
* **Parameters:** `query` (string), `industry` (string), `location` (string).
* **Data Source:** `companies` table.

### 18. `get_employer_profile`
* **Access Level:** Public
* **Description:** Retrieve company profile and active job openings.
* **Parameters:** `employer_id` (UUID).

### 19. `recruitment_insights`
* **Access Level:** Public
* **Description:** Hiring velocity, remote work share, and geographic recruitment distribution.
* **Parameters:** `industry` (optional string).

### 20. `candidate_job_pipeline`
* **Access Level:** Employer (Authenticated)
* **Description:** Retrieve applicant pipeline for employer-owned vacancies.
* **Parameters:** `job_id` (optional UUID), `status` (optional enum), `limit` (integer).

---

## Group F: Platform Intelligence (Tools 21–25)

### 21. `platform_statistics`
* **Access Level:** Public
* **Description:** Live aggregated counts of active jobs, employers, and courses.
* **Guarantees:** Verified database counts; no synthetic data.

### 22. `search_platform_content`
* **Access Level:** Public
* **Description:** Search verified career articles, editorial guides, and industry news.
* **Data Source:** `content_hub` table.

### 23. `get_user_dashboard`
* **Access Level:** User (Authenticated)
* **Description:** Permitted dashboard overview: profile status and recent applications.

### 24. `get_user_notifications`
* **Access Level:** User (Authenticated)
* **Description:** Retrieve user platform notifications.
* **Parameters:** `unread_only` (boolean), `limit` (integer).

### 25. `search_learning_resources`
* **Access Level:** Public
* **Description:** Search accredited courses, skill pods, and career tracks.
* **Data Source:** `courses` table.

---

## Unified Search Engine (Tool 26)

### 26. `universal_talent_search`
* **Access Level:** Public / User
* **Description:** Unified natural language search engine across all platform vectors.
* **Supported Natural-Language Patterns:**
  * *"Find Python developer jobs in Bangalore"*
  * *"Find remote React jobs paying above 15 LPA"*
  * *"Find candidates with Java, AWS and 5 years of experience"*
  * *"Find jobs matching my resume"*
  * *"What skills should I learn to become an AI engineer?"*
  * *"Find employers recruiting data engineers"*
  * *"Find career resources for fresh graduates"*
* **Features:** Natural-language intent classification, filter extraction, source attribution, and ranked results.
