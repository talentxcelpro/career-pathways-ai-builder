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

    // Authenticate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) throw new Error('Unauthorized')

    const body = await req.json()
    const action = body.action || 'register'
    const rawToken = body.token ?? body.push_token
    const platform = body.platform || 'web'
    const provider = body.provider || (platform === 'web' ? 'web_push' : 'fcm')
    const endpoint = body.endpoint ?? null
    const p256dh = body.p256dh ?? null
    const authSecret = body.auth_secret ?? body.auth ?? null
    const deviceInfo = body.deviceInfo ?? body.device_info ?? {}
    const token = rawToken || endpoint
    const updatedAt = new Date().toISOString()

    // 1. Handle Logout / Token Unregistration
    if (action === 'unregister') {
      if (token) {
        await supabaseClient
          .from('notification_devices')
          .update({ is_active: false, updated_at: updatedAt })
          .eq('user_id', user.id)
          .eq('token', token)
      } else {
        await supabaseClient
          .from('notification_devices')
          .update({ is_active: false, updated_at: updatedAt })
          .eq('user_id', user.id)
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Device push token unregistered successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!token) {
      throw new Error('Token or Web Push endpoint is required for registration')
    }

    // 2. Primary Unified Schema: public.notification_devices
    // If this token was previously attached to a different user on the same physical device, deactivate it for that user
    await supabaseClient
      .from('notification_devices')
      .update({ is_active: false, updated_at: updatedAt })
      .eq('token', token)
      .neq('user_id', user.id)

    const { data: device, error: deviceError } = await supabaseClient
      .from('notification_devices')
      .upsert({
        user_id: user.id,
        token: token,
        platform: platform === 'mobile' ? 'android' : platform,
        provider: provider,
        endpoint: endpoint,
        p256dh: p256dh,
        auth_secret: authSecret,
        device_info: deviceInfo,
        is_active: true,
        last_used_at: updatedAt,
        updated_at: updatedAt
      }, {
        onConflict: 'user_id,token'
      })
      .select()
      .maybeSingle()

    if (deviceError) {
      console.warn('notification_devices upsert notice:', deviceError.message)
    }

    // 3. Legacy fallback: user_push_tokens
    try {
      await supabaseClient
        .from('user_push_tokens')
        .upsert({
          user_id: user.id,
          push_token: token,
          platform: platform,
          is_active: true,
          updated_at: updatedAt
        }, {
          onConflict: 'user_id,platform'
        })
    } catch (_) {
      // Ignore legacy schema mismatches
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Device push token registered successfully',
        device_id: device?.id || null 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
