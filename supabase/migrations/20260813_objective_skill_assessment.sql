-- Objective Skill Assessment: seed data + RLS lockdown
--
-- WHY THIS MIGRATION EXISTS:
-- The `assessments` / `user_assessments` tables already existed (Phase 3 Learning
-- Platform schema) with everything needed for a real, gradeable test:
-- passing_score, time_limit_minutes, max_attempts, and a started -> submitted ->
-- graded status workflow. The old SkillAssessmentEngine.tsx never used them —
-- it generated a 12-question self-rating survey client-side and scored it with
-- an LLM call that had a hardcoded 78% fallback if the call failed.
--
-- This migration does two things:
--   1. Seeds a real assessment with objective questions that have a single
--      correct answer, so a score means "got N of M questions right," not
--      "described themselves favorably."
--   2. Locks down RLS so the answer key can never reach the client directly.
--      Reads and grading are only possible through the two edge functions in
--      this same change (start-skill-assessment, submit-skill-assessment),
--      which use the service-role key to see full rows and strip/compare
--      correct_answer server-side.
--
-- PRESERVATION: no tables added or dropped, no columns added or dropped.
-- Only RLS policies and row data change.

-- ---------------------------------------------------------------------------
-- 1. Lock down direct client access to the answer key
-- ---------------------------------------------------------------------------

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;

-- Drop any pre-existing permissive policies so we start from a known state.
DROP POLICY IF EXISTS "Public read access" ON public.assessments;
DROP POLICY IF EXISTS "Authenticated read access" ON public.assessments;
DROP POLICY IF EXISTS "assessments_select" ON public.assessments;

-- No direct SELECT policy is created for `assessments` for the `authenticated`
-- or `anon` roles. That is intentional: the `questions` column contains
-- correct_answer/explanation fields, and Postgres RLS is row-level, not
-- column-level, so the only safe way to keep those hidden from the client is
-- to require every read to go through an edge function running as the
-- service role (which bypasses RLS by design). Attempting
-- `supabase.from('assessments').select()` from the client will now return
-- zero rows instead of leaking the answer key.

-- Candidates may see their OWN attempt rows (status, score, timestamps) —
-- but not other users' — so results can render in the UI after grading.
DROP POLICY IF EXISTS "user_assessments_select_own" ON public.user_assessments;
CREATE POLICY "user_assessments_select_own"
  ON public.user_assessments
  FOR SELECT
  USING (auth.uid() = user_id);

-- No client-side INSERT/UPDATE policy on user_assessments: starting an
-- attempt and grading it both happen inside the edge functions via the
-- service-role client, so a candidate cannot write their own score or
-- fabricate a "graded"/"passed" row directly against the table.

-- ---------------------------------------------------------------------------
-- 2. Seed one real, objectively-gradeable assessment
-- ---------------------------------------------------------------------------
-- Each question has: id, category, difficulty (1-3, used as score weight),
-- question, options[4], correct_answer (index into options), explanation
-- (shown after grading, never before). None of this is self-report.

INSERT INTO public.assessments (
  id, title, description, assessment_type, questions,
  passing_score, time_limit_minutes, max_attempts, is_active
) VALUES (
  '11111111-1111-4111-8111-111111111111',
  'Core Technical Skill Assessment',
  'Objectively scored assessment covering programming fundamentals, debugging, data/SQL reasoning, and applied problem solving. Timed, single-attempt-per-cooldown, server-graded.',
  'skill_test',
  '[
    {"id":1,"category":"Programming Fundamentals","difficulty":1,
     "question":"What will `console.log(typeof null)` print in JavaScript?",
     "options":["\"null\"","\"undefined\"","\"object\"","\"boolean\""],
     "correct_answer":2,
     "explanation":"typeof null is a long-standing JS quirk that returns \"object\"."},

    {"id":2,"category":"Programming Fundamentals","difficulty":1,
     "question":"Which data structure uses LIFO (Last In, First Out) ordering?",
     "options":["Queue","Stack","Linked List","Hash Map"],
     "correct_answer":1,
     "explanation":"A stack pops the most recently pushed item first — LIFO."},

    {"id":3,"category":"Programming Fundamentals","difficulty":2,
     "question":"What is the time complexity of binary search on a sorted array of n elements?",
     "options":["O(n)","O(n log n)","O(log n)","O(1)"],
     "correct_answer":2,
     "explanation":"Binary search halves the search space each step: O(log n)."},

    {"id":4,"category":"Debugging","difficulty":2,
     "question":"A function works for most inputs but throws \"Cannot read property of undefined\" only on the very first call after page load. What is the MOST likely cause?",
     "options":[
        "The function has a syntax error",
        "It reads state/data that has not finished loading yet (a race condition)",
        "The variable name is misspelled",
        "The function is not exported correctly"],
     "correct_answer":1,
     "explanation":"Intermittent \"undefined\" errors tied to timing/first-load are the classic signature of a race condition, not a syntax or naming error."},

    {"id":5,"category":"Data & SQL Reasoning","difficulty":2,
     "question":"In SQL, which clause runs BEFORE `GROUP BY` to filter individual rows?",
     "options":["HAVING","WHERE","ORDER BY","LIMIT"],
     "correct_answer":1,
     "explanation":"WHERE filters rows before aggregation; HAVING filters groups after aggregation."},

    {"id":6,"category":"Data & SQL Reasoning","difficulty":3,
     "question":"Given a table `users(id, email)`, what does `SELECT COUNT(email), COUNT(*) FROM users` produce when 2 of 10 rows have a NULL email?",
     "options":["8 and 8","10 and 10","8 and 10","10 and 8"],
     "correct_answer":2,
     "explanation":"COUNT(column_name) ignores NULLs (so 8); COUNT(*) counts total rows regardless of NULLs (so 10)."},

    {"id":7,"category":"Applied Problem Solving","difficulty":2,
     "question":"Which HTTP response status code is defined as \"Permanent Redirect\"?",
     "options":["301","302","307","404"],
     "correct_answer":0,
     "explanation":"301 is Moved Permanently. 302 is Found/Found Elsewhere, 307 is Temporary Redirect."},

    {"id":8,"category":"Applied Problem Solving","difficulty":3,
     "question":"Two threads try to increment a shared integer variable `x = 0` concurrently 1,000 times each without locking. What is the guaranteed final value of `x`?",
     "options":["Exactly 2,000","Always 1,000","Between 1,000 and 2,000, non-deterministic (race condition)","Throws a ThreadException"],
     "correct_answer":2,
     "explanation":"Increment is a read-modify-write operation; without synchronization, lost updates occur, leaving the result non-deterministic and <= 2000."},

    {"id":9,"category":"Programming Fundamentals","difficulty":2,
     "question":"In React, what happens if you mutate state directly instead of calling setState / state setter?",
     "options":[
        "React throws an immediate runtime error",
        "React does not re-render the component, leaving the UI stale",
        "React re-renders automatically after a 100ms delay",
        "The component is unmounted instantly"],
     "correct_answer":1,
     "explanation":"React detects state changes by reference comparison; mutating state in place skips the trigger that schedules a re-render."},

    {"id":10,"category":"Applied Problem Solving","difficulty":2,
     "question":"Which security header prevents a website from being rendered inside an `<iframe>` on an untrusted external domain?",
     "options":["X-Frame-Options","Strict-Transport-Security","Content-Type","Cache-Control"],
     "correct_answer":0,
     "explanation":"X-Frame-Options (DENY / SAMEORIGIN) or frame-ancestors in CSP prevents clickjacking via cross-origin iframe embedding."}
  ]'::jsonb,
  80, 15, 3, true
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  assessment_type = EXCLUDED.assessment_type,
  questions = EXCLUDED.questions,
  passing_score = EXCLUDED.passing_score,
  time_limit_minutes = EXCLUDED.time_limit_minutes,
  max_attempts = EXCLUDED.max_attempts,
  is_active = EXCLUDED.is_active;
