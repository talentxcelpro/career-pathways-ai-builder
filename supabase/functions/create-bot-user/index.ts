import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  console.log('🤖 Create Bot User function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { full_name, email, departments, content_domains, bot_tone, content_frequency, profile_picture_url } = await req.json();

    console.log('Creating bot user:', { full_name, email });

    // Initialize Supabase Admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Generate a secure password for the bot
    const botPassword = `Bot${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}!`;

    // Create the bot user in auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: botPassword,
      user_metadata: {
        full_name,
        is_ai_bot: true,
        bot_tone,
        content_frequency,
        departments,
        content_domains,
        avatar_url: profile_picture_url
      }
    });

    if (authError) {
      console.error('Auth user creation error:', authError);
      throw authError;
    }

    console.log('Auth user created:', authUser.user?.id);

    // Update the profile with bot-specific data
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        is_ai_bot: true,
        bot_tone,
        content_frequency,
        departments,
        content_domains,
        profile_picture_url
      })
      .eq('id', authUser.user!.id)
      .select()
      .single();

    if (profileError) {
      console.error('Profile update error:', profileError);
      throw profileError;
    }

    console.log('Bot user created successfully:', profile);

    return new Response(JSON.stringify({
      success: true,
      user: profile
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error creating bot user:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});