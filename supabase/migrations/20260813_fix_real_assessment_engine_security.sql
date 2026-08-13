-- Fix the REAL, live Skill Assessment engine (assessments / assessment_categories /
-- assessment_questions / assessment_attempts / assessment_responses — created in
-- migration 20250724054546). This SUPERSEDES an earlier, mistaken fix that targeted
-- a different `assessments` / `user_assessments` pair from the "Phase 3" migration
-- (20250921185115) — that second schema is dead code; nothing in src/ reads from
-- `user_assessments`. Do not deploy the earlier migration/edge functions.
--
-- THREE issues confirmed in the live schema/code before this migration:
--
-- 1. ANSWER KEY LEAKS TO THE CLIENT.
--    RLS policy "Users can view questions for published assessments" grants
--    unrestricted SELECT on `assessment_questions`, whose `correct_answer` and
--    `explanation` columns sit on the same row as the question text. AND
--    AssessmentTaking.tsx calls `.from('assessment_questions').select('*')` —
--    every candidate's browser receives the answer key in the network response
--    for every question, before they answer.
--
-- 2. CANDIDATES CAN WRITE THEIR OWN SCORE.
--    RLS policy "Users can manage their own assessment attempts" is `FOR ALL
--    USING (auth.uid() = user_id)` with no column restriction, so a candidate's
--    own Supabase client can UPDATE `percentage_score` / `total_score` / `passed`
--    on `assessment_attempts` directly — no need to even answer correctly.
--
-- 3. GRADING NEVER ACTUALLY HAPPENS.
--    `calculate_assessment_score()` sums `assessment_responses.points_earned`,
--    but nothing anywhere sets `points_earned` or `is_correct` — the client's
--    `saveAnswer()` upsert only writes user_answer. So even ignoring #1 and #2,
--    every real attempt scores 0% today. This system has never produced a
--    correct score.
--
-- FIX, in order:
--   A. A secure view exposes only safe question columns to the client;
--      `correct_answer`/`explanation` are removed from the direct-select policy
--      entirely (view + table-select revocation, not a table/column drop —
--      preservation-safe).
--   B. A BEFORE INSERT/UPDATE trigger on assessment_responses computes
--      is_correct/points_earned itself, by reading the real answer key
--      server-side, and overwrites whatever the client sent for those fields.
--   C. A BEFORE UPDATE trigger on assessment_attempts blocks any client write
--      to percentage_score/total_score/passed unless it came from the trusted
--      grading function.
--   D. calculate_assessment_score() becomes SECURITY DEFINER with a locked
--      search_path, and sets the trusted-write flag before updating scores.
--   E. Real seed content: one category, one published, objectively-answerable
--      assessment with 8 questions, so this is actually testable end-to-end,
--      not just theoretically fixed.

-- ---------------------------------------------------------------------------
-- 0. Ensure target tables and columns exist before adding RLS, views & seeding
-- ---------------------------------------------------------------------------

ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS category_id UUID;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 15;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS passing_score INT DEFAULT 80;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS total_questions INT DEFAULT 8;

CREATE TABLE IF NOT EXISTS public.assessment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.assessment_categories(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 15,
  passing_score INT DEFAULT 80,
  total_questions INT DEFAULT 8,
  is_published BOOLEAN DEFAULT true,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessment_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT DEFAULT 'multiple_choice',
  options JSONB NOT NULL DEFAULT '[]'::jsonb,
  correct_answer JSONB,
  explanation TEXT,
  points INT DEFAULT 1,
  difficulty_score INT DEFAULT 1,
  time_limit_seconds INT DEFAULT 45,
  sort_order INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.assessment_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'started',
  total_score INT DEFAULT 0,
  percentage_score NUMERIC DEFAULT 0,
  passed BOOLEAN DEFAULT false,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.assessment_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.assessment_questions(id) ON DELETE CASCADE,
  user_answer JSONB,
  is_correct BOOLEAN DEFAULT false,
  points_earned INT DEFAULT 0,
  time_spent_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT assessment_responses_attempt_question_key UNIQUE (attempt_id, question_id)
);

-- Enable RLS on newly/existing tables
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_responses ENABLE ROW LEVEL SECURITY;

-- Add RLS policy for assessment_attempts if missing
DROP POLICY IF EXISTS "Users can manage their own assessment attempts" ON public.assessment_attempts;
CREATE POLICY "Users can manage their own assessment attempts"
  ON public.assessment_attempts
  FOR ALL
  USING (auth.uid() = user_id);

-- Add RLS policy for assessment_responses if missing
DROP POLICY IF EXISTS "Users can manage their own assessment responses" ON public.assessment_responses;
CREATE POLICY "Users can manage their own assessment responses"
  ON public.assessment_responses
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.assessment_attempts
      WHERE assessment_attempts.id = assessment_responses.attempt_id
        AND assessment_attempts.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- A. Stop leaking correct_answer/explanation to the client
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "Users can view questions for published assessments" ON public.assessment_questions;
-- Only the existing admin-management policy remains on the base table, so
-- direct `supabase.from('assessment_questions').select(...)` now returns
-- nothing for a normal candidate — by design. The frontend must switch to
-- the view below (one-line change, included in this same change set).

CREATE OR REPLACE VIEW public.assessment_questions_public
WITH (security_invoker = false) AS
SELECT
  aq.id,
  aq.assessment_id,
  aq.question_text,
  aq.question_type,
  aq.options,
  aq.points,
  aq.difficulty_score,
  aq.time_limit_seconds,
  aq.sort_order,
  aq.is_active
  -- correct_answer and explanation are deliberately NOT selected here.
FROM public.assessment_questions aq
JOIN public.assessments a ON a.id = aq.assessment_id
WHERE a.is_published = true
  AND aq.is_active = true;

GRANT SELECT ON public.assessment_questions_public TO authenticated;
GRANT SELECT ON public.assessment_questions_public TO anon;

-- ---------------------------------------------------------------------------
-- B. Real server-side grading: compute is_correct/points_earned ourselves,
--    every time, regardless of what the client sent.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.grade_assessment_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  q RECORD;
  correct boolean := false;
BEGIN
  SELECT question_type, correct_answer, points
  INTO q
  FROM public.assessment_questions
  WHERE id = NEW.question_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question % does not exist', NEW.question_id;
  END IF;

  -- Support string equality (MCQ / true_false) + numeric options.
  -- user_answer is jsonb, e.g. '"2"' or '2' or '"Stack"'.
  IF q.correct_answer IS NOT NULL THEN
    correct := (
      NEW.user_answer = q.correct_answer
      OR NEW.user_answer #>> '{}' = q.correct_answer #>> '{}'
    );
  END IF;

  NEW.is_correct := correct;
  IF correct THEN
    NEW.points_earned := COALESCE(q.points, 1);
  ELSE
    NEW.points_earned := 0;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grade_assessment_response ON public.assessment_responses;
CREATE TRIGGER trg_grade_assessment_response
  BEFORE INSERT OR UPDATE ON public.assessment_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.grade_assessment_response();

-- ---------------------------------------------------------------------------
-- C & D. Secure calculate_assessment_score() and block client score tampering
-- ---------------------------------------------------------------------------

-- Transaction-local flag used so ONLY calculate_assessment_score() can write
-- score columns on assessment_attempts. Direct client client.from().update()
-- calls will fail the trigger below.

CREATE OR REPLACE FUNCTION public.block_direct_attempt_score_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- If score columns didn't change, allow (e.g. status='completed' without score).
  IF OLD.percentage_score IS NOT DISTINCT FROM NEW.percentage_score
     AND OLD.total_score IS NOT DISTINCT FROM NEW.total_score
     AND OLD.passed IS NOT DISTINCT FROM NEW.passed THEN
    RETURN NEW;
  END IF;

  -- If called inside calculate_assessment_score(), current_setting will be 'on'.
  IF current_setting('talentxcel.in_trusted_grading', true) = 'on' THEN
    RETURN NEW;
  END IF;

  RAISE EXCEPTION 'Direct update of assessment scores is not permitted. Scores must be calculated by the server grading engine.';
END;
$$;

DROP TRIGGER IF EXISTS trg_block_direct_attempt_score_update ON public.assessment_attempts;
CREATE TRIGGER trg_block_direct_attempt_score_update
  BEFORE UPDATE ON public.assessment_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.block_direct_attempt_score_update();

-- Rewrite calculate_assessment_score() to set the trusted-write flag, sum
-- points, compute percentage_score against maximum possible points for that
-- assessment (not just max of answered questions), and record passing status.

DROP FUNCTION IF EXISTS public.calculate_assessment_score(uuid);

CREATE OR REPLACE FUNCTION public.calculate_assessment_score(attempt_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_attempt RECORD;
  v_assessment RECORD;
  v_earned int := 0;
  v_max int := 0;
  v_pct numeric := 0;
  v_passed boolean := false;
BEGIN
  SELECT * INTO v_attempt
  FROM public.assessment_attempts
  WHERE id = attempt_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Attempt % not found', attempt_id_param;
  END IF;

  SELECT * INTO v_assessment
  FROM public.assessments
  WHERE id = v_attempt.assessment_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Assessment % not found', v_attempt.assessment_id;
  END IF;

  -- Sum points earned across all responses for this attempt.
  SELECT COALESCE(SUM(points_earned), 0)
  INTO v_earned
  FROM public.assessment_responses
  WHERE attempt_id = attempt_id_param;

  -- Max possible score is the sum of points for ALL active questions on the assessment.
  SELECT COALESCE(SUM(COALESCE(points, 1)), 0)
  INTO v_max
  FROM public.assessment_questions
  WHERE assessment_id = v_attempt.assessment_id
    AND is_active = true;

  IF v_max > 0 THEN
    v_pct := ROUND((v_earned::numeric / v_max::numeric) * 100, 2);
  ELSE
    v_pct := 0;
  END IF;

  v_passed := (v_pct >= COALESCE(v_assessment.passing_score, 80));

  -- Set session flag so trigger permits the update.
  PERFORM set_config('talentxcel.in_trusted_grading', 'on', true);

  UPDATE public.assessment_attempts
  SET total_score = v_earned,
      percentage_score = v_pct,
      passed = v_passed,
      status = 'completed',
      completed_at = COALESCE(completed_at, now())
  WHERE id = attempt_id_param;

  PERFORM set_config('talentxcel.in_trusted_grading', 'off', true);

  RETURN jsonb_build_object(
    'attempt_id', attempt_id_param,
    'total_score', v_earned,
    'max_score', v_max,
    'percentage_score', v_pct,
    'passed', v_passed
  );
END;
$$;

-- ---------------------------------------------------------------------------
-- E. Seed one real, published, objectively-answerable assessment so this is
--    immediately testable end-to-end.
-- ---------------------------------------------------------------------------

INSERT INTO public.assessment_categories (id, name, description, slug)
VALUES (
  '66666666-6666-4666-8666-666666666666',
  'Software Engineering',
  'Core computer science, system design, and software development practices.',
  'software-engineering'
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

INSERT INTO public.assessments (
  id, category_id, title, description, duration_minutes, passing_score,
  total_questions, is_published, created_at, updated_at
) VALUES (
  '77777777-7777-4777-8777-777777777777',
  '66666666-6666-4666-8666-666666666666',
  'Core Software Engineering & System Fundamentals',
  'Real, objectively scored skill assessment covering programming fundamentals, SQL/data reasoning, system architecture, and concurrency.',
  15, 80, 8, true, now(), now()
) ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  duration_minutes = EXCLUDED.duration_minutes,
  passing_score = EXCLUDED.passing_score,
  total_questions = EXCLUDED.total_questions,
  is_published = EXCLUDED.is_published;

-- 8 objective questions with explicit correct_answer values.
INSERT INTO public.assessment_questions (
  id, assessment_id, question_text, question_type, options, correct_answer, explanation, points, sort_order, is_active
) VALUES
(
  '88888888-8888-4888-8888-888888888801',
  '77777777-7777-4777-8777-777777777777',
  'What will `console.log(typeof null)` evaluate to in JavaScript?',
  'multiple_choice',
  '["\"null\"", "\"undefined\"", "\"object\"", "\"boolean\""]'::jsonb,
  '"\"object\""'::jsonb,
  'typeof null returns "object" due to an early JavaScript implementation detail that was preserved for backward compatibility.',
  1, 1, true
),
(
  '88888888-8888-4888-8888-888888888802',
  '77777777-7777-4777-8777-777777777777',
  'Which data structure operates on a Last In, First Out (LIFO) principle?',
  'multiple_choice',
  '["Queue", "Stack", "Linked List", "Binary Search Tree"]'::jsonb,
  '"Stack"'::jsonb,
  'A Stack pushes items onto the top and pops from the top (LIFO). A Queue operates on FIFO (First In, First Out).',
  1, 2, true
),
(
  '88888888-8888-4888-8888-888888888803',
  '77777777-7777-4777-8777-777777777777',
  'What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (BST)?',
  'multiple_choice',
  '["O(1)", "O(log n)", "O(n)", "O(n log n)"]'::jsonb,
  '"O(log n)"'::jsonb,
  'A balanced BST maintains height log(n), making lookup O(log n) worst-case.',
  1, 3, true
),
(
  '88888888-8888-4888-8888-888888888804',
  '77777777-7777-4777-8777-777777777777',
  'In SQL, which clause is evaluated BEFORE the `GROUP BY` clause to filter individual rows?',
  'multiple_choice',
  '["HAVING", "WHERE", "ORDER BY", "LIMIT"]'::jsonb,
  '"WHERE"'::jsonb,
  'WHERE filters rows before aggregation occurs; HAVING filters aggregated groups after GROUP BY.',
  1, 4, true
),
(
  '88888888-8888-4888-8888-888888888805',
  '77777777-7777-4777-8777-777777777777',
  'Which HTTP response status code indicates a resource was permanently moved to a new URI?',
  'multiple_choice',
  '["301 Moved Permanently", "302 Found", "307 Temporary Redirect", "404 Not Found"]'::jsonb,
  '"301 Moved Permanently"'::jsonb,
  '301 signals permanent relocation. 302/307 indicate temporary redirection.',
  1, 5, true
),
(
  '88888888-8888-4888-8888-888888888806',
  '77777777-7777-4777-8777-777777777777',
  'What occurs when two concurrent threads access a shared mutable variable without synchronization?',
  'multiple_choice',
  '["Deadlock", "Race Condition", "Memory Leak", "Stack Overflow"]'::jsonb,
  '"Race Condition"'::jsonb,
  'Concurrent unsynchronized read-modify-write operations cause lost updates and non-deterministic results — a race condition.',
  1, 6, true
),
(
  '88888888-8888-4888-8888-888888888807',
  '77777777-7777-4777-8777-777777777777',
  'In React, what happens if state is mutated directly without using the state setter function?',
  'multiple_choice',
  '["React throws a syntax error", "React skips re-rendering, leaving UI stale", "React auto-updates state after 100ms", "Component unmounts"]'::jsonb,
  '"React skips re-rendering, leaving UI stale"'::jsonb,
  'React relies on shallow reference equality checks. Mutating state in place keeps the reference unchanged, skipping the render cycle.',
  1, 7, true
),
(
  '88888888-8888-4888-8888-888888888808',
  '77777777-7777-4777-8777-777777777777',
  'Which HTTP security header prevents cross-origin embedding of a website inside an iframe?',
  'multiple_choice',
  '["X-Frame-Options", "Strict-Transport-Security", "Access-Control-Allow-Origin", "Cache-Control"]'::jsonb,
  '"X-Frame-Options"'::jsonb,
  'X-Frame-Options: DENY / SAMEORIGIN prevents clickjacking attacks via iframe embedding.',
  1, 8, true
)
ON CONFLICT (id) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  options = EXCLUDED.options,
  correct_answer = EXCLUDED.correct_answer,
  explanation = EXCLUDED.explanation;
