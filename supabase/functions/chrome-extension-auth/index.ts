import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { action, extensionId, userId, token } = await req.json();

    switch (action) {
      case 'authenticate': {
        // Validate extension token and authenticate user
        const { data: session, error } = await supabase.auth.getUser(token);
        
        if (error || !session?.user) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid authentication token' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create extension session
        const { data: extensionSession, error: sessionError } = await supabase
          .from('chrome_extension_sessions')
          .insert({
            user_id: session.user.id,
            extension_id: extensionId,
            session_token: crypto.randomUUID(),
            expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
            is_active: true,
            last_activity: new Date().toISOString()
          })
          .select()
          .single();

        if (sessionError) {
          console.error('Extension session creation error:', sessionError);
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to create extension session' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            sessionToken: extensionSession.session_token,
            user: {
              id: session.user.id,
              email: session.user.email
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'validate': {
        // Validate extension session token
        const { data: session, error } = await supabase
          .from('chrome_extension_sessions')
          .select('*, profiles(*)')
          .eq('session_token', token)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .single();

        if (error || !session) {
          return new Response(
            JSON.stringify({ success: false, error: 'Invalid or expired session' }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update last activity
        await supabase
          .from('chrome_extension_sessions')
          .update({ last_activity: new Date().toISOString() })
          .eq('session_token', token);

        return new Response(
          JSON.stringify({
            success: true,
            user: session.profiles,
            sessionValid: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'logout': {
        // Invalidate extension session
        await supabase
          .from('chrome_extension_sessions')
          .update({ is_active: false })
          .eq('session_token', token);

        return new Response(
          JSON.stringify({ success: true, message: 'Successfully logged out' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ success: false, error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('Chrome extension auth error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});