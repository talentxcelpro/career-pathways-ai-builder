import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('AI Test Health function called successfully');
    
    const response = {
      success: true,
      message: 'AI Test Health function is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      environment: {
        SUPABASE_URL: !!Deno.env.get('SUPABASE_URL'),
        SUPABASE_SERVICE_KEY: !!Deno.env.get('SUPABASE_SERVICE_KEY'),
        OPENAI_API_KEY: !!Deno.env.get('OPENAI_API_KEY'),
        SITE_ORIGIN: Deno.env.get('SITE_ORIGIN') || 'not set'
      }
    };

    return new Response(JSON.stringify(response, null, 2), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-test-health:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});