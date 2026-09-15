import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) throw new Error('Unauthorized')

    const body = await req.json()
    const token = body.token ?? body.push_token
    const platform = body.platform
    const deviceInfo = body.deviceInfo ?? body.device_info ?? {}

    if (!token || !platform) {
      throw new Error('Token and platform are required')
    }

    const updatedAt = new Date().toISOString()

    const pushTokenResult = await supabaseClient
      .from('user_push_tokens')
      .upsert({
        user_id: user.id,
        push_token: token,
        platform,
        is_active: true,
        updated_at: updatedAt,
      }, {
        onConflict: 'user_id,platform'
      })

    if (pushTokenResult.error) {
      console.warn('push_token upsert failed, retrying token schema:', pushTokenResult.error.message)
      const { error: tokenSchemaError } = await supabaseClient
        .from('user_push_tokens')
        .upsert({
          user_id: user.id,
          token,
          platform,
          device_info: deviceInfo,
          last_seen_at: updatedAt,
        }, {
          onConflict: 'user_id,token'
        })

      if (tokenSchemaError) throw tokenSchemaError
    }

    await supabaseClient
      .from('push_tokens')
      .upsert({
        user_id: user.id,
        token,
        platform,
        device_info: deviceInfo,
        is_active: true,
        updated_at: updatedAt,
      }, {
        onConflict: 'user_id,token'
      })

    await supabaseClient
      .from('push_notification_tokens')
      .upsert({
        user_id: user.id,
        token,
        platform: platform === 'mobile' ? 'android' : platform,
        device_info: deviceInfo,
        is_active: true,
        updated_at: updatedAt,
      }, {
        onConflict: 'token'
      })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
