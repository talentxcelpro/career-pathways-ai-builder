import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

    // Trigger news-feed-automation function
    const response = await fetch('https://dthlgsnakhoftinssokm.supabase.co/functions/v1/news-feed-automation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ trigger: 'manual', timestamp: new Date().toISOString() }),
    });

    const result = await response.json();
    console.log('News automation result:', result);

    if (response.ok) {
      return new Response(JSON.stringify({
        success: true,
        message: 'News automation triggered successfully',
        result: result,
        timestamp: new Date().toISOString()
      }), {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    } else {
      throw new Error(`News automation failed: ${JSON.stringify(result)}`);
    }

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