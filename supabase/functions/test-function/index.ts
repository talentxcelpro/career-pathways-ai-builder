import { corsHeaders } from "../_shared/cors.ts";

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