const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

Deno.serve(async (req) => {
  console.log(`Test function called: ${req.method} from ${req.headers.get('Origin')}`);
  
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Test function is working!',
    timestamp: new Date().toISOString(),
    method: req.method
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});