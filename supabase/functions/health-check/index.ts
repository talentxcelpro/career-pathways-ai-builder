import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

Deno.serve(async (req) => {
  console.log('=== Health Check Request ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Timestamp:', new Date().toISOString());

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { 
      headers: corsHeaders,
      status: 200
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const sendGridApiKey = Deno.env.get('SENDGRID_API_KEY');

    // Test Supabase connection
    let supabaseStatus = 'disconnected';
    if (supabaseUrl && supabaseServiceKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const { data, error } = await supabase.from('email_queue_simple').select('count').limit(1);
        supabaseStatus = error ? 'error' : 'connected';
      } catch (err) {
        supabaseStatus = 'error';
      }
    }

    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      function: 'health-check',
      environment: {
        supabase_url: !!supabaseUrl,
        supabase_service_key: !!supabaseServiceKey,
        sendgrid_api_key: !!sendGridApiKey,
      },
      connectivity: {
        supabase: supabaseStatus,
      },
      server_info: {
        deno_version: Deno.version.deno,
        v8_version: Deno.version.v8,
      }
    };

    console.log('Health check completed:', healthData);

    return new Response(JSON.stringify(healthData), {
      status: 200,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    const errorResponse = {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
  }
});