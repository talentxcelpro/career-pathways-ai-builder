import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ASSESSMENT_ID = '11111111-1111-4111-8111-111111111111'

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

    // User-scoped client: only used to confirm who is asking.
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

    // Service-role client: the ONLY place in this feature that is allowed to
    // see the real assessment row (including correct_answer/explanation).
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Enforce max_attempts server-side (never trust a client-sent attempt count).
    const { data: assessment, error: assessmentErr } = await adminClient
      .from('assessments')
      .select('id, title, description, questions, time_limit_minutes, max_attempts, passing_score')
      .eq('id', ASSESSMENT_ID)
      .eq('is_active', true)
      .single()

    if (assessmentErr || !assessment) {
      return new Response(
        JSON.stringify({ success: false, error: 'Assessment not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    const { count: priorAttempts } = await adminClient
      .from('user_assessments')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('assessment_id', ASSESSMENT_ID)

    if ((priorAttempts ?? 0) >= assessment.max_attempts) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Maximum attempts (${assessment.max_attempts}) reached for this assessment.`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Create the attempt row server-side. started_at is set by the DB, not
    // the client, so elapsed-time checks at grading can't be spoofed.
    const { data: attempt, error: attemptErr } = await adminClient
      .from('user_assessments')
      .insert({
        user_id: user.id,
        assessment_id: ASSESSMENT_ID,
        attempt_number: (priorAttempts ?? 0) + 1,
        status: 'started',
      })
      .select('id, started_at')
      .single()

    if (attemptErr || !attempt) {
      return new Response(
        JSON.stringify({ success: false, error: 'Could not start assessment' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Strip correct_answer + explanation before this ever reaches the browser.
    const sanitizedQuestions = (assessment.questions as Array<Record<string, unknown>>).map((q) => {
      const { correct_answer, explanation, ...clientSafe } = q
      return clientSafe
    })

    return new Response(
      JSON.stringify({
        success: true,
        attempt_id: attempt.id,
        started_at: attempt.started_at,
        title: assessment.title,
        description: assessment.description,
        time_limit_minutes: assessment.time_limit_minutes,
        passing_score: assessment.passing_score,
        questions: sanitizedQuestions,
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
