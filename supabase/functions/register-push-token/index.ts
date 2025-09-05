import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushTokenRequest {
  push_token: string;
  platform: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!;
    supabaseClient.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: ''
    });

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { push_token, platform }: PushTokenRequest = await req.json();

    if (!push_token || !platform) {
      return new Response(
        JSON.stringify({ error: 'Missing push_token or platform' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deactivate old tokens for this user/platform
    const { error: deactivateError } = await supabaseClient
      .from('push_tokens')
      .update({ is_active: false })
      .eq('user_id', user.id)
      .eq('platform', platform);

    if (deactivateError) {
      console.log('Could not deactivate old tokens:', deactivateError);
    }

    // Store new push token
    const { error: insertError } = await supabaseClient
      .from('push_tokens')
      .insert({
        user_id: user.id,
        push_token: push_token,
        platform: platform,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error storing push token:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to store push token' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Registered push token for user ${user.id} on platform ${platform}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Push token registered successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in register-push-token function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});