import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Manually triggering news automation...');

    // Create Supabase client with service role key for proper permissions
    const sb = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Invoking news-feed-automation function...');
    const { data: result, error: invokeError } = await sb.functions.invoke('news-feed-automation', {
      body: { trigger: 'manual', timestamp: new Date().toISOString() }
    });
    
    console.log('News automation invoke result:', { result, error: invokeError });

    if (invokeError) {
      console.error('Function invocation error:', invokeError);
      return new Response(JSON.stringify({
        success: false,
        error: `Function invocation failed: ${invokeError.message}`,
        timestamp: new Date().toISOString()
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'News automation triggered successfully',
      result,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("❌ Manual news trigger failed:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Unknown error occurred',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);