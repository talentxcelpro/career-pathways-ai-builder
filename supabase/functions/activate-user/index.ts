import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Activation token is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🔐 Processing user activation for token:', token.substring(0, 8) + '...');

    // Use the database function to activate user
    const { data: result, error } = await supabase.rpc('activate_cv_user', {
      p_token: token
    });

    if (error) {
      console.error('❌ Activation error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to activate account'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!result.success) {
      console.log('⚠️ Activation failed:', result.error);
      return new Response(JSON.stringify(result), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('✅ User activated successfully:', result.profile_id);

    // For browser requests, redirect to success page
    if (req.headers.get('accept')?.includes('text/html')) {
      const redirectUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/auth/v1', '')}/activation-success?profile_id=${result.profile_id}`;
      
      return new Response(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Account Activated - TalentXcel</title>
            <meta http-equiv="refresh" content="3;url=${redirectUrl}">
            <style>
                body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px; 
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    margin: 0;
                }
                .container {
                    background: white;
                    color: #333;
                    padding: 40px;
                    border-radius: 10px;
                    max-width: 500px;
                    margin: 0 auto;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                }
                .success-icon { font-size: 60px; margin-bottom: 20px; }
                .btn {
                    background: #2563eb;
                    color: white;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="success-icon">🎉</div>
                <h1>Account Activated!</h1>
                <p>Welcome to TalentXcel! Your profile has been successfully activated.</p>
                <p>You'll be redirected to complete your registration in a few seconds...</p>
                <a href="${redirectUrl}" class="btn">Continue to TalentXcel →</a>
            </div>
        </body>
        </html>
      `, {
        headers: { ...corsHeaders, 'Content-Type': 'text/html' }
      });
    }

    // For API requests, return JSON
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ User activation error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});