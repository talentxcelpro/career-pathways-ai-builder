import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Manually triggering news automation...');

    // Trigger news-feed-automation function via Supabase client (avoid direct HTTP)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const sb = createClient(supabaseUrl, supabaseAnonKey);

    const { data: result, error: invokeError } = await sb.functions.invoke('news-feed-automation', {
      body: { trigger: 'manual', timestamp: new Date().toISOString() }
    });
    console.log('News automation result:', result);

    if (invokeError) {
      throw new Error(`News automation failed: ${invokeError.message}`);
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
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);