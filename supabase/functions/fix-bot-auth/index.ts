import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fixing bot auth schema issues...');
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get all bot profile emails
    const { data: botProfiles, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('is_ai_bot', true);

    if (profileError) {
      throw profileError;
    }

    console.log(`Found ${botProfiles?.length || 0} bot profiles to fix`);

    if (!botProfiles || botProfiles.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No bot profiles found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fix each bot auth user
    let fixedCount = 0;
    for (const profile of botProfiles) {
      try {
        // Try to update the user via admin API to ensure proper auth schema
        const { data: users } = await supabaseAdmin.auth.admin.listUsers();
        const botUser = users?.users?.find(u => u.email === profile.email);
        
        if (botUser) {
          // Update the user to ensure proper metadata
          await supabaseAdmin.auth.admin.updateUserById(botUser.id, {
            email_confirm: true,
            user_metadata: {
              ...botUser.user_metadata,
              is_ai_bot: true
            },
            app_metadata: {
              provider: 'email',
              providers: ['email']
            }
          });
          fixedCount++;
          console.log(`Fixed auth for bot: ${profile.email}`);
        }
      } catch (error) {
        console.error(`Failed to fix bot ${profile.email}:`, error);
        // Continue with other bots
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Fixed ${fixedCount} bot accounts`,
        fixedCount
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error fixing bot auth:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});