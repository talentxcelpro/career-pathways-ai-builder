import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SessionRequest {
  action: 'create' | 'validate' | 'refresh' | 'invalidate' | 'cleanup'
  email?: string
  password?: string
  token?: string
  user_id?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, email, password, token, user_id }: SessionRequest = await req.json()

    switch (action) {
      case 'create':
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: 'Email and password required' }),
            { status: 400, headers: corsHeaders }
          )
        }

        // Authenticate user
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (authError || !authData.user) {
          return new Response(
            JSON.stringify({ error: 'Invalid credentials' }),
            { status: 401, headers: corsHeaders }
          )
        }

        // Generate session token
        const sessionToken = crypto.randomUUID()
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

        // Create session record
        const { error: sessionError } = await supabase
          .from('sessions')
          .insert({
            user_id: authData.user.id,
            token: sessionToken,
            expires_at: expiresAt.toISOString(),
            device_fingerprint: req.headers.get('user-agent')?.substring(0, 255),
            ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')
          })

        if (sessionError) {
          console.error('Session creation error:', sessionError)
          return new Response(
            JSON.stringify({ error: 'Failed to create session' }),
            { status: 500, headers: corsHeaders }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            token: sessionToken, 
            expires_at: expiresAt.toISOString(),
            user: authData.user 
          }),
          { headers: corsHeaders }
        )

      case 'validate':
        if (!token) {
          return new Response(
            JSON.stringify({ error: 'Token required' }),
            { status: 400, headers: corsHeaders }
          )
        }

        const { data: session, error: validateError } = await supabase
          .from('sessions')
          .select('*, profiles(*)')
          .eq('token', token)
          .eq('valid', true)
          .gt('expires_at', new Date().toISOString())
          .single()

        if (validateError || !session) {
          return new Response(
            JSON.stringify({ error: 'Invalid or expired session' }),
            { status: 401, headers: corsHeaders }
          )
        }

        // Update last accessed
        await supabase
          .from('sessions')
          .update({ last_accessed: new Date().toISOString() })
          .eq('token', token)

        return new Response(
          JSON.stringify({ valid: true, session }),
          { headers: corsHeaders }
        )

      case 'refresh':
        if (!token) {
          return new Response(
            JSON.stringify({ error: 'Token required' }),
            { status: 400, headers: corsHeaders }
          )
        }

        // Get current session
        const { data: currentSession, error: refreshError } = await supabase
          .from('sessions')
          .select('user_id')
          .eq('token', token)
          .eq('valid', true)
          .gt('expires_at', new Date().toISOString())
          .single()

        if (refreshError || !currentSession) {
          return new Response(
            JSON.stringify({ error: 'Invalid session for refresh' }),
            { status: 401, headers: corsHeaders }
          )
        }

        // Generate new token
        const newToken = crypto.randomUUID()
        const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000)

        // Invalidate old session and create new one
        await supabase.from('sessions').update({ valid: false }).eq('token', token)
        
        const { error: newSessionError } = await supabase
          .from('sessions')
          .insert({
            user_id: currentSession.user_id,
            token: newToken,
            expires_at: newExpiresAt.toISOString(),
            device_fingerprint: req.headers.get('user-agent')?.substring(0, 255),
            ip_address: req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')
          })

        if (newSessionError) {
          return new Response(
            JSON.stringify({ error: 'Failed to refresh session' }),
            { status: 500, headers: corsHeaders }
          )
        }

        return new Response(
          JSON.stringify({ 
            success: true, 
            token: newToken, 
            expires_at: newExpiresAt.toISOString() 
          }),
          { headers: corsHeaders }
        )

      case 'invalidate':
        if (token) {
          await supabase.from('sessions').update({ valid: false }).eq('token', token)
        }
        if (user_id) {
          await supabase.from('sessions').update({ valid: false }).eq('user_id', user_id)
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: corsHeaders }
        )

      case 'cleanup':
        // Clean expired sessions
        const { error: cleanupError } = await supabase
          .from('sessions')
          .delete()
          .lt('expires_at', new Date().toISOString())

        if (cleanupError) {
          console.error('Cleanup error:', cleanupError)
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: corsHeaders }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: corsHeaders }
        )
    }
  } catch (error) {
    console.error('Session manager error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})