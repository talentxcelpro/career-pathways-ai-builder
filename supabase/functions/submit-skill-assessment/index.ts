import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ASSESSMENT_ID = '11111111-1111-4111-8111-111111111111'

interface SubmitPayload {
  attempt_id: string
  // { [questionId]: selectedOptionIndex }
  answers: Record<number, number>
  // per-question seconds spent, used only as an integrity signal
  time_per_question_seconds?: Record<number, number>
  // count of times the tab lost focus during the attempt (visibilitychange)
  tab_blur_count?: number
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: { persistSession: false, autoRefreshToken: false },
        global: { headers: { Authorization: authHeader } },
      }
    )

    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    let body: SubmitPayload
    try {
      body = await req.json()
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const { attempt_id, answers, time_per_question_seconds = {}, tab_blur_count = 0 } = body
    if (!attempt_id || !answers) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing attempt_id or answers' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Load the attempt and confirm it belongs to this user and is still open.
    const { data: attempt, error: attemptErr } = await adminClient
      .from('user_assessments')
      .select('id, user_id, assessment_id, status, started_at')
      .eq('id', attempt_id)
      .single()

    if (attemptErr || !attempt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Attempt not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }
    if (attempt.user_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }
    if (attempt.status !== 'started') {
      return new Response(
        JSON.stringify({ success: false, error: 'This attempt has already been submitted' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 409 }
      )
    }

    // Load the REAL assessment (with correct answers) — never sent to the client.
    const { data: assessment, error: assessmentErr } = await adminClient
      .from('assessments')
      .select('id, questions, passing_score, time_limit_minutes')
      .eq('id', attempt.assessment_id)
      .single()

    if (assessmentErr || !assessment) {
      return new Response(
        JSON.stringify({ success: false, error: 'Assessment definition missing' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Check time limit server-side (allow 30s grace for network latency).
    const startedAt = new Date(attempt.started_at).getTime()
    const now = Date.now()
    const maxMs = (assessment.time_limit_minutes * 60 + 30) * 1000
    const isOverdue = now - startedAt > maxMs

    // Grade each question server-side.
    const rawQuestions = (assessment.questions ?? []) as Array<{
      id: number
      category: string
      question: string
      options: string[]
      correct_answer: number
      explanation?: string
      difficulty?: number
    }>

    let earnedPoints = 0
    let totalPoints = 0
    const categoryTotals: Record<string, { earned: number; total: number }> = {}
    const review: Array<{
      id: number
      category: string
      question: string
      options: string[]
      submitted_answer: number | null
      correct_answer: number
      is_correct: boolean
      explanation: string
    }> = []

    for (const q of rawQuestions) {
      const weight = q.difficulty ?? 1
      totalPoints += weight
      if (!categoryTotals[q.category]) {
        categoryTotals[q.category] = { earned: 0, total: 0 }
      }
      categoryTotals[q.category].total += weight

      const userChoice = answers[q.id]
      const isCorrect = typeof userChoice === 'number' && userChoice === q.correct_answer

      if (isCorrect) {
        earnedPoints += weight
        categoryTotals[q.category].earned += weight
      }

      review.push({
        id: q.id,
        category: q.category,
        question: q.question,
        options: q.options,
        submitted_answer: typeof userChoice === 'number' ? userChoice : null,
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        explanation: q.explanation ?? '',
      })
    }

    const rawScore = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = !isOverdue && rawScore >= assessment.passing_score

    const categoryScores: Record<string, number> = {}
    for (const [cat, val] of Object.entries(categoryTotals)) {
      categoryScores[cat] = val.total > 0 ? Math.round((val.earned / val.total) * 100) : 0
    }

    // Evaluate integrity signals. These are recorded with the attempt for audit/trust.
    const integrityFlags: string[] = []
    if (isOverdue) integrityFlags.push('OVERDUE_SUBMISSION')
    if (tab_blur_count > 3) integrityFlags.push(`HIGH_TAB_BLURS:${tab_blur_count}`)

    // Flag impossibly fast submissions (e.g. <3 seconds per question average).
    const elapsedSeconds = Math.round((now - startedAt) / 1000)
    if (rawQuestions.length > 0 && elapsedSeconds / rawQuestions.length < 3) {
      integrityFlags.push('SUSPICIOUSLY_FAST_COMPLETION')
    }

    // Write back the final score + status to user_assessments as the service role.
    const completedAt = new Date().toISOString()
    const { error: updateErr } = await adminClient
      .from('user_assessments')
      .update({
        status: 'submitted',
        score: rawScore,
        answers: answers,
        completed_at: completedAt,
        time_spent_seconds: elapsedSeconds,
      })
      .eq('id', attempt_id)

    if (updateErr) {
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to record test submission' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Return the graded result (WITH correct answers + explanations now that it's submitted).
    return new Response(
      JSON.stringify({
        success: true,
        score: rawScore,
        category_scores: categoryScores,
        passed: passed,
        integrity_flags: integrityFlags,
        review: review,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal error'
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
