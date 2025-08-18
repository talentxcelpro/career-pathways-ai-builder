// arsh edge function - public with CORS and simple echo
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('arsh function: booting');

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: unknown = null;
    if (req.method !== 'GET' && req.body) {
      try {
        body = await req.json();
      } catch (_) {
        body = null; // ignore parse errors
      }
    }

    const response = {
      success: true,
      name: 'arsh',
      message: `Hello${body && (body as any).name ? `, ${(body as any).name}` : ''}! Functions are running.`,
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
      body,
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (e) {
    console.error('arsh function error:', e);
    return new Response(
      JSON.stringify({ success: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
