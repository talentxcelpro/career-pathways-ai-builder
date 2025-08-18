

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Simple test function started - v1.4 redeploy")

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`Simple test function called with method: ${req.method}`);
    console.log('Request URL:', req.url);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    // Handle GET requests for health checks
    if (req.method === 'GET') {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Simple test function is working via GET!",
          timestamp: new Date().toISOString(),
          method: 'GET',
          url: req.url,
          headers: Object.fromEntries(req.headers.entries())
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Handle POST requests
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      console.log('Request body:', body);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Simple test function is working via POST!",
          timestamp: new Date().toISOString(),
          method: 'POST',
          body: body,
          url: req.url,
          headers: Object.fromEntries(req.headers.entries())
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    // Handle other methods
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Method ${req.method} not allowed`,
        allowedMethods: ['GET', 'POST', 'OPTIONS']
      }),
      { 
        status: 405,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
  } catch (error) {
    console.error('Error in simple-test function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});